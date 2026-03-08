import asyncio
import json
import logging
import os
import re
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from config import ALLOWED_ORIGINS
from constants import HEROES_LIST, ROLE_LABEL_MAP
from decorator import timer
from llm import LLMQuotaExceeded, call_llm
from opendota import (
    background_refresh_loop,
    get_hero,
    get_hero_meta_summary,
    get_my_stats_summary,
    get_top_counters,
    load_cache,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await load_cache()
    task = asyncio.create_task(background_refresh_loop())

    yield  # app is running

    # Shutdown
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("🛑 Cache refresh loop stopped")

def _get_real_ip(request: Request) -> str:
    return request.headers.get("X-Real-IP") or get_remote_address(request)

limiter = Limiter(
    key_func=_get_real_ip,
    default_limits=["50/day", "5/minute"],
)

app = FastAPI(lifespan=lifespan)
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "error": "rate_limit",
            "message": "Too many requests. Please wait a moment before trying again.",
        },
    )


app.add_exception_handler(RateLimitExceeded, rate_limit_handler)


@app.exception_handler(LLMQuotaExceeded)
async def llm_quota_handler(request: Request, exc: LLMQuotaExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "error": "rate_limit",
            "message": "LLM quota exceeded. Please try again later.",
        },
    )


app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HERO_NAME_TO_ID = {hero["localized_name"]: hero["id"] for hero in HEROES_LIST}


def parse_llm_response(llm_text: str) -> list[dict]:
    blocks = [b.strip() for b in llm_text.strip().split("\n\n") if b.strip()]
    results = []
    results = []
    for block in blocks:
        if not block.strip():
            continue

        # Hero name
        name_match = re.search(r"PICK #\d+:\s*(.+)", block)
        hero_name = name_match.group(1).strip() if name_match else None

        # Reason
        reason_match = re.search(r"Reason:\s*(.+)", block)
        reason = reason_match.group(1).strip() if reason_match else None

        # Role
        role_match = re.search(r"ROLE:\s*(.+)$", block, re.MULTILINE)
        role = role_match.group(1).split("—")[0].strip() if role_match else None

        # Items
        items_match = re.search(r"ITEMS:\s*(.+)", block)
        items = (
            [i.strip() for i in items_match.group(1).split(",")] if items_match else []
        )

        hero_id = HERO_NAME_TO_ID.get(hero_name)

        results.append(
            {
                "hero_id": hero_id,
                "hero_name": hero_name,
                "rank": len(results) + 1,
                "reason": reason,
                "role": role.strip() if role else None,
                "items": items,
            }
        )
    return results


class DraftInfo(BaseModel):
    radiant_picks: list[int]
    dire_picks: list[int]
    bans: list[int]
    my_team: Literal["radiant", "dire"]
    role: str
    account_id: str | int | None = (
        None  # str first — prevents Pydantic coercing "785192596" to int
    )


@app.post("/")
@limiter.limit("5/minute;50/day")
@timer("total request")
async def advise_drafts(request: Request, draftInfo: DraftInfo):
    # Refresh if cache is older than 24hrs

    role_value = (draftInfo.role or "any").strip().lower()
    is_any_role = role_value == "any"
    role_label = ROLE_LABEL_MAP.get(role_value)

    if is_any_role:
        role_constraint = """
    1. **DISTINCT ROLES**: Each hero must fill a different primary role.
       - Allowed roles: carry, mid, offlane, soft support (4), hard support (5)
       - Example valid set: [carry, mid, hard support] ✓
       - Example invalid set: [carry, carry, support] ✗

    2. **NO LANE OR ROLE OVERLAP**: No two heroes should share the same lane assignment or role.
"""
    else:
        role_constraint = f"""
    1. **FIXED ROLE — STRICT**: The player has requested heroes for the **{role_label}** role only.
       - ALL 3 recommended heroes MUST be viable for {role_label}.
       - Do NOT recommend heroes from any other role or lane, regardless of meta strength.
       - If fewer than 3 strong options exist for this role in the current draft context, pick the best available ones for that role anyway.

    2. **NO ROLE DEVIATION**: Ignore the "distinct roles" rule. All 3 picks may share the same role because the player specifically asked for {role_label} options to choose from.
"""

    instructions = f"""
    Use the format below exactly for each hero:

    PICK #1: [Hero Name]
       Reason: [1 sentence, max 10 words]
    ROLE: [Role] — [Lane]
    ITEMS: [Item 1, Item 2, Item 3, Item 4]

    PICK #2: [Hero Name]
       Reason: [1 sentence, max 10 words]
    ROLE: [Role] — [Lane]
    ITEMS: [Item 1, Item 2, Item 3, Item 4]

    PICK #3: [Hero Name]
       Reason: [1 sentence, max 10 words]
    ROLE: [Role] — [Lane]
    ITEMS: [Item 1, Item 2, Item 3, Item 4]

    === OUTPUT FILTERING & ENHANCEMENT RULES ===

    You are a Dota 2 draft assistant. Before generating hero recommendations, you MUST apply the following rules strictly and in order.

    ---

    ## STEP 1: HARD FILTERS — ELIMINATE THESE HEROES FIRST

    Before recommending ANY hero, check it against this blocklist. If ANY condition is true, the hero is FORBIDDEN and must NOT appear in your output under any circumstances:

    - The hero is already picked by allied team
    - The hero is already picked by enemy team
    - The hero is currently banned in the draft

    Do NOT recommend forbidden heroes even if they seem like perfect counters. Pretend they do not exist.

    ---

    ## STEP 2: QUALITY RULES — APPLY TO ALL REMAINING HEROES

    After filtering, your 3 recommended heroes MUST satisfy ALL of the following:
{role_constraint}
    3. **COUNTER + SYNERGY BALANCE**: Each hero must either:
       - Counter at least one enemy hero, OR
       - Synergize with at least one allied hero
       - Ideally both.

    4. **NO LOW WIN RATE PICKS**: Do not recommend heroes that statistically perform poorly against the current enemy lineup. If a hero loses frequently to 2+ enemy heroes, skip it.

    5. **NO DUPLICATE HEROES**: Each of the 3 recommended heroes must be unique. Never repeat a hero.

    6. **RELEVANT ITEM BUILDS**: For each recommended hero, suggest 3-4 core items relevant to the current draft context (enemy picks and bans). Avoid generic builds; tailor item choices to counter enemies or enhance synergies.

    ## STRICT ENFORCEMENT

    If you are about to recommend a hero and realize it violates ANY rule above, STOP and choose a different hero. Never bend these rules for "flavor" or "variety." Rule compliance is mandatory.
    """
    all_ids = draftInfo.radiant_picks + draftInfo.dire_picks + draftInfo.bans
    if draftInfo.my_team == "radiant":
        allied_ids = draftInfo.radiant_picks
        enemy_ids = draftInfo.dire_picks
    else:
        allied_ids = draftInfo.dire_picks
        enemy_ids = draftInfo.radiant_picks
    # Resolve all hero lookups first
    hero_names = {id: (await get_hero(id))["localized_name"] for id in set(all_ids)}
    enemy_summary = {hero_names[id]: await get_top_counters(id) for id in enemy_ids}
    meta_summary = {
        hero_names[id]: await get_hero_meta_summary(id) for id in allied_ids + enemy_ids
    }
    my_stats_summary = await get_my_stats_summary(draftInfo.account_id)
    print(my_stats_summary)
    my_stats_summary_prompt = ""
    if my_stats_summary:
        my_stats_summary_prompt = f"""
        My stats summary:
        {my_stats_summary}

        """

    prompt = f"""You are a Dota 2 draft advisor.

    Allied: {[hero_names[id] for id in allied_ids]}
    Enemy: {[hero_names[id] for id in enemy_ids]}
    Banned: {[hero_names[id] for id in draftInfo.bans]}

    Top counters vs enemy heroes:
    {enemy_summary}

    Meta win rates:
    {meta_summary}
    {my_stats_summary_prompt}
    {instructions}
    """
    os.makedirs("logs", exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    with open(f"logs/prompt_{timestamp}.txt", "w") as f:
        f.write(prompt)

    try:
        response = await call_llm(prompt=prompt)
    except LLMQuotaExceeded:
        raise
    except Exception as e:
        if (
            "quota" in str(e).lower()
            or "429" in str(e)
            or "resource_exhausted" in str(e).lower()
        ):
            raise LLMQuotaExceeded() from e
        raise
    return parse_llm_response(response)


game_state = {"is_drafting": False}


@app.post("/gsi")
async def gsi_webhook(request: Request):
    try:
        payload = await request.json()
    except Exception:
        return {"ok": False, "error": "invalid json"}

    # Optional: validate auth token
    token = payload.get("auth", {}).get("token", "")
    if token != "super_secret":
        return {"ok": False, "error": "unauthorized"}
    map_data = payload.get("map", {})
    game_phase = map_data.get("game_state", "")
    LOGS = Path("logs")
    LOGS.mkdir(exist_ok=True)
    with open(
        LOGS / f"{game_phase}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
        "w",
    ) as f:
        json.dump(payload, f, indent=2)

    # Dota 2 draft phase game states
    DRAFT_PHASES = {
        "DOTA_GAMERULES_STATE_HERO_SELECTION",
        "DOTA_GAMERULES_STATE_STRATEGY_TIME",
    }
    if game_phase in DRAFT_PHASES:
        game_state["is_drafting"] = True
    return {"ok": True}


@app.get("/gsi/status")
async def gsi_status():
    return {"is_drafting": game_state["is_drafting"]}

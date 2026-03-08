import asyncio
import json

import httpx
import redis

from config import REDIS_DB, REDIS_HOST, REDIS_PORT
from decorator import timer

TIMEOUT = httpx.Timeout(30.0, connect=10.0)
BASE_URL = "https://api.opendota.com/api"

# Redis client setup
REDIS_CLIENT = redis.Redis(
    host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True
)
REDIS_TTL = 86400  # 24 hours in seconds
REDIS_TTL_PLAYER = 3600  # 1 hour in seconds


# ─── Loaders (raw API calls) ───────────────────────────────────


async def _load_heroes() -> dict:
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        res = await client.get(f"{BASE_URL}/heroes")
        data = res.json()
        result = (
            {str(hero["id"]): hero for hero in data} if isinstance(data, list) else {}
        )
        print(f"✅ Loaded {len(result)} heroes")
        return result


async def _load_hero_stats() -> dict:
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        res = await client.get(f"{BASE_URL}/heroStats")
        data = res.json()
        result = (
            {str(hero["id"]): hero for hero in data} if isinstance(data, list) else {}
        )
        print(f"✅ Loaded hero stats for {len(result)} heroes")
        return result


async def _load_hero_matchups() -> dict:
    heroes = await get_heroes_cached()
    matchups = {}
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        for hero_id in heroes:
            res = await client.get(f"{BASE_URL}/heroes/{hero_id}/matchups")
            data = res.json()
            matchups[str(hero_id)] = data if isinstance(data, list) else []
            await asyncio.sleep(0.2)  # avoid rate limiting
    print(f"✅ Loaded matchups for {len(matchups)} heroes")
    return matchups


async def _load_my_hero_stats(account_id: str | int | None) -> dict:
    if account_id is None:
        return {}
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        res = await client.get(f"{BASE_URL}/players/{account_id}/heroes")
        if res.status_code != 200:
            print(
                f"⚠️  OpenDota /players/{account_id}/heroes returned {res.status_code}: {res.text}"
            )
            return {}
        data = res.json()
        if isinstance(data, dict) and data.get("error"):
            print(f"⚠️  OpenDota error for account {account_id}: {data}")
            return {}
        result = (
            {str(entry["hero_id"]): entry for entry in data}
            if isinstance(data, list)
            else {}
        )
        print(f"✅ Loaded your stats for {len(result)} heroes (account: {account_id})")
        return result


# ─── Redis cache manager ────────────────────────────────────────


async def _get_or_fetch_from_redis(key: str, fetch_func, ttl: int):
    """
    Returns data from Redis if present and not expired.
    On a cache miss (first run or TTL expired), fetches fresh data,
    stores it in Redis with the given TTL, and returns it.
    """
    cached = REDIS_CLIENT.get(key)
    if cached:
        return json.loads(cached)

    print(f"🔄 Redis cache miss for '{key}', fetching from OpenDota...")
    data = await fetch_func()
    REDIS_CLIENT.setex(key, ttl, json.dumps(data))
    return data


async def get_heroes_cached() -> dict:
    return await _get_or_fetch_from_redis("heroes", _load_heroes, REDIS_TTL)


async def get_hero_stats_cached() -> dict:
    return await _get_or_fetch_from_redis("hero_stats", _load_hero_stats, REDIS_TTL)


async def get_hero_matchups_cached() -> dict:
    return await _get_or_fetch_from_redis(
        "hero_matchups", _load_hero_matchups, REDIS_TTL
    )


# ─── Startup warm-up (optional) ────────────────────────────────


@timer("load_cache")
async def load_cache(account_id: str | None = None):
    """
    Pre-warms Redis on startup. Safe to skip — getters will lazily
    fetch and cache on first use if Redis is empty or keys have expired.
    """
    print("🔄 Pre-warming Redis cache...")
    await get_heroes_cached()
    await get_hero_stats_cached()
    await get_hero_matchups_cached()
    print("✅ Redis cache ready")


# ─── Getters (all read directly from Redis) ────────────────────


async def get_hero(hero_id: int) -> dict:
    heroes = await get_heroes_cached()
    return heroes.get(str(hero_id), {})


async def get_hero_stats(hero_id: int) -> dict:
    stats = await get_hero_stats_cached()
    return stats.get(str(hero_id), {})


async def get_hero_matchups(hero_id: int) -> list:
    matchups = await get_hero_matchups_cached()
    return matchups.get(str(hero_id), [])


async def get_my_hero_stats(hero_id: int, account_id: str | int | None) -> dict:
    if account_id is None:
        return {}
    account_id = str(account_id)  # normalize to str to avoid int/str Redis key mismatch
    key = f"my_hero_stats:{account_id}"
    my_stats = await _get_or_fetch_from_redis(
        key, lambda: _load_my_hero_stats(account_id), REDIS_TTL_PLAYER
    )
    return my_stats.get(str(hero_id), {})


async def get_all_heroes() -> dict:
    return await get_heroes_cached()


async def get_top_counters(hero_id: int, top_n: int = 10) -> list:
    matchups = await get_hero_matchups(hero_id)
    if not isinstance(matchups, list):
        return []
    sorted_matchups = sorted(
        [m for m in matchups if m["games_played"] >= 50],
        key=lambda x: x["wins"] / x["games_played"],
        reverse=True,
    )
    return [
        {
            "hero": (await get_hero(m["hero_id"])).get("localized_name", m["hero_id"]),
            "winrate": round(m["wins"] / m["games_played"], 2),
        }
        for m in sorted_matchups[:top_n]
    ]


async def get_hero_meta_summary(hero_id: int) -> dict:
    stats = await get_hero_stats(hero_id)
    pick = stats.get("7_pick", 1)
    win = stats.get("7_win", 0)
    return {
        "win_rate": f"{round(win / pick * 100, 1)}%",
        "roles": stats.get("roles", []),
    }


async def get_my_stats_summary(account_id: str | int | None, top_n: int = 10) -> dict:
    """
    Returns the player's top_n most-played heroes with win rates.
    Used to inform the LLM about the player's hero pool so it can
    recommend heroes the player is comfortable on.
    Only heroes with at least 10 games are included.
    """
    if account_id is None:
        return {}
    account_id = str(account_id)  # normalize to str to avoid int/str Redis key mismatch
    key = f"my_hero_stats:{account_id}"
    all_stats = await _get_or_fetch_from_redis(
        key, lambda: _load_my_hero_stats(account_id), REDIS_TTL_PLAYER
    )
    top_heroes = sorted(
        [s for s in all_stats.values() if s.get("games", 0) >= 1],
        key=lambda x: x["games"],
        reverse=True,
    )[:top_n]
    if len(top_heroes) < top_n:
        return {}
    summary = {}
    for entry in top_heroes:
        hero = await get_hero(entry["hero_id"])
        name = hero.get("localized_name", entry["hero_id"])
        summary[name] = {
            "games": entry["games"],
            "win_rate": f"{round(entry['win'] / entry['games'] * 100, 1)}%",
        }
    return summary


# ─── Background refresh task ───────────────────────────────────

# How many seconds before TTL expiry to trigger a refresh
REFRESH_BEFORE_EXPIRY = 300  # 5 minutes

# Raw loaders used by the background refresh loop.
# Always point to _load_* functions, never the cached getters,
# so a refresh actually reaches the API instead of returning the still-live cached value.
WATCHED_KEYS = [
    ("heroes", _load_heroes, REDIS_TTL),
    ("hero_stats", _load_hero_stats, REDIS_TTL),
    ("hero_matchups", _load_hero_matchups, REDIS_TTL),
]


async def _refresh_key(key: str, loader_func, ttl: int):
    """Force-fetch from API and overwrite the Redis key with a fresh TTL.
    Must receive the raw _load_* function, NOT the cached getter,
    otherwise Redis will return the still-live cached value instead of
    hitting the API.
    """
    print(f"🔁 Refreshing Redis key '{key}'...")
    data = await loader_func()
    REDIS_CLIENT.setex(key, ttl, json.dumps(data))
    print(f"✅ Refreshed '{key}'")


async def background_refresh_loop(account_id: str | None = None, interval: int = 60):
    """
    Runs forever, waking up every `interval` seconds.
    If a watched key's remaining TTL drops below REFRESH_BEFORE_EXPIRY,
    it proactively re-fetches and resets the TTL before the key ever expires.
    """
    watched = list(WATCHED_KEYS)

    while True:
        await asyncio.sleep(interval)
        for key, loader_func, ttl in watched:
            remaining = await asyncio.to_thread(REDIS_CLIENT.ttl, key)
            # ttl() returns -2 if key doesn't exist, -1 if no expiry set
            if remaining == -2:
                # Key is missing entirely — populate it now
                await _refresh_key(key, loader_func, ttl)
            elif remaining != -1 and remaining < REFRESH_BEFORE_EXPIRY:
                # Key is about to expire — refresh proactively
                await _refresh_key(key, loader_func, ttl)

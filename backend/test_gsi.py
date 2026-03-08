import json
import logging
import os
from datetime import datetime

from fastapi import FastAPI, Request

# Setup logging
os.makedirs("logs", exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(message)s",
    handlers=[
        logging.FileHandler("logs/gsi.log"),
        logging.StreamHandler(),  # keeps printing to terminal too
    ],
)
logger = logging.getLogger(__name__)

app = FastAPI()


@app.post("/")
async def gsi_receiver(request: Request):
    data = await request.json()

    token = data.get("auth", {}).get("token")
    if token != "super_secret":
        logger.warning("Unauthorized request received")
        return {"status": "unauthorized"}

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Log summary to gsi.log
    game_state = data.get("map", {}).get("game_state", "unknown")
    logger.info(f"GSI data received | game_state: {game_state}")

    # Save full JSON payload to its own file per request
    payload_path = f"logs/payload_{timestamp}.json"
    with open(payload_path, "w") as f:
        json.dump(data, f, indent=2)
    logger.info(f"Payload saved → {payload_path}")

    return {"status": "ok"}


@app.get("/")
async def heartbeat_check():
    return {"status": "server is running"}

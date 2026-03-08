import os
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
REDIS_HOST = os.environ.get("REDIS_HOST", "")
REDIS_PORT = int(os.environ.get("REDIS_PORT", 0))
REDIS_DB = int(os.environ.get("REDIS_DB", 0))
DEFAULT_PROVIDER = os.environ.get("DEFAULT_PROVIDER", "")
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "").split(",")
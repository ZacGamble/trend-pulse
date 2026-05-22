from pydantic_settings import BaseSettings
from typing import Optional
import os
import sys

# Startup diagnostic — print which required env vars are present
_REQUIRED = [
    "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY",
    "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN",
    "CRON_SECRET",
]
print("=== TrendPulse Config Diagnostic ===", file=sys.stderr)
for var in _REQUIRED:
    present = var in os.environ
    print(f"  {var}: {'SET' if present else 'MISSING'}", file=sys.stderr)
print(f"  PORT: {os.environ.get('PORT', 'NOT SET')}", file=sys.stderr)
print("====================================", file=sys.stderr)


class Settings(BaseSettings):
    """
    Configuration loaded entirely from environment variables.
    Proprietary business logic (regex weights, high-intent phrases)
    is injected here — the open-source code is an empty shell without them.
    """

    # Supabase (service role for server-side operations)
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # Upstash Redis (REST API for serverless deduplication)
    UPSTASH_REDIS_REST_URL: str
    UPSTASH_REDIS_REST_TOKEN: str

    # Cron authentication
    CRON_SECRET: str

    # Reddit public JSON scraping (no API key needed)
    # A descriptive user agent is required — Reddit blocks default/empty agents
    REDDIT_USER_AGENT: str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

    # The moat — proprietary keyword weights and phrases
    # Format: JSON string, e.g. '{"looking for": 3, "need a tool": 5}'
    KEYWORD_REGEX_WEIGHTS: Optional[str] = None
    # Format: JSON string, e.g. '["ready to pay", "take my money", "shut up and take"]'
    HIGH_INTENT_PHRASES: Optional[str] = None

    class Config:
        env_file = ".env"


settings = Settings()  # type: ignore[call-arg]


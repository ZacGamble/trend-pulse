from pydantic_settings import BaseSettings
from typing import Optional


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

    # Reddit API credentials
    REDDIT_CLIENT_ID: str
    REDDIT_CLIENT_SECRET: str
    REDDIT_USER_AGENT: str = "TrendPulse/1.0 (automated lead detector)"

    # The moat — proprietary keyword weights and phrases
    # Format: JSON string, e.g. '{"looking for": 3, "need a tool": 5}'
    KEYWORD_REGEX_WEIGHTS: Optional[str] = None
    # Format: JSON string, e.g. '["ready to pay", "take my money", "shut up and take"]'
    HIGH_INTENT_PHRASES: Optional[str] = None

    class Config:
        env_file = ".env"


settings = Settings()  # type: ignore[call-arg]

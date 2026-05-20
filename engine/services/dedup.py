"""
Deduplication service using Upstash Redis.
Uses a 24-hour rolling expiry (SETEX post_id 86400 1) to skip
already-processed posts.
"""

from upstash_redis import Redis
from config import settings

_redis: Redis | None = None

DEDUP_TTL_SECONDS = 86400  # 24 hours


def get_redis() -> Redis:
    global _redis
    if _redis is None:
        _redis = Redis(
            url=settings.UPSTASH_REDIS_REST_URL,
            token=settings.UPSTASH_REDIS_REST_TOKEN,
        )
    return _redis


def is_duplicate(post_id: str) -> bool:
    """Check if a post has already been processed within the TTL window."""
    redis = get_redis()
    return redis.exists(f"tp:post:{post_id}") == 1


def mark_processed(post_id: str) -> None:
    """Mark a post as processed with a 24-hour TTL."""
    redis = get_redis()
    redis.setex(f"tp:post:{post_id}", DEDUP_TTL_SECONDS, 1)

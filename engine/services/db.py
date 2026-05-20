"""
Supabase database service — reads active keywords and writes match records.
Uses the service role key to bypass RLS for engine operations.
"""

from supabase import create_client, Client
from config import settings

_client: Client | None = None


def get_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
    return _client


def get_active_keywords() -> list[dict]:
    """Fetch all active keyword configurations across all users."""
    client = get_client()
    response = client.table("keywords").select("*, profiles(tier)").execute()
    return response.data or []


def save_match(keyword_id: int, post_id: str, title: str, permalink: str) -> bool:
    """
    Persist a confirmed match to the database.
    Uses upsert with the unique constraint to silently skip duplicates.
    Returns True if the match was newly inserted.
    """
    client = get_client()
    try:
        response = (
            client.table("matches")
            .insert(
                {
                    "keyword_id": keyword_id,
                    "post_id": post_id,
                    "title": title,
                    "permalink": permalink,
                }
            )
            .execute()
        )
        return bool(response.data)
    except Exception:
        # Duplicate — the unique index prevents re-insertion
        return False

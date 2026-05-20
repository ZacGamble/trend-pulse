"""
Reddit API client — authenticates via OAuth2 client credentials flow
and fetches the latest posts from target subreddits.

Data is streamed directly into memory (RAM) — nothing persists to disk.
"""

import httpx
from config import settings

_access_token: str | None = None


async def _authenticate() -> str:
    """Obtain a Reddit OAuth2 access token using client credentials."""
    global _access_token
    if _access_token:
        return _access_token

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://www.reddit.com/api/v1/access_token",
            auth=(settings.REDDIT_CLIENT_ID, settings.REDDIT_CLIENT_SECRET),
            data={"grant_type": "client_credentials"},
            headers={"User-Agent": settings.REDDIT_USER_AGENT},
        )
        response.raise_for_status()
        _access_token = response.json()["access_token"]
        return _access_token


async def fetch_new_posts(subreddit: str, limit: int = 25) -> list[dict]:
    """
    Fetch the latest `limit` posts from a subreddit.
    Returns a list of post dicts with: id, title, selftext, permalink, subreddit.
    All data lives in RAM only.
    """
    token = await _authenticate()

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://oauth.reddit.com/r/{subreddit}/new.json",
            params={"limit": limit},
            headers={
                "Authorization": f"Bearer {token}",
                "User-Agent": settings.REDDIT_USER_AGENT,
            },
        )

        if response.status_code == 401:
            # Token expired — re-authenticate and retry once
            global _access_token
            _access_token = None
            token = await _authenticate()
            response = await client.get(
                f"https://oauth.reddit.com/r/{subreddit}/new.json",
                params={"limit": limit},
                headers={
                    "Authorization": f"Bearer {token}",
                    "User-Agent": settings.REDDIT_USER_AGENT,
                },
            )

        response.raise_for_status()

    posts = []
    for child in response.json().get("data", {}).get("children", []):
        data = child.get("data", {})
        posts.append(
            {
                "id": data.get("id", ""),
                "title": data.get("title", ""),
                "selftext": data.get("selftext", ""),
                "permalink": data.get("permalink", ""),
                "subreddit": data.get("subreddit", ""),
            }
        )

    return posts

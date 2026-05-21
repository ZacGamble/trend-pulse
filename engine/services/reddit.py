"""
Reddit public JSON scraper — fetches posts from the public
reddit.com/r/{subreddit}/new.json endpoint (no API key required).

Data is streamed directly into memory (RAM) — nothing persists to disk.

Note: This endpoint is rate-limited by Reddit (~10 req/min for
unauthenticated requests). For a cron job running every 5 minutes
checking a handful of subreddits, this is more than sufficient.
"""

import httpx
from config import settings

# Reddit blocks requests with default httpx/python user agents
_HEADERS = {
    "User-Agent": settings.REDDIT_USER_AGENT,
    "Accept": "application/json",
}


async def fetch_new_posts(subreddit: str, limit: int = 25) -> list[dict]:
    """
    Fetch the latest `limit` posts from a subreddit via the public JSON feed.
    Returns a list of post dicts with: id, title, selftext, permalink, subreddit.
    All data lives in RAM only.
    """
    url = f"https://www.reddit.com/r/{subreddit}/new.json"

    async with httpx.AsyncClient(follow_redirects=True) as client:
        response = await client.get(
            url,
            params={"limit": limit, "raw_json": 1},
            headers=_HEADERS,
            timeout=15.0,
        )

        if response.status_code == 429:
            # Rate limited — return empty list, next cron cycle will retry
            return []

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

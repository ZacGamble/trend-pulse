"""
Reddit public JSON scraper — fetches posts from the public
reddit.com/r/{subreddit}/new.json endpoint (no API key required).

Data is streamed directly into memory (RAM) — nothing persists to disk.

Note: This endpoint is rate-limited by Reddit (~10 req/min for
unauthenticated requests). For a cron job running every 5 minutes
checking a handful of subreddits, this is more than sufficient.
"""

import logging
import re
import feedparser
from config import settings

logger = logging.getLogger("trendpulse")

async def fetch_new_posts(subreddit: str, limit: int = 25) -> list[dict]:
    """
    Fetch the latest `limit` posts from a subreddit via the public RSS feed.
    Returns a list of post dicts with: id, title, selftext, permalink, subreddit.
    All data lives in RAM only.
    """
    url = f"https://www.reddit.com/r/{subreddit}/new.rss"
    
    # feedparser.parse is synchronous but perfectly fast enough for RSS feeds
    feed = feedparser.parse(url)
    
    # If feedparser fails or gets blocked, feed.entries will be empty
    if not feed.entries:
        logger.warning(f"No entries found for r/{subreddit} (possibly rate limited or blocked)")
        return []

    posts = []
    # Take up to `limit` entries
    for entry in feed.entries[:limit]:
        # Extract the pure ID from the URI (e.g. 'https://www.reddit.com/r/SaaS/t3_1tg0aci' -> '1tg0aci')
        raw_id = getattr(entry, "id", "")
        post_id = raw_id.split("_")[-1] if "_" in raw_id else raw_id

        # Clean HTML tags from the summary
        summary_html = getattr(entry, "summary", "")
        selftext = re.sub(r'<[^>]+>', ' ', summary_html).strip()

        posts.append({
            "id": post_id,
            "title": getattr(entry, "title", ""),
            "selftext": selftext,
            "permalink": getattr(entry, "link", ""),
            "subreddit": subreddit,
        })

    return posts

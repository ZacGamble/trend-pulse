"""
TrendPulse Automation Engine — FastAPI application.

Implements the 5-step stateless processing pipeline:
1. Pull active keywords from Supabase
2. Ingest live Reddit posts into RAM
3. Deduplicate via Upstash Redis
4. Run the regex engine sieve
5. Persist matches and dispatch Discord alerts
"""

import logging
from fastapi import FastAPI, Header, HTTPException

from config import settings
from services.db import get_active_keywords, save_match
from services.reddit import fetch_new_posts
from services.dedup import is_duplicate, mark_processed
from services.sieve import matches_keyword
from services.alerts import send_discord_alert

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("trendpulse")

app = FastAPI(
    title="TrendPulse Engine",
    description="Stateless Reddit monitoring automation engine",
    version="1.0.0",
)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "trendpulse-engine"}


@app.post("/api/v1/cron-check")
async def cron_check(x_cron_secret: str = Header(...)):
    """
    Main processing endpoint — called every 5 minutes by cron-job.org.
    Validates the security token, then executes the full pipeline.
    """

    # ── Step 0: Validate security token ──
    if x_cron_secret != settings.CRON_SECRET:
        raise HTTPException(status_code=401, detail="Invalid cron secret")

    logger.info("Pipeline triggered — starting processing cycle")

    # ── Step 1: Pull active keywords ──
    keywords = get_active_keywords()
    if not keywords:
        logger.info("No active keywords found — skipping cycle")
        return {"processed": 0, "matches": 0}

    logger.info(f"Loaded {len(keywords)} active keyword(s)")

    # Collect unique subreddits across all keywords
    subreddit_set: set[str] = set()
    for kw in keywords:
        for sub in kw.get("target_subreddits", []):
            subreddit_set.add(sub)

    # ── Step 2: Ingest live posts into RAM ──
    all_posts: list[dict] = []
    for subreddit in subreddit_set:
        try:
            posts = await fetch_new_posts(subreddit, limit=25)
            all_posts.extend(posts)
            logger.info(f"Ingested {len(posts)} posts from r/{subreddit}")
        except Exception as e:
            logger.error(f"Failed to fetch r/{subreddit}: {e}")

    if not all_posts:
        logger.info("No posts ingested — skipping cycle")
        return {"processed": 0, "matches": 0}

    total_matches = 0

    for post in all_posts:
        post_id = post["id"]

        # ── Step 3: Deduplication filter ──
        if is_duplicate(post_id):
            continue

        # Mark as seen immediately to prevent race conditions
        mark_processed(post_id)

        # ── Step 4: Regex engine sieve ──
        for kw in keywords:
            # Only process if this subreddit is targeted by this keyword
            if post["subreddit"].lower() not in [
                s.lower() for s in kw.get("target_subreddits", [])
            ]:
                continue

            if matches_keyword(post["title"], post["selftext"], kw["phrase"]):
                # ── Step 5: Persist & Alert ──
                saved = save_match(
                    keyword_id=kw["id"],
                    post_id=post_id,
                    title=post["title"],
                    permalink=post["permalink"],
                )

                if saved:
                    total_matches += 1
                    logger.info(
                        f"MATCH: '{kw['phrase']}' in r/{post['subreddit']} — {post['title'][:60]}"
                    )

                    # Fire Discord webhook
                    await send_discord_alert(
                        webhook_url=kw["discord_webhook_url"],
                        keyword_phrase=kw["phrase"],
                        post_title=post["title"],
                        post_permalink=post["permalink"],
                        subreddit=post["subreddit"],
                    )

    logger.info(
        f"Cycle complete — processed {len(all_posts)} posts, {total_matches} new matches"
    )

    return {"processed": len(all_posts), "matches": total_matches}

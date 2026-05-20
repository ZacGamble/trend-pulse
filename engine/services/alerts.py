"""
Discord webhook alert dispatcher.
Sends structured embed messages to the user's configured Discord webhook URL.
"""

import httpx


async def send_discord_alert(
    webhook_url: str,
    keyword_phrase: str,
    post_title: str,
    post_permalink: str,
    subreddit: str,
) -> bool:
    """
    Send a rich embed notification to a Discord webhook.
    Returns True if the webhook was delivered successfully.
    """
    embed = {
        "embeds": [
            {
                "title": "🎯 New Lead Detected",
                "color": 0x7C3AED,  # Accent purple
                "fields": [
                    {
                        "name": "Keyword",
                        "value": f"`{keyword_phrase}`",
                        "inline": True,
                    },
                    {
                        "name": "Subreddit",
                        "value": f"r/{subreddit}",
                        "inline": True,
                    },
                    {
                        "name": "Post Title",
                        "value": post_title[:256],
                        "inline": False,
                    },
                    {
                        "name": "Link",
                        "value": f"[View on Reddit](https://reddit.com{post_permalink})",
                        "inline": False,
                    },
                ],
                "footer": {
                    "text": "TrendPulse • Automated Lead Detection",
                },
            }
        ]
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(webhook_url, json=embed, timeout=10)
            return response.status_code in (200, 204)
    except Exception:
        return False

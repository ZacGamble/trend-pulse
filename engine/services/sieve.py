"""
Regex engine sieve — matches post content against keyword phrases
with optional configurable weights and high-intent phrase boosting.

The pattern weights and high-intent phrases are loaded from environment
variables (the "moat"). Without them, basic substring matching is used.
"""

import json
import re
from config import settings


def _load_weights() -> dict[str, int]:
    """Load keyword regex weights from env, or return empty dict."""
    if settings.KEYWORD_REGEX_WEIGHTS:
        try:
            return json.loads(settings.KEYWORD_REGEX_WEIGHTS)
        except json.JSONDecodeError:
            return {}
    return {}


def _load_high_intent_phrases() -> list[str]:
    """Load high-intent buyer phrases from env, or return empty list."""
    if settings.HIGH_INTENT_PHRASES:
        try:
            return json.loads(settings.HIGH_INTENT_PHRASES)
        except json.JSONDecodeError:
            return []
    return []


def matches_keyword(post_title: str, post_body: str, keyword_phrase: str) -> bool:
    """
    Evaluate whether a post matches a keyword phrase.

    Matching logic:
    1. Basic: case-insensitive substring match of the keyword phrase.
    2. Weighted: if KEYWORD_REGEX_WEIGHTS are configured, boost the score
       for posts containing weighted patterns.
    3. High-intent: if HIGH_INTENT_PHRASES are configured, any match
       automatically qualifies the post.

    Returns True if the post is considered a match.
    """
    text = f"{post_title} {post_body}".lower()
    keyword_lower = keyword_phrase.lower()

    # Fast path: basic keyword match
    if keyword_lower not in text:
        return False

    # If we get here, the base keyword is present.
    # Check high-intent phrases for an automatic match.
    high_intent = _load_high_intent_phrases()
    for phrase in high_intent:
        if phrase.lower() in text:
            return True

    # Score with weights (if configured)
    weights = _load_weights()
    if weights:
        score = 1  # Base score for keyword presence
        for pattern, weight in weights.items():
            if re.search(pattern, text, re.IGNORECASE):
                score += weight
        # Require a minimum score of 2 to filter noise
        return score >= 2

    # No weights configured — base keyword match is sufficient
    return True

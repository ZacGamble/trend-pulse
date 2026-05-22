"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function validateSubreddits(subreddits: string[]): Promise<string | null> {
  for (const sub of subreddits) {
    try {
      // Proxy through our Python backend to bypass Reddit's TLS/JA3 fingerprinting
      const response = await fetch(`https://trend-pulse-production.up.railway.app/api/v1/subreddit/${sub}/new`);

      if (response.status === 302) {
        return `Subreddit "r/${sub}" does not exist.`;
      }

      if (!response.ok) {
        if (response.status === 404) return `Subreddit "r/${sub}" does not exist.`;
        if (response.status === 403) return `Subreddit "r/${sub}" is private or banned.`;
        return `Subreddit "r/${sub}" is currently inaccessible (Status: ${response.status}).`;
      }

      const data = await response.json();
      if (data.kind !== "Listing") {
        return `Subreddit "r/${sub}" does not appear to be a valid, public community.`;
      }
    } catch (e) {
      console.error(`Error validating subreddit r/${sub}:`, e);
      return `Failed to validate "r/${sub}". The backend proxy might be down.`;
    }
  }
  return null;
}

export async function createKeyword(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create a keyword." };
  }

  // Check free-tier limit in app layer BEFORE attempting the DB insert.
  // The DB trigger is the hard constraint; this provides a user-friendly error.
  const { data: profile } = await supabase
    .from("profiles")
    .select("tier")
    .eq("id", user.id)
    .single();

  if (profile?.tier === "free") {
    const { count } = await supabase
      .from("keywords")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if ((count ?? 0) >= 1) {
      return {
        error:
          "Free-tier accounts are limited to 1 keyword tracker. Upgrade to premium for unlimited trackers.",
      };
    }
  }

  const phrase = formData.get("phrase") as string;
  const subredditsRaw = formData.get("target_subreddits") as string;
  const rawWebhook = formData.get("discord_webhook_url") as string;
  const discordWebhookUrl = rawWebhook?.trim() ? rawWebhook.trim() : null;

  if (!phrase?.trim()) {
    return { error: "Keyword phrase is required." };
  }
  if (!subredditsRaw?.trim()) {
    return { error: "At least one target subreddit is required." };
  }

  // Parse comma-separated subreddits into a clean array
  const targetSubreddits = subredditsRaw
    .split(",")
    .map((s) => s.trim().replace(/^r\//, ""))
    .filter(Boolean);

  if (targetSubreddits.length === 0) {
    return { error: "At least one valid target subreddit is required." };
  }

  const validationError = await validateSubreddits(targetSubreddits);
  if (validationError) {
    return { error: validationError };
  }

  const { error } = await supabase.from("keywords").insert({
    user_id: user.id,
    phrase: phrase.trim(),
    target_subreddits: targetSubreddits,
    discord_webhook_url: discordWebhookUrl,
  });

  if (error) {
    // Surface the DB trigger error message to the user
    if (error.message.includes("FREE_TIER_LIMIT")) {
      return {
        error:
          "Free-tier accounts are limited to 1 keyword tracker. Upgrade to premium for unlimited trackers.",
      };
    }
    return { error: error.message };
  }

  revalidatePath("/dashboard/keywords");
  return { success: true };
}

export async function updateKeyword(keywordId: number, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const phrase = formData.get("phrase") as string;
  const subredditsRaw = formData.get("target_subreddits") as string;
  const rawWebhook = formData.get("discord_webhook_url") as string;
  const discordWebhookUrl = rawWebhook?.trim() ? rawWebhook.trim() : null;

  if (!phrase?.trim()) {
    return { error: "Keyword phrase is required." };
  }
  if (!subredditsRaw?.trim()) {
    return { error: "At least one target subreddit is required." };
  }

  // Parse comma-separated subreddits into a clean array
  const targetSubreddits = subredditsRaw
    .split(",")
    .map((s) => s.trim().replace(/^r\//, ""))
    .filter(Boolean);

  if (targetSubreddits.length === 0) {
    return { error: "At least one valid target subreddit is required." };
  }

  const validationError = await validateSubreddits(targetSubreddits);
  if (validationError) {
    return { error: validationError };
  }

  const { error } = await supabase
    .from("keywords")
    .update({
      phrase: phrase.trim(),
      target_subreddits: targetSubreddits,
      discord_webhook_url: discordWebhookUrl,
    })
    .eq("id", keywordId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  // No redirect here because we want the client to trigger the scrape first
  return { success: true };
}

export async function deleteKeyword(keywordId: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { error } = await supabase
    .from("keywords")
    .delete()
    .eq("id", keywordId)
    .eq("user_id", user.id); // RLS ensures this, but explicit is safer

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/keywords");
}

export async function triggerEngineScrape() {
  try {
    const cronSecret = process.env.CRON_SECRET || "";
    await fetch("https://trend-pulse-production.up.railway.app/api/v1/cron-check", {
      method: "POST",
      headers: {
        "x-cron-secret": cronSecret,
      },
    });
  } catch (e) {
    console.error("Failed to trigger engine scrape:", e);
  }
}

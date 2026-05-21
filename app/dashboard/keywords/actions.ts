"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
  const discordWebhookUrl = formData.get("discord_webhook_url") as string;

  if (!phrase?.trim()) {
    return { error: "Keyword phrase is required." };
  }
  if (!subredditsRaw?.trim()) {
    return { error: "At least one target subreddit is required." };
  }
  if (!discordWebhookUrl?.trim()) {
    return { error: "Discord webhook URL is required." };
  }

  // Parse comma-separated subreddits into a clean array
  const targetSubreddits = subredditsRaw
    .split(",")
    .map((s) => s.trim().replace(/^r\//, ""))
    .filter(Boolean);

  if (targetSubreddits.length === 0) {
    return { error: "At least one valid subreddit name is required." };
  }

  const { error } = await supabase.from("keywords").insert({
    user_id: user.id,
    phrase: phrase.trim(),
    target_subreddits: targetSubreddits,
    discord_webhook_url: discordWebhookUrl.trim(),
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

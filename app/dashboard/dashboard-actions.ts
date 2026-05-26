"use server";

import { createClient } from "@/lib/supabase/server";

export async function getMatches(page: number, limit: number = 20) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const from = (page - 1) * limit;
  const to = page * limit - 1;

  const { data: matches, count, error } = await supabase
    .from("matches")
    .select("*, keywords!inner(phrase, user_id)", { count: "exact" })
    .eq("keywords.user_id", user.id)
    .order("matched_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching matches:", error);
    throw error;
  }

  return {
    matches: matches || [],
    totalCount: count ?? 0,
    hasMore: (count ?? 0) > page * limit,
  };
}

export async function getKeywords() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: keywords, error } = await supabase
    .from("keywords")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching keywords:", error);
    throw error;
  }

  return keywords || [];
}

export async function getDashboardStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const [keywordsResult, matchesResult, latestMatchResult] = await Promise.all([
    supabase
      .from("keywords")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("matches")
      .select("id, keywords!inner(user_id)", { count: "exact", head: true })
      .eq("keywords.user_id", user.id),
    supabase
      .from("matches")
      .select("matched_at, keywords!inner(user_id)")
      .eq("keywords.user_id", user.id)
      .order("matched_at", { ascending: false })
      .limit(1),
  ]);

  const keywordCount = keywordsResult.count ?? 0;
  const matchCount = matchesResult.count ?? 0;
  const lastMatch = latestMatchResult.data?.[0]?.matched_at
    ? new Date(latestMatchResult.data[0].matched_at).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      )
    : "No matches yet";

  return {
    keywordCount,
    matchCount,
    lastMatch,
  };
}

import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle, CardValue } from "@/app/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch stats in parallel
  const [keywordsResult, matchesResult, latestMatchResult] = await Promise.all([
    supabase
      .from("keywords")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase
      .from("matches")
      .select("id, keywords!inner(user_id)", { count: "exact", head: true })
      .eq("keywords.user_id", user!.id),
    supabase
      .from("matches")
      .select("matched_at, keywords!inner(user_id)")
      .eq("keywords.user_id", user!.id)
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your monitoring overview at a glance.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="animate-fade-in">
          <CardTitle>Active Keywords</CardTitle>
          <CardValue>{keywordCount}</CardValue>
        </Card>

        <Card className="animate-fade-in delay-100">
          <CardTitle>Total Matches</CardTitle>
          <CardValue>{matchCount}</CardValue>
        </Card>

        <Card className="animate-fade-in delay-200">
          <CardTitle>Last Match</CardTitle>
          <CardValue>
            <span className="text-lg">{lastMatch}</span>
          </CardValue>
        </Card>
      </div>
    </div>
  );
}

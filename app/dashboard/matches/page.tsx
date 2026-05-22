import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle, CardValue } from "@/app/ui/card";
import Link from "next/link";
import { Button } from "@/app/ui/button";

export default async function MatchesPage() {
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

  const { data: matches } = await supabase
    .from("matches")
    .select("*, keywords!inner(phrase, user_id)")
    .eq("keywords.user_id", user!.id)
    .order("matched_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Matches
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All detected leads from your keyword trackers.
          </p>
        </div>
        <Link href="/dashboard/keywords/new">
          <Button className="!p-0 md:!px-5 md:!py-2.5 h-10 w-10 md:h-auto md:w-auto md:gap-2">
            <svg
              className="h-5 w-5 md:h-4 md:w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            <span className="hidden md:inline">Create Tracker</span>
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-3 mb-8">
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

      {matches && matches.length > 0 ? (
        <div className="grid gap-3">
          {matches.map((match, i) => (
            <Card
              key={match.id}
              className={`animate-fade-in ${i < 5 ? `delay-${i * 100}` : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <a
                    href={`${match.permalink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-semibold text-foreground hover:text-accent-light transition-colors"
                  >
                    {match.title}
                    <svg
                      className="ml-1 inline-block h-3.5 w-3.5 text-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </a>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                    <span className="inline-flex items-center rounded-lg bg-accent/10 px-2 py-0.5 font-medium text-accent-light">
                      &ldquo;{(match.keywords as { phrase: string }).phrase}&rdquo;
                    </span>
                    <span>
                      {new Date(match.matched_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <svg className="mb-4 h-12 w-12 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
          </svg>
          <h3 className="text-lg font-semibold text-foreground">
            No matches yet
          </h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Once the engine detects posts matching your keywords, they&apos;ll
            appear here. Make sure you have at least one active keyword tracker.
          </p>
        </Card>
      )}
    </div>
  );
}

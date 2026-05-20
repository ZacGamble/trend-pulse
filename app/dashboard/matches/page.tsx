import { createClient } from "@/lib/supabase/server";
import { Card } from "@/app/ui/card";

export default async function MatchesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: matches } = await supabase
    .from("matches")
    .select("*, keywords!inner(phrase, user_id)")
    .eq("keywords.user_id", user!.id)
    .order("matched_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Matches
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All detected leads from your keyword trackers.
        </p>
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
                    href={`https://reddit.com${match.permalink}`}
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

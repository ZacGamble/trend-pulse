import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/app/ui/button";
import { Card } from "@/app/ui/card";
import { DeleteKeywordButton } from "./delete-button";

export default async function KeywordsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: keywords } = await supabase
    .from("keywords")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  // Check if user can add more keywords
  const { data: profile } = await supabase
    .from("profiles")
    .select("tier")
    .eq("id", user!.id)
    .single();

  const isFree = profile?.tier === "free";
  const atLimit = isFree && (keywords?.length ?? 0) >= 1;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Keywords
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your keyword monitoring configurations.
          </p>
        </div>

        {atLimit ? (
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-xs text-muted-foreground border border-input-border rounded-lg px-3 py-1.5">
              Free tier: 1/1 keyword used
            </span>
            <Button disabled className="!p-0 md:!px-5 md:!py-2.5 h-10 w-10 md:h-auto md:w-auto md:gap-2 opacity-50 cursor-not-allowed">
              <svg className="h-5 w-5 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="hidden md:inline">Add Keyword</span>
            </Button>
          </div>
        ) : (
          <Link href="/dashboard/keywords/new">
            <Button className="!p-0 md:!px-5 md:!py-2.5 h-10 w-10 md:h-auto md:w-auto md:gap-2">
              <svg className="h-5 w-5 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="hidden md:inline">Add Keyword</span>
            </Button>
          </Link>
        )}
      </div>

      {atLimit && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-400">
          <div>
            <strong>Free-tier limit reached.</strong> You&apos;re using your 1 keyword
            tracker. Delete the existing one or upgrade to premium for unlimited
            trackers.
          </div>
          <form action="/api/billing/checkout" method="POST">
            <Button type="submit" className="whitespace-nowrap bg-amber-500 text-amber-950 hover:bg-amber-400 hover:brightness-100 shadow-none text-xs h-8 px-4">
              Upgrade to Premium
            </Button>
          </form>
        </div>
      )}

      {keywords && keywords.length > 0 ? (
        <div className="grid gap-4">
          {keywords.map((keyword) => (
            <Card key={keyword.id} className="animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    &ldquo;{keyword.phrase}&rdquo;
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {keyword.target_subreddits.map((sub: string) => (
                      <span
                        key={sub}
                        className="inline-flex items-center rounded-lg bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent-light"
                      >
                        r/{sub}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 truncate text-xs text-muted">
                    Webhook: {keyword.discord_webhook_url}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Created{" "}
                    {new Date(keyword.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:mt-0">
                  <Link href={`/dashboard/keywords/${keyword.id}/edit`}>
                    <Button variant="secondary" className="h-9 px-3 text-xs">
                      Edit
                    </Button>
                  </Link>
                  <DeleteKeywordButton keywordId={keyword.id} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <svg className="mb-4 h-12 w-12 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
          </svg>
          <h3 className="text-lg font-semibold text-foreground">
            No keywords yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first keyword tracker to start monitoring Reddit.
          </p>
          <Link href="/dashboard/keywords/new" className="mt-4">
            <Button>Create your first keyword</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}

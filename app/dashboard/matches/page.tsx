"use client";

import { useEffect } from "react";
import { Card, CardTitle, CardValue } from "@/app/ui/card";
import Link from "next/link";
import { Button } from "@/app/ui/button";
import { useDashboard } from "@/app/dashboard/dashboard-context";

function MockCard() {
  return (
    <div className="glass rounded-2xl p-6 border border-dashed border-accent/20 bg-accent/5 animate-pulse flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
          <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent/20 opacity-75"></div>
          <svg className="animate-spin h-6 w-6 text-accent-light" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <div>
          <h4 className="text-base font-semibold text-foreground">Analyzing Reddit for leads...</h4>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            Fetching tracker matches. Real-time updates populate as posts match your keywords.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MatchesPage() {
  const {
    matchesCache,
    stats,
    matchesPage,
    hasMoreMatches,
    isMatchesLoading,
    isStatsLoading,
    fetchMatches,
    fetchStats,
    prefetchMatches,
  } = useDashboard();

  useEffect(() => {
    fetchStats();
    fetchMatches(matchesPage);
  }, [matchesPage, fetchMatches, fetchStats]);

  const currentMatches = matchesCache[matchesPage];

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
          <CardValue>
            {isStatsLoading || !stats ? (
              <span className="inline-block h-8 w-12 animate-pulse rounded-md bg-white/5" />
            ) : (
              stats.keywordCount
            )}
          </CardValue>
        </Card>

        <Card className="animate-fade-in delay-100">
          <CardTitle>Total Matches</CardTitle>
          <CardValue>
            {isStatsLoading || !stats ? (
              <span className="inline-block h-8 w-12 animate-pulse rounded-md bg-white/5" />
            ) : (
              stats.matchCount
            )}
          </CardValue>
        </Card>

        <Card className="animate-fade-in delay-200">
          <CardTitle>Last Match</CardTitle>
          <CardValue>
            {isStatsLoading || !stats ? (
              <span className="inline-block h-6 w-32 animate-pulse rounded-md bg-white/5" />
            ) : (
              <span className="text-lg">{stats.lastMatch}</span>
            )}
          </CardValue>
        </Card>
      </div>

      {isMatchesLoading && !currentMatches ? (
        <MockCard />
      ) : currentMatches && currentMatches.length > 0 ? (
        <>
          <div className="grid gap-3">
            {currentMatches.map((match, i) => (
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

          {/* Pagination Controls */}
          <div className="mt-8 flex items-center justify-between border-t border-card-border pt-6">
            <Button
              variant="secondary"
              disabled={matchesPage === 1 || isMatchesLoading}
              onClick={() => fetchMatches(matchesPage - 1)}
              onMouseEnter={() => {
                if (matchesPage > 1) prefetchMatches(matchesPage - 1);
              }}
              className="text-xs py-2 px-4 h-9"
            >
              ← Previous
            </Button>
            <span className="text-sm font-medium text-muted-foreground">
              Page {matchesPage}
            </span>
            <Button
              variant="secondary"
              disabled={!hasMoreMatches || isMatchesLoading}
              onClick={() => fetchMatches(matchesPage + 1)}
              onMouseEnter={() => {
                if (hasMoreMatches) prefetchMatches(matchesPage + 1);
              }}
              className="text-xs py-2 px-4 h-9"
            >
              Next →
            </Button>
          </div>
        </>
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

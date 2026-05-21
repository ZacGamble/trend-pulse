"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createKeyword, triggerEngineScrape } from "../actions";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import { Card } from "@/app/ui/card";

export default function NewKeywordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<"idle" | "saving" | "fetching">("idle");

  async function handleSubmit(formData: FormData) {
    setLoadingStep("saving");
    setError(null);
    
    // Step 1: Create the keyword
    const result = await createKeyword(formData);
    if (result?.error) {
      setError(result.error);
      setLoadingStep("idle");
      return;
    }

    // Step 2: Trigger the scrape
    setLoadingStep("fetching");
    await triggerEngineScrape();

    // Step 3: Redirect
    router.push("/dashboard/keywords");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <Link
          href="/dashboard/keywords"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Keywords
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
          New Keyword Tracker
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure a new keyword to monitor across Reddit.
        </p>
      </div>

      {error && (
        <div
          className="mb-6 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {error}
        </div>
      )}

      {loadingStep === "fetching" && (
        <div className="mb-6 animate-fade-in rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-accent-light flex items-center gap-3">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Fetching new posts now...
        </div>
      )}

      <Card>
        <form action={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Keyword Phrase"
            name="phrase"
            type="text"
            placeholder='e.g. "looking for a tool to"'
            required
            disabled={loadingStep !== "idle"}
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="target_subreddits"
              className="text-sm font-medium text-muted-foreground"
            >
              Target Subreddits
            </label>
            <input
              id="target_subreddits"
              name="target_subreddits"
              type="text"
              placeholder="e.g. SaaS, startups, Entrepreneur"
              required
              disabled={loadingStep !== "idle"}
              className="rounded-xl border border-input-border bg-input-bg px-4 py-2.5 text-sm text-foreground placeholder-muted transition-colors duration-200 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-muted">
              Comma-separated list. No need to include &quot;r/&quot; prefix.
            </p>
          </div>

          <Input
            label="Discord Webhook URL"
            name="discord_webhook_url"
            type="url"
            placeholder="https://discord.com/api/webhooks/..."
            required
            disabled={loadingStep !== "idle"}
          />

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={loadingStep !== "idle"}>
              {loadingStep === "saving" ? "Creating…" : loadingStep === "fetching" ? "Scanning Reddit…" : "Create Keyword Tracker"}
            </Button>
            <Link href="/dashboard/keywords" className={loadingStep !== "idle" ? "pointer-events-none opacity-50" : ""}>
              <Button variant="secondary" type="button" disabled={loadingStep !== "idle"}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { createKeyword } from "../actions";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import { Card } from "@/app/ui/card";

export default function NewKeywordPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await createKeyword(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
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

      <Card>
        <form action={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Keyword Phrase"
            name="phrase"
            type="text"
            placeholder='e.g. "looking for a tool to"'
            required
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
              className="rounded-xl border border-input-border bg-input-bg px-4 py-2.5 text-sm text-foreground placeholder-muted transition-colors duration-200 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
          />

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create Keyword Tracker"}
            </Button>
            <Link href="/dashboard/keywords">
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

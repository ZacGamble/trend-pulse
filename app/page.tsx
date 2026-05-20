import Link from "next/link";
import { Logo } from "@/app/ui/logo";
import { Button } from "@/app/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-card-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 pt-32 pb-20">
        <div className="relative mx-auto max-w-4xl text-center">
          {/* Glow effect behind hero */}
          <div
            className="pointer-events-none absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full opacity-30 blur-[120px]"
            style={{
              background:
                "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
            }}
          />

          <div className="animate-fade-in">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-medium text-accent-light">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Open-source Reddit monitoring
            </span>
          </div>

          <h1 className="animate-fade-in delay-100 mt-6 text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Detect buyer signals
            <br />
            <span className="gradient-text">before anyone else</span>
          </h1>

          <p className="animate-fade-in delay-200 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            TrendPulse monitors Reddit in real-time, matches posts against your
            keywords, and sends instant Discord alerts — so you never miss a
            high-intent lead.
          </p>

          <div className="animate-fade-in delay-300 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button className="h-12 px-8 text-base animate-pulse-glow">
                Start Monitoring — Free
              </Button>
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" className="h-12 px-8 text-base">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                View Source
              </Button>
            </a>
          </div>
        </div>

        {/* How It Works */}
        <section className="mx-auto mt-32 max-w-5xl px-6">
          <h2 className="animate-fade-in text-center text-sm font-semibold uppercase tracking-widest text-muted">
            How It Works
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Configure",
                description:
                  "Set your keywords, target subreddits, and Discord webhook — all from a clean dashboard.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Detect",
                description:
                  "Every 5 minutes, the engine scans new Reddit posts, deduplicates, and runs your keyword sieve.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Alert",
                description:
                  "Matching posts are saved to your ledger and delivered as rich Discord webhook alerts instantly.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className={`animate-slide-up delay-${(i + 1) * 100} glass rounded-2xl p-8 text-center transition-all duration-300 hover:border-accent/20 hover:shadow-lg hover:shadow-accent-glow/10`}
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent-light">
                  {item.icon}
                </div>
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">
                  Step {item.step}
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="mx-auto mt-32 max-w-5xl px-6">
          <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-muted">
            Built for Builders
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {[
              {
                title: "Zero-Cost Architecture",
                description:
                  "Runs entirely on free tiers — Vercel, Render, Supabase, and Upstash. No surprise bills.",
              },
              {
                title: "Stateless Processing",
                description:
                  "Data streams are processed in ephemeral memory. Nothing persists unless it matches.",
              },
              {
                title: "Open Source Core",
                description:
                  "The entire codebase is public. Your competitive moat lives in environment variables.",
              },
              {
                title: "Real-time Discord Alerts",
                description:
                  "Rich embed notifications delivered to your Discord channel within seconds of detection.",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className={`animate-slide-up delay-${(i + 1) * 100} glass rounded-2xl p-6 transition-all duration-300 hover:border-accent/20`}
              >
                <h3 className="font-bold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-card-border py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-sm text-muted">
          <Logo />
          <span>Built in public. Ship fast.</span>
        </div>
      </footer>
    </div>
  );
}

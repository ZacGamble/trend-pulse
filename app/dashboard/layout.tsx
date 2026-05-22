import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Logo } from "@/app/ui/logo";
import { NavLink } from "@/app/ui/nav-link";
import { LogoutButton } from "@/app/dashboard/logout-button";

import { MobileNav } from "@/app/dashboard/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <MobileNav email={user.email || ""} />
      
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-64 flex-col border-r border-card-border bg-card/50 backdrop-blur-xl">
        <div className="flex h-16 items-center px-6 border-b border-card-border">
          <Logo />
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          <NavLink
            href="/dashboard/matches"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
            }
          >
            Matches
          </NavLink>
          <NavLink
            href="/dashboard/keywords"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
              </svg>
            }
          >
            Keywords
          </NavLink>
        </nav>

        <div className="border-t border-card-border p-4">
          <div className="mb-3 truncate text-xs text-muted-foreground">
            {user.email}
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 md:ml-64 md:p-8">{children}</main>
    </div>
  );
}

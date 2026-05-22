"use client";

import { useState } from "react";
import { Logo } from "@/app/ui/logo";
import { NavLink } from "@/app/ui/nav-link";
import { LogoutButton } from "@/app/dashboard/logout-button";

import { BillingForm } from "@/app/dashboard/billing-form";

export function MobileNav({ email, tier }: { email: string, tier: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="md:hidden sticky top-0 z-50 flex h-16 items-center justify-between border-b border-card-border bg-background/80 px-4 backdrop-blur-xl">
        <Logo />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-muted-foreground hover:text-foreground"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </header>

      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/95 pt-16 flex flex-col">
          <nav className="flex flex-1 flex-col gap-2 p-4">
            <div onClick={() => setIsOpen(false)}>
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
            </div>
            <div onClick={() => setIsOpen(false)}>
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
            </div>
          </nav>
          <div className="border-t border-card-border p-4 bg-background">
            <BillingForm tier={tier} />
            <div className="mb-3 truncate text-xs text-muted-foreground">
              {email}
            </div>
            <LogoutButton />
          </div>
        </div>
      )}
    </>
  );
}

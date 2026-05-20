"use client";

import { logout } from "@/app/(auth)/actions";
import { Button } from "@/app/ui/button";

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button type="submit" variant="ghost" className="w-full justify-start text-xs">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
        </svg>
        Sign out
      </Button>
    </form>
  );
}

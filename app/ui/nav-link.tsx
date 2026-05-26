"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { useDashboard } from "@/app/dashboard/dashboard-context";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  icon: ReactNode;
}

export function NavLink({ href, children, icon }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");
  const { prefetchMatches, prefetchKeywords } = useDashboard();

  const handleMouseEnter = () => {
    if (href === "/dashboard/matches") {
      prefetchMatches(1);
    } else if (href === "/dashboard/keywords") {
      prefetchKeywords();
    }
  };

  return (
    <Link
      href={href}
      onMouseEnter={handleMouseEnter}
      className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-accent/10 text-accent-light border border-accent/20"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`glass rounded-2xl p-6 transition-all duration-300 hover:border-white/10 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h3>
  );
}

export function CardValue({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
      {children}
    </p>
  );
}

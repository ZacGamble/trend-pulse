import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-gradient-start to-gradient-end text-white shadow-lg shadow-accent-glow hover:shadow-xl hover:shadow-accent-glow hover:brightness-110 active:brightness-95",
  secondary:
    "bg-transparent border border-input-border text-foreground hover:bg-white/5 hover:border-white/20 active:bg-white/10",
  danger:
    "bg-danger/10 border border-danger/20 text-danger hover:bg-danger/20 active:bg-danger/30",
  ghost:
    "bg-transparent text-muted-foreground hover:text-foreground hover:bg-white/5 active:bg-white/10",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`rounded-xl border border-input-border bg-input-bg px-4 py-2.5 text-sm text-foreground placeholder-muted transition-colors duration-200 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${
          error ? "border-danger focus:border-danger focus:ring-danger" : ""
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

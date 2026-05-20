export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect
          width="28"
          height="28"
          rx="8"
          fill="url(#logo-gradient)"
        />
        <path
          d="M8 18L11 10L14 15L17 8L20 18"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="15" r="2" fill="white" fillOpacity="0.9" />
        <defs>
          <linearGradient
            id="logo-gradient"
            x1="0"
            y1="0"
            x2="28"
            y2="28"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#7c3aed" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-lg font-bold tracking-tight text-foreground">
        Trend<span className="gradient-text">Pulse</span>
      </span>
    </div>
  );
}

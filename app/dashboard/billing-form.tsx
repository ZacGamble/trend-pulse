export function BillingForm({ tier }: { tier: string }) {
  const isPremium = tier === "premium";
  const actionUrl = isPremium ? "/api/billing/portal" : "/api/billing/checkout";
  
  return (
    <form action={actionUrl} method="POST">
      <button 
        type="submit" 
        className="w-full text-left text-sm font-medium text-muted-foreground hover:text-foreground mb-3 transition-colors flex items-center justify-between"
      >
        {isPremium ? "Manage Subscription" : "Upgrade to Premium"}
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </form>
  );
}

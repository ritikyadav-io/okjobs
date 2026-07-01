/**
 * OkJobs wordmark. Editorial serif for "Ok", saturated orange dot,
 * cream badge — Mistral-style sober geometry.
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2 leading-none">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-gradient-brand shadow-glow">
        <span className="font-display text-lg text-white" style={{ lineHeight: 1 }}>O</span>
      </span>
      {!compact && (
        <span className="font-display text-xl tracking-tight text-ink">
          <span style={{ color: "hsl(var(--primary))" }}>Ok</span>
          <span className="text-foreground">Jobs</span>
        </span>
      )}
    </div>
  );
}

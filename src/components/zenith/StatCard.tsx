import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  trend,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent: "primary" | "secondary" | "cyan" | "gold" | "success";
  trend?: string;
}) {
  const accentMap: Record<string, string> = {
    primary: "from-primary/20 to-primary/5 border-primary/40 text-primary",
    secondary: "from-secondary/20 to-secondary/5 border-secondary/40 text-secondary",
    cyan: "from-cyan/20 to-cyan/5 border-cyan/40 text-cyan",
    gold: "from-gold/20 to-gold/5 border-gold/40 text-gold",
    success: "from-success/20 to-success/5 border-success/40 text-success",
  };
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow ${accentMap[accent]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 text-3xl font-extrabold text-foreground">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        <div className="rounded-xl bg-card p-2.5">
          <Icon className="h-5 w-5" strokeWidth={2.4} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-card px-2 py-0.5 text-xs font-semibold text-success">
          <TrendingUp className="h-3 w-3" /> {trend}
        </div>
      )}
    </div>
  );
}

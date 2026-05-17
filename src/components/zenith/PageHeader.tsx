import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

export function PageHeader({
  title,
  description,
  actions,
  showBack = true,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  showBack?: boolean;
}) {
  const router = useRouter();
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
    } else {
      router.navigate({ to: "/dashboard" });
    }
  };

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 flex items-start gap-3">
        {showBack && (
          <button
            onClick={goBack}
            aria-label="Go back"
            className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

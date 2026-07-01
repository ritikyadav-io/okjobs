import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { SiteFooter } from "./SiteFooter";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-[hsl(var(--beige-deep))] bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/"><Logo /></Link>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <Link to="/about" className="text-slate-700 hover:text-ink">About</Link>
            <Link to="/blog" className="text-slate-700 hover:text-ink">Writings</Link>
            <Link to="/privacy" className="text-slate-700 hover:text-ink">Privacy</Link>
            <Link to="/terms" className="text-slate-700 hover:text-ink">Terms</Link>
          </nav>
          <Link
            to="/dashboard"
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            style={{ backgroundColor: "hsl(var(--ink))" }}
          >
            Open OkJobs
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { SiteFooter } from "./SiteFooter";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/"><Logo /></Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link to="/about" className="hover:text-primary" activeProps={{ className: "text-primary" }}>About</Link>
            <Link to="/blog" className="hover:text-primary" activeProps={{ className: "text-primary" }}>Blog</Link>
            <Link to="/privacy" className="hover:text-primary" activeProps={{ className: "text-primary" }}>Privacy</Link>
            <Link to="/terms" className="hover:text-primary" activeProps={{ className: "text-primary" }}>Terms</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-lg px-3 py-1.5 text-sm font-semibold hover:bg-accent">Log in</Link>
            <Link to="/signup" className="rounded-lg bg-gradient-brand px-3 py-1.5 text-sm font-semibold text-white shadow-glow">Sign up</Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

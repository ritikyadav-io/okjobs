import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Home, Briefcase, ClipboardList, FileText, Inbox, Calendar, Sunrise,
  Settings, Bell, Menu, Plug, User, type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Logo } from "./Logo";
import { useAuth } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listRecruiterEmails } from "@/lib/gmail.functions";

type NavItem = { to: string; label: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/applications", label: "Applications", icon: ClipboardList },
  { to: "/resume-lab", label: "Resume Lab", icon: FileText },
  { to: "/recruiter-inbox", label: "Career Inbox", icon: Inbox },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/briefing", label: "Daily Briefing", icon: Sunrise },
  { to: "/integrations", label: "Assistants", icon: Plug },
  { to: "/settings", label: "Settings", icon: Settings },
];

const BOTTOM_NAV = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/applications", label: "Apps", icon: ClipboardList },
  { to: "/recruiter-inbox", label: "Inbox", icon: Inbox },
  { to: "/settings", label: "Profile", icon: User },
] as const;

function titleFor(pathname: string) {
  const hit = NAV.find((n) => n.to === pathname || (n.to !== "/dashboard" && pathname.startsWith(n.to)));
  return hit?.label ?? "OkJobs";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile } = useAuth();
  const nav = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Onboarding gate (single-user, no auth check). Sticky: once localStorage flag is set, never gate again.
  const [onboardedFlag, setOnboardedFlag] = useState(false);
  useEffect(() => {
    try { setOnboardedFlag(localStorage.getItem("okjobs.onboarded") === "1"); } catch {}
  }, [profile]);
  const profileComplete =
    !!profile &&
    !!profile.full_name?.trim() &&
    !!profile.preferred_role?.trim() &&
    (profile.resume_skills?.length ?? 0) >= 3;
  const onboardingIncomplete = !!profile && !profileComplete && !onboardedFlag;
  useEffect(() => {
    if (profileComplete) {
      try { localStorage.setItem("okjobs.onboarded", "1"); } catch {}
    }
  }, [profileComplete]);
  useEffect(() => {
    if (onboardingIncomplete && pathname !== "/onboarding") nav({ to: "/onboarding" });
  }, [onboardingIncomplete, pathname, nav]);

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
    setDrawerOpen(false);
  }, [pathname]);

  const displayName = profile?.full_name || "You";
  const initial = (displayName[0] || "O").toUpperCase();
  const pageTitle = titleFor(pathname);

  const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              active
                ? "bg-[hsl(var(--ink))] text-white"
                : "text-sidebar-foreground hover:bg-[hsl(var(--cream-deeper))]"
            }`}
          >
            <item.icon className="h-4 w-4" strokeWidth={2} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const UserCard = () => (
    <div className="mt-4 rounded-lg border border-[hsl(var(--beige-deep))] bg-white p-3">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-gradient-brand font-display text-lg text-white">{initial}</div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{displayName}</div>
          <div className="truncate text-xs text-muted-foreground">{profile?.preferred_role || "Set your target role"}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[hsl(var(--beige-deep))] bg-sidebar p-4 md:flex">
        <Link to="/dashboard" className="mb-6 px-2">
          <Logo />
        </Link>
        <SidebarNav />
        <UserCard />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[hsl(var(--beige-deep))] bg-background/85 px-4 backdrop-blur md:px-8">
          {/* Mobile */}
          <div className="flex w-full items-center justify-between md:hidden">
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <button aria-label="Menu" className="grid h-10 w-10 place-items-center rounded-md border border-[hsl(var(--beige-deep))] bg-white">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[88vw] max-w-sm border-r border-[hsl(var(--beige-deep))] bg-sidebar p-4">
                <Link to="/dashboard" className="mb-4 flex px-1"><Logo /></Link>
                <SidebarNav onNavigate={() => setDrawerOpen(false)} />
                <UserCard />
              </SheetContent>
            </Sheet>
            <Link to="/dashboard"><Logo compact /></Link>
            <button aria-label="Notifications" className="grid h-10 w-10 place-items-center rounded-md border border-[hsl(var(--beige-deep))] bg-white">
              <Bell className="h-4 w-4" />
            </button>
          </div>

          {/* Desktop — page title left, controls right (removes empty gap) */}
          <div className="hidden w-full items-center justify-between md:flex">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">OkJobs</div>
              <div className="font-display text-2xl leading-none">{pageTitle}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Notifications"
                className="relative grid h-9 w-9 place-items-center rounded-md border border-[hsl(var(--beige-deep))] bg-white hover:bg-cream"
              >
                <Bell className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 pb-24 md:p-8 md:pb-10">{children}</main>

        {/* Sunset stripe above bottom nav on mobile, above nothing on desktop (footer handles it in public pages) */}
        <div className="hidden md:block"><div className="h-1.5 w-full bg-sunset-stripe" /></div>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-30 md:hidden">
          <div className="mx-3 mb-3 rounded-lg border border-[hsl(var(--beige-deep))] bg-white/90 p-1.5 shadow-editorial backdrop-blur-xl">
            <div className="grid grid-cols-5 gap-1">
              {BOTTOM_NAV.map((item) => {
                const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex flex-col items-center gap-0.5 rounded-md py-2 text-[10px] font-medium transition-all ${
                      active ? "bg-[hsl(var(--ink))] text-white" : "text-muted-foreground hover:bg-cream"
                    }`}
                  >
                    <item.icon className="h-4 w-4" strokeWidth={2} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

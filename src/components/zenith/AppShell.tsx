import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Home,
  Briefcase,
  ClipboardList,
  FileText,
  Inbox,
  Calendar,
  Sunrise,
  Settings,
  LogOut,
  Bell,
  Menu,
  Plug,
  User,
  Zap,
  
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type NavItem = { to: string; label: string; icon: LucideIcon; color: string };

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: Home, color: "text-primary" },
  { to: "/jobs", label: "Jobs", icon: Briefcase, color: "text-cyan" },
  { to: "/applications", label: "Applications", icon: ClipboardList, color: "text-secondary" },
  { to: "/resume-lab", label: "Resume Lab", icon: FileText, color: "text-gold" },
  { to: "/recruiter-inbox", label: "Recruiter Inbox", icon: Inbox, color: "text-success" },
  { to: "/calendar", label: "Calendar", icon: Calendar, color: "text-cyan" },
  { to: "/briefing", label: "Daily Briefing", icon: Sunrise, color: "text-gold" },
  { to: "/integrations", label: "Assistants", icon: Plug, color: "text-primary" },
  
  { to: "/settings", label: "Settings", icon: Settings, color: "text-muted-foreground" },
];

const BOTTOM_NAV = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/applications", label: "Apps", icon: ClipboardList },
  { to: "/recruiter-inbox", label: "Inbox", icon: Inbox },
  { to: "/settings", label: "Profile", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading, profile, signOut } = useAuth();
  const nav = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user, nav]);

  // Onboarding gate: require basic profile before using the app
  const onboardingIncomplete =
    !!profile &&
    (!profile.full_name?.trim() || !profile.preferred_role?.trim() || (profile.resume_skills?.length ?? 0) < 3);
  useEffect(() => {
    if (!loading && user && onboardingIncomplete && pathname !== "/onboarding") {
      nav({ to: "/onboarding" });
    }
  }, [loading, user, onboardingIncomplete, pathname, nav]);

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
    setDrawerOpen(false);
  }, [pathname]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    );
  }

  const displayName = profile?.full_name || user.email?.split("@")[0] || "You";
  const initial = (displayName[0] || "Z").toUpperCase();

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out");
    nav({ to: "/login" });
  };

  const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all md:py-2 ${
              active
                ? "bg-gradient-brand text-white shadow-glow"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
          >
            <item.icon className={`h-5 w-5 md:h-4 md:w-4 ${active ? "text-white" : item.color}`} strokeWidth={2.4} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const UserCard = () => (
    <div className="mt-4 rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-warm font-bold text-white">{initial}</div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{displayName}</div>
          <div className="truncate text-xs text-muted-foreground">{user.email}</div>
          <div className="mt-1 inline-flex rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
            {profile?.plan || "Free"} plan
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
          aria-label="Log out"
        >
          <LogOut className="h-3.5 w-3.5" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop sidebar (unchanged) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar p-4 md:flex">
        <Link to="/dashboard" className="mb-6 px-2">
          <Logo />
        </Link>
        <SidebarNav />
        <UserCard />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top header: desktop unchanged, mobile redesigned */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
          {/* Mobile: hamburger + centered logo + bell */}
          <div className="flex w-full items-center justify-between md:hidden">
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <button aria-label="Menu" className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-card">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[88vw] max-w-sm border-r border-border bg-sidebar p-4">
                <Link to="/dashboard" className="mb-4 flex px-1">
                  <Logo />
                </Link>
                <SidebarNav onNavigate={() => setDrawerOpen(false)} />
                <UserCard />
              </SheetContent>
            </Sheet>
            <Link to="/dashboard" className="flex items-center gap-2 font-extrabold tracking-tight">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-brand shadow-glow">
                <Zap className="h-3.5 w-3.5 text-white" strokeWidth={3} />
              </span>
              <span className="text-base"><span style={{color:'#2BB3EE'}}>Ok</span><span style={{color:'#5A6B2F'}}>Jobs</span></span>
            </Link>
            <button
              aria-label="Notifications"
              className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-card"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>

          {/* Desktop header */}
          <div className="ml-auto hidden items-center gap-3 md:flex">
            <button
              aria-label="Notifications"
              className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-card hover:bg-accent"
            >
              <Bell className="h-4 w-4" />
            </button>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-30 md:hidden">
          <div className="mx-3 mb-3 rounded-2xl border border-border bg-background/85 p-1.5 shadow-glow backdrop-blur-xl">
            <div className="grid grid-cols-5 gap-1">
              {BOTTOM_NAV.map((item) => {
                const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] font-semibold transition-all ${
                      active ? "bg-gradient-brand text-white shadow-glow" : "text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <item.icon className="h-4 w-4" strokeWidth={2.4} />
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

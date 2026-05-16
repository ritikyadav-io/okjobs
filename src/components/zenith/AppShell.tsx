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
  Search,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

type NavItem = { to: string; label: string; icon: LucideIcon; color: string };

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: Home, color: "text-primary" },
  { to: "/jobs", label: "Jobs", icon: Briefcase, color: "text-cyan" },
  { to: "/applications", label: "Applications", icon: ClipboardList, color: "text-secondary" },
  { to: "/resume-lab", label: "Resume Lab", icon: FileText, color: "text-gold" },
  { to: "/recruiter-inbox", label: "Recruiter Inbox", icon: Inbox, color: "text-success" },
  { to: "/calendar", label: "Calendar", icon: Calendar, color: "text-cyan" },
  { to: "/briefing", label: "Daily Briefing", icon: Sunrise, color: "text-gold" },
  { to: "/settings", label: "Settings", icon: Settings, color: "text-muted-foreground" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading, profile, signOut } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user, nav]);

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

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar p-4 md:flex">
        <Link to="/dashboard" className="mb-6 px-2">
          <Logo />
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  active
                    ? "bg-gradient-brand text-white shadow-glow"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <item.icon className={`h-4 w-4 ${active ? "text-white" : item.color}`} strokeWidth={2.4} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-warm font-bold text-white">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{displayName}</div>
              <div className="truncate text-xs text-muted-foreground">{profile?.plan || "Free"} plan</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-accent"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
          <Link to="/dashboard" className="md:hidden">
            <Logo />
          </Link>
          <div className="relative ml-auto w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search jobs, companies, applications…"
              className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
          <button
            aria-label="Notifications"
            className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-card hover:bg-accent"
          >
            <Bell className="h-4 w-4" />
          </button>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

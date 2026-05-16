import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/zenith/AppShell";
import { PageHeader } from "@/components/zenith/PageHeader";
import { Video, MapPin, CheckSquare, Square } from "lucide-react";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Zenith" }, { name: "description", content: "Interviews synced from Gmail to Google Calendar with prep checklists." }] }),
  component: CalendarPage,
});

const INTERVIEWS = [
  { company: "Linear", role: "Frontend Engineer", when: "Tomorrow · 3:00 PM IST", type: "Technical", color: "from-primary to-cyan", in: "23h" },
  { company: "Stripe", role: "Frontend Engineer", when: "Fri · 11:30 AM IST", type: "HR Screen", color: "from-primary to-secondary", in: "3d" },
  { company: "Vercel", role: "Full-Stack Engineer", when: "Next Mon · 5:00 PM IST", type: "Final", color: "from-secondary to-gold", in: "6d" },
];

const PREP = ["Research company", "Prepare 3 questions", "Test meeting link", "Review resume", "Review job description"];

function CalendarPage() {
  // simple month grid (no real dates wiring)
  const days = Array.from({ length: 35 }, (_, i) => i - 2); // -2..32
  const eventDays = new Set([4, 7, 12]);
  return (
    <AppShell>
      <PageHeader title="Calendar" description="Synced to Google Calendar with prep checklists." />
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Month grid */}
        <div className="rounded-2xl border-2 border-border bg-card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold">May 2026</h3>
            <div className="flex gap-1">
              <button className="rounded-md border border-border px-2 text-sm">‹</button>
              <button className="rounded-md border border-border px-2 text-sm">›</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted-foreground">
            {"S M T W T F S".split(" ").map((d, i) => <div key={i} className="py-1">{d}</div>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              const valid = d >= 1 && d <= 31;
              const hasEvent = valid && eventDays.has(d);
              return (
                <div key={i} className={`aspect-square rounded-lg p-1.5 text-xs ${valid ? "border border-border bg-background" : "opacity-30"} ${hasEvent ? "border-primary bg-primary/10" : ""}`}>
                  {valid && <span className={`font-semibold ${hasEvent ? "text-primary" : ""}`}>{d}</span>}
                  {hasEvent && <div className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-brand" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming */}
        <div className="space-y-4">
          {INTERVIEWS.map((iv) => (
            <div key={iv.company} className="rounded-2xl border-2 border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${iv.color} font-bold text-white`}>{iv.company[0]}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold">{iv.company} · {iv.type}</div>
                  <div className="truncate text-xs text-muted-foreground">{iv.role}</div>
                </div>
                <span className="rounded-full bg-cyan/15 px-2 py-0.5 text-[11px] font-bold text-cyan">in {iv.in}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Video className="h-3 w-3" /> Google Meet</span>
                <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {iv.when}</span>
              </div>
              <div className="mt-3 space-y-1.5">
                {PREP.map((p, i) => (
                  <div key={p} className="flex items-center gap-2 text-xs">
                    {i < 2 ? <CheckSquare className="h-4 w-4 text-success" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                    <span className={i < 2 ? "line-through text-muted-foreground" : ""}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

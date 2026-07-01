import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/single-user";
import {
  logConnectorRun,
  verifyConnectorGateway,
  verifyFirecrawl,
  syncRecruiterEmailsForUser,
  scrapeJobsForUser,
  syncCalendarForUser,
  scheduleFollowupRemindersForUser,
  sendBriefingForUser,
} from "@/lib/automation.server";

const CONNECTORS = ["supabase", "gmail", "calendar", "docs", "sheets", "resend", "firecrawl"] as const;
type ConnectorName = typeof CONNECTORS[number];

export const listConnectorRuns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("connector_runs")
      .select("*")
      .eq("user_id", context.userId)
      .order("ran_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { runs: data ?? [] };
  });

export const verifyConnector = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ name: z.enum(CONNECTORS) }).parse(input))
  .handler(async ({ data, context }) => {
    return logConnectorRun(context.supabase as any, context.userId, data.name, "verify", async () => {
      const n: ConnectorName = data.name;
      if (n === "supabase") {
        const { error } = await context.supabase.from("profiles").select("id").eq("id", context.userId).maybeSingle();
        if (error) throw new Error(error.message);
        return { message: "database reachable" };
      }
      if (n === "firecrawl") {
        const r = await verifyFirecrawl();
        if (!r.ok) throw new Error(r.message);
        return { message: r.message };
      }
      const keyMap: Record<Exclude<ConnectorName, "supabase" | "firecrawl">, string> = {
        gmail: "GOOGLE_MAIL_API_KEY",
        calendar: "GOOGLE_CALENDAR_API_KEY",
        docs: "GOOGLE_DOCS_API_KEY",
        sheets: "GOOGLE_SHEETS_API_KEY",
        resend: "RESEND_API_KEY",
      };
      const r = await verifyConnectorGateway(keyMap[n]);
      if (!r.ok) throw new Error(r.message);
      return { message: r.message };
    });
  });

export const runConnectorNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ name: z.enum(["gmail", "scrape_jobs", "calendar", "briefing"]) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    return logConnectorRun(supabase as any, userId, data.name === "scrape_jobs" ? "firecrawl" : data.name, "run", async () => {
      if (data.name === "gmail") {
        const r = await syncRecruiterEmailsForUser(supabase as any, userId);
        return { message: `scanned ${r.scanned}, added ${r.added}` };
      }
      if (data.name === "scrape_jobs") {
        const r = await scrapeJobsForUser(supabase as any, userId, undefined, 60);
        return { message: `scanned ${r.scanned}, inserted ${r.inserted}, updated ${r.updated}` };
      }
      if (data.name === "calendar") {
        const cal = await syncCalendarForUser(supabase as any, userId);
        const fu = await scheduleFollowupRemindersForUser(supabase as any, userId);
        return { message: `calendar +${cal.added}, follow-ups ${fu.scheduled}` };
      }
      if (data.name === "briefing") {
        await sendBriefingForUser(supabase as any, userId);
        return { message: "briefing sent" };
      }
      throw new Error("unknown");
    });
  });

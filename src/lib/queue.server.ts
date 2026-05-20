import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  scrapeJobsForUser,
  syncRecruiterEmailsForUser,
  syncCalendarForUser,
  scheduleFollowupRemindersForUser,
  sendBriefingForUser,
} from "@/lib/automation.server";
import { syncAllApplicationsToSheet } from "@/lib/sheets.functions";

export const QUEUE_TASKS = [
  "scrape_jobs",
  "gmail_sync",
  "calendar_sync",
  "sheets_sync",
  "daily_briefing",
  "followup_reminders",
] as const;
export type QueueTask = typeof QUEUE_TASKS[number];

const BACKOFF_MS = [10_000, 30_000, 120_000, 300_000, 900_000]; // 10s, 30s, 2m, 5m, 15m

function nextBackoffIso(attempts: number) {
  const ms = BACKOFF_MS[Math.min(attempts, BACKOFF_MS.length - 1)];
  return new Date(Date.now() + ms).toISOString();
}

async function runTask(task: string, userId: string, payload: any) {
  switch (task as QueueTask) {
    case "scrape_jobs":
      return scrapeJobsForUser(supabaseAdmin, userId, payload?.query, payload?.limit ?? 60);
    case "gmail_sync":
      return syncRecruiterEmailsForUser(supabaseAdmin, userId);
    case "calendar_sync": {
      const cal = await syncCalendarForUser(supabaseAdmin, userId);
      const fu = await scheduleFollowupRemindersForUser(supabaseAdmin, userId);
      return { calendar: cal, followups: fu };
    }
    case "sheets_sync":
      return syncAllApplicationsToSheet(supabaseAdmin as any, userId);
    case "daily_briefing":
      return sendBriefingForUser(supabaseAdmin, userId);
    case "followup_reminders":
      return scheduleFollowupRemindersForUser(supabaseAdmin, userId);
    default:
      throw new Error(`Unknown task: ${task}`);
  }
}

/** Atomically claim up to N pending+ready jobs and mark them running. */
async function claimJobs(limit: number) {
  const { data, error } = await supabaseAdmin.rpc("claim_queue_jobs" as any, { p_limit: limit });
  if (!error && data) return data as any[];

  // Fallback path (no RPC): SELECT then UPDATE per-row guarded on status=pending.
  const nowIso = new Date().toISOString();
  const { data: candidates } = await supabaseAdmin
    .from("job_queue")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_for", nowIso)
    .order("priority", { ascending: false })
    .order("scheduled_for", { ascending: true })
    .limit(limit);

  const claimed: any[] = [];
  for (const row of candidates ?? []) {
    const { data: upd } = await supabaseAdmin
      .from("job_queue")
      .update({ status: "running", started_at: new Date().toISOString(), attempts: row.attempts + 1 })
      .eq("id", row.id)
      .eq("status", "pending")
      .select()
      .single();
    if (upd) claimed.push(upd);
  }
  return claimed;
}

export async function processNext(maxJobs = 5) {
  const claimed = await claimJobs(maxJobs);
  const results: { id: string; task: string; ok: boolean; error?: string }[] = [];

  for (const job of claimed) {
    try {
      const result = await runTask(job.task, job.user_id, job.payload ?? {});
      await supabaseAdmin
        .from("job_queue")
        .update({
          status: "done",
          progress: 100,
          finished_at: new Date().toISOString(),
          result: (result ?? {}) as any,
          last_error: null,
        })
        .eq("id", job.id);
      results.push({ id: job.id, task: job.task, ok: true });
    } catch (err: any) {
      const message = err?.message ?? String(err);
      const attempts = job.attempts; // already incremented at claim
      const giveUp = attempts >= job.max_attempts;
      await supabaseAdmin
        .from("job_queue")
        .update({
          status: giveUp ? "dlq" : "pending",
          last_error: message.slice(0, 1000),
          scheduled_for: giveUp ? job.scheduled_for : nextBackoffIso(attempts),
          started_at: null,
          finished_at: giveUp ? new Date().toISOString() : null,
        })
        .eq("id", job.id);
      results.push({ id: job.id, task: job.task, ok: false, error: message });
    }
  }
  return { claimed: claimed.length, results };
}

export async function enqueueAdmin(userId: string, task: QueueTask, payload: Record<string, unknown> = {}) {
  const { data, error } = await supabaseAdmin
    .from("job_queue")
    .insert({ user_id: userId, task, payload, status: "pending", scheduled_for: new Date().toISOString() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

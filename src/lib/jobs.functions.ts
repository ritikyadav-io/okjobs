import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { scrapeJobsForUser } from "@/lib/automation.server";

export const scrapeJobs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ query: z.string().min(1).max(200), limit: z.number().int().min(1).max(25).optional() }).parse(input))
  .handler(async ({ data, context }) => scrapeJobsForUser(context.supabase as any, context.userId, data.query, data.limit ?? 15));

export const listJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("created_by", userId)
      .order("ats_score", { ascending: false })
      .limit(80);
    if (error) throw new Error(error.message);
    return { jobs: data ?? [] };
  });

export const saveJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ jobId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: job, error: je } = await supabase.from("jobs").select("*").eq("id", data.jobId).eq("created_by", userId).maybeSingle();
    if (je || !job) throw new Error("Job not found");
    const { error } = await supabase.from("applications").insert({
      user_id: userId,
      job_id: job.id,
      company: job.company,
      title: job.title,
      status: "Saved",
      ats_score: job.ats_score ?? 0,
      followup_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { QUEUE_TASKS } from "@/lib/queue.server";

const TaskEnum = z.enum(QUEUE_TASKS);

export const enqueueTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      task: TaskEnum,
      payload: z.record(z.string(), z.unknown()).optional(),
      priority: z.number().int().min(0).max(10).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("job_queue")
      .insert({
        user_id: userId,
        task: data.task,
        payload: data.payload ?? {},
        priority: data.priority ?? 0,
        status: "pending",
        scheduled_for: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { job: row };
  });

export const listQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("job_queue")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { jobs: data ?? [] };
  });

export const retryQueueJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("job_queue")
      .update({
        status: "pending",
        attempts: 0,
        scheduled_for: new Date().toISOString(),
        last_error: null,
        started_at: null,
        finished_at: null,
        cancelled_at: null,
        progress: 0,
      })
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const cancelQueueJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("job_queue")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", userId)
      .in("status", ["pending"]);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const clearQueueDlq = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("job_queue")
      .delete()
      .eq("user_id", userId)
      .eq("status", "dlq");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

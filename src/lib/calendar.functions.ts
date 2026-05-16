import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { syncCalendarForUser, scheduleFollowupRemindersForUser } from "@/lib/automation.server";

export const listEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId)
      .gte("starts_at", new Date().toISOString())
      .ilike("title", "%interview%")
      .order("starts_at", { ascending: true });
    if (error) throw new Error(error.message);
    return { events: data ?? [] };
  });

export const syncCalendar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const calendar = await syncCalendarForUser(context.supabase as any, context.userId);
    const followups = await scheduleFollowupRemindersForUser(context.supabase as any, context.userId);
    return { ...calendar, followups: followups.scheduled };
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CAL_GW = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";

function gwHeaders() {
  const lk = process.env.LOVABLE_API_KEY;
  const gk = process.env.GOOGLE_CALENDAR_API_KEY;
  if (!lk) throw new Error("LOVABLE_API_KEY missing");
  if (!gk) throw new Error("Google Calendar not connected");
  return { Authorization: `Bearer ${lk}`, "X-Connection-Api-Key": gk, "Content-Type": "application/json" };
}

export const listEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .order("starts_at", { ascending: true });
    if (error) throw new Error(error.message);
    return { events: data ?? [] };
  });

export const syncCalendar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const headers = gwHeaders();
    const timeMin = new Date().toISOString();
    const res = await fetch(`${CAL_GW}/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&maxResults=50&singleEvents=true&orderBy=startTime`, { headers });
    if (!res.ok) throw new Error(`Calendar fetch failed: ${res.status}`);
    const json = await res.json();
    const items = json.items ?? [];
    let added = 0;
    for (const ev of items) {
      const starts = ev.start?.dateTime ?? ev.start?.date;
      const ends = ev.end?.dateTime ?? ev.end?.date;
      if (!starts) continue;
      const { data: existing } = await supabase.from("calendar_events").select("id").eq("user_id", userId).eq("google_event_id", ev.id).maybeSingle();
      if (existing) continue;
      await supabase.from("calendar_events").insert({
        user_id: userId,
        title: ev.summary ?? "(no title)",
        starts_at: new Date(starts).toISOString(),
        ends_at: ends ? new Date(ends).toISOString() : null,
        google_event_id: ev.id,
      });
      added++;
    }
    return { added, scanned: items.length };
  });

export const createEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      title: z.string().min(1).max(200),
      starts_at: z.string(),
      ends_at: z.string().optional(),
      application_id: z.string().uuid().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("calendar_events").insert({
      user_id: userId,
      title: data.title,
      starts_at: data.starts_at,
      ends_at: data.ends_at ?? null,
      application_id: data.application_id,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

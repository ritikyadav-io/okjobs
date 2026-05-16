import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const RESEND_GW = "https://connector-gateway.lovable.dev/resend";

async function buildBriefingData(supabase: any, userId: string) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [profile, newJobs, replies, followups, interviews, apps] = await Promise.all([
    supabase.from("profiles").select("full_name, email").eq("id", userId).maybeSingle(),
    supabase.from("jobs").select("title, company, ats_score").gte("scraped_at", since).order("ats_score", { ascending: false }).limit(5),
    supabase.from("recruiter_emails").select("company, subject, type").gte("received_at", since).eq("user_id", userId).limit(5),
    supabase.from("applications").select("company, followup_date").eq("user_id", userId).eq("followup_sent", false).not("followup_date", "is", null).limit(5),
    supabase.from("calendar_events").select("title, starts_at").eq("user_id", userId).gte("starts_at", new Date().toISOString()).order("starts_at").limit(5),
    supabase.from("applications").select("status, ats_score").eq("user_id", userId),
  ]);
  const total = apps.data?.length ?? 0;
  const replyCount = apps.data?.filter((a: any) => ["Interview Scheduled", "OA Received", "Offer Received"].includes(a.status)).length ?? 0;
  const avgAts = total ? Math.round((apps.data ?? []).reduce((s: number, a: any) => s + (a.ats_score ?? 0), 0) / total) : 0;
  return {
    name: profile.data?.full_name ?? "there",
    email: profile.data?.email,
    newJobs: newJobs.data ?? [],
    replies: replies.data ?? [],
    followups: followups.data ?? [],
    interviews: interviews.data ?? [],
    stats: { applied: total, responseRate: total ? Math.round((replyCount / total) * 100) : 0, avgAts },
  };
}

export const generateBriefing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const data = await buildBriefingData(supabase, userId);
    await supabase.from("daily_briefings").insert({
      user_id: userId,
      date: new Date().toISOString().slice(0, 10),
      data,
    });
    return data;
  });

export const getLatestBriefing = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("daily_briefings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) return { briefing: data };
    const fresh = await buildBriefingData(supabase, userId);
    const { data: row } = await supabase.from("daily_briefings").insert({
      user_id: userId, date: new Date().toISOString().slice(0, 10), data: fresh,
    }).select().single();
    return { briefing: row };
  });

function briefingHtml(d: any): string {
  const items = (arr: any[], fmt: (x: any) => string) =>
    arr.length ? arr.map((x) => `<li>${fmt(x)}</li>`).join("") : "<li style='color:#888'>Nothing here today</li>";
  return `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;background:#0a0a0f;color:#e5e7eb;padding:24px">
  <div style="max-width:600px;margin:0 auto;background:#13131a;border-radius:16px;padding:24px;border:1px solid #2a2a35">
    <div style="font-size:11px;font-weight:800;color:#FFB800;letter-spacing:3px">ZENITH DAILY EDITION</div>
    <h1 style="margin:8px 0 16px;font-size:28px">Good morning, ${d.name}</h1>
    <p style="color:#94a3b8;margin:0 0 20px">Here's what moved on your job search.</p>
    <h2 style="font-size:16px;margin:20px 0 8px">New jobs (${d.newJobs.length})</h2>
    <ul>${items(d.newJobs, (j: any) => `<b>${j.title}</b> at ${j.company} — ${j.ats_score}% match`)}</ul>
    <h2 style="font-size:16px;margin:20px 0 8px">Recruiter replies (${d.replies.length})</h2>
    <ul>${items(d.replies, (r: any) => `<b>${r.company}</b>: ${r.subject} <span style="color:#5E6AD2">[${r.type}]</span>`)}</ul>
    <h2 style="font-size:16px;margin:20px 0 8px">Followups needed</h2>
    <ul>${items(d.followups, (f: any) => `${f.company} — due ${f.followup_date}`)}</ul>
    <h2 style="font-size:16px;margin:20px 0 8px">Upcoming interviews</h2>
    <ul>${items(d.interviews, (i: any) => `${i.title} — ${new Date(i.starts_at).toLocaleString()}`)}</ul>
    <div style="margin-top:24px;padding:16px;background:#0a0a0f;border-radius:12px;display:flex;gap:16px;justify-content:space-around;text-align:center">
      <div><div style="font-size:24px;font-weight:800">${d.stats.applied}</div><div style="font-size:11px;color:#94a3b8">APPLIED</div></div>
      <div><div style="font-size:24px;font-weight:800">${d.stats.responseRate}%</div><div style="font-size:11px;color:#94a3b8">RESPONSE</div></div>
      <div><div style="font-size:24px;font-weight:800">${d.stats.avgAts}%</div><div style="font-size:11px;color:#94a3b8">AVG ATS</div></div>
    </div>
    <div style="margin-top:24px;padding:16px;background:linear-gradient(135deg,#5E6AD2,#00C8FF);border-radius:12px;text-align:center;color:#fff">
      Keep going. You're doing great. 💪
    </div>
  </div></body></html>`;
}

export const sendBriefingEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const data = await buildBriefingData(supabase, userId);
    if (!data.email) throw new Error("No email on profile");
    const lk = process.env.LOVABLE_API_KEY;
    const rk = process.env.RESEND_API_KEY;
    if (!lk || !rk) throw new Error("Email service not configured");
    const res = await fetch(`${RESEND_GW}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lk}`,
        "X-Connection-Api-Key": rk,
      },
      body: JSON.stringify({
        from: "Zenith <onboarding@resend.dev>",
        to: [data.email],
        subject: `Your Zenith briefing — ${new Date().toLocaleDateString()}`,
        html: briefingHtml(data),
      }),
    });
    if (!res.ok) throw new Error(`Resend failed [${res.status}]: ${(await res.text()).slice(0, 300)}`);
    await supabase.from("daily_briefings").insert({
      user_id: userId,
      date: new Date().toISOString().slice(0, 10),
      data,
      sent_at: new Date().toISOString(),
    });
    return { ok: true };
  });

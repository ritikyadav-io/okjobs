import { supabaseAdmin } from "@/integrations/supabase/client.server";

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const GMAIL_GW = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";
const CAL_GW = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";
const DOCS_GW = "https://connector-gateway.lovable.dev/google_docs/v1";
const RESEND_GW = "https://connector-gateway.lovable.dev/resend";

const RECRUITER_QUERY = 'newer_than:30d (interview OR application OR offer OR rejected OR "next steps" OR schedule OR assessment OR OA OR recruiter OR hiring OR talent OR careers)';
const JOB_SITE_GROUPS = [
  ["site:linkedin.com/jobs", "site:indeed.com", "site:glassdoor.com/job"],
  ["site:naukri.com", "site:internshala.com", "site:hirist.com", "site:instahyre.com", "site:cutshort.io"],
  ["site:wellfound.com/jobs", "site:ycombinator.com/jobs", "site:remoteok.com", "site:weworkremotely.com", "site:remote.co"],
  ["site:monster.com", "site:foundit.in", "site:shine.com", "site:jobstreet.com"],
];
const TARGET_COMPANY_GROUPS = [
  ["site:careers.microsoft.com", "site:amazon.jobs", "site:careers.google.com", "site:metacareers.com"],
  ["site:tcs.com/careers", "site:careers.wipro.com", "site:infosys.com/careers", "site:careers.cognizant.com"],
  ["site:rippling.com/careers", "site:databricks.com/company/careers", "site:cred.club/careers", "site:walmart.com/careers"],
];
const ACTIVE_STATUSES = ["Saved", "Applying", "Applied", "OA Received", "Interview Scheduled"];

type Db = typeof supabaseAdmin;
type RecruiterType = "Interview Invite" | "Rejection" | "Follow-up Request" | "Offer" | "Assessment" | "Application Update";

export type BriefingData = {
  name: string;
  email: string | null;
  newJobs: any[];
  replies: any[];
  followups: any[];
  interviews: any[];
  weakSpots: string[];
  stats: { applied: number; responseRate: number; avgAts: number };
};

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function gatewayHeaders(connectorKey: string) {
  return {
    Authorization: `Bearer ${env("LOVABLE_API_KEY")}`,
    "X-Connection-Api-Key": env(connectorKey),
    "Content-Type": "application/json",
  };
}

function decodeB64Url(s: string): string {
  try {
    const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
    return Buffer.from((s + pad).replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
  } catch {
    return "";
  }
}

function extractBody(payload: any): string {
  let body = "";
  const walk = (part: any) => {
    if (!part) return;
    if (part.mimeType === "text/plain" && part.body?.data) body += decodeB64Url(part.body.data) + "\n";
    if (!body && part.body?.data) body += decodeB64Url(part.body.data) + "\n";
    if (Array.isArray(part.parts)) part.parts.forEach(walk);
  };
  walk(payload);
  return body.replace(/\u0000/g, "").slice(0, 12000);
}

export function classifyRecruiterEmail(subject: string, body: string): RecruiterType {
  const text = `${subject}\n${body}`.toLowerCase();
  if (/\boffer\b|offer letter|congratulations|pleased to offer/.test(text)) return "Offer";
  if (/unfortunately|not moving forward|other candidates|we regret|decided not to|not be proceeding|rejected/.test(text)) return "Rejection";
  if (/assessment|take[- ]?home|online test|\boa\b|coding challenge|hackerrank|codility/.test(text)) return "Assessment";
  if (/interview|schedule.*(call|chat|meeting)|invite.*(chat|call)|availability|calendar invite|google meet|zoom/.test(text)) return "Interview Invite";
  if (/next steps|application update|thanks for applying|received your application|under review/.test(text)) return "Application Update";
  return "Follow-up Request";
}

function extractEmailAddress(from: string) {
  const match = from.match(/<([^>]+)>/) ?? from.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return (match?.[1] ?? match?.[0] ?? from).trim().toLowerCase();
}

function extractSenderName(from: string) {
  const clean = from.replace(/<[^>]+>/g, "").replace(/[\"']/g, "").trim();
  return clean || "there";
}

function extractCompany(from: string, subject: string) {
  const address = extractEmailAddress(from);
  const domain = address.split("@")[1] ?? "";
  const name = domain.split(".")[0] || subject.split(/\s+/)[0] || "Unknown";
  return name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 80);
}

function isInterviewText(text: string) {
  return /interview|screening|recruiter call|hiring manager|technical round|onsite|phone screen|zoom|google meet|teams meeting/i.test(text);
}

function parseLikelyDate(text: string): Date | null {
  const lower = text.toLowerCase();
  const now = new Date();
  if (/tomorrow/.test(lower)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return applyTime(d, text);
  }
  const weekday = lower.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  if (weekday) {
    const names = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const target = names.indexOf(weekday[1]);
    const d = new Date(now);
    const add = (target - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + add);
    d.setHours(10, 0, 0, 0);
    return applyTime(d, text);
  }
  const explicit = text.match(/\b(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?\b/);
  if (explicit) {
    const day = Number(explicit[1]);
    const month = Number(explicit[2]) - 1;
    const year = explicit[3] ? Number(explicit[3].length === 2 ? `20${explicit[3]}` : explicit[3]) : now.getFullYear();
    const d = new Date(year, month, day, 10, 0, 0, 0);
    return Number.isNaN(d.getTime()) ? null : applyTime(d, text);
  }
  return null;
}

function applyTime(date: Date, text: string) {
  const match = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)\b/);
  if (!match) return date;
  let hours = Number(match[1]);
  const mins = Number(match[2] ?? 0);
  const meridian = match[3].toLowerCase();
  if (meridian === "pm" && hours < 12) hours += 12;
  if (meridian === "am" && hours === 12) hours = 0;
  date.setHours(hours, mins, 0, 0);
  return date;
}

function eventEnd(start: Date, minutes = 45) {
  return new Date(start.getTime() + minutes * 60 * 1000);
}

async function createGoogleCalendarEvent(input: { title: string; startsAt: Date; endsAt?: Date; description?: string }) {
  const res = await fetch(`${CAL_GW}/calendars/primary/events`, {
    method: "POST",
    headers: gatewayHeaders("GOOGLE_CALENDAR_API_KEY"),
    body: JSON.stringify({
      summary: input.title,
      description: input.description,
      start: { dateTime: input.startsAt.toISOString() },
      end: { dateTime: (input.endsAt ?? eventEnd(input.startsAt)).toISOString() },
    }),
  });
  if (!res.ok) throw new Error(`Google Calendar create failed [${res.status}]: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

async function markGmailRead(messageId: string) {
  const res = await fetch(`${GMAIL_GW}/users/me/messages/${messageId}/modify`, {
    method: "POST",
    headers: gatewayHeaders("GOOGLE_MAIL_API_KEY"),
    body: JSON.stringify({ removeLabelIds: ["UNREAD"] }),
  });
  if (!res.ok && res.status !== 403) throw new Error(`Gmail mark-read failed [${res.status}]: ${(await res.text()).slice(0, 300)}`);
}

async function updateApplicationFromEmail(db: Db, userId: string, email: any) {
  const company = email.company as string;
  const nextStatus = email.type === "Interview Invite"
    ? "Interview Scheduled"
    : email.type === "Offer"
      ? "Offer Received"
      : email.type === "Rejection"
        ? "Rejected"
        : email.type === "Assessment"
          ? "OA Received"
          : null;
  if (!nextStatus) return;

  const { data: app } = await db
    .from("applications")
    .select("id, title, company")
    .eq("user_id", userId)
    .ilike("company", `%${company}%`)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!app) return;

  const interviewAt = email.type === "Interview Invite" ? parseLikelyDate(`${email.subject}\n${email.body ?? ""}`) : null;
  await db.from("applications").update({
    status: nextStatus,
    ...(interviewAt ? { interview_at: interviewAt.toISOString() } : {}),
  }).eq("id", app.id).eq("user_id", userId);
}

async function maybeCreateInterviewEvent(db: Db, userId: string, email: any) {
  if (email.type !== "Interview Invite") return;
  const start = parseLikelyDate(`${email.subject}\n${email.body ?? ""}`);
  if (!start) return;
  const title = `Interview: ${email.company}`;
  const { data: existing } = await db
    .from("calendar_events")
    .select("id")
    .eq("user_id", userId)
    .eq("title", title)
    .eq("starts_at", start.toISOString())
    .maybeSingle();
  if (existing) return;

  let googleEventId: string | null = null;
  try {
    const event = await createGoogleCalendarEvent({ title, startsAt: start, description: `Created from recruiter email: ${email.subject}` });
    googleEventId = event.id ?? null;
  } catch (error) {
    console.warn("Calendar event creation skipped", error);
  }

  await db.from("calendar_events").insert({
    user_id: userId,
    title,
    starts_at: start.toISOString(),
    ends_at: eventEnd(start).toISOString(),
    google_event_id: googleEventId,
  });
}

export async function getConnectedGmailEmail(): Promise<string | null> {
  try {
    const res = await fetch(`${GMAIL_GW}/users/me/profile`, { headers: gatewayHeaders("GOOGLE_MAIL_API_KEY") });
    if (!res.ok) return null;
    const data = await res.json();
    return data.emailAddress?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

export async function syncRecruiterEmailsForUser(db: Db, userId: string) {
  const headers = gatewayHeaders("GOOGLE_MAIL_API_KEY");
  // Paginate the broader 60-day window so we can reconcile deletes accurately.
  const presentIds = new Set<string>();
  let pageToken: string | undefined;
  let pages = 0;
  do {
    const url = `${GMAIL_GW}/users/me/messages?maxResults=100&q=${encodeURIComponent(RECRUITER_QUERY)}${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const listRes = await fetch(url, { headers });
    if (!listRes.ok) throw new Error(`Gmail list failed [${listRes.status}]: ${(await listRes.text()).slice(0, 300)}`);
    const list = await listRes.json();
    for (const m of list.messages ?? []) if (m?.id) presentIds.add(m.id);
    pageToken = list.nextPageToken;
    pages++;
  } while (pageToken && pages < 5);

  const ids = Array.from(presentIds);
  let added = 0;
  let classified = 0;

  for (const id of ids) {
    const { data: existing } = await db.from("recruiter_emails").select("id").eq("user_id", userId).eq("gmail_message_id", id).maybeSingle();
    if (existing) continue;

    const msgRes = await fetch(`${GMAIL_GW}/users/me/messages/${id}?format=full`, { headers });
    if (!msgRes.ok) continue;
    const msg = await msgRes.json();
    const hdrs: Record<string, string> = {};
    for (const h of msg.payload?.headers ?? []) hdrs[String(h.name).toLowerCase()] = h.value;
    const subject = hdrs.subject ?? "(no subject)";
    const sender = hdrs.from ?? "";
    const body = extractBody(msg.payload);
    const type = classifyRecruiterEmail(subject, body);
    const company = extractCompany(sender, subject);
    const receivedAt = new Date(Number(msg.internalDate) || Date.now()).toISOString();
    const row = {
      user_id: userId,
      gmail_message_id: id,
      company,
      sender,
      subject,
      body,
      preview: body.replace(/\s+/g, " ").trim().slice(0, 240) || msg.snippet || "",
      type,
      reply_status: "unread",
      received_at: receivedAt,
    };

    const { data: saved, error } = await db.from("recruiter_emails").insert(row).select().single();
    if (error) {
      if (!/duplicate/i.test(error.message)) throw new Error(error.message);
      continue;
    }
    classified++;
    added++;
    await updateApplicationFromEmail(db, userId, saved);
    await maybeCreateInterviewEvent(db, userId, saved);
    try { await markGmailRead(id); } catch (error) { console.warn("Gmail read update skipped", error); }
  }

  // Reconcile deletes: any local row whose gmail_message_id isn't in the current Gmail list is gone.
  let removed = 0;
  const { data: locals } = await db
    .from("recruiter_emails")
    .select("id, gmail_message_id")
    .eq("user_id", userId)
    .not("gmail_message_id", "is", null);
  const stale = (locals ?? []).filter((r: any) => r.gmail_message_id && !presentIds.has(r.gmail_message_id));
  if (stale.length) {
    const staleIds = stale.map((r: any) => r.id);
    const { error: delErr } = await db.from("recruiter_emails").delete().in("id", staleIds);
    if (!delErr) removed = staleIds.length;
  }

  return { scanned: ids.length, classified, added, removed };
}


export async function syncRecruiterEmailsForConnectedProfile() {
  const email = await getConnectedGmailEmail();
  if (!email) return { users: 0, scanned: 0, added: 0 };
  const { data: profile } = await supabaseAdmin.from("profiles").select("id").ilike("email", email).maybeSingle();
  if (!profile?.id) return { users: 0, scanned: 0, added: 0 };
  const result = await syncRecruiterEmailsForUser(supabaseAdmin, profile.id);
  await scheduleFollowupRemindersForUser(supabaseAdmin, profile.id);
  return { users: 1, ...result };
}

export async function syncCalendarForUser(db: Db, userId: string) {
  const timeMin = new Date().toISOString();
  const res = await fetch(`${CAL_GW}/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&maxResults=100&singleEvents=true&orderBy=startTime`, {
    headers: gatewayHeaders("GOOGLE_CALENDAR_API_KEY"),
  });
  if (!res.ok) throw new Error(`Calendar fetch failed [${res.status}]: ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  const items = json.items ?? [];
  let added = 0;

  for (const ev of items) {
    const text = `${ev.summary ?? ""}\n${ev.description ?? ""}`;
    if (!isInterviewText(text)) continue;
    const starts = ev.start?.dateTime ?? ev.start?.date;
    if (!starts) continue;
    const ends = ev.end?.dateTime ?? ev.end?.date;
    const { data: existing } = await db.from("calendar_events").select("id").eq("user_id", userId).eq("google_event_id", ev.id).maybeSingle();
    if (existing) continue;

    await db.from("calendar_events").insert({
      user_id: userId,
      title: ev.summary ?? "Interview",
      starts_at: new Date(starts).toISOString(),
      ends_at: ends ? new Date(ends).toISOString() : null,
      google_event_id: ev.id,
    });
    added++;

    const companyWord = String(ev.summary ?? "").split(/[-:|]/).pop()?.trim();
    if (companyWord) {
      await db.from("applications").update({ status: "Interview Scheduled", interview_at: new Date(starts).toISOString() })
        .eq("user_id", userId)
        .ilike("company", `%${companyWord}%`)
        .in("status", ACTIVE_STATUSES);
    }
  }
  return { scanned: items.length, added };
}

function computeAts(text: string, skills: string[]) {
  const lower = text.toLowerCase();
  const matched = skills.filter((skill) => skill && lower.includes(skill.toLowerCase()));
  const missing = skills.filter((skill) => skill && !lower.includes(skill.toLowerCase()));
  const score = skills.length ? Math.round(35 + (matched.length / skills.length) * 60) : 55;
  return { score: Math.max(0, Math.min(99, score)), matched, missing };
}

function recommendation(score: number) {
  if (score >= 80) return "Strong Apply";
  if (score >= 60) return "Apply";
  return "Skip";
}

function platformFromUrl(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host.split(".").slice(-2).join(".");
  } catch {
    return "Job board";
  }
}

function companyFromResult(result: any, url: string) {
  const title = String(result.title ?? "");
  const atMatch = title.match(/\bat\s+([^|–—-]{2,70})/i);
  if (atMatch) return atMatch[1].trim();
  const source = platformFromUrl(url).split(".")[0];
  return source.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function firecrawlSearch(apiKey: string, query: string, limit: number) {
  const res = await fetch("https://api.firecrawl.dev/v2/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ query, limit, scrapeOptions: { formats: ["markdown"], onlyMainContent: true } }),
  });
  if (!res.ok) throw new Error(`Firecrawl [${res.status}]: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  return (json?.data?.web ?? json?.web ?? json?.data ?? []) as any[];
}

export async function scrapeJobsForUser(db: Db, userId: string, query?: string, limit = 60) {
  const apiKey = env("FIRECRAWL_API_KEY");
  const { data: profile } = await db.from("profiles").select("resume_skills, preferred_role").eq("id", userId).maybeSingle();
  const skills = ((profile?.resume_skills as string[] | null) ?? []).filter(Boolean);
  const role = (query || profile?.preferred_role || skills.slice(0, 3).join(" ") || "software engineer").trim();
  const wantsIntern = /intern/i.test(role);

  // Build query variants (one per source group) and run in parallel.
  const groups = [...JOB_SITE_GROUPS, ...TARGET_COMPANY_GROUPS];
  const perGroup = Math.max(6, Math.ceil(limit / groups.length) + 2);
  const queries = groups.map((g) => `${role}${wantsIntern ? " internship" : ""} jobs (${g.join(" OR ")})`);
  const settled = await Promise.allSettled(queries.map((q) => firecrawlSearch(apiKey, q, perGroup)));
  const allResults: any[] = [];
  const seenUrls = new Set<string>();
  for (const r of settled) {
    if (r.status !== "fulfilled") continue;
    for (const item of r.value) {
      const url = item.url || item.link;
      if (!url || seenUrls.has(url)) continue;
      seenUrls.add(url);
      allResults.push(item);
    }
  }

  // Prune stale jobs for this user (older than 24h or not matching current role).
  await db.from("jobs").delete().eq("created_by", userId).lt("scraped_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const roleTokens = role.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  let inserted = 0;
  let updated = 0;

  for (const result of allResults) {
    const url = result.url || result.link;
    const title = String(result.title || "").slice(0, 220);
    const description = String(result.markdown || result.description || "").slice(0, 8000);
    const haystack = `${title} ${url} ${description}`.toLowerCase();
    if (!url || !title) continue;
    if (!/job|career|opening|engineer|developer|designer|manager|analyst|intern|scientist|product|marketing|sales|data|ml|ai/i.test(haystack)) continue;
    // Soft query relevance: at least one query token must appear in title/url/desc (skip when role is generic).
    if (roleTokens.length && !roleTokens.some((t) => haystack.includes(t))) continue;

    const ats = computeAts(`${title}\n${description}`, skills.length ? skills : roleTokens);
    const platform = platformFromUrl(url);
    const company = companyFromResult(result, url).slice(0, 160) || platform;
    const job = {
      title,
      company,
      url,
      source: platform,
      description,
      ats_score: ats.score,
      recommendation: recommendation(ats.score),
      competition: ats.score >= 82 ? "High" : ats.score >= 62 ? "Medium" : "Low",
      remote: /remote|work from home|wfh/i.test(haystack) ? "Remote" : null,
      location: result.location ?? null,
      salary: result.salary ?? null,
      posted_at: new Date().toISOString(),
      scraped_at: new Date().toISOString(),
      created_by: userId,
    };

    const { data: existing } = await db.from("jobs").select("id").eq("created_by", userId).eq("url", url).maybeSingle();
    if (existing?.id) {
      const { error } = await db.from("jobs").update(job).eq("id", existing.id).eq("created_by", userId);
      if (error) { console.error("[scrape] update failed", error.message); continue; }
      updated++;
    } else {
      const { error } = await db.from("jobs").upsert(job, { onConflict: "created_by,url", ignoreDuplicates: true });
      if (error) { console.error("[scrape] insert failed", error.message); continue; }
      inserted++;
    }
  }
  return { scanned: allResults.length, inserted, updated, query: role };
}

export async function scrapeJobsForAllProfiles() {
  const { data: profiles, error } = await supabaseAdmin.from("profiles").select("id, preferred_role");
  if (error) throw new Error(error.message);
  const summary = { users: 0, scanned: 0, inserted: 0, updated: 0 };
  for (const profile of profiles ?? []) {
    const result = await scrapeJobsForUser(supabaseAdmin, profile.id, profile.preferred_role ?? undefined, 15);
    summary.users++;
    summary.scanned += result.scanned;
    summary.inserted += result.inserted;
    summary.updated += result.updated;
  }
  return summary;
}

export async function scheduleFollowupRemindersForUser(db: Db, userId: string) {
  const { data: apps, error } = await db
    .from("applications")
    .select("id, company, title, applied_at, followup_date, status")
    .eq("user_id", userId)
    .eq("followup_sent", false)
    .in("status", ACTIVE_STATUSES);
  if (error) throw new Error(error.message);
  let scheduled = 0;
  for (const app of apps ?? []) {
    const base = app.followup_date ? new Date(`${app.followup_date}T09:00:00`) : new Date(app.applied_at ?? Date.now());
    if (!app.followup_date) base.setDate(base.getDate() + 5);
    base.setHours(9, 0, 0, 0);
    if (base < new Date()) base.setDate(new Date().getDate() + 1);
    const title = `Follow up: ${app.company} — ${app.title}`;
    const { data: existing } = await db.from("calendar_events").select("id").eq("user_id", userId).eq("title", title).maybeSingle();
    await db.from("applications").update({ followup_date: base.toISOString().slice(0, 10) }).eq("id", app.id).eq("user_id", userId);
    if (existing) continue;
    try {
      await createGoogleCalendarEvent({ title, startsAt: base, endsAt: eventEnd(base, 20), description: "OkJob follow-up reminder" });
      scheduled++;
    } catch (error) {
      console.warn("Follow-up Google Calendar reminder skipped", error);
    }
  }
  return { scheduled };
}

export async function buildBriefingData(db: Db, userId: string): Promise<BriefingData> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const today = new Date().toISOString().slice(0, 10);
  const [profile, newJobs, replies, followups, interviews, apps] = await Promise.all([
    db.from("profiles").select("full_name, email, resume_skills").eq("id", userId).maybeSingle(),
    db.from("jobs").select("title, company, ats_score, description").eq("created_by", userId).gte("scraped_at", since).order("ats_score", { ascending: false }).limit(6),
    db.from("recruiter_emails").select("company, subject, type, received_at").eq("user_id", userId).gte("received_at", since).order("received_at", { ascending: false }).limit(6),
    db.from("applications").select("company, title, followup_date").eq("user_id", userId).lte("followup_date", today).eq("followup_sent", false).not("status", "in", "(Rejected,Offer Received)").limit(6),
    db.from("calendar_events").select("title, starts_at").eq("user_id", userId).gte("starts_at", new Date().toISOString()).ilike("title", "%interview%").order("starts_at").limit(6),
    db.from("applications").select("status, ats_score").eq("user_id", userId),
  ]);
  const allApps = apps.data ?? [];
  const responseCount = allApps.filter((a: any) => ["Interview Scheduled", "OA Received", "Offer Received", "Rejected"].includes(a.status)).length;
  const avgAts = allApps.length ? Math.round(allApps.reduce((sum: number, a: any) => sum + (a.ats_score ?? 0), 0) / allApps.length) : 0;
  const skills = ((profile.data?.resume_skills as string[] | null) ?? []).filter(Boolean);
  const weakSpots = skills.length
    ? skills.filter((skill) => !(newJobs.data ?? []).some((job: any) => String(job.description ?? job.title).toLowerCase().includes(skill.toLowerCase()))).slice(0, 5)
    : [];
  return {
    name: profile.data?.full_name?.split(" ")[0] || "there",
    email: profile.data?.email ?? null,
    newJobs: newJobs.data ?? [],
    replies: replies.data ?? [],
    followups: followups.data ?? [],
    interviews: interviews.data ?? [],
    weakSpots,
    stats: { applied: allApps.length, responseRate: allApps.length ? Math.round((responseCount / allApps.length) * 100) : 0, avgAts },
  };
}

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]!));
}

export function briefingHtml(d: BriefingData) {
  const items = (arr: any[], fmt: (x: any) => string) => arr.length ? arr.map((x) => `<li>${fmt(x)}</li>`).join("") : "<li style='color:#94a3b8'>Nothing new yet</li>";
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#11111a;color:#f8fafc;padding:24px">
  <div style="max-width:640px;margin:0 auto;background:#1b1b27;border:1px solid #333348;border-radius:18px;padding:24px">
    <div style="font-size:12px;font-weight:800;color:#fbbf24;letter-spacing:3px">OkJob DAILY BRIEFING</div>
    <h1 style="margin:8px 0 12px;font-size:30px">Good morning, ${escapeHtml(d.name)} 🌅</h1>
    <p style="color:#cbd5e1">Real updates from your jobs, applications, Gmail, and calendar.</p>
    <h2>New jobs (${d.newJobs.length})</h2><ul>${items(d.newJobs, (j) => `<b>${escapeHtml(j.title)}</b> at ${escapeHtml(j.company)} — ${j.ats_score ?? 0}% match`)}</ul>
    <h2>Recruiter replies (${d.replies.length})</h2><ul>${items(d.replies, (r) => `<b>${escapeHtml(r.company)}</b>: ${escapeHtml(r.subject)} (${escapeHtml(r.type)})`)}</ul>
    <h2>Follow-ups needed</h2><ul>${items(d.followups, (f) => `${escapeHtml(f.company)} — ${escapeHtml(f.followup_date)}`)}</ul>
    <h2>Upcoming interviews</h2><ul>${items(d.interviews, (i) => `${escapeHtml(i.title)} — ${new Date(i.starts_at).toLocaleString()}`)}</ul>
    <h2>ATS weak spots</h2><ul>${items(d.weakSpots, (s) => escapeHtml(s))}</ul>
    <div style="margin-top:20px;padding:16px;background:#11111a;border-radius:14px;display:flex;gap:14px;justify-content:space-around;text-align:center">
      <div><div style="font-size:24px;font-weight:800">${d.stats.applied}</div><div style="font-size:11px;color:#94a3b8">APPLICATIONS</div></div>
      <div><div style="font-size:24px;font-weight:800">${d.stats.responseRate}%</div><div style="font-size:11px;color:#94a3b8">RESPONSE</div></div>
      <div><div style="font-size:24px;font-weight:800">${d.stats.avgAts}%</div><div style="font-size:11px;color:#94a3b8">AVG ATS</div></div>
    </div>
  </div></body></html>`;
}

export async function sendBriefingForUser(db: Db, userId: string) {
  const data = await buildBriefingData(db, userId);
  if (!data.email) throw new Error("No email on profile");
  const res = await fetch(`${RESEND_GW}/emails`, {
    method: "POST",
    headers: gatewayHeaders("RESEND_API_KEY"),
    body: JSON.stringify({
      from: "OkJob <onboarding@resend.dev>",
      to: [data.email],
      subject: `Your OkJob briefing — ${new Date().toLocaleDateString()}`,
      html: briefingHtml(data),
    }),
  });
  if (!res.ok) throw new Error(`Resend failed [${res.status}]: ${(await res.text()).slice(0, 300)}`);
  const { error } = await db.from("daily_briefings").insert({ user_id: userId, date: new Date().toISOString().slice(0, 10), data, sent_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  return { ok: true, data };
}

export async function sendDailyBriefingsForAllProfiles() {
  const { data: profiles, error } = await supabaseAdmin.from("profiles").select("id, email").not("email", "is", null);
  if (error) throw new Error(error.message);
  let sent = 0;
  const errors: string[] = [];
  for (const profile of profiles ?? []) {
    try {
      await sendBriefingForUser(supabaseAdmin, profile.id);
      sent++;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  return { users: profiles?.length ?? 0, sent, errors };
}

export async function createGoogleDoc(title: string, body: string) {
  const headers = gatewayHeaders("GOOGLE_DOCS_API_KEY");
  const createRes = await fetch(`${DOCS_GW}/documents`, { method: "POST", headers, body: JSON.stringify({ title }) });
  if (!createRes.ok) throw new Error(`Docs create failed [${createRes.status}]: ${(await createRes.text()).slice(0, 300)}`);
  const doc = await createRes.json();
  const docId = doc.documentId;
  const updateRes = await fetch(`${DOCS_GW}/documents/${docId}:batchUpdate`, {
    method: "POST",
    headers,
    body: JSON.stringify({ requests: [{ insertText: { location: { index: 1 }, text: body || " " } }] }),
  });
  if (!updateRes.ok) throw new Error(`Docs update failed [${updateRes.status}]: ${(await updateRes.text()).slice(0, 300)}`);
  return { id: docId, url: `https://docs.google.com/document/d/${docId}/edit` };
}

export async function generateSuggestedReplyText(input: { subject: string; body: string; sender: string; type: string; userName: string }) {
  const recruiterName = extractSenderName(input.sender);
  if (input.type === "Interview Invite") {
    return `Hi ${recruiterName},\n\nThank you for reaching out! I'd be happy to chat at the suggested time.\n\nLooking forward to it!\n\nBest,\n${input.userName}`;
  }
  if (input.type === "Assessment") {
    return `Hi ${recruiterName},\n\nThank you for the update! I'll complete the assessment within the given timeframe.\n\nBest,\n${input.userName}`;
  }

  const res = await fetch(AI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${env("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "Write a concise, professional recruiter email reply. Keep it under 120 words. No invented facts or times." },
        { role: "user", content: `Candidate name: ${input.userName}\nRecruiter: ${recruiterName}\nType: ${input.type}\nSubject: ${input.subject}\nEmail:\n${input.body.slice(0, 4000)}` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`AI reply failed [${res.status}]: ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content?.trim() || "";
}

export async function logConnectorRun(db: Db, userId: string, connector: string, kind: "run" | "verify", fn: () => Promise<{ message?: string }>) {
  const start = Date.now();
  try {
    const r = await fn();
    await db.from("connector_runs").insert({ user_id: userId, connector, kind, status: "ok", message: r.message ?? null, duration_ms: Date.now() - start });
    return { ok: true, message: r.message ?? "" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db.from("connector_runs").insert({ user_id: userId, connector, kind, status: "error", message: message.slice(0, 500), duration_ms: Date.now() - start });
    throw error;
  }
}

export async function verifyConnectorGateway(connectorKey: string): Promise<{ ok: boolean; message: string }> {
  if (!process.env[connectorKey]) return { ok: false, message: `${connectorKey} not configured` };
  if (!process.env.LOVABLE_API_KEY) return { ok: false, message: "LOVABLE_API_KEY missing" };
  try {
    const res = await fetch("https://connector-gateway.lovable.dev/api/v1/verify_credentials", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`, "X-Connection-Api-Key": process.env[connectorKey]! },
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, message: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    try {
      const j = JSON.parse(text);
      if (j.outcome === "failed") return { ok: false, message: j.error || "verification failed" };
      return { ok: true, message: `${j.outcome ?? "verified"} (${j.latency_ms ?? 0}ms)` };
    } catch { return { ok: true, message: "verified" }; }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

export async function verifyFirecrawl(): Promise<{ ok: boolean; message: string }> {
  if (!process.env.FIRECRAWL_API_KEY) return { ok: false, message: "FIRECRAWL_API_KEY not configured" };
  try {
    const res = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}` },
      body: JSON.stringify({ query: "test", limit: 1 }),
    });
    if (!res.ok) return { ok: false, message: `HTTP ${res.status}` };
    return { ok: true, message: "verified" };
  } catch (e) { return { ok: false, message: e instanceof Error ? e.message : String(e) }; }
}

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SEARCH_DOMAINS = [
  "site:linkedin.com/jobs",
  "site:ycombinator.com/jobs",
  "site:wellfound.com OR site:angel.co",
  "site:internshala.com",
];

function computeAts(text: string, skills: string[]): { score: number; missing: string[]; matched: string[] } {
  const lower = text.toLowerCase();
  const matched: string[] = [];
  const missing: string[] = [];
  for (const s of skills) {
    if (!s) continue;
    if (lower.includes(s.toLowerCase())) matched.push(s);
    else missing.push(s);
  }
  const ratio = skills.length === 0 ? 0.5 : matched.length / skills.length;
  const score = Math.round(40 + ratio * 55);
  return { score: Math.min(99, score), missing, matched };
}

function recommendation(score: number): "Strong Apply" | "Apply" | "Skip" {
  if (score >= 80) return "Strong Apply";
  if (score >= 60) return "Apply";
  return "Skip";
}

export const scrapeJobs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      query: z.string().min(1).max(200),
      limit: z.number().int().min(1).max(20).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) throw new Error("FIRECRAWL_API_KEY not configured");
    const { supabase, userId } = context;

    const { data: profile } = await supabase.from("profiles").select("resume_skills, preferred_role").eq("id", userId).maybeSingle();
    const skills = (profile?.resume_skills as string[] | null) ?? [];

    const role = data.query || profile?.preferred_role || "software engineer";
    const limit = data.limit ?? 10;

    // Use Firecrawl search across multiple job sites
    const searchQuery = `${role} jobs ${SEARCH_DOMAINS.join(" OR ")}`;
    const res = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query: searchQuery,
        limit,
        scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Firecrawl search failed [${res.status}]: ${t.slice(0, 300)}`);
    }
    const json = await res.json();
    const results: any[] = json?.data?.web ?? json?.data ?? [];

    const inserts: any[] = [];
    for (const r of results) {
      const url = r.url || r.link;
      const title = (r.title || "").slice(0, 200);
      if (!url || !title) continue;
      const description = (r.markdown || r.description || "").slice(0, 5000);
      const { score } = computeAts(`${title} ${description}`, skills);
      // best-effort company extraction
      let company = "";
      try {
        const u = new URL(url);
        company = u.hostname.replace("www.", "").split(".")[0];
        company = company.charAt(0).toUpperCase() + company.slice(1);
      } catch {}
      const m = title.match(/at\s+([A-Z][\w& ]{1,40})/);
      if (m) company = m[1].trim();

      inserts.push({
        title,
        company: company || "Unknown",
        url,
        source: company,
        description,
        ats_score: score,
        recommendation: recommendation(score),
        competition: score >= 80 ? "High" : score >= 60 ? "Medium" : "Low",
        remote: /remote/i.test(`${title} ${description}`) ? "Remote" : "Onsite",
        posted_at: new Date().toISOString(),
        scraped_at: new Date().toISOString(),
        created_by: userId,
      });
    }

    if (inserts.length === 0) return { inserted: 0 };

    const { error } = await supabase.from("jobs").insert(inserts);
    if (error) throw new Error(error.message);
    return { inserted: inserts.length };
  });

export const listJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("ats_score", { ascending: false })
      .limit(60);
    if (error) throw new Error(error.message);
    return { jobs: data ?? [] };
  });

export const saveJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ jobId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: job, error: je } = await supabase.from("jobs").select("*").eq("id", data.jobId).maybeSingle();
    if (je || !job) throw new Error("Job not found");
    const { error } = await supabase.from("applications").insert({
      user_id: userId,
      job_id: job.id,
      company: job.company,
      title: job.title,
      status: "Saved",
      ats_score: job.ats_score ?? 0,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

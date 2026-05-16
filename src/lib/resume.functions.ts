import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DOCS_GW = "https://connector-gateway.lovable.dev/google_docs/v1";

function gwHeaders() {
  const lk = process.env.LOVABLE_API_KEY;
  const gk = process.env.GOOGLE_DOCS_API_KEY;
  if (!lk) throw new Error("LOVABLE_API_KEY missing");
  if (!gk) throw new Error("Google Docs not connected");
  return { Authorization: `Bearer ${lk}`, "X-Connection-Api-Key": gk, "Content-Type": "application/json" };
}

async function ai(messages: any[], json = false): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch(AI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`AI failed [${res.status}]: ${(await res.text()).slice(0, 300)}`);
  const j = await res.json();
  return j.choices?.[0]?.message?.content ?? "";
}

export const analyzeResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      resume: z.string().min(20).max(20000),
      jobDescription: z.string().min(20).max(20000),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const content = await ai(
      [
        { role: "system", content: "You are an ATS resume scorer. Output strict JSON: {score:0-100, matched:[string], missing:[string], suggestions:[string]}." },
        { role: "user", content: `JOB:\n${data.jobDescription}\n\nRESUME:\n${data.resume}` },
      ],
      true,
    );
    try {
      return JSON.parse(content);
    } catch {
      return { score: 0, matched: [], missing: [], suggestions: ["AI returned non-JSON; try again"] };
    }
  });

export const optimizeResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      resume: z.string().min(20).max(20000),
      jobDescription: z.string().min(20).max(20000),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const optimized = await ai([
      { role: "system", content: "Rewrite the resume to match the job description. Keep facts true, add concrete metrics, weave in keywords naturally. Output plain text resume only." },
      { role: "user", content: `JOB:\n${data.jobDescription}\n\nRESUME:\n${data.resume}` },
    ]);

    const { supabase, userId } = context;
    const { data: existing } = await supabase.from("resume_versions").select("version").eq("user_id", userId).order("version", { ascending: false }).limit(1).maybeSingle();
    const version = (existing?.version ?? 0) + 1;
    const { data: row, error } = await supabase.from("resume_versions").insert({
      user_id: userId,
      content: optimized,
      version,
      title: `Resume v${version}`,
    }).select().single();
    if (error) throw new Error(error.message);
    return { resume: optimized, version, id: row.id };
  });

export const generateCoverLetter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      resume: z.string().min(20).max(20000),
      jobDescription: z.string().min(20).max(20000),
      company: z.string().min(1).max(200),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const letter = await ai([
      { role: "system", content: "Write a warm, specific 200-word cover letter. No clichés. Reference the company by name." },
      { role: "user", content: `Company: ${data.company}\nJOB:\n${data.jobDescription}\n\nRESUME:\n${data.resume}` },
    ]);
    const { supabase, userId } = context;
    const { data: existing } = await supabase.from("cover_letter_versions").select("version").eq("user_id", userId).order("version", { ascending: false }).limit(1).maybeSingle();
    const version = (existing?.version ?? 0) + 1;
    const { data: row, error } = await supabase.from("cover_letter_versions").insert({
      user_id: userId, content: letter, version,
    }).select().single();
    if (error) throw new Error(error.message);
    return { letter, version, id: row.id };
  });

async function createGoogleDoc(title: string, body: string): Promise<{ id: string; url: string }> {
  const headers = gwHeaders();
  const createRes = await fetch(`${DOCS_GW}/documents`, {
    method: "POST", headers, body: JSON.stringify({ title }),
  });
  if (!createRes.ok) throw new Error(`Docs create failed: ${createRes.status} ${await createRes.text()}`);
  const doc = await createRes.json();
  const docId = doc.documentId;

  await fetch(`${DOCS_GW}/documents/${docId}:batchUpdate`, {
    method: "POST", headers,
    body: JSON.stringify({ requests: [{ insertText: { location: { index: 1 }, text: body } }] }),
  });
  return { id: docId, url: `https://docs.google.com/document/d/${docId}/edit` };
}

export const exportResumeToDocs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ resumeId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase.from("resume_versions").select("*").eq("id", data.resumeId).eq("user_id", userId).maybeSingle();
    if (error || !row) throw new Error("Resume not found");
    const doc = await createGoogleDoc(row.title ?? `Resume v${row.version}`, row.content ?? "");
    await supabase.from("resume_versions").update({ google_doc_id: doc.id, google_doc_url: doc.url }).eq("id", row.id);
    return doc;
  });

export const exportCoverLetterToDocs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ letterId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase.from("cover_letter_versions").select("*").eq("id", data.letterId).eq("user_id", userId).maybeSingle();
    if (error || !row) throw new Error("Cover letter not found");
    const doc = await createGoogleDoc(`Cover Letter v${row.version}`, row.content ?? "");
    await supabase.from("cover_letter_versions").update({ google_doc_id: doc.id, google_doc_url: doc.url }).eq("id", row.id);
    return doc;
  });

export const listResumeVersions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data } = await supabase.from("resume_versions").select("*").order("version", { ascending: false });
    return { versions: data ?? [] };
  });

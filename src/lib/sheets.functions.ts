import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";

const COLUMN_RE = /^[A-Z]{1,2}$/;
const FIELDS = ["company", "title", "url", "ats_score", "status", "followup_date"] as const;
type Field = (typeof FIELDS)[number];

const columnMapSchema = z.object({
  company: z.string().regex(COLUMN_RE),
  title: z.string().regex(COLUMN_RE),
  url: z.string().regex(COLUMN_RE),
  ats_score: z.string().regex(COLUMN_RE),
  status: z.string().regex(COLUMN_RE),
  followup_date: z.string().regex(COLUMN_RE),
});

function extractSpreadsheetId(input: string): string {
  const m = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return m ? m[1] : input.trim();
}

function headers() {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
  if (!GOOGLE_SHEETS_API_KEY) throw new Error("Google Sheets connector not linked");
  return {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "X-Connection-Api-Key": GOOGLE_SHEETS_API_KEY,
    "Content-Type": "application/json",
  };
}

export const getSheetSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("sheet_settings")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { settings: data };
  });

export const saveSheetSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        spreadsheet_id: z.string().min(1).max(500),
        sheet_name: z.string().min(1).max(100).default("Applications"),
        column_map: columnMapSchema,
        auto_sync: z.boolean().default(true),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const id = extractSpreadsheetId(data.spreadsheet_id);
    const { error } = await context.supabase
      .from("sheet_settings")
      .upsert(
        {
          user_id: context.userId,
          spreadsheet_id: id,
          sheet_name: data.sheet_name,
          column_map: data.column_map,
          auto_sync: data.auto_sync,
        },
        { onConflict: "user_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true, spreadsheet_id: id };
  });

async function loadSettings(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("sheet_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data || !data.spreadsheet_id) return null;
  return data;
}

async function recordRun(supabase: any, userId: string, ok: boolean, message: string, count: number | null, durationMs: number) {
  await supabase.from("connector_runs").insert({
    user_id: userId,
    connector: "sheets",
    kind: "run",
    status: ok ? "ok" : "error",
    message,
    duration_ms: durationMs,
  });
  await supabase
    .from("sheet_settings")
    .update({
      last_sync_at: new Date().toISOString(),
      last_row_count: ok ? count : null,
      last_error: ok ? null : message.slice(0, 500),
    })
    .eq("user_id", userId);
}

function buildRow(app: any, map: Record<Field, string>): { col: string; value: any }[] {
  return [
    { col: map.company, value: app.company ?? "" },
    { col: map.title, value: app.title ?? "" },
    { col: map.url, value: app.url ?? "" },
    { col: map.ats_score, value: app.ats_score ?? 0 },
    { col: map.status, value: app.status ?? "" },
    { col: map.followup_date, value: app.followup_date ?? "" },
  ];
}

function rowToValues(row: { col: string; value: any }[]): { startCol: string; endCol: string; values: any[] } {
  const colNum = (c: string) => c.split("").reduce((acc, ch) => acc * 26 + (ch.charCodeAt(0) - 64), 0);
  const numToCol = (n: number) => {
    let s = "";
    while (n > 0) {
      const r = (n - 1) % 26;
      s = String.fromCharCode(65 + r) + s;
      n = Math.floor((n - 1) / 26);
    }
    return s;
  };
  const sorted = [...row].sort((a, b) => colNum(a.col) - colNum(b.col));
  const startNum = colNum(sorted[0].col);
  const endNum = colNum(sorted[sorted.length - 1].col);
  const values: any[] = [];
  for (let n = startNum; n <= endNum; n++) {
    const found = sorted.find((c) => colNum(c.col) === n);
    values.push(found ? found.value : "");
  }
  return { startCol: numToCol(startNum), endCol: numToCol(endNum), values };
}

export async function syncAllApplicationsToSheet(supabase: any, userId: string) {
  const started = Date.now();
  try {
    const settings = await loadSettings(supabase, userId);
    if (!settings) throw new Error("No sheet configured");
    const map = settings.column_map as Record<Field, string>;

    const { data: apps, error } = await supabase
      .from("applications")
      .select("company, title, status, ats_score, followup_date, notes, job_id")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);

    const jobIds = (apps ?? []).map((a: any) => a.job_id).filter(Boolean);
    let urlMap: Record<string, string> = {};
    if (jobIds.length) {
      const { data: jobs } = await supabase.from("jobs").select("id, url").in("id", jobIds);
      urlMap = Object.fromEntries((jobs ?? []).map((j: any) => [j.id, j.url]));
    }

    // Build header row
    const headerRow = buildRow(
      { company: "Company", title: "Role", url: "URL", ats_score: "ATS", status: "Status", followup_date: "Follow-up" },
      map,
    );
    const dataRows = (apps ?? []).map((a: any) =>
      buildRow({ ...a, url: a.job_id ? urlMap[a.job_id] ?? "" : "" }, map),
    );

    const allRows = [headerRow, ...dataRows];
    const { startCol, endCol } = rowToValues(headerRow);
    const range = `${settings.sheet_name}!${startCol}1:${endCol}${allRows.length}`;
    const values = allRows.map((r) => rowToValues(r).values);

    // Clear sheet first to drop deleted rows
    const clearRange = `${settings.sheet_name}!${startCol}2:${endCol}10000`;
    await fetch(`${GATEWAY}/spreadsheets/${settings.spreadsheet_id}/values/${clearRange}:clear`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({}),
    });

    const res = await fetch(
      `${GATEWAY}/spreadsheets/${settings.spreadsheet_id}/values/${range}?valueInputOption=USER_ENTERED`,
      { method: "PUT", headers: headers(), body: JSON.stringify({ range, majorDimension: "ROWS", values }) },
    );
    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error(`Rate limit: ${body.slice(0, 200)}`);
      throw new Error(`Sheets API ${res.status}: ${body.slice(0, 300)}`);
    }
    await recordRun(supabase, userId, true, `Wrote ${dataRows.length} rows`, dataRows.length, Date.now() - started);
    return { ok: true, rows: dataRows.length };
  } catch (e: any) {
    await recordRun(supabase, userId, false, e.message ?? "Sync failed", null, Date.now() - started);
    throw e;
  }
}

// Fire-and-forget mirror used on save/status-change.
export async function mirrorApplicationsBackground(supabase: any, userId: string) {
  const settings = await loadSettings(supabase, userId).catch(() => null);
  if (!settings || !settings.auto_sync) return;
  // do not await — just let it run
  syncAllApplicationsToSheet(supabase, userId).catch(() => {});
}

export const syncSheetNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const r = await syncAllApplicationsToSheet(context.supabase as any, context.userId);
    return r;
  });

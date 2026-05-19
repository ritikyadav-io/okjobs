import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCw, Save } from "lucide-react";
import { getSheetSettings, saveSheetSettings, syncSheetNow } from "@/lib/sheets.functions";

const FIELDS = [
  { key: "company", label: "Company" },
  { key: "title", label: "Role / Title" },
  { key: "url", label: "Job URL" },
  { key: "ats_score", label: "ATS Score" },
  { key: "status", label: "Status" },
  { key: "followup_date", label: "Follow-up Date" },
] as const;

const DEFAULT_MAP = { company: "A", title: "B", url: "C", ats_score: "D", status: "E", followup_date: "F" };

export function SheetsMappingCard() {
  const qc = useQueryClient();
  const getFn = useServerFn(getSheetSettings);
  const saveFn = useServerFn(saveSheetSettings);
  const syncFn = useServerFn(syncSheetNow);

  const q = useQuery({ queryKey: ["sheet-settings"], queryFn: () => getFn() });
  const [spreadsheet, setSpreadsheet] = useState("");
  const [sheetName, setSheetName] = useState("Applications");
  const [autoSync, setAutoSync] = useState(true);
  const [map, setMap] = useState<Record<string, string>>(DEFAULT_MAP);

  useEffect(() => {
    const s = q.data?.settings;
    if (s) {
      setSpreadsheet(s.spreadsheet_id ?? "");
      setSheetName(s.sheet_name ?? "Applications");
      setAutoSync(s.auto_sync ?? true);
      setMap({ ...DEFAULT_MAP, ...((s.column_map ?? {}) as Record<string, string>) });
    }
  }, [q.data]);

  const save = useMutation({
    mutationFn: () =>
      saveFn({
        data: {
          spreadsheet_id: spreadsheet,
          sheet_name: sheetName,
          column_map: map as any,
          auto_sync: autoSync,
        },
      }),
    onSuccess: () => {
      toast.success("Mapping saved");
      qc.invalidateQueries({ queryKey: ["sheet-settings"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Save failed"),
  });

  const sync = useMutation({
    mutationFn: () => syncFn(),
    onSuccess: (r: any) => {
      toast.success(`Synced ${r.rows} rows`);
      qc.invalidateQueries({ queryKey: ["sheet-settings"] });
      qc.invalidateQueries({ queryKey: ["connector-runs"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Sync failed"),
  });

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold">Google Sheets mirror</h3>
        <p className="text-sm text-muted-foreground">
          Auto-mirror your applications to a spreadsheet whenever you save or change status.
        </p>
      </div>

      <label className="block">
        <span className="text-xs font-semibold text-muted-foreground">Spreadsheet URL or ID</span>
        <input
          value={spreadsheet}
          onChange={(e) => setSpreadsheet(e.target.value)}
          placeholder="https://docs.google.com/spreadsheets/d/..."
          className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        />
      </label>

      <label className="block max-w-xs">
        <span className="text-xs font-semibold text-muted-foreground">Sheet (tab) name</span>
        <input
          value={sheetName}
          onChange={(e) => setSheetName(e.target.value)}
          className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        />
      </label>

      <div>
        <div className="mb-2 text-xs font-semibold text-muted-foreground">Field → column mapping</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <label key={f.key} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
              <span className="flex-1 text-sm font-semibold">{f.label}</span>
              <input
                value={map[f.key] ?? ""}
                onChange={(e) => setMap({ ...map, [f.key]: e.target.value.toUpperCase() })}
                maxLength={2}
                placeholder="A"
                className="h-9 w-14 rounded-lg border border-border bg-card px-2 text-center text-sm font-mono font-bold outline-none focus:border-primary"
              />
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
        <div>
          <div className="font-semibold">Auto-sync on changes</div>
          <div className="text-xs text-muted-foreground">Rewrite the sheet every time you save or update an application</div>
        </div>
        <button
          type="button"
          onClick={() => setAutoSync(!autoSync)}
          className={`h-6 w-11 rounded-full transition-colors ${autoSync ? "bg-gradient-brand" : "bg-muted"}`}
        >
          <span className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform ${autoSync ? "translate-x-[22px]" : "translate-x-0.5"}`} />
        </button>
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending || !spreadsheet}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
        >
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save mapping
        </button>
        <button
          onClick={() => sync.mutate()}
          disabled={sync.isPending || !q.data?.settings?.spreadsheet_id}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent disabled:opacity-60"
        >
          {sync.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Sync now
        </button>
      </div>

      {q.data?.settings?.last_sync_at && (
        <div className="rounded-xl border border-border bg-background p-3 text-xs">
          <div>
            <span className="text-muted-foreground">Last sync:</span>{" "}
            <span className="font-semibold">{new Date(q.data.settings.last_sync_at).toLocaleString()}</span>
            {typeof q.data.settings.last_row_count === "number" && (
              <span className="text-muted-foreground"> · {q.data.settings.last_row_count} rows</span>
            )}
          </div>
          {q.data.settings.last_error && (
            <div className="mt-1 text-destructive">⚠ {q.data.settings.last_error}</div>
          )}
        </div>
      )}
    </div>
  );
}

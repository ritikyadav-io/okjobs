import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/zenith/AppShell";
import { PageHeader } from "@/components/zenith/PageHeader";
import { Sparkles, FileDown, FileText, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { analyzeResume, optimizeResume, generateCoverLetter, exportResumeToDocs, exportCoverLetterToDocs } from "@/lib/resume.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/resume-lab")({
  head: () => ({ meta: [{ title: "Resume Lab — OkJob" }] }),
  component: ResumeLab,
});

function ResumeLab() {
  const analyzeFn = useServerFn(analyzeResume);
  const optimizeFn = useServerFn(optimizeResume);
  const coverFn = useServerFn(generateCoverLetter);
  const exportResFn = useServerFn(exportResumeToDocs);
  const exportCovFn = useServerFn(exportCoverLetterToDocs);

  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [company, setCompany] = useState("");

  const [analysis, setAnalysis] = useState<any>(null);
  const [optimized, setOptimized] = useState<{ resume: string; id: string; version: number } | null>(null);
  const [letter, setLetter] = useState<{ letter: string; id: string; version: number } | null>(null);

  const analyze = useMutation({
    mutationFn: () => analyzeFn({ data: { resume, jobDescription: jd } }),
    onSuccess: setAnalysis, onError: (e: any) => toast.error(e.message),
  });
  const optimize = useMutation({
    mutationFn: () => optimizeFn({ data: { resume, jobDescription: jd } }),
    onSuccess: (r) => { setOptimized(r); toast.success(`Saved as version ${r.version}`); }, onError: (e: any) => toast.error(e.message),
  });
  const cover = useMutation({
    mutationFn: () => coverFn({ data: { resume, jobDescription: jd, company: company || "the company" } }),
    onSuccess: (r) => { setLetter(r); toast.success("Cover letter generated"); }, onError: (e: any) => toast.error(e.message),
  });
  const exportRes = useMutation({
    mutationFn: () => exportResFn({ data: { resumeId: optimized!.id } }),
    onSuccess: (r) => { window.open(r.url, "_blank"); toast.success("Exported to Google Docs"); },
    onError: (e: any) => toast.error(e.message),
  });
  const exportCov = useMutation({
    mutationFn: () => exportCovFn({ data: { letterId: letter!.id } }),
    onSuccess: (r) => { window.open(r.url, "_blank"); toast.success("Exported to Google Docs"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <AppShell>
      <PageHeader title="Resume Lab" description="AI rewrites your resume per job — and proves it on ATS." />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border-2 border-border bg-card p-4">
          <label className="text-xs font-bold uppercase text-muted-foreground">Your resume (plain text)</label>
          <textarea value={resume} onChange={(e) => setResume(e.target.value)} rows={10} placeholder="Paste your resume here…" className="mt-2 w-full rounded-lg border border-border bg-background p-3 text-sm" />
        </div>
        <div className="rounded-2xl border-2 border-border bg-card p-4">
          <label className="text-xs font-bold uppercase text-muted-foreground">Job description</label>
          <textarea value={jd} onChange={(e) => setJd(e.target.value)} rows={8} placeholder="Paste the job description…" className="mt-2 w-full rounded-lg border border-border bg-background p-3 text-sm" />
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name (for cover letter)" className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => analyze.mutate()} disabled={analyze.isPending || !resume || !jd} className="inline-flex items-center gap-2 rounded-lg border-2 border-border bg-card px-4 py-2 text-sm font-semibold disabled:opacity-50">
          <Sparkles className="h-4 w-4" /> {analyze.isPending ? "Analyzing…" : "Analyze ATS"}
        </button>
        <button onClick={() => optimize.mutate()} disabled={optimize.isPending || !resume || !jd} className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-50">
          <Sparkles className="h-4 w-4" /> {optimize.isPending ? "Optimizing…" : "AI Optimize"}
        </button>
        <button onClick={() => cover.mutate()} disabled={cover.isPending || !resume || !jd} className="inline-flex items-center gap-2 rounded-lg border-2 border-secondary/40 bg-card px-4 py-2 text-sm font-semibold disabled:opacity-50">
          <FileText className="h-4 w-4" /> {cover.isPending ? "Writing…" : "Generate cover letter"}
        </button>
      </div>

      {analysis && (
        <div className="mt-6 rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase text-muted-foreground">ATS Score</div>
              <div className="text-5xl font-extrabold text-primary">{analysis.score}%</div>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs font-bold uppercase text-success">Matched</div>
              <div className="mt-2 flex flex-wrap gap-1">{(analysis.matched ?? []).map((k: string) => <span key={k} className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-bold text-success">✓ {k}</span>)}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-danger">Missing</div>
              <div className="mt-2 flex flex-wrap gap-1">{(analysis.missing ?? []).map((k: string) => <span key={k} className="rounded-full bg-danger/15 px-2 py-0.5 text-xs font-bold text-danger">– {k}</span>)}</div>
            </div>
          </div>
          {analysis.suggestions && (
            <ul className="mt-4 space-y-1 text-sm">{analysis.suggestions.map((s: string, i: number) => <li key={i}>• {s}</li>)}</ul>
          )}
        </div>
      )}

      {optimized && (
        <div className="mt-6 rounded-2xl border-2 border-primary/40 bg-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Optimized resume — v{optimized.version}</h3>
            <button onClick={() => exportRes.mutate()} disabled={exportRes.isPending} className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-3 py-1.5 text-xs font-semibold text-white shadow-glow disabled:opacity-50">
              <FileDown className="h-3.5 w-3.5" /> {exportRes.isPending ? "Exporting…" : "Export to Google Docs"}
            </button>
          </div>
          <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-background p-4 text-sm leading-relaxed">{optimized.resume}</pre>
        </div>
      )}

      {letter && (
        <div className="mt-6 rounded-2xl border-2 border-secondary/40 bg-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Cover letter — v{letter.version}</h3>
            <button onClick={() => exportCov.mutate()} disabled={exportCov.isPending} className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-3 py-1.5 text-xs font-semibold text-white shadow-glow disabled:opacity-50">
              <FileDown className="h-3.5 w-3.5" /> {exportCov.isPending ? "Exporting…" : "Export to Google Docs"}
            </button>
          </div>
          <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-background p-4 text-sm leading-relaxed">{letter.letter}</pre>
        </div>
      )}
    </AppShell>
  );
}

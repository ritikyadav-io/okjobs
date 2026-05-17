import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/zenith/PublicLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Zenith" },
      { name: "description", content: "How Zenith collects, stores, and protects your data." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-4 py-16 prose prose-invert">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: May 17, 2026</p>

        <h2 className="mt-10 text-2xl font-bold">What we collect</h2>
        <p className="mt-2 text-muted-foreground">Account details (name, email), the resume content you upload, job preferences, and metadata from connected services you authorize (Gmail, Google Calendar, Google Docs).</p>

        <h2 className="mt-8 text-2xl font-bold">How we use it</h2>
        <p className="mt-2 text-muted-foreground">To power job discovery, recruiter monitoring, resume optimization, interview tracking, and your daily briefing. We never sell your data.</p>

        <h2 className="mt-8 text-2xl font-bold">Connected accounts</h2>
        <p className="mt-2 text-muted-foreground">You can disconnect Gmail, Calendar, or Docs anytime from Settings. We only request the minimum OAuth scopes required.</p>

        <h2 className="mt-8 text-2xl font-bold">Data retention</h2>
        <p className="mt-2 text-muted-foreground">You can delete your account at any time, which permanently removes your stored data within 30 days.</p>

        <h2 className="mt-8 text-2xl font-bold">Contact</h2>
        <p className="mt-2 text-muted-foreground">Questions? Email privacy@zenith.app.</p>
      </article>
    </PublicLayout>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/zenith/PublicLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — OkJobs" },
      { name: "description", content: "The terms governing your use of OkJobs." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Terms of Service</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: May 17, 2026</p>

        <h2 className="mt-10 text-2xl font-bold">Acceptance</h2>
        <p className="mt-2 text-muted-foreground">By creating an account, you agree to these terms and our Privacy Policy.</p>

        <h2 className="mt-8 text-2xl font-bold">Acceptable use</h2>
        <p className="mt-2 text-muted-foreground">Don't abuse the service, scrape platforms in violation of their terms, or misrepresent your identity to recruiters.</p>

        <h2 className="mt-8 text-2xl font-bold">Subscriptions</h2>
        <p className="mt-2 text-muted-foreground">Paid plans renew automatically until cancelled. You can cancel anytime from Settings.</p>

        <h2 className="mt-8 text-2xl font-bold">Disclaimer</h2>
        <p className="mt-2 text-muted-foreground">OkJobs is provided "as is". We don't guarantee job offers, response rates, or interview outcomes.</p>

        <h2 className="mt-8 text-2xl font-bold">Contact</h2>
        <p className="mt-2 text-muted-foreground">Questions? Email legal@zenith.app.</p>
      </article>
    </PublicLayout>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/zenith/PublicLayout";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Zenith" },
      { name: "description", content: "Insights on job search, ATS optimization, and AI-powered career tools from the Zenith team." },
      { property: "og:title", content: "Zenith Blog" },
      { property: "og:description", content: "Career insights, ATS tips, and product updates." },
    ],
  }),
  component: BlogPage,
});

const POSTS = [
  { slug: "ats-explained", title: "ATS explained: why your resume gets filtered", date: "2026-05-10", excerpt: "How Applicant Tracking Systems parse resumes and what to do about it." },
  { slug: "recruiter-replies", title: "What recruiter replies actually mean", date: "2026-05-01", excerpt: "Decoding the boilerplate so you know when to follow up." },
  { slug: "ai-job-search", title: "Using AI to land interviews, not just apply", date: "2026-04-18", excerpt: "A practical playbook for using automation without losing your voice." },
];

function BlogPage() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Blog</h1>
        <p className="mt-3 text-muted-foreground">Insights on job search, ATS, and the future of AI-driven careers.</p>
        <div className="mt-10 space-y-4">
          {POSTS.map((p) => (
            <article key={p.slug} className="rounded-2xl border border-border bg-card p-6">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{p.date}</div>
              <h2 className="mt-1 text-xl font-bold">{p.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
              <Link to="/blog" className="mt-3 inline-block text-sm font-semibold text-primary">Read more →</Link>
            </article>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

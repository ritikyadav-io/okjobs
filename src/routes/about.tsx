import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/zenith/PublicLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Zenith" },
      { name: "description", content: "Zenith is the AI Career Operating System. Learn about our mission to help job seekers reach their zenith." },
      { property: "og:title", content: "About Zenith" },
      { property: "og:description", content: "The mission, team, and story behind Zenith." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">About Zenith</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Zenith is the AI Career Operating System. We help ambitious people land roles faster
          by automating discovery, tailoring resumes, monitoring recruiter conversations, and
          coordinating interviews — all in one place.
        </p>
        <h2 className="mt-10 text-2xl font-bold">Our mission</h2>
        <p className="mt-3 text-muted-foreground">
          Job hunting is exhausting and opaque. We're building software that does the heavy
          lifting so candidates can focus on what only humans can: telling their story.
        </p>
        <h2 className="mt-10 text-2xl font-bold">How we work</h2>
        <p className="mt-3 text-muted-foreground">
          Built with realtime data, Lovable AI, and direct integrations to the tools you already
          use — Gmail, Google Calendar, and Google Docs.
        </p>
      </article>
    </PublicLayout>
  );
}

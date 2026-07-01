import { createFileRoute } from "@tanstack/react-router";
import { scrapeJobsForAllProfiles } from "@/lib/automation.server";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (token.length !== secret.length) return false;
  let diff = 0;
  for (let i = 0; i < secret.length; i++) diff |= secret.charCodeAt(i) ^ token.charCodeAt(i);
  return diff === 0;
}

export const Route = createFileRoute("/api/public/cron/scrape-jobs")({
  server: { handlers: { POST: async ({ request }) => {
    if (!authorized(request)) return new Response("Unauthorized", { status: 401 });
    const result = await scrapeJobsForAllProfiles();
    return Response.json(result);
  } } },
});

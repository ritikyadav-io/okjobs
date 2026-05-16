import { createFileRoute } from "@tanstack/react-router";
import { syncRecruiterEmailsForConnectedProfile } from "@/lib/automation.server";

function authorized(request: Request) {
  const key = request.headers.get("apikey");
  return !!key && key === process.env.SUPABASE_PUBLISHABLE_KEY;
}

export const Route = createFileRoute("/api/public/cron/gmail-sync")({
  server: { handlers: { POST: async ({ request }) => {
    if (!authorized(request)) return new Response("Unauthorized", { status: 401 });
    const result = await syncRecruiterEmailsForConnectedProfile();
    return Response.json(result);
  } } },
});

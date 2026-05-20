import { createFileRoute } from "@tanstack/react-router";
import { processNext } from "@/lib/queue.server";

function authorized(request: Request) {
  const key = request.headers.get("apikey");
  return !!key && key === process.env.SUPABASE_PUBLISHABLE_KEY;
}

export const Route = createFileRoute("/api/public/cron/queue-worker")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!authorized(request)) return new Response("Unauthorized", { status: 401 });
        try {
          const result = await processNext(5);
          return Response.json(result);
        } catch (err: any) {
          return Response.json({ error: err?.message ?? "worker failed" }, { status: 500 });
        }
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { processNext } from "@/lib/queue.server";

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

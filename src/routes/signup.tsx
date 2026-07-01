/** Sign-up is removed — this app is single-user. Redirect straight to the dashboard. */
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/signup")({
  component: () => <Navigate to="/dashboard" replace />,
});

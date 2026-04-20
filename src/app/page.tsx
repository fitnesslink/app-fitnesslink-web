import { redirect } from "next/navigation";

// Root route — always redirect to /login. Middleware handles the follow-up:
// authenticated users hitting /login bounce to /home (see AUTH_ONLY_PATHS in
// src/middleware.ts), unauthenticated users stay at /login.
export default function RootPage() {
  redirect("/login");
}

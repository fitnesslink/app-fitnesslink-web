import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "fl_session";

// Publicly reachable without a session.
const PUBLIC_PATHS = new Set<string>([
  "/",
  "/login",
  "/signup",
  "/forgot-password",
]);

// When a valid session exists, these routes should bounce to /dashboard.
const AUTH_ONLY_PATHS = new Set<string>(["/login", "/signup"]);

// Base64-url decode with manual padding — atob is Edge-safe.
function base64UrlDecode(str: string): string {
  const normalized = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return atob(padded);
}

// Session cookies are standard JWTs; decoding the payload gives us the
// expiry without requiring the Admin SDK (which isn't available in the
// Edge runtime). Cryptographic verification happens at cookie-mint time
// in /api/session/login and anywhere else firebase-admin is imported.
// Middleware's job is a fast structural + expiry gate.
function sessionCookieExpiry(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(base64UrlDecode(parts[1])) as { exp?: unknown };
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  let isAuthenticated = false;
  if (cookie) {
    const exp = sessionCookieExpiry(cookie);
    if (exp !== null && exp * 1000 > Date.now()) {
      isAuthenticated = true;
    }
  }

  if (isAuthenticated && AUTH_ONLY_PATHS.has(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!isAuthenticated && !PUBLIC_PATHS.has(pathname)) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    if (cookie) res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  // Run on every path except API routes, Next internals, and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)"],
};

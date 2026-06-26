import { redirect } from "@solidjs/router";
import { createMiddleware } from "@solidjs/start/middleware";
import { auth } from "~/api/lib/auth.ts";
import env from "~/env.ts";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS", "TRACE"]);

function isGuestOnlyRoute(pathname: string): boolean {
  if (pathname === "/") return true;
  return pathname.startsWith("/auth/");
}

const TURNSTILE_ORIGIN = "https://challenges.cloudflare.com";
const S3_ORIGIN = new URL(env.VITE_S3_PUBLIC_URL).origin;

const PRODUCTION_CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${TURNSTILE_ORIGIN}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${S3_ORIGIN}`,
  "font-src 'self' data:",
  `connect-src 'self' ${TURNSTILE_ORIGIN}`,
  `frame-src ${TURNSTILE_ORIGIN}`,
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

function applySecurityHeaders(headers: Headers): void {
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-DNS-Prefetch-Control", "off");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );
  if (env.NODE_ENV === "production") {
    headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains",
    );
    headers.set("Content-Security-Policy", PRODUCTION_CSP);
  }
}

function csrfFailure(reason: string): Response {
  return new Response(JSON.stringify({ error: reason }), {
    status: 403,
    headers: { "content-type": "application/json" },
  });
}

function checkCsrf(request: Request): Response | undefined {
  if (SAFE_METHODS.has(request.method)) {
    return;
  }

  const requestUrl = new URL(request.url);
  const origin = request.headers.get("Origin");

  if (origin) {
    const parsedOrigin = new URL(origin);
    if (parsedOrigin.origin !== requestUrl.origin) {
      return csrfFailure("origin invalid");
    }
    return;
  }

  if (requestUrl.protocol === "https:") {
    const referer = request.headers.get("Referer");
    if (!referer) {
      return csrfFailure("referer not supplied");
    }
    const parsedReferer = new URL(referer);
    if (parsedReferer.protocol !== "https:") {
      return csrfFailure("referer invalid");
    }
    if (parsedReferer.host !== requestUrl.host) {
      return csrfFailure("referer invalid");
    }
  }
}

export default createMiddleware({
  onRequest: async (event) => {
    const csrfResponse = checkCsrf(event.request);
    if (csrfResponse) {
      return csrfResponse;
    }

    const url = new URL(event.request.url);
    const { pathname } = url;

    if (event.request.method === "GET" && isGuestOnlyRoute(pathname)) {
      const session = await auth.api.getSession({
        headers: event.request.headers,
      });

      if (session) {
        return redirect("/dashboard", 302);
      }
    }
  },
  onBeforeResponse: (event) => {
    const url = new URL(event.request.url);
    if (!url.pathname.startsWith("/api/")) {
      applySecurityHeaders(event.response.headers);
    }
  },
});

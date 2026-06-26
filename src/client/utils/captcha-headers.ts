import { getServerHeaders } from "~/api/lib/server-headers.ts";

// Build the request headers for a captcha-gated auth call: the forwarded request
// headers plus the Turnstile token Better Auth's captcha plugin expects. Call
// from inside a "use server" action body (it reads the request event).
export function getCaptchaHeaders(formData: FormData): Headers {
  const token = formData.get("cf-turnstile-response");
  const headers = new Headers(getServerHeaders());
  headers.set("x-captcha-response", typeof token === "string" ? token : "");
  return headers;
}

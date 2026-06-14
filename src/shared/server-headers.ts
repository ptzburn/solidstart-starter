import { getRequestEvent } from "solid-js/web";

export function getServerHeaders(): Headers {
  const event = getRequestEvent();
  if (!event) {
    throw new Error("No request event available");
  }
  return event.request.headers;
}

export function forwardAuthCookies(authHeaders: Headers): void {
  const event = getRequestEvent();
  if (!event) {
    throw new Error("No request event available");
  }
  for (const cookie of authHeaders.getSetCookie()) {
    event.response.headers.append("Set-Cookie", cookie);
  }
}

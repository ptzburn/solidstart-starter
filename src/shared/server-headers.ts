import { getRequestEvent } from "solid-js/web";

export function getServerHeaders(): Headers {
  const event = getRequestEvent();
  if (!event) {
    throw new Error("No request event available");
  }
  return event.request.headers;
}

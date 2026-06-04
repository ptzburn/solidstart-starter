import { redirect } from "@solidjs/router";

export function redirectWithCookies(
  sourceHeaders: Headers,
  path: string,
): Response {
  const response = redirect(path);
  for (const cookie of sourceHeaders.getSetCookie()) {
    response.headers.append("Set-Cookie", cookie);
  }
  return response;
}

import { COOKIE_PREFIX } from "~/api/lib/auth.ts";
import env from "~/env.ts";

// Short-lived cookie sessions that carry state between the steps of a multi-page
// auth flow (e.g. the email being verified). Every flow shares the same security
// config — only the cookie suffix and payload type differ — so the config lives
// here once instead of being copy-pasted per flow. Each flow keeps a thin typed
// hook of its own (see pending-*-session.ts) because a single generic factory
// trips up TypeScript's declaration emit on the `useSession<T>` return type.
const DEFAULT_MAX_AGE = 60 * 15;

type PendingSessionConfig = {
  name: string;
  password: string;
  maxAge: number;
  cookie: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax";
  };
};

export function pendingSessionConfig(
  name: string,
  maxAge?: number,
): PendingSessionConfig {
  return {
    name: `${COOKIE_PREFIX}.${name}`,
    password: env.BETTER_AUTH_SECRET,
    maxAge: maxAge ?? DEFAULT_MAX_AGE,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
    },
  };
}

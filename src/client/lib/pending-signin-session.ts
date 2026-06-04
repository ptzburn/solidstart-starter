import { useSession } from "@solidjs/start/http";
import env from "~/env.ts";
import { COOKIE_PREFIX } from "~/shared/auth.ts";

type PendingSigninSessionData = { email: string };

export function usePendingSigninSession(): ReturnType<
  typeof useSession<PendingSigninSessionData>
> {
  return useSession<PendingSigninSessionData>({
    name: `${COOKIE_PREFIX}.pending-signin`,
    password: env.BETTER_AUTH_SECRET,
    maxAge: 60 * 15,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
    },
  });
}

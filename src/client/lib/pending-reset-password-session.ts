import { useSession } from "@solidjs/start/http";
import env from "~/env.ts";
import { COOKIE_PREFIX } from "~/shared/auth.ts";

type PendingResetPasswordSessionData = { completed: boolean };

export function usePendingResetPasswordSession(): ReturnType<
  typeof useSession<PendingResetPasswordSessionData>
> {
  return useSession<PendingResetPasswordSessionData>({
    name: `${COOKIE_PREFIX}.pending-reset-password`,
    password: env.BETTER_AUTH_SECRET,
    maxAge: 60 * 15,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
    },
  });
}

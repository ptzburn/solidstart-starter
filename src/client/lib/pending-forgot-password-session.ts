import { useSession } from "@solidjs/start/http";
import { COOKIE_PREFIX } from "~/api/lib/auth.ts";
import env from "~/env.ts";

type PendingForgotPasswordSessionData = { email: string };

export function usePendingForgotPasswordSession(): ReturnType<
  typeof useSession<PendingForgotPasswordSessionData>
> {
  return useSession<PendingForgotPasswordSessionData>({
    name: `${COOKIE_PREFIX}.pending-forgot-password`,
    password: env.BETTER_AUTH_SECRET,
    maxAge: 60 * 15,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
    },
  });
}

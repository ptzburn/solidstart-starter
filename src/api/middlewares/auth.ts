import { auth } from "~/api/lib/auth.ts";
import { base } from "~/api/os.ts";

export const authMiddleware = base.middleware(
  async ({ context, next, errors }) => {
    const session = await auth.api.getSession({
      headers: context.headers,
    });

    if (!session) {
      throw errors.UNAUTHORIZED({ message: "Unauthorized" });
    }

    return next({
      context: {
        session: session.session,
        user: session.user,
      },
    });
  },
);

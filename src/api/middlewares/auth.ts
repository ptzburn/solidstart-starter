import { base } from "~/api/os.ts";
import { auth } from "~/shared/auth.ts";

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

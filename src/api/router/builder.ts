import { authMiddleware } from "~/api/middlewares/auth.ts";
import { base, type InitialContext } from "~/api/os.ts";
import type { SelectSession, SelectUser } from "~/shared/types/auth.ts";

export type AuthedContext = InitialContext & {
  user: SelectUser;
  session: SelectSession;
};

export const authProcedure = base.use(authMiddleware);

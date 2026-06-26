import { authMiddleware } from "~/api/middlewares/auth.ts";
import { base } from "~/api/os.ts";

export const authProcedure = base.use(authMiddleware);

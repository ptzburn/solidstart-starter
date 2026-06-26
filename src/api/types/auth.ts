import type { auth } from "../lib/auth.ts";

export type SelectUser = typeof auth.$Infer.Session.user;
export type SelectSession = typeof auth.$Infer.Session.session;

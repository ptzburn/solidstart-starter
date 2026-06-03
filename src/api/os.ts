import type { LoggerContext } from "@orpc/experimental-pino";
import { os } from "@orpc/server";

export type InitialContext = LoggerContext & {
  headers: Headers;
};

export const base = os.$context<InitialContext>().errors({
  UNAUTHORIZED: {},
  INTERNAL_SERVER_ERROR: {},
});

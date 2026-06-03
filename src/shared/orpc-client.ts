import { createRouterClient, onError, ORPCError } from "@orpc/server";
import router from "~/api/router/index.ts";
import logger from "~/shared/logger.ts";
import { getServerHeaders } from "~/shared/server-headers.ts";

export const orpcClient = createRouterClient(router, {
  context: () => ({ headers: getServerHeaders() }),
  interceptors: [
    onError((error, { path }) => {
      if (error instanceof ORPCError && error.status < 500) {
        return;
      }
      logger.error({ err: error, path: path.join(".") }, "ssr call failed");
    }),
  ],
});

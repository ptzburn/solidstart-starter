import { createRouterClient, onError, ORPCError } from "@orpc/server";
import logger from "~/api/lib/logger.ts";
import { getServerHeaders } from "~/api/lib/server-headers.ts";
import router from "~/api/router/index.ts";

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

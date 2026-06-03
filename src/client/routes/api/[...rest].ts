import { LoggingHandlerPlugin } from "@orpc/experimental-pino";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import type { APIEvent } from "@solidjs/start/server";
import router from "~/api/router/index.ts";
import { auth } from "~/shared/auth.ts";
import logger from "~/shared/logger.ts";

const orpcHandler = new OpenAPIHandler(router, {
  plugins: [
    new LoggingHandlerPlugin({
      logger,
      logRequestResponse: true,
    }),
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: "Solid Starter Template API",
          version: "1.0.0",
        },
      },
      docsPath: "/docs",
      specPath: "/spec.json",
      docsTitle: "Solid Starter API Docs",
      docsConfig: {
        theme: "deepSpace",
        layout: "classic",
        defaultHttpClient: { targetKey: "js", clientKey: "fetch" },
      },
      renderDocsHtml: (specUrl, title, head, scriptUrl) => `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${title}</title>
          ${head}
        </head>
        <body>
          <div id="app"></div>
          <script src="${scriptUrl}"></script>
          <script>
            Scalar.createApiReference('#app', {
              theme: 'deepSpace',
              layout: 'classic',
              defaultHttpClient: { targetKey: 'js', clientKey: 'fetch' },
              sources: [
                { url: '${specUrl}', title: 'API', default: true },
                { url: '/api/auth/open-api/generate-schema', title: 'Authentication' },
              ],
            })
          </script>
        </body>
      </html>
    `,
    }),
  ],
});

async function handler(event: APIEvent): Promise<Response> {
  const url = new URL(event.request.url);
  const { pathname } = url;

  if (pathname.startsWith("/api/auth/")) {
    if (pathname === "/api/auth/error") {
      const error = url.searchParams.get("error");
      const redirectUrl = error
        ? `/auth/error?error=${encodeURIComponent(error)}`
        : "/auth/error";
      return new Response(null, {
        status: 302,
        headers: { Location: redirectUrl },
      });
    }
    try {
      return await auth.handler(event.request);
    } catch (error) {
      logger.error(
        { err: error, method: event.request.method, url: url.toString() },
        "auth handler threw",
      );
      throw error;
    }
  }

  const { matched, response } = await orpcHandler.handle(event.request, {
    prefix: "/api",
    context: { headers: event.request.headers },
  });

  if (matched) {
    return response;
  }

  return new Response("Not found", { status: 404 });
}

export const GET = handler;
export const POST = handler;
export const DELETE = handler;
export const PATCH = handler;
export const PUT = handler;
export const OPTIONS = handler;
export const HEAD = handler;

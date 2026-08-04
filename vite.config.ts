import deno from "@deno/vite-plugin";
import { solidStart } from "@solidjs/start/config";
import { nitro } from "nitro/vite";
import tailwindcss from "@tailwindcss/vite";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";

import "./src/env.ts";

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: "node_modules/.vite",
  server: {
    watch: {
      ignored: ["**/local.db*", "**/docker-data/**"],
    },
  },
  build: {
    target: "esnext",
  },
  plugins: [
    tailwindcss(),
    solidStart({
      routeDir: "./client/routes",
      middleware: "./src/client/lib/middleware.ts",
    }),
    nitro({
      preset: "deno_server",
      compatibilityDate: "2026-08-03",
    }),
    deno(),
    Icons({
      compiler: "solid",
      autoInstall: true,
    }),
    {
      // Workaround for @solidjs/start@2.0.0-alpha.3: its manifest plugin
      // reads the asset id from a query string in the resolved id, but Vite
      // strips the query before calling load. Returning the id verbatim from
      // resolveId keeps the query intact through to start's load hook.
      name: "solid-start-manifest-query-preserve",
      enforce: "pre",
      resolveId(id) {
        if (id.startsWith("/@manifest/")) return id;
      },
    },
  ],
});

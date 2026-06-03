import { defineConfig } from "drizzle-kit";
import env from "./src/env.ts";

export default defineConfig({
  out: "./src/api/db/migrations",
  schema: "./src/api/db/schema/index.ts",
  dialect: "turso",
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.NODE_ENV === "development"
      ? undefined
      : env.DATABASE_AUTH_TOKEN,
  },
});

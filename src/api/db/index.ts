import env from "~/env.ts";
import { drizzle } from "drizzle-orm/libsql";
import { relations } from "./relations.ts";
import * as schema from "./schema/index.ts";

const db = drizzle({
  connection: {
    url: env.DATABASE_URL,
    authToken: env.NODE_ENV === "development"
      ? undefined
      : env.DATABASE_AUTH_TOKEN,
  },
  schema,
  relations,
});

export default db;

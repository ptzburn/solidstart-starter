import { query } from "@solidjs/router";
import { auth } from "~/api/lib/auth.ts";
import { getServerHeaders } from "~/api/lib/server-headers.ts";
import type { SelectUser } from "~/api/types/auth.ts";

export const getUserByIdQuery = query(async (userId: string) => {
  "use server";
  const headers = getServerHeaders();
  const user = await auth.api.getUser({
    query: {
      id: userId,
    },
    headers,
  }) as SelectUser;

  return user;
}, "user");

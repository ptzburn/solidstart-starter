import { query } from "@solidjs/router";
import { auth } from "~/shared/auth.ts";
import { getServerHeaders } from "~/shared/server-headers.ts";
import type { SelectUser } from "~/shared/types/auth.ts";

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

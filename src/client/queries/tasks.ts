import { query } from "@solidjs/router";
import { orpcClient } from "~/api/lib/orpc-client.ts";

export const getTasksQuery = query(async () => {
  "use server";
  return await orpcClient.tasks.list();
}, "tasks");

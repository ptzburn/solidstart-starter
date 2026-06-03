import { query } from "@solidjs/router";
import { orpcClient } from "~/shared/orpc-client.ts";

export const getTasksQuery = query(async () => {
  "use server";
  return await orpcClient.tasks.list();
}, "tasks");

export const getTaskQuery = query(async (id: string) => {
  "use server";
  return await orpcClient.tasks.getOne({ id: Number(id) });
}, "task");

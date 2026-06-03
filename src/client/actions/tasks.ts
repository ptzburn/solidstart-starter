import { action } from "@solidjs/router";
import { orpcClient } from "~/shared/orpc-client.ts";
import type { InsertTask, UpdateTask } from "~/shared/types.ts";

export const createTaskAction = action(async (data: InsertTask) => {
  "use server";
  return await orpcClient.tasks.create(data);
}, "createTask");

export const deleteTaskAction = action(async (id: string) => {
  "use server";
  await orpcClient.tasks.remove({ id: Number(id) });
  return { ok: true };
}, "deleteTask");

export const updateTaskAction = action(
  async (id: string, updates: UpdateTask) => {
    "use server";
    return await orpcClient.tasks.patch({ id: Number(id), ...updates });
  },
  "updateTask",
);

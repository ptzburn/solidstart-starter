import { action } from "@solidjs/router";
import { orpcClient } from "~/api/lib/orpc-client.ts";
import { parseFields } from "~/client/utils/form-errors.ts";
import { z } from "zod";

const NewTaskSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(
    500,
    "Name must be 500 characters or less",
  ),
});

export const createTaskAction = action(async (formData: FormData) => {
  "use server";
  const result = parseFields(NewTaskSchema, { name: formData.get("name") });
  if (result.fieldErrors) return { fieldErrors: result.fieldErrors };
  await orpcClient.tasks.create({ name: result.data.name, done: false });
  return { ok: true } as const;
}, "createTask");

export const deleteTaskAction = action(async (formData: FormData) => {
  "use server";
  await orpcClient.tasks.remove({ id: Number(formData.get("id")) });
  return { ok: true };
}, "deleteTask");

export const toggleTaskAction = action(async (formData: FormData) => {
  "use server";
  return await orpcClient.tasks.patch({
    id: Number(formData.get("id")),
    done: formData.get("done") === "true",
  });
}, "toggleTask");

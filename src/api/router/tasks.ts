import { ORPCError } from "@orpc/server";
import db from "~/api/db/index.ts";
import {
  InsertTaskSchema,
  SelectTaskSchema,
  tasks,
  UpdateTaskSchema,
} from "~/api/db/schema/task.ts";
import { authProcedure } from "~/api/router/builder.ts";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const IdInputSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const PatchInputSchema = UpdateTaskSchema.extend({
  id: z.coerce.number().int().positive(),
});

const list = authProcedure
  .route({ method: "GET", path: "/tasks", tags: ["Tasks"] })
  .output(z.array(SelectTaskSchema))
  .handler(async ({ context }) => {
    const userId = Number(context.user.id);
    return await db.query.tasks.findMany({
      where: { userId },
    });
  });

const create = authProcedure
  .route({ method: "POST", path: "/tasks", tags: ["Tasks"] })
  .input(InsertTaskSchema)
  .output(SelectTaskSchema)
  .handler(async ({ input, context }) => {
    const userId = Number(context.user.id);
    const [inserted] = await db.insert(tasks)
      .values({ ...input, userId })
      .returning();
    return inserted;
  });

const getOne = authProcedure
  .route({ method: "GET", path: "/tasks/{id}", tags: ["Tasks"] })
  .input(IdInputSchema)
  .output(SelectTaskSchema)
  .handler(async ({ input, context }) => {
    const userId = Number(context.user.id);
    const task = await db.query.tasks.findFirst({
      where: { id: input.id, userId },
    });

    if (!task) {
      throw new ORPCError("NOT_FOUND", { message: "Task not found" });
    }

    return task;
  });

const patch = authProcedure
  .route({ method: "PATCH", path: "/tasks/{id}", tags: ["Tasks"] })
  .input(PatchInputSchema)
  .output(SelectTaskSchema)
  .handler(async ({ input, context }) => {
    const userId = Number(context.user.id);
    const { id, ...updates } = input;

    if (Object.keys(updates).length === 0) {
      throw new ORPCError("UNPROCESSABLE_CONTENT", {
        message: "No updates provided",
      });
    }

    const [task] = await db.update(tasks)
      .set(updates)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();

    if (!task) {
      throw new ORPCError("NOT_FOUND", { message: "Task not found" });
    }

    return task;
  });

const remove = authProcedure
  .route({
    method: "DELETE",
    path: "/tasks/{id}",
    tags: ["Tasks"],
    successStatus: 204,
  })
  .input(IdInputSchema)
  .handler(async ({ input, context }) => {
    const userId = Number(context.user.id);
    const result = await db.delete(tasks)
      .where(and(eq(tasks.id, input.id), eq(tasks.userId, userId)));

    if (result.rowsAffected === 0) {
      throw new ORPCError("NOT_FOUND", { message: "Task not found" });
    }
  });

export const tasksRouter = {
  list,
  create,
  getOne,
  patch,
  remove,
};

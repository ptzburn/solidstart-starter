import { ORPCError } from "@orpc/server";
import db from "~/api/db/index.ts";
import {
  InsertTaskSchema,
  SelectTaskSchema,
  tasks,
  UpdateTaskSchema,
} from "~/api/db/schema/task.ts";
import { getUserId } from "~/api/lib/user.ts";
import { authProcedure } from "~/api/router/builder.ts";
import { and, eq, type SQL } from "drizzle-orm";
import { z } from "zod";

const IdInputSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const PatchInputSchema = UpdateTaskSchema.extend({
  id: z.coerce.number().int().positive(),
});

// The multi-tenant ownership predicate lives in one place so no handler can
// accidentally query or mutate another user's task.
const taskOwnership = (id: number, userId: number): SQL | undefined =>
  and(eq(tasks.id, id), eq(tasks.userId, userId));

function throwTaskNotFound(): never {
  throw new ORPCError("NOT_FOUND", { message: "Task not found" });
}

const list = authProcedure
  .route({ method: "GET", path: "/tasks", tags: ["Tasks"] })
  .output(z.array(SelectTaskSchema))
  .handler(async ({ context }) => {
    const userId = getUserId(context);
    return await db.query.tasks.findMany({
      where: { userId },
    });
  });

const create = authProcedure
  .route({ method: "POST", path: "/tasks", tags: ["Tasks"] })
  .input(InsertTaskSchema)
  .output(SelectTaskSchema)
  .handler(async ({ input, context }) => {
    const userId = getUserId(context);
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
    const userId = getUserId(context);
    const task = await db.query.tasks.findFirst({
      where: { id: input.id, userId },
    });

    if (!task) throwTaskNotFound();

    return task;
  });

const patch = authProcedure
  .route({ method: "PATCH", path: "/tasks/{id}", tags: ["Tasks"] })
  .input(PatchInputSchema)
  .output(SelectTaskSchema)
  .handler(async ({ input, context }) => {
    const userId = getUserId(context);
    const { id, ...updates } = input;

    if (Object.keys(updates).length === 0) {
      throw new ORPCError("UNPROCESSABLE_CONTENT", {
        message: "No updates provided",
      });
    }

    const [task] = await db.update(tasks)
      .set(updates)
      .where(taskOwnership(id, userId))
      .returning();

    if (!task) throwTaskNotFound();

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
    const userId = getUserId(context);
    const result = await db.delete(tasks)
      .where(taskOwnership(input.id, userId));

    if (result.rowsAffected === 0) throwTaskNotFound();
  });

export const tasksRouter = {
  list,
  create,
  getOne,
  patch,
  remove,
};

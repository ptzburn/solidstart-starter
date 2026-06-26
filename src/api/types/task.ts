import type { SelectTaskSchema } from "~/api/db/schema/task.ts";
import type { z } from "zod";

export type SelectTask = z.infer<typeof SelectTaskSchema>;

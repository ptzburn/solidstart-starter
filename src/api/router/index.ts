import { avatarsRouter } from "~/api/router/files.ts";
import { tasksRouter } from "~/api/router/tasks.ts";

export const router = {
  tasks: tasksRouter,
  avatars: avatarsRouter,
};

export type AppRouter = typeof router;

export default router;

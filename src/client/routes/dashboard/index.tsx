import {
  createAsync,
  revalidate,
  useAction,
  useSubmission,
} from "@solidjs/router";
import { createForm } from "@tanstack/solid-form";
import {
  createTaskAction,
  deleteTaskAction,
  updateTaskAction,
} from "~/client/actions/tasks.ts";
import { DeletionDialog } from "~/client/components/deletion-dialog.tsx";
import { Badge } from "~/client/components/ui/badge.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { Checkbox } from "~/client/components/ui/checkbox.tsx";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/client/components/ui/empty.tsx";
import { Input } from "~/client/components/ui/input.tsx";
import { Progress } from "~/client/components/ui/progress.tsx";
import { Separator } from "~/client/components/ui/separator.tsx";
import { Skeleton } from "~/client/components/ui/skeleton.tsx";
import { getTasksQuery } from "~/client/queries/tasks.ts";
import CircleCheckBig from "~icons/lucide/circle-check-big";
import ClipboardList from "~icons/lucide/clipboard-list";
import Plus from "~icons/lucide/plus";
import Trash from "~icons/lucide/trash";
import {
  createMemo,
  createSignal,
  For,
  type JSX,
  Show,
  Suspense,
} from "solid-js";
import { toast } from "solid-sonner";

type NewTaskForm = {
  name: string;
};

export default function Main(): JSX.Element {
  const tasks = createAsync(() => getTasksQuery());

  const createTask = useAction(createTaskAction);
  const createSubmission = useSubmission(createTaskAction);
  const deleteSubmission = useSubmission(deleteTaskAction);

  const updateTask = useAction(updateTaskAction);
  const deleteTask = useAction(deleteTaskAction);

  const [deletingTaskId, setDeletingTaskId] = createSignal<number | null>(
    null,
  );

  const deletingTask = () => {
    const id = deletingTaskId();
    if (id === null) return undefined;
    const list = tasks();
    if (!list) return undefined;
    return list.find((t) => t.id === id);
  };

  const pendingTasks = createMemo(() => tasks()?.filter((t) => !t.done) ?? []);

  const completedTasks = createMemo(() => tasks()?.filter((t) => t.done) ?? []);

  const completionPercent = createMemo(() => {
    const all = tasks();
    if (!all || all.length === 0) return 0;
    return Math.round((completedTasks().length / all.length) * 100);
  });

  const form = createForm(() => ({
    defaultValues: {
      name: "",
    } as NewTaskForm,
    onSubmit: async ({ value }) => {
      const name = value.name.trim();
      if (!name) return;
      try {
        await createTask({ name, done: false });
        revalidate(getTasksQuery.key);
        form.reset();
      } catch (error) {
        toast.error(
          Error.isError(error) ? error.message : "Failed to create task",
        );
      }
    },
  }));

  async function toggleTask(id: number, done: boolean): Promise<void> {
    try {
      await updateTask(String(id), { done });
      revalidate(getTasksQuery.key);
    } catch (error) {
      toast.error(
        Error.isError(error) ? error.message : "Failed to update task",
      );
    }
  }

  async function onDeleteTask(id: number): Promise<boolean> {
    try {
      await deleteTask(String(id));
      revalidate(getTasksQuery.key);
      return true;
    } catch (error) {
      toast.error(
        Error.isError(error) ? error.message : "Failed to delete task",
      );
      return false;
    }
  }

  return (
    <div class="flex flex-1 flex-col gap-6">
      <div class="flex flex-col gap-2">
        <h2>Tasks</h2>
        <p class="text-muted-foreground">
          Manage your to-do list and track your progress.
        </p>
      </div>

      <Suspense
        fallback={
          <div class="flex flex-col gap-6">
            <Skeleton class="h-20 w-full rounded-lg" />
            <Skeleton class="h-10 w-full rounded-md" />
            <div class="space-y-2">
              <Skeleton class="h-12 w-full rounded-md" />
              <Skeleton class="h-12 w-full rounded-md" />
              <Skeleton class="h-12 w-3/4 rounded-md" />
            </div>
          </div>
        }
      >
        <Show when={tasks()}>
          {(allTasks) => (
            <>
              <Show when={allTasks().length > 0}>
                <div class="flex items-center gap-4 rounded-lg border bg-card p-4">
                  <div class="flex flex-1 flex-col gap-2">
                    <div class="flex items-center justify-between">
                      <span class="font-medium text-muted-foreground text-sm">
                        Progress
                      </span>
                      <div class="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          class="font-mono text-xs tabular-nums"
                        >
                          {completedTasks().length}/{allTasks().length}
                        </Badge>
                        <span class="text-muted-foreground text-xs tabular-nums">
                          {completionPercent()}%
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={completionPercent()}
                      minValue={0}
                      maxValue={100}
                    />
                  </div>
                </div>
              </Show>

              <form
                class="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  void form.handleSubmit();
                }}
              >
                <form.Field
                  name="name"
                  validators={{
                    onChange: ({ value }) =>
                      value.trim().length === 0
                        ? "Name is required"
                        : value.length > 500
                        ? "Name must be 500 characters or less"
                        : undefined,
                  }}
                >
                  {(field) => (
                    <div class="flex flex-1 flex-col gap-1">
                      <Input
                        placeholder="What needs to be done?"
                        value={field().state.value}
                        onInput={(e) => field().handleChange(e.target.value)}
                        onBlur={field().handleBlur}
                        disabled={createSubmission.pending}
                        class="flex-1"
                        aria-invalid={field().state.meta.errors.length > 0}
                      />
                      <Show when={field().state.meta.errors.length > 0}>
                        <p
                          id={`task-name-${field().name}-error`}
                          class="text-destructive text-sm"
                        >
                          {field().state.meta.errors.join(", ")}
                        </p>
                      </Show>
                    </div>
                  )}
                </form.Field>
                <Button
                  type="submit"
                  disabled={createSubmission.pending}
                >
                  <Plus class="size-4" />
                  <span class="hidden sm:inline">Add task</span>
                </Button>
              </form>

              <Show
                when={allTasks().length > 0}
                fallback={
                  <Empty class="border">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <ClipboardList />
                      </EmptyMedia>
                      <EmptyTitle>No tasks yet</EmptyTitle>
                      <EmptyDescription>
                        Add your first task above to get started.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                }
              >
                <div class="flex flex-col gap-6">
                  <Show when={pendingTasks().length > 0}>
                    <section class="flex flex-col gap-2">
                      <h3 class="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                        Pending
                        <span class="ml-1.5 text-foreground">
                          {pendingTasks().length}
                        </span>
                      </h3>
                      <ul class="flex flex-col gap-1.5">
                        <For each={pendingTasks()}>
                          {(task) => (
                            <li class="group flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 transition-colors hover:bg-accent/50">
                              <Checkbox
                                checked={task.done}
                                onChange={(v) => toggleTask(task.id, !!v)}
                                aria-label={task.name}
                              />
                              <span class="flex-1 text-sm leading-relaxed">
                                {task.name}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Delete"
                                class="shrink-0 text-muted-foreground/50 transition-colors hover:text-destructive"
                                onClick={() => setDeletingTaskId(task.id)}
                              >
                                <Trash class="size-4" />
                              </Button>
                            </li>
                          )}
                        </For>
                      </ul>
                    </section>
                  </Show>

                  <Show when={completedTasks().length > 0}>
                    <Show when={pendingTasks().length > 0}>
                      <Separator />
                    </Show>
                    <section class="flex flex-col gap-2">
                      <h3 class="flex items-center gap-1.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                        <CircleCheckBig class="size-3.5" />
                        Completed
                        <span class="text-foreground">
                          {completedTasks().length}
                        </span>
                      </h3>
                      <ul class="flex flex-col gap-1.5">
                        <For each={completedTasks()}>
                          {(task) => (
                            <li class="group flex items-center gap-3 rounded-lg border border-transparent bg-muted/40 px-3 py-2.5 transition-colors hover:bg-muted/70">
                              <Checkbox
                                checked={task.done}
                                onChange={(v) => toggleTask(task.id, !!v)}
                                aria-label={task.name}
                              />
                              <span class="flex-1 text-muted-foreground text-sm leading-relaxed line-through decoration-muted-foreground/50">
                                {task.name}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Delete"
                                class="shrink-0 text-muted-foreground/50 transition-colors hover:text-destructive"
                                onClick={() => setDeletingTaskId(task.id)}
                              >
                                <Trash class="size-4" />
                              </Button>
                            </li>
                          )}
                        </For>
                      </ul>
                    </section>
                  </Show>
                </div>
              </Show>
            </>
          )}
        </Show>
      </Suspense>

      <DeletionDialog
        isOpen={() => deletingTaskId() !== null}
        setIsOpen={(value) => {
          const open = typeof value === "function"
            ? value(deletingTaskId() !== null)
            : value;
          if (!open) setDeletingTaskId(null);
        }}
        isPending={deleteSubmission.pending}
        title="Delete task?"
        description={deletingTask()
          ? `"${
            deletingTask()?.name ?? "Task"
          }" will be removed. This can't be undone.`
          : undefined}
        onDelete={async () => {
          const id = deletingTaskId();
          if (id === null) return;
          const ok = await onDeleteTask(id);
          if (ok) setDeletingTaskId(null);
        }}
      />
    </div>
  );
}

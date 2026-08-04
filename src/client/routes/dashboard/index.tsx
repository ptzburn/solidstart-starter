import {
  createAsync,
  revalidate,
  type RouteDefinition,
  useSubmission,
  useSubmissions,
} from "@solidjs/router";
import type { SelectTask } from "~/api/types/task.ts";
import {
  createTaskAction,
  deleteTaskAction,
  toggleTaskAction,
} from "~/client/actions/tasks.ts";
import { ConfirmDialog } from "~/client/components/confirm-dialog.tsx";
import { PageHeader } from "~/client/components/page-header.tsx";
import { Badge } from "~/client/components/ui/badge.tsx";
import { Button } from "~/client/components/ui/button.tsx";
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
import {
  useFormFieldErrors,
  useSubmissionError,
  useSubmissionSuccess,
} from "~/client/hooks/use-submission.ts";
import { cn } from "~/client/lib/utils.ts";
import { getTasksQuery } from "~/client/queries/tasks.ts";
import Plus from "~icons/ri/add-line";
import CircleCheckBig from "~icons/ri/checkbox-circle-line";
import ClipboardList from "~icons/ri/clipboard-line";
import Trash from "~icons/ri/delete-bin-line";
import {
  createEffect,
  createMemo,
  For,
  type JSX,
  Show,
  Suspense,
} from "solid-js";
import { toast } from "solid-sonner";

export const route = {
  preload: () => getTasksQuery(),
} satisfies RouteDefinition;

// A single task row. The toggle is a real <form> whose submit button *is* the
// checkbox, so it works without JS; with JS, solid-router intercepts the
// submit. Delete uses the Kobalte alert-dialog (requires JS to open).
function TaskItem(props: {
  task: SelectTask;
  completed: boolean;
  deleting: boolean;
}): JSX.Element {
  return (
    <li
      class={cn(
        "group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
        props.completed
          ? "border-transparent bg-muted/40 hover:bg-muted/70"
          : "bg-card hover:bg-accent/50",
      )}
    >
      <form method="post" action={toggleTaskAction} class="contents">
        <input type="hidden" name="id" value={props.task.id} />
        <input type="hidden" name="done" value={String(!props.task.done)} />
        <button
          type="submit"
          role="checkbox"
          aria-checked={props.completed}
          aria-label={props.task.name}
          class={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-sm border ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring",
            props.completed
              ? "border-none bg-primary text-primary-foreground"
              : "border-primary",
          )}
        >
          <Show when={props.completed}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="size-3.5"
            >
              <path d="M5 12l5 5l10 -10" />
            </svg>
          </Show>
        </button>
      </form>
      <span
        class={cn(
          "flex-1 text-sm leading-relaxed",
          props.completed &&
            "text-muted-foreground line-through decoration-muted-foreground/50",
        )}
      >
        {props.task.name}
      </span>
      <ConfirmDialog
        trigger={<Trash class="size-4" />}
        triggerVariant="ghost"
        triggerSize="icon"
        triggerAriaLabel="Delete"
        triggerClass="shrink-0 text-muted-foreground/50 transition-colors hover:text-destructive"
        variant="destructive"
        title="Delete task?"
        description={`"${props.task.name}" will be removed. This can't be undone.`}
        action={deleteTaskAction}
        hiddenFields={{ id: String(props.task.id) }}
        isPending={props.deleting}
      />
    </li>
  );
}

export default function Main(): JSX.Element {
  const tasks = createAsync(() => getTasksQuery(), { deferStream: true });

  const createSubmission = useSubmission(createTaskAction);
  const deleteSubmissions = useSubmissions(deleteTaskAction);
  const toggleSubmissions = useSubmissions(toggleTaskAction);

  let formRef!: HTMLFormElement;

  const fieldErrors = useFormFieldErrors(createSubmission);
  const nameError = (): string | undefined => fieldErrors().name;

  useSubmissionSuccess(createSubmission, {
    successMessage: "Task added",
    revalidateKey: getTasksQuery.key,
    onSuccess: () => formRef.reset(),
  });
  useSubmissionError(createSubmission, "Failed to create task");

  // Optimistic done state: while a toggle for this task is in flight, show the
  // value being submitted; otherwise show the canonical value from the list.
  const displayedDone = (task: SelectTask): boolean => {
    for (const sub of toggleSubmissions) {
      if (sub.pending && sub.input[0].get("id") === String(task.id)) {
        return sub.input[0].get("done") === "true";
      }
    }
    return task.done;
  };

  const isDeleting = (id: number): boolean => {
    for (const sub of deleteSubmissions) {
      if (sub.pending && sub.input[0].get("id") === String(id)) return true;
    }
    return false;
  };

  // Revalidate + surface success/errors for toggle submissions (covers both the
  // optimistic JS path and, harmlessly, the no-JS redirect path).
  createEffect(() => {
    for (const sub of toggleSubmissions) {
      if (sub.result !== undefined) {
        revalidate(getTasksQuery.key);
        if (sub.input[0].get("done") === "true") {
          toast.success("Task completed");
        }
        sub.clear();
      } else if (sub.error) {
        toast.error(
          Error.isError(sub.error)
            ? sub.error.message
            : "Failed to update task",
        );
        sub.clear();
      }
    }
  });

  createEffect(() => {
    for (const sub of deleteSubmissions) {
      if (sub.result !== undefined) {
        revalidate(getTasksQuery.key);
        toast.success("Task deleted");
        sub.clear();
      } else if (sub.error) {
        toast.error(
          Error.isError(sub.error)
            ? sub.error.message
            : "Failed to delete task",
        );
        sub.clear();
      }
    }
  });

  const pendingTasks = createMemo(() =>
    tasks()?.filter((t) => !displayedDone(t)) ?? []
  );

  const completedTasks = createMemo(() =>
    tasks()?.filter((t) => displayedDone(t)) ?? []
  );

  const completionPercent = createMemo(() => {
    const all = tasks();
    if (!all || all.length === 0) return 0;
    return Math.round((completedTasks().length / all.length) * 100);
  });

  return (
    <div class="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Tasks"
        description="Manage your to-do list and track your progress."
        class="flex flex-col gap-2"
      />

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
                method="post"
                action={createTaskAction}
                ref={formRef}
                class="flex gap-2"
                onInput={() => {
                  if (createSubmission.result) createSubmission.clear();
                }}
              >
                <div class="flex flex-1 flex-col gap-1">
                  <Input
                    name="name"
                    placeholder="What needs to be done?"
                    required
                    maxlength={500}
                    disabled={createSubmission.pending}
                    class="flex-1"
                    aria-invalid={!!nameError()}
                  />
                  <Show when={nameError()}>
                    <p class="text-destructive text-sm">{nameError()}</p>
                  </Show>
                </div>
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
                            <TaskItem
                              task={task}
                              completed={false}
                              deleting={isDeleting(task.id)}
                            />
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
                            <TaskItem
                              task={task}
                              completed
                              deleting={isDeleting(task.id)}
                            />
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
    </div>
  );
}

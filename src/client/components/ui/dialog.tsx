import { Button } from "~/client/components/ui/button.tsx";
import { cn } from "~/client/lib/utils.ts";
import XIcon from "~icons/lucide/x";
import { type JSX, Show } from "solid-js";

type DialogProps = {
  id: string;
  title: string;
  description?: string;
  ref?: (el: HTMLDialogElement) => void;
  onClose?: JSX.EventHandlerUnion<HTMLDialogElement, Event>;
  children: JSX.Element;
  class?: string;
};

export function Dialog(
  props: DialogProps,
): JSX.Element {
  return (
    <dialog
      id={props.id}
      ref={props.ref}
      onClose={props.onClose}
      closedby="any"
      aria-labelledby={`${props.id}-title`}
      aria-describedby={props.description
        ? `${props.id}-description`
        : undefined}
      class={cn(
        "responsive-dialog",
        "relative m-0 overflow-hidden border bg-background p-0 text-foreground shadow-lg",
        "fixed inset-x-0 top-auto bottom-0 max-h-[90vh] w-full max-w-none rounded-b-none rounded-t-lg",
        "md:inset-0 md:m-auto md:max-h-[90vh] md:w-full md:max-w-lg md:rounded-lg",
        props.class,
      )}
    >
      <button
        type="button"
        command="close"
        commandfor={props.id}
        aria-label="Close"
        class="absolute top-4 right-4 hidden rounded-sm opacity-70 ring-offset-background transition-opacity hover:cursor-pointer hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring md:flex"
      >
        <XIcon class="size-4" />
        <span class="sr-only">Close</span>
      </button>

      <header class="flex flex-col gap-2 px-6 pt-6 pb-2 text-left">
        <h2
          id={`${props.id}-title`}
          class="font-semibold text-lg leading-none"
        >
          {props.title}
        </h2>
        <Show when={props.description}>
          <p
            id={`${props.id}-description`}
            class="text-muted-foreground text-sm"
          >
            {props.description}
          </p>
        </Show>
      </header>

      <div class="max-h-[calc(90vh-10rem)] overflow-y-auto px-6 py-4 md:max-h-[calc(90vh-7rem)] md:pb-6">
        {props.children}
      </div>

      <footer class="border-t px-6 py-3 md:hidden">
        <Button
          type="button"
          variant="outline"
          class="w-full"
          command="close"
          commandfor={props.id}
        >
          Cancel
        </Button>
      </footer>
    </dialog>
  );
}

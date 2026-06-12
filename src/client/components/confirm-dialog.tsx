import { Button } from "~/client/components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/client/components/ui/dialog.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import Trash from "~icons/lucide/trash";
import XIcon from "~icons/lucide/x";
import { type JSX, Show } from "solid-js";

type ConfirmDialogVariant = "default" | "destructive";

type ConfirmDialogProps = {
  id: string;
  ref?: (el: HTMLDialogElement) => void;
  variant?: ConfirmDialogVariant;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: JSX.Element;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  onClose?: JSX.EventHandlerUnion<HTMLDialogElement, Event>;
  class?: string;
};

const DEFAULTS: Record<ConfirmDialogVariant, {
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
}> = {
  destructive: {
    title: "Are you sure?",
    description:
      "This action cannot be undone. This will permanently delete your data.",
    confirmText: "Delete",
    cancelText: "Cancel",
  },
  default: {
    title: "Discard changes?",
    description:
      "You have unsaved changes. Are you sure you want to discard them?",
    confirmText: "Discard",
    cancelText: "Continue editing",
  },
};

export function ConfirmDialog(props: ConfirmDialogProps): JSX.Element {
  const variant = (): ConfirmDialogVariant => props.variant ?? "default";
  const defaults = () => DEFAULTS[variant()];

  return (
    <Dialog
      id={props.id}
      ref={props.ref}
      onClose={props.onClose}
      role="alertdialog"
      closedby={props.isPending ? "none" : "any"}
      class={props.class}
    >
      <DialogClose
        variant="ghost"
        size="icon-sm"
        aria-label="Close"
        disabled={props.isPending}
        class="absolute top-4 right-4 hidden opacity-70 hover:bg-transparent hover:opacity-100 md:flex"
      >
        <XIcon class="size-4" />
        <span class="sr-only">Close</span>
      </DialogClose>
      <DialogHeader>
        <DialogTitle>{props.title ?? defaults().title}</DialogTitle>
        <DialogDescription>
          {props.description ?? defaults().description}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <DialogClose
          variant="outline"
          disabled={props.isPending}
          onClick={props.onCancel}
        >
          {props.cancelText ?? defaults().cancelText}
        </DialogClose>
        <Button
          variant={variant() === "destructive" ? "destructive" : "default"}
          disabled={props.isPending}
          onClick={() => props.onConfirm()}
        >
          {props.confirmText ?? defaults().confirmText}
          <Show
            when={props.isPending}
            fallback={variant() === "destructive"
              ? (props.icon ?? <Trash />)
              : null}
          >
            <Spinner class="size-4" />
          </Show>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

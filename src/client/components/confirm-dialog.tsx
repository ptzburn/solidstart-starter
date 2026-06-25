import type { Action } from "@solidjs/router";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/client/components/ui/alert-dialog.tsx";
import { Button, type buttonVariants } from "~/client/components/ui/button.tsx";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/client/components/ui/drawer.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { useMediaQuery } from "~/client/hooks/use-media-query.ts";
import { cn } from "~/client/lib/utils.ts";
import type { VariantProps } from "class-variance-authority";
import { For, type JSX, Show } from "solid-js";

type ConfirmDialogVariant = "default" | "destructive";

type ConfirmDialogProps = {
  /** Content rendered inside the trigger button. */
  trigger: JSX.Element;
  triggerVariant?: VariantProps<typeof buttonVariants>["variant"];
  triggerSize?: VariantProps<typeof buttonVariants>["size"];
  triggerClass?: string;
  triggerDisabled?: boolean;
  triggerAriaLabel?: string;
  /** Controlled open state (optional) — needed to close after async success. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: ConfirmDialogVariant;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: JSX.Element;
  isPending?: boolean;
  onConfirm?: () => void;
  action?: Action<[FormData], unknown> | Action<[], unknown>;
  hiddenFields?: Record<string, string>;
  onCancel?: () => void;
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
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const variant = (): ConfirmDialogVariant => props.variant ?? "default";
  const defaults = () => DEFAULTS[variant()];
  const confirmVariant = (): "default" | "destructive" =>
    variant() === "destructive" ? "destructive" : "default";
  const title = () => props.title ?? defaults().title;
  const description = () => props.description ?? defaults().description;
  const cancelText = () => props.cancelText ?? defaults().cancelText;

  const confirmContent = () => (
    <>
      {props.confirmText ?? defaults().confirmText}
      <Show when={props.isPending}>
        <Spinner class="size-4" />
      </Show>
    </>
  );

  const media = () => (
    <Show when={props.icon}>
      <AlertDialogMedia
        class={cn(
          "self-center",
          variant() === "destructive" &&
            "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive",
        )}
      >
        {props.icon}
      </AlertDialogMedia>
    </Show>
  );

  const confirmControl = () => (
    <Show
      when={props.action}
      fallback={
        <Button
          variant={confirmVariant()}
          disabled={props.isPending}
          onClick={() => props.onConfirm?.()}
        >
          {confirmContent()}
        </Button>
      }
    >
      {(action) => (
        <form method="post" action={action()} class="contents">
          <For each={Object.entries(props.hiddenFields ?? {})}>
            {([name, value]) => (
              <input type="hidden" name={name} value={value} />
            )}
          </For>
          <Button
            type="submit"
            variant={confirmVariant()}
            disabled={props.isPending}
          >
            {confirmContent()}
          </Button>
        </form>
      )}
    </Show>
  );

  return (
    <Show
      when={isDesktop()}
      fallback={
        <Drawer
          open={props.open}
          onOpenChange={props.onOpenChange}
          closeOnEscapeKeyDown={!props.isPending}
          closeOnOutsidePointer={!props.isPending}
        >
          <DrawerTrigger
            as={Button}
            variant={props.triggerVariant ?? "outline"}
            size={props.triggerSize}
            class={props.triggerClass}
            disabled={props.triggerDisabled}
            aria-label={props.triggerAriaLabel}
          >
            {props.trigger}
          </DrawerTrigger>
          <DrawerContent class={props.class}>
            <DrawerHeader>
              {media()}
              <DrawerTitle>{title()}</DrawerTitle>
              <DrawerDescription>{description()}</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              {confirmControl()}
              <DrawerClose
                as={Button}
                variant="outline"
                disabled={props.isPending}
                onClick={props.onCancel}
              >
                {cancelText()}
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      }
    >
      <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
        <AlertDialogTrigger
          as={Button}
          variant={props.triggerVariant ?? "outline"}
          size={props.triggerSize}
          class={props.triggerClass}
          disabled={props.triggerDisabled}
          aria-label={props.triggerAriaLabel}
        >
          {props.trigger}
        </AlertDialogTrigger>
        <AlertDialogContent
          size="sm"
          class={props.class}
          onEscapeKeyDown={(e: KeyboardEvent) => {
            if (props.isPending) e.preventDefault();
          }}
          onInteractOutside={(e: Event) => {
            if (props.isPending) e.preventDefault();
          }}
        >
          <AlertDialogHeader>
            {media()}
            <AlertDialogTitle>{title()}</AlertDialogTitle>
            <AlertDialogDescription>{description()}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={props.isPending}
              onClick={props.onCancel}
            >
              {cancelText()}
            </AlertDialogCancel>
            {confirmControl()}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Show>
  );
}

import { Button } from "~/client/components/ui/button.tsx";
import { cn } from "~/client/lib/utils.ts";
import XIcon from "~icons/lucide/x";
import {
  type ComponentProps,
  createContext,
  type JSX,
  Show,
  splitProps,
  useContext,
} from "solid-js";

type DialogContextValue = { id: string };
const DialogContext = createContext<DialogContextValue | undefined>(undefined);

function useDialogContext(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("Dialog part must be used inside <Dialog>");
  }
  return ctx;
}

type DialogProps = {
  id: string;
  ref?: (el: HTMLDialogElement) => void;
  onClose?: JSX.EventHandlerUnion<HTMLDialogElement, Event>;
  closedby?: "any" | "closerequest" | "none";
  role?: "dialog" | "alertdialog";
  class?: string;
  children: JSX.Element;
};

export function Dialog(props: DialogProps): JSX.Element {
  return (
    <DialogContext.Provider value={{ id: props.id }}>
      <dialog
        id={props.id}
        ref={props.ref}
        onClose={props.onClose}
        closedby={props.closedby ?? "any"}
        role={props.role}
        aria-labelledby={`${props.id}-title`}
        aria-describedby={`${props.id}-description`}
        class={cn(
          "responsive-dialog",
          "relative m-0 overflow-hidden border bg-background p-0 text-foreground shadow-lg",
          "fixed inset-x-0 top-auto bottom-0 max-h-[90vh] w-full max-w-none rounded-b-none rounded-t-lg",
          "md:inset-0 md:m-auto md:max-h-[90vh] md:w-full md:max-w-lg md:rounded-lg",
          props.class,
        )}
      >
        {props.children}
      </dialog>
    </DialogContext.Provider>
  );
}

type DialogTriggerProps = ComponentProps<typeof Button> & { for: string };

export function DialogTrigger(props: DialogTriggerProps): JSX.Element {
  const [local, rest] = splitProps(props, ["for"]);
  return <Button command="show-modal" commandfor={local.for} {...rest} />;
}

type DialogCloseProps = ComponentProps<typeof Button> & { for?: string };

export function DialogClose(props: DialogCloseProps): JSX.Element {
  const ctx = useContext(DialogContext);
  const [local, rest] = splitProps(props, ["for"]);
  const targetId = (): string | undefined => local.for ?? ctx?.id;
  return <Button command="close" commandfor={targetId()} {...rest} />;
}

type DivProps = ComponentProps<"div">;

export function DialogHeader(props: ComponentProps<"header">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <header
      class={cn("flex flex-col gap-2 px-6 pt-6 pb-2 text-left", local.class)}
      {...rest}
    />
  );
}

export function DialogContent(props: DivProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      tabindex="-1"
      autofocus
      class={cn(
        "max-h-[calc(90vh-10rem)] overflow-y-auto px-6 py-4 outline-none md:max-h-[calc(90vh-7rem)] md:pb-6",
        local.class,
      )}
      {...rest}
    />
  );
}

export function DialogFooter(props: ComponentProps<"footer">): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <footer
      class={cn("px-6 py-3", local.class)}
      {...rest}
    />
  );
}

export function DialogTitle(
  props: Omit<ComponentProps<"h2">, "id">,
): JSX.Element {
  const ctx = useDialogContext();
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <h2
      id={`${ctx.id}-title`}
      class={cn("font-semibold text-lg leading-none", local.class)}
      {...rest}
    />
  );
}

export function DialogDescription(
  props: Omit<ComponentProps<"p">, "id">,
): JSX.Element {
  const ctx = useDialogContext();
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <p
      id={`${ctx.id}-description`}
      class={cn("text-muted-foreground text-sm", local.class)}
      {...rest}
    />
  );
}

type ResponsiveDialogProps = {
  id: string;
  title: string;
  description?: string;
  ref?: (el: HTMLDialogElement) => void;
  onClose?: JSX.EventHandlerUnion<HTMLDialogElement, Event>;
  children: JSX.Element;
  class?: string;
};

export function ResponsiveDialog(props: ResponsiveDialogProps): JSX.Element {
  return (
    <Dialog
      id={props.id}
      ref={props.ref}
      onClose={props.onClose}
      class={props.class}
    >
      <DialogClose
        variant="ghost"
        size="icon-sm"
        aria-label="Close"
        class="absolute top-4 right-4 hidden opacity-70 hover:bg-transparent hover:opacity-100 md:flex"
      >
        <XIcon class="size-4" />
        <span class="sr-only">Close</span>
      </DialogClose>
      <DialogHeader>
        <DialogTitle>{props.title}</DialogTitle>
        <Show when={props.description}>
          <DialogDescription>{props.description}</DialogDescription>
        </Show>
      </DialogHeader>
      <DialogContent>{props.children}</DialogContent>
      <DialogFooter class="border-t md:hidden">
        <DialogClose variant="outline" class="w-full">
          Cancel
        </DialogClose>
      </DialogFooter>
    </Dialog>
  );
}

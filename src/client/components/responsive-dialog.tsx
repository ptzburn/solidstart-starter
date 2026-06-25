import { Button, type buttonVariants } from "~/client/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/client/components/ui/dialog-kobalte.tsx";
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
import { useMediaQuery } from "~/client/hooks/use-media-query.ts";
import { cn } from "~/client/lib/utils.ts";
import type { VariantProps } from "class-variance-authority";
import { type JSX, Show, splitProps } from "solid-js";

type ResponsiveDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: JSX.Element;
  description?: JSX.Element;
  /** Content rendered inside the trigger button (label, icon, etc.). */
  trigger?: JSX.Element;
  triggerVariant?: VariantProps<typeof buttonVariants>["variant"];
  triggerSize?: VariantProps<typeof buttonVariants>["size"];
  triggerClass?: string;
  /** Class applied to the dialog content (desktop only). */
  class?: string;
  children: JSX.Element;
};

export function ResponsiveDialog(props: ResponsiveDialogProps): JSX.Element {
  const [local] = splitProps(props, [
    "open",
    "onOpenChange",
    "title",
    "description",
    "trigger",
    "triggerVariant",
    "triggerSize",
    "triggerClass",
    "class",
    "children",
  ]);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <Show
      when={isDesktop()}
      fallback={
        <Drawer open={local.open} onOpenChange={local.onOpenChange}>
          <Show when={local.trigger}>
            <DrawerTrigger
              as={Button}
              variant={local.triggerVariant ?? "outline"}
              size={local.triggerSize}
              class={local.triggerClass}
            >
              {local.trigger}
            </DrawerTrigger>
          </Show>
          <DrawerContent>
            <DrawerHeader class="text-left">
              <DrawerTitle>{local.title}</DrawerTitle>
              <Show when={local.description}>
                <DrawerDescription>{local.description}</DrawerDescription>
              </Show>
            </DrawerHeader>
            <div class="px-4">{local.children}</div>
            <DrawerFooter class="pt-2">
              <DrawerClose as={Button} variant="outline">
                Cancel
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      }
    >
      <Dialog open={local.open} onOpenChange={local.onOpenChange}>
        <Show when={local.trigger}>
          <DialogTrigger
            as={Button}
            variant={local.triggerVariant ?? "outline"}
            size={local.triggerSize}
            class={local.triggerClass}
          >
            {local.trigger}
          </DialogTrigger>
        </Show>
        <DialogContent class={cn("sm:max-w-[425px]", local.class)}>
          <DialogHeader>
            <DialogTitle>{local.title}</DialogTitle>
            <Show when={local.description}>
              <DialogDescription>{local.description}</DialogDescription>
            </Show>
          </DialogHeader>
          {local.children}
        </DialogContent>
      </Dialog>
    </Show>
  );
}

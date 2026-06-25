import { cn } from "~/client/lib/utils.ts";
import { type Component, type ComponentProps, splitProps } from "solid-js";

const Input: Component<ComponentProps<"input">> = (props) => {
  const [local, others] = splitProps(props, ["class", "type"]);

  return (
    <input
      type={local.type}
      data-slot="input"
      class={cn(
        // Matches the shadcn React original 1:1.
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none transition-colors file:inline-flex file:h-6 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        // Project additions: selection color + native (no-JS) validation feedback,
        // mirroring the aria-invalid block above so native and server errors match.
        "selection:bg-primary selection:text-primary-foreground",
        "dark:user-invalid:border-destructive/50 dark:user-invalid:ring-destructive/40 user-invalid:border-destructive user-invalid:ring-3 user-invalid:ring-destructive/20",
        local.class,
      )}
      {...others}
    />
  );
};

export { Input };

import { cn } from "~/client/lib/utils.ts";
import type { Component, ComponentProps } from "solid-js";

import { splitProps } from "solid-js";

const Textarea: Component<ComponentProps<"textarea">> = (props) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <textarea
      data-slot="textarea"
      class={cn(
        // Matches the shadcn React original 1:1.
        "field-sizing-content flex min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
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

export { Textarea };

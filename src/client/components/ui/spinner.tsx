import { cn } from "~/client/lib/utils.ts";
import LoaderCircle from "~icons/ri/loader-4-line";

import { type Component, type ComponentProps, splitProps } from "solid-js";

const Spinner: Component<ComponentProps<"svg">> = (props) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <LoaderCircle
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      class={cn("size-4 animate-spin", local.class)}
      {...others}
    />
  );
};

export { Spinner };

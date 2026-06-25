import { useColorMode } from "@kobalte/core";
import CircleCheckIcon from "~icons/lucide/circle-check";
import InfoIcon from "~icons/lucide/info";
import LoaderCircleIcon from "~icons/lucide/loader-circle";
import OctagonXIcon from "~icons/lucide/octagon-x";
import TriangleAlertIcon from "~icons/lucide/triangle-alert";
import type { Component, ComponentProps } from "solid-js";

import { Toaster as Sonner } from "solid-sonner";

type ToasterProps = ComponentProps<typeof Sonner>;

const Toaster: Component<ToasterProps> = (props) => {
  const { colorMode } = useColorMode();

  return (
    <Sonner
      theme={colorMode()}
      class="group toaster"
      icons={{
        success: <CircleCheckIcon class="size-4" />,
        info: <InfoIcon class="size-4" />,
        warning: <TriangleAlertIcon class="size-4" />,
        error: <OctagonXIcon class="size-4" />,
        loading: <LoaderCircleIcon class="size-4 animate-spin" />,
      }}
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
        "--border-radius": "var(--radius)",
      }}
      toastOptions={{
        classes: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

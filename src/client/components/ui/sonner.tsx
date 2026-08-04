import { useColorMode } from "@kobalte/core";
import TriangleAlertIcon from "~icons/ri/alert-line";
import CircleCheckIcon from "~icons/ri/checkbox-circle-line";
import CircleXIcon from "~icons/ri/close-circle-line";
import InfoIcon from "~icons/ri/information-line";
import LoaderCircleIcon from "~icons/ri/loader-4-line";
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
        error: <CircleXIcon class="size-4" />,
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

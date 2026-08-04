import type { DynamicProps, InputProps, RootProps } from "@corvu/otp-field";
import OtpField from "@corvu/otp-field";

import { cn } from "~/client/lib/utils.ts";
import Minus from "~icons/ri/subtract-line";
import type { Component, ComponentProps, ValidComponent } from "solid-js";

import { Show, splitProps } from "solid-js";

type InputOTPProps<T extends ValidComponent = "div"> = RootProps<T> & {
  class?: string;
};

const InputOTP = <T extends ValidComponent = "div">(
  props: DynamicProps<T, InputOTPProps<T>>,
) => {
  const [local, others] = splitProps(props as InputOTPProps, ["class"]);
  return (
    <OtpField
      class={cn(
        "cn-input-otp flex items-center has-disabled:opacity-50",
        local.class,
      )}
      {...others}
    />
  );
};

type InputOTPInputProps<T extends ValidComponent = "input"> = InputProps<T> & {
  class?: string;
};

const InputOTPInput = <T extends ValidComponent = "input">(
  props: DynamicProps<T, InputOTPInputProps<T>>,
) => {
  const [local, others] = splitProps(props as InputOTPInputProps, ["class"]);
  return (
    <OtpField.Input
      data-slot="input-otp"
      spellcheck={false}
      class={cn("disabled:cursor-not-allowed", local.class)}
      {...others}
    />
  );
};

const InputOTPGroup: Component<ComponentProps<"div">> = (props) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="input-otp-group"
      class={cn(
        "flex items-center rounded-lg dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20",
        local.class,
      )}
      {...others}
    />
  );
};

const InputOTPSlot: Component<ComponentProps<"div"> & { index: number }> = (
  props,
) => {
  const [local, others] = splitProps(props, ["class", "index"]);
  const context = OtpField.useContext();
  const char = () => context.value()[local.index];
  const showFakeCaret = () =>
    context.value().length === local.index && context.isInserting();
  const isActive = () => context.activeSlots().includes(local.index);

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive()}
      class={cn(
        "relative flex size-8 items-center justify-center border-input border-r border-y text-sm outline-none transition-all first:rounded-l-lg first:border-l last:rounded-r-lg dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40 data-[active=true]:z-10 aria-invalid:border-destructive data-[active=true]:border-ring data-[active=true]:ring-3 data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20",
        local.class,
      )}
      {...others}
    >
      {char()}
      <Show when={showFakeCaret()}>
        <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div class="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      </Show>
    </div>
  );
};

const InputOTPSeparator: Component<ComponentProps<"div">> = (props) => {
  return (
    <div
      data-slot="input-otp-separator"
      class="flex items-center [&_svg:not([class*='size-'])]:size-4"
      role="separator"
      {...props}
    >
      <Minus />
    </div>
  );
};

export {
  InputOTP,
  InputOTPGroup,
  InputOTPInput,
  InputOTPSeparator,
  InputOTPSlot,
};

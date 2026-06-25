import {
  Field,
  FieldError,
  FieldLabel,
} from "~/client/components/ui/field.tsx";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPInput,
  InputOTPSeparator,
  InputOTPSlot,
} from "~/client/components/ui/input-otp.tsx";
import { createSignal, type JSX, Show } from "solid-js";

type OTPFieldProps = {
  name: string;
  label?: JSX.Element;
  hint?: string;
  error?: string;
  disabled?: boolean;
  autofocus?: boolean;
};

export function OTPField(props: OTPFieldProps): JSX.Element {
  const [value, setValue] = createSignal("");
  const inputId = () => props.name;

  return (
    <Field data-invalid={!!props.error}>
      <Show when={props.label}>
        <FieldLabel for={inputId()}>{props.label}</FieldLabel>
      </Show>
      <div class="flex justify-center">
        <InputOTP
          maxLength={6}
          value={value()}
          onValueChange={(v) => setValue(v.replace(/\D/g, "").slice(0, 6))}
          autofocus={props.autofocus}
          aria-invalid={!!props.error}
        >
          <InputOTPGroup>
            {[0, 1, 2].map((index) => <InputOTPSlot index={index} />)}
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            {[3, 4, 5].map((index) => <InputOTPSlot index={index} />)}
          </InputOTPGroup>
          <InputOTPInput
            id={inputId()}
            name={props.name}
            disabled={props.disabled}
          />
        </InputOTP>
      </div>
      <FieldError errors={[{ message: props.error ?? props.hint ?? "" }]} />
    </Field>
  );
}

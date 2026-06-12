import {
  Field,
  FieldError,
  FieldLabel,
} from "~/client/components/ui/field.tsx";
import {
  OTPField as OTPFieldRoot,
  OTPFieldGroup,
  OTPFieldInput,
  OTPFieldSeparator,
  OTPFieldSlot,
} from "~/client/components/ui/otp-field.tsx";
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
        <OTPFieldRoot
          maxLength={6}
          value={value()}
          onValueChange={(v) => setValue(v.replace(/\D/g, "").slice(0, 6))}
          autofocus={props.autofocus}
          aria-invalid={!!props.error}
        >
          <OTPFieldGroup>
            {[0, 1, 2].map((index) => <OTPFieldSlot index={index} />)}
          </OTPFieldGroup>
          <OTPFieldSeparator />
          <OTPFieldGroup>
            {[3, 4, 5].map((index) => <OTPFieldSlot index={index} />)}
          </OTPFieldGroup>
          <OTPFieldInput
            id={inputId()}
            name={props.name}
            disabled={props.disabled}
          />
        </OTPFieldRoot>
      </div>
      <FieldError errors={[{ message: props.error ?? props.hint ?? "" }]} />
    </Field>
  );
}

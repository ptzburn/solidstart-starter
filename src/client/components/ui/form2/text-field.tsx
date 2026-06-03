import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "~/client/components/ui/field.tsx";
import { Input } from "~/client/components/ui/input.tsx";
import { type ComponentProps, type JSX, splitProps } from "solid-js";

type TextFieldProps = ComponentProps<"input"> & {
  name: string;
  label: JSX.Element;
  hint?: string;
  error?: string;
};

export function TextField(props: TextFieldProps): JSX.Element {
  const [local, inputProps] = splitProps(props, [
    "name",
    "label",
    "hint",
    "error",
    "id",
  ]);
  const inputId = () => local.id ?? local.name;

  return (
    <Field data-invalid={!!local.error}>
      <FieldContent>
        <FieldLabel for={inputId()}>{local.label}</FieldLabel>
      </FieldContent>
      <Input
        id={inputId()}
        name={local.name}
        aria-invalid={!!local.error}
        class="peer"
        {...inputProps}
      />
      <FieldError
        errors={[{ message: local.error ?? local.hint ?? "" }]}
        class={local.error ? undefined : "hidden peer-user-invalid:block"}
      />
    </Field>
  );
}

import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "~/client/components/ui/field.tsx";
import { Textarea } from "~/client/components/ui/textarea.tsx";
import { type ComponentProps, type JSX, splitProps } from "solid-js";

type TextareaFieldProps = ComponentProps<"textarea"> & {
  name: string;
  label: JSX.Element;
  hint?: string;
  error?: string;
};

export function TextareaField(props: TextareaFieldProps): JSX.Element {
  const [local, textareaProps] = splitProps(props, [
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
      <Textarea
        id={inputId()}
        name={local.name}
        aria-invalid={!!local.error}
        class="peer"
        {...textareaProps}
      />
      <FieldError
        errors={[{ message: local.error ?? local.hint ?? "" }]}
        class={local.error ? undefined : "hidden peer-user-invalid:block"}
      />
    </Field>
  );
}

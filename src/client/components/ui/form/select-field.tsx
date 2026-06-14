import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "~/client/components/ui/field.tsx";
import { cn } from "~/client/lib/utils.ts";
import { type ComponentProps, For, type JSX, splitProps } from "solid-js";

type SelectFieldProps = ComponentProps<"select"> & {
  name: string;
  label: JSX.Element;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
};

export function SelectField(props: SelectFieldProps): JSX.Element {
  const [local, selectProps] = splitProps(props, [
    "name",
    "label",
    "hint",
    "error",
    "id",
    "options",
    "class",
  ]);
  const inputId = () => local.id ?? local.name;

  return (
    <Field data-invalid={!!local.error}>
      <FieldContent>
        <FieldLabel for={inputId()}>{local.label}</FieldLabel>
      </FieldContent>
      <select
        id={inputId()}
        name={local.name}
        aria-invalid={!!local.error}
        class={cn(
          "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs dark:bg-input/30",
          "outline-none transition-[color,box-shadow]",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "dark:aria-invalid:ring-destructive/40 aria-invalid:ring-destructive/20",
          "aria-invalid:border-destructive",
          "peer",
          local.class,
        )}
        {...selectProps}
      >
        <For each={local.options}>
          {(option) => <option value={option.value}>{option.label}</option>}
        </For>
      </select>
      <FieldError
        errors={[{ message: local.error ?? local.hint ?? "" }]}
        class={local.error ? undefined : "hidden peer-user-invalid:block"}
      />
    </Field>
  );
}

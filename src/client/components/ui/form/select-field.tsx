import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "~/client/components/ui/field.tsx";
import {
  Select,
  SelectContent,
  SelectHiddenSelect,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/client/components/ui/select.tsx";
import { cn } from "~/client/lib/utils.ts";
import { type JSX, Show } from "solid-js";

type Option = { value: string; label: string };

type SelectFieldProps = {
  name: string;
  label: JSX.Element;
  hint?: string;
  error?: string;
  id?: string;
  options: Option[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  class?: string;
};

export function SelectField(props: SelectFieldProps): JSX.Element {
  const inputId = (): string => props.id ?? props.name;

  const selected = (): Option | null | undefined =>
    props.value === undefined
      ? undefined
      : props.options.find((option) => option.value === props.value) ?? null;

  const defaultSelected = (): Option | undefined =>
    props.defaultValue === undefined
      ? undefined
      : props.options.find((option) => option.value === props.defaultValue);

  return (
    <Field data-invalid={!!props.error}>
      <FieldContent>
        <FieldLabel for={inputId()}>{props.label}</FieldLabel>
      </FieldContent>
      <Select<Option>
        name={props.name}
        options={props.options}
        optionValue="value"
        optionTextValue="label"
        disallowEmptySelection
        value={selected()}
        defaultValue={defaultSelected()}
        onChange={(option) => props.onChange?.(option?.value ?? "")}
        disabled={props.disabled}
        placeholder={props.placeholder}
        validationState={props.error ? "invalid" : "valid"}
        itemComponent={(itemProps) => (
          <SelectItem item={itemProps.item}>
            {itemProps.item.rawValue.label}
          </SelectItem>
        )}
      >
        <SelectHiddenSelect />
        <SelectTrigger id={inputId()} class={cn("w-full", props.class)}>
          <SelectValue<Option>>
            {(state) => state.selectedOption()?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent />
      </Select>
      <Show when={props.error}>
        <FieldError errors={[{ message: props.error }]} />
      </Show>
      <Show when={!props.error && props.hint}>
        <FieldDescription>{props.hint}</FieldDescription>
      </Show>
    </Field>
  );
}

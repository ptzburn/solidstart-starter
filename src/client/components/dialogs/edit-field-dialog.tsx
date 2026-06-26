import { type Action, useSubmission } from "@solidjs/router";
import { ResponsiveDialog } from "~/client/components/responsive-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import {
  useFormFieldErrors,
  useSubmissionError,
  useSubmissionSuccess,
} from "~/client/hooks/use-submission.ts";
import {
  type Accessor,
  createSignal,
  createUniqueId,
  type JSX,
  Show,
} from "solid-js";

// The result shape every edit-field action returns: success or inline field
// errors. (Multi-step dialogs that return extra payload use their own scaffold.)
type EditFieldResult =
  | { ok: true }
  | { fieldErrors: Record<string, string | undefined> };

type EditFieldDialogChildContext = {
  fieldErrors: Accessor<Record<string, string | undefined>>;
  pending: Accessor<boolean>;
};

type EditFieldDialogProps = {
  action: Action<[FormData], EditFieldResult>;
  trigger: JSX.Element;
  title: JSX.Element;
  description?: JSX.Element;
  submitLabel?: string;
  successMessage: string;
  errorMessage?: string;
  revalidateKey?: string;
  resetOnSuccess?: boolean;
  // Scopes the submission to one user (admin dialogs) and emits a hidden userId
  // field. Omit for the current-user dialogs, which have a single submission.
  userId?: string;
  formClass?: string;
  children: (ctx: EditFieldDialogChildContext) => JSX.Element;
};

// One dialog shell for every "edit a field via a server action" form: it owns
// the open state, the ResponsiveDialog + submit/cancel footer, the post form
// with clear-on-input, and the submission lifecycle (toast, revalidate, close).
// Call sites supply the action, copy, and the field(s) as a render prop that
// receives the field errors and pending state.
export function EditFieldDialog(props: EditFieldDialogProps): JSX.Element {
  const [open, setOpen] = createSignal(false);
  const formId = createUniqueId();
  let formRef: HTMLFormElement | undefined;

  const submission = useSubmission(
    props.action,
    ([formData]) =>
      props.userId === undefined || formData.get("userId") === props.userId,
  );

  const fieldErrors = useFormFieldErrors(submission);

  useSubmissionSuccess(submission, {
    successMessage: props.successMessage,
    revalidateKey: props.revalidateKey,
    onSuccess: () => {
      if (props.resetOnSuccess) formRef?.reset();
      setOpen(false);
    },
  });
  useSubmissionError(submission, props.errorMessage);

  return (
    <ResponsiveDialog
      open={open()}
      onOpenChange={setOpen}
      trigger={props.trigger}
      triggerVariant="outline"
      triggerSize="default"
      title={props.title}
      description={props.description}
      footer={
        <Button type="submit" form={formId} disabled={submission.pending}>
          {props.submitLabel ?? "Save"}
        </Button>
      }
    >
      <form
        id={formId}
        ref={(el) => (formRef = el)}
        method="post"
        action={props.action}
        class={props.formClass ?? "space-y-4"}
        onInput={() => {
          if (submission.result) submission.clear();
        }}
      >
        <Show when={props.userId !== undefined}>
          <input type="hidden" name="userId" value={props.userId} />
        </Show>
        {props.children({
          fieldErrors,
          pending: () => submission.pending ?? false,
        })}
      </form>
    </ResponsiveDialog>
  );
}

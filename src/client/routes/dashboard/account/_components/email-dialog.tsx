import { useSubmission } from "@solidjs/router";
import { requestEmailChange } from "~/client/actions/users.ts";
import { ResponsiveDialog } from "~/client/components/responsive-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { TextField } from "~/client/components/ui/form/text-field.tsx";
import { createEffect, createSignal, type JSX } from "solid-js";
import { toast } from "solid-sonner";

type EmailDialogProps = {
  currentEmail: string;
};

const FORM_ID = "edit-email-form";

export function EmailDialog(props: EmailDialogProps): JSX.Element {
  const [open, setOpen] = createSignal(false);
  const submission = useSubmission(requestEmailChange);
  const fieldErrors = (): Record<string, string | undefined> =>
    submission.result && "fieldErrors" in submission.result
      ? submission.result.fieldErrors ?? {}
      : {};

  createEffect(() => {
    if (submission.result && "ok" in submission.result) {
      setOpen(false);
      toast.success("Confirmation link sent to your current email");
      submission.clear();
    }
  });

  createEffect(() => {
    if (submission.error) {
      toast.error(submission.error.message || "Failed to update email");
      submission.clear();
    }
  });

  return (
    <ResponsiveDialog
      open={open()}
      onOpenChange={setOpen}
      trigger="Edit email"
      triggerVariant="outline"
      triggerSize="sm"
      title="Edit email"
      footer={
        <Button type="submit" form={FORM_ID} disabled={submission.pending}>
          Save
        </Button>
      }
    >
      <form
        id={FORM_ID}
        method="post"
        action={requestEmailChange}
        class="space-y-4"
        onInput={() => {
          if (submission.result) submission.clear();
        }}
      >
        <TextField
          name="email"
          type="email"
          label="Email"
          placeholder="johndoe@example.com"
          value={props.currentEmail}
          required
          error={fieldErrors().email}
          disabled={submission.pending}
        />
      </form>
    </ResponsiveDialog>
  );
}

import { revalidate, useSubmission } from "@solidjs/router";
import { changePassword } from "~/client/actions/auth.ts";
import { ResponsiveDialog } from "~/client/components/responsive-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { TextField } from "~/client/components/ui/form/text-field.tsx";
import { listSessionsQuery } from "~/client/queries/auth.ts";
import { createEffect, createSignal, type JSX } from "solid-js";
import { toast } from "solid-sonner";

const FORM_ID = "change-password-form";

export function ChangePasswordDialog(): JSX.Element {
  const [open, setOpen] = createSignal(false);
  let formRef!: HTMLFormElement;
  const submission = useSubmission(changePassword);

  const fieldErrors = (): Record<string, string | undefined> =>
    submission.result && "fieldErrors" in submission.result
      ? submission.result.fieldErrors ?? {}
      : {};

  createEffect(() => {
    if (submission.result && "ok" in submission.result) {
      formRef.reset();
      setOpen(false);
      toast.success("Password changed successfully");
      revalidate(listSessionsQuery.key);
      submission.clear();
    }
  });

  createEffect(() => {
    if (submission.error) {
      toast.error(submission.error.message || "Failed to change password");
      submission.clear();
    }
  });

  return (
    <ResponsiveDialog
      open={open()}
      onOpenChange={setOpen}
      trigger="Change password"
      triggerVariant="outline"
      triggerSize="sm"
      title="Change password"
      description="Update your account password"
      footer={
        <Button type="submit" form={FORM_ID} disabled={submission.pending}>
          Change password
        </Button>
      }
    >
      <form
        id={FORM_ID}
        ref={(el) => formRef = el}
        method="post"
        action={changePassword}
        class="space-y-4"
        onInput={() => {
          if (submission.result) submission.clear();
        }}
      >
        <TextField
          name="currentPassword"
          label="Current password"
          type="password"
          placeholder="Enter your current password"
          required
          hint="Enter your current password"
          error={fieldErrors().currentPassword}
          disabled={submission.pending}
        />
        <TextField
          name="newPassword"
          label="New password"
          type="password"
          placeholder="Enter your new password"
          minlength={8}
          required
          hint="At least 8 characters"
          error={fieldErrors().newPassword}
          disabled={submission.pending}
        />
        <TextField
          name="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="Re-enter your new password"
          minlength={8}
          required
          hint="Re-enter your new password"
          error={fieldErrors().confirmPassword}
          disabled={submission.pending}
        />
      </form>
    </ResponsiveDialog>
  );
}

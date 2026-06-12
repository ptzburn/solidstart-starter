import { revalidate, useSubmission } from "@solidjs/router";
import { changePassword } from "~/client/actions/auth.ts";
import { Button } from "~/client/components/ui/button.tsx";
import { ResponsiveDialog } from "~/client/components/ui/dialog.tsx";
import { TextField } from "~/client/components/ui/form2/text-field.tsx";
import { listSessionsQuery } from "~/client/queries/auth.ts";
import { createEffect, type JSX } from "solid-js";
import { toast } from "solid-sonner";

const DIALOG_ID = "change-password-dialog";

export function ChangePasswordDialog(): JSX.Element {
  let dialogRef!: HTMLDialogElement;
  let formRef!: HTMLFormElement;
  const submission = useSubmission(changePassword);

  const fieldErrors = (): Record<string, string | undefined> =>
    submission.result && "fieldErrors" in submission.result
      ? submission.result.fieldErrors ?? {}
      : {};

  createEffect(() => {
    if (submission.result && "ok" in submission.result) {
      formRef.reset();
      dialogRef.close();
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
    <>
      <Button
        variant="outline"
        size="sm"
        command="show-modal"
        commandfor={DIALOG_ID}
      >
        Change password
      </Button>

      <ResponsiveDialog
        id={DIALOG_ID}
        ref={(el) => dialogRef = el}
        title="Change password"
        description="Update your account password"
      >
        <form
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
          <Button
            type="submit"
            class="w-full"
            disabled={submission.pending}
          >
            Change password
          </Button>
        </form>
      </ResponsiveDialog>
    </>
  );
}

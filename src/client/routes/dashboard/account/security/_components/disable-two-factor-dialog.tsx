import { revalidate, useSubmission } from "@solidjs/router";
import { disableTwoFactor } from "~/client/actions/auth.ts";
import { Button } from "~/client/components/ui/button.tsx";
import { ResponsiveDialog } from "~/client/components/ui/dialog.tsx";
import { TextField } from "~/client/components/ui/form2/text-field.tsx";
import { getSessionQuery } from "~/client/queries/auth.ts";
import { createEffect, type JSX } from "solid-js";
import { toast } from "solid-sonner";

const DIALOG_ID = "disable-two-factor-dialog";

export function DisableTwoFactorDialog(): JSX.Element {
  let dialogRef!: HTMLDialogElement;
  let formRef!: HTMLFormElement;
  const submission = useSubmission(disableTwoFactor);

  const fieldErrors = (): Record<string, string | undefined> =>
    submission.result && "fieldErrors" in submission.result
      ? submission.result.fieldErrors ?? {}
      : {};

  createEffect(() => {
    if (submission.result && "ok" in submission.result) {
      formRef.reset();
      dialogRef.close();
      toast.success("Two-factor authentication disabled");
      revalidate(getSessionQuery.key);
      submission.clear();
    }
  });

  createEffect(() => {
    if (submission.error) {
      toast.error(
        submission.error.message ||
          "Failed to disable two-factor authentication",
      );
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
        Disable
      </Button>

      <ResponsiveDialog
        id={DIALOG_ID}
        ref={(el) => dialogRef = el}
        title="Disable two-factor authentication"
        description="Enter your password to disable two-factor authentication"
      >
        <form
          ref={(el) => formRef = el}
          method="post"
          action={disableTwoFactor}
          class="space-y-4"
          onInput={() => {
            if (submission.result) submission.clear();
          }}
        >
          <TextField
            name="password"
            label="Password"
            type="password"
            placeholder="Current password"
            required
            hint="Enter your current password"
            error={fieldErrors().password}
            disabled={submission.pending}
          />
          <Button
            type="submit"
            class="w-full"
            disabled={submission.pending}
          >
            Disable
          </Button>
        </form>
      </ResponsiveDialog>
    </>
  );
}

import { revalidate, useSubmission } from "@solidjs/router";
import { generateBackupCodes } from "~/client/actions/auth.ts";
import { Button } from "~/client/components/ui/button.tsx";
import { ResponsiveDialog } from "~/client/components/ui/dialog.tsx";
import { TextField } from "~/client/components/ui/form/text-field.tsx";
import { viewNumberOfBackupCodesQuery } from "~/client/queries/auth.ts";
import { createEffect, type JSX, Match, Switch } from "solid-js";
import { toast } from "solid-sonner";
import { BackupCodesStep } from "./backup-codes-step.tsx";

const DIALOG_ID = "regenerate-backup-codes-dialog";

export function RegenerateBackupCodesDialog(): JSX.Element {
  let dialogRef!: HTMLDialogElement;
  let formRef!: HTMLFormElement;
  const submission = useSubmission(generateBackupCodes);

  const fieldErrors = (): Record<string, string | undefined> =>
    submission.result && "fieldErrors" in submission.result
      ? submission.result.fieldErrors ?? {}
      : {};

  const codes = (): string[] =>
    submission.result && "ok" in submission.result
      ? submission.result.backupCodes ?? []
      : [];

  const step = (): "password" | "codes" =>
    codes().length > 0 ? "codes" : "password";

  createEffect(() => {
    if (submission.result && "ok" in submission.result) {
      revalidate(viewNumberOfBackupCodesQuery.key);
    }
  });

  createEffect(() => {
    if (submission.error) {
      toast.error(
        submission.error.message || "Failed to regenerate backup codes",
      );
      submission.clear();
    }
  });

  function handleDialogClose(): void {
    formRef?.reset();
    submission.clear();
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        command="show-modal"
        commandfor={DIALOG_ID}
      >
        Regenerate
      </Button>

      <ResponsiveDialog
        id={DIALOG_ID}
        ref={(el) => dialogRef = el}
        onClose={handleDialogClose}
        title={step() === "codes"
          ? "Save your new backup codes"
          : "Regenerate backup codes"}
        description={step() === "codes"
          ? "Your old codes have been replaced. Store these codes in a safe place."
          : "Enter your password to regenerate backup codes. This will invalidate your old codes."}
      >
        <Switch>
          <Match when={step() === "password"}>
            <form
              ref={(el) => formRef = el}
              method="post"
              action={generateBackupCodes}
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
                Regenerate
              </Button>
            </form>
          </Match>
          <Match when={step() === "codes"}>
            <BackupCodesStep
              backupCodes={codes()}
              onDone={() => dialogRef.close()}
            />
          </Match>
        </Switch>
      </ResponsiveDialog>
    </>
  );
}

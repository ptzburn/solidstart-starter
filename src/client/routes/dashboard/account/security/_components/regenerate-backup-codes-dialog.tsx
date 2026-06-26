import { revalidate, useSubmission } from "@solidjs/router";
import { generateBackupCodes } from "~/client/actions/auth.ts";
import { ResponsiveDialog } from "~/client/components/responsive-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { TextField } from "~/client/components/ui/form/text-field.tsx";
import { viewNumberOfBackupCodesQuery } from "~/client/queries/auth.ts";
import { createEffect, createSignal, type JSX, Match, Switch } from "solid-js";
import { toast } from "solid-sonner";
import { BackupCodesStep } from "./backup-codes-step.tsx";

const FORM_ID = "regenerate-backup-codes-form";

export function RegenerateBackupCodesDialog(): JSX.Element {
  const [open, setOpen] = createSignal(false);
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
    if (codes().length > 0) {
      toast.success("Backup codes regenerated");
    }
    formRef?.reset();
    submission.clear();
  }

  return (
    <ResponsiveDialog
      open={open()}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) handleDialogClose();
      }}
      trigger="Regenerate"
      triggerVariant="outline"
      triggerSize="sm"
      title={step() === "codes"
        ? "Save your new backup codes"
        : "Regenerate backup codes"}
      description={step() === "codes"
        ? "Your old codes have been replaced. Store these codes in a safe place."
        : "Enter your password to regenerate backup codes. This will invalidate your old codes."}
      footer={
        <Switch>
          <Match when={step() === "password"}>
            <Button
              type="submit"
              form={FORM_ID}
              disabled={submission.pending}
            >
              Regenerate
            </Button>
          </Match>
          <Match when={step() === "codes"}>
            <Button onClick={() => setOpen(false)}>Done</Button>
          </Match>
        </Switch>
      }
    >
      <Switch>
        <Match when={step() === "password"}>
          <form
            id={FORM_ID}
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
          </form>
        </Match>
        <Match when={step() === "codes"}>
          <BackupCodesStep backupCodes={codes()} />
        </Match>
      </Switch>
    </ResponsiveDialog>
  );
}

import { revalidate } from "@solidjs/router";
import { Button } from "~/client/components/ui/button.tsx";
import { ResponsiveDialog } from "~/client/components/ui/dialog.tsx";
import { authClient } from "~/client/lib/auth-client.ts";

import { viewNumberOfBackupCodesQuery } from "~/client/queries/auth.ts";
import { createSignal, type JSX, Match, Switch } from "solid-js";
import { toast } from "solid-sonner";
import { BackupCodesStep } from "./backup-codes-step.tsx";
import { PasswordForm } from "./password-form.tsx";

const DIALOG_ID = "regenerate-backup-codes-dialog";

type Step = "password" | "codes";

export function RegenerateBackupCodesDialog(): JSX.Element {
  let dialogRef!: HTMLDialogElement;
  const [step, setStep] = createSignal<Step>("password");
  const [codes, setCodes] = createSignal<string[]>([]);

  async function handlePasswordSubmit(password: string): Promise<void> {
    const { data } = await authClient.twoFactor.generateBackupCodes({
      password,
      fetchOptions: {
        onSuccess: () => {
          revalidate(viewNumberOfBackupCodesQuery.key);
        },
        onError: (ctx) => {
          toast.error(
            ctx.error.message || "Failed to regenerate backup codes",
          );
        },
      },
    });

    if (data && data.backupCodes && data.status) {
      setCodes(data.backupCodes);
      setStep("codes");
    }
  }

  function handleDialogClose(): void {
    setStep("password");
    setCodes([]);
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
            <PasswordForm
              submitLabel="Regenerate"
              onSubmit={handlePasswordSubmit}
            />
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

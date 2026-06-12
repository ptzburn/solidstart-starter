import { revalidate } from "@solidjs/router";
import { Button } from "~/client/components/ui/button.tsx";
import { ResponsiveDialog } from "~/client/components/ui/dialog.tsx";
import { authClient } from "~/client/lib/auth-client.ts";

import { getSessionQuery } from "~/client/queries/auth.ts";
import type { JSX } from "solid-js";
import { toast } from "solid-sonner";
import { PasswordForm } from "./password-form.tsx";

const DIALOG_ID = "disable-two-factor-dialog";

export function DisableTwoFactorDialog(): JSX.Element {
  let dialogRef!: HTMLDialogElement;

  async function handlePasswordSubmit(password: string): Promise<void> {
    await authClient.twoFactor.disable({
      password,
      fetchOptions: {
        onSuccess: () => {
          dialogRef.close();
          revalidate(getSessionQuery.key);
          toast.success("Two-factor authentication disabled");
        },
        onError: (ctx) => {
          toast.error(
            ctx.error.message || "Failed to disable two-factor authentication",
          );
        },
      },
    });
  }

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
        <PasswordForm
          submitLabel="Disable"
          onSubmit={handlePasswordSubmit}
        />
      </ResponsiveDialog>
    </>
  );
}

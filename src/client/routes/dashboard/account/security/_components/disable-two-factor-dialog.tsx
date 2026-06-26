import { disableTwoFactor } from "~/client/actions/auth.ts";
import { EditFieldDialog } from "~/client/components/dialogs/edit-field-dialog.tsx";
import { TextField } from "~/client/components/ui/form/text-field.tsx";
import { getSessionQuery } from "~/client/queries/auth.ts";
import type { JSX } from "solid-js";

export function DisableTwoFactorDialog(): JSX.Element {
  return (
    <EditFieldDialog
      action={disableTwoFactor}
      trigger="Disable"
      title="Disable two-factor authentication"
      description="Enter your password to disable two-factor authentication"
      submitLabel="Disable"
      successMessage="Two-factor authentication disabled"
      errorMessage="Failed to disable two-factor authentication"
      revalidateKey={getSessionQuery.key}
      resetOnSuccess
    >
      {({ fieldErrors, pending }) => (
        <TextField
          name="password"
          label="Password"
          type="password"
          placeholder="Current password"
          required
          hint="Enter your current password"
          error={fieldErrors().password}
          disabled={pending()}
        />
      )}
    </EditFieldDialog>
  );
}

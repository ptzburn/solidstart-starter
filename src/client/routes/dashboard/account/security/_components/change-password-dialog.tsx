import { changePassword } from "~/client/actions/auth.ts";
import { EditFieldDialog } from "~/client/components/dialogs/edit-field-dialog.tsx";
import { TextField } from "~/client/components/ui/form/text-field.tsx";
import { listSessionsQuery } from "~/client/queries/auth.ts";
import type { JSX } from "solid-js";

export function ChangePasswordDialog(): JSX.Element {
  return (
    <EditFieldDialog
      action={changePassword}
      trigger="Change password"
      title="Change password"
      description="Update your account password"
      submitLabel="Change password"
      successMessage="Password changed successfully"
      errorMessage="Failed to change password"
      revalidateKey={listSessionsQuery.key}
      resetOnSuccess
    >
      {({ fieldErrors, pending }) => (
        <>
          <TextField
            name="currentPassword"
            label="Current password"
            type="password"
            placeholder="Enter your current password"
            required
            hint="Enter your current password"
            error={fieldErrors().currentPassword}
            disabled={pending()}
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
            disabled={pending()}
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
            disabled={pending()}
          />
        </>
      )}
    </EditFieldDialog>
  );
}

import { requestEmailChange } from "~/client/actions/users.ts";
import { EditFieldDialog } from "~/client/components/dialogs/edit-field-dialog.tsx";
import { TextField } from "~/client/components/ui/form/text-field.tsx";
import type { JSX } from "solid-js";

type EmailDialogProps = {
  currentEmail: string;
};

export function EmailDialog(props: EmailDialogProps): JSX.Element {
  return (
    <EditFieldDialog
      action={requestEmailChange}
      trigger="Edit email"
      title="Edit email"
      successMessage="Confirmation link sent to your current email"
      errorMessage="Failed to update email"
    >
      {({ fieldErrors, pending }) => (
        <TextField
          name="email"
          type="email"
          label="Email"
          hint="Enter a valid email"
          placeholder="johndoe@example.com"
          value={props.currentEmail}
          required
          error={fieldErrors().email}
          disabled={pending()}
        />
      )}
    </EditFieldDialog>
  );
}

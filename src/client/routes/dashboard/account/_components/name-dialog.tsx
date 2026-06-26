import { updateUserName } from "~/client/actions/users.ts";
import { EditFieldDialog } from "~/client/components/dialogs/edit-field-dialog.tsx";
import { TextField } from "~/client/components/ui/form/text-field.tsx";
import { splitName } from "~/client/lib/name.ts";
import { getSessionQuery } from "~/client/queries/auth.ts";
import type { JSX } from "solid-js";

type NameEditDialogProps = {
  currentName: string;
};

export function NameEditDialog(props: NameEditDialogProps): JSX.Element {
  const initial = (): { firstName: string; lastName: string } =>
    splitName(props.currentName);

  return (
    <EditFieldDialog
      action={updateUserName}
      trigger="Edit name"
      title="Edit name"
      successMessage="Name updated"
      errorMessage="Failed to update name"
      revalidateKey={getSessionQuery.key}
    >
      {({ fieldErrors, pending }) => (
        <div class="grid gap-4 md:grid-cols-2">
          <TextField
            name="firstName"
            label="First name"
            placeholder="First name"
            value={initial().firstName}
            minlength={2}
            required
            hint="Enter first name"
            error={fieldErrors().firstName}
            disabled={pending()}
          />
          <TextField
            name="lastName"
            label="Last name"
            placeholder="Last name"
            value={initial().lastName}
            minlength={2}
            required
            hint="Enter last name"
            error={fieldErrors().lastName}
            disabled={pending()}
          />
        </div>
      )}
    </EditFieldDialog>
  );
}

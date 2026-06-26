import type { SelectUser } from "~/api/types/auth.ts";
import { adminUpdateUserName } from "~/client/actions/auth.ts";
import { EditFieldDialog } from "~/client/components/dialogs/edit-field-dialog.tsx";
import { TextField } from "~/client/components/ui/form/text-field.tsx";
import { splitName } from "~/client/lib/name.ts";
import { getUserByIdQuery } from "~/client/queries/users.ts";
import type { Accessor, JSX } from "solid-js";

type NameDialogProps = {
  user: Accessor<SelectUser>;
};

export function NameDialog(props: NameDialogProps): JSX.Element {
  const initial = (): { firstName: string; lastName: string } =>
    splitName(props.user().name);

  return (
    <EditFieldDialog
      action={adminUpdateUserName}
      trigger="Change"
      title="Edit name"
      successMessage="Name updated"
      errorMessage="Failed to update name"
      revalidateKey={getUserByIdQuery.keyFor(props.user().id)}
      userId={props.user().id}
      resetOnSuccess
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

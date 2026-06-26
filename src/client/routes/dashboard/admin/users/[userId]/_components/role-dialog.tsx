import type { SelectUser } from "~/api/types/auth.ts";
import { setUserRole } from "~/client/actions/auth.ts";
import { EditFieldDialog } from "~/client/components/dialogs/edit-field-dialog.tsx";
import { FieldGroup } from "~/client/components/ui/field.tsx";
import { SelectField } from "~/client/components/ui/form/select-field.tsx";
import { getUserByIdQuery } from "~/client/queries/users.ts";
import type { Accessor, JSX } from "solid-js";

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
];

type RoleDialogProps = {
  user: Accessor<SelectUser>;
};

export function RoleDialog(props: RoleDialogProps): JSX.Element {
  return (
    <EditFieldDialog
      action={setUserRole}
      trigger="Change"
      title="Change role"
      description="Select a new role for this user."
      successMessage="Role updated"
      errorMessage="Failed to update role"
      revalidateKey={getUserByIdQuery.keyFor(props.user().id)}
      userId={props.user().id}
      formClass="space-y-4 py-2"
    >
      {({ fieldErrors, pending }) => (
        <FieldGroup>
          <SelectField
            name="role"
            label="Role"
            defaultValue={props.user().role ?? "user"}
            options={ROLE_OPTIONS}
            error={fieldErrors().role}
            disabled={pending()}
          />
        </FieldGroup>
      )}
    </EditFieldDialog>
  );
}

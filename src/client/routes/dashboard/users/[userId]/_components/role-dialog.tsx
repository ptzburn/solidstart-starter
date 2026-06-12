import { revalidate } from "@solidjs/router";
import { Button } from "~/client/components/ui/button.tsx";
import { ResponsiveDialog } from "~/client/components/ui/dialog.tsx";
import { FieldGroup } from "~/client/components/ui/field.tsx";
import { useAppForm } from "~/client/hooks/use-app-form.ts";

import { authClient } from "~/client/lib/auth-client.ts";

import { getUserByIdQuery } from "~/client/queries/users.ts";
import type { SelectUser } from "~/shared/types/auth.ts";
import { createMemo } from "solid-js";
import type { Accessor, JSX } from "solid-js";
import { toast } from "solid-sonner";

const ROLE_OPTIONS = ["user", "admin"].map((r) => ({
  value: r,
  label: r.charAt(0).toUpperCase() + r.slice(1),
}));

const DIALOG_ID = "admin-edit-role-dialog";

type RoleDialogProps = {
  user: Accessor<SelectUser>;
};

export function RoleDialog(props: RoleDialogProps): JSX.Element {
  let dialogRef!: HTMLDialogElement;
  const roleOptions = createMemo(() => ROLE_OPTIONS);

  const form = useAppForm(() => ({
    defaultValues: {
      role: props.user().role ?? "user",
    },
    validators: {},
    onSubmit: async ({ value }) => {
      await authClient.admin.setRole(
        {
          userId: String(props.user().id),
          role: value.role,
        },
        {
          onSuccess: () => {
            revalidate(getUserByIdQuery.keyFor(props.user().id));
            dialogRef.close();
            toast.success("Role updated");
          },
          onError: (error) => {
            toast.error(error.error?.message ?? "Failed to update role");
          },
        },
      );
    },
  }));

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        command="show-modal"
        commandfor={DIALOG_ID}
        onClick={() => form.reset({ role: props.user().role ?? "user" })}
      >
        Change
      </Button>

      <ResponsiveDialog
        id={DIALOG_ID}
        ref={(el) => dialogRef = el}
        title="Change role"
        description="Select a new role for this user."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          class="space-y-4 py-2"
        >
          <FieldGroup>
            <form.AppField name="role">
              {(field) => (
                <field.SelectField
                  label="Role"
                  placeholder="Select role"
                  options={roleOptions()}
                />
              )}
            </form.AppField>
          </FieldGroup>
          <form.AppForm>
            <form.SubmitButton>Save</form.SubmitButton>
          </form.AppForm>
        </form>
      </ResponsiveDialog>
    </>
  );
}

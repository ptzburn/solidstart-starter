import { revalidate } from "@solidjs/router";
import { ResponsiveEditDialog } from "~/client/components/responsive-edit-dialog.tsx";
import { FieldGroup } from "~/client/components/ui/field.tsx";
import { useAppForm } from "~/client/hooks/use-app-form.ts";

import { authClient } from "~/client/lib/auth-client.ts";

import { getUserByIdQuery } from "~/client/queries/users.ts";
import type { SelectUser } from "~/shared/types/auth.ts";
import { createEffect, createMemo } from "solid-js";
import type { Accessor, JSX } from "solid-js";
import { toast } from "solid-sonner";

const ROLE_OPTIONS = ["user", "admin"].map((r) => ({
  value: r,
  label: r.charAt(0).toUpperCase() + r.slice(1),
}));

type RoleDialogProps = {
  user: Accessor<SelectUser>;
  isOpen: Accessor<boolean>;
  setIsOpen: (open: boolean) => void;
};

export function RoleDialog(props: RoleDialogProps): JSX.Element {
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
            props.setIsOpen(false);
            toast.success("Role updated");
          },
          onError: (error) => {
            toast.error(error.error?.message ?? "Failed to update role");
          },
        },
      );
    },
  }));

  createEffect(() => {
    if (props.isOpen()) {
      form.reset({
        role: props.user().role ?? "user",
      });
    }
  });

  return (
    <ResponsiveEditDialog
      isOpen={props.isOpen}
      setIsOpen={props.setIsOpen}
      title="Change role"
      description="Select a new role for this user."
    >
      {() => (
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
      )}
    </ResponsiveEditDialog>
  );
}

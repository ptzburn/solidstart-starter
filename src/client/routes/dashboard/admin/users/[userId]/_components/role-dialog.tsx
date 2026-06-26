import { revalidate, useSubmission } from "@solidjs/router";
import type { SelectUser } from "~/api/types/auth.ts";
import { setUserRole } from "~/client/actions/auth.ts";
import { ResponsiveDialog } from "~/client/components/responsive-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { FieldGroup } from "~/client/components/ui/field.tsx";

import { SelectField } from "~/client/components/ui/form/select-field.tsx";
import { getUserByIdQuery } from "~/client/queries/users.ts";
import { createEffect, createSignal } from "solid-js";
import type { Accessor, JSX } from "solid-js";
import { toast } from "solid-sonner";

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
];

const FORM_ID = "admin-edit-role-form";

type RoleDialogProps = {
  user: Accessor<SelectUser>;
};

export function RoleDialog(props: RoleDialogProps): JSX.Element {
  const [open, setOpen] = createSignal(false);
  const submission = useSubmission(
    setUserRole,
    ([formData]) => formData.get("userId") === props.user().id,
  );

  const fieldErrors = (): Record<string, string | undefined> =>
    submission.result && "fieldErrors" in submission.result
      ? submission.result.fieldErrors ?? {}
      : {};

  createEffect(() => {
    if (submission.result && "ok" in submission.result) {
      setOpen(false);
      toast.success("Role updated");
      revalidate(getUserByIdQuery.keyFor(props.user().id));
      submission.clear();
    }
  });

  createEffect(() => {
    if (submission.error) {
      toast.error(submission.error.message || "Failed to update role");
      submission.clear();
    }
  });

  return (
    <ResponsiveDialog
      open={open()}
      onOpenChange={setOpen}
      trigger="Change"
      triggerVariant="outline"
      triggerSize="sm"
      title="Change role"
      description="Select a new role for this user."
      footer={
        <Button type="submit" form={FORM_ID} disabled={submission.pending}>
          Save
        </Button>
      }
    >
      <form
        id={FORM_ID}
        method="post"
        action={setUserRole}
        class="space-y-4 py-2"
        onInput={() => {
          if (submission.result) submission.clear();
        }}
      >
        <input type="hidden" name="userId" value={props.user().id} />
        <FieldGroup>
          <SelectField
            name="role"
            label="Role"
            defaultValue={props.user().role ?? "user"}
            options={ROLE_OPTIONS}
            error={fieldErrors().role}
            disabled={submission.pending}
          />
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}

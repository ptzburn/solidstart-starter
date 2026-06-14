import { revalidate, useSubmission } from "@solidjs/router";
import { setUserRole } from "~/client/actions/auth.ts";
import { Button } from "~/client/components/ui/button.tsx";
import { ResponsiveDialog } from "~/client/components/ui/dialog.tsx";
import { FieldGroup } from "~/client/components/ui/field.tsx";
import { SelectField } from "~/client/components/ui/form2/select-field.tsx";

import { getUserByIdQuery } from "~/client/queries/users.ts";
import type { SelectUser } from "~/shared/types/auth.ts";
import { createEffect } from "solid-js";
import type { Accessor, JSX } from "solid-js";
import { toast } from "solid-sonner";

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
];

const DIALOG_ID = "admin-edit-role-dialog";

type RoleDialogProps = {
  user: Accessor<SelectUser>;
};

export function RoleDialog(props: RoleDialogProps): JSX.Element {
  let dialogRef!: HTMLDialogElement;
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
      dialogRef.close();
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
    <>
      <Button
        variant="outline"
        size="sm"
        command="show-modal"
        commandfor={DIALOG_ID}
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
              value={props.user().role ?? "user"}
              options={ROLE_OPTIONS}
              error={fieldErrors().role}
              disabled={submission.pending}
            />
          </FieldGroup>
          <Button
            type="submit"
            class="w-full"
            disabled={submission.pending}
          >
            Save
          </Button>
        </form>
      </ResponsiveDialog>
    </>
  );
}

import { useSubmission } from "@solidjs/router";
import { updateUserName } from "~/client/actions/users.ts";
import { Button } from "~/client/components/ui/button.tsx";
import { ResponsiveDialog } from "~/client/components/ui/dialog.tsx";
import { TextField } from "~/client/components/ui/form2/text-field.tsx";
import { createEffect, type JSX } from "solid-js";
import { toast } from "solid-sonner";

type NameEditDialogProps = {
  currentName: string;
};

const DIALOG_ID = "edit-name-dialog";

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const [firstName = "", ...rest] = parts;
  return {
    firstName,
    lastName: rest.join(" "),
  };
}

export function NameEditDialog(props: NameEditDialogProps): JSX.Element {
  let dialogRef!: HTMLDialogElement;
  const submission = useSubmission(updateUserName);
  const initial = (): { firstName: string; lastName: string } =>
    splitName(props.currentName);
  const fieldErrors = (): Record<string, string | undefined> =>
    submission.result && "fieldErrors" in submission.result
      ? submission.result.fieldErrors ?? {}
      : {};

  createEffect(() => {
    if (submission.result && "ok" in submission.result) {
      dialogRef.close();
      toast.success("Name updated");
      submission.clear();
    }
  });

  createEffect(() => {
    if (submission.error) {
      toast.error(submission.error.message || "Failed to update name");
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
        Edit name
      </Button>

      <ResponsiveDialog
        id={DIALOG_ID}
        ref={(el) => dialogRef = el}
        title="Edit name"
      >
        <form
          method="post"
          action={updateUserName}
          class="space-y-4"
          onInput={() => {
            if (submission.result) submission.clear();
          }}
        >
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
              disabled={submission.pending}
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
              disabled={submission.pending}
            />
          </div>
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

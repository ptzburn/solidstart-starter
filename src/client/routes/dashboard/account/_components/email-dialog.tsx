import { useSubmission } from "@solidjs/router";
import { requestEmailChange } from "~/client/actions/users.ts";
import { Button } from "~/client/components/ui/button.tsx";
import { Dialog } from "~/client/components/ui/dialog.tsx";
import { TextField } from "~/client/components/ui/form2/text-field.tsx";
import { createEffect, type JSX } from "solid-js";
import { toast } from "solid-sonner";

type EmailDialogProps = {
  currentEmail: string;
};

const DIALOG_ID = "edit-email-dialog";

export function EmailDialog(props: EmailDialogProps): JSX.Element {
  let dialogRef!: HTMLDialogElement;
  const submission = useSubmission(requestEmailChange);
  const fieldErrors = (): Record<string, string | undefined> =>
    submission.result && "fieldErrors" in submission.result
      ? submission.result.fieldErrors ?? {}
      : {};

  createEffect(() => {
    if (submission.result && "ok" in submission.result) {
      dialogRef.close();
      toast.success("Code sent to the new email");
      submission.clear();
    }
  });

  createEffect(() => {
    if (submission.error) {
      toast.error(submission.error.message || "Failed to update email");
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
        Edit email
      </Button>

      <Dialog
        id={DIALOG_ID}
        ref={(el) => dialogRef = el}
        title="Edit email"
      >
        <form
          method="post"
          action={requestEmailChange}
          class="space-y-4"
          onInput={() => {
            if (submission.result) submission.clear();
          }}
        >
          <TextField
            name="email"
            type="email"
            label="Email"
            placeholder="johndoe@example.com"
            value={props.currentEmail}
            required
            error={fieldErrors().email}
            disabled={submission.pending}
          />
          <Button
            type="submit"
            class="w-full"
            disabled={submission.pending}
          >
            Save
          </Button>
        </form>
      </Dialog>
    </>
  );
}

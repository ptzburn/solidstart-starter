import { useSubmission } from "@solidjs/router";
import { requestEmailChange } from "~/client/actions/users.ts";
import { ResponsiveEditDialog } from "~/client/components/responsive-edit-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { TextField } from "~/client/components/ui/form2/text-field.tsx";
import { createEffect, createSignal, type JSX } from "solid-js";
import { toast } from "solid-sonner";

type EmailDialogProps = {
  currentEmail: string;
};

export function EmailDialog(props: EmailDialogProps): JSX.Element {
  const [open, setOpen] = createSignal(false);
  const submission = useSubmission(requestEmailChange);
  const fieldErrors = (): Record<string, string | undefined> =>
    submission.result && "fieldErrors" in submission.result
      ? submission.result.fieldErrors ?? {}
      : {};

  createEffect(() => {
    if (submission.result && "ok" in submission.result) {
      setOpen(false);
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
        onClick={() => setOpen(true)}
      >
        Edit email
      </Button>

      <ResponsiveEditDialog
        isOpen={open}
        setIsOpen={setOpen}
        title="Edit email"
      >
        {() => (
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
        )}
      </ResponsiveEditDialog>
    </>
  );
}

import { revalidate, useSubmission } from "@solidjs/router";
import type { SelectUser } from "~/api/types/auth.ts";
import { adminUpdateUserName } from "~/client/actions/auth.ts";
import { ResponsiveDialog } from "~/client/components/responsive-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { TextField } from "~/client/components/ui/form/text-field.tsx";
import { getUserByIdQuery } from "~/client/queries/users.ts";
import { createEffect, createSignal, type JSX } from "solid-js";
import type { Accessor } from "solid-js";
import { toast } from "solid-sonner";

type NameDialogProps = {
  user: Accessor<SelectUser>;
};

const FORM_ID = "admin-edit-name-form";

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const [firstName = "", ...rest] = parts;
  return {
    firstName,
    lastName: rest.join(" "),
  };
}

export function NameDialog(props: NameDialogProps): JSX.Element {
  const [open, setOpen] = createSignal(false);
  let formRef!: HTMLFormElement;
  const submission = useSubmission(
    adminUpdateUserName,
    ([formData]) => formData.get("userId") === props.user().id,
  );

  const initial = (): { firstName: string; lastName: string } =>
    splitName(props.user().name);

  const fieldErrors = (): Record<string, string | undefined> =>
    submission.result && "fieldErrors" in submission.result
      ? submission.result.fieldErrors ?? {}
      : {};

  createEffect(() => {
    if (submission.result && "ok" in submission.result) {
      formRef.reset();
      setOpen(false);
      toast.success("Name updated");
      revalidate(getUserByIdQuery.keyFor(props.user().id));
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
    <ResponsiveDialog
      open={open()}
      onOpenChange={setOpen}
      trigger="Change"
      triggerVariant="outline"
      triggerSize="sm"
      title="Edit name"
      footer={
        <Button type="submit" form={FORM_ID} disabled={submission.pending}>
          Save
        </Button>
      }
    >
      <form
        id={FORM_ID}
        ref={(el) => formRef = el}
        method="post"
        action={adminUpdateUserName}
        class="space-y-4"
        onInput={() => {
          if (submission.result) submission.clear();
        }}
      >
        <input type="hidden" name="userId" value={props.user().id} />
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
      </form>
    </ResponsiveDialog>
  );
}

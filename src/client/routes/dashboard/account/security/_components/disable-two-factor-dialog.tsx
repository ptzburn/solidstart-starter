import { revalidate, useSubmission } from "@solidjs/router";
import { disableTwoFactor } from "~/client/actions/auth.ts";
import { ResponsiveDialog } from "~/client/components/responsive-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { TextField } from "~/client/components/ui/form/text-field.tsx";
import { getSessionQuery } from "~/client/queries/auth.ts";
import { createEffect, createSignal, type JSX } from "solid-js";
import { toast } from "solid-sonner";

const FORM_ID = "disable-two-factor-form";

export function DisableTwoFactorDialog(): JSX.Element {
  const [open, setOpen] = createSignal(false);
  let formRef!: HTMLFormElement;
  const submission = useSubmission(disableTwoFactor);

  const fieldErrors = (): Record<string, string | undefined> =>
    submission.result && "fieldErrors" in submission.result
      ? submission.result.fieldErrors ?? {}
      : {};

  createEffect(() => {
    if (submission.result && "ok" in submission.result) {
      formRef.reset();
      setOpen(false);
      toast.success("Two-factor authentication disabled");
      revalidate(getSessionQuery.key);
      submission.clear();
    }
  });

  createEffect(() => {
    if (submission.error) {
      toast.error(
        submission.error.message ||
          "Failed to disable two-factor authentication",
      );
      submission.clear();
    }
  });

  return (
    <ResponsiveDialog
      open={open()}
      onOpenChange={setOpen}
      trigger="Disable"
      triggerVariant="outline"
      triggerSize="sm"
      title="Disable two-factor authentication"
      description="Enter your password to disable two-factor authentication"
      footer={
        <Button type="submit" form={FORM_ID} disabled={submission.pending}>
          Disable
        </Button>
      }
    >
      <form
        id={FORM_ID}
        ref={(el) => formRef = el}
        method="post"
        action={disableTwoFactor}
        class="space-y-4"
        onInput={() => {
          if (submission.result) submission.clear();
        }}
      >
        <TextField
          name="password"
          label="Password"
          type="password"
          placeholder="Current password"
          required
          hint="Enter your current password"
          error={fieldErrors().password}
          disabled={submission.pending}
        />
      </form>
    </ResponsiveDialog>
  );
}

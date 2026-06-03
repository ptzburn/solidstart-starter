import { revalidateLogic } from "@tanstack/solid-form";
import { ResponsiveEditDialog } from "~/client/components/responsive-edit-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { useAppForm } from "~/client/hooks/use-app-form.ts";
import { authClient } from "~/client/lib/auth-client.ts";
import { createSignal, type JSX } from "solid-js";
import { toast } from "solid-sonner";
import z from "zod";

type EmailDialogProps = {
  currentEmail: string;
};

export function EmailDialog(props: EmailDialogProps): JSX.Element {
  const [open, setOpen] = createSignal(false);

  const form = useAppForm(() => ({
    defaultValues: {
      email: props.currentEmail,
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: z.object({
        email: z.email(),
      }),
    },
    onSubmit: async ({ formApi, value }) => {
      if (value.email === props.currentEmail) {
        toast.info("The email is the same as the current one");
        return;
      }

      await authClient.changeEmail(
        {
          newEmail: value.email,
          callbackURL: `/account?newEmail=${encodeURIComponent(value.email)}`,
        },
        {
          onSuccess: () => {
            formApi.reset();
            setOpen(false);
            toast.success("Code sent to the new email");
          },
          onError: (error) => {
            toast.error(
              error.error.message || "Failed to update email",
            );
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
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            class="space-y-4"
          >
            <form.AppField name="email">
              {(field) => (
                <field.TextField
                  label="Email"
                  placeholder="johndoe@example.com"
                />
              )}
            </form.AppField>
            <form.AppForm>
              <form.SubmitButton>Save</form.SubmitButton>
            </form.AppForm>
          </form>
        )}
      </ResponsiveEditDialog>
    </>
  );
}

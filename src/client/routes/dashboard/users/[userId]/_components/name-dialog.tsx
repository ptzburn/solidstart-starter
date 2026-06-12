import { revalidate } from "@solidjs/router";
import { Button } from "~/client/components/ui/button.tsx";
import { Dialog } from "~/client/components/ui/dialog.tsx";
import { useAppForm } from "~/client/hooks/use-app-form.ts";
import { authClient } from "~/client/lib/auth-client.ts";
import { getUserByIdQuery } from "~/client/queries/users.ts";
import type { SelectUser } from "~/shared/types/auth.ts";
import type { Accessor, JSX } from "solid-js";
import { toast } from "solid-sonner";
import z from "zod";

const DIALOG_ID = "admin-edit-name-dialog";

type NameDialogProps = {
  user: Accessor<SelectUser>;
};

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const [firstName = "", ...rest] = parts;
  return {
    firstName,
    lastName: rest.join(" "),
  };
}

export function NameDialog(props: NameDialogProps): JSX.Element {
  let dialogRef!: HTMLDialogElement;

  const form = useAppForm(() => ({
    defaultValues: splitName(props.user().name),
    validators: {
      onSubmit: z.object({
        firstName: z.string().trim().min(1),
        lastName: z.string().trim().min(1),
      }),
    },
    onSubmit: async ({ formApi, value }) => {
      const fullName = [value.firstName.trim(), value.lastName.trim()]
        .filter(Boolean)
        .join(" ");

      await authClient.admin.updateUser(
        {
          userId: props.user().id,
          data: { name: fullName },
        },
        {
          onSuccess: () => {
            formApi.reset();
            revalidate(getUserByIdQuery.keyFor(props.user().id));
            dialogRef.close();
            toast.success("Name updated");
          },
          onError: (error) => {
            toast.error(error.error.message || "Failed to update name");
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
      >
        Change
      </Button>

      <Dialog
        id={DIALOG_ID}
        ref={(el) => dialogRef = el}
        title="Edit name"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          class="space-y-4"
        >
          <div class="grid gap-4 md:grid-cols-2">
            <form.AppField name="firstName">
              {(field) => (
                <field.TextField
                  label="First name"
                  placeholder="First name"
                />
              )}
            </form.AppField>
            <form.AppField name="lastName">
              {(field) => (
                <field.TextField
                  label="Last name"
                  placeholder="Last name"
                />
              )}
            </form.AppField>
          </div>
          <form.AppForm>
            <form.SubmitButton>Save</form.SubmitButton>
          </form.AppForm>
        </form>
      </Dialog>
    </>
  );
}

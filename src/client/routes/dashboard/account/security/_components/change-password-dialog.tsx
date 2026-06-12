import { revalidateLogic } from "@tanstack/solid-form";
import { Button } from "~/client/components/ui/button.tsx";
import { Dialog } from "~/client/components/ui/dialog.tsx";
import { useAppForm } from "~/client/hooks/use-app-form.ts";

import { authClient } from "~/client/lib/auth-client.ts";
import type { JSX } from "solid-js";
import { toast } from "solid-sonner";
import z from "zod";

const DIALOG_ID = "change-password-dialog";

export function ChangePasswordDialog(): JSX.Element {
  let dialogRef!: HTMLDialogElement;

  const form = useAppForm(() => ({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: z
        .object({
          currentPassword: z.string().min(1),
          newPassword: z.string().min(
            8,
            "Password must be at least 8 characters long",
          ),
          confirmPassword: z.string().min(
            8,
            "Password must be at least 8 characters long",
          ),
        })
        .superRefine((data, ctx) => {
          if (data.newPassword !== data.confirmPassword) {
            ctx.addIssue({
              code: "custom",
              message: "Passwords do not match",
              path: ["newPassword"],
            });
            ctx.addIssue({
              code: "custom",
              message: "Passwords do not match",
              path: ["confirmPassword"],
            });
          }
        }),
    },
    onSubmit: async ({ formApi, value }) => {
      await authClient.changePassword(
        {
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
          revokeOtherSessions: true,
        },
        {
          onSuccess: () => {
            formApi.reset();
            dialogRef.close();
            toast.success("Password changed successfully");
          },
          onError: (error) => {
            toast.error(
              error.error.message || "Failed to change password",
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
        command="show-modal"
        commandfor={DIALOG_ID}
      >
        Change password
      </Button>

      <Dialog
        id={DIALOG_ID}
        ref={(el) => dialogRef = el}
        title="Change password"
        description="Update your account password"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          class="space-y-4"
        >
          <form.AppField name="currentPassword">
            {(field) => (
              <field.TextField
                label="Current password"
                type="password"
                placeholder="Enter your current password"
              />
            )}
          </form.AppField>
          <form.AppField name="newPassword">
            {(field) => (
              <field.TextField
                label="New password"
                type="password"
                placeholder="Enter your new password"
              />
            )}
          </form.AppField>
          <form.AppField name="confirmPassword">
            {(field) => (
              <field.TextField
                label="Confirm password"
                type="password"
                placeholder="Re-enter your new password"
              />
            )}
          </form.AppField>
          <form.AppForm>
            <form.SubmitButton>Change password</form.SubmitButton>
          </form.AppForm>
        </form>
      </Dialog>
    </>
  );
}

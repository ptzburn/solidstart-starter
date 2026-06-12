import { revalidate } from "@solidjs/router";

import { Button } from "~/client/components/ui/button.tsx";
import { ResponsiveDialog } from "~/client/components/ui/dialog.tsx";
import { useAppForm } from "~/client/hooks/use-app-form.ts";
import { authClient } from "~/client/lib/auth-client.ts";
import { createEffect, type JSX, on } from "solid-js";
import { toast } from "solid-sonner";
import { z } from "zod";

const DIALOG_ID = "email-change-otp-dialog";

type EmailChangeOTPDialogProps = {
  newEmail: string | null;
  onClose: () => void;
};

export function EmailChangeOTPDialog(
  props: EmailChangeOTPDialogProps,
): JSX.Element {
  let dialogRef!: HTMLDialogElement;
  let dialogOpened = false;

  createEffect(
    on(
      () => props.newEmail,
      (email) => {
        if (email && !dialogOpened) {
          dialogOpened = true;
          dialogRef.showModal();
        }
      },
    ),
  );

  const resendOTP = async (newEmail: string) => {
    await authClient.emailOtp.requestEmailChange({
      newEmail,
    }, {
      onSuccess: () => {
        toast.success("Code sent to the new email");
      },
      onError: () => {
        toast.error("Failed to send code to the new email");
      },
    });
  };

  const form = useAppForm(() => ({
    defaultValues: {
      otp: "",
    },
    validators: {
      onSubmit: z.object({
        otp: z.string().length(6, "Invalid verification code"),
      }),
    },
    onSubmit: async ({ value }) => {
      if (!props.newEmail) return;

      await authClient.emailOtp.changeEmail({
        newEmail: props.newEmail,
        otp: value.otp,
        fetchOptions: {
          onSuccess: () => {
            toast.success("Email changed");
            dialogRef.close();
            void revalidate("session");
          },
          onError: (error) => {
            toast.error(
              error.error.message ||
                "Failed to change email",
            );
          },
        },
      });
    },
  }));

  return (
    <ResponsiveDialog
      id={DIALOG_ID}
      ref={(el) => dialogRef = el}
      onClose={() => props.onClose()}
      title="Verify your email"
      description="Enter the code sent to your new email to verify your account."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        class="space-y-6"
      >
        <form.AppField name="otp">
          {(field) => <field.OTPField />}
        </form.AppField>

        <div class="flex flex-col gap-2">
          <form.AppForm>
            <form.SubmitButton>
              Verify
            </form.SubmitButton>
          </form.AppForm>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (props.newEmail) {
                resendOTP(props.newEmail);
              }
            }}
          >
            Resend code
          </Button>
        </div>
      </form>
    </ResponsiveDialog>
  );
}

import { revalidate } from "@solidjs/router";

import { Button } from "~/client/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/client/components/ui/dialog.tsx";
import { useAppForm } from "~/client/hooks/use-app-form.ts";
import { authClient } from "~/client/lib/auth-client.ts";
import { createEffect, createSignal, type JSX, on } from "solid-js";
import { toast } from "solid-sonner";
import { z } from "zod";

type EmailChangeOTPDialogProps = {
  newEmail: string | null;
  onClose: () => void;
};

export function EmailChangeOTPDialog(
  props: EmailChangeOTPDialogProps,
): JSX.Element {
  const [open, setOpen] = createSignal(false);
  let dialogOpened = false;

  createEffect(
    on(
      () => props.newEmail,
      (email) => {
        if (email && !dialogOpened) {
          dialogOpened = true;
          setOpen(true);
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

  const handleClose = () => {
    setOpen(false);
    props.onClose();
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
            handleClose();
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
    <Dialog
      open={open()}
      onOpenChange={(next) => {
        if (!next) {
          handleClose();
        }
      }}
    >
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          class="space-y-6"
        >
          <DialogHeader>
            <DialogTitle>Verify your email</DialogTitle>
            <DialogDescription>
              Enter the code sent to your new email to verify your account.
            </DialogDescription>
          </DialogHeader>

          <form.AppField name="otp">
            {(field) => <field.OTPField />}
          </form.AppField>

          <DialogFooter class="flex-col gap-2 sm:flex-col">
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

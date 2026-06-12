import { revalidate, useAction, useSubmission } from "@solidjs/router";
import { sendPhoneOtp, verifyPhoneNumber } from "~/client/actions/users.ts";
import { ResponsiveEditDialog } from "~/client/components/responsive-edit-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { OTPField } from "~/client/components/ui/form2/otp-field.tsx";
import { TextField } from "~/client/components/ui/form2/text-field.tsx";
import { getSessionQuery } from "~/client/queries/auth.ts";
import { createEffect, createSignal, type JSX, onCleanup } from "solid-js";
import { toast } from "solid-sonner";

type PhoneDialogProps = {
  currentPhoneNumber: string | null | undefined;
};

const RESEND_COOLDOWN = 60;

export function PhoneDialog(props: PhoneDialogProps): JSX.Element {
  const [open, setOpen] = createSignal(false);
  const [cooldown, setCooldown] = createSignal(0);
  let timer: ReturnType<typeof setInterval> | undefined;

  const sendSubmission = useSubmission(sendPhoneOtp);
  const verifySubmission = useSubmission(verifyPhoneNumber);
  const triggerSend = useAction(sendPhoneOtp);

  const sentPhoneNumber = (): string | undefined =>
    sendSubmission.result && "ok" in sendSubmission.result
      ? sendSubmission.result.phoneNumber
      : undefined;

  const sendFieldErrors = (): Record<string, string | undefined> =>
    sendSubmission.result && "fieldErrors" in sendSubmission.result
      ? sendSubmission.result.fieldErrors ?? {}
      : {};

  const verifyFieldErrors = (): Record<string, string | undefined> =>
    verifySubmission.result && "fieldErrors" in verifySubmission.result
      ? verifySubmission.result.fieldErrors ?? {}
      : {};

  function startCooldown(): void {
    setCooldown(RESEND_COOLDOWN);
    clearInterval(timer);
    timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  onCleanup(() => clearInterval(timer));

  createEffect(() => {
    if (sendSubmission.result && "ok" in sendSubmission.result) {
      startCooldown();
      toast.success("Code sent to the phone number");
    }
  });

  createEffect(() => {
    if (sendSubmission.error) {
      toast.error(
        sendSubmission.error.message ||
          "Failed to send code to the phone number",
      );
      sendSubmission.clear();
    }
  });

  createEffect(() => {
    if (verifySubmission.result && "ok" in verifySubmission.result) {
      setOpen(false);
      clearInterval(timer);
      setCooldown(0);
      toast.success("Phone number updated");
      revalidate(getSessionQuery.key);
      sendSubmission.clear();
      verifySubmission.clear();
    }
  });

  createEffect(() => {
    if (verifySubmission.error) {
      toast.error(
        verifySubmission.error.message || "Failed to update phone number",
      );
      verifySubmission.clear();
    }
  });

  const handleClose = (next: boolean): void => {
    if (!next) {
      clearInterval(timer);
      setCooldown(0);
      sendSubmission.clear();
      verifySubmission.clear();
    }
    setOpen(next);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        {props.currentPhoneNumber ? "Edit phone number" : "Add phone number"}
      </Button>

      <ResponsiveEditDialog
        isOpen={open}
        setIsOpen={handleClose}
        title="Edit phone number"
      >
        {() => {
          const phone = sentPhoneNumber();
          if (!phone) {
            return (
              <form
                method="post"
                action={sendPhoneOtp}
                class="space-y-4"
                onInput={() => {
                  if (sendSubmission.result) sendSubmission.clear();
                }}
              >
                <TextField
                  name="phoneNumber"
                  label="Phone number"
                  placeholder="+358401234567"
                  value={props.currentPhoneNumber ?? ""}
                  required
                  error={sendFieldErrors().phoneNumber}
                  disabled={sendSubmission.pending}
                />
                <Button
                  type="submit"
                  class="w-full"
                  disabled={sendSubmission.pending}
                >
                  Send code
                </Button>
              </form>
            );
          }

          return (
            <form
              method="post"
              action={verifyPhoneNumber}
              class="space-y-4"
              onInput={() => {
                if (verifySubmission.result) verifySubmission.clear();
              }}
            >
              <input type="hidden" name="phoneNumber" value={phone} />
              <OTPField
                name="otp"
                label="Verification code"
                error={verifyFieldErrors().otp}
                disabled={verifySubmission.pending}
                autofocus
              />
              <Button
                type="button"
                variant="ghost"
                class="w-full"
                onClick={() => {
                  const fd = new FormData();
                  fd.set("phoneNumber", phone);
                  void triggerSend(fd);
                }}
                disabled={sendSubmission.pending || cooldown() > 0}
              >
                {cooldown() > 0
                  ? `Resend code (${cooldown()}s)`
                  : "Resend code"}
              </Button>
              <Button
                type="submit"
                class="w-full"
                disabled={verifySubmission.pending}
              >
                Verify
              </Button>
            </form>
          );
        }}
      </ResponsiveEditDialog>
    </>
  );
}

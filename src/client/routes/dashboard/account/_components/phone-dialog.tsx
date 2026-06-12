import { revalidate, useAction, useSubmission } from "@solidjs/router";
import { sendPhoneOtp, verifyPhoneNumber } from "~/client/actions/users.ts";
import { Button } from "~/client/components/ui/button.tsx";
import { ResponsiveDialog } from "~/client/components/ui/dialog.tsx";
import { OTPField } from "~/client/components/ui/form2/otp-field.tsx";
import { TextField } from "~/client/components/ui/form2/text-field.tsx";
import { getSessionQuery } from "~/client/queries/auth.ts";
import { createEffect, createSignal, type JSX, onCleanup } from "solid-js";
import { toast } from "solid-sonner";

type PhoneDialogProps = {
  currentPhoneNumber: string | null | undefined;
};

const DIALOG_ID = "edit-phone-dialog";
const RESEND_COOLDOWN = 60;

export function PhoneDialog(props: PhoneDialogProps): JSX.Element {
  let dialogRef!: HTMLDialogElement;
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
      dialogRef.close();
      toast.success("Phone number updated");
      revalidate(getSessionQuery.key);
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

  function handleClose(): void {
    clearInterval(timer);
    setCooldown(0);
    sendSubmission.clear();
    verifySubmission.clear();
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        command="show-modal"
        commandfor={DIALOG_ID}
      >
        {props.currentPhoneNumber ? "Edit phone number" : "Add phone number"}
      </Button>

      <ResponsiveDialog
        id={DIALOG_ID}
        ref={(el) => dialogRef = el}
        onClose={handleClose}
        title="Edit phone number"
      >
        {sentPhoneNumber() === undefined
          ? (
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
          )
          : (
            <form
              method="post"
              action={verifyPhoneNumber}
              class="space-y-4"
              onInput={() => {
                if (verifySubmission.result) verifySubmission.clear();
              }}
            >
              <input
                type="hidden"
                name="phoneNumber"
                value={sentPhoneNumber()}
              />
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
                  const phone = sentPhoneNumber();
                  if (!phone) return;
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
          )}
      </ResponsiveDialog>
    </>
  );
}

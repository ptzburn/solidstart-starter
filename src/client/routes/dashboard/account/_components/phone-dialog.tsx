import { useSubmission } from "@solidjs/router";
import { sendPhoneOtp, verifyPhoneNumber } from "~/client/actions/users.ts";
import { ResponsiveDialog } from "~/client/components/responsive-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { OTPField } from "~/client/components/ui/form/otp-field.tsx";
import { TextField } from "~/client/components/ui/form/text-field.tsx";
import {
  useFormFieldErrors,
  useSubmissionError,
  useSubmissionSuccess,
} from "~/client/hooks/use-submission.ts";
import { getSessionQuery } from "~/client/queries/auth.ts";
import { createSignal, type JSX, onCleanup, Show } from "solid-js";

type PhoneDialogProps = {
  currentPhoneNumber: string | null | undefined;
};

const RESEND_COOLDOWN = 60;
const SEND_FORM_ID = "phone-send-form";
const VERIFY_FORM_ID = "phone-verify-form";

export function PhoneDialog(props: PhoneDialogProps): JSX.Element {
  const [open, setOpen] = createSignal(false);
  const [cooldown, setCooldown] = createSignal(0);
  let timer: ReturnType<typeof setInterval> | undefined;

  const sendSubmission = useSubmission(sendPhoneOtp);
  const verifySubmission = useSubmission(verifyPhoneNumber);

  const sentPhoneNumber = (): string | undefined =>
    sendSubmission.result && "ok" in sendSubmission.result
      ? sendSubmission.result.phoneNumber
      : undefined;

  const sendFieldErrors = useFormFieldErrors(sendSubmission);
  const verifyFieldErrors = useFormFieldErrors(verifySubmission);

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

  useSubmissionSuccess(sendSubmission, {
    successMessage: "Code sent to the phone number",
    onSuccess: () => startCooldown(),
    clearOnSuccess: false,
  });
  useSubmissionError(
    sendSubmission,
    "Failed to send code to the phone number",
  );

  useSubmissionSuccess(verifySubmission, {
    successMessage: "Phone number updated",
    revalidateKey: getSessionQuery.key,
    onSuccess: () => setOpen(false),
    clearOnSuccess: false,
  });
  useSubmissionError(verifySubmission, "Failed to update phone number");

  function handleClose(): void {
    clearInterval(timer);
    setCooldown(0);
    sendSubmission.clear();
    verifySubmission.clear();
  }

  return (
    <ResponsiveDialog
      open={open()}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) handleClose();
      }}
      trigger={props.currentPhoneNumber
        ? "Edit phone number"
        : "Add phone number"}
      triggerVariant="outline"
      triggerSize="default"
      title="Edit phone number"
      footer={
        <Show
          when={sentPhoneNumber() === undefined}
          fallback={
            <Button
              type="submit"
              form={VERIFY_FORM_ID}
              disabled={verifySubmission.pending}
            >
              Verify
            </Button>
          }
        >
          <Button
            type="submit"
            form={SEND_FORM_ID}
            disabled={sendSubmission.pending}
          >
            Send code
          </Button>
        </Show>
      }
    >
      {sentPhoneNumber() === undefined
        ? (
          <form
            id={SEND_FORM_ID}
            method="post"
            action={sendPhoneOtp}
            class="space-y-4"
            onInput={() => {
              if (sendSubmission.result) sendSubmission.clear();
            }}
          >
            <TextField
              name="phoneNumber"
              type="tel"
              label="Phone number"
              placeholder="+358401234567"
              value={props.currentPhoneNumber ?? ""}
              required
              pattern="\+358\d{9}"
              hint="Enter a Finnish number, e.g. +358401234567"
              error={sendFieldErrors().phoneNumber}
              disabled={sendSubmission.pending}
            />
          </form>
        )
        : (
          <div class="space-y-4">
            <form
              id={VERIFY_FORM_ID}
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
            </form>
            <form method="post" action={sendPhoneOtp}>
              <input
                type="hidden"
                name="phoneNumber"
                value={sentPhoneNumber()}
              />
              <Button
                type="submit"
                variant="ghost"
                class="w-full"
                disabled={sendSubmission.pending || cooldown() > 0}
              >
                {cooldown() > 0
                  ? `Resend code (${cooldown()}s)`
                  : "Resend code"}
              </Button>
            </form>
          </div>
        )}
    </ResponsiveDialog>
  );
}

import { A, useSubmission } from "@solidjs/router";
import { resendEmailOtp, verifyEmailOtp } from "~/client/actions/auth.ts";
import { Button } from "~/client/components/ui/button.tsx";
import { SixDigitOtpInput } from "~/client/components/ui/form/six-digit-otp-input.tsx";
import {
  useSubmissionError,
  useSubmissionSuccess,
} from "~/client/hooks/use-submission.ts";
import { createSignal, type JSX, onCleanup, onMount } from "solid-js";
import { AuthHeader } from "./auth-header.tsx";

const RESEND_COOLDOWN = 60;

export function OTPValidation(props: { email: string }): JSX.Element {
  const [otp, setOtp] = createSignal("");
  const [cooldown, setCooldown] = createSignal(RESEND_COOLDOWN);
  let timer: ReturnType<typeof setInterval> | undefined;

  const verify = useSubmission(verifyEmailOtp);
  const resend = useSubmission(resendEmailOtp);

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

  onMount(() => startCooldown());
  onCleanup(() => clearInterval(timer));

  useSubmissionError(verify, "Verification failed");

  useSubmissionSuccess(resend, {
    successMessage: "OTP sent successfully",
    onSuccess: () => startCooldown(),
  });
  useSubmissionError(resend, "Failed to send OTP");

  return (
    <div class="space-y-8">
      <AuthHeader
        title="OTP Verification"
        subtitle={
          <>Enter the code sent to {props.email} to verify your account.</>
        }
      />
      <form
        method="post"
        action={verifyEmailOtp}
        class="grid gap-6"
      >
        <SixDigitOtpInput
          name="otp"
          value={otp()}
          onValueChange={setOtp}
          autofocus
        />
        <Button
          type="submit"
          class="w-full"
          disabled={verify.pending || otp().length !== 6}
        >
          Verify
        </Button>
      </form>
      <form
        method="post"
        action={resendEmailOtp}
        class="flex items-center justify-center gap-1 text-sm"
      >
        <span class="text-muted-foreground">Didn't receive the code?</span>
        <Button
          type="submit"
          variant="link"
          class="h-auto p-0 text-sm"
          disabled={resend.pending || cooldown() > 0}
        >
          {cooldown() > 0 ? `Resend (${cooldown()}s)` : "Resend"}
        </Button>
      </form>
      <A href="/auth/sign-in" class="w-full">
        <Button variant="outline" class="w-full" type="button">
          Back
        </Button>
      </A>
    </div>
  );
}

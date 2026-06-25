import { A, useSubmission } from "@solidjs/router";
import { resendEmailOtp, verifyEmailOtp } from "~/client/actions/auth.ts";
import { Button } from "~/client/components/ui/button.tsx";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPInput,
  InputOTPSeparator,
  InputOTPSlot,
} from "~/client/components/ui/input-otp.tsx";
import {
  createEffect,
  createSignal,
  type JSX,
  onCleanup,
  onMount,
} from "solid-js";
import { toast } from "solid-sonner";

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

  createEffect(() => {
    if (verify.error) {
      toast.error(verify.error.message || "Verification failed");
      verify.clear();
    }
  });

  createEffect(() => {
    if (resend.result?.ok) {
      toast.success("OTP sent successfully");
      startCooldown();
      resend.clear();
    }
    if (resend.error) {
      toast.error(resend.error.message || "Failed to send OTP");
      resend.clear();
    }
  });

  return (
    <div class="space-y-8">
      <div class="flex flex-col items-center gap-2 text-center">
        <h1 class="font-bold text-2xl">OTP Verification</h1>
        <p class="text-balance text-muted-foreground text-sm">
          Enter the code sent to {props.email} to verify your account.
        </p>
      </div>
      <form
        method="post"
        action={verifyEmailOtp}
        class="grid gap-6"
      >
        <div class="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp()}
            onValueChange={(v) => setOtp(v.replace(/\D/g, "").slice(0, 6))}
            autofocus
          >
            <InputOTPGroup>
              {[0, 1, 2].map((i) => <InputOTPSlot index={i} />)}
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              {[3, 4, 5].map((i) => <InputOTPSlot index={i} />)}
            </InputOTPGroup>
            <InputOTPInput name="otp" />
          </InputOTP>
        </div>
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

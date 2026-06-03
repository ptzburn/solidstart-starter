import { Button } from "~/client/components/ui/button.tsx";
import { useAppForm } from "~/client/hooks/use-app-form.ts";
import { authClient } from "~/client/lib/auth-client.ts";
import { createSignal, type JSX, onCleanup, onMount, Show } from "solid-js";
import { toast } from "solid-sonner";
import { z } from "zod";

type OTPValidationProps = {
  email: string;
  onBack?: () => void;
};

const RESEND_COOLDOWN = 60;

export function OTPValidation(props: OTPValidationProps): JSX.Element {
  const [isResending, setIsResending] = createSignal(false);
  const [cooldown, setCooldown] = createSignal(RESEND_COOLDOWN);
  let timer: ReturnType<typeof setInterval> | undefined;

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

  async function sendOtp(): Promise<void> {
    await authClient.emailOtp.sendVerificationOtp({
      email: props.email,
      type: "email-verification",
      fetchOptions: {
        onSuccess: () => {
          toast.success("OTP sent successfully");
        },
        onError: (error) => {
          toast.error(error.error.message || "An error occurred");
        },
      },
    });
  }

  async function handleResend(): Promise<void> {
    setIsResending(true);
    await sendOtp();
    setIsResending(false);
    startCooldown();
  }

  const otpForm = useAppForm(() => ({
    defaultValues: {
      otp: "",
    },
    validators: {
      onSubmit: z.object({
        otp: z.string().length(6, "Invalid OTP"),
      }),
    },
    onSubmit: async ({ value }) => {
      await authClient.emailOtp.verifyEmail({
        email: props.email,
        otp: value.otp,
        fetchOptions: {
          onSuccess: () => {
            toast.success("OTP verified successfully");
            globalThis.location.href = "/";
          },
          onError: (error) => {
            toast.error(
              error.error.message || "An error occurred",
            );
          },
        },
      });
    },
  }));

  return (
    <div class="space-y-8">
      <div class="flex flex-col items-center gap-2 text-center">
        <h1 class="font-bold text-2xl">
          OTP Verification
        </h1>
        <p class="text-balance text-muted-foreground text-sm">
          Enter the code sent to your email to verify your account.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          otpForm.handleSubmit();
        }}
        class="grid gap-6"
      >
        <otpForm.AppField name="otp">
          {(field) => <field.OTPField />}
        </otpForm.AppField>
        <div class="flex items-center justify-center gap-1 text-sm">
          <span class="text-muted-foreground">
            Didn't receive the code?
          </span>
          <Button
            variant="link"
            type="button"
            class="h-auto p-0 text-sm"
            onClick={handleResend}
            disabled={isResending() || cooldown() > 0}
          >
            {cooldown() > 0 ? `Resend (${cooldown()}s)` : "Resend"}
          </Button>
        </div>
        <otpForm.AppForm>
          <otpForm.SubmitButton>
            Verify
          </otpForm.SubmitButton>
        </otpForm.AppForm>
        <Show when={props.onBack}>
          <Button
            variant="outline"
            class="w-full"
            type="button"
            onClick={() => props.onBack?.()}
          >
            Back
          </Button>
        </Show>
      </form>
    </div>
  );
}

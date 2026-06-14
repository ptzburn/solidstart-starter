import { Turnstile, type TurnstileRef } from "@nerimity/solid-turnstile";
import { A, useSubmission } from "@solidjs/router";
import { requestPasswordReset } from "~/client/actions/auth.ts";
import { Button } from "~/client/components/ui/button.tsx";
import { TextField } from "~/client/components/ui/form/text-field.tsx";
import { createEffect, createSignal, type JSX } from "solid-js";
import { toast } from "solid-sonner";

export default function ForgotPasswordPage(): JSX.Element {
  const [turnstileToken, setTurnstileToken] = createSignal<string>();
  const submission = useSubmission(requestPasswordReset);
  const fieldErrors = (): Record<string, string | undefined> =>
    submission.result?.fieldErrors ?? {};
  let turnstileRef: TurnstileRef | undefined;

  const resetTurnstile = (): void => {
    setTurnstileToken(undefined);
    turnstileRef?.reset();
  };

  createEffect(() => {
    if (submission.error) {
      toast.error(submission.error.message || "Password reset request failed");
      resetTurnstile();
      submission.clear();
    }
  });

  return (
    <form
      method="post"
      action={requestPasswordReset}
      class="space-y-8"
      onInput={() => {
        if (submission.result) submission.clear();
      }}
    >
      <div class="flex flex-col items-center gap-2 text-center">
        <h1 class="font-bold text-2xl">Forgot Password</h1>
        <p class="text-balance text-muted-foreground text-sm">
          Enter your email to request a password reset.
        </p>
      </div>
      <div class="grid gap-6">
        <TextField
          name="email"
          label="Email"
          type="email"
          required
          placeholder="example@gmail.com"
          hint="Enter a valid email address"
          error={fieldErrors().email}
          disabled={submission.pending}
        />
        <div class="flex justify-center">
          <Turnstile
            ref={(r) => (turnstileRef = r)}
            sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
            onVerify={setTurnstileToken}
            autoResetOnExpire
          />
        </div>
        <Button
          type="submit"
          class="w-full"
          disabled={submission.pending || !turnstileToken()}
        >
          Request Password Reset
        </Button>
      </div>
      <div class="text-center text-sm">
        Remember your password?{" "}
        <A href="/auth/sign-in" class="underline underline-offset-4">
          Sign In
        </A>
      </div>
    </form>
  );
}

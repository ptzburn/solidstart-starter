import { Turnstile } from "@nerimity/solid-turnstile";
import { A, useSubmission } from "@solidjs/router";
import { requestPasswordReset } from "~/client/actions/auth.ts";
import { Button } from "~/client/components/ui/button.tsx";
import { TextField } from "~/client/components/ui/form/text-field.tsx";
import {
  useFormFieldErrors,
  useSubmissionError,
} from "~/client/hooks/use-submission.ts";
import type { JSX } from "solid-js";
import { AuthHeader } from "../_components/auth-header.tsx";
import { useTurnstile } from "../_components/use-turnstile.ts";

export default function ForgotPasswordPage(): JSX.Element {
  const submission = useSubmission(requestPasswordReset);
  const fieldErrors = useFormFieldErrors(submission);
  const turnstile = useTurnstile();

  useSubmissionError(
    submission,
    "Password reset request failed",
    turnstile.reset,
  );

  return (
    <form
      method="post"
      action={requestPasswordReset}
      class="space-y-8"
      onInput={() => {
        if (submission.result) submission.clear();
      }}
    >
      <AuthHeader
        title="Forgot Password"
        subtitle="Enter your email to request a password reset."
      />
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
            ref={turnstile.setRef}
            sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
            onVerify={turnstile.setToken}
            autoResetOnExpire
          />
        </div>
        <Button
          type="submit"
          class="w-full"
          disabled={submission.pending || !turnstile.token()}
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

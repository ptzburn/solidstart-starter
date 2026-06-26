import { Turnstile } from "@nerimity/solid-turnstile";
import { A, useSubmission } from "@solidjs/router";
import { signIn } from "~/client/actions/auth.ts";
import { Button } from "~/client/components/ui/button.tsx";
import { TextField } from "~/client/components/ui/form/text-field.tsx";
import {
  useFormFieldErrors,
  useSubmissionError,
} from "~/client/hooks/use-submission.ts";
import type { JSX } from "solid-js";
import { useTurnstile } from "./use-turnstile.ts";

export default function SignInForm(): JSX.Element {
  const submission = useSubmission(signIn);
  const fieldErrors = useFormFieldErrors(submission);
  const turnstile = useTurnstile();

  useSubmissionError(submission, "Sign in failed", turnstile.reset);

  return (
    <form
      method="post"
      action={signIn}
      class="space-y-6"
      onInput={() => {
        if (submission.result) submission.clear();
      }}
    >
      <div class="grid gap-6">
        <div class="flex flex-col gap-2">
          <TextField
            name="email"
            label="Email"
            type="email"
            required
            placeholder="john.doe@example.com"
            hint="Enter a valid email address"
            error={fieldErrors().email}
            disabled={submission.pending}
          />
          <A
            href="/auth/forgot-password"
            class="ml-auto text-sm underline-offset-4 hover:underline"
          >
            Forgot Password
          </A>
        </div>
        <TextField
          name="password"
          label="Password"
          type="password"
          minlength={8}
          required
          placeholder="••••••••"
          hint="Password must be at least 8 characters"
          error={fieldErrors().password}
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
        <div class="space-y-3">
          <Button
            type="submit"
            class="w-full"
            disabled={submission.pending || !turnstile.token()}
          >
            Sign in
          </Button>
          <Button
            as={A}
            variant="outline"
            class="w-full"
            href="/auth/sign-in"
          >
            Back
          </Button>
        </div>
      </div>
    </form>
  );
}

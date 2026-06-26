import { A, useLocation, useSubmission } from "@solidjs/router";
import { resetPassword } from "~/client/actions/auth.ts";
import { Button } from "~/client/components/ui/button.tsx";
import { TextField } from "~/client/components/ui/form/text-field.tsx";
import {
  useFormFieldErrors,
  useSubmissionError,
} from "~/client/hooks/use-submission.ts";
import { type JSX, Show } from "solid-js";
import { AuthHeader } from "../_components/auth-header.tsx";

export default function ResetPasswordPage(): JSX.Element {
  const location = useLocation();
  const token = (): string | null =>
    new URLSearchParams(location.search).get("token");

  const submission = useSubmission(resetPassword);
  const fieldErrors = useFormFieldErrors(submission);

  useSubmissionError(submission, "Password reset failed");

  return (
    <Show
      when={token()}
      fallback={
        <div class="space-y-6">
          <AuthHeader
            title="Invalid Link"
            subtitle="The link is invalid or has expired."
          />
          <div class="text-center">
            <A
              href="/auth/forgot-password"
              class="text-sm underline underline-offset-4"
            >
              Request a new link
            </A>
          </div>
        </div>
      }
    >
      {(t) => (
        <form
          method="post"
          action={resetPassword}
          class="space-y-8"
          onInput={() => {
            if (submission.result) submission.clear();
          }}
        >
          <input type="hidden" name="token" value={t()} />
          <AuthHeader
            title="Reset Password"
            subtitle="Enter your new password below."
          />
          <div class="grid gap-6">
            <TextField
              name="password"
              label="New Password"
              type="password"
              minlength={8}
              required
              placeholder="Enter your new password"
              hint="Password must be at least 8 characters"
              error={fieldErrors().password}
              disabled={submission.pending}
            />
            <TextField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              minlength={8}
              required
              placeholder="Confirm your new password"
              hint="Password must be at least 8 characters"
              error={fieldErrors().confirmPassword}
              disabled={submission.pending}
            />
            <Button
              type="submit"
              class="w-full"
              disabled={submission.pending}
            >
              Reset Password
            </Button>
          </div>
          <div class="text-center text-sm">
            Remember your password?{" "}
            <A href="/auth/sign-in" class="underline underline-offset-4">
              Sign In
            </A>
          </div>
        </form>
      )}
    </Show>
  );
}

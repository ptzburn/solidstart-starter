import { Turnstile, type TurnstileRef } from "@nerimity/solid-turnstile";
import { A, useSubmission } from "@solidjs/router";
import { signUp } from "~/client/actions/auth.ts";
import { Button } from "~/client/components/ui/button.tsx";
import { TextField } from "~/client/components/ui/form2/text-field.tsx";
import { createEffect, createSignal, type JSX } from "solid-js";
import { toast } from "solid-sonner";

export default function SignUpForm(): JSX.Element {
  const [turnstileToken, setTurnstileToken] = createSignal<string>();
  const submission = useSubmission(signUp);
  const fieldErrors = () => submission.result?.fieldErrors ?? {};
  let turnstileRef: TurnstileRef | undefined;

  const resetTurnstile = (): void => {
    setTurnstileToken(undefined);
    turnstileRef?.reset();
  };

  createEffect(() => {
    if (submission.error) {
      toast.error(submission.error.message || "Sign up failed");
      resetTurnstile();
      submission.clear();
    }
  });

  return (
    <form
      method="post"
      action={signUp}
      class="space-y-6"
      onInput={() => {
        if (submission.result) submission.clear();
      }}
    >
      <div class="grid gap-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            name="firstName"
            label="First name"
            type="text"
            minlength={2}
            required
            placeholder="John"
            hint="Enter your first name"
            error={fieldErrors().firstName}
            disabled={submission.pending}
          />
          <TextField
            name="lastName"
            label="Last name"
            type="text"
            minlength={2}
            required
            placeholder="Doe"
            hint="Enter your last name"
            error={fieldErrors().lastName}
            disabled={submission.pending}
          />
        </div>
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
        <TextField
          name="confirmPassword"
          label="Confirm password"
          type="password"
          minlength={8}
          required
          placeholder="••••••••"
          error={fieldErrors().confirmPassword}
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
        <div class="space-y-3">
          <Button
            type="submit"
            class="w-full"
            disabled={submission.pending || !turnstileToken()}
          >
            Create account
          </Button>
          <Button
            as={A}
            variant="outline"
            class="w-full"
            href="/auth/sign-up"
          >
            Back
          </Button>
        </div>
      </div>
    </form>
  );
}

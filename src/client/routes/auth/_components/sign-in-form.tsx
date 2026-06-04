import { Turnstile, type TurnstileRef } from "@nerimity/solid-turnstile";
import { A, useSubmission } from "@solidjs/router";
import { signIn } from "~/client/actions/auth.ts";
import { Button } from "~/client/components/ui/button.tsx";
import { TextField } from "~/client/components/ui/form2/text-field.tsx";
import { createEffect, createSignal, type JSX, type Setter } from "solid-js";
import { toast } from "solid-sonner";

type SignInFormProps = {
  setter: Setter<boolean>;
};

export default function SignInForm(props: SignInFormProps): JSX.Element {
  const [turnstileToken, setTurnstileToken] = createSignal<string>();
  const submission = useSubmission(signIn);
  const fieldErrors = () => submission.result?.fieldErrors ?? {};
  let turnstileRef: TurnstileRef | undefined;

  const resetTurnstile = (): void => {
    setTurnstileToken(undefined);
    turnstileRef?.reset();
  };

  createEffect(() => {
    if (submission.error) {
      toast.error(submission.error.message || "Sign in failed");
      resetTurnstile();
      submission.clear();
    }
  });

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
            Sign in
          </Button>
          <Button
            variant="outline"
            class="w-full"
            type="button"
            onClick={() => props.setter(false)}
          >
            Back
          </Button>
        </div>
      </div>
    </form>
  );
}

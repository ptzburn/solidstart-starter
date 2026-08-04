import { A, useSubmission } from "@solidjs/router";
import { signUpSocial } from "~/client/actions/auth.ts";
import { Button } from "~/client/components/ui/button.tsx";
import { Separator } from "~/client/components/ui/separator.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { useSubmissionError } from "~/client/hooks/use-submission.ts";
import GithubIcon from "~icons/ri/github-fill";
import GoogleIcon from "~icons/ri/google-fill";
import { type JSX, Show } from "solid-js";
import { AuthHeader } from "../_components/auth-header.tsx";

export default function SignUpPage(): JSX.Element {
  const submission = useSubmission(signUpSocial);

  useSubmissionError(submission, "An error occurred while signing up");

  return (
    <div class="space-y-8">
      <AuthHeader title="Sign up" />
      <div class="grid gap-6">
        <form method="post" action={signUpSocial}>
          <input type="hidden" name="provider" value="github" />
          <Button
            variant="outline"
            class="relative w-full"
            type="submit"
            disabled={submission.pending}
          >
            <Show
              when={submission.pending}
              fallback={<GithubIcon class="size-5" />}
            >
              <Spinner />
            </Show>
            Sign up with GitHub
          </Button>
        </form>

        <form method="post" action={signUpSocial}>
          <input type="hidden" name="provider" value="google" />
          <Button
            variant="outline"
            class="relative w-full"
            type="submit"
            disabled={submission.pending}
          >
            <Show
              when={submission.pending}
              fallback={<GoogleIcon class="size-5" />}
            >
              <Spinner />
            </Show>
            Sign up with Google
          </Button>
        </form>

        <Separator />

        <Button
          as={A}
          variant="outline"
          class="relative w-full"
          href="/auth/sign-up/email"
          disabled={submission.pending}
        >
          Continue with email
        </Button>
      </div>

      <div class="text-center text-sm">
        Already have an account?{" "}
        <A
          href="/auth/sign-in"
          class="underline underline-offset-4"
        >
          Sign in
        </A>
      </div>
    </div>
  );
}

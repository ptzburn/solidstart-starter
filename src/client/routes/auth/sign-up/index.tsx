import { A, useSubmission } from "@solidjs/router";
import { signUpSocial } from "~/client/actions/auth.ts";
import { Button } from "~/client/components/ui/button.tsx";
import { Separator } from "~/client/components/ui/separator.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import SimpleIconsGithub from "~icons/simple-icons/github";
import SimpleIconsGoogle from "~icons/simple-icons/google";
import { createEffect, type JSX, Show } from "solid-js";
import { toast } from "solid-sonner";

export default function SignUpPage(): JSX.Element {
  const submission = useSubmission(signUpSocial);

  createEffect(() => {
    if (submission.error) {
      toast.error(
        submission.error.message || "An error occurred while signing up",
      );
      submission.clear();
    }
  });

  return (
    <div class="space-y-8">
      <div class="flex flex-col items-center gap-2 text-center">
        <h1 class="font-bold text-2xl">Sign up</h1>
      </div>
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
              fallback={<SimpleIconsGithub class="size-5" />}
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
              fallback={<SimpleIconsGoogle class="size-5" />}
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

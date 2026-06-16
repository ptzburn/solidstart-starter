import { A, createAsync, useSubmission } from "@solidjs/router";
import { signInSocial } from "~/client/actions/auth.ts";
import { Badge } from "~/client/components/ui/badge.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { Separator } from "~/client/components/ui/separator.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { authClient } from "~/client/lib/auth-client.ts";
import { getLastLoginMethodQuery } from "~/client/queries/auth.ts";
import FingerprintPattern from "~icons/lucide/fingerprint-pattern";
import SimpleIconsGithub from "~icons/simple-icons/github";
import SimpleIconsGoogle from "~icons/simple-icons/google";
import { createEffect, createSignal, type JSX, Show } from "solid-js";
import { toast } from "solid-sonner";

function LastUsedBadge(): JSX.Element {
  return (
    <Badge class="absolute -top-2 -right-2 px-1.5 py-0 text-[10px]">
      Last used
    </Badge>
  );
}

function SignInPage(): JSX.Element {
  const [passkeyLoading, setPasskeyLoading] = createSignal(false);
  const lastLoginMethod = createAsync(() => getLastLoginMethodQuery(), {
    deferStream: true,
  });
  const submission = useSubmission(signInSocial);

  const anyPending = (): boolean => submission.pending || passkeyLoading();

  createEffect(() => {
    if (submission.error) {
      toast.error(
        submission.error.message || "An error occurred while signing in",
      );
      submission.clear();
    }
  });

  async function handlePasskeySignIn(): Promise<void> {
    setPasskeyLoading(true);
    await authClient.signIn.passkey({
      fetchOptions: {
        onSuccess: () => {
          globalThis.location.href = "/dashboard";
        },
        onError: (ctx) => {
          toast.error(
            ctx.error.message || "An error occurred while signing in",
          );
        },
      },
    });
    setPasskeyLoading(false);
  }

  return (
    <>
      <div class="space-y-8">
        <div class="flex flex-col items-center gap-2 text-center">
          <h1 class="font-bold text-2xl">Sign in</h1>
        </div>
        <div class="grid gap-6">
          <form method="post" action={signInSocial}>
            <input type="hidden" name="provider" value="github" />
            <Button
              variant="outline"
              class="relative w-full"
              type="submit"
              disabled={anyPending()}
            >
              <Show
                when={anyPending()}
                fallback={<SimpleIconsGithub class="size-5" />}
              >
                <Spinner />
              </Show>
              Sign in with GitHub
              <Show when={lastLoginMethod() === "github"}>
                <LastUsedBadge />
              </Show>
            </Button>
          </form>

          <form method="post" action={signInSocial}>
            <input type="hidden" name="provider" value="google" />
            <Button
              variant="outline"
              class="relative w-full"
              type="submit"
              disabled={anyPending()}
            >
              <Show
                when={anyPending()}
                fallback={<SimpleIconsGoogle class="size-5" />}
              >
                <Spinner />
              </Show>
              Sign in with Google
              <Show when={lastLoginMethod() === "google"}>
                <LastUsedBadge />
              </Show>
            </Button>
          </form>

          <Button
            variant="outline"
            class="relative w-full"
            type="button"
            onClick={handlePasskeySignIn}
            disabled={anyPending()}
          >
            <Show
              when={anyPending()}
              fallback={<FingerprintPattern class="size-5" />}
            >
              <Spinner />
            </Show>
            Sign in with Passkey
            <Show when={lastLoginMethod() === "passkey"}>
              <LastUsedBadge />
            </Show>
          </Button>

          <Separator />

          <Button
            as={A}
            variant="outline"
            class="relative w-full"
            href="/auth/sign-in/email"
            disabled={anyPending()}
          >
            Continue with email
            <Show when={lastLoginMethod() === "email"}>
              <LastUsedBadge />
            </Show>
          </Button>
        </div>

        <div class="text-center text-sm">
          Don't have an account?{"  "}
          <A
            href="/auth/sign-up"
            class="underline underline-offset-4"
          >
            Sign up
          </A>
        </div>
      </div>
    </>
  );
}

export default SignInPage;

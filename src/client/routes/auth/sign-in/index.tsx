import { A, useNavigate } from "@solidjs/router";
import { Badge } from "~/client/components/ui/badge.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { Separator } from "~/client/components/ui/separator.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { authClient } from "~/client/lib/auth-client.ts";
import FingerprintPattern from "~icons/lucide/fingerprint-pattern";
import SimpleIconsGithub from "~icons/simple-icons/github";
import SimpleIconsGoogle from "~icons/simple-icons/google";
import { createSignal, type JSX, onMount, Show } from "solid-js";
import { toast } from "solid-sonner";
import SignInForm from "../_components/sign-in-form.tsx";

function LastUsedBadge(): JSX.Element {
  return (
    <Badge class="absolute -top-2 -right-2 px-1.5 py-0 text-[10px]">
      Last used
    </Badge>
  );
}

function SignInPage(): JSX.Element {
  const [isLoading, setIsLoading] = createSignal(false);
  const [showEmailForm, setShowEmailForm] = createSignal(false);
  const [lastLoginMethod, setLastLoginMethod] = createSignal<string | null>(
    null,
  );
  const navigate = useNavigate();

  async function handleGoogleSignIn(): Promise<void> {
    setIsLoading(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
      errorCallbackURL: "/auth/error",
      fetchOptions: {
        onError: (error) => {
          navigate("/auth/sign-in");
          toast.error(
            error.error.message || "An error occurred while signing in",
          );
        },
      },
    });
    setIsLoading(false);
  }

  async function handleGitHubSignIn(): Promise<void> {
    setIsLoading(true);
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
      errorCallbackURL: "/auth/error",
      fetchOptions: {
        onError: (error) => {
          navigate("/auth/sign-in");
          toast.error(
            error.error.message || "An error occurred while signing in",
          );
        },
      },
    });
    setIsLoading(false);
  }

  async function handlePasskeySignIn(): Promise<void> {
    setIsLoading(true);
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
    setIsLoading(false);
  }

  onMount(() => {
    setLastLoginMethod(authClient.getLastUsedLoginMethod());
  });

  return (
    <>
      <div class="space-y-8">
        <div class="flex flex-col items-center gap-2 text-center">
          <h1 class="font-bold text-2xl">Sign in</h1>
        </div>
        <Show
          when={!showEmailForm()}
          fallback={<SignInForm setter={setShowEmailForm} />}
        >
          <div class="grid gap-6">
            <Button
              variant="outline"
              class="relative w-full"
              type="button"
              onClick={handleGitHubSignIn}
              disabled={isLoading()}
            >
              <Show
                when={isLoading()}
                fallback={<SimpleIconsGithub class="size-5" />}
              >
                <Spinner />
              </Show>
              Sign in with GitHub
              <Show when={lastLoginMethod() === "github"}>
                <LastUsedBadge />
              </Show>
            </Button>

            <Button
              variant="outline"
              class="relative w-full"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading()}
            >
              <Show
                when={isLoading()}
                fallback={<SimpleIconsGoogle class="size-5" />}
              >
                <Spinner />
              </Show>
              Sign in with Google
              <Show when={lastLoginMethod() === "google"}>
                <LastUsedBadge />
              </Show>
            </Button>

            <Button
              variant="outline"
              class="relative w-full"
              type="button"
              onClick={handlePasskeySignIn}
              disabled={isLoading()}
            >
              <Show
                when={isLoading()}
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
              variant="outline"
              class="relative w-full"
              type="button"
              onClick={() => setShowEmailForm(true)}
              disabled={isLoading()}
            >
              Continue with email
              <Show when={lastLoginMethod() === "email"}>
                <LastUsedBadge />
              </Show>
            </Button>
          </div>
        </Show>

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

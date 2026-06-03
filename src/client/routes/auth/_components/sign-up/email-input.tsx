import { A, useNavigate } from "@solidjs/router";
import { Button } from "~/client/components/ui/button.tsx";
import { Separator } from "~/client/components/ui/separator.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { useAppForm } from "~/client/hooks/use-app-form.ts";
import { authClient } from "~/client/lib/auth-client.ts";
import type { Step } from "~/client/routes/auth/sign-up/index.tsx";
import SimpleIconsGithub from "~icons/simple-icons/github";
import SimpleIconsGoogle from "~icons/simple-icons/google";
import { createSignal, type JSX, Match, type Setter, Switch } from "solid-js";
import { toast } from "solid-sonner";
import z from "zod";

type EmailInputProps = {
  setStep: Setter<Step>;
  setEmail: Setter<string>;
};

export function EmailInput(props: EmailInputProps): JSX.Element {
  const [isLoading, setIsLoading] = createSignal(false);
  const navigate = useNavigate();

  const emailForm = useAppForm(() => ({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: z.object({
        email: z.email(),
      }),
    },
    onSubmit: ({ value }) => {
      props.setEmail(value.email);
      props.setStep("registration");
    },
  }));

  async function handleGoogleSignUp(): Promise<void> {
    setIsLoading(true);

    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard?signup=true",
      requestSignUp: true,
      fetchOptions: {
        onError: (error) => {
          navigate("/auth/sign-up");
          toast.error(
            error.error.message || "An error occurred",
          );
        },
      },
    });
    setIsLoading(false);
  }

  async function handleGitHubSignUp(): Promise<void> {
    setIsLoading(true);

    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
      errorCallbackURL: "/auth/error",
      requestSignUp: true,
      fetchOptions: {
        onError: (error) => {
          navigate("/auth/sign-up");
          toast.error(
            error.error.message || "An error occurred",
          );
        },
      },
    });
    setIsLoading(false);
  }

  return (
    <div class="space-y-8">
      <div class="flex flex-col items-center gap-2 text-center">
        <h1 class="font-bold text-2xl">Sign Up</h1>
      </div>
      <div class="grid gap-6">
        <Button
          variant="outline"
          class="relative w-full cursor-pointer"
          type="button"
          onClick={handleGitHubSignUp}
          disabled={isLoading()}
        >
          <Switch>
            <Match when={isLoading()}>
              <Spinner />
            </Match>
            <Match when={!isLoading()}>
              <SimpleIconsGithub class="size-5" />
            </Match>
          </Switch>
          Sign up with GitHub
        </Button>
        <Button
          variant="outline"
          class="relative w-full cursor-pointer"
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isLoading()}
        >
          <Switch>
            <Match when={isLoading()}>
              <Spinner />
            </Match>
            <Match when={!isLoading()}>
              <SimpleIconsGoogle class="size-5" />
            </Match>
          </Switch>
          Sign up with Google
        </Button>
        <Separator />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          emailForm.handleSubmit();
        }}
        class="space-y-8"
      >
        <div class="grid gap-6">
          <emailForm.AppField name="email">
            {(field) => (
              <field.TextField
                type="email"
                label="Email"
                placeholder="johndoe@example.com"
              />
            )}
          </emailForm.AppField>
          <emailForm.AppForm>
            <emailForm.SubmitButton>
              Continue
            </emailForm.SubmitButton>
          </emailForm.AppForm>
        </div>
      </form>
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

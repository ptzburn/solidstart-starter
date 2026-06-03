import { Turnstile, type TurnstileRef } from "@nerimity/solid-turnstile";
import { A } from "@solidjs/router";
import { Button } from "~/client/components/ui/button.tsx";
import { useAppForm } from "~/client/hooks/use-app-form.ts";

import { authClient } from "~/client/lib/auth-client.ts";
import { createSignal, type JSX, Match, type Setter, Switch } from "solid-js";
import { toast } from "solid-sonner";
import z from "zod";
import { OTPValidation } from "./otp-validation.tsx";
import { TwoFactorVerification } from "./two-factor-verification.tsx";

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

type SignInStep = "credentials" | "otp" | "two-factor";

type SignInFormProps = {
  setter: Setter<boolean>;
};

export default function SignInForm(props: SignInFormProps): JSX.Element {
  const [turnstileToken, setTurnstileToken] = createSignal<string>();
  const [step, setStep] = createSignal<SignInStep>("credentials");
  let turnstileRef: TurnstileRef | undefined;

  const resetTurnstile = (): void => {
    setTurnstileToken(undefined);
    turnstileRef?.reset();
  };

  const form = useAppForm(() => ({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const { email, password } = value;
      await authClient.signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
        fetchOptions: {
          headers: {
            "x-captcha-response": turnstileToken() ?? "",
          },
          onSuccess: (ctx) => {
            if (ctx.data.twoFactorRedirect) {
              setStep("two-factor");
            }
          },
          onError: (ctx) => {
            if (ctx.error.status === 403) {
              setStep("otp");
            }
            toast.error(ctx.error.message || "An error occurred");
          },
        },
      });
      resetTurnstile();
    },
  }));

  return (
    <Switch>
      <Match when={step() === "otp"}>
        <OTPValidation
          email={form.state.values.email}
          onBack={() => setStep("credentials")}
        />
      </Match>
      <Match when={step() === "two-factor"}>
        <TwoFactorVerification
          onBack={() => setStep("credentials")}
        />
      </Match>
      <Match when={step() === "credentials"}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          class="space-y-6"
        >
          <div class="grid gap-6">
            <form.AppField name="email">
              {(field) => (
                <field.TextField
                  type="email"
                  placeholder="Enter your email"
                />
              )}
            </form.AppField>
            <form.AppField name="password">
              {(field) => (
                <div class="space-y-2">
                  <div class="flex items-center">
                    <A
                      href="/auth/forgot-password"
                      class="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot Password
                    </A>
                  </div>
                  <field.TextField
                    type="password"
                    placeholder="Enter your password"
                  />
                </div>
              )}
            </form.AppField>
            <div class="flex justify-center">
              <Turnstile
                ref={(r) => (turnstileRef = r)}
                sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                onVerify={setTurnstileToken}
                autoResetOnExpire
              />
            </div>
            <div class="space-y-3">
              <form.AppForm>
                <form.SubmitButton disabled={!turnstileToken()}>
                  Sign In
                </form.SubmitButton>
              </form.AppForm>
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <Button
                    variant="outline"
                    class="w-full"
                    type="button"
                    onClick={() => props.setter(false)}
                    disabled={isSubmitting()}
                  >
                    Back
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </div>
        </form>
      </Match>
    </Switch>
  );
}

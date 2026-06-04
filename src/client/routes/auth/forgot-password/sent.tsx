import { A, createAsync } from "@solidjs/router";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "~/client/components/ui/alert.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { getPasswordResetSentEmailQuery } from "~/client/queries/auth.ts";
import MailCheck from "~icons/lucide/mail-check";
import { type JSX, Show, Suspense } from "solid-js";

export default function ForgotPasswordSentPage(): JSX.Element {
  const email = createAsync(() => getPasswordResetSentEmailQuery());

  return (
    <Suspense
      fallback={
        <div class="flex items-center justify-center">
          <Spinner class="size-10" />
        </div>
      }
    >
      <Show when={email()}>
        {(e) => (
          <div class="space-y-6">
            <Alert>
              <MailCheck class="size-4" />
              <AlertTitle>Check your email</AlertTitle>
              <AlertDescription>
                If an account exists for{" "}
                <span class="font-medium text-foreground">{e()}</span>, you'll
                receive a password reset link shortly. Follow the link to set a
                new password.
              </AlertDescription>
            </Alert>
            <Button
              as={A}
              variant="outline"
              class="w-full"
              href="/auth/sign-in"
            >
              Back to sign in
            </Button>
          </div>
        )}
      </Show>
    </Suspense>
  );
}

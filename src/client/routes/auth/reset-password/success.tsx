import { A, createAsync } from "@solidjs/router";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "~/client/components/ui/alert.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { requirePasswordResetCompletedQuery } from "~/client/queries/auth.ts";
import CircleCheckBig from "~icons/lucide/circle-check-big";
import { type JSX, Show, Suspense } from "solid-js";

export default function ResetPasswordSuccessPage(): JSX.Element {
  const allowed = createAsync(() => requirePasswordResetCompletedQuery(), {
    deferStream: true,
  });

  return (
    <Suspense
      fallback={
        <div class="flex items-center justify-center">
          <Spinner class="size-10" />
        </div>
      }
    >
      <Show when={allowed()}>
        <div class="space-y-6">
          <Alert>
            <CircleCheckBig class="size-4" />
            <AlertTitle>Password updated</AlertTitle>
            <AlertDescription>
              Your password has been changed. Sign in with your new password to
              continue.
            </AlertDescription>
          </Alert>
          <Button
            as={A}
            class="w-full"
            href="/auth/sign-in"
          >
            Sign in
          </Button>
        </div>
      </Show>
    </Suspense>
  );
}

import { createAsync } from "@solidjs/router";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { getPendingSigninEmailQuery } from "~/client/queries/auth.ts";
import { type JSX, Show, Suspense } from "solid-js";
import { OTPValidation } from "../_components/otp-validation.tsx";

export default function VerifyEmailPage(): JSX.Element {
  const email = createAsync(() => getPendingSigninEmailQuery());

  return (
    <Suspense
      fallback={
        <div class="flex items-center justify-center">
          <Spinner class="size-10" />
        </div>
      }
    >
      <Show when={email()}>
        {(e) => <OTPValidation email={e()} />}
      </Show>
    </Suspense>
  );
}

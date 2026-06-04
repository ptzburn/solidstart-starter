import { createAsync } from "@solidjs/router";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { requireTwoFactorPendingQuery } from "~/client/queries/auth.ts";
import { type JSX, Show, Suspense } from "solid-js";
import { TwoFactorVerification } from "../_components/two-factor-verification.tsx";

export default function TwoFactorPage(): JSX.Element {
  const allowed = createAsync(() => requireTwoFactorPendingQuery());

  return (
    <Suspense
      fallback={
        <div class="flex items-center justify-center">
          <Spinner class="size-10" />
        </div>
      }
    >
      <Show when={allowed()}>
        <TwoFactorVerification />
      </Show>
    </Suspense>
  );
}

import { createAsync } from "@solidjs/router";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { signOutQuery } from "~/client/queries/auth.ts";
import { type JSX, Suspense } from "solid-js";

export default function SignOutPage(): JSX.Element {
  const result = createAsync(() => signOutQuery());

  return (
    <div class="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <Suspense
        fallback={
          <div class="flex flex-col items-center justify-center space-y-4">
            <Spinner class="size-10" />
            <div>
              <h1 class="font-bold text-2xl">
                Signing out...
              </h1>
              <p class="text-balance text-muted-foreground text-sm">
                Please wait while we sign you out...
              </p>
            </div>
          </div>
        }
      >
        {result()}
      </Suspense>
    </div>
  );
}

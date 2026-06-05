import type { RouteSectionProps } from "@solidjs/router";
import AuthErrorFallback from "~/client/routes/auth/_components/error-fallback.tsx";
import { ErrorBoundary, type JSX } from "solid-js";

export default function AuthLayout(props: RouteSectionProps): JSX.Element {
  return (
    <div class="grid min-h-0 flex-1 lg:grid-cols-2">
      <div class="flex flex-col gap-4 p-6 md:p-10">
        <div class="flex min-h-0 flex-1 items-center justify-center">
          <div class="w-full max-w-xs">
            <ErrorBoundary
              fallback={(error, reset) => (
                <AuthErrorFallback error={error} reset={reset} />
              )}
            >
              {props.children}
            </ErrorBoundary>
          </div>
        </div>
      </div>
      <div class="relative hidden items-center justify-center overflow-hidden bg-muted p-8 lg:flex">
        <img
          src="/auth-background.webp"
          alt="Auth Background"
          class="absolute inset-0 object-cover"
        />
      </div>
    </div>
  );
}

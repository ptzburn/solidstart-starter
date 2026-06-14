import type { RouteSectionProps } from "@solidjs/router";
import { SiteFooter } from "~/client/components/site-footer.tsx";
import { SiteHeader } from "~/client/components/site-header.tsx";
import AuthErrorFallback from "~/client/routes/auth/_components/error-fallback.tsx";
import { ErrorBoundary, type JSX } from "solid-js";

export default function AuthLayout(props: RouteSectionProps): JSX.Element {
  return (
    <div class="flex min-h-0 flex-1 flex-col">
      <SiteHeader />
      <div class="grid min-h-0 flex-1 lg:grid-cols-2">
        <div class="min-h-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-6 md:p-10">
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
      <SiteFooter />
    </div>
  );
}

import type { RouteSectionProps } from "@solidjs/router";
import { SiteHeader } from "~/client/components/site-header.tsx";
import AuthErrorFallback from "~/client/routes/auth/_components/error-fallback.tsx";
import { ErrorBoundary, type JSX } from "solid-js";

export default function AuthLayout(props: RouteSectionProps): JSX.Element {
  return (
    <div class="grid min-h-0 flex-1 lg:grid-cols-2">
      {
        /* The header belongs to the form column only, so it never overlaps
          the image half. `max-w-none` lets it fill that column instead of
          centering the landing page's 5xl row inside it. */
      }
      <div class="flex min-h-0 flex-col">
        <SiteHeader
          minimal
          class="shrink-0 border-b-0"
          containerClass="max-w-none"
        />
        <div class="min-h-0 flex-1 overflow-y-auto">
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

import { createAsync, useParams } from "@solidjs/router";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { getUserByIdQuery } from "~/client/queries/users.ts";
import { type JSX, Show, Suspense } from "solid-js";
import { AccountDetails } from "./_components/account-details.tsx";
import { ActionSection } from "./_components/action-section.tsx";
import { Hero } from "./_components/hero.tsx";

export default function UserDetailPage(): JSX.Element {
  const params = useParams<{ userId: string }>();

  const user = createAsync(() => getUserByIdQuery(params.userId));

  return (
    <Suspense
      fallback={
        <div class="flex flex-1 items-center justify-center">
          <Spinner class="size-6" />
        </div>
      }
    >
      <Show when={user()}>
        {(user) => (
          <div class="flex min-w-0 flex-col gap-4 overflow-y-auto">
            <div class="space-y-4 md:space-y-8">
              {/* Hero Section */}
              <Hero user={user} />

              {/* Main Content Grid */}
              <div class="grid gap-6 md:grid-cols-3">
                {/* Left Column - Main Info */}
                <div class="space-y-6 md:col-span-2">
                  <AccountDetails user={user} />
                </div>

                {/* Right Column - Actions & Status */}
                <div class="space-y-6">
                  <div class="sticky top-6 space-y-6">
                    <ActionSection user={user} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Show>
    </Suspense>
  );
}

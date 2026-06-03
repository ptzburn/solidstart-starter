import { createAsync } from "@solidjs/router";
import { ErrorBoundaryMessage } from "~/client/components/error-boundary-message.tsx";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/client/components/ui/empty.tsx";
import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationItems,
  PaginationNext,
  PaginationPrevious,
} from "~/client/components/ui/pagination.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { listUsersQuery, USERS_PAGE_SIZE } from "~/client/queries/auth.ts";
import UsersIcon from "~icons/lucide/users";
import {
  createMemo,
  createSignal,
  ErrorBoundary,
  For,
  type JSX,
  Show,
  Suspense,
} from "solid-js";
import { UserCard } from "./_components/user-card.tsx";
import { type UserFilters, UserSearch } from "./_components/user-search.tsx";

export default function UsersPage(): JSX.Element {
  const [filters, setFilters] = createSignal<UserFilters>({
    name: "",
    email: "",
    role: "",
  });
  const [page, setPage] = createSignal(1);

  const data = createAsync(() =>
    listUsersQuery(page(), filters().name, filters().email, filters().role)
  );

  const totalPages = createMemo(() => {
    const total = data()?.total ?? 0;
    return Math.ceil(total / USERS_PAGE_SIZE);
  });

  return (
    <div class="flex flex-1 flex-col gap-6">
      <div class="flex flex-col gap-2">
        <h2>Users</h2>
        <p class="text-muted-foreground">
          Manage users and their permissions.
        </p>
      </div>

      <div class="flex flex-1 flex-col gap-6">
        <UserSearch
          onSubmit={(value) => {
            setFilters(value);
            setPage(1);
          }}
          onClear={() => {
            setFilters({ name: "", email: "", role: "" });
            setPage(1);
          }}
        />
        <ErrorBoundary
          fallback={(error) => <ErrorBoundaryMessage error={error} />}
        >
          <Suspense
            fallback={
              <div class="flex flex-1 items-center justify-center">
                <Spinner class="size-10" />
              </div>
            }
          >
            <Show when={data()}>
              {(result) => (
                <Show
                  when={result().users.length !== 0}
                  fallback={
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <UsersIcon />
                        </EmptyMedia>
                        <EmptyTitle>No users found</EmptyTitle>
                        <EmptyDescription>
                          No users found.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  }
                >
                  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <For each={result().users}>
                      {(user) => <UserCard user={user} />}
                    </For>
                  </div>

                  <Show when={totalPages() > 1}>
                    <Pagination
                      count={totalPages()}
                      page={page()}
                      onPageChange={setPage}
                      itemComponent={(props) => (
                        <PaginationItem page={props.page}>
                          {props.page}
                        </PaginationItem>
                      )}
                      ellipsisComponent={() => <PaginationEllipsis />}
                      class="*:justify-center"
                    >
                      <PaginationPrevious />
                      <PaginationItems />
                      <PaginationNext />
                    </Pagination>
                  </Show>
                </Show>
              )}
            </Show>
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}

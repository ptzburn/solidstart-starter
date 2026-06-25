import {
  A,
  createAsync,
  type RouteDefinition,
  useSearchParams,
} from "@solidjs/router";
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
  ErrorBoundary,
  For,
  type JSX,
  Show,
  Suspense,
} from "solid-js";
import { UserCard } from "./_components/user-card.tsx";
import { UserSearch } from "./_components/user-search.tsx";

type Filters = { name: string; email: string; role: string };

function single(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function buildHref(filters: Filters, page: number): string {
  const sp = new URLSearchParams();
  if (filters.name) sp.set("name", filters.name);
  if (filters.email) sp.set("email", filters.email);
  if (filters.role) sp.set("role", filters.role);
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `/dashboard/admin/users?${qs}` : "/dashboard/admin/users";
}

export const route = {
  preload: ({ location }) =>
    listUsersQuery(
      Number(single(location.query.page)) || 1,
      single(location.query.name),
      single(location.query.email),
      single(location.query.role),
    ),
} satisfies RouteDefinition;

export default function UsersPage(): JSX.Element {
  const [params] = useSearchParams();

  const page = (): number => Number(single(params.page)) || 1;
  const filters = (): Filters => ({
    name: single(params.name),
    email: single(params.email),
    role: single(params.role),
  });

  const data = createAsync(
    () =>
      listUsersQuery(page(), filters().name, filters().email, filters().role),
    { deferStream: true },
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
        <UserSearch />
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
                      itemComponent={(props) => (
                        <PaginationItem
                          page={props.page}
                          as={A}
                          href={buildHref(filters(), props.page)}
                        >
                          {props.page}
                        </PaginationItem>
                      )}
                      ellipsisComponent={() => <PaginationEllipsis />}
                    >
                      <PaginationPrevious
                        as={A}
                        href={buildHref(filters(), Math.max(1, page() - 1))}
                      />
                      <PaginationItems />
                      <PaginationNext
                        as={A}
                        href={buildHref(
                          filters(),
                          Math.min(totalPages(), page() + 1),
                        )}
                      />
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

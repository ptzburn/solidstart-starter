import {
  createAsync,
  type RouteDefinition,
  useSubmission,
} from "@solidjs/router";
import { revokeOtherSessions, revokeSession } from "~/client/actions/auth.ts";
import { ConfirmDialog } from "~/client/components/confirm-dialog.tsx";
import { DataBoundary } from "~/client/components/data-boundary.tsx";
import { PageHeader } from "~/client/components/page-header.tsx";
import { Badge } from "~/client/components/ui/badge.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/client/components/ui/table.tsx";
import { useSession } from "~/client/contexts/session-context.tsx";
import {
  useSubmissionError,
  useSubmissionSuccess,
} from "~/client/hooks/use-submission.ts";
import { listSessionsQuery } from "~/client/queries/auth.ts";
import Monitor from "~icons/ri/computer-line";
import LogOut from "~icons/ri/logout-box-r-line";
import Smartphone from "~icons/ri/smartphone-line";
import Tablet from "~icons/ri/tablet-line";
import { createSignal, For, type JSX, Match, Show, Switch } from "solid-js";

export const route = {
  preload: () => listSessionsQuery(),
} satisfies RouteDefinition;

function parseUserAgent(
  ua?: string | null,
): { browser: string; os: string; device: "mobile" | "tablet" | "desktop" } {
  if (!ua) {
    return { browser: "Unknown", os: "Unknown", device: "desktop" as const };
  }

  let browser = "Unknown";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";

  let os = "Unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  let device: "mobile" | "tablet" | "desktop" = "desktop";
  if (ua.includes("Mobile") || ua.includes("Android")) device = "mobile";
  if (ua.includes("iPad") || ua.includes("Tablet")) device = "tablet";

  return { browser, os, device };
}

function DeviceIcon(
  props: { device: "mobile" | "tablet" | "desktop"; class?: string },
): JSX.Element {
  return (
    <Switch>
      <Match when={props.device === "mobile"}>
        <Smartphone class={props.class} />
      </Match>
      <Match when={props.device === "tablet"}>
        <Tablet class={props.class} />
      </Match>
      <Match when={props.device === "desktop"}>
        <Monitor class={props.class} />
      </Match>
    </Switch>
  );
}

function formatDate(
  date: Date | string | null | undefined,
): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fi-FI", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SessionsRoute(): JSX.Element {
  const [revokeAllOpen, setRevokeAllOpen] = createSignal(false);
  const sessions = createAsync(() => listSessionsQuery(), {
    deferStream: true,
  });
  const session = useSession();

  const revokeSubmission = useSubmission(revokeSession);
  const revokeAllSubmission = useSubmission(revokeOtherSessions);

  const hasOtherSessions = () =>
    (sessions() ?? []).some((s) => s.token !== session.session.token);

  useSubmissionSuccess(revokeSubmission, {
    successMessage: "Session revoked successfully",
    revalidateKey: listSessionsQuery.key,
  });
  useSubmissionError(revokeSubmission, "Failed to revoke session");

  useSubmissionSuccess(revokeAllSubmission, {
    successMessage: "All other sessions have been revoked",
    revalidateKey: listSessionsQuery.key,
    onSuccess: () => setRevokeAllOpen(false),
  });
  useSubmissionError(revokeAllSubmission, "Failed to revoke sessions");

  return (
    <div class="flex flex-1 flex-col gap-4">
      <PageHeader title="Sessions" description="Manage your active sessions." />

      <DataBoundary
        fallback={
          <div class="flex flex-1 items-center justify-center">
            <Spinner class="size-10" />
          </div>
        }
      >
        <div class="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="text text-text">
                  Device
                </TableHead>
                <TableHead class="hidden text-text sm:table-cell">
                  IP Address
                </TableHead>
                <TableHead class="hidden text-text md:table-cell">
                  Signed in
                </TableHead>
                <TableHead class="text-text">
                  Expires
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <Show when={sessions()}>
                {(sessions) => (
                  <Show
                    when={sessions().length > 0}
                    fallback={
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          class="py-8 text-center text-muted-foreground"
                        >
                          No active sessions found
                        </TableCell>
                      </TableRow>
                    }
                  >
                    <For each={sessions()}>
                      {(s) => {
                        const parsed = parseUserAgent(s.userAgent);
                        const isCurrent = () =>
                          s.token === session.session.token;

                        return (
                          <TableRow>
                            <TableCell>
                              <div class="flex items-center gap-3">
                                <DeviceIcon
                                  device={parsed.device}
                                  class="size-5 shrink-0 text-muted-foreground"
                                />
                                <div class="flex flex-col gap-0.5">
                                  <div class="flex items-center gap-2">
                                    <span class="font-medium">
                                      {parsed.browser}
                                    </span>
                                    <Show when={isCurrent()}>
                                      <Badge class="px-1.5 py-0 text-[10px]">
                                        Current
                                      </Badge>
                                    </Show>
                                  </div>
                                  <span class="text-muted-foreground text-xs">
                                    {parsed.os}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell class="hidden text-muted-foreground sm:table-cell">
                              {s.ipAddress ?? "—"}
                            </TableCell>
                            <TableCell class="hidden text-muted-foreground md:table-cell">
                              {formatDate(s.createdAt)}
                            </TableCell>
                            <TableCell class="text-muted-foreground">
                              {formatDate(s.expiresAt)}
                            </TableCell>
                            <TableCell class="text-right">
                              <Show when={!isCurrent()}>
                                <ConfirmDialog
                                  trigger={
                                    <>
                                      <LogOut class="size-4" />
                                      <span class="hidden sm:inline">
                                        Revoke
                                      </span>
                                    </>
                                  }
                                  triggerVariant="outline"
                                  triggerSize="default"
                                  variant="destructive"
                                  title="Revoke session?"
                                  description="This will sign out the device associated with this session. This action cannot be undone."
                                  confirmText="Revoke"
                                  isPending={revokeSubmission.pending}
                                  action={revokeSession}
                                  hiddenFields={{ token: s.token }}
                                />
                              </Show>
                            </TableCell>
                          </TableRow>
                        );
                      }}
                    </For>
                  </Show>
                )}
              </Show>
            </TableBody>
          </Table>
        </div>

        <Show when={hasOtherSessions()}>
          <ConfirmDialog
            open={revokeAllOpen()}
            onOpenChange={setRevokeAllOpen}
            trigger={
              <>
                <Show when={revokeAllSubmission.pending}>
                  <Spinner class="size-4" />
                </Show>
                Revoke all other sessions
              </>
            }
            triggerVariant="secondary"
            triggerClass="w-fit"
            triggerDisabled={revokeAllSubmission.pending}
            variant="destructive"
            title="Revoke all other sessions?"
            description="This will sign out all devices except the current one. This action cannot be undone."
            confirmText="Revoke all"
            isPending={revokeAllSubmission.pending}
            action={revokeOtherSessions}
          />
        </Show>
      </DataBoundary>
    </div>
  );
}

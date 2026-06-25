import { createAsync, revalidate, useSubmission } from "@solidjs/router";
import { deletePasskey } from "~/client/actions/auth.ts";
import { ConfirmDialog } from "~/client/components/confirm-dialog.tsx";
import { ErrorBoundaryMessage } from "~/client/components/error-boundary-message.tsx";
import { Button } from "~/client/components/ui/button.tsx";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "~/client/components/ui/item.tsx";
import { Skeleton } from "~/client/components/ui/skeleton.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { authClient } from "~/client/lib/auth-client.ts";
import { listPasskeysQuery } from "~/client/queries/auth.ts";
import Fingerprint from "~icons/lucide/fingerprint-pattern";
import Trash from "~icons/lucide/trash";
import {
  createEffect,
  createSignal,
  ErrorBoundary,
  For,
  type JSX,
  Show,
  Suspense,
} from "solid-js";
import { toast } from "solid-sonner";

export function PasskeySection(): JSX.Element {
  const passkeys = createAsync(() => listPasskeysQuery(), {
    deferStream: true,
  });
  const [adding, setAdding] = createSignal(false);
  const deleteSubmission = useSubmission(deletePasskey);

  const handleAdd = async () => {
    setAdding(true);
    await authClient.passkey.addPasskey({
      fetchOptions: {
        onSuccess: () => {
          revalidate(listPasskeysQuery.key);
          toast.success("Passkey added");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Failed to add passkey");
        },
      },
    });
    setAdding(false);
  };

  createEffect(() => {
    if (deleteSubmission.result && "ok" in deleteSubmission.result) {
      revalidate(listPasskeysQuery.key);
      toast.success("Passkey deleted");
      deleteSubmission.clear();
    }
  });

  createEffect(() => {
    if (deleteSubmission.error) {
      toast.error(
        deleteSubmission.error.message || "Failed to delete passkey",
      );
      deleteSubmission.clear();
    }
  });

  return (
    <ItemGroup class="rounded-lg border bg-card">
      <Item>
        <ItemContent>
          <ItemTitle>Passkeys</ItemTitle>
          <ItemDescription>
            Use biometrics, security keys, or your device to sign in without a
            password
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={adding()}
          >
            <Show when={adding()} fallback="Add passkey">
              <Spinner class="size-4" />
            </Show>
          </Button>
        </ItemActions>
      </Item>

      <ErrorBoundary
        fallback={(error) => <ErrorBoundaryMessage error={error} />}
      >
        <Suspense
          fallback={
            <>
              <ItemSeparator />
              <Item size="sm">
                <Skeleton height={16} width={16} radius={4} />
                <ItemContent>
                  <Skeleton height={16} width={128} radius={4} />
                  <Skeleton height={12} width={96} radius={4} />
                </ItemContent>
              </Item>
            </>
          }
        >
          <Show when={passkeys()}>
            {(passkeys) => (
              (
                <Show
                  when={passkeys().length > 0}
                  fallback={
                    <>
                      <ItemSeparator />
                      <Item size="sm">
                        <ItemContent>
                          <p class="text-muted-foreground text-sm">
                            No passkeys registered
                          </p>
                        </ItemContent>
                      </Item>
                    </>
                  }
                >
                  <For each={passkeys()}>
                    {(pk, index) => (
                      <>
                        <ItemSeparator />
                        <Item size="sm">
                          <Fingerprint class="size-4 shrink-0 text-muted-foreground" />
                          <ItemContent>
                            <ItemTitle>
                              {pk.name ||
                                `Passkey ${index() + 1}`}
                            </ItemTitle>
                            <ItemDescription>
                              Created on{" "}
                              {new Date(pk.createdAt).toLocaleDateString(
                                "fi-FI",
                              )}
                            </ItemDescription>
                          </ItemContent>
                          <ItemActions>
                            <ConfirmDialog
                              trigger={
                                <Trash class="size-4 text-destructive" />
                              }
                              triggerVariant="ghost"
                              triggerSize="sm"
                              triggerAriaLabel="Delete passkey"
                              variant="destructive"
                              isPending={deleteSubmission.pending}
                              action={deletePasskey}
                              hiddenFields={{ id: pk.id }}
                            />
                          </ItemActions>
                        </Item>
                      </>
                    )}
                  </For>
                </Show>
              )
            )}
          </Show>
        </Suspense>
      </ErrorBoundary>
    </ItemGroup>
  );
}

import { createAsync, revalidate } from "@solidjs/router";
import { Badge } from "~/client/components/ui/badge.tsx";

import { Button } from "~/client/components/ui/button.tsx";
import { Dialog } from "~/client/components/ui/dialog.tsx";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemSeparator,
  ItemTitle,
} from "~/client/components/ui/item.tsx";
import { Skeleton } from "~/client/components/ui/skeleton.tsx";
import { useSession } from "~/client/contexts/session-context.tsx";
import { authClient } from "~/client/lib/auth-client.ts";
import {
  getSessionQuery,
  viewNumberOfBackupCodesQuery,
} from "~/client/queries/auth.ts";
import {
  createSignal,
  ErrorBoundary,
  type JSX,
  Match,
  Show,
  Suspense,
  Switch,
} from "solid-js";
import { toast } from "solid-sonner";
import { BackupCodesStep } from "./backup-codes-step.tsx";
import { DisableTwoFactorDialog } from "./disable-two-factor-dialog.tsx";
import { PasswordForm } from "./password-form.tsx";
import { RegenerateBackupCodesDialog } from "./regenerate-backup-codes-dialog.tsx";
import { VerifyTotpStep } from "./verify-totp-step.tsx";

const ENABLE_DIALOG_ID = "enable-two-factor-dialog";

type EnableStep = "password" | "verify" | "backup-codes";

export function TwoFactorSection(): JSX.Element {
  const session = useSession();
  const numberOfBackupCodes = createAsync(async () => {
    if (session.user.twoFactorEnabled) {
      return await viewNumberOfBackupCodesQuery(Number(session.user.id));
    }
    return undefined;
  });

  let enableDialogRef!: HTMLDialogElement;
  const [enableStep, setEnableStep] = createSignal<EnableStep>("password");
  const [totpUri, setTotpUri] = createSignal("");
  const [backupCodes, setBackupCodes] = createSignal<string[]>([]);

  async function handlePasswordSubmit(password: string): Promise<void> {
    const { data } = await authClient.twoFactor.enable({
      password,
      fetchOptions: {
        onError: (ctx) => {
          toast.error(
            ctx.error.message || "Failed to enable two-factor authentication",
          );
        },
      },
    });

    if (data) {
      setTotpUri(data.totpURI);
      setBackupCodes(data.backupCodes);
      setEnableStep("verify");
    }
  }

  async function handleVerifyTotpSubmit(code: string): Promise<void> {
    await authClient.twoFactor.verifyTotp({
      code,
      fetchOptions: {
        onError: (ctx) => {
          toast.error(
            ctx.error.message || "Failed to verify two-factor authentication",
          );
        },
        onSuccess: () => {
          revalidate(getSessionQuery.key);
          setEnableStep("backup-codes");
        },
      },
    });
  }

  function resetEnableState(): void {
    setEnableStep("password");
    setTotpUri("");
    setBackupCodes([]);
  }

  function handleEnableClose(): void {
    if (enableStep() === "backup-codes") {
      toast.success("Two-factor authentication enabled");
    }
  }

  return (
    <>
      <Item>
        <ItemContent>
          <ItemTitle>
            Two-factor authentication
            <Show
              when={session.user.twoFactorEnabled}
              fallback={
                <Badge variant="error" round>
                  Disabled
                </Badge>
              }
            >
              <Badge variant="success" round>
                Enabled
              </Badge>
            </Show>
          </ItemTitle>
          <ItemDescription>
            Add an extra layer of security with an authenticator app
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Show
            when={session.user.twoFactorEnabled}
            fallback={
              <Button
                variant="outline"
                size="sm"
                command="show-modal"
                commandfor={ENABLE_DIALOG_ID}
                onClick={resetEnableState}
              >
                Enable
              </Button>
            }
          >
            <DisableTwoFactorDialog />
          </Show>
        </ItemActions>
      </Item>

      <Show when={session.user.twoFactorEnabled}>
        <ItemSeparator />
        <Item size="sm">
          <ItemContent>
            <ItemTitle>Backup codes</ItemTitle>
            <ItemDescription>
              <ErrorBoundary
                fallback={null}
              >
                <Suspense fallback={<Skeleton class="h-4 w-16" />}>
                  <Show when={numberOfBackupCodes()}>
                    {numberOfBackupCodes()}{" "}
                    backup codes remaining. Regenerate if you've lost or used
                    your existing codes.
                  </Show>
                </Suspense>
              </ErrorBoundary>
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <RegenerateBackupCodesDialog />
          </ItemActions>
        </Item>
      </Show>

      <Dialog
        id={ENABLE_DIALOG_ID}
        ref={(el) => enableDialogRef = el}
        onClose={handleEnableClose}
        title={enableStep() === "backup-codes"
          ? "Save backup codes"
          : "Enable two-factor authentication"}
        description={enableStep() === "password"
          ? "Enter your password to enable two-factor authentication"
          : enableStep() === "verify"
          ? "Scan the QR code with your authenticator app, then enter the verification code"
          : "Store these codes in a safe place. You can use them to access your account if you lose your authenticator device."}
      >
        <Switch>
          <Match when={enableStep() === "password"}>
            <PasswordForm
              submitLabel="Continue"
              onSubmit={handlePasswordSubmit}
            />
          </Match>
          <Match when={enableStep() === "verify"}>
            <VerifyTotpStep
              totpUri={totpUri()}
              onSubmit={handleVerifyTotpSubmit}
            />
          </Match>
          <Match when={enableStep() === "backup-codes"}>
            <BackupCodesStep
              backupCodes={backupCodes()}
              onDone={() => enableDialogRef.close()}
            />
          </Match>
        </Switch>
      </Dialog>
    </>
  );
}

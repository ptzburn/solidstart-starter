import { createAsync, revalidate, useSubmission } from "@solidjs/router";
import {
  confirmTwoFactorTotp,
  enableTwoFactor,
} from "~/client/actions/auth.ts";
import { Badge } from "~/client/components/ui/badge.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { ResponsiveDialog } from "~/client/components/ui/dialog.tsx";
import { OTPField } from "~/client/components/ui/form2/otp-field.tsx";
import { TextField } from "~/client/components/ui/form2/text-field.tsx";
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
import {
  getSessionQuery,
  viewNumberOfBackupCodesQuery,
} from "~/client/queries/auth.ts";
import {
  createEffect,
  createMemo,
  ErrorBoundary,
  type JSX,
  Match,
  Show,
  Suspense,
  Switch,
} from "solid-js";
import { QRCodeSVG } from "solid-qr-code";
import { toast } from "solid-sonner";
import { BackupCodesStep } from "./backup-codes-step.tsx";
import { DisableTwoFactorDialog } from "./disable-two-factor-dialog.tsx";
import { RegenerateBackupCodesDialog } from "./regenerate-backup-codes-dialog.tsx";

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
  let passwordFormRef: HTMLFormElement | undefined;
  let verifyFormRef: HTMLFormElement | undefined;

  const enableSubmission = useSubmission(enableTwoFactor);
  const verifySubmission = useSubmission(confirmTwoFactorTotp);

  const enableData = createMemo(() =>
    enableSubmission.result && "ok" in enableSubmission.result
      ? enableSubmission.result
      : undefined
  );

  const passwordFieldErrors = (): Record<string, string | undefined> =>
    enableSubmission.result && "fieldErrors" in enableSubmission.result
      ? enableSubmission.result.fieldErrors ?? {}
      : {};

  const codeFieldErrors = (): Record<string, string | undefined> =>
    verifySubmission.result && "fieldErrors" in verifySubmission.result
      ? verifySubmission.result.fieldErrors ?? {}
      : {};

  const verified = (): boolean =>
    !!(verifySubmission.result && "ok" in verifySubmission.result);

  const enableStep = (): EnableStep => {
    if (verified()) return "backup-codes";
    if (enableData()) return "verify";
    return "password";
  };

  createEffect(() => {
    if (enableSubmission.error) {
      toast.error(
        enableSubmission.error.message ||
          "Failed to enable two-factor authentication",
      );
      enableSubmission.clear();
    }
  });

  createEffect(() => {
    if (verifySubmission.error) {
      toast.error(
        verifySubmission.error.message ||
          "Failed to verify two-factor authentication",
      );
      verifySubmission.clear();
    }
  });

  createEffect(() => {
    if (verified()) {
      revalidate(getSessionQuery.key);
    }
  });

  function resetEnableState(): void {
    passwordFormRef?.reset();
    verifyFormRef?.reset();
    enableSubmission.clear();
    verifySubmission.clear();
  }

  function handleEnableClose(): void {
    if (verified()) {
      toast.success("Two-factor authentication enabled");
    }
    resetEnableState();
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

      <ResponsiveDialog
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
            <form
              ref={(el) => passwordFormRef = el}
              method="post"
              action={enableTwoFactor}
              class="space-y-4"
              onInput={() => {
                if (enableSubmission.result) enableSubmission.clear();
              }}
            >
              <TextField
                name="password"
                label="Password"
                type="password"
                placeholder="Current password"
                required
                hint="Enter your current password"
                error={passwordFieldErrors().password}
                disabled={enableSubmission.pending}
              />
              <Button
                type="submit"
                class="w-full"
                disabled={enableSubmission.pending}
              >
                Continue
              </Button>
            </form>
          </Match>
          <Match when={enableStep() === "verify"}>
            <form
              ref={(el) => verifyFormRef = el}
              method="post"
              action={confirmTwoFactorTotp}
              class="space-y-6"
              onInput={() => {
                if (verifySubmission.result) verifySubmission.clear();
              }}
            >
              <Show when={enableData()?.totpURI}>
                {(uri) => (
                  <div class="flex justify-center">
                    <div class="rounded-lg bg-white p-3">
                      <QRCodeSVG
                        value={uri()}
                        width={200}
                        height={200}
                        level="medium"
                        backgroundColor="#ffffff"
                        backgroundAlpha={1}
                        foregroundColor="#000000"
                        foregroundAlpha={1}
                      />
                    </div>
                  </div>
                )}
              </Show>
              <OTPField
                name="code"
                label="Verification code"
                error={codeFieldErrors().code}
                disabled={verifySubmission.pending}
              />
              <Button
                type="submit"
                class="w-full"
                disabled={verifySubmission.pending}
              >
                Verify
              </Button>
            </form>
          </Match>
          <Match when={enableStep() === "backup-codes"}>
            <BackupCodesStep
              backupCodes={enableData()?.backupCodes ?? []}
              onDone={() => enableDialogRef.close()}
            />
          </Match>
        </Switch>
      </ResponsiveDialog>
    </>
  );
}

import { createAsync, useSubmission } from "@solidjs/router";
import {
  confirmTwoFactorTotp,
  enableTwoFactor,
} from "~/client/actions/auth.ts";
import { ResponsiveDialog } from "~/client/components/responsive-dialog.tsx";
import { Badge } from "~/client/components/ui/badge.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { OTPField } from "~/client/components/ui/form/otp-field.tsx";
import { TextField } from "~/client/components/ui/form/text-field.tsx";
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
  useFormFieldErrors,
  useSubmissionError,
  useSubmissionSuccess,
} from "~/client/hooks/use-submission.ts";
import {
  getSessionQuery,
  viewNumberOfBackupCodesQuery,
} from "~/client/queries/auth.ts";
import {
  createMemo,
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
import { RegenerateBackupCodesDialog } from "./regenerate-backup-codes-dialog.tsx";

type EnableStep = "password" | "verify" | "backup-codes";

const PASSWORD_FORM_ID = "enable-2fa-password-form";
const VERIFY_FORM_ID = "enable-2fa-verify-form";

export function TwoFactorSection(): JSX.Element {
  const session = useSession();
  const numberOfBackupCodes = createAsync(
    async () => {
      if (session.user.twoFactorEnabled) {
        return await viewNumberOfBackupCodesQuery(Number(session.user.id));
      }
      return undefined;
    },
    { deferStream: true },
  );

  const [open, setOpen] = createSignal(false);
  let passwordFormRef: HTMLFormElement | undefined;
  let verifyFormRef: HTMLFormElement | undefined;

  const enableSubmission = useSubmission(enableTwoFactor);
  const verifySubmission = useSubmission(confirmTwoFactorTotp);

  const enableData = createMemo(() =>
    enableSubmission.result && "ok" in enableSubmission.result
      ? enableSubmission.result
      : undefined
  );

  const passwordFieldErrors = useFormFieldErrors(enableSubmission);
  const codeFieldErrors = useFormFieldErrors(verifySubmission);

  const verified = (): boolean =>
    !!(verifySubmission.result && "ok" in verifySubmission.result);

  const enableStep = (): EnableStep => {
    if (verified()) return "backup-codes";
    if (enableData()) return "verify";
    return "password";
  };

  useSubmissionError(
    enableSubmission,
    "Failed to enable two-factor authentication",
  );
  useSubmissionError(
    verifySubmission,
    "Failed to verify two-factor authentication",
  );
  useSubmissionSuccess(verifySubmission, {
    revalidateKey: getSessionQuery.key,
    clearOnSuccess: false,
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
                <Badge variant="destructive">
                  Disabled
                </Badge>
              }
            >
              <Badge>
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
              <ResponsiveDialog
                open={open()}
                onOpenChange={(o) => {
                  setOpen(o);
                  if (o) resetEnableState();
                  else handleEnableClose();
                }}
                trigger="Enable"
                triggerVariant="outline"
                triggerSize="default"
                title={enableStep() === "backup-codes"
                  ? "Save backup codes"
                  : "Enable two-factor authentication"}
                description={enableStep() === "password"
                  ? "Enter your password to enable two-factor authentication"
                  : enableStep() === "verify"
                  ? "Scan the QR code with your authenticator app, then enter the verification code"
                  : "Store these codes in a safe place. You can use them to access your account if you lose your authenticator device."}
                footer={
                  <Switch>
                    <Match when={enableStep() === "password"}>
                      <Button
                        type="submit"
                        form={PASSWORD_FORM_ID}
                        disabled={enableSubmission.pending}
                      >
                        Continue
                      </Button>
                    </Match>
                    <Match when={enableStep() === "verify"}>
                      <Button
                        type="submit"
                        form={VERIFY_FORM_ID}
                        disabled={verifySubmission.pending}
                      >
                        Verify
                      </Button>
                    </Match>
                    <Match when={enableStep() === "backup-codes"}>
                      <Button onClick={() => setOpen(false)}>Done</Button>
                    </Match>
                  </Switch>
                }
              >
                <Switch>
                  <Match when={enableStep() === "password"}>
                    <form
                      id={PASSWORD_FORM_ID}
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
                    </form>
                  </Match>
                  <Match when={enableStep() === "verify"}>
                    <form
                      id={VERIFY_FORM_ID}
                      ref={(el) => verifyFormRef = el}
                      method="post"
                      action={confirmTwoFactorTotp}
                      class="space-y-6"
                      onInput={() => {
                        if (verifySubmission.result) verifySubmission.clear();
                      }}
                    >
                      <Show when={enableData()?.qrSvg}>
                        {(qrSvg) => (
                          <div class="flex justify-center">
                            <div class="rounded-lg bg-white p-3">
                              <div
                                class="size-[200px] [&>svg]:block [&>svg]:size-full"
                                innerHTML={qrSvg()}
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
                    </form>
                  </Match>
                  <Match when={enableStep() === "backup-codes"}>
                    <BackupCodesStep
                      backupCodes={enableData()?.backupCodes ?? []}
                    />
                  </Match>
                </Switch>
              </ResponsiveDialog>
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
    </>
  );
}

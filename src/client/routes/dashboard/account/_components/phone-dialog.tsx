import { revalidate } from "@solidjs/router";
import { ResponsiveEditDialog } from "~/client/components/responsive-edit-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { useSession } from "~/client/contexts/session-context.tsx";
import { useAppForm } from "~/client/hooks/use-app-form.ts";
import { authClient } from "~/client/lib/auth-client.ts";
import { getSessionQuery } from "~/client/queries/auth.ts";
import { createSignal, type JSX, Match, onCleanup, Switch } from "solid-js";
import { toast } from "solid-sonner";
import z from "zod";

type PhoneDialogProps = {
  currentPhoneNumber: string | null | undefined;
};

export function PhoneDialog(props: PhoneDialogProps): JSX.Element {
  const session = useSession();
  const RESEND_COOLDOWN = 60;

  const [open, setOpen] = createSignal(false);
  const [step, setStep] = createSignal<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = createSignal("");
  const [isResending, setIsResending] = createSignal(false);
  const [cooldown, setCooldown] = createSignal(0);
  let timer: ReturnType<typeof setInterval> | undefined;

  function startCooldown(): void {
    setCooldown(RESEND_COOLDOWN);
    clearInterval(timer);
    timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  onCleanup(() => clearInterval(timer));

  const handleClose = (next: boolean) => {
    if (!next) {
      setStep("phone");
      clearInterval(timer);
      setCooldown(0);
    }
    setOpen(next);
  };

  const phoneForm = useAppForm(() => ({
    defaultValues: {
      phoneNumber: props.currentPhoneNumber ?? "",
    },
    onSubmit: async ({ value }) => {
      if (value.phoneNumber === session.user.phoneNumber) {
        toast.info("The phone number is the same as the current one");
        return;
      }

      await authClient.phoneNumber.sendOtp(
        { phoneNumber: value.phoneNumber },
        {
          onSuccess: () => {
            setPhoneNumber(value.phoneNumber);
            setStep("otp");
            startCooldown();
            toast.success("Code sent to the phone number");
          },
          onError: (error) => {
            toast.error(
              error.error.message || "Failed to send code to the phone number",
            );
          },
        },
      );
    },
  }));

  const otpForm = useAppForm(() => ({
    defaultValues: {
      otp: "",
    },
    validators: {
      onSubmit: z.object({
        otp: z.string().length(6),
      }),
    },
    onSubmit: async ({ value }) => {
      await authClient.phoneNumber.verify(
        {
          phoneNumber: phoneNumber(),
          code: value.otp,
          updatePhoneNumber: true,
          disableSession: true,
        },
        {
          onSuccess: () => {
            handleClose(false);
            revalidate(getSessionQuery.key);
            toast.success("Phone number updated");
          },
          onError: (error) => {
            toast.error(
              error.error.message || "Failed to update phone number",
            );
          },
        },
      );
    },
  }));

  const resendOtp = async () => {
    setIsResending(true);
    await authClient.phoneNumber.sendOtp(
      { phoneNumber: phoneNumber() },
      {
        onSuccess: () => {
          toast.success("Code sent to the phone number");
        },
        onError: (ctx) => {
          toast.error(
            ctx.error.message || "Failed to send code to the phone number",
          );
        },
      },
    );
    setIsResending(false);
    startCooldown();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        {props.currentPhoneNumber ? "Edit phone number" : "Add phone number"}
      </Button>

      <ResponsiveEditDialog
        isOpen={open}
        setIsOpen={handleClose}
        title="Edit phone number"
      >
        {() => (
          <Switch>
            <Match when={step() === "phone"}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  phoneForm.handleSubmit();
                }}
                class="space-y-4"
              >
                <phoneForm.AppField
                  name="phoneNumber"
                  validators={{
                    onChange: ({ value }) => {
                      if (value.trim() === session.user.phoneNumber) {
                        return {
                          message:
                            "The phone number is the same as the current one",
                        };
                      }
                      if (!/^\+358\d{9}$/.test(value.trim())) {
                        return {
                          message: "The phone number is invalid",
                        };
                      }
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <field.TextField
                      label="Phone number"
                      placeholder="+358401234567"
                    />
                  )}
                </phoneForm.AppField>
                <phoneForm.AppForm>
                  <phoneForm.SubmitButton>
                    Send code
                  </phoneForm.SubmitButton>
                </phoneForm.AppForm>
              </form>
            </Match>

            <Match when={step() === "otp"}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  otpForm.handleSubmit();
                }}
                class="space-y-4"
              >
                <otpForm.AppField name="otp">
                  {(field) => <field.OTPField label="Verification code" />}
                </otpForm.AppField>
                <Button
                  type="button"
                  variant="ghost"
                  class="w-full"
                  onClick={resendOtp}
                  disabled={isResending() || cooldown() > 0}
                >
                  {cooldown() > 0
                    ? `Resend code (${cooldown()}s)`
                    : "Resend code"}
                </Button>
                <otpForm.AppForm>
                  <otpForm.SubmitButton>
                    Verify
                  </otpForm.SubmitButton>
                </otpForm.AppForm>
              </form>
            </Match>
          </Switch>
        )}
      </ResponsiveEditDialog>
    </>
  );
}

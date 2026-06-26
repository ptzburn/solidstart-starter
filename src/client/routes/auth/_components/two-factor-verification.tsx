import { A, useSubmission } from "@solidjs/router";
import {
  verifyTwoFactorBackup,
  verifyTwoFactorTotp,
} from "~/client/actions/auth.ts";
import { Button } from "~/client/components/ui/button.tsx";
import { Checkbox } from "~/client/components/ui/checkbox.tsx";
import { TextField } from "~/client/components/ui/form/text-field.tsx";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPInput,
  InputOTPSeparator,
  InputOTPSlot,
} from "~/client/components/ui/input-otp.tsx";
import { Label } from "~/client/components/ui/label.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/client/components/ui/tooltip.tsx";
import { Typography } from "~/client/components/ui/typography.tsx";
import CircleQuestionMark from "~icons/lucide/circle-question-mark";
import {
  type Accessor,
  createEffect,
  createSignal,
  type JSX,
  Match,
  Switch,
} from "solid-js";
import { toast } from "solid-sonner";

type TwoFactorMethod = "totp" | "backup";

function TrustDeviceCheckbox(props: {
  checked: Accessor<boolean>;
  onChange: (checked: boolean) => void;
}): JSX.Element {
  return (
    <div class="flex flex-row items-center gap-2">
      <Checkbox
        name="trustDevice"
        checked={props.checked()}
        onChange={props.onChange}
      />
      <Label>Trust Device</Label>
      <Tooltip>
        <TooltipTrigger class="text-muted-foreground">
          <CircleQuestionMark class="size-4" />
        </TooltipTrigger>
        <TooltipContent>
          Trust this device to automatically sign in next time.
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function TotpForm(props: {
  trustDevice: Accessor<boolean>;
  onTrustDeviceChange: (checked: boolean) => void;
  onUseBackup: () => void;
}): JSX.Element {
  const [code, setCode] = createSignal("");
  const submission = useSubmission(verifyTwoFactorTotp);

  createEffect(() => {
    if (submission.error) {
      toast.error(submission.error.message || "Verification failed");
      submission.clear();
    }
  });

  return (
    <div class="space-y-8">
      <div class="flex flex-col items-center gap-2 text-center">
        <h1 class="font-bold text-2xl">Two-Factor Authentication</h1>
        <Typography variant="muted" class="text-balance">
          Enter the code from your authenticator app.
        </Typography>
      </div>
      <form
        method="post"
        action={verifyTwoFactorTotp}
        class="grid gap-6"
      >
        <div class="flex justify-center">
          <InputOTP
            maxLength={6}
            value={code()}
            onValueChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
            autofocus
          >
            <InputOTPGroup>
              {[0, 1, 2].map((i) => <InputOTPSlot index={i} />)}
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              {[3, 4, 5].map((i) => <InputOTPSlot index={i} />)}
            </InputOTPGroup>
            <InputOTPInput name="code" />
          </InputOTP>
        </div>
        <Button
          variant="link"
          class="h-auto p-0 text-sm"
          type="button"
          onClick={props.onUseBackup}
        >
          Use Backup Code
        </Button>
        <TrustDeviceCheckbox
          checked={props.trustDevice}
          onChange={props.onTrustDeviceChange}
        />
        <Button
          type="submit"
          class="w-full"
          disabled={submission.pending || code().length !== 6}
        >
          Verify
        </Button>
        <A href="/auth/sign-in" class="w-full">
          <Button variant="outline" class="w-full" type="button">
            Back
          </Button>
        </A>
      </form>
    </div>
  );
}

function BackupCodeForm(props: {
  trustDevice: Accessor<boolean>;
  onTrustDeviceChange: (checked: boolean) => void;
  onUseTotp: () => void;
}): JSX.Element {
  const submission = useSubmission(verifyTwoFactorBackup);
  const fieldErrors = () => submission.result?.fieldErrors ?? {};

  createEffect(() => {
    if (submission.error) {
      toast.error(submission.error.message || "Verification failed");
      submission.clear();
    }
  });

  return (
    <div class="space-y-8">
      <div class="flex flex-col items-center gap-2 text-center">
        <h1 class="font-bold text-2xl">Two-Factor Authentication</h1>
        <Typography variant="muted" class="text-balance">
          Enter one of the backup codes you saved when enabling 2FA.
        </Typography>
      </div>
      <form
        method="post"
        action={verifyTwoFactorBackup}
        class="grid gap-6"
        onInput={() => {
          if (submission.result) submission.clear();
        }}
      >
        <TextField
          name="code"
          label="Backup Code"
          required
          placeholder="Enter your backup code"
          hint="Enter your backup code"
          error={fieldErrors().code}
          disabled={submission.pending}
        />
        <Button
          variant="link"
          class="h-auto p-0 text-sm"
          type="button"
          onClick={props.onUseTotp}
        >
          Use TOTP
        </Button>
        <TrustDeviceCheckbox
          checked={props.trustDevice}
          onChange={props.onTrustDeviceChange}
        />
        <Button type="submit" class="w-full" disabled={submission.pending}>
          Verify
        </Button>
        <A href="/auth/sign-in" class="w-full">
          <Button variant="outline" class="w-full" type="button">
            Back
          </Button>
        </A>
      </form>
    </div>
  );
}

export function TwoFactorVerification(): JSX.Element {
  const [method, setMethod] = createSignal<TwoFactorMethod>("totp");
  const [trustDevice, setTrustDevice] = createSignal(false);

  return (
    <Switch>
      <Match when={method() === "totp"}>
        <TotpForm
          trustDevice={trustDevice}
          onTrustDeviceChange={setTrustDevice}
          onUseBackup={() => setMethod("backup")}
        />
      </Match>
      <Match when={method() === "backup"}>
        <BackupCodeForm
          trustDevice={trustDevice}
          onTrustDeviceChange={setTrustDevice}
          onUseTotp={() => setMethod("totp")}
        />
      </Match>
    </Switch>
  );
}

import { A, useSubmission } from "@solidjs/router";
import {
  verifyTwoFactorBackup,
  verifyTwoFactorTotp,
} from "~/client/actions/auth.ts";
import { Button } from "~/client/components/ui/button.tsx";
import { Checkbox } from "~/client/components/ui/checkbox.tsx";
import { SixDigitOtpInput } from "~/client/components/ui/form/six-digit-otp-input.tsx";
import { TextField } from "~/client/components/ui/form/text-field.tsx";
import { Label } from "~/client/components/ui/label.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/client/components/ui/tooltip.tsx";
import {
  useFormFieldErrors,
  useSubmissionError,
} from "~/client/hooks/use-submission.ts";
import CircleQuestionMark from "~icons/ri/question-line";
import { type Accessor, createSignal, type JSX, Match, Switch } from "solid-js";
import { AuthHeader } from "./auth-header.tsx";

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

  useSubmissionError(submission, "Verification failed");

  return (
    <div class="space-y-8">
      <AuthHeader
        title="Two-Factor Authentication"
        subtitle="Enter the code from your authenticator app."
      />
      <form
        method="post"
        action={verifyTwoFactorTotp}
        class="grid gap-6"
      >
        <SixDigitOtpInput
          name="code"
          value={code()}
          onValueChange={setCode}
          autofocus
        />
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
  const fieldErrors = useFormFieldErrors(submission);

  useSubmissionError(submission, "Verification failed");

  return (
    <div class="space-y-8">
      <AuthHeader
        title="Two-Factor Authentication"
        subtitle="Enter one of the backup codes you saved when enabling 2FA."
      />
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

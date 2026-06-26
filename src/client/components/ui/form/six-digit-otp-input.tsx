import {
  InputOTP,
  InputOTPGroup,
  InputOTPInput,
  InputOTPSeparator,
  InputOTPSlot,
} from "~/client/components/ui/input-otp.tsx";
import type { JSX } from "solid-js";

// The centered 6-digit OTP entry (two groups of three) used by the email-OTP and
// two-factor screens. Digits-only input is enforced here so the two flows can't
// diverge on sanitization.
export function SixDigitOtpInput(props: {
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  autofocus?: boolean;
}): JSX.Element {
  return (
    <div class="flex justify-center">
      <InputOTP
        maxLength={6}
        value={props.value}
        onValueChange={(v) =>
          props.onValueChange(v.replace(/\D/g, "").slice(0, 6))}
        autofocus={props.autofocus}
      >
        <InputOTPGroup>
          {[0, 1, 2].map((i) => <InputOTPSlot index={i} />)}
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          {[3, 4, 5].map((i) => <InputOTPSlot index={i} />)}
        </InputOTPGroup>
        <InputOTPInput name={props.name} />
      </InputOTP>
    </div>
  );
}

import { useSession } from "@solidjs/start/http";
import { pendingSessionConfig } from "~/client/lib/pending-session-factory.ts";

// Carries the phone-OTP resend throttle across requests. The phone number
// itself lives in the dialog's client state; only `lastSentAt` (epoch ms of the
// last OTP send) needs to be server-trusted to enforce the cooldown — see
// ~/client/lib/otp-cooldown.ts. Cleared once the number is verified.
type PendingPhoneData = { lastSentAt?: number };

export function usePendingPhoneSession(): ReturnType<
  typeof useSession<PendingPhoneData>
> {
  return useSession<PendingPhoneData>(pendingSessionConfig("pending-phone"));
}

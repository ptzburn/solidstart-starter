import { useSession } from "@solidjs/start/http";
import { pendingSessionConfig } from "~/client/lib/pending-session-factory.ts";

// `lastSentAt` (epoch ms of the last verification OTP send) throttles resends
// server-side — see ~/client/lib/otp-cooldown.ts.
type PendingSigninData = { email: string; lastSentAt?: number };

export function usePendingSigninSession(): ReturnType<
  typeof useSession<PendingSigninData>
> {
  return useSession<PendingSigninData>(pendingSessionConfig("pending-signin"));
}

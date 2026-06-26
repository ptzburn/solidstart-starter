import { useSession } from "@solidjs/start/http";
import { pendingSessionConfig } from "~/client/lib/pending-session-factory.ts";

export function usePendingSigninSession(): ReturnType<
  typeof useSession<{ email: string }>
> {
  return useSession<{ email: string }>(pendingSessionConfig("pending-signin"));
}

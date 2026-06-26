import { useSession } from "@solidjs/start/http";
import { pendingSessionConfig } from "~/client/lib/pending-session-factory.ts";

export function usePendingResetPasswordSession(): ReturnType<
  typeof useSession<{ completed: boolean }>
> {
  return useSession<{ completed: boolean }>(
    pendingSessionConfig("pending-reset-password"),
  );
}

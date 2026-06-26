// Server-side throttle for OTP resends. The cooldown used to live in the client
// (a `setInterval` countdown that only disabled the button), so a determined
// caller could resend at will. The source of truth is now the `lastSentAt`
// epoch-ms stored in each flow's encrypted pending cookie: the resend actions
// call `assertResendCooldown` before sending and throw when it is too soon, and
// that error surfaces to the user as a toast. There is no client countdown.

export const RESEND_COOLDOWN_MS = 60 * 1000;

// Throw when a resend is requested before the cooldown since `lastSentAt` has
// elapsed. `undefined` means nothing was sent yet, so a send is always allowed.
export function assertResendCooldown(lastSentAt: number | undefined): void {
  if (lastSentAt === undefined) return;
  const remaining = RESEND_COOLDOWN_MS - (Date.now() - lastSentAt);
  if (remaining > 0) {
    const seconds = Math.ceil(remaining / 1000);
    throw new Error(`Please wait ${seconds}s before requesting a new code`);
  }
}

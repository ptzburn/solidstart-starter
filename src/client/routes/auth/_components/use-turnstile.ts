import type { TurnstileRef } from "@nerimity/solid-turnstile";
import { type Accessor, createSignal } from "solid-js";

// Cloudflare Turnstile token state plus the reset used after a failed submission.
// Shared by the captcha-gated auth forms so the security-critical reset logic
// lives in one place and can't drift between sign-in and sign-up.
export function useTurnstile(): {
  token: Accessor<string | undefined>;
  setToken: (token: string | undefined) => void;
  setRef: (ref: TurnstileRef) => void;
  reset: () => void;
} {
  const [token, setToken] = createSignal<string>();
  let ref: TurnstileRef | undefined;

  return {
    token,
    setToken,
    setRef: (r) => (ref = r),
    reset: () => {
      setToken(undefined);
      ref?.reset();
    },
  };
}

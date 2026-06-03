import { passkeyClient } from "@better-auth/passkey/client";
import type { auth } from "~/shared/auth.ts";
import {
  adminClient,
  emailOTPClient,
  inferAdditionalFields,
  lastLoginMethodClient,
  phoneNumberClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/solid";

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    phoneNumberClient(),
    emailOTPClient(),
    passkeyClient(),
    twoFactorClient(),
    lastLoginMethodClient({
      cookieName: "solid-starter-template.last_login_method",
    }),
    inferAdditionalFields<typeof auth>(),
  ],
});

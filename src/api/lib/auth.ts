import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { passkey } from "@better-auth/passkey";
import db from "~/api/db/index.ts";
import * as schema from "~/api/db/schema/index.ts";
import { sendSms } from "~/api/lib/seven-io.ts";

import {
  sendDeleteAccountVerificationEmail,
  sendEmailChangeConfirmation,
  sendEmailVerification,
  sendResetPassword,
  sendSignUpAttemptWarning,
} from "~/api/services/emails.ts";

import env from "~/env.ts";
import { betterAuth } from "better-auth/minimal";
import {
  admin,
  captcha,
  emailOTP,
  haveIBeenPwned,
  lastLoginMethod,
  openAPI,
  phoneNumber,
  twoFactor,
} from "better-auth/plugins";

export const COOKIE_PREFIX = "solid-starter-template";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    usePlural: true,
    // drizzle-orm >= 1.0.0-rc.4 no longer exposes the schema on the db
    // instance (`db._.fullSchema` was removed with relations v2), so the
    // adapter can't discover it and it must be passed explicitly.
    schema,
  }),
  appName: "Solid Starter Template",
  user: {
    changeEmail: {
      enabled: true,
      // deno-lint-ignore require-await
      sendChangeEmailConfirmation: async (
        { user, newEmail, url },
      ) => {
        void sendEmailChangeConfirmation({
          email: user.email,
          userName: user.name,
          newEmail,
          verificationUrl: url,
        });
      },
    },
    additionalFields: {
      role: {
        type: ["user", "admin"],
        required: true,
        defaultValue: "user",
        input: false,
      },
    },
    deleteUser: {
      enabled: true,
      // deno-lint-ignore require-await
      sendDeleteAccountVerification: async ({ user, url }) => {
        void sendDeleteAccountVerificationEmail({
          email: user.email,
          userName: user.name,
          url,
        });
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 3, // 3 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  trustedOrigins: Array.from(
    new Set([env.VITE_HOST_URL, env.BETTER_AUTH_URL]),
  ),
  rateLimit: {
    enabled: true,
    customRules: {
      "/phone-number/send-otp": { window: 60 * 5, max: 3 },
      "/phone-number/request-password-reset": { window: 60 * 5, max: 3 },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: env.NODE_ENV !== "test",
    revokeSessionsOnPasswordReset: true,
    // deno-lint-ignore require-await
    sendResetPassword: async ({ user, url }) => {
      void sendResetPassword({
        email: user.email,
        userName: user.name,
        url,
      });
    },
    // deno-lint-ignore require-await
    onExistingUserSignUp: async ({ user }) => {
      void sendSignUpAttemptWarning({
        email: user.email,
        userName: user.name,
      });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.requestType === "change-email-verification") {
        void sendEmailChangeConfirmation({
          email: user.email,
          userName: user.name,
          newEmail: user.email,
          verificationUrl: url,
        });
        return;
      }
      await auth.api.sendVerificationOTP({
        body: { email: user.email, type: "email-verification" },
      });
    },
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
    google: {
      prompt: "select_account",
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          const userCount = await ctx?.context.adapter.count({
            model: "users",
          });
          if (userCount === 0) {
            return { data: { ...user, role: "admin" } };
          }
        },
      },
    },
  },
  plugins: [
    openAPI({ disableDefaultReference: true }),
    admin(),
    emailOTP({
      expiresIn: 60 * 10,
      allowedAttempts: 3,
      storeOTP: "encrypted",
      // NOTE: do not enable `sendVerificationOnSignUp` here. Core sign-up
      // already sends one verification OTP (its `sendOnSignUp ??
      // requireEmailVerification` branch calls our `emailVerification.
      // sendVerificationEmail`, which is re-routed to sendVerificationOTP).
      // This plugin's own after-/sign-up hook would send a *second*, different
      // code — the cause of users receiving two OTPs at once. Sign-in uses the
      // same core path via `sendOnSignIn`, so verification stays single-source.
      // deno-lint-ignore require-await
      async sendVerificationOTP({ email, otp, type }): Promise<void> {
        if (env.NODE_ENV !== "test") {
          if (type === "email-verification") {
            void sendEmailVerification({ email, otp });
          }
        } else {
          // deno-lint-ignore no-console
          console.log(
            `Sending ${type} code to ${email} with code ${otp}`,
          );
        }
      },
    }),
    lastLoginMethod({
      cookieName: "solid-starter-template.last_login_method",
      storeInDatabase: true,
    }),
    captcha({
      provider: "cloudflare-turnstile",
      secretKey: env.TURNSTILE_SECRET_KEY,
    }),
    haveIBeenPwned(),
    twoFactor({
      issuer: "Solid Starter Template",
      skipVerificationOnEnable: false,
    }),
    passkey({
      rpName: "Solid Starter Template",
      rpID: new URL(env.VITE_HOST_URL).hostname,
      origin: env.VITE_HOST_URL,
      advanced: {
        webAuthnChallengeCookie: "solid-starter-template-passkey",
      },
    }),
    phoneNumber({
      allowedAttempts: 3,
      otpLength: 6,
      expiresIn: 60 * 5,
      phoneNumberValidator: (phoneNumber) => {
        return /^\+358\d{9}$/.test(phoneNumber);
      },
      sendOTP: ({ phoneNumber: phone, code }) => {
        const message = `Your verification code is: ${code}`;
        void sendSms(phone, message);
      },
    }),
  ],
  telemetry: {
    enabled: false,
  },
  advanced: {
    cookiePrefix: COOKIE_PREFIX,
    database: {
      generateId: "serial",
    },
  },
});

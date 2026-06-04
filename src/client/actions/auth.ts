import { action, redirect } from "@solidjs/router";
import { usePendingForgotPasswordSession } from "~/client/lib/pending-forgot-password-session.ts";
import { usePendingResetPasswordSession } from "~/client/lib/pending-reset-password-session.ts";
import { usePendingSigninSession } from "~/client/lib/pending-signin-session.ts";
import {
  type ForgotPasswordFieldErrors,
  ForgotPasswordSchema,
  type ResetPasswordFieldErrors,
  ResetPasswordSchema,
  type SignInFieldErrors,
  SignInSchema,
  SignInSocialSchema,
  type VerifyEmailOtpFieldErrors,
  VerifyEmailOtpSchema,
  VerifyTwoFactorBackupSchema,
  type VerifyTwoFactorFieldErrors,
  VerifyTwoFactorTotpSchema,
} from "~/client/schemas/auth.ts";
import { collectFieldErrors } from "~/client/utils/form-errors.ts";
import { redirectWithCookies } from "~/client/utils/redirect.ts";
import env from "~/env.ts";
import { auth } from "~/shared/auth.ts";
import { getServerHeaders } from "~/shared/server-headers.ts";
import { APIError } from "better-auth/api";

export const signIn = action(async (formData: FormData) => {
  "use server";
  const parsed = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: collectFieldErrors<keyof SignInFieldErrors>(
        parsed.error.issues,
      ),
    };
  }

  const captchaToken = (formData.get("cf-turnstile-response") as string) ?? "";
  const headers = new Headers(getServerHeaders());
  headers.set("x-captcha-response", captchaToken);

  try {
    const { response, headers: authHeaders } = await auth.api.signInEmail({
      body: parsed.data,
      headers,
      returnHeaders: true,
    });

    if ("twoFactorRedirect" in response && response.twoFactorRedirect) {
      throw redirectWithCookies(authHeaders, "/auth/sign-in/two-factor");
    }
    throw redirectWithCookies(authHeaders, "/dashboard");
  } catch (error) {
    if (
      error instanceof APIError && error.body?.code === "EMAIL_NOT_VERIFIED"
    ) {
      const session = await usePendingSigninSession();
      await session.update({ email: parsed.data.email });
      throw redirect("/auth/sign-in/verify-email");
    }
    throw error;
  }
}, "signIn");

export const signInSocial = action(async (formData: FormData) => {
  "use server";
  const parsed = SignInSocialSchema.safeParse({
    provider: formData.get("provider"),
  });
  if (!parsed.success) throw new Error("Invalid provider");

  const { response, headers: authHeaders } = await auth.api.signInSocial({
    body: {
      provider: parsed.data.provider,
      callbackURL: "/dashboard",
    },
    headers: getServerHeaders(),
    returnHeaders: true,
  });

  if (!response.url) throw new Error("Failed to start sign-in");

  throw redirectWithCookies(authHeaders, response.url);
}, "signInSocial");

export const requestPasswordReset = action(async (formData: FormData) => {
  "use server";
  const parsed = ForgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return {
      fieldErrors: collectFieldErrors<keyof ForgotPasswordFieldErrors>(
        parsed.error.issues,
      ),
    };
  }

  const captchaToken = (formData.get("cf-turnstile-response") as string) ?? "";
  const headers = new Headers(getServerHeaders());
  headers.set("x-captcha-response", captchaToken);

  await auth.api.requestPasswordReset({
    body: {
      email: parsed.data.email,
      redirectTo: `${env.VITE_HOST_URL}/auth/reset-password`,
    },
    headers,
  });

  const session = await usePendingForgotPasswordSession();
  await session.update({ email: parsed.data.email });
  throw redirect("/auth/forgot-password/sent");
}, "requestPasswordReset");

export const resetPassword = action(async (formData: FormData) => {
  "use server";
  const parsed = ResetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    token: formData.get("token"),
  });
  if (!parsed.success) {
    return {
      fieldErrors: collectFieldErrors<keyof ResetPasswordFieldErrors>(
        parsed.error.issues,
      ),
    };
  }

  await auth.api.resetPassword({
    body: { newPassword: parsed.data.password, token: parsed.data.token },
    headers: getServerHeaders(),
  });

  const session = await usePendingResetPasswordSession();
  await session.update({ completed: true });
  throw redirect("/auth/reset-password/success");
}, "resetPassword");

export const verifyEmailOtp = action(async (formData: FormData) => {
  "use server";
  const parsed = VerifyEmailOtpSchema.safeParse({
    otp: formData.get("otp"),
  });
  if (!parsed.success) {
    return {
      fieldErrors: collectFieldErrors<keyof VerifyEmailOtpFieldErrors>(
        parsed.error.issues,
      ),
    };
  }

  const session = await usePendingSigninSession();
  const email = session.data.email;
  if (!email) throw redirect("/auth/sign-in");

  const { headers: authHeaders } = await auth.api.verifyEmailOTP({
    body: { email, otp: parsed.data.otp },
    headers: getServerHeaders(),
    returnHeaders: true,
  });

  await session.clear();
  throw redirectWithCookies(authHeaders, "/dashboard");
}, "verifyEmailOtp");

export const resendEmailOtp = action(async () => {
  "use server";
  const session = await usePendingSigninSession();
  const email = session.data.email;
  if (!email) throw redirect("/auth/sign-in");

  await auth.api.sendVerificationOTP({
    body: { email, type: "email-verification" },
    headers: getServerHeaders(),
  });
  return { ok: true };
}, "resendEmailOtp");

export const verifyTwoFactorTotp = action(async (formData: FormData) => {
  "use server";
  const parsed = VerifyTwoFactorTotpSchema.safeParse({
    code: formData.get("code"),
    trustDevice: formData.get("trustDevice") === "on",
  });
  if (!parsed.success) {
    return {
      fieldErrors: collectFieldErrors<keyof VerifyTwoFactorFieldErrors>(
        parsed.error.issues,
      ),
    };
  }

  const { headers: authHeaders } = await auth.api.verifyTOTP({
    body: { code: parsed.data.code, trustDevice: parsed.data.trustDevice },
    headers: getServerHeaders(),
    returnHeaders: true,
  });

  throw redirectWithCookies(authHeaders, "/dashboard");
}, "verifyTwoFactorTotp");

export const verifyTwoFactorBackup = action(async (formData: FormData) => {
  "use server";
  const parsed = VerifyTwoFactorBackupSchema.safeParse({
    code: formData.get("code"),
    trustDevice: formData.get("trustDevice") === "on",
  });
  if (!parsed.success) {
    return {
      fieldErrors: collectFieldErrors<keyof VerifyTwoFactorFieldErrors>(
        parsed.error.issues,
      ),
    };
  }

  const { headers: authHeaders } = await auth.api.verifyBackupCode({
    body: { code: parsed.data.code, trustDevice: parsed.data.trustDevice },
    headers: getServerHeaders(),
    returnHeaders: true,
  });

  throw redirectWithCookies(authHeaders, "/dashboard");
}, "verifyTwoFactorBackup");

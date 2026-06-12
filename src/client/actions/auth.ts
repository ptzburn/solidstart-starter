import { action, redirect } from "@solidjs/router";
import { usePendingForgotPasswordSession } from "~/client/lib/pending-forgot-password-session.ts";
import { usePendingResetPasswordSession } from "~/client/lib/pending-reset-password-session.ts";
import { usePendingSigninSession } from "~/client/lib/pending-signin-session.ts";
import { capitalize } from "~/client/lib/utils.ts";
import {
  ChangePasswordSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  SignInSchema,
  SignInSocialSchema,
  SignUpSchema,
  VerifyEmailOtpSchema,
  VerifyTwoFactorBackupSchema,
  VerifyTwoFactorTotpSchema,
} from "~/client/schemas/auth.ts";
import { parseFields } from "~/client/utils/form-errors.ts";
import { redirectWithCookies } from "~/client/utils/redirect.ts";
import env from "~/env.ts";
import { auth } from "~/shared/auth.ts";
import { getServerHeaders } from "~/shared/server-headers.ts";
import { APIError } from "better-auth/api";

export const signIn = action(async (formData: FormData) => {
  "use server";
  const result = parseFields(SignInSchema, {
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (result.fieldErrors) return { fieldErrors: result.fieldErrors };

  const captchaToken = (formData.get("cf-turnstile-response") as string) ?? "";
  const headers = new Headers(getServerHeaders());
  headers.set("x-captcha-response", captchaToken);

  try {
    const { response, headers: authHeaders } = await auth.api.signInEmail({
      body: result.data,
      headers,
      returnHeaders: true,
    });

    if ("twoFactorRedirect" in response && response.twoFactorRedirect) {
      return redirectWithCookies(authHeaders, "/auth/sign-in/two-factor");
    }
    return redirectWithCookies(authHeaders, "/dashboard");
  } catch (error) {
    if (
      error instanceof APIError && error.body?.code === "EMAIL_NOT_VERIFIED"
    ) {
      const session = await usePendingSigninSession();
      await session.update({ email: result.data.email });
      return redirect("/auth/sign-in/verify-email");
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

  return redirectWithCookies(authHeaders, response.url);
}, "signInSocial");

export const signUp = action(async (formData: FormData) => {
  "use server";
  const result = parseFields(SignUpSchema, {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (result.fieldErrors) return { fieldErrors: result.fieldErrors };

  const captchaToken = (formData.get("cf-turnstile-response") as string) ?? "";
  const headers = new Headers(getServerHeaders());
  headers.set("x-captcha-response", captchaToken);

  const name = `${capitalize(result.data.firstName)} ${
    capitalize(result.data.lastName)
  }`.trim();

  const { headers: authHeaders } = await auth.api.signUpEmail({
    body: {
      email: result.data.email,
      password: result.data.password,
      name,
    },
    headers,
    returnHeaders: true,
  });

  const session = await usePendingSigninSession();
  await session.update({ email: result.data.email });
  return redirectWithCookies(authHeaders, "/auth/sign-in/verify-email");
}, "signUp");

export const signUpSocial = action(async (formData: FormData) => {
  "use server";
  const parsed = SignInSocialSchema.safeParse({
    provider: formData.get("provider"),
  });
  if (!parsed.success) throw new Error("Invalid provider");

  const { response, headers: authHeaders } = await auth.api.signInSocial({
    body: {
      provider: parsed.data.provider,
      callbackURL: "/dashboard?signup=true",
      requestSignUp: true,
    },
    headers: getServerHeaders(),
    returnHeaders: true,
  });

  if (!response.url) throw new Error("Failed to start sign-up");

  return redirectWithCookies(authHeaders, response.url);
}, "signUpSocial");

export const requestPasswordReset = action(async (formData: FormData) => {
  "use server";
  const result = parseFields(ForgotPasswordSchema, {
    email: formData.get("email"),
  });
  if (result.fieldErrors) return { fieldErrors: result.fieldErrors };

  const captchaToken = (formData.get("cf-turnstile-response") as string) ?? "";
  const headers = new Headers(getServerHeaders());
  headers.set("x-captcha-response", captchaToken);

  await auth.api.requestPasswordReset({
    body: {
      email: result.data.email,
      redirectTo: `${env.VITE_HOST_URL}/auth/reset-password`,
    },
    headers,
  });

  const session = await usePendingForgotPasswordSession();
  await session.update({ email: result.data.email });
  return redirect("/auth/forgot-password/sent");
}, "requestPasswordReset");

export const resetPassword = action(async (formData: FormData) => {
  "use server";
  const result = parseFields(ResetPasswordSchema, {
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    token: formData.get("token"),
  });
  if (result.fieldErrors) return { fieldErrors: result.fieldErrors };

  await auth.api.resetPassword({
    body: { newPassword: result.data.password, token: result.data.token },
    headers: getServerHeaders(),
  });

  const session = await usePendingResetPasswordSession();
  await session.update({ completed: true });
  return redirect("/auth/reset-password/success");
}, "resetPassword");

export const verifyEmailOtp = action(async (formData: FormData) => {
  "use server";
  const result = parseFields(VerifyEmailOtpSchema, {
    otp: formData.get("otp"),
  });
  if (result.fieldErrors) return { fieldErrors: result.fieldErrors };

  const session = await usePendingSigninSession();
  const email = session.data.email;
  if (!email) return redirect("/auth/sign-in");

  const { headers: authHeaders } = await auth.api.verifyEmailOTP({
    body: { email, otp: result.data.otp },
    headers: getServerHeaders(),
    returnHeaders: true,
  });

  await session.clear();
  return redirectWithCookies(authHeaders, "/dashboard");
}, "verifyEmailOtp");

export const resendEmailOtp = action(async () => {
  "use server";
  const session = await usePendingSigninSession();
  const email = session.data.email;
  if (!email) return redirect("/auth/sign-in");

  await auth.api.sendVerificationOTP({
    body: { email, type: "email-verification" },
    headers: getServerHeaders(),
  });
  return { ok: true };
}, "resendEmailOtp");

export const changePassword = action(async (formData: FormData) => {
  "use server";
  const result = parseFields(ChangePasswordSchema, {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (result.fieldErrors) return { fieldErrors: result.fieldErrors };

  await auth.api.changePassword({
    body: {
      currentPassword: result.data.currentPassword,
      newPassword: result.data.newPassword,
      revokeOtherSessions: true,
    },
    headers: getServerHeaders(),
  });

  return { ok: true as const };
}, "changePassword");

export const verifyTwoFactorTotp = action(async (formData: FormData) => {
  "use server";
  const result = parseFields(VerifyTwoFactorTotpSchema, {
    code: formData.get("code"),
    trustDevice: formData.get("trustDevice") === "on",
  });
  if (result.fieldErrors) return { fieldErrors: result.fieldErrors };

  const { headers: authHeaders } = await auth.api.verifyTOTP({
    body: { code: result.data.code, trustDevice: result.data.trustDevice },
    headers: getServerHeaders(),
    returnHeaders: true,
  });

  return redirectWithCookies(authHeaders, "/dashboard");
}, "verifyTwoFactorTotp");

export const verifyTwoFactorBackup = action(async (formData: FormData) => {
  "use server";
  const result = parseFields(VerifyTwoFactorBackupSchema, {
    code: formData.get("code"),
    trustDevice: formData.get("trustDevice") === "on",
  });
  if (result.fieldErrors) return { fieldErrors: result.fieldErrors };

  const { headers: authHeaders } = await auth.api.verifyBackupCode({
    body: { code: result.data.code, trustDevice: result.data.trustDevice },
    headers: getServerHeaders(),
    returnHeaders: true,
  });

  return redirectWithCookies(authHeaders, "/dashboard");
}, "verifyTwoFactorBackup");

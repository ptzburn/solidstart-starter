import { z } from "zod";

export const SignInSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignInFieldErrors = Partial<
  Record<keyof z.infer<typeof SignInSchema>, string>
>;

export const VerifyEmailOtpSchema = z.object({
  otp: z.string().length(6, "Invalid OTP"),
});

export type VerifyEmailOtpFieldErrors = Partial<
  Record<keyof z.infer<typeof VerifyEmailOtpSchema>, string>
>;

export const VerifyTwoFactorTotpSchema = z.object({
  code: z.string().length(6, "Invalid code"),
  trustDevice: z.boolean().optional(),
});

export const VerifyTwoFactorBackupSchema = z.object({
  code: z.string().min(1, "Invalid code"),
  trustDevice: z.boolean().optional(),
});

export type VerifyTwoFactorFieldErrors = Partial<
  Record<keyof z.infer<typeof VerifyTwoFactorTotpSchema>, string>
>;

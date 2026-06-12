import { z } from "zod";

export const SignInSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const SignInSocialSchema = z.object({
  provider: z.enum(["github", "google"]),
});

export const SignUpSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: "custom",
      message: "Passwords do not match",
      path: ["password"],
    });
    ctx.addIssue({
      code: "custom",
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  }
});

export const ForgotPasswordSchema = z.object({
  email: z.email("Invalid email"),
});

export const ResetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  token: z.string().min(1, "Invalid or missing token"),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: "custom",
      message: "Passwords do not match",
      path: ["password"],
    });
    ctx.addIssue({
      code: "custom",
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  }
});

export type SignInSocialProvider = z.infer<
  typeof SignInSocialSchema
>["provider"];

export const VerifyEmailOtpSchema = z.object({
  otp: z.string().length(6, "Invalid OTP"),
});

export const VerifyTwoFactorTotpSchema = z.object({
  code: z.string().length(6, "Invalid code"),
  trustDevice: z.boolean().optional(),
});

export const VerifyTwoFactorBackupSchema = z.object({
  code: z.string().min(1, "Invalid code"),
  trustDevice: z.boolean().optional(),
});

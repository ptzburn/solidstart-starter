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

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).superRefine((data, ctx) => {
  if (data.newPassword !== data.confirmPassword) {
    ctx.addIssue({
      code: "custom",
      message: "Passwords do not match",
      path: ["newPassword"],
    });
    ctx.addIssue({
      code: "custom",
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  }
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

export const EnableTwoFactorSchema = z.object({
  password: z.string().min(1, "Enter your password"),
});

export const DisableTwoFactorSchema = z.object({
  password: z.string().min(1, "Enter your password"),
});

export const GenerateBackupCodesSchema = z.object({
  password: z.string().min(1, "Enter your password"),
});

export const ConfirmTwoFactorTotpSchema = z.object({
  code: z.string().length(6, "Enter a 6-digit code"),
});

export const DeletePasskeySchema = z.object({
  id: z.string().min(1),
});

export const RevokeSessionSchema = z.object({
  token: z.string().min(1),
});

export const ImpersonateUserSchema = z.object({
  userId: z.string().min(1),
});

export const RemoveUserSchema = z.object({
  userId: z.string().min(1),
});

export const AdminUpdateUserNameSchema = z.object({
  userId: z.string().min(1),
  firstName: z.string().trim().min(2, "Enter first name"),
  lastName: z.string().trim().min(2, "Enter last name"),
});

export const SetUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["user", "admin"]),
});

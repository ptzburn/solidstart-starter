import { z } from "zod";

// Reusable field primitives — these fragments were repeated across many schemas.
const emailField = z.email("Invalid email");
const strongPassword = z.string().min(
  8,
  "Password must be at least 8 characters",
);
const passwordPresence = z.string().min(1, "Enter your password");
const sixDigitCode = z.string().regex(/^\d{6}$/, "Enter a 6-digit code");
const userIdField = z.string().min(1);
const trustDeviceField = z.boolean().optional();

// Shared cross-field rule: `confirmPassword` must equal the named password field.
// Sign-up, change-password and reset-password differ only in that field's name.
function confirmPasswordMatches(
  passwordKey: string,
): (data: Record<string, unknown>, ctx: z.core.$RefinementCtx) => void {
  return (data, ctx) => {
    if (data[passwordKey] === data.confirmPassword) return;
    ctx.addIssue({
      code: "custom",
      message: "Passwords do not match",
      path: [passwordKey],
    });
    ctx.addIssue({
      code: "custom",
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  };
}

// Sign-in checks presence only — do not enforce password policy here. Better Auth
// verifies the credential; a length check would block legitimate logins and leak
// the policy. The uniform "invalid email or password" is preferable.
export const SignInSchema = z.object({
  email: emailField,
  password: passwordPresence,
});

export const SignInSocialSchema = z.object({
  provider: z.enum(["github", "google"]),
});

export const SignUpSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: emailField,
  password: strongPassword,
  confirmPassword: strongPassword,
}).superRefine(confirmPasswordMatches("password"));

export const ForgotPasswordSchema = z.object({
  email: emailField,
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: strongPassword,
  confirmPassword: strongPassword,
}).superRefine(confirmPasswordMatches("newPassword"));

export const ResetPasswordSchema = z.object({
  password: strongPassword,
  confirmPassword: strongPassword,
  token: z.string().min(1, "Invalid or missing token"),
}).superRefine(confirmPasswordMatches("password"));

export type SignInSocialProvider = z.infer<
  typeof SignInSocialSchema
>["provider"];

// A sensitive action (enable/disable 2FA, regenerate backup codes) gated by
// re-entering the current password. One shape, reused at every such call site.
export const PasswordPromptSchema = z.object({
  password: passwordPresence,
});

export const VerifyEmailOtpSchema = z.object({
  otp: sixDigitCode,
});

export const VerifyTwoFactorTotpSchema = z.object({
  code: sixDigitCode,
  trustDevice: trustDeviceField,
});

export const VerifyTwoFactorBackupSchema = z.object({
  code: z.string().min(1, "Enter a backup code"),
  trustDevice: trustDeviceField,
});

export const ConfirmTwoFactorTotpSchema = z.object({
  code: sixDigitCode,
});

export const AdminUpdateUserNameSchema = z.object({
  userId: userIdField,
  firstName: z.string().trim().min(2, "Enter first name"),
  lastName: z.string().trim().min(2, "Enter last name"),
});

export const SetUserRoleSchema = z.object({
  userId: userIdField,
  role: z.enum(["user", "admin"]),
});

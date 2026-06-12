import { z } from "zod";

export const UpdateUserNameSchema = z.object({
  firstName: z.string().trim().min(2, "Enter first name"),
  lastName: z.string().trim().min(2, "Enter last name"),
});

export const RequestEmailChangeSchema = z.object({
  email: z.email("Enter a valid email"),
});

export type RequestEmailChangeFieldErrors = Partial<
  Record<keyof z.infer<typeof RequestEmailChangeSchema>, string>
>;

export const SendPhoneOtpSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+358\d{9}$/, "The phone number is invalid"),
});

export type SendPhoneOtpFieldErrors = Partial<
  Record<keyof z.infer<typeof SendPhoneOtpSchema>, string>
>;

export const VerifyPhoneOtpSchema = z.object({
  phoneNumber: z.string().trim().regex(/^\+358\d{9}$/),
  otp: z.string().length(6, "Enter the 6-digit code"),
});

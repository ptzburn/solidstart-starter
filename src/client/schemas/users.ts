import { z } from "zod";

export const UpdateUserNameSchema = z.object({
  firstName: z.string().trim().min(2, "Enter first name"),
  lastName: z.string().trim().min(2, "Enter last name"),
});

export type UpdateUserNameFieldErrors = Partial<
  Record<keyof z.infer<typeof UpdateUserNameSchema>, string>
>;

export const RequestEmailChangeSchema = z.object({
  email: z.email("Enter a valid email"),
});

export type RequestEmailChangeFieldErrors = Partial<
  Record<keyof z.infer<typeof RequestEmailChangeSchema>, string>
>;

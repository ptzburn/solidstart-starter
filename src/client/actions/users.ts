import { action } from "@solidjs/router";
import { capitalize } from "~/client/lib/utils.ts";
import {
  type RequestEmailChangeFieldErrors,
  RequestEmailChangeSchema,
  type SendPhoneOtpFieldErrors,
  SendPhoneOtpSchema,
  UpdateUserNameSchema,
  VerifyPhoneOtpSchema,
} from "~/client/schemas/users.ts";
import { parseFields } from "~/client/utils/form-errors.ts";
import { auth } from "~/shared/auth.ts";
import { getServerHeaders } from "~/shared/server-headers.ts";

export const updateUserName = action(async (formData: FormData) => {
  "use server";
  const result = parseFields(UpdateUserNameSchema, {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
  });
  if (result.fieldErrors) return { fieldErrors: result.fieldErrors };

  const name = `${capitalize(result.data.firstName)} ${
    capitalize(result.data.lastName)
  }`.trim();

  await auth.api.updateUser({
    body: { name },
    headers: getServerHeaders(),
  });

  return { ok: true as const };
}, "updateUserName");

export const requestEmailChange = action(async (formData: FormData) => {
  "use server";
  const result = parseFields(RequestEmailChangeSchema, {
    email: formData.get("email"),
  });
  if (result.fieldErrors) return { fieldErrors: result.fieldErrors };

  const headers = getServerHeaders();
  const session = await auth.api.getSession({ headers });

  if (result.data.email === session?.user.email) {
    return {
      fieldErrors: {
        email: "This is already your current email",
      } satisfies RequestEmailChangeFieldErrors,
    };
  }

  await auth.api.changeEmail({
    body: {
      newEmail: result.data.email,
      callbackURL: `/account?newEmail=${encodeURIComponent(result.data.email)}`,
    },
    headers,
  });

  return { ok: true as const };
}, "requestEmailChange");

export const sendPhoneOtp = action(async (formData: FormData) => {
  "use server";
  const result = parseFields(SendPhoneOtpSchema, {
    phoneNumber: formData.get("phoneNumber"),
  });
  if (result.fieldErrors) return { fieldErrors: result.fieldErrors };

  const headers = getServerHeaders();
  const session = await auth.api.getSession({ headers });

  if (result.data.phoneNumber === session?.user.phoneNumber) {
    return {
      fieldErrors: {
        phoneNumber: "This is already your current phone number",
      } satisfies SendPhoneOtpFieldErrors,
    };
  }

  await auth.api.sendPhoneNumberOTP({
    body: { phoneNumber: result.data.phoneNumber },
    headers,
  });

  return { ok: true as const, phoneNumber: result.data.phoneNumber };
}, "sendPhoneOtp");

export const verifyPhoneNumber = action(async (formData: FormData) => {
  "use server";
  const result = parseFields(VerifyPhoneOtpSchema, {
    phoneNumber: formData.get("phoneNumber"),
    otp: formData.get("otp"),
  });
  if (result.fieldErrors) return { fieldErrors: result.fieldErrors };

  await auth.api.verifyPhoneNumber({
    body: {
      phoneNumber: result.data.phoneNumber,
      code: result.data.otp,
      updatePhoneNumber: true,
      disableSession: true,
    },
    headers: getServerHeaders(),
  });

  return { ok: true as const };
}, "verifyPhoneNumber");

import { action } from "@solidjs/router";
import { auth } from "~/api/lib/auth.ts";
import { getServerHeaders } from "~/api/lib/server-headers.ts";
import { composeName } from "~/client/lib/name.ts";
import {
  RequestEmailChangeSchema,
  SendPhoneOtpSchema,
  UpdateUserNameSchema,
  VerifyPhoneOtpSchema,
} from "~/client/schemas/users.ts";
import { validateNotCurrentValue } from "~/client/utils/field-validation.ts";
import { parseFields } from "~/client/utils/form-errors.ts";

export const updateUserName = action(async (formData: FormData) => {
  "use server";
  const result = parseFields(UpdateUserNameSchema, {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
  });
  if (result.fieldErrors) return { fieldErrors: result.fieldErrors };

  const name = composeName(result.data.firstName, result.data.lastName);

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

  const conflict = validateNotCurrentValue(
    "email",
    result.data.email,
    session?.user.email,
    "This is already your current email",
  );
  if (conflict) return conflict;

  await auth.api.changeEmail({
    body: {
      newEmail: result.data.email,
      callbackURL: `/dashboard/account?newEmail=${
        encodeURIComponent(result.data.email)
      }`,
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

  const conflict = validateNotCurrentValue(
    "phoneNumber",
    result.data.phoneNumber,
    session?.user.phoneNumber,
    "This is already your current phone number",
  );
  if (conflict) return conflict;

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

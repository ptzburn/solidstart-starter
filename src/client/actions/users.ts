import { action } from "@solidjs/router";
import { capitalize } from "~/client/lib/utils.ts";
import {
  type RequestEmailChangeFieldErrors,
  RequestEmailChangeSchema,
  type UpdateUserNameFieldErrors,
  UpdateUserNameSchema,
} from "~/client/schemas/users.ts";
import { collectFieldErrors } from "~/client/utils/form-errors.ts";
import { auth } from "~/shared/auth.ts";
import { getServerHeaders } from "~/shared/server-headers.ts";

export const updateUserName = action(async (formData: FormData) => {
  "use server";
  const parsed = UpdateUserNameSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: collectFieldErrors<keyof UpdateUserNameFieldErrors>(
        parsed.error.issues,
      ),
    };
  }

  const name = `${capitalize(parsed.data.firstName)} ${
    capitalize(parsed.data.lastName)
  }`.trim();

  await auth.api.updateUser({
    body: { name },
    headers: getServerHeaders(),
  });

  return { ok: true as const };
}, "updateUserName");

export const requestEmailChange = action(async (formData: FormData) => {
  "use server";
  const parsed = RequestEmailChangeSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: collectFieldErrors<keyof RequestEmailChangeFieldErrors>(
        parsed.error.issues,
      ),
    };
  }

  const headers = getServerHeaders();
  const session = await auth.api.getSession({ headers });

  if (parsed.data.email === session?.user.email) {
    return {
      fieldErrors: {
        email: "This is already your current email",
      } satisfies RequestEmailChangeFieldErrors,
    };
  }

  await auth.api.changeEmail({
    body: {
      newEmail: parsed.data.email,
      callbackURL: `/account?newEmail=${encodeURIComponent(parsed.data.email)}`,
    },
    headers,
  });

  return { ok: true as const };
}, "requestEmailChange");

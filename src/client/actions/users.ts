import { action } from "@solidjs/router";
import { capitalize } from "~/client/lib/utils.ts";
import {
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

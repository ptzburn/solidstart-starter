import { action, redirect } from "@solidjs/router";
import { z } from "zod";
import { auth } from "~/shared/auth.ts";
import { getServerHeaders } from "~/shared/server-headers.ts";

const SignInSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignInFieldErrors = Partial<
  Record<keyof z.infer<typeof SignInSchema>, string>
>;

export const signIn = action(async (formData: FormData) => {
  "use server";
  const parsed = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: SignInFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof SignInFieldErrors;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  const captchaToken = (formData.get("cf-turnstile-response") as string) ?? "";
  const headers = new Headers(getServerHeaders());
  headers.set("x-captcha-response", captchaToken);

  const { headers: authHeaders } = await auth.api.signInEmail({
    body: parsed.data,
    headers,
    returnHeaders: true,
  });

  const response = redirect("/dashboard");
  for (const cookie of authHeaders.getSetCookie()) {
    response.headers.append("Set-Cookie", cookie);
  }
  throw response;
}, "signIn");

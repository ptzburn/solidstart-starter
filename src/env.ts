import process from "node:process";
import { z, ZodError } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default(
    "development",
  ),
  LOG_LEVEL: z.enum([
    "fatal",
    "error",
    "warn",
    "info",
    "debug",
    "trace",
    "silent",
  ]).default("info"),
  DATABASE_URL: z.url(),
  DATABASE_AUTH_TOKEN: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  VITE_TURNSTILE_SITE_KEY: z.string(),
  TURNSTILE_SECRET_KEY: z.string(),
  VITE_HOST_URL: z.url(),
  MAIL_TRANSPORT: z.enum(["smtp", "resend"]).default("resend"),
  RESEND_API_KEY: z.string().optional(),
  RESEND_EMAIL: z.email(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SEVEN_IO_API_KEY: z.string(),
  S3_REGION: z.string(),
  S3_ENDPOINT: z.url(),
  S3_ACCESS_KEY: z.string(),
  S3_ACCESS_SECRET: z.string(),
  S3_BUCKET: z.string(),
  VITE_S3_PUBLIC_URL: z.url(),
}).superRefine((val, ctx) => {
  if (val.MAIL_TRANSPORT === "resend") {
    if (!val.RESEND_API_KEY) {
      ctx.addIssue({
        code: "custom",
        path: ["RESEND_API_KEY"],
        message: "RESEND_API_KEY is required when MAIL_TRANSPORT=resend",
      });
    }
  } else if (val.MAIL_TRANSPORT === "smtp") {
    if (!val.SMTP_HOST) {
      ctx.addIssue({
        code: "custom",
        path: ["SMTP_HOST"],
        message: "SMTP_HOST is required when MAIL_TRANSPORT=smtp",
      });
    }
  }
});

export type env = z.infer<typeof EnvSchema>;

let env: env;

try {
  env = EnvSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    const missingValues = Object.keys(z.flattenError(error).fieldErrors)
      .join(
        "\n",
      );
    // deno-lint-ignore no-console
    console.error("Missing required variables in .env:\n" + missingValues);
  }
  process.exit(1);
}

export default env;

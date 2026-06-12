import type { z } from "zod";

export function collectFieldErrors<T extends string>(
  issues: readonly z.core.$ZodIssue[],
): Partial<Record<T, string>> {
  const fieldErrors: Partial<Record<T, string>> = {};
  for (const issue of issues) {
    const key = issue.path[0] as T | undefined;
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

type ParseFieldsResult<T extends z.ZodObject> =
  | { data: z.infer<T>; fieldErrors?: undefined }
  | {
    data?: undefined;
    fieldErrors: Partial<Record<keyof z.infer<T> & string, string>>;
  };

export function parseFields<T extends z.ZodObject>(
  schema: T,
  input: Record<string, unknown>,
): ParseFieldsResult<T> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      fieldErrors: collectFieldErrors<keyof z.infer<T> & string>(
        parsed.error.issues,
      ),
    };
  }
  return { data: parsed.data };
}

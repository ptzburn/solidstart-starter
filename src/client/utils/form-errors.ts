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

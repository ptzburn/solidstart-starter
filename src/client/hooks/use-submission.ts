import { revalidate } from "@solidjs/router";
import { type Accessor, createEffect, createMemo } from "solid-js";
import { toast } from "solid-sonner";

// These hooks collapse the three `useSubmission` lifecycle patterns that were
// hand-written across every auth form, dialog, and dashboard page: the error
// toast, the success (toast + revalidate + clear) effect, and the field-errors
// accessor. Params are typed structurally (not against `Submission<I, O>`) so a
// submission for any action shape is accepted without coupling to its generics.

type ErrorSubmission = {
  error: unknown;
  clear: () => void;
};

// Surface the failure to the user. `onError` covers the Turnstile-reset sites.
export function useSubmissionError(
  submission: ErrorSubmission,
  fallbackMessage?: string,
  onError?: () => void,
): void {
  createEffect(() => {
    if (submission.error) {
      const message = submission.error instanceof Error
        ? submission.error.message
        : "";
      toast.error(message || fallbackMessage || "Something went wrong");
      onError?.();
      submission.clear();
    }
  });
}

type SuccessSubmission<R> = {
  result?: R;
  clear: () => void;
};

type SuccessOptions<R> = {
  successMessage?: string;
  revalidateKey?: string | string[];
  onSuccess?: (result: R) => void;
  // Defaults to `"ok" in result`; override for results keyed differently
  // (e.g. the avatar upload returns `{ fileKey }`).
  isSuccess?: (result: R) => boolean;
  // Multi-step dialogs (phone, backup-codes) keep the result around to drive
  // later steps, so they opt out of the automatic clear.
  clearOnSuccess?: boolean;
};

function hasOk(result: object): boolean {
  return "ok" in result;
}

export function useSubmissionSuccess<R extends object>(
  submission: SuccessSubmission<R>,
  options: SuccessOptions<R>,
): void {
  createEffect(() => {
    const result = submission.result;
    if (!result) return;

    const isSuccess: (result: R) => boolean = options.isSuccess ?? hasOk;
    if (!isSuccess(result)) return;

    if (options.successMessage) toast.success(options.successMessage);
    if (options.revalidateKey) void revalidate(options.revalidateKey);
    options.onSuccess?.(result);
    if (options.clearOnSuccess !== false) submission.clear();
  });
}

export function useFormFieldErrors(
  submission: { result?: unknown },
): Accessor<Record<string, string | undefined>> {
  return createMemo(() => {
    const result = submission.result;
    if (result && typeof result === "object" && "fieldErrors" in result) {
      return (result.fieldErrors as Record<string, string | undefined>) ?? {};
    }
    return {};
  });
}

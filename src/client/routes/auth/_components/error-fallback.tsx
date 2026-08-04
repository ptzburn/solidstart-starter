import { A } from "@solidjs/router";
import { Button } from "~/client/components/ui/button.tsx";
import CircleAlert from "~icons/ri/error-warning-line";
import type { JSX } from "solid-js";

export default function AuthErrorFallback(props: {
  error: unknown;
  reset: () => void;
}): JSX.Element {
  const message = (): string =>
    props.error instanceof Error
      ? props.error.message
      : "An unexpected error occurred";

  return (
    <div role="alert" class="space-y-6">
      <div class="flex flex-col items-center gap-2 text-center">
        <div class="mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <CircleAlert class="size-6 text-destructive" />
        </div>
        <h1 class="font-bold text-2xl">Something went wrong</h1>
        <p class="wrap-break-words text-balance text-muted-foreground text-sm">
          {message()}
        </p>
      </div>
      <div class="grid gap-2">
        <Button
          type="button"
          class="w-full"
          onClick={props.reset}
        >
          Try again
        </Button>
        <Button
          as={A}
          href="/dashboard"
          variant="outline"
          class="w-full"
        >
          Home
        </Button>
      </div>
    </div>
  );
}

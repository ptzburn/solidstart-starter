import { Typography } from "~/client/components/ui/typography.tsx";
import { type JSX, Show } from "solid-js";

// The centered title (+ optional muted subtitle) that heads every auth screen.
export function AuthHeader(props: {
  title: JSX.Element;
  subtitle?: JSX.Element;
}): JSX.Element {
  return (
    <div class="flex flex-col items-center gap-2 text-center">
      <Typography variant="h2">{props.title}</Typography>
      <Show when={props.subtitle}>
        <Typography variant="muted">{props.subtitle}</Typography>
      </Show>
    </div>
  );
}

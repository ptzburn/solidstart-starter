import { Typography } from "~/client/components/ui/typography.tsx";
import type { JSX } from "solid-js";

// The title + muted description block that opens every dashboard page.
export function PageHeader(props: {
  title: string;
  description: string;
  class?: string;
}): JSX.Element {
  return (
    <div class={props.class}>
      <Typography variant="h2">{props.title}</Typography>
      <Typography variant="muted">{props.description}</Typography>
    </div>
  );
}

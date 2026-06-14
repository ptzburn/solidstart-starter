import { createAsync, type RouteSectionProps } from "@solidjs/router";
import { requireAdminQuery } from "~/client/queries/auth.ts";
import { type JSX, Show } from "solid-js";

export default function AdminLayout(props: RouteSectionProps): JSX.Element {
  const allowed = createAsync(() => requireAdminQuery(), { deferStream: true });

  return <Show when={allowed()}>{props.children}</Show>;
}

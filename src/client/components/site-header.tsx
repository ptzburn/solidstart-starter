import { A } from "@solidjs/router";
import { ThemeToggle } from "~/client/components/theme-toggle.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { cn } from "~/client/lib/utils.ts";
import GithubIcon from "~icons/ri/github-fill";
import { type JSX, Show } from "solid-js";

export function SiteHeader(props: {
  class?: string;
  // The inner row is capped at max-w-5xl so it lines up with the landing
  // page's content grid. Layouts that put the header inside a narrower
  // column (e.g. the auth split) pass `max-w-none` to fill that column.
  containerClass?: string;
  // Drops the Sign in and GitHub buttons, leaving just the logo and the
  // theme toggle — the auth screens already are the sign-in call to action.
  minimal?: boolean;
}): JSX.Element {
  return (
    <header
      class={cn(
        "sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm",
        props.class,
      )}
    >
      <div
        class={cn(
          "mx-auto flex h-14 max-w-5xl items-center justify-between px-6",
          props.containerClass,
        )}
      >
        <A
          href="/"
          end
          class="font-semibold text-sm tracking-tight transition-colors hover:text-foreground/80"
        >
          Starter Template
        </A>
        <div class="flex items-center gap-2">
          <ThemeToggle />
          <Show when={!props.minimal}>
            <Button as={A} href="/auth/sign-in" size="sm">
              Sign in
            </Button>
            <Button
              as="a"
              href="https://github.com/ptzburn/solidstart-starter"
              target="_blank"
              rel="noopener noreferrer"
              variant="ghost"
              size="icon-sm"
            >
              <GithubIcon class="size-6" />
              <span class="sr-only">GitHub</span>
            </Button>
          </Show>
        </div>
      </div>
    </header>
  );
}

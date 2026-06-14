import { A } from "@solidjs/router";
import { ThemeToggle } from "~/client/components/theme-toggle.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import SimpleIconsGithub from "~icons/simple-icons/github";
import type { JSX } from "solid-js";

export function SiteHeader(): JSX.Element {
  return (
    <header class="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <A
          href="/"
          end
          class="font-semibold text-sm tracking-tight transition-colors hover:text-foreground/80"
        >
          Starter Template
        </A>
        <div class="flex items-center gap-2">
          <ThemeToggle />
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
            <SimpleIconsGithub class="size-6" />
            <span class="sr-only">GitHub</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

import { A } from "@solidjs/router";
import { SiteFooter } from "~/client/components/site-footer.tsx";
import { SiteHeader } from "~/client/components/site-header.tsx";
import { Badge } from "~/client/components/ui/badge.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/client/components/ui/card.tsx";
import { Separator } from "~/client/components/ui/separator.tsx";
import ArrowRight from "~icons/lucide/arrow-right";
import Webhook from "~icons/lucide/webhook";
import SimpleIconsBetterauth from "~icons/simple-icons/betterauth";
import SimpleIconsDeno from "~icons/simple-icons/deno";
import SimpleIconsDrizzle from "~icons/simple-icons/drizzle";
import SimpleIconsGithub from "~icons/simple-icons/github";
import SimpleIconsShadcnui from "~icons/simple-icons/shadcnui";
import SimpleIconsSolid from "~icons/simple-icons/solid";
import { For, type JSX } from "solid-js";

const features = [
  {
    icon: SimpleIconsDeno,
    title: "Deno",
    description:
      "Secure runtime with first-class TypeScript support, built-in tooling, and web-standard APIs.",
    href: "https://deno.com/",
  },
  {
    icon: SimpleIconsSolid,
    title: "SolidStart",
    description:
      "Fine-grained reactive UI framework with file-based routing, SSR, and streaming.",
    href: "https://start.solidjs.com/",
  },
  {
    icon: Webhook,
    title: "oRPC",
    description:
      "End-to-end type-safe RPC with OpenAPI generation and first-class server actions.",
    href: "https://orpc.unnoq.com/",
  },
  {
    icon: SimpleIconsBetterauth,
    title: "Better Auth",
    description:
      "Full-featured authentication with social logins, passkeys, 2FA, and session management.",
    href: "https://better-auth.com/",
  },
  {
    icon: SimpleIconsShadcnui,
    title: "shadcn/ui",
    description:
      "Beautiful, accessible component library built on Kobalte primitives with Tailwind CSS.",
    href: "https://solid-ui.com/",
  },
  {
    icon: SimpleIconsDrizzle,
    title: "Drizzle ORM",
    description:
      "Type-safe SQL toolkit with schema migrations and zero-overhead queries.",
    href: "https://orm.drizzle.team/",
  },
];

export default function LandingPage(): JSX.Element {
  return (
    <div class="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <SiteHeader />

      <main class="flex flex-1 flex-col">
        <section class="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
          <Badge variant="secondary">
            Starter Template
          </Badge>

          <div class="flex max-w-2xl flex-col gap-4">
            <h1 class="font-bold text-4xl tracking-tight sm:text-5xl lg:text-6xl">
              Ship faster with the{" "}
              <span class="text-primary">modern stack</span>
            </h1>
            <p class="mx-auto max-w-lg text-lg text-muted-foreground">
              A production-ready starter with authentication, API layer, and
              polished UI — so you can focus on what matters.
            </p>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-3">
            <Button as={A} href="/auth/sign-in" size="lg">
              Get started
              <ArrowRight class="size-4" />
            </Button>
            <Button
              as="a"
              href="https://github.com/ptzburn/solidstart-starter"
              target="_blank"
              rel="noopener noreferrer"
              variant="ghost"
              size="lg"
            >
              <SimpleIconsGithub class="size-8" />
            </Button>
          </div>
        </section>

        <Separator />

        <section class="mx-auto w-full max-w-5xl px-6 py-20">
          <div class="mb-12 text-center">
            <h2 class="font-bold text-2xl tracking-tight sm:text-3xl">
              Everything you need to get started
            </h2>
            <p class="mt-2 text-muted-foreground">
              Batteries-included with best-in-class tooling.
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <For each={features}>
              {(feature) => (
                <a
                  href={feature.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
                >
                  <Card class="h-full transition-colors hover:border-primary/40">
                    <CardHeader>
                      <div class="mb-2 flex size-10 items-center justify-center rounded-md border bg-muted">
                        <feature.icon class="size-5 text-primary" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </a>
              )}
            </For>
          </div>
        </section>

        <Separator />

        <section class="flex flex-col items-center gap-6 px-6 py-20 text-center">
          <h2 class="font-bold text-2xl tracking-tight sm:text-3xl">
            Ready to build?
          </h2>
          <p class="max-w-md text-muted-foreground">
            Sign in to explore the dashboard and see the full stack in action.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-3">
            <Button as={A} href="/auth/sign-in" size="lg">
              Sign in
              <ArrowRight class="size-4" />
            </Button>
            <Button
              as="a"
              href="https://github.com/ptzburn/solidstart-starter"
              target="_blank"
              rel="noopener noreferrer"
              variant="ghost"
              size="lg"
            >
              <SimpleIconsGithub class="size-8" />
            </Button>
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}

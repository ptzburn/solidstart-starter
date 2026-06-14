import type { JSX } from "solid-js";

export function SiteFooter(): JSX.Element {
  return (
    <footer class="border-t py-6 text-center text-muted-foreground text-sm">
      This template was built by{" "}
      <a
        href="https://github.com/ptzburn"
        target="_blank"
        rel="noopener noreferrer"
        class="underline underline-offset-4 transition-colors hover:text-foreground"
      >
        ptzburn
      </a>
      .
    </footer>
  );
}

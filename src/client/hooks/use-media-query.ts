import { type Accessor, createSignal, onCleanup, onMount } from "solid-js";

export function useMediaQuery(query: string): Accessor<boolean> {
  // Always start `false` so the server and the first client render (hydration)
  // agree. Reading `matchMedia` in the initializer would return the real value
  // on the client but `false` on the server, so any `Show`/`Switch` keyed on
  // this would hydrate a different branch than was server-rendered
  // ("template is not a function"). The real value is read in `onMount`, which
  // runs after hydration, so the breakpoint switch is a normal reactive update.
  const [matches, setMatches] = createSignal(false);

  onMount(() => {
    if (typeof globalThis.matchMedia !== "function") return;

    const mediaQuery = globalThis.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener("change", handler);

    onCleanup(() => {
      mediaQuery.removeEventListener("change", handler);
    });
  });

  return matches;
}

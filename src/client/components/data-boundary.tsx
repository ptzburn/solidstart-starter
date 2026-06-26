import { ErrorBoundaryMessage } from "~/client/components/error-boundary-message.tsx";
import { ErrorBoundary, type JSX, Suspense } from "solid-js";

// Wraps async page content with the standard error fallback (ErrorBoundaryMessage)
// and a Suspense loading fallback, so every data-backed section shares the same
// error/loading shell. `fallback` is the loading state.
export function DataBoundary(props: {
  fallback: JSX.Element;
  children: JSX.Element;
}): JSX.Element {
  return (
    <ErrorBoundary fallback={(error) => <ErrorBoundaryMessage error={error} />}>
      <Suspense fallback={props.fallback}>
        {props.children}
      </Suspense>
    </ErrorBoundary>
  );
}

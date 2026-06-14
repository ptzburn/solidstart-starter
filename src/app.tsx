import {
  ColorModeProvider,
  ColorModeScript,
  cookieStorageManagerSSR,
} from "@kobalte/core";
import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { getCookie } from "@solidjs/start/http";
import { FileRoutes } from "@solidjs/start/router";
import { Toaster } from "~/client/components/ui/sonner.tsx";
import { type JSX, Suspense } from "solid-js";

import { isServer } from "solid-js/web";
import "./app.css";

function getServerCookies(): string {
  const colorMode = getCookie("kb-color-mode");
  return colorMode ? `kb-color-mode=${colorMode}` : "";
}

export default function App(): JSX.Element {
  const storageManager = cookieStorageManagerSSR(
    isServer ? getServerCookies() : document.cookie,
  );

  return (
    <Router
      // Auth actions (sign-in, impersonate, 2FA, etc.) set fresh cookies and
      // redirect into the dashboard. With single-flight on, SolidStart runs the
      // destination route's preload *inside the same request* using a Cookie
      // header reconstructed from the response's Set-Cookie — and that
      // reconstruction is unreliable for multi-cookie flows like impersonation,
      // so getSession() sees no session and bounces to /auth/sign-in. Disabling
      // it makes action redirects a normal client navigation: the browser
      // applies the Set-Cookie, then the preload refetches with the real cookie.
      // Route preload on hover/navigation is unaffected by this flag.
      singleFlight={false}
      root={(props) => (
        <MetaProvider>
          <ColorModeScript storageType={storageManager.type} />
          <ColorModeProvider storageManager={storageManager}>
            <div class="flex h-dvh">
              <Suspense>
                {props.children}
                <Toaster />
              </Suspense>
            </div>
          </ColorModeProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}

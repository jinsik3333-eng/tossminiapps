/* eslint-disable react-refresh/only-export-components */
import { StrictMode, type ComponentType, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

import config from "../granite.config.ts";
import App from "./App.tsx";
import "./index.css";

type AppProviderProps = {
  children: ReactNode;
};

type TDSMobileAITModule = {
  TDSMobileAITProvider: ComponentType<AppProviderProps & { brandPrimaryColor: string }>;
};

const BROWSER_PREVIEW_HOST_SUFFIXES = [".lhr.life", ".loca.lt"];
const LOCALHOST_PATTERN = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/;
const IPV4_PATTERN = /^\d{1,3}(\.\d{1,3}){3}$/;

function BrowserPreviewProvider({ children }: AppProviderProps) {
  return <>{children}</>;
}

function shouldLoadTDSMobileAITProvider(hostname = globalThis.location?.hostname ?? "") {
  if (!hostname || LOCALHOST_PATTERN.test(hostname) || hostname.endsWith(".localhost")) {
    return true;
  }

  if (IPV4_PATTERN.test(hostname)) {
    return false;
  }

  return !BROWSER_PREVIEW_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
}

async function resolveAppProvider(): Promise<ComponentType<AppProviderProps>> {
  if (!shouldLoadTDSMobileAITProvider()) {
    return BrowserPreviewProvider;
  }

  try {
    const { TDSMobileAITProvider } = (await import("@toss/tds-mobile-ait")) as TDSMobileAITModule;

    return function TossProvider({ children }: AppProviderProps) {
      return <TDSMobileAITProvider brandPrimaryColor={config.brand.primaryColor}>{children}</TDSMobileAITProvider>;
    };
  } catch (error) {
    console.info("TDS provider unavailable in this browser preview; using fallback.", error);
    return BrowserPreviewProvider;
  }
}

void resolveAppProvider().then((AppProvider) => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AppProvider>
        <App />
      </AppProvider>
    </StrictMode>,
  );
});

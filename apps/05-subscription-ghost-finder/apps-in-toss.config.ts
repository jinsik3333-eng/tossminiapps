import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "subscription-ghost-finder",
  brand: {
    primaryColor: "#7B61FF",
  },
  permissions: [],
  webBundleDir: "dist",
  webView: {
    pullToRefreshEnabled: true,
  },
});

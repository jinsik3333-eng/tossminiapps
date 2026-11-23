import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "receipt-monster-catcher",
  brand: {
    primaryColor: "#21C997",
  },
  permissions: [],
  webBundleDir: "dist",
  webView: {
    pullToRefreshEnabled: true,
  },
});

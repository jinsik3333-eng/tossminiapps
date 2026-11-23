import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "mongle-box-peek",
  brand: {
    primaryColor: "#F0A32D",
  },
  permissions: [],
  webBundleDir: "dist",
  webView: {
    pullToRefreshEnabled: true,
    overScrollMode: "never",
  },
});

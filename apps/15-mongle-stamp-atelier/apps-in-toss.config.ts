import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "mongle-stamp-atelier",
  brand: {
    primaryColor: "#F07A3F",
  },
  permissions: [],
  webBundleDir: "dist",
  webView: {
    pullToRefreshEnabled: true,
    overScrollMode: "never",
  },
});

import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "mongle-detective",
  brand: {
    primaryColor: "#7C5CFF",
  },
  permissions: [],
  webBundleDir: "dist",
  webView: {
    pullToRefreshEnabled: true,
    overScrollMode: "never",
  },
});

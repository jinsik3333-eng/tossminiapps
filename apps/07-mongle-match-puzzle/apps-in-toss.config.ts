import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "mongle-match-puzzle",
  brand: {
    primaryColor: "#7C4DFF",
  },
  permissions: [],
  webBundleDir: "dist",
  webView: {
    pullToRefreshEnabled: true,
    overScrollMode: "never",
  },
});

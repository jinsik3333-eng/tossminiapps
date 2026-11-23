import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "daily-waste-quiz",
  brand: {
    primaryColor: "#3182F6",
  },
  permissions: [],
  webBundleDir: "dist",
  webView: {
    pullToRefreshEnabled: true,
  },
});

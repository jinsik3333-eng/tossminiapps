import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "money-leak-test",
  brand: {
    primaryColor: "#3182F6", // Toss Blue 계열 기본색
  },
  permissions: [],
  webBundleDir: "dist",
  webView: {
    pullToRefreshEnabled: true,
  },
});

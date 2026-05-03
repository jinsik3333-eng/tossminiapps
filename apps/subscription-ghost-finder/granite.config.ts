import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "subscription-ghost-finder",
  brand: {
    displayName: "구독료 유령 찾기",
    primaryColor: "#7B61FF",
    icon: "",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});

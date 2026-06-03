import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "stock-fighter",
  brand: {
    displayName: "주식 파이터",
    primaryColor: "#E53935",
    icon: "https://stock-fighter.apps.tossmini.com/app-icon.png",
  },
  web: {
    host: "localhost",
    port: 5191,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
  webViewProps: {
    type: "game",
    overScrollMode: "never",
  },
});

import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "mongle-detective",
  brand: {
    displayName: "1초 탐정 몽글",
    primaryColor: "#7C5CFF",
    icon: "https://mongle-detective.apps.tossmini.com/app-icon.png",
  },
  web: {
    host: "localhost",
    port: 5183,
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

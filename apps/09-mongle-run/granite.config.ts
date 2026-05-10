import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "mongle-run",
  brand: {
    displayName: "도망 몽글",
    primaryColor: "#5B8CFF",
    icon: "https://mongle-run.apps.tossmini.com/app-icon.png",
  },
  web: {
    host: "localhost",
    port: 5182,
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

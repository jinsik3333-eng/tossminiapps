import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "mongle-mung-garden",
  brand: {
    displayName: "몽글 멍정원",
    primaryColor: "#5BBF86",
    icon: "https://mongle-mung-garden.apps.tossmini.com/app-icon.png",
  },
  web: {
    host: "localhost",
    port: 5186,
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

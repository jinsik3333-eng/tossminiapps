import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "mongle-stamp-atelier",
  brand: {
    displayName: "몽글 도장작업실",
    primaryColor: "#F07A3F",
    icon: "https://mongle-stamp-atelier.apps.tossmini.com/app-icon.png",
  },
  web: {
    host: "localhost",
    port: 5188,
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

import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "mongle-box-peek",
  brand: {
    displayName: "몽글 상자살롱",
    primaryColor: "#F0A32D",
    icon: "https://mongle-box-peek.apps.tossmini.com/app-icon.png",
  },
  web: {
    host: "localhost",
    port: 5190,
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

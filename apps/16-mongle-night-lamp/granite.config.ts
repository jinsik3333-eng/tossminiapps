import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "mongle-night-lamp",
  brand: {
    displayName: "몽글 별빛방",
    primaryColor: "#8B63FF",
    icon: "https://mongle-night-lamp.apps.tossmini.com/app-icon.png",
  },
  web: {
    host: "localhost",
    port: 5189,
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

import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "mongle-jump",
  brand: {
    displayName: "몽글 점프",
    primaryColor: "#19B37A",
    icon: "https://mongle-jump.apps.tossmini.com/app-icon.png",
  },
  web: {
    host: "localhost",
    port: 5184,
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

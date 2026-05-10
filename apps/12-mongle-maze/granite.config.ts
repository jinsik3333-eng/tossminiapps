import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "mongle-maze",
  brand: {
    displayName: "몽글 미로 탈출",
    primaryColor: "#F07A3F",
    icon: "https://mongle-maze.apps.tossmini.com/app-icon.png",
  },
  web: {
    host: "localhost",
    port: 5185,
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

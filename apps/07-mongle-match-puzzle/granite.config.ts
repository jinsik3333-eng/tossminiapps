import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "mongle-match-puzzle",
  brand: {
    displayName: "몽글 매치 퍼즐",
    primaryColor: "#7C4DFF",
    icon: "https://mongle-match-puzzle.apps.tossmini.com/app-icon.png",
  },
  web: {
    host: "localhost",
    port: 5180,
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

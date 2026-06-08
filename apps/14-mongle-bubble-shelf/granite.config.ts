import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "mongle-bubble-shelf",
  brand: {
    displayName: "몽글 방울서랍",
    primaryColor: "#6A7CFF",
    icon: "https://mongle-bubble-shelf.apps.tossmini.com/app-icon.png",
  },
  web: {
    host: "localhost",
    port: 5187,
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

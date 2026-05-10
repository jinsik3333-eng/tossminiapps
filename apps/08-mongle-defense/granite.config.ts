import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "mongle-defense",
  brand: {
    displayName: "몽글 디펜스",
    primaryColor: "#6A7CFF",
    icon: "",
  },
  web: {
    host: "localhost",
    port: 5181,
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

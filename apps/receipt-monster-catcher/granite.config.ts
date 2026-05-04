import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "receipt-monster-catcher",
  brand: {
    displayName: "영수증 몬스터 잡기",
    primaryColor: "#21C997",
    icon: "",
  },
  web: {
    host: "localhost",
    port: 5178,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});

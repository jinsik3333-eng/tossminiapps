import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "spending-defense-roulette",
  brand: {
    displayName: "소비 방어 룰렛",
    primaryColor: "#3182F6",
    icon: "",
  },
  web: {
    host: "localhost",
    port: 5177,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});

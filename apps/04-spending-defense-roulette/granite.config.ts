import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "spending-defense-roulette",
  brand: {
    displayName: "소비 방어 룰렛",
    primaryColor: "#3182F6",
    icon: "https://spending-defense-roulette.apps.tossmini.com/app-icon.png", // 콘솔 앱 정보에도 public/app-icon.png와 동일한 이미지를 업로드
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

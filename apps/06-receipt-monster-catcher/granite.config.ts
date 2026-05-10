import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "receipt-monster-catcher",
  brand: {
    displayName: "영수증 몬스터 잡기",
    primaryColor: "#21C997",
    icon: "https://receipt-monster-catcher.apps.tossmini.com/app-icon.png", // 콘솔 앱 정보에도 public/app-icon.png와 동일한 이미지를 업로드
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

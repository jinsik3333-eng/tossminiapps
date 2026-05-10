import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "daily-waste-quiz",
  brand: {
    displayName: "오늘의 헛돈 방지 퀴즈",
    primaryColor: "#3182F6",
    icon: "https://daily-waste-quiz.apps.tossmini.com/app-icon.png", // 콘솔 앱 정보에도 public/app-icon.png와 동일한 이미지를 업로드
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});

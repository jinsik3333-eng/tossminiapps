import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "daily-waste-quiz",
  brand: {
    displayName: "오늘의 헛돈 방지 퀴즈",
    primaryColor: "#3182F6",
    icon: "", // 콘솔/호스팅 후 아이콘 이미지 URL 입력
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

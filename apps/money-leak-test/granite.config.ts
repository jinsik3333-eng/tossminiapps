import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "money-leak-test",
  brand: {
    displayName: "돈 새는 구멍 테스트", // 앱인토스 콘솔 등록명과 맞출 것
    primaryColor: "#3182F6", // Toss Blue 계열 기본색
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

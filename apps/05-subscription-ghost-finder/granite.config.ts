import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "subscription-ghost-finder",
  brand: {
    displayName: "구독료 유령 찾기",
    primaryColor: "#7B61FF",
    icon: "https://subscription-ghost-finder.apps.tossmini.com/app-icon.png", // 콘솔 앱 정보에도 public/app-icon.png와 동일한 이미지를 업로드
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

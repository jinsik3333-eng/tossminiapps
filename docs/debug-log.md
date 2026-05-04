# Debug Log

## 2026-05-04 — 6호 빌드 설정 이슈

- 증상: 새 앱 `receipt-monster-catcher`에서 `ait build` 실행 시 `granite build --no-cache` 옵션 오류 또는 RN 번들 누락 오류 발생.
- 원인: `granite.config.ts`를 예전 `@apps-in-toss/framework/config` 형태로 작성해 seed 앱과 다른 빌드 경로를 탔다.
- 해결: 5호와 동일하게 `@apps-in-toss/web-framework/config`의 `defineConfig` 구조, `web.commands.build: "vite build"`, `outdir: "dist"`를 명시했다.
- 추가: 새 앱 설치 시 peer dependency 충돌은 `npm ci --legacy-peer-deps` 또는 seed lockfile 유지로 처리한다. `npm audit fix --force`는 금지.

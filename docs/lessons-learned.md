# Lessons Learned

## 2026-05-04 — 6호 `영수증 몬스터 잡기`

- 5호 seed를 복사할 때 `granite.config.ts`는 반드시 `@apps-in-toss/web-framework/config` 기반 최신 구조로 맞춰야 한다. 예전 `@apps-in-toss/framework/config` 형태를 쓰면 `ait build`가 RN 번들 생성 경로에서 실패할 수 있다.
- 새 앱에서 `npm install`만 실행하면 peer dependency/CLI 호환 문제가 날 수 있으므로, seed 앱의 `package.json`/`package-lock.json` 조합을 유지하고 필요 시 `npm ci --legacy-peer-deps`를 사용한다. `npm audit fix --force`는 사용하지 않는다.
- 탭 게임형 앱은 룰렛형보다 구현이 빠르고 반복 진입 루프를 만들기 쉽다. 핵심 상태는 `home → hunt → result`, 탭 HP, 결과 루틴 카드, 30일 기록이면 충분하다.

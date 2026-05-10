# 몽글 디펜스 APP_CONTEXT

## 목적

`몽글 디펜스`는 Apps in Toss 게임 WebView용 30초 lane defense MVP이다. 몽글 마을로 내려오는 장난감 몬스터를 탭해 막고, 결과에서 점수/등급/조각 획득/랭킹/다시하기 CTA를 확인한다.

## 핵심 제약

- `granite.config.ts`는 `webViewProps: { type: "game", overScrollMode: "never" }`를 유지한다.
- 로컬·샌드박스·미지원 앱 버전에서는 게임 흐름을 막지 않고 연습 프로필/랭킹 안내 메시지를 사용한다.
- 점수 제출은 게임 종료 후 `playId` 기준 1회만 `submitGameCenterLeaderBoardScore({ score: score.toFixed(1) })`로 시도한다.
- 플레이 중 광고는 노출하지 않는다. 광고 SDK가 붙기 전까지 사용자 화면의 보너스 CTA는 광고 시청을 약속하지 않는다.
- 현금/포인트/캐시/당첨/보장성 카피를 쓰지 않는다.

## 구현 구조

- `src/lib/gameLogic.ts`: 순수 디펜스 로직. HP, lane, spawn, tap, combo, skill, score breakdown, grade.
- `src/lib/tossGameCenter.ts`: Toss Game Center adapter와 local/sandbox/unsupported 안전 처리.
- `src/App.tsx`: `home → tutorial/profile gate → play → result` 상태 흐름.
- `src/App.css`: 390px 모바일 WebView 기준 toy/clay 비주얼, overscroll/touch-action 처리.

## MVP 플레이 값

- 제한 시간: 30초
- HP: 5
- lane: 3개
- 몬스터: common, shield, fast, bonus
- 스킬: 콤보 8 이상에서 `구름 방패` 1회, 하단 위험 몬스터 최대 3개 제거

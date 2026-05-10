# 1초 탐정 몽글 APP_CONTEXT

## 앱 개요

- 경로: `apps/10-mongle-detective`
- 카테고리: Apps in Toss 게임 WebView 미니앱
- 핵심 루프: 20~60초 안에 이해되는 짧은 플레이 → 결과 저장 → 최고 기록/수집 진행 → 한 판 더
- 포트: `5183`

## 핵심 파일

- `src/App.tsx`: 게임 상태, 홈/플레이/결과 화면, 로컬 기록/수집 루프
- `src/App.css`: 390px 모바일용 toy/clay 몽글 UI와 게임 보드
- `src/lib/tossGameCenter.ts`: Toss Game Center 안전 fallback
- `granite.config.ts`: game WebView 설정

## 검증

- `npm run lint`
- `npm run build`
- `./node_modules/.bin/vite --host 0.0.0.0 --port 5183 --strictPort` 후 390px 브라우저 QA

## 주의

- 기존 앱/공통 템플릿을 수정하지 않는다.
- 광고 SDK 연결 전 `광고 보고` CTA를 넣지 않는다.
- 앱 전용 아이콘은 제출 전 별도 준비가 필요할 수 있다.

## 추가 재미 요소

- 라운드별 사건 단서 문구와 해결 피드백이 표시된다.
- 연속 정답 streak를 점수에 반영하고, 희귀 변장 도둑 카드를 구분 가능한 표식으로 추가했다.
- 중복 클릭 가드는 flash 상태로 유지하며 결과에 이번 판 하이라이트/다음 목표를 표시한다.

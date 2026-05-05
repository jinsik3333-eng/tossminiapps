# Toss Miniapps 컨텍스트 맵

이 파일은 Hermes/Claude/Codex가 매번 전체 저장소를 긁지 않고, 필요한 파일만 빠르게 컨텍스트로 가져오기 위한 진입점이다.

## 작업 범위

- 루트: `/Users/jinsik/Desktop/Workspace/01_project_tossminiapps`
- 목적: Apps in Toss 미니앱 10개 제작/수익화 실험
- 현재 출시 후보 앱: `apps/mongle-match-puzzle`
- 기존/참조 앱: `apps/money-leak-test`

## 항상 먼저 읽을 파일

1. `AGENTS.md`
   - 프로젝트 운영 지침, 역할 분담, 검증 기준
2. 현재 작업 앱의 `CLAUDE.md`
   - 앱별 추가 규칙 및 참조 문서
3. 현재 작업 앱의 `APP_CONTEXT.md`
   - 앱 구조, 핵심 파일, 작업별 컨텍스트 로딩 가이드

## 공통 운영 문서

- `docs/lessons-learned.md`
  - 앱 제작 중 배운 교훈
- `docs/app-factory-checklist.md`
  - 다음 앱 제작 체크리스트
- `docs/common-template-decisions.md`
  - 공통 템플릿/패턴 결정 사항
- `docs/debug-log.md`
  - 디버깅/QA 로그

## 앱별 컨텍스트

### 몽글 매치 퍼즐

- 앱 루트: `apps/mongle-match-puzzle`
- 컨텍스트 파일: `apps/mongle-match-puzzle/APP_CONTEXT.md`
- 핵심 구현:
  - `src/App.tsx`
  - `src/App.css`
  - `src/lib/gameLogic.ts`
  - `src/lib/tossGameCenter.ts`
- 출시/검증:
  - `granite.config.ts`
  - `package.json`
  - `mongle-match-puzzle.ait`는 로컬 제출 산출물이며 git 추적 대상은 아님

### 머니 리크 테스트

- 앱 루트: `apps/money-leak-test`
- 초기 템플릿/광고/공유 패턴 참조용

## 생성물/임시 파일 원칙

- `dist/`, `.granite/`, `*.ait`, `node_modules/`는 생성물이다. git 추적하지 않는다.
- 앱에서 직접 로드하지 않는 이미지 실험 산출물은 `public/`에 두지 않는다.
- QA용 contact sheet, generation log, prompt manifest는 필요하면 `docs/archive/` 또는 앱의 `docs/`에 둔다.
- `public/`에는 실제 앱 런타임에서 필요한 정적 자산만 둔다.

## 다음 앱 작업 시작 루틴

1. `AGENTS.md` 읽기
2. `PROJECT_CONTEXT.md` 읽기
3. 해당 앱의 `APP_CONTEXT.md` 읽기
4. 작업 목적에 맞는 핵심 파일만 추가로 읽기
5. 변경 후 앱 디렉터리에서 `npm run lint && npm run build`
6. 모바일 폭/브라우저 콘솔 확인
7. 배운 점은 공통 문서 4종 중 필요한 곳에만 짧게 반영

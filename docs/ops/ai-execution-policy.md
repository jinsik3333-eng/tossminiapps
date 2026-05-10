# AI 실행 정책 — Toss Miniapps

Updated: 2026-05-08

## 목적

`01_project_tossminiapps`에서 Hermes의 장기 기억/스킬/검증 장점은 유지하되, 실제 구현 속도는 OMX/Codex 중심으로 가져간다.

```text
Hermes = PM / memory / skill governance / verification / report
OMX + Codex = main executor for implementation
Claude Code = TDS/UX/SDK/review specialist
Gemini = non-sensitive long-context / visual QA only
```

## 기본 라우팅

### Hermes가 직접 처리

- 작업 분해, 범위 확인, 프로젝트 규칙 확인
- `AGENTS.md`, `PROJECT_CONTEXT.md`, 앱별 `APP_CONTEXT.md` 기반 task packet 작성
- 결과 파일 readback, 빌드/브라우저/390px QA 검증
- `.hermes/session-handoff.md`, `docs/debug-log.md`, `docs/lessons-learned.md` 등 운영 문서 갱신

### OMX/Codex에 위임

- 앱 코드 구현/수정/리팩터링
- 반복적인 빌드 오류 수정
- 작은 단위 테스트/빌드 실패 해결
- `apps/<app-slug>` 내부의 명확한 파일 수정

권장 패턴:

```bash
omx exec -C /Users/jinsik/Desktop/Workspace/01_project_tossminiapps "<작고 구체적인 task packet>"
```

### Claude Code 사용

- Apps in Toss SDK / Game Center / TDS UX 리뷰
- 복잡한 디버깅, P0/P1 코드 리뷰
- 제출 전 품질 리뷰

### Gemini 사용

- 비민감 문서/긴 컨텍스트 요약
- 모바일 스크린샷/캐릭터 contact sheet QA
- 코드/비공개 인증/내부 PRD 전체를 넘기지 않는다.

## 미니앱 작업 게이트

1. `AGENTS.md`와 `PROJECT_CONTEXT.md`를 읽는다.
2. 현재 앱의 `apps/<app-slug>/APP_CONTEXT.md` 또는 `CLAUDE.md`를 읽는다.
3. 수정 가능 경로와 금지 경로를 task packet에 명시한다.
4. 구현은 OMX/Codex에 맡긴다.
5. Hermes가 `npm run lint`, `npm run build`, 375~390px QA, 콘솔 오류를 검증한다.
6. 실제 Toss QR/Game Center 검증은 브라우저 QA와 분리해서 보고한다.

## 금지

- 다른 프로젝트 맥락 섞기 금지.
- `npm audit fix --force` 임의 실행 금지.
- 광고 SDK가 없는데 `광고 보고` CTA를 사용자 화면에 노출 금지.
- 금융상품 추천/투자/대출/보험/카드 중개/가상자산/사행성/의료/채팅·데이팅 리스크 금지.

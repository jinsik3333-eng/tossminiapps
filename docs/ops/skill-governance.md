# Skill Governance — Toss Miniapps

Updated: 2026-05-08

## 목적

Apps in Toss 미니앱 작업에서 스킬이 과도하게 늘어나 컨텍스트와 트리거가 오염되는 것을 막는다.

## 분류

### Active skill

자동 적용 대상. 최소화한다.

- Hermes 전역: `apps-in-toss-miniapp-development`, `omx-hermes-orchestration`, `codex`, `claude-code`, `multimodel-session-end`
- 프로젝트 wrapper: `.codex/skills/tossminiapps-dev-loop/SKILL.md`

### Reference skill

필요할 때만 읽는 참고자료.

- Apps in Toss 세부 레퍼런스
- 몽글/수집형/스와이프/실기기 QA 참고 문서
- 이미지 생성/캐릭터 파이프라인 레퍼런스

### Archive skill

과거 시행착오/폐기안. 자동 발동 금지.

## 운영 원칙

1. 프로젝트 wrapper는 1개만 유지한다: `tossminiapps-dev-loop`.
2. 앱별로 새 skill을 만들지 않는다. 앱별 규칙은 `apps/<app-slug>/APP_CONTEXT.md`에 둔다.
3. 20~30개 세부 skill을 `.codex/skills`나 `~/.codex/skills`에 대량 복사하지 않는다.
4. 새 규칙은 우선 `docs/lessons-learned.md`, `docs/app-factory-checklist.md`, `docs/common-template-decisions.md`, `docs/debug-log.md`에 짧게 반영한다.
5. Hermes memory에는 장기 선호/불변 규칙만 저장하고, 진행 상태는 repo 문서에 둔다.

## 새 스킬 추가 기준

아래 조건을 모두 만족할 때만 새 스킬을 만든다.

- 3회 이상 반복될 일반 workflow다.
- 특정 앱 1개에만 해당하지 않는다.
- 기존 wrapper나 `APP_CONTEXT.md`로 표현하기 어렵다.
- trigger 조건과 verification checklist가 명확하다.

그 외는 문서/reference로 둔다.

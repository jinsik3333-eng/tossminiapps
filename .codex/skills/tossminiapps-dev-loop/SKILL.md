---
name: tossminiapps-dev-loop
description: Apps in Toss miniapps 전용 wrapper. Hermes는 PM/검증, OMX/Codex는 구현 실행자로 두고 앱별 APP_CONTEXT를 따른다.
version: 1.0.0
---

# tossminiapps-dev-loop

## 역할

`01_project_tossminiapps`에서 미니앱 기획/구현/수정/QA/패키징 요청을 받을 때 사용하는 프로젝트 전용 wrapper다.

```text
Hermes = PM / memory / skill governance / verification / report
OMX + Codex = main executor
Claude Code = TDS/UX/SDK/review specialist
Gemini = non-sensitive long-context / Vision QA
```

## 먼저 읽을 문서

1. `AGENTS.md`
2. `PROJECT_CONTEXT.md`
3. `docs/ops/ai-execution-policy.md`
4. `docs/ops/skill-governance.md`
5. 현재 앱의 `apps/<app-slug>/APP_CONTEXT.md`
6. 현재 앱의 `apps/<app-slug>/CLAUDE.md`가 있으면 읽기
7. `.hermes/session-handoff.md`

## 요청 분류

### 새 앱/기능 구현

- Hermes가 직접 오래 편집하지 않는다.
- 앱 slug, allowed paths, forbidden paths, 검증 명령을 task packet에 넣어 OMX/Codex에 위임한다.
- 공통 템플릿 변경과 특정 앱 변경을 섞지 않는다.

권장 패턴:

```bash
omx exec -C /Users/jinsik/Desktop/Workspace/01_project_tossminiapps "<task packet>"
```

### Toss SDK / Game Center / TDS / 제출 전 리뷰

- Claude Code Sonnet 리뷰를 선택적으로 사용한다.
- 리뷰 결과는 Hermes가 diff/readback으로 검증한다.

### 이미지/캐릭터/몽글 asset

- 작은 대표 샘플 또는 contact sheet 먼저 만든다.
- 사용자가 승인하기 전 50~100개 대량 생성 금지.
- 생성 asset은 앱 public 경로에 바로 넣지 말고 manifest/QA를 거친다.
- 말랑한 toy/clay/plush, 귀여운 유령·탐정·도둑 같은 역할/소품/짧은 스토리형을 우선한다.

## 검증

- 앱 디렉터리에서 `npm run lint` 가능하면 실행
- `npm run build` 실행
- `.ait` 생성/크기 확인이 필요한 경우 확인
- 375~390px 모바일 화면/콘솔 QA
- Toss QR/Game Center 실기기 검증은 별도 상태로 보고

## 보고

한국어로 짧게:

- 변경 파일
- 검증 결과
- 남은 실기기/Toss 콘솔 확인
- 다음 액션

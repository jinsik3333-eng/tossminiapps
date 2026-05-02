# Toss Miniapps 에이전트 운영 계획

작성일: 2026-05-02
프로젝트: `/Users/jinsik/Desktop/Workspace/01_project_tossminiapps`

## 결론

초기부터 큰 Paperclip 회사를 만들기보다는, 1호 앱 `돈 새는 구멍 테스트`를 만들면서 반복 가능한 공정과 체크리스트를 먼저 확정한다. 이후 2~3호 앱부터 Paperclip에 역할 기반 에이전트/이슈 체계를 올리는 방식이 가장 안전하다.

## 왜 바로 대규모 에이전트 조직을 만들지 않는가

- 1호 앱에서는 아직 템플릿, 광고 배치, TDS 패턴, 빌드/검수 루프가 검증되지 않았다.
- 에이전트를 많이 만들면 초반에는 병렬화보다 조율 비용이 더 커질 수 있다.
- Apps in Toss는 공식 SDK/검수/광고/TDS 제약이 있어, 공통 규칙을 먼저 문서화해야 한다.

## 1호 앱 운영 방식

### 역할

- Hermes: PM/오케스트레이터/최종 검증
- Codex: 빠른 구현, 반복 수정, 단순 리팩터링, 테스트 보강
- Claude Code: TDS/UX/SDK 구조, 앱 품질 개선, 복잡한 디버깅
- AX MCP: Apps in Toss 공식 문서/예제 검색 소스

### 루프

1. 목표 정의
2. 작은 단위 구현
3. 빌드 실행
4. 오류 원인 분석
5. 수정
6. 모바일 화면 확인
7. 다음 앱에 재사용할 규칙/템플릿으로 승격

## 2~3호 앱부터 Paperclip 도입 기준

Paperclip 회사/팀을 만드는 기준:

- 1호 앱에서 공통 템플릿이 생겼다.
- 앱 복제 절차가 1회 이상 검증됐다.
- 이슈 단위가 명확하다.
- 에이전트별 산출물 경로/검증 기준이 정해졌다.

이 조건을 만족하면 Paperclip에 `Toss Miniapps Factory` 같은 회사/워크스페이스를 만들고 운영한다.

## 추천 Paperclip 역할

### 1. Producer / PM

- 10개 앱 후보 우선순위 결정
- 앱별 한 줄 후킹, 수익화 지점, 검수 리스크 정리
- 이슈 생성/상태 관리

### 2. Apps in Toss Engineer

- create-ait-app 기반 앱 생성
- web-framework, granite.config.ts, SDK 연동
- 빌드/배포 artifact 생성

### 3. Template Engineer

- 테스트형/퀴즈형/체크리스트형/클리커형 공통 엔진 관리
- 앱별 JSON 데이터만 바꿔 확장 가능하게 설계

### 4. Content & Hook Writer

- 질문/결과/공유문구/앱 설명 작성
- 토스 미니앱 상위권 스타일의 짧은 후킹 카피 개선

### 5. QA / Debugger

- npm build, lint, audit 기록
- 모바일 WebView 화면 점검
- 광고/공유/저장소 동작 확인

### 6. Monetization Analyst

- 배너/전면/리워드 광고 위치 설계
- 결과 화면/힌트/상세 리포트 등 광고 지점 정리

## 자기 진화 원칙

매 앱 완료 후 아래 파일들을 업데이트한다.

- `docs/lessons-learned.md`
- `docs/app-factory-checklist.md`
- `docs/common-template-decisions.md`
- `docs/debug-log.md`

업데이트 항목:

- 반복된 오류
- 빌드/SDK 주의사항
- 잘 먹힌 카피/후킹
- 재사용 컴포넌트
- 다음 앱 생성 시간을 줄이는 자동화 포인트

## 디버깅 루프

### Codex 루프

- git repo 안에서 `codex exec --full-auto` 중심 사용
- 작은 작업 단위로 실행
- 실패 시 로그를 읽고 원인/수정/검증을 반복

예시:

```bash
codex exec --full-auto -p medium "apps/money-leak-test에서 테스트형 결과 화면을 구현하고 npm run build로 검증해. 실패하면 원인을 수정하고 다시 빌드해. Apps in Toss MCP를 참고해."
```

### Claude Code 루프

- 복잡한 UI/SDK/TDS/디버깅은 Claude Code에 맡김
- print mode는 단건 구현에 사용
- interactive mode에서는 `/loop`, `/review`, `/context` 사용 가능

예시:

```bash
claude -p "돈 새는 구멍 테스트의 모바일 UX와 TDS 구조를 개선하고 빌드까지 확인해" --model sonnet --allowedTools "Read,Write,Edit,Bash" --max-turns 12
```

### Hermes 루프

- 전체 목표 관리
- 각 에이전트 결과 검증
- 파일/빌드/문서/사용자 보고
- 필요 시 `delegate_task`로 스펙 리뷰와 품질 리뷰 분리

## 1호 앱 완료 기준

- [ ] 첫 화면/질문/결과 화면 구현
- [ ] 결과 유형 6개 구현
- [ ] 광고 위치 stub 또는 공식 샘플 연결
- [ ] 공유 버튼 stub 또는 공식 SDK 연결
- [ ] `npm run build` 성공
- [ ] 모바일 화면 스크린샷 QA
- [ ] 다음 앱 복제용 체크리스트 작성

## 2호 앱 시작 기준

- [ ] 1호 앱 템플릿에서 콘텐츠 JSON만 바꿔 만들 수 있음
- [ ] 새 appName/displayName/icon/color 변경 절차 확인
- [ ] 광고/공유/결과 화면 구조 재사용 가능
- [ ] 빌드 오류 해결 패턴 문서화됨

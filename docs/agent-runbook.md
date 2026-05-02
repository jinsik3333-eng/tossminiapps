# 에이전트 실행 Runbook

## Codex 구현 루프

전제: 프로젝트 루트가 Git 저장소여야 한다.

```bash
codex exec --full-auto -p medium "apps/money-leak-test에서 docs/money-leak-test-mvp-brief.md 기준으로 테스트형 MVP를 구현해. 기존 인앱광고 샘플은 보존하되 결과 화면/상세 처방 지점에서 쓸 수 있게 정리해. 구현 후 npm run build를 실행하고 실패하면 원인을 고쳐 다시 빌드해."
```

## Claude Code UX/SDK 리뷰 루프

```bash
claude -p "apps/money-leak-test의 구현을 검토해. Apps in Toss/TDS/WebView 기준으로 모바일 UX, SDK 사용, 광고 fallback, 빌드 안정성을 개선해. 변경 후 npm run build로 검증해." --model sonnet --allowedTools "Read,Write,Edit,Bash" --max-turns 12
```

## Hermes 검증 루프

- 변경 파일 확인
- `npm run build`
- 필요 시 dev server 실행 후 모바일 폭 스크린샷 QA
- 문서 4종 업데이트
- Git diff 검토
- 커밋

## Paperclip 도입 기준

- 1호 앱 MVP 완성
- 2호 앱 복제 절차 검증
- 공통 체크리스트와 디버그 로그가 실제로 업데이트됨
- 그 이후 `Toss Miniapps Factory` 회사/팀 생성

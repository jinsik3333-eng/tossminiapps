# Toss Miniapps 프로젝트 운영 지침

## 프로젝트 범위

- 이 저장소는 Apps in Toss 미니앱 10개 제작/수익화 실험 전용이다.
- 작업 루트: `/Users/jinsik/Desktop/Workspace/01_project_tossminiapps`
- 다른 프로젝트 맥락을 섞지 않는다.
- 모든 사용자 커뮤니케이션과 문서는 한국어를 기본으로 한다.

## 목표

- 이번 주 내 Apps in Toss 미니앱 10개를 빠르게 제작한다.
- 1호 앱 `money-leak-test`에서 공통 템플릿/디버깅/광고/공유 패턴을 검증한다.
- 2호 앱부터는 공통 엔진 + 콘텐츠 데이터 교체 방식으로 제작 속도를 높인다.

## 에이전트 역할 분담

### Hermes

- PM/오케스트레이터/최종 검증자.
- 작업 분해, 파일 읽기/쓰기, 빌드 검증, 문서화, 사용자 보고를 담당한다.
- 에이전트 결과를 그대로 믿지 말고 파일/빌드/스크린샷으로 검증한다.

### Codex

- 빠른 구현, 반복 수정, 단순 리팩터링, 빌드 오류 해결 담당.
- 작은 범위의 `codex exec --full-auto` 작업에 적합하다.
- Git 저장소 안에서 실행한다.
- Apps in Toss MCP 서버 `apps-in-toss`를 사용할 수 있다.

### Claude Code

- TDS/UX 구조, Apps in Toss SDK 연동, 복잡한 디버깅, 코드 품질 리뷰 담당.
- 단건 자동화는 print mode를 우선한다.
- 예: `claude -p "..." --model sonnet --allowedTools "Read,Write,Edit,Bash" --max-turns 12`
- 장기 반복/검토는 interactive mode의 `/loop`, `/review`, `/context`를 사용한다.

## 개발 원칙

- 공식 Apps in Toss 문서/AX MCP를 우선 신뢰한다.
- 비게임 WebView 미니앱은 TDS 사용을 기본으로 한다.
- 광고는 첫 진입/질문 중간을 방해하지 않고 결과/상세/보상 지점에 배치한다.
- 정책 리스크가 큰 금융상품 추천, 투자, 대출/보험/카드 중개, 가상자산, 사행성, 의료, 채팅/데이팅은 피한다.
- `npm audit fix --force`는 공식 framework 호환성을 깨뜨릴 수 있으므로 사용 전 별도 검토한다.

## 검증 기준

각 앱 완료 전 최소 확인:

- `npm run build` 성공
- 모바일 폭 375~390px 기준 화면 확인
- 결과/공유/광고 지점 확인
- 앱 이름, `granite.config.ts`, 아이콘/색상 설정 확인
- 다음 앱에 재사용할 교훈을 문서화

## 자기 진화 문서

앱 하나를 만들 때마다 아래 문서를 업데이트한다.

- `docs/lessons-learned.md`
- `docs/app-factory-checklist.md`
- `docs/common-template-decisions.md`
- `docs/debug-log.md`

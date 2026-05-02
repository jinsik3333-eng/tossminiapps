# Apps in Toss 툴링 세팅 기록

작성일: 2026-05-02
프로젝트: `/Users/jinsik/Desktop/Workspace/01_project_tossminiapps`

## 1. 공식 제공 툴/리소스 요약

이번 프로젝트에서 우선 활용할 Apps in Toss 제공 요소는 아래와 같다.

### 개발 스캐폴드/CLI

- `create-ait-app`
  - WebView 미니앱 프로젝트 생성 도구
  - 사용 예: `npx create-ait-app <app-name>`
  - 확인 버전: `0.0.2`
- `@apps-in-toss/web-framework`
  - WebView 미니앱 SDK/CLI 포함
  - 확인 버전: `2.4.7`
  - 주요 스크립트:
    - `granite dev`
    - `ait build`
    - `ait deploy`
- `granite.config.ts`
  - 앱 이름, 표시 이름, 브랜드 색상, 아이콘, dev/build 명령, 권한, output 경로 설정

### AI 개발 지원

- 공식 LLM 문서
  - `https://developers-apps-in-toss.toss.im/llms.txt`
  - `https://developers-apps-in-toss.toss.im/llms-full.txt`
- 공식 MCP/AX CLI
  - 설치 명령: `brew tap toss/tap && brew install ax`
  - MCP 실행: `ax mcp start`
  - 문서 검색: `ax search docs --query "검색어" --limit 5`
  - 예제 목록: `ax list examples`
- Apps in Toss Skills
  - `create-ait-app --skills --ai claude`로 프로젝트 안에 `CLAUDE.md`, `docs/skills/apps-in-toss.md`, `docs/skills/tds-mobile.md` 생성 가능

### 디자인

- TDS WebView 패키지
  - `@toss/tds-mobile`
  - `@toss/tds-mobile-ait`
  - 비게임 미니앱은 TDS 사용 필수로 보고 진행
- 앱빌더
  - 콘솔에 앱 등록 후 워크스페이스의 `디자인` 메뉴에서 사용
- 피그마/TDS 문서
  - `https://tossmini-docs.toss.im/tds-mobile/llms-full.txt`
- 그래픽 리소스
  - 약 7,000개 이상의 토스 아이콘/이모지
  - 앱 화면 UI 용도에는 사용 가능하나 앱 로고/썸네일에는 사용 제한 있음
  - 토스트(AI 이미지 생성 툴) 결과물은 실제 사용 전 승인 필요

### 수익화/성장 SDK

- 인앱 광고
  - 전면형/보상형: `loadFullScreenAd`, `showFullScreenAd` 계열 또는 기존 `GoogleAdMob.loadAppsInTossAdMob`, `showAppsInTossAdMob`
  - 배너 광고 WebView 지원
  - 테스트용 배너 광고 ID 예시:
    - `ait-ad-test-banner-id`
    - `ait-ad-test-native-image-id`
  - 주의: 일부 광고는 샌드박스 앱에서 테스트 불가, 콘솔 QR 테스트 필요
- 공유
  - `share({ message })`
  - 테스트/퀴즈 결과 공유에 사용
- 저장소
  - `Storage.getItem`, `Storage.setItem`, `Storage.removeItem`
  - 연속 참여, 결과 저장, 재방문 루프에 사용
- 기타 필요 시
  - 로그인/유저 식별키
  - 푸시/스마트 발송
  - 인앱 결제
  - 토스페이
  - 게임센터
  - 위치/카메라/앨범/연락처/햅틱/클립보드

## 2. 로컬 환경 점검 결과

- OS: macOS Darwin arm64
- Node: `v24.14.1`
- npm: `11.11.0`
- Homebrew: `5.1.8`
- Git: `2.50.1`
- Claude Code: `2.1.126`
- `pnpm`, `yarn`: 미설치
  - 현재는 npm 기준으로 진행한다.

## 3. 완료한 세팅

### AX CLI 설치

```bash
brew tap toss/tap && brew install ax
```

확인:

```bash
ax version
# 0.5.1 (974cb17)
```

### Claude Code MCP 연결

```bash
claude mcp add --transport stdio apps-in-toss ax mcp start
```

결과:

- 로컬 Claude Code 설정에 `apps-in-toss` MCP 서버 추가됨
- 수정 파일: `/Users/jinsik/.claude.json`

### Cursor MCP 설정 파일 생성

생성 파일:

- `.cursor/mcp.json`

내용:

```json
{
  "mcpServers": {
    "apps-in-toss": {
      "command": "ax",
      "args": ["mcp", "start"]
    }
  }
}
```

### 1호 앱 스캐폴드 생성

생성 위치:

- `apps/money-leak-test`

실행 명령:

```bash
mkdir -p apps
npx create-ait-app apps/money-leak-test --inline --pm npm --tds --skills --ai claude --sample iaa
```

포함 옵션:

- TDS 설치
- Claude용 AI Skills 파일 생성
- 인앱 광고 예제 코드 추가
- npm 의존성 설치

수정한 설정:

- `apps/money-leak-test/granite.config.ts`
  - `appName`: `money-leak-test`
  - `displayName`: `돈 새는 구멍 테스트`
  - `primaryColor`: `#3182F6`

## 4. 검증 결과

### AX 문서 검색 검증

```bash
ax search docs --query "인앱 광고" --limit 5
```

정상 동작 확인. 인앱 광고, 배너 광고, 전면/보상형 광고 문서 검색됨.

### 공식 예제 목록 검증

```bash
ax list examples
```

확인된 주요 예제:

- `weekly-todo-react`
- `with-rewarded-ad`
- `with-interstitial-ad`
- `with-in-app-purchase`
- `with-game`
- `with-share-text`
- `with-share-link`
- `with-storage`
- `with-haptic-feedback`
- `with-platform-os`
- `with-operational-environment`

### 1호 앱 빌드 검증

```bash
cd apps/money-leak-test
npm run build
```

결과:

- 빌드 성공
- 생성 아티팩트: `money-leak-test.ait`
- 최신 확인 deploymentId: `019de822-6c83-7a68-b8cd-5c8b38cb19d9`

## 5. 주의사항/이슈

### npm audit 경고

`create-ait-app`로 생성한 공식 스택에서 `npm audit` 기준 취약점 경고가 있다.

- 총 22개 취약점 표시
- 일부는 `@apps-in-toss/web-framework`, `@granite-js`, React Native 호환성 의존성에서 발생
- `npm audit fix --force`는 `@apps-in-toss/web-framework@1.14.1`로 다운그레이드하는 breaking change를 제안하므로 실행하지 않는 것이 안전하다.
- `npm audit fix`는 npm 내부 오류 `Cannot read properties of null (reading 'children')`로 실패했지만, 앱 빌드는 정상 성공했다.

초기 MVP 단계에서는 공식 최신 `@apps-in-toss/web-framework@2.4.7` 유지가 맞다. 배포 전에는 공식 SDK 업데이트 여부를 다시 확인한다.

### 생성 경로 관련 보정

`npx create-ait-app apps/money-leak-test ...`처럼 경로를 넘기면 초기 `granite.config.ts`의 `appName`이 `apps/money-leak-test`로 잡혔다. 앱인토스 딥링크/식별키에는 슬래시가 부적절하므로 `money-leak-test`로 수정했다.

## 6. 다음 작업

1. `apps/money-leak-test`를 공통 템플릿 구조로 바꾼다.
2. 공식 예제 중 아래를 우선 참고한다.
   - 광고: `with-rewarded-ad`, `with-interstitial-ad`
   - 공유: `with-share-text`, `with-share-link`
   - 저장: `with-storage`
   - 시스템: `with-platform-os`, `with-operational-environment`
3. 공통 컴포넌트/SDK 래퍼를 만든다.
   - `QuestionCard`
   - `ResultCard`
   - `AdSlot`
   - `RewardedAdGate`
   - `ShareButton`
   - `storage.ts`
   - `ads.ts`
   - `analytics.ts`
4. 1호 앱 `돈 새는 구멍 테스트` 콘텐츠 JSON을 만든다.
5. 빌드/샌드박스/콘솔 QR 테스트 루프를 만든다.

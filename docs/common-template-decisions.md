# 공통 템플릿 결정 기록

## 현재 결정

- 1차 템플릿은 WebView + React + TDS 기반으로 간다.
- 1호 앱은 `apps/money-leak-test`에서 시작한다.
- 테스트형 앱은 `질문 데이터 + 결과 유형 데이터 + 점수 계산 함수 + 결과 화면`을 분리한다.
- 광고는 첫 진입/질문 중간보다 결과 생성 직전, 결과 하단, 상세 처방 더 보기 지점에 둔다.
- 1호 MVP에서는 결과 상세 처방 버튼을 보상형 광고 연결 지점으로 쓰고, 광고 미지원 환경에서는 콘텐츠를 바로 열어 앱 흐름을 보존한다.
- 개발용 인앱광고 테스트 화면은 `pages/InAppAdsPage.tsx`에 유지하고, 실제 사용자 흐름에서는 작은 개발 링크로만 접근시킨다.
- 공유는 우선 `navigator.share`를 쓰고 미지원 시 공유 문구 복사 + TDS toast로 대체한다. Apps in Toss 공유 SDK 래퍼는 공통화 단계에서 분리한다.
- 프로덕션 빌드에서는 개발용 인앱광고 테스트 링크를 숨기고, 개발 모드에서만 노출한다.
- 보상형 광고가 로드된 경우 상세 처방은 광고 보상 이벤트 이후 열고, 광고 미지원/미로드 환경에서는 앱 흐름을 막지 않도록 바로 열어준다.

## 예정 구조

```txt
src/
  data/
    testContent.ts
  components/
    HeroSection.tsx
    QuestionCard.tsx
    ProgressBar.tsx
    ResultCard.tsx
    AdSlot.tsx
    ShareButton.tsx
  lib/
    scoring.ts
    ads.ts
    share.ts
  pages/
    InAppAdsPage.tsx
```

## 아직 미정

- 여러 앱을 각자 `create-ait-app`으로 만들지, 공통 패키지/복제 스크립트를 만들지.
- 광고그룹 ID 환경변수 관리 방식.
- 공유 SDK 실제 API 래퍼 방식.
- 앱별 아이콘/OG 이미지 자동 생성 방식.

## 2호 앱 복제 시 우선 교체 파일

- `src/App.tsx`: 앱명, 후킹 카피, 질문 데이터, 결과 프로필, 공유 문구
- `src/App.css`: 앱별 톤이 필요할 때만 색상 일부 교체
- `granite.config.ts`: `appName`, `displayName`, `primaryColor`, `icon`

## 재방문/상위노출 전략 결정

- 1호 앱 `돈 새는 구멍 테스트`는 빠른 출시 검증용이라 일회성 테스트형으로 유지한다.
- 2호 앱부터는 상위권 체류를 위해 “매일 들어와서 다른 것을 하는” 구조를 기본 요구사항으로 둔다.
- 우선 고려할 반복 루프: 오늘의 문제/미션, 데일리 수집판, 연속 출석/스트릭, 날짜별 결과 카드, 광고 보고 추가 힌트/꾸미기/배지 열기.
- 현금성 리워드처럼 보이는 보상은 피하고, 습관/수집/꾸미기/정보/체크리스트 보상으로 설계한다.

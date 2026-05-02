# 공통 템플릿 결정 기록

## 현재 결정

- 1차 템플릿은 WebView + React + TDS 기반으로 간다.
- 1호 앱은 `apps/money-leak-test`에서 시작한다.
- 테스트형 앱은 `질문 데이터 + 결과 유형 데이터 + 점수 계산 함수 + 결과 화면`을 분리한다.
- 광고는 첫 진입/질문 중간보다 결과 생성 직전, 결과 하단, 상세 처방 더 보기 지점에 둔다.

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

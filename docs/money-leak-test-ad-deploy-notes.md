# 1호 앱 승인 후 광고/배포 운영 메모

대상 앱: `apps/01-money-leak-test`
작성일: 2026-05-04

## 1. 먼저 구분해야 할 값

Apps in Toss 승인 후 받는 값은 보통 두 종류가 섞여 헷갈릴 수 있다.

### 배포 API 키

용도:
- `.ait` 번들을 CLI로 업로드/배포할 때 사용한다.

사용 위치:
- 터미널 환경 변수 또는 비밀 저장소
- 절대 코드/문서/git에 저장하지 않는다.

예:

```bash
export AIT_DEPLOY_API_KEY="[REDACTED]"
cd apps/01-money-leak-test
npx ait deploy --api-key "$AIT_DEPLOY_API_KEY" -m "광고 연동 테스트 후보"
```

또는 CLI 토큰 저장 방식:

```bash
npx ait token add
npx ait deploy -m "광고 연동 테스트 후보"
```

### 광고 그룹 ID

용도:
- 앱 안에서 어떤 광고를 로드/노출할지 지정한다.
- 리워드 광고/전면 광고/배너 광고별로 콘솔에서 광고 그룹을 만들어 발급받는다.

사용 위치:
- Vite 환경 변수
- 예: `VITE_TOSS_REWARDED_AD_GROUP_ID`

앱 코드에는 실제 광고 그룹 ID를 하드코딩하지 않는다.

## 2. 1호 앱 현재 광고 구조

현재 1호 앱 `money-leak-test`에는 이미 리워드 광고 hook이 있다.

파일:
- `src/hooks/useInAppAds.tsx`
- `src/App.tsx`

구조:
- `loadFullScreenAd`로 광고 로드
- `showFullScreenAd`로 광고 표시
- `userEarnedReward` 이벤트가 온 뒤에만 상세 루틴/배지/공유 보너스를 연다.
- `rewardCount`로 중복/오래된 보상 이벤트를 방지한다.
- 로컬/미지원 환경에서는 fallback으로 QA를 계속할 수 있다.

즉, 1호 앱은 광고를 새로 처음부터 붙이는 상태가 아니라 `테스트 광고 ID → 실제 광고 그룹 ID`로 바꾸면 되는 상태다.

## 3. 실제 광고 붙이는 순서

1. Apps in Toss 콘솔에서 1호 앱 선택
2. 광고 메뉴에서 광고 그룹 생성
3. 초기 추천:
   - 리워드 광고 1개: 결과 상세 루틴/배지/공유 보너스 잠금 해제용
   - 배너 광고는 2차로 추가. 1차는 리워드 광고부터 검증한다.
4. 발급된 `리워드 광고 그룹 ID`를 로컬 `.env.local`에 저장

```bash
cd apps/01-money-leak-test
cp .env.example .env.local
# .env.local 안의 VITE_TOSS_REWARDED_AD_GROUP_ID를 실제 광고 그룹 ID로 교체
```

5. 빌드

```bash
npm run lint
npm run build
```

6. CLI 업로드

```bash
npx ait deploy --api-key "$AIT_DEPLOY_API_KEY" -m "1호 앱 리워드 광고 그룹 ID 반영"
```

7. 콘솔 테스트/QR로 토스앱 실기기 확인

확인할 것:
- 결과 화면에서 광고 CTA 노출
- 광고 로드 여부
- 광고 시청 완료 후에만 상세 루틴/배지/공유 보너스 unlock
- 광고 닫기/실패 시 앱이 멈추지 않는지
- 동일 CTA 반복 시 보상 이벤트가 중복 처리되지 않는지

## 4. 현재 코드 변경 사항

`src/App.tsx`의 리워드 광고 그룹 ID는 이제 환경 변수로 읽는다.

```ts
const DETAIL_AD_GROUP_ID =
  import.meta.env.VITE_TOSS_REWARDED_AD_GROUP_ID ?? "ait-ad-test-rewarded-id";
```

로컬에서는 `.env.local`에 실제 값을 넣고, 값이 없으면 테스트 ID를 사용한다.

## 5. 배너 광고는 언제 붙일까

바로 붙일 수는 있지만, 추천은 리워드 광고 실기기 검증 후다.

이유:
- 리워드 광고는 수익과 기능 unlock이 직접 연결되어 우선순위가 높다.
- 배너는 화면 밀림/CTA 가림/모바일 safe-area 문제가 생길 수 있어 별도 QA가 필요하다.

배너 추천 위치:
- 홈 CTA 아래 1개
- 결과 요약과 리워드 티켓 사이 1개

## 6. 주의

- 배포 API 키, 광고 그룹 ID, 콘솔 토큰은 채팅/문서/git에 원문 저장하지 않는다.
- 광고 CTA 문구는 현금/포인트 보상처럼 보이면 안 된다.
- 안전한 문구:
  - `광고 보고 상세 루틴 열기`
  - `광고 보고 오늘 배지 받기`
  - `광고 보고 공유 보너스 루틴 열기`
- 실제 Toss 포인트/현금성 보상은 연동 전까지 절대 약속하지 않는다.

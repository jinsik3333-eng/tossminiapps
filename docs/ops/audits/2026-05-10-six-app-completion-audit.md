# 2026-05-10 1~6호 앱 완료 감사

## 목표 재정의

사용자 목표: `6개 앱 모두 기획, 구현을 마치면 검수 리뷰 후 재구현까지 마무리해둘것`

완료로 인정할 구체 기준:
1. 1~6호 일반앱의 기획/콘텐츠/등록 정보가 준비되어 있다.
2. 1~6호 앱 구현이 리워드 허브형 수익화 구조를 포함한다.
3. 광고 그룹 ID와 공유 리워드 ID가 로컬 env에 주입되어 있다.
4. 앱 등록 자산 규격이 충족된다.
5. lint/build가 통과한다.
6. Toss 실기기에서 배너, 리워드 영상, 공유 리워드, 보상 콜백이 동작한다.
7. 실기기 검수에서 발견된 문제를 재구현하고 다시 검증한다.

## 프롬프트-아티팩트 체크리스트

| 요구/게이트 | 증거 | 상태 |
| --- | --- | --- |
| 6개 앱 폴더가 넘버링되어 관리됨 | `apps/01-money-leak-test` ~ `apps/06-receipt-monster-catcher` | 완료 |
| 앱 이름/앱 ID 구성 | 각 앱 `granite.config.ts`의 `appName`, `brand.displayName`, `brand.icon` 확인 | 완료 |
| 광고 env 주입 | `scripts/check_ad_env.py` 결과 1~6호 `VITE_TOSS_BANNER_AD_GROUP_ID`, `VITE_TOSS_REWARDED_AD_GROUP_ID`, `VITE_TOSS_CONTACTS_VIRAL_MODULE_ID` 모두 set | 완료 |
| 리워드 허브 구조 | 각 앱 `src/App.tsx`에 `RewardHub`, `NotificationRewardSheet`, `StickyRewardCTA` 사용 | 완료 |
| 리워드 영상 광고 연결 | 각 앱 `src/App.tsx`에 `useInAppAds(REWARDED_AD_GROUP_ID)` 사용 | 로컬 연결 완료 / 실기기 콜백 미검증 |
| 배너 광고 연결 | 1,2,5,6호 기존 연결 + 3,4호 `BannerAd` wrapper를 `TossBannerAd`로 수정 | 로컬 연결 완료 / 실기기 노출 미검증 |
| 공유 리워드 연결 | 각 앱 `openContactsViralReward`와 `VITE_TOSS_CONTACTS_VIRAL_MODULE_ID` 사용 | 로컬 연결 완료 / 실기기 contactsViral 미검증 |
| 친구 추천 유인 | CTA `친구 추천하고 보상 받기`, 토스트 `친구 추천 완료! ...` 적용 | 완료 |
| 알림 UI | 각 앱 `NotificationRewardSheet`, 상단/허브 알림 버튼 사용 | UI 완료 / 서버 기반 푸시 구독 저장 없음 |
| 앱 등록 이미지 600×600 | 1~6호 `public/app-icon.png`, `app-logo.png`, `app-logo-dark.png` 모두 600×600 검사 통과 | 완료 |
| 썸네일 1932×828 | 1~6호 `public/thumbnail.png` 모두 1932×828 검사 통과 | 완료 |
| 스크린샷 최소 규격 | 1~6호 `public/screenshots`: 세로 636×1048 3장, 가로 1504×741 1장 검사 통과 | 완료 |
| lint | 1~6호 `npm run lint` 성공 | 완료 |
| test | 2호 `npm test` / Vitest 1 file, 4 tests passed. 나머지 앱은 test script 없음 | 가능한 범위 완료 |
| build | 1~6호 `npm run build` 성공. 최신 전체 빌드 ID는 세션 로그 참조, 1호 자산 보강 후 빌드 `019e10bd-8525-7e0e-a040-7a575a2b3319` | 완료 |
| 검수 리뷰 후 재구현 | 3/4호 배너 placeholder 누락, 미사용 함수, 1호 등록 자산 누락을 재구현/보강 | 부분 완료 |
| Toss 실기기 최종 검수 | 배너 실제 노출, 리워드 영상 완료 콜백, contactsViral 완료 이벤트, 375~390px 화면 밀도 | 미완료 |

## 최신 로컬 검증 명령

```bash
scripts/check_ad_env.py
for app in apps/0{1,2,3,4,5,6}-*; do (cd "$app" && npm run lint); done
for app in apps/0{1,2,3,4,5,6}-*; do (cd "$app" && npm run build); done
(cd apps/02-daily-waste-quiz && npm test)
```

자산 규격 검사 결과:

```txt
asset check passed: 1~6 logos/thumbnails/screenshots sizes valid
```

## 완료 아님 판정

목표는 아직 완료가 아니다. 이유:
- 실제 Toss 앱에서 배너 광고가 렌더링되는지 확인하지 못했다.
- 리워드 영상 광고 완료 콜백을 확인하지 못했다.
- contactsViral 공유 리워드 화면과 추천 완료 이벤트를 확인하지 못했다.
- 375~390px 실기기 화면 밀도와 딥링크 이동을 확인하지 못했다.

## 다음 검수 순서

1. 콘솔 최신 AIT 업로드/테스트 버튼으로 1~6호 실행.
2. 각 앱 결과 화면에서 배너 광고 실제 노출 확인.
3. `광고 보고 ...` CTA로 리워드 영상 노출 및 완료 후 보상 루틴 오픈 확인.
4. `친구 추천하고 보상 받기`로 contactsViral 화면 및 추천 완료 이벤트 확인.
5. 375~390px 실기기에서 리워드 허브, 2열 서비스 카드, sticky CTA 밀도 확인.
6. 실패 항목만 재구현 후 lint/build/실기기 재검증.

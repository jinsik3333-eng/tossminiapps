# 2026-05-11 — 아이콘/썸네일 사각형 반려 대응

## 반려 사유

Apps in Toss 콘솔 반려 문구:

> 앱 아이콘 및 썸네일은 크롭되지 않으며 배경색이 포함된 꽉 찬 사각형 형태로 제출 부탁드립니다.

## 적용 범위

- 1호 `money-leak-test`
- 2호 `daily-waste-quiz`
- 3호 `salary-thief-finder`
- 4호 `spending-defense-roulette`
- 5호 `subscription-ghost-finder`
- 6호 `receipt-monster-catcher`

## 수정 기준

- 앱 아이콘: 600×600, RGB, 투명 픽셀 0개, 배경색이 포함된 꽉 찬 사각형
- 라이트 앱 로고: 600×600, RGB, 투명 픽셀 0개, 배경색이 포함된 꽉 찬 사각형
- 다크모드 앱 로고: 600×600, RGB, 투명 픽셀 0개, 배경색이 포함된 꽉 찬 사각형
- 썸네일: 1932×828, RGB, 투명 픽셀 0개, 캔버스 전체가 불투명 사각형

## 콘솔 업로드 파일

콘솔에는 아래 `assets/app-store` 파일을 우선 업로드한다.

| 앱 | 앱 로고 | 다크모드 앱 로고 | 썸네일 |
| --- | --- | --- | --- |
| 1호 돈 새는 구멍 테스트 | `assets/app-store/money-leak-test/app-logo-600.png` | `assets/app-store/money-leak-test/app-logo-dark-600.png` | `assets/app-store/money-leak-test/thumbnail-1932x828.png` |
| 2호 오늘의 헛돈 방지 퀴즈 | `assets/app-store/daily-waste-quiz/app-logo-600.png` | `assets/app-store/daily-waste-quiz/app-logo-dark-600.png` | `assets/app-store/daily-waste-quiz/thumbnail-1932x828.png` |
| 3호 월급 도둑 찾기 | `assets/app-store/salary-thief-finder/app-logo-600.png` | `assets/app-store/salary-thief-finder/app-logo-dark-600.png` | `assets/app-store/salary-thief-finder/thumbnail-1932x828.png` |
| 4호 소비 방어 룰렛 | `assets/app-store/spending-defense-roulette/app-logo-600.png` | `assets/app-store/spending-defense-roulette/app-logo-dark-600.png` | `assets/app-store/spending-defense-roulette/thumbnail-1932x828.png` |
| 5호 구독 유령 탐지기 | `assets/app-store/subscription-ghost-finder/app-logo-600.png` | `assets/app-store/subscription-ghost-finder/app-logo-dark-600.png` | `assets/app-store/subscription-ghost-finder/thumbnail-1932x828.png` |
| 6호 영수증 몬스터 잡기 | `assets/app-store/receipt-monster-catcher/app-logo-600.png` | `assets/app-store/receipt-monster-catcher/app-logo-dark-600.png` | `assets/app-store/receipt-monster-catcher/thumbnail-1932x828.png` |

## 검증

- 1~6호 `public/app-icon.png`, `public/app-logo.png`, `public/app-logo-dark.png`, `public/thumbnail.png` 모두 규격/불투명 검사 통과.
- 1~6호 `assets/app-store/*` 콘솔 업로드용 로고/썸네일 모두 규격/불투명 검사 통과.
- 빌드 검증 결과는 같은 커밋의 터미널 로그와 최종 보고에 남긴다.


## 재빌드 결과

1~6호 전체 `npm run build` 성공.

| 앱 | deploymentId |
| --- | --- |
| 1호 `money-leak-test` | `019e16d0-19ac-7a1e-9c74-e86354995425` |
| 2호 `daily-waste-quiz` | `019e16d0-435c-7559-8d56-bd36dc51f2ab` |
| 3호 `salary-thief-finder` | `019e16d0-6944-7051-8ff0-d991ce62623d` |
| 4호 `spending-defense-roulette` | `019e16d0-90ad-7fde-b815-07d48a1dd1af` |
| 5호 `subscription-ghost-finder` | `019e16d0-be65-7648-a771-4abd0c65790b` |
| 6호 `receipt-monster-catcher` | `019e16d0-e596-76cf-beb2-9884978ea3df` |

## 남은 확인

- Toss 콘솔 수정 화면에서 위 콘솔 업로드 파일을 다시 선택한 뒤 검토 요청한다.
- 실기기 테스트에서 앱 홈/결과 화면과 광고/공유 리워드 동작은 기존 체크리스트대로 다시 확인한다.

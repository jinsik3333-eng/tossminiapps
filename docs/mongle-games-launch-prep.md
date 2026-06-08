# 07~12 몽글 게임 출시 준비 패킷

작성일: 2026-05-29

## 범위

대상은 6개 게임 미니앱이다.

| 앱 | appName | 포트 | 최신 `.ait` | 압축해제 크기 | 최신 build deploymentId |
| --- | --- | ---: | --- | ---: | --- |
| 몽글 매치 퍼즐 | `mongle-match-puzzle` | 5180 | `apps/07-mongle-match-puzzle/mongle-match-puzzle.ait` | 26,604,243 bytes | `019e7bed-fafe-7063-bd34-ecaf50f3e2f5` |
| 몽글 디펜스 | `mongle-defense` | 5181 | `apps/08-mongle-defense/mongle-defense.ait` | 26,510,337 bytes | `019e70f1-2e4b-791d-9508-c647b5ce23f2` |
| 도망 몽글 | `mongle-run` | 5182 | `apps/09-mongle-run/mongle-run.ait` | 23,700,641 bytes | `019e712e-be96-70a3-b6ae-a7d21e76dd18` |
| 1초 탐정 몽글 | `mongle-detective` | 5183 | `apps/10-mongle-detective/mongle-detective.ait` | 23,720,630 bytes | `019e712e-be96-7079-ac8b-5f240d547fe8` |
| 몽글 점프 | `mongle-jump` | 5184 | `apps/11-mongle-jump/mongle-jump.ait` | 23,711,979 bytes | `019e712e-beb6-7099-962d-63c5e061bfb2` |
| 몽글 미로 탈출 | `mongle-maze` | 5185 | `apps/12-mongle-maze/mongle-maze.ait` | 23,730,384 bytes | `019e712e-beb6-7a27-8b0d-668fa6bc9513` |

모든 번들은 공식 출시 제한인 압축해제 기준 100MB 이하에 들어온다.

## 로컬 스모크 QA

Computer Use로 Chrome을 열어 6개 앱을 각각 로컬 서버에서 확인했다.

| 앱 | 확인 흐름 | 상태 |
| --- | --- | --- |
| `mongle-match-puzzle` | 홈 -> 튜토리얼 -> 플레이 보드 -> 메뉴/상점 | 정상. 4개/5개/2x2/가로세로 동시 매치 보너스, 드롭 후 자동 연쇄 팡, 가능한 수 0개 보드 자동 셔플, 아이콘형 아이템/상점/메뉴, 결과 배너/보상형 광고 CTA를 추가하고 390px에서 재검증했다. |
| `mongle-defense` | 홈 -> 준비 -> 플레이 -> 결과 | 정상. HUD, lane, 몬스터 버튼, 결과 CTA 표시 확인. |
| `mongle-run` | 홈 -> 플레이 -> 결과 | 정상. 좌/우 두 버튼 조작, 별/무지개 획득 및 충돌/아슬 회피 임팩트, 단계 레일, 하단 광고 슬롯 확인. |
| `mongle-detective` | 홈 -> 플레이 -> 결과 | 정상. `도둑 몽글을 찾는 게임` 규칙, case brief, 카드 선택 피드백, 다음 사건 단계 레일 확인. |
| `mongle-jump` | 홈 -> 점프 입력 | 정상. 다음 구름/구름층 단계, 캐릭터 착지 장면, 점프 버튼, 하단 광고 슬롯 확인. |
| `mongle-maze` | 홈 -> 이동 입력 | 정상. `열쇠 → 조각 → 출구` legend, 미로 구간 단계, 방향 버튼, 하단 광고 슬롯 확인. |

## 출시 자산

각 앱별 콘솔 업로드 자산은 `assets/app-store/{appName}/`에 준비했다.

- `app-logo-600.png`: 600x600 PNG, 불투명
- `app-logo-dark-600.png`: 600x600 PNG, 불투명
- `thumbnail-1932x828.png`
- `screenshot-01-636x1048.png`
- `screenshot-02-636x1048.png`
- `screenshot-03-636x1048.png`
- `screenshot-horizontal-1504x741.png`
- `contact-sheet.png`
- `{appName}-appstore-assets.zip`

각 앱의 `public/`에도 런타임 확인용 `app-icon.png`, `app-logo.png`, `app-logo-dark.png`, `thumbnail.png`, `screenshots/`를 복사했다.

재생성 명령:

```bash
python3 scripts/create_mongle_game_appstore_assets.py
python3 scripts/check_store_assets.py '0[7-9]-*' '1[0-2]-*'
```

검증 결과: 6개 앱 모두 로고, 썸네일, 세로 스크린샷 3장, 가로 스크린샷 1장, zip 번들 규격 통과.

## 코드/설정 상태

- 6개 앱 모두 `webViewProps.type = "game"` 및 `overScrollMode = "never"` 설정 완료.
- 6개 앱 모두 `brand.icon = https://{appName}.apps.tossmini.com/app-icon.png` 형식으로 설정 완료.
- `mongle-match-puzzle`와 `mongle-defense`의 빈 `brand.icon`을 채웠다.
- `mongle-match-puzzle`, `mongle-run`~`mongle-maze`는 `TossBannerAd` 하단 배너와 결과 이후 보상형 광고 CTA를 사용한다. 실제 광고 그룹 ID는 `VITE_TOSS_BANNER_AD_GROUP_ID`, `VITE_TOSS_REWARDED_AD_GROUP_ID`로 주입한다.
- `mongle-run`~`mongle-maze`는 imagegen 기반 캐릭터 PNG를 `public/game-assets/`에 포함하고, 앱별 플레이 보드에서 사용한다.
- 광고 SDK가 붙기 전 사용자 화면에 노출되던 `광고 보고` CTA/placeholder는 `mongle-match-puzzle`에서 제거했고, 실제 ID가 없으면 연습 보너스 fallback만 보이게 했다.
- 소스/앱 디렉터리 검색에서 출시 차단용 `ait-ad-test` 문자열은 남아 있지 않다.

## 2026-05-31 추가 QA: 07 손맛/광고 보강

- 정적 회귀: `npm run test:logic`으로 4개 매치, 5개 매치, 가로세로 동시 매치 망치 지급, 드롭 후 캐스케이드 제거, 가능한 수 0개 보드 자동 셔플, 망치 사용 보드 리필을 확인했다.
- 코드 검증: `npm run lint && npm run build` 통과. `mongle-match-puzzle.ait` deploymentId는 `019e7bd4-b086-786b-a486-dde531fabdf5`.
- 모바일 QA: 5180 포트 in-app Browser 390x844에서 홈 -> 튜토리얼 -> 플레이 보드 진입, 망치 x0 안내, 하단 4버튼 레이아웃, 가로 스크롤 없음 확인.
- 로컬 브라우저 한정 주의: Toss native safe-area handler가 없어 TDS Provider 콘솔 경고가 날 수 있다. 앱 렌더링/플레이는 정상이며 Toss shell 실기기에서 광고 노출과 reward 콜백을 별도 확인한다.

## 2026-05-31 추가 QA: 07 아이템/메뉴/디자인 확장

- 정적 회귀: `npm run test:logic`으로 가로 4개 `↔️`, 세로 4개 `↕️`, 2x2 `💣`, 5줄 `🌈`, 줄 삭제/같은 블록 삭제 아이템 사용을 확인했다.
- 코드 검증: `npm run lint && npm run build` 통과. `mongle-match-puzzle.ait` deploymentId는 `019e7bed-fafe-7063-bd34-ecaf50f3e2f5`.
- 번들: `.ait` 압축해제 크기는 26,604,243 bytes로 100MB 제한 안쪽이다.
- 모바일 QA: headless Chrome 390x844에서 홈 CTA/메뉴가 첫 화면에 보이고, 플레이 보드는 340px, 아이템 독은 340px/버튼 53px, 가로 스크롤 없음 확인. 메뉴 모달도 폭 넘침 없이 다시하기/스테이지/토너먼트/랭킹/상점/사운드/조작법이 보인다.
- 디자인 QA: 블록을 요요/풍선/꿀단지/수정구/비행접시 계열로 바꾸고, 갈색 80% 외곽선, 유광 엠보 버튼, 레이어형 정글 배경, 팝 스파크/보드 플래시 애니메이션을 적용했다.

## 2026-05-29 추가 QA: 09~12 재미/광고 보강

- 정적 회귀: `python3 scripts/check_mongle_game_upgrade.py` 통과.
- 코드 검증: `mongle-run`, `mongle-detective`, `mongle-jump`, `mongle-maze` 각각 `npm run lint && npm run build` 통과.
- 로컬 서버: 5209~5212 포트에 띄워 Computer Use로 Chrome 스모크 QA를 수행했다.
- 모바일 스크린샷: `tmp/qa/mongle-games/`에 home/play full-page PNG와 `play-contact-sheet.png`를 남겼다.
- 로컬 브라우저 한정 주의: Toss native safe-area handler가 없어 TDS Provider에서 콘솔 경고가 날 수 있다. 앱 렌더링/플레이는 정상이며 Toss shell 실기기에서 별도 확인한다.

## 2026-05-29 추가 QA: 09~12 레벨/탐정 난이도 보강

- 정적 회귀: `python3 scripts/check_mongle_game_upgrade.py` 통과. 단계 데이터 배열과 탐정 복합 단서 로직, 고정 `thief` 판별 제거를 확인한다.
- 코드 검증: `mongle-run`, `mongle-detective`, `mongle-jump`, `mongle-maze` 각각 `npm run lint && npm run build` 통과.
- 새 레벨 설계: 러너는 속도/스폰/위험도, 점프는 안전구간/퍼펙트존/황금 구름 주기, 미로는 맵/열쇠/조각/함정 위치가 단계별로 달라진다.
- 탐정 설계: X 표식 단일 클릭이 아니라 색상+표식+소품+표정 조합을 사건마다 맞추는 방식으로 바꿨다.
- 모바일 QA: 5209~5212 포트에서 Playwright 390x844 클릭 QA를 수행했고 `.omx/artifacts/mongle-qa/`에 앱별 play 스크린샷을 남겼다.
- Computer Use 주의: 이번 반복에서는 Chrome 창이 떠 있어도 Computer Use가 `cgWindowNotFound`, Finder 캡처가 timeout으로 실패했다. 이전 QA 기록과 별개로 이번 변경 검증은 자동 브라우저 QA 결과를 기준으로 한다.

## 콘솔에서 남은 작업

로컬 준비는 끝났지만 아래는 Toss 콘솔/실기기 권한이 필요한 외부 작업이라 직접 제출하지 않았다.

1. 앱 정보 등록
   - 앱 이름, `appName`, 앱 유형을 코드와 일치시킨다.
   - 콘솔 로고에는 `assets/app-store/{appName}/app-logo-600.png`를 업로드한다.
   - 썸네일과 스크린샷은 같은 폴더의 규격 파일을 업로드한다.
2. 게임 설정
   - 게임 리더보드를 앱별로 생성한다.
   - 실제 리더보드가 승인 전에는 `LeaderBoard not found`가 날 수 있으므로 샌드박스 테스트 결과와 구분한다.
   - 샌드박스 점수는 실제 리더보드에 반영되지 않는다.
3. 등급/정책 증빙
   - 게임 등급분류 증빙을 앱별로 준비해 콘솔에 등록한다.
   - 현금/포인트/캐시/당첨/보장성 카피가 없는지 최종 화면을 다시 본다.
4. 테스트 및 출시 요청
   - `.ait` 업로드 후 콘솔 테스트를 최소 1회 완료한다.
   - QR/토스앱 실기기에서 프로필, 점수 제출, 리더보드 열기/복귀, 세션 유지, 네트워크/CORS를 확인한다.
   - 검토 요청 후 일반적으로 최대 영업일 3일 검토 시간을 예상한다.

## 참고 공식 문서

- 미니앱 출시: https://developers-apps-in-toss.toss.im/development/deploy.md
- 콘솔에서 앱 등록하기: https://developers-apps-in-toss.toss.im/prepare/console-workspace.md
- 게임 프로필 & 리더보드: https://developers-apps-in-toss.toss.im/game-center/develop.md
- 게임 검수 체크리스트: https://developers-apps-in-toss.toss.im/checklist/app-game.md

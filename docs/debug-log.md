# Debug Log

## 2026-05-04 — `몽글 매치 퍼즐` 초기 빌드

- 처리: `receipt-monster-catcher` 최신 seed를 복사해 `apps/07-mongle-match-puzzle` 생성 후 앱명/포트/브랜드/소스 전체를 게임형으로 교체했다.
- 빌드: `npm install && npm run build` 성공. 산출물 `mongle-match-puzzle.ait`, deploymentId `019df2c8-c344-773d-8ade-edc156f36f84`.
- 경고: `npm install`에서 기존과 동일하게 peer dependency 경고와 22 vulnerabilities가 표시된다. 공식 framework 호환성 때문에 `npm audit fix --force`는 실행하지 않았다.
- QA: `dist/web` 정적 서버로 홈/플레이 화면을 vision QA했다. 홈 하단 안내문 크기/대비가 약하다는 지적이 있어 `.safe-note`를 15px/진한 보라로 보정했다. 이후 랜덤 몽글 수집/유니크 점수 보너스 메시지, 도감 슬롯, 플레이 HUD/광고 CTA를 390px 모바일 기준으로 재확인했다. 100종 전환 후에도 홈에서 `0/100종 수집`, `1% 유니크`, 대표 도감 `+89`가 잘 보이고 레이아웃 깨짐이 없음을 확인했다.
- 남은 확인: 실제 토스 게임 프로필 생성 모달, 리더보드 승인 상태, 광고 SDK, 실기기 백그라운드 복귀는 콘솔/샌드박스에서만 최종 확인 가능하다.

## 2026-05-04 — 6호 빌드 설정 이슈

- 증상: 새 앱 `receipt-monster-catcher`에서 `ait build` 실행 시 `granite build --no-cache` 옵션 오류 또는 RN 번들 누락 오류 발생.
- 원인: `granite.config.ts`를 예전 `@apps-in-toss/framework/config` 형태로 작성해 seed 앱과 다른 빌드 경로를 탔다.
- 해결: 5호와 동일하게 `@apps-in-toss/web-framework/config`의 `defineConfig` 구조, `web.commands.build: "vite build"`, `outdir: "dist"`를 명시했다.
- 추가: 새 앱 설치 시 peer dependency 충돌은 `npm ci --legacy-peer-deps` 또는 seed lockfile 유지로 처리한다. `npm audit fix --force`는 금지.

## 2026-05-04 — 몽글 100종 3D 에셋 생성

- `apps/07-mongle-match-puzzle/public/mongles/*.png` 100개 생성.
- `public/mongles/manifest.json`, `_contact-sheet.jpg` 생성.
- 홈 히어로/도감 미리보기/결과 카드에 PNG 에셋 연결.
- 390px 홈/플레이 화면 Vision QA 완료.
- `npm run lint && npm run build` 성공.
- deploymentId `019df313-d085-701c-b098-8f31a5511aeb`.

## 2026-05-04 — 몽글 premium 3D 에셋 파이프라인 재정리

- 배경: 사용자가 1차 procedural 몽글 이미지 스타일을 거부했다.
- 처리: `public/mongles`의 1차 MVP PNG/manifest/contact-sheet를 `docs/mongle-legacy-draft-assets/`로 격리하고 앱 public 번들/직접 참조를 제거했다.
- 앱: 100종 데이터 구조는 유지하되 `imageSrc`를 `/mongles/premium/{001-100}-{series}-{variant}.webp` stable path로 변경했다. premium 이미지가 아직 없을 때는 깨진 이미지/저품질 PNG fallback 대신 CSS placeholder shell을 표시한다.
- 카피: 사용자 노출 홈 문구는 제작 단계 언급 없이 `100종 몽글 도감`으로 정리했다.
- 문서: premium 3D 아트 디렉션과 100종 prompt manifest를 추가했다. 내부 제작 단계는 대표 12종 톤 확정 후 100종 확장으로 문서화했다.


## 2026-05-05 — 몽글 프리미엄 3D 이미지 100종 생성

- `gpt-image-2-high` 기반 premium Mongle 이미지 100종 생성 완료.
- 저장 위치: `apps/07-mongle-match-puzzle/public/mongles/premium/`
- 산출물: `001-*.webp` ~ `100-*.webp`, `_all-100-contact-sheet-clean.jpg`, `generation-log.jsonl`
- 총 WebP 용량: 약 2.8MB.
- Vision QA: 100종 contact sheet 기준 프리미엄 3D toy/clay/plush 톤 통과, 텍스트/로고/숫자/화폐기호/워터마크/체크보드 배경 명확한 문제 없음.
- 앱 연결: `PREMIUM_ASSETS_READY = true` 전환.
- 검증: `npm run lint && npm run build` 성공, deploymentId `019df527-0624-7b02-b0ed-53661b472da0`.
- 브라우저 QA: 홈 화면에서 premium 몽글 이미지 실제 로드 확인, 깨진 이미지/placeholder 노출 없음. 로컬 dev 환경에서 Toss SafeAreaInsets bridge 경고는 발생하나 uncaught JS error는 없음.

## 2026-05-05 — 몽글 캐릭터 피드백/스와이프 조작 보정

- 피드백: 100종 몽글이 서로 비슷하고 일부가 징그럽게 느껴진다는 의견이 있었다.
- 분석: 현재 세트는 둥근 본체·큰 눈·작은 팔다리·파스텔 팔레트가 반복되어 소품만 바뀐 변형처럼 보인다. 기존 `subscription-ghost-finder` 유령과 `salary-thief-finder` 탐정/도둑 캐릭터의 단순 얼굴, 역할 소품, 작은 사건성을 새 기준으로 잡았다.
- 문서: `apps/07-mongle-match-puzzle/docs/mongle-character-redesign.md`에 새 아트 디렉션, 피해야 할 요소, 12종 샘플 프롬프트 방향을 정리했다.
- 조작: `src/App.tsx` 보드 타일에 pointer 기반 스와이프/드래그 교체를 추가했다. 클릭-클릭 조작은 보조 방식으로 유지했다.
- CSS: `.tile`에 `touch-action: none`, `user-select: none`을 추가해 모바일 스와이프 중 화면 스크롤/선택 충돌을 줄였다.
- 검증: `npm run lint && npm run build` 성공, deploymentId `019df773-c875-74b4-b4ed-c518b70c11eb`. 로컬 Vite 브라우저에서 포인터 스와이프 이벤트 후 안내 메시지 갱신 및 JS error 없음, vision QA상 보드/버튼 가독성 양호.

## 2026-05-05 — 몽글 도감 카드 라벨/이미지 배경 보정

- 피드백: 새 몽글 샘플은 귀엽지만 이미지 배경 사각형이 카드/버튼 안에 같이 들어가 보여 아쉽고, 각 몽글 이름과 `common` 같은 희귀도 표시가 같이 필요했다.
- 처리: 홈 도감 미리보기 카드를 2열 정보형 카드로 변경하고, 몽글 이름 + `common/rare/epic/unique` pill을 표시했다. preview에는 common뿐 아니라 rare/epic/unique 대표도 포함되게 했다.
- 이미지: CSS에서 몽글 이미지를 cover가 아닌 contain/multiply/radial mask 방식으로 바꿔 카드 안 사각 배경이 덜 튀도록 완화했다. 새 샘플 4종은 임시 cutout PNG도 생성했다.
- 산출물: `public/mongles/redesign-samples/*-cutout.png`, `_redesign-sample-4-cutout-on-cards.jpg`.
- 검증: `npm run lint && npm run build` 성공, deploymentId `019df782-3f43-74c2-afb0-cd54f3e3de3e`. 브라우저 QA에서 이름+rarity 표시 확인, JS error 없음. 남은 점: 기존 baked-background 이미지는 CSS만으로 완전 제거가 어려워 최종 100종 재생성 시 투명 또는 앱 배경 매칭을 프롬프트/후처리 단계에 포함해야 한다.

## 2026-05-05 — 몽글 썸네일 표현 방향 정정

- 피드백: 배경 제거 cutout은 캐릭터 외곽/그림자가 깨져 오히려 품질이 떨어졌다. 이미지 네모 자체는 써도 되며, UI에서 어떻게 예쁘게 감싸는지가 더 중요하다.
- 처리: cutout/마스크/multiply 방식 대신 원본 정사각형 이미지를 `object-fit: cover`로 그대로 쓰고, 썸네일 컨테이너를 둥근 네모·얇은 보라 테두리·은은한 inner highlight/그림자로 카드화했다.
- 홈 도감 카드 썸네일은 58px로 키워 캐릭터 가독성을 높였다.
- 검증: `npm run lint && npm run build` 성공, deploymentId `019df789-20c3-75ef-919c-f448019a89a4`. 브라우저 vision QA에서 둥근 네모 썸네일 방식이 자연스럽고 이름+rarity와 잘 어울린다는 평가를 받았다.

## 2026-05-05 — 몽글 100종 귀여운 역할형 세트 교체/QA

- 처리: 기존 premium 100종 WebP를 `apps/07-mongle-match-puzzle/docs/asset-archive/premium-before-cute-redesign-2026-05-05/`로 아카이브하고, 승인된 4종 샘플을 production filename으로 seed한 뒤 100종 전체를 새 역할형/스토리형 몽글로 재생성했다.
- 데이터: `apps/07-mongle-match-puzzle/docs/mongle-premium-prompt-manifest.json`에 100종 이름·rarity·설명·프롬프트·assetPath를 정리하고, `src/App.tsx`를 25테마×4변형 자동 생성이 아닌 100종 개별 캐릭터 데이터로 교체했다.
- 생성: shardable/resumable 방식으로 `public/mongles/premium/001-*.webp` ~ `100-*.webp` 100개 생성 완료. manifest 기준 누락 asset 없음, `_all-100-contact-sheet-clean.jpg` 재생성 완료.
- Vision QA: 징그러움/텍스트/숫자/로고/워터마크/화폐/체크보드 문제는 발견되지 않았다. 귀여운 유령·탐정·도둑·작은 역할 캐릭터 방향은 살아있다. 다만 탐정 모자/돋보기 계열이 다소 많아 100종 전체 다양성 관점에서는 다음 보정 시 일부를 다른 직업/실루엣으로 분산하면 좋다.
- 검증: `npm run lint && npm run build` 성공, deploymentId `019df7b7-f190-7937-b0d0-02aa91773616`. 홈/플레이 브라우저 vision QA에서 이미지 로딩, 이름+rarity 카드, 보드 레이아웃 정상 확인. 로컬 dev 환경의 Toss SafeAreaInsets bridge 경고는 기존과 동일하게 console에 표시되지만 uncaught JS error는 없다.

## 2026-05-05 — 몽글 앱 정리/컨텍스트 맵 추가

- 처리: 앱 런타임에서 쓰지 않는 `public/mongles/redesign-samples/`와 실패한 cutout 산출물을 제거했다. `public/mongles/premium/`에는 실제 앱에서 로드하는 100종 WebP만 남겼다.
- 보존: QA contact sheet, sample manifest, generation log는 `docs/archive/mongle-generation-artifacts/`로 이동했다.
- 정리: `dist/`는 생성물이므로 삭제했고, 승인 대기용 `mongle-match-puzzle.ait`는 유지했다.
- 문서: 루트 `PROJECT_CONTEXT.md`와 앱별 `apps/07-mongle-match-puzzle/APP_CONTEXT.md`를 추가해 다음 작업부터 필요한 파일만 컨텍스트로 가져오도록 정리했다.
- 검증: `npm run lint && npm run build` 성공, deploymentId `019df83d-b422-7aa8-820b-6c67ed11f508`. build 검증 후 `dist/`는 다시 삭제했고 `.ait` 산출물은 유지했다.

## 2026-05-07 — 몽글 디펜스 MVP 구현/검증

- 생성: `apps/07-mongle-match-puzzle` seed를 `apps/08-mongle-defense`로 복사하되 `node_modules/dist/.ait` 제외 후, 3매치/100종 이미지 런타임 구현을 디펜스 MVP로 교체했다.
- 설정: `package.json` name `apps-mongle-defense`, `granite.config.ts` appName `mongle-defense`, displayName `몽글 디펜스`, port `5181`, `webViewProps: { type: "game", overScrollMode: "never" }` 확인.
- 구현: `src/lib/gameLogic.ts`에 30초/HP/lane/spawn/tap/combo/skill/grade 순수 로직, `src/lib/tossGameCenter.ts`에 local/sandbox/unsupported fallback과 playId 1회 제출 가드 구현.
- 검증: `npm run lint` 최초 실패 — 순수 함수 `useCloudShieldSkill`이 React hook rule에 걸림. `activateCloudShieldSkill`로 rename 후 통과.
- 최종 검증: `npm run format && npm run lint && npm run build` 성공. `ait build` 산출물 `mongle-defense.ait` 생성, deploymentId `019e0086-1d65-73ad-8e48-f3d98afd3a19`.
- 경고: Vite chunk size 500k 초과 경고와 Node DEP0190 경고가 있으나 빌드는 성공했다. 배포는 실행하지 않았다.

## 2026-05-07 — 몽글 디펜스 AI 리뷰 수정

- Claude Code 리뷰 P0/P1 반영: 홈의 개발용 랭킹/fallback/광고 슬롯 문구 제거, 광고 SDK 미연동 상태의 `광고 보고`/보너스 CTA 제거, 탭 미스 시 콤보 리셋 로직 추가, danger-line 시각 위치와 누수 기준을 84%로 일치시켰다.
- 사용자 노출 문구는 광고/현금/포인트/캐시/당첨/보장/placeholder/fallback 표현 없이 정리했다.
- 최종 검증: `npm run format && npm run lint && npm run build` 성공. `mongle-defense.ait` 재생성, deploymentId `019e0097-c45d-705d-b143-ecbaf51390b9`.

## 2026-05-07 — 몽글 디펜스 v0.2 재미 강화

- ai-dev-loop 진행: `.hermes/plans/mongle-defense-v02-ai-dev-loop.md` 작성 → OMX/Codex 구현 → Hermes 파일 검수 → Claude Code P0/P1 리뷰 → 패치 → 390px 브라우저 QA.
- 구현: 몬스터 타입 4종(common/shield/fast/bonus), 웨이브 단계(적응/콤보/피버), 오늘 웨이브 효과, 몽글 도우미 4종(sleepy/detective/thief/ghost), +점수 플로팅/콤보 milestone/구름 방패 배너, 결과 화면 다음 목표/최고점 대비/보너스 방어·놓침/조각 n/24 진행률을 추가했다.
- 리뷰 반영: sleepy 도우미가 bonus 몬스터를 완화했을 때 `bonusLeaked`가 오르는 버그를 수정했고, 시작 웨이브 배너가 30초 고정되지 않도록 자동 소멸 처리했다. 미사용 `.ad-slot`/`.bonus-button` CSS와 `로컬에서는/샌드박스에서는` 사용자 문구도 제거했다.
- QA: 홈/방어 준비/플레이/결과 390px Vision QA 완료. 몬스터 타입은 실제 플레이 중 색·형태·마크로 구분 가능, HUD/위험선/구름 방패 버튼 겹침 없음. 순간적인 `+점수` 플로팅은 코드 경로로 구현되어 있으나 스크린샷 타이밍상 vision 캡처에서는 항상 잡히지 않을 수 있다.
- 최종 검증: `npm run format && npm run lint && npm run build` 성공. `mongle-defense.ait` 재생성, deploymentId `019e01b7-7554-7a55-a98f-cad801b2a9cc`.

## 2026-05-07 — money-leak-test 토스앱 실기기 테스트 피드백 반영

- 피드백: 첫 페이지의 `오늘의 보조 메뉴`는 마지막/결과 페이지에 있어야 하고, `매일 들어올 이유` 표현은 삭제 필요. 보조 메뉴 버튼을 눌러도 동작하지 않았다.
- 원인: `CherryPickMenu`가 intro 영역에 렌더링되고 있었고, 버튼은 label 배열만 렌더링해 `onClick` 핸들러가 없었다.
- 수정: `CherryPickMenu`를 결과 화면 하단으로 이동하고, 헤더 보조 문구 `매일 들어올 이유`를 제거했다. 메뉴 item 타입을 `{ label, onClick }`로 변경해 패치 룰렛/미니 게임/공유/기록/보너스 루틴 버튼이 각각 기존 앱 액션을 호출하게 했다.
- 검증: `apps/01-money-leak-test`에서 `npm run build` 성공. `money-leak-test.ait` 재생성, deploymentId `019e02e1-4bdf-70c0-b402-0e6059692bc4`.

## 2026-05-07 — money-leak-test 브랜드 아이콘 생성/설정

- 반려 사유 대응: `granite.config.ts`의 `brand.icon`이 비어 있어 콘솔 등록 아이콘과 매칭되지 않는 문제를 수정했다.
- 생성: 앱 아이덴티티에 맞춰 초록 배경, 지갑, 돈구멍, 코인/패치 모티프의 1024x1024 PNG 아이콘을 `apps/01-money-leak-test/public/app-icon.png`로 추가했다.
- 설정: `brand.icon`을 `https://money-leak-test.apps.tossmini.com/app-icon.png`로 지정했다. 콘솔 앱 정보 아이콘도 같은 PNG를 업로드해야 코드/콘솔 아이콘이 동일해진다.
- 검증: `apps/01-money-leak-test`에서 `npm run build` 성공. `money-leak-test.ait` 재생성, deploymentId `019e02e5-fb19-7bbd-b304-257f0792c57b`.

## 2026-05-07 — 2~6호 WebView 앱 브랜드 아이콘 일괄 적용

- 대상: `daily-waste-quiz`, `salary-thief-finder`, `spending-defense-roulette`, `subscription-ghost-finder`, `receipt-monster-catcher`.
- 처리: 각 앱별 `public/app-icon.png` 1024x1024 PNG를 생성하고, `granite.config.ts`의 `brand.icon`을 `https://{appName}.apps.tossmini.com/app-icon.png`로 설정했다.
- 콘솔 작업: 각 앱의 콘솔 앱 정보/브랜드 아이콘에는 동일한 `public/app-icon.png` 파일을 업로드해야 한다. 코드 URL과 콘솔 등록 아이콘 디자인이 같아야 검수 반려를 피할 수 있다.
- 검증: 5개 앱 모두 `npm run build` 성공.
  - `daily-waste-quiz`: deploymentId `019e02e9-2e3e-7d96-b4ce-4ea744bfa4cf`
  - `salary-thief-finder`: deploymentId `019e02e9-4ea4-7f1d-a4c8-7c83b178c028`
  - `spending-defense-roulette`: deploymentId `019e02e9-6fd2-710b-93dc-769ab7852e38`
  - `subscription-ghost-finder`: deploymentId `019e02e9-9202-72a7-b2ee-0122e9668929`
  - `receipt-monster-catcher`: deploymentId `019e02e9-b1e3-7524-9792-78749799fce8`

## 2026-05-07 — 보조 메뉴 광고 오연결/더미 버튼 정리

- 피드백: `money-leak-test` 결과 화면의 `패치 룰렛/미니 게임/친구에게 보내기/기록 보기/보너스 루틴` 버튼이 광고 영상으로만 이어지는 것처럼 느껴졌다. 같은 `CherryPickMenu` 패턴이 다른 WebView 앱에도 남아 있었다.
- 설계 판단: 보조 메뉴 버튼 전체가 광고 게이트로 연결되는 구조는 부적절하다. 광고는 명시적인 `광고 보고 ...` CTA에서만 선택적으로 열고, 보조 메뉴는 실제 앱 액션(다시 시작, 공유, 기록/루틴 열기 등)으로 바로 동작해야 한다.
- 수정 대상: `money-leak-test`, `daily-waste-quiz`, `salary-thief-finder`, `spending-defense-roulette`, `subscription-ghost-finder`, `receipt-monster-catcher`.
- 수정 내용: 보조 메뉴 item을 문자열 배열에서 `{ label, onClick }` 액션 배열로 바꾸고 더미 버튼을 제거했다. `매일 들어올 이유` 및 `AD · 광고 보고...` 형태의 보조 메뉴 문구도 제거/완화했다. 보조 메뉴는 결과 화면 중심으로 배치하고, 광고 게이트는 기존 명시적 광고 CTA에만 남겼다.
- 검증: 6개 앱 모두 `npm run build` 성공.
  - `money-leak-test`: deploymentId `019e02f1-5174-7453-9abf-75af305d4426`
  - `daily-waste-quiz`: deploymentId `019e02f1-6cde-7f1c-86c3-ee957c6f8c9c`
  - `salary-thief-finder`: deploymentId `019e02f1-8ded-75ee-b7b5-af6699e1283d`
  - `spending-defense-roulette`: deploymentId `019e02f1-ab9d-77fe-80e4-d7889942638f`
  - `subscription-ghost-finder`: deploymentId `019e02f1-c894-753b-9e92-d2143e8d4edb`
  - `receipt-monster-catcher`: deploymentId `019e02f1-e69a-71f5-a08e-690170194e26`

## 2026-05-08 — money-leak-test 혜택 루프 명확화 및 상시 배너 추가

- 피드백: `패치 붙이기`/`오늘의 보조 메뉴`가 무엇을 하는지, 왜 눌러야 하는지 불명확했다. 실제 혜택 설계 의도와 광고 수익화를 더 명확히 해야 했다.
- 설계 변경: 첫 화면의 즉시 탭 액션을 제거하고 `결과 후 열리는 혜택` 안내로 바꿨다. 결과 화면에는 `오늘의 혜택 루틴` 카드를 추가해 3번 누르면 유형별 실천 카드가 열린다는 보상을 명시했다. 보조 메뉴명은 `결과 활용하기`로 바꾸고 각 버튼이 광고 없이 실행되는 기능임을 표시했다.
- 광고 변경: Apps in Toss 배너 광고 문서 기준으로 `TossBannerAd`/`useTossBanner`를 도입하고 시작 화면, 문항 화면, 결과 화면 하단에 상시 배너 슬롯을 추가했다. 보상형 광고는 명시적 `광고 보고...` CTA에만 남겼다.
- 검증: `apps/01-money-leak-test`에서 `npm run build` 성공. `money-leak-test.ait` 재생성, deploymentId `019e0302-1ab6-7e00-9145-4ad405e7926f`.

## 2026-05-08 — 2~6호 앱 혜택/광고 기준 동기화

- 대상: `daily-waste-quiz`, `salary-thief-finder`, `spending-defense-roulette`, `subscription-ghost-finder`, `receipt-monster-catcher`.
- 처리: 1호 앱 기준에 맞춰 `오늘의 보조 메뉴`를 `결과 활용하기`로 변경하고, 보조 메뉴의 `AD ·`/광고 유도 문구를 제거했다. 각 버튼은 광고 없이 즉시 실행되는 결과 활용 액션으로 유지했다.
- 광고: `salary-thief-finder`, `spending-defense-roulette`, `receipt-monster-catcher`에는 실제 `TossBannerAd`/`useTossBanner`를 추가하고 기존 placeholder `BannerAd`/`AdBox`를 Toss 배너 슬롯으로 교체했다. 부족한 결과 화면 배너 슬롯도 보강했다. 이미 Toss 배너가 있던 `daily-waste-quiz`, `subscription-ghost-finder`는 문구와 결과 활용 메뉴 기준을 맞췄다.
- 검증: 5개 앱 모두 `npm run build` 성공.
  - `daily-waste-quiz`: deploymentId `019e032d-e4d1-763a-a42d-a3fdf3df72e0`
  - `salary-thief-finder`: deploymentId `019e032e-0e9a-7f34-94df-b58e99609df1`
  - `spending-defense-roulette`: deploymentId `019e032e-390d-7903-a32d-4d3f8ef678ab`
  - `subscription-ghost-finder`: deploymentId `019e032e-62ba-776d-bfd4-6f1c51ef677b`
  - `receipt-monster-catcher`: deploymentId `019e032e-8c96-7f55-b3e5-a75259a88eb3`

## 2026-05-08 — 출시 번들 테스트 광고 ID 제거

- 반려 사유: 출시 번들에 `ait-ad-test-*` 테스트용 광고 그룹 ID가 포함되어 있었다. Apps in Toss 검수는 출시 번들에 테스트 광고 그룹 ID 사용을 허용하지 않는다.
- 처리: 1~6호 앱의 `App.tsx`, `InAppAdsPage.tsx`, `.env.example`에서 테스트 광고 ID fallback을 제거했다. 실제 광고 그룹 ID가 없으면 빈 문자열로 남기고, `useInAppAds`/`TossBannerAd`가 SDK 호출을 하지 않도록 방어 처리했다.
- 운영: 콘솔에서 실제 광고 그룹을 생성한 뒤 `VITE_TOSS_BANNER_AD_GROUP_ID`, `VITE_TOSS_REWARDED_AD_GROUP_ID`, 필요 시 `VITE_TOSS_INTERSTITIAL_AD_GROUP_ID`에 실제 ID를 넣고 다시 빌드해야 광고가 노출된다.
- 검증: 1~6호 앱 모두 `npm run build` 성공, 빌드 산출물/소스에서 `ait-ad-test` 문자열 미검출.
  - `money-leak-test`: deploymentId `019e0763-2c3d-70e1-ab66-1e436b1d5f7d`
  - `daily-waste-quiz`: deploymentId `019e0763-56cb-79a4-b2ed-2a47499d600c`
  - `salary-thief-finder`: deploymentId `019e0763-7e67-77a4-9bbd-94e7b5ba8546`
  - `spending-defense-roulette`: deploymentId `019e0763-aa9f-76f8-b889-3781a6cea70a`
  - `subscription-ghost-finder`: deploymentId `019e0763-ccd1-7f9e-819a-715f95ce9dd2`
  - `receipt-monster-catcher`: deploymentId `019e0763-f38b-7e30-b1fb-1c4d147fc9f0`

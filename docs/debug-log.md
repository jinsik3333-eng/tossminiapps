     1|# Debug Log
     2|
     3|## 2026-05-04 — `몽글 매치 퍼즐` 초기 빌드
     4|
     5|- 처리: `receipt-monster-catcher` 최신 seed를 복사해 `apps/07-mongle-match-puzzle` 생성 후 앱명/포트/브랜드/소스 전체를 게임형으로 교체했다.
     6|- 빌드: `npm install && npm run build` 성공. 산출물 `mongle-match-puzzle.ait`, deploymentId `019df2c8-c344-773d-8ade-edc156f36f84`.
     7|- 경고: `npm install`에서 기존과 동일하게 peer dependency 경고와 22 vulnerabilities가 표시된다. 공식 framework 호환성 때문에 `npm audit fix --force`는 실행하지 않았다.
     8|- QA: `dist/web` 정적 서버로 홈/플레이 화면을 vision QA했다. 홈 하단 안내문 크기/대비가 약하다는 지적이 있어 `.safe-note`를 15px/진한 보라로 보정했다. 이후 랜덤 몽글 수집/유니크 점수 보너스 메시지, 도감 슬롯, 플레이 HUD/광고 CTA를 390px 모바일 기준으로 재확인했다. 100종 전환 후에도 홈에서 `0/100종 수집`, `1% 유니크`, 대표 도감 `+89`가 잘 보이고 레이아웃 깨짐이 없음을 확인했다.
     9|- 남은 확인: 실제 토스 게임 프로필 생성 모달, 리더보드 승인 상태, 광고 SDK, 실기기 백그라운드 복귀는 콘솔/샌드박스에서만 최종 확인 가능하다.
    10|
    11|## 2026-05-04 — 6호 빌드 설정 이슈
    12|
    13|- 증상: 새 앱 `receipt-monster-catcher`에서 `ait build` 실행 시 `granite build --no-cache` 옵션 오류 또는 RN 번들 누락 오류 발생.
    14|- 원인: `granite.config.ts`를 예전 `@apps-in-toss/framework/config` 형태로 작성해 seed 앱과 다른 빌드 경로를 탔다.
    15|- 해결: 5호와 동일하게 `@apps-in-toss/web-framework/config`의 `defineConfig` 구조, `web.commands.build: "vite build"`, `outdir: "dist"`를 명시했다.
    16|- 추가: 새 앱 설치 시 peer dependency 충돌은 `npm ci --legacy-peer-deps` 또는 seed lockfile 유지로 처리한다. `npm audit fix --force`는 금지.
    17|
    18|## 2026-05-04 — 몽글 100종 3D 에셋 생성
    19|
    20|- `apps/07-mongle-match-puzzle/public/mongles/*.png` 100개 생성.
    21|- `public/mongles/manifest.json`, `_contact-sheet.jpg` 생성.
    22|- 홈 히어로/도감 미리보기/결과 카드에 PNG 에셋 연결.
    23|- 390px 홈/플레이 화면 Vision QA 완료.
    24|- `npm run lint && npm run build` 성공.
    25|- deploymentId `019df313-d085-701c-b098-8f31a5511aeb`.
    26|
    27|## 2026-05-04 — 몽글 premium 3D 에셋 파이프라인 재정리
    28|
    29|- 배경: 사용자가 1차 procedural 몽글 이미지 스타일을 거부했다.
    30|- 처리: `public/mongles`의 1차 MVP PNG/manifest/contact-sheet를 `docs/mongle-legacy-draft-assets/`로 격리하고 앱 public 번들/직접 참조를 제거했다.
    31|- 앱: 100종 데이터 구조는 유지하되 `imageSrc`를 `/mongles/premium/{001-100}-{series}-{variant}.webp` stable path로 변경했다. premium 이미지가 아직 없을 때는 깨진 이미지/저품질 PNG fallback 대신 CSS placeholder shell을 표시한다.
    32|- 카피: 사용자 노출 홈 문구는 제작 단계 언급 없이 `100종 몽글 도감`으로 정리했다.
    33|- 문서: premium 3D 아트 디렉션과 100종 prompt manifest를 추가했다. 내부 제작 단계는 대표 12종 톤 확정 후 100종 확장으로 문서화했다.
    34|
    35|
    36|## 2026-05-05 — 몽글 프리미엄 3D 이미지 100종 생성
    37|
    38|- `gpt-image-2-high` 기반 premium Mongle 이미지 100종 생성 완료.
    39|- 저장 위치: `apps/07-mongle-match-puzzle/public/mongles/premium/`
    40|- 산출물: `001-*.webp` ~ `100-*.webp`, `_all-100-contact-sheet-clean.jpg`, `generation-log.jsonl`
    41|- 총 WebP 용량: 약 2.8MB.
    42|- Vision QA: 100종 contact sheet 기준 프리미엄 3D toy/clay/plush 톤 통과, 텍스트/로고/숫자/화폐기호/워터마크/체크보드 배경 명확한 문제 없음.
    43|- 앱 연결: `PREMIUM_ASSETS_READY = true` 전환.
    44|- 검증: `npm run lint && npm run build` 성공, deploymentId `019df527-0624-7b02-b0ed-53661b472da0`.
    45|- 브라우저 QA: 홈 화면에서 premium 몽글 이미지 실제 로드 확인, 깨진 이미지/placeholder 노출 없음. 로컬 dev 환경에서 Toss SafeAreaInsets bridge 경고는 발생하나 uncaught JS error는 없음.
    46|
    47|## 2026-05-05 — 몽글 캐릭터 피드백/스와이프 조작 보정
    48|
    49|- 피드백: 100종 몽글이 서로 비슷하고 일부가 징그럽게 느껴진다는 의견이 있었다.
    50|- 분석: 현재 세트는 둥근 본체·큰 눈·작은 팔다리·파스텔 팔레트가 반복되어 소품만 바뀐 변형처럼 보인다. 기존 `subscription-ghost-finder` 유령과 `salary-thief-finder` 탐정/도둑 캐릭터의 단순 얼굴, 역할 소품, 작은 사건성을 새 기준으로 잡았다.
    51|- 문서: `apps/07-mongle-match-puzzle/docs/mongle-character-redesign.md`에 새 아트 디렉션, 피해야 할 요소, 12종 샘플 프롬프트 방향을 정리했다.
    52|- 조작: `src/App.tsx` 보드 타일에 pointer 기반 스와이프/드래그 교체를 추가했다. 클릭-클릭 조작은 보조 방식으로 유지했다.
    53|- CSS: `.tile`에 `touch-action: none`, `user-select: none`을 추가해 모바일 스와이프 중 화면 스크롤/선택 충돌을 줄였다.
    54|- 검증: `npm run lint && npm run build` 성공, deploymentId `019df773-c875-74b4-b4ed-c518b70c11eb`. 로컬 Vite 브라우저에서 포인터 스와이프 이벤트 후 안내 메시지 갱신 및 JS error 없음, vision QA상 보드/버튼 가독성 양호.
    55|
    56|## 2026-05-05 — 몽글 도감 카드 라벨/이미지 배경 보정
    57|
    58|- 피드백: 새 몽글 샘플은 귀엽지만 이미지 배경 사각형이 카드/버튼 안에 같이 들어가 보여 아쉽고, 각 몽글 이름과 `common` 같은 희귀도 표시가 같이 필요했다.
    59|- 처리: 홈 도감 미리보기 카드를 2열 정보형 카드로 변경하고, 몽글 이름 + `common/rare/epic/unique` pill을 표시했다. preview에는 common뿐 아니라 rare/epic/unique 대표도 포함되게 했다.
    60|- 이미지: CSS에서 몽글 이미지를 cover가 아닌 contain/multiply/radial mask 방식으로 바꿔 카드 안 사각 배경이 덜 튀도록 완화했다. 새 샘플 4종은 임시 cutout PNG도 생성했다.
    61|- 산출물: `public/mongles/redesign-samples/*-cutout.png`, `_redesign-sample-4-cutout-on-cards.jpg`.
    62|- 검증: `npm run lint && npm run build` 성공, deploymentId `019df782-3f43-74c2-afb0-cd54f3e3de3e`. 브라우저 QA에서 이름+rarity 표시 확인, JS error 없음. 남은 점: 기존 baked-background 이미지는 CSS만으로 완전 제거가 어려워 최종 100종 재생성 시 투명 또는 앱 배경 매칭을 프롬프트/후처리 단계에 포함해야 한다.
    63|
    64|## 2026-05-05 — 몽글 썸네일 표현 방향 정정
    65|
    66|- 피드백: 배경 제거 cutout은 캐릭터 외곽/그림자가 깨져 오히려 품질이 떨어졌다. 이미지 네모 자체는 써도 되며, UI에서 어떻게 예쁘게 감싸는지가 더 중요하다.
    67|- 처리: cutout/마스크/multiply 방식 대신 원본 정사각형 이미지를 `object-fit: cover`로 그대로 쓰고, 썸네일 컨테이너를 둥근 네모·얇은 보라 테두리·은은한 inner highlight/그림자로 카드화했다.
    68|- 홈 도감 카드 썸네일은 58px로 키워 캐릭터 가독성을 높였다.
    69|- 검증: `npm run lint && npm run build` 성공, deploymentId `019df789-20c3-75ef-919c-f448019a89a4`. 브라우저 vision QA에서 둥근 네모 썸네일 방식이 자연스럽고 이름+rarity와 잘 어울린다는 평가를 받았다.
    70|
    71|## 2026-05-05 — 몽글 100종 귀여운 역할형 세트 교체/QA
    72|
    73|- 처리: 기존 premium 100종 WebP를 `apps/07-mongle-match-puzzle/docs/asset-archive/premium-before-cute-redesign-2026-05-05/`로 아카이브하고, 승인된 4종 샘플을 production filename으로 seed한 뒤 100종 전체를 새 역할형/스토리형 몽글로 재생성했다.
    74|- 데이터: `apps/07-mongle-match-puzzle/docs/mongle-premium-prompt-manifest.json`에 100종 이름·rarity·설명·프롬프트·assetPath를 정리하고, `src/App.tsx`를 25테마×4변형 자동 생성이 아닌 100종 개별 캐릭터 데이터로 교체했다.
    75|- 생성: shardable/resumable 방식으로 `public/mongles/premium/001-*.webp` ~ `100-*.webp` 100개 생성 완료. manifest 기준 누락 asset 없음, `_all-100-contact-sheet-clean.jpg` 재생성 완료.
    76|- Vision QA: 징그러움/텍스트/숫자/로고/워터마크/화폐/체크보드 문제는 발견되지 않았다. 귀여운 유령·탐정·도둑·작은 역할 캐릭터 방향은 살아있다. 다만 탐정 모자/돋보기 계열이 다소 많아 100종 전체 다양성 관점에서는 다음 보정 시 일부를 다른 직업/실루엣으로 분산하면 좋다.
    77|- 검증: `npm run lint && npm run build` 성공, deploymentId `019df7b7-f190-7937-b0d0-02aa91773616`. 홈/플레이 브라우저 vision QA에서 이미지 로딩, 이름+rarity 카드, 보드 레이아웃 정상 확인. 로컬 dev 환경의 Toss SafeAreaInsets bridge 경고는 기존과 동일하게 console에 표시되지만 uncaught JS error는 없다.
    78|
    79|## 2026-05-05 — 몽글 앱 정리/컨텍스트 맵 추가
    80|
    81|- 처리: 앱 런타임에서 쓰지 않는 `public/mongles/redesign-samples/`와 실패한 cutout 산출물을 제거했다. `public/mongles/premium/`에는 실제 앱에서 로드하는 100종 WebP만 남겼다.
    82|- 보존: QA contact sheet, sample manifest, generation log는 `docs/archive/mongle-generation-artifacts/`로 이동했다.
    83|- 정리: `dist/`는 생성물이므로 삭제했고, 승인 대기용 `mongle-match-puzzle.ait`는 유지했다.
    84|- 문서: 루트 `PROJECT_CONTEXT.md`와 앱별 `apps/07-mongle-match-puzzle/APP_CONTEXT.md`를 추가해 다음 작업부터 필요한 파일만 컨텍스트로 가져오도록 정리했다.
    85|- 검증: `npm run lint && npm run build` 성공, deploymentId `019df83d-b422-7aa8-820b-6c67ed11f508`. build 검증 후 `dist/`는 다시 삭제했고 `.ait` 산출물은 유지했다.
    86|
    87|## 2026-05-07 — 몽글 디펜스 MVP 구현/검증
    88|
    89|- 생성: `apps/07-mongle-match-puzzle` seed를 `apps/08-mongle-defense`로 복사하되 `node_modules/dist/.ait` 제외 후, 3매치/100종 이미지 런타임 구현을 디펜스 MVP로 교체했다.
    90|- 설정: `package.json` name `apps-mongle-defense`, `granite.config.ts` appName `mongle-defense`, displayName `몽글 디펜스`, port `5181`, `webViewProps: { type: "game", overScrollMode: "never" }` 확인.
    91|- 구현: `src/lib/gameLogic.ts`에 30초/HP/lane/spawn/tap/combo/skill/grade 순수 로직, `src/lib/tossGameCenter.ts`에 local/sandbox/unsupported fallback과 playId 1회 제출 가드 구현.
    92|- 검증: `npm run lint` 최초 실패 — 순수 함수 `useCloudShieldSkill`이 React hook rule에 걸림. `activateCloudShieldSkill`로 rename 후 통과.
    93|- 최종 검증: `npm run format && npm run lint && npm run build` 성공. `ait build` 산출물 `mongle-defense.ait` 생성, deploymentId `019e0086-1d65-73ad-8e48-f3d98afd3a19`.
    94|- 경고: Vite chunk size 500k 초과 경고와 Node DEP0190 경고가 있으나 빌드는 성공했다. 배포는 실행하지 않았다.
    95|
    96|## 2026-05-07 — 몽글 디펜스 AI 리뷰 수정
    97|
    98|- Claude Code 리뷰 P0/P1 반영: 홈의 개발용 랭킹/fallback/광고 슬롯 문구 제거, 광고 SDK 미연동 상태의 `광고 보고`/보너스 CTA 제거, 탭 미스 시 콤보 리셋 로직 추가, danger-line 시각 위치와 누수 기준을 84%로 일치시켰다.
    99|- 사용자 노출 문구는 광고/현금/포인트/캐시/당첨/보장/placeholder/fallback 표현 없이 정리했다.
   100|- 최종 검증: `npm run format && npm run lint && npm run build` 성공. `mongle-defense.ait` 재생성, deploymentId `019e0097-c45d-705d-b143-ecbaf51390b9`.
   101|
   102|## 2026-05-07 — 몽글 디펜스 v0.2 재미 강화
   103|
   104|- ai-dev-loop 진행: `.hermes/plans/mongle-defense-v02-ai-dev-loop.md` 작성 → OMX/Codex 구현 → Hermes 파일 검수 → Claude Code P0/P1 리뷰 → 패치 → 390px 브라우저 QA.
   105|- 구현: 몬스터 타입 4종(common/shield/fast/bonus), 웨이브 단계(적응/콤보/피버), 오늘 웨이브 효과, 몽글 도우미 4종(sleepy/detective/thief/ghost), +점수 플로팅/콤보 milestone/구름 방패 배너, 결과 화면 다음 목표/최고점 대비/보너스 방어·놓침/조각 n/24 진행률을 추가했다.
   106|- 리뷰 반영: sleepy 도우미가 bonus 몬스터를 완화했을 때 `bonusLeaked`가 오르는 버그를 수정했고, 시작 웨이브 배너가 30초 고정되지 않도록 자동 소멸 처리했다. 미사용 `.ad-slot`/`.bonus-button` CSS와 `로컬에서는/샌드박스에서는` 사용자 문구도 제거했다.
   107|- QA: 홈/방어 준비/플레이/결과 390px Vision QA 완료. 몬스터 타입은 실제 플레이 중 색·형태·마크로 구분 가능, HUD/위험선/구름 방패 버튼 겹침 없음. 순간적인 `+점수` 플로팅은 코드 경로로 구현되어 있으나 스크린샷 타이밍상 vision 캡처에서는 항상 잡히지 않을 수 있다.
   108|- 최종 검증: `npm run format && npm run lint && npm run build` 성공. `mongle-defense.ait` 재생성, deploymentId `019e01b7-7554-7a55-a98f-cad801b2a9cc`.
   109|
   110|## 2026-05-07 — money-leak-test 토스앱 실기기 테스트 피드백 반영
   111|
   112|- 피드백: 첫 페이지의 `오늘의 보조 메뉴`는 마지막/결과 페이지에 있어야 하고, `매일 들어올 이유` 표현은 삭제 필요. 보조 메뉴 버튼을 눌러도 동작하지 않았다.
   113|- 원인: `CherryPickMenu`가 intro 영역에 렌더링되고 있었고, 버튼은 label 배열만 렌더링해 `onClick` 핸들러가 없었다.
   114|- 수정: `CherryPickMenu`를 결과 화면 하단으로 이동하고, 헤더 보조 문구 `매일 들어올 이유`를 제거했다. 메뉴 item 타입을 `{ label, onClick }`로 변경해 패치 룰렛/미니 게임/공유/기록/보너스 루틴 버튼이 각각 기존 앱 액션을 호출하게 했다.
   115|- 검증: `apps/01-money-leak-test`에서 `npm run build` 성공. `money-leak-test.ait` 재생성, deploymentId `019e02e1-4bdf-70c0-b402-0e6059692bc4`.
   116|
   117|## 2026-05-07 — money-leak-test 브랜드 아이콘 생성/설정
   118|
   119|- 반려 사유 대응: `granite.config.ts`의 `brand.icon`이 비어 있어 콘솔 등록 아이콘과 매칭되지 않는 문제를 수정했다.
   120|- 생성: 앱 아이덴티티에 맞춰 초록 배경, 지갑, 돈구멍, 코인/패치 모티프의 1024x1024 PNG 아이콘을 `apps/01-money-leak-test/public/app-icon.png`로 추가했다.
   121|- 설정: `brand.icon`을 `https://money-leak-test.apps.tossmini.com/app-icon.png`로 지정했다. 콘솔 앱 정보 아이콘도 같은 PNG를 업로드해야 코드/콘솔 아이콘이 동일해진다.
   122|- 검증: `apps/01-money-leak-test`에서 `npm run build` 성공. `money-leak-test.ait` 재생성, deploymentId `019e02e5-fb19-7bbd-b304-257f0792c57b`.
   123|
   124|## 2026-05-07 — 2~6호 WebView 앱 브랜드 아이콘 일괄 적용
   125|
   126|- 대상: `daily-waste-quiz`, `salary-thief-finder`, `spending-defense-roulette`, `subscription-ghost-finder`, `receipt-monster-catcher`.
   127|- 처리: 각 앱별 `public/app-icon.png` 1024x1024 PNG를 생성하고, `granite.config.ts`의 `brand.icon`을 `https://{appName}.apps.tossmini.com/app-icon.png`로 설정했다.
   128|- 콘솔 작업: 각 앱의 콘솔 앱 정보/브랜드 아이콘에는 동일한 `public/app-icon.png` 파일을 업로드해야 한다. 코드 URL과 콘솔 등록 아이콘 디자인이 같아야 검수 반려를 피할 수 있다.
   129|- 검증: 5개 앱 모두 `npm run build` 성공.
   130|  - `daily-waste-quiz`: deploymentId `019e02e9-2e3e-7d96-b4ce-4ea744bfa4cf`
   131|  - `salary-thief-finder`: deploymentId `019e02e9-4ea4-7f1d-a4c8-7c83b178c028`
   132|  - `spending-defense-roulette`: deploymentId `019e02e9-6fd2-710b-93dc-769ab7852e38`
   133|  - `subscription-ghost-finder`: deploymentId `019e02e9-9202-72a7-b2ee-0122e9668929`
   134|  - `receipt-monster-catcher`: deploymentId `019e02e9-b1e3-7524-9792-78749799fce8`
   135|
   136|## 2026-05-07 — 보조 메뉴 광고 오연결/더미 버튼 정리
   137|
   138|- 피드백: `money-leak-test` 결과 화면의 `패치 룰렛/미니 게임/친구에게 보내기/기록 보기/보너스 루틴` 버튼이 광고 영상으로만 이어지는 것처럼 느껴졌다. 같은 `CherryPickMenu` 패턴이 다른 WebView 앱에도 남아 있었다.
   139|- 설계 판단: 보조 메뉴 버튼 전체가 광고 게이트로 연결되는 구조는 부적절하다. 광고는 명시적인 `광고 보고 ...` CTA에서만 선택적으로 열고, 보조 메뉴는 실제 앱 액션(다시 시작, 공유, 기록/루틴 열기 등)으로 바로 동작해야 한다.
   140|- 수정 대상: `money-leak-test`, `daily-waste-quiz`, `salary-thief-finder`, `spending-defense-roulette`, `subscription-ghost-finder`, `receipt-monster-catcher`.
   141|- 수정 내용: 보조 메뉴 item을 문자열 배열에서 `{ label, onClick }` 액션 배열로 바꾸고 더미 버튼을 제거했다. `매일 들어올 이유` 및 `AD · 광고 보고...` 형태의 보조 메뉴 문구도 제거/완화했다. 보조 메뉴는 결과 화면 중심으로 배치하고, 광고 게이트는 기존 명시적 광고 CTA에만 남겼다.
   142|- 검증: 6개 앱 모두 `npm run build` 성공.
   143|  - `money-leak-test`: deploymentId `019e02f1-5174-7453-9abf-75af305d4426`
   144|  - `daily-waste-quiz`: deploymentId `019e02f1-6cde-7f1c-86c3-ee957c6f8c9c`
   145|  - `salary-thief-finder`: deploymentId `019e02f1-8ded-75ee-b7b5-af6699e1283d`
   146|  - `spending-defense-roulette`: deploymentId `019e02f1-ab9d-77fe-80e4-d7889942638f`
   147|  - `subscription-ghost-finder`: deploymentId `019e02f1-c894-753b-9e92-d2143e8d4edb`
   148|  - `receipt-monster-catcher`: deploymentId `019e02f1-e69a-71f5-a08e-690170194e26`
   149|
   150|## 2026-05-08 — money-leak-test 혜택 루프 명확화 및 상시 배너 추가
   151|
   152|- 피드백: `패치 붙이기`/`오늘의 보조 메뉴`가 무엇을 하는지, 왜 눌러야 하는지 불명확했다. 실제 혜택 설계 의도와 광고 수익화를 더 명확히 해야 했다.
   153|- 설계 변경: 첫 화면의 즉시 탭 액션을 제거하고 `결과 후 열리는 혜택` 안내로 바꿨다. 결과 화면에는 `오늘의 혜택 루틴` 카드를 추가해 3번 누르면 유형별 실천 카드가 열린다는 보상을 명시했다. 보조 메뉴명은 `결과 활용하기`로 바꾸고 각 버튼이 광고 없이 실행되는 기능임을 표시했다.
   154|- 광고 변경: Apps in Toss 배너 광고 문서 기준으로 `TossBannerAd`/`useTossBanner`를 도입하고 시작 화면, 문항 화면, 결과 화면 하단에 상시 배너 슬롯을 추가했다. 보상형 광고는 명시적 `광고 보고...` CTA에만 남겼다.
   155|- 검증: `apps/01-money-leak-test`에서 `npm run build` 성공. `money-leak-test.ait` 재생성, deploymentId `019e0302-1ab6-7e00-9145-4ad405e7926f`.
   156|
   157|## 2026-05-08 — 2~6호 앱 혜택/광고 기준 동기화
   158|
   159|- 대상: `daily-waste-quiz`, `salary-thief-finder`, `spending-defense-roulette`, `subscription-ghost-finder`, `receipt-monster-catcher`.
   160|- 처리: 1호 앱 기준에 맞춰 `오늘의 보조 메뉴`를 `결과 활용하기`로 변경하고, 보조 메뉴의 `AD ·`/광고 유도 문구를 제거했다. 각 버튼은 광고 없이 즉시 실행되는 결과 활용 액션으로 유지했다.
   161|- 광고: `salary-thief-finder`, `spending-defense-roulette`, `receipt-monster-catcher`에는 실제 `TossBannerAd`/`useTossBanner`를 추가하고 기존 placeholder `BannerAd`/`AdBox`를 Toss 배너 슬롯으로 교체했다. 부족한 결과 화면 배너 슬롯도 보강했다. 이미 Toss 배너가 있던 `daily-waste-quiz`, `subscription-ghost-finder`는 문구와 결과 활용 메뉴 기준을 맞췄다.
   162|- 검증: 5개 앱 모두 `npm run build` 성공.
   163|  - `daily-waste-quiz`: deploymentId `019e032d-e4d1-763a-a42d-a3fdf3df72e0`
   164|  - `salary-thief-finder`: deploymentId `019e032e-0e9a-7f34-94df-b58e99609df1`
   165|  - `spending-defense-roulette`: deploymentId `019e032e-390d-7903-a32d-4d3f8ef678ab`
   166|  - `subscription-ghost-finder`: deploymentId `019e032e-62ba-776d-bfd4-6f1c51ef677b`
   167|  - `receipt-monster-catcher`: deploymentId `019e032e-8c96-7f55-b3e5-a75259a88eb3`
   168|
   169|## 2026-05-08 — 출시 번들 테스트 광고 ID 제거
   170|
   171|- 반려 사유: 출시 번들에 `ait-ad-test-*` 테스트용 광고 그룹 ID가 포함되어 있었다. Apps in Toss 검수는 출시 번들에 테스트 광고 그룹 ID 사용을 허용하지 않는다.
   172|- 처리: 1~6호 앱의 `App.tsx`, `InAppAdsPage.tsx`, `.env.example`에서 테스트 광고 ID fallback을 제거했다. 실제 광고 그룹 ID가 없으면 빈 문자열로 남기고, `useInAppAds`/`TossBannerAd`가 SDK 호출을 하지 않도록 방어 처리했다.
   173|- 운영: 콘솔에서 실제 광고 그룹을 생성한 뒤 `VITE_TOSS_BANNER_AD_GROUP_ID`, `VITE_TOSS_REWARDED_AD_GROUP_ID`, 필요 시 `VITE_TOSS_INTERSTITIAL_AD_GROUP_ID`에 실제 ID를 넣고 다시 빌드해야 광고가 노출된다.
   174|- 검증: 1~6호 앱 모두 `npm run build` 성공, 빌드 산출물/소스에서 `ait-ad-test` 문자열 미검출.
   175|  - `money-leak-test`: deploymentId `019e0763-2c3d-70e1-ab66-1e436b1d5f7d`
   176|  - `daily-waste-quiz`: deploymentId `019e0763-56cb-79a4-b2ed-2a47499d600c`
   177|  - `salary-thief-finder`: deploymentId `019e0763-7e67-77a4-9bbd-94e7b5ba8546`
   178|  - `spending-defense-roulette`: deploymentId `019e0763-aa9f-76f8-b889-3781a6cea70a`
   179|  - `subscription-ghost-finder`: deploymentId `019e0763-ccd1-7f9e-819a-715f95ce9dd2`
   180|  - `receipt-monster-catcher`: deploymentId `019e0763-f38b-7e30-b1fb-1c4d147fc9f0`
   181|

## 2026-05-11 — 13~17호 몽글 광고 체리피킹형 한 화면 앱 생성

- 생성: `13-mongle-mung-garden`, `14-mongle-bubble-shelf`, `15-mongle-stamp-atelier`, `16-mongle-night-lamp`, `17-mongle-box-peek` 5개 앱을 기존 몽글 seed 계열에서 파생해 만들었다.
- 구현: 각 앱은 `home/play/result` 대신 한 화면 안에 큰 터치 오브젝트, 항상 보이는 광고 칸, 반복 탭 가능한 슬롯 3개를 둔 체리피킹형 루프다.
- 설정: 각 앱 `granite.config.ts`의 `appName`, `displayName`, `primaryColor`, `port`를 새 값으로 맞췄고, `node_modules`는 기존 seed를 가리키는 symlink로 재사용했다.
- 검증: 5개 앱 모두 `npm run lint && npm run build` 성공. AIT 산출물은 각각 `mongle-mung-garden.ait`, `mongle-bubble-shelf.ait`, `mongle-stamp-atelier.ait`, `mongle-night-lamp.ait`, `mongle-box-peek.ait`.
- QA: `17-mongle-box-peek`을 브라우저 비전으로 확인했을 때 하단 광고 칸이 화면 안에 들어오고 390px 한 화면 느낌이 유지되는 것을 확인했다.
- 정리: 첫 시도에서 잘못 생성된 `apps/mongle-ads-13~15` 임시 디렉터리는 삭제했다.

## 2026-05-29: 07~12 몽글 게임 출시 전 서버/자산 QA

- 서버 QA: `07-mongle-match-puzzle`~`12-mongle-maze`를 각각 5180~5185 포트에 띄우고 Computer Use로 Chrome 스모크 테스트를 진행했다. 홈, 시작 CTA, 플레이 진입, 최소 1개 상호작용 또는 결과 화면을 확인했다.
- 수정: `mongle-match-puzzle`에서 광고 SDK 미연동 상태의 `광고 보고` CTA와 하단 광고 placeholder가 노출되어, 연습 보너스 문구로 바꾸고 placeholder 영역을 제거했다.
- 설정: `mongle-match-puzzle`, `mongle-defense`의 빈 `brand.icon`을 `https://{appName}.apps.tossmini.com/app-icon.png` 형식으로 채웠다.
- 출시 자산: `scripts/create_mongle_game_appstore_assets.py`로 6개 게임의 콘솔용 로고/썸네일/스크린샷/contact sheet/zip을 만들고 각 앱 `public/`에도 복사했다.
- 검증: 6개 앱 모두 `npm run lint && npm run build` 성공. 최신 deploymentId는 `019e70f1-2b95-76dd-97e3-ba02b0a90cf1`, `019e70f1-2e4b-791d-9508-c647b5ce23f2`, `019e70f1-2d5d-71c4-a9a0-2e53564629c7`, `019e70f1-2d77-7c83-89f6-c11c2205f858`, `019e70f1-2e27-7a77-aadd-4707ca43a404`, `019e70f1-2d8e-7a3a-acce-824bdba50115`.
- 번들: `.ait` 파일은 3.8~7.4MB, 압축해제 기준은 약 22.2~26.6MB로 공식 100MB 제한 안쪽이다.
- 문서: `docs/mongle-games-launch-prep.md`에 앱별 산출물, QA 상태, 콘솔 잔여 작업, 공식 문서 링크를 정리했다.

## 2026-05-29: 09~12 몽글 게임 재미/광고 UX 보강

- 피드백: `도망 몽글`은 충돌/획득 임팩트가 약하고 조작이 불명확했다. `1초 탐정 몽글`은 게임 원리가 보이지 않았고, `몽글 점프`/`몽글 미로 탈출`은 다음 단계와 목표가 한눈에 부족했다.
- 처리: imagegen 생성 PNG 캐릭터 4종을 `public/game-assets/`에 넣고 홈/플레이 보드에 적용했다. `도망 몽글`은 좌/우 두 버튼만 남기고 별/무지개/충돌/아슬 회피 임팩트를 추가했다.
- 처리: 4개 앱 공통으로 `StageRail`, `게임 방법` 카드, 결과 화면 다음 판 광고 게이트, 하단 `TossBannerAd`, 광고 env 예시를 추가했다. `1초 탐정 몽글`에는 `case-brief`, `몽글 미로 탈출`에는 `maze-legend`를 추가했다.
- 런타임 이슈: 광고 훅의 `useToast`가 TDS Provider 밖에서 실행되어 Chrome이 빈 화면이 됐다. `TDSMobileAITProvider`를 09~12 `main.tsx`에 적용해 해결했다.
- 검증: `python3 scripts/check_mongle_game_upgrade.py`, 4개 앱 `npm run lint`, 4개 앱 `npm run build`, `ait-ad-test` 검색, Computer Use Chrome QA, headless Chrome 모바일 스크린샷 QA 모두 통과했다. 로컬 Chrome에서는 Toss native safe-area handler가 없어 TDS 경고가 나지만 앱 렌더링/플레이를 막지는 않는다.

## 2026-05-29: 09~12 몽글 게임 레벨 반복감/탐정 난이도 보강

- 피드백: 단계 레일은 생겼지만 실제 판마다 하는 일이 비슷했고, `1초 탐정 몽글`은 X 표식만 누르는 너무 쉬운 게임처럼 보였다.
- 처리: `RUN_STAGE_EFFECTS`, `JUMP_STAGE_EFFECTS`, `MAZE_LEVELS`, `DETECTIVE_RULES`를 공통 템플릿에 추가했다. 단계 표시뿐 아니라 러너 속도/스폰/위험도, 점프 안전구간/퍼펙트존/황금 구름 주기, 미로 벽/열쇠/조각/함정 배치가 판마다 바뀐다.
- 처리: 탐정은 고정 `thief`/X 역할 판별을 제거하고, 색상+표식+소품+표정 조합을 맞추는 방식으로 바꿨다. 카드에는 여러 속성이 보이지만 정답 여부는 CSS class로 드러나지 않게 했다.
- 검증: `python3 scripts/check_mongle_game_upgrade.py` 통과. 4개 앱 모두 `npm run lint && npm run build` 통과.
- 빌드: deploymentId는 `mongle-run` `019e712e-be96-70a3-b6ae-a7d21e76dd18`, `mongle-detective` `019e712e-be96-7079-ac8b-5f240d547fe8`, `mongle-jump` `019e712e-beb6-7099-962d-63c5e061bfb2`, `mongle-maze` `019e712e-beb6-7a27-8b0d-668fa6bc9513`.
- QA: 5209~5212 로컬 서버에서 Playwright 모바일 폭 클릭 QA 통과, 스크린샷은 `.omx/artifacts/mongle-qa/`에 저장했다. Computer Use는 Chrome 창이 떠 있는데도 `cgWindowNotFound`, Finder는 timeout으로 실패해 이번 반복에서는 자동 브라우저 QA로 대체했다.

## 2026-05-31: 07 몽글 매치 퍼즐 출시 보강

- 피드백: 출시 준비를 위해 광고를 붙이고, 4개/5개 매치와 가로세로 동시 매치가 더 큰 쾌감과 보상을 주게 해야 했다.
- 처리: `analyzeMatches`, `resolveCascadingMatches`, `hasAvailableMove`, `resolveStalemate`, `scoreForMatchAnalysis`, `resolveHammer` 순수 로직을 추가해 4개/5개/빙고 차등 점수, 드롭 후 자동 연쇄 팡, 가능한 수 0개 보드 자동 셔플, 망치 아이템 지급을 구현했다. UI에는 임팩트 배지, 연쇄 팡 애니메이션, 셔플 안내 메시지, 망치 모드, 결과/보너스 광고 CTA를 연결했다.
- 광고: Apps in Toss 광고 SDK 기준으로 `TossBannerAd`, `useTossBanner`, `useRewardedAd`를 추가했다. 실제 광고 그룹 ID는 env로만 받고, 미설정 로컬에서는 광고 placeholder 없이 연습 보너스 fallback만 보인다.
- 검증: `apps/07-mongle-match-puzzle`에서 `npm run test:logic`, `npm run lint`, `npm run build` 성공. `mongle-match-puzzle.ait` 재생성, deploymentId `019e7bd4-b086-786b-a486-dde531fabdf5`.
- QA: in-app Browser 390x844에서 홈 -> 튜토리얼 -> 플레이 보드, 망치 버튼 비활성 안내, 보드/부스터 레이아웃을 확인했다. 로컬 브라우저 한정 Toss SafeAreaInsets 경고는 남지만 앱 렌더링/플레이는 정상이다.

## 2026-05-31: 07 몽글 매치 퍼즐 아이템/디자인 확장

- 피드백: 터지는 쾌감이 약하고 풀잎/별/물방울 같은 블록이 재미없었다. 다시하기, 스테이지, 토너먼트, 랭킹, 상점, 사운드, 조작법 같은 게임 메뉴와 아이템 설계가 필요했다.
- 처리: 4가로 `↔️`, 4세로 `↕️`, 2x2 `💣`, 5줄 `🌈`, 셔플 `🔀` 아이템을 순수 로직과 UI 인벤토리/상점에 연결했다. 2x2도 매치로 판정해 터지며, 아이템 사용 시 줄 삭제/3x3 폭발/같은 블록 삭제/셔플이 동작한다.
- 디자인: 기본 블록을 요요/풍선/꿀단지/수정구/비행접시 계열로 교체하고, 갈색 80% 외곽선, 유광 엠보 버튼, 레이어형 정글 배경, 보드 플래시/흔들림/팝 스파크 애니메이션을 적용했다.
- 메뉴: 홈과 플레이 메뉴에 다시하기, 스테이지, 토너먼트, 랭킹, 상점, 사운드/진동, 조작법 패널을 실제 액션으로 연결했다. 홈 CTA는 도감 미리보기 위로 올리고, 플레이 아이템 독은 390px에서 각 버튼 53px로 유지했다.
- 검증: `npm run test:logic`, `npm run lint`, `npm run build` 성공. 새 deploymentId는 `019e7bed-fafe-7063-bd34-ecaf50f3e2f5`, `.ait` 압축해제 크기는 26,604,243 bytes.
- QA: headless Chrome 390x844에서 홈, 플레이 보드, 메뉴 모달을 캡처했다. 가로 스크롤 없음, 보드 340px, 아이템 독 340px, 모달 버튼 폭 정상 확인.

## 2026-05-31: 07 몽글 매치 퍼즐 앱 퀄리티 재보강

- 피드백: 보너스 몽글 찾기는 눈에 보이는 결과가 없었고, 메뉴 타이틀이 잘려 보였으며, 보드 블록/아이템/메뉴에 키보드 이모지가 남아 있어 앱보다 HTML 조합처럼 보였다. 게임 중 배경과 BGM도 부족했다.
- 처리: 보드 블록을 말랑 디저트/장난감/보석 계열 SVG 이미지 5종으로 교체하고, 아이템 6종과 코인도 전용 SVG 에셋으로 바꿨다. 메뉴의 이모지/문자 아이콘은 CSS glyph와 이미지 아이콘으로 교체했다.
- 처리: 플레이 화면은 카드 배경을 제거하고 `jungle-play-bg.svg`를 전체 게임 배경으로 깔았다. 메뉴 모달은 상단 여백, 최대 높이, overflow-x 방어를 조정해 390px에서 타이틀/닫기 버튼이 잘리지 않게 했다.
- 처리: Web Audio 기반 루프형 BGM을 추가하고 설정에서 배경음악/효과음/진동을 분리했다. 보너스 몽글 보상은 결과 화면에 별도 카드로 즉시 표시되게 했다.
- 검증: `npm run test:logic`, `npm run lint`, `npm run build` 성공. 새 deploymentId는 `019e7bfe-abe7-7556-8351-9b3ee29831b3`, `.ait` 압축해제 크기는 26,627,426 bytes.
- QA: headless Chrome 390x844에서 플레이/메뉴를 캡처했다. 보드 이미지 36개, 아이템 이미지 6개, 보드 텍스트 없음, 메뉴 overflow-x 0, document overflow-x 0, 배경 SVG 적용, 플레이 카드 배경 없음 확인.

## 2026-05-31: 07 몽글 매치 퍼즐 imagegen 자산/랭킹 모달 수정

- 피드백: 단계 상승이 잘 보이지 않고, 랭킹 버튼을 눌렀을 때 순위판 상단이 잘려 보였다. 보드 블록과 아이템도 SVG/이모지 조합 느낌이 남아 있었다.
- 처리: imagegen으로 만든 4x3 스프라이트 시트를 `public/game-assets/match/`에 저장하고, 딸기 케이크/레몬 타르트/멜론 젤리/블루베리 소다/포도 수정 블록과 6개 아이템/젤리코인을 PNG로 교체했다. 이전 임시 SVG 블록/아이템/코인은 제거했다.
- 처리: 결과 패널에 `방금 끝낸 단계 -> 다음 단계` 카드를 추가하고, 홈 단계 카피를 `다음 판 단계`로 바꿨다. 랭킹 버튼은 내부 순위판을 먼저 열고, 토스 리더보드는 별도 버튼/fallback으로 남겼다.
- 처리: 홈 화면이 스크롤된 상태에서 모달이 카드 기준 absolute로 떠 상단이 잘리던 문제를 `position: fixed` 모달 레이어로 수정했다.
- 검증: `npm run test:logic`, `npm run lint`, `npm run build` 성공. 새 deploymentId는 `019e7c97-2c77-782d-aa0e-2c433b83a23f`.
- QA: in-app Browser 390x844에서 랭킹 모달 title top 41/bottom 93으로 화면 안에 표시됨을 확인했다. 플레이 보드는 타일 이미지 36/36, 아이템 이미지 6/6 로드 성공.

## 2026-05-31: 07 몽글 매치 퍼즐 단계/별/코인 보상 수정

- 원인: 게임이 4단계에 멈춘 이유는 실제 `DIFFICULTY_STAGES`가 4개뿐이고, 클리어 후 저장값이 배열 길이로 clamp되고 있었기 때문이다.
- 처리: 단계/별/코인 계산을 `src/lib/progression.ts`로 분리하고 총 12단계 난이도 사다리를 추가했다. 5단계부터 목표 점수는 올라가고 이동 수는 점진적으로 줄어든다.
- 처리: 결과 패널에 클리어 별 개수와 이번 판 젤리코인 보상을 표시하고, 스테이지 목록에는 각 레벨의 최고 별/최고 코인 보상 슬롯을 보여주도록 했다. 단계 선택은 현재 플레이 단계와 해금 단계를 분리했다.
- 처리: 버튼과 보드 타일 좌상단의 원형 유광 `::before` 하이라이트를 제거하고, 버튼은 그라데이션과 하단 그림자만 남겼다.
- 검증: `npm run test:logic`, `npm run lint`, `npm run build` 성공. 새 deploymentId는 `019e7ca0-60c9-7223-8e9a-220aa541239b`.
- QA: in-app Browser 390x844에서 홈 `4/12`, 스테이지 목록 12개, 별/코인 슬롯 12개, 버튼/타일 `::before` content `none`, 보드 타일 36개 렌더링을 확인했다.

## 2026-05-31: 07 몽글 매치 퍼즐 점수 팝업 위치 수정

- 피드백: 매치 점수 배너가 보드 중앙에 크게 떠서 실제 터지는 위치와 시야를 가렸다.
- 처리: 매치된 `row:col` 키들의 중심점을 계산하는 `getMatchedAreaCenter` 순수 함수를 추가하고, 일반 매치/연쇄/아이템 피드백이 해당 위치를 CSS 변수로 받아 보드 안에서 작게 떠오르도록 바꿨다.
- 처리: 점수 팝업은 `+점수`를 큰 줄, 임팩트 라벨을 작은 줄로 분리하고 폭/그림자/보상 칩을 축소했다.
- 검증: `npm run test:logic`, `npm run lint`, `npm run build` 성공. 새 deploymentId는 `019e7cda-95be-7d92-a1b1-9d80408815d0`.
- QA: in-app Browser 390x844에서 실제 스왑 매치를 발생시켜 팝업 `+30 몽글 팝`이 보드 중앙 기준 `x -101`, `y +25` 위치에 87x54px로 표시되는 것을 확인했다. 스크린샷은 `.omx/artifacts/mongle-07-qa-20260531-impact/local-score-pop-after-final-build-390x844.png`에 저장했다.

## 2026-05-31: 07 몽글 매치 퍼즐 메뉴 imagegen 에셋 적용

- 피드백: 메뉴가 아직 CSS/HTML 조합처럼 보였고, 버튼 내부 아이콘이 앱 에셋이 아니라 임시 도형처럼 느껴졌다.
- 처리: Lazyweb식 개선 리포트를 `.lazyweb/design-improve/mongle-match-menu-2026-05-31/report.html`에 만들었다. Lazyweb MCP 검색/비교 도구는 현재 노출되지 않아 현재 캡처와 사용자 제공 레퍼런스로 대체했다.
- 처리: imagegen으로 메뉴 전용 스프라이트를 만들고 `menu-title-plaque`, `menu-close`, `menu-icon-*`, `menu-decor-*` PNG 12종을 `public/game-assets/match/`에 저장했다. 버튼은 CSS와 live 한글 텍스트를 유지하고, 타이틀/닫기/아이콘/장식만 PNG로 교체했다.
- 검증: `npm run test:logic`, `npm run lint`, `npm run build` 성공. 새 deploymentId는 `019e7d04-380c-776b-b6cc-ada9a75a5932`.
- QA: in-app Browser 390x844에서 메뉴/랭킹/스테이지 패널을 캡처했다. 메뉴 이미지는 7/7 로드, `documentScrollWidth` 390, overflow-x 0, 메뉴 패널 bottom 566/viewport 844, 랭킹 패널 노출, 스테이지 버튼 12개 노출을 확인했다. 스크린샷은 `.omx/artifacts/mongle-07-qa-20260531-menu/`에 저장했다.

## 2026-05-31: 07 몽글 매치 퍼즐 홈/메뉴/상점 QA 재수정

- 피드백: `연습 +3`의 의미가 불명확했고, 메뉴/상점 이미지와 한글 줄바꿈이 깨져 보였다. 메뉴에는 홈 버튼이 필요했고, 첫 페이지는 일반 게임 로비처럼 보여야 했다.
- 처리: Lazyweb 디자인 리서치 보고서를 `.lazyweb/design-research/mongle-match-home-start-2026-05-31/report.html`에 저장했다. 홈은 보드 미리보기/단계 배지/시작 전 안내/게임 시작 CTA로 재구성하고, 메뉴에는 imagegen PNG 홈 아이콘과 홈 버튼을 추가했다.
- 처리: `연습 +3` CTA와 보너스 몽글/이동 +3 fallback 보상 지급을 제거했다. 보상형 이동 +3과 보너스 몽글은 광고가 준비되고 완료 이벤트가 들어온 경우에만 지급하며, 미준비 상태에서는 안내 메시지만 남긴다.
- 처리: 상점 행을 아이콘/설명/보유량/가격 버튼 영역으로 분리하고, 사운드 패널에는 Web Audio BGM과 Apps in Toss 햅틱 API 사용 안내를 추가했다. 진동은 `generateHapticFeedback` 우선, `navigator.vibrate` fallback 구조로 바꿨다.
- 검증: `npm run test:logic`, `npm run lint`, `npm run build` 성공. 새 deploymentId는 `019e7d9e-0812-7f58-a0c1-cb6137676ba4`.
- QA: in-app Browser 390x844에서 홈/메뉴/상점/사운드/랭킹 패널을 캡처했다. `연습 +3` 텍스트 없음, document overflow-x 없음, 랭킹 행 노출을 확인했다. 스크린샷은 `.lazyweb/design-research/mongle-match-home-start-2026-05-31/references/`에 저장했다.

## 2026-05-31: 18 주식 파이터 신규 앱 생성

- 생성: 잘못 만들어진 `apps/18-mongle-snack-drawer` 초안을 제거하고 `apps/18-stock-fighter`를 새로 만들었다. 설정은 `appName=stock-fighter`, `displayName=주식 파이터`, `port=5191`로 맞췄다.
- 구현: 초급 40개, 중급 30개, 고급 30개 총 100개 퀴즈와 기본 1명 + 히든 19명 파이터 데이터를 추가했다. 5연속 정답 후 차트 추격전, 20초 생존, 3실수 KO, 20콤보 무적/힌트 보상을 순수 로직으로 분리했다.
- 광고: 보상형 광고 bridge가 없거나 로컬이면 `광고 보고` CTA를 활성 광고 버튼으로 보이지 않게 하고 준비 상태로 둔다. 실제 보상은 완료 이벤트 확인 시에만 선택권/부활권을 지급하도록 분리했다.
- 검증: `apps/18-stock-fighter`에서 `npm run test:logic`, `npm run lint`, `npm run build` 성공. build deploymentId는 `019e7c01-a317-7a5d-89fc-0b7977bf53b0`.

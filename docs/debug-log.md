# Debug Log

## 2026-05-04 — `몽글 매치 퍼즐` 초기 빌드

- 처리: `receipt-monster-catcher` 최신 seed를 복사해 `apps/mongle-match-puzzle` 생성 후 앱명/포트/브랜드/소스 전체를 게임형으로 교체했다.
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

- `apps/mongle-match-puzzle/public/mongles/*.png` 100개 생성.
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
- 저장 위치: `apps/mongle-match-puzzle/public/mongles/premium/`
- 산출물: `001-*.webp` ~ `100-*.webp`, `_all-100-contact-sheet-clean.jpg`, `generation-log.jsonl`
- 총 WebP 용량: 약 2.8MB.
- Vision QA: 100종 contact sheet 기준 프리미엄 3D toy/clay/plush 톤 통과, 텍스트/로고/숫자/화폐기호/워터마크/체크보드 배경 명확한 문제 없음.
- 앱 연결: `PREMIUM_ASSETS_READY = true` 전환.
- 검증: `npm run lint && npm run build` 성공, deploymentId `019df527-0624-7b02-b0ed-53661b472da0`.
- 브라우저 QA: 홈 화면에서 premium 몽글 이미지 실제 로드 확인, 깨진 이미지/placeholder 노출 없음. 로컬 dev 환경에서 Toss SafeAreaInsets bridge 경고는 발생하나 uncaught JS error는 없음.

## 2026-05-05 — 몽글 캐릭터 피드백/스와이프 조작 보정

- 피드백: 100종 몽글이 서로 비슷하고 일부가 징그럽게 느껴진다는 의견이 있었다.
- 분석: 현재 세트는 둥근 본체·큰 눈·작은 팔다리·파스텔 팔레트가 반복되어 소품만 바뀐 변형처럼 보인다. 기존 `subscription-ghost-finder` 유령과 `salary-thief-finder` 탐정/도둑 캐릭터의 단순 얼굴, 역할 소품, 작은 사건성을 새 기준으로 잡았다.
- 문서: `apps/mongle-match-puzzle/docs/mongle-character-redesign.md`에 새 아트 디렉션, 피해야 할 요소, 12종 샘플 프롬프트 방향을 정리했다.
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

- 처리: 기존 premium 100종 WebP를 `apps/mongle-match-puzzle/docs/asset-archive/premium-before-cute-redesign-2026-05-05/`로 아카이브하고, 승인된 4종 샘플을 production filename으로 seed한 뒤 100종 전체를 새 역할형/스토리형 몽글로 재생성했다.
- 데이터: `apps/mongle-match-puzzle/docs/mongle-premium-prompt-manifest.json`에 100종 이름·rarity·설명·프롬프트·assetPath를 정리하고, `src/App.tsx`를 25테마×4변형 자동 생성이 아닌 100종 개별 캐릭터 데이터로 교체했다.
- 생성: shardable/resumable 방식으로 `public/mongles/premium/001-*.webp` ~ `100-*.webp` 100개 생성 완료. manifest 기준 누락 asset 없음, `_all-100-contact-sheet-clean.jpg` 재생성 완료.
- Vision QA: 징그러움/텍스트/숫자/로고/워터마크/화폐/체크보드 문제는 발견되지 않았다. 귀여운 유령·탐정·도둑·작은 역할 캐릭터 방향은 살아있다. 다만 탐정 모자/돋보기 계열이 다소 많아 100종 전체 다양성 관점에서는 다음 보정 시 일부를 다른 직업/실루엣으로 분산하면 좋다.
- 검증: `npm run lint && npm run build` 성공, deploymentId `019df7b7-f190-7937-b0d0-02aa91773616`. 홈/플레이 브라우저 vision QA에서 이미지 로딩, 이름+rarity 카드, 보드 레이아웃 정상 확인. 로컬 dev 환경의 Toss SafeAreaInsets bridge 경고는 기존과 동일하게 console에 표시되지만 uncaught JS error는 없다.

## 2026-05-05 — 몽글 앱 정리/컨텍스트 맵 추가

- 처리: 앱 런타임에서 쓰지 않는 `public/mongles/redesign-samples/`와 실패한 cutout 산출물을 제거했다. `public/mongles/premium/`에는 실제 앱에서 로드하는 100종 WebP만 남겼다.
- 보존: QA contact sheet, sample manifest, generation log는 `docs/archive/mongle-generation-artifacts/`로 이동했다.
- 정리: `dist/`는 생성물이므로 삭제했고, 승인 대기용 `mongle-match-puzzle.ait`는 유지했다.
- 문서: 루트 `PROJECT_CONTEXT.md`와 앱별 `apps/mongle-match-puzzle/APP_CONTEXT.md`를 추가해 다음 작업부터 필요한 파일만 컨텍스트로 가져오도록 정리했다.
- 검증: `npm run lint && npm run build` 성공, deploymentId `019df83d-b422-7aa8-820b-6c67ed11f508`. build 검증 후 `dist/`는 다시 삭제했고 `.ait` 산출물은 유지했다.

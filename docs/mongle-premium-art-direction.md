# 몽글 프리미엄 3D 아트 디렉션

작성일: 2026-05-04  
대상 앱: `apps/mongle-match-puzzle`

## 목적

사용자가 거부한 1차 procedural/MVP 몽글 이미지는 앱의 최종 노출 자산으로 쓰지 않는다. 몽글 100종은 이전 Toss 앱들에서 반응이 좋았던 `premium 3D generated-artwork` 감도로 다시 설계하고, 실제 고퀄 이미지 생성은 Hermes image2 단계에서 진행한다.

## 앱 노출 정책

- 앱의 안정 경로는 `/mongles/premium/{001-100}-{series}-{variant}.webp`로 고정한다.
- `docs/mongle-legacy-draft-assets/`는 1차 MVP 에셋 격리 보관 위치다.
- 앱 UI와 앱 public 번들은 legacy-draft 이미지를 직접 포함하거나 참조하지 않는다.
- premium 이미지가 아직 없을 때는 깨진 이미지나 저품질 procedural PNG 대신 CSS 기반 placeholder shell을 보여준다.

## 공통 스타일

- 원본 캐릭터: 독자적인 `몽글` 수집 피규어.
- 질감: soft 3D toy / squishy clay / plush.
- 형태: 둥근 몸통, 작은 팔과 다리, 큰 표정.
- 구성: 캐릭터 1종 + 소품 정확히 1개.
- 배경: 투명 배경 또는 아주 옅은 파스텔 스튜디오 배경.
- 사용처: 홈 히어로, 도감 칩, 결과 획득 카드, 추후 전체 도감.

## 금지 요소

- 한국어/영어 텍스트, 글자, 숫자.
- 로고, 브랜드 마크, 워터마크.
- 화폐기호, 코인, 지폐, 금융 보상처럼 보이는 요소.
- 기존 유명 캐릭터와 닮은 실루엣.
- 전투형 몬스터, 무기, 공포/위협 표정.
- 낮은 품질의 procedural icon 느낌.

## 희귀도별 조명/오라 기준

| 희귀도 | 비주얼 기준 |
| --- | --- |
| 커먼 | 부드러운 스튜디오 daylight, 무광 clay/plush, 오라 없음, 그림자 최소 |
| 레어 | 밝은 rim light, 은은한 pearly glow, 상징이 아닌 작은 반짝 파티클 2~3개 |
| 에픽 | 시네마틱 파스텔 rim light, soft halo aura, 떠다니는 dust mote, 더 강한 실루엣 |
| 유니크 | 프리미엄 aurora back glow, 골든-핑크 오라, hero collectible lighting, 단 금전 보상 연상 금지 |

## 제작 단계

1. 대표 12종으로 톤 후보를 만든다. 사용자에게는 앱에서 이 단계를 노출하지 않는다.
2. 선택된 톤으로 25개 테마 전체를 확장한다.
3. 25개 테마 × 4개 변형 = 100종을 `/mongles/premium/` 경로 규칙에 맞게 생성한다.
4. 모바일 375~390px에서 홈/도감/결과 화면을 확인한다.
5. 지나치게 유치하거나 저가 toy처럼 보이는 컷은 재생성한다.

## 산출물

- Prompt manifest: `docs/mongle-premium-prompt-manifest.json`
- 앱 stable asset path: `apps/mongle-match-puzzle/public/mongles/premium/`
- 격리된 legacy draft: `docs/mongle-legacy-draft-assets/`

# App Factory Checklist

## 새 Apps in Toss 미니앱 생성 체크리스트

1. 기존 최신 앱을 seed로 복사한다.
2. `package.json`, `package-lock.json`, `granite.config.ts`, `.granite/app.json`의 앱명/appName/포트를 새 앱 기준으로 바꾼다.
3. 앱 내부 hero 이미지는 image2/image_generate로 만들고, 읽을 수 있는 텍스트·로고·화폐기호가 없는지 vision QA한다.
4. 홈/액션/결과/루틴 카드/광고 placeholder/알림·로그인 nudge/보조 메뉴를 포함한다.
5. 금전성 보상, 포인트, 캐시백, 절약 보장, 금융상품 추천 문구를 피한다.
6. `npm run format && npm run lint && npm run build`를 통과시킨다.
7. 최종 build deploymentId를 승인 패키지 문서와 앱별 브리프에 반영한다.
8. 앱스토어 이미지 zip/contact sheet를 생성하고 vision QA한다. 수집형 캐릭터 50종 이상은 전체 생성 전 대표 8~12종 샘플 컨택트시트를 먼저 승인받는다.
9. 모바일 브라우저 QA로 홈/액션/결과 상태를 확인한다.
10. stale seed 문구/이미지/광고 데모 소스가 남지 않았는지 검색한다.

## 게임 미니앱 추가 체크리스트

1. 공식 게임 출시 가이드의 최신 항목을 확인한다.
2. 게임 프로필 생성 전 플레이가 차단되는지 토스 실기기/샌드박스에서 확인한다.
3. 점수 제출은 게임 종료 후 1회만 호출하고, playId 등으로 중복 제출을 막는다.
4. 리더보드 호출 전 현재 게임 상태를 저장하고, 복귀 시 상태가 유지되는지 확인한다.
5. 로컬 브라우저에서는 SDK fallback이 흐름을 막지 않게 한다.
6. `포인트/현금/캐시` 보상 카피는 실제 프로모션 연동 전까지 쓰지 않는다.
7. 보드/버튼/HUD가 390px에서 손가락 터치 가능한 크기인지 vision QA한다.

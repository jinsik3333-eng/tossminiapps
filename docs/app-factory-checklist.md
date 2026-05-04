# App Factory Checklist

## 새 Apps in Toss 미니앱 생성 체크리스트

1. 기존 최신 앱을 seed로 복사한다.
2. `package.json`, `package-lock.json`, `granite.config.ts`, `.granite/app.json`의 앱명/appName/포트를 새 앱 기준으로 바꾼다.
3. 앱 내부 hero 이미지는 image2/image_generate로 만들고, 읽을 수 있는 텍스트·로고·화폐기호가 없는지 vision QA한다.
4. 홈/액션/결과/루틴 카드/광고 placeholder/알림·로그인 nudge/보조 메뉴를 포함한다.
5. 금전성 보상, 포인트, 캐시백, 절약 보장, 금융상품 추천 문구를 피한다.
6. `npm run format && npm run lint && npm run build`를 통과시킨다.
7. 최종 build deploymentId를 승인 패키지 문서와 앱별 브리프에 반영한다.
8. 앱스토어 이미지 zip/contact sheet를 생성하고 vision QA한다.
9. 모바일 브라우저 QA로 홈/액션/결과 상태를 확인한다.
10. stale seed 문구/이미지/광고 데모 소스가 남지 않았는지 검색한다.

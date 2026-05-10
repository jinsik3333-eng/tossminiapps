# CLAUDE.md — 몽글 디펜스 작업 지침

- 이 앱은 `apps/08-mongle-defense` 범위만 수정한다.
- seed인 `mongle-match-puzzle`의 3매치/100종 이미지 수집 구현을 되살리지 않는다.
- Toss Game Center는 공식 예제 패턴을 따른다: game WebView, overScrollMode never, local/sandbox/unsupported fallback, 종료 후 playId당 1회 점수 제출.
- UI는 390px 모바일 WebView에서 한 손 탭이 가능한 게임형 화면이어야 한다.
- 광고 SDK가 붙기 전까지 사용자 화면에는 광고 시청을 전제로 한 CTA를 노출하지 않는다. 현금/포인트/캐시/당첨/보장 표현은 금지한다.
- 배포 명령(`ait deploy`)과 `npm audit fix --force`는 실행하지 않는다.

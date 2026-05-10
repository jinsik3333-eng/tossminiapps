# CLAUDE.md — 몽글 미로 탈출 작업 지침

- 이 앱은 `apps/12-mongle-maze` 범위만 수정한다.
- Toss Game Center는 local/sandbox/unsupported fallback을 유지하고, 종료 후 playId당 1회 점수 제출만 시도한다.
- UI는 390px 모바일 WebView에서 한 손 조작이 가능해야 한다.
- 광고 SDK가 붙기 전까지 사용자 화면에는 광고 시청을 전제로 한 CTA를 노출하지 않는다.
- 현금/포인트/캐시/당첨/보장 표현은 금지한다.
- `ait deploy`와 `npm audit fix --force`는 실행하지 않는다.

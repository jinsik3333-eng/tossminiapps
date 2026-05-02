# Lessons Learned

프로젝트 자기 진화 기록. 앱을 하나 만들 때마다 다음 앱 제작 속도를 줄일 교훈을 누적한다.

## 2026-05-02 초기 세팅

- Apps in Toss 공식 LLM 문서와 AX MCP를 활용하면 SDK/광고/TDS 문맥을 빠르게 확인할 수 있다.
- `create-ait-app`로 WebView + TDS + 광고 샘플 포함 프로젝트를 빠르게 만들 수 있다.
- Codex도 MCP를 지원하므로 `apps-in-toss` MCP를 연결해 사용할 수 있다.
- Codex는 Git 저장소 안에서 쓰는 것이 안정적이므로 프로젝트 루트에 `git init`을 먼저 수행했다.
- `npm audit fix --force`는 공식 `@apps-in-toss/web-framework` 호환성을 깨뜨릴 수 있으므로 즉시 사용하지 않는다.

## 다음에 확인할 것

- 광고 샘플을 실제 결과 화면/상세 처방 화면에 자연스럽게 넣는 패턴.
- TDS 컴포넌트 중 테스트형 앱에 가장 빠르게 쓸 수 있는 조합.
- 2호 앱 복제 시 실제로 바꿔야 하는 파일 목록.

## 2026-05-02 money-leak-test MVP

- 테스트형 MVP는 `질문 배열`, `결과 프로필 맵`, `점수 계산 함수`를 한 파일 안에서 먼저 닫아도 1호 앱 속도에는 충분하다.
- 광고는 결과 상세 처방 버튼에서 `useInAppAds`를 호출하고, 미지원 환경에서는 바로 상세 처방을 여는 fallback이 필요하다.
- 공유는 Apps in Toss SDK 확정 전까지 `navigator.share` + 클립보드 복사 + TDS toast fallback으로 두면 WebView/브라우저 양쪽에서 막히지 않는다.
- 프로덕션 화면에서는 개발용 광고 테스트 링크를 숨겨 첫 화면 CTA를 `테스트 시작하기` 하나로 집중시키는 편이 안정적이다.
- 광고 보상형 상세 처방은 `showAd()` 직후 바로 열면 수익화 의도가 깨지므로 `lastReward` 발생 후 열어야 한다.
- 375~390px 화면에서는 긴 한국어 선택지가 버튼 안에서 두 줄로 자연스럽게 접히도록 `min-height`, `line-height`, 좌측 정렬을 고정하는 편이 안정적이다.

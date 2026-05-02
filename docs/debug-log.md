# Debug Log

Apps in Toss 미니앱 제작 중 발생한 오류와 해결 방법을 기록한다.

## 2026-05-02

### `bs4` 미설치

- 상황: 공식 문서 HTML 파싱 중 `ModuleNotFoundError: No module named 'bs4'` 발생.
- 처리: 공식 `llms.txt`, `llms-full.txt`와 정규식/문서 기반 분석으로 우회.
- 재발 시: 굳이 bs4를 설치하기보다 LLM 문서를 우선 사용.

### 공식 LLM 문서 gzip 형태

- 상황: `/tmp/apps_in_toss_llms-full.txt` 검색 결과가 비정상적으로 0건.
- 원인: gzip 압축 형태.
- 처리: Python `gzip.open`으로 `.md` 파일로 해제.

### `ax --version` 실패

- 상황: `ax --version`은 실패.
- 해결: `ax version` 사용.
- 확인 버전: `0.5.1`.

### `ax search docs "인앱 광고"` 실패

- 해결 명령:

```bash
ax search docs --query "인앱 광고" --limit 5
```

### `npm audit` 취약점

- 상황: `npm audit --omit=dev`에서 22개 취약점 표시.
- 주의: `npm audit fix --force`는 `@apps-in-toss/web-framework` 호환성을 깨뜨릴 수 있음.
- 현재 결정: 빌드가 성공하므로 기능 개발 우선. 강제 수정은 별도 브랜치에서 검증.

### Git 저장소 아님

- 상황: Codex 안정 사용을 위해 Git 필요.
- 해결: 프로젝트 루트에서 `git init` 수행.

# 몽글 매치 퍼즐 APP_CONTEXT

이 파일은 `apps/07-mongle-match-puzzle` 작업 시 필요한 파일만 빠르게 고르기 위한 컨텍스트 맵이다.

## 앱 요약

- 앱명: 몽글 매치 퍼즐
- slug/appName: `mongle-match-puzzle`
- 타입: Apps in Toss game WebView
- 포트: `5180`
- 목표: 20~60초 안에 플레이 가능한 3매치 퍼즐 + 100종 몽글 수집 + 리더보드 보너스
- 현재 상태: 개발 QA 통과, Toss 콘솔/QR 실기기 승인 대기

## 먼저 읽을 파일

1. `../../AGENTS.md`
2. `CLAUDE.md`
3. `APP_CONTEXT.md`
4. 작업 목적별 핵심 파일만 추가로 읽기

## 핵심 파일 구조

```txt
apps/07-mongle-match-puzzle/
├─ APP_CONTEXT.md              # 이 파일. 앱 구조/컨텍스트 로딩 가이드
├─ CLAUDE.md                   # 앱별 에이전트 규칙 참조
├─ granite.config.ts           # Apps in Toss 앱명/포트/WebView type 설정
├─ package.json                # lint/build/dev 스크립트
├─ src/
│  ├─ App.tsx                  # 화면, 상태, 도감, 스와이프/애니메이션 흐름
│  ├─ App.css                  # 모바일 UI, 보드/블록 이동·터짐·낙하 애니메이션
│  ├─ main.tsx                 # React entry
│  ├─ index.css                # 글로벌 기본 스타일
│  └─ lib/
│     ├─ gameLogic.ts          # 3매치 보드 생성/교체/매치/드롭 로직
│     └─ tossGameCenter.ts     # Toss 게임센터 랭킹 submit/open fallback
├─ public/
│  ├─ appsintoss-logo.png      # 기본 로고 자산
│  └─ mongles/premium/         # 실제 앱에서 로드하는 몽글 100종 WebP만 유지
├─ scripts/
│  └─ generate-premium-mongles.py # 100종 몽글 생성/QA 재생성용 스크립트
└─ docs/
   ├─ mongle-character-redesign.md # 캐릭터 리디자인 방향
   └─ skills/                  # 앱 로컬 참조 문서
```

## 작업별 최소 컨텍스트

### UI/문구/레이아웃 수정

읽을 파일:
- `src/App.tsx`
- `src/App.css`
- 필요 시 `APP_CONTEXT.md`

주의:
- 모바일 390px 기준으로 본다.
- 플레이 화면은 `100dvh` 안에 들어와야 한다.
- 보드 스와이프 중 전체 화면 스크롤이 끼어들면 안 된다.
- 플레이 중에는 튜토리/결과/보드를 동시에 길게 노출하지 않는다.

### 3매치 게임 로직 수정

읽을 파일:
- `src/lib/gameLogic.ts`
- `src/App.tsx`의 `playMove`, `Board`, `Tile` 주변
- `src/App.css`의 `.board`, `.tile`, `tile-pop`, `tile-drop-in`

현재 동작:
- 인접 블록 스와이프/클릭 교체
- 유효 매치 시 `swap → matched pop/clear → drop/fill` 순서
- 입력 중복 방지를 위해 애니메이션 중 `disabled`
- 무효 이동은 이동했다가 되돌아오는 피드백

### Toss 게임센터/랭킹 수정

읽을 파일:
- `src/lib/tossGameCenter.ts`
- `src/App.tsx`의 `leaderboardScore`, `submitScoreOnce`, `openLeaderboardSafe` 사용부
- `granite.config.ts`

주의:
- 로컬/브라우저 QA에서는 fallback이 정상이다.
- 실제 성공 여부는 Toss QR 실기기에서 확인한다.

### 몽글 캐릭터/도감 수정

읽을 파일:
- `src/App.tsx`의 `MONGLE_ITEMS`, `MONGLE_POOL`, `MiniCollection`, `MongleArtwork`
- `src/App.css`의 `.mongle-artwork-shell`, `.collection-*`, `.rarity-*`
- `docs/mongle-character-redesign.md`
- `scripts/generate-premium-mongles.py`는 재생성할 때만

자산 규칙:
- 앱이 실제 로드하는 이미지는 `public/mongles/premium/001-*.webp` ~ `100-*.webp`.
- `public/`에는 앱 런타임에 필요한 이미지만 둔다.
- cutout, sample, contact sheet, generation log는 `public/`에 두지 않는다.
- 배경 제거 cutout은 품질 저하가 있어 사용하지 않는다.
- 원본 정사각형 이미지를 둥근 네모 카드로 감싸는 방식이 현재 결정이다.

### 빌드/출시 확인

실행 위치:

```bash
cd /Users/jinsik/Desktop/Workspace/01_project_tossminiapps/apps/07-mongle-match-puzzle
npm run lint && npm run build
```

로컬 미리보기:

```bash
./node_modules/.bin/vite --host 0.0.0.0 --port 5180 --strictPort
```

확인 URL:
- 로컬: `http://localhost:5180/`
- 같은 와이파이 휴대폰: `http://192.168.45.86:5180/` 형태

주의:
- LAN HTTP에서는 `crypto.randomUUID()` 같은 secure-context API가 깨질 수 있으므로 fallback 유지.
- `dist/`, `.granite/`, `*.ait`는 생성물이며 git 추적 대상이 아니다.
- 단, `mongle-match-puzzle.ait`는 Toss 콘솔 업로드를 위한 로컬 산출물이므로 승인 대기 중에는 삭제하지 않는다.

## 현재 정리 상태

- `public/mongles/premium/`에는 앱이 쓰는 100종 WebP만 유지한다.
- QA contact sheet/log/manifest는 `docs/archive/mongle-generation-artifacts/`로 이동했다.
- 폐기된 `redesign-samples`와 cutout 산출물은 제거했다.
- `dist/`는 생성물이므로 필요할 때 build로 다시 만든다.

## 검증 체크리스트

- `npm run lint` 성공
- `npm run build` 성공
- `.ait` 생성 확인
- 홈 → 튜토리 → 플레이 진입 정상
- 보드 스와이프 중 화면 스크롤 없음
- 블록 이동 → 터짐 → 낙하 효과 정상
- 결과/랭킹 fallback/광고 CTA 정상
- 브라우저 콘솔 JS error 없음

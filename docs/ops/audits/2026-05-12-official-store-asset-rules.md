# 2026-05-12 — Apps in Toss 등록 이미지 공식 기준 정리

## 목적

1~6호 앱 검수에서 받은 반려 문구를 공식 문서 기준으로 해석하고, 이후 앱 등록/수정 시 같은 반려가 반복되지 않도록 업로드 기준을 고정한다.

반려 문구:

> 앱 아이콘 및 썸네일은 크롭되지 않으며 배경색이 포함된 꽉 찬 사각형 형태로 제출 부탁드립니다.

## 공식 근거

### 앱 로고/아이콘

공식 Apps in Toss 미니앱 브랜딩 가이드와 콘솔 등록 가이드는 앱 로고를 아래 조건으로 요구한다.

- 600×600px 정사각형 PNG
- 배경색 필수
- 투명 배경 사용 불가
- 둥근 모서리/라운드 처리된 원본 제출 금지
- 라이트/다크 모드 모두에서 선명하게 보여야 함
- 배경이 포함된 로고는 600×600 전체 영역을 채워야 함

참고:
- https://developers-apps-in-toss.toss.im/design/miniapp-branding-guide.html
- https://developers-apps-in-toss.toss.im/prepare/console-workspace.html

### 썸네일

공식 콘솔/등록 가이드는 썸네일에 대해 아래 기준을 둔다.

- 콘솔에서 요구하는 정확한 규격 사용
- 핵심 기능/화면이 한눈에 보이게 구성
- 이미지를 억지로 늘리거나 잘라 쓰지 않음
- 빈 영역을 투명하게 두지 않음
- 너무 많은 텍스트를 넣지 않음
- 저작권 문제가 없는 이미지 사용
- 토스 리소스/브랜드 자산을 썸네일 장식으로 사용하지 않음

현재 1~6호 앱 콘솔 업로드 기준은 저장소 기준 `1932×828` 썸네일을 사용한다.

## 운영 해석

토스 앱 화면에서는 아이콘이 둥글게 보일 수 있지만, 파트너가 업로드하는 원본은 둥근 모서리를 직접 적용하면 안 된다.

- 업로드 원본: 각진 꽉 찬 사각형
- 토스 앱 노출: Toss UI가 자체적으로 필요 라운딩/마스킹 처리

따라서 원본 이미지에는 아래가 없어야 한다.

- 투명 모서리
- 둥근 카드만 떠 있는 형태
- 배경 없는 캐릭터/오브젝트 PNG
- 캔버스 밖으로 잘린 피사체
- 규격을 맞추기 위한 단순 여백/블러 패딩

## 1~6호 앱 현재 적용 기준

- `apps/0X-*/public/app-icon.png`: 600×600, RGB, 투명 픽셀 0
- `apps/0X-*/public/app-logo.png`: 600×600, RGB, 투명 픽셀 0
- `apps/0X-*/public/app-logo-dark.png`: 600×600, RGB, 투명 픽셀 0
- `apps/0X-*/public/thumbnail.png`: 1932×828, RGB, 투명 픽셀 0
- `assets/app-store/*/app-logo-600.png`: 600×600, RGB, 투명 픽셀 0
- `assets/app-store/*/app-logo-dark-600.png`: 600×600, RGB, 투명 픽셀 0
- `assets/app-store/*/thumbnail-1932x828.png`: 1932×828, RGB, 투명 픽셀 0
- `assets/app-store/*/*-appstore-assets.zip`: 위 자산을 최신 상태로 포함

## 검수 전 필수 명령

```bash
python3 scripts/check_store_assets.py
```

통과 문구:

```text
Store assets passed: exact sizes, opaque square canvas, and upload bundles verified.
```

## 콘솔 업로드 원칙

검수 재요청 시에는 `assets/app-store/{slug}/` 아래 파일을 우선 업로드한다.

- `app-logo-600.png`
- `app-logo-dark-600.png`
- `thumbnail-1932x828.png`
- `screenshot-01-636x1048.png`
- `screenshot-02-636x1048.png`
- `screenshot-03-636x1048.png`
- `screenshot-horizontal-1504x741.png`

zip 업로드가 가능하면 `{slug}-appstore-assets.zip`도 최신 상태인지 `scripts/check_store_assets.py`로 확인한 뒤 사용한다.

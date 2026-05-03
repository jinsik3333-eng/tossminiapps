# 4호 앱 MVP 브리프 — 월급 도둑 찾기

## 기본 정보

- 앱명: 월급 도둑 찾기
- 영문명: Salary Thief Finder
- 앱 ID: `salary-thief-finder`
- 앱 경로: `apps/salary-thief-finder`
- 유형: 60초 소비 습관 자가 점검 / 결과 카드형 미니앱
- 한줄 소개: 이번 달 내 월급을 사라지게 한 소비 패턴을 60초만에 점검해요.

## 핵심 컨셉

월급이 들어왔는데 금방 사라지는 느낌을 `월급 도둑` 은유로 풀어낸 생활 소비 습관 테스트입니다. 사용자는 배달비, 편의점, 구독료, 택시비, 할인 쇼핑 등 일상 지출 상황에 직접 답하고, 결과로 가장 강한 소비 패턴 후보와 오늘의 방어 루틴을 받습니다.

## 주요 플로우

1. 홈: 오늘의 사건과 60초 점검 CTA
2. 질문: 5개 소비 상황 선택
3. 결과: 월급 도둑 유형 카드
4. 루틴: 광고 보고 방어 루틴 체크리스트 열기
5. 재방문: 날짜 기반 오늘의 사건 문구 변경

## 결과 유형

- 배달비 도둑
- 편의점 도둑
- 구독료 도둑
- 택시비 도둑
- 할인 쇼핑 도둑

## 정책 안전 문구

- 금융상품 추천, 투자 조언, 대출·보험·카드 중개 기능 없음
- 실제 계좌/카드/결제 내역을 자동조회하지 않음
- 사용자가 직접 선택한 답변 기반의 참고용 생활 소비 습관 콘텐츠
- 현금, 포인트, 쿠폰 등 금전성 보상 없음
- 광고 이후 열리는 항목은 체크리스트/루틴 텍스트 콘텐츠

## 이미지 패키지

- 앱 내부 hero: `apps/salary-thief-finder/src/assets/salary-thief-hero.jpg`
- 앱스토어 이미지 패키지: `assets/app-store/salary-thief-finder/salary-thief-finder-appstore-assets.zip`
- 대표 확인용 이미지: `assets/app-store/salary-thief-finder/contact-sheet.png`
- 생성형 원본 소스: `assets/app-store/salary-thief-finder/sources/salary-thief-hero-source.png`

## 빌드 상태

- `npm run format` 성공
- `npm run lint` 성공
- `npm run build` 성공
- AIT 번들: `apps/salary-thief-finder/salary-thief-finder.ait`
- 최신 build deploymentId: `019dee2a-4c93-78a6-9bec-ed93df964c06`

export const MINI_GAME_SECONDS = 15;
export const MAX_HINTS = 3;
export const MINI_GAME_TRIGGER_CHARGE = 10;
export const QUIZ_CHARGE_MISS_PENALTY = 1;
export const INVINCIBLE_MS = 1500;
export const DASH_MS = 1500;
export const COMBO_BURST_INTERVAL = 10;
export const MISS_LIMIT = 5;
export const MINI_GAME_BASE_INPUT_WINDOW_MS = 600;
export const MINI_GAME_OPENING_INPUT_WINDOW_MS = 1000;
export const CHASE_RUNNER_TARGET_GAP = 1;
export const CHASE_CHASER_EXTRA_GAP = 1;
export const QUIZ_SET_COUNT = 3;
export const QUESTIONS_PER_SET = 100;
const CANDLE_SEED_MAX = 0x7fffffff;
export const QUIZ_BATTLE_CRY_LINES = [
  "단, 한 주도 뺏기지 마라!",
  "개미의 힘을 보여줘!",
  "더 이상 예전의 개미가 아니다!",
  "공매도 벽도 부숴버리겠어!",
  "개미의 미래는 상한가다!",
  "잔고는 울어도 투지는 오른다!",
  "오늘의 한 칸이 내일의 상한가다!",
  "차트 앞에서 물러서지 마라!",
];

export const FIGHTERS = [
  {
    id: "ant-fighter",
    name: "개미 파이터",
    unlockedDefault: true,
    signature: "월급날 생존왕",
    effect: "서울 자가를 꿈꾸며 오늘도 김밥으로 버틴다",
    assist: "cosmetic",
    accent: "#f04438",
  },
  {
    id: "gold-tariff-king",
    name: "금발 관세왕",
    unlockedDefault: false,
    signature: "금발 협상 천재",
    effect: "절대 손해보지 않는 관세 협상의 달인.",
    assist: "cosmetic",
    accent: "#f6c343",
  },
  {
    id: "hoodie-social-king",
    name: "후디 소셜왕",
    unlockedDefault: false,
    signature: "타임라인 과몰입러",
    effect: "좋아요는 잘 누르지만 손절 버튼은 늘 못 찾는다.",
    assist: "cosmetic",
    accent: "#4f7cff",
  },
  {
    id: "rocket-weird-ceo",
    name: "로켓 괴짜 CEO",
    unlockedDefault: false,
    signature: "화성행 야근러",
    effect: "회의 대신 발사를, 잠은 죽어서 자기로 결심했다.",
    assist: "cosmetic",
    accent: "#ff6b3d",
  },
  {
    id: "space-delivery-king",
    name: "우주 택배왕",
    unlockedDefault: false,
    signature: "새벽배송 우주신사",
    effect: "택배 상자처럼 꿈 큰 야망가, 단 반품은 싫어한다.",
    assist: "cosmetic",
    accent: "#7a5cff",
  },
  {
    id: "meme-coin-dog",
    name: "밈 코인 강아지",
    unlockedDefault: false,
    signature: "밈의 대가",
    effect: "이유는 모르겠지만 표정 만큼은 언제나 상한가다.",
    assist: "cosmetic",
    accent: "#f7a928",
  },
  {
    id: "ai-leather-boss",
    name: "AI 가죽재킷 보스",
    unlockedDefault: false,
    signature: "가죽재킷 마스터",
    effect: "ai와 가죽재킷 싸이클은 함께간다고 주장한다.",
    assist: "cosmetic",
    accent: "#50d890",
  },
  {
    id: "memory-chaebol",
    name: "메모리 재벌",
    unlockedDefault: false,
    signature: "RAM 많은 재벌 2세",
    effect: "더 이상 싸이클 산업이 아니라고 주장한다.",
    assist: "cosmetic",
    accent: "#38bdf8",
  },
  {
    id: "semiconductor-chair",
    name: "반도체 회장님",
    unlockedDefault: false,
    signature: "웨이퍼 회장님",
    effect: "말은 느린데 결재 도장은 나노 단위로 찍힌다.",
    assist: "cosmetic",
    accent: "#a3e635",
  },
  {
    id: "ev-artisan",
    name: "전기차 장인",
    unlockedDefault: false,
    signature: "자율주행 혁명가",
    effect: "주차는 못해도 자율주행 전기차 덕분에 달린다.",
    assist: "cosmetic",
    accent: "#22d3ee",
  },
  {
    id: "search-window-sage",
    name: "검색창 현자",
    unlockedDefault: false,
    signature: "검색창 철학자",
    effect: "주가는 기본, 매일 자기 이름도 검색한다.",
    assist: "cosmetic",
    accent: "#ffffff",
  },
  {
    id: "fruit-phone-monk",
    name: "사과폰 수도승",
    unlockedDefault: false,
    signature: "무음모드 수도승",
    effect: "말은 적은데 손과 머리회전은 빠르다.",
    assist: "cosmetic",
    accent: "#e5e7eb",
  },
  {
    id: "dividend-aristo-cat",
    name: "배당 귀족냥",
    unlockedDefault: false,
    signature: "배당 캔 마니아",
    effect: "느긋하게 앉아 있다가 입금 알림에만 귀가 번쩍 뜬다.",
    assist: "cosmetic",
    accent: "#fbbf24",
  },
  {
    id: "disclosure-ninja",
    name: "공시 닌자",
    unlockedDefault: false,
    signature: "공시 새벽반",
    effect: "모두 잠든 새벽에도 정정공시 냄새는 놓치지 않는다.",
    assist: "cosmetic",
    accent: "#818cf8",
  },
  {
    id: "chart-master",
    name: "차트 도사",
    unlockedDefault: false,
    signature: "선 긋는 은둔고수",
    effect: "차트에 선을 긋다 보니 인생의 추세선까지 깨달았다.",
    assist: "cosmetic",
    accent: "#34d399",
  },
  {
    id: "orderbook-hunter",
    name: "호가 사냥꾼",
    unlockedDefault: false,
    signature: "호가창 매의눈",
    effect: "삽겹살 두께보다 매수벽 두께에 더 민감하다.",
    assist: "cosmetic",
    accent: "#60a5fa",
  },
  {
    id: "upper-limit-fairy",
    name: "상한가 요정",
    unlockedDefault: false,
    signature: "빨간봉 축제요정",
    effect: "아주 운 좋은 날만 만난다는 전설의 요정.",
    assist: "cosmetic",
    accent: "#fb7185",
  },
  {
    id: "lower-limit-ghost",
    name: "하한가 유령",
    unlockedDefault: false,
    signature: "파란봉 야근령",
    effect: "잡주에서 자주 출몰한다는 흔한 요정.",
    assist: "cosmetic",
    accent: "#38bdf8",
  },
  {
    id: "diversified-shield",
    name: "분산투자 방패병",
    unlockedDefault: false,
    signature: "바구니 분산러",
    effect: "계란도 자산도 한 곳에 몰아두면 밤잠을 못 잔다.",
    assist: "cosmetic",
    accent: "#f97316",
  },
  {
    id: "loss-cut-swordsman",
    name: "손절 검객",
    unlockedDefault: false,
    signature: "미련 절단 검사",
    effect: "'손절큰 칼 같이 익절은 느긋하게'가 좌우명이다",
    assist: "cosmetic",
    accent: "#c084fc",
  },
];

const scoreByDifficulty = {
  beginner: 10,
  intermediate: 16,
  advanced: 24,
};

const makeQuestion = (
  difficulty,
  index,
  prompt,
  options,
  answerIndex,
  hint,
  topic,
  format = "choice",
) => ({
  id: `${difficulty}-${String(index).padStart(2, "0")}`,
  difficulty,
  format,
  prompt,
  options,
  answerIndex,
  hint,
  topic,
});

function normalizeQuizSetIndex(setIndex = 0) {
  const number = Number(setIndex);
  const safeIndex = Number.isFinite(number) ? Math.trunc(number) : 0;

  return ((safeIndex % QUIZ_SET_COUNT) + QUIZ_SET_COUNT) % QUIZ_SET_COUNT;
}

const beginnerQuestions = [
  makeQuestion("beginner", 1, "한국 주식 차트에서 보통 빨간 캔들은 무엇을 뜻할까?", ["상승", "전일과 같은 보합"], 0, "국내 차트 색상 기준에서는 빨강이 위쪽 힘을 뜻해.", "candlestick", "binary"),
  makeQuestion("beginner", 2, "파란 캔들이 많이 이어졌다는 말에 가장 가까운 뜻은?", ["가격이 내려간 날이 많았다", "거래량이 많아진 날이 많았다"], 0, "색은 결과를 보여줄 뿐 회사의 좋고 나쁨을 확정하지 않아.", "candlestick", "binary"),
  makeQuestion("beginner", 3, "거래량은 무엇을 나타낼까?", ["거래된 주식 수", "종가가 움직인 폭"], 0, "거래량은 손바뀜의 크기야.", "volume", "binary"),
  makeQuestion("beginner", 4, "시가총액을 가장 잘 설명한 것은?", ["주가에 발행 주식 수를 곱한 값", "주가에 하루 거래량을 곱한 값"], 0, "시장 전체가 평가한 회사 크기에 가까운 숫자야.", "fundamental", "binary"),
  makeQuestion("beginner", 5, "배당은 무엇일까?", ["회사가 이익 일부를 주주에게 나누는 것", "주가가 내려갈 때 자동으로 돌려받는 돈"], 0, "배당은 현금이나 주식 형태로 줄 수 있어.", "dividend", "binary"),
  makeQuestion("beginner", 6, "IPO는 어떤 상황을 뜻할까?", ["회사가 처음 공개 시장에 주식을 내놓는 것", "이미 상장된 회사가 배당을 늘리는 것"], 0, "상장 전후에 자금 조달과 거래 시작이 함께 이야기돼.", "market", "binary"),
  makeQuestion("beginner", 7, "지정가 주문은 무엇일까?", ["내가 원하는 가격을 정해 주문하는 방식", "현재 가능한 가격으로 즉시 체결을 노리는 방식"], 0, "가격을 정하면 체결이 늦거나 안 될 수도 있어.", "order", "binary"),
  makeQuestion("beginner", 8, "시장가 주문의 특징은?", ["체결 속도를 우선한다", "체결 가격을 내가 고정한다"], 0, "시장가는 빠르지만 가격은 변할 수 있어.", "order", "binary"),
  makeQuestion("beginner", 9, "PER은 대략 무엇과 관련된 지표일까?", ["이익 대비 주가 수준", "자산 대비 부채 수준"], 0, "PER은 가격과 이익의 관계를 보는 기본 지표야.", "valuation", "binary"),
  makeQuestion("beginner", 10, "PBR은 대략 무엇과 관련될까?", ["순자산 대비 주가 수준", "매출 대비 영업이익 수준"], 0, "PBR은 장부상 자산과 시장 가격을 비교할 때 써.", "valuation", "binary"),
  makeQuestion("beginner", 11, "EPS는 무엇을 뜻할까?", ["주당순이익", "주당순자산"], 0, "이익을 주식 한 주 기준으로 나눈 값이야.", "valuation", "binary"),
  makeQuestion("beginner", 12, "ROE는 무엇을 보는 지표일까?", ["자기자본으로 이익을 얼마나 냈는지", "매출에서 현금이 얼마나 남았는지"], 0, "자본을 얼마나 효율적으로 쓰는지 보는 데 쓰여.", "fundamental", "binary"),
  makeQuestion("beginner", 13, "ETF에 가장 가까운 설명은?", ["여러 자산을 묶어 거래하는 펀드형 상품", "한 기업의 보통주만 따로 거래하는 상품"], 0, "ETF는 거래소에서 주식처럼 거래돼.", "product", "binary"),
  makeQuestion("beginner", 14, "분산투자의 기본 목적은?", ["위험을 여러 자산으로 나누기", "수익률을 매일 고정하기"], 0, "한 바구니에 전부 담지 않는다는 발상이야.", "risk", "binary"),
  makeQuestion("beginner", 15, "차트의 가로축은 보통 무엇을 나타낼까?", ["시간", "가격"], 0, "왼쪽에서 오른쪽으로 시간이 흐르는 구조가 많아.", "chart", "binary"),
  makeQuestion("beginner", 16, "캔들의 몸통은 무엇과 관련될까?", ["시가와 종가", "고가와 저가만"], 0, "몸통은 시작 가격과 끝 가격 사이를 보여줘.", "candlestick", "binary"),
  makeQuestion("beginner", 17, "캔들의 꼬리는 무엇을 보여줄까?", ["장중 고가와 저가의 흔적", "전일 대비 거래대금"], 0, "꼬리는 그 시간 동안 움직였던 범위를 남겨.", "candlestick", "binary"),
  makeQuestion("beginner", 18, "이동평균선은 무엇을 부드럽게 보여줄까?", ["일정 기간 평균 가격", "당일 최고가와 최저가"], 0, "날마다 흔들리는 가격을 평균으로 눌러 보는 선이야.", "technical", "binary"),
  makeQuestion("beginner", 19, "지지선은 보통 어떤 뜻으로 쓰일까?", ["가격이 버티려는 구간", "가격이 막히려는 위쪽 구간"], 0, "반복적으로 밀리지 않던 구간을 말할 때가 많아.", "technical", "binary"),
  makeQuestion("beginner", 20, "저항선은 보통 어떤 뜻으로 쓰일까?", ["가격이 막히려는 구간", "가격이 버티려는 아래쪽 구간"], 0, "반복적으로 넘기 어려웠던 구간을 말해.", "technical", "binary"),
  makeQuestion("beginner", 21, "갭 상승은 어떤 모습일까?", ["전날보다 높은 가격대에서 출발", "전날 종가와 같은 가격에서 출발"], 0, "전일 가격대와 오늘 시작 가격 사이에 빈칸이 생긴 듯 보여.", "chart", "binary"),
  makeQuestion("beginner", 22, "유동성이 좋다는 말에 가까운 뜻은?", ["거래가 비교적 잘 이루어진다", "가격 변동이 전혀 없다"], 0, "유동성은 사고팔기 쉬운 정도와 관련돼.", "market", "binary"),
  makeQuestion("beginner", 23, "호가창은 무엇을 보여줄까?", ["사려는 가격과 팔려는 가격", "회사의 분기별 매출"], 0, "주문이 어느 가격에 쌓였는지 볼 수 있어.", "orderbook", "binary"),
  makeQuestion("beginner", 24, "스프레드는 보통 무엇의 차이를 말할까?", ["매수 호가와 매도 호가", "시가와 종가"], 0, "가격 차이가 넓으면 체결 비용이 커질 수 있어.", "orderbook", "binary"),
  makeQuestion("beginner", 25, "포트폴리오는 무엇일까?", ["보유 자산의 묶음", "한 종목의 당일 차트"], 0, "여러 자산의 구성표라고 보면 쉬워.", "risk", "binary"),
  makeQuestion("beginner", 26, "변동성이 높다는 뜻은?", ["가격 출렁임이 크다", "거래가 항상 잘 된다"], 0, "방향이 아니라 흔들림의 크기를 말해.", "risk", "binary"),
  makeQuestion("beginner", 27, "공시는 왜 중요할까?", ["회사의 중요한 정보를 공식적으로 알리기 때문", "차트 신호를 자동으로 확정하기 때문"], 0, "공시는 투자자가 확인해야 할 공식 정보의 통로야.", "disclosure", "binary"),
  makeQuestion("beginner", 28, "실적 발표에서 많이 보는 것은?", ["매출과 이익", "전일 시가와 종가만"], 0, "기업분석의 기본은 돈을 얼마나 벌었는지 확인하는 거야.", "fundamental", "binary"),
  makeQuestion("beginner", 29, "매출은 무엇에 가까울까?", ["상품이나 서비스 판매 규모", "비용을 뺀 뒤 최종으로 남은 돈"], 0, "매출이 커도 비용이 크면 이익은 작을 수 있어.", "fundamental", "binary"),
  makeQuestion("beginner", 30, "부채비율은 무엇과 관련될까?", ["빚과 자본의 관계", "매출과 주가의 관계"], 0, "재무 안정성을 볼 때 자주 확인해.", "fundamental", "binary"),
  makeQuestion("beginner", 31, "손절이라는 말은 무엇을 뜻할까?", ["손실이 커지기 전 정리하는 원칙", "수익이 날 때 일부를 파는 원칙"], 0, "손절은 위험 관리 방식 중 하나야.", "risk", "binary"),
  makeQuestion("beginner", 32, "이 앱의 퀴즈 목적에 가장 맞는 것은?", ["주식 용어와 원리를 배우기", "특정 종목의 매수 시점을 받기"], 0, "이 앱은 교육용 주식 상식 퀴즈야.", "policy", "binary"),
  makeQuestion("beginner", 33, "가상 차트 퀴즈를 맞히면 미래 가격을 정확히 알 수 있을까?", ["아니다", "그렇다"], 0, "차트 훈련은 이해를 돕지만 미래를 확정하지 않아.", "policy", "ox"),
  makeQuestion("beginner", 34, "배당은 회사 상황에 따라 줄거나 없어질 수 있을까?", ["그렇다", "아니다"], 0, "배당 정책은 이익과 회사 결정에 따라 달라져.", "dividend", "ox"),
  makeQuestion("beginner", 35, "PER이 높으면 항상 나쁜 주식이라고 단정할 수 있을까?", ["아니다", "그렇다"], 0, "성장 기대, 업종 차이, 이익 변동을 함께 봐야 해.", "valuation", "ox"),
  makeQuestion("beginner", 36, "거래량 급증은 관심이 커졌다는 신호일 수 있지만 방향을 보장하지는 않는다.", ["그렇다", "아니다"], 0, "거래량은 열기, 방향은 가격 움직임과 함께 봐야 해.", "volume", "ox"),
  makeQuestion("beginner", 37, "고가는 어떤 값일까?", ["해당 기간 가장 높았던 가격", "해당 기간 마지막 거래 가격"], 0, "캔들의 위쪽 꼬리와 연결해서 보면 쉬워.", "candlestick", "binary"),
  makeQuestion("beginner", 38, "저가는 어떤 값일까?", ["해당 기간 가장 낮았던 가격", "해당 기간 처음 거래 가격"], 0, "캔들의 아래쪽 꼬리와 관련돼.", "candlestick", "binary"),
  makeQuestion("beginner", 39, "권리락이나 배당락 전후에는 무엇이 달라질 수 있을까?", ["기준 가격과 주가 흐름", "거래소의 정규 거래 시간"], 0, "권리 변화는 가격 표시에도 영향을 줄 수 있어.", "market", "binary"),
  makeQuestion("beginner", 40, "거래 비용을 이해할 때 함께 볼 항목은?", ["수수료와 세금", "PER과 PBR만"], 0, "작은 비용도 반복되면 성과에 영향을 줄 수 있어.", "market", "binary"),
];

const intermediateQuestions = [
  makeQuestion("intermediate", 1, "짧은 이동평균선이 긴 이동평균선을 아래에서 위로 넘는 상황을 흔히 무엇이라 부를까?", ["골든크로스", "데드크로스", "권리락", "상장폐지"], 0, "이름은 번쩍 좋아 보이지만 확정 신호는 아니야.", "technical"),
  makeQuestion("intermediate", 2, "짧은 이동평균선이 긴 이동평균선을 위에서 아래로 깨는 상황은?", ["데드크로스", "골든크로스", "배당락", "공모가"], 0, "추세 약화를 말할 때 자주 등장해.", "technical"),
  makeQuestion("intermediate", 3, "긴 위꼬리가 달린 캔들은 어떤 해석이 가능할까?", ["위에서 매도 압력이 있었다", "아래에서 매수세가 강했다", "거래량만 늘었다", "시가와 종가가 같았다"], 0, "올라갔다가 밀린 흔적이야.", "candlestick"),
  makeQuestion("intermediate", 4, "긴 아래꼬리가 달린 캔들은 어떤 해석이 가능할까?", ["아래에서 매수세가 들어왔을 수 있다", "위에서 매도 압력이 컸다", "종가가 시가와 정확히 같았다", "거래량만 줄었다"], 0, "내려갔다가 회복한 흔적이야.", "candlestick"),
  makeQuestion("intermediate", 5, "가격은 오르는데 거래량이 계속 줄면 어떤 점을 조심해 볼 수 있을까?", ["상승 힘이 약할 수 있다", "매수 참여가 더 강해졌다고 단정한다", "유동성이 반드시 좋아졌다", "추세가 확정됐다고 본다"], 0, "가격과 거래량이 같은 방향인지 비교해 봐.", "volume"),
  makeQuestion("intermediate", 6, "RSI 같은 보조지표를 볼 때 가장 중요한 태도는?", ["단독 결론보다 여러 맥락과 함께 본다", "과매수면 바로 매도라고 확정한다", "과매도면 바로 매수라고 확정한다", "거래량은 함께 보지 않는다"], 0, "보조지표는 이름 그대로 보조야.", "technical"),
  makeQuestion("intermediate", 7, "매출이 늘었지만 영업이익이 줄었다면 먼저 의심할 수 있는 것은?", ["비용 증가나 마진 하락", "시가총액 증가만", "주가 변동성 축소", "거래량 증가만"], 0, "많이 팔아도 남는 돈이 줄 수 있어.", "fundamental"),
  makeQuestion("intermediate", 8, "영업이익률은 어떤 질문에 답할 때 유용할까?", ["매출에서 본업 이익이 얼마나 남는가", "자산 대비 주가가 싼가", "배당수익률이 높은가", "주식 수가 얼마나 늘었는가"], 0, "본업의 수익성을 보는 지표야.", "fundamental"),
  makeQuestion("intermediate", 9, "부채비율이 갑자기 높아졌다면 확인할 만한 것은?", ["차입 증가와 현금흐름", "PER 하락 여부만", "거래량 증가 여부만", "배당수익률 상승 여부만"], 0, "빚이 왜 늘었는지와 갚을 힘을 같이 봐.", "fundamental"),
  makeQuestion("intermediate", 10, "현금흐름표가 중요한 이유는?", ["이익과 실제 현금 움직임이 다를 수 있기 때문", "순이익만 보면 충분하기 때문", "주가 방향을 확정하기 때문", "배당금을 항상 보장하기 때문"], 0, "장부상 이익과 현금 유입은 다를 수 있어.", "fundamental"),
  makeQuestion("intermediate", 11, "유상증자는 기존 주주에게 어떤 영향을 줄 수 있을까?", ["주식 수 증가로 지분 희석 가능", "주당 지분이 자동으로 증가", "기준 가격만 바뀌고 주식 수는 그대로", "배당수익률이 무조건 상승"], 0, "자금 조달은 좋을 수도 있지만 희석도 봐야 해.", "market"),
  makeQuestion("intermediate", 12, "무상증자는 보통 어떤 변화와 관련될까?", ["주식 수 증가와 기준 가격 조정", "회사의 현금 유입 증가", "부채비율 자동 개선", "영업이익률 자동 상승"], 0, "총 가치가 바로 늘어난다고 단정하면 안 돼.", "market"),
  makeQuestion("intermediate", 13, "자사주 매입은 시장에서 어떻게 해석될 수 있을까?", ["주주환원이나 저평가 신호로 해석되기도 한다", "신주를 더 발행한다는 뜻이다", "지분 희석이 무조건 커진다", "부채가 항상 0이 된다"], 0, "목적과 규모, 재무 여력을 같이 봐.", "fundamental"),
  makeQuestion("intermediate", 14, "배당수익률을 볼 때 주의할 점은?", ["주가 하락 때문에 높아 보일 수도 있다", "높을수록 항상 안정적이다", "회사 이익과 관계가 없다", "세금과 현금흐름은 볼 필요가 없다"], 0, "분모인 주가가 내려가면 수익률이 높아 보일 수 있어.", "dividend"),
  makeQuestion("intermediate", 15, "PER을 같은 업종끼리 비교하는 이유는?", ["업종별 성장성과 이익 구조가 다르기 때문", "업종이 같으면 주가가 항상 같기 때문", "업종이 다르면 이익을 비교할 수 없기 때문", "시가총액은 업종과 무관하기 때문"], 0, "업종이 다르면 적정 배수도 다를 수 있어.", "valuation"),
  makeQuestion("intermediate", 16, "PBR이 낮아도 추가 확인이 필요한 이유는?", ["자산 가치와 수익성이 함께 중요하기 때문", "낮은 PBR은 항상 좋은 신호이기 때문", "자산이 많으면 이익이 자동 증가하기 때문", "부채가 많을수록 PBR이 정확해지기 때문"], 0, "싸 보이는 이유가 있을 수 있어.", "valuation"),
  makeQuestion("intermediate", 17, "거래량이 적은 종목에서 발생하기 쉬운 문제는?", ["원하는 가격에 거래하기 어려울 수 있다", "가격이 더 정확하게 형성된다", "스프레드가 항상 좁아진다", "호가 공백이 사라진다"], 0, "유동성이 낮으면 스프레드와 체결 위험이 커져.", "market"),
  makeQuestion("intermediate", 18, "호가창에서 매도 잔량이 많다는 것은?", ["그 가격대에 팔려는 주문이 쌓여 있다", "그 가격대에 사려는 주문이 쌓여 있다", "이미 모든 주문이 체결됐다", "거래량이 0이라는 뜻이다"], 0, "잔량은 주문 대기 상태야. 체결 결과와는 달라.", "orderbook"),
  makeQuestion("intermediate", 19, "손익계산서에서 매출총이익을 볼 때 필요한 관점은?", ["제품 원가를 뺀 뒤 남는 힘", "판매관리비까지 뺀 최종 이익", "현금 유입과 유출의 차이", "자본 대비 이익률"], 0, "원가 구조를 이해하는 첫 관문이야.", "fundamental"),
  makeQuestion("intermediate", 20, "영업활동 현금흐름이 계속 마이너스라면?", ["본업에서 현금이 들어오는지 점검해야 한다", "순이익이 있으면 무조건 괜찮다", "부채비율만 보면 충분하다", "배당수익률만 보면 충분하다"], 0, "이익이 나도 현금이 안 들어오면 부담이 될 수 있어.", "fundamental"),
  makeQuestion("intermediate", 21, "가상 차트에서 저점이 높아지고 고점도 높아지는 흐름은?", ["상승 추세로 볼 수 있다", "하락 추세로 볼 수 있다", "박스권으로만 볼 수 있다", "거래량 감소로만 볼 수 있다"], 0, "추세는 고점과 저점의 방향으로 많이 판단해.", "chart-reading"),
  makeQuestion("intermediate", 22, "고점은 낮아지고 저점도 낮아지는 흐름은?", ["하락 추세로 볼 수 있다", "상승 추세로 볼 수 있다", "강한 지지선 형성으로만 본다", "배당락만 의미한다"], 0, "계단이 아래로 내려가는 그림을 떠올려 봐.", "chart-reading"),
  makeQuestion("intermediate", 23, "박스권이라는 말은?", ["일정한 위아래 구간 안에서 움직임", "고점과 저점이 계속 높아지는 흐름", "거래량이 계속 증가하는 흐름", "상한가와 하한가만 반복되는 흐름"], 0, "위아래 경계가 반복되는 상자 같은 흐름이야.", "chart-reading"),
  makeQuestion("intermediate", 24, "상승 돌파를 판단할 때 거래량을 함께 보는 이유는?", ["참여 강도를 확인하기 위해", "기업의 순이익을 계산하기 위해", "배당 기준일을 확인하기 위해", "PER을 직접 계산하기 위해"], 0, "가격만 튀었는지, 참여가 붙었는지 나눠 볼 수 있어.", "volume"),
  makeQuestion("intermediate", 25, "실적 시즌에 주가가 크게 움직이는 이유는?", ["기대와 실제 결과의 차이가 반영될 수 있어서", "모든 기업이 같은 방향으로 움직여서", "거래량이 늘면 가격이 항상 상승해서", "배당이 자동으로 확정돼서"], 0, "시장은 기대를 먼저 가격에 넣기도 해.", "market"),
  makeQuestion("intermediate", 26, "컨센서스는 무엇을 뜻할까?", ["분석가들의 예상치 모음", "회사 내부자의 확정 발표", "거래소의 주문 잔량", "개인 투자자의 평균 매수가"], 0, "예상과 실제가 다르면 반응이 커질 수 있어.", "fundamental"),
  makeQuestion("intermediate", 27, "뉴스 제목만 보고 판단하면 위험한 이유는?", ["맥락과 수치 확인이 빠질 수 있어서", "제목은 공시보다 항상 정확해서", "주가는 뉴스와 무관해서", "원문보다 댓글이 더 중요해서"], 0, "제목은 입구고, 숫자와 원문이 본문이야.", "risk"),
  makeQuestion("intermediate", 28, "분할 매수와 분할 매도의 공통 목적은?", ["시점 위험을 나누기", "손실 가능성을 완전히 없애기", "세금 부담을 없애기", "PER을 낮추기"], 0, "한 번의 판단에 전부 걸지 않는 방식이야.", "risk"),
  makeQuestion("intermediate", 29, "리밸런싱은 무엇일까?", ["자산 비중을 목표에 맞게 다시 조정", "한 종목을 계속 추가 매수", "손실 종목만 모두 제거", "거래량이 많은 종목만 고르기"], 0, "시간이 지나 틀어진 비중을 정리하는 과정이야.", "risk"),
  makeQuestion("intermediate", 30, "백테스트 결과를 볼 때 조심할 점은?", ["과거가 미래를 보장하지 않는다", "과거 수익률은 그대로 반복된다", "수수료와 세금은 무시해도 된다", "짧은 기간일수록 항상 정확하다"], 0, "과최적화와 비용을 같이 봐야 해.", "technical"),
];

const advancedQuestions = [
  makeQuestion("advanced", 1, "가상 A기업의 매출은 20% 늘었지만 영업이익률이 12%에서 7%로 떨어졌다. 가장 먼저 확인할 질문은?", ["원가나 판관비가 왜 늘었는가", "매출 성장률만으로 충분한가", "주가가 단기 반등했는가", "배당수익률이 높아졌는가"], 0, "성장과 수익성은 따로 움직일 수 있어.", "fundamental"),
  makeQuestion("advanced", 2, "가상 차트가 박스권 상단을 돌파했지만 거래량이 평균보다 낮다. 가장 신중한 해석은?", ["돌파 신뢰도를 추가 확인한다", "돌파를 확정 신호로 본다", "이동평균선만 보고 판단한다", "다음 저항선은 보지 않는다"], 0, "돌파에는 참여 강도가 붙는지 보자.", "chart-reading"),
  makeQuestion("advanced", 3, "가상 B기업의 순이익은 늘었지만 영업활동 현금흐름은 계속 악화됐다. 어떤 리스크를 점검할까?", ["매출채권 증가와 현금 회수", "순이익 증가율만 확인", "배당성향 상승만 확인", "PER 하락만 확인"], 0, "이익이 현금으로 바뀌는지 확인해야 해.", "fundamental"),
  makeQuestion("advanced", 4, "부채비율이 높은 기업이 금리 상승기에 받을 수 있는 부담은?", ["이자 비용 증가", "원가율 하락", "주식 수 감소", "배당락 효과"], 0, "차입 비용이 실적을 압박할 수 있어.", "macro"),
  makeQuestion("advanced", 5, "PER이 낮은데도 주가가 계속 약한 경우 가능한 설명은?", ["이익 감소가 예상되는 가치 함정일 수 있다", "낮은 PER은 항상 저평가다", "PBR만 보면 충분하다", "단기 거래량만 보면 충분하다"], 0, "싸 보이는 가격에는 이유가 숨어 있을 수 있어.", "valuation"),
  makeQuestion("advanced", 6, "성장주는 높은 PER을 받을 수 있지만 무엇을 함께 확인해야 할까?", ["성장 지속성과 이익 전환 가능성", "현재 주가가 최고가인지", "배당수익률만 높은지", "단기 캔들 색만 강한지"], 0, "기대가 숫자로 이어지는지 봐야 해.", "valuation"),
  makeQuestion("advanced", 7, "배당수익률이 높은데 현금흐름이 약한 회사라면?", ["배당 지속 가능성을 점검한다", "시가총액 순위만 확인한다", "최근 주가 상승률만 본다", "배당락 날짜만 확인한다"], 0, "배당은 줄 돈이 있어야 오래 간다.", "dividend"),
  makeQuestion("advanced", 8, "가상 C기업이 대규모 투자 계획을 발표했다. 확인할 핵심은?", ["투자 재원과 기대 수익", "발표 문구의 긍정성", "단기 거래량 변화", "최근 고가 돌파 여부"], 0, "성장 투자인지 부담인지 숫자로 봐야 해.", "fundamental"),
  makeQuestion("advanced", 9, "가상 차트에서 상승 추세 중 거래량이 터진 장대음봉이 나왔다. 가능한 해석은?", ["차익 실현이나 추세 변화 압력", "건강한 조정으로 확정", "배당 기대 증가로 해석", "거래량 의미는 작다고 본다"], 0, "큰 거래와 큰 하락은 힘의 변화를 의심하게 해.", "technical"),
  makeQuestion("advanced", 10, "단기 급등 후 변동성이 커질 때 위험 관리는 어떻게 접근할까?", ["진입가, 손실 한도, 비중을 미리 정한다", "상승 추세만 믿고 비중을 늘린다", "손절 기준 없이 평균단가만 낮춘다", "거래량이 늘면 계획을 생략한다"], 0, "계획 없는 속도전은 차트 훈련에서도 위험해.", "risk"),
  makeQuestion("advanced", 11, "업종 전체가 좋아 보일 때 개별 기업을 따로 봐야 하는 이유는?", ["같은 업종 안에서도 경쟁력과 재무가 다르다", "업종 평균 PER만 보면 충분하다", "주가 상승률이 같아진다", "매출 구조가 모두 같아진다"], 0, "업종 바람과 회사 체력은 둘 다 봐야 해.", "fundamental"),
  makeQuestion("advanced", 12, "원자재 가격 상승이 제조 기업에 줄 수 있는 영향은?", ["마진 압박", "매출 인식 기준 변경", "주식 수 희석", "배당성향 상승"], 0, "원가가 오르면 가격 전가력이 중요해져.", "macro"),
  makeQuestion("advanced", 13, "환율 상승이 수출 기업과 수입 기업에 다르게 작용할 수 있는 이유는?", ["매출 통화와 비용 통화가 다르기 때문", "모든 기업이 같은 환율 효과를 받기 때문", "수출 기업은 비용이 없기 때문", "수입 기업은 매출이 고정되기 때문"], 0, "어디서 벌고 어디서 쓰는지 봐야 해.", "macro"),
  makeQuestion("advanced", 14, "재고가 빠르게 늘고 매출 성장이 둔화되면 무엇을 의심할 수 있을까?", ["수요 둔화나 재고 평가 부담", "단기 매출 회복 확정", "현금흐름 개선 확정", "배당 확대 가능성만"], 0, "팔리지 않은 물건은 비용 문제가 될 수 있어.", "fundamental"),
  makeQuestion("advanced", 15, "가상 기업의 ROE가 높지만 부채도 매우 높다. 어떤 관점이 필요할까?", ["레버리지로 ROE가 높아졌는지 확인", "ROE만으로 수익성을 확정한다", "영업이익률은 볼 필요가 없다", "현금흐름은 부채와 무관하다"], 0, "좋은 수익성인지, 빚의 힘인지 구분해야 해.", "valuation"),
  makeQuestion("advanced", 16, "상승 추세에서 20일선 부근 반등이 반복된다. 이를 어떻게 다룰까?", ["지지 후보로 보되 이탈 가능성도 관리한다", "20일선 반등은 항상 성공한다", "거래량 확인은 생략한다", "손실 한도는 필요 없다"], 0, "반복은 단서지만 보증서는 아니야.", "technical"),
  makeQuestion("advanced", 17, "실적은 좋은데 주가가 하락하는 경우 가능한 이유는?", ["기대치가 더 높았거나 가이던스가 약했을 수 있다", "좋은 실적이면 당일 상승이 확정된다", "시장은 기대보다 과거 실적만 본다", "컨센서스 차이는 중요하지 않다"], 0, "시장은 결과뿐 아니라 기대와 다음 이야기도 봐.", "market"),
  makeQuestion("advanced", 18, "거래량 없는 급등 후 호가 공백이 큰 상황의 위험은?", ["작은 주문에도 가격이 크게 흔들릴 수 있다", "체결 가격이 안정된다고 본다", "스프레드가 자연히 좁아진다", "잔량이 충분하다고 단정한다"], 0, "유동성이 얇으면 빠져나오기 어려울 수 있어.", "orderbook"),
  makeQuestion("advanced", 19, "자사주 소각이 주당 가치에 긍정적으로 해석될 수 있는 이유는?", ["유통 주식 수가 줄어 주당 몫이 커질 수 있어서", "매출총이익률이 자동 개선돼서", "차입금이 바로 줄어들어서", "영업현금흐름이 확정적으로 늘어서"], 0, "주식 수 변화는 주당 지표에 영향을 줘.", "fundamental"),
  makeQuestion("advanced", 20, "가상 D기업이 일회성 이익으로 순이익이 급증했다. 볼 포인트는?", ["반복 가능한 이익인지 구분", "순이익 증가율만으로 평가", "주가 반응만 보고 판단", "배당 가능성만 확인"], 0, "지속 가능한 이익과 일회성 이익은 가치가 달라.", "fundamental"),
  makeQuestion("advanced", 21, "장기 투자 관점에서 기업의 해자를 본다는 말은?", ["경쟁사가 쉽게 따라오기 어려운 강점 확인", "단기 이동평균선 위치 확인", "배당락 전후 가격 확인", "일회성 이익 규모 확인"], 0, "가격보다 사업의 방어력을 묻는 질문이야.", "fundamental"),
  makeQuestion("advanced", 22, "가상 차트가 전고점을 돌파했다가 바로 아래로 내려왔다. 흔한 표현은?", ["가짜 돌파 가능성", "강한 돌파 확정", "저항선이 완전히 사라짐", "지지선 확정"], 0, "돌파 후 유지 여부가 중요해.", "chart-reading"),
  makeQuestion("advanced", 23, "분산투자를 해도 남는 위험은?", ["시장 전체가 흔들리는 위험", "개별 기업 위험이 더 커지는 효과", "거래 비용이 사라지는 효과", "현금 비중이 자동 증가하는 효과"], 0, "분산은 위험을 줄일 수 있지만 없애지는 못해.", "risk"),
  makeQuestion("advanced", 24, "레버리지 상품을 이해할 때 가장 중요한 점은?", ["손익 변동이 확대될 수 있다", "원금 보장 성격이 강하다", "거래 비용 영향이 작다고 본다", "장기 결과가 단순 배수로만 움직인다"], 0, "배율은 속도를 올리지만 충격도 키워.", "risk"),
  makeQuestion("advanced", 25, "기업의 매출 성장률은 높은데 고객 한 곳 의존도가 크다면?", ["주요 고객 이탈 위험을 확인한다", "매출 성장률만으로 안정성을 판단한다", "고객 집중도는 실적과 무관하다", "부채비율이 자동 개선된다고 본다"], 0, "한 고객에게 기대면 협상력과 안정성이 흔들릴 수 있어.", "fundamental"),
  makeQuestion("advanced", 26, "주가가 긴 기간 횡보한 뒤 거래량과 함께 상단을 넘는다면?", ["관심 증가와 추세 전환 가능성을 관찰", "미래 수익을 확정한다", "공시 확인은 생략한다", "손실 가능성을 0으로 본다"], 0, "가능성과 확정은 다르다. 확인과 관리가 같이 가야 해.", "chart-reading"),
  makeQuestion("advanced", 27, "가상 E기업이 신사업을 발표했지만 기존 사업 적자가 커지고 있다. 균형 잡힌 질문은?", ["신사업 기대와 기존 손실 부담을 함께 본다", "신사업 발표만으로 판단한다", "성장 기업이면 적자는 항상 무시한다", "현금흐름보다 제목을 우선한다"], 0, "새 이야기와 현재 체력을 같이 봐.", "fundamental"),
  makeQuestion("advanced", 28, "동일한 이익이라도 안정적인 반복 매출 기업이 더 높은 평가를 받을 수 있는 이유는?", ["미래 현금흐름 예측이 상대적으로 쉽기 때문", "단기 캔들 변동이 더 작기 때문", "호가 스프레드가 항상 좁기 때문", "PER 계산이 필요 없어지기 때문"], 0, "예측 가능성은 평가 배수에 영향을 줄 수 있어.", "valuation"),
  makeQuestion("advanced", 29, "하락장에서 현금 비중을 일부 두는 전략의 의미는?", ["변동성 대응 여력 확보", "모든 손실 제거", "거래세 절감 확정", "배당수익률 고정"], 0, "현금은 기회와 방어 양쪽의 선택권이 될 수 있어.", "risk"),
  makeQuestion("advanced", 30, "투자 기록을 남기는 가장 큰 이유는?", ["판단 근거와 감정 실수를 복기하기 위해", "다음 가격을 정확히 맞히기 위해", "공시 확인을 대신하기 위해", "거래 비용을 없애기 위해"], 0, "복기는 다음 판단을 더 차분하게 만들어.", "learning"),
];

const baseQuizQuestions = [
  ...beginnerQuestions,
  ...intermediateQuestions,
  ...advancedQuestions,
];

const quizQuestionGroups = [
  beginnerQuestions,
  intermediateQuestions,
  advancedQuestions,
];

const quizSetRotations = [
  [0, 0, 0],
  [13, 9, 8],
  [27, 19, 17],
];

const quizSetVariants = [
  {
    label: "1세트",
    promptPrefix: "",
  },
  {
    label: "2세트 실전 복습",
    promptPrefix: "실전 복습 2세트. ",
  },
  {
    label: "3세트 고수 점검",
    promptPrefix: "고수 점검 3세트. ",
  },
];

function rotateQuestions(questions, amount = 0) {
  const offset = amount % questions.length;

  return [...questions.slice(offset), ...questions.slice(0, offset)];
}

function getBaseQuestionsForSet(setIndex) {
  const rotations = quizSetRotations[setIndex] ?? quizSetRotations[0];

  if (setIndex === 0) {
    return baseQuizQuestions;
  }

  return quizQuestionGroups.flatMap((questions, groupIndex) =>
    rotateQuestions(questions, rotations[groupIndex] ?? 0),
  );
}

function makeQuestionForSet(question, setIndex) {
  const setNumber = setIndex + 1;
  const variant = quizSetVariants[setIndex] ?? quizSetVariants[0];

  return {
    ...question,
    id: `set-${setNumber}-${question.id}`,
    quizSetIndex: setIndex,
    setLabel: variant.label,
    prompt:
      setIndex === 0
        ? question.prompt
        : `${variant.promptPrefix}${question.prompt}`,
    hint: question.hint,
  };
}

export const QUIZ_SETS = Array.from({ length: QUIZ_SET_COUNT }, (_, setIndex) =>
  getBaseQuestionsForSet(setIndex).map((question) =>
    makeQuestionForSet(question, setIndex),
  ),
);

export const QUIZ_QUESTIONS = QUIZ_SETS.flat();

export function getQuizQuestionsForSet(setIndex = 0) {
  return QUIZ_SETS[normalizeQuizSetIndex(setIndex)];
}

export function getDifficultyCounts(questions = QUIZ_QUESTIONS) {
  return questions.reduce(
    (counts, question) => ({
      ...counts,
      [question.difficulty]: counts[question.difficulty] + 1,
    }),
    { beginner: 0, intermediate: 0, advanced: 0 },
  );
}

function stableHash(value) {
  return [...String(value)].reduce(
    (hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0,
    2166136261,
  );
}

export function getQuestionChoices(question) {
  const options = question.options.map((label, originalIndex) => ({
    label,
    originalIndex,
  }));

  if (options.length <= 1) {
    return options;
  }

  const offset = stableHash(question.id) % options.length;

  return options.map((_, displayIndex) => {
    const originalIndex =
      (displayIndex - offset + options.length) % options.length;
    return options[originalIndex];
  });
}

export function getQuizBattleCry(answeredCount = 0) {
  const safeCount = Math.max(0, Number(answeredCount) || 0);
  const index = Math.floor(safeCount / 2) % QUIZ_BATTLE_CRY_LINES.length;

  return QUIZ_BATTLE_CRY_LINES[index];
}

export function getChaseActorIndexes({
  targetIndex,
  distance = MISS_LIMIT,
  maxIndex,
}) {
  const safeTarget = Math.max(0, Number(targetIndex) || 0);
  const safeMax = Math.max(0, Number(maxIndex) || safeTarget);
  const safeDistance = Math.max(
    0,
    Math.min(MISS_LIMIT, Number(distance) || 0),
  );
  const runnerBackPressure = MISS_LIMIT - safeDistance;
  const runnerIndex = Math.max(
    0,
    Math.min(
      safeMax,
      safeTarget - CHASE_RUNNER_TARGET_GAP - runnerBackPressure,
    ),
  );
  const chaserIndex = Math.max(
    0,
    runnerIndex - safeDistance - CHASE_CHASER_EXTRA_GAP,
  );

  return {
    runnerIndex,
    chaserIndex,
    targetIndex: safeTarget,
  };
}

export function createAppState(overrides = {}) {
  return {
    score: 0,
    correctStreak: 0,
    quizCharge: 0,
    answeredCount: 0,
    correctCount: 0,
    hints: 0,
    fighterUnlockTickets: 0,
    reviveTickets: 0,
    selectedFighterId: "ant-fighter",
    unlockedFighterIds: [],
    quizSetIndex: 0,
    quizCursor: 0,
    miniGameRuns: 0,
    completed: false,
    hasSeenIntro: false,
    endingRewardClaimed: false,
    ...overrides,
  };
}

export function getFighterById(fighterId) {
  return (
    FIGHTERS.find((fighter) => fighter.id === fighterId) ?? FIGHTERS[0]
  );
}

export function getUnlockedFighterIds(state) {
  return [
    ...new Set([
      ...FIGHTERS.filter((fighter) => fighter.unlockedDefault).map(
        (fighter) => fighter.id,
      ),
      ...(state.unlockedFighterIds ?? []),
    ]),
  ];
}

function getLockedHiddenFighters(state) {
  const unlocked = new Set(getUnlockedFighterIds(state));

  return FIGHTERS.filter(
    (fighter) => !fighter.unlockedDefault && !unlocked.has(fighter.id),
  );
}

function randomIndex(length, random = Math.random) {
  if (length <= 0) {
    return -1;
  }

  const value = Number(random());
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(0.999999, value)) : 0;

  return Math.floor(safeValue * length);
}

export function canUnlockFighter(state) {
  return getLockedHiddenFighters(state).length > 0;
}

export function unlockRandomHiddenFighter(state, random = Math.random) {
  const lockedFighters = getLockedHiddenFighters(state);
  const fighter = lockedFighters[randomIndex(lockedFighters.length, random)];

  if (fighter == null) {
    return {
      unlocked: false,
      reason: "all-unlocked",
      fighter: null,
      state: { ...state, fighterUnlockTickets: 0 },
    };
  }

  return {
    unlocked: true,
    reason: "random-unlocked",
    fighter,
    state: {
      ...state,
      fighterUnlockTickets: 0,
      selectedFighterId: fighter.id,
      unlockedFighterIds: [...new Set([...(state.unlockedFighterIds ?? []), fighter.id])],
    },
  };
}

export function claimEndingRandomFighterReward(state, random = Math.random) {
  if (!state.completed) {
    return {
      claimed: false,
      unlocked: false,
      reason: "not-completed",
      fighter: null,
      state,
    };
  }

  if (state.endingRewardClaimed) {
    return {
      claimed: false,
      unlocked: false,
      reason: "already-claimed",
      fighter: null,
      state,
    };
  }

  const result = unlockRandomHiddenFighter(state, random);

  return {
    ...result,
    claimed: true,
    state: {
      ...result.state,
      endingRewardClaimed: true,
    },
  };
}

export function unlockFighter(state, fighterId) {
  const fighter = getFighterById(fighterId);
  const unlocked = new Set(getUnlockedFighterIds(state));

  if (fighter.unlockedDefault || unlocked.has(fighter.id)) {
    return { unlocked: false, reason: "already-unlocked", state };
  }

  if ((state.fighterUnlockTickets ?? 0) <= 0) {
    return { unlocked: false, reason: "no-ticket", state };
  }

  return {
    unlocked: true,
    reason: "unlocked",
    state: {
      ...state,
      fighterUnlockTickets: state.fighterUnlockTickets - 1,
      selectedFighterId: fighter.id,
      unlockedFighterIds: [...(state.unlockedFighterIds ?? []), fighter.id],
    },
  };
}

export function selectFighter(state, fighterId) {
  const unlocked = new Set(getUnlockedFighterIds(state));

  if (!unlocked.has(fighterId)) {
    return state;
  }

  return { ...state, selectedFighterId: fighterId };
}

export function resetQuizProgress(state) {
  const currentSetIndex = normalizeQuizSetIndex(state.quizSetIndex ?? 0);
  const nextSetIndex =
    state.completed || (state.quizCursor ?? 0) >= QUESTIONS_PER_SET
      ? normalizeQuizSetIndex(currentSetIndex + 1)
      : currentSetIndex;

  return createAppState({
    hasSeenIntro: state.hasSeenIntro ?? false,
    hints: state.hints ?? 0,
    fighterUnlockTickets: state.fighterUnlockTickets ?? 0,
    reviveTickets: state.reviveTickets ?? 0,
    selectedFighterId: state.selectedFighterId ?? "ant-fighter",
    unlockedFighterIds: [...new Set(state.unlockedFighterIds ?? [])],
    quizSetIndex: nextSetIndex,
  });
}

export function applyQuizAnswer(state, question, selectedOptionIndex) {
  const isCorrect = selectedOptionIndex === question.answerIndex;
  const currentCharge = state.quizCharge ?? 0;
  const nextStreak = isCorrect ? (state.correctStreak ?? 0) + 1 : 0;
  const nextCharge = isCorrect
    ? currentCharge + 1
    : Math.max(0, currentCharge - QUIZ_CHARGE_MISS_PENALTY);
  const shouldLaunchMiniGame =
    isCorrect && nextCharge >= MINI_GAME_TRIGGER_CHARGE;
  const setQuestionCount = getQuizQuestionsForSet(state.quizSetIndex).length;
  const nextCursor = Math.min(state.quizCursor + 1, setQuestionCount);

  return {
    isCorrect,
    shouldLaunchMiniGame,
    state: {
      ...state,
      score:
        state.score + (isCorrect ? scoreByDifficulty[question.difficulty] : 0),
      answeredCount: state.answeredCount + 1,
      correctCount: state.correctCount + (isCorrect ? 1 : 0),
      correctStreak: nextStreak,
      quizCharge: shouldLaunchMiniGame ? 0 : nextCharge,
      quizCursor: nextCursor,
      completed: nextCursor >= setQuestionCount,
    },
  };
}

export function useHint(state) {
  if (state.hints <= 0) {
    return { used: false, state };
  }

  return { used: true, state: { ...state, hints: state.hints - 1 } };
}

function shieldChargesFor() {
  return 0;
}

export function getMiniGameInputWindowMs(game = {}) {
  return (game.combo ?? 0) > 0 ||
    (game.mistakes ?? 0) > 0 ||
    (game.lateStrikes ?? 0) > 0 ||
    (game.score ?? 0) > 0
    ? MINI_GAME_BASE_INPUT_WINDOW_MS
    : MINI_GAME_OPENING_INPUT_WINDOW_MS;
}

export function createMiniGameState(fighterId = "ant-fighter") {
  return {
    fighterId,
    candleSeed: Math.floor(Math.random() * CANDLE_SEED_MAX) + 1,
    remainingMs: MINI_GAME_SECONDS * 1000,
    combo: 0,
    bestCombo: 0,
    score: 0,
    mistakes: 0,
    distance: MISS_LIMIT,
    invincibleMs: 0,
    dashMs: 0,
    effectBursts: 0,
    shieldCharges: shieldChargesFor(),
    inputDueMs: getMiniGameInputWindowMs(),
    lateStrikes: 0,
    hintEarned: false,
    ended: false,
    result: "running",
  };
}

function candleNoise(step, seed, salt = 0) {
  let value = (Math.imul(step + 0x9e3779b9, 0x85ebca6b) ^ Math.imul(seed + salt, 0xc2b2ae35)) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d) >>> 0;
  value ^= value >>> 15;
  value = Math.imul(value, 0x846ca68b) >>> 0;
  value ^= value >>> 16;
  return value >>> 0;
}

export function createCandle(step = 0, seed = 0) {
  const direction = candleNoise(step, seed) % 100 < 52 ? "up" : "down";
  const body = 30 + (candleNoise(step, seed, 17) % 48);
  const wick = 10 + (candleNoise(step, seed, 41) % 22);

  return {
    id: `candle-${step}`,
    direction,
    body,
    wick,
  };
}

export function tickMiniGame(game, elapsedMs, options = {}) {
  if (game.ended) {
    return game;
  }

  let nextGame = {
    ...game,
    remainingMs: Math.max(0, game.remainingMs - elapsedMs),
    invincibleMs: Math.max(0, game.invincibleMs - elapsedMs),
    dashMs: Math.max(0, game.dashMs - elapsedMs),
  };

  if (options.applyLatePenalty) {
    let inputDueMs =
      (game.inputDueMs ?? getMiniGameInputWindowMs(game)) - elapsedMs;

    while (inputDueMs <= 0 && !nextGame.ended && nextGame.remainingMs > 0) {
      nextGame = applyMiniGameMiss({ ...nextGame, inputDueMs }, true);
      inputDueMs += getMiniGameInputWindowMs(nextGame);
    }

    nextGame.inputDueMs = Math.max(0, inputDueMs);
  }

  if (!nextGame.ended && nextGame.remainingMs === 0) {
    return {
      ...nextGame,
      ended: true,
      result: "survived",
    };
  }

  return nextGame;
}

export function resolveCandleInput(game, candle, input) {
  if (game.ended) {
    return game;
  }

  const correctInput = candle.direction === "up" ? "up" : "down";
  const isCorrect = input === correctInput;
  const isProtected = game.invincibleMs > 0;

  if (isCorrect || isProtected) {
    const nextCombo = game.combo + 1;
    const burst = nextCombo % COMBO_BURST_INTERVAL === 0;
    const scoreMultiplier = game.dashMs > 0 || burst ? 2 : 1;

    const nextGame = {
      ...game,
      combo: nextCombo,
      bestCombo: Math.max(game.bestCombo, nextCombo),
      score: game.score + 10 * scoreMultiplier,
      distance: Math.min(MISS_LIMIT, (game.distance ?? MISS_LIMIT) + 1),
      invincibleMs: burst ? INVINCIBLE_MS : game.invincibleMs,
      dashMs: burst ? DASH_MS : game.dashMs,
      effectBursts: game.effectBursts + (burst ? 1 : 0),
      hintEarned: game.hintEarned || burst,
    };

    return {
      ...nextGame,
      inputDueMs: getMiniGameInputWindowMs(nextGame),
    };
  }

  const nextGame = applyMiniGameMiss(game, false);

  return {
    ...nextGame,
    inputDueMs: getMiniGameInputWindowMs(nextGame),
  };
}

function applyMiniGameMiss(game, isLate) {
  const lateStrikes = (game.lateStrikes ?? 0) + (isLate ? 1 : 0);

  if (game.shieldCharges > 0) {
    return {
      ...game,
      shieldCharges: game.shieldCharges - 1,
      combo: 0,
      lateStrikes,
    };
  }

  const nextMistakes = game.mistakes + 1;
  const nextDistance = Math.max(0, game.distance - 1);
  const ko = nextMistakes >= MISS_LIMIT || nextDistance === 0;

  return {
    ...game,
    combo: 0,
    mistakes: nextMistakes,
    distance: nextDistance,
    lateStrikes,
    ended: ko,
    result: ko ? "ko" : "running",
  };
}

export function finishMiniGame(state, game) {
  return {
    ...state,
    hints: game.hintEarned ? Math.min(MAX_HINTS, state.hints + 1) : state.hints,
    score: state.score + game.score,
    miniGameRuns: state.miniGameRuns + 1,
  };
}

export function completeRewardedAd(state, rewardKind, random = Math.random) {
  if (rewardKind === "fighter-unlock") {
    return unlockRandomHiddenFighter(state, random).state;
  }

  if (rewardKind === "revive") {
    return { ...state, reviveTickets: state.reviveTickets + 1 };
  }

  return state;
}

export function reviveMiniGame(state, game) {
  if (state.reviveTickets <= 0 || !game.ended || game.result !== "ko") {
    return { revived: false, state, game };
  }

  return {
    revived: true,
    state: { ...state, reviveTickets: state.reviveTickets - 1 },
    game: {
      ...game,
      ended: false,
      result: "running",
      mistakes: Math.max(0, game.mistakes - 1),
      distance: Math.max(1, game.distance + 1),
      combo: 0,
    },
  };
}

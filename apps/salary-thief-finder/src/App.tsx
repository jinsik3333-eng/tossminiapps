import { useMemo, useState } from "react";

import "./App.css";
import salaryThiefHero from "./assets/salary-thief-hero.jpg";

type ThiefType =
  | "delivery"
  | "convenience"
  | "subscription"
  | "taxi"
  | "shopping";

type Choice = {
  label: string;
  description: string;
  thief: ThiefType;
};

type Question = {
  title: string;
  subtitle: string;
  choices: Choice[];
};

type ResultMeta = {
  title: string;
  thiefName: string;
  quote: string;
  pattern: string;
  routine: string;
  color: string;
};

const QUESTIONS: Question[] = [
  {
    title: "월급 들어온 첫날, 제일 먼저 하는 건?",
    subtitle: "이번 달 월급을 가장 먼저 데려가는 순간을 골라주세요.",
    choices: [
      {
        label: "고생했으니 배달",
        description: "첫날부터 맛있는 걸로 보상해요",
        thief: "delivery",
      },
      {
        label: "편의점 들르기",
        description: "작은 간식과 음료를 자주 사요",
        thief: "convenience",
      },
      {
        label: "미뤄둔 쇼핑",
        description: "장바구니를 한 번에 정리해요",
        thief: "shopping",
      },
    ],
  },
  {
    title: "퇴근길에 피곤할 때 가까운 선택은?",
    subtitle: "자주 반복되는 선택일수록 월급 도둑 후보가 됩니다.",
    choices: [
      {
        label: "택시 먼저 확인",
        description: "집까지 편하게 가는 게 우선이에요",
        thief: "taxi",
      },
      {
        label: "편의점 한 바퀴",
        description: "작은 보상을 하나씩 챙겨요",
        thief: "convenience",
      },
      {
        label: "배달앱 켜기",
        description: "오늘도 저녁 준비는 패스해요",
        thief: "delivery",
      },
    ],
  },
  {
    title: "앱 결제 알림을 보면 보통 어떻게 해요?",
    subtitle: "자동결제는 조용히 월급을 데려갈 수 있어요.",
    choices: [
      {
        label: "나중에 확인",
        description: "일단 바빠서 넘기는 편이에요",
        thief: "subscription",
      },
      {
        label: "쓰는 앱만 남김",
        description: "가끔 정리해서 괜찮은 편이에요",
        thief: "shopping",
      },
      {
        label: "뭔지 잘 모름",
        description: "결제명만 보고 넘어갈 때가 많아요",
        thief: "subscription",
      },
    ],
  },
  {
    title: "할인 문구를 봤을 때 가장 가까운 반응은?",
    subtitle: "싸게 산 것 같아도 필요 없으면 도둑 후보예요.",
    choices: [
      {
        label: "일단 담아둠",
        description: "나중에 필요할 수도 있으니까요",
        thief: "shopping",
      },
      {
        label: "무료배송 맞춤",
        description: "배송비 아끼려다 하나 더 사요",
        thief: "delivery",
      },
      {
        label: "편의점 행사 체크",
        description: "1+1이면 지나치기 어려워요",
        thief: "convenience",
      },
    ],
  },
  {
    title: "이번 달 카드값에서 제일 의심되는 건?",
    subtitle: "정답보다 내 생활에 가까운 쪽을 골라주세요.",
    choices: [
      {
        label: "이동비",
        description: "택시·대리·급한 이동이 쌓였어요",
        thief: "taxi",
      },
      {
        label: "자동결제",
        description: "구독과 멤버십이 애매하게 남아있어요",
        thief: "subscription",
      },
      {
        label: "소소한 쇼핑",
        description: "작은 물건이 여러 번 쌓였어요",
        thief: "shopping",
      },
    ],
  },
];

const RESULTS: Record<ThiefType, ResultMeta> = {
  delivery: {
    title: "배달비 도둑",
    thiefName: "쿠폰 든 배달 도둑",
    quote: "할인은 챙겼는데 배달 횟수가 월급을 데려가고 있어요.",
    pattern:
      "무료배송 기준 맞추기, 사이드 추가, 늦은 저녁 주문이 반복되는 편이에요.",
    routine: "오늘은 배달앱을 열기 전에 냉장고 사진 한 장을 먼저 확인해요.",
    color: "#3182f6",
  },
  convenience: {
    title: "편의점 도둑",
    thiefName: "작은 결제 수집가",
    quote: "한 번은 작지만, 여러 번이면 월급 봉투가 가벼워져요.",
    pattern: "커피, 간식, 행사 상품처럼 소액 결제가 자주 쌓이는 타입이에요.",
    routine: "오늘은 편의점에 들어가기 전 살 것 1개만 메모해요.",
    color: "#12b886",
  },
  subscription: {
    title: "구독료 도둑",
    thiefName: "조용한 자동결제 그림자",
    quote: "안 쓰는 앱도 결제일에는 아주 성실하게 찾아와요.",
    pattern:
      "무료체험, 멤버십, 클라우드, 콘텐츠 구독을 나중에 확인하는 편이에요.",
    routine: "오늘은 결제 알림함에서 모르는 이름 1개만 찾아봐요.",
    color: "#7048e8",
  },
  taxi: {
    title: "택시비 도둑",
    thiefName: "피곤한 퇴근길의 유혹",
    quote: "급한 이동이 반복되면 월급 도둑은 조용히 커져요.",
    pattern: "비 오는 날, 늦은 약속, 피곤한 퇴근길에 이동비가 자주 늘어요.",
    routine: "오늘은 호출 전에 대중교통 도착 시간만 한 번 확인해요.",
    color: "#f76707",
  },
  shopping: {
    title: "할인 쇼핑 도둑",
    thiefName: "장바구니 잠복범",
    quote: "싸게 산 물건보다 안 사도 됐던 물건이 더 강한 도둑일 수 있어요.",
    pattern:
      "할인, 무료배송, 타임딜을 보면 필요보다 기회가 먼저 보이는 타입이에요.",
    routine: "오늘은 장바구니 하나를 24시간만 묵혀두고 다시 봐요.",
    color: "#e64980",
  },
};

const DAILY_CASES = [
  "배달앱 잠복",
  "퇴근길 이동비",
  "편의점 소액 결제",
  "무료체험 결제일",
  "장바구니 타임딜",
  "커피값 루틴",
  "야식 합리화",
];

function getTodayCase() {
  const day = Math.floor(Date.now() / 86400000);
  return DAILY_CASES[day % DAILY_CASES.length];
}

function pickResult(answers: ThiefType[]) {
  const counts = answers.reduce(
    (acc, type) => ({ ...acc, [type]: (acc[type] ?? 0) + 1 }),
    {} as Record<ThiefType, number>,
  );

  return (
    [...answers].sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0))[0] ??
    "shopping"
  );
}

export default function App() {
  const [screen, setScreen] = useState<"home" | "quiz" | "result">("home");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<ThiefType[]>([]);
  const [routineOpen, setRoutineOpen] = useState(false);
  const todayCase = useMemo(getTodayCase, []);
  const resultType = pickResult(answers);
  const result = RESULTS[resultType];

  const start = () => {
    setQuestionIndex(0);
    setAnswers([]);
    setRoutineOpen(false);
    setScreen("quiz");
  };

  const answer = (type: ThiefType) => {
    const next = [...answers, type];
    setAnswers(next);

    if (questionIndex >= QUESTIONS.length - 1) {
      setScreen("result");
      return;
    }

    setQuestionIndex((index) => index + 1);
  };

  if (screen === "quiz") {
    const question = QUESTIONS[questionIndex];

    return (
      <main className="app-shell">
        <section className="quiz-card">
          <div className="progress-row">
            <button className="back-button" onClick={() => setScreen("home")}>
              ← 처음
            </button>
            <span>
              {questionIndex + 1}/{QUESTIONS.length}
            </span>
          </div>
          <div className="progress-track">
            <span
              style={{
                width: `${((questionIndex + 1) / QUESTIONS.length) * 100}%`,
              }}
            />
          </div>
          <HeroArt badge="월급 도둑" chip={todayCase} />
          <p className="eyebrow">내 답변 기반 소비 습관 점검</p>
          <h1>{question.title}</h1>
          <p className="description">{question.subtitle}</p>
          <div className="choice-list">
            {question.choices.map((choice) => (
              <button key={choice.label} onClick={() => answer(choice.thief)}>
                <strong>{choice.label}</strong>
                <span>{choice.description}</span>
              </button>
            ))}
          </div>
        </section>
        <BannerAd label="월급 도둑 찾기 하단 광고" />
      </main>
    );
  }

  if (screen === "result") {
    return (
      <main className="app-shell">
        <section
          className="result-card"
          style={{ "--result-color": result.color } as React.CSSProperties}
        >
          <HeroArt badge={result.title} chip="결과 카드" />
          <p className="eyebrow">이번 달 월급 도둑 후보</p>
          <h1>{result.title}</h1>
          <p className="result-name">{result.thiefName}</p>
          <p className="quote">“{result.quote}”</p>
          <div className="insight-box">
            <strong>대표 패턴</strong>
            <span>{result.pattern}</span>
          </div>
          <div className="insight-box soft">
            <strong>오늘의 방어 루틴</strong>
            <span>{result.routine}</span>
          </div>
          {routineOpen ? (
            <div className="reward-box">
              <strong>광고 확인 후 열리는 3단계 루틴</strong>
              <ol>
                <li>오늘 결제 알림에서 낯선 항목 1개 찾기</li>
                <li>반복되는 결제는 메모장에 이름만 적기</li>
                <li>내일 같은 시간에 한 번 더 확인하기</li>
              </ol>
            </div>
          ) : null}
          <button
            className="primary-button"
            onClick={() => setRoutineOpen(true)}
          >
            광고 보고 방어 루틴 열기
          </button>
          <button className="secondary-button" onClick={start}>
            다시 찾기
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="home-card">
        <p className="eyebrow">오늘의 사건 · {todayCase}</p>
        <h1>이번 달 내 월급을 훔쳐간 범인은?</h1>
        <p className="description">
          배달비, 편의점, 구독료, 택시비, 할인 쇼핑 중 내 월급을 조용히 데려가는
          후보를 60초만에 찾아요.
        </p>
        <HeroArt badge="월급 추적" chip="60초 사건" />
        <button className="primary-button" onClick={start}>
          월급 도둑 찾기 시작
        </button>
      </section>
      <section className="benefit-card">
        <h2>테스트 끝나면 바로 받는 것</h2>
        <div className="benefit-grid">
          <span>도둑 유형 카드</span>
          <span>대표 소비 패턴</span>
          <span>광고 보고 루틴</span>
          <span>내일 사건 예고</span>
        </div>
      </section>
      <BannerAd label="월급 도둑 찾기 홈 광고" />
    </main>
  );
}

function HeroArt({ badge, chip }: { badge: string; chip: string }) {
  return (
    <div className="hero-art" aria-hidden="true">
      <img src={salaryThiefHero} />
      <span className="hero-scrim" />
      <span className="hero-badge">{badge}</span>
      <span className="hero-chip">{chip}</span>
      <span className="hero-label">탐정 모드</span>
    </div>
  );
}

function BannerAd({ label }: { label: string }) {
  return (
    <aside className="banner-ad" aria-label={label}>
      <strong>{label}</strong>
      <span>광고 영역</span>
    </aside>
  );
}

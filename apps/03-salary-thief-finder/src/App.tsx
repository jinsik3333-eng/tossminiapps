import { useEffect, useMemo, useState } from "react";

import "./App.css";
import { TossBannerAd } from "./components/TossBannerAd";
import { NotificationRewardSheet, RewardHub, StickyRewardCTA } from "./components/RewardHub";
import { useInAppAds } from "./hooks/useInAppAds";
import salaryThiefHero from "./assets/salary-thief-hero.jpg";
import convenienceResult from "./assets/convenience-result.jpg";
import deliveryResult from "./assets/delivery-result.jpg";
import shoppingResult from "./assets/shopping-result.jpg";
import subscriptionResult from "./assets/subscription-result.jpg";
import taxiResult from "./assets/taxi-result.jpg";

const BANNER_AD_GROUP_ID =
  import.meta.env.VITE_TOSS_BANNER_AD_GROUP_ID ?? "";
const REWARDED_AD_GROUP_ID =
  import.meta.env.VITE_TOSS_REWARDED_AD_GROUP_ID ?? "";

const REWARD_APP_LINKS = [
  { label: "헛돈 퀴즈", description: "소비 점검", href: "intoss://daily-waste-quiz" },
  { label: "월급 도둑", description: "새는 돈 찾기", href: "intoss://salary-thief-finder" },
  { label: "소비 룰렛", description: "오늘 방어", href: "intoss://spending-defense-roulette" },
  { label: "구독 유령", description: "자동결제 점검", href: "intoss://subscription-ghost-finder" },
  { label: "영수증 몬스터", description: "소비 단서 찾기", href: "intoss://receipt-monster-catcher" },
];

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
  evidence: string[];
  image: string;
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
    evidence: ["무료배송 기준", "야식 주문", "사이드 추가"],
    image: deliveryResult,
    color: "#3182f6",
  },
  convenience: {
    title: "편의점 도둑",
    thiefName: "작은 결제 수집가",
    quote: "한 번은 작지만, 여러 번이면 월급 봉투가 가벼워져요.",
    pattern: "커피, 간식, 행사 상품처럼 소액 결제가 자주 쌓이는 타입이에요.",
    routine: "오늘은 편의점에 들어가기 전 살 것 1개만 메모해요.",
    evidence: ["커피 한 잔", "행사 상품", "퇴근길 간식"],
    image: convenienceResult,
    color: "#12b886",
  },
  subscription: {
    title: "구독료 도둑",
    thiefName: "조용한 자동결제 그림자",
    quote: "안 쓰는 앱도 결제일에는 아주 성실하게 찾아와요.",
    pattern:
      "무료체험, 멤버십, 클라우드, 콘텐츠 구독을 나중에 확인하는 편이에요.",
    routine: "오늘은 결제 알림함에서 모르는 이름 1개만 찾아봐요.",
    evidence: ["무료체험 종료", "안 쓰는 멤버십", "모르는 결제명"],
    image: subscriptionResult,
    color: "#7048e8",
  },
  taxi: {
    title: "택시비 도둑",
    thiefName: "피곤한 퇴근길의 유혹",
    quote: "급한 이동이 반복되면 월급 도둑은 조용히 커져요.",
    pattern: "비 오는 날, 늦은 약속, 피곤한 퇴근길에 이동비가 자주 늘어요.",
    routine: "오늘은 호출 전에 대중교통 도착 시간만 한 번 확인해요.",
    evidence: ["늦은 약속", "비 오는 날", "피곤한 퇴근길"],
    image: taxiResult,
    color: "#f76707",
  },
  shopping: {
    title: "할인 쇼핑 도둑",
    thiefName: "장바구니 잠복범",
    quote: "싸게 산 물건보다 안 사도 됐던 물건이 더 강한 도둑일 수 있어요.",
    pattern:
      "할인, 무료배송, 타임딜을 보면 필요보다 기회가 먼저 보이는 타입이에요.",
    routine: "오늘은 장바구니 하나를 24시간만 묵혀두고 다시 봐요.",
    evidence: ["타임딜", "무료배송 맞춤", "장바구니 방치"],
    image: shoppingResult,
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

const DAILY_MISSIONS = [
  "오늘의 단서 3개 모으면 방어 루틴이 열려요.",
  "오늘만 다른 월급 도둑 후보가 숨어 있어요.",
  "내일 들어오면 새로운 사건명으로 다시 시작돼요.",
  "7일 기록을 채우면 내 소비 패턴이 더 선명해져요.",
];

function getDayIndex() {
  return Math.floor(Date.now() / 86400000);
}

function getTodayKey() {
  return `salary-thief:${getDayIndex()}`;
}

function getTodayCase() {
  const day = getDayIndex();
  return DAILY_CASES[day % DAILY_CASES.length];
}

function getTodayMission() {
  const day = getDayIndex();
  return DAILY_MISSIONS[day % DAILY_MISSIONS.length];
}

function getStoredStamps() {
  try {
    const raw = window.localStorage.getItem("salary-thief:stamps");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(Boolean).slice(-7) : [];
  } catch {
    return [];
  }
}

function saveTodayStamp(resultTitle: string) {
  try {
    const todayKey = getTodayKey();
    const previous = getStoredStamps().filter(
      (stamp) => stamp.key !== todayKey,
    );
    const next = [...previous, { key: todayKey, title: resultTitle }].slice(-7);
    window.localStorage.setItem("salary-thief:stamps", JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
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
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [stamps, setStamps] = useState(getStoredStamps);
  const [pendingRewardCount, setPendingRewardCount] = useState<number | null>(null);
  const [isRewardNotifyOpen, setIsRewardNotifyOpen] = useState(false);
  const ads = useInAppAds(REWARDED_AD_GROUP_ID);
  const todayCase = useMemo(getTodayCase, []);
  const todayMission = useMemo(getTodayMission, []);
  const resultType = pickResult(answers);
  const result = RESULTS[resultType];

  useEffect(() => {
    if (pendingRewardCount !== null && ads.rewardCount > pendingRewardCount) {
      setRoutineOpen(true);
      setPendingRewardCount(null);
    }
  }, [ads.rewardCount, pendingRewardCount]);

  const openRewardRoutine = () => {
    if (ads.isSupported && ads.isAdLoaded) {
      setPendingRewardCount(ads.rewardCount);
      ads.showAd();
      return;
    }

    setPendingRewardCount(null);
    setRoutineOpen(true);
  };

  const start = () => {
    setQuestionIndex(0);
    setAnswers([]);
    setRoutineOpen(false);
    setEvidenceCount(0);
    setScreen("quiz");
  };

  const answer = (type: ThiefType) => {
    const next = [...answers, type];
    setAnswers(next);

    if (questionIndex >= QUESTIONS.length - 1) {
      const picked = RESULTS[pickResult(next)];
      setStamps(saveTodayStamp(picked.title));
      setScreen("result");
      return;
    }

    setQuestionIndex((index) => index + 1);
  };

  const collectEvidence = () => {
    if (evidenceCount >= result.evidence.length) {
      setRoutineOpen(true);
      return;
    }

    setEvidenceCount((count) => Math.min(count + 1, result.evidence.length));
  };

  const shareResult = async () => {
    const text = `나는 ${result.title}. 월급 도둑 찾기에서 60초 진단해봤어.`;

    if (navigator.share) {
      await navigator.share({ title: "월급 도둑 찾기", text });
      return;
    }

    await navigator.clipboard?.writeText(text);
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
    const evidenceComplete = evidenceCount >= result.evidence.length;

    return (
      <main className="app-shell">
        <section
          className="result-card"
          style={{ "--result-color": result.color } as React.CSSProperties}
        >
          <ResultScene result={result} todayCase={todayCase} />
          <p className="eyebrow">이번 달 월급 도둑 후보</p>
          <h1>{result.title}</h1>
          <p className="result-name">{result.thiefName}</p>
          <p className="quote">“{result.quote}”</p>
          <div className="insight-box">
            <strong>대표 패턴</strong>
            <span>{result.pattern}</span>
          </div>
          <div className="evidence-box">
            <div>
              <strong>오늘의 단서 수집</strong>
              <span>
                {evidenceCount}/{result.evidence.length}개 찾음 · 매일 다른
                사건으로 갱신
              </span>
            </div>
            <div className="evidence-slots">
              {result.evidence.map((item, index) => (
                <span
                  className={index < evidenceCount ? "found" : ""}
                  key={item}
                >
                  {index < evidenceCount ? item : "숨은 단서"}
                </span>
              ))}
            </div>
            <button className="mini-action" onClick={collectEvidence}>
              {evidenceComplete ? "단서 완료 · 루틴 열기" : "단서 하나 찾기"}
            </button>
          </div>
          <div className="insight-box soft">
            <strong>오늘의 방어 루틴</strong>
            <span>{result.routine}</span>
          </div>
          {routineOpen ? (
            <div className="reward-box">
              <strong>AD 시청 보상 · 3단계 방어 루틴</strong>
              <ol>
                <li>오늘 의심 항목 1개만 기록하기</li>
                <li>반복되는 소비는 내일 같은 시간에 다시 보기</li>
                <li>7일 기록에 오늘의 도둑 유형 남기기</li>
              </ol>
            </div>
          ) : null}
          <button
            className="primary-button"
            onClick={openRewardRoutine}
          >
            {routineOpen ? "보상 루틴 받음" : "AD 보고 방어 보상 받기"}
          </button>
          <button className="secondary-button" onClick={start}>
            다시 찾기
          </button>
            <RewardHub
            appLabel="월급 도둑 찾기"
            pointsLabel={`${stamps.length * 5}P 모았어요`}
            primaryLabel="광고 보고 방어 루틴 받기"
            questLabel="오늘 단서 수집"
            questProgress={evidenceCount}
            questTotal={result.evidence.length}
            links={REWARD_APP_LINKS.filter((link) => link.href !== "intoss://salary-thief-finder")}
            onPrimaryReward={openRewardRoutine}
            onOpenNotification={() => setIsRewardNotifyOpen(true)}
          />
          <StickyRewardCTA label="광고 보고 방어 루틴 받기" onClick={openRewardRoutine} />
          <NotificationRewardSheet
            open={isRewardNotifyOpen}
            appLabel="월급 도둑 찾기"
            onClose={() => setIsRewardNotifyOpen(false)}
          />
          <ResultActionMenu
            items={[
              { label: "AD 방어 보상", onClick: openRewardRoutine },
              { label: "도둑 추적 게임", onClick: start },
              { label: "친구에게 보내기", onClick: shareResult },
              { label: "기록 보기", onClick: collectEvidence },
              { label: "다시 찾기", onClick: start },
            ]}
            helperCopy="AD 버튼은 광고 시청 후 앱 안 보상 루틴이 열려요"
          />
          <BannerAd label="월급 도둑 찾기 결과 광고" />
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <UtilityNudge
        appLabel="월급 도둑 찾기"
        notifyCopy="알림을 켜면 내일 수사 미션을 놓치지 않아요."
        loginCopy="로그인하면 7일 수사 기록을 더 안전하게 이어볼 수 있어요."
      />

      <section className="home-card">
        <p className="eyebrow">오늘의 사건 · {todayCase}</p>
        <h1>이번 달 내 월급을 훔쳐간 범인은?</h1>
        <p className="description">
          배달비, 편의점, 구독료, 택시비, 할인 쇼핑 중 내 월급을 조용히 데려가는
          후보를 60초만에 찾아요.
        </p>
        <HeroArt badge="월급 추적" chip="60초 사건" />
        <section className="daily-ticket">
          <strong>오늘의 수사권</strong>
          <span>{todayMission}</span>
          <div className="stamp-row" aria-label="최근 7일 기록">
            {Array.from({ length: 7 }).map((_, index) => (
              <i
                key={index}
                className={index < stamps.length ? "filled" : ""}
              />
            ))}
          </div>
          <small>
            최근 기록 {stamps.length}/7 · 내일은 다른 사건명으로 열려요
          </small>
        </section>
        <button className="primary-button" onClick={start}>
          월급 도둑 찾기 시작
        </button>
      </section>
      <section className="benefit-card">
        <h2>테스트 끝나면 바로 받는 것</h2>
        <div className="benefit-grid">
          <span>유형별 결과 이미지</span>
          <span>오늘의 단서 수집</span>
          <span>선택형 루틴</span>
          <span>7일 수사 기록</span>
        </div>
      </section>
      <BannerAd label="월급 도둑 찾기 홈 광고" />
    </main>
  );
}

function UtilityNudge({
  appLabel,
  notifyCopy,
  loginCopy,
}: {
  appLabel: string;
  notifyCopy: string;
  loginCopy: string;
}) {
  return (
    <section
      className="utility-nudge"
      aria-label={`${appLabel} 알림과 로그인 안내`}
    >
      <div>
        <span className="utility-bell" aria-hidden="true" />
        <strong>내일도 이어보기</strong>
      </div>
      <p>{notifyCopy}</p>
      <p>{loginCopy}</p>
    </section>
  );
}

function ResultActionMenu({
  items,
  helperCopy,
}: {
  items: Array<{ label: string; onClick: () => void | Promise<void> }>;
  helperCopy: string;
}) {
  return (
    <section className="cherry-menu" aria-label="결과 활용 메뉴">
      <div className="cherry-menu__head">
        <strong>광고 보상 받기</strong>
      </div>
      <div className="cherry-menu__grid">
        {items.map((item) => (
          <button key={item.label} type="button" onClick={item.onClick}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="ad-loop-pill">{helperCopy}</div>
    </section>
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

function ResultScene({
  result,
  todayCase,
}: {
  result: ResultMeta;
  todayCase: string;
}) {
  return (
    <div className="result-scene" aria-hidden="true">
      <img src={result.image} />
      <span className="hero-scrim" />
      <span className="hero-badge">{result.title}</span>
      <span className="hero-chip">{todayCase}</span>
      <span className="hero-label">검거 완료</span>
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

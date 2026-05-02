import { Button, Top, useToast } from "@toss/tds-mobile";
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { useInAppAds } from "./hooks/useInAppAds";
import { InAppAdsPage } from "./pages/InAppAdsPage";

type Screen = "home" | "quiz" | "result" | "iaa";
type Choice = { label: string; value: number; feedback: string };
type Question = { title: string; description: string; choices: Choice[] };
type DaySet = { theme: string; hook: string; questions: Question[] };

const AD_GROUP_ID = "ait-ad-test-rewarded-id";
const STAMP_KEY = "daily-waste-quiz-stamps-v1";

const daySets: DaySet[] = [
  {
    theme: "배달비 방어의 날",
    hook: "오늘은 배달앱을 켜기 전에 한 번만 멈춰보는 날이에요.",
    questions: [
      {
        title: "퇴근길에 배고플 때 제일 먼저 하는 행동은?",
        description: "오늘 헛돈이 새는 첫 지점을 찾아볼게요.",
        choices: [
          { label: "배달앱부터 켠다", value: 0, feedback: "가장 빠르게 새는 구멍이에요." },
          { label: "냉장고를 먼저 확인한다", value: 2, feedback: "이미 방어력이 좋아요." },
          { label: "편의점으로 간다", value: 1, feedback: "소액 누수가 쌓일 수 있어요." },
        ],
      },
      {
        title: "배달비가 아까워도 주문하는 순간은?",
        description: "반복되는 패턴일수록 막기 쉬워요.",
        choices: [
          { label: "피곤하면 바로 주문", value: 0, feedback: "피곤함 예산을 따로 잡아야 해요." },
          { label: "쿠폰 있을 때만 주문", value: 1, feedback: "쿠폰이 핑계가 되지 않게 주의." },
          { label: "주 1회 이하로 정한다", value: 2, feedback: "좋은 기준을 갖고 있어요." },
        ],
      },
      {
        title: "오늘 하나만 정한다면?",
        description: "작은 규칙이 제일 오래 가요.",
        choices: [
          { label: "배달앱 알림 끄기", value: 2, feedback: "충동 주문 방어에 좋아요." },
          { label: "최소주문금액 채우기", value: 0, feedback: "오히려 지출이 커질 수 있어요." },
          { label: "집밥 후보 1개 저장", value: 2, feedback: "오늘 바로 가능한 루틴이에요." },
        ],
      },
    ],
  },
  {
    theme: "구독료 점검의 날",
    hook: "안 보는 구독 하나만 찾아도 이번 달 방어 성공이에요.",
    questions: [
      {
        title: "최근 결제된 구독을 바로 말할 수 있나요?",
        description: "기억 안 나는 구독은 헛돈 후보예요.",
        choices: [
          { label: "3개 이상 바로 말함", value: 2, feedback: "관리 감각이 있어요." },
          { label: "몇 개는 헷갈림", value: 1, feedback: "한 번만 정리하면 좋아져요." },
          { label: "거의 모름", value: 0, feedback: "오늘의 핵심 점검 대상이에요." },
        ],
      },
      {
        title: "무료체험 종료 알림을 따로 적어두나요?",
        description: "무료체험은 자동결제가 핵심 함정이에요.",
        choices: [
          { label: "항상 적어둔다", value: 2, feedback: "좋은 방어 습관이에요." },
          { label: "가끔만 적는다", value: 1, feedback: "캘린더 알림 하나면 충분해요." },
          { label: "그냥 잊는다", value: 0, feedback: "자동결제 구멍이 생기기 쉬워요." },
        ],
      },
      {
        title: "이번 주 할 수 있는 가장 쉬운 정리는?",
        description: "취소보다 먼저 확인부터 해도 돼요.",
        choices: [
          { label: "결제 문자 검색", value: 2, feedback: "가장 빠른 구독 찾기 방법이에요." },
          { label: "언젠가 몰아서 보기", value: 0, feedback: "미루면 또 결제돼요." },
          { label: "앱 하나만 열어보기", value: 1, feedback: "작게 시작하는 건 좋아요." },
        ],
      },
    ],
  },
  {
    theme: "편의점 소액누수의 날",
    hook: "천 원, 이천 원이 모이면 생각보다 큽니다.",
    questions: [
      {
        title: "편의점에서 가장 자주 사는 건?",
        description: "반복 구매 품목이 오늘의 단서예요.",
        choices: [
          { label: "커피/음료", value: 1, feedback: "월 단위로 보면 꽤 커져요." },
          { label: "간식/야식", value: 0, feedback: "충동 소비 가능성이 높아요." },
          { label: "필요한 생필품", value: 2, feedback: "목적 구매는 괜찮아요." },
        ],
      },
      {
        title: "1+1을 보면 어떻게 하나요?",
        description: "할인은 필요할 때만 이득이에요.",
        choices: [
          { label: "일단 산다", value: 0, feedback: "할인에 끌린 지출이에요." },
          { label: "원래 살 것만 산다", value: 2, feedback: "좋은 기준이에요." },
          { label: "가끔 흔들린다", value: 1, feedback: "구매 전 5초만 멈춰도 줄어요." },
        ],
      },
      {
        title: "오늘의 방어 규칙은?",
        description: "편의점은 규칙 하나가 잘 먹혀요.",
        choices: [
          { label: "들어가기 전 살 것 정하기", value: 2, feedback: "가장 현실적인 방법이에요." },
          { label: "카드 대신 현금만", value: 1, feedback: "가능하면 효과는 있어요." },
          { label: "배고플 때 들어가기", value: 0, feedback: "지출이 커지는 조합이에요." },
        ],
      },
    ],
  },
];

function getTodayIndex() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const day = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return day % daySets.length;
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function readStamps(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STAMP_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Choice[]>([]);
  const [stamps, setStamps] = useState<string[]>(() => readStamps());
  const [bonusOpen, setBonusOpen] = useState(false);
  const [pendingBonus, setPendingBonus] = useState(false);
  const toast = useToast();
  const ads = useInAppAds(AD_GROUP_ID);
  const today = useMemo(() => daySets[getTodayIndex()], []);
  const todayKey = getTodayKey();
  const completedToday = stamps.includes(todayKey);
  const score = answers.reduce((sum, answer) => sum + answer.value, 0);
  const maxScore = today.questions.length * 2;
  const percent = Math.round((score / maxScore) * 100);

  useEffect(() => {
    if (pendingBonus && ads.lastReward) {
      setBonusOpen(true);
      setPendingBonus(false);
      toast.openToast("보너스 절약 힌트를 열었어요");
    }
  }, [ads.lastReward, pendingBonus, toast]);

  const startQuiz = () => {
    setStep(0);
    setAnswers([]);
    setBonusOpen(false);
    setScreen("quiz");
  };

  const choose = (choice: Choice) => {
    const next = [...answers, choice];
    setAnswers(next);
    if (step >= today.questions.length - 1) {
      const nextStamps = Array.from(new Set([...stamps, todayKey])).slice(-7);
      setStamps(nextStamps);
      localStorage.setItem(STAMP_KEY, JSON.stringify(nextStamps));
      setScreen("result");
      toast.openToast("오늘의 스탬프를 받았어요");
      return;
    }
    setStep((value) => value + 1);
  };

  const openBonus = () => {
    if (ads.isSupported && ads.isAdLoaded) {
      setPendingBonus(true);
      ads.showAd();
      return;
    }
    setBonusOpen(true);
    toast.openToast("테스트 환경이라 바로 열었어요");
  };

  const shareResult = async () => {
    const text = `나 오늘 '${today.theme}' ${percent}점 나왔어. 하루 3문제로 헛돈 방지 중!`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "오늘의 헛돈 방지 퀴즈", text });
      } else {
        await navigator.clipboard?.writeText(text);
        toast.openToast("공유 문구를 복사했어요");
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        toast.openToast("공유를 취소했어요");
        return;
      }
      toast.openToast("공유 문구를 준비했어요");
    }
  };

  if (screen === "iaa") return <InAppAdsPage onBack={() => setScreen("home")} />;

  if (screen === "quiz") {
    const question = today.questions[step];
    return (
      <main className="app-shell">
        <Top
          title={<Top.TitleParagraph size={22}>오늘의 {step + 1}번 문제</Top.TitleParagraph>}
          subtitleBottom={<Top.SubtitleParagraph size={16}>{today.theme}</Top.SubtitleParagraph>}
        />
        <section className="quiz-card">
          <div className="progress-row">
            <span>{step + 1}/3</span>
            <div className="progress-track"><div style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
          </div>
          <p className="eyebrow">헛돈 방지 퀴즈</p>
          <h1>{question.title}</h1>
          <p>{question.description}</p>
          <div className="choice-list">
            {question.choices.map((choice) => (
              <button className="choice-button" key={choice.label} onClick={() => choose(choice)}>
                <span>{choice.label}</span>
                <small>{choice.feedback}</small>
              </button>
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (screen === "result") {
    const grade = percent >= 75 ? "헛돈 방어 우수" : percent >= 45 ? "막기 쉬운 구멍 발견" : "오늘 점검 효과 큼";
    return (
      <main className="app-shell result-shell">
        <Top
          title={<Top.TitleParagraph size={22}>오늘 퀴즈 완료</Top.TitleParagraph>}
          subtitleBottom={<Top.SubtitleParagraph size={16}>스탬프 1개를 모았어요</Top.SubtitleParagraph>}
        />
        <section className="result-card">
          <p className="eyebrow">{today.theme}</p>
          <h1>{grade}</h1>
          <div
            className="score-ring"
            style={{
              background: `radial-gradient(circle at center, #fff 0 54%, transparent 55%), conic-gradient(#3182f6 0 ${percent}%, #dfefff ${percent}% 100%)`,
            }}
          ><strong>{percent}</strong><span>점</span></div>
          <p className="result-copy">오늘은 작은 지출을 한 번 멈춰보는 것만으로도 충분해요.</p>
        </section>
        <section className="stamp-card">
          <div className="section-title"><strong>7일 헛돈 방지판</strong><span>{stamps.length}/7</span></div>
          <div className="stamp-grid">
            {Array.from({ length: 7 }).map((_, index) => (
              <span className={index < stamps.length ? "stamp is-filled" : "stamp"} key={index}>{index < stamps.length ? "✓" : index + 1}</span>
            ))}
          </div>
        </section>
        <section className="tip-card">
          <strong>오늘의 절약 팁</strong>
          <p>{answers[0]?.feedback ?? "오늘의 소비 루틴을 가볍게 점검해보세요."}</p>
          {bonusOpen ? (
            <div className="bonus-box">보너스 힌트: 오늘 결제 문자에서 `배달`, `구독`, `편의점` 중 하나만 검색해봐요.</div>
          ) : (
            <Button color="dark" variant="weak" onClick={openBonus}>광고 보고 보너스 힌트 열기</Button>
          )}
        </section>
        <div className="cta-stack">
          <Button onClick={shareResult}>내 결과 공유하기</Button>
          <Button variant="weak" onClick={startQuiz}>다시 풀어보기</Button>
          {import.meta.env.DEV ? <Button color="dark" variant="weak" onClick={() => setScreen("iaa")}>개발용 광고 테스트</Button> : null}
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell home-shell">
      <Top
        title={<Top.TitleParagraph size={22}>오늘의 헛돈 방지 퀴즈</Top.TitleParagraph>}
        subtitleBottom={<Top.SubtitleParagraph size={16}>하루 3문제로 생활비 새는 구멍 막기</Top.SubtitleParagraph>}
      />
      <section className="hero-card">
        <p className="eyebrow">{completedToday ? "오늘 스탬프 완료" : "오늘의 새 문제 도착"}</p>
        <h1>오늘 새는 돈,<br />3문제로 막아봐</h1>
        <p>{today.hook}</p>
        <div className="money-scene" aria-hidden="true">
          <span className="wallet">월급</span>
          <span className="coin coin-a" />
          <span className="coin coin-b" />
          <span className="shield">방어</span>
        </div>
        <Button onClick={startQuiz}>{completedToday ? "오늘 퀴즈 다시 보기" : "오늘 퀴즈 시작하기"}</Button>
      </section>
      <section className="daily-panel">
        <div className="section-title"><strong>{today.theme}</strong><span>3문제</span></div>
        <p>{completedToday ? "이미 오늘 스탬프를 받았어요. 공유하거나 다시 풀 수 있어요." : "완료하면 오늘의 스탬프와 절약 팁을 받을 수 있어요."}</p>
        <div className="mini-list">
          <span>가입 없음</span><span>하루 1분</span><span>공유 카드</span>
        </div>
      </section>
      <section className="stamp-card compact">
        <div className="section-title"><strong>최근 스탬프</strong><span>{stamps.length}/7</span></div>
        <div className="stamp-grid">
          {Array.from({ length: 7 }).map((_, index) => (
            <span className={index < stamps.length ? "stamp is-filled" : "stamp"} key={index}>{index < stamps.length ? "✓" : index + 1}</span>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;

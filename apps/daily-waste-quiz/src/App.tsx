import { Button, Top, useToast } from "@toss/tds-mobile";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  DAILY_BOARD_DAYS,
  QUESTION_TIME_LIMIT,
  getCountdownCopy,
  getDefenseGrade,
  getMonthlyBoardSlots,
  getTodayMissionLabel,
} from "./game";
import { useInAppAds } from "./hooks/useInAppAds";
import { InAppAdsPage } from "./pages/InAppAdsPage";

type Screen = "home" | "quiz" | "result" | "iaa";
type Choice = { label: string; value: number; reply: string };
type Question = { leak: string; title: string; choices: Choice[] };
type DaySet = { theme: string; enemy: string; hook: string; questions: Question[] };

const AD_GROUP_ID = "ait-ad-test-rewarded-id";
const STAMP_KEY = "daily-waste-quiz-stamps-v2";

const daySets: DaySet[] = [
  {
    theme: "배달비 습격",
    enemy: "배달비 괴물",
    hook: "오늘 카드값을 괴롭히는 배달비 괴물 잡기",
    questions: [
      {
        leak: "퇴근 직후",
        title: "배고프면 바로?",
        choices: [
          { label: "배달앱 켬", value: 0, reply: "위험. 제일 빨리 새요." },
          { label: "냉장고 봄", value: 2, reply: "좋음. 1차 방어 성공." },
        ],
      },
      {
        leak: "쿠폰 유혹",
        title: "쿠폰 뜨면?",
        choices: [
          { label: "일단 주문", value: 0, reply: "쿠폰이 미끼였어요." },
          { label: "원래 먹을 때만", value: 2, reply: "좋음. 안 끌려감." },
        ],
      },
      {
        leak: "최소주문금액",
        title: "금액 모자라면?",
        choices: [
          { label: "사이드 추가", value: 0, reply: "여기서 돈이 샙니다." },
          { label: "그냥 포기", value: 2, reply: "강함. 괴물 약해짐." },
        ],
      },
    ],
  },
  {
    theme: "구독료 잠복",
    enemy: "구독료 유령",
    hook: "안 보는 구독 하나만 찾아도 오늘은 성공",
    questions: [
      {
        leak: "자동결제",
        title: "구독 몇 개 쓰는지?",
        choices: [
          { label: "바로 앎", value: 2, reply: "좋음. 숨어도 잡네요." },
          { label: "잘 모름", value: 0, reply: "유령이 숨어 있어요." },
        ],
      },
      {
        leak: "무료체험",
        title: "무료체험 끝나면?",
        choices: [
          { label: "알림 해둠", value: 2, reply: "방어 성공." },
          { label: "까먹음", value: 0, reply: "다음 달 청구 후보." },
        ],
      },
      {
        leak: "안 보는 앱",
        title: "이번 주 정리?",
        choices: [
          { label: "하나 해지", value: 2, reply: "깔끔. 바로 절약." },
          { label: "다음에", value: 0, reply: "유령 생존." },
        ],
      },
    ],
  },
  {
    theme: "편의점 함정",
    enemy: "1+1 함정",
    hook: "작은 결제 3번이면 점심값 하나가 사라져요",
    questions: [
      {
        leak: "입구 컷",
        title: "들어가기 전?",
        choices: [
          { label: "살 것 정함", value: 2, reply: "좋음. 함정 회피." },
          { label: "그냥 들어감", value: 0, reply: "위험. 손이 바빠짐." },
        ],
      },
      {
        leak: "1+1",
        title: "1+1 보이면?",
        choices: [
          { label: "필요하면 삼", value: 2, reply: "할인에 안 끌림." },
          { label: "일단 집음", value: 0, reply: "함정 발동." },
        ],
      },
      {
        leak: "야식 루트",
        title: "밤 11시 편의점?",
        choices: [
          { label: "안 감", value: 2, reply: "강함. 오늘 방어." },
          { label: "라면 사러 감", value: 0, reply: "추가 지출 확정." },
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
  const [lastReply, setLastReply] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_TIME_LIMIT);
  const [isLocked, setIsLocked] = useState(false);
  const toast = useToast();
  const ads = useInAppAds(AD_GROUP_ID);
  const today = useMemo(() => daySets[getTodayIndex()], []);
  const tomorrow = useMemo(() => daySets[(getTodayIndex() + 1) % daySets.length], []);
  const todayKey = getTodayKey();
  const completedToday = stamps.includes(todayKey);
  const score = answers.reduce((sum, answer) => sum + answer.value, 0);
  const maxScore = today.questions.length * 2;
  const defenseGrade = getDefenseGrade(score, maxScore);
  const monsterHp = Math.max(0, 100 - Math.round((score / maxScore) * 100));
  const boardSlots = getMonthlyBoardSlots(stamps);

  useEffect(() => {
    if (pendingBonus && ads.lastReward) {
      setBonusOpen(true);
      setPendingBonus(false);
      toast.openToast("보너스 한 줄 팁 열림");
    }
  }, [ads.lastReward, pendingBonus, toast]);

  const startQuiz = () => {
    setStep(0);
    setAnswers([]);
    setBonusOpen(false);
    setLastReply(null);
    setSecondsLeft(QUESTION_TIME_LIMIT);
    setIsLocked(false);
    setScreen("quiz");
  };

  const choose = useCallback((choice: Choice) => {
    if (isLocked) {
      return;
    }

    setIsLocked(true);
    setLastReply(choice.reply);
    window.setTimeout(() => {
      const next = [...answers, choice];
      setAnswers(next);
      setLastReply(null);
      if (step >= today.questions.length - 1) {
        const nextStamps = Array.from(new Set([...stamps, todayKey])).slice(-DAILY_BOARD_DAYS);
        setStamps(nextStamps);
        localStorage.setItem(STAMP_KEY, JSON.stringify(nextStamps));
        setScreen("result");
        setIsLocked(false);
        toast.openToast("오늘 괴물 퇴치 완료");
        return;
      }
      setStep((value) => value + 1);
      setSecondsLeft(QUESTION_TIME_LIMIT);
      setIsLocked(false);
    }, 420);
  }, [answers, isLocked, stamps, step, today.questions.length, todayKey, toast]);

  useEffect(() => {
    if (screen !== "quiz" || isLocked) {
      return;
    }

    if (secondsLeft <= 0) {
      choose({ label: "시간 초과", value: 0, reply: "시간 끝. 괴물이 버텼어요." });
      return;
    }

    const timerId = window.setTimeout(() => {
      setSecondsLeft((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [choose, isLocked, screen, secondsLeft]);

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
    const text = `오늘 ${today.enemy} ${defenseGrade.label}. 너도 5초 컷 해봐.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "오늘의 헛돈 방지 퀴즈", text });
      } else {
        await navigator.clipboard?.writeText(text);
        toast.openToast("공유 문구 복사 완료");
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
      <main className="app-shell quiz-shell">
        <Top
          title={<Top.TitleParagraph size={22}>{step + 1}/3 헛돈 컷</Top.TitleParagraph>}
          subtitleBottom={<Top.SubtitleParagraph size={16}>{today.theme}</Top.SubtitleParagraph>}
        />
        <section className="battle-card">
          <div className="battle-top">
            <span className="leak-pill">{question.leak}</span>
            <span className={secondsLeft <= 2 ? "timer-chip is-danger" : "timer-chip"}>{getCountdownCopy(secondsLeft)}</span>
          </div>
          <div className="timer-track" aria-label={getCountdownCopy(secondsLeft)}>
            <span style={{ width: `${(secondsLeft / QUESTION_TIME_LIMIT) * 100}%` }} />
          </div>
          <div className="monster-stage" aria-hidden="true">
            <span className="hp-label floating-hp">괴물 HP {monsterHp}%</span>
            <span className="monster">{today.enemy}</span>
            <span className="slash slash-a" />
            <span className="slash slash-b" />
          </div>
          <h1>{question.title}</h1>
          <div className="quick-choice-grid">
            {question.choices.map((choice) => (
              <button className="quick-choice" disabled={isLocked} key={choice.label} onClick={() => choose(choice)}>
                {choice.label}
              </button>
            ))}
          </div>
          {lastReply ? <div className="hit-toast">{lastReply}</div> : null}
        </section>
      </main>
    );
  }

  if (screen === "result") {
    return (
      <main className="app-shell result-shell">
        <Top
          title={<Top.TitleParagraph size={22}>오늘 전투 끝</Top.TitleParagraph>}
          subtitleBottom={<Top.SubtitleParagraph size={16}>스탬프 1개 획득</Top.SubtitleParagraph>}
        />
        <section className="result-card">
          <p className="eyebrow">{today.enemy} 결과</p>
          <h1>{defenseGrade.title}</h1>
          <div
            className="score-ring"
            style={{
              background: `radial-gradient(circle at center, #fff 0 54%, transparent 55%), conic-gradient(#3182f6 0 ${defenseGrade.percent}%, #dfefff ${defenseGrade.percent}% 100%)`,
            }}
          ><strong>{defenseGrade.blockedCount}/3</strong><span>방어</span></div>
          <p className="result-copy">{defenseGrade.label}. 점수보다 중요한 건 오늘 하나를 막은 기록이에요.</p>
          <p className="tomorrow-copy">내일 예고: {tomorrow.enemy}</p>
        </section>
        <section className="stamp-card">
          <div className="section-title"><strong>30일 퇴치판</strong><span>{stamps.length}/{DAILY_BOARD_DAYS}</span></div>
          <div className="stamp-grid monthly-grid">
            {boardSlots.map((slot) => (
              <span className={slot.filled ? "stamp is-filled" : "stamp"} key={slot.day}>{slot.filled ? "✓" : slot.day}</span>
            ))}
          </div>
        </section>
        <section className="tip-card">
          <strong>오늘 한 줄 팁</strong>
          <p>{answers.at(-1)?.reply ?? "오늘의 헛돈 루트를 하나만 피해봐요."}</p>
          {bonusOpen ? (
            <div className="bonus-box">보너스: 오늘 결제 문자에서 `{today.theme.split(" ")[0]}` 한 번만 검색.</div>
          ) : (
            <Button color="dark" variant="weak" onClick={openBonus}>광고 보고 한 줄 팁 더 보기</Button>
          )}
        </section>
        <div className="cta-stack">
          <Button onClick={shareResult}>친구한테 괴물 도전 보내기</Button>
          <Button variant="weak" onClick={startQuiz}>5초 더 잡기</Button>
          {import.meta.env.DEV ? <Button color="dark" variant="weak" onClick={() => setScreen("iaa")}>개발용 광고 테스트</Button> : null}
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell home-shell">
      <Top
        title={<Top.TitleParagraph size={22}>오늘의 헛돈 방어전</Top.TitleParagraph>}
        subtitleBottom={<Top.SubtitleParagraph size={16}>5초 안에 고르면 방어 성공</Top.SubtitleParagraph>}
      />
      <section className="hero-card compact-hero">
        <p className="eyebrow">{completedToday ? "오늘 이미 잡음" : getTodayMissionLabel(today.enemy)}</p>
        <h1>{today.enemy}<br />5초 방어</h1>
        <p>{today.hook}</p>
        <div className="monster-stage home-stage" aria-hidden="true">
          <span className="monster big">{today.enemy}</span>
          <span className="slash slash-a" />
          <span className="slash slash-b" />
        </div>
        <Button onClick={startQuiz}>{completedToday ? "오늘 기록 다시 깨기" : "5초 카운트다운 시작"}</Button>
      </section>
      <section className="daily-panel compact-panel">
        <div className="section-title"><strong>오늘 할 일</strong><span>3단계</span></div>
        <div className="mini-list">
          <span>5초 타이머</span><span>두 선택지</span><span>매일 다른 괴물</span>
        </div>
      </section>
      <section className="stamp-card compact">
        <div className="section-title"><strong>30일 방어 기록</strong><span>{stamps.length}/{DAILY_BOARD_DAYS}</span></div>
        <div className="stamp-grid monthly-grid">
          {boardSlots.map((slot) => (
            <span className={slot.filled ? "stamp is-filled" : "stamp"} key={slot.day}>{slot.filled ? "✓" : slot.day}</span>
          ))}
        </div>
        <p className="next-monster">내일 다시 오면 {tomorrow.enemy} 등장</p>
      </section>
    </main>
  );
}

export default App;

import { useToast } from "@toss/tds-mobile";
import { useEffect, useMemo, useRef, useState } from "react";

import "./App.css";
import { TossBannerAd } from "./components/TossBannerAd";
import { NotificationRewardSheet, RewardHub, StickyRewardCTA } from "./components/RewardHub";
import { useInAppAds } from "./hooks/useInAppAds";
import { openContactsViralReward } from "./hooks/useContactsViralReward";
import rouletteHero from "./assets/roulette-hero.jpg";

const BANNER_AD_GROUP_ID =
  import.meta.env.VITE_TOSS_BANNER_AD_GROUP_ID ?? "";
const CONTACTS_VIRAL_MODULE_ID =
  import.meta.env.VITE_TOSS_CONTACTS_VIRAL_MODULE_ID ?? "";
const REWARDED_AD_GROUP_ID =
  import.meta.env.VITE_TOSS_REWARDED_AD_GROUP_ID ?? "";

const REWARD_APP_LINKS = [
  { label: "돈 새는 구멍", visual: "/cross-app-icons/money-leak-test.png", description: "절약 진단", href: "intoss://money-leak-test" },
  { label: "헛돈 퀴즈", visual: "/cross-app-icons/daily-waste-quiz.png", description: "소비 점검", href: "intoss://daily-waste-quiz" },
  { label: "월급 도둑", visual: "/cross-app-icons/salary-thief-finder.png", description: "새는 돈 찾기", href: "intoss://salary-thief-finder" },
  { label: "소비 룰렛", visual: "/cross-app-icons/spending-defense-roulette.png", description: "오늘 방어", href: "intoss://spending-defense-roulette" },
  { label: "구독 유령", visual: "/cross-app-icons/subscription-ghost-finder.png", description: "자동결제 점검", href: "intoss://subscription-ghost-finder" },
  { label: "영수증 몬스터", visual: "/cross-app-icons/receipt-monster-catcher.png", description: "소비 단서 찾기", href: "intoss://receipt-monster-catcher" },
];

type TrapType = "delivery" | "taxi" | "shopping" | "subscription" | "snack";
type Screen = "home" | "rolling" | "spin" | "result";

const SPIN_DURATION_MS = 3200;

type RouletteMission = {
  type: TrapType;
  label: string;
  title: string;
  trapName: string;
  hook: string;
  safeChoice: string;
  riskyChoice: string;
  resultTitle: string;
  routine: string;
  clue: string;
  color: string;
};

const STAMP_KEY = "spending-defense-roulette:stamps";

const MISSIONS: RouletteMission[] = [
  {
    type: "delivery",
    label: "배달비",
    title: "배달앱 열기 전 10초 멈춤",
    trapName: "배달비 함정",
    hook: "퇴근 직후 배고픈 순간, 오늘의 방어 선택을 골라요.",
    safeChoice: "냉장고 먼저 보기",
    riskyChoice: "배달앱 바로 열기",
    resultTitle: "배달비 방어 성공",
    routine: "오늘은 배달앱을 켜기 전 집에 있는 재료 1개만 먼저 확인해요.",
    clue: "배고픈 순간의 첫 탭을 늦추면 지출 흐름도 같이 느려져요.",
    color: "#3182f6",
  },
  {
    type: "taxi",
    label: "택시비",
    title: "호출 전 도착 시간 확인",
    trapName: "택시비 함정",
    hook: "피곤한 귀갓길, 바로 호출하기 전 한 번만 비교해요.",
    safeChoice: "대중교통 시간 보기",
    riskyChoice: "호출 버튼 누르기",
    resultTitle: "택시비 방어 성공",
    routine: "오늘은 호출 전에 대중교통 도착 시간만 한 번 확인해요.",
    clue: "비교 한 번이면 습관성 택시 호출을 줄이는 단서가 생겨요.",
    color: "#00c773",
  },
  {
    type: "shopping",
    label: "쇼핑",
    title: "장바구니 하루 보류",
    trapName: "세일 알림 함정",
    hook: "오늘만 할인이라는 말이 보이면 바로 결제하지 않게 막아요.",
    safeChoice: "내일 다시 보기",
    riskyChoice: "일단 결제하기",
    resultTitle: "충동 쇼핑 방어 성공",
    routine: "오늘은 장바구니에 담고 내일 같은 시간에 다시 확인해요.",
    clue: "시간을 하루 두면 할인보다 필요가 먼저 보여요.",
    color: "#7c5cff",
  },
  {
    type: "subscription",
    label: "구독",
    title: "자동결제 이름 확인",
    trapName: "구독 유령 함정",
    hook: "결제 알림을 그냥 넘기기 전에 이름만 확인해요.",
    safeChoice: "서비스명 확인",
    riskyChoice: "알림 넘기기",
    resultTitle: "구독 유령 방어 성공",
    routine: "오늘은 자동결제 알림 1개만 서비스명과 사용 여부를 적어봐요.",
    clue: "앱 삭제와 구독 해지는 다를 수 있어요. 오늘은 확인만 해요.",
    color: "#8b5cf6",
  },
  {
    type: "snack",
    label: "간식",
    title: "계산 전 하나 내려놓기",
    trapName: "편의점 간식 함정",
    hook: "작은 결제가 쌓이는 순간을 5초 선택으로 막아요.",
    safeChoice: "하나 내려놓기",
    riskyChoice: "그냥 계산하기",
    resultTitle: "간식비 방어 성공",
    routine: "오늘은 계산대 앞에서 손에 든 것 중 하나만 다시 내려놔요.",
    clue: "작은 결제는 자주 반복될수록 기록 효과가 커져요.",
    color: "#ff8a3d",
  },
];

function todayIndex() {
  return Math.floor(Date.now() / 86400000) % MISSIONS.length;
}

function readStamps() {
  try {
    const raw = localStorage.getItem(STAMP_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(Boolean).slice(-30) : [];
  } catch {
    return [];
  }
}

function saveStamp(label: string) {
  const today = new Date().toISOString().slice(0, 10);
  const next = [
    ...readStamps().filter((stamp) => !String(stamp).startsWith(today)),
    `${today}:${label}`,
  ].slice(-30);
  localStorage.setItem(STAMP_KEY, JSON.stringify(next));
  return next;
}

export default function App() {
  const toast = useToast();
  const [screen, setScreen] = useState<Screen>("home");
  const [missionIndex, setMissionIndex] = useState(todayIndex());
  const [spinCount, setSpinCount] = useState(0);
  const [shieldCount, setShieldCount] = useState(0);
  const [routineOpen, setRoutineOpen] = useState(false);
  const [stamps, setStamps] = useState<string[]>(() => readStamps());
  const [pendingRewardCount, setPendingRewardCount] = useState<number | null>(null);
  const [isRewardNotifyOpen, setIsRewardNotifyOpen] = useState(false);
  const ads = useInAppAds(REWARDED_AD_GROUP_ID);
  const spinTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (spinTimerRef.current) {
        window.clearTimeout(spinTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (pendingRewardCount !== null && ads.rewardCount > pendingRewardCount) {
      setRoutineOpen(true);
      setPendingRewardCount(null);
    }
  }, [ads.rewardCount, pendingRewardCount]);

  const todayMission = useMemo(() => MISSIONS[todayIndex()], []);
  const tomorrowMission = useMemo(
    () => MISSIONS[(todayIndex() + 1) % MISSIONS.length],
    [],
  );
  const mission = MISSIONS[missionIndex];
  const spinRotation = 36 + missionIndex * 72 + spinCount * 1080;

  const collectShield = () => {
    const next = Math.min(shieldCount + 1, 3);
    setShieldCount(next);
    if (next >= 3) {
      setStamps(saveStamp("방어 방패 완료"));
    }
  };

  const openRewardRoutine = () => {
    if (ads.isSupported && ads.isAdLoaded) {
      setPendingRewardCount(ads.rewardCount);
      ads.showAd();
      return;
    }

    setPendingRewardCount(null);
    setRoutineOpen(true);
  };

  const goHome = () => {
    if (spinTimerRef.current) {
      window.clearTimeout(spinTimerRef.current);
      spinTimerRef.current = null;
    }
    setScreen("home");
  };

  const startSpin = () => {
    if (spinTimerRef.current) {
      window.clearTimeout(spinTimerRef.current);
    }
    const nextIndex = (todayIndex() + spinCount) % MISSIONS.length;
    setMissionIndex(nextIndex);
    setSpinCount((count) => count + 1);
    setRoutineOpen(false);
    setScreen("rolling");
    spinTimerRef.current = window.setTimeout(() => {
      spinTimerRef.current = null;
      setScreen("spin");
    }, SPIN_DURATION_MS);
  };

  const chooseSafe = () => {
    setStamps(saveStamp(mission.resultTitle));
    setScreen("result");
  };

  const chooseRisky = () => {
    setScreen("result");
  };

  const shareResult = async () => {
    const text = `오늘의 소비 방어 결과: ${mission.resultTitle}. 소비 방어 룰렛에서 5초 선택해봤어.`;

    if (navigator.share) {
      await navigator.share({ title: "소비 방어 룰렛", text });
      return;
    }

    await navigator.clipboard?.writeText(text);
  };


  const shareResultWithReward = () => {
    openContactsViralReward({
      moduleId: CONTACTS_VIRAL_MODULE_ID,
      onReward: ({ rewardAmount, rewardUnit }) => {
        toast.openToast(`${rewardUnit} ${rewardAmount}개를 받았어요.`);
      },
      onClose: ({ sentRewardsCount }) => {
        if ((sentRewardsCount ?? 0) > 0) {
          openRewardRoutine();
        }
      },
      onFallback: shareResult,
      onError: (error) => console.info("공유 리워드 실행 실패:", error),
    });
  };

  return (
    <main className="app-shell">
      {screen === "home" ? (
        <>
          <UtilityNudge
            appLabel="소비 방어 룰렛"
            notifyCopy="알림을 켜면 내일 방어 룰렛을 놓치지 않아요."
            loginCopy="로그인하면 30일 방어 기록을 더 안전하게 이어볼 수 있어요."
          />

          <section className="hero-card">
            <p className="eyebrow">오늘의 룰렛 · {todayMission.label} 방어</p>
            <h1>오늘 막을 소비 함정을 룰렛으로 골라요</h1>
            <p className="description">
              긴 설명 없이 룰렛을 돌리고, 5초 안에 방어 선택을 탭해요. 결과는
              생활 습관 참고용이에요.
            </p>
            <HeroArt rotation={spinRotation} />
            <section className="daily-ticket">
              <strong>오늘의 방어권</strong>
              <span>방패 3개를 모으면 오늘 기록이 채워져요.</span>
              <div className="shield-row" aria-label="오늘 방패 수집">
                {Array.from({ length: 3 }).map((_, index) => (
                  <i
                    key={index}
                    className={index < shieldCount ? "filled" : ""}
                  />
                ))}
              </div>
              <button
                className="mini-action"
                type="button"
                onClick={collectShield}
              >
                방패 모으기 {shieldCount}/3
              </button>
              <small>
                최근 기록 {stamps.length}/30 · 내일은 {tomorrowMission.label}{" "}
                함정
              </small>
            </section>
            <button className="primary-button" onClick={startSpin}>
              소비 방어 룰렛 돌리기
            </button>
          </section>

          <section className="benefit-card">
            <h2>룰렛 후 열리는 것</h2>
            <div className="benefit-grid">
              <span>5초 선택 게임</span>
              <span>오늘의 방어 카드</span>
              <span>선택형 루틴</span>
              <span>30일 기록</span>
            </div>
          </section>

          <BannerAd label="소비 방어 룰렛 홈 광고" />
        </>
      ) : null}

      {screen === "rolling" ? (
        <section className="play-card roulette-stage">
          <div className="progress-row">
            <button className="back-button" onClick={goHome}>
              ← 홈
            </button>
            <span>룰렛 회전 중</span>
          </div>
          <HeroArt isRolling rotation={spinRotation} />
          <p className="eyebrow">오늘의 소비 함정 선택 중</p>
          <h1>룰렛이 돌고 있어요</h1>
          <p className="description">
            잠깐만 기다리면 오늘 점검할 소비 상황이 멈춰요. 멈춘 뒤 바로 5초
            선택으로 넘어가요.
          </p>
          <div className="rolling-status" aria-live="polite">
            <span />
            <strong>{mission.label} 함정 쪽으로 이동 중</strong>
          </div>
        </section>
      ) : null}

      {screen === "spin" ? (
        <section className="play-card">
          <div className="progress-row">
            <button className="back-button" onClick={goHome}>
              ← 홈
            </button>
            <span>5초 선택</span>
          </div>
          <HeroArt compact rotation={spinRotation} />
          <p className="eyebrow">{mission.trapName}</p>
          <h1>{mission.title}</h1>
          <p className="description">{mission.hook}</p>
          <div className="choice-list">
            <button onClick={chooseSafe}>
              <strong>{mission.safeChoice}</strong>
              <span>오늘의 방어 선택</span>
            </button>
            <button onClick={chooseRisky}>
              <strong>{mission.riskyChoice}</strong>
              <span>위험한 선택</span>
            </button>
          </div>
          <BannerAd label="선택 화면 하단 광고" />
        </section>
      ) : null}

      {screen === "result" ? (
        <section
          className="result-card"
          style={{ "--mission-color": mission.color } as React.CSSProperties}
        >
          <HeroArt compact rotation={spinRotation} />
          <p className="eyebrow">오늘의 방어 결과</p>
          <h1>{mission.resultTitle}</h1>
          <p className="result-name">{mission.trapName}</p>
          <div className="insight-box">
            <strong>오늘의 단서</strong>
            <span>{mission.clue}</span>
          </div>
          <div className="insight-box soft">
            <strong>오늘의 방어 루틴</strong>
            <span>{mission.routine}</span>
          </div>
          {routineOpen ? (
            <div className="reward-box">
              <strong>AD 시청 보상 · 루틴 카드</strong>
              <ol>
                <li>오늘 함정 이름을 기록하기</li>
                <li>같은 상황이 오면 안전 선택을 먼저 보기</li>
                <li>내일 다른 함정으로 다시 방어하기</li>
              </ol>
            </div>
          ) : null}
          <button
            className="primary-button"
            onClick={openRewardRoutine}
          >
            {routineOpen ? "보상 카드 받음" : "AD 보고 방어 보상 받기"}
          </button>
          <button className="secondary-button" onClick={startSpin}>
            한 번 더 돌리기
          </button>
          <button className="secondary-button ghost" onClick={goHome}>
            홈으로
          </button>
          <RewardHub
            appLabel="소비 방어 룰렛"
            pointsLabel={`${stamps.length * 5}P 모았어요`}
            primaryLabel="광고 보고 방어 카드 받기"
            questLabel="오늘 방패 모으기"
            questProgress={shieldCount}
            questTotal={3}
            links={REWARD_APP_LINKS.filter((link) => link.href !== "intoss://spending-defense-roulette")}
            onPrimaryReward={openRewardRoutine}
            onOpenNotification={() => setIsRewardNotifyOpen(true)}
          />
          <StickyRewardCTA label="광고 보고 방어 카드 받기" onClick={openRewardRoutine} />
          <NotificationRewardSheet
            open={isRewardNotifyOpen}
            appLabel="소비 방어 룰렛"
            onClose={() => setIsRewardNotifyOpen(false)}
          />
          <ResultActionMenu
            items={[
              { label: "AD 방어 보상", onClick: openRewardRoutine },
              { label: "친구 추천 보상", onClick: shareResultWithReward },
              { label: "다시 돌리기", onClick: startSpin },
            ]}
            helperCopy="AD 버튼은 광고 시청 후 앱 안 보상 카드가 열려요"
          />
          <BannerAd label="소비 방어 룰렛 결과 광고" />
        </section>
      ) : null}
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
    <section className="cherry-menu" aria-label="보상 실행 메뉴">
      <div className="cherry-menu__head">
        <strong>보상 받기</strong>
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

function HeroArt({
  compact = false,
  isRolling = false,
  rotation,
}: {
  compact?: boolean;
  isRolling?: boolean;
  rotation: number;
}) {
  const className = [
    "hero-art",
    compact ? "compact" : "",
    isRolling ? "rolling" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} aria-hidden="true">
      <img src={rouletteHero} />
      <span className="hero-scrim" />
      <span className="roulette-pointer" />
      <span
        className="roulette-wheel"
        style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
      >
        <i>배달</i>
        <i>택시</i>
        <i>쇼핑</i>
        <i>구독</i>
        <i>간식</i>
      </span>
      <span className="hero-badge">방어 룰렛</span>
      <span className="hero-chip">5초 선택</span>
      <span className="hero-label">루틴 카드</span>
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

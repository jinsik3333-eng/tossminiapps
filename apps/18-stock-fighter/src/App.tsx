import {
  loadFullScreenAd,
  showFullScreenAd,
} from "@apps-in-toss/web-framework";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  FIGHTERS,
  MAX_HINTS,
  MISS_LIMIT,
  MINI_GAME_TRIGGER_CHARGE,
  QUESTIONS_PER_SET,
  applyQuizAnswer,
  canUnlockFighter,
  claimEndingRandomFighterReward,
  completeRewardedAd,
  createAppState,
  createCandle,
  createMiniGameState,
  finishMiniGame,
  getFighterById,
  getChaseActorIndexes,
  getQuestionChoices,
  getQuizQuestionsForSet,
  getQuizBattleCry,
  getUnlockedFighterIds,
  resolveCandleInput,
  resetQuizProgress,
  reviveMiniGame,
  selectFighter,
  tickMiniGame,
  useHint as spendHint,
} from "./lib/stockFighterLogic.mjs";
import {
  createStockFighterAudio,
  stockFighterTrackForScreen,
} from "./audio/stockFighterAudio";
import "./App.css";

type Screen = "home" | "intro" | "quiz" | "chase" | "collection" | "ending";
type LocalPreviewMode = "ending" | "quiz" | "chase" | null;
type RewardKind = "fighter-unlock" | "revive";
type Direction = "up" | "down" | "late";
type ChaseOverlay = "guide-heat" | "guide-controls" | "3" | "2" | "1" | "GO" | null;
type EndingDrawPhase = "ready" | "rolling" | "revealed";
type EndingDrawSource = "completion" | "reward-ad";

type Fighter = {
  id: string;
  name: string;
  unlockedDefault: boolean;
  signature: string;
  effect: string;
  assist: string;
  accent: string;
};

type Question = {
  id: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  format: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  hint: string;
  topic: string;
};

type QuestionChoice = {
  label: string;
  originalIndex: number;
};

type AnswerFx = {
  optionIndex: number;
  isCorrect: boolean;
} | null;

type AppState = {
  score: number;
  correctStreak: number;
  quizCharge: number;
  answeredCount: number;
  correctCount: number;
  hints: number;
  fighterUnlockTickets: number;
  reviveTickets: number;
  selectedFighterId: string;
  unlockedFighterIds: string[];
  quizSetIndex: number;
  quizCursor: number;
  miniGameRuns: number;
  completed: boolean;
  hasSeenIntro?: boolean;
  endingRewardClaimed?: boolean;
};

type MiniGameState = {
  fighterId: string;
  candleSeed: number;
  remainingMs: number;
  combo: number;
  bestCombo: number;
  score: number;
  mistakes: number;
  distance: number;
  inputDueMs: number;
  lateStrikes: number;
  invincibleMs: number;
  dashMs: number;
  effectBursts: number;
  shieldCharges: number;
  hintEarned: boolean;
  ended: boolean;
  result: "running" | "ko" | "survived";
};

type Candle = {
  id: string;
  direction: "up" | "down";
  body: number;
  wick: number;
};

type VisualCandle = {
  id: string;
  direction: "up" | "down";
  x: number;
  wickTop: number;
  wickBottom: number;
  bodyTop: number;
  bodyHeight: number;
  volumeHeight: number;
  maFastY: number;
  maSlowY: number;
  isCurrent: boolean;
};

type RewardBridge = {
  showRewardedAd: (
    rewardKind: RewardKind,
  ) => Promise<{ userEarnedReward: boolean }>;
};

type RewardedAdResult = {
  userEarnedReward: boolean;
};

const fighters = FIGHTERS as Fighter[];
const mainFighter = fighters.find((fighter) => fighter.unlockedDefault) ?? fighters[0];
const hiddenFighters = fighters.filter((fighter) => !fighter.unlockedDefault);
const STORAGE_KEY = "stock-fighter-state-v1";
const ASSET_BASE = "/assets/stock-fighter";
const REWARDED_AD_GROUP_ID = import.meta.env.VITE_TOSS_REWARDED_AD_GROUP_ID ?? "";
const CHASE_VIEWBOX_WIDTH = 390;
const CHASE_VIEWBOX_HEIGHT = 330;
const CHASE_CANDLE_COUNT = 64;
const CHASE_TARGET_INDEX = 12;
const CHASE_CANDLE_SPACING = 16.5;
const CHASE_STEP_WIDTH = CHASE_CANDLE_SPACING;
const CHASE_STEP_SECONDS = 0.6;
const CHASE_TICK_MS = CHASE_STEP_SECONDS * 1000;
const CHASE_SOURCE_OFFSET = 630;
const CHASE_PLOT_TOP = 34;
const CHASE_PLOT_BOTTOM = 258;
const CHASE_VOLUME_BASE = 310;
const CHASE_GRID_X = [40, 88, 136, 184, 232, 280, 328, 376];
const CHASE_GRID_Y = [54, 94, 134, 174, 214, 254];
const ENDING_DRAW_REVEAL_DELAY_MS = 1250;
const ENDING_DRAW_SHUFFLE_SFX_DELAYS_MS = [0, 180, 360, 540, 720, 900, 1080] as const;

function chartPriceAt(step: number) {
  return (
    101 +
    step * 0.115 +
    Math.sin(step * 0.34) * 2.8 +
    Math.sin(step * 0.105) * 5.4
  );
}

function toChartY(price: number, low: number, high: number) {
  const range = Math.max(1, high - low);
  const ratio = (price - low) / range;
  return CHASE_PLOT_BOTTOM - ratio * (CHASE_PLOT_BOTTOM - CHASE_PLOT_TOP);
}

function makeAveragePath(candles: VisualCandle[], key: "maFastY" | "maSlowY", offsetX = 0) {
  return candles
    .map((candle, index) => `${index === 0 ? "M" : "L"} ${(candle.x + offsetX).toFixed(1)} ${candle[key].toFixed(1)}`)
    .join(" ");
}

function buildChaseCandles(step: number, candleSeed: number) {
  const raw = Array.from({ length: CHASE_CANDLE_COUNT }, (_, index) => {
    const sourceStep = CHASE_SOURCE_OFFSET + step + index - CHASE_TARGET_INDEX;
    const candle = createCandle(sourceStep, candleSeed) as Candle;
    const center = chartPriceAt(sourceStep);
    const bodySize = 0.8 + candle.body / 18;
    const wickSize = 0.5 + candle.wick / 16;
    const open = candle.direction === "up" ? center - bodySize / 2 : center + bodySize / 2;
    const close = candle.direction === "up" ? center + bodySize / 2 : center - bodySize / 2;
    const high = Math.max(open, close) + wickSize;
    const low = Math.min(open, close) - wickSize;
    const maFast = chartPriceAt(sourceStep - 2) * 0.35 + center * 0.65;
    const maSlow = chartPriceAt(sourceStep - 8) * 0.5 + center * 0.5;

    return {
      ...candle,
      sourceStep,
      open,
      close,
      high,
      low,
      maFast,
      maSlow,
      volume: 22 + ((sourceStep * 13) % 54),
      isCurrent: index === CHASE_TARGET_INDEX,
    };
  });

  const lowest = Math.min(...raw.map((candle) => candle.low), ...raw.map((candle) => candle.maSlow)) - 1.2;
  const highest = Math.max(...raw.map((candle) => candle.high), ...raw.map((candle) => candle.maFast)) + 1.2;

  return raw.map((candle, index) => {
    const openY = toChartY(candle.open, lowest, highest);
    const closeY = toChartY(candle.close, lowest, highest);
    const bodyTop = Math.min(openY, closeY);

    return {
      id: candle.id,
      direction: candle.direction,
      x: 22 + index * CHASE_CANDLE_SPACING,
      wickTop: toChartY(candle.high, lowest, highest),
      wickBottom: toChartY(candle.low, lowest, highest),
      bodyTop,
      bodyHeight: Math.max(5, Math.abs(openY - closeY)),
      volumeHeight: Math.max(16, candle.volume),
      maFastY: toChartY(candle.maFast, lowest, highest),
      maSlowY: toChartY(candle.maSlow, lowest, highest),
      isCurrent: candle.isCurrent,
    } satisfies VisualCandle;
  });
}

function spritePosition(candle: VisualCandle) {
  const footY = Math.max(16, candle.bodyTop - 4);

  return {
    "--sprite-x": `${(candle.x / CHASE_VIEWBOX_WIDTH) * 100}%`,
    "--sprite-y": `${(footY / CHASE_VIEWBOX_HEIGHT) * 100}%`,
  } as CSSProperties;
}

function fighterPortraitStyle(fighter: Fighter, index: number) {
  const column = index % 5;
  const row = Math.floor(index / 5);
  const hiddenAssetBase = fighter.unlockedDefault ? null : `${ASSET_BASE}/fighters`;

  return {
    "--fighter-accent": fighter.accent,
    "--portrait-x": `${column * 25}%`,
    "--portrait-y": `${row * (100 / 3)}%`,
    "--fighter-quiz-character-image":
      hiddenAssetBase == null ? "none" : `url("${hiddenAssetBase}/quiz-character/${fighter.id}.png")`,
    "--fighter-runner-image":
      hiddenAssetBase == null ? "none" : `url("${hiddenAssetBase}/runner/${fighter.id}.png")`,
  } as CSSProperties;
}

const introPanels = [
  {
    image: `${ASSET_BASE}/intro-01-payday.png`,
    title: "월급날의 장대음봉",
    copy: "개미파이터. 평범한 직장인. 꿈은 작았다. 월급날에 치킨을 시켜도 눈치 안 보는 삶.",
  },
  {
    image: `${ASSET_BASE}/intro-02-rumor.png`,
    title: "수익률 300%의 속삭임",
    copy: "친구의 친구의 사촌이 봤다던 전설의 종목. 그는 공부 대신 믿음을 눌렀다.",
  },
  {
    image: `${ASSET_BASE}/intro-03-blue-candle.png`,
    title: "파란 장대음봉의 비극",
    copy: "계좌는 녹고, 멘탈은 상장폐지. 남은 건 반쪽 난 김밥과 왜 샀지라는 질문뿐.",
  },
  {
    image: `${ASSET_BASE}/intro-04-chart-master.png`,
    title: "공시 두루마리의 노인",
    copy: "무지성 매수는 필살기가 아니다. 살아남고 싶다면, 먼저 배워라.",
  },
  {
    image: `${ASSET_BASE}/intro-05-enter-arena.png`,
    title: "주식장 입장",
    copy: "추천이 아니라 지식으로. 운이 아니라 퀴즈로. 이제 험난한 주식장에 입장한다.",
  },
] as const;

const endingPanels = [
  {
    image: `${ASSET_BASE}/ending-01-study.png`,
    title: "위험한 장에도 공부는 계속된다",
    copy: "개미 파이터는 손실의 공포를 무릎쓰고 투자를 진행하며 기술적, 기업분석을 씹어먹었다.",
  },
  {
    image: `${ASSET_BASE}/ending-02-mentor.png`,
    title: "워매 버핏의 가르침",
    copy: "전설의 가치투자 스승 워매 버핏은 말했다.\n싼 이유를 묻고, 오래 버틸 이유를 찾아라.",
  },
  {
    image: `${ASSET_BASE}/ending-03-mansion.png`,
    title: "100배의 기적",
    copy: "공부한 회사가 대박을 쳤다. 개미파이터는 서울 야경이 보이는 의리의리한 집을 장만했다.",
  },
  {
    image: `${ASSET_BASE}/ending-04-janitor.png`,
    title: "청소부가 된 추격자",
    copy: "어느 날, 주머니를 털던 그 깡패가 개미파이터 집의 청소부로 취업했다. 인생 차트도 갭하락이 있다.",
  },
  {
    image: `${ASSET_BASE}/ending-05-teacher.png`,
    title: "훈훈한 상한가",
    copy: "눈물 흘리는 깡패를 본 개미파이터는 넓은 마음으로 주식을 가르쳤다. 둘의 미래는 상한가다.",
  },
] as const;

const difficultyLabel = {
  beginner: "초급",
  intermediate: "중급",
  advanced: "고급",
};

const topicLabel: Record<string, string> = {
  candlestick: "캔들 판독",
  chart: "차트 기본",
  disclosure: "공시",
  dividend: "배당",
  fundamental: "기업 체력",
  macro: "시장 변수",
  market: "시장 구조",
  order: "주문 방식",
  orderbook: "호가창",
  policy: "안전 수칙",
  product: "상품 이해",
  risk: "리스크 관리",
  technical: "기술 분석",
  valuation: "가치 지표",
  volume: "거래량",
};

function formatQuestionHint(question: Question) {
  return `퀴즈힌트: ${question.hint}`;
}

function stripQuizSetPrefix(prompt: string) {
  return prompt.replace(/^(실전 복습\s*2세트|고수 점검\s*3세트)\.\s*/, "");
}

function formatTopicLabel(topic: string) {
  return topicLabel[topic] ?? "주식 상식";
}

function readStoredState(): AppState {
  if (typeof window === "undefined") {
    return createAppState() as AppState;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored == null) {
      return createAppState() as AppState;
    }

    return createAppState(JSON.parse(stored)) as AppState;
  } catch {
    return createAppState() as AppState;
  }
}

function getLocalPreviewMode(): LocalPreviewMode {
  if (typeof window === "undefined") {
    return null;
  }

  const { hostname, search } = window.location;
  const searchParams = new URLSearchParams(search);
  const isLocalHost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1";
  const preview = searchParams.get("preview");

  if (!isLocalHost || (preview !== "ending" && preview !== "quiz" && preview !== "chase")) {
    return null;
  }

  return preview;
}

function getLocalPreviewFighterId() {
  if (typeof window === "undefined") {
    return null;
  }

  const fighterId = new URLSearchParams(window.location.search).get("fighter");
  const fighter = fighterId == null ? hiddenFighters[0] : getFighterById(fighterId);

  return fighter.unlockedDefault ? hiddenFighters[0]?.id ?? mainFighter.id : fighter.id;
}

function readInitialState(localPreviewMode: LocalPreviewMode): AppState {
  const state = localPreviewMode === "ending" ? (createAppState() as AppState) : readStoredState();

  if (localPreviewMode === "quiz" || localPreviewMode === "chase") {
    const fighterId = getLocalPreviewFighterId() ?? mainFighter.id;

    return createAppState({
      ...state,
      selectedFighterId: fighterId,
      unlockedFighterIds: [fighterId],
      quizCursor: 13,
      hasSeenIntro: true,
    }) as AppState;
  }

  if (localPreviewMode !== "ending") {
    return state;
  }

  return createAppState({
    ...state,
    score: Math.max(state.score, 5000),
    correctStreak: 10,
    quizCharge: 0,
    answeredCount: QUESTIONS_PER_SET,
    correctCount: QUESTIONS_PER_SET,
    quizCursor: QUESTIONS_PER_SET - 1,
    completed: true,
    hasSeenIntro: true,
    endingRewardClaimed: false,
  }) as AppState;
}

function shouldSkipAntEndingPanels(state: AppState) {
  return (
    state.completed &&
    !state.endingRewardClaimed &&
    state.selectedFighterId !== "ant-fighter"
  );
}

function getRewardBridge(): RewardBridge | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return (
    window as Window & {
      stockFighterRewardBridge?: RewardBridge;
    }
  ).stockFighterRewardBridge;
}

function nextQuestionFrom(state: AppState): Question {
  const questions = getQuizQuestionsForSet(state.quizSetIndex) as Question[];

  return questions[Math.min(state.quizCursor, questions.length - 1)];
}

function App() {
  const localPreviewMode = getLocalPreviewMode();
  const isEndingPreview = localPreviewMode === "ending";
  const isQuizPreview = localPreviewMode === "quiz";
  const isChasePreview = localPreviewMode === "chase";
  const initialScreen: Screen = isEndingPreview ? "ending" : isQuizPreview ? "quiz" : isChasePreview ? "chase" : "home";
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [appState, setAppState] = useState<AppState>(() => readInitialState(localPreviewMode));
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [answerFx, setAnswerFx] = useState<AnswerFx>(null);
  const [previewFighterId, setPreviewFighterId] = useState<string | null>(null);
  const [typedPrompt, setTypedPrompt] = useState("");
  const [introIndex, setIntroIndex] = useState(0);
  const [endingIndex, setEndingIndex] = useState(0);
  const [endingPrizeId, setEndingPrizeId] = useState<string | null>(null);
  const [endingDrawPhase, setEndingDrawPhase] = useState<EndingDrawPhase>("ready");
  const [endingDrawSource, setEndingDrawSource] = useState<EndingDrawSource>("completion");
  const [miniGame, setMiniGame] = useState<MiniGameState | null>(() => (
    isChasePreview ? createMiniGameState(readInitialState(localPreviewMode).selectedFighterId) as MiniGameState : null
  ));
  const [chaseOverlay, setChaseOverlay] = useState<ChaseOverlay>(null);
  const [isChasePaused, setIsChasePaused] = useState(false);
  const [candleStep, setCandleStep] = useState(0);
  const [jumpTick, setJumpTick] = useState(0);
  const [comboPop, setComboPop] = useState<string | null>(null);
  const [currentCandle, setCurrentCandle] = useState<Candle>(
    () => createCandle(CHASE_SOURCE_OFFSET, miniGame?.candleSeed ?? 0) as Candle,
  );
  const [battleMessage, setBattleMessage] = useState("상승은 오른쪽, 하락은 왼쪽!");
  const [, setRewardStatus] = useState("보상형 광고 대기 중");
  const [isRewardReady, setIsRewardReady] = useState(false);
  const [isRewardSupported, setIsRewardSupported] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const unregisterRewardAdRef = useRef<(() => void) | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audio = useMemo(() => createStockFighterAudio(), []);

  const unlockedIds = useMemo(
    () => new Set(getUnlockedFighterIds(appState) as string[]),
    [appState],
  );
  const selectedFighter = getFighterById(appState.selectedFighterId) as Fighter;
  const endingPrizeFighter = endingPrizeId == null
    ? null
    : (getFighterById(endingPrizeId) as Fighter);
  const previewFighter = previewFighterId == null
    ? null
    : (getFighterById(previewFighterId) as Fighter);
  const questions = useMemo(
    () => getQuizQuestionsForSet(appState.quizSetIndex) as Question[],
    [appState.quizSetIndex],
  );
  const currentQuestion = nextQuestionFrom(appState);
  const currentQuestionChoices = useMemo(
    () => getQuestionChoices(currentQuestion) as QuestionChoice[],
    [currentQuestion],
  );
  const selectedFighterIndex = Math.max(
    0,
    fighters.findIndex((fighter) => fighter.id === selectedFighter.id),
  );
  const selectedFighterSceneStyle = fighterPortraitStyle(selectedFighter, selectedFighterIndex);
  const quizPromptText = stripQuizSetPrefix(currentQuestion.prompt);
  const quizBattleCry = getQuizBattleCry(appState.answeredCount);
  const progressPercent = Math.round(
    (appState.answeredCount / questions.length) * 100,
  );
  const quizCharge = appState.quizCharge ?? 0;
  const quizChargePercent = Math.min(
    100,
    Math.round((quizCharge / MINI_GAME_TRIGGER_CHARGE) * 100),
  );
  const isEndingDrawAudioMuted = screen === "ending" && endingIndex >= endingPanels.length;
  const candleSeed = miniGame?.candleSeed ?? 0;
  const advanceCandleBy = useCallback((amount = 1) => {
    setCandleStep((step) => {
      const nextStep = step + amount;
      setCurrentCandle(
        createCandle(CHASE_SOURCE_OFFSET + nextStep, candleSeed) as Candle,
      );
      return nextStep;
    });
  }, [candleSeed]);

  const loadRewardedAd = useCallback(() => {
    const bridge = getRewardBridge();

    if (bridge != null) {
      setIsRewardSupported(true);
      setIsRewardReady(true);
      setRewardStatus("광고 보상 준비 완료");
      return;
    }

    setIsRewardReady(false);

    if (REWARDED_AD_GROUP_ID.trim() === "") {
      setIsRewardSupported(false);
      setRewardStatus("광고 ID가 설정되지 않았다.");
      return;
    }

    let supported = false;

    try {
      supported = loadFullScreenAd.isSupported();
    } catch {
      supported = false;
    }

    setIsRewardSupported(supported);

    if (!supported) {
      setRewardStatus("토스 앱에서 광고를 사용할 수 있다.");
      return;
    }

    try {
      unregisterRewardAdRef.current?.();
      unregisterRewardAdRef.current = loadFullScreenAd({
        options: { adGroupId: REWARDED_AD_GROUP_ID },
        onEvent: (event) => {
          if (event.type === "loaded") {
            setIsRewardReady(true);
            setRewardStatus("광고 보상 준비 완료");
          }
        },
        onError: () => {
          setIsRewardReady(false);
          setRewardStatus("광고를 불러오지 못했다.");
        },
      });
    } catch {
      setIsRewardReady(false);
      setRewardStatus("광고를 불러오지 못했다.");
    }
  }, []);

  const showRewardedAd = useCallback(
    async (rewardKind: RewardKind): Promise<RewardedAdResult> => {
      const bridge = getRewardBridge();

      if (bridge != null) {
        return bridge.showRewardedAd(rewardKind);
      }

      if (REWARDED_AD_GROUP_ID.trim() === "") {
        setRewardStatus("광고 ID가 설정되지 않았다.");
        return { userEarnedReward: false };
      }

      if (!isRewardSupported) {
        setRewardStatus("토스 앱에서 광고를 사용할 수 있다.");
        return { userEarnedReward: false };
      }

      if (!isRewardReady) {
        setRewardStatus("광고 보상 준비 중");
        loadRewardedAd();
        return { userEarnedReward: false };
      }

      setIsRewardReady(false);
      setRewardStatus("광고 재생 중");

      return new Promise((resolve) => {
        let settled = false;
        let earnedReward = false;
        const settle = (userEarnedReward: boolean) => {
          if (settled) {
            return;
          }

          settled = true;
          resolve({ userEarnedReward });
        };

        try {
          showFullScreenAd({
            options: { adGroupId: REWARDED_AD_GROUP_ID },
            onEvent: (event) => {
              switch (event.type) {
                case "userEarnedReward":
                  earnedReward = true;
                  settle(true);
                  break;
                case "dismissed":
                  loadRewardedAd();
                  if (!earnedReward) {
                    settle(false);
                  }
                  break;
                case "failedToShow":
                  setRewardStatus("광고 표시가 실패했다.");
                  loadRewardedAd();
                  settle(false);
                  break;
              }
            },
            onError: () => {
              setRewardStatus("광고를 불러오지 못했다.");
              loadRewardedAd();
              settle(false);
            },
          });
        } catch {
          setRewardStatus("광고를 불러오지 못했다.");
          loadRewardedAd();
          settle(false);
        }
      });
    },
    [isRewardReady, isRewardSupported, loadRewardedAd],
  );

  useEffect(() => {
    if (localPreviewMode != null) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }, [appState, localPreviewMode]);

  useEffect(() => {
    loadRewardedAd();

    return () => {
      unregisterRewardAdRef.current?.();
      unregisterRewardAdRef.current = null;
    };
  }, [loadRewardedAd]);

  useEffect(() => () => audio.dispose(), [audio]);

  useEffect(() => {
    if (!audioEnabled) {
      audio.setTrack("none");
      return;
    }

    audio.setTrack(
      stockFighterTrackForScreen(screen, miniGame, { isEndingDraw: isEndingDrawAudioMuted }),
    );
  }, [audio, audioEnabled, isEndingDrawAudioMuted, miniGame, screen]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      audio.setVisible(!document.hidden);
    };

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [audio]);

  useEffect(() => {
    if (screen !== "quiz") {
      return undefined;
    }

    setTypedPrompt("");
    setActiveHint(null);
    const text = quizPromptText;
    let cursor = 0;
    const timer = window.setInterval(() => {
      cursor += 1;
      setTypedPrompt(text.slice(0, cursor));

      if (cursor >= text.length) {
        window.clearInterval(timer);
      }
    }, 22);

    return () => window.clearInterval(timer);
  }, [currentQuestion.id, quizPromptText, screen]);

  useEffect(() => {
    if (
      screen !== "chase" ||
      miniGame == null ||
      miniGame.ended ||
      isChasePaused ||
      chaseOverlay != null
    ) {
      return undefined;
    }

    const elapsedMs = CHASE_TICK_MS / 4;
    const timer = window.setInterval(() => {
      setMiniGame((game) => {
        if (game == null) {
          return game;
        }

        const nextGame = tickMiniGame(game, elapsedMs, {
          applyLatePenalty: true,
        }) as MiniGameState;
        const lateDelta = Math.max(
          0,
          (nextGame.lateStrikes ?? 0) - (game.lateStrikes ?? 0),
        );

        if (lateDelta > 0) {
          advanceCandleBy(lateDelta);
          setBattleMessage(
            nextGame.ended
              ? "느렸다! 깡패가 주머니까지 따라붙었다!"
              : "느렸다! 개미가 한 칸 뒤로 밀렸다!",
          );
        }

        return nextGame;
      });
    }, elapsedMs);

    return () => window.clearInterval(timer);
  }, [advanceCandleBy, chaseOverlay, isChasePaused, miniGame, screen]);

  useEffect(() => {
    if (
      chaseOverlay !== "3" &&
      chaseOverlay !== "2" &&
      chaseOverlay !== "1" &&
      chaseOverlay !== "GO"
    ) {
      return undefined;
    }

    const nextOverlay = {
      "3": "2",
      "2": "1",
      "1": "GO",
      GO: null,
    }[chaseOverlay] as ChaseOverlay;
    const timer = window.setTimeout(
      () => setChaseOverlay(nextOverlay),
      chaseOverlay === "GO" ? 520 : 680,
    );

    return () => window.clearTimeout(timer);
  }, [chaseOverlay]);

  const advanceCandle = () => {
    advanceCandleBy(1);
  };

  const persistState = (nextState: AppState) => {
    setAppState(nextState);
  };

  const completionDestination = (state: AppState): Screen =>
    state.completed && !state.endingRewardClaimed ? "ending" : "home";
  const completionEndingIndex = (state: AppState) =>
    shouldSkipAntEndingPanels(state) ? endingPanels.length : 0;

  const handleAudioStickerClick = () => {
    const nextEnabled = !audioEnabled;
    setAudioEnabled(nextEnabled);

    if (!nextEnabled) {
      audio.setTrack("none");
      return;
    }

    void audio.unlock().then((unlocked) => {
      if (!unlocked) {
        setAudioEnabled(false);
        return;
      }

      audio.playSfx("uiTap");
      audio.setTrack(
        stockFighterTrackForScreen(screen, miniGame, { isEndingDraw: isEndingDrawAudioMuted }),
      );
    });
  };

  const renderCutsceneAudioButton = () => (
    <button
      aria-label={audioEnabled ? "사운드 끄기" : "사운드 켜기"}
      aria-pressed={audioEnabled}
      className={`cutscene-audio-button ${audioEnabled ? "is-audio-on" : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        handleAudioStickerClick();
      }}
      type="button"
    >
      <span aria-hidden="true">{audioEnabled ? "🔊" : "🔇"}</span>
    </button>
  );

  const resetGame = () => {
    audio.playSfx("uiTap");
    const fresh = resetQuizProgress(appState) as AppState;
    persistState(fresh);
    setMiniGame(null);
    setChaseOverlay(null);
    setIntroIndex(0);
    setEndingIndex(0);
    setEndingPrizeId(null);
    setEndingDrawPhase("ready");
    setEndingDrawSource("completion");
    setScreen("home");
    setFeedback(null);
    setAnswerFx(null);
    setPreviewFighterId(null);
    setIsResetConfirmOpen(false);
  };

  const enterQuiz = (state = appState) => {
    audio.playSfx("uiTap");
    persistState({ ...state, hasSeenIntro: true });
    setIntroIndex(0);
    setEndingIndex(state.completed ? completionEndingIndex(state) : 0);
    setEndingPrizeId(null);
    setEndingDrawPhase("ready");
    setEndingDrawSource("completion");
    setScreen(state.completed ? completionDestination(state) : "quiz");
  };

  const startQuiz = () => {
    audio.playSfx("uiTap");
    setFeedback(null);

    if (appState.completed) {
      const fresh = resetQuizProgress(appState) as AppState;

      persistState(fresh);
      setIntroIndex(0);
      setEndingIndex(0);
      setEndingPrizeId(null);
      setEndingDrawPhase("ready");
      setEndingDrawSource("completion");
      setScreen(fresh.hasSeenIntro ? "quiz" : "intro");
      return;
    }

    if (appState.hasSeenIntro) {
      setScreen("quiz");
      return;
    }

    setIntroIndex(0);
    setScreen("intro");
  };

  const advanceIntro = () => {
    audio.playSfx("uiTap");
    if (introIndex >= introPanels.length - 1) {
      enterQuiz();
      return;
    }

    setIntroIndex((index) => index + 1);
  };

  const advanceEnding = () => {
    audio.playSfx("uiTap");
    if (endingIndex < endingPanels.length - 1) {
      setEndingIndex((index) => index + 1);
      return;
    }

    if (appState.endingRewardClaimed) {
      setScreen("home");
      return;
    }

    setEndingPrizeId(null);
    setEndingDrawPhase("ready");
    setEndingDrawSource("completion");
    setEndingIndex(endingPanels.length);
  };

  const playEndingShuffleSfx = () => {
    for (const delayMs of ENDING_DRAW_SHUFFLE_SFX_DELAYS_MS) {
      window.setTimeout(() => audio.playSfx("shuffleTick"), delayMs);
    }
  };

  const startEndingDraw = () => {
    if (endingDrawPhase === "rolling" || appState.endingRewardClaimed) {
      return;
    }

    setEndingPrizeId(null);
    setEndingDrawSource("completion");
    setEndingDrawPhase("rolling");
    playEndingShuffleSfx();

    window.setTimeout(() => {
      const reward = claimEndingRandomFighterReward(appState) as {
        claimed: boolean;
        unlocked: boolean;
        fighter: Fighter | null;
        state: AppState;
      };

      persistState(reward.state);
      setEndingPrizeId(reward.fighter?.id ?? null);
      setEndingDrawPhase("revealed");
      audio.playSfx("cardReveal");
    }, ENDING_DRAW_REVEAL_DELAY_MS);
  };

  const startRewardedFighterDraw = (state: AppState) => {
    const beforeUnlocked = new Set(getUnlockedFighterIds(state) as string[]);

    setEndingPrizeId(null);
    setEndingDrawSource("reward-ad");
    setEndingDrawPhase("rolling");
    setPreviewFighterId(null);
    setEndingIndex(endingPanels.length);
    setScreen("ending");
    playEndingShuffleSfx();

    window.setTimeout(() => {
      const nextState = completeRewardedAd(state, "fighter-unlock") as AppState;
      const newlyOpened = fighters.find(
        (fighter) =>
          !beforeUnlocked.has(fighter.id) &&
          nextState.unlockedFighterIds.includes(fighter.id),
      );

      persistState(nextState);
      setEndingPrizeId(newlyOpened?.id ?? null);
      setEndingDrawPhase("revealed");
      audio.playSfx("cardReveal");
      setRewardStatus(
        newlyOpened
          ? `${newlyOpened.name} 랜덤 합류!`
          : "모든 히든파이터가 이미 열렸다.",
      );
    }, ENDING_DRAW_REVEAL_DELAY_MS);
  };

  const startCountdown = () => {
    setBattleMessage("3, 2, 1... 차트 위로!");
    setChaseOverlay("3");
  };

  const startMiniGame = (state: AppState) => {
    audio.playSfx("miniStart");
    const initialGame = createMiniGameState(
      state.selectedFighterId,
    ) as MiniGameState;
    setMiniGame(initialGame);
    setChaseOverlay("guide-heat");
    setIsChasePaused(false);
    setComboPop(null);
    setCandleStep(0);
    setJumpTick(0);
    setCurrentCandle(
      createCandle(CHASE_SOURCE_OFFSET, initialGame.candleSeed) as Candle,
    );
    setBattleMessage(`${selectedFighter.name}, 차트 추격전 돌입!`);
    setScreen("chase");
  };

  const handleAnswer = (optionIndex: number) => {
    if (feedback != null || appState.completed) {
      return;
    }

    setAnswerFx({
      optionIndex,
      isCorrect: optionIndex === currentQuestion.answerIndex,
    });
    const result = applyQuizAnswer(
      appState,
      currentQuestion,
      optionIndex,
    ) as { isCorrect: boolean; shouldLaunchMiniGame: boolean; state: AppState };
    audio.playSfx(result.isCorrect ? "correct" : "wrong");
    setFeedback(result.isCorrect ? "correct" : "wrong");

    window.setTimeout(() => {
      setFeedback(null);
      setAnswerFx(null);
      persistState(result.state);

      if (result.state.completed) {
        setEndingIndex(completionEndingIndex(result.state));
        setEndingPrizeId(null);
        setEndingDrawSource("completion");
        setScreen(completionDestination(result.state));
        return;
      }

      if (result.shouldLaunchMiniGame) {
        audio.playSfx("chargeReady");
        startMiniGame(result.state);
        return;
      }

      setScreen("quiz");
    }, 720);
  };

  const handleHint = () => {
    const result = spendHint(appState) as { used: boolean; state: AppState };

    if (!result.used) {
      audio.playSfx("wrong");
      setActiveHint("힌트가 없다. 차트 추격전 10콤보로 벌어오자.");
      return;
    }

    audio.playSfx("hint");
    persistState(result.state);
    setActiveHint(formatQuestionHint(currentQuestion));
  };

  const handleSelectFighter = (fighter: Fighter) => {
    if (!unlockedIds.has(fighter.id)) {
      audio.playSfx("wrong");
      return;
    }

    audio.playSfx("uiTap");
    persistState(selectFighter(appState, fighter.id) as AppState);
  };

  const getAnswerState = (originalIndex: number) => {
    if (answerFx?.optionIndex !== originalIndex) {
      return undefined;
    }

    return answerFx.isCorrect ? "correct" : "wrong";
  };

  const handleReward = async (rewardKind: RewardKind) => {
    try {
      const event = await showRewardedAd(rewardKind);

      if (event.userEarnedReward) {
        if (rewardKind === "fighter-unlock") {
          startRewardedFighterDraw(appState);
          return;
        }

        const nextState = completeRewardedAd(appState, rewardKind) as AppState;

        if (rewardKind === "revive" && miniGame?.ended && miniGame.result === "ko") {
          const reviveResult = reviveMiniGame(nextState, miniGame) as {
            revived: boolean;
            state: AppState;
            game: MiniGameState;
          };

          if (reviveResult.revived) {
            audio.playSfx("chargeReady");
            persistState(reviveResult.state);
            setMiniGame(reviveResult.game);
            setIsChasePaused(false);
            setRewardStatus("광고 부활 완료!");
            startCountdown();
            return;
          }
        }

        persistState(nextState);
        audio.playSfx("chargeReady");
        setRewardStatus("차트 추격전 부활권 +1");
      } else {
        audio.playSfx("wrong");
        setRewardStatus("완료 보상이 확인되지 않았다.");
      }
    } catch {
      audio.playSfx("wrong");
      setRewardStatus("광고를 불러오지 못했다.");
    }
  };

  const handleCandleInput = (input: Direction) => {
    if (miniGame == null || miniGame.ended || chaseOverlay != null || isChasePaused) {
      return;
    }

    const nextGame = resolveCandleInput(
      miniGame,
      currentCandle,
      input,
    ) as MiniGameState;
    setMiniGame(nextGame);

    if (nextGame.ended) {
      audio.playSfx(nextGame.result === "survived" ? "miniSuccess" : "miniFail");
    } else if (input === "late") {
      audio.playSfx("wrong");
      setBattleMessage("느렸다! 뒤에서 발소리가 커진다.");
    } else if (nextGame.combo > miniGame.combo) {
      audio.playSfx("correct");
      setJumpTick((tick) => tick + 1);
      setComboPop(
        nextGame.effectBursts > miniGame.effectBursts ? "FEVER!" : "COMBO!",
      );
      window.setTimeout(() => setComboPop(null), 420);
      setBattleMessage(
        nextGame.effectBursts > miniGame.effectBursts
          ? `${selectedFighter.signature}! 보라 캔들 무적 1.5초!`
          : "캔들 판정 성공!",
      );
    } else {
      audio.playSfx("wrong");
      setBattleMessage("삐끗! 추격자가 가까워진다.");
    }

    if (!nextGame.ended) {
      advanceCandle();
    }
  };

  const completeMiniGame = () => {
    if (miniGame == null) {
      return;
    }

    const nextState = finishMiniGame(appState, miniGame) as AppState;
    if (miniGame.ended) {
      audio.playSfx(miniGame.result === "survived" ? "miniSuccess" : "miniFail");
    }
    persistState(nextState);
    setBattleMessage(
      miniGame.hintEarned ? "힌트 +1 획득!" : "투지를 다시 채워 재도전!",
    );
    setMiniGame(null);
    setChaseOverlay(null);
    setIsChasePaused(false);
    if (nextState.completed) {
      setEndingIndex(completionEndingIndex(nextState));
      setEndingPrizeId(null);
      setEndingDrawSource("completion");
    }
    setScreen(nextState.completed ? completionDestination(nextState) : "quiz");
  };

  const handleRevive = () => {
    if (miniGame == null) {
      return;
    }

    const result = reviveMiniGame(appState, miniGame) as {
      revived: boolean;
      state: AppState;
      game: MiniGameState;
    };

    if (!result.revived) {
      audio.playSfx("wrong");
      setBattleMessage("부활권이 없다.");
      return;
    }

    audio.playSfx("chargeReady");
    persistState(result.state);
    setMiniGame(result.game);
    setIsChasePaused(false);
    setBattleMessage("부활! 다시 캔들 위로!");
    startCountdown();
  };

  const renderFighterCard = (fighter: Fighter, compact = false, index = 0) => {
    const unlocked = unlockedIds.has(fighter.id);
    const selected = appState.selectedFighterId === fighter.id;

    return (
      <article
        className={`fighter-card ${unlocked ? "is-unlocked" : "is-locked"} ${
          selected ? "is-selected" : ""
        } ${compact ? "is-compact" : ""}`}
        key={fighter.id}
        style={fighterPortraitStyle(fighter, index)}
      >
        <button
          className="fighter-avatar"
          onClick={() => {
            setPreviewFighterId(fighter.id);
          }}
          type="button"
          aria-label={`${fighter.name} 선택`}
        >
          <span className="portrait-image" />
        </button>
        <div className="fighter-copy">
          <strong>{fighter.name}</strong>
          <span>{unlocked ? fighter.signature : "실루엣 잠김"}</span>
        </div>
        {!compact && (
          <p className="fighter-effect">
            {unlocked ? fighter.effect : "퀴즈 세트 완주 또는 광고 보상으로 랜덤 오픈"}
          </p>
        )}
      </article>
    );
  };

  const renderAdStrip = () => (
    <aside className="ad-strip" aria-label="배너 영역">
      <span>배너 영역</span>
    </aside>
  );

  const renderFighterPreview = () => {
    if (previewFighter == null) {
      return null;
    }

    const fighterIndex = fighters.findIndex((fighter) => fighter.id === previewFighter.id);
    const unlocked = unlockedIds.has(previewFighter.id);
    const selected = appState.selectedFighterId === previewFighter.id;

    return (
      <div
        className="fighter-modal-backdrop"
        onClick={() => setPreviewFighterId(null)}
        role="presentation"
      >
        <section
          aria-label={`${previewFighter.name} 상세`}
          className={`fighter-modal ${unlocked ? "is-unlocked" : "is-locked"}`}
          onClick={(event) => event.stopPropagation()}
          style={fighterPortraitStyle(previewFighter, Math.max(0, fighterIndex))}
        >
          <button
            aria-label="닫기"
            className="modal-close"
            onClick={() => setPreviewFighterId(null)}
            type="button"
          >
            ×
          </button>
          <div className="modal-portrait">
            <span className="portrait-image" />
          </div>
          <span className="kicker">{unlocked ? "FIGHTER READY" : "HIDDEN FIGHTER"}</span>
          <h2>{previewFighter.name}</h2>
          <strong>{previewFighter.signature}</strong>
          <p>{unlocked ? previewFighter.effect : "아직 정체는 비밀. 퀴즈 세트를 끝내거나 광고 보상을 완료하면 잠긴 히든파이터 중 한 명이 랜덤으로 열린다."}</p>
          <div className="modal-actions">
            {unlocked ? (
              <button
                className="primary-button"
                disabled={selected}
                onClick={() => {
                  handleSelectFighter(previewFighter);
                  setPreviewFighterId(null);
                }}
                type="button"
              >
                {selected ? "선택 완료" : "이 파이터 선택"}
              </button>
            ) : (
              <>
                <button
                  className="primary-button is-disabled"
                  disabled
                  type="button"
                >
                  랜덤 오픈 대기
                </button>
                <button
                  className={
                    isRewardReady && canUnlockFighter(appState)
                      ? "primary-button is-reward-unlock"
                      : "primary-button is-reward-unlock is-disabled"
                  }
                  disabled={!isRewardReady || !canUnlockFighter(appState)}
                  onClick={() => handleReward("fighter-unlock")}
                  type="button"
                >
                  광고 보고 오픈하기
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    );
  };

  const renderResetConfirm = () => {
    if (!isResetConfirmOpen) {
      return null;
    }

    return (
      <div
        className="fighter-modal-backdrop"
        onClick={() => setIsResetConfirmOpen(false)}
        role="presentation"
      >
        <section
          aria-label="퀴즈 리셋 확인"
          className="fighter-modal reset-confirm-modal"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            aria-label="닫기"
            className="modal-close"
            onClick={() => setIsResetConfirmOpen(false)}
            type="button"
          >
            ×
          </button>
          <span className="kicker">SYSTEM RESET</span>
          <h2>퀴즈 리셋</h2>
          <strong>진행도와 점수를 초기화할까?</strong>
          <p>퀴즈는 1번으로 돌아가고, 모은 히든파이터와 현재 선택은 유지된다.</p>
          <div className="modal-actions">
            <button
              className="ghost-button"
              onClick={() => setIsResetConfirmOpen(false)}
              type="button"
            >
              취소
            </button>
            <button className="primary-button" onClick={resetGame} type="button">
              초기화
            </button>
          </div>
        </section>
      </div>
    );
  };

  const renderIntro = () => {
    const panel = introPanels[introIndex];

    return (
      <main className="cutscene-shell">
        {renderCutsceneAudioButton()}
        <button className="skip-button" onClick={() => enterQuiz()} type="button">
          SKIP
        </button>
        <button className="cutscene-frame" onClick={advanceIntro} type="button">
          <img src={panel.image} alt={panel.title} />
          <span className="cutscene-count">
            {introIndex + 1}/{introPanels.length}
          </span>
          <span className="cutscene-caption">
            <strong>{panel.title}</strong>
            {panel.copy}
            <em>화면을 탭하면 다음</em>
          </span>
        </button>
      </main>
    );
  };

  const renderEnding = () => {
    if (endingIndex >= endingPanels.length) {
      const fighterIndex = endingPrizeFighter == null
        ? 0
        : Math.max(0, fighters.findIndex((fighter) => fighter.id === endingPrizeFighter.id));
      const drawFighters = hiddenFighters.slice(0, 8);
      const isRolling = endingDrawPhase === "rolling";
      const isRevealed = endingDrawPhase === "revealed";

      return (
        <main className="cutscene-shell ending-draw-shell">
          {renderCutsceneAudioButton()}
          <section className={`ending-draw-card is-${endingDrawPhase}`}>
            <span className="kicker">RANDOM FIGHTER</span>
            <h1>{isRevealed ? endingPrizeFighter ? "히든 파이터 등장!" : "전원 합류 완료!" : "히든 파이터 뽑기"}</h1>
            {!isRevealed ? (
              <>
                <div className={`ending-roulette ${isRolling ? "is-rolling" : "is-ready"}`}>
                  {drawFighters.map((fighter, index) => {
                    const rollFighterIndex = Math.max(
                      0,
                      fighters.findIndex((candidate) => candidate.id === fighter.id),
                    );

                    return (
                      <span
                        className="roulette-tile"
                        key={fighter.id}
                        style={{
                          ...fighterPortraitStyle(fighter, rollFighterIndex),
                          "--roll-delay": `${index * -0.07}s`,
                        } as CSSProperties}
                      >
                        <span className="portrait-image" />
                      </span>
                    );
                  })}
                </div>
                <strong className="ending-roll-sfx">
                  <span>셔플!</span>
                </strong>
                <p className="ending-draw-copy">
                  {endingDrawSource === "reward-ad"
                    ? "광고 보상으로 잠긴 히든파이터를 랜덤 호출한다"
                    : "100문항을 버틴 파이터에게는 숨은 파이터를 보상한다"}
                </p>
                <button
                  className="primary-button ending-draw-button"
                  disabled={isRolling}
                  onClick={startEndingDraw}
                  type="button"
                >
                  {isRolling ? "파이터 호출 중..." : "랜덤 히든파이터 뽑기"}
                </button>
              </>
            ) : (
              <div
                className={`ending-prize-card is-revealed ${
                  endingPrizeFighter ? "is-unlocked" : "is-complete"
                }`}
                style={
                  endingPrizeFighter
                    ? fighterPortraitStyle(endingPrizeFighter, fighterIndex)
                    : undefined
                }
              >
                <span className="ending-prize-portrait">
                  {endingPrizeFighter && <span className="portrait-image" />}
                </span>
                <strong>{endingPrizeFighter?.name ?? "모든 파이터"}</strong>
                <p>
                  {endingPrizeFighter
                    ? "이제 미니게임에서 이 파이터로 차트 위를 뛴다."
                    : "이미 모든 히든파이터가 열려 있다."}
                </p>
                <span className="kicker ending-collection-status">
                  {endingPrizeFighter ? "도감 누적" : "도감 완료"} · 오픈{" "}
                  {unlockedIds.size}/{fighters.length}
                </span>
              </div>
            )}
            {isRevealed && (
              <div className="ending-draw-actions">
                <button className="primary-button" onClick={() => setScreen("home")} type="button">
                  홈으로
                </button>
                <button
                  className="ghost-button"
                  onClick={() => setScreen("collection")}
                  type="button"
                >
                  도감 보기
                </button>
              </div>
            )}
          </section>
        </main>
      );
    }

    const panel = endingPanels[endingIndex];

    return (
      <main className="cutscene-shell ending-shell">
        {renderCutsceneAudioButton()}
        <button className="cutscene-frame" onClick={advanceEnding} type="button">
          <img src={panel.image} alt={panel.title} />
          <span className="cutscene-count">
            {endingIndex + 1}/{endingPanels.length}
          </span>
          <span className="cutscene-caption">
            <strong>{panel.title}</strong>
            {panel.copy}
            <em>화면을 탭하면 다음</em>
          </span>
        </button>
      </main>
    );
  };

  const renderChaseOverlay = () => {
    if (chaseOverlay == null) {
      return null;
    }

    if (chaseOverlay === "guide-heat" || chaseOverlay === "guide-controls") {
      return (
        <div className="chase-guide" onClick={() => {
          if (chaseOverlay === "guide-heat") {
            setChaseOverlay("guide-controls");
          } else {
            startCountdown();
          }
        }}>
          <button
            className="skip-button guide-skip"
            onClick={(event) => {
              event.stopPropagation();
              startCountdown();
            }}
            type="button"
          >
            SKIP
          </button>
          <div className="guide-card">
            <span className="guide-alert">!</span>
            {chaseOverlay === "guide-heat" ? (
              <>
                <strong>장 끝나기 전</strong>
                <p>15초를 불태워야 한다!</p>
              </>
            ) : (
              <>
                <strong>HOW TO FIGHT</strong>
                <p>빨간 상승봉은 오른쪽! 파란 하락봉은 왼쪽! 늦거나 틀리면 깡패가 다가온다.</p>
              </>
            )}
            <em>탭해서 계속</em>
          </div>
        </div>
      );
    }

    return (
      <div className={`countdown-overlay ${chaseOverlay === "GO" ? "is-go" : ""}`}>
        {chaseOverlay}
      </div>
    );
  };

  const renderHome = () => (
    <main className="app-shell home-screen">
      <section className="home-title-plate" aria-label="주식 파이터 홈">
        <span className="kicker">개미가 국장의 미래다</span>
        <h1>주식 파이터</h1>
        <p>100문항 상식과 차트까지 깨부순다</p>
      </section>

      <section className="home-status-bar" aria-label="플레이 상태">
        <div>
          <span>점수</span>
          <strong>{appState.score.toLocaleString()}</strong>
        </div>
        <div>
          <span>진행</span>
          <strong>{progressPercent}%</strong>
        </div>
        <div>
          <span>퀴즈힌트</span>
          <strong>
            {appState.hints}/{MAX_HINTS}
          </strong>
        </div>
      </section>

      <section className="home-roster" aria-label="히어로 선택">
        <div className="home-roster-heading">
          <span>히어로 선택</span>
          <button className="mini-button" onClick={() => setScreen("collection")} type="button">
            도감
          </button>
        </div>
        <div className="home-fighter-grid">
          {mainFighter && (
            <button
              aria-label={`${mainFighter.name} 선택`}
              className={`home-fighter-tile home-main-fighter is-unlocked ${
                appState.selectedFighterId === mainFighter.id ? "is-selected" : ""
              }`}
              onClick={() => {
                setPreviewFighterId(mainFighter.id);
              }}
              style={fighterPortraitStyle(
                mainFighter,
                fighters.findIndex((item) => item.id === mainFighter.id),
              )}
              type="button"
            >
              <span className="tile-portrait" />
              <strong>{mainFighter.name}</strong>
            </button>
          )}
          {hiddenFighters.map((fighter) => {
            const unlocked = unlockedIds.has(fighter.id);
            const selected = appState.selectedFighterId === fighter.id;
            const fighterIndex = fighters.findIndex((item) => item.id === fighter.id);

            return (
              <button
                aria-label={`${fighter.name} 선택`}
                className={`home-fighter-tile ${unlocked ? "is-unlocked" : "is-locked"} ${
                  selected ? "is-selected" : ""
                }`}
                key={fighter.id}
                onClick={() => {
                  setPreviewFighterId(fighter.id);
                }}
                style={fighterPortraitStyle(fighter, fighterIndex)}
                type="button"
              >
                <span className="tile-portrait" />
                <strong>{fighter.name}</strong>
              </button>
            );
          })}
          <button
            aria-label={audioEnabled ? "사운드 끄기" : "사운드 켜기"}
            className={`home-fighter-tile home-audio-tile ${
              audioEnabled ? "is-audio-on" : ""
            }`}
            onClick={handleAudioStickerClick}
            type="button"
          >
            <span className="audio-sticker" aria-hidden="true">
              {audioEnabled ? "🔊" : "🔇"}
            </span>
            <strong>{audioEnabled ? "사운드 ON" : "사운드"}</strong>
          </button>
        </div>
      </section>

      <section className="home-dock">
        <button className="primary-button" onClick={startQuiz} type="button">
          퀴즈 모드
        </button>
        <button
          className="home-reset-button"
          onClick={() => setIsResetConfirmOpen(true)}
          type="button"
        >
          RESET
        </button>
      </section>
      {renderFighterPreview()}
      {renderResetConfirm()}
    </main>
  );

  const renderQuiz = () => (
    <main
      className="app-shell quiz-screen"
      data-fighter-id={selectedFighter.id}
      style={selectedFighterSceneStyle}
    >
      <header className="topbar">
        <button className="icon-button" onClick={() => setScreen("home")} type="button">
          ←
        </button>
        <div>
          <span className="kicker">{difficultyLabel[currentQuestion.difficulty]}</span>
          <strong>
            {appState.quizCursor + 1}/{questions.length}
          </strong>
        </div>
        <button className="hint-pill hint-button" onClick={handleHint} type="button">
          퀴즈힌트 {appState.hints}
        </button>
      </header>

      <section className="spirit-gauge" aria-label="개미 투지 게이지">
        <div className="spirit-copy">
          <span>개미 투지</span>
          <strong>
            (연속 정답 {appState.correctStreak}) {quizCharge}/{MINI_GAME_TRIGGER_CHARGE}
          </strong>
        </div>
        <div className="spirit-bar">
          <span style={{ width: `${quizChargePercent}%` }} />
        </div>
        <p>10칸을 채우면 차트 추격전 발동!</p>
      </section>

      <section className="ant-cry-panel" aria-live="polite">
        <span>{selectedFighter.name}</span>
        <strong>{quizBattleCry}</strong>
      </section>

      <div
        aria-hidden="true"
        className="quiz-fighter-stand"
        data-fighter-id={selectedFighter.id}
        style={selectedFighterSceneStyle}
      />

      <section
        aria-label="퀴즈 문제"
        className={`dialogue-panel question-panel${activeHint ? " has-hint" : ""}`}
      >
        <div className="question-topic">
          <span className="question-topic-icon" aria-hidden="true" />
          <span>{formatTopicLabel(currentQuestion.topic)}</span>
        </div>
        <p className="typewriter">{typedPrompt || quizPromptText.slice(0, 1)}</p>
        {activeHint && <p className="hint-box">{activeHint}</p>}
      </section>

      <section className="option-grid" data-option-count={currentQuestionChoices.length}>
        {currentQuestionChoices.map((choice, index) => (
          <button
            className="option-button"
            disabled={feedback != null}
            key={`${currentQuestion.id}-${choice.originalIndex}`}
            onClick={() => handleAnswer(choice.originalIndex)}
            data-answer-state={getAnswerState(choice.originalIndex)}
            type="button"
          >
            <span>{String.fromCharCode(65 + index)}</span>
            {choice.label}
          </button>
        ))}
      </section>

      {renderAdStrip()}
    </main>
  );

  const renderMiniEnding = (game: MiniGameState) => {
    const isKo = game.result === "ko";

    return (
      <main className={`mini-ending-screen ${game.result}`}>
        <img
          className="mini-ending-art"
          src={`${ASSET_BASE}/${isKo ? "minigame-fail-v1.png" : "minigame-success-v1.png"}`}
          alt={isKo ? "털렸다 엔딩" : "상한가 성공 엔딩"}
        />
        {!isKo && <div className="ending-bubble-text">상한가!</div>}
        <section className="ending-panel">
          <strong>{isKo ? "털렸다..." : "15초 생존 성공!"}</strong>
          <p>
            {isKo
              ? "깡패가 개미 주머니를 탈탈 털었다. 광고를 보면 한 번 더 뛸 수 있다."
              : game.hintEarned
                ? "개미가 돈다발을 쥐고 환호한다. 10콤보 힌트 +1!"
                : "다음 판에는 10콤보 힌트까지 노려보자!"}
          </p>
          <div className="reward-zone ending-actions">
            {isKo && appState.reviveTickets > 0 && (
              <button className="primary-button" onClick={handleRevive} type="button">
                부활권 사용
              </button>
            )}
            {isKo && appState.reviveTickets <= 0 && (
              <button
                className={isRewardReady ? "primary-button" : "primary-button is-disabled"}
                disabled={!isRewardReady}
                onClick={() => handleReward("revive")}
                type="button"
              >
                광고보고 부활하기
              </button>
            )}
            <button className="ghost-button" onClick={completeMiniGame} type="button">
              퀴즈로 복귀
            </button>
          </div>
        </section>
      </main>
    );
  };

  const renderChase = () => {
    if (miniGame == null) {
      return null;
    }

    if (miniGame.ended) {
      return renderMiniEnding(miniGame);
    }

    const seconds = Math.ceil(miniGame.remainingMs / 1000);
    const chaseCandles = buildChaseCandles(candleStep, miniGame.candleSeed);
    const actorIndexes = getChaseActorIndexes({
      targetIndex: CHASE_TARGET_INDEX,
      distance: miniGame.distance,
      maxIndex: chaseCandles.length - 1,
    }) as { runnerIndex: number; chaserIndex: number; targetIndex: number };
    const runnerVisual = chaseCandles[actorIndexes.runnerIndex];
    const chaserVisual = chaseCandles[actorIndexes.chaserIndex];
    const chartTrackOffsets = [0];
    const chartDuration = CHASE_STEP_SECONDS;
    const isComboInvincible = miniGame.invincibleMs > 0;
    const motionStyle = {
      "--chart-track-width": `${CHASE_STEP_WIDTH}px`,
      "--chart-duration": `${chartDuration}s`,
      "--chart-steps": 1,
      "--chart-step-seconds": CHASE_STEP_SECONDS,
    } as CSSProperties;

    return (
      <main
        className={`game-shell ${isComboInvincible ? "is-invincible" : ""} ${
          isChasePaused ? "is-paused" : ""
        }`}
      >
        <header className="battle-hud">
          <div>
            <span>TIME</span>
            <strong>{seconds}s</strong>
          </div>
          <div>
            <span>COMBO</span>
            <strong>{miniGame.combo}</strong>
          </div>
          <div>
            <span>MISS</span>
            <strong>{miniGame.mistakes}/{MISS_LIMIT}</strong>
          </div>
        </header>

        <section
          className="chart-stage"
          aria-label="차트 추격전"
          data-chaser-index={actorIndexes.chaserIndex}
          data-runner-index={actorIndexes.runnerIndex}
          data-target-index={actorIndexes.targetIndex}
        >
          <div className="chart-playfield">
            <svg
              className="chart-svg"
              viewBox={`0 0 ${CHASE_VIEWBOX_WIDTH} ${CHASE_VIEWBOX_HEIGHT}`}
              role="presentation"
              aria-hidden="true"
            >
              <rect className="chart-paper" width={CHASE_VIEWBOX_WIDTH} height={CHASE_VIEWBOX_HEIGHT} />
              {CHASE_GRID_X.map((x) => (
                <line className="chart-grid-line" key={`x-${x}`} x1={x} x2={x} y1="0" y2={CHASE_VIEWBOX_HEIGHT} />
              ))}
              {CHASE_GRID_Y.map((y) => (
                <line className="chart-grid-line" key={`y-${y}`} x1="0" x2={CHASE_VIEWBOX_WIDTH} y1={y} y2={y} />
              ))}
              <g
                className="chart-motion"
                key={`chart-motion-${candleStep}`}
                style={motionStyle}
              >
                {chartTrackOffsets.map((offset) => (
                  <g key={`track-${offset}`}>
                    <path className="ma-line ma-fast" d={makeAveragePath(chaseCandles, "maFastY", offset)} />
                    <path className="ma-line ma-slow" d={makeAveragePath(chaseCandles, "maSlowY", offset)} />
                    <g className="volume-layer">
                      {chaseCandles.map((candle) => (
                        <rect
                          className={`volume-bar ${candle.direction} ${isComboInvincible ? "is-invincible-candle" : ""}`}
                          height={candle.volumeHeight * 0.55}
                          key={`v-${offset}-${candle.id}`}
                          width="6"
                          x={candle.x + offset - 3}
                          y={CHASE_VOLUME_BASE - candle.volumeHeight * 0.55}
                        />
                      ))}
                    </g>
                    <g className="candle-layer">
                      {chaseCandles.map((candle) => (
                        <g
                          className={`chart-candle ${candle.direction} ${offset === 0 && candle.isCurrent ? "is-current" : ""} ${isComboInvincible ? "is-invincible-candle" : ""}`}
                          key={`c-${offset}-${candle.id}`}
                          transform={`translate(${candle.x + offset} 0)`}
                        >
                          {offset === 0 && candle.isCurrent && (
                            <>
                              <line
                                className="current-candle-guide"
                                x1="0"
                                x2="0"
                                y1={Math.max(18, candle.wickTop - 10)}
                                y2={CHASE_VOLUME_BASE}
                              />
                              <rect
                                className="current-candle-pulse"
                                height={Math.max(22, candle.wickBottom - candle.wickTop + 16)}
                                width="24"
                                x="-12"
                                y={Math.max(6, candle.wickTop - 8)}
                              />
                              <rect
                                className="current-platform"
                                height="7"
                                width="26"
                                x="-13"
                                y={candle.bodyTop - 7}
                              />
                            </>
                          )}
                          <line
                            className="chart-candle-wick"
                            x1="0"
                            x2="0"
                            y1={candle.wickTop}
                            y2={candle.wickBottom}
                          />
                          <rect
                            className="chart-candle-body"
                            height={candle.bodyHeight}
                            width="8"
                            x="-4"
                            y={candle.bodyTop}
                          />
                        </g>
                      ))}
                    </g>
                  </g>
                ))}
              </g>
            </svg>
            <div className="chart-legend">
              <span>이동평균</span>
              <b className="fast">5</b>
              <b className="slow">20</b>
              <b className="long">60</b>
            </div>
            <div className="price-ticks">
              <span>112.00</span>
              <span>108.00</span>
              <span>104.00</span>
              <span>100.00</span>
            </div>
            <div className="actor-motion" key={`actor-motion-${candleStep}`} style={motionStyle}>
              <div
                className="chaser punk-sprite"
                key={`chaser-${jumpTick}-${miniGame.distance}`}
                data-candle-index={actorIndexes.chaserIndex}
                style={spritePosition(chaserVisual)}
                aria-label="추격자"
              />
              <div
                className="runner fighter-runner"
                key={`runner-${jumpTick}`}
                data-candle-index={actorIndexes.runnerIndex}
                data-fighter-id={selectedFighter.id}
                style={
                  {
                    ...spritePosition(runnerVisual),
                    ...fighterPortraitStyle(
                      selectedFighter,
                      Math.max(0, fighters.findIndex((fighter) => fighter.id === selectedFighter.id)),
                    ),
                  } as CSSProperties
                }
                aria-label={selectedFighter.name}
              />
            </div>
          </div>
          {comboPop && <div className="combo-pop">{comboPop}</div>}
          {renderChaseOverlay()}
        </section>

        <section className="battle-message">
          <strong>{selectedFighter.signature}</strong>
          <span>{battleMessage}</span>
        </section>

        <section className="battle-controls">
          <button
            className="down-button"
            disabled={isChasePaused}
            onClick={() => handleCandleInput("down")}
            type="button"
          >
            하락
          </button>
          <button
            aria-label={isChasePaused ? "재개" : "일시정지"}
            aria-pressed={isChasePaused}
            className="pause-button"
            disabled={chaseOverlay != null}
            onClick={() => setIsChasePaused((paused) => !paused)}
            type="button"
          >
            <span className={`pause-icon ${isChasePaused ? "is-play" : "is-pause"}`} aria-hidden="true" />
          </button>
          <button
            className="up-button"
            disabled={isChasePaused}
            onClick={() => handleCandleInput("up")}
            type="button"
          >
            상승
          </button>
        </section>
      </main>
    );
  };

  const renderCollection = () => (
    <main className="app-shell collection-screen">
      <header className="topbar">
        <button className="icon-button" onClick={() => setScreen("home")} type="button">
          ←
        </button>
        <div>
          <span className="kicker">FIGHTER BOOK</span>
          <strong>히든 파이터 도감</strong>
          <p className="collection-rule">
            히든파이터는 퀴즈 100개 달성 혹은 광고 시청 후 랜덤으로 열려요.
          </p>
        </div>
        <span className="hint-pill">오픈 {unlockedIds.size}/20</span>
      </header>
      <div className="fighter-grid full">
        {fighters.map((fighter, index) => renderFighterCard(fighter, false, index))}
      </div>
      {renderFighterPreview()}
    </main>
  );

  if (screen === "quiz") {
    return renderQuiz();
  }

  if (screen === "intro") {
    return renderIntro();
  }

  if (screen === "chase") {
    return renderChase();
  }

  if (screen === "collection") {
    return renderCollection();
  }

  if (screen === "ending") {
    return renderEnding();
  }

  return renderHome();
}

export default App;

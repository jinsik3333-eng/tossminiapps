import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import "./App.css";
import { TossBannerAd } from "./components/TossBannerAd";
import { useInAppAds } from "./hooks/useInAppAds";
import { openLeaderboardSafe, submitScoreOnce } from "./lib/tossGameCenter";

type Screen = "home" | "play" | "result";
type GameKind = "run" | "detective" | "jump" | "maze";
type RunObject = { id: string; lane: number; y: number; kind: "rock" | "cloud" | "star" | "rainbow" };
type RunImpact = { id: number; type: "collect" | "hit" | "near"; text: string };
type DetectiveTone = "ink" | "violet" | "gold" | "mint" | "peach";
type DetectiveTrait = { mark: string; accessory: string; mood: string; tone: DetectiveTone };
type DetectiveRule = { title: string; instruction: string; targetCopy: string; target: Partial<DetectiveTrait>; bonus: number };
type DetectiveCard = DetectiveTrait & { id: string; toneLabel: string; hint: string; isTarget: boolean };
type MazeCell = 0 | 1;
type ResultStory = { highlight: string; nextGoal: string };
type StageInfo = { current: number; total: number; title: string; caption: string };
type RunStageEffect = { name: string; speed: number; spawnBoost: number; hazardBias: number; note: string };
type JumpStageEffect = { name: string; safeStart: number; safeEnd: number; perfectStart: number; perfectEnd: number; speed: number; goldenEvery: number; note: string };
type MazeLevel = { name: string; map: MazeCell[][]; start: { x: number; y: number }; key: string; shards: string[]; traps: string[]; exit: string; shortest: number };

const GAME_KIND = "jump" as GameKind;
const APP_SLUG = "mongle-jump";
const APP_TITLE = "몽글 점프";
const BEST_KEY = `${APP_SLUG}-best-v1`;
const PLAY_COUNT_KEY = `${APP_SLUG}-play-count-v1`;
const COLLECTION_KEY = `${APP_SLUG}-collection-v1`;
const BANNER_AD_GROUP_ID = import.meta.env.VITE_TOSS_BANNER_AD_GROUP_ID ?? "";
const REWARDED_AD_GROUP_ID = import.meta.env.VITE_TOSS_REWARDED_AD_GROUP_ID ?? "";
const todayKst = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
const DAILY_STAMP = todayKst.replaceAll("-", ".");
const daySeed = Number(todayKst.replaceAll("-", ""));

const RUN_COURSES = ["별비 골목", "구름 터널", "무지개 언덕"];
const RUN_MISSIONS = ["별 5연속", "구름 사이 통과", "무지개 조각 찾기"];
const CASE_CLUES = ["발자국이 동글", "모자 각도가 달라요", "표식이 반짝", "꼬리가 숨어요", "눈썹이 찡긋"];
const CASE_FEEDBACK = ["단서가 딱 맞았어요.", "몽글 수첩에 기록 완료.", "현장 분위기가 밝아졌어요."];
const CHARACTER_ASSETS: Record<GameKind, string> = {
  run: "/game-assets/mongle-runner.png",
  detective: "/game-assets/mongle-detective.png",
  jump: "/game-assets/mongle-jump.png",
  maze: "/game-assets/mongle-maze.png",
};

const RUN_STAGE_EFFECTS: RunStageEffect[] = [
  { name: "별비 골목", speed: 12, spawnBoost: 0, hazardBias: 0, note: "별이 많고 바위는 느려요." },
  { name: "구름 터널", speed: 14, spawnBoost: 0.04, hazardBias: 0.05, note: "먹구름이 더 자주 내려와요." },
  { name: "바위 언덕", speed: 16, spawnBoost: 0.08, hazardBias: 0.1, note: "바위가 빨라지고 별 간격이 좁아요." },
  { name: "무지개 폭풍", speed: 18, spawnBoost: 0.12, hazardBias: 0.14, note: "무지개는 크지만 위험물도 몰려와요." },
  { name: "피버 직선로", speed: 20, spawnBoost: 0.15, hazardBias: 0.18, note: "반응 속도 싸움이에요." },
];

const DETECTIVE_TONES: Record<DetectiveTone, { label: string; className: string }> = {
  ink: { label: "검정", className: "tone-ink" },
  violet: { label: "보라", className: "tone-violet" },
  gold: { label: "노랑", className: "tone-gold" },
  mint: { label: "민트", className: "tone-mint" },
  peach: { label: "분홍", className: "tone-peach" },
};
const DETECTIVE_MARKS = ["×", "△", "★", "●"];
const DETECTIVE_ACCESSORIES = ["모자", "리본", "돋보기", "가방"];
const DETECTIVE_MOODS = ["찡긋", "졸림", "웃음", "놀람"];
const DETECTIVE_TONE_IDS = Object.keys(DETECTIVE_TONES) as DetectiveTone[];
const DETECTIVE_RULES: DetectiveRule[] = [
  { title: "검은 × 모자", instruction: "검정 몸, × 표식, 모자를 모두 가진 몽글을 찾으세요.", targetCopy: "검정 × 모자", target: { tone: "ink", mark: "×", accessory: "모자" }, bonus: 0 },
  { title: "보라 △ 찡긋", instruction: "보라색에 △ 표식, 찡긋 표정인 몽글만 정답이에요.", targetCopy: "보라 △ 찡긋", target: { tone: "violet", mark: "△", mood: "찡긋" }, bonus: 20 },
  { title: "노랑 ★ 리본", instruction: "노랑 몸, ★ 표식, 리본 소품을 함께 확인하세요.", targetCopy: "노랑 ★ 리본", target: { tone: "gold", mark: "★", accessory: "리본" }, bonus: 35 },
  { title: "민트 ● 졸림", instruction: "민트색이면서 ● 표식이고 졸린 표정을 고르세요.", targetCopy: "민트 ● 졸림", target: { tone: "mint", mark: "●", mood: "졸림" }, bonus: 45 },
  { title: "분홍 돋보기 웃음", instruction: "표식보다 색, 소품, 표정을 조합해 분홍 돋보기 웃음 몽글을 찾으세요.", targetCopy: "분홍 돋보기 웃음", target: { tone: "peach", accessory: "돋보기", mood: "웃음" }, bonus: 60 },
];

const JUMP_STAGE_EFFECTS: JumpStageEffect[] = [
  { name: "낮은 구름", safeStart: 40, safeEnd: 70, perfectStart: 51, perfectEnd: 59, speed: 5, goldenEvery: 5, note: "넓은 초록 구간" },
  { name: "흔들 구름", safeStart: 42, safeEnd: 68, perfectStart: 52, perfectEnd: 58, speed: 7, goldenEvery: 4, note: "바늘이 조금 빨라져요" },
  { name: "틈새 구름", safeStart: 45, safeEnd: 65, perfectStart: 53, perfectEnd: 58, speed: 9, goldenEvery: 4, note: "안전 구간이 좁아져요" },
  { name: "바람 구름", safeStart: 47, safeEnd: 63, perfectStart: 54, perfectEnd: 58, speed: 11, goldenEvery: 3, note: "황금 구름이 자주 나오지만 빨라요" },
  { name: "번개 구름", safeStart: 49, safeEnd: 61, perfectStart: 55, perfectEnd: 58, speed: 13, goldenEvery: 3, note: "거의 퍼펙트 싸움" },
  { name: "왕관 구름", safeStart: 50, safeEnd: 60, perfectStart: 55, perfectEnd: 57, speed: 15, goldenEvery: 2, note: "짧고 높은 최종 구간" },
];

const MAZE_LEVELS: MazeLevel[] = [
  {
    name: "열쇠길",
    map: [
      [0, 0, 0, 1, 0],
      [1, 1, 0, 1, 0],
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
    ],
    start: { x: 0, y: 0 },
    key: "2-2",
    shards: ["1-0", "3-2", "0-4"],
    traps: ["0-2", "4-1"],
    exit: "4-4",
    shortest: 12,
  },
  {
    name: "ㄱ자 회랑",
    map: [
      [0, 0, 1, 0, 0],
      [1, 0, 1, 0, 1],
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
    ],
    start: { x: 0, y: 0 },
    key: "3-1",
    shards: ["1-1", "2-2", "0-4"],
    traps: ["0-2", "4-2"],
    exit: "4-4",
    shortest: 13,
  },
  {
    name: "조각 방",
    map: [
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 1, 0],
      [1, 1, 0, 0, 0],
      [0, 0, 0, 1, 0],
    ],
    start: { x: 0, y: 0 },
    key: "2-3",
    shards: ["4-0", "0-2", "1-4"],
    traps: ["2-0", "4-2"],
    exit: "4-4",
    shortest: 14,
  },
  {
    name: "함정 정원",
    map: [
      [0, 0, 0, 1, 0],
      [0, 1, 0, 0, 0],
      [0, 1, 0, 1, 0],
      [0, 0, 0, 1, 0],
      [1, 0, 0, 0, 0],
    ],
    start: { x: 0, y: 0 },
    key: "2-2",
    shards: ["0-1", "4-1", "1-4"],
    traps: ["2-1", "3-4"],
    exit: "4-4",
    shortest: 15,
  },
];
const SHORTEST_GOAL = MAZE_LEVELS[0].shortest;

const META: Record<GameKind, {
  eyebrow: string;
  title: string;
  promise: string;
  primary: string;
  rule: string;
  howTo: string;
  metric: string;
  collectible: string;
}> = {
  run: {
    eyebrow: "30초 회피 러너",
    title: "도망 몽글",
    promise: "오늘 코스를 달리며 별과 무지개 조각을 모아요.",
    primary: "도망 시작",
    rule: "좌우 이동 · 바위 피하기 · 별은 연속으로!",
    howTo: "왼쪽/오른쪽 버튼으로 한 칸씩 움직이고 별은 먹고 바위와 먹구름은 피하세요.",
    metric: "거리",
    collectible: "구름 발자국",
  },
  detective: {
    eyebrow: "순간 관찰 게임",
    title: "1초 탐정 몽글",
    promise: "단서를 보고 진짜 도둑 몽글을 빠르게 찾아요.",
    primary: "사건 시작",
    rule: "도둑 몽글을 찾는 게임 · 색/표식/소품/표정을 조합해요",
    howTo: "표식 하나만 보는 게임이 아니에요. 매 사건마다 색, 표식, 소품, 표정 단서를 조합해 고르세요.",
    metric: "해결 점수",
    collectible: "탐정 배지",
  },
  jump: {
    eyebrow: "타이밍 점프",
    title: "몽글 점프",
    promise: "퍼펙트 존과 황금 구름을 노려 더 높이 올라요.",
    primary: "점프 시작",
    rule: "초록 안전 구간, 중앙이면 퍼펙트!",
    howTo: "바늘이 초록 구간에 들어올 때 점프하고 5번째마다 나오는 황금 구름을 노리세요.",
    metric: "높이",
    collectible: "구름 조각",
  },
  maze: {
    eyebrow: "짧은 스와이프 퍼즐",
    title: "몽글 미로 탈출",
    promise: "열쇠와 반짝 조각을 챙겨 짧은 길로 탈출해요.",
    primary: "탈출 시작",
    rule: "열쇠 → 조각 → 출구 순서로 길을 읽는 탈출 게임",
    howTo: "방향 버튼으로 한 칸씩 이동하고 벽과 함정을 피해 오른쪽 아래 출구로 가세요.",
    metric: "탈출 점수",
    collectible: "비밀 지도",
  },
};

function readStoredNumber(key: string) {
  const parsed = Number(localStorage.getItem(key) ?? "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

function App() {
  const meta = META[GAME_KIND];
  const characterAsset = CHARACTER_ASSETS[GAME_KIND];
  const {
    isAdLoaded: isNextRoundAdLoaded,
    isSupported: isNextRoundAdSupported,
    rewardCount: nextRoundRewardCount,
    showAd: showNextRoundAd,
  } = useInAppAds(REWARDED_AD_GROUP_ID);
  const dailyIndex = daySeed % 3;
  const todayLabel = GAME_KIND === "run" ? `${RUN_COURSES[dailyIndex]} · ${RUN_MISSIONS[dailyIndex]}` : GAME_KIND === "detective" ? `${getDetectiveRule(dailyIndex + 1).title} 사건` : GAME_KIND === "jump" ? JUMP_STAGE_EFFECTS[dailyIndex].note : `최단 ${SHORTEST_GOAL}걸음`;

  const [screen, setScreen] = useState<Screen>("home");
  const [best, setBest] = useState(() => readStoredNumber(BEST_KEY));
  const [plays, setPlays] = useState(() => readStoredNumber(PLAY_COUNT_KEY));
  const [pieces, setPieces] = useState(() => readStoredNumber(COLLECTION_KEY));
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("오늘 한 판 기록을 만들어 보세요.");
  const [submitMessage, setSubmitMessage] = useState("랭킹 제출 대기 중");
  const [playId, setPlayId] = useState("");
  const [resultStory, setResultStory] = useState<ResultStory>({ highlight: "첫 기록을 남겨요.", nextGoal: "한 판 시작" });
  const [pendingNextRound, setPendingNextRound] = useState(false);

  const [timeLeft, setTimeLeft] = useState(30);
  const [lane, setLane] = useState(1);
  const [obstacles, setObstacles] = useState<RunObject[]>([]);
  const [runImpact, setRunImpact] = useState<RunImpact | null>(null);
  const [combo, setCombo] = useState(0);
  const [fever, setFever] = useState(0);
  const [nearMiss, setNearMiss] = useState(0);
  const [rainbow, setRainbow] = useState(0);

  const [round, setRound] = useState(1);
  const [cards, setCards] = useState<DetectiveCard[]>(() => makeCards(1, getDetectiveRule(1)));
  const [flash, setFlash] = useState<"idle" | "good" | "bad">("idle");
  const [solvedCases, setSolvedCases] = useState(0);

  const [height, setHeight] = useState(0);
  const [power, setPower] = useState(20);
  const [streak, setStreak] = useState(0);
  const [perfects, setPerfects] = useState(0);
  const [goldClouds, setGoldClouds] = useState(0);
  const jumpDirectionRef = useRef(1);
  const countedNearMissRef = useRef<Set<string>>(new Set());
  const feverTimeoutRef = useRef<number | undefined>(undefined);
  const detectiveTimeoutRef = useRef<number | undefined>(undefined);
  const handledRewardCountRef = useRef(0);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [steps, setSteps] = useState(0);
  const [hasKey, setHasKey] = useState(false);
  const [shards, setShards] = useState<string[]>([]);
  const [wallHits, setWallHits] = useState(0);
  const [trapHits, setTrapHits] = useState(0);

  const collectionProgress = Math.min(100, Math.round((pieces / 18) * 100));
  const canPlayTicker = screen === "play" && (GAME_KIND === "run" || GAME_KIND === "detective");
  const homeTips = useMemo(() => getHomeTips(GAME_KIND, todayLabel), [todayLabel]);
  const stage = getStageInfo(GAME_KIND, screen, plays, round, height, steps);
  const stageCurrent = stage.current;
  const targetRule = getDetectiveRule(round);
  const runStageEffect = RUN_STAGE_EFFECTS[(stageCurrent - 1) % RUN_STAGE_EFFECTS.length];
  const jumpStageEffect = JUMP_STAGE_EFFECTS[(stageCurrent - 1) % JUMP_STAGE_EFFECTS.length];
  const mazeLevel = MAZE_LEVELS[(stageCurrent - 1) % MAZE_LEVELS.length];
  const nextStageCopy = getNextStageCopy(GAME_KIND, stage, round, height, shards.length);

  const triggerRunImpact = useCallback((type: RunImpact["type"], text: string) => {
    setRunImpact({ id: Date.now(), type, text });
  }, []);

  const moveRunLane = useCallback((delta: number) => {
    setLane((current) => Math.max(0, Math.min(2, current + delta)));
  }, []);

  const finish = useCallback((finalScore: number, finalMessage: string, story?: ResultStory) => {
    const nextScore = Math.max(0, Math.round(finalScore));
    const nextPlays = plays + 1;
    const nextPieces = Math.min(18, pieces + 1 + (nextScore > best ? 1 : 0));
    setScore(nextScore);
    setMessage(finalMessage);
    setResultStory(story ?? { highlight: finalMessage, nextGoal: nextScore > best ? "새 기록 한 번 더" : `최고 ${meta.metric} 넘기기` });
    setScreen("result");
    setPlays(nextPlays);
    setPieces(nextPieces);
    localStorage.setItem(PLAY_COUNT_KEY, String(nextPlays));
    localStorage.setItem(COLLECTION_KEY, String(nextPieces));
    if (nextScore > best) {
      setBest(nextScore);
      localStorage.setItem(BEST_KEY, String(nextScore));
    }
    setSubmitMessage("게임 종료 점수 제출 중");
    submitScoreOnce(nextScore, playId || `${APP_SLUG}-${Date.now()}`).then((status) => {
      const copy = {
        success: "랭킹 점수 제출 완료",
        "already-submitted": "이번 플레이 점수는 이미 제출했어요.",
        unsupported: "앱 안의 기록을 저장했어요.",
        failed: "앱 안의 기록을 저장했어요.",
        fallback: "앱 안의 기록을 저장했어요.",
      } as const;
      setSubmitMessage(copy[status.status]);
    });
  }, [best, meta.metric, pieces, playId, plays]);

  const start = useCallback(() => {
    if (feverTimeoutRef.current) window.clearTimeout(feverTimeoutRef.current);
    if (detectiveTimeoutRef.current) window.clearTimeout(detectiveTimeoutRef.current);
    countedNearMissRef.current.clear();
    const nextPlayId = `${APP_SLUG}-${Date.now()}`;
    const nextMazeLevel = MAZE_LEVELS[Math.min(MAZE_LEVELS.length, Math.max(1, plays + 1)) - 1];
    setPlayId(nextPlayId);
    setScore(0);
    setCombo(0);
    setTimeLeft(30);
    setLane(1);
    setObstacles([]);
    setRunImpact(null);
    setFever(0);
    setNearMiss(0);
    setRainbow(0);
    setRound(1);
    setCards(makeCards(1, getDetectiveRule(1)));
    setFlash("idle");
    setSolvedCases(0);
    setHeight(0);
    setPower(20);
    jumpDirectionRef.current = 1;
    setStreak(0);
    setPerfects(0);
    setGoldClouds(0);
    setPosition(nextMazeLevel.start);
    setSteps(0);
    setHasKey(false);
    setShards([]);
    setWallHits(0);
    setTrapHits(0);
    setSubmitMessage("랭킹 제출 대기 중");
    setResultStory({ highlight: "첫 장면 준비 완료", nextGoal: meta.rule });
    setMessage(meta.rule);
    setPendingNextRound(false);
    setScreen("play");
  }, [meta.rule, plays]);

  const startWithNextRoundAd = useCallback(() => {
    if (isNextRoundAdSupported && isNextRoundAdLoaded) {
      setPendingNextRound(true);
      showNextRoundAd();
      return;
    }
    start();
  }, [isNextRoundAdLoaded, isNextRoundAdSupported, showNextRoundAd, start]);

  useEffect(() => {
    if (!pendingNextRound) return;
    if (nextRoundRewardCount <= handledRewardCountRef.current) return;
    handledRewardCountRef.current = nextRoundRewardCount;
    setPendingNextRound(false);
    start();
  }, [nextRoundRewardCount, pendingNextRound, start]);

  useEffect(() => {
    if (!canPlayTicker) return undefined;
    const id = window.setInterval(() => setTimeLeft((current) => current - 1), 1000);
    return () => window.clearInterval(id);
  }, [canPlayTicker]);

  useEffect(() => {
    return () => {
      if (feverTimeoutRef.current) window.clearTimeout(feverTimeoutRef.current);
      if (detectiveTimeoutRef.current) window.clearTimeout(detectiveTimeoutRef.current);
    };
  }, [screen]);

  useEffect(() => {
    if (screen !== "play" || GAME_KIND !== "run") return undefined;
    const id = window.setInterval(() => {
      setScore((current) => current + 4 + Math.floor(fever / 35));
      setObstacles((current) => {
        const moved = current.map((item) => ({ ...item, y: item.y + runStageEffect.speed })).filter((item) => item.y < 112);
        const chance = Math.max(0.24, 0.52 - runStageEffect.spawnBoost - Math.min(0.18, timeLeft / 220));
        if (Math.random() > chance) {
          const roll = Math.random();
          const starLine = 0.58 + runStageEffect.hazardBias;
          const cloudLine = 0.28 + runStageEffect.hazardBias / 2;
          const kind: RunObject["kind"] = roll > 0.92 ? "rainbow" : roll > starLine ? "star" : roll > cloudLine ? "cloud" : "rock";
          moved.push({ id: `${Date.now()}-${Math.random()}`, lane: Math.floor(Math.random() * 3), y: 0, kind });
        }
        return moved;
      });
    }, Math.max(170, 250 - stageCurrent * 10));
    return () => window.clearInterval(id);
  }, [fever, runStageEffect.hazardBias, runStageEffect.spawnBoost, runStageEffect.speed, screen, stageCurrent, timeLeft]);

  useEffect(() => {
    if (screen !== "play" || GAME_KIND !== "run") return;
    const close = obstacles.find((item) => item.lane !== lane && Math.abs(item.lane - lane) === 1 && item.y >= 80 && item.y <= 88 && item.kind !== "star" && item.kind !== "rainbow");
    if (close && !countedNearMissRef.current.has(close.id)) {
      countedNearMissRef.current.add(close.id);
      setNearMiss((current) => current + 1);
      setScore((current) => current + 18);
      triggerRunImpact("near", "아슬 +18");
      setMessage("아슬아슬 회피!");
    }
    const hit = obstacles.find((item) => item.lane === lane && item.y >= 76 && item.y <= 94);
    if (!hit) return;
    setObstacles((current) => current.filter((item) => item.id !== hit.id));
    if (hit.kind === "star" || hit.kind === "rainbow") {
      const nextCombo = Math.min(12, combo + 1);
      const nextFever = Math.min(100, fever + (hit.kind === "rainbow" ? 36 : 22));
      if (hit.kind === "rainbow") setRainbow((current) => current + 1);
      setCombo(nextCombo);
      setFever(nextFever);
      setScore((current) => current + (hit.kind === "rainbow" ? 140 : 60) + (nextFever >= 100 ? 80 : 0));
      triggerRunImpact("collect", hit.kind === "rainbow" ? "무지개 +140" : "별 +60");
      setMessage(nextFever >= 100 ? "짧은 피버! 반짝 질주" : hit.kind === "rainbow" ? "무지개 조각 발견" : "별 연속 획득");
      if (nextFever >= 100) {
        if (feverTimeoutRef.current) window.clearTimeout(feverTimeoutRef.current);
        feverTimeoutRef.current = window.setTimeout(() => setFever(30), 450);
      }
      return;
    }
    setCombo(0);
    setFever((current) => Math.max(0, current - 25));
    setScore((current) => Math.max(0, current - 90));
    triggerRunImpact("hit", hit.kind === "cloud" ? "퐁 -90" : "쾅 -90");
    setMessage(hit.kind === "cloud" ? "구름에 퐁!" : "바위에 통통");
  }, [combo, fever, lane, obstacles, screen, triggerRunImpact]);

  useEffect(() => {
    if (screen !== "play" || GAME_KIND !== "jump") return undefined;
    const id = window.setInterval(() => {
      setPower((current) => {
        const speed = jumpStageEffect.speed + Math.min(5, Math.floor(height / 3));
        const next = current + jumpDirectionRef.current * speed;
        if (next >= 96) {
          jumpDirectionRef.current = -1;
          return 96;
        }
        if (next <= 4) {
          jumpDirectionRef.current = 1;
          return 4;
        }
        return next;
      });
    }, 90);
    return () => window.clearInterval(id);
  }, [height, jumpStageEffect.speed, screen]);

  useEffect(() => {
    if (screen !== "play") return;
    if (GAME_KIND === "run" && timeLeft <= 0) finish(score, "오늘 코스 기록 저장", { highlight: `무지개 ${rainbow} · 아슬 ${nearMiss}`, nextGoal: combo >= 5 ? "피버 두 번 만들기" : RUN_MISSIONS[dailyIndex] });
    if (GAME_KIND === "detective" && timeLeft <= 0) finish(score, "탐정 수첩 저장", { highlight: `해결 ${solvedCases}건 · 연속 ${combo}`, nextGoal: "희귀 변장 카드 찾기" });
  }, [combo, dailyIndex, finish, nearMiss, rainbow, score, screen, solvedCases, timeLeft]);

  const chooseCard = (card: DetectiveCard) => {
    if (GAME_KIND !== "detective" || screen !== "play" || flash !== "idle") return;
    if (card.isTarget) {
      const nextCombo = combo + 1;
      const nextRound = round + 1;
      const bonus = targetRule.bonus;
      setFlash("good");
      setCombo(nextCombo);
      setSolvedCases((current) => current + 1);
      setScore((current) => current + 120 + nextCombo * 12 + bonus);
      setMessage(`${targetRule.targetCopy} 단서 적중! ${CASE_FEEDBACK[round % CASE_FEEDBACK.length]}`);
      if (nextRound > 10) {
        finish(score + 120 + nextCombo * 12 + bonus + timeLeft * 8, "오늘 사건 모두 해결", { highlight: `연속 정답 ${nextCombo} · 조합 단서 적중`, nextGoal: "색·표식·소품 3단서 한 번에" });
        return;
      }
      if (detectiveTimeoutRef.current) window.clearTimeout(detectiveTimeoutRef.current);
      detectiveTimeoutRef.current = window.setTimeout(() => {
        if (screen !== "play") return;
        setRound(nextRound);
        setCards(makeCards(nextRound, getDetectiveRule(nextRound)));
        setFlash("idle");
      }, 320);
      return;
    }
    setFlash("bad");
    setCombo(0);
    setScore((current) => Math.max(0, current - 70));
    setMessage("아깝다, 표식 하나만 보지 말고 색·소품·표정까지 봐요");
    if (detectiveTimeoutRef.current) window.clearTimeout(detectiveTimeoutRef.current);
    detectiveTimeoutRef.current = window.setTimeout(() => {
      if (screen === "play") setFlash("idle");
    }, 320);
  };

  const jump = () => {
    if (GAME_KIND !== "jump" || screen !== "play") return;
    const safe = power >= jumpStageEffect.safeStart && power <= jumpStageEffect.safeEnd;
    const perfect = power >= jumpStageEffect.perfectStart && power <= jumpStageEffect.perfectEnd;
    const golden = (height + 1) % jumpStageEffect.goldenEvery === 0;
    if (safe) {
      const nextHeight = height + 1;
      const nextStreak = streak + 1;
      const jumpGain = 100 + nextStreak * 22 + (perfect ? 80 : 0) + (golden ? 120 : 0);
      const projectedScore = score + jumpGain;
      setHeight(nextHeight);
      setStreak(nextStreak);
      if (perfect) setPerfects((current) => current + 1);
      if (golden) setGoldClouds((current) => current + 1);
      setScore(projectedScore);
      setMessage(golden ? `${jumpStageEffect.name} 황금 구름 착지!` : perfect ? `${jumpStageEffect.name} 퍼펙트 착지` : `${jumpStageEffect.name} 안전 착지`);
      if (nextHeight >= 12) finish(projectedScore + 300 + nextStreak * 40, "구름 꼭대기 도착", { highlight: `연속 ${nextStreak} · 퍼펙트 ${perfects + (perfect ? 1 : 0)}`, nextGoal: "더 좁은 안전 구간 도전" });
      return;
    }
    finish(score + height * 35 + perfects * 45 + goldClouds * 70, "기록은 반짝 저장", { highlight: `최고 높이 ${height} · 연속 ${streak}`, nextGoal: perfects === 0 ? "퍼펙트 존 한 번" : "안전 착지 5연속" });
  };

  const moveMaze = (dx: number, dy: number) => {
    if (GAME_KIND !== "maze" || screen !== "play") return;
    const next = { x: position.x + dx, y: position.y + dy };
    if (next.x < 0 || next.y < 0 || next.y >= mazeLevel.map.length || next.x >= mazeLevel.map[0].length || mazeLevel.map[next.y][next.x] === 1) {
      setWallHits((current) => current + 1);
      setScore((current) => Math.max(0, current - 30));
      setMessage("벽 통통, 돌아가요");
      return;
    }
    const key = `${next.x}-${next.y}`;
    const nextSteps = steps + 1;
    setPosition(next);
    setSteps(nextSteps);
    if (mazeLevel.traps.includes(key)) {
      setTrapHits((current) => current + 1);
      setScore((current) => Math.max(0, current - 80));
      setMessage("함정 칸! 살금살금");
      return;
    }
    if (mazeLevel.shards.includes(key) && !shards.includes(key)) {
      setShards((current) => [...current, key]);
      setScore((current) => current + 120);
      setMessage("반짝 조각 획득");
      return;
    }
    if (key === mazeLevel.key && !hasKey) {
      setHasKey(true);
      setMessage(`${mazeLevel.name} 열쇠 반짝, 출구로!`);
      return;
    }
    if (key === mazeLevel.exit) {
      const keyBonus = hasKey ? 240 : 0;
      const shardBonus = shards.length * 110;
      const routeBonus = nextSteps <= mazeLevel.shortest ? 180 : 0;
      finish(1200 - nextSteps * 32 - wallHits * 25 - trapHits * 70 + keyBonus + shardBonus + routeBonus, hasKey ? `${mazeLevel.name} 탈출` : "탈출 성공", { highlight: `열쇠 ${hasKey ? "획득" : "놓침"} · 조각 ${shards.length}`, nextGoal: nextSteps <= mazeLevel.shortest ? "다음 미로 조각 3개" : `${mazeLevel.shortest}걸음 안쪽` });
      return;
    }
    setScore((current) => Math.max(0, current - 24));
    setMessage("출구는 오른쪽 아래");
  };

  const openRank = async () => {
    const response = await openLeaderboardSafe();
    setMessage(response.status === "opened" ? "랭킹 화면을 열었어요." : "앱 안의 기록을 확인해요.");
  };

  return (
    <main className={`app-shell kind-${GAME_KIND}`}>
      <section className={`phone-card screen-${screen}`}>
        <header className="topbar">
          <span>{screen === "play" ? meta.title : meta.eyebrow}</span>
          <strong>{DAILY_STAMP}</strong>
        </header>

        {screen === "home" && (
          <section className="home-screen">
            <div className="hero-scene" aria-label={`${APP_TITLE} 대표 장면`}>
              <img className="hero-character" src={characterAsset} alt="" />
              <div className="prop prop-one" />
              <div className="prop prop-two" />
            </div>
            <p className="eyebrow">오늘의 미니게임</p>
            <h1>{meta.title}</h1>
            <p className="promise">{meta.promise}</p>
            <div className="today-card"><span>오늘의 목표</span><strong>{todayLabel}</strong></div>
            <div className="rule-card"><span>게임 방법</span><strong>{meta.rule}</strong><p>{meta.howTo}</p></div>
            <StageRail stage={stage} nextStageCopy={nextStageCopy} />
            <div className="tip-row">{homeTips.map((tip) => <span key={tip}>{tip}</span>)}</div>
            <div className="stat-grid">
              <div><span>최고 {meta.metric}</span><strong>{best}</strong></div>
              <div><span>플레이</span><strong>{plays}</strong></div>
              <div><span>{meta.collectible}</span><strong>{pieces}/18</strong></div>
            </div>
            <div className="progress-card">
              <div><strong>수집 진행</strong><span>{collectionProgress}%</span></div>
              <i style={{ width: `${collectionProgress}%` }} />
            </div>
            <button className="primary-button" onClick={start}>{meta.primary}</button>
            <button className="ghost-button" onClick={openRank}>랭킹 확인</button>
          </section>
        )}

        {screen === "play" && (
          <section className="play-screen">
            <div className="hud">
              <div><span>TIME</span><strong>{GAME_KIND === "jump" || GAME_KIND === "maze" ? "∞" : Math.max(0, timeLeft)}</strong></div>
              <div><span>SCORE</span><strong>{score}</strong></div>
              <div><span>{GAME_KIND === "jump" ? "STREAK" : GAME_KIND === "maze" ? "STEP" : GAME_KIND === "run" ? "FEVER" : "STREAK"}</span><strong>{GAME_KIND === "jump" ? streak : GAME_KIND === "maze" ? steps : GAME_KIND === "run" ? fever : combo}</strong></div>
            </div>
            <p className={`play-message flash-${flash}`}>{message}</p>
            <StageRail stage={stage} nextStageCopy={nextStageCopy} />
            {GAME_KIND === "run" && <RunBoard lane={lane} obstacles={obstacles} fever={fever} rainbow={rainbow} nearMiss={nearMiss} impact={runImpact} stageEffect={runStageEffect} onMoveLeft={() => moveRunLane(-1)} onMoveRight={() => moveRunLane(1)} />}
            {GAME_KIND === "detective" && <DetectiveBoard cards={cards} round={round} clue={CASE_CLUES[(round + dailyIndex) % CASE_CLUES.length]} targetRule={targetRule} characterAsset={CHARACTER_ASSETS.detective} onChoose={chooseCard} />}
            {GAME_KIND === "jump" && <JumpBoard power={power} height={height} streak={streak} stageEffect={jumpStageEffect} characterAsset={CHARACTER_ASSETS.jump} onJump={jump} />}
            {GAME_KIND === "maze" && <MazeBoard position={position} level={mazeLevel} hasKey={hasKey} shards={shards} characterAsset={CHARACTER_ASSETS.maze} onMove={moveMaze} />}
          </section>
        )}

        {screen === "result" && (
          <section className="result-screen">
            <div className="result-medal"><span>{score >= best ? "BEST" : "SAVE"}</span></div>
            <p className="eyebrow">오늘 기록 저장</p>
            <h1>{score}점</h1>
            <p className="promise">{message}</p>
            <div className="result-card"><span>이번 판 하이라이트</span><strong>{resultStory.highlight}</strong></div>
            <div className="result-card"><span>다음 목표</span><strong>{resultStory.nextGoal}</strong></div>
            <StageRail stage={stage} nextStageCopy={nextStageCopy} />
            <div className="result-card"><span>랭킹 상태</span><strong>{submitMessage}</strong></div>
            <div className="result-card"><span>수집 진행</span><strong>{pieces >= 18 ? "수집판 완성" : `${meta.collectible} ${Math.min(18, pieces + 1)}/18`}</strong></div>
            <button className="primary-button" onClick={startWithNextRoundAd} disabled={pendingNextRound}>{pendingNextRound ? "광고 확인 중" : isNextRoundAdSupported && isNextRoundAdLoaded ? "광고 보고 다음 판" : "다음 판 시작"}</button>
            <p className="ad-helper">{isNextRoundAdSupported && isNextRoundAdLoaded ? "짧은 광고 후 새 스테이지로 이어져요." : "광고 준비 전에는 바로 다음 판으로 이어져요."}</p>
            <button className="ghost-button" onClick={() => setScreen("home")}>홈으로</button>
          </section>
        )}
        <TossBannerAd adGroupId={BANNER_AD_GROUP_ID} className="game-banner-ad" label={`${meta.title} 하단 광고`} />
      </section>
    </main>
  );
}

function RunBoard({
  lane,
  obstacles,
  fever,
  rainbow,
  nearMiss,
  impact,
  stageEffect,
  onMoveLeft,
  onMoveRight,
}: {
  lane: number;
  obstacles: RunObject[];
  fever: number;
  rainbow: number;
  nearMiss: number;
  impact: RunImpact | null;
  stageEffect: RunStageEffect;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}) {
  return <div className={`run-board ${fever >= 80 ? "fever-on" : ""}`}>
    <div className="board-note"><span>{stageEffect.name} · 좌우 이동</span><span>무지개 {rainbow} · 아슬 {nearMiss}</span></div>
    <p className="stage-effect-note">{stageEffect.note}</p>
    <div className="fever-bar"><i style={{ width: `${fever}%` }} /></div>
    {[0, 1, 2].map((value) => <i key={value} className="lane-line" />)}
    {obstacles.map((item) => <span key={item.id} className={`runner-object ${item.kind}`} style={{ left: `${14 + item.lane * 31}%`, top: `${item.y}%` }} />)}
    <img className="runner-mongle" src={CHARACTER_ASSETS.run} alt="" style={{ left: `${14 + lane * 31}%` }} />
    {impact ? <span key={impact.id} className={`impact-burst ${impact.type}`}>{impact.text}</span> : null}
    <div className="lane-controls">
      <button type="button" onClick={onMoveLeft} aria-label="왼쪽으로 이동">←</button>
      <button type="button" onClick={onMoveRight} aria-label="오른쪽으로 이동">→</button>
    </div>
  </div>;
}

function DetectiveBoard({ cards, round, clue, targetRule, characterAsset, onChoose }: { cards: DetectiveCard[]; round: number; clue: string; targetRule: DetectiveRule; characterAsset: string; onChoose: (card: DetectiveCard) => void }) {
  return <div className="detective-board">
    <div className="case-brief">
      <img src={characterAsset} alt="" />
      <div>
        <span>사건 규칙</span>
        <strong>{targetRule.title}</strong>
        <p>{targetRule.instruction} 현장 힌트는 {clue}.</p>
      </div>
    </div>
    <div className="round-chip">사건 {round}/10 · 색+표식+소품+표정 조합</div>
    <div className="card-grid">
      {cards.map((card) => (
        <button key={card.id} className={`suspect-card ${DETECTIVE_TONES[card.tone].className}`} onClick={() => onChoose(card)} aria-label={card.hint}>
          <span className="suspect-face"><strong>{card.mark}</strong></span>
          <b>{card.toneLabel} 몽글</b>
          <small>{card.accessory}</small>
          <small>{card.mood}</small>
        </button>
      ))}
    </div>
  </div>;
}

function JumpBoard({ power, height, streak, stageEffect, characterAsset, onJump }: { power: number; height: number; streak: number; stageEffect: JumpStageEffect; characterAsset: string; onJump: () => void }) {
  return <div className="jump-board">
    <div className="board-note"><span>{stageEffect.name} {Math.min(12, height + 1)}/12</span><span>연속 {streak}</span></div>
    <p className="stage-effect-note">{stageEffect.note} · 황금 {stageEffect.goldenEvery}번째</p>
    <div className="cloud-stack">
      <img className="jump-character" src={characterAsset} alt="" />
      {Array.from({ length: 6 }).map((_, index) => <i key={index} className={`${index < Math.min(6, height) ? "lit" : ""} ${(index + 1) % stageEffect.goldenEvery === 0 ? "gold" : ""}`} style={{ "--i": index * 8 } as React.CSSProperties} />)}
    </div>
    <div className="power-meter">
      <span className="safe-zone" style={{ left: `${stageEffect.safeStart}%`, width: `${stageEffect.safeEnd - stageEffect.safeStart}%` }} />
      <span className="perfect-zone" style={{ left: `${stageEffect.perfectStart}%`, width: `${stageEffect.perfectEnd - stageEffect.perfectStart}%` }} />
      <b style={{ left: `${power}%` }} />
    </div>
    <button className="jump-button" onClick={onJump}>지금 점프</button>
  </div>;
}

function MazeBoard({ position, level, hasKey, shards, characterAsset, onMove }: { position: { x: number; y: number }; level: MazeLevel; hasKey: boolean; shards: string[]; characterAsset: string; onMove: (dx: number, dy: number) => void }) {
  return <div className="maze-wrap">
    <div className="maze-legend"><img src={characterAsset} alt="" /><span>{level.name}: 열쇠 → 조각 → 출구</span><strong>미로마다 벽, 함정, 열쇠 위치가 바뀌어요</strong></div>
    <div className="board-note"><span>최단 {level.shortest}</span><span>조각 {shards.length}/{level.shards.length}</span></div>
    <div className="maze-board">
      {level.map.flatMap((row, y) => row.map((cell, x) => {
        const key = `${x}-${y}`;
        const isPlayer = position.x === x && position.y === y;
        const isKey = key === level.key && !hasKey;
        const isExit = key === level.exit;
        const isShard = level.shards.includes(key) && !shards.includes(key);
        const isTrap = level.traps.includes(key);
        return <span key={key} className={`maze-cell ${cell ? "wall" : "path"} ${isExit ? "exit" : ""} ${isTrap ? "trap" : ""}`}>{isPlayer ? <b /> : isKey ? <em /> : isShard ? <i /> : null}</span>;
      }))}
    </div>
    <div className="maze-controls">
      <button onClick={() => onMove(0, -1)}>위</button>
      <div><button onClick={() => onMove(-1, 0)}>왼쪽</button><button onClick={() => onMove(1, 0)}>오른쪽</button></div>
      <button onClick={() => onMove(0, 1)}>아래</button>
    </div>
  </div>;
}

function StageRail({ stage, nextStageCopy }: { stage: StageInfo; nextStageCopy: string }) {
  return <div className="stage-rail" aria-label="스테이지 진행">
    <div className="stage-rail-copy">
      <span>{stage.title}</span>
      <strong>{stage.caption}</strong>
      <p>{nextStageCopy}</p>
    </div>
    <div className="stage-dots">
      {Array.from({ length: stage.total }, (_, index) => (
        <i key={index} className={index < stage.current ? "active" : ""} />
      ))}
    </div>
  </div>;
}

function getStageInfo(kind: GameKind, screen: Screen, plays: number, round: number, height: number, steps: number): StageInfo {
  if (kind === "run") {
    const current = Math.min(RUN_STAGE_EFFECTS.length, Math.max(1, plays + 1));
    const title = screen === "play" ? `스테이지 ${current}` : `다음 스테이지 ${current}`;
    return { current, total: RUN_STAGE_EFFECTS.length, title, caption: RUN_STAGE_EFFECTS[current - 1].name };
  }
  if (kind === "detective") {
    const current = Math.min(10, Math.max(1, round));
    return { current, total: 10, title: `사건 ${current}`, caption: getDetectiveRule(current).title };
  }
  if (kind === "jump") {
    const current = Math.min(JUMP_STAGE_EFFECTS.length, Math.max(1, Math.ceil((height + 1) / 2)));
    return { current, total: JUMP_STAGE_EFFECTS.length, title: `구름층 ${current}`, caption: JUMP_STAGE_EFFECTS[current - 1].name };
  }
  const current = Math.min(MAZE_LEVELS.length, Math.max(1, plays + 1));
  const title = screen === "play" ? `미로 ${current}` : `다음 미로 ${current}`;
  return { current, total: MAZE_LEVELS.length, title, caption: screen === "play" ? `${MAZE_LEVELS[current - 1].name} · ${steps}걸음` : MAZE_LEVELS[current - 1].name };
}

function getNextStageCopy(kind: GameKind, stage: StageInfo, round: number, height: number, shardCount: number) {
  if (kind === "run") return stage.current >= stage.total ? "마지막 코스: 피버를 끝까지 유지해요." : `클리어 후 ${RUN_STAGE_EFFECTS[stage.current].name} 개방`;
  if (kind === "detective") return round >= 10 ? "최종 사건: 네 가지 단서를 동시에 확인하기." : `다음 사건: ${getDetectiveRule(round + 1).title}`;
  if (kind === "jump") return height >= 12 ? "정상 도착: 황금 구름 기록 갱신." : `다음 구름 규칙: ${JUMP_STAGE_EFFECTS[Math.min(stage.total - 1, stage.current)].name}`;
  return shardCount >= 3 ? "다음 단계: 열쇠 들고 출구까지." : `다음 단계: 조각 ${Math.min(3, shardCount + 1)}/3 찾기`;
}

function getDetectiveRule(round: number) {
  return DETECTIVE_RULES[(round - 1) % DETECTIVE_RULES.length];
}

function matchesRule(card: DetectiveTrait, rule: DetectiveRule) {
  return Object.entries(rule.target).every(([key, value]) => card[key as keyof DetectiveTrait] === value);
}

function rotateValue<T extends string>(items: readonly T[], current: T, amount: number) {
  const index = Math.max(0, items.indexOf(current));
  return items[(index + amount) % items.length];
}

function completeTrait(rule: DetectiveRule, round: number): DetectiveTrait {
  return {
    tone: rule.target.tone ?? DETECTIVE_TONE_IDS[round % DETECTIVE_TONE_IDS.length],
    mark: rule.target.mark ?? DETECTIVE_MARKS[(round + 1) % DETECTIVE_MARKS.length],
    accessory: rule.target.accessory ?? DETECTIVE_ACCESSORIES[(round + 2) % DETECTIVE_ACCESSORIES.length],
    mood: rule.target.mood ?? DETECTIVE_MOODS[(round + 3) % DETECTIVE_MOODS.length],
  };
}

function makeDistractorTrait(index: number, round: number, rule: DetectiveRule): DetectiveTrait {
  const target = completeTrait(rule, round);
  const trait: DetectiveTrait = {
    tone: index % 2 === 0 ? target.tone : DETECTIVE_TONE_IDS[(round + index) % DETECTIVE_TONE_IDS.length],
    mark: index % 3 === 0 ? target.mark : DETECTIVE_MARKS[(round + index) % DETECTIVE_MARKS.length],
    accessory: index % 4 === 0 ? target.accessory : DETECTIVE_ACCESSORIES[(round + index + 1) % DETECTIVE_ACCESSORIES.length],
    mood: index % 5 === 0 ? target.mood : DETECTIVE_MOODS[(round + index + 2) % DETECTIVE_MOODS.length],
  };
  if (!matchesRule(trait, rule)) return trait;

  const missKeys = Object.keys(rule.target) as (keyof DetectiveTrait)[];
  const missKey = missKeys[(round + index) % missKeys.length] ?? "mark";
  if (missKey === "tone") trait.tone = rotateValue(DETECTIVE_TONE_IDS, trait.tone, 1);
  if (missKey === "mark") trait.mark = rotateValue(DETECTIVE_MARKS, trait.mark, 1);
  if (missKey === "accessory") trait.accessory = rotateValue(DETECTIVE_ACCESSORIES, trait.accessory, 1);
  if (missKey === "mood") trait.mood = rotateValue(DETECTIVE_MOODS, trait.mood, 1);
  return trait;
}

function makeCards(round: number, rule: DetectiveRule): DetectiveCard[] {
  const count = Math.min(9, 5 + Math.floor(round / 2));
  const targetIndex = Math.floor(Math.random() * count);
  return Array.from({ length: count }, (_, index) => {
    const trait = index === targetIndex ? completeTrait(rule, round) : makeDistractorTrait(index, round, rule);
    const isTarget = matchesRule(trait, rule);
    const toneLabel = DETECTIVE_TONES[trait.tone].label;
    const hint = `${toneLabel} 몸, ${trait.mark} 표식, ${trait.accessory}, ${trait.mood} 표정`;
    return { id: `${round}-${index}-${trait.tone}-${trait.mark}-${trait.accessory}-${trait.mood}`, ...trait, toneLabel, hint, isTarget };
  });
}

function getHomeTips(kind: GameKind, todayLabel: string) {
  const common = `오늘: ${todayLabel}`;
  if (kind === "run") return [common, "별 연속", "피버 반짝"];
  if (kind === "detective") return [common, "연속 정답", "변장 주의"];
  if (kind === "jump") return [common, "퍼펙트 존", "황금 구름"];
  return [common, "열쇠 먼저", "벽 통통 주의"];
}

export default App;

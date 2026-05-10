import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import "./App.css";
import { openLeaderboardSafe, submitScoreOnce } from "./lib/tossGameCenter";

type Screen = "home" | "play" | "result";
type GameKind = "run" | "detective" | "jump" | "maze";
type RunObject = { id: string; lane: number; y: number; kind: "rock" | "cloud" | "star" | "rainbow" };
type DetectiveCard = { id: string; role: "helper" | "thief" | "ghost" | "disguise"; mark: string; hint: string };
type MazeCell = 0 | 1;
type ResultStory = { highlight: string; nextGoal: string };

const GAME_KIND = "jump" as GameKind;
const APP_SLUG = "mongle-jump";
const APP_TITLE = "몽글 점프";
const BEST_KEY = `${APP_SLUG}-best-v1`;
const PLAY_COUNT_KEY = `${APP_SLUG}-play-count-v1`;
const COLLECTION_KEY = `${APP_SLUG}-collection-v1`;
const todayKst = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
const DAILY_STAMP = todayKst.replaceAll("-", ".");
const daySeed = Number(todayKst.replaceAll("-", ""));

const RUN_COURSES = ["별비 골목", "구름 터널", "무지개 언덕"];
const RUN_MISSIONS = ["별 5연속", "구름 사이 통과", "무지개 조각 찾기"];
const CASE_CLUES = ["발자국이 동글", "모자 각도가 달라요", "표식이 반짝", "꼬리가 숨어요", "눈썹이 찡긋"];
const CASE_FEEDBACK = ["단서가 딱 맞았어요.", "몽글 수첩에 기록 완료.", "현장 분위기가 밝아졌어요."];
const JUMP_TIPS = ["초록 한가운데", "흔들림 끝", "황금 구름 노려요"];
const SHARD_POINTS = ["1-0", "3-2", "0-4"];
const TRAP_POINTS = ["0-2", "4-1"];
const SHORTEST_GOAL = 12;

const META: Record<GameKind, {
  eyebrow: string;
  title: string;
  promise: string;
  primary: string;
  rule: string;
  metric: string;
  collectible: string;
}> = {
  run: {
    eyebrow: "30초 회피 러너",
    title: "도망 몽글",
    promise: "오늘 코스를 달리며 별과 무지개 조각을 모아요.",
    primary: "도망 시작",
    rule: "좌우 이동 · 바위 피하기 · 별은 연속으로!",
    metric: "거리",
    collectible: "구름 발자국",
  },
  detective: {
    eyebrow: "순간 관찰 게임",
    title: "1초 탐정 몽글",
    promise: "단서를 보고 진짜 도둑 몽글을 빠르게 찾아요.",
    primary: "사건 시작",
    rule: "표식과 단서를 보고 한 번에 콕 집어요.",
    metric: "해결 점수",
    collectible: "탐정 배지",
  },
  jump: {
    eyebrow: "타이밍 점프",
    title: "몽글 점프",
    promise: "퍼펙트 존과 황금 구름을 노려 더 높이 올라요.",
    primary: "점프 시작",
    rule: "초록 안전 구간, 가운데면 퍼펙트!",
    metric: "높이",
    collectible: "구름 조각",
  },
  maze: {
    eyebrow: "짧은 스와이프 퍼즐",
    title: "몽글 미로 탈출",
    promise: "열쇠와 반짝 조각을 챙겨 짧은 길로 탈출해요.",
    primary: "탈출 시작",
    rule: "벽은 피하고 함정 칸은 조심해요.",
    metric: "탈출 점수",
    collectible: "비밀 지도",
  },
};

const MAZE: MazeCell[][] = [
  [0, 0, 0, 1, 0],
  [1, 1, 0, 1, 0],
  [0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 0, 0, 0],
];

function readStoredNumber(key: string) {
  const parsed = Number(localStorage.getItem(key) ?? "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

function App() {
  const meta = META[GAME_KIND];
  const dailyIndex = daySeed % 3;
  const todayLabel = GAME_KIND === "run" ? `${RUN_COURSES[dailyIndex]} · ${RUN_MISSIONS[dailyIndex]}` : GAME_KIND === "detective" ? CASE_CLUES[dailyIndex] : GAME_KIND === "jump" ? JUMP_TIPS[dailyIndex] : `최단 ${SHORTEST_GOAL}걸음`;

  const [screen, setScreen] = useState<Screen>("home");
  const [best, setBest] = useState(() => readStoredNumber(BEST_KEY));
  const [plays, setPlays] = useState(() => readStoredNumber(PLAY_COUNT_KEY));
  const [pieces, setPieces] = useState(() => readStoredNumber(COLLECTION_KEY));
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("오늘 한 판 기록을 만들어 보세요.");
  const [submitMessage, setSubmitMessage] = useState("랭킹 제출 대기 중");
  const [playId, setPlayId] = useState("");
  const [resultStory, setResultStory] = useState<ResultStory>({ highlight: "첫 기록을 남겨요.", nextGoal: "한 판 시작" });

  const [timeLeft, setTimeLeft] = useState(30);
  const [lane, setLane] = useState(1);
  const [obstacles, setObstacles] = useState<RunObject[]>([]);
  const [combo, setCombo] = useState(0);
  const [fever, setFever] = useState(0);
  const [nearMiss, setNearMiss] = useState(0);
  const [rainbow, setRainbow] = useState(0);

  const [round, setRound] = useState(1);
  const [cards, setCards] = useState<DetectiveCard[]>(() => makeCards(1));
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

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [steps, setSteps] = useState(0);
  const [hasKey, setHasKey] = useState(false);
  const [shards, setShards] = useState<string[]>([]);
  const [wallHits, setWallHits] = useState(0);
  const [trapHits, setTrapHits] = useState(0);

  const collectionProgress = Math.min(100, Math.round((pieces / 18) * 100));
  const canPlayTicker = screen === "play" && (GAME_KIND === "run" || GAME_KIND === "detective");
  const homeTips = useMemo(() => getHomeTips(GAME_KIND, todayLabel), [todayLabel]);

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

  const start = () => {
    if (feverTimeoutRef.current) window.clearTimeout(feverTimeoutRef.current);
    if (detectiveTimeoutRef.current) window.clearTimeout(detectiveTimeoutRef.current);
    countedNearMissRef.current.clear();
    const nextPlayId = `${APP_SLUG}-${Date.now()}`;
    setPlayId(nextPlayId);
    setScore(0);
    setCombo(0);
    setTimeLeft(30);
    setLane(1);
    setObstacles([]);
    setFever(0);
    setNearMiss(0);
    setRainbow(0);
    setRound(1);
    setCards(makeCards(1));
    setFlash("idle");
    setSolvedCases(0);
    setHeight(0);
    setPower(20);
    jumpDirectionRef.current = 1;
    setStreak(0);
    setPerfects(0);
    setGoldClouds(0);
    setPosition({ x: 0, y: 0 });
    setSteps(0);
    setHasKey(false);
    setShards([]);
    setWallHits(0);
    setTrapHits(0);
    setSubmitMessage("랭킹 제출 대기 중");
    setResultStory({ highlight: "첫 장면 준비 완료", nextGoal: meta.rule });
    setMessage(meta.rule);
    setScreen("play");
  };

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
        const moved = current.map((item) => ({ ...item, y: item.y + 12 })).filter((item) => item.y < 112);
        const chance = 0.52 - Math.min(0.18, timeLeft / 220);
        if (Math.random() > chance) {
          const roll = Math.random();
          const kind: RunObject["kind"] = roll > 0.9 ? "rainbow" : roll > 0.58 ? "star" : roll > 0.28 ? "cloud" : "rock";
          moved.push({ id: `${Date.now()}-${Math.random()}`, lane: Math.floor(Math.random() * 3), y: 0, kind });
        }
        return moved;
      });
    }, 240);
    return () => window.clearInterval(id);
  }, [fever, screen, timeLeft]);

  useEffect(() => {
    if (screen !== "play" || GAME_KIND !== "run") return;
    const close = obstacles.find((item) => item.lane !== lane && Math.abs(item.lane - lane) === 1 && item.y >= 80 && item.y <= 88 && item.kind !== "star" && item.kind !== "rainbow");
    if (close && !countedNearMissRef.current.has(close.id)) {
      countedNearMissRef.current.add(close.id);
      setNearMiss((current) => current + 1);
      setScore((current) => current + 18);
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
    setMessage(hit.kind === "cloud" ? "구름에 퐁!" : "바위에 통통");
  }, [combo, fever, lane, obstacles, screen]);

  useEffect(() => {
    if (screen !== "play" || GAME_KIND !== "jump") return undefined;
    const id = window.setInterval(() => {
      setPower((current) => {
        const speed = 5 + Math.min(7, Math.floor(height / 3));
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
  }, [height, screen]);

  useEffect(() => {
    if (screen !== "play") return;
    if (GAME_KIND === "run" && timeLeft <= 0) finish(score, "오늘 코스 기록 저장", { highlight: `무지개 ${rainbow} · 아슬 ${nearMiss}`, nextGoal: combo >= 5 ? "피버 두 번 만들기" : RUN_MISSIONS[dailyIndex] });
    if (GAME_KIND === "detective" && timeLeft <= 0) finish(score, "탐정 수첩 저장", { highlight: `해결 ${solvedCases}건 · 연속 ${combo}`, nextGoal: "희귀 변장 카드 찾기" });
  }, [combo, dailyIndex, finish, nearMiss, rainbow, score, screen, solvedCases, timeLeft]);

  const chooseCard = (card: DetectiveCard) => {
    if (GAME_KIND !== "detective" || screen !== "play" || flash !== "idle") return;
    if (card.role === "thief" || card.role === "disguise") {
      const nextCombo = combo + 1;
      const nextRound = round + 1;
      const bonus = card.role === "disguise" ? 90 : 0;
      setFlash("good");
      setCombo(nextCombo);
      setSolvedCases((current) => current + 1);
      setScore((current) => current + 120 + nextCombo * 12 + bonus);
      setMessage(card.role === "disguise" ? "변장 도둑 검거!" : CASE_FEEDBACK[round % CASE_FEEDBACK.length]);
      if (nextRound > 10) {
        finish(score + 120 + nextCombo * 12 + bonus + timeLeft * 8, "오늘 사건 모두 해결", { highlight: `연속 정답 ${nextCombo} · 단서 적중`, nextGoal: "변장 도둑까지 한 번에" });
        return;
      }
      if (detectiveTimeoutRef.current) window.clearTimeout(detectiveTimeoutRef.current);
      detectiveTimeoutRef.current = window.setTimeout(() => {
        if (screen !== "play") return;
        setRound(nextRound);
        setCards(makeCards(nextRound));
        setFlash("idle");
      }, 320);
      return;
    }
    setFlash("bad");
    setCombo(0);
    setScore((current) => Math.max(0, current - 70));
    setMessage("아깝다, 표식을 다시 봐요");
    if (detectiveTimeoutRef.current) window.clearTimeout(detectiveTimeoutRef.current);
    detectiveTimeoutRef.current = window.setTimeout(() => {
      if (screen === "play") setFlash("idle");
    }, 320);
  };

  const jump = () => {
    if (GAME_KIND !== "jump" || screen !== "play") return;
    const safe = power >= 42 && power <= 68;
    const perfect = power >= 50 && power <= 60;
    const golden = (height + 1) % 5 === 0;
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
      setMessage(golden ? "황금 구름 착지!" : perfect ? "퍼펙트 착지" : "안전 착지");
      if (nextHeight >= 12) finish(projectedScore + 300 + nextStreak * 40, "구름 꼭대기 도착", { highlight: `연속 ${nextStreak} · 퍼펙트 ${perfects + (perfect ? 1 : 0)}`, nextGoal: "황금 구름 더 밟기" });
      return;
    }
    finish(score + height * 35 + perfects * 45 + goldClouds * 70, "기록은 반짝 저장", { highlight: `최고 높이 ${height} · 연속 ${streak}`, nextGoal: perfects === 0 ? "퍼펙트 존 한 번" : "안전 착지 5연속" });
  };

  const moveMaze = (dx: number, dy: number) => {
    if (GAME_KIND !== "maze" || screen !== "play") return;
    const next = { x: position.x + dx, y: position.y + dy };
    if (next.x < 0 || next.y < 0 || next.x > 4 || next.y > 4 || MAZE[next.y][next.x] === 1) {
      setWallHits((current) => current + 1);
      setScore((current) => Math.max(0, current - 30));
      setMessage("벽 통통, 돌아가요");
      return;
    }
    const key = `${next.x}-${next.y}`;
    const nextSteps = steps + 1;
    setPosition(next);
    setSteps(nextSteps);
    if (TRAP_POINTS.includes(key)) {
      setTrapHits((current) => current + 1);
      setScore((current) => Math.max(0, current - 80));
      setMessage("함정 칸! 살금살금");
      return;
    }
    if (SHARD_POINTS.includes(key) && !shards.includes(key)) {
      setShards((current) => [...current, key]);
      setScore((current) => current + 120);
      setMessage("반짝 조각 획득");
      return;
    }
    if (next.x === 2 && next.y === 2 && !hasKey) {
      setHasKey(true);
      setMessage("열쇠 반짝, 출구로!");
      return;
    }
    if (next.x === 4 && next.y === 4) {
      const keyBonus = hasKey ? 240 : 0;
      const shardBonus = shards.length * 110;
      const routeBonus = nextSteps <= SHORTEST_GOAL ? 180 : 0;
      finish(1200 - nextSteps * 32 - wallHits * 25 - trapHits * 70 + keyBonus + shardBonus + routeBonus, hasKey ? "열쇠 들고 탈출" : "탈출 성공", { highlight: `열쇠 ${hasKey ? "획득" : "놓침"} · 조각 ${shards.length}`, nextGoal: nextSteps <= SHORTEST_GOAL ? "조각 3개 챙기기" : `${SHORTEST_GOAL}걸음 안쪽` });
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
              <div className="soft-orb orb-one" />
              <div className="soft-orb orb-two" />
              <div className="mongle-body"><span className="eye left" /><span className="eye right" /><span className="mouth" /></div>
              <div className="prop prop-one" />
              <div className="prop prop-two" />
            </div>
            <p className="eyebrow">오늘의 미니게임</p>
            <h1>{meta.title}</h1>
            <p className="promise">{meta.promise}</p>
            <div className="today-card"><span>오늘의 목표</span><strong>{todayLabel}</strong></div>
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
            {GAME_KIND === "run" && <RunBoard lane={lane} obstacles={obstacles} fever={fever} rainbow={rainbow} nearMiss={nearMiss} onLane={setLane} />}
            {GAME_KIND === "detective" && <DetectiveBoard cards={cards} round={round} clue={CASE_CLUES[(round + dailyIndex) % CASE_CLUES.length]} onChoose={chooseCard} />}
            {GAME_KIND === "jump" && <JumpBoard power={power} height={height} streak={streak} onJump={jump} />}
            {GAME_KIND === "maze" && <MazeBoard position={position} hasKey={hasKey} shards={shards} traps={TRAP_POINTS} onMove={moveMaze} />}
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
            <div className="result-card"><span>랭킹 상태</span><strong>{submitMessage}</strong></div>
            <div className="result-card"><span>수집 진행</span><strong>{pieces >= 18 ? "수집판 완성" : `${meta.collectible} ${Math.min(18, pieces + 1)}/18`}</strong></div>
            <button className="primary-button" onClick={start}>한 판 더</button>
            <button className="ghost-button" onClick={() => setScreen("home")}>홈으로</button>
          </section>
        )}
      </section>
    </main>
  );
}

function RunBoard({ lane, obstacles, fever, rainbow, nearMiss, onLane }: { lane: number; obstacles: RunObject[]; fever: number; rainbow: number; nearMiss: number; onLane: (lane: number) => void }) {
  return <div className={`run-board ${fever >= 80 ? "fever-on" : ""}`}>
    <div className="board-note"><span>무지개 {rainbow}</span><span>아슬 {nearMiss}</span></div>
    <div className="fever-bar"><i style={{ width: `${fever}%` }} /></div>
    {[0, 1, 2].map((value) => <i key={value} className="lane-line" />)}
    {obstacles.map((item) => <span key={item.id} className={`runner-object ${item.kind}`} style={{ left: `${14 + item.lane * 31}%`, top: `${item.y}%` }} />)}
    <span className="runner-mongle" style={{ left: `${14 + lane * 31}%` }} />
    <div className="lane-controls">
      {[0, 1, 2].map((value) => <button key={value} className={lane === value ? "active" : ""} onClick={() => onLane(value)}>{value === 0 ? "왼쪽" : value === 1 ? "가운데" : "오른쪽"}</button>)}
    </div>
  </div>;
}

function DetectiveBoard({ cards, round, clue, onChoose }: { cards: DetectiveCard[]; round: number; clue: string; onChoose: (card: DetectiveCard) => void }) {
  return <div className="detective-board">
    <div className="round-chip">사건 {round}/10 · {clue}</div>
    <div className="card-grid">
      {cards.map((card) => <button key={card.id} className={`suspect-card ${card.role}`} onClick={() => onChoose(card)} aria-label={card.hint}><span>{card.mark}</span><b>{card.role === "disguise" ? "변장" : "몽글"}</b></button>)}
    </div>
  </div>;
}

function JumpBoard({ power, height, streak, onJump }: { power: number; height: number; streak: number; onJump: () => void }) {
  return <div className="jump-board">
    <div className="board-note"><span>연속 {streak}</span><span>5층마다 황금</span></div>
    <div className="cloud-stack">{Array.from({ length: 6 }).map((_, index) => <i key={index} className={`${index < Math.min(6, height) ? "lit" : ""} ${index === 4 ? "gold" : ""}`} style={{ "--i": index * 8 } as React.CSSProperties} />)}</div>
    <div className="power-meter"><span className="safe-zone" /><span className="perfect-zone" /><b style={{ left: `${power}%` }} /></div>
    <button className="jump-button" onClick={onJump}>지금 점프</button>
  </div>;
}

function MazeBoard({ position, hasKey, shards, traps, onMove }: { position: { x: number; y: number }; hasKey: boolean; shards: string[]; traps: string[]; onMove: (dx: number, dy: number) => void }) {
  return <div className="maze-wrap">
    <div className="board-note"><span>최단 {SHORTEST_GOAL}</span><span>조각 {shards.length}/3</span></div>
    <div className="maze-board">
      {MAZE.flatMap((row, y) => row.map((cell, x) => {
        const key = `${x}-${y}`;
        const isPlayer = position.x === x && position.y === y;
        const isKey = x === 2 && y === 2 && !hasKey;
        const isExit = x === 4 && y === 4;
        const isShard = SHARD_POINTS.includes(key) && !shards.includes(key);
        const isTrap = traps.includes(key);
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

function makeCards(round: number): DetectiveCard[] {
  const count = Math.min(9, 4 + Math.floor(round / 2));
  const rareDisguise = round >= 4 && round % 3 === 1;
  const thiefIndex = Math.floor(Math.random() * count);
  const disguiseIndex = rareDisguise ? (thiefIndex + 2) % count : -1;
  return Array.from({ length: count }, (_, index) => {
    const role: DetectiveCard["role"] = index === thiefIndex ? (rareDisguise ? "disguise" : "thief") : index === disguiseIndex ? "thief" : index % 3 === 0 ? "ghost" : "helper";
    const mark = role === "disguise" ? "△" : role === "thief" ? "×" : role === "ghost" ? "~" : "·";
    return { id: `${round}-${index}`, role, mark, hint: role === "disguise" ? "삼각 표식 변장 도둑" : `${mark} 표식 몽글` };
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

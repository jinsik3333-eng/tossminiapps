import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import "./App.css";
import {
  type DefenseResult,
  type DefenseState,
  type HelperId,
  TODAY_WAVE,
  activateCloudShieldSkill,
  createDefenseState,
  finishDefense,
  getRemainingSeconds,
  getWavePhase,
  missTap,
  pauseDefense,
  resumeDefense,
  startDefense,
  tapMonster,
  tickDefense,
} from "./lib/gameLogic";
import {
  type GameProfile,
  getGameProfileOrFallback,
  openLeaderboardSafe,
  submitScoreOnce,
} from "./lib/tossGameCenter";

type Screen = "home" | "gate" | "play" | "result";

type DayRecord = {
  day: string;
  score: number;
};

type FloatText = {
  id: string;
  x: number;
  y: number;
  text: string;
  tone: "score" | "combo" | "skill";
};

const TUTORIAL_KEY = "mongle-defense-tutorial-v1";
const RECORDS_KEY = "mongle-defense-records-v1";
const COLLECTION_KEY = "mongle-defense-collection-v1";
const HELPER_KEY = "mongle-defense-helper-v1";
const COLLECTION_GOAL = 24;

const HELPERS: Record<
  HelperId,
  { name: string; mark: string; effect: string }
> = {
  sleepy: { name: "잠꾸러기", mark: "Z", effect: "첫 실수 1회 완화" },
  detective: { name: "탐정", mark: "?", effect: "보너스 등장 소폭 증가" },
  thief: { name: "도둑", mark: "×", effect: "콤보 점수 소폭 증가" },
  ghost: { name: "유령", mark: "~", effect: "위험 근처 속도 완화" },
};

const GRADE_TARGETS = [
  { label: "아슬아슬 방어", score: 900 },
  { label: "완벽 방어", score: 1500 },
  { label: "몽글 고수", score: 2100 },
];

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [profile, setProfile] = useState<GameProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [tutorialSeen, setTutorialSeen] = useState(
    () => localStorage.getItem(TUTORIAL_KEY) === "done",
  );
  const [records, setRecords] = useState<DayRecord[]>(() => readRecords());
  const [collectionCount, setCollectionCount] = useState(() =>
    Math.min(
      COLLECTION_GOAL,
      Number(localStorage.getItem(COLLECTION_KEY) ?? "0"),
    ),
  );
  const [selectedHelper, setSelectedHelper] = useState<HelperId>(() =>
    readHelper(),
  );
  const [runBestBefore, setRunBestBefore] = useState(0);
  const [floatTexts, setFloatTexts] = useState<FloatText[]>([]);
  const [playBanner, setPlayBanner] = useState("");
  const [game, setGame] = useState<DefenseState | null>(null);
  const [result, setResult] = useState<DefenseResult | null>(null);
  const [rankMessage, setRankMessage] = useState(
    "리더보드는 결과 화면에서 확인할 수 있어요.",
  );
  const [submitMessage, setSubmitMessage] = useState("점수 제출 대기 중");
  const lastTickRef = useRef<number | null>(null);

  const bestScore = useMemo(
    () => Math.max(0, ...records.map((record) => record.score)),
    [records],
  );
  const remainingSeconds = game ? getRemainingSeconds(game) : 30;
  const collectionPercent = Math.min(
    100,
    Math.round((collectionCount / COLLECTION_GOAL) * 100),
  );
  const wavePhase = game ? getWavePhase(game.elapsedMs) : "적응";

  const pushFloatText = useCallback((next: Omit<FloatText, "id">) => {
    const id = `float-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setFloatTexts((current) => [...current.slice(-5), { ...next, id }]);
    window.setTimeout(() => {
      setFloatTexts((current) => current.filter((item) => item.id !== id));
    }, 720);
  }, []);

  const flashBanner = useCallback((text: string, durationMs = 900) => {
    setPlayBanner(text);
    window.setTimeout(() => setPlayBanner(""), durationMs);
  }, []);

  const prepareGate = useCallback(async () => {
    setScreen("gate");
    setProfileLoading(true);
    const nextProfile = await getGameProfileOrFallback();
    setProfile(nextProfile);
    setProfileLoading(false);
  }, []);

  const startNewGame = useCallback(() => {
    localStorage.setItem(TUTORIAL_KEY, "done");
    setTutorialSeen(true);
    setSubmitMessage("점수 제출 대기 중");
    setResult(null);
    setRunBestBefore(bestScore);
    setFloatTexts([]);
    flashBanner(`${TODAY_WAVE.name} · ${TODAY_WAVE.short}`, 1600);
    setRankMessage("랭킹은 게임 종료 후 열 수 있어요.");
    const playId = `mongle-defense-${Date.now()}`;
    setGame(
      startDefense(
        createDefenseState(playId, Date.now(), { helperId: selectedHelper }),
      ),
    );
    lastTickRef.current = null;
    setScreen("play");
  }, [bestScore, flashBanner, selectedHelper]);

  useEffect(() => {
    if (screen !== "play" || game?.status !== "playing") return undefined;

    const timer = window.setInterval(() => {
      const now = performance.now();
      const delta =
        lastTickRef.current == null ? 100 : now - lastTickRef.current;
      lastTickRef.current = now;
      setGame((current) => (current ? tickDefense(current, delta) : current));
    }, 100);

    return () => window.clearInterval(timer);
  }, [screen, game?.status]);

  useEffect(() => {
    if (screen !== "play" || !game || game.status !== "result") return;

    const finalResult = finishDefense(game);
    setResult(finalResult);
    setScreen("result");
    setRecords((current) => saveRecord(finalResult.score, current));
    const nextCollectionCount = Math.min(
      COLLECTION_GOAL,
      collectionCount + 1 + (finalResult.bonusBlocked > 0 ? 1 : 0),
    );
    setCollectionCount(nextCollectionCount);
    localStorage.setItem(COLLECTION_KEY, String(nextCollectionCount));
  }, [collectionCount, game, screen]);

  useEffect(() => {
    if (!result) return;

    let cancelled = false;
    setSubmitMessage("게임 종료 점수 제출 중");
    submitScoreOnce(result.score, result.playId).then((status) => {
      if (cancelled) return;
      const messageByStatus: Record<typeof status.status, string> = {
        success: "랭킹 점수 제출 완료",
        "already-submitted": "이번 플레이 점수는 이미 제출했어요.",
        unsupported: "랭킹 제출 대신 이번 기록을 앱에 저장했어요.",
        failed: "랭킹 제출이 어려워 로컬 기록을 저장했어요.",
        fallback: "랭킹 제출 중 오류가 생겨 로컬 기록을 저장했어요.",
      };
      setSubmitMessage(messageByStatus[status.status]);
    });

    return () => {
      cancelled = true;
    };
  }, [result]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        setGame((current) => (current ? pauseDefense(current) : current));
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const openRank = async () => {
    const response = await openLeaderboardSafe();
    setRankMessage(
      response.status === "opened"
        ? "랭킹 화면을 열었어요."
        : "현재 환경에서는 앱 안의 기록만 확인할 수 있어요.",
    );
  };

  return (
    <main className="app-shell">
      <section className={`phone-card screen-${screen}`}>
        {screen === "home" && (
          <HomeScreen
            bestScore={bestScore}
            collectionCount={collectionCount}
            collectionPercent={collectionPercent}
            rankMessage={rankMessage}
            records={records}
            selectedHelper={selectedHelper}
            onHelperChange={(helperId) => {
              setSelectedHelper(helperId);
              localStorage.setItem(HELPER_KEY, helperId);
            }}
            onOpenRank={openRank}
            onStart={prepareGate}
          />
        )}

        {screen === "gate" && (
          <GateScreen
            loading={profileLoading}
            profile={profile}
            selectedHelper={selectedHelper}
            tutorialSeen={tutorialSeen}
            onBack={() => setScreen("home")}
            onStart={startNewGame}
          />
        )}

        {screen === "play" && game && (
          <PlayScreen
            floatTexts={floatTexts}
            game={game}
            playBanner={playBanner}
            remainingSeconds={remainingSeconds}
            wavePhase={wavePhase}
            onMonsterTap={(monsterId, x, y) =>
              setGame((current) => {
                if (!current) return current;
                const beforeScore = current.score;
                const beforeCombo = current.combo;
                const beforeBlocked = current.blocked;
                const beforeTarget = current.monsters.find(
                  (monster) => monster.id === monsterId,
                );
                const next = tapMonster(current, monsterId);
                const scoreDelta = next.score - beforeScore;
                if (scoreDelta > 0) {
                  pushFloatText({
                    x,
                    y,
                    text: `+${scoreDelta}`,
                    tone: "score",
                  });
                }
                if (
                  next.blocked > beforeBlocked &&
                  [5, 10, 20].includes(next.combo)
                ) {
                  flashBanner(`${next.combo}콤보! 리듬이 붙었어요`);
                  pushFloatText({
                    x,
                    y: Math.max(12, y - 10),
                    text: `${next.combo} COMBO`,
                    tone: "combo",
                  });
                } else if (
                  beforeTarget?.type === "shield" &&
                  next.combo === beforeCombo
                ) {
                  flashBanner("방패가 흔들렸어요");
                }
                return next;
              })
            }
            onMissTap={() =>
              setGame((current) => (current ? missTap(current) : current))
            }
            onResume={() => {
              lastTickRef.current = null;
              setGame((current) =>
                current ? resumeDefense(current) : current,
              );
            }}
            onSkill={() =>
              setGame((current) => {
                if (!current) return current;
                const beforeScore = current.score;
                const next = activateCloudShieldSkill(current);
                if (next !== current && next.skillUsed) {
                  flashBanner("구름 방패 발동!");
                  pushFloatText({
                    x: 50,
                    y: 46,
                    text: `+${next.score - beforeScore}`,
                    tone: "skill",
                  });
                }
                return next;
              })
            }
          />
        )}

        {screen === "result" && result && (
          <ResultScreen
            collectionCount={collectionCount}
            rankMessage={rankMessage}
            result={result}
            runBestBefore={runBestBefore}
            submitMessage={submitMessage}
            onHome={() => setScreen("home")}
            onOpenRank={openRank}
            onReplay={startNewGame}
          />
        )}
      </section>
    </main>
  );
}

function HomeScreen({
  bestScore,
  collectionCount,
  collectionPercent,
  rankMessage,
  records,
  selectedHelper,
  onHelperChange,
  onOpenRank,
  onStart,
}: {
  bestScore: number;
  collectionCount: number;
  collectionPercent: number;
  rankMessage: string;
  records: DayRecord[];
  selectedHelper: HelperId;
  onHelperChange: (helperId: HelperId) => void;
  onOpenRank: () => void;
  onStart: () => void;
}) {
  return (
    <div className="home-screen">
      <div className="hero-stage" aria-hidden="true">
        <div className="village-dome" />
        <div className="toy-monster monster-a" />
        <div className="toy-monster monster-b" />
        <div className="cloud-shield" />
      </div>
      <p className="eyebrow">30초 캐주얼 디펜스</p>
      <h1>몽글 디펜스</h1>
      <p className="lead">
        내려오는 몬스터를 막고 조각을 모아 몽글 마을을 키워요.
      </p>
      <button className="primary-button" onClick={onStart}>
        바로 방어하기
      </button>

      <div className="dashboard-grid">
        <InfoCard label="오늘 웨이브" value={TODAY_WAVE.name} />
        <InfoCard label="웨이브 효과" value={TODAY_WAVE.short} />
        <InfoCard label="최고 점수" value={`${bestScore.toLocaleString()}점`} />
        <InfoCard
          label="수집 진행률"
          value={`${collectionCount}/${COLLECTION_GOAL}`}
        />
      </div>
      <div
        className="progress-track"
        aria-label={`조각 ${collectionPercent}% 수집`}
      >
        <span style={{ width: `${collectionPercent}%` }} />
      </div>
      <p className="next-copy">{collectionGoalCopy(collectionCount)}</p>

      <HelperPicker selectedHelper={selectedHelper} onChange={onHelperChange} />

      <section className="panel">
        <div className="section-title">
          <strong>7일 방어 기록</strong>
          <span>{records.length}/7</span>
        </div>
        <div className="record-bars">
          {Array.from({ length: 7 }, (_, index) => {
            const record = records[index];
            const height = record
              ? Math.max(16, Math.min(64, record.score / 28))
              : 12;
            return (
              <span
                key={index}
                className="record-bar"
                style={{ height }}
                title={record?.day ?? "기록 없음"}
              />
            );
          })}
        </div>
      </section>

      <section className="rank-card">
        <strong>랭킹 안내</strong>
        <p>{rankMessage}</p>
        <button className="secondary-button" onClick={onOpenRank}>
          랭킹 보기
        </button>
      </section>

      <div className="tip-card">
        오늘 팁: 방패는 숫자가 0이 될 때까지 탭해요.
      </div>
    </div>
  );
}

function GateScreen({
  loading,
  profile,
  selectedHelper,
  tutorialSeen,
  onBack,
  onStart,
}: {
  loading: boolean;
  profile: GameProfile | null;
  selectedHelper: HelperId;
  tutorialSeen: boolean;
  onBack: () => void;
  onStart: () => void;
}) {
  const helper = HELPERS[selectedHelper];

  return (
    <div className="gate-screen">
      <button className="text-button" onClick={onBack}>
        홈으로
      </button>
      <p className="eyebrow">방어 준비</p>
      <h2>오늘 리듬 확인</h2>
      <div className="profile-card">
        <span className="profile-dot" />
        <div>
          <strong>
            {loading ? "프로필 확인 중" : (profile?.nickname ?? "연습 수비대")}
          </strong>
          <p>
            {loading
              ? "잠시만 기다려 주세요."
              : (profile?.message ?? "연습 모드로 진행해요.")}
          </p>
        </div>
      </div>
      <section className="wave-card">
        <strong>{TODAY_WAVE.name}</strong>
        <p>{TODAY_WAVE.effect}</p>
        <div className="rhythm-row">
          <span>0~10초 적응</span>
          <span>10~20초 콤보</span>
          <span>20~30초 피버</span>
        </div>
      </section>
      <section className="helper-ready-card">
        <span className="helper-mark">{helper.mark}</span>
        <div>
          <strong>{helper.name} 동행</strong>
          <p>{helper.effect}</p>
        </div>
      </section>
      <div className="tutorial-card">
        <strong>{tutorialSeen ? "규칙 복습" : "처음 10초 규칙"}</strong>
        <ol>
          <li>동그란 몬스터는 1탭, 방패는 2탭이에요.</li>
          <li>파란 빠른 몬스터와 반짝 보너스를 먼저 봐요.</li>
          <li>콤보 8 이상이면 구름 방패를 사용할 수 있어요.</li>
        </ol>
      </div>
      <button className="primary-button" disabled={loading} onClick={onStart}>
        준비 완료
      </button>
    </div>
  );
}

function PlayScreen({
  floatTexts,
  game,
  playBanner,
  remainingSeconds,
  wavePhase,
  onMonsterTap,
  onMissTap,
  onResume,
  onSkill,
}: {
  floatTexts: FloatText[];
  game: DefenseState;
  playBanner: string;
  remainingSeconds: number;
  wavePhase: string;
  onMonsterTap: (monsterId: string, x: number, y: number) => void;
  onMissTap: () => void;
  onResume: () => void;
  onSkill: () => void;
}) {
  return (
    <div className="play-screen">
      <header className="hud">
        <HudItem label="TIME" value={`${remainingSeconds}s`} />
        <HudItem label="HP" value={`${game.hp}/${game.maxHp}`} />
        <HudItem label="SCORE" value={game.score.toLocaleString()} />
        <HudItem label="COMBO" value={`${game.combo}`} />
      </header>
      <div className="phase-pill">
        {TODAY_WAVE.name} · {wavePhase}
      </div>

      <div
        aria-label="몽글 디펜스 플레이 영역"
        className="battlefield"
        onClick={onMissTap}
      >
        {playBanner && <div className="play-banner">{playBanner}</div>}
        {Array.from({ length: game.lanes }, (_, lane) => (
          <div className="lane" key={lane}>
            <span className="lane-line" />
          </div>
        ))}
        <div className="danger-line">위험 구역</div>
        {game.monsters.map((monster) => {
          const x = (monster.lane / game.lanes) * 100 + 100 / game.lanes / 2;
          return (
            <button
              aria-label={`${monsterLabel(monster.type)} 막기`}
              className={`monster-token type-${monster.type}`}
              key={monster.id}
              onClick={(event) => {
                event.stopPropagation();
                onMonsterTap(monster.id, x, monster.y);
              }}
              style={{
                left: `${x}%`,
                top: `${monster.y}%`,
              }}
            >
              <span className="monster-face" />
              <span className="monster-mark">{monsterMark(monster.type)}</span>
              {monster.maxHp > 1 && <b>{monster.hp}</b>}
            </button>
          );
        })}
        {floatTexts.map((item) => (
          <span
            className={`float-text tone-${item.tone}`}
            key={item.id}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            {item.text}
          </span>
        ))}
        <div className="village-row">
          <span />
          <span />
          <span />
        </div>
        {game.status === "paused" && (
          <div className="pause-cover">
            <strong>일시정지</strong>
            <button className="primary-button" onClick={onResume}>
              이어하기
            </button>
          </div>
        )}
      </div>

      <footer className="play-actions">
        <button
          className="skill-button"
          disabled={!game.skillReady || game.skillUsed}
          onClick={onSkill}
        >
          구름 방패{" "}
          {game.skillUsed
            ? "사용 완료"
            : game.skillReady
              ? "발동"
              : `${game.combo}/8`}
        </button>
        <p>
          {HELPERS[game.helperId].name}: {HELPERS[game.helperId].effect}
        </p>
      </footer>
    </div>
  );
}

function ResultScreen({
  collectionCount,
  rankMessage,
  result,
  runBestBefore,
  submitMessage,
  onHome,
  onOpenRank,
  onReplay,
}: {
  collectionCount: number;
  rankMessage: string;
  result: DefenseResult;
  runBestBefore: number;
  submitMessage: string;
  onHome: () => void;
  onOpenRank: () => void;
  onReplay: () => void;
}) {
  const nextTarget = nextGradeTarget(result.score);
  const bestDelta = result.score - runBestBefore;

  return (
    <div className="result-screen">
      <p className="eyebrow">방어 결과</p>
      <h2>{result.grade}</h2>
      <strong className="big-score">{result.score.toLocaleString()}점</strong>
      <p className="submit-state">{submitMessage}</p>

      <section className="motivation-card">
        <strong>
          {nextTarget
            ? `${nextTarget.label}까지 ${(
                nextTarget.score - result.score
              ).toLocaleString()}점`
            : "다음엔 콤보 20을 노려봐요"}
        </strong>
        <p>
          최고점 대비 {bestDelta >= 0 ? "+" : ""}
          {bestDelta.toLocaleString()}점 · 보너스 {result.bonusBlocked}마리 방어
          {result.bonusLeaked > 0 ? ` · ${result.bonusLeaked}마리 놓침` : ""}
        </p>
      </section>

      <section className="breakdown-card">
        <ResultRow label="기본 점수" value={result.breakdown.baseScore} />
        <ResultRow label="콤보 보너스" value={result.breakdown.comboBonus} />
        <ResultRow label="HP 보너스" value={result.breakdown.hpBonus} />
        <ResultRow label="누수 패널티" value={-result.breakdown.leakPenalty} />
      </section>

      <section className="reward-card">
        <span className="piece-art" aria-hidden="true" />
        <div>
          <strong>{result.piece}</strong>
          <p>
            조각 {collectionCount}/{COLLECTION_GOAL} ·{" "}
            {collectionGoalCopy(collectionCount)}
          </p>
        </div>
      </section>

      <section className="rank-card">
        <strong>랭킹</strong>
        <p>{rankMessage}</p>
        <button className="secondary-button" onClick={onOpenRank}>
          랭킹 보기
        </button>
      </section>

      <button className="primary-button" onClick={onReplay}>
        다시 방어하기
      </button>
      <button className="text-button" onClick={onHome}>
        홈으로
      </button>
    </div>
  );
}

function HelperPicker({
  selectedHelper,
  onChange,
}: {
  selectedHelper: HelperId;
  onChange: (helperId: HelperId) => void;
}) {
  return (
    <section className="helper-panel">
      <div className="section-title">
        <strong>몽글 도우미</strong>
        <span>{HELPERS[selectedHelper].name} 선택</span>
      </div>
      <div className="helper-grid">
        {(Object.keys(HELPERS) as HelperId[]).map((helperId) => (
          <button
            className={`helper-chip ${selectedHelper === helperId ? "is-selected" : ""}`}
            key={helperId}
            onClick={() => onChange(helperId)}
          >
            <span>{HELPERS[helperId].mark}</span>
            <strong>{HELPERS[helperId].name}</strong>
            <em>{HELPERS[helperId].effect}</em>
          </button>
        ))}
      </div>
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function HudItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="hud-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="result-row">
      <span>{label}</span>
      <strong>{value.toLocaleString()}</strong>
    </div>
  );
}

function readRecords(): DayRecord[] {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(RECORDS_KEY) ?? "[]",
    ) as DayRecord[];
    return Array.isArray(parsed) ? parsed.slice(0, 7) : [];
  } catch {
    return [];
  }
}

function readHelper(): HelperId {
  const saved = localStorage.getItem(HELPER_KEY);
  return saved && saved in HELPERS ? (saved as HelperId) : "sleepy";
}

function saveRecord(score: number, current: DayRecord[]) {
  const day = new Date().toISOString().slice(5, 10);
  const next = [{ day, score }, ...current].slice(0, 7);
  localStorage.setItem(RECORDS_KEY, JSON.stringify(next));
  return next;
}

function collectionGoalCopy(count: number) {
  if (count >= COLLECTION_GOAL) return "오늘은 마을 장식이 가득 찼어요";
  const left = COLLECTION_GOAL - count;
  if (left === 1) return "조각 1개만 더 모으면 완성";
  if (left <= 4) return `완성까지 조각 ${left}개`;
  return `다음 장식까지 ${Math.min(4, left)}개 모으기`;
}

function nextGradeTarget(score: number) {
  return GRADE_TARGETS.find((target) => score < target.score);
}

function monsterLabel(type: DefenseState["monsters"][number]["type"]) {
  const labels = {
    common: "동그란 몬스터",
    shield: "방패 몬스터",
    fast: "빠른 몬스터",
    bonus: "반짝 보너스 몬스터",
  };
  return labels[type];
}

function monsterMark(type: DefenseState["monsters"][number]["type"]) {
  const marks = {
    common: "•",
    shield: "◇",
    fast: "»",
    bonus: "★",
  };
  return marks[type];
}

export default App;

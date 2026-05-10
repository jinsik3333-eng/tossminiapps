export type MonsterType = "common" | "shield" | "fast" | "bonus";
export type GameStatus = "ready" | "playing" | "paused" | "result";
export type ResultGrade = "완벽 방어" | "아슬아슬 방어" | "다음엔 더 잘 막기";
export type HelperId = "sleepy" | "detective" | "thief" | "ghost";
export type WavePhase = "적응" | "콤보" | "피버";

export type Monster = {
  id: string;
  type: MonsterType;
  lane: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  score: number;
  spawnedAtMs: number;
};

export type DefenseOptions = {
  helperId: HelperId;
};

export type DefenseState = {
  playId: string;
  status: GameStatus;
  durationMs: number;
  elapsedMs: number;
  hp: number;
  maxHp: number;
  lanes: number;
  monsters: Monster[];
  score: number;
  combo: number;
  maxCombo: number;
  blocked: number;
  leaked: number;
  bonusBlocked: number;
  bonusLeaked: number;
  helperId: HelperId;
  helperUsed: boolean;
  skillReady: boolean;
  skillUsed: boolean;
  nextSpawnInMs: number;
  spawnIndex: number;
};

export type ScoreBreakdown = {
  baseScore: number;
  comboBonus: number;
  hpBonus: number;
  leakPenalty: number;
  totalScore: number;
};

export type DefenseResult = {
  playId: string;
  grade: ResultGrade;
  score: number;
  blocked: number;
  leaked: number;
  bonusBlocked: number;
  bonusLeaked: number;
  helperId: HelperId;
  maxCombo: number;
  remainingHp: number;
  piece: string;
  breakdown: ScoreBreakdown;
};

export const GAME_DURATION_MS = 30_000;
export const INITIAL_HP = 5;
export const INITIAL_LANES = 3;
export const SKILL_COMBO_REQUIREMENT = 8;
export const MONSTER_LINE_Y = 84;
export const TODAY_WAVE = {
  name: "솜구름 언덕 3단계",
  short: "후반 보너스가 더 자주 와요",
  effect: "피버 구간 보너스 등장 + 점수 살짝 증가",
};

const MONSTER_META: Record<
  MonsterType,
  { hp: number; speed: number; score: number }
> = {
  common: { hp: 1, speed: 22, score: 35 },
  shield: { hp: 2, speed: 18, score: 65 },
  fast: { hp: 1, speed: 34, score: 55 },
  bonus: { hp: 1, speed: 20, score: 95 },
};

const PIECES = [
  "구름 방패 조각",
  "말랑 성벽 조각",
  "별빛 뿔피리 조각",
  "솜사탕 망토 조각",
];

export function createDefenseState(
  playId: string,
  nowMs = 0,
  options: DefenseOptions = { helperId: "sleepy" },
): DefenseState {
  return {
    playId,
    status: "ready",
    durationMs: GAME_DURATION_MS,
    elapsedMs: 0,
    hp: INITIAL_HP,
    maxHp: INITIAL_HP,
    lanes: INITIAL_LANES,
    monsters: [],
    score: 0,
    combo: 0,
    maxCombo: 0,
    blocked: 0,
    leaked: 0,
    bonusBlocked: 0,
    bonusLeaked: 0,
    helperId: options.helperId,
    helperUsed: false,
    skillReady: false,
    skillUsed: false,
    nextSpawnInMs: Math.max(120, 650 - (nowMs % 220)),
    spawnIndex: 0,
  };
}

export function startDefense(state: DefenseState): DefenseState {
  return { ...state, status: "playing" };
}

export function pauseDefense(state: DefenseState): DefenseState {
  return state.status === "playing" ? { ...state, status: "paused" } : state;
}

export function resumeDefense(state: DefenseState): DefenseState {
  return state.status === "paused" ? { ...state, status: "playing" } : state;
}

export function tickDefense(
  state: DefenseState,
  deltaMs: number,
): DefenseState {
  if (state.status !== "playing") return state;

  const safeDelta = Math.max(0, Math.min(deltaMs, 500));
  const elapsedMs = Math.min(state.durationMs, state.elapsedMs + safeDelta);
  const phase = getWavePhase(elapsedMs);
  const speedScale = 1 + (elapsedMs / state.durationMs) * 0.38;
  const moved = state.monsters.map((monster) => {
    const helperSlow =
      state.helperId === "ghost" && monster.y > 62 && monster.y < MONSTER_LINE_Y
        ? 0.88
        : 1;
    const phaseSpeed = phase === "피버" ? 1.06 : phase === "콤보" ? 1.02 : 1;
    return {
      ...monster,
      y:
        monster.y +
        monster.speed *
          speedScale *
          phaseSpeed *
          helperSlow *
          (safeDelta / 1000),
    };
  });

  const survivors: Monster[] = [];
  let leaked = state.leaked;
  let bonusLeaked = state.bonusLeaked;
  let hp = state.hp;
  let combo = state.combo;
  let helperUsed = state.helperUsed;

  moved.forEach((monster) => {
    if (monster.y >= MONSTER_LINE_Y) {
      if (state.helperId === "sleepy" && !helperUsed) {
        helperUsed = true;
        return;
      }
      if (monster.type === "bonus") bonusLeaked += 1;
      leaked += 1;
      hp = Math.max(0, hp - 1);
      combo = 0;
    } else {
      survivors.push(monster);
    }
  });

  let next: DefenseState = {
    ...state,
    elapsedMs,
    hp,
    combo,
    leaked,
    bonusLeaked,
    helperUsed,
    monsters: survivors,
    nextSpawnInMs: state.nextSpawnInMs - safeDelta,
  };

  while (
    next.status === "playing" &&
    next.nextSpawnInMs <= 0 &&
    next.monsters.length < 7
  ) {
    const spawn = createMonster(
      next.spawnIndex,
      next.elapsedMs,
      next.lanes,
      next.helperId,
    );
    next = {
      ...next,
      monsters: [...next.monsters, spawn],
      spawnIndex: next.spawnIndex + 1,
      nextSpawnInMs:
        next.nextSpawnInMs + spawnInterval(next.elapsedMs, next.helperId),
    };
  }

  if (next.hp <= 0 || next.elapsedMs >= next.durationMs) {
    return { ...next, status: "result" };
  }

  return next;
}

export function tapMonster(
  state: DefenseState,
  monsterId: string,
): DefenseState {
  if (state.status !== "playing") return state;

  const target = state.monsters.find((monster) => monster.id === monsterId);
  if (!target) return state;

  const nextMonsters = state.monsters.map((monster) =>
    monster.id === monsterId ? { ...monster, hp: monster.hp - 1 } : monster,
  );
  const damaged = nextMonsters.find((monster) => monster.id === monsterId);

  if (damaged && damaged.hp > 0) {
    return { ...state, monsters: nextMonsters, score: state.score + 5 };
  }

  const combo = state.combo + 1;
  const comboBonus = Math.min(80, Math.floor(combo / 3) * 8);
  const helperComboBonus =
    state.helperId === "thief" ? Math.floor(combo / 5) * 4 : 0;
  const waveBonus =
    getWavePhase(state.elapsedMs) === "피버" && target.type === "bonus"
      ? 15
      : 0;
  const score =
    state.score + target.score + comboBonus + helperComboBonus + waveBonus;
  const maxCombo = Math.max(state.maxCombo, combo);
  const bonusBlocked = state.bonusBlocked + (target.type === "bonus" ? 1 : 0);

  return {
    ...state,
    monsters: nextMonsters.filter((monster) => monster.hp > 0),
    score,
    combo,
    maxCombo,
    bonusBlocked,
    blocked: state.blocked + 1,
    skillReady:
      state.skillReady ||
      (!state.skillUsed && combo >= SKILL_COMBO_REQUIREMENT),
  };
}

export function missTap(state: DefenseState): DefenseState {
  if (state.status !== "playing" || state.combo === 0) return state;
  return { ...state, combo: 0 };
}

export function activateCloudShieldSkill(state: DefenseState): DefenseState {
  if (state.status !== "playing" || state.skillUsed || !state.skillReady)
    return state;

  const sorted = [...state.monsters].sort((a, b) => b.y - a.y);
  const removed = new Set(sorted.slice(0, 3).map((monster) => monster.id));
  const removedMonsters = sorted.filter((monster) => removed.has(monster.id));
  const removedScore = removedMonsters.reduce(
    (sum, monster) => sum + Math.floor(monster.score * 0.8),
    0,
  );
  const blocked = state.blocked + removed.size;
  const combo = state.combo + removed.size;

  return {
    ...state,
    monsters: state.monsters.filter((monster) => !removed.has(monster.id)),
    score: state.score + removedScore + removed.size * 20,
    combo,
    maxCombo: Math.max(state.maxCombo, combo),
    blocked,
    bonusBlocked:
      state.bonusBlocked +
      removedMonsters.filter((monster) => monster.type === "bonus").length,
    skillReady: false,
    skillUsed: true,
  };
}

export function finishDefense(state: DefenseState): DefenseResult {
  const breakdown = calculateScoreBreakdown(state);
  const score = breakdown.totalScore;

  return {
    playId: state.playId,
    grade: gradeForState(state),
    score,
    blocked: state.blocked,
    leaked: state.leaked,
    bonusBlocked: state.bonusBlocked,
    bonusLeaked: state.bonusLeaked,
    helperId: state.helperId,
    maxCombo: state.maxCombo,
    remainingHp: state.hp,
    piece: PIECES[(state.blocked + state.maxCombo + state.hp) % PIECES.length],
    breakdown,
  };
}

export function calculateScoreBreakdown(state: DefenseState): ScoreBreakdown {
  const baseScore = state.score;
  const comboBonus = state.maxCombo * 12;
  const hpBonus = state.hp * 90;
  const leakPenalty = state.leaked * 25;
  return {
    baseScore,
    comboBonus,
    hpBonus,
    leakPenalty,
    totalScore: Math.max(0, baseScore + comboBonus + hpBonus - leakPenalty),
  };
}

export function gradeForState(state: DefenseState): ResultGrade {
  if (state.hp === state.maxHp && state.elapsedMs >= state.durationMs)
    return "완벽 방어";
  if (state.hp > 0) return "아슬아슬 방어";
  return "다음엔 더 잘 막기";
}

export function getRemainingSeconds(state: DefenseState) {
  return Math.ceil(Math.max(0, state.durationMs - state.elapsedMs) / 1000);
}

export function getWavePhase(elapsedMs: number): WavePhase {
  if (elapsedMs >= 20_000) return "피버";
  if (elapsedMs >= 10_000) return "콤보";
  return "적응";
}

function createMonster(
  index: number,
  elapsedMs: number,
  lanes: number,
  helperId: HelperId,
): Monster {
  const type = pickMonsterType(index, elapsedMs, helperId);
  const meta = MONSTER_META[type];
  const lane = (index * 7 + Math.floor(elapsedMs / 1300)) % lanes;
  return {
    id: `monster-${elapsedMs}-${index}`,
    type,
    lane,
    y: -12,
    hp: meta.hp,
    maxHp: meta.hp,
    speed: meta.speed,
    score:
      type === "bonus" && getWavePhase(elapsedMs) === "피버"
        ? meta.score + 10
        : meta.score,
    spawnedAtMs: elapsedMs,
  };
}

function pickMonsterType(
  index: number,
  elapsedMs: number,
  helperId: HelperId,
): MonsterType {
  const phase = getWavePhase(elapsedMs);
  if (phase === "피버" && index % 5 === 1) return "bonus";
  if (helperId === "detective" && elapsedMs > 7_000 && index % 9 === 4)
    return "bonus";
  if (index % 11 === 8) return "bonus";
  if (elapsedMs > 8_000 && index % 5 === 2) return "shield";
  if (elapsedMs > 4_000 && index % 4 === 1) return "fast";
  return "common";
}

function spawnInterval(elapsedMs: number, helperId: HelperId) {
  const helperBoost = helperId === "detective" ? -20 : 0;
  if (elapsedMs > 22_000) return 500 + helperBoost;
  if (elapsedMs > 14_000) return 610 + helperBoost;
  if (elapsedMs > 6_000) return 760 + helperBoost;
  return 900;
}

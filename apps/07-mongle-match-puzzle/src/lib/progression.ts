import { TILE_TYPES, type TileType } from "./gameLogic.ts";

export type DifficultyStage = {
  level: number;
  label: string;
  targetScore: number;
  moves: number;
  tileTypes: TileType[];
  note: string;
};

export type StageResult = {
  stars: number;
  bestScore: number;
  bestCoinReward: number;
  lastCoinReward: number;
  plays: number;
  cleared: boolean;
};

export type StageResults = Record<number, StageResult | undefined>;

export const DIFFICULTY_STAGES: DifficultyStage[] = [
  {
    level: 1,
    label: "연습 숲",
    targetScore: 420,
    moves: 24,
    tileTypes: ["berry", "leaf", "star", "drop"],
    note: "4종 타일로 감 잡기",
  },
  {
    level: 2,
    label: "말랑 언덕",
    targetScore: 540,
    moves: 22,
    tileTypes: TILE_TYPES,
    note: "5종 타일로 진짜 매치 시작",
  },
  {
    level: 3,
    label: "반짝 협곡",
    targetScore: 660,
    moves: 20,
    tileTypes: TILE_TYPES,
    note: "목표 점수가 올라가요",
  },
  {
    level: 4,
    label: "유니크 문",
    targetScore: 780,
    moves: 18,
    tileTypes: TILE_TYPES,
    note: "이동 수가 줄어드는 챌린지",
  },
  {
    level: 5,
    label: "젤리 폭포",
    targetScore: 900,
    moves: 18,
    tileTypes: TILE_TYPES,
    note: "연쇄 점수가 중요해져요",
  },
  {
    level: 6,
    label: "캔디 동굴",
    targetScore: 1040,
    moves: 17,
    tileTypes: TILE_TYPES,
    note: "아이템 조합을 노려요",
  },
  {
    level: 7,
    label: "로켓 정원",
    targetScore: 1190,
    moves: 17,
    tileTypes: TILE_TYPES,
    note: "4매치 보상이 핵심",
  },
  {
    level: 8,
    label: "별빛 시장",
    targetScore: 1360,
    moves: 16,
    tileTypes: TILE_TYPES,
    note: "5매치로 판을 뒤집기",
  },
  {
    level: 9,
    label: "구름 실험실",
    targetScore: 1540,
    moves: 16,
    tileTypes: TILE_TYPES,
    note: "폭탄 타이밍이 중요해요",
  },
  {
    level: 10,
    label: "무지개 탑",
    targetScore: 1740,
    moves: 15,
    tileTypes: TILE_TYPES,
    note: "고득점 연쇄 챌린지",
  },
  {
    level: 11,
    label: "몽글 왕관길",
    targetScore: 1960,
    moves: 15,
    tileTypes: TILE_TYPES,
    note: "실수 없는 루트 찾기",
  },
  {
    level: 12,
    label: "마스터 문",
    targetScore: 2200,
    moves: 14,
    tileTypes: TILE_TYPES,
    note: "최종 마스터 도전",
  },
];

export function clampStageLevel(level: number): number {
  if (!Number.isFinite(level)) return 1;
  return Math.min(Math.max(Math.round(level), 1), DIFFICULTY_STAGES.length);
}

export function getStage(level: number): DifficultyStage {
  return DIFFICULTY_STAGES[clampStageLevel(level) - 1] ?? DIFFICULTY_STAGES[0];
}

export function getNextStageLevel(currentLevel: number): number {
  return clampStageLevel(currentLevel + 1);
}

export function calculateStageStars(score: number, targetScore: number): number {
  if (score < targetScore) return 0;
  if (score >= Math.ceil(targetScore * 1.55)) return 3;
  if (score >= Math.ceil(targetScore * 1.25)) return 2;
  return 1;
}

export function calculateStageCoinReward(score: number, stars: number): number {
  return Math.max(3, Math.floor(score / 180)) + stars * 4;
}

export function mergeStageResult(
  current: StageResults,
  stageLevel: number,
  score: number,
  coinReward: number,
  stars: number,
): StageResults {
  const existing = current[stageLevel];
  const nextResult: StageResult = {
    stars: Math.max(existing?.stars ?? 0, stars),
    bestScore: Math.max(existing?.bestScore ?? 0, score),
    bestCoinReward: Math.max(existing?.bestCoinReward ?? 0, coinReward),
    lastCoinReward: coinReward,
    plays: (existing?.plays ?? 0) + 1,
    cleared: Boolean(existing?.cleared || stars > 0),
  };

  return {
    ...current,
    [stageLevel]: nextResult,
  };
}

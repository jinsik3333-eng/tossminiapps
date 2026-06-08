export type TileType = "berry" | "leaf" | "star" | "drop" | "moon";

export type Tile = {
  id: string;
  type: TileType;
};

export type Position = {
  row: number;
  col: number;
};

export type BoardFloatPosition = {
  row: number;
  col: number;
};

export type MatchResult = {
  board: Tile[][];
  swappedBoard?: Tile[][];
  cascadeSteps: CascadeStep[];
  cascadeCount: number;
  matchedKeys: string[];
  matchedCount: number;
  gainedScore: number;
  hammerDelta: number;
  powerUps: PowerUpReward[];
  impact: MatchImpact;
  didMatch: boolean;
};

export const BOARD_SIZE = 6;
export const TILE_TYPES: TileType[] = ["berry", "leaf", "star", "drop", "moon"];

export type MatchLine = {
  orientation: "row" | "col";
  index: number;
  start: number;
  length: number;
  keys: string[];
};

export type MatchSquare = {
  row: number;
  col: number;
  type: TileType;
  keys: string[];
};

export type MatchAnalysis = {
  keys: Set<string>;
  lines: MatchLine[];
  squares: MatchSquare[];
  matchedCount: number;
  maxRunLength: number;
  hasBingo: boolean;
  squareCount: number;
};

export type MatchImpact = {
  kind: "basic" | "line4" | "line5" | "bingo" | "cascade" | "square";
  label: string;
  bonusScore: number;
};

export type PowerUpType = "hammer" | "rowClear" | "colClear" | "bomb" | "colorClear" | "shuffle";

export type PowerUpReward = {
  type: PowerUpType;
  count: number;
  reason: string;
};

export type MatchScore = {
  gainedScore: number;
  hammerDelta: number;
  powerUps: PowerUpReward[];
  impact: MatchImpact;
};

export type HammerResult = {
  board: Tile[][];
  clearedKeys: string[];
  gainedScore: number;
  didClear: boolean;
};

export type PowerUpResult = HammerResult & {
  powerUp: PowerUpType;
  didShuffle?: boolean;
};

export type StalemateResult = {
  board: Tile[][];
  didShuffle: boolean;
  attempts: number;
};

export type CascadeStep = {
  boardBeforeClear: Tile[][];
  boardAfterDrop: Tile[][];
  matchedKeys: string[];
  matchedCount: number;
  gainedScore: number;
  hammerDelta: number;
  powerUps: PowerUpReward[];
  impact: MatchImpact;
};

export type CascadeResolution = {
  board: Tile[][];
  steps: CascadeStep[];
  cascadeCount: number;
  matchedKeys: string[];
  matchedCount: number;
  gainedScore: number;
  hammerDelta: number;
  powerUps: PowerUpReward[];
  impact: MatchImpact;
};

const BASIC_IMPACT: MatchImpact = {
  kind: "basic",
  label: "몽글 팝",
  bonusScore: 0,
};

export type BoardOptions = {
  size?: number;
  tileTypes?: TileType[];
};

let tileId = 0;

function nextId(type: TileType) {
  tileId += 1;
  return `${type}-${tileId}`;
}

export function createTile(type?: TileType, tileTypes: TileType[] = TILE_TYPES): Tile {
  const pool = tileTypes.length > 0 ? tileTypes : TILE_TYPES;
  const resolvedType = type ?? pool[Math.floor(Math.random() * pool.length)];
  return {
    id: nextId(resolvedType),
    type: resolvedType,
  };
}

export function createBoard(options: BoardOptions = {}): Tile[][] {
  const size = options.size ?? BOARD_SIZE;
  const tileTypes = options.tileTypes ?? TILE_TYPES;
  const board = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => createTile(undefined, tileTypes)),
  );

  // 첫 화면에서 자동 매치가 너무 많이 생기지 않도록 초기 보드를 한 번 정리한다.
  let safety = 0;
  while (findMatches(board).size > 0 && safety < 20) {
    const matches = findMatches(board);
    matches.forEach((key) => {
      const [row, col] = key.split(":").map(Number);
      board[row][col] = createTile(undefined, tileTypes);
    });
    safety += 1;
  }

  return resolveStalemate(board, tileTypes).board;
}

export function areAdjacent(a: Position, b: Position) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

export function getMatchedAreaCenter(keys: string[], boardSize = BOARD_SIZE): BoardFloatPosition {
  const maxIndex = Math.max(0, boardSize - 1);
  const fallbackCenter = maxIndex / 2;
  const coordinates = keys
    .map((key) => {
      const [row, col] = key.split(":").map(Number);
      if (!Number.isFinite(row) || !Number.isFinite(col)) return null;
      return {
        row: Math.min(maxIndex, Math.max(0, row)),
        col: Math.min(maxIndex, Math.max(0, col)),
      };
    })
    .filter((coordinate): coordinate is BoardFloatPosition => coordinate !== null);

  if (coordinates.length === 0) {
    return { row: fallbackCenter, col: fallbackCenter };
  }

  const total = coordinates.reduce(
    (sum, coordinate) => ({
      row: sum.row + coordinate.row,
      col: sum.col + coordinate.col,
    }),
    { row: 0, col: 0 },
  );

  return {
    row: Number((total.row / coordinates.length).toFixed(3)),
    col: Number((total.col / coordinates.length).toFixed(3)),
  };
}

export function swapTiles(board: Tile[][], a: Position, b: Position): Tile[][] {
  const next = cloneBoard(board);
  const temp = next[a.row][a.col];
  next[a.row][a.col] = next[b.row][b.col];
  next[b.row][b.col] = temp;
  return next;
}

export function resolveMove(board: Tile[][], from: Position, to: Position, tileTypes: TileType[] = TILE_TYPES): MatchResult {
  if (!areAdjacent(from, to)) {
    return {
      board,
      cascadeSteps: [],
      cascadeCount: 0,
      matchedKeys: [],
      matchedCount: 0,
      gainedScore: 0,
      hammerDelta: 0,
      powerUps: [],
      impact: BASIC_IMPACT,
      didMatch: false,
    };
  }

  const swapped = swapTiles(board, from, to);
  const analysis = analyzeMatches(swapped);
  const matches = analysis.keys;

  if (matches.size === 0) {
    return {
      board,
      swappedBoard: swapped,
      cascadeSteps: [],
      cascadeCount: 0,
      matchedKeys: [],
      matchedCount: 0,
      gainedScore: 0,
      hammerDelta: 0,
      powerUps: [],
      impact: BASIC_IMPACT,
      didMatch: false,
    };
  }

  const resolved = resolveCascadingMatches(swapped, tileTypes);

  return {
    board: resolved.board,
    swappedBoard: swapped,
    cascadeSteps: resolved.steps,
    cascadeCount: resolved.cascadeCount,
    matchedKeys: resolved.matchedKeys,
    matchedCount: resolved.matchedCount,
    gainedScore: resolved.gainedScore,
    hammerDelta: resolved.hammerDelta,
    powerUps: resolved.powerUps,
    impact: resolved.impact,
    didMatch: true,
  };
}

export function scoreForMatchCount(count: number) {
  if (count >= 5) return 100 + (count - 5) * 25;
  if (count === 4) return 60;
  return count >= 3 ? 30 : 0;
}

export function findMatches(board: Tile[][]): Set<string> {
  return analyzeMatches(board).keys;
}

export function hasAvailableMove(board: Tile[][]): boolean {
  const size = board.length;

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const current = board[row][col];
      const right = board[row][col + 1];
      const down = board[row + 1]?.[col];

      if (right && current.type !== right.type && findMatches(swapTiles(board, { row, col }, { row, col: col + 1 })).size > 0) {
        return true;
      }

      if (down && current.type !== down.type && findMatches(swapTiles(board, { row, col }, { row: row + 1, col })).size > 0) {
        return true;
      }
    }
  }

  return false;
}

export function analyzeMatches(board: Tile[][]): MatchAnalysis {
  const matched = new Set<string>();
  const lines: MatchLine[] = [];
  const squares: MatchSquare[] = [];
  const size = board.length;

  for (let row = 0; row < size; row += 1) {
    let runStart = 0;
    for (let col = 1; col <= size; col += 1) {
      const current = board[row][col]?.type;
      const previous = board[row][col - 1]?.type;
      if (current !== previous) {
        const runLength = col - runStart;
        if (runLength >= 3) {
          const keys: string[] = [];
          for (let c = runStart; c < col; c += 1) {
            const key = `${row}:${c}`;
            keys.push(key);
            matched.add(key);
          }
          lines.push({ orientation: "row", index: row, start: runStart, length: runLength, keys });
        }
        runStart = col;
      }
    }
  }

  for (let col = 0; col < size; col += 1) {
    let runStart = 0;
    for (let row = 1; row <= size; row += 1) {
      const current = board[row]?.[col]?.type;
      const previous = board[row - 1]?.[col]?.type;
      if (current !== previous) {
        const runLength = row - runStart;
        if (runLength >= 3) {
          const keys: string[] = [];
          for (let r = runStart; r < row; r += 1) {
            const key = `${r}:${col}`;
            keys.push(key);
            matched.add(key);
          }
          lines.push({ orientation: "col", index: col, start: runStart, length: runLength, keys });
        }
        runStart = row;
      }
    }
  }

  for (let row = 0; row < size - 1; row += 1) {
    for (let col = 0; col < size - 1; col += 1) {
      const type = board[row][col]?.type;
      if (
        type &&
        board[row][col + 1]?.type === type &&
        board[row + 1]?.[col]?.type === type &&
        board[row + 1]?.[col + 1]?.type === type
      ) {
        const keys = [`${row}:${col}`, `${row}:${col + 1}`, `${row + 1}:${col}`, `${row + 1}:${col + 1}`];
        keys.forEach((key) => matched.add(key));
        squares.push({ row, col, type, keys });
      }
    }
  }

  const rowKeys = new Set(lines.filter((line) => line.orientation === "row").flatMap((line) => line.keys));
  const colKeys = new Set(lines.filter((line) => line.orientation === "col").flatMap((line) => line.keys));
  const hasBingo = [...rowKeys].some((key) => colKeys.has(key));

  return {
    keys: matched,
    lines,
    squares,
    matchedCount: matched.size,
    maxRunLength: lines.reduce((max, line) => Math.max(max, line.length), 0),
    hasBingo,
    squareCount: squares.length,
  };
}

export function scoreForMatchAnalysis(analysis: MatchAnalysis): MatchScore {
  const powerUps = getPowerUpRewards(analysis);

  if (analysis.matchedCount < 3) {
    return {
      gainedScore: 0,
      hammerDelta: 0,
      powerUps: [],
      impact: BASIC_IMPACT,
    };
  }

  if (analysis.hasBingo) {
    return {
      gainedScore: 180 + Math.max(0, analysis.matchedCount - 5) * 30,
      hammerDelta: powerUps.filter((item) => item.type === "hammer").reduce((total, item) => total + item.count, 0),
      powerUps,
      impact: {
        kind: "bingo",
        label: "가로세로 빙고",
        bonusScore: 90,
      },
    };
  }

  if (analysis.maxRunLength >= 5) {
    return {
      gainedScore: 150 + Math.max(0, analysis.matchedCount - 5) * 25,
      hammerDelta: 0,
      powerUps,
      impact: {
        kind: "line5",
        label: "5연속 대폭발",
        bonusScore: 50,
      },
    };
  }

  if (analysis.maxRunLength === 4) {
    return {
      gainedScore: 90 + Math.max(0, analysis.matchedCount - 4) * 20,
      hammerDelta: 0,
      powerUps,
      impact: {
        kind: "line4",
        label: "4연속 팡",
        bonusScore: 30,
      },
    };
  }

  if (analysis.squareCount > 0) {
    return {
      gainedScore: 120 + Math.max(0, analysis.matchedCount - 4) * 20,
      hammerDelta: 0,
      powerUps,
      impact: {
        kind: "square",
        label: "2x2 폭탄 팡",
        bonusScore: 60,
      },
    };
  }

  return {
    gainedScore: scoreForMatchCount(analysis.matchedCount),
    hammerDelta: 0,
    powerUps,
    impact: BASIC_IMPACT,
  };
}

function getPowerUpRewards(analysis: MatchAnalysis): PowerUpReward[] {
  const rewardByType = new Map<PowerUpType, PowerUpReward>();

  function addReward(type: PowerUpType, count: number, reason: string) {
    if (count <= 0) return;
    const current = rewardByType.get(type);
    if (current) {
      rewardByType.set(type, {
        ...current,
        count: current.count + count,
        reason: `${current.reason}, ${reason}`,
      });
      return;
    }
    rewardByType.set(type, { type, count, reason });
  }

  analysis.lines.forEach((line) => {
    if (line.length >= 5) {
      addReward("colorClear", 1, "5연속");
      return;
    }

    if (line.length === 4) {
      addReward(line.orientation === "row" ? "rowClear" : "colClear", 1, line.orientation === "row" ? "가로 4연속" : "세로 4연속");
    }
  });

  addReward("bomb", analysis.squareCount, "2x2");

  if (analysis.hasBingo) {
    addReward("hammer", 1, "가로세로 빙고");
  }

  return Array.from(rewardByType.values());
}

export function resolveCascadingMatches(board: Tile[][], tileTypes: TileType[] = TILE_TYPES): CascadeResolution {
  const steps: CascadeStep[] = [];
  let currentBoard = cloneBoard(board);
  let safety = 0;

  while (safety < 8) {
    const analysis = analyzeMatches(currentBoard);
    if (analysis.keys.size === 0) break;

    const score = scoreForMatchAnalysis(analysis);
    const matchedKeys = Array.from(analysis.keys);
    const boardBeforeClear = cloneBoard(currentBoard);
    const boardAfterDrop = dropAndFill(currentBoard, analysis.keys, tileTypes);

    steps.push({
      boardBeforeClear,
      boardAfterDrop,
      matchedKeys,
      matchedCount: analysis.matchedCount,
      gainedScore: score.gainedScore,
      hammerDelta: score.hammerDelta,
      powerUps: score.powerUps,
      impact: score.impact,
    });

    currentBoard = boardAfterDrop;
    safety += 1;
  }

  return summarizeCascade(currentBoard, steps);
}

function summarizeCascade(board: Tile[][], steps: CascadeStep[]): CascadeResolution {
  const cascadeBonus = steps.length > 1 ? (steps.length - 1) * 20 : 0;
  const matchedCount = steps.reduce((total, step) => total + step.matchedCount, 0);
  const gainedScore = steps.reduce((total, step) => total + step.gainedScore, 0) + cascadeBonus;
  const hammerDelta = steps.reduce((total, step) => total + step.hammerDelta, 0);
  const powerUps = mergePowerUpRewards(steps.flatMap((step) => step.powerUps));
  const fallbackImpact = steps[0]?.impact ?? BASIC_IMPACT;

  return {
    board,
    steps,
    cascadeCount: steps.length,
    matchedKeys: steps.flatMap((step) => step.matchedKeys),
    matchedCount,
    gainedScore,
    hammerDelta,
    powerUps,
    impact:
      steps.length > 1
        ? {
            kind: "cascade",
            label: `연쇄 팡 x${steps.length}`,
            bonusScore: cascadeBonus,
          }
        : fallbackImpact,
  };
}

function mergePowerUpRewards(rewards: PowerUpReward[]): PowerUpReward[] {
  const rewardByType = new Map<PowerUpType, PowerUpReward>();

  rewards.forEach((reward) => {
    const current = rewardByType.get(reward.type);
    if (!current) {
      rewardByType.set(reward.type, { ...reward });
      return;
    }
    rewardByType.set(reward.type, {
      ...current,
      count: current.count + reward.count,
      reason: `${current.reason}, ${reward.reason}`,
    });
  });

  return Array.from(rewardByType.values());
}

export function resolveHammer(board: Tile[][], position: Position, tileTypes: TileType[] = TILE_TYPES): HammerResult {
  const result = resolvePowerUp(board, "hammer", position, tileTypes);

  return {
    board: result.board,
    clearedKeys: result.clearedKeys,
    gainedScore: result.gainedScore,
    didClear: result.didClear,
  };
}

export function resolvePowerUp(
  board: Tile[][],
  powerUp: PowerUpType,
  position?: Position,
  tileTypes: TileType[] = TILE_TYPES,
): PowerUpResult {
  if (powerUp === "shuffle") {
    const shuffled = shufflePlayableBoard(board, tileTypes);
    return {
      board: shuffled.board,
      clearedKeys: [],
      gainedScore: 0,
      didClear: shuffled.didShuffle,
      didShuffle: shuffled.didShuffle,
      powerUp,
    };
  }

  if (!position || !board[position.row]?.[position.col]) {
    return {
      board,
      clearedKeys: [],
      gainedScore: 0,
      didClear: false,
      powerUp,
    };
  }

  const clearedKeys = getPowerUpClearedKeys(board, powerUp, position);
  if (clearedKeys.length === 0) {
    return {
      board,
      clearedKeys,
      gainedScore: 0,
      didClear: false,
      powerUp,
    };
  }

  const resolved = dropAndFill(board, new Set(clearedKeys), tileTypes);

  return {
    board: resolved,
    clearedKeys,
    gainedScore: getPowerUpScore(powerUp, clearedKeys.length),
    didClear: true,
    powerUp,
  };
}

function getPowerUpClearedKeys(board: Tile[][], powerUp: PowerUpType, position: Position): string[] {
  const size = board.length;

  if (powerUp === "hammer") {
    return [keyFor(position.row, position.col)];
  }

  if (powerUp === "rowClear") {
    return Array.from({ length: size }, (_, col) => keyFor(position.row, col));
  }

  if (powerUp === "colClear") {
    return Array.from({ length: size }, (_, row) => keyFor(row, position.col));
  }

  if (powerUp === "bomb") {
    const keys: string[] = [];
    for (let row = Math.max(0, position.row - 1); row <= Math.min(size - 1, position.row + 1); row += 1) {
      for (let col = Math.max(0, position.col - 1); col <= Math.min(size - 1, position.col + 1); col += 1) {
        keys.push(keyFor(row, col));
      }
    }
    return keys;
  }

  if (powerUp === "colorClear") {
    const targetType = board[position.row][position.col].type;
    return board.flatMap((row, rowIndex) =>
      row.map((tile, colIndex) => (tile.type === targetType ? keyFor(rowIndex, colIndex) : "")).filter(Boolean),
    );
  }

  return [];
}

function getPowerUpScore(powerUp: PowerUpType, clearedCount: number): number {
  if (powerUp === "hammer") return 20;
  if (powerUp === "bomb") return clearedCount * 24 + 24;
  if (powerUp === "colorClear") return clearedCount * 24 + 40;
  if (powerUp === "rowClear" || powerUp === "colClear") return clearedCount * 22 + 20;
  return 0;
}

export function resolveStalemate(board: Tile[][], tileTypes: TileType[] = TILE_TYPES): StalemateResult {
  if (findMatches(board).size > 0 || hasAvailableMove(board)) {
    return {
      board,
      didShuffle: false,
      attempts: 0,
    };
  }

  for (let attempt = 1; attempt <= 80; attempt += 1) {
    const candidate = shuffleBoardTiles(board);
    if (isPlayableBoard(candidate)) {
      return {
        board: candidate,
        didShuffle: true,
        attempts: attempt,
      };
    }
  }

  for (let attempt = 81; attempt <= 140; attempt += 1) {
    const candidate = createFreshBoardCandidate(board.length, tileTypes);
    if (isPlayableBoard(candidate)) {
      return {
        board: candidate,
        didShuffle: true,
        attempts: attempt,
      };
    }
  }

  return {
    board: createFallbackPlayableBoard(board.length, tileTypes),
    didShuffle: true,
    attempts: 141,
  };
}

export function shufflePlayableBoard(board: Tile[][], tileTypes: TileType[] = TILE_TYPES): StalemateResult {
  for (let attempt = 1; attempt <= 80; attempt += 1) {
    const candidate = shuffleBoardTiles(board);
    if (isPlayableBoard(candidate)) {
      return {
        board: candidate,
        didShuffle: true,
        attempts: attempt,
      };
    }
  }

  for (let attempt = 81; attempt <= 140; attempt += 1) {
    const candidate = createFreshBoardCandidate(board.length, tileTypes);
    if (isPlayableBoard(candidate)) {
      return {
        board: candidate,
        didShuffle: true,
        attempts: attempt,
      };
    }
  }

  return {
    board: createFallbackPlayableBoard(board.length, tileTypes),
    didShuffle: true,
    attempts: 141,
  };
}

function dropAndFill(board: Tile[][], matches: Set<string>, tileTypes: TileType[] = TILE_TYPES) {
  const size = board.length;
  const next = cloneBoard(board);

  for (let col = 0; col < size; col += 1) {
    const survivors: Tile[] = [];

    for (let row = size - 1; row >= 0; row -= 1) {
      if (!matches.has(`${row}:${col}`)) {
        survivors.unshift(next[row][col]);
      }
    }

    const missing = size - survivors.length;
    const fillers = Array.from({ length: missing }, () => createTile(undefined, tileTypes));
    const column = [...fillers, ...survivors];

    for (let row = 0; row < size; row += 1) {
      next[row][col] = column[row];
    }
  }

  return next;
}

function isPlayableBoard(board: Tile[][]): boolean {
  return findMatches(board).size === 0 && hasAvailableMove(board);
}

function shuffleBoardTiles(board: Tile[][]): Tile[][] {
  const size = board.length;
  const tiles = board.flat().map((tile) => ({ ...tile }));

  for (let index = tiles.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const temp = tiles[index];
    tiles[index] = tiles[swapIndex];
    tiles[swapIndex] = temp;
  }

  return Array.from({ length: size }, (_, row) => tiles.slice(row * size, row * size + size));
}

function createFreshBoardCandidate(size: number, tileTypes: TileType[] = TILE_TYPES): Tile[][] {
  const board = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => createTile(undefined, tileTypes)),
  );
  let safety = 0;

  while (findMatches(board).size > 0 && safety < 20) {
    const matches = findMatches(board);
    matches.forEach((key) => {
      const [row, col] = key.split(":").map(Number);
      board[row][col] = createTile(undefined, tileTypes);
    });
    safety += 1;
  }

  return board;
}

function createFallbackPlayableBoard(size: number, tileTypes: TileType[] = TILE_TYPES): Tile[][] {
  const pool = tileTypes.length >= 4 ? tileTypes : TILE_TYPES;
  const pattern = [
    [0, 1, 2, 0, 1, 2],
    [3, 3, 1, 3, 0, 2],
    [0, 2, 0, 1, 2, 3],
    [0, 1, 1, 2, 3, 0],
    [1, 0, 3, 0, 1, 2],
    [2, 1, 0, 3, 0, 1],
  ];

  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => createTile(pool[pattern[row % pattern.length][col % pattern[0].length] % pool.length], pool)),
  );
}

function keyFor(row: number, col: number) {
  return `${row}:${col}`;
}

function cloneBoard(board: Tile[][]): Tile[][] {
  return board.map((row) => row.map((tile) => ({ ...tile })));
}

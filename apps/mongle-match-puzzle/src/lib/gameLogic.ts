export type TileType = "berry" | "leaf" | "star" | "drop" | "moon";

export type Tile = {
  id: string;
  type: TileType;
};

export type Position = {
  row: number;
  col: number;
};

export type MatchResult = {
  board: Tile[][];
  swappedBoard?: Tile[][];
  matchedKeys: string[];
  matchedCount: number;
  gainedScore: number;
  didMatch: boolean;
};

export const BOARD_SIZE = 6;
export const TILE_TYPES: TileType[] = ["berry", "leaf", "star", "drop", "moon"];

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

  return board;
}

export function areAdjacent(a: Position, b: Position) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
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
      matchedKeys: [],
      matchedCount: 0,
      gainedScore: 0,
      didMatch: false,
    };
  }

  const swapped = swapTiles(board, from, to);
  const matches = findMatches(swapped);

  if (matches.size === 0) {
    return {
      board,
      swappedBoard: swapped,
      matchedKeys: [],
      matchedCount: 0,
      gainedScore: 0,
      didMatch: false,
    };
  }

  const resolved = dropAndFill(swapped, matches, tileTypes);
  const matchedCount = matches.size;

  return {
    board: resolved,
    swappedBoard: swapped,
    matchedKeys: Array.from(matches),
    matchedCount,
    gainedScore: scoreForMatchCount(matchedCount),
    didMatch: true,
  };
}

export function scoreForMatchCount(count: number) {
  if (count >= 5) return 100 + (count - 5) * 25;
  if (count === 4) return 60;
  return count >= 3 ? 30 : 0;
}

export function findMatches(board: Tile[][]): Set<string> {
  const matched = new Set<string>();
  const size = board.length;

  for (let row = 0; row < size; row += 1) {
    let runStart = 0;
    for (let col = 1; col <= size; col += 1) {
      const current = board[row][col]?.type;
      const previous = board[row][col - 1]?.type;
      if (current !== previous) {
        const runLength = col - runStart;
        if (runLength >= 3) {
          for (let c = runStart; c < col; c += 1) {
            matched.add(`${row}:${c}`);
          }
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
          for (let r = runStart; r < row; r += 1) {
            matched.add(`${r}:${col}`);
          }
        }
        runStart = row;
      }
    }
  }

  return matched;
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

function cloneBoard(board: Tile[][]): Tile[][] {
  return board.map((row) => row.map((tile) => ({ ...tile })));
}

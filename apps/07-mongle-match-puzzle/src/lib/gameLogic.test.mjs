import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  analyzeMatches,
  findMatches,
  getMatchedAreaCenter,
  hasAvailableMove,
  resolvePowerUp,
  resolveHammer,
  resolveMove,
  resolveStalemate,
  scoreForMatchAnalysis,
} from "./gameLogic.ts";
import {
  DIFFICULTY_STAGES,
  calculateStageCoinReward,
  calculateStageStars,
  getNextStageLevel,
} from "./progression.ts";

let tileSeed = 0;

function tile(type) {
  tileSeed += 1;
  return { id: `${type}-test-${tileSeed}`, type };
}

function boardFromTypes(rows) {
  return rows.map((row) => row.map(tile));
}

function withRandomSequence(sequence, callback) {
  const originalRandom = Math.random;
  let index = 0;
  Math.random = () => {
    const value = sequence[index % sequence.length];
    index += 1;
    return value;
  };

  try {
    return callback();
  } finally {
    Math.random = originalRandom;
  }
}

describe("match bonus scoring", () => {
  test("4-match grants a stronger score impact than a normal 3-match", () => {
    const board = boardFromTypes([
      ["berry", "berry", "berry", "berry", "leaf", "star"],
      ["leaf", "star", "drop", "moon", "berry", "leaf"],
      ["star", "drop", "moon", "berry", "leaf", "star"],
      ["drop", "moon", "berry", "leaf", "star", "drop"],
      ["moon", "berry", "leaf", "star", "drop", "moon"],
      ["berry", "leaf", "star", "drop", "moon", "berry"],
    ]);

    const analysis = analyzeMatches(board);
    const score = scoreForMatchAnalysis(analysis);

    assert.equal(analysis.maxRunLength, 4);
    assert.equal(score.impact.kind, "line4");
    assert.equal(score.gainedScore, 90);
    assert.equal(score.hammerDelta, 0);
    assert.equal(score.powerUps.some((item) => item.type === "rowClear"), true);
  });

  test("5-match grants the top line bonus without awarding a hammer", () => {
    const board = boardFromTypes([
      ["star", "star", "star", "star", "star", "berry"],
      ["leaf", "drop", "moon", "berry", "leaf", "star"],
      ["drop", "moon", "berry", "leaf", "star", "drop"],
      ["moon", "berry", "leaf", "star", "drop", "moon"],
      ["berry", "leaf", "star", "drop", "moon", "berry"],
      ["leaf", "star", "drop", "moon", "berry", "leaf"],
    ]);

    const analysis = analyzeMatches(board);
    const score = scoreForMatchAnalysis(analysis);

    assert.equal(analysis.maxRunLength, 5);
    assert.equal(score.impact.kind, "line5");
    assert.equal(score.gainedScore, 150);
    assert.equal(score.hammerDelta, 0);
    assert.equal(score.powerUps.some((item) => item.type === "colorClear"), true);
  });

  test("horizontal and vertical bingo grants a hammer item", () => {
    const board = boardFromTypes([
      ["leaf", "star", "drop", "moon", "berry", "leaf"],
      ["star", "drop", "berry", "leaf", "star", "drop"],
      ["drop", "berry", "berry", "berry", "moon", "star"],
      ["moon", "leaf", "berry", "star", "drop", "moon"],
      ["berry", "star", "drop", "moon", "leaf", "berry"],
      ["leaf", "drop", "moon", "berry", "star", "leaf"],
    ]);

    const analysis = analyzeMatches(board);
    const score = scoreForMatchAnalysis(analysis);

    assert.equal(analysis.hasBingo, true);
    assert.equal(score.impact.kind, "bingo");
    assert.equal(score.hammerDelta, 1);
    assert.equal(score.gainedScore, 180);
    assert.equal(score.powerUps.some((item) => item.type === "hammer"), true);
  });

  test("vertical 4-match grants a column clear item", () => {
    const board = boardFromTypes([
      ["berry", "leaf", "star", "drop", "moon", "berry"],
      ["berry", "star", "drop", "moon", "leaf", "star"],
      ["berry", "drop", "moon", "leaf", "star", "drop"],
      ["berry", "moon", "leaf", "star", "drop", "moon"],
      ["leaf", "berry", "star", "drop", "moon", "leaf"],
      ["star", "leaf", "drop", "moon", "berry", "star"],
    ]);

    const score = scoreForMatchAnalysis(analyzeMatches(board));

    assert.equal(score.impact.kind, "line4");
    assert.equal(score.powerUps.some((item) => item.type === "colClear"), true);
  });

  test("2x2 square grants a bomb item and clears as a match", () => {
    const board = boardFromTypes([
      ["berry", "berry", "star", "drop", "moon", "leaf"],
      ["berry", "berry", "drop", "moon", "leaf", "star"],
      ["star", "drop", "moon", "leaf", "star", "drop"],
      ["drop", "moon", "leaf", "star", "drop", "moon"],
      ["moon", "leaf", "star", "drop", "moon", "berry"],
      ["leaf", "star", "drop", "moon", "berry", "leaf"],
    ]);

    const analysis = analyzeMatches(board);
    const score = scoreForMatchAnalysis(analysis);

    assert.equal(analysis.squareCount, 1);
    assert.equal(analysis.matchedCount, 4);
    assert.equal(score.powerUps.some((item) => item.type === "bomb"), true);
  });
});

describe("hammer item", () => {
  test("hammer removes one selected tile and refills the board", () => {
    const board = boardFromTypes([
      ["leaf", "star", "drop", "moon", "berry", "leaf"],
      ["star", "drop", "moon", "berry", "leaf", "star"],
      ["drop", "moon", "berry", "leaf", "star", "drop"],
      ["moon", "berry", "leaf", "star", "drop", "moon"],
      ["berry", "leaf", "star", "drop", "moon", "berry"],
      ["leaf", "star", "drop", "moon", "berry", "leaf"],
    ]);
    const target = board[2][2];

    const result = resolveHammer(board, { row: 2, col: 2 }, ["berry"]);
    const remainingIds = new Set(result.board.flat().map((item) => item.id));

    assert.equal(result.didClear, true);
    assert.deepEqual(result.clearedKeys, ["2:2"]);
    assert.equal(result.gainedScore, 20);
    assert.equal(result.board.length, 6);
    assert.equal(result.board.every((row) => row.length === 6), true);
    assert.equal(remainingIds.has(target.id), false);
  });
});

describe("power-up items", () => {
  test("line clear item removes the selected row", () => {
    const board = boardFromTypes([
      ["leaf", "star", "drop", "moon", "berry", "leaf"],
      ["star", "drop", "moon", "berry", "leaf", "star"],
      ["drop", "moon", "berry", "leaf", "star", "drop"],
      ["moon", "berry", "leaf", "star", "drop", "moon"],
      ["berry", "leaf", "star", "drop", "moon", "berry"],
      ["leaf", "star", "drop", "moon", "berry", "leaf"],
    ]);
    const removedIds = new Set(board[3].map((item) => item.id));

    const result = resolvePowerUp(board, "rowClear", { row: 3, col: 2 }, ["berry"]);
    const remainingIds = new Set(result.board.flat().map((item) => item.id));

    assert.equal(result.didClear, true);
    assert.equal(result.clearedKeys.length, 6);
    assert.equal([...removedIds].some((id) => remainingIds.has(id)), false);
  });

  test("color clear item removes all tiles with the selected type", () => {
    const board = boardFromTypes([
      ["leaf", "star", "drop", "moon", "berry", "leaf"],
      ["star", "drop", "moon", "berry", "leaf", "star"],
      ["drop", "moon", "berry", "leaf", "star", "drop"],
      ["moon", "berry", "leaf", "star", "drop", "moon"],
      ["berry", "leaf", "star", "drop", "moon", "berry"],
      ["leaf", "star", "drop", "moon", "berry", "leaf"],
    ]);
    const targetType = board[0][0].type;
    const targetIds = new Set(board.flat().filter((item) => item.type === targetType).map((item) => item.id));

    const result = resolvePowerUp(board, "colorClear", { row: 0, col: 0 }, ["star"]);
    const remainingIds = new Set(result.board.flat().map((item) => item.id));

    assert.equal(result.didClear, true);
    assert.equal(result.clearedKeys.length, targetIds.size);
    assert.equal([...targetIds].some((id) => remainingIds.has(id)), false);
  });
});

describe("cascade matches", () => {
  test("resolveMove clears a new 3-match that forms after tiles fall", () => {
    const board = boardFromTypes([
      ["leaf", "star", "drop", "berry", "leaf", "star"],
      ["moon", "moon", "star", "moon", "berry", "drop"],
      ["leaf", "drop", "berry", "star", "drop", "moon"],
      ["leaf", "berry", "star", "drop", "moon", "leaf"],
      ["star", "leaf", "moon", "berry", "star", "drop"],
      ["drop", "star", "leaf", "moon", "berry", "star"],
    ]);

    const result = withRandomSequence([0, 0.26, 0.51, 0.76], () =>
      resolveMove(board, { row: 1, col: 2 }, { row: 1, col: 3 }, ["berry", "star", "drop", "moon"]),
    );

    assert.equal(result.didMatch, true);
    assert.equal(result.cascadeCount, 2);
    assert.equal(result.cascadeSteps.length, 2);
    assert.deepEqual(result.cascadeSteps[0].matchedKeys.toSorted(), ["1:0", "1:1", "1:2"]);
    assert.equal(result.cascadeSteps[1].matchedKeys.includes("1:0"), true);
    assert.equal(result.cascadeSteps[1].matchedKeys.includes("2:0"), true);
    assert.equal(result.cascadeSteps[1].matchedKeys.includes("3:0"), true);
    assert.equal(result.matchedCount, 6);
    assert.equal(result.impact.kind, "cascade");
    assert.equal(result.gainedScore, 80);
    assert.equal(findMatches(result.board).size, 0);
  });
});

describe("match feedback position", () => {
  test("matched area center follows the cleared tile cluster", () => {
    assert.deepEqual(getMatchedAreaCenter(["1:1", "1:2", "1:3"]), { row: 1, col: 2 });
    assert.deepEqual(getMatchedAreaCenter(["0:0", "0:1", "1:0", "1:1"]), { row: 0.5, col: 0.5 });
  });

  test("empty matched keys fall back to the middle of the board", () => {
    assert.deepEqual(getMatchedAreaCenter([]), { row: 2.5, col: 2.5 });
  });
});

describe("stalemate shuffle", () => {
  test("resolveStalemate shuffles a board with no available match moves", () => {
    const stuckBoard = boardFromTypes([
      ["berry", "star", "moon", "berry", "drop", "star"],
      ["berry", "leaf", "berry", "drop", "leaf", "berry"],
      ["star", "leaf", "moon", "moon", "star", "berry"],
      ["star", "berry", "star", "berry", "leaf", "star"],
      ["moon", "berry", "drop", "moon", "moon", "drop"],
      ["leaf", "leaf", "star", "berry", "moon", "berry"],
    ]);

    assert.equal(findMatches(stuckBoard).size, 0);
    assert.equal(hasAvailableMove(stuckBoard), false);

    const result = withRandomSequence([0, 0.24, 0.48, 0.72, 0.96], () =>
      resolveStalemate(stuckBoard, ["berry", "leaf", "star", "drop", "moon"]),
    );

    assert.equal(result.didShuffle, true);
    assert.equal(result.board.length, 6);
    assert.equal(result.board.every((row) => row.length === 6), true);
    assert.equal(findMatches(result.board).size, 0);
    assert.equal(hasAvailableMove(result.board), true);
  });
});

describe("stage progression rewards", () => {
  test("game has a longer difficulty ladder beyond level 4", () => {
    assert.equal(DIFFICULTY_STAGES.length, 12);
    assert.equal(DIFFICULTY_STAGES[0].level, 1);
    assert.equal(DIFFICULTY_STAGES.at(-1).level, 12);
    assert.equal(DIFFICULTY_STAGES[4].targetScore > DIFFICULTY_STAGES[3].targetScore, true);
    assert.equal(DIFFICULTY_STAGES[4].moves <= DIFFICULTY_STAGES[3].moves, true);
  });

  test("stage stars reflect how strongly the target was cleared", () => {
    assert.equal(calculateStageStars(419, 420), 0);
    assert.equal(calculateStageStars(420, 420), 1);
    assert.equal(calculateStageStars(525, 420), 2);
    assert.equal(calculateStageStars(651, 420), 3);
  });

  test("stage coin reward grows with stars and score", () => {
    const oneStarReward = calculateStageCoinReward(420, 1);
    const threeStarReward = calculateStageCoinReward(651, 3);

    assert.equal(oneStarReward >= 5, true);
    assert.equal(threeStarReward > oneStarReward, true);
  });

  test("next stage advances until the final stage and then stays capped", () => {
    assert.equal(getNextStageLevel(4), 5);
    assert.equal(getNextStageLevel(12), 12);
  });
});

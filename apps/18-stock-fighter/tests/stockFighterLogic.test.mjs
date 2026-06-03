import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  FIGHTERS,
  MINI_GAME_SECONDS,
  MINI_GAME_BASE_INPUT_WINDOW_MS,
  MISS_LIMIT,
  QUIZ_QUESTIONS,
  applyQuizAnswer,
  claimEndingRandomFighterReward,
  completeRewardedAd,
  createAppState,
  createMiniGameState,
  finishMiniGame,
  getChaseActorIndexes,
  getDifficultyCounts,
  getQuestionChoices,
  getQuizBattleCry,
  resolveCandleInput,
  tickMiniGame,
  unlockRandomHiddenFighter,
} from "../src/lib/stockFighterLogic.mjs";

describe("stock fighter content rules", () => {
  it("keeps the quiz bank at 40/30/30 across 100 questions", () => {
    assert.equal(QUIZ_QUESTIONS.length, 100);
    assert.deepEqual(getDifficultyCounts(QUIZ_QUESTIONS), {
      beginner: 40,
      intermediate: 30,
      advanced: 30,
    });
  });

  it("ships 20 fighters with only the main fighter unlocked by default", () => {
    assert.equal(FIGHTERS.length, 20);
    assert.deepEqual(
      FIGHTERS.filter((fighter) => fighter.unlockedDefault).map(
        (fighter) => fighter.name,
      ),
      ["개미 파이터"],
    );
  });

  it("does not put forbidden public-figure or franchise strings in shipped data", () => {
    const forbidden = [
      "Street" + " Fighter",
      "Chun" + "-Li",
      "트" + "럼프",
      "주" + "커버그",
      "머" + "스크",
      "베" + "이조스",
      "젠" + "슨황",
      "삼" + "성전자",
      "하" + "이닉스",
      ["매수", "\uCD94\uCC9C"].join(" "),
      ["매도", "\uCD94\uCC9C"].join(" "),
    ];
    const payload = JSON.stringify({ FIGHTERS, QUIZ_QUESTIONS });

    for (const term of forbidden) {
      assert.equal(payload.includes(term), false, term);
    }
  });

  it("presents correct quiz answers in mixed button positions", () => {
    const correctPositions = QUIZ_QUESTIONS.map((question) =>
      getQuestionChoices(question).findIndex(
        (choice) => choice.originalIndex === question.answerIndex,
      ),
    );

    assert.ok(correctPositions.every((position) => position >= 0));
    assert.ok(new Set(correctPositions).size > 1);
    assert.ok(correctPositions.some((position) => position !== 0));
  });

  it("changes the ant battle cry every two answered questions", () => {
    assert.equal(getQuizBattleCry(0), "단, 한 주도 뺏기지 마라!");
    assert.equal(getQuizBattleCry(1), "단, 한 주도 뺏기지 마라!");
    assert.equal(getQuizBattleCry(2), "개미의 힘을 보여줘!");
    assert.equal(getQuizBattleCry(3), "개미의 힘을 보여줘!");
  });

  it("describes fighters as characters instead of advertising hidden skills", () => {
    const hoodie = FIGHTERS.find((fighter) => fighter.id === "hoodie-social-king");
    assert.equal(hoodie.signature, "타임라인 과몰입러");
    assert.equal(hoodie.effect, "좋아요는 잘 누르지만 손절 버튼은 늘 못 찾는다.");

    const payload = JSON.stringify(FIGHTERS);
    for (const term of [
      "자동 판정",
      "오답 1회",
      "실수 1회",
      "보너스 점수",
      "판정 시간",
      "추격자 거리",
      "점수 2배",
      "3초 급가속",
      "캔들 5개",
      "스킬",
    ]) {
      assert.equal(payload.includes(term), false, term);
    }
  });

  it("keeps hidden fighters cosmetic instead of shipping private skill assists", () => {
    assert.ok(FIGHTERS.every((fighter) => fighter.assist === "cosmetic"));
  });
});

describe("stock fighter progression rules", () => {
  it("starts the chart chase after ten charged correct answers", () => {
    let state = createAppState();
    const question = QUIZ_QUESTIONS[0];

    for (let count = 1; count <= 10; count += 1) {
      const result = applyQuizAnswer(state, question, question.answerIndex);
      state = result.state;

      if (count < 10) {
        assert.equal(result.shouldLaunchMiniGame, false);
        assert.equal(state.quizCharge, count);
      } else {
        assert.equal(result.shouldLaunchMiniGame, true);
        assert.equal(state.quizCharge, 0);
      }
    }
  });

  it("keeps quiz charge cumulative and trims two charge on wrong answers", () => {
    let state = createAppState();
    const question = QUIZ_QUESTIONS[0];

    for (let count = 0; count < 6; count += 1) {
      state = applyQuizAnswer(state, question, question.answerIndex).state;
    }

    const wrong = applyQuizAnswer(state, question, 1);

    assert.equal(wrong.shouldLaunchMiniGame, false);
    assert.equal(wrong.state.quizCharge, 4);
    assert.equal(wrong.state.correctStreak, 0);
  });

  it("opens one random hidden fighter instead of letting users directly choose a locked fighter", () => {
    const lockedFighter = FIGHTERS.find((fighter) => !fighter.unlockedDefault);
    assert.ok(lockedFighter);

    const result = unlockRandomHiddenFighter(createAppState(), () => 0);

    assert.equal(result.unlocked, true);
    assert.equal(result.fighter.id, lockedFighter.id);
    assert.equal(result.state.fighterUnlockTickets, 0);
    assert.equal(result.state.selectedFighterId, lockedFighter.id);
    assert.equal(result.state.unlockedFighterIds.includes(lockedFighter.id), true);
  });

  it("opens a random hidden fighter from a completed rewarded ad", () => {
    const lockedFighter = FIGHTERS.find((fighter) => !fighter.unlockedDefault);
    assert.ok(lockedFighter);

    const state = createAppState();
    const rewarded = completeRewardedAd(state, "fighter-unlock", () => 0);

    assert.equal(rewarded.fighterUnlockTickets, 0);
    assert.equal(rewarded.selectedFighterId, lockedFighter.id);
    assert.equal(rewarded.unlockedFighterIds.includes(lockedFighter.id), true);
  });

  it("claims the 100-question ending random fighter reward only once", () => {
    const lockedFighter = FIGHTERS.find((fighter) => !fighter.unlockedDefault);
    assert.ok(lockedFighter);

    const incomplete = claimEndingRandomFighterReward(createAppState(), () => 0);
    assert.equal(incomplete.claimed, false);
    assert.equal(incomplete.state.unlockedFighterIds.includes(lockedFighter.id), false);

    const firstClaim = claimEndingRandomFighterReward(
      createAppState({ completed: true }),
      () => 0,
    );

    assert.equal(firstClaim.claimed, true);
    assert.equal(firstClaim.unlocked, true);
    assert.equal(firstClaim.fighter.id, lockedFighter.id);
    assert.equal(firstClaim.state.endingRewardClaimed, true);
    assert.equal(firstClaim.state.selectedFighterId, lockedFighter.id);

    const secondClaim = claimEndingRandomFighterReward(firstClaim.state, () => 0.4);

    assert.equal(secondClaim.claimed, false);
    assert.deepEqual(secondClaim.state.unlockedFighterIds, firstClaim.state.unlockedFighterIds);
  });

  it("caps quiz hints at three after a 10-combo mini game", () => {
    const game = { ...createMiniGameState("ant-fighter"), hintEarned: true };
    const state = finishMiniGame(createAppState({ hints: 3 }), game);

    assert.equal(state.hints, 3);
  });
});

describe("chart chase rules", () => {
  it("runs the chart chase as a 15-second survival round", () => {
    const game = createMiniGameState("ant-fighter");

    assert.equal(MINI_GAME_SECONDS, 15);
    assert.equal(game.remainingMs, 15000);
  });

  it("gives each candle about 0.68 seconds before a late miss", () => {
    const game = createMiniGameState("ant-fighter");

    assert.equal(MINI_GAME_BASE_INPUT_WINDOW_MS, 680);
    assert.equal(game.inputDueMs, 680);
  });

  it("uses five misses before the chaser catches the runner", () => {
    assert.equal(MISS_LIMIT, 5);
  });

  it("pulls the runner and chaser two candles closer to the current target candle", () => {
    assert.deepEqual(
      getChaseActorIndexes({ targetIndex: 12, distance: 5, maxIndex: 63 }),
      {
        runnerIndex: 11,
        chaserIndex: 5,
        targetIndex: 12,
      },
    );
  });

  it("pushes the runner back and closes the chaser gap as distance drops", () => {
    assert.deepEqual(
      getChaseActorIndexes({ targetIndex: 12, distance: 1, maxIndex: 63 }),
      {
        runnerIndex: 7,
        chaserIndex: 5,
        targetIndex: 12,
      },
    );
  });

  it("ends with a comic ko on the fifth miss", () => {
    let game = createMiniGameState("ant-fighter");

    for (let count = 1; count <= 4; count += 1) {
      game = resolveCandleInput(game, { direction: "up" }, "down");
      assert.equal(game.ended, false);
      assert.equal(game.mistakes, count);
    }

    game = resolveCandleInput(game, { direction: "up" }, "down");

    assert.equal(game.ended, true);
    assert.equal(game.result, "ko");
    assert.equal(game.mistakes, 5);
  });

  it("turns on a one-second flame invincible effect and hint reward at 10 combo", () => {
    let game = createMiniGameState("ant-fighter");

    for (let count = 0; count < 10; count += 1) {
      game = resolveCandleInput(game, { direction: "up" }, "up");
    }

    assert.equal(game.combo, 10);
    assert.equal(game.invincibleMs, 1000);
    assert.equal(game.dashMs, 1000);
    assert.equal(game.hintEarned, true);
    assert.equal(game.effectBursts, 1);
    assert.ok(game.score >= 100);
  });

  it("finishes by survival when the 15-second timer reaches zero", () => {
    const game = tickMiniGame(createMiniGameState("ant-fighter"), 15000);

    assert.equal(game.ended, true);
    assert.equal(game.result, "survived");
    assert.equal(game.remainingMs, 0);
  });

  it("knocks out when the player ignores candle prompts", () => {
    let game = createMiniGameState("ant-fighter");

    for (let elapsed = 0; elapsed < 15000 && !game.ended; elapsed += 250) {
      game = tickMiniGame(game, 250, { applyLatePenalty: true });
    }

    assert.equal(game.ended, true);
    assert.equal(game.result, "ko");
    assert.equal(game.mistakes, 5);
    assert.ok(game.lateStrikes >= 5);
  });

  it("does not give selected hidden fighters private chart-chase advantages", () => {
    const antGame = createMiniGameState("ant-fighter");
    const memoryGame = createMiniGameState("memory-chaebol");

    assert.equal(memoryGame.shieldCharges, antGame.shieldCharges);
    assert.equal(memoryGame.shieldCharges, 0);

    const upCandle = { direction: "up" };
    const downCandle = { direction: "down" };

    const antUp = resolveCandleInput(antGame, upCandle, "up");
    const upperUp = resolveCandleInput(
      createMiniGameState("upper-limit-fairy"),
      upCandle,
      "up",
    );
    const dividendUp = resolveCandleInput(
      createMiniGameState("dividend-aristo-cat"),
      upCandle,
      "up",
    );
    const lowerDown = resolveCandleInput(
      createMiniGameState("lower-limit-ghost"),
      downCandle,
      "down",
    );

    assert.equal(upperUp.score, antUp.score);
    assert.equal(dividendUp.score, antUp.score);
    assert.equal(lowerDown.score, antUp.score);

    const memoryMiss = resolveCandleInput(memoryGame, upCandle, "down");
    assert.equal(memoryMiss.mistakes, 1);
    assert.equal(memoryMiss.shieldCharges, 0);
  });
});

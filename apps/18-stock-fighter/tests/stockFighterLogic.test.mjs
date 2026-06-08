import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  FIGHTERS,
  MINI_GAME_SECONDS,
  MINI_GAME_BASE_INPUT_WINDOW_MS,
  MISS_LIMIT,
  QUIZ_QUESTIONS,
  QUIZ_SETS,
  QUESTIONS_PER_SET,
  applyQuizAnswer,
  claimEndingRandomFighterReward,
  completeRewardedAd,
  createAppState,
  createCandle,
  createMiniGameState,
  finishMiniGame,
  getChaseActorIndexes,
  getDifficultyCounts,
  getQuestionChoices,
  getQuizBattleCry,
  getQuizQuestionsForSet,
  resolveCandleInput,
  resetQuizProgress,
  tickMiniGame,
  unlockRandomHiddenFighter,
} from "../src/lib/stockFighterLogic.mjs";

describe("stock fighter content rules", () => {
  it("ships three 100-question quiz sets with 300 total question entries", () => {
    assert.equal(QUIZ_SETS.length, 3);
    assert.equal(QUIZ_QUESTIONS.length, 300);
    assert.equal(QUESTIONS_PER_SET, 100);
    assert.deepEqual(getDifficultyCounts(QUIZ_QUESTIONS), {
      beginner: 120,
      intermediate: 90,
      advanced: 90,
    });

    for (let setIndex = 0; setIndex < QUIZ_SETS.length; setIndex += 1) {
      const setQuestions = getQuizQuestionsForSet(setIndex);

      assert.equal(setQuestions.length, 100);
      assert.deepEqual(getDifficultyCounts(setQuestions), {
        beginner: 40,
        intermediate: 30,
        advanced: 30,
      });
    }

    assert.equal(new Set(QUIZ_QUESTIONS.map((question) => question.id)).size, 300);
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

  it("uses the approved main fighter collection copy", () => {
    // Given
    const mainFighter = FIGHTERS.find((fighter) => fighter.unlockedDefault);

    // When
    const profile = [
      mainFighter.name,
      mainFighter.signature,
      mainFighter.effect,
    ];

    // Then
    assert.deepEqual(profile, [
      "개미 파이터",
      "월급날 생존왕",
      "서울 자가를 꿈꾸며 오늘도 김밥으로 버틴다",
    ]);
  });

  it("uses the approved hidden fighter collection copy", () => {
    const hiddenFighterProfiles = FIGHTERS.filter(
      (fighter) => !fighter.unlockedDefault,
    ).map((fighter) => [
      fighter.name,
      fighter.signature,
      fighter.effect,
    ]);

    assert.deepEqual(hiddenFighterProfiles, [
      ["금발 관세왕", "금발 협상 천재", "절대 손해보지 않는 관세 협상의 달인."],
      ["후디 소셜왕", "타임라인 과몰입러", "좋아요는 잘 누르지만 손절 버튼은 늘 못 찾는다."],
      ["로켓 괴짜 CEO", "화성행 야근러", "회의 대신 발사를, 잠은 죽어서 자기로 결심했다."],
      ["우주 택배왕", "새벽배송 우주신사", "택배 상자처럼 꿈 큰 야망가, 단 반품은 싫어한다."],
      ["밈 코인 강아지", "밈의 대가", "이유는 모르겠지만 표정 만큼은 언제나 상한가다."],
      ["AI 가죽재킷 보스", "가죽재킷 마스터", "ai와 가죽재킷 싸이클은 함께간다고 주장한다."],
      ["메모리 재벌", "RAM 많은 재벌 2세", "더 이상 싸이클 산업이 아니라고 주장한다."],
      ["반도체 회장님", "웨이퍼 회장님", "말은 느린데 결재 도장은 나노 단위로 찍힌다."],
      ["전기차 장인", "자율주행 혁명가", "주차는 못해도 자율주행 전기차 덕분에 달린다."],
      ["검색창 현자", "검색창 철학자", "주가는 기본, 매일 자기 이름도 검색한다."],
      ["사과폰 수도승", "무음모드 수도승", "말은 적은데 손과 머리회전은 빠르다."],
      ["배당 귀족냥", "배당 캔 마니아", "느긋하게 앉아 있다가 입금 알림에만 귀가 번쩍 뜬다."],
      ["공시 닌자", "공시 새벽반", "모두 잠든 새벽에도 정정공시 냄새는 놓치지 않는다."],
      ["차트 도사", "선 긋는 은둔고수", "차트에 선을 긋다 보니 인생의 추세선까지 깨달았다."],
      ["호가 사냥꾼", "호가창 매의눈", "삽겹살 두께보다 매수벽 두께에 더 민감하다."],
      ["상한가 요정", "빨간봉 축제요정", "아주 운 좋은 날만 만난다는 전설의 요정."],
      ["하한가 유령", "파란봉 야근령", "잡주에서 자주 출몰한다는 흔한 요정."],
      ["분산투자 방패병", "바구니 분산러", "계란도 자산도 한 곳에 몰아두면 밤잠을 못 잔다."],
      ["손절 검객", "미련 절단 검사", "'손절큰 칼 같이 익절은 느긋하게'가 좌우명이다"],
    ]);
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

  it("keeps quiz charge cumulative and trims one charge on wrong answers", () => {
    let state = createAppState();
    const question = QUIZ_QUESTIONS[0];

    for (let count = 0; count < 4; count += 1) {
      state = applyQuizAnswer(state, question, question.answerIndex).state;
    }

    const wrong = applyQuizAnswer(state, question, 1);

    assert.equal(wrong.shouldLaunchMiniGame, false);
    assert.equal(wrong.state.quizCharge, 3);
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

  it("spreads random hidden fighter rewards across the locked roster", () => {
    const sampledIds = [0, 0.24, 0.51, 0.99].map(
      (randomValue) =>
        unlockRandomHiddenFighter(createAppState(), () => randomValue).fighter.id,
    );

    assert.equal(new Set(sampledIds).size, sampledIds.length);
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

  it("resets quiz progress without clearing collected hidden fighters", () => {
    const reset = resetQuizProgress(
      createAppState({
        score: 999,
        correctStreak: 9,
        quizCharge: 9,
        answeredCount: 100,
        correctCount: 88,
        hints: 2,
        fighterUnlockTickets: 1,
        reviveTickets: 1,
        selectedFighterId: "chart-master",
        unlockedFighterIds: ["chart-master"],
        quizCursor: QUESTIONS_PER_SET,
        miniGameRuns: 4,
        completed: true,
        hasSeenIntro: true,
        endingRewardClaimed: true,
        quizSetIndex: 0,
      }),
    );

    assert.equal(reset.score, 0);
    assert.equal(reset.correctStreak, 0);
    assert.equal(reset.quizCharge, 0);
    assert.equal(reset.answeredCount, 0);
    assert.equal(reset.correctCount, 0);
    assert.equal(reset.quizCursor, 0);
    assert.equal(reset.completed, false);
    assert.equal(reset.endingRewardClaimed, false);
    assert.equal(reset.quizSetIndex, 1);
    assert.equal(reset.hints, 2);
    assert.equal(reset.fighterUnlockTickets, 1);
    assert.equal(reset.reviveTickets, 1);
    assert.equal(reset.selectedFighterId, "chart-master");
    assert.deepEqual(reset.unlockedFighterIds, ["chart-master"]);
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

  it("gives the opening candle 1 second and later candles 0.6 seconds", () => {
    const game = createMiniGameState("ant-fighter");

    assert.equal(MINI_GAME_BASE_INPUT_WINDOW_MS, 600);
    assert.equal(game.inputDueMs, 1000);
    assert.equal(
      resolveCandleInput(game, { direction: "up" }, "up").inputDueMs,
      600,
    );
  });

  it("does not repeat a readable five-candle direction pattern", () => {
    const directions = Array.from({ length: 25 }, (_, index) =>
      createCandle(index, 20260606).direction,
    );
    const fiveCandleSets = Array.from({ length: 5 }, (_, index) =>
      directions.slice(index * 5, index * 5 + 5).join(""),
    );

    assert.ok(new Set(fiveCandleSets).size >= 4);
  });

  it("uses the mini-game candle seed to vary each chase run", () => {
    const firstSeedDirections = Array.from({ length: 20 }, (_, index) =>
      createCandle(index, 101).direction,
    ).join("");
    const secondSeedDirections = Array.from({ length: 20 }, (_, index) =>
      createCandle(index, 909).direction,
    ).join("");

    assert.notEqual(firstSeedDirections, secondSeedDirections);
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

  it("turns on a 1.5-second flame invincible effect and hint reward at 10 combo", () => {
    let game = createMiniGameState("ant-fighter");

    for (let count = 0; count < 10; count += 1) {
      game = resolveCandleInput(game, { direction: "up" }, "up");
    }

    assert.equal(game.combo, 10);
    assert.equal(game.invincibleMs, 1500);
    assert.equal(game.dashMs, 1500);
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

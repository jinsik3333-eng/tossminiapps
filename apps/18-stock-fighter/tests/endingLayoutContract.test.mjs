import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const appSource = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const cssSource = readFileSync(new URL("../src/App.css", import.meta.url), "utf8");
const standardizeAssetScript = readFileSync(
  new URL("../scripts/standardize_fighter_asset.py", import.meta.url),
  "utf8",
);
const processLatestAssetScript = readFileSync(
  new URL("../scripts/process_latest_fighter_asset.py", import.meta.url),
  "utf8",
);

function introMarkup() {
  const match = appSource.match(
    /const renderIntro = \(\) => \{[\s\S]*?const renderEnding = \(\) => \{/,
  );

  assert.ok(match, "intro markup should be present");
  return match[0];
}

function endingMarkup() {
  const match = appSource.match(
    /const renderEnding = \(\) => \{[\s\S]*?const renderChaseOverlay = \(\) => \{/,
  );

  assert.ok(match, "ending markup should be present");
  return match[0];
}

describe("ending and hidden fighter reward contract", () => {
  it("routes completion through the ending reward draw without a final report screen", () => {
    assert.match(appSource, /type Screen = [\s\S]*"ending"/);
    assert.doesNotMatch(appSource, /type Screen = [^\n]*"result"/);
    assert.match(appSource, /const endingPanels = \[/);

    const endingImages = appSource.match(/ending-0[1-5]-[a-z-]+\.png/g) ?? [];
    assert.equal(new Set(endingImages).size, 5);
    assert.match(appSource, /completionDestination/);
    assert.match(appSource, /state\.completed && !state\.endingRewardClaimed \? "ending" : "home"/);
    assert.match(appSource, /claimEndingRandomFighterReward/);
    assert.doesNotMatch(appSource, /CLEAR REPORT/);
    assert.doesNotMatch(appSource, /파이터 리포트/);
    assert.doesNotMatch(appSource, /const renderResult/);
    assert.doesNotMatch(cssSource, /\.result-screen/);
  });

  it("skips ant-specific ending panels when a hidden fighter completes a later run", () => {
    assert.match(
      appSource,
      /function shouldSkipAntEndingPanels\(state: AppState\)\s*{[\s\S]*?state\.completed[\s\S]*?state\.selectedFighterId !== "ant-fighter"[\s\S]*?}/,
    );
    assert.match(
      appSource,
      /const completionEndingIndex = \(state: AppState\) =>\s*shouldSkipAntEndingPanels\(state\) \? endingPanels\.length : 0;/,
    );
    assert.match(appSource, /setEndingIndex\(completionEndingIndex\(result\.state\)\)/);
    assert.match(appSource, /setEndingIndex\(completionEndingIndex\(nextState\)\)/);
  });

  it("exposes local-only ending, quiz, and chase previews for hidden fighter QA", () => {
    assert.match(appSource, /type LocalPreviewMode = "ending" \| "quiz" \| "chase" \| null/);
    assert.match(appSource, /function getLocalPreviewMode\(\): LocalPreviewMode/);
    assert.match(appSource, /hostname === "localhost"/);
    assert.match(appSource, /hostname === "127\.0\.0\.1"/);
    assert.match(appSource, /hostname === "::1"/);
    assert.match(appSource, /preview !== "ending" && preview !== "quiz" && preview !== "chase"/);
    assert.match(appSource, /function getLocalPreviewFighterId\(\)/);
    assert.match(appSource, /const initialScreen: Screen = isEndingPreview \? "ending" : isQuizPreview \? "quiz" : isChasePreview \? "chase" : "home"/);
    assert.match(appSource, /if \(localPreviewMode != null\) \{\s*return;\s*\}/);
  });

  it("reveals the final random fighter through a button-driven roulette moment", () => {
    assert.match(appSource, /type EndingDrawPhase = "ready" \| "rolling" \| "revealed"/);
    assert.match(appSource, /const \[endingDrawPhase, setEndingDrawPhase\]/);
    assert.match(appSource, /const startEndingDraw = \(\) => \{/);
    assert.match(appSource, /setEndingDrawPhase\("rolling"\)/);
    assert.match(appSource, /window\.setTimeout\(\(\) => \{[\s\S]*claimEndingRandomFighterReward/);
    assert.match(appSource, /랜덤 히든파이터 뽑기/);
    assert.match(appSource, /ending-roulette/);
    assert.match(appSource, /ending-roll-sfx/);
    assert.match(appSource, /ending-prize-card is-revealed/);

    assert.match(
      cssSource,
      /\.ending-prize-portrait\s*{[\s\S]*?position:\s*relative;[\s\S]*?width:\s*min\(156px,\s*42vw\);/,
    );
    assert.match(
      cssSource,
      /\.ending-roulette\.is-rolling\s+\.roulette-tile\s*{[\s\S]*?animation:\s*endingRouletteFlash/,
    );
    assert.match(cssSource, /\.ending-prize-card\.is-revealed\s*{[\s\S]*?animation:\s*endingPrizeReveal/);
    assert.match(cssSource, /@keyframes endingPrizeReveal/);
  });

  it("shows that the revealed ending fighter is added to the accumulated collection", () => {
    assert.match(appSource, /className="kicker ending-collection-status"/);
    assert.match(appSource, /도감 누적/);
    assert.match(appSource, /unlockedIds\.size/);
    assert.match(appSource, /fighters\.length/);
  });

  it("routes rewarded-ad fighter unlocks through the same random shuffle draw", () => {
    const rewardBody = appSource.match(
      /const handleReward = async \(rewardKind: RewardKind\) => \{[\s\S]*?\n  \};\n\n  const handleCandleInput/,
    )?.[0] ?? "";

    assert.match(appSource, /type EndingDrawSource = "completion" \| "reward-ad"/);
    assert.match(appSource, /const \[endingDrawSource, setEndingDrawSource\]/);
    assert.match(appSource, /const startRewardedFighterDraw = \(state: AppState\) => \{/);
    assert.match(appSource, /setEndingDrawSource\("reward-ad"\)/);
    assert.match(appSource, /setEndingIndex\(endingPanels\.length\)/);
    assert.match(appSource, /setEndingDrawPhase\("rolling"\)/);
    assert.match(appSource, /setScreen\("ending"\)/);
    assert.match(appSource, /completeRewardedAd\(state, "fighter-unlock"\)/);
    assert.match(rewardBody, /if \(rewardKind === "fighter-unlock"\) \{[\s\S]*startRewardedFighterDraw\(appState\);[\s\S]*return;/);
    assert.doesNotMatch(rewardBody, /rewardKind === "fighter-unlock" \? "cardReveal"/);
  });

  it("plays shuffle ticks during the ending draw and a reveal effect when the card appears", () => {
    const drawBody = appSource.match(
      /const startEndingDraw = \(\) => \{[\s\S]*?\n  \};\n\n  const startCountdown/,
    )?.[0] ?? "";

    assert.match(appSource, /const ENDING_DRAW_REVEAL_DELAY_MS = 1250;/);
    assert.match(
      appSource,
      /const ENDING_DRAW_SHUFFLE_SFX_DELAYS_MS = \[0, 180, 360, 540, 720, 900, 1080\] as const;/,
    );
    assert.match(
      appSource,
      /const playEndingShuffleSfx = \(\) => \{[\s\S]*for \(const delayMs of ENDING_DRAW_SHUFFLE_SFX_DELAYS_MS\) \{/,
    );
    assert.match(drawBody, /playEndingShuffleSfx\(\)/);
    assert.match(
      appSource,
      /window\.setTimeout\(\(\) => audio\.playSfx\("shuffleTick"\), delayMs\)/,
    );
    assert.match(
      drawBody,
      /window\.setTimeout\(\(\) => \{[\s\S]*audio\.playSfx\("cardReveal"\)[\s\S]*}, ENDING_DRAW_REVEAL_DELAY_MS\)/,
    );
  });

  it("uses shuffle copy and a heavier retro draw button on the final reward screen", () => {
    assert.match(appSource, /<span>셔플!<\/span>/);
    assert.match(
      appSource,
      /100문항을 버틴 파이터에게는 숨은 파이터를 보상한다/,
    );
    assert.doesNotMatch(appSource, /100문항을 버틴 개미에게는 숨은 파이터를 보상한다/);
    assert.doesNotMatch(appSource, /파\s*파\s*박/);
    assert.doesNotMatch(appSource, /파파박|파바박/);
    assert.match(
      cssSource,
      /\.ending-draw-button\s*{[\s\S]*?font-family:\s*"Arial Black",\s*"Pretendard",\s*system-ui,\s*sans-serif;[\s\S]*?font-weight:\s*900;[\s\S]*?letter-spacing:\s*0;/,
    );
  });

  it("does not surface hidden fighter assists as gameplay skill copy", () => {
    assert.doesNotMatch(appSource, /보조 효과가 실수 1회를 막았다/);
  });

  it("uses the revised ending script and preserves the mentor page line break", () => {
    assert.match(
      appSource,
      /copy: "개미 파이터는 손실의 공포를 무릎쓰고 투자를 진행하며 기술적, 기업분석을 씹어먹었다\."/,
    );
    assert.match(
      appSource,
      /copy: "전설의 가치투자 스승 워매 버핏은 말했다\.\\n싼 이유를 묻고, 오래 버틸 이유를 찾아라\."/,
    );
    assert.match(cssSource, /\.cutscene-caption\s*{[\s\S]*?white-space:\s*pre-line;/);
  });

  it("keeps the ending preview isolated from persisted unlock state", () => {
    assert.match(
      appSource,
      /const state = localPreviewMode === "ending" \? \(createAppState\(\) as AppState\) : readStoredState\(\);/,
    );
  });

  it("shows a small sound unlock control on intro and ending cutscenes", () => {
    const intro = introMarkup();
    const ending = endingMarkup();

    assert.match(appSource, /const renderCutsceneAudioButton = \(\) => \(/);
    assert.match(appSource, /className=\{`cutscene-audio-button \$\{audioEnabled \? "is-audio-on" : ""\}`\}/);
    assert.match(appSource, /aria-label=\{audioEnabled \? "사운드 끄기" : "사운드 켜기"\}/);
    assert.match(intro, /\{renderCutsceneAudioButton\(\)\}[\s\S]*<button className="skip-button"/);
    assert.match(ending, /ending-draw-shell[\s\S]*\{renderCutsceneAudioButton\(\)\}/);
    assert.match(ending, /ending-shell[\s\S]*\{renderCutsceneAudioButton\(\)\}/);
    assert.match(cssSource, /\.cutscene-audio-button\s*{[\s\S]*?right:\s*14px;/);
    assert.match(cssSource, /\.cutscene-shell > \.skip-button\s*{[\s\S]*?right:\s*62px;/);
  });

  it("opens a selected hidden fighter directly in local quiz and chase previews", () => {
    assert.match(appSource, /localPreviewMode === "quiz" \|\| localPreviewMode === "chase"/);
    assert.match(appSource, /selectedFighterId: fighterId/);
    assert.match(appSource, /unlockedFighterIds: \[fighterId\]/);
    assert.match(appSource, /isChasePreview \? createMiniGameState\(readInitialState\(localPreviewMode\)\.selectedFighterId\)/);
  });

  it("explains that hidden fighters open randomly through quiz completion or ads", () => {
    assert.match(
      appSource,
      /히든파이터는 퀴즈 100개 달성 혹은 광고 시청 후 랜덤으로 열려요\./,
    );
    assert.match(appSource, /광고 보고 오픈하기/);
    assert.doesNotMatch(appSource, /티켓 사용/);
    assert.doesNotMatch(appSource, /티켓으로 열기/);
    assert.doesNotMatch(appSource, /티켓 필요/);
    assert.doesNotMatch(appSource, /파이터 티켓/);
  });

  it("uses the Toss rewarded ad bridge for hidden fighter unlocks and mini-game revives", () => {
    assert.match(appSource, /loadFullScreenAd/);
    assert.match(appSource, /showFullScreenAd/);
    assert.match(appSource, /VITE_TOSS_REWARDED_AD_GROUP_ID/);
    assert.match(appSource, /case "userEarnedReward":/);
    assert.match(appSource, /handleReward\("fighter-unlock"\)/);
    assert.match(appSource, /handleReward\("revive"\)/);
  });

  it("uses ad-based revive copy on the ko screen", () => {
    assert.match(appSource, /광고를 보면 한 번 더 뛸 수 있다/);
    assert.match(appSource, /광고보고 부활하기/);
    assert.doesNotMatch(appSource, /부활권이 있으면 한 번 더 뛴다/);
    assert.doesNotMatch(appSource, /부활 광고 준비 중/);
  });

  it("lets the selected fighter drive the chart chase runner instead of hardcoding the ant", () => {
    assert.match(appSource, /data-fighter-id=\{selectedFighter\.id\}/);
    assert.match(cssSource, /\.runner\.fighter-runner:not\(\[data-fighter-id="ant-fighter"\]\)/);
    assert.match(cssSource, /background-image:\s*var\(--fighter-runner-image\)/);
  });

  it("keeps hidden fighter quiz characters separate from chart-chase runner PNGs", () => {
    const quizCharacterFiles = readdirSync(
      new URL("../public/assets/stock-fighter/fighters/quiz-character", import.meta.url),
    ).filter((fileName) => fileName.endsWith(".png"));
    const runnerFiles = readdirSync(
      new URL("../public/assets/stock-fighter/fighters/runner", import.meta.url),
    ).filter((fileName) => fileName.endsWith(".png"));

    assert.equal(quizCharacterFiles.length, 19);
    assert.ok(quizCharacterFiles.includes("hoodie-social-king.png"));
    assert.equal(runnerFiles.length, 19);
    assert.ok(runnerFiles.includes("hoodie-social-king.png"));
    assert.match(appSource, /--fighter-quiz-character-image/);
    assert.match(appSource, /\/quiz-character\/\$\{fighter\.id\}\.png/);
    assert.match(appSource, /--fighter-runner-image/);
    assert.match(appSource, /\/runner\/\$\{fighter\.id\}\.png/);
    assert.doesNotMatch(appSource, /\/quiz-bg\/\$\{fighter\.id\}\.png/);
    assert.doesNotMatch(appSource, /\/quiz-full\/\$\{fighter\.id\}\.png/);
  });

  it("renders hidden fighter quiz scenes from a clean shared base frame plus character layer", () => {
    assert.ok(
      existsSync(
        new URL("../public/assets/stock-fighter/fighters/quiz-bg-base/quiz-frame-hidden-base-v1.png", import.meta.url),
      ),
    );
    assert.match(
      cssSource,
      /\.quiz-screen:not\(\[data-fighter-id="ant-fighter"\]\)\s*{[\s\S]*?quiz-bg-base\/quiz-frame-hidden-base-v1\.png/,
    );
    assert.match(
      cssSource,
      /\.quiz-fighter-stand:not\(\[data-fighter-id="ant-fighter"\]\)\s*{[\s\S]*?background:\s*var\(--fighter-quiz-character-image\) center \/ contain no-repeat;/,
    );
    assert.doesNotMatch(cssSource, /--fighter-quiz-bg-image/);
  });

  it("removes the old composite hidden fighter quiz image directories from the app contract", () => {
    assert.equal(
      existsSync(new URL("../public/assets/stock-fighter/fighters/quiz-full", import.meta.url)),
      false,
    );
    assert.equal(
      existsSync(new URL("../public/assets/stock-fighter/fighters/quiz-bg", import.meta.url)),
      false,
    );
  });

  it("removes the outer outline from the revealed ending fighter card", () => {
    const prizeCardRule = cssSource.match(/\.ending-prize-card\s*{[\s\S]*?\n}/)?.[0] ?? "";

    assert.match(prizeCardRule, /background:\s*transparent;/);
    assert.match(prizeCardRule, /box-shadow:\s*none;/);
    assert.doesNotMatch(prizeCardRule, /border:\s*3px solid/);
    assert.doesNotMatch(prizeCardRule, /inset 0 0 0 2px #fff0c7/);
  });

  it("standardizes generated hidden fighter sprites into fixed quiz and runner canvases", () => {
    assert.match(standardizeAssetScript, /"quiz": \{[\s\S]*?"canvas": \(512, 512\)/);
    assert.match(standardizeAssetScript, /"quiz": \{[\s\S]*?"max_side": 300/);
    assert.match(standardizeAssetScript, /"quiz": \{[\s\S]*?"bottom": 406/);
    assert.match(standardizeAssetScript, /"runner": \{[\s\S]*?"canvas": \(256, 256\)/);
    assert.match(standardizeAssetScript, /"runner": \{[\s\S]*?"max_side": 197/);
    assert.match(standardizeAssetScript, /"runner": \{[\s\S]*?"bottom": 234/);
    assert.match(standardizeAssetScript, /alpha_bbox\(image\)/);
    assert.match(processLatestAssetScript, /remove_chroma_key\.py/);
    assert.match(processLatestAssetScript, /standardize_fighter_asset\.py/);
  });
});

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const appSource = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const cssSource = readFileSync(new URL("../src/App.css", import.meta.url), "utf8");

describe("ending and hidden fighter reward contract", () => {
  it("routes completion through a five-panel ending before the final report", () => {
    assert.match(appSource, /type Screen = [\s\S]*"ending"/);
    assert.match(appSource, /const endingPanels = \[/);

    const endingImages = appSource.match(/ending-0[1-5]-[a-z-]+\.png/g) ?? [];
    assert.equal(new Set(endingImages).size, 5);
    assert.match(appSource, /completionDestination/);
    assert.match(appSource, /state\.completed && !state\.endingRewardClaimed \? "ending" : "result"/);
    assert.match(appSource, /claimEndingRandomFighterReward/);
  });

  it("exposes the ending preview only on local development hosts", () => {
    assert.match(appSource, /function isLocalPreviewMode\(previewName: string\)/);
    assert.match(appSource, /hostname === "localhost"/);
    assert.match(appSource, /hostname === "127\.0\.0\.1"/);
    assert.match(appSource, /hostname === "::1"/);
    assert.match(appSource, /searchParams\.get\("preview"\) === previewName/);
    assert.match(appSource, /readInitialState\(isEndingPreview\)/);
    assert.match(appSource, /isEndingPreview \? "ending" : "home"/);
    assert.match(appSource, /if \(isEndingPreview\) \{\s*return;\s*\}/);
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

  it("uses shuffle copy and a heavier retro draw button on the final reward screen", () => {
    assert.match(appSource, /<span>셔플!<\/span>/);
    assert.match(
      appSource,
      /100문항을 버틴 개미에게는 숨은 파이터를 보상한다/,
    );
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
      /const state = isEndingPreview \? \(createAppState\(\) as AppState\) : readStoredState\(\);/,
    );
  });

  it("explains that hidden fighters open randomly through quiz completion or ads", () => {
    assert.match(
      appSource,
      /히든파이터는 퀴즈 100개 달성 혹은 광고 시청 후 랜덤으로 열려요\./,
    );
    assert.match(appSource, /광고 보고 랜덤 파이터 열기/);
    assert.doesNotMatch(appSource, /티켓 사용/);
    assert.doesNotMatch(appSource, /티켓으로 열기/);
    assert.doesNotMatch(appSource, /티켓 필요/);
    assert.doesNotMatch(appSource, /파이터 티켓/);
  });

  it("lets the selected fighter drive the chart chase runner instead of hardcoding the ant", () => {
    assert.match(appSource, /data-fighter-id=\{selectedFighter\.id\}/);
    assert.match(cssSource, /\.runner\.fighter-runner:not\(\[data-fighter-id="ant-fighter"\]\)/);
    assert.match(cssSource, /background-image:\s*var\(--fighter-runner-image\)/);
  });

  it("ships separate hidden fighter quiz and runner PNGs", () => {
    const quizFullFiles = readdirSync(
      new URL("../public/assets/stock-fighter/fighters/quiz-full", import.meta.url),
    ).filter((fileName) => fileName.endsWith(".png"));
    const runnerFiles = readdirSync(
      new URL("../public/assets/stock-fighter/fighters/runner", import.meta.url),
    ).filter((fileName) => fileName.endsWith(".png"));

    assert.equal(quizFullFiles.length, 19);
    assert.equal(runnerFiles.length, 19);
    assert.ok(quizFullFiles.includes("hoodie-social-king.png"));
    assert.ok(runnerFiles.includes("hoodie-social-king.png"));
  });
});

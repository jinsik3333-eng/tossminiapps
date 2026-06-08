import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const appSource = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const graniteConfigSource = readFileSync(new URL("../granite.config.ts", import.meta.url), "utf8");
const cssSource = readFileSync(new URL("../src/App.css", import.meta.url), "utf8");

function homeRosterMarkup() {
  const match = appSource.match(
    /<section className="home-roster"[\s\S]*?<section className="home-dock">/,
  );

  assert.ok(match, "home roster markup should be present");
  return match[0];
}

function fighterPreviewMarkup() {
  const match = appSource.match(
    /const renderFighterPreview = \(\) => \{[\s\S]*?const renderResetConfirm = \(\) =>/,
  );

  assert.ok(match, "fighter preview modal markup should be present");
  return match[0];
}

function collectionMarkup() {
  const match = appSource.match(
    /const renderCollection = \(\) => \([\s\S]*?\n  \);\n\n  if \(screen === "quiz"\)/,
  );

  assert.ok(match, "collection screen markup should be present");
  return match[0];
}

describe("home layout contract", () => {
  it("positions the app as a non-game education quiz miniapp for launch", () => {
    assert.doesNotMatch(graniteConfigSource, /type:\s*"game"/);
    assert.match(appSource, /퀴즈 학습/);
    assert.match(appSource, /차트 판독 훈련/);
  });

  it("uses one main fighter profile followed by hidden fighters in the home grid", () => {
    const roster = homeRosterMarkup();

    assert.match(appSource, /const mainFighter = fighters\.find/);
    assert.match(appSource, /const hiddenFighters = fighters\.filter/);
    assert.match(roster, /mainFighter && \(/);
    assert.match(roster, /hiddenFighters\.map\(\(fighter/);
    assert.doesNotMatch(roster, /fighters\.map\(\(fighter/);
  });

  it("uses an ant-fighter-only home background without baked-in roster slots", () => {
    assert.match(cssSource, /home-bg-ant-v3\.png/);
    assert.doesNotMatch(cssSource, /home-screen-v2\.png/);
  });

  it("only highlights the ant card when the ant is the selected fighter", () => {
    const roster = homeRosterMarkup();
    const mainFighterRule = cssSource.match(/\.home-main-fighter\s*{[\s\S]*?\n}/)?.[0] ?? "";

    assert.match(
      roster,
      /appState\.selectedFighterId === mainFighter\.id \? "is-selected" : ""/,
    );
    assert.match(
      cssSource,
      /\.home-main-fighter\.is-selected\s*{[\s\S]*?border-color:\s*#ffd641;/,
    );
    assert.doesNotMatch(mainFighterRule, /border-color:\s*#ffd641/);
    assert.doesNotMatch(mainFighterRule, /0 0 14px rgba\(255,\s*214,\s*65/);
    assert.doesNotMatch(mainFighterRule, /inset 0 0 0 2px #e53935/);
  });

  it("uses the compact revised home copy and tighter title spacing", () => {
    assert.match(appSource, /공부한 개미의 미래는 밝다/);
    assert.doesNotMatch(appSource, /개미가 국장의 미래다/);
    assert.match(appSource, /100문항 상식과 차트까지 깨부순다/);
    assert.doesNotMatch(appSource, /PIXEL STOCK QUIZ BATTLE/);
    assert.doesNotMatch(appSource, /100문항 상식을 깨고 투지 10칸마다 차트 추격전에 뛰어든다\./);
    assert.match(
      cssSource,
      /\.home-title-plate\s*{[\s\S]*?margin-top:\s*clamp\(46px,\s*7svh,\s*72px\);[\s\S]*?min-height:\s*104px;/,
    );
    assert.match(
      cssSource,
      /\.home-title-plate \.kicker\s*{[\s\S]*?font-size:\s*15px;[\s\S]*?margin-bottom:\s*2px;[\s\S]*?transform:\s*translateY\(-15px\);/,
    );
    assert.match(
      cssSource,
      /\.home-title-plate h1\s*{[\s\S]*?transform:\s*translateY\(-5px\);[\s\S]*?animation:\s*homeTitlePulse/,
    );
    assert.match(cssSource, /@keyframes homeTitlePulse/);
    const titlePulse = cssSource.match(/@keyframes homeTitlePulse\s*{[\s\S]*?\n}/)?.[0] ?? "";
    assert.doesNotMatch(titlePulse, /transform:\s*scale/);
    assert.match(cssSource, /\.home-title-plate h1::before/);
  });

  it("keeps the collection control in the roster header and reset as a confirmed secondary action", () => {
    const roster = homeRosterMarkup();

    assert.match(roster, /home-roster-heading/);
    assert.match(roster, /setScreen\("collection"\)/);
    assert.match(appSource, /isResetConfirmOpen/);
    assert.match(appSource, /home-reset-button/);
    assert.match(appSource, /진행도와 학습점수를 초기화할까\?/);
  });

  it("right-aligns square fighter cards so the ant-fighter background remains visible", () => {
    assert.match(
      cssSource,
      /\.home-roster\s*{[\s\S]*?margin-top:\s*clamp\(54px,\s*7svh,\s*78px\);[\s\S]*?width:\s*min\(45vw,\s*190px\);[\s\S]*?margin-left:\s*auto;/,
    );
    assert.match(
      cssSource,
      /\.home-fighter-grid\s*{[\s\S]*?grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/,
    );
    assert.match(
      cssSource,
      /\.home-fighter-tile\s*{[\s\S]*?aspect-ratio:\s*1 \/ 1;/,
    );
    assert.match(
      cssSource,
      /\.tile-portrait\s*{[\s\S]*?aspect-ratio:\s*1 \/ 1;/,
    );
    assert.match(
      cssSource,
      /\.home-fighter-tile strong\s*{[\s\S]*?font-size:\s*13px;/,
    );
  });

  it("fills the empty roster slot beside the final hidden fighter with an audio sticker tile", () => {
    const roster = homeRosterMarkup();

    assert.match(roster, /hiddenFighters\.map\(\(fighter\) => \{[\s\S]*?home-audio-tile/);
    assert.match(roster, /aria-label=\{audioEnabled \? "사운드 끄기" : "사운드 켜기"\}/);
    assert.match(roster, /onClick=\{handleAudioStickerClick\}/);
    assert.match(roster, /<span className="audio-sticker" aria-hidden="true">/);
    assert.match(cssSource, /\.home-audio-tile\s*{[\s\S]*?aspect-ratio:\s*1 \/ 1;/);
    assert.match(cssSource, /\.home-audio-tile\.is-audio-on\s*{[\s\S]*?border-color:\s*#7df9ff;/);
  });

  it("keeps collection access in the hero section header and the dock weighted toward quiz start", () => {
    assert.match(
      cssSource,
      /\.home-roster-heading\s*{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)\s*58px;/,
    );
    assert.match(cssSource, /\.home-roster-heading span\s*{[\s\S]*?border:\s*2px solid/);
    assert.match(cssSource, /\.home-roster-heading \.mini-button\s*{[\s\S]*?width:\s*58px;/);
    assert.match(
      cssSource,
      /\.home-dock\s*{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*3fr\)\s*minmax\(0,\s*1fr\);/,
    );
  });

  it("opens hidden fighter details without auto-selecting the fighter card", () => {
    const roster = homeRosterMarkup();

    assert.match(
      roster,
      /hiddenFighters\.map\(\(fighter\) => \{[\s\S]*?onClick=\{\(\) => \{\s*setPreviewFighterId\(fighter\.id\);\s*\}\}/,
    );
    assert.doesNotMatch(
      roster,
      /hiddenFighters\.map\(\(fighter\) => \{[\s\S]*?handleSelectFighter\(fighter\);[\s\S]*?setPreviewFighterId\(fighter\.id\)/,
    );
  });

  it("opens the ant fighter details without auto-selecting the fighter card", () => {
    const roster = homeRosterMarkup();

    assert.match(
      roster,
      /mainFighter && \([\s\S]*?onClick=\{\(\) => \{\s*setPreviewFighterId\(mainFighter\.id\);\s*\}\}/,
    );
    assert.doesNotMatch(
      roster,
      /mainFighter && \([\s\S]*?handleSelectFighter\(mainFighter\);[\s\S]*?setPreviewFighterId\(mainFighter\.id\)/,
    );
    assert.doesNotMatch(
      appSource,
      /fighter\.unlockedDefault && unlocked[\s\S]*?handleSelectFighter\(fighter\)/,
    );
  });

  it("does not show the global reward panel below the hidden fighter collection", () => {
    const collection = collectionMarkup();

    assert.doesNotMatch(collection, /<RewardPanel/);
    assert.doesNotMatch(collection, /rewardStatus/);
    assert.doesNotMatch(collection, /isRewardReady/);
  });

  it("adds a yellow rewarded-ad unlock action under the locked hidden fighter waiting button", () => {
    const preview = fighterPreviewMarkup();

    assert.match(preview, /카드 오픈 대기/);
    assert.match(preview, /광고 보고 오픈하기/);
    assert.match(preview, /onClick=\{\(\) => handleReward\("fighter-unlock"\)\}/);
    assert.match(
      preview,
      /disabled=\{!isRewardReady \|\| !canUnlockFighter\(appState\)\}/,
    );
    assert.match(cssSource, /\.primary-button\.is-reward-unlock/);
    assert.match(
      cssSource,
      /\.primary-button\.is-reward-unlock\.is-disabled[\s\S]*?background:\s*#7a6420;/,
    );
  });

  it("starts a fresh quiz instead of opening the old fighter report after completion", () => {
    const startQuizBody = appSource.match(
      /const startQuiz = \(\) => \{[\s\S]*?\n  \};\n\n  const advanceIntro/,
    )?.[0] ?? "";

    assert.match(startQuizBody, /if \(appState\.completed\) \{/);
    assert.match(startQuizBody, /resetQuizProgress\(appState\)/);
    assert.match(startQuizBody, /persistState\(fresh\)/);
    assert.match(startQuizBody, /setScreen\(fresh\.hasSeenIntro \? "quiz" : "intro"\)/);
    assert.doesNotMatch(startQuizBody, /completionDestination\(appState\)/);
    assert.doesNotMatch(appSource, /screen === "result"/);
    assert.doesNotMatch(appSource, /파이터 리포트/);
  });
});

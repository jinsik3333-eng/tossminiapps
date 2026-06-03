import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const appSource = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const cssSource = readFileSync(new URL("../src/App.css", import.meta.url), "utf8");

function homeRosterMarkup() {
  const match = appSource.match(
    /<section className="home-roster"[\s\S]*?<section className="home-dock">/,
  );

  assert.ok(match, "home roster markup should be present");
  return match[0];
}

describe("home layout contract", () => {
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

  it("uses the compact revised home copy and tighter title spacing", () => {
    assert.match(appSource, /개미가 국장의 미래다/);
    assert.match(appSource, /100문항 상식과 차트까지 깨부순다/);
    assert.doesNotMatch(appSource, /PIXEL STOCK QUIZ BATTLE/);
    assert.doesNotMatch(appSource, /100문항 상식을 깨고 투지 10칸마다 차트 추격전에 뛰어든다\./);
    assert.match(
      cssSource,
      /\.home-title-plate\s*{[\s\S]*?margin-top:\s*clamp\(46px,\s*7svh,\s*72px\);[\s\S]*?min-height:\s*104px;/,
    );
    assert.match(
      cssSource,
      /\.home-title-plate \.kicker\s*{[\s\S]*?font-size:\s*13px;[\s\S]*?margin-bottom:\s*2px;/,
    );
  });

  it("keeps the collection control in the roster header and reset as a confirmed secondary action", () => {
    const roster = homeRosterMarkup();

    assert.match(roster, /home-roster-heading/);
    assert.match(roster, /setScreen\("collection"\)/);
    assert.match(appSource, /isResetConfirmOpen/);
    assert.match(appSource, /home-reset-button/);
    assert.match(appSource, /진행도와 점수를 초기화할까\?/);
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

  it("keeps collection access in the hero section header and the dock weighted toward quiz start", () => {
    assert.match(
      cssSource,
      /\.home-roster-heading\s*{[\s\S]*?position:\s*static;/,
    );
    assert.match(
      cssSource,
      /\.home-dock\s*{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*3fr\)\s*minmax\(0,\s*1fr\);/,
    );
  });
});

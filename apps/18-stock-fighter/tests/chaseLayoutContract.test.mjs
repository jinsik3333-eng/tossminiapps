import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const appSource = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const cssSource = readFileSync(new URL("../src/App.css", import.meta.url), "utf8");

function chaseMarkup() {
  const match = appSource.match(
    /const renderChase = \(\) => \{[\s\S]*?const renderCollection = \(\) =>/,
  );

  assert.ok(match, "chase markup should be present");
  return match[0];
}

function chaseOverlayMarkup() {
  const match = appSource.match(
    /const renderChaseOverlay = \(\) => \{[\s\S]*?const renderHome = \(\) =>/,
  );

  assert.ok(match, "chase overlay markup should be present");
  return match[0];
}

describe("chart chase layout contract", () => {
  it("uses learning-oriented guide copy instead of fight wording", () => {
    const chase = chaseOverlayMarkup();

    assert.match(chase, /미니 차트 학습/);
    assert.match(chase, /15초 동안 하락과 상승을 맞춰라/);
    assert.match(chase, /차트 읽는 법/);
    assert.match(chase, /빨간 상승봉은 상승, 파란 하락봉은 하락/);
    assert.doesNotMatch(chase, /장 끝나기 전/);
    assert.doesNotMatch(chase, /15초를 불태워야 한다/);
    assert.doesNotMatch(chase, /HOW TO FIGHT/);
  });

  it("does not reveal the current candle answer with direction labels", () => {
    const chase = chaseMarkup();

    assert.doesNotMatch(chase, /target-reticle/);
    assert.doesNotMatch(chase, /current-signal/);
    assert.doesNotMatch(chase, /현재 판정봉/);
    assert.doesNotMatch(chase, /\{isUp \? "상승!?" : "하락!?"\}/);
  });

  it("marks the current candle with a neutral dotted guide down to the lower chart area", () => {
    const chase = chaseMarkup();

    assert.match(chase, /className="current-candle-guide"/);
    assert.match(chase, /y2=\{CHASE_VOLUME_BASE\}/);
    assert.doesNotMatch(chase, /x1=\{targetVisual\.x\}/);
    assert.match(
      cssSource,
      /\.current-candle-guide\s*{[\s\S]*?stroke-dasharray:\s*4 5;/,
    );
  });

  it("attaches the pulsing outline to the moving current candle without writing the answer", () => {
    const chase = chaseMarkup();

    assert.match(
      chase,
      /offset === 0 && candle\.isCurrent && \([\s\S]*?className="current-candle-guide"[\s\S]*?className="current-candle-pulse"/,
    );
    assert.doesNotMatch(chase, /x=\{targetVisual\.x - 12\}/);
    assert.match(
      cssSource,
      /\.current-candle-pulse\s*{[\s\S]*?animation:\s*currentCandlePulse/,
    );
  });

  it("uses the same source candle for visible current candle and input judgement", () => {
    assert.match(
      appSource,
      /setCurrentCandle\(\s*createCandle\(CHASE_SOURCE_OFFSET, initialGame\.candleSeed\) as Candle,\s*\)/,
    );
    assert.match(
      appSource,
      /const candleSeed = miniGame\?\.candleSeed \?\? 0;[\s\S]*?createCandle\(CHASE_SOURCE_OFFSET \+ nextStep, candleSeed\) as Candle/,
    );
    assert.match(
      appSource,
      /buildChaseCandles\(candleStep, miniGame\.candleSeed\)/,
    );
  });

  it("moves the chart in candle-sized steps instead of a smooth slide", () => {
    const chase = chaseMarkup();

    assert.match(appSource, /const CHASE_STEP_SECONDS = 0\.6;/);
    assert.match(chase, /"--chart-steps":\s*1/);
    assert.match(chase, /"--chart-step-seconds":\s*CHASE_STEP_SECONDS/);
    assert.match(chase, /"--chart-duration":\s*`\$\{chartDuration\}s`/);
    assert.match(chase, /"--chart-track-width":\s*`\$\{CHASE_STEP_WIDTH\}px`/);
    assert.match(
      cssSource,
      /\.chart-motion\s*{[\s\S]*?animation-timing-function:\s*steps\(var\(--chart-steps,\s*28\),\s*end\);/,
    );
  });

  it("uses a longer generated candle stream instead of repeating a short chart twice", () => {
    const chase = chaseMarkup();

    assert.match(chase, /const chartTrackOffsets = \[0\];/);
    assert.doesNotMatch(chase, /chartTrackOffsets = \[0, CHASE_TRACK_WIDTH\]/);
    assert.match(appSource, /const CHASE_CANDLE_COUNT = 64;/);
  });

  it("slides the runner and chaser on the same tick rhythm as the chart", () => {
    const chase = chaseMarkup();

    assert.match(chase, /className="actor-motion"/);
    assert.match(chase, /key=\{`actor-motion-\$\{candleStep\}`\}/);
    assert.match(chase, /"--chart-track-width":\s*`\$\{CHASE_STEP_WIDTH\}px`/);
    assert.match(chase, /"--chart-steps":\s*1/);
    assert.match(
      cssSource,
      /\.actor-motion\s*{[\s\S]*?animation-name:\s*chartMarquee;/,
    );
  });

  it("places pause between the down and up buttons", () => {
    const chase = chaseMarkup();

    assert.match(chase, /className="pause-button"/);
    assert.match(chase, /aria-label=\{isChasePaused \? "재개" : "일시정지"\}/);
    assert.match(chase, /className=\{`pause-icon \$\{isChasePaused \? "is-play" : "is-pause"\}`\}/);
    assert.match(
      cssSource,
      /\.battle-controls\s*{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)\s*74px\s*minmax\(0,\s*1fr\);/,
    );
    assert.match(
      cssSource,
      /\.pause-button\s*{[\s\S]*?background:\s*#ff8a00;/,
    );
  });

  it("does not draw extra foot bars under the runner or chaser", () => {
    const chase = chaseMarkup();

    assert.doesNotMatch(chase, /className="actor-pad/);
  });

  it("renders a flame aura around the runner while invincible", () => {
    assert.match(cssSource, /\.game-shell\.is-invincible\s+\.runner\.fighter-runner::before/);
    assert.match(cssSource, /animation:\s*fighterFlame/);
    assert.match(cssSource, /@keyframes fighterFlame/);
  });

  it("turns the visible candle stream purple while combo invincibility is active", () => {
    const chase = chaseMarkup();

    assert.match(chase, /const isComboInvincible = miniGame\.invincibleMs > 0;/);
    assert.match(chase, /isComboInvincible \? "is-invincible-candle" : ""/);
    assert.match(
      cssSource,
      /\.chart-candle\.is-invincible-candle\s*{[\s\S]*?color:\s*#8f2ee8;/,
    );
    assert.match(
      cssSource,
      /\.volume-bar\.is-invincible-candle\s*{[\s\S]*?fill:\s*rgba\(143,\s*46,\s*232,\s*\.46\);/,
    );
  });

  it("keeps the 1.5-second combo effect clock independent from mini-game rerenders", () => {
    const effect = appSource.match(
      /useEffect\(\(\) => \{[\s\S]*?const timerDelayMs = CHASE_TICK_MS \/ 4;[\s\S]*?tickMiniGame\(game,\s*elapsedMs,[\s\S]*?\}, \[([^\]]*)\]\);/,
    );

    assert.ok(effect, "chase timer effect should be present");
    assert.match(effect[0], /performance\.now\(\)/);
    assert.doesNotMatch(effect[1], /\bminiGame\b/);
  });

  it("sizes hidden fighter runners large enough for the chart chase", () => {
    assert.match(
      cssSource,
      /\.runner\.fighter-runner:not\(\[data-fighter-id="ant-fighter"\]\)\s*{[\s\S]*?--sprite-scale:\s*\.9;/,
    );
    assert.match(
      cssSource,
      /\.runner\.fighter-runner:not\(\[data-fighter-id="ant-fighter"\]\)\s*{[\s\S]*?width:\s*78px;[\s\S]*?height:\s*82px;/,
    );
  });
});

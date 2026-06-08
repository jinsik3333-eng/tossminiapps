import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const appSource = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const audioUrl = new URL("../src/audio/stockFighterAudio.ts", import.meta.url);
const audioSource = existsSync(audioUrl) ? readFileSync(audioUrl, "utf8") : "";

describe("stock fighter audio contract", () => {
  it("uses a local Web Audio synth instead of shipping third-party music files", () => {
    assert.ok(audioSource, "audio engine should exist");
    assert.match(audioSource, /export type StockFighterTrack/);
    assert.match(audioSource, /export type StockFighterSfx/);
    assert.match(audioSource, /createStockFighterAudio/);
    assert.match(audioSource, /AudioContext/);
    assert.match(audioSource, /createOscillator/);
    assert.doesNotMatch(audioSource, /new Audio\(/);
    assert.doesNotMatch(audioSource, /\.(mp3|aac|wav|ogg)\b/);
  });

  it("routes home, intro, quiz, chase, and ending screens to distinct background tracks", () => {
    assert.match(appSource, /import \{[\s\S]*createStockFighterAudio[\s\S]*stockFighterTrackForScreen/);
    assert.match(appSource, /const audio = useMemo\(\(\) => createStockFighterAudio\(\), \[\]\);/);
    assert.match(appSource, /stockFighterTrackForScreen\(screen, miniGame\)/);
    assert.match(audioSource, /home:/);
    assert.match(audioSource, /intro:/);
    assert.match(audioSource, /quiz:/);
    assert.match(audioSource, /chase:/);
    assert.match(audioSource, /ending:/);
  });

  it("pauses audio when the WebView becomes hidden", () => {
    assert.match(appSource, /document\.addEventListener\("visibilitychange", handleVisibilityChange\)/);
    assert.match(appSource, /audio\.setVisible\(!document\.hidden\)/);
    assert.match(audioSource, /setVisible/);
    assert.match(audioSource, /context\.suspend\(\)/);
  });

  it("plays lightweight effects for answers, hints, mini-game start, shuffle, and reveal", () => {
    assert.match(appSource, /audio\.playSfx\(result\.isCorrect \? "correct" : "wrong"\)/);
    assert.match(appSource, /audio\.playSfx\("hint"\)/);
    assert.match(appSource, /audio\.playSfx\("miniStart"\)/);
    assert.match(appSource, /audio\.playSfx\("shuffleTick"\)/);
    assert.match(appSource, /audio\.playSfx\("cardReveal"\)/);
    assert.match(audioSource, /uiTap/);
    assert.match(audioSource, /chargeReady/);
    assert.match(audioSource, /miniSuccess/);
    assert.match(audioSource, /miniFail/);
  });

  it("primes an audible source during unlock instead of waiting forever on resume", () => {
    const unlockBody = audioSource.match(/async unlock\(\) \{[\s\S]*?\n    \},\n    setTrack/)?.[0] ?? "";

    assert.match(unlockBody, /playUnlockPulse\(activeContext, masterGain\)/);
    assert.match(unlockBody, /void activeContext\.resume\(\)\.then\(startLoop\)/);
    assert.doesNotMatch(unlockBody, /await activeContext\.resume\(\)/);
  });
});

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const appSource = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const audioUrl = new URL("../src/audio/stockFighterAudio.ts", import.meta.url);
const audioSource = existsSync(audioUrl) ? readFileSync(audioUrl, "utf8") : "";

describe("stock fighter audio contract", () => {
  it("uses supplied BGM files for scene music while keeping effects on Web Audio", () => {
    assert.ok(audioSource, "audio engine should exist");
    assert.match(audioSource, /export type StockFighterTrack/);
    assert.match(audioSource, /export type StockFighterSfx/);
    assert.match(audioSource, /createStockFighterAudio/);
    assert.match(audioSource, /AudioContext/);
    assert.match(audioSource, /createOscillator/);
    assert.match(audioSource, /new Audio\(/);
    assert.match(audioSource, /18-stock-fighter-main%20home\.mp3/);
    assert.match(audioSource, /18-stock-fighter-intro\.mp3/);
    assert.match(audioSource, /18-stock-fighter-quiz\.mp3/);
    assert.match(audioSource, /18-stock-fighter-minigame\.mp3/);
    assert.match(audioSource, /18-stock-fighter-ending\.mp3/);
  });

  it("routes home, intro, quiz, chase, and ending screens to distinct background tracks", () => {
    assert.match(appSource, /import \{[\s\S]*createStockFighterAudio[\s\S]*stockFighterTrackForScreen/);
    assert.match(appSource, /const audio = useMemo\(\(\) => createStockFighterAudio\(\), \[\]\);/);
    assert.match(audioSource, /home:/);
    assert.match(audioSource, /intro:/);
    assert.match(audioSource, /quiz:/);
    assert.match(audioSource, /chase:/);
    assert.match(audioSource, /ending:/);
    assert.match(appSource, /stockFighterTrackForScreen\(screen, miniGame,/);
  });

  it("uses the supplied quiz BGM at the same level as standard scene BGM", () => {
    const fileTracks = audioSource.match(/const audioFileTracks[\s\S]*?satisfies/)?.[0] ?? "";
    const homeVolume = Number(fileTracks.match(/home:\s*{[\s\S]*?volume:\s*([0-9.]+)/)?.[1] ?? "0");
    const introVolume = Number(fileTracks.match(/intro:\s*{[\s\S]*?volume:\s*([0-9.]+)/)?.[1] ?? "0");
    const quizVolume = Number(fileTracks.match(/quiz:\s*{[\s\S]*?volume:\s*([0-9.]+)/)?.[1] ?? "0");
    const endingVolume = Number(fileTracks.match(/ending:\s*{[\s\S]*?volume:\s*([0-9.]+)/)?.[1] ?? "0");

    assert.ok(quizVolume > 0, "quiz BGM volume should be configured");
    assert.equal(quizVolume, homeVolume, "quiz BGM should match home BGM volume");
    assert.equal(quizVolume, introVolume, "quiz BGM should match intro BGM volume");
    assert.equal(quizVolume, endingVolume, "quiz BGM should match ending BGM volume");
  });

  it("sets the minigame BGM lower than other supplied BGM files", () => {
    const fileTracks = audioSource.match(/const audioFileTracks[\s\S]*?satisfies/)?.[0] ?? "";
    const homeVolume = Number(fileTracks.match(/home:\s*{[\s\S]*?volume:\s*([0-9.]+)/)?.[1] ?? "0");
    const introVolume = Number(fileTracks.match(/intro:\s*{[\s\S]*?volume:\s*([0-9.]+)/)?.[1] ?? "0");
    const chaseVolume = Number(fileTracks.match(/chase:\s*{[\s\S]*?volume:\s*([0-9.]+)/)?.[1] ?? "0");
    const endingVolume = Number(fileTracks.match(/ending:\s*{[\s\S]*?volume:\s*([0-9.]+)/)?.[1] ?? "0");

    assert.ok(chaseVolume > 0, "minigame BGM volume should be configured");
    assert.ok(chaseVolume < homeVolume, "minigame BGM should be quieter than home BGM");
    assert.ok(chaseVolume < introVolume, "minigame BGM should be quieter than intro BGM");
    assert.ok(chaseVolume < endingVolume, "minigame BGM should be quieter than ending BGM");
  });

  it("keeps supplied BGM quiet enough for WebAudio effects to stay audible", () => {
    const fileTracks = audioSource.match(/const audioFileTracks[\s\S]*?satisfies/)?.[0] ?? "";
    const volumes = [...fileTracks.matchAll(/volume:\s*([0-9.]+)/g)].map((match) => Number(match[1]));
    const chaseVolume = Number(fileTracks.match(/chase:\s*{[\s\S]*?volume:\s*([0-9.]+)/)?.[1] ?? "0");
    const loudestSuppliedBgm = Math.max(...volumes);

    assert.ok(volumes.length >= 5, "all supplied BGM tracks should declare a volume");
    assert.ok(
      loudestSuppliedBgm <= 0.18,
      `supplied BGM should sit behind effects, got ${loudestSuppliedBgm}`,
    );
    assert.ok(
      chaseVolume <= 0.12,
      `minigame BGM should stay extra low for frequent button effects, got ${chaseVolume}`,
    );
  });

  it("lets WebAudio effects cut through supplied BGM without replacing the effect patterns", () => {
    const gainScale = Number(audioSource.match(/const SFX_GAIN_SCALE = ([0-9.]+);/)?.[1] ?? "0");
    const duckScale = Number(audioSource.match(/const BGM_DUCK_VOLUME_SCALE = ([0-9.]+);/)?.[1] ?? "1");
    const playSfxBody = audioSource.match(/playSfx\(kind: StockFighterSfx\) \{[\s\S]*?\n    \},\n    dispose/)?.[0] ?? "";
    const playSfxPatternBody = audioSource.match(/const playSfxPattern = \([\s\S]*?\n  \};/)?.[0] ?? "";

    assert.ok(gainScale >= 2, `WebAudio effects should be boosted above old synth gains, got ${gainScale}`);
    assert.ok(duckScale > 0 && duckScale <= 0.45, `BGM should briefly duck under effects, got ${duckScale}`);
    assert.match(audioSource, /const duckAudioFileTrack = \(\) => \{/);
    assert.match(audioSource, /musicElement\.volume = settings\.volume \* BGM_DUCK_VOLUME_SCALE/);
    assert.match(audioSource, /const restoreAudioFileTrackVolume = \(\) => \{/);
    assert.match(audioSource, /window\.clearTimeout\(musicDuckTimer\)/);
    assert.match(playSfxBody, /playSfxPattern\(activeContext, masterGain, kind\)/);
    assert.match(playSfxPatternBody, /duckAudioFileTrack\(\);/);
    assert.match(playSfxPatternBody, /playTone\(activeContext, output, step, startedAt\)/);
  });

  it("does not drop WebAudio effects while the AudioContext is resuming", () => {
    const playSfxBody = audioSource.match(/playSfx\(kind: StockFighterSfx\) \{[\s\S]*?\n    \},\n    dispose/)?.[0] ?? "";

    assert.match(playSfxBody, /activeContext\.state === "suspended"/);
    assert.match(playSfxBody, /activeContext\.resume\(\)\.then\(\(\) => \{/);
    assert.match(playSfxBody, /playSfxPattern\(activeContext, masterGain, kind\)/);
    assert.match(playSfxBody, /\.catch\(handleResumeError\)/);
  });

  it("mutes background music on the ending shuffle draw while leaving shuffle effects active", () => {
    assert.match(audioSource, /type StockFighterAudioScene/);
    assert.match(audioSource, /screen === "ending" && scene\.isEndingDraw/);
    assert.match(
      appSource,
      /const isEndingDrawAudioMuted = screen === "ending" && endingIndex >= endingPanels\.length;/,
    );
    assert.match(
      appSource,
      /stockFighterTrackForScreen\(screen, miniGame, \{ isEndingDraw: isEndingDrawAudioMuted \}\)/,
    );
    assert.match(appSource, /audio\.playSfx\("shuffleTick"\)/);
    assert.match(appSource, /audio\.playSfx\("cardReveal"\)/);
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

  it("makes the ending shuffle effect audible as a short multi-step roll", () => {
    const shufflePattern = audioSource.match(/shuffleTick:\s*\[([\s\S]*?)\],\n  cardReveal/)?.[1] ?? "";
    const durations = [...shufflePattern.matchAll(/duration:\s*([0-9.]+)/g)].map((match) =>
      Number(match[1]),
    );

    assert.ok(durations.length >= 3, "shuffle effect should have multiple tone steps");
    assert.ok(Math.max(...durations) >= 0.07, "shuffle tones should be long enough to hear");
    assert.match(shufflePattern, /frequency:\s*420/);
    assert.match(shufflePattern, /frequency:\s*760/);
    assert.match(shufflePattern, /frequency:\s*980/);
  });

  it("primes an audible source during unlock instead of waiting forever on resume", () => {
    const unlockBody = audioSource.match(/async unlock\(\) \{[\s\S]*?\n    \},\n    setTrack/)?.[0] ?? "";

    assert.match(unlockBody, /playUnlockPulse\(activeContext, masterGain\)/);
    assert.match(unlockBody, /void activeContext\.resume\(\)\.then\(startLoop\)/);
    assert.doesNotMatch(unlockBody, /await activeContext\.resume\(\)/);
  });
});

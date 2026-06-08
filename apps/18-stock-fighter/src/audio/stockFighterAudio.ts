export type StockFighterTrack = "none" | "home" | "intro" | "quiz" | "chase" | "ending";

export type StockFighterSfx =
  | "uiTap"
  | "correct"
  | "wrong"
  | "hint"
  | "chargeReady"
  | "miniStart"
  | "shuffleTick"
  | "cardReveal"
  | "miniSuccess"
  | "miniFail";

export type StockFighterAudioScreen =
  | "home"
  | "intro"
  | "quiz"
  | "chase"
  | "collection"
  | "ending"
  | "result";

type StockFighterAudioMiniGame = {
  readonly ended: boolean;
  readonly result: "running" | "ko" | "survived";
} | null;

type TrackPattern = {
  readonly tempoMs: number;
  readonly wave: OscillatorType;
  readonly volume: number;
  readonly notes: readonly number[];
  readonly bass: readonly number[];
};

type SfxStep = {
  readonly at: number;
  readonly frequency: number;
  readonly duration: number;
  readonly type: OscillatorType;
  readonly gain: number;
  readonly end?: number;
};

declare global {
  interface Window {
    readonly webkitAudioContext?: typeof AudioContext;
  }
}

const trackPatterns: Record<Exclude<StockFighterTrack, "none">, TrackPattern> = {
  home: {
    tempoMs: 315,
    wave: "triangle",
    volume: 0.052,
    notes: [392, 494, 523, 659, 587, 523, 494, 440],
    bass: [98, 123.47, 130.81, 146.83],
  },
  intro: {
    tempoMs: 380,
    wave: "sine",
    volume: 0.048,
    notes: [261.63, 329.63, 392, 493.88, 440, 392],
    bass: [65.41, 82.41, 98, 82.41],
  },
  quiz: {
    tempoMs: 280,
    wave: "square",
    volume: 0.042,
    notes: [329.63, 392, 440, 523.25, 493.88, 440, 392, 349.23],
    bass: [82.41, 110, 98, 123.47],
  },
  chase: {
    tempoMs: 178,
    wave: "sawtooth",
    volume: 0.036,
    notes: [523.25, 659.25, 783.99, 698.46, 659.25, 587.33, 523.25, 493.88],
    bass: [130.81, 146.83, 164.81, 146.83],
  },
  ending: {
    tempoMs: 430,
    wave: "triangle",
    volume: 0.054,
    notes: [392, 523.25, 659.25, 783.99, 659.25, 587.33, 523.25, 493.88],
    bass: [98, 130.81, 146.83, 123.47],
  },
};

const sfxPatterns: Record<StockFighterSfx, readonly SfxStep[]> = {
  uiTap: [{ at: 0, frequency: 620, duration: 0.045, type: "square", gain: 0.055 }],
  correct: [
    { at: 0, frequency: 523.25, duration: 0.07, type: "triangle", gain: 0.06 },
    { at: 0.075, frequency: 783.99, duration: 0.1, type: "triangle", gain: 0.06 },
  ],
  wrong: [
    { at: 0, frequency: 220, duration: 0.08, type: "sawtooth", gain: 0.052, end: 140 },
    { at: 0.09, frequency: 164.81, duration: 0.11, type: "sawtooth", gain: 0.048, end: 110 },
  ],
  hint: [
    { at: 0, frequency: 880, duration: 0.055, type: "sine", gain: 0.04 },
    { at: 0.06, frequency: 1174.66, duration: 0.085, type: "sine", gain: 0.04 },
  ],
  chargeReady: [
    { at: 0, frequency: 261.63, duration: 0.08, type: "square", gain: 0.045 },
    { at: 0.07, frequency: 392, duration: 0.08, type: "square", gain: 0.05 },
    { at: 0.14, frequency: 659.25, duration: 0.14, type: "square", gain: 0.055 },
  ],
  miniStart: [
    { at: 0, frequency: 196, duration: 0.07, type: "sawtooth", gain: 0.045 },
    { at: 0.06, frequency: 392, duration: 0.09, type: "sawtooth", gain: 0.052 },
    { at: 0.13, frequency: 784, duration: 0.12, type: "sawtooth", gain: 0.06 },
  ],
  shuffleTick: [{ at: 0, frequency: 980, duration: 0.035, type: "square", gain: 0.042 }],
  cardReveal: [
    { at: 0, frequency: 440, duration: 0.07, type: "triangle", gain: 0.052 },
    { at: 0.07, frequency: 659.25, duration: 0.08, type: "triangle", gain: 0.056 },
    { at: 0.15, frequency: 987.77, duration: 0.18, type: "triangle", gain: 0.06 },
  ],
  miniSuccess: [
    { at: 0, frequency: 523.25, duration: 0.065, type: "square", gain: 0.052 },
    { at: 0.07, frequency: 659.25, duration: 0.075, type: "square", gain: 0.056 },
    { at: 0.15, frequency: 783.99, duration: 0.16, type: "square", gain: 0.06 },
  ],
  miniFail: [
    { at: 0, frequency: 246.94, duration: 0.08, type: "sawtooth", gain: 0.052, end: 174.61 },
    { at: 0.09, frequency: 174.61, duration: 0.15, type: "sawtooth", gain: 0.048, end: 130.81 },
  ],
};

function playTone(
  context: AudioContext,
  output: AudioNode,
  step: SfxStep,
  startedAt: number,
): void {
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  const startAt = startedAt + step.at;
  const endAt = startAt + step.duration;

  oscillator.type = step.type;
  oscillator.frequency.setValueAtTime(step.frequency, startAt);
  if (step.end != null) {
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, step.end), endAt);
  }
  envelope.gain.setValueAtTime(0.0001, startAt);
  envelope.gain.exponentialRampToValueAtTime(step.gain, startAt + 0.012);
  envelope.gain.exponentialRampToValueAtTime(0.0001, endAt);
  oscillator.connect(envelope);
  envelope.connect(output);
  oscillator.start(startAt);
  oscillator.stop(endAt + 0.025);
}

function playMusicTone(
  context: AudioContext,
  output: AudioNode,
  frequency: number,
  type: OscillatorType,
  gain: number,
  duration: number,
): void {
  playTone(
    context,
    output,
    { at: 0, frequency, duration, type, gain },
    context.currentTime,
  );
}

function playUnlockPulse(context: AudioContext, output: AudioNode | null): void {
  if (output == null) {
    return;
  }

  const startedAt = context.currentTime;
  const pulse: readonly SfxStep[] = [
    { at: 0, frequency: 523.25, duration: 0.07, type: "square", gain: 0.09 },
    { at: 0.06, frequency: 783.99, duration: 0.12, type: "square", gain: 0.095 },
  ];

  for (const step of pulse) {
    playTone(context, output, step, startedAt);
  }
}

export function stockFighterTrackForScreen(
  screen: StockFighterAudioScreen,
  miniGame: StockFighterAudioMiniGame,
): StockFighterTrack {
  if (screen === "chase") {
    return miniGame?.ended ? "quiz" : "chase";
  }

  if (screen === "home" || screen === "collection") {
    return "home";
  }

  if (screen === "intro") {
    return "intro";
  }

  if (screen === "quiz") {
    return "quiz";
  }

  return "ending";
}

export function createStockFighterAudio() {
  let context: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  let musicTimer: number | null = null;
  let beatIndex = 0;
  let currentTrack: StockFighterTrack = "none";
  let isUnlocked = false;
  let isVisible = true;

  const stopLoop = () => {
    if (musicTimer == null) {
      return;
    }

    window.clearInterval(musicTimer);
    musicTimer = null;
  };

  const ensureContext = () => {
    if (context != null) {
      return context;
    }

    if (typeof window === "undefined") {
      return null;
    }

    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    if (AudioContextClass == null) {
      return null;
    }

    context = new AudioContextClass();
    masterGain = context.createGain();
    masterGain.gain.value = 0.62;
    masterGain.connect(context.destination);
    return context;
  };

  const playBeat = () => {
    if (!isUnlocked || !isVisible || currentTrack === "none") {
      return;
    }

    const activeContext = ensureContext();
    if (activeContext == null || masterGain == null || activeContext.state !== "running") {
      return;
    }

    const pattern = trackPatterns[currentTrack];
    const lead = pattern.notes[beatIndex % pattern.notes.length];
    const bass = pattern.bass[Math.floor(beatIndex / 2) % pattern.bass.length];

    playMusicTone(activeContext, masterGain, lead, pattern.wave, pattern.volume, 0.105);
    if (beatIndex % 2 === 0) {
      playMusicTone(activeContext, masterGain, bass, "triangle", pattern.volume * 0.78, 0.16);
    }
    beatIndex += 1;
  };

  const startLoop = () => {
    stopLoop();
    if (!isUnlocked || !isVisible || currentTrack === "none") {
      return;
    }

    playBeat();
    musicTimer = window.setInterval(playBeat, trackPatterns[currentTrack].tempoMs);
  };

  return {
    async unlock() {
      const activeContext = ensureContext();
      if (activeContext == null) {
        return false;
      }

      playUnlockPulse(activeContext, masterGain);
      isUnlocked = true;

      if (activeContext.state === "suspended") {
        void activeContext.resume().then(startLoop).catch(() => {
          isUnlocked = false;
          stopLoop();
        });
        return true;
      }

      startLoop();
      return true;
    },
    setTrack(track: StockFighterTrack) {
      currentTrack = track;
      beatIndex = 0;
      startLoop();
    },
    setVisible(visible: boolean) {
      isVisible = visible;
      if (context == null) {
        return;
      }

      if (!visible) {
        stopLoop();
        void context.suspend();
        return;
      }

      if (isUnlocked) {
        void context.resume().then(startLoop);
      }
    },
    playSfx(kind: StockFighterSfx) {
      if (!isUnlocked) {
        return;
      }

      const activeContext = ensureContext();
      if (activeContext == null || masterGain == null || activeContext.state !== "running") {
        return;
      }

      const startedAt = activeContext.currentTime;
      for (const step of sfxPatterns[kind]) {
        playTone(activeContext, masterGain, step, startedAt);
      }
    },
    dispose() {
      stopLoop();
      void context?.close();
      context = null;
      masterGain = null;
    },
  };
}

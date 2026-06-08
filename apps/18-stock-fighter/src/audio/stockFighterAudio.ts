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

type StockFighterAudioScene = {
  readonly isEndingDraw: boolean;
};

type AudioFileTrack = "home" | "intro" | "quiz" | "chase" | "ending";

type AudioFileTrackSettings = {
  readonly src: string;
  readonly volume: number;
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

const BGM_ASSET_BASE = "/assets/stock-fighter/bgm";
const SFX_GAIN_SCALE = 2.4;
const SFX_GAIN_CEILING = 0.16;
const BGM_DUCK_VOLUME_SCALE = 0.35;
const BGM_DUCK_MS = 380;

const audioFileTracks = {
  home: {
    src: `${BGM_ASSET_BASE}/18-stock-fighter-main%20home.mp3`,
    volume: 0.18,
  },
  intro: {
    src: `${BGM_ASSET_BASE}/18-stock-fighter-intro.mp3`,
    volume: 0.18,
  },
  quiz: {
    src: `${BGM_ASSET_BASE}/18-stock-fighter-quiz.mp3`,
    volume: 0.18,
  },
  chase: {
    src: `${BGM_ASSET_BASE}/18-stock-fighter-minigame.mp3`,
    volume: 0.12,
  },
  ending: {
    src: `${BGM_ASSET_BASE}/18-stock-fighter-ending.mp3`,
    volume: 0.18,
  },
} satisfies Record<AudioFileTrack, AudioFileTrackSettings>;

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
  shuffleTick: [
    { at: 0, frequency: 420, duration: 0.08, type: "square", gain: 0.058, end: 620 },
    { at: 0.04, frequency: 760, duration: 0.075, type: "triangle", gain: 0.052, end: 540 },
    { at: 0.09, frequency: 980, duration: 0.065, type: "square", gain: 0.044, end: 740 },
  ],
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
  const peakGain = Math.min(SFX_GAIN_CEILING, step.gain * SFX_GAIN_SCALE);

  oscillator.type = step.type;
  oscillator.frequency.setValueAtTime(step.frequency, startAt);
  if (step.end != null) {
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, step.end), endAt);
  }
  envelope.gain.setValueAtTime(0.0001, startAt);
  envelope.gain.exponentialRampToValueAtTime(peakGain, startAt + 0.012);
  envelope.gain.exponentialRampToValueAtTime(0.0001, endAt);
  oscillator.connect(envelope);
  envelope.connect(output);
  oscillator.start(startAt);
  oscillator.stop(endAt + 0.025);
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

function isAudioFileTrack(track: StockFighterTrack): track is AudioFileTrack {
  return (
    track === "home" ||
    track === "intro" ||
    track === "quiz" ||
    track === "chase" ||
    track === "ending"
  );
}

function handleAudioPlayError(error: unknown): void {
  if (
    error instanceof DOMException &&
    (error.name === "AbortError" || error.name === "NotAllowedError")
  ) {
    return;
  }

  throw error;
}

export function stockFighterTrackForScreen(
  screen: StockFighterAudioScreen,
  miniGame: StockFighterAudioMiniGame,
  scene: StockFighterAudioScene = { isEndingDraw: false },
): StockFighterTrack {
  if (screen === "chase") {
    return miniGame?.ended ? "quiz" : "chase";
  }

  if (screen === "ending" && scene.isEndingDraw) {
    return "none";
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
  let musicElement: HTMLAudioElement | null = null;
  let musicElementTrack: AudioFileTrack | null = null;
  let musicDuckTimer: number | null = null;
  let currentTrack: StockFighterTrack = "none";
  let isUnlocked = false;
  let isVisible = true;

  const clearMusicDuckTimer = () => {
    if (musicDuckTimer == null || typeof window === "undefined") {
      return;
    }

    window.clearTimeout(musicDuckTimer);
    musicDuckTimer = null;
  };

  const restoreAudioFileTrackVolume = () => {
    if (musicElement == null || musicElementTrack == null) {
      return;
    }

    musicElement.volume = audioFileTracks[musicElementTrack].volume;
  };

  const stopAudioFileTrack = (resetPosition: boolean) => {
    if (resetPosition) {
      clearMusicDuckTimer();
    }

    if (musicElement == null) {
      return;
    }

    musicElement.pause();
    if (resetPosition) {
      musicElement.currentTime = 0;
      musicElement = null;
      musicElementTrack = null;
    }
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

  const startAudioFileTrack = (track: AudioFileTrack) => {
    const settings = audioFileTracks[track];
    if (typeof Audio === "undefined") {
      return;
    }

    if (musicElement == null || musicElementTrack !== track) {
      stopAudioFileTrack(true);
      musicElement = new Audio(settings.src);
      musicElement.loop = true;
      musicElement.preload = "auto";
      musicElementTrack = track;
    }

    musicElement.volume =
      musicDuckTimer == null ? settings.volume : settings.volume * BGM_DUCK_VOLUME_SCALE;
    if (musicElement.paused) {
      void musicElement.play().catch(handleAudioPlayError);
    }
  };

  const duckAudioFileTrack = () => {
    if (musicElement == null || musicElementTrack == null) {
      return;
    }

    clearMusicDuckTimer();
    const settings = audioFileTracks[musicElementTrack];
    musicElement.volume = settings.volume * BGM_DUCK_VOLUME_SCALE;
    musicDuckTimer = window.setTimeout(() => {
      musicDuckTimer = null;
      restoreAudioFileTrackVolume();
    }, BGM_DUCK_MS);
  };

  const startLoop = () => {
    if (!isUnlocked || currentTrack === "none") {
      stopAudioFileTrack(true);
      return;
    }

    if (!isVisible) {
      stopAudioFileTrack(false);
      return;
    }

    if (isAudioFileTrack(currentTrack)) {
      startAudioFileTrack(currentTrack);
    }
  };

  const handleResumeError = (error: unknown) => {
    isUnlocked = false;
    stopAudioFileTrack(true);

    if (error instanceof DOMException && error.name === "InvalidStateError") {
      return;
    }

    throw error;
  };

  const playSfxPattern = (
    activeContext: AudioContext,
    output: AudioNode,
    kind: StockFighterSfx,
  ) => {
    duckAudioFileTrack();
    const startedAt = activeContext.currentTime;
    for (const step of sfxPatterns[kind]) {
      playTone(activeContext, output, step, startedAt);
    }
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
        void activeContext.resume().then(startLoop).catch(handleResumeError);
        return true;
      }

      startLoop();
      return true;
    },
    setTrack(track: StockFighterTrack) {
      if (currentTrack === track) {
        return;
      }

      currentTrack = track;
      startLoop();
    },
    setVisible(visible: boolean) {
      isVisible = visible;
      if (context == null) {
        if (!visible) {
          stopAudioFileTrack(false);
        }
        return;
      }

      if (!visible) {
        stopAudioFileTrack(false);
        void context.suspend();
        return;
      }

      if (isUnlocked) {
        void context.resume().then(startLoop).catch(handleResumeError);
      }
    },
    playSfx(kind: StockFighterSfx) {
      if (!isUnlocked) {
        return;
      }

      const activeContext = ensureContext();
      if (activeContext == null || masterGain == null) {
        return;
      }

      if (activeContext.state === "suspended") {
        void activeContext.resume().then(() => {
          if (masterGain == null || activeContext.state !== "running") {
            return;
          }

          startLoop();
          playSfxPattern(activeContext, masterGain, kind);
        }).catch(handleResumeError);
        return;
      }

      if (activeContext.state !== "running") {
        return;
      }

      playSfxPattern(activeContext, masterGain, kind);
    },
    dispose() {
      stopAudioFileTrack(true);
      void context?.close();
      context = null;
      masterGain = null;
    },
  };
}

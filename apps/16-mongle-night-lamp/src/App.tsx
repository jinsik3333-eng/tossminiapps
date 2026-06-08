import { useEffect, useMemo, useState, type CSSProperties } from "react";

import "./App.css";

type AdSlot = {
  label: string;
  title: string;
  note: string;
};

type Theme = {
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  accent: string;
  soft: string;
  opening: string;
  motif: string;
  hero: string;
  heroNote: string;
  tapLines: string[];
  chips: string[];
  slots: AdSlot[];
  focusTitle: string;
  focusNote: string;
  summary: string;
};

type Persisted = {
  tapCount: number;
  adCount: number;
  best: number;
  slotIndex: number;
  message: string;
};

const APP_SLUG = "mongle-night-lamp";
const STORAGE_KEY = `${APP_SLUG}-state-v1`;

const THEME: Theme = {
  slug: APP_SLUG,
  title: "몽글 별빛방",
  subtitle: "한 화면에서만 놀고, 광고 칸은 아래에 늘 열려 있어요.",
  badge: "멍때리기 + 광고 칸",
  accent: "#8B63FF",
  soft: "#ECE2FF",
  opening: "광고 칸은 방 안에서 계속 켜져 있어요.",
  motif: "별빛",
  hero: "별빛을 톡톡 켜는 조용한 방",
  heroNote: "깊이를 하나만 두고, 광고 칸은 방 한쪽에 계속 보이게 했어요.",
  tapLines: [
  "별빛이 한 톨 더 켜졌어요.",
  "등불이 살짝 흔들렸어요.",
  "밤공기가 조용히 밝아져요.",
  "반짝 점이 천장에 붙었어요."
],
  chips: [
  "별 켜기",
  "숨 고르기",
  "멍감상",
  "보상 칸"
],
  slots: [
  {
    "label": "등불",
    "title": "등불 칸",
    "note": "등불 칸을 눌러 같은 장면을 다시 밝힐 수 있어요."
  },
  {
    "label": "별",
    "title": "별칸",
    "note": "별칸은 반복 탭이 필요한 자리예요."
  },
  {
    "label": "달빛",
    "title": "달빛 칸",
    "note": "달빛 칸은 언제든 열려 있는 광고 자리예요."
  }
],
  focusTitle: "오늘의 별빛",
  focusNote: "한 번의 액션 뒤에 또 다른 화면으로 넘기지 않습니다.",
  summary: "별빛",
};

const DEFAULT_STATE: Persisted = {
  tapCount: 0,
  adCount: 0,
  best: 0,
  slotIndex: 0,
  message: THEME.opening,
};

function readPersisted(): Persisted {
  if (typeof window === "undefined") {
    return DEFAULT_STATE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      tapCount: Number.isFinite(parsed.tapCount) ? Number(parsed.tapCount) : 0,
      adCount: Number.isFinite(parsed.adCount) ? Number(parsed.adCount) : 0,
      best: Number.isFinite(parsed.best) ? Number(parsed.best) : 0,
      slotIndex: Number.isFinite(parsed.slotIndex) ? Number(parsed.slotIndex) : 0,
      message: typeof parsed.message === "string" && parsed.message.trim() ? parsed.message : THEME.opening,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function App() {
  const [tapCount, setTapCount] = useState(() => readPersisted().tapCount);
  const [adCount, setAdCount] = useState(() => readPersisted().adCount);
  const [best, setBest] = useState(() => readPersisted().best);
  const [slotIndex, setSlotIndex] = useState(() => readPersisted().slotIndex);
  const [message, setMessage] = useState(() => readPersisted().message);
  const [pulse, setPulse] = useState(0);
  const [chipIndex, setChipIndex] = useState(0);

  const currentSlot = THEME.slots[slotIndex % THEME.slots.length];
  const score = useMemo(() => tapCount * 2 + adCount * 3, [adCount, tapCount]);
  const streakLine = useMemo(() => {
    if (tapCount === 0) return "첫 탭 준비 완료";
    if (tapCount < 5) return `터치 ${tapCount}회 · 아직 가벼운 멍모드`;
    if (tapCount < 12) return `터치 ${tapCount}회 · 흐름이 살아났어요`;
    return `터치 ${tapCount}회 · 반복 터치 리듬 좋음`;
  }, [tapCount]);

  useEffect(() => {
    const nextBest = Math.max(best, score);
    if (nextBest !== best) {
      setBest(nextBest);
    }
    if (typeof window !== "undefined") {
      const persisted: Persisted = { tapCount, adCount, best: nextBest, slotIndex, message };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    }
  }, [adCount, best, message, score, slotIndex, tapCount]);

  const themeStyle = {
    "--accent": THEME.accent,
    "--accent-soft": THEME.soft,
  } as CSSProperties;

  const handleMainTap = () => {
    const nextTap = tapCount + 1;
    const nextPulse = (pulse + 1) % 8;
    setTapCount(nextTap);
    setPulse(nextPulse);
    setChipIndex((value) => (value + 1) % THEME.chips.length);
    setMessage(THEME.tapLines[(nextTap - 1) % THEME.tapLines.length]);
  };

  const handleChipTap = (index: number) => {
    setSlotIndex(index % THEME.slots.length);
    setAdCount((value) => value + 1);
    setMessage(THEME.slots[index % THEME.slots.length].note);
    setPulse((value) => (value + 2) % 8);
  };

  return (
    <div className="app-shell" style={themeStyle}>
      <main className="phone-card">
        <header className="topbar">
          <div>
            <p>{THEME.badge}</p>
            <strong>{THEME.title}</strong>
          </div>
          <span>한 화면 · 광고 칸 고정</span>
        </header>

        <section className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">{THEME.summary}</p>
            <h1>{THEME.hero}</h1>
            <p className="promise">{THEME.heroNote}</p>
          </div>
          <button className={`hero-orb pulse-${pulse}`} type="button" onClick={handleMainTap} aria-label={`${THEME.title} 터치`}>
            <img className="hero-art" src="/app-icon.png" alt="" aria-hidden="true" />
            <span className="motif-badge">{THEME.motif}</span>
            <strong>{tapCount.toString().padStart(2, "0")}</strong>
            <small>터치</small>
          </button>
        </section>

        <section className="message-card">
          <div>
            <span>{THEME.focusTitle}</span>
            <strong>{message}</strong>
          </div>
          <p>{THEME.focusNote}</p>
        </section>

        <section className="chip-grid" aria-label="빠른 터치 칩">
          {THEME.chips.map((chip, index) => (
            <button key={chip} className={index === chipIndex ? "chip active" : "chip"} type="button" onClick={handleMainTap}>
              {chip}
            </button>
          ))}
        </section>

        <section className="stat-grid">
          <div>
            <span>터치</span>
            <strong>{tapCount}</strong>
          </div>
          <div>
            <span>광고 칸</span>
            <strong>{adCount}</strong>
          </div>
          <div>
            <span>점수</span>
            <strong>{score}</strong>
          </div>
          <div>
            <span>최고</span>
            <strong>{best}</strong>
          </div>
        </section>

        <section className="ad-dock">
          <div className="ad-dock-head">
            <span>광고 칸</span>
            <strong>언제든 다시 탭</strong>
          </div>
          <div className="ad-dock-body">
            <div>
              <strong>{currentSlot.title}</strong>
              <p>{currentSlot.note}</p>
            </div>
            <button className="dock-badge" type="button" onClick={() => handleChipTap(slotIndex)}>
              다시 누르기
            </button>
          </div>
          <div className="ad-chip-row" role="group" aria-label="광고 칸 선택">
            {THEME.slots.map((slot, index) => (
              <button key={slot.label} className={index === slotIndex ? "ad-chip active" : "ad-chip"} type="button" onClick={() => handleChipTap(index)}>
                <span>{slot.label}</span>
                <strong>{index + 1}</strong>
              </button>
            ))}
          </div>
          <p className="dock-note">{streakLine} · 광고 칸은 페이지 이동 없이 계속 켜져 있어요.</p>
        </section>
      </main>
    </div>
  );
}

export default App;

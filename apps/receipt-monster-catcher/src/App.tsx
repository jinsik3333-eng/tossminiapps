import { useEffect, useState } from "react";
import heroImage from "./assets/receipt-monster-hero.jpg";
import "./App.css";

type Screen = "home" | "hunt" | "result";
type MonsterType = "delivery" | "snack" | "shopping" | "subscription";

type Monster = {
  type: MonsterType;
  name: string;
  label: string;
  color: string;
  clue: string;
  routine: string;
  wrongMove: string;
};

const MONSTERS: Monster[] = [
  {
    type: "delivery",
    name: "배달 봉투몬",
    label: "배달",
    color: "#3182f6",
    clue: "배고픈 순간에 바로 주문 버튼을 누르는 패턴을 잡았어요.",
    routine: "주문 전 냉장고 1분 확인",
    wrongMove: "앱부터 열기",
  },
  {
    type: "snack",
    name: "간식 부스럭몬",
    label: "간식",
    color: "#ff8a3d",
    clue: "작은 간식이 반복되면 하루 리듬이 흐려질 수 있어요.",
    routine: "오후 간식 시간 하나만 정하기",
    wrongMove: "계산대 앞 추가",
  },
  {
    type: "shopping",
    name: "세일 반짝몬",
    label: "쇼핑",
    color: "#8b5cf6",
    clue: "오늘만이라는 말에 장바구니가 빠르게 차는 순간을 잡았어요.",
    routine: "장바구니 하루 보류",
    wrongMove: "바로 결제하기",
  },
  {
    type: "subscription",
    name: "구독 숨바꼭질몬",
    label: "구독",
    color: "#00c773",
    clue: "쓰지 않는 구독이 조용히 남아있는지 확인할 차례예요.",
    routine: "이번 주 구독 1개 점검",
    wrongMove: "나중에 보기",
  },
];

const STORAGE_KEY = "receipt-monster-catcher-stamps";

function readStamps() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function todayIndex() {
  return Math.floor(Date.now() / 86_400_000) % MONSTERS.length;
}

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [monsterIndex, setMonsterIndex] = useState(() => todayIndex());
  const [hp, setHp] = useState(7);
  const [combo, setCombo] = useState(0);
  const [stamps, setStamps] = useState<string[]>(() => readStamps());
  const [routineOpen, setRoutineOpen] = useState(false);
  const [caughtAt, setCaughtAt] = useState<string | null>(null);

  const monster = MONSTERS[monsterIndex];
  const progress = Math.min(100, Math.round(((7 - hp) / 7) * 100));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stamps.slice(-30)));
  }, [stamps]);

  const startHunt = () => {
    setMonsterIndex((todayIndex() + stamps.length) % MONSTERS.length);
    setHp(7);
    setCombo(0);
    setRoutineOpen(false);
    setCaughtAt(null);
    setScreen("hunt");
  };

  const tapMonster = () => {
    setHp((value) => {
      const next = Math.max(0, value - 1);
      setCombo((count) => count + 1);
      if (next === 0) {
        const stamp = new Date().toISOString().slice(0, 10);
        setCaughtAt(stamp);
        setStamps((items) =>
          items.includes(stamp) ? items : [...items, stamp],
        );
        window.setTimeout(() => setScreen("result"), 260);
      }
      return next;
    });
  };

  const resetHome = () => {
    setScreen("home");
    setHp(7);
    setCombo(0);
  };

  return (
    <main className="app-shell">
      <RetentionNudge />

      {screen === "home" ? (
        <>
          <section className="hero-card">
            <div className="eyebrow">오늘의 터치 미션</div>
            <h1>영수증 몬스터를 잡고 소비 단서를 모아요</h1>
            <p>
              실제 영수증을 올리지 않아도 괜찮아요. 오늘 떠오르는 소비 상황을
              터치 게임으로 가볍게 정리해요.
            </p>
            <HeroArt monster={monster} />
            <div className="stamp-row" aria-label="수집 현황">
              <button type="button">단서 {stamps.length % 30}/30</button>
              <span>내일은 다른 몬스터가 나와요</span>
            </div>
            <button
              className="primary-button"
              type="button"
              onClick={startHunt}
            >
              오늘의 몬스터 잡기
            </button>
          </section>

          <section className="info-card">
            <h2>잡으면 열리는 것</h2>
            <div className="feature-grid">
              <Feature
                title="소비 단서"
                desc="오늘 흔들린 순간을 한 줄로 확인"
              />
              <Feature title="방어 루틴" desc="바로 해볼 수 있는 작은 행동" />
              <Feature title="30일 기록" desc="잡은 몬스터를 차곡차곡 저장" />
            </div>
          </section>
        </>
      ) : null}

      {screen === "hunt" ? (
        <section className="play-card">
          <div className="top-row">
            <button className="back-button" type="button" onClick={resetHome}>
              ← 홈
            </button>
            <strong>터치해서 잡기</strong>
          </div>
          <HeroArt monster={monster} compact hp={hp} />
          <div className="monster-status">
            <span>{monster.name}</span>
            <b>HP {hp}/7</b>
          </div>
          <div className="hp-bar" aria-label="몬스터 포획 진행률">
            <span
              style={{ width: `${progress}%`, background: monster.color }}
            />
          </div>
          <button className="monster-button" type="button" onClick={tapMonster}>
            <span
              className={`monster-face ${combo > 4 ? "combo" : ""}`}
              style={{ background: monster.color }}
            >
              <i className="monster-eye left" />
              <i className="monster-eye right" />
              <i className="monster-mouth" />
              <i className="monster-spark" />
            </span>
            <strong>영수증 몬스터 터치!</strong>
            <small>연속 터치 {combo}</small>
          </button>
          <div className="choice-warning">
            <span>잡아야 할 움직임</span>
            <b>{monster.label} 소비가 떠오르는 순간</b>
          </div>
          <AdBox label="터치 화면 하단 광고" />
        </section>
      ) : null}

      {screen === "result" ? (
        <section className="result-card">
          <div className="top-row">
            <button className="back-button" type="button" onClick={resetHome}>
              ← 홈
            </button>
            <strong>포획 완료</strong>
          </div>
          <div className="result-hero" style={{ background: monster.color }}>
            <span>✓</span>
            <p>{monster.name} 포획</p>
          </div>
          <h2>{monster.routine}</h2>
          <p className="result-copy">{monster.clue}</p>
          <div className="clue-card">
            <span>오늘의 단서</span>
            <strong>{monster.wrongMove}</strong>
            <p>다음에 같은 상황이 오면 10초만 멈추고 선택지를 다시 봐요.</p>
          </div>
          <button
            className="secondary-button"
            type="button"
            onClick={() => setRoutineOpen(true)}
          >
            {routineOpen ? "루틴 카드 열림" : "광고 보고 루틴 카드 열기"}
          </button>
          {routineOpen ? (
            <div className="routine-card">
              <strong>추가 루틴 카드</strong>
              <p>
                {monster.routine}를 오늘 한 번만 체크해요. 기록은 이 기기
                안에서만 이어져요.
              </p>
              <span>{caughtAt ?? "오늘"} 단서 저장</span>
            </div>
          ) : null}
          <button className="primary-button" type="button" onClick={startHunt}>
            다른 몬스터 한 번 더 보기
          </button>
        </section>
      ) : null}

      <CherryMenu />
      <div className="ad-loop-pill">AD · 광고 보고 추가 루틴 카드 열기</div>
      <AdBox label="하단 배너 광고" />
    </main>
  );
}

function HeroArt({
  monster,
  compact = false,
  hp = 7,
}: {
  monster: Monster;
  compact?: boolean;
  hp?: number;
}) {
  const targetClass = hp <= 2 ? " danger" : hp <= 4 ? " hit" : "";
  return (
    <div
      className={compact ? "hero-art compact" : "hero-art"}
      aria-hidden="true"
    >
      <img src={heroImage} alt="" />
      <div
        className={`tap-target${targetClass}`}
        style={{ borderColor: monster.color }}
      >
        <span style={{ background: monster.color }} />
      </div>
      <div className="hero-chip left">{monster.label} 단서</div>
      <div className="hero-chip right">터치하기</div>
      <div className="hero-chip bottom">루틴 카드</div>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="feature-item">
      <strong>{title}</strong>
      <span>{desc}</span>
    </div>
  );
}

function RetentionNudge() {
  return (
    <section
      className="utility-nudge"
      aria-label="영수증 몬스터 잡기 알림과 로그인 안내"
    >
      <strong>내일도 몬스터 등장</strong>
      <p>알림을 켜면 내일의 소비 몬스터를 놓치지 않아요.</p>
      <p>로그인하면 기록을 더 안전하게 이어볼 수 있어요.</p>
    </section>
  );
}

function CherryMenu() {
  const items = [
    "오늘의 몬스터",
    "터치하기",
    "친구에게 보내기",
    "30일 기록",
    "추가 루틴",
  ];
  return (
    <nav className="cherry-menu" aria-label="보조 메뉴">
      <span>오늘의 보조 메뉴</span>
      <div className="cherry-menu__grid">
        {items.map((item) => (
          <button type="button" key={item}>
            {item}
          </button>
        ))}
      </div>
    </nav>
  );
}

function AdBox({ label }: { label: string }) {
  return (
    <aside className="ad-box" aria-label={label}>
      <span>{label}</span>
      <strong>광고 영역</strong>
    </aside>
  );
}

export default App;

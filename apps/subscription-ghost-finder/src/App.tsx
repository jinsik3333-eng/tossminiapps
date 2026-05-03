import { Button, Top, useToast } from "@toss/tds-mobile";
import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import ghostSceneSource from "./assets/ghost-scene-source.jpg";
import { TossBannerAd } from "./components/TossBannerAd";
import { useInAppAds } from "./hooks/useInAppAds";

const REWARDED_AD_GROUP_ID =
  import.meta.env.VITE_TOSS_REWARDED_AD_GROUP_ID ?? "ait-ad-test-rewarded-id";
const BANNER_AD_GROUP_ID =
  import.meta.env.VITE_TOSS_BANNER_AD_GROUP_ID ?? "ait-ad-test-banner-id";

const STORAGE_KEY = "subscription-ghost-finder-history";

const QUESTIONS = [
  {
    id: "ott-watch",
    title: "영상/OTT 구독을 결제 중인가요?",
    subtitle: "넷플릭스·티빙·디즈니+처럼 매달 나가는 영상 구독만 생각해요.",
    ghost: "OTT 유령",
    options: [
      { value: "safe", label: "안 써요", helper: "결제 중인 OTT 없음" },
      {
        value: "safe",
        label: "결제 중·자주 봄",
        helper: "최근에도 잘 쓰는 중",
      },
      { value: "ghost", label: "결제 중인데 안 봄", helper: "유령 후보" },
    ],
  },
  {
    id: "free-trial",
    title: "무료체험으로 시작한 앱이 아직 결제 중인가요?",
    subtitle:
      "처음엔 무료였는데 지금은 매달 빠지는 서비스가 있는지만 확인해요.",
    ghost: "무료체험 유령",
    options: [
      { value: "safe", label: "없어요", helper: "체험판 결제 없음" },
      { value: "safe", label: "있지만 잘 씀", helper: "계속 쓸 이유 있음" },
      { value: "ghost", label: "있는지 헷갈림", helper: "결제내역 확인 필요" },
    ],
  },
  {
    id: "duplicate",
    title: "같은 서비스를 가족/친구와 따로 결제 중인가요?",
    subtitle:
      "공유 요금제나 가족 계정으로 합칠 수 있는 중복 구독을 찾는 질문이에요.",
    ghost: "중복구독 유령",
    options: [
      { value: "safe", label: "중복 없음", helper: "혼자 쓰거나 이미 공유" },
      {
        value: "safe",
        label: "따로 결제해도 필요",
        helper: "분리 사용 이유 있음",
      },
      { value: "ghost", label: "중복 같음", helper: "합칠 수 있는지 확인" },
    ],
  },
  {
    id: "app-delete",
    title: "앱을 지웠는데 구독 해지는 따로 안 한 적 있나요?",
    subtitle: "앱 삭제만으로 자동결제가 멈추지는 않는 경우가 있어요.",
    ghost: "앱삭제 착각 유령",
    options: [
      { value: "safe", label: "해지까지 했어요", helper: "정리 완료" },
      { value: "safe", label: "그런 앱 없음", helper: "삭제한 유료앱 없음" },
      { value: "ghost", label: "확인 필요", helper: "구독 관리 화면 확인" },
    ],
  },
  {
    id: "membership",
    title: "쇼핑 멤버십을 결제 중인가요?",
    subtitle: "쿠팡·네이버·마켓 멤버십처럼 혜택을 써야 이득인 구독이에요.",
    ghost: "멤버십 유령",
    options: [
      { value: "safe", label: "안 써요", helper: "쇼핑 멤버십 없음" },
      { value: "safe", label: "혜택 잘 씀", helper: "배송/적립 활용 중" },
      { value: "ghost", label: "혜택 안 쓴 듯", helper: "이번 달 사용 확인" },
    ],
  },
  {
    id: "cloud",
    title: "클라우드/저장공간 요금제를 쓰고 있나요?",
    subtitle: "iCloud·Google One·드라이브처럼 용량 때문에 내는 구독이에요.",
    ghost: "클라우드 유령",
    options: [
      { value: "safe", label: "안 써요", helper: "유료 용량 없음" },
      { value: "safe", label: "용량이 필요함", helper: "사진/파일 백업 중" },
      { value: "ghost", label: "남는 듯", helper: "다운그레이드 후보" },
    ],
  },
  {
    id: "music",
    title: "음악/오디오 구독을 결제 중인가요?",
    subtitle: "멜론·스포티파이·오디오북처럼 습관이 끊기면 바로 유령이 돼요.",
    ghost: "음악앱 유령",
    options: [
      { value: "safe", label: "안 써요", helper: "음악 구독 없음" },
      { value: "safe", label: "자주 들어요", helper: "주 3회 이상 사용" },
      { value: "ghost", label: "거의 안 들어요", helper: "해지 후보" },
    ],
  },
  {
    id: "next-billing",
    title: "결제 중인 구독들의 다음 결제일을 알고 있나요?",
    subtitle:
      "정확한 앱 이름을 몰라도, 결제일을 모르면 해지 타이밍을 놓치기 쉬워요.",
    ghost: "결제일 유령",
    options: [
      { value: "safe", label: "거의 알아요", helper: "결제일 관리 중" },
      { value: "safe", label: "구독이 적어요", helper: "관리할 항목 적음" },
      { value: "ghost", label: "대부분 몰라요", helper: "캘린더 표시 추천" },
    ],
  },
] as const;

type Question = (typeof QUESTIONS)[number];

type DailyTheme = {
  key: string;
  label: string;
  title: string;
  hook: string;
  questionPrefix: string;
  scene:
    | "ott"
    | "trial"
    | "family"
    | "mobile"
    | "shopping"
    | "cloud"
    | "audio"
    | "calendar";
  focusIds: Question["id"][];
  routineTitle: string;
  routineSteps: string[];
};

const DAILY_THEMES: DailyTheme[] = [
  {
    key: "ott-night",
    label: "오늘의 유령: OTT 잠복",
    title: "오늘은 안 보는 OTT부터 직접 점검해요",
    hook: "시청 기록이 멈춘 영상 구독은 월말에 가장 조용히 새요.",
    questionPrefix: "OTT부터",
    scene: "ott",
    focusIds: ["ott-watch", "duplicate", "next-billing"],
    routineTitle: "OTT 3분 정리 루틴",
    routineSteps: [
      "OTT 앱을 열어 최근 본 콘텐츠가 있는지 직접 확인하기",
      "이번 달 볼 앱 1개만 남길 후보로 표시하기",
      "해지 전 가족 공유·남은 기간만 확인하고 결정하기",
    ],
  },
  {
    key: "free-trial-alarm",
    label: "오늘의 유령: 무료체험 알림",
    title: "오늘은 무료체험이 유료로 바뀐 앱을 찾아봐요",
    hook: "무료로 시작한 앱은 결제일을 모르면 유령 후보가 되기 쉬워요.",
    questionPrefix: "무료체험부터",
    scene: "trial",
    focusIds: ["free-trial", "app-delete", "next-billing"],
    routineTitle: "무료체험 종료일 확인 루틴",
    routineSteps: [
      "결제 문자·앱스토어 구독 화면에서 무료체험 항목을 직접 보기",
      "다음 결제일을 캘린더에 표시하기",
      "계속 쓸 이유가 없으면 해지 전 저장 데이터만 확인하기",
    ],
  },
  {
    key: "family-duplicate",
    label: "오늘의 유령: 중복 결제",
    title: "오늘은 가족·친구와 겹치는 구독을 점검해요",
    hook: "각자 따로 내는 구독은 합칠 수 있는지 확인만 해도 후보가 보여요.",
    questionPrefix: "중복 결제부터",
    scene: "family",
    focusIds: ["duplicate", "ott-watch", "music"],
    routineTitle: "중복 구독 합치기 루틴",
    routineSteps: [
      "같은 서비스에 가족·친구가 따로 결제 중인지 물어보기",
      "가족/공유 요금제 조건과 동시 시청 제한을 직접 확인하기",
      "개인 계정 데이터가 필요한 앱은 무리하게 합치지 않기",
    ],
  },
  {
    key: "deleted-app",
    label: "오늘의 유령: 앱 삭제 착각",
    title: "오늘은 지운 앱의 구독 해지 여부를 확인해요",
    hook: "앱 삭제와 구독 해지는 다를 수 있어요. 자동조회 없이 직접 점검해요.",
    questionPrefix: "삭제한 앱부터",
    scene: "mobile",
    focusIds: ["app-delete", "free-trial", "next-billing"],
    routineTitle: "삭제 앱 구독 확인 루틴",
    routineSteps: [
      "앱스토어/플레이스토어 구독 관리 화면을 직접 열기",
      "삭제한 앱 이름이 남아 있는지 검색하기",
      "해지 전 저장 데이터·백업 필요 여부만 확인하기",
    ],
  },
  {
    key: "membership-day",
    label: "오늘의 유령: 쇼핑 멤버십",
    title: "오늘은 혜택을 못 쓴 멤버십을 찾아봐요",
    hook: "배송·적립 혜택을 안 쓰면 멤버십도 조용한 고정비가 돼요.",
    questionPrefix: "멤버십부터",
    scene: "shopping",
    focusIds: ["membership", "duplicate", "next-billing"],
    routineTitle: "멤버십 사용량 확인 루틴",
    routineSteps: [
      "이번 달 배송비/적립 혜택을 직접 확인하기",
      "구독료보다 혜택이 적으면 해지 후보로 표시하기",
      "무료배송 때문에 더 산 물건은 없는지 같이 돌아보기",
    ],
  },
  {
    key: "cloud-cleanup",
    label: "오늘의 유령: 클라우드 용량",
    title: "오늘은 남는 저장공간 요금제를 점검해요",
    hook: "용량 업그레이드 전에 큰 파일 몇 개만 지워도 후보가 줄 수 있어요.",
    questionPrefix: "클라우드부터",
    scene: "cloud",
    focusIds: ["cloud", "app-delete", "next-billing"],
    routineTitle: "클라우드 다운그레이드 전 루틴",
    routineSteps: [
      "사진·동영상 큰 파일 3개를 직접 정리하기",
      "현재 사용 용량과 요금제 용량을 비교하기",
      "백업이 필요한 파일은 내려받고 다운그레이드 후보 표시하기",
    ],
  },
  {
    key: "music-quiet",
    label: "오늘의 유령: 음악앱 침묵",
    title: "오늘은 거의 안 듣는 음악 구독을 확인해요",
    hook: "습관이 끊긴 오디오 구독은 직접 사용 횟수만 봐도 보여요.",
    questionPrefix: "음악앱부터",
    scene: "audio",
    focusIds: ["music", "duplicate", "next-billing"],
    routineTitle: "음악 구독 사용 횟수 루틴",
    routineSteps: [
      "최근 7일 재생 기록이 있는지 직접 확인하기",
      "무료 버전·가족 요금제로 대체 가능한지 보기",
      "다운로드 곡/플레이리스트를 확인한 뒤 해지 후보로 표시하기",
    ],
  },
  {
    key: "billing-calendar",
    label: "오늘의 유령: 결제일 미로",
    title: "오늘은 다음 결제일을 모르는 구독을 표시해요",
    hook: "구독을 계속 쓰더라도 결제일을 알면 유령이 되기 전에 막을 수 있어요.",
    questionPrefix: "결제일부터",
    scene: "calendar",
    focusIds: ["next-billing", "free-trial", "membership"],
    routineTitle: "결제일 캘린더 루틴",
    routineSteps: [
      "확실히 쓰는 구독 3개의 다음 결제일을 직접 확인하기",
      "결제 하루 전 알림을 캘린더에 넣기",
      "결제일을 모르는 항목은 이번 주 점검 후보로 남기기",
    ],
  },
];

type AnswerValue = "safe" | "ghost";
type Answers = Record<string, AnswerValue>;

function getTodayIndex() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const day = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return day % DAILY_THEMES.length;
}

function getOrderedQuestions(theme: DailyTheme) {
  const focused = theme.focusIds
    .map((id) => QUESTIONS.find((question) => question.id === id))
    .filter((question): question is Question => Boolean(question));
  const rest = QUESTIONS.filter(
    (question) => !theme.focusIds.includes(question.id),
  );
  return [...focused, ...rest];
}

function getGhostIds(answers: Answers) {
  return QUESTIONS.filter((question) => answers[question.id] === "ghost");
}

function getResult(ghostCount: number) {
  if (ghostCount === 0) {
    return {
      label: "깨끗한 구독함",
      title: "점검할 구독 후보 0개",
      copy: "이번 달 구독 관리 감각이 꽤 좋아요. 결제일만 한 번 더 확인하면 충분해요.",
      level: "safe",
    };
  }

  if (ghostCount <= 2) {
    return {
      label: "점검 후보 주의",
      title: `구독료 점검 후보 ${ghostCount}개`,
      copy: "크게 부담되는 수준은 아니지만, 직접 확인해볼 구독 후보가 있어요.",
      level: "watch",
    };
  }

  if (ghostCount <= 4) {
    return {
      label: "구독 점검 필요",
      title: `구독료 점검 후보 ${ghostCount}개`,
      copy: "이번 달 구독 목록에서 직접 확인할 후보가 꽤 있어요. 해지 전 체크 순서가 필요해요.",
      level: "danger",
    };
  }

  return {
    label: "집중 점검 필요",
    title: `구독료 점검 후보 ${ghostCount}개`,
    copy: "안 쓰는 구독 후보가 여러 개 보여요. 오늘 10분만 잡고 결제일과 사용 여부를 정리해보세요.",
    level: "boss",
  };
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw == null ? [] : (JSON.parse(raw) as string[]);
  } catch {
    return [];
  }
}

function saveHistory(score: number) {
  const today = new Date().toISOString().slice(0, 10);
  const next = [
    `${today}:${score}`,
    ...loadHistory().filter((item) => !item.startsWith(today)),
  ].slice(0, 7);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

function GhostScene({
  ghostCount,
  theme,
}: {
  ghostCount: number;
  theme: DailyTheme;
}) {
  return (
    <div
      className={`ghost-scene ghost-count-${Math.min(ghostCount, 5)} theme-${theme.scene}`}
    >
      <img
        aria-hidden="true"
        className="ghost-scene-art"
        src={ghostSceneSource}
      />
      <div className="ghost-scene-scrim" />
      <div className="scene-topic-list">
        {theme.focusIds.slice(0, 3).map((id) => {
          const question = QUESTIONS.find((item) => item.id === id);
          return <span key={id}>{question?.ghost.replace(" 유령", "")}</span>;
        })}
      </div>
      <div className="scene-count-badge">
        <span>{ghostCount > 0 ? `${ghostCount}개` : "탐색"}</span>
        <strong>점검 후보</strong>
      </div>
      <div className="shield-card">해지 전 체크</div>
    </div>
  );
}

function App() {
  const toast = useToast();
  const ads = useInAppAds(REWARDED_AD_GROUP_ID);
  const [step, setStep] = useState<"home" | "question" | "result">("home");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [history, setHistory] = useState<string[]>(() => loadHistory());
  const [routineOpen, setRoutineOpen] = useState(false);
  const answerLockedRef = useRef(false);
  const [pendingRewardCount, setPendingRewardCount] = useState<number | null>(
    null,
  );

  const todayTheme = useMemo(() => DAILY_THEMES[getTodayIndex()], []);
  const tomorrowTheme = useMemo(
    () => DAILY_THEMES[(getTodayIndex() + 1) % DAILY_THEMES.length],
    [],
  );
  const dailyQuestions = useMemo(
    () => getOrderedQuestions(todayTheme),
    [todayTheme],
  );
  const ghostQuestions = useMemo(() => getGhostIds(answers), [answers]);
  const result = getResult(ghostQuestions.length);
  const currentQuestion = dailyQuestions[index];
  const progress = Math.round(
    (Object.keys(answers).length / dailyQuestions.length) * 100,
  );

  useEffect(() => {
    if (pendingRewardCount != null && ads.rewardCount > pendingRewardCount) {
      setRoutineOpen(true);
      setPendingRewardCount(null);
    }
  }, [ads.rewardCount, pendingRewardCount]);

  useEffect(() => {
    answerLockedRef.current = false;
  }, [index, step]);

  function start() {
    setIndex(0);
    setAnswers({});
    setRoutineOpen(false);
    setPendingRewardCount(null);
    setStep("question");
  }

  function answer(value: AnswerValue) {
    if (
      answerLockedRef.current ||
      step !== "question" ||
      currentQuestion == null
    ) {
      return;
    }

    answerLockedRef.current = true;
    const nextAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(nextAnswers);

    if (index + 1 >= dailyQuestions.length) {
      const score = getGhostIds(nextAnswers).length;
      setHistory(saveHistory(score));
      setStep("result");
      return;
    }

    setIndex((current) => current + 1);
  }

  async function share() {
    const text = `나는 ${result.title}. 너도 60초 안에 안 쓰는 구독 후보를 직접 점검해봐.`;

    try {
      if (navigator.share) {
        await navigator.share({ title: "구독료 유령 찾기", text });
      } else {
        await navigator.clipboard?.writeText(text);
        toast.openToast("공유 문구를 복사했어요");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        toast.openToast("공유를 취소했어요");
        return;
      }
      await navigator.clipboard?.writeText(text);
      toast.openToast("공유 문구를 복사했어요");
    }
  }

  function openRoutine() {
    if (ads.isSupported && ads.isAdLoaded) {
      setPendingRewardCount(ads.rewardCount);
      ads.showAd();
      return;
    }

    setRoutineOpen(true);
    toast.openToast("테스트 환경이라 바로 열었어요");
  }

  if (step === "question") {
    return (
      <main className="app">
        <Top
          title={
            <Top.TitleParagraph size={22}>구독료 유령 찾기</Top.TitleParagraph>
          }
          subtitleBottom={
            <Top.SubtitleParagraph size={15}>
              {index + 1}/{dailyQuestions.length} · {todayTheme.questionPrefix}{" "}
              직접 점검
            </Top.SubtitleParagraph>
          }
        />

        <section className="question-card">
          <div className="progress-row">
            <span>유령 탐색 중</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-track">
            <div style={{ width: `${progress}%` }} />
          </div>

          <GhostScene ghostCount={ghostQuestions.length} theme={todayTheme} />

          <p className="eyebrow">
            {todayTheme.label} · 자동조회 아님 · 내 답변으로만 진단
          </p>
          <h1>{currentQuestion.title}</h1>
          <p className="question-subtitle">{currentQuestion.subtitle}</p>

          <div className="choice-grid">
            {currentQuestion.options.map((option) => (
              <Button key={option.label} onClick={() => answer(option.value)}>
                <span className="choice-label">{option.label}</span>
                <span className="choice-helper">{option.helper}</span>
              </Button>
            ))}
          </div>
        </section>

        <TossBannerAd
          adGroupId={BANNER_AD_GROUP_ID}
          className="quiz-bottom-ad"
          label="구독 점검 중 광고"
        />
      </main>
    );
  }

  if (step === "result") {
    return (
      <main className="app">
        <Top
          title={<Top.TitleParagraph size={22}>진단 결과</Top.TitleParagraph>}
          subtitleBottom={
            <Top.SubtitleParagraph size={15}>
              입력한 답변 기준의 참고용 결과예요
            </Top.SubtitleParagraph>
          }
        />

        <section className={`result-card result-${result.level}`}>
          <p className="eyebrow">{result.label}</p>
          <GhostScene ghostCount={ghostQuestions.length} theme={todayTheme} />
          <h1>{result.title}</h1>
          <p>{result.copy}</p>

          <div className="ghost-list">
            {ghostQuestions.length === 0 ? (
              <span>오늘은 유령 후보가 거의 없어요</span>
            ) : (
              ghostQuestions.map((question) => (
                <span key={question.id}>{question.ghost}</span>
              ))
            )}
          </div>

          <p className="result-note">
            실제 결제 내역이나 구독 상태를 자동으로 조회하지 않으며, 입력한
            답변을 바탕으로 한 참고용 결과예요.
          </p>
        </section>

        <section className="history-card">
          <div>
            <strong>최근 7회 점검 기록</strong>
            <p>숫자가 낮을수록 직접 확인할 구독 후보가 적은 상태예요.</p>
          </div>
          <div className="history-grid">
            {Array.from({ length: 7 }).map((_, itemIndex) => {
              const item = history[itemIndex];
              const score = item?.split(":").at(-1) ?? "-";
              return <span key={itemIndex}>{score}</span>;
            })}
          </div>
        </section>

        <TossBannerAd
          adGroupId={BANNER_AD_GROUP_ID}
          className="result-inline-ad"
          label="결과 확인 후 광고"
        />

        <section className="routine-ticket">
          <div className="ticket-head">
            <span>👻</span>
            <div>
              <p className="eyebrow">오늘의 정리 루틴</p>
              <h2>광고 보고 {todayTheme.routineTitle} 받기</h2>
            </div>
          </div>
          <p>
            현금/포인트 보상 없이, 직접 확인할 때 참고할 수 있는 구독 점검
            순서예요.
          </p>

          {routineOpen ? (
            <div className="routine-open">
              <strong>{todayTheme.routineTitle}</strong>
              <ol>
                {todayTheme.routineSteps.map((stepText) => (
                  <li key={stepText}>{stepText}</li>
                ))}
              </ol>
            </div>
          ) : (
            <Button onClick={openRoutine}>광고 보고 정리 루틴 받기</Button>
          )}
        </section>

        <div className="result-actions">
          <Button variant="weak" onClick={share}>
            친구한테 유령 찾기 보내기
          </Button>
          <Button color="dark" variant="weak" onClick={start}>
            다시 점검하기
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="app">
      <Top
        title={
          <Top.TitleParagraph size={22}>구독료 유령 찾기</Top.TitleParagraph>
        }
        subtitleBottom={
          <Top.SubtitleParagraph size={16}>
            안 쓰는데 매달 빠지는 돈, 60초 점검
          </Top.SubtitleParagraph>
        }
      />

      <section className="hero-card">
        <p className="eyebrow">{todayTheme.label} · 매일 바뀌는 자가 점검</p>
        <h1>{todayTheme.title}</h1>
        <p>
          {todayTheme.hook} 실제 결제 내역이나 구독 목록을 자동으로 조회하지
          않아요. 내가 직접 답한 내용을 바탕으로 놓치기 쉬운 구독 후보만
          확인해요.
        </p>
        <GhostScene ghostCount={3} theme={todayTheme} />
        <Button onClick={start}>60초 자가 점검 시작</Button>
      </section>

      <TossBannerAd
        adGroupId={BANNER_AD_GROUP_ID}
        className="home-inline-ad"
        label="시작 전 광고"
      />

      <section className="benefit-card">
        <div>
          <p className="eyebrow">오늘의 보너스</p>
          <h2>구독 정리 루틴 3단계</h2>
          <p>
            점검 후 짧은 광고를 확인하면, 오늘 바로 쓸 수 있는 해지 전
            체크리스트가 열려요. 내일은{" "}
            {tomorrowTheme.label.replace("오늘의 유령: ", "")}
            테마로 바뀌어요.
          </p>
        </div>
        <div className="benefit-tags">
          <span>정리 루틴 열기</span>
          <span>결제 내역 확인법</span>
          <span>7일 기록</span>
        </div>
      </section>
    </main>
  );
}

export default App;

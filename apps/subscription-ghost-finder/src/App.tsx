import { Button, Top, useToast } from "@toss/tds-mobile";
import { useEffect, useMemo, useState } from "react";
import "./App.css";
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
    title: "최근 30일 안에 본 OTT인가요?",
    subtitle: "기억이 안 나면 유령 후보예요.",
    yes: "봤어요",
    no: "기억 안 남",
    ghostIf: "no",
    ghost: "OTT 유령",
  },
  {
    id: "free-trial",
    title: "무료체험 끝난 뒤 계속 결제 중인가요?",
    subtitle: "체험판은 끝났는데 결제만 남는 경우가 많아요.",
    yes: "그럴 수도",
    no: "아니에요",
    ghostIf: "yes",
    ghost: "무료체험 유령",
  },
  {
    id: "duplicate",
    title: "가족/친구 계정과 중복 구독 중인가요?",
    subtitle: "같은 서비스를 둘이 따로 내고 있으면 잠복 유령이에요.",
    yes: "중복 같음",
    no: "중복 아님",
    ghostIf: "yes",
    ghost: "중복구독 유령",
  },
  {
    id: "app-delete",
    title: "앱은 지웠는데 결제는 남아있을 수 있나요?",
    subtitle: "앱 삭제와 구독 해지는 달라요.",
    yes: "확인 필요",
    no: "해지 완료",
    ghostIf: "yes",
    ghost: "앱삭제 착각 유령",
  },
  {
    id: "membership",
    title: "쇼핑 멤버십 혜택을 이번 달에 썼나요?",
    subtitle: "혜택을 안 쓰면 멤버십도 고정비가 돼요.",
    yes: "썼어요",
    no: "안 쓴 듯",
    ghostIf: "no",
    ghost: "멤버십 유령",
  },
  {
    id: "cloud",
    title: "클라우드 용량을 실제로 꽉 쓰고 있나요?",
    subtitle: "남는 용량에 매달 돈을 낼 수 있어요.",
    yes: "쓰고 있음",
    no: "남는 듯",
    ghostIf: "no",
    ghost: "클라우드 유령",
  },
  {
    id: "music",
    title: "음악/오디오 앱을 주 3회 이상 쓰나요?",
    subtitle: "습관이 끊긴 구독은 조용히 빠져나가요.",
    yes: "자주 써요",
    no: "거의 안 써요",
    ghostIf: "no",
    ghost: "음악앱 유령",
  },
  {
    id: "next-billing",
    title: "다음 결제일을 알고 있나요?",
    subtitle: "결제일을 모르면 해지 타이밍을 놓치기 쉬워요.",
    yes: "알아요",
    no: "모름",
    ghostIf: "no",
    ghost: "결제일 유령",
  },
] as const;

type AnswerValue = "yes" | "no";
type Answers = Record<string, AnswerValue>;

function getGhostIds(answers: Answers) {
  return QUESTIONS.filter(
    (question) => answers[question.id] === question.ghostIf,
  );
}

function getResult(ghostCount: number) {
  if (ghostCount === 0) {
    return {
      label: "깨끗한 구독함",
      title: "구독료 유령 0마리",
      copy: "이번 달 자동결제 감각이 꽤 좋아요. 결제일만 한 번 더 확인하면 충분해요.",
      level: "safe",
    };
  }

  if (ghostCount <= 2) {
    return {
      label: "잠복 유령 주의",
      title: `구독료 유령 ${ghostCount}마리 발견`,
      copy: "크게 새는 건 아니지만, 안 쓰는 구독이 조용히 남아있을 수 있어요.",
      level: "watch",
    };
  }

  if (ghostCount <= 4) {
    return {
      label: "자동결제 경보",
      title: `구독료 유령 ${ghostCount}마리 출몰`,
      copy: "이번 달 고정비에서 유령 후보가 꽤 보여요. 해지 전 체크 순서가 필요해요.",
      level: "danger",
    };
  }

  return {
    label: "월급 새는 단계",
    title: `구독료 유령 ${ghostCount}마리 잠복`,
    copy: "자동결제가 월급을 조금씩 갉아먹는 상태예요. 오늘 10분 정리 루틴을 추천해요.",
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

function GhostScene({ ghostCount }: { ghostCount: number }) {
  const dots = Array.from({ length: 5 });

  return (
    <div className={`ghost-scene ghost-count-${Math.min(ghostCount, 5)}`}>
      <div className="phone-card">
        <div className="phone-speaker" />
        <div className="subscription-list">
          <span>OTT</span>
          <span>Music</span>
          <span>Cloud</span>
        </div>
      </div>
      <div className="coin-stream">
        {dots.map((_, index) => (
          <span key={index} className={`coin coin-${index + 1}`} />
        ))}
      </div>
      <div className="ghost-body">
        <span className="ghost-eye left" />
        <span className="ghost-eye right" />
        <span className="ghost-mouth" />
        <strong>{ghostCount > 0 ? `${ghostCount}마리` : "탐색"}</strong>
      </div>
      <div className="shield-card">해지 전 확인</div>
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
  const [pendingRewardCount, setPendingRewardCount] = useState<number | null>(
    null,
  );

  const ghostQuestions = useMemo(() => getGhostIds(answers), [answers]);
  const result = getResult(ghostQuestions.length);
  const currentQuestion = QUESTIONS[index];
  const progress = Math.round(
    (Object.keys(answers).length / QUESTIONS.length) * 100,
  );

  useEffect(() => {
    if (pendingRewardCount != null && ads.rewardCount > pendingRewardCount) {
      setRoutineOpen(true);
      setPendingRewardCount(null);
    }
  }, [ads.rewardCount, pendingRewardCount]);

  function start() {
    setIndex(0);
    setAnswers({});
    setRoutineOpen(false);
    setPendingRewardCount(null);
    setStep("question");
  }

  function answer(value: AnswerValue) {
    const nextAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(nextAnswers);

    if (index + 1 >= QUESTIONS.length) {
      const score = getGhostIds(nextAnswers).length;
      setHistory(saveHistory(score));
      setStep("result");
      return;
    }

    setIndex((current) => current + 1);
  }

  async function share() {
    const text = `나는 ${result.title}. 너도 60초 안에 구독료 유령 찾아봐.`;

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
      toast.openToast("공유 문구를 복사하지 못했어요");
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
              {index + 1}/{QUESTIONS.length} · 60초 자동결제 점검
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

          <GhostScene ghostCount={ghostQuestions.length} />

          <p className="eyebrow">{currentQuestion.ghost}</p>
          <h1>{currentQuestion.title}</h1>
          <p className="question-subtitle">{currentQuestion.subtitle}</p>

          <div className="choice-grid">
            <Button onClick={() => answer("yes")}>{currentQuestion.yes}</Button>
            <Button variant="weak" onClick={() => answer("no")}>
              {currentQuestion.no}
            </Button>
          </div>
        </section>

        <TossBannerAd
          adGroupId={BANNER_AD_GROUP_ID}
          className="quiz-bottom-ad"
          label="자동결제 점검 중 광고"
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
              구독료 유령 후보를 찾았어요
            </Top.SubtitleParagraph>
          }
        />

        <section className={`result-card result-${result.level}`}>
          <p className="eyebrow">{result.label}</p>
          <GhostScene ghostCount={ghostQuestions.length} />
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
        </section>

        <section className="history-card">
          <div>
            <strong>최근 7회 점검 기록</strong>
            <p>숫자가 낮을수록 자동결제가 잘 정리된 상태예요.</p>
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
              <p className="eyebrow">오늘의 정리권</p>
              <h2>광고 보고 구독 정리 루틴 받기</h2>
            </div>
          </div>
          <p>
            현금/포인트 보상이 아니라, 지금 바로 저장해둘 수 있는 자동결제 점검
            순서예요.
          </p>

          {routineOpen ? (
            <div className="routine-open">
              <strong>구독 정리 3단계</strong>
              <ol>
                <li>오늘 발견한 유령 후보 앱의 다음 결제일을 먼저 확인하기</li>
                <li>
                  최근 30일 사용 기록이 없으면 해지/다운그레이드 후보로 표시하기
                </li>
                <li>
                  해지 전 가족 공유·연간 결제·백업 데이터만 확인하고 정리하기
                </li>
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
        <p className="eyebrow">자동결제 유령 진단</p>
        <h1>이번 달에도 몰래 빠져나간 구독료가 있을지도?</h1>
        <p>
          OTT, 앱 구독, 쇼핑 멤버십, 클라우드까지. 8개 질문으로 자동결제 유령
          후보를 찾아봐요.
        </p>
        <GhostScene ghostCount={3} />
        <Button onClick={start}>60초 유령 찾기 시작</Button>
      </section>

      <TossBannerAd
        adGroupId={BANNER_AD_GROUP_ID}
        className="home-inline-ad"
        label="시작 전 광고"
      />

      <section className="benefit-card">
        <div>
          <p className="eyebrow">광고 보상 루프</p>
          <h2>구독 정리 루틴 3단계</h2>
          <p>
            진단을 끝내고 광고를 보면, 오늘 바로 쓸 수 있는 해지 전 체크 순서가
            열려요.
          </p>
        </div>
        <div className="benefit-tags">
          <span>광고 보고 열기</span>
          <span>자동결제 점검</span>
          <span>7회 기록</span>
        </div>
      </section>
    </main>
  );
}

export default App;

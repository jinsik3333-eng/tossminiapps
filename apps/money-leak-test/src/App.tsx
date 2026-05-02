import { Button, TextButton, useToast } from "@toss/tds-mobile";
import { useEffect, useMemo, useState } from "react";

import "./App.css";
import { useInAppAds } from "./hooks/useInAppAds";
import { InAppAdsPage } from "./pages/InAppAdsPage";

type LeakType =
  | "delivery"
  | "subscription"
  | "convenience"
  | "lateNight"
  | "discount"
  | "taxi";

type Step = "intro" | "quiz" | "result" | "ads";

interface AnswerOption {
  label: string;
  leakType: LeakType;
}

interface Question {
  title: string;
  description: string;
  options: AnswerOption[];
}

interface ResultProfile {
  title: string;
  badge: string;
  summary: string;
  leakPattern: string;
  prescription: string;
  detail: string;
  shareLine: string;
  visualLabel: string;
}

const DETAIL_AD_GROUP_ID = "ait-ad-test-rewarded-id";
const SHOW_DEV_TOOLS = import.meta.env.DEV;

const questions: Question[] = [
  {
    title: "퇴근길 저녁을 고르는 방식은?",
    description: "가장 자주 하는 선택에 가까운 답을 골라주세요.",
    options: [
      { label: "배달앱을 열고 할인 쿠폰부터 찾아요", leakType: "delivery" },
      { label: "집 앞 편의점에서 빠르게 해결해요", leakType: "convenience" },
      { label: "늦었으니 오늘은 야식까지 가요", leakType: "lateNight" },
      { label: "집밥 재료가 있어도 귀찮으면 택시 타고 사와요", leakType: "taxi" },
    ],
  },
  {
    title: "월말 카드 내역에서 가장 놀라는 항목은?",
    description: "내역을 봤을 때 '이게 이렇게 많았어?' 싶은 항목이에요.",
    options: [
      { label: "배달비와 최소 주문 금액", leakType: "delivery" },
      { label: "안 쓰는 앱과 멤버십 정기결제", leakType: "subscription" },
      { label: "커피, 간식, 생필품 자잘한 결제", leakType: "convenience" },
      { label: "심야 택시비", leakType: "taxi" },
    ],
  },
  {
    title: "할인 문구를 봤을 때 반응은?",
    description: "솔직히 손이 먼저 움직이는 순간을 떠올려보세요.",
    options: [
      { label: "무료배송 기준까지 장바구니를 채워요", leakType: "delivery" },
      { label: "지금 안 사면 손해 같아서 일단 사요", leakType: "discount" },
      { label: "구독 첫 달 무료면 바로 눌러요", leakType: "subscription" },
      { label: "2+1이면 먹을 만큼보다 더 사요", leakType: "convenience" },
    ],
  },
  {
    title: "밤 11시에 출출하면?",
    description: "가장 많이 반복되는 행동을 골라주세요.",
    options: [
      { label: "내일의 나에게 맡기고 야식을 시켜요", leakType: "lateNight" },
      { label: "편의점에 가서 간식과 음료를 골라요", leakType: "convenience" },
      { label: "배달비가 아까워도 결국 주문해요", leakType: "delivery" },
      { label: "참다가 잠이 안 와서 더 크게 먹어요", leakType: "lateNight" },
    ],
  },
  {
    title: "구독 서비스 관리는 어떤 편인가요?",
    description: "영상, 음악, 생산성 앱, 멤버십을 모두 포함해요.",
    options: [
      { label: "쓰는지 안 쓰는지 기억이 흐릿해요", leakType: "subscription" },
      { label: "무료 체험 종료일을 자주 놓쳐요", leakType: "subscription" },
      { label: "할인 중이면 언젠가 쓰겠지 하고 결제해요", leakType: "discount" },
      { label: "필요한 날마다 새 서비스를 추가해요", leakType: "subscription" },
    ],
  },
  {
    title: "약속이 끝난 뒤 집에 갈 때는?",
    description: "피곤한 날의 기본값을 기준으로 답해주세요.",
    options: [
      { label: "대중교통 막차를 계산하기 귀찮아 택시를 불러요", leakType: "taxi" },
      { label: "택시비는 오늘의 체력 회복비라고 생각해요", leakType: "taxi" },
      { label: "집에 와서 또 배달앱을 열어요", leakType: "delivery" },
      { label: "편의점에서 내일 먹을 것까지 사요", leakType: "convenience" },
    ],
  },
  {
    title: "스트레스를 받으면 돈은 어디로 새나요?",
    description: "위로가 필요할 때 생기는 소비 패턴이에요.",
    options: [
      { label: "맛있는 배달 메뉴로 기분을 바꿔요", leakType: "delivery" },
      { label: "작은 간식 쇼핑을 여러 번 해요", leakType: "convenience" },
      { label: "세일 상품을 보며 보상받는 느낌을 받아요", leakType: "discount" },
      { label: "밤에 먹는 걸로 하루를 마감해요", leakType: "lateNight" },
    ],
  },
  {
    title: "가장 해볼 만한 절약 방식은?",
    description: "이번 주에 실제로 할 수 있는 선택을 골라주세요.",
    options: [
      { label: "배달 횟수를 딱 1번만 줄이기", leakType: "delivery" },
      { label: "구독 결제일 캘린더에 적기", leakType: "subscription" },
      { label: "편의점 갈 때 살 것 2개만 정하기", leakType: "convenience" },
      { label: "택시 타기 전 5분만 경로 보기", leakType: "taxi" },
    ],
  },
];

const resultProfiles: Record<LeakType, ResultProfile> = {
  delivery: {
    title: "배달 누수형",
    badge: "나는 배달 누수형!",
    summary: "쿠폰은 잘 챙기는데, 배달앱을 여는 횟수가 월급 구멍을 키우는 타입이야.",
    leakPattern: "무료배송 기준 맞추기, 사이드 추가, 최소 주문 금액 채우기가 자주 반복돼.",
    prescription: "오늘은 배달앱 열기 전에 냉장고 사진부터 한 장 찍어보자.",
    detail: "이번 주 배달 가능 횟수를 2회처럼 숫자로 딱 정해두면 좋아. 남은 횟수를 메모장 첫 줄에 적어두면 주문 전 한 번 멈추게 돼.",
    shareLine: "쿠폰왕인 줄 알았는데 배달비가 내 월급을 데려가고 있었음",
    visualLabel: "배달 봉투",
  },
  subscription: {
    title: "구독 방치형",
    badge: "나는 구독 방치형!",
    summary: "안 쓰는 서비스가 조용히 살아남아서 매달 월급을 조금씩 데려가는 타입이야.",
    leakPattern: "무료 체험 종료, 중복 콘텐츠 서비스, 가끔 쓰는 멤버십이 대표 구멍이야.",
    prescription: "오늘 결제 문자에서 ‘정기’와 ‘구독’을 검색해서 1개만 정리해보자.",
    detail: "구독은 의지보다 날짜 관리가 중요해. 다음 결제일 하루 전 알림을 걸고, 그날 10분 안에 계속 쓸지 결정하는 방식이 제일 현실적이야.",
    shareLine: "내 월급에는 조용히 자동결제되는 구독 생태계가 살고 있었음",
    visualLabel: "구독 카드",
  },
  convenience: {
    title: "편의점 새는형",
    badge: "나는 편의점 새는형!",
    summary: "한 번은 가볍지만, 자주 들르면 생각보다 큰 구멍이 되는 생활 밀착형 타입이야.",
    leakPattern: "커피, 간식, 2+1 상품, 급한 생필품이 자주 쌓여.",
    prescription: "오늘 편의점에 가기 전 살 것 2개만 정하고 들어가자.",
    detail: "편의점 소비는 금지보다 입장 규칙이 효과적이야. 들어가기 전 품목 수를 정하고, 계산대 앞 추가 상품은 다음 방문으로 미루는 식으로 마찰을 만들면 돼.",
    shareLine: "작은 결제라 괜찮다 했는데 편의점이 월급에 빨대를 꽂고 있었음",
    visualLabel: "스낵 바구니",
  },
  lateNight: {
    title: "야식 합리화형",
    badge: "나는 야식 합리화형!",
    summary: "하루가 힘들수록 ‘오늘은 먹어도 돼’가 강해지는 밤 소비 타입이야.",
    leakPattern: "심야 배달, 편의점 간식, 늦은 시간 과식이 반복돼.",
    prescription: "오늘 밤 먹고 싶어지면 물 한 컵 마시고 10분만 늦춰보자.",
    detail: "야식은 배고픔보다 루틴인 경우가 많아. 밤 10시 이후 선택지를 ‘차, 과일, 바로 양치’처럼 미리 정해두면 배달앱을 여는 확률이 줄어들어.",
    shareLine: "내 월급은 밤 11시에 제일 약해지는 편",
    visualLabel: "야식 달",
  },
  discount: {
    title: "할인 착각형",
    badge: "나는 할인 착각형!",
    summary: "아낀 줄 알았는데, 사실 안 사도 될 걸 산 적이 많은 타입이야.",
    leakPattern: "마감 세일, 무료배송 기준, 쿠폰 소멸 알림에 마음이 흔들려.",
    prescription: "오늘 장바구니에서 ‘정가여도 살 것’만 남겨보자.",
    detail: "할인은 필요한 물건에 붙을 때만 절약이야. 결제 전 ‘이걸 어제도 원했나?’라고 한 번만 물어보면 충동 구매를 꽤 많이 걸러낼 수 있어.",
    shareLine: "할인으로 돈 아낀 줄 알았는데 장바구니가 이겼음",
    visualLabel: "세일 태그",
  },
  taxi: {
    title: "택시 자기합리화형",
    badge: "나는 택시 자기합리화형!",
    summary: "시간을 산 줄 알았는데, 피곤함이 자주 결제 명분이 되는 타입이야.",
    leakPattern: "막차 포기, 가까운 거리 이동, 피곤함 보상 택시가 대표 구멍이야.",
    prescription: "오늘 택시 호출 전 대중교통 경로를 5분만 확인해보자.",
    detail: "택시는 기준을 정하면 죄책감 없이 줄일 수 있어. 늦은 밤, 짐이 많은 날, 비 오는 날처럼 허용 조건을 3개만 정하고 나머지는 한 번 더 비교해보자.",
    shareLine: "내 월급은 이동할 때마다 조금씩 미터기가 올라가는 타입",
    visualLabel: "택시 미터기",
  },
};
const leakTypeOrder: LeakType[] = [
  "delivery",
  "subscription",
  "convenience",
  "lateNight",
  "discount",
  "taxi",
];

function getResultType(answers: LeakType[]): LeakType {
  const scores = leakTypeOrder.reduce(
    (acc, leakType) => ({ ...acc, [leakType]: 0 }),
    {} as Record<LeakType, number>,
  );

  answers.forEach((answer) => {
    scores[answer] += 1;
  });

  return leakTypeOrder.reduce((winner, leakType) =>
    scores[leakType] > scores[winner] ? leakType : winner,
  );
}

function ResultVisual({ type, label }: { type: LeakType; label: string }) {
  return (
    <div className={`result-visual result-visual--${type}`} aria-label={label}>
      <span className="visual-orb visual-orb--back" />
      <span className="visual-card" />
      <span className="visual-coin visual-coin--one" />
      <span className="visual-coin visual-coin--two" />
      <span className="visual-coin visual-coin--three" />
      <span className="visual-shadow" />
    </div>
  );
}

function App() {
  const [step, setStep] = useState<Step>("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<LeakType[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailWaitingReward, setIsDetailWaitingReward] = useState(false);
  const [patchCount, setPatchCount] = useState(0);
  const detailAd = useInAppAds(DETAIL_AD_GROUP_ID);
  const toast = useToast();

  const resultType = useMemo(() => getResultType(answers), [answers]);
  const result = resultProfiles[resultType];
  const progressPercent = Math.round(
    ((currentQuestionIndex + 1) / questions.length) * 100,
  );
  const currentQuestion = questions[currentQuestionIndex];
  const patchGoal = 5;
  const patchPercent = Math.round((patchCount / patchGoal) * 100);
  const isPatchComplete = patchCount >= patchGoal;

  const startQuiz = () => {
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setIsDetailOpen(false);
    setIsDetailWaitingReward(false);
    setPatchCount(0);
    setStep("quiz");
  };

  const answerQuestion = (leakType: LeakType) => {
    const nextAnswers = [...answers, leakType];

    setAnswers(nextAnswers);

    if (nextAnswers.length === questions.length) {
      setStep("result");
      setIsDetailOpen(false);
      setIsDetailWaitingReward(false);
      setPatchCount(0);
      return;
    }

    setCurrentQuestionIndex((index) => index + 1);
  };

  const goBackQuestion = () => {
    if (currentQuestionIndex === 0) {
      setStep("intro");
      return;
    }

    setAnswers((previous) => previous.slice(0, -1));
    setCurrentQuestionIndex((index) => index - 1);
  };

  useEffect(() => {
    if (isDetailWaitingReward && detailAd.lastReward != null) {
      setIsDetailOpen(true);
      setIsDetailWaitingReward(false);
    }
  }, [detailAd.lastReward, isDetailWaitingReward]);

  const openDetail = () => {
    if (detailAd.isSupported && detailAd.isAdLoaded) {
      setIsDetailWaitingReward(true);
      detailAd.showAd();
      return;
    }

    setIsDetailOpen(true);
  };


  const patchLeak = () => {
    setPatchCount((count) => {
      const nextCount = Math.min(count + 1, patchGoal);

      if (nextCount === patchGoal && count < patchGoal) {
        toast.openToast("오늘 막을 소비 구멍을 정했어요.");
      }

      return nextCount;
    });
  };

  const shareResult = async () => {
    const text = `${result.badge} ${result.shareLine}

돈 새는 구멍 테스트에서 60초 진단해봤어.`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "돈 새는 구멍 테스트",
          text,
        });
        return;
      }

      await navigator.clipboard?.writeText(text);
      toast.openToast("공유 문구를 복사했어요.");
    } catch (error) {
      console.info("공유가 취소되었거나 복사에 실패했습니다.", error);
      toast.openToast("공유를 완료하지 못했어요.");
    }
  };

  if (step === "ads" && SHOW_DEV_TOOLS) {
    return <InAppAdsPage onBack={() => setStep("intro")} />;
  }

  if (step === "quiz") {
    return (
      <main className="app-shell">
        <section className="quiz-header">
          <TextButton size="medium" onClick={goBackQuestion}>
            ← 이전
          </TextButton>
          <span className="question-count">
            {currentQuestionIndex + 1}/{questions.length}
          </span>
        </section>

        <div
          className="progress-track"
          role="progressbar"
          aria-label="문항 진행률"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="progress-bar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <section className="page-title">
          <h1>{currentQuestion.title}</h1>
          <p>{currentQuestion.description}</p>
        </section>

        <section className="option-list">
          {currentQuestion.options.map((option) => (
            <button
              className="option-button"
              key={option.label}
              type="button"
              onClick={() => answerQuestion(option.leakType)}
            >
              {option.label}
            </button>
          ))}
        </section>
      </main>
    );
  }

  if (step === "result") {
    return (
      <main className="app-shell result-shell">
        <section className="share-card" aria-label="공유용 결과 카드">
          <div className="share-card__topline">돈 새는 구멍 테스트 결과</div>
          <ResultVisual type={resultType} label={result.visualLabel} />
          <p className="share-card__badge">{result.badge}</p>
          <h1>{result.title}</h1>
          <p className="share-card__line">“{result.shareLine}”</p>
        </section>

        <section className="result-panel">
          <p className="result-label">60초 진단 결과</p>
          <h2>{result.summary}</h2>
          <div className="result-block">
            <strong>대표 누수 패턴</strong>
            <p>{result.leakPattern}</p>
          </div>
          <div className="result-block prescription">
            <strong>오늘의 처방</strong>
            <p>{result.prescription}</p>
          </div>
        </section>

        <section className="patch-card" aria-label="오늘의 소비 구멍 막기">
          <div className="patch-card__header">
            <span>오늘 막은 구멍</span>
            <strong>{patchCount}/{patchGoal}</strong>
          </div>
          <div
            className="patch-progress"
            role="progressbar"
            aria-label="소비 구멍 막기 진행률"
            aria-valuenow={patchPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div style={{ width: `${patchPercent}%` }} />
          </div>
          <div className="patch-slots" aria-hidden="true">
            {Array.from({ length: patchGoal }, (_, index) => (
              <span
                className={index < patchCount ? "patch-slot is-filled" : "patch-slot"}
                key={index}
              >
                {index < patchCount ? "💰" : ""}
              </span>
            ))}
          </div>
          <button
            className="patch-button"
            type="button"
            onClick={patchLeak}
            disabled={isPatchComplete}
          >
            {isPatchComplete ? "오늘의 절약 배지 획득" : "눌러서 소비 구멍 막기"}
          </button>
          <p>5번 누르면 오늘 막을 구멍이 채워지고, 상세 처방을 확인할 준비가 끝나요.</p>
        </section>

        <section className="action-stack">
          {!isDetailOpen ? (
            <Button
              color="dark"
              loading={isDetailWaitingReward}
              onClick={openDetail}
            >
              {detailAd.isSupported && detailAd.isAdLoaded
                ? "광고 보고 맞춤 절약 처방 보기"
                : "맞춤 절약 처방 보기"}
            </Button>
          ) : (
            <div className="detail-panel">
              <strong>상세 처방</strong>
              <p>{result.detail}</p>
            </div>
          )}
          <Button variant="weak" onClick={shareResult}>
            내 유형 공유하기
          </Button>
          <TextButton size="medium" onClick={startQuiz}>
            다시 테스트하기
          </TextButton>
        </section>

        {SHOW_DEV_TOOLS && (
          <TextButton
            className="dev-link"
            size="small"
            onClick={() => setStep("ads")}
          >
            개발용 인앱광고 테스트
          </TextButton>
        )}
      </main>
    );
  }

  return (
    <main className="app-shell intro-shell">
      <section className="page-title intro-title">
        <h1>내 월급, 어디서 새고 있을까?</h1>
        <p>8문항만 답하면 내 소비 구멍이랑 오늘 막을 방법을 바로 알려줄게.</p>
      </section>

      <section className="intro-card">
        <p className="routine-name">오늘의 머니루틴</p>
        <h1>돈 새는 구멍 테스트</h1>
        <ul>
          <li>8문항으로 1분 안에 끝나요</li>
          <li>“나는 ○○형!” 결과 카드가 나와요</li>
          <li>친구에게 공유하기 좋은 문구를 같이 만들어요</li>
        </ul>
      </section>

      <section className="action-stack">
        <Button color="dark" onClick={startQuiz}>
          테스트 시작하기
        </Button>
        {SHOW_DEV_TOOLS && (
          <TextButton size="small" onClick={() => setStep("ads")}>
            개발용 인앱광고 테스트
          </TextButton>
        )}
      </section>
    </main>
  );
}

export default App;

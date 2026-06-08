import { Button, Top, useToast } from "@toss/tds-mobile";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import wasteDefenseHero from "./assets/waste-defense-hero.jpg";
import { TossBannerAd } from "./components/TossBannerAd";
import { RewardHub, StickyRewardCTA } from "./components/RewardHub";
import {
  DAILY_BOARD_DAYS,
  QUESTION_TIME_LIMIT,
  getCountdownCopy,
  getDefenseGrade,
  getMonthlyBoardSlots,
  getTodayMissionLabel,
} from "./game";
import { useInAppAds } from "./hooks/useInAppAds";
import { openContactsViralReward } from "./hooks/useContactsViralReward";
import { InAppAdsPage } from "./pages/InAppAdsPage";

type Screen = "home" | "quiz" | "result" | "iaa";
type Choice = { label: string; value: number; reply: string };
type Question = { leak: string; title: string; choices: Choice[] };
type VisualType =
  | "delivery"
  | "subscription"
  | "convenience"
  | "transport"
  | "shopping"
  | "food"
  | "social"
  | "digital";
type BattleVisual = {
  type: VisualType;
  trapBadge: string;
};
type RewardRoutine = {
  title: string;
  checklist: string[];
  saveCopy: string;
  benefitCopy: string;
};
type DaySet = {
  theme: string;
  enemy: string;
  hook: string;
  visual: BattleVisual;
  reward: RewardRoutine;
  questions: Question[];
};

const REWARDED_AD_GROUP_ID =
  import.meta.env.VITE_TOSS_REWARDED_AD_GROUP_ID ?? "";

const REWARD_APP_LINKS = [
  { label: "돈 새는 구멍", visual: "/cross-app-icons/money-leak-test.png", description: "절약 진단", href: "intoss://money-leak-test" },
  { label: "헛돈 퀴즈", visual: "/cross-app-icons/daily-waste-quiz.png", description: "소비 점검", href: "intoss://daily-waste-quiz" },
  { label: "월급 도둑", visual: "/cross-app-icons/salary-thief-finder.png", description: "새는 돈 찾기", href: "intoss://salary-thief-finder" },
  { label: "소비 룰렛", visual: "/cross-app-icons/spending-defense-roulette.png", description: "오늘 방어", href: "intoss://spending-defense-roulette" },
  { label: "구독 유령", visual: "/cross-app-icons/subscription-ghost-finder.png", description: "자동결제 점검", href: "intoss://subscription-ghost-finder" },
  { label: "영수증 몬스터", visual: "/cross-app-icons/receipt-monster-catcher.png", description: "소비 단서 찾기", href: "intoss://receipt-monster-catcher" },
];
const BANNER_AD_GROUP_ID =
  import.meta.env.VITE_TOSS_BANNER_AD_GROUP_ID ?? "";
const CONTACTS_VIRAL_MODULE_ID =
  import.meta.env.VITE_TOSS_CONTACTS_VIRAL_MODULE_ID ?? "";
const STAMP_KEY = "daily-waste-quiz-stamps-v2";

const daySets: DaySet[] = [
  {
    theme: "배달비 습격",
    enemy: "배달비 괴물",
    hook: "오늘 카드값을 괴롭히는 배달비 괴물 잡기",
    visual: { type: "delivery", trapBadge: "배달비" },
    reward: {
      title: "배달비 닫기 루틴",
      checklist: [
        "냉장고 10초 확인",
        "최소주문금액 추가 금지",
        "포장 가능하면 포장 선택",
      ],
      saveCopy: "오늘 배달앱 켜기 전 10초만 냉장고를 봐요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "퇴근 직후",
        title: "배고프면 바로?",
        choices: [
          { label: "배달앱 켬", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "냉장고 봄", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "쿠폰 유혹",
        title: "쿠폰 뜨면?",
        choices: [
          { label: "일단 주문", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "원래 먹을 때만", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "최소주문금액",
        title: "금액 모자라면?",
        choices: [
          { label: "사이드 추가", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "그냥 포기", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "구독료 잠복",
    enemy: "구독료 유령",
    hook: "안 보는 구독 하나만 찾아도 오늘은 성공",
    visual: { type: "subscription", trapBadge: "월정액" },
    reward: {
      title: "구독 해지 루틴",
      checklist: [
        "결제 문자에서 구독 검색",
        "이번 주 안 본 앱 표시",
        "무료체험 종료일 캡처",
      ],
      saveCopy: "오늘 결제 문자에서 자동결제 하나만 찾아봐요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "자동결제",
        title: "구독 몇 개 쓰는지?",
        choices: [
          { label: "잘 모름", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "바로 앎", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "무료체험",
        title: "무료체험 끝나면?",
        choices: [
          { label: "까먹음", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "알림 해둠", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "안 보는 앱",
        title: "이번 주 정리?",
        choices: [
          { label: "다음에", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "하나 해지", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "편의점 함정",
    enemy: "1+1 함정",
    hook: "작은 결제 3번이면 점심값 하나가 사라져요",
    visual: { type: "convenience", trapBadge: "1+1" },
    reward: {
      title: "편의점 입구 컷 루틴",
      checklist: [
        "들어가기 전 살 것 1개만 정하기",
        "1+1은 필요한 것만",
        "밤 11시 편의점 우회",
      ],
      saveCopy: "오늘 편의점 들어가기 전 살 것 하나만 정해요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "입구 컷",
        title: "들어가기 전?",
        choices: [
          { label: "그냥 들어감", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "살 것 정함", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "1+1",
        title: "1+1 보이면?",
        choices: [
          { label: "일단 집음", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "필요하면 삼", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "야식 루트",
        title: "밤 11시 편의점?",
        choices: [
          { label: "라면 사러 감", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "안 감", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "택시비 급습",
    enemy: "택시비 괴물",
    hook: "늦은 밤 한 번의 호출이 하루 예산을 흔들어요",
    visual: { type: "transport", trapBadge: "택시비" },
    reward: {
      title: "막차 체크 루틴",
      checklist: [
        "귀가 전 막차 시간 확인",
        "택시 호출 전 3분 걷기",
        "동행/대중교통 먼저 보기",
      ],
      saveCopy: "오늘 밤 이동 전 막차 시간을 먼저 확인해요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "퇴근길",
        title: "피곤하면 바로?",
        choices: [
          { label: "택시 호출", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "막차 확인", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "비 오는 날",
        title: "비 오면 이동은?",
        choices: [
          { label: "바로 호출", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "5분 기다림", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "약속 끝",
        title: "집 갈 때?",
        choices: [
          { label: "택시 먼저", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "대중교통 먼저", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "카페값 잠복",
    enemy: "카페값 괴물",
    hook: "습관처럼 사는 커피 한 잔을 오늘만 막아봐요",
    visual: { type: "food", trapBadge: "커피" },
    reward: {
      title: "카페 패스 루틴",
      checklist: [
        "텀블러/물 먼저 마시기",
        "쿠폰 때문에 추가주문 금지",
        "오후 커피 시간 정하기",
      ],
      saveCopy: "오늘 두 번째 커피 전 물 한 컵을 먼저 마셔요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "출근길",
        title: "카페 보이면?",
        choices: [
          { label: "일단 들림", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "물 먼저", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "쿠폰",
        title: "스탬프 모자라면?",
        choices: [
          { label: "디저트 추가", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "다음에", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "오후 졸림",
        title: "졸리면 바로?",
        choices: [
          { label: "커피 주문", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "잠깐 걷기", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "새벽쇼핑 침투",
    enemy: "새벽쇼핑 괴물",
    hook: "잠들기 전 장바구니가 가장 위험해요",
    visual: { type: "shopping", trapBadge: "쇼핑" },
    reward: {
      title: "장바구니 잠금 루틴",
      checklist: [
        "밤 11시 이후 결제 금지",
        "장바구니 하루 재우기",
        "리뷰보다 필요도 먼저 보기",
      ],
      saveCopy: "오늘 밤 장바구니는 결제하지 말고 재워둬요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "밤 12시",
        title: "잠 안 오면?",
        choices: [
          { label: "쇼핑앱 켬", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "폰 내려둠", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "장바구니",
        title: "사고 싶으면?",
        choices: [
          { label: "바로 결제", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "내일 보기", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "리뷰 폭주",
        title: "좋다길래?",
        choices: [
          { label: "따라 삼", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "필요 확인", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "배송비 덫",
    enemy: "배송비 괴물",
    hook: "무료배송 맞추려다 더 쓰는 순간을 막아요",
    visual: { type: "shopping", trapBadge: "배송비" },
    reward: {
      title: "배송비 역전 루틴",
      checklist: [
        "무료배송 금액 채우기 금지",
        "필요한 상품만 결제",
        "내일 살 것과 합치기",
      ],
      saveCopy: "오늘 무료배송 맞추려고 하나 더 담지 않아요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "무료배송",
        title: "금액 부족하면?",
        choices: [
          { label: "하나 더 담음", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "그냥 결제", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "묶음배송",
        title: "살 게 애매하면?",
        choices: [
          { label: "충동 추가", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "내일 합침", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "특가배송",
        title: "오늘만 무료면?",
        choices: [
          { label: "급히 삼", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "필요 체크", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "앱결제 잠복",
    enemy: "앱결제 유령",
    hook: "작은 인앱결제가 반복되면 생각보다 커져요",
    visual: { type: "digital", trapBadge: "앱결제" },
    reward: {
      title: "인앱결제 잠금 루틴",
      checklist: [
        "결제 전 10초 멈춤",
        "무료 대안 먼저 보기",
        "월 결제 내역 확인",
      ],
      saveCopy: "오늘 앱 안 결제 버튼을 누르기 전 10초 멈춰요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "게임 아이템",
        title: "부족하면?",
        choices: [
          { label: "바로 결제", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "무료 보상", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "편집앱",
        title: "워터마크 뜨면?",
        choices: [
          { label: "유료 전환", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "대안 찾기", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "프리미엄",
        title: "팝업 뜨면?",
        choices: [
          { label: "구독 시작", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "닫기", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "간식비 습격",
    enemy: "간식비 괴물",
    hook: "작은 간식 결제가 하루 예산을 자주 갉아먹어요",
    visual: { type: "food", trapBadge: "간식" },
    reward: {
      title: "간식 예산 루틴",
      checklist: [
        "간식은 하루 1번만",
        "계산 전 손에 든 것 줄이기",
        "배고픔인지 습관인지 묻기",
      ],
      saveCopy: "오늘 간식은 한 번만, 계산 전 하나 내려놔요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "출출함",
        title: "배고프면?",
        choices: [
          { label: "간식 집음", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "물 먼저", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "계산대",
        title: "새 상품 보이면?",
        choices: [
          { label: "추가", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "지나감", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "오후",
        title: "입 심심하면?",
        choices: [
          { label: "과자", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "잠깐 걷기", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "쿠폰 미끼",
    enemy: "쿠폰 괴물",
    hook: "쿠폰은 절약처럼 보이지만 지출 시작점이 되기도 해요",
    visual: { type: "shopping", trapBadge: "쿠폰" },
    reward: {
      title: "쿠폰 역이용 루틴",
      checklist: [
        "원래 살 것만 쿠폰 적용",
        "쿠폰 때문에 앱 열지 않기",
        "할인 전 총액 보기",
      ],
      saveCopy: "오늘 쿠폰은 원래 살 것에만 써요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "알림",
        title: "쿠폰 알림 오면?",
        choices: [
          { label: "앱 열기", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "닫기", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "마감",
        title: "오늘까지라면?",
        choices: [
          { label: "급히 삼", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "패스", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "할인율",
        title: "커 보이면?",
        choices: [
          { label: "결제", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "총액 확인", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "세일 알림",
    enemy: "세일 유령",
    hook: "오늘만 세일이라는 말에 예산이 흔들려요",
    visual: { type: "shopping", trapBadge: "SALE" },
    reward: {
      title: "세일 알림 끄기 루틴",
      checklist: [
        "쇼핑앱 푸시 1개 끄기",
        "가격보다 필요 먼저 보기",
        "찜만 하고 내일 보기",
      ],
      saveCopy: "오늘 쇼핑앱 알림 하나를 꺼요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "푸시",
        title: "세일 알림 오면?",
        choices: [
          { label: "바로 클릭", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "알림 끔", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "타임딜",
        title: "10분 남으면?",
        choices: [
          { label: "바로 삼", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "찜만", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "반값",
        title: "싸 보이면?",
        choices: [
          { label: "구매", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "필요 확인", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "점심 추가금",
    enemy: "점심값 괴물",
    hook: "메뉴 하나 추가가 매일 쌓이면 꽤 커져요",
    visual: { type: "food", trapBadge: "추가" },
    reward: {
      title: "점심 추가금 컷 루틴",
      checklist: [
        "메뉴 정하고 주문",
        "음료 추가 전 물 선택",
        "사이드 추가 금지",
      ],
      saveCopy: "오늘 점심 주문에서 사이드 하나를 막아요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "메뉴판",
        title: "고르면?",
        choices: [
          { label: "세트업", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "단품", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "음료",
        title: "음료 권하면?",
        choices: [
          { label: "추가", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "물", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "사이드",
        title: "아쉬우면?",
        choices: [
          { label: "추가", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "패스", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "취미장비 욕심",
    enemy: "장비병 괴물",
    hook: "시작보다 장비부터 사는 순간을 막아요",
    visual: { type: "shopping", trapBadge: "장비" },
    reward: {
      title: "장비 7일 대기 루틴",
      checklist: [
        "장비는 7일 뒤 재검토",
        "이미 있는 물건 확인",
        "첫 3회는 대여/기존템 사용",
      ],
      saveCopy: "오늘 장비는 사지 말고 7일 뒤 다시 봐요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "새 취미",
        title: "시작하면?",
        choices: [
          { label: "장비 쇼핑", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "있는 것 사용", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "추천템",
        title: "영상 보면?",
        choices: [
          { label: "바로 담기", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "목록만", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "업그레이드",
        title: "불편하면?",
        choices: [
          { label: "교체", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "3번 더 써봄", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "모임비 과속",
    enemy: "모임비 괴물",
    hook: "분위기에 휩쓸린 추가 주문을 막아요",
    visual: { type: "social", trapBadge: "추가" },
    reward: {
      title: "모임비 브레이크 루틴",
      checklist: [
        "2차 전 예산 확인",
        "N차 제안은 한 번 쉬기",
        "택시비까지 같이 계산",
      ],
      saveCopy: "오늘 모임에서 2차 가기 전 예산을 먼저 봐요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "2차",
        title: "분위기 좋으면?",
        choices: [
          { label: "따라감", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "예산 봄", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "추가주문",
        title: "안주 모자라면?",
        choices: [
          { label: "더 시킴", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "멈춤", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "귀가",
        title: "늦어지면?",
        choices: [
          { label: "택시", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "막차", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "OTT 겹침",
    enemy: "OTT 유령",
    hook: "비슷한 구독이 겹치면 조용히 새요",
    visual: { type: "digital", trapBadge: "OTT" },
    reward: {
      title: "OTT 하나만 보기 루틴",
      checklist: [
        "이번 달 볼 OTT 1개 선택",
        "겹치는 앱 해지 후보 표시",
        "공유/가족 플랜 확인",
      ],
      saveCopy: "오늘 OTT 하나만 이번 달 메인으로 정해요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "볼 것",
        title: "볼 게 많으면?",
        choices: [
          { label: "다 유지", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "하나 선택", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "신작",
        title: "신작 뜨면?",
        choices: [
          { label: "재구독", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "다음 달", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "겹침",
        title: "비슷한 앱이면?",
        choices: [
          { label: "둘 다", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "하나만", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "마트 특가",
    enemy: "특가 괴물",
    hook: "특가 코너에서 필요 없는 지출이 늘어요",
    visual: { type: "shopping", trapBadge: "특가" },
    reward: {
      title: "마트 동선 루틴",
      checklist: [
        "장보기 목록 3개만",
        "특가 코너 먼저 가지 않기",
        "냉장고 중복 확인",
      ],
      saveCopy: "오늘 마트는 목록에 있는 것만 담아요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "입구",
        title: "특가 보이면?",
        choices: [
          { label: "먼저 감", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "목록 봄", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "대용량",
        title: "싸 보이면?",
        choices: [
          { label: "담음", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "보관 확인", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "계산 전",
        title: "카트 많으면?",
        choices: [
          { label: "그냥 결제", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "하나 빼기", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "라이브커머스",
    enemy: "라이브 괴물",
    hook: "실시간 마감 말에 결제가 빨라져요",
    visual: { type: "shopping", trapBadge: "LIVE" },
    reward: {
      title: "라이브 결제 지연 루틴",
      checklist: [
        "방송 중 결제 금지",
        "캡처만 하고 내일 보기",
        "최저가 따로 확인",
      ],
      saveCopy: "오늘 라이브 중에는 결제하지 않고 캡처만 해요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "방송",
        title: "혜택 좋으면?",
        choices: [
          { label: "바로 결제", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "캡처", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "마감",
        title: "곧 끝나면?",
        choices: [
          { label: "구매", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "내일", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "사은품",
        title: "많이 주면?",
        choices: [
          { label: "혹함", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "가격 봄", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "교통비 새는 길",
    enemy: "교통비 괴물",
    hook: "작은 이동 선택이 하루 지출을 바꿔요",
    visual: { type: "transport", trapBadge: "교통" },
    reward: {
      title: "교통 루트 루틴",
      checklist: [
        "가까운 거리는 걷기",
        "환승 전 경로 확인",
        "따릉이/버스 먼저 보기",
      ],
      saveCopy: "오늘 가까운 거리는 호출 전에 걸어갈지 봐요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "가까운 거리",
        title: "10분 거리면?",
        choices: [
          { label: "호출", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "걷기", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "환승",
        title: "귀찮으면?",
        choices: [
          { label: "택시", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "버스", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "비상",
        title: "늦으면?",
        choices: [
          { label: "바로 호출", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "경로 확인", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "배달 디저트",
    enemy: "디저트 괴물",
    hook: "밥 먹고 디저트 배달까지 이어지는 루프를 막아요",
    visual: { type: "food", trapBadge: "디저트" },
    reward: {
      title: "디저트 대기 루틴",
      checklist: [
        "식후 20분 기다리기",
        "집에 있는 간식 먼저 보기",
        "디저트 배달앱 닫기",
      ],
      saveCopy: "오늘 식후 디저트 주문은 20분만 미뤄요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "식후",
        title: "단 게 당기면?",
        choices: [
          { label: "배달앱", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "20분 대기", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "카페배달",
        title: "사진 보면?",
        choices: [
          { label: "주문", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "집 간식", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "최소금액",
        title: "부족하면?",
        choices: [
          { label: "추가", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "포기", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "휴대폰 소액결제",
    enemy: "소액결제 유령",
    hook: "작게 눌린 결제가 다음 달에 나타나요",
    visual: { type: "digital", trapBadge: "소액" },
    reward: {
      title: "소액결제 차단 루틴",
      checklist: [
        "소액결제 한도 확인",
        "인증 문자 오면 멈춤",
        "월말 청구 확인",
      ],
      saveCopy: "오늘 소액결제 한도를 한 번 확인해요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "인증문자",
        title: "문자 오면?",
        choices: [
          { label: "입력", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "멈춤", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "웹결제",
        title: "간편하면?",
        choices: [
          { label: "결제", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "다시 봄", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "청구서",
        title: "다음 달이면?",
        choices: [
          { label: "잊음", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "메모", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "프리미엄 업셀",
    enemy: "업셀 유령",
    hook: "기본으로 충분한데 프리미엄을 누르게 만들어요",
    visual: { type: "digital", trapBadge: "PRO" },
    reward: {
      title: "프리미엄 대기 루틴",
      checklist: [
        "무료 기능 먼저 써보기",
        "월 3회 이상 쓸 때만 검토",
        "업그레이드 팝업 닫기",
      ],
      saveCopy: "오늘 PRO 버튼은 닫고 무료 기능부터 써요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "팝업",
        title: "PRO 뜨면?",
        choices: [
          { label: "업그레이드", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "닫기", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "제한",
        title: "막히면?",
        choices: [
          { label: "결제", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "무료 대안", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "연간할인",
        title: "싸 보이면?",
        choices: [
          { label: "구독", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "월 사용량 봄", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "배달 음료",
    enemy: "음료배달 괴물",
    hook: "음료 한 잔도 배달비와 만나면 커져요",
    visual: { type: "food", trapBadge: "음료" },
    reward: {
      title: "음료 배달 컷 루틴",
      checklist: ["음료만 배달 금지", "편의점/집 대안 보기", "물 먼저 마시기"],
      saveCopy: "오늘 음료만 따로 배달하지 않아요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "목마름",
        title: "음료 당기면?",
        choices: [
          { label: "배달", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "물", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "카페앱",
        title: "쿠폰 있으면?",
        choices: [
          { label: "주문", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "닫기", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "최소금액",
        title: "모자라면?",
        choices: [
          { label: "디저트 추가", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "포기", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "계절템 충동",
    enemy: "시즌 괴물",
    hook: "계절 한정이라는 말이 충동구매를 부릅니다",
    visual: { type: "shopping", trapBadge: "한정" },
    reward: {
      title: "시즌템 대기 루틴",
      checklist: [
        "한정 문구에 바로 결제 금지",
        "작년 물건 확인",
        "보관 자리 먼저 생각",
      ],
      saveCopy: "오늘 한정템은 보관 자리부터 생각해요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "한정판",
        title: "오늘만이면?",
        choices: [
          { label: "구매", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "캡처", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "계절템",
        title: "예뻐 보이면?",
        choices: [
          { label: "담기", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "작년템 확인", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "품절임박",
        title: "불안하면?",
        choices: [
          { label: "결제", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "하루 대기", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "멤버십 중복",
    enemy: "멤버십 유령",
    hook: "혜택 받으려다 멤버십이 겹쳐요",
    visual: { type: "digital", trapBadge: "멤버십" },
    reward: {
      title: "멤버십 정리 루틴",
      checklist: [
        "이번 달 쓴 멤버십 확인",
        "겹치는 혜택 표시",
        "하나만 유지 후보 정하기",
      ],
      saveCopy: "오늘 멤버십 하나가 실제로 쓰였는지 확인해요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "혜택",
        title: "좋아 보이면?",
        choices: [
          { label: "가입", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "사용 빈도", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "중복",
        title: "비슷하면?",
        choices: [
          { label: "둘 다", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "하나만", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "무료기간",
        title: "무료라면?",
        choices: [
          { label: "가입", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "알림", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "반품 귀찮음",
    enemy: "반품회피 괴물",
    hook: "반품이 귀찮아 불필요한 물건이 남아요",
    visual: { type: "shopping", trapBadge: "반품" },
    reward: {
      title: "반품 24시간 룰",
      checklist: [
        "도착 후 바로 확인",
        "안 쓸 물건은 24시간 안에 반품",
        "포장재 하루 보관",
      ],
      saveCopy: "오늘 도착한 택배는 바로 열어봐요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "택배",
        title: "도착하면?",
        choices: [
          { label: "방치", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "바로 확인", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "애매함",
        title: "마음에 안 들면?",
        choices: [
          { label: "그냥 둠", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "반품", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "포장",
        title: "버릴까?",
        choices: [
          { label: "바로 버림", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "하루 보관", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "점심 배달팟",
    enemy: "배달팟 괴물",
    hook: "다 같이 시키면 내 예산도 같이 흔들려요",
    visual: { type: "social", trapBadge: "배달팟" },
    reward: {
      title: "배달팟 방어 루틴",
      checklist: [
        "내 예산 먼저 정하기",
        "따라 주문 금지",
        "도시락/포장 대안 보기",
      ],
      saveCopy: "오늘 단체 주문 전에 내 예산을 먼저 정해요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "동료주문",
        title: "다 시키면?",
        choices: [
          { label: "따라 시킴", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "예산 봄", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "메뉴추천",
        title: "맛있다길래?",
        choices: [
          { label: "주문", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "가격 봄", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "나눠먹기",
        title: "조금만이면?",
        choices: [
          { label: "추가", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "패스", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "뷰티 소모품",
    enemy: "뷰티템 괴물",
    hook: "다 쓰기 전 새로 사는 루틴을 막아요",
    visual: { type: "shopping", trapBadge: "뷰티" },
    reward: {
      title: "공병 확인 루틴",
      checklist: [
        "공병 전까지 새 제품 금지",
        "비슷한 색/기능 확인",
        "세일보다 재고 먼저 보기",
      ],
      saveCopy: "오늘 새 뷰티템 전 집에 있는 재고를 확인해요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "세일",
        title: "할인하면?",
        choices: [
          { label: "쟁임", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "재고 확인", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "신상",
        title: "예쁘면?",
        choices: [
          { label: "구매", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "비슷한 것", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "거의 다 씀",
        title: "남았으면?",
        choices: [
          { label: "새로 삼", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "끝까지", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "클라우드 용량",
    enemy: "클라우드 유령",
    hook: "용량 부족 팝업이 구독을 부릅니다",
    visual: { type: "digital", trapBadge: "용량" },
    reward: {
      title: "용량 정리 루틴",
      checklist: [
        "큰 파일 3개 삭제",
        "사진 백업 정리",
        "업그레이드 전 5분 청소",
      ],
      saveCopy: "오늘 클라우드 업그레이드 전 큰 파일 3개를 지워요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "용량팝업",
        title: "부족하면?",
        choices: [
          { label: "업그레이드", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "삭제", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "사진",
        title: "많으면?",
        choices: [
          { label: "구독", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "정리", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "백업",
        title: "불안하면?",
        choices: [
          { label: "결제", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "큰 파일", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "기프티콘 방치",
    enemy: "기프티콘 괴물",
    hook: "사둔 쿠폰을 잊고 또 사는 일을 막아요",
    visual: { type: "convenience", trapBadge: "쿠폰함" },
    reward: {
      title: "쿠폰함 확인 루틴",
      checklist: [
        "결제 전 쿠폰함 확인",
        "만료 임박 1개 사용 계획",
        "중복 구매 금지",
      ],
      saveCopy: "오늘 결제 전 쿠폰함을 한 번 열어봐요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "카페",
        title: "주문 전?",
        choices: [
          { label: "바로 결제", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "쿠폰함", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "만료",
        title: "알림 오면?",
        choices: [
          { label: "나중에", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "오늘 계획", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "선물함",
        title: "있는지?",
        choices: [
          { label: "모름", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "확인", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
  {
    theme: "월말 정산",
    enemy: "월말 보스",
    hook: "이번 달 마지막 방어는 새는 곳 하나를 찾는 거예요",
    visual: { type: "digital", trapBadge: "월말" },
    reward: {
      title: "월말 3분 정산 루틴",
      checklist: [
        "결제 문자 3개 보기",
        "가장 아까운 지출 표시",
        "다음 달 막을 것 1개 정하기",
      ],
      saveCopy: "오늘 이번 달 가장 아까운 지출 하나를 표시해요.",

      benefitCopy: "광고를 보면 바로 저장 가능한 3단계 절약 루틴이에요.",
    },
    questions: [
      {
        leak: "문자",
        title: "결제 내역은?",
        choices: [
          { label: "안 봄", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "3개 봄", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "아까움",
        title: "찾으면?",
        choices: [
          { label: "넘김", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "표시", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
      {
        leak: "다음달",
        title: "막을 건?",
        choices: [
          { label: "없음", value: 0, reply: "위험. 괴물이 버텼어요." },
          { label: "하나 정함", value: 2, reply: "좋음. 방어 성공." },
        ],
      },
    ],
  },
];

function getTodayIndex() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const day = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return day % daySets.length;
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function readStamps(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STAMP_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function BattleScene({
  daySet,
  hp,
  compact = false,
}: {
  daySet: DaySet;
  hp?: number;
  compact?: boolean;
}) {
  const visual = daySet.visual;
  return (
    <div
      className={`defense-stage ${compact ? "home-stage" : ""} visual-${visual.type}`}
      aria-hidden="true"
    >
      <img className="battle-hero-art" src={wasteDefenseHero} />
      <span className="battle-hero-scrim" />
      <span className="stage-timer">5초</span>
      <span className="trap-badge-pill">{visual.trapBadge}</span>
      <span className="shield-copy">헛돈 방어</span>
      {typeof hp === "number" ? (
        <span className="hp-label floating-hp">괴물 HP {hp}%</span>
      ) : null}
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Choice[]>([]);
  const [stamps, setStamps] = useState<string[]>(() => readStamps());
  const [bonusOpen, setBonusOpen] = useState(false);
  const [pendingRewardCount, setPendingRewardCount] = useState<number | null>(
    null,
  );
  const [lastReply, setLastReply] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_TIME_LIMIT);
  const [isLocked, setIsLocked] = useState(false);
  const toast = useToast();
  const ads = useInAppAds(REWARDED_AD_GROUP_ID);
  const today = useMemo(() => daySets[getTodayIndex()], []);
  const tomorrow = useMemo(
    () => daySets[(getTodayIndex() + 1) % daySets.length],
    [],
  );
  const todayKey = getTodayKey();
  const completedToday = stamps.includes(todayKey);
  const score = answers.reduce((sum, answer) => sum + answer.value, 0);
  const maxScore = today.questions.length * 2;
  const defenseGrade = getDefenseGrade(score, maxScore);
  const monsterHp = Math.max(0, 100 - Math.round((score / maxScore) * 100));
  const boardSlots = getMonthlyBoardSlots(stamps);

  useEffect(() => {
    if (pendingRewardCount !== null && ads.rewardCount > pendingRewardCount) {
      setBonusOpen(true);
      setPendingRewardCount(null);
      toast.openToast("저장용 혜택 루틴 열림");
    }
  }, [ads.rewardCount, pendingRewardCount, toast]);

  const startQuiz = () => {
    setStep(0);
    setAnswers([]);
    setBonusOpen(false);
    setPendingRewardCount(null);
    setLastReply(null);
    setSecondsLeft(QUESTION_TIME_LIMIT);
    setIsLocked(false);
    setScreen("quiz");
  };

  const choose = useCallback(
    (choice: Choice) => {
      if (isLocked) {
        return;
      }

      setIsLocked(true);
      setLastReply(choice.reply);
      window.setTimeout(() => {
        const next = [...answers, choice];
        setAnswers(next);
        setLastReply(null);
        if (step >= today.questions.length - 1) {
          const nextStamps = Array.from(new Set([...stamps, todayKey])).slice(
            -DAILY_BOARD_DAYS,
          );
          setStamps(nextStamps);
          localStorage.setItem(STAMP_KEY, JSON.stringify(nextStamps));
          setScreen("result");
          setIsLocked(false);
          toast.openToast("오늘 괴물 퇴치 완료");
          return;
        }
        setStep((value) => value + 1);
        setSecondsLeft(QUESTION_TIME_LIMIT);
        setIsLocked(false);
      }, 420);
    },
    [answers, isLocked, stamps, step, today.questions.length, todayKey, toast],
  );

  useEffect(() => {
    if (screen !== "quiz" || isLocked) {
      return;
    }

    if (secondsLeft <= 0) {
      choose({
        label: "시간 초과",
        value: 0,
        reply: "시간 끝. 괴물이 버텼어요.",
      });
      return;
    }

    const timerId = window.setTimeout(() => {
      setSecondsLeft((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [choose, isLocked, screen, secondsLeft]);

  const openBonus = () => {
    if (ads.isSupported && ads.isAdLoaded) {
      setPendingRewardCount(ads.rewardCount);
      ads.showAd();
      return;
    }
    setPendingRewardCount(null);
    setBonusOpen(true);
    toast.openToast("테스트 환경이라 바로 열었어요");
  };


  const shareResult = async () => {
    const text = `오늘 ${today.enemy} ${defenseGrade.label}. 너도 5초 컷 해봐.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "오늘의 헛돈 방지 퀴즈", text });
      } else {
        await navigator.clipboard?.writeText(text);
        toast.openToast("공유 문구 복사 완료");
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        toast.openToast("공유를 취소했어요");
        return;
      }
      toast.openToast("공유 문구를 준비했어요");
    }
  };


  const shareResultWithReward = () => {
    openContactsViralReward({
      moduleId: CONTACTS_VIRAL_MODULE_ID,
      onReward: ({ rewardAmount, rewardUnit }) => {
        toast.openToast(`친구 추천 완료! ${rewardUnit} ${rewardAmount}개를 받았어요`);
      },
      onClose: ({ sentRewardsCount }) => {
        if ((sentRewardsCount ?? 0) > 0) {
          openBonus();
        }
      },
      onFallback: shareResult,
      onError: (error) => console.info("공유 리워드 실행 실패:", error),
    });
  };

  if (screen === "iaa")
    return <InAppAdsPage onBack={() => setScreen("home")} />;

  if (screen === "quiz") {
    const question = today.questions[step];
    return (
      <main className="app-shell quiz-shell">
        <Top
          title={
            <Top.TitleParagraph size={22}>
              {step + 1}/3 헛돈 컷
            </Top.TitleParagraph>
          }
          subtitleBottom={
            <Top.SubtitleParagraph size={16}>
              {today.theme}
            </Top.SubtitleParagraph>
          }
        />
        <section className="battle-card">
          <div className="battle-top">
            <span className="leak-pill">{question.leak}</span>
            <span
              className={
                secondsLeft <= 2 ? "timer-chip is-danger" : "timer-chip"
              }
            >
              {getCountdownCopy(secondsLeft)}
            </span>
          </div>
          <div
            className="timer-track"
            aria-label={getCountdownCopy(secondsLeft)}
          >
            <span
              style={{ width: `${(secondsLeft / QUESTION_TIME_LIMIT) * 100}%` }}
            />
          </div>
          <BattleScene daySet={today} hp={monsterHp} />
          <h1>{question.title}</h1>
          <div className="quick-choice-grid">
            {question.choices.map((choice) => (
              <button
                className="quick-choice"
                disabled={isLocked}
                key={choice.label}
                onClick={() => choose(choice)}
              >
                {choice.label}
              </button>
            ))}
          </div>
          {lastReply ? <div className="hit-toast">{lastReply}</div> : null}
        </section>
        <TossBannerAd
          adGroupId={BANNER_AD_GROUP_ID}
          className="quiz-bottom-ad"
          label="5초 방어전 하단 광고"
        />
      </main>
    );
  }

  if (screen === "result") {
    return (
      <main className="app-shell result-shell">
        <Top
          title={
            <Top.TitleParagraph size={22}>오늘 전투 끝</Top.TitleParagraph>
          }
          subtitleBottom={
            <Top.SubtitleParagraph size={16}>
              스탬프 1개 획득
            </Top.SubtitleParagraph>
          }
        />
        <section className="result-card">
          <p className="eyebrow">{today.enemy} 결과</p>
          <h1>{defenseGrade.title}</h1>
          <div
            className="score-ring"
            style={{
              background: `radial-gradient(circle at center, #fff 0 54%, transparent 55%), conic-gradient(#3182f6 0 ${defenseGrade.percent}%, #dfefff ${defenseGrade.percent}% 100%)`,
            }}
          >
            <strong>{defenseGrade.blockedCount}/3</strong>
            <span>방어</span>
          </div>
          <p className="result-copy">
            {defenseGrade.label}. 점수보다 중요한 건 오늘 하나를 막은
            기록이에요.
          </p>
          <p className="tomorrow-copy">내일 예고: {tomorrow.enemy}</p>
        </section>
        <section className="stamp-card">
          <div className="section-title">
            <strong>30일 퇴치판</strong>
            <span>
              {stamps.length}/{DAILY_BOARD_DAYS}
            </span>
          </div>
          <div className="stamp-grid monthly-grid">
            {boardSlots.map((slot) => (
              <span
                className={slot.filled ? "stamp is-filled" : "stamp"}
                key={slot.day}
              >
                {slot.filled ? "✓" : slot.day}
              </span>
            ))}
          </div>
        </section>
        <TossBannerAd
          adGroupId={BANNER_AD_GROUP_ID}
          className="result-inline-ad"
          label="결과 하단 광고"
        />
        <section className="tip-card reward-card benefit-ticket">
          <div className="ticket-head">
            <span className="ticket-icon" aria-hidden="true">
              🎟️
            </span>
            <div>
              <strong>오늘의 절약 혜택권</strong>
              <p>광고를 보면 오늘 바로 쓸 절약 루틴 카드가 열려요</p>
            </div>
          </div>
          <div className="ticket-preview">
            <span>오늘 보상</span>
            <strong>{today.reward.title}</strong>
            <p>{today.reward.benefitCopy}</p>
          </div>
          {bonusOpen ? (
            <div className="bonus-box reward-box">
              <strong>{today.reward.title}</strong>
              <ul>
                {today.reward.checklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <span>저장해두고 내일 결제 전에 다시 보기</span>
            </div>
          ) : (
            <Button onClick={openBonus}>AD 보고 절약 보상 받기</Button>
          )}
        </section>
        <div className="cta-stack">
          <Button variant="weak" onClick={shareResult}>
            친구한테 괴물 도전 보내기
          </Button>
          <Button variant="weak" onClick={startQuiz}>
            5초 더 잡기
          </Button>
          {import.meta.env.DEV ? (
            <Button
              color="dark"
              variant="weak"
              onClick={() => setScreen("iaa")}
            >
              개발용 광고 테스트
            </Button>
          ) : null}
        </div>
        <RewardHub
          appLabel="오늘의 헛돈 방지 퀴즈"
          pointsLabel={`${stamps.length * 5}P 모았어요`}
          primaryLabel="광고 보고 절약 루틴 받기"
          questLabel="오늘 헛돈 퀴즈 완료"
          questProgress={completedToday ? 1 : 0}
          questTotal={1}
          links={REWARD_APP_LINKS.filter((link) => link.href !== "intoss://daily-waste-quiz")}
          onPrimaryReward={openBonus}
        />
        <StickyRewardCTA label="광고 보고 절약 루틴 받기" onClick={openBonus} />
        <ResultActionMenu
          items={[
            { label: "AD 절약 보상", onClick: openBonus },
            { label: "친구 추천하고 보상 받기", onClick: shareResultWithReward },
            { label: "다시 풀기", onClick: startQuiz },
          ]}
          helperCopy="AD 버튼은 광고 시청 후 앱 안 보상 루틴이 열려요"
        />
      </main>
    );
  }

  return (
    <main className="app-shell home-shell">
      <Top
        title={
          <Top.TitleParagraph size={22}>오늘의 헛돈 방어전</Top.TitleParagraph>
        }
        subtitleBottom={
          <Top.SubtitleParagraph size={16}>
            5초 안에 고르면 방어 성공
          </Top.SubtitleParagraph>
        }
      />
      <section className="hero-card compact-hero">
        <p className="eyebrow">
          {completedToday
            ? "오늘 이미 잡음"
            : getTodayMissionLabel(today.enemy)}
        </p>
        <h1>
          {today.enemy}
          <br />
          5초 방어
        </h1>
        <p>{today.hook}</p>
        <BattleScene compact daySet={today} />
        <Button onClick={startQuiz}>
          {completedToday ? "오늘 기록 다시 깨기" : "5초 카운트다운 시작"}
        </Button>
      </section>
      <TossBannerAd
        adGroupId={BANNER_AD_GROUP_ID}
        className="home-inline-ad"
        label="홈 하단 광고"
      />
      <section className="daily-panel compact-panel reward-preview benefit-preview">
        <div className="benefit-row">
          <span className="benefit-icon" aria-hidden="true">
            5초
          </span>
          <div>
            <div className="section-title">
              <strong>오늘의 방어 카드</strong>
              <span>콘텐츠 보너스</span>
            </div>
            <p>
              {today.reward.title} · 선택형 광고 확인 후 바로 써볼 수 있는 3단계
              루틴이에요.
            </p>
          </div>
        </div>
        <div className="mini-list benefit-tags">
          <span>선택형 루틴 열기</span>
          <span>3단계 루틴 저장</span>
          <span>30일 기록</span>
        </div>
      </section>
      <section className="stamp-card compact">
        <div className="section-title">
          <strong>30일 방어 기록</strong>
          <span>
            {stamps.length}/{DAILY_BOARD_DAYS}
          </span>
        </div>
        <div className="stamp-grid monthly-grid">
          {boardSlots.map((slot) => (
            <span
              className={slot.filled ? "stamp is-filled" : "stamp"}
              key={slot.day}
            >
              {slot.filled ? "✓" : slot.day}
            </span>
          ))}
        </div>
        <p className="next-monster">내일 다시 오면 {tomorrow.enemy} 등장</p>
      </section>
    </main>
  );
}

function ResultActionMenu({
  items,
  helperCopy,
}: {
  items: Array<{ label: string; onClick: () => void | Promise<void> }>;
  helperCopy: string;
}) {
  return (
    <section className="cherry-menu" aria-label="보상 실행 메뉴">
      <div className="cherry-menu__head">
        <strong>보상 받기</strong>
      </div>
      <div className="cherry-menu__grid">
        {items.map((item) => (
          <button key={item.label} type="button" onClick={item.onClick}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="ad-loop-pill">{helperCopy}</div>
    </section>
  );
}

export default App;

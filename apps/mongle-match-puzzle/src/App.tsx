import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";

import "./App.css";
import {
  BOARD_SIZE,
  type Position,
  type Tile,
  type TileType,
  TILE_TYPES,
  createBoard,
  resolveMove,
} from "./lib/gameLogic";
import {
  type GameProfile,
  getGameProfileOrFallback,
  openLeaderboardSafe,
  submitScoreOnce,
} from "./lib/tossGameCenter";

type GameStatus = "home" | "playing" | "won" | "lost";
type Rarity = "common" | "rare" | "epic" | "unique";

type CollectibleMongle = {
  id: string;
  name: string;
  emoji: string;
  imageSrc: string;
  rarity: Rarity;
  scoreMultiplier: number;
  chanceLabel: string;
  description: string;
};

type CollectionState = Record<string, number>;
type SwapAnimation = {
  from: Position;
  to: Position;
  invalid: boolean;
} | null;
type FallDistances = Record<string, number>;
type DifficultyStage = {
  level: number;
  label: string;
  targetScore: number;
  moves: number;
  tileTypes: TileType[];
  note: string;
};

const DIFFICULTY_STAGES: DifficultyStage[] = [
  {
    level: 1,
    label: "연습 숲",
    targetScore: 420,
    moves: 24,
    tileTypes: ["berry", "leaf", "star", "drop"],
    note: "4종 타일로 감 잡기",
  },
  {
    level: 2,
    label: "말랑 언덕",
    targetScore: 540,
    moves: 22,
    tileTypes: TILE_TYPES,
    note: "5종 타일로 진짜 매치 시작",
  },
  {
    level: 3,
    label: "반짝 협곡",
    targetScore: 660,
    moves: 20,
    tileTypes: TILE_TYPES,
    note: "목표 점수가 올라가요",
  },
  {
    level: 4,
    label: "유니크 문",
    targetScore: 780,
    moves: 18,
    tileTypes: TILE_TYPES,
    note: "이동 수가 줄어드는 챌린지",
  },
];
const COLLECTION_STORAGE_KEY = "mongle-match-collection-v1";
const STAGE_STORAGE_KEY = "mongle-match-stage-v1";
const PREMIUM_ASSETS_READY = true;

const RARITY_META: Record<Rarity, { label: string; shortLabel: string; className: string }> = {
  common: { label: "커먼", shortLabel: "common", className: "rarity-common" },
  rare: { label: "레어", shortLabel: "rare", className: "rarity-rare" },
  epic: { label: "에픽", shortLabel: "epic", className: "rarity-epic" },
  unique: { label: "유니크", shortLabel: "unique", className: "rarity-unique" },
};

const MONGLE_ITEMS = [
  {
    id: "sleepy-pillow-ghost",
    index: 1,
    name: "낮잠 유령",
    emoji: "😴",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/001-sleepy-pillow-ghost.webp",
    description: "베개를 끌어안고 낮잠 시간을 지켜주는 조용한 몽글이에요.",
  },
  {
    id: "raincoat-puddle",
    index: 2,
    name: "우비 첨벙이",
    emoji: "☔️",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/002-raincoat-puddle.webp",
    description: "작은 우비를 입고 물웅덩이를 건너는 몽글이에요.",
  },
  {
    id: "sprout-gardener",
    index: 3,
    name: "새싹 정원사",
    emoji: "🌱",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/003-sprout-gardener.webp",
    description: "새싹 화분을 돌보며 매일 조금씩 자라는 몽글이에요.",
  },
  {
    id: "cloud-postman",
    index: 4,
    name: "구름 우체부",
    emoji: "☁️",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/004-cloud-postman.webp",
    description: "폭신한 구름 가방에 오늘의 기분을 담아오는 몽글이에요.",
  },
  {
    id: "berry-cook",
    index: 5,
    name: "베리 요리사",
    emoji: "🫐",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/005-berry-cook.webp",
    description: "작은 베리 그릇을 들고 간식을 나눠주는 몽글이에요.",
  },
  {
    id: "book-detective",
    index: 6,
    name: "책장 탐정",
    emoji: "📚",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/006-book-detective.webp",
    description: "책 사이의 단서를 조용히 찾아내는 탐정 몽글이에요.",
  },
  {
    id: "acorn-ranger",
    index: 7,
    name: "도토리 파수꾼",
    emoji: "🌰",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/007-acorn-ranger.webp",
    description: "도토리 모자를 쓰고 숲길을 지키는 몽글이에요.",
  },
  {
    id: "blanket-burrito",
    index: 8,
    name: "담요 말이",
    emoji: "🛏️",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/008-blanket-burrito.webp",
    description: "담요에 돌돌 말려 쉬어가는 포근한 몽글이에요.",
  },
  {
    id: "milk-bubble",
    index: 9,
    name: "우유 방울",
    emoji: "🥛",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/009-milk-bubble.webp",
    description: "우유빛 방울처럼 말랑하게 통통 튀는 몽글이에요.",
  },
  {
    id: "tiny-lantern",
    index: 10,
    name: "꼬마 등불",
    emoji: "🏮",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/010-tiny-lantern.webp",
    description: "작은 등불로 어두운 칸을 밝혀주는 몽글이에요.",
  },
  {
    id: "sock-wanderer",
    index: 11,
    name: "양말 여행자",
    emoji: "🧦",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/011-sock-wanderer.webp",
    description: "짝 잃은 양말을 망토처럼 걸친 길잡이 몽글이에요.",
  },
  {
    id: "button-tailor",
    index: 12,
    name: "단추 재봉사",
    emoji: "🧵",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/012-button-tailor.webp",
    description: "느슨해진 마음을 단추처럼 다시 꿰매주는 몽글이에요.",
  },
  {
    id: "marshmallow-camper",
    index: 13,
    name: "마시멜로 캠퍼",
    emoji: "🏕️",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/013-marshmallow-camper.webp",
    description: "작은 캠핑 의자에 앉아 쉬는 달콤한 몽글이에요.",
  },
  {
    id: "leaf-umbrella",
    index: 14,
    name: "잎우산 몽글",
    emoji: "🌿",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/014-leaf-umbrella.webp",
    description: "커다란 잎사귀를 우산처럼 쓰는 숲속 몽글이에요.",
  },
  {
    id: "paperboat-sailor",
    index: 15,
    name: "종이배 선원",
    emoji: "⛵",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/015-paperboat-sailor.webp",
    description: "종이배 옆에서 작은 항해를 준비하는 몽글이에요.",
  },
  {
    id: "warm-muffler",
    index: 16,
    name: "목도리 산책가",
    emoji: "🧣",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/016-warm-muffler.webp",
    description: "긴 목도리를 두르고 천천히 걷는 몽글이에요.",
  },
  {
    id: "honey-spoon",
    index: 17,
    name: "꿀숟갈 몽글",
    emoji: "🍯",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/017-honey-spoon.webp",
    description: "꿀숟갈 하나로 달콤한 기운을 챙겨주는 몽글이에요.",
  },
  {
    id: "cookie-thief",
    index: 18,
    name: "쿠키 도둑",
    emoji: "🍪",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/018-cookie-thief.webp",
    description: "쿠키를 몰래 챙겼지만 표정은 너무 순한 장난꾸러기예요.",
  },
  {
    id: "pebble-collector",
    index: 19,
    name: "조약돌 수집가",
    emoji: "🪨",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/019-pebble-collector.webp",
    description: "반짝이는 조약돌 하나를 소중히 들고 다니는 몽글이에요.",
  },
  {
    id: "toast-baker",
    index: 20,
    name: "토스트 제빵사",
    emoji: "🍞",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/020-toast-baker.webp",
    description: "따뜻한 토스트 냄새를 몰고 오는 아침 몽글이에요.",
  },
  {
    id: "memo-helper",
    index: 21,
    name: "메모 도우미",
    emoji: "📝",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/021-memo-helper.webp",
    description: "작은 빈 메모지를 들고 오늘 할 일을 기억해주는 몽글이에요.",
  },
  {
    id: "shell-napper",
    index: 22,
    name: "조개 낮잠이",
    emoji: "🐚",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/022-shell-napper.webp",
    description: "조개껍데기 그늘에서 잠깐 쉬는 바닷가 몽글이에요.",
  },
  {
    id: "snowball-friend",
    index: 23,
    name: "눈송이 친구",
    emoji: "❄️",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/023-snowball-friend.webp",
    description: "녹지 않는 작은 눈덩이를 안고 있는 몽글이에요.",
  },
  {
    id: "ribbon-gifter",
    index: 24,
    name: "리본 선물꾼",
    emoji: "🎀",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/024-ribbon-gifter.webp",
    description: "리본만 살짝 묶어 오늘을 선물처럼 만드는 몽글이에요.",
  },
  {
    id: "teacup-rest",
    index: 25,
    name: "찻잔 휴식이",
    emoji: "🍵",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/025-teacup-rest.webp",
    description: "작은 찻잔 곁에서 숨을 고르는 몽글이에요.",
  },
  {
    id: "star-sticker",
    index: 26,
    name: "별스티커 몽글",
    emoji: "⭐",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/026-star-sticker.webp",
    description: "볼에 별 스티커 하나를 붙인 칭찬 몽글이에요.",
  },
  {
    id: "maple-sweeper",
    index: 27,
    name: "단풍 청소부",
    emoji: "🍁",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/027-maple-sweeper.webp",
    description: "작은 빗자루로 단풍잎을 모으는 몽글이에요.",
  },
  {
    id: "jelly-bounce",
    index: 28,
    name: "젤리 통통이",
    emoji: "🍮",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/028-jelly-bounce.webp",
    description: "젤리처럼 통통 튀는 말랑한 몽글이에요.",
  },
  {
    id: "pencil-planner",
    index: 29,
    name: "연필 계획가",
    emoji: "✏️",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/029-pencil-planner.webp",
    description: "연필 하나로 다음 판의 계획을 세우는 몽글이에요.",
  },
  {
    id: "music-hummer",
    index: 30,
    name: "콧노래 몽글",
    emoji: "🎵",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/030-music-hummer.webp",
    description: "작은 음표 쿠션을 안고 콧노래를 부르는 몽글이에요.",
  },
  {
    id: "bubble-washer",
    index: 31,
    name: "방울 세탁꾼",
    emoji: "🫧",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/031-bubble-washer.webp",
    description: "비누방울 하나를 굴리며 반짝반짝 닦는 몽글이에요.",
  },
  {
    id: "candle-keeper",
    index: 32,
    name: "촛불 지킴이",
    emoji: "🕯️",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/032-candle-keeper.webp",
    description: "작은 불빛을 조심히 지켜주는 차분한 몽글이에요.",
  },
  {
    id: "pumpkin-hat",
    index: 33,
    name: "호박모자 몽글",
    emoji: "🎃",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/033-pumpkin-hat.webp",
    description: "작은 호박 모자를 쓴 가을 몽글이에요.",
  },
  {
    id: "cotton-candy",
    index: 34,
    name: "솜사탕 몽글",
    emoji: "🍬",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/034-cotton-candy.webp",
    description: "솜사탕 구름을 살짝 들고 다니는 달콤한 몽글이에요.",
  },
  {
    id: "mini-fisher",
    index: 35,
    name: "미니 낚시꾼",
    emoji: "🎣",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/035-mini-fisher.webp",
    description: "작은 별 조각을 낚는 조용한 몽글이에요.",
  },
  {
    id: "doorbell-keeper",
    index: 36,
    name: "초인종 지킴이",
    emoji: "🔔",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/036-doorbell-keeper.webp",
    description: "딸랑 종소리로 새 몽글을 불러오는 몽글이에요.",
  },
  {
    id: "dandelion-runner",
    index: 37,
    name: "민들레 배달부",
    emoji: "🌼",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/037-dandelion-runner.webp",
    description: "민들레 홀씨를 조심히 배달하는 몽글이에요.",
  },
  {
    id: "sleep-mask",
    index: 38,
    name: "수면안대 몽글",
    emoji: "😴",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/038-sleep-mask.webp",
    description: "수면안대를 머리에 얹고 쉬는 법을 알려주는 몽글이에요.",
  },
  {
    id: "cupcake-guard",
    index: 39,
    name: "컵케이크 경비",
    emoji: "🧁",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/039-cupcake-guard.webp",
    description: "작은 컵케이크를 지키는 순한 경비 몽글이에요.",
  },
  {
    id: "tiny-brush",
    index: 40,
    name: "작은 붓장이",
    emoji: "🖌️",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/040-tiny-brush.webp",
    description: "붓 한 번으로 도감 칸을 환하게 칠하는 몽글이에요.",
  },
  {
    id: "pond-frog-friend",
    index: 41,
    name: "연못 친구",
    emoji: "🐸",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/041-pond-frog-friend.webp",
    description: "개구리 모자를 쓰고 연못가에서 손 흔드는 몽글이에요.",
  },
  {
    id: "toast-detective",
    index: 42,
    name: "토스트 탐정",
    emoji: "🍞",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/042-toast-detective.webp",
    description: "사라진 부스러기 단서를 찾는 아침 탐정 몽글이에요.",
  },
  {
    id: "mini-cactus",
    index: 43,
    name: "선인장 돌봄이",
    emoji: "🌵",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/043-mini-cactus.webp",
    description: "가시 없는 작은 선인장을 돌보는 몽글이에요.",
  },
  {
    id: "blanket-ghost",
    index: 44,
    name: "담요 유령",
    emoji: "👻",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/044-blanket-ghost.webp",
    description: "담요를 뒤집어쓴 척하는 장난스러운 몽글이에요.",
  },
  {
    id: "strawberry-scout",
    index: 45,
    name: "딸기 정찰대",
    emoji: "🍓",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/045-strawberry-scout.webp",
    description: "딸기 배지를 달고 길을 찾는 몽글이에요.",
  },
  {
    id: "paperclip-helper",
    index: 46,
    name: "클립 정리꾼",
    emoji: "📎",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/046-paperclip-helper.webp",
    description: "작은 클립 하나로 흩어진 조각을 정리해요.",
  },
  {
    id: "moon-napper",
    index: 47,
    name: "달빛 낮잠이",
    emoji: "🌙",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/047-moon-napper.webp",
    description: "초승달 쿠션에 기대어 쉬는 몽글이에요.",
  },
  {
    id: "tiny-drummer",
    index: 48,
    name: "콩콩 드러머",
    emoji: "🥁",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/048-tiny-drummer.webp",
    description: "작은 북을 콩콩 두드리는 리듬 몽글이에요.",
  },
  {
    id: "moss-hiker",
    index: 49,
    name: "이끼 등산가",
    emoji: "🥾",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/049-moss-hiker.webp",
    description: "작은 등산화를 신고 이끼 언덕을 오르는 몽글이에요.",
  },
  {
    id: "orange-peeler",
    index: 50,
    name: "귤껍질 장인",
    emoji: "🍊",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/050-orange-peeler.webp",
    description: "귤껍질 모자를 쓴 상큼한 몽글이에요.",
  },
  {
    id: "tiny-librarian",
    index: 51,
    name: "꼬마 사서",
    emoji: "📖",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/051-tiny-librarian.webp",
    description: "책장 사이를 조용히 정리하는 사서 몽글이에요.",
  },
  {
    id: "puddle-boat",
    index: 52,
    name: "웅덩이 선장",
    emoji: "⛵",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/052-puddle-boat.webp",
    description: "물웅덩이에 띄운 작은 배의 선장 몽글이에요.",
  },
  {
    id: "muffin-watcher",
    index: 53,
    name: "머핀 감시꾼",
    emoji: "🧁",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/053-muffin-watcher.webp",
    description: "머핀이 식을 때까지 곁을 지키는 몽글이에요.",
  },
  {
    id: "peach-cheek",
    index: 54,
    name: "복숭아 볼",
    emoji: "🍑",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/054-peach-cheek.webp",
    description: "복숭아빛 볼이 말랑한 부끄럼 몽글이에요.",
  },
  {
    id: "tiny-sail",
    index: 55,
    name: "돛단 몽글",
    emoji: "⛵",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/055-tiny-sail.webp",
    description: "작은 돛을背고 바람을 기다리는 몽글이에요.",
  },
  {
    id: "wool-ball",
    index: 56,
    name: "털실 굴림이",
    emoji: "🧶",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/056-wool-ball.webp",
    description: "털실 공을 굴리며 길을 만드는 몽글이에요.",
  },
  {
    id: "rain-snail",
    index: 57,
    name: "빗방울 달팽이",
    emoji: "🐌",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/057-rain-snail.webp",
    description: "달팽이 껍질 모양 우산을 쓴 느긋한 몽글이에요.",
  },
  {
    id: "small-clock",
    index: 58,
    name: "작은 시계꾼",
    emoji: "⏰",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/058-small-clock.webp",
    description: "시간을 재촉하지 않고 살짝 알려주는 몽글이에요.",
  },
  {
    id: "blueberry-hat",
    index: 59,
    name: "블루베리 모자",
    emoji: "🫐",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/059-blueberry-hat.webp",
    description: "블루베리 모자를 쓰고 통통 걷는 몽글이에요.",
  },
  {
    id: "cozy-key",
    index: 60,
    name: "포근 열쇠꾼",
    emoji: "🔑",
    rarity: "common" as Rarity,
    assetPath: "/mongles/premium/060-cozy-key.webp",
    description: "잠긴 도감 칸을 조용히 여는 열쇠 몽글이에요.",
  },
  {
    id: "detective-raindrop",
    index: 61,
    name: "빗방울 탐정",
    emoji: "🔍",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/061-detective-raindrop.webp",
    description: "빗소리 속에서 사라진 조각의 단서를 찾는 몽글이에요.",
  },
  {
    id: "thief-marshmallow",
    index: 62,
    name: "마시멜로 도둑",
    emoji: "🍡",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/062-thief-marshmallow.webp",
    description: "마시멜로 하나를 몰래 숨긴 순한 장난꾸러기예요.",
  },
  {
    id: "lantern-guide",
    index: 63,
    name: "등불 안내자",
    emoji: "🏮",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/063-lantern-guide.webp",
    description: "길 잃은 몽글들을 따뜻한 불빛으로 안내해요.",
  },
  {
    id: "pocket-wizard",
    index: 64,
    name: "주머니 마법사",
    emoji: "🪄",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/064-pocket-wizard.webp",
    description: "주머니에서 반짝 가루를 꺼내는 꼬마 마법 몽글이에요.",
  },
  {
    id: "forest-mail",
    index: 65,
    name: "숲속 우편원",
    emoji: "✉️",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/065-forest-mail.webp",
    description: "빈 편지봉투에 좋은 기분을 담아 배달해요.",
  },
  {
    id: "honey-guard",
    index: 66,
    name: "꿀단지 경비",
    emoji: "🍯",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/066-honey-guard.webp",
    description: "달콤한 꿀단지를 지키는 느긋한 경비 몽글이에요.",
  },
  {
    id: "cloud-shepherd",
    index: 67,
    name: "구름 목동",
    emoji: "☁️",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/067-cloud-shepherd.webp",
    description: "작은 구름 양을 몰고 다니는 몽글이에요.",
  },
  {
    id: "ribbon-dancer",
    index: 68,
    name: "리본 춤꾼",
    emoji: "🎀",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/068-ribbon-dancer.webp",
    description: "긴 리본으로 둥근 길을 그리며 춤추는 몽글이에요.",
  },
  {
    id: "pebble-archivist",
    index: 69,
    name: "조약돌 기록관",
    emoji: "🪨",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/069-pebble-archivist.webp",
    description: "특별한 조약돌을 도감 칸에 차곡차곡 기록해요.",
  },
  {
    id: "cocoa-patrol",
    index: 70,
    name: "코코아 순찰대",
    emoji: "☕",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/070-cocoa-patrol.webp",
    description: "따뜻한 코코아 향으로 지친 몽글을 찾아내요.",
  },
  {
    id: "moon-baker",
    index: 71,
    name: "달빛 제빵사",
    emoji: "🌙",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/071-moon-baker.webp",
    description: "초승달 모양 빵을 굽는 밤의 제빵 몽글이에요.",
  },
  {
    id: "secret-sock",
    index: 72,
    name: "비밀 양말꾼",
    emoji: "🧦",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/072-secret-sock.webp",
    description: "사라진 양말을 찾아오는 비밀 임무 몽글이에요.",
  },
  {
    id: "bubble-orchestra",
    index: 73,
    name: "방울 지휘자",
    emoji: "🫧",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/073-bubble-orchestra.webp",
    description: "비누방울 악단을 조용히 지휘하는 몽글이에요.",
  },
  {
    id: "maple-scout",
    index: 74,
    name: "단풍 정찰병",
    emoji: "🍁",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/074-maple-scout.webp",
    description: "단풍잎을 지도처럼 들고 길을 찾는 몽글이에요.",
  },
  {
    id: "tea-alchemist",
    index: 75,
    name: "찻잎 연금술사",
    emoji: "🍵",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/075-tea-alchemist.webp",
    description: "찻잎 향으로 말랑한 기운을 만드는 몽글이에요.",
  },
  {
    id: "snow-post",
    index: 76,
    name: "눈송이 배달원",
    emoji: "❄️",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/076-snow-post.webp",
    description: "녹지 않는 눈송이를 조심히 배달하는 몽글이에요.",
  },
  {
    id: "star-mender",
    index: 77,
    name: "별빛 수선공",
    emoji: "⭐",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/077-star-mender.webp",
    description: "깨진 별 조각을 둥글게 다듬어주는 몽글이에요.",
  },
  {
    id: "garden-drum",
    index: 78,
    name: "정원 드러머",
    emoji: "🥁",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/078-garden-drum.webp",
    description: "새싹들이 자라도록 콩콩 박자를 맞춰요.",
  },
  {
    id: "paperboat-pirate",
    index: 79,
    name: "종이배 해적",
    emoji: "🏴‍☠️",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/079-paperboat-pirate.webp",
    description: "종이배를 타는 귀여운 장난 해적 몽글이에요.",
  },
  {
    id: "candle-cartographer",
    index: 80,
    name: "촛불 지도꾼",
    emoji: "🕯️",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/080-candle-cartographer.webp",
    description: "촛불 하나로 보이지 않는 길을 밝혀요.",
  },
  {
    id: "strawberry-ninja",
    index: 81,
    name: "딸기 닌자",
    emoji: "🍓",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/081-strawberry-ninja.webp",
    description: "딸기잎 뒤에 숨어 있다가 휙 나타나는 몽글이에요.",
  },
  {
    id: "wool-magician",
    index: 82,
    name: "털실 마술사",
    emoji: "🧶",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/082-wool-magician.webp",
    description: "털실 공에서 작은 구름을 꺼내는 몽글이에요.",
  },
  {
    id: "compass-ranger",
    index: 83,
    name: "나침반 레인저",
    emoji: "🧭",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/083-compass-ranger.webp",
    description: "방향을 잃은 조각을 제자리로 보내요.",
  },
  {
    id: "flower-messenger",
    index: 84,
    name: "꽃잎 전령",
    emoji: "🌸",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/084-flower-messenger.webp",
    description: "꽃잎 편지를 바람에 실어 보내는 몽글이에요.",
  },
  {
    id: "tiny-rocket-mechanic",
    index: 85,
    name: "꼬마 로켓 정비공",
    emoji: "🚀",
    rarity: "rare" as Rarity,
    assetPath: "/mongles/premium/085-tiny-rocket-mechanic.webp",
    description: "작은 장난감 로켓을 닦아주는 몽글이에요.",
  },
  {
    id: "aurora-pillow-guardian",
    index: 86,
    name: "오로라 베개 수호자",
    emoji: "🌈",
    rarity: "epic" as Rarity,
    assetPath: "/mongles/premium/086-aurora-pillow-guardian.webp",
    description: "오로라빛 베개로 꿈 조각을 지키는 몽글이에요.",
  },
  {
    id: "crystal-librarian",
    index: 87,
    name: "수정 사서",
    emoji: "💎",
    rarity: "epic" as Rarity,
    assetPath: "/mongles/premium/087-crystal-librarian.webp",
    description: "수정 책갈피로 숨은 이야기를 찾아내는 몽글이에요.",
  },
  {
    id: "moonlight-detective",
    index: 88,
    name: "달빛 탐정",
    emoji: "🔍",
    rarity: "epic" as Rarity,
    assetPath: "/mongles/premium/088-moonlight-detective.webp",
    description: "달빛 아래에서 가장 희미한 단서도 찾아내요.",
  },
  {
    id: "thunder-teacup",
    index: 89,
    name: "번개 찻잔이",
    emoji: "⚡",
    rarity: "epic" as Rarity,
    assetPath: "/mongles/premium/089-thunder-teacup.webp",
    description: "찻잔 속 작은 번개로 기운을 깨우는 몽글이에요.",
  },
  {
    id: "planet-shepherd",
    index: 90,
    name: "행성 목동",
    emoji: "🪐",
    rarity: "epic" as Rarity,
    assetPath: "/mongles/premium/090-planet-shepherd.webp",
    description: "작은 행성들을 조용히 줄 세우는 우주 몽글이에요.",
  },
  {
    id: "rainbow-tailor",
    index: 91,
    name: "무지개 재봉사",
    emoji: "🌈",
    rarity: "epic" as Rarity,
    assetPath: "/mongles/premium/091-rainbow-tailor.webp",
    description: "무지개 실로 도감 칸을 부드럽게 이어줘요.",
  },
  {
    id: "meteor-postman",
    index: 92,
    name: "별똥별 우체부",
    emoji: "☄️",
    rarity: "epic" as Rarity,
    assetPath: "/mongles/premium/092-meteor-postman.webp",
    description: "별똥별 소식을 빠르게 전하는 몽글이에요.",
  },
  {
    id: "secret-crown-keeper",
    index: 93,
    name: "왕관 보관꾼",
    emoji: "👑",
    rarity: "epic" as Rarity,
    assetPath: "/mongles/premium/093-secret-crown-keeper.webp",
    description: "작은 왕관을 조심히 닦아 빛내는 몽글이에요.",
  },
  {
    id: "deepsea-lantern",
    index: 94,
    name: "심해 등불이",
    emoji: "🌊",
    rarity: "epic" as Rarity,
    assetPath: "/mongles/premium/094-deepsea-lantern.webp",
    description: "깊은 바다빛 등불을 들고 나타나는 몽글이에요.",
  },
  {
    id: "skywhale-friend",
    index: 95,
    name: "하늘고래 친구",
    emoji: "🐋",
    rarity: "epic" as Rarity,
    assetPath: "/mongles/premium/095-skywhale-friend.webp",
    description: "하늘고래 구름 곁을 떠다니는 몽글이에요.",
  },
  {
    id: "golden-sleepy-ghost",
    index: 96,
    name: "황금 낮잠 유령",
    emoji: "🌟",
    rarity: "unique" as Rarity,
    assetPath: "/mongles/premium/096-golden-sleepy-ghost.webp",
    description: "잠든 사이에 도감 칸을 반짝 채워주는 유니크 몽글이에요.",
  },
  {
    id: "baby-dragon-detective",
    index: 97,
    name: "아기 용 탐정",
    emoji: "🐉",
    rarity: "unique" as Rarity,
    assetPath: "/mongles/premium/097-baby-dragon-detective.webp",
    description: "꼬마 용이 된 탐정 몽글. 1% 확률로 만나는 특별한 친구예요.",
  },
  {
    id: "aurora-cookie-thief",
    index: 98,
    name: "오로라 쿠키 도둑",
    emoji: "🍪",
    rarity: "unique" as Rarity,
    assetPath: "/mongles/premium/098-aurora-cookie-thief.webp",
    description: "쿠키 하나를 들고 오로라 속에서 슬쩍 나타나는 장난꾸러기예요.",
  },
  {
    id: "star-crown-ghost",
    index: 99,
    name: "별왕관 유령",
    emoji: "👑",
    rarity: "unique" as Rarity,
    assetPath: "/mongles/premium/099-star-crown-ghost.webp",
    description: "별왕관을 쓴 유령 친구. 도감 끝에서 가장 밝게 빛나요.",
  },
  {
    id: "rainbow-dragon-helper",
    index: 100,
    name: "무지개 용 도우미",
    emoji: "🐲",
    rarity: "unique" as Rarity,
    assetPath: "/mongles/premium/100-rainbow-dragon-helper.webp",
    description: "무지개 꼬리를 흔들며 마지막 조각을 도와주는 몽글이에요.",
  },
];

const MULTIPLIER_BY_RARITY: Record<Rarity, number> = {
  common: 1,
  rare: 1.15,
  epic: 1.5,
  unique: 2,
};

const CHANCE_LABEL_BY_RARITY: Record<Rarity, string> = {
  common: "자주 나와요",
  rare: "가끔 나와요",
  epic: "잘 안 나와요",
  unique: "1% 대박",
};

function createPlayId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `play-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function positionKey(position: Position) {
  return `${position.row}:${position.col}`;
}

function isSamePosition(a: Position, b: Position) {
  return a.row === b.row && a.col === b.col;
}

function getSwapClass(position: Position, swap: SwapAnimation) {
  if (!swap) return "";

  const isFrom = isSamePosition(position, swap.from);
  const isTo = isSamePosition(position, swap.to);
  if (!isFrom && !isTo) return "";

  const rowDelta = swap.to.row - swap.from.row;
  const colDelta = swap.to.col - swap.from.col;
  const direction = Math.abs(colDelta) > Math.abs(rowDelta)
    ? colDelta > 0 ? "right" : "left"
    : rowDelta > 0 ? "down" : "up";
  const reverseDirection = Math.abs(colDelta) > Math.abs(rowDelta)
    ? colDelta > 0 ? "left" : "right"
    : rowDelta > 0 ? "up" : "down";

  return `swapping swap-${isFrom ? direction : reverseDirection}${swap.invalid ? " invalid-swap" : ""}`;
}

function getFallDistances(beforeBoard: Tile[][], afterBoard: Tile[][]): FallDistances {
  const previousPositions = new Map<string, Position>();

  beforeBoard.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      previousPositions.set(tile.id, { row: rowIndex, col: colIndex });
    });
  });

  const distances: FallDistances = {};
  const size = afterBoard.length;

  afterBoard.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      const previous = previousPositions.get(tile.id);
      const key = positionKey({ row: rowIndex, col: colIndex });
      if (previous && previous.col === colIndex) {
        const distance = rowIndex - previous.row;
        if (distance > 0) distances[key] = distance;
        return;
      }

      distances[key] = Math.max(1, rowIndex + 1, size - rowIndex);
    });
  });

  return distances;
}

const MONGLE_POOL: CollectibleMongle[] = MONGLE_ITEMS.map((mongle) => ({
  id: mongle.id,
  name: mongle.name,
  emoji: mongle.emoji,
  imageSrc: mongle.assetPath,
  rarity: mongle.rarity,
  scoreMultiplier: MULTIPLIER_BY_RARITY[mongle.rarity],
  chanceLabel: CHANCE_LABEL_BY_RARITY[mongle.rarity],
  description: mongle.rarity === "unique" ? `${mongle.description} 리더보드 점수를 2배로 올려요.` : mongle.description,
}));


const TILE_META: Record<Tile["type"], { label: string; emoji: string }> = {
  berry: { label: "베리", emoji: "🫐" },
  leaf: { label: "잎", emoji: "🌿" },
  star: { label: "별", emoji: "⭐" },
  drop: { label: "물방울", emoji: "💧" },
  moon: { label: "달", emoji: "🌙" },
};

function App() {
  const [status, setStatus] = useState<GameStatus>("home");
  const [board, setBoard] = useState<Tile[][]>(() => createBoard({ tileTypes: DIFFICULTY_STAGES[0].tileTypes }));
  const [selected, setSelected] = useState<Position | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(DIFFICULTY_STAGES[0].moves);
  const [message, setMessage] = useState("랜덤 몽글을 모아 리더보드 점수를 올려보세요");
  const [profile, setProfile] = useState<GameProfile | null>(null);
  const [playId, setPlayId] = useState(() => createPlayId());
  const [scoreSubmitStatus, setScoreSubmitStatus] = useState<string>("대기 중");
  const [showTutorial, setShowTutorial] = useState(false);
  const [swapAnimation, setSwapAnimation] = useState<SwapAnimation>(null);
  const [clearingKeys, setClearingKeys] = useState<Set<string>>(() => new Set());
  const [fallDistances, setFallDistances] = useState<FallDistances>({});
  const [isSettlingBoard, setIsSettlingBoard] = useState(false);
  const [isAnimatingMove, setIsAnimatingMove] = useState(false);
  const [todayMongle, setTodayMongle] = useState<CollectibleMongle>(() => drawMongle());
  const [collection, setCollection] = useState<CollectionState>(() => loadCollection());
  const [stageLevel, setStageLevel] = useState(() => loadStageLevel());

  const stage = useMemo(() => getStage(stageLevel), [stageLevel]);
  const leaderboardScore = useMemo(
    () => Math.round(score * todayMongle.scoreMultiplier),
    [score, todayMongle.scoreMultiplier],
  );
  const rarityBonus = Math.max(0, leaderboardScore - score);
  const progress = useMemo(() => Math.min(100, Math.round((score / stage.targetScore) * 100)), [score, stage.targetScore]);
  const collectedKinds = useMemo(
    () => Object.values(collection).filter((count) => count > 0).length,
    [collection],
  );
  const totalCollected = useMemo(
    () => Object.values(collection).reduce((sum, count) => sum + count, 0),
    [collection],
  );

  useEffect(() => {
    getGameProfileOrFallback().then(setProfile);
  }, []);

  useEffect(() => {
    if ((status === "won" || status === "lost") && leaderboardScore > 0) {
      submitScoreOnce(leaderboardScore, playId).then((result) => {
        const labelByStatus = {
          "already-submitted": "이미 제출됨",
          unsupported: "토스앱 버전 미지원",
          success: "제출 완료",
          failed: "제출 실패",
          fallback: "로컬 fallback",
        } as const;
        setScoreSubmitStatus(labelByStatus[result.status]);
      });
    }
  }, [leaderboardScore, playId, status]);

  function startGame() {
    const nextMongle = drawMongle();
    setTodayMongle(nextMongle);
    setBoard(createBoard({ tileTypes: stage.tileTypes }));
    setSelected(null);
    setScore(0);
    setMoves(stage.moves);
    setMessage(`${stage.label}: ${stage.note}`);
    setPlayId(createPlayId());
    setScoreSubmitStatus("대기 중");
    setShowTutorial(true);
    setSwapAnimation(null);
    setClearingKeys(new Set());
    setFallDistances({});
    setIsSettlingBoard(false);
    setIsAnimatingMove(false);
    setStatus("playing");
  }

  function finishGame(nextStatus: "won" | "lost") {
    setStatus(nextStatus);
    setMessage(nextStatus === "won" ? "몽글 조각 획득!" : "아쉽지만 몽글 조각은 찾았어요");
    setCollection((current) => saveCollectedMongle(current, todayMongle.id));
    if (nextStatus === "won") {
      setStageLevel((current) => saveStageLevel(Math.min(current + 1, DIFFICULTY_STAGES.length)));
    }
  }

  function playMove(from: Position, to: Position) {
    if (status !== "playing" || isAnimatingMove) return;

    const result = resolveMove(board, from, to, stage.tileTypes);
    setSelected(null);

    if (!result.swappedBoard) {
      setMessage("옆 칸으로 밀어서 바꿔보세요");
      return;
    }

    setIsAnimatingMove(true);
    setSwapAnimation({ from, to, invalid: !result.didMatch });

    if (!result.didMatch) {
      setMessage("아직 안 맞아요. 3개가 이어지도록 밀어보세요");
      window.setTimeout(() => {
        setSwapAnimation(null);
        setIsAnimatingMove(false);
      }, 260);
      return;
    }

    const nextScore = score + result.gainedScore;
    const nextMoves = moves - 1;

    window.setTimeout(() => {
      setBoard(result.swappedBoard ?? board);
      setSwapAnimation(null);
      setClearingKeys(new Set(result.matchedKeys));
      setMessage(`${result.matchedCount}개 매치! 몽글이 톡 터졌어요`);
    }, 150);

    window.setTimeout(() => {
      setBoard(result.board);
      setFallDistances(getFallDistances(result.swappedBoard ?? board, result.board));
      setClearingKeys(new Set());
      setIsSettlingBoard(true);
      setScore(nextScore);
      setMoves(nextMoves);
      setMessage(`${result.matchedCount}개 매치! 기본 +${result.gainedScore}점`);
    }, 430);

    window.setTimeout(() => {
      setIsSettlingBoard(false);
      setFallDistances({});
      setIsAnimatingMove(false);

      if (nextScore >= stage.targetScore) {
        finishGame("won");
        return;
      }

      if (nextMoves <= 0) {
        finishGame("lost");
      }
    }, 720);
  }

  function handleTilePress(position: Position) {
    if (status !== "playing") return;

    if (!selected) {
      setSelected(position);
      setMessage("옆 칸으로 밀거나, 바꿀 칸을 한 번 더 눌러보세요");
      return;
    }

    if (selected.row === position.row && selected.col === position.col) {
      setSelected(null);
      setMessage("선택을 취소했어요");
      return;
    }

    playMove(selected, position);
  }

  function handleTileSwipe(from: Position, to: Position) {
    if (status !== "playing") return;
    playMove(from, to);
  }

  function addMovesByAdFallback() {
    setMoves((current) => current + 3);
    setStatus("playing");
    setMessage("광고 보상 fallback으로 이동 +3을 열었어요");
  }

  function bonusDrawByAdFallback() {
    const bonusMongle = drawMongle();
    setCollection((current) => saveCollectedMongle(current, bonusMongle.id));
    setMessage(`${bonusMongle.name} 보너스 조각을 찾았어요`);
  }

  async function handleLeaderboard() {
    const result = await openLeaderboardSafe();
    if (result.status === "fallback") {
      setMessage("토스앱에서 리더보드를 확인할 수 있어요");
    }
  }

  return (
    <main className="game-shell">
      <section className={`game-card ${status === "playing" ? "is-playing" : ""}`} aria-label="몽글 매치 퍼즐">
        {status === "home" ? (
          <HomeScreen
            profile={profile}
            collection={collection}
            collectedKinds={collectedKinds}
            totalCollected={totalCollected}
            stage={stage}
            onStart={startGame}
            onLeaderboard={handleLeaderboard}
          />
        ) : (
          <>
            <Header score={score} moves={moves} progress={progress} leaderboardScore={leaderboardScore} stage={stage} />
            <p className="status-message">{message}</p>

            {showTutorial && status === "playing" ? (
              <div className="tutorial-card">
                <strong>오늘의 목표</strong>
                <p>
                  스와이프로 3개를 맞추면 터지고, 새 블록이 내려와요. 목표 점수를 넘기면 몽글 조각을 얻어요.
                </p>
                <button type="button" onClick={() => setShowTutorial(false)}>
                  몽글 찾으러 가기
                </button>
              </div>
            ) : null}

            {status === "playing" && !showTutorial ? (
              <Board
                board={board}
                selected={selected}
                onTilePress={handleTilePress}
                onTileSwipe={handleTileSwipe}
                swapAnimation={swapAnimation}
                clearingKeys={clearingKeys}
                fallDistances={fallDistances}
                isSettling={isSettlingBoard}
                disabled={status !== "playing" || isAnimatingMove}
              />
            ) : null}

            {status === "playing" && !showTutorial ? (
              <div className="booster-row">
                <button type="button" onClick={() => setMessage("힌트는 다음 버전에서 열려요")}>힌트</button>
                <button type="button" onClick={addMovesByAdFallback}>광고 보고 이동 +3</button>
                <button type="button" onClick={handleLeaderboard}>랭킹</button>
              </div>
            ) : null}

            {status !== "playing" ? (
              <ResultPanel
                status={status}
                score={score}
                leaderboardScore={leaderboardScore}
                rarityBonus={rarityBonus}
                scoreSubmitStatus={scoreSubmitStatus}
                collectedMongle={todayMongle}
                collectionCount={collection[todayMongle.id] ?? 0}
                onRestart={startGame}
                onLeaderboard={handleLeaderboard}
                onContinue={addMovesByAdFallback}
                onBonusDraw={bonusDrawByAdFallback}
              />
            ) : null}
          </>
        )}

        <div className={`ad-slot ${status === "playing" ? "compact" : ""}`} aria-label="광고 슬롯">
          AD · 하단 배너 광고 영역
        </div>
      </section>
    </main>
  );
}

function HomeScreen({
  profile,
  collection,
  collectedKinds,
  totalCollected,
  stage,
  onStart,
  onLeaderboard,
}: {
  profile: GameProfile | null;
  collection: CollectionState;
  collectedKinds: number;
  totalCollected: number;
  stage: DifficultyStage;
  onStart: () => void;
  onLeaderboard: () => void;
}) {
  return (
    <div className="home-screen">
      <div className="loading-pill">랜덤 몽글 출현 중</div>
      <div className="brand-hero" aria-hidden="true">
        <MongleArtwork className="mongle mongle-a" mongle={MONGLE_POOL[0]} />
        <MongleArtwork className="mongle mongle-b" mongle={MONGLE_POOL[99]} />
        <MongleArtwork className="mongle mongle-c" mongle={MONGLE_POOL[80]} />
      </div>
      <p className="welcome-copy">반가워요, {profile?.nickname ?? "플레이어"}님</p>
      <h1>랜덤 몽글 모으기</h1>
      <p className="home-rule">100종 몽글 도감을 채우고, 1% 유니크 몽글로 리더보드 점수 2배!</p>
      <div className="stage-card">
        <span>현재 단계</span>
        <strong>{stage.level}. {stage.label}</strong>
        <small>목표 {stage.targetScore}점 · 이동 {stage.moves}번 · {stage.note}</small>
      </div>
      <div className="collection-summary">
        <strong>{collectedKinds}/{MONGLE_POOL.length}종 수집</strong>
        <span>총 {totalCollected}조각 · 레어 이상이면 리더보드 보너스</span>
      </div>
      <MiniCollection collection={collection} />
      <button className="primary-cta" type="button" onClick={onStart}>
        오늘 몽글 찾기
      </button>
      <div className="home-menu">
        <button type="button" onClick={onStart}>한 판 도전</button>
        <button type="button" onClick={onLeaderboard}>랭킹</button>
        <button type="button" onClick={() => window.alert("도감 상세는 다음 버전에서 열려요")}>도감</button>
      </div>
      <p className="safe-note">포인트 보상이 아니라 게임 안 수집 조각이에요. 실제 랭킹은 토스앱에서 연결돼요.</p>
    </div>
  );
}

function Header({
  score,
  moves,
  progress,
  leaderboardScore,
  stage,
}: {
  score: number;
  moves: number;
  progress: number;
  leaderboardScore: number;
  stage: DifficultyStage;
}) {
  return (
    <header className="play-header">
      <div className="stage-chip">
        <span>단계</span>
        <strong>{stage.level}</strong>
      </div>
      <div>
        <span>이동</span>
        <strong>{moves}</strong>
      </div>
      <div>
        <span>점수</span>
        <strong>{score}</strong>
      </div>
      <div>
        <span>랭킹</span>
        <strong>{leaderboardScore}</strong>
      </div>
      <div className="progress-track" aria-label={`목표 달성률 ${progress}%`}>
        <span style={{ width: `${progress}%` }} />
      </div>
      <p className="stage-note">{stage.label} · 목표 {stage.targetScore}점</p>
    </header>
  );
}

function Board({
  board,
  selected,
  onTilePress,
  onTileSwipe,
  swapAnimation,
  clearingKeys,
  fallDistances,
  isSettling,
  disabled,
}: {
  board: Tile[][];
  selected: Position | null;
  onTilePress: (position: Position) => void;
  onTileSwipe: (from: Position, to: Position) => void;
  swapAnimation: SwapAnimation;
  clearingKeys: Set<string>;
  fallDistances: FallDistances;
  isSettling: boolean;
  disabled: boolean;
}) {
  const pointerStartRef = useRef<{ x: number; y: number; position: Position } | null>(null);
  const didSwipeRef = useRef(false);

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>, position: Position) {
    if (disabled) return;
    event.preventDefault();
    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      position,
    };
    didSwipeRef.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
    if (disabled || !pointerStartRef.current) return;
    event.preventDefault();

    const start = pointerStartRef.current;
    pointerStartRef.current = null;

    const diffX = event.clientX - start.x;
    const diffY = event.clientY - start.y;
    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);
    const swipeThreshold = 24;

    if (Math.max(absX, absY) < swipeThreshold) return;

    const to =
      absX > absY
        ? { row: start.position.row, col: start.position.col + (diffX > 0 ? 1 : -1) }
        : { row: start.position.row + (diffY > 0 ? 1 : -1), col: start.position.col };

    if (to.row < 0 || to.row >= BOARD_SIZE || to.col < 0 || to.col >= BOARD_SIZE) return;

    didSwipeRef.current = true;
    onTileSwipe(start.position, to);
  }

  function handlePointerCancel() {
    pointerStartRef.current = null;
    didSwipeRef.current = false;
  }

  function handleTileClick(position: Position) {
    if (didSwipeRef.current) {
      didSwipeRef.current = false;
      return;
    }

    onTilePress(position);
  }

  return (
    <div className="board" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}>
      {board.map((row, rowIndex) =>
        row.map((tile, colIndex) => {
          const position = { row: rowIndex, col: colIndex };
          const isSelected = selected?.row === rowIndex && selected?.col === colIndex;
          const key = positionKey(position);
          const fallDistance = fallDistances[key] ?? 1;
          const animationClass = [
            getSwapClass(position, swapAnimation),
            clearingKeys.has(key) ? "clearing" : "",
            isSettling && fallDistances[key] ? "falling" : "",
          ].filter(Boolean).join(" ");
          return (
            <button
              className={`tile tile-${tile.type} ${isSelected ? "selected" : ""} ${animationClass}`}
              key={tile.id}
              type="button"
              aria-label={`${TILE_META[tile.type].label} 몽글 ${rowIndex + 1}행 ${colIndex + 1}열`}
              disabled={disabled}
              style={{ "--fall-y": `${fallDistance * -46}px` } as CSSProperties}
              onClick={() => handleTileClick(position)}
              onPointerCancel={handlePointerCancel}
              onPointerDown={(event) => handlePointerDown(event, position)}
              onPointerUp={handlePointerUp}
            >
              <span>{TILE_META[tile.type].emoji}</span>
            </button>
          );
        }),
      )}
    </div>
  );
}

function ResultPanel({
  status,
  score,
  leaderboardScore,
  rarityBonus,
  scoreSubmitStatus,
  collectedMongle,
  collectionCount,
  onRestart,
  onLeaderboard,
  onContinue,
  onBonusDraw,
}: {
  status: GameStatus;
  score: number;
  leaderboardScore: number;
  rarityBonus: number;
  scoreSubmitStatus: string;
  collectedMongle: CollectibleMongle;
  collectionCount: number;
  onRestart: () => void;
  onLeaderboard: () => void;
  onContinue: () => void;
  onBonusDraw: () => void;
}) {
  const isWon = status === "won";
  const rarity = RARITY_META[collectedMongle.rarity];

  return (
    <div className="result-panel">
      <div className={`mongle-result ${rarity.className}`}>
        <MongleArtwork className="result-mongle-image" mongle={collectedMongle} alt={`${collectedMongle.name} 이미지`} />
        <div>
          <span className="rarity-badge">{rarity.label}</span>
          <h2>{collectedMongle.name} 획득!</h2>
        </div>
      </div>
      <p>{collectedMongle.description}</p>
      <div className="score-breakdown">
        <div>
          <span>기본 점수</span>
          <strong>{score}</strong>
        </div>
        <div>
          <span>{rarity.label} 보너스</span>
          <strong>+{rarityBonus}</strong>
        </div>
        <div>
          <span>리더보드 점수</span>
          <strong>{leaderboardScore}</strong>
        </div>
      </div>
      <p className="submit-state">
        도감 {collectionCount}조각째 · 리더보드: {scoreSubmitStatus}
      </p>
      <div className="result-actions">
        <button className="primary-cta" type="button" onClick={onRestart}>
          {isWon ? "다음 몽글 찾기" : "다시 도전"}
        </button>
        {!isWon ? <button type="button" onClick={onContinue}>광고 보고 이동 +3</button> : null}
        <button type="button" onClick={onBonusDraw}>광고 보고 보너스 몽글</button>
        <button type="button" onClick={onLeaderboard}>랭킹 보기</button>
      </div>
    </div>
  );
}

function MiniCollection({ collection }: { collection: CollectionState }) {
  const previewMongles = [
    ...MONGLE_POOL.slice(0, 8),
    MONGLE_POOL.find((mongle) => mongle.rarity === "rare"),
    MONGLE_POOL.find((mongle) => mongle.rarity === "epic"),
    MONGLE_POOL.find((mongle) => mongle.rarity === "unique"),
  ].filter((mongle): mongle is CollectibleMongle => Boolean(mongle));
  const hiddenCount = MONGLE_POOL.length - previewMongles.length;

  return (
    <div className="mini-collection" aria-label="몽글 도감 미리보기">
      {previewMongles.map((mongle) => {
        const count = collection[mongle.id] ?? 0;
        const rarity = RARITY_META[mongle.rarity];
        return (
          <div className={`collection-chip ${rarity.className}`} key={mongle.id}>
            <MongleArtwork
              className={count > 0 ? "collection-mongle-image" : "collection-mongle-image locked"}
              mongle={mongle}
              alt=""
            />
            <div className="collection-chip-copy">
              <strong>{mongle.name.replace(" 몽글", "")}</strong>
              <span className="collection-rarity-pill">{rarity.shortLabel}</span>
              {count > 0 ? <small>x{count}</small> : null}
            </div>
          </div>
        );
      })}
      <div className="collection-chip collection-more">
        <span>+{hiddenCount}</span>
        <small>도감에서 보기</small>
      </div>
    </div>
  );
}

function MongleArtwork({
  mongle,
  className,
  alt = "",
}: {
  mongle: CollectibleMongle;
  className: string;
  alt?: string;
}) {
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoadFailed(false);
  }, [mongle.imageSrc]);

  const rarity = RARITY_META[mongle.rarity];
  const shouldLoadAsset = PREMIUM_ASSETS_READY && !loadFailed;

  return (
    <span
      className={`${className} mongle-artwork-shell ${rarity.className} ${shouldLoadAsset ? "" : "asset-placeholder"}`}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
    >
      {shouldLoadAsset ? (
        <img src={mongle.imageSrc} alt="" onError={() => setLoadFailed(true)} />
      ) : (
        <span className="placeholder-core" aria-hidden="true">
          <span className="placeholder-face" />
          <span className="placeholder-sparkle" />
        </span>
      )}
    </span>
  );
}

function drawMongle(): CollectibleMongle {
  const roll = Math.random();

  if (roll < 0.64) {
    return randomFrom(MONGLE_POOL.filter((mongle) => mongle.rarity === "common"), MONGLE_POOL[0]);
  }

  if (roll < 0.89) {
    return randomFrom(MONGLE_POOL.filter((mongle) => mongle.rarity === "rare"), MONGLE_POOL[0]);
  }

  if (roll < 0.99) {
    return randomFrom(MONGLE_POOL.filter((mongle) => mongle.rarity === "epic"), MONGLE_POOL[0]);
  }

  return randomFrom(MONGLE_POOL.filter((mongle) => mongle.rarity === "unique"), MONGLE_POOL[0]);
}

function randomFrom<T>(items: T[], fallback: T): T {
  if (items.length === 0) return fallback;
  return items[Math.floor(Math.random() * items.length)];
}

function loadCollection(): CollectionState {
  try {
    const raw = window.localStorage.getItem(COLLECTION_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as CollectionState;
  } catch {
    return {};
  }
}

function loadStageLevel(): number {
  try {
    const raw = window.localStorage.getItem(STAGE_STORAGE_KEY);
    const parsed = raw ? Number(raw) : 1;
    if (!Number.isFinite(parsed)) return 1;
    return Math.min(Math.max(Math.round(parsed), 1), DIFFICULTY_STAGES.length);
  } catch {
    return 1;
  }
}

function saveStageLevel(nextLevel: number): number {
  window.localStorage.setItem(STAGE_STORAGE_KEY, String(nextLevel));
  return nextLevel;
}

function getStage(level: number): DifficultyStage {
  return DIFFICULTY_STAGES[Math.min(Math.max(level, 1), DIFFICULTY_STAGES.length) - 1] ?? DIFFICULTY_STAGES[0];
}

function saveCollectedMongle(current: CollectionState, mongleId: string): CollectionState {
  const next = {
    ...current,
    [mongleId]: (current[mongleId] ?? 0) + 1,
  };
  window.localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export default App;


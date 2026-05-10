import {
  getOperationalEnvironment,
  getUserKeyForGame,
  isMinVersionSupported,
  openGameCenterLeaderboard,
  submitGameCenterLeaderBoardScore,
} from "@apps-in-toss/web-framework";

export type GameProfile = {
  nickname: string;
  userKey?: string;
  environment: "toss" | "sandbox" | "local";
  isFallback: boolean;
  message: string;
};

export type ScoreSubmitStatus =
  | { status: "success" }
  | { status: "already-submitted" }
  | { status: "unsupported" }
  | { status: "failed"; statusCode?: string }
  | { status: "fallback" };

const submittedPlayIds = new Set<string>();
const GAME_CENTER_MIN_VERSION = { android: "5.185.0", ios: "5.185.0" } as const;

export function getGameCenterEnvironment(): GameProfile["environment"] {
  try {
    return getOperationalEnvironment() === "sandbox" ? "sandbox" : "toss";
  } catch {
    return "local";
  }
}

export function isGameCenterSupported() {
  try {
    return (
      getGameCenterEnvironment() === "toss" &&
      isMinVersionSupported(GAME_CENTER_MIN_VERSION)
    );
  } catch {
    return false;
  }
}

export async function getGameProfileOrFallback(): Promise<GameProfile> {
  const environment = getGameCenterEnvironment();

  if (environment !== "toss" || !isGameCenterSupported()) {
    return {
      nickname: "연습 수비대",
      environment,
      isFallback: true,
      message: "연습 모드로 진행해요.",
    };
  }

  try {
    const userKey = await getUserKeyForGame();
    if (userKey && typeof userKey === "object" && "hash" in userKey) {
      return {
        nickname: "몽글 수비대",
        userKey: userKey.hash,
        environment,
        isFallback: false,
        message: "게임 프로필 확인 완료",
      };
    }

    return {
      nickname: "연습 수비대",
      environment,
      isFallback: true,
      message: "게임 프로필 확인 전이라 연습 모드로 진행해요.",
    };
  } catch (error) {
    console.info("게임 프로필 fallback", error);
    return {
      nickname: "연습 수비대",
      environment,
      isFallback: true,
      message: "프로필 확인이 어려워 연습 모드로 진행해요.",
    };
  }
}

export async function submitScoreOnce(
  score: number,
  playId: string,
): Promise<ScoreSubmitStatus> {
  if (submittedPlayIds.has(playId)) {
    return { status: "already-submitted" };
  }

  submittedPlayIds.add(playId);

  if (!isGameCenterSupported()) {
    return { status: "unsupported" };
  }

  try {
    const result = await submitGameCenterLeaderBoardScore({
      score: score.toFixed(1),
    });

    if (!result) {
      return { status: "unsupported" };
    }

    if (result.statusCode === "SUCCESS") {
      return { status: "success" };
    }

    return { status: "failed", statusCode: result.statusCode };
  } catch (error) {
    console.info("게임 리더보드 점수 제출 fallback", error);
    return { status: "fallback" };
  }
}

export async function openLeaderboardSafe() {
  if (!isGameCenterSupported()) {
    return { status: "fallback" as const };
  }

  try {
    await openGameCenterLeaderboard();
    return { status: "opened" as const };
  } catch (error) {
    console.info("게임 리더보드 열기 fallback", error);
    return { status: "fallback" as const };
  }
}

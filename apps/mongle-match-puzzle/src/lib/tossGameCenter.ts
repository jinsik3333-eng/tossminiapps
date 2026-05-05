import {
  openGameCenterLeaderboard,
  submitGameCenterLeaderBoardScore,
} from "@apps-in-toss/web-framework";

export type GameProfile = {
  nickname: string;
  isFallback: boolean;
};

const submittedPlayIds = new Set<string>();

export async function getGameProfileOrFallback(): Promise<GameProfile> {
  // 공식 게임 프로필 생성/확인은 토스 게임 센터 WebView에서 처리된다.
  // 로컬/브라우저 QA에서는 게임 흐름이 막히지 않도록 fallback 프로필을 사용한다.
  return {
    nickname: "플레이어",
    isFallback: true,
  };
}

export async function submitScoreOnce(score: number, playId: string) {
  if (submittedPlayIds.has(playId)) {
    return { status: "already-submitted" as const };
  }

  submittedPlayIds.add(playId);

  try {
    const result = await submitGameCenterLeaderBoardScore({ score: String(score) });

    if (!result) {
      return { status: "unsupported" as const };
    }

    if (result.statusCode === "SUCCESS") {
      return { status: "success" as const };
    }

    return { status: "failed" as const, statusCode: result.statusCode };
  } catch (error) {
    console.info("게임 리더보드 점수 제출 fallback", error);
    return { status: "fallback" as const };
  }
}

export async function openLeaderboardSafe() {
  try {
    await openGameCenterLeaderboard();
    return { status: "opened" as const };
  } catch (error) {
    console.info("게임 리더보드 열기 fallback", error);
    return { status: "fallback" as const };
  }
}

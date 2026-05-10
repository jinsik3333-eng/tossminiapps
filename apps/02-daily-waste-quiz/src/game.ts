export const DAILY_BOARD_DAYS = 30;
export const QUESTION_TIME_LIMIT = 5;

export type DefenseGrade = {
  title: string;
  label: string;
  percent: number;
  blockedCount: number;
};

export type BoardSlot = {
  day: number;
  filled: boolean;
};

export function getDefenseGrade(score: number, maxScore: number): DefenseGrade {
  const safeMax = Math.max(maxScore, 1);
  const percent = Math.round((score / safeMax) * 100);
  const blockedCount = Math.round(score / 2);

  if (percent >= 90) {
    return {
      title: "완전 방어",
      label: `${blockedCount}번 모두 막음`,
      percent,
      blockedCount,
    };
  }

  if (percent >= 45) {
    return {
      title: "아슬 방어",
      label: `${blockedCount}번 막음`,
      percent,
      blockedCount,
    };
  }

  return {
    title: "내일 복수전",
    label: `${blockedCount}번 막음`,
    percent,
    blockedCount,
  };
}

export function getCountdownCopy(secondsLeft: number) {
  if (secondsLeft <= 0) {
    return "시간 끝";
  }

  return `${secondsLeft}초 안에 탭`;
}

export function getMonthlyBoardSlots(stamps: string[]): BoardSlot[] {
  return Array.from({ length: DAILY_BOARD_DAYS }, (_, index) => ({
    day: index + 1,
    filled: index < stamps.length,
  }));
}

export function getTodayMissionLabel(enemy: string) {
  return `오늘 미션 · ${enemy}`;
}

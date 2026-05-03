import { describe, expect, it } from "vitest";
import {
  DAILY_BOARD_DAYS,
  getCountdownCopy,
  getDefenseGrade,
  getMonthlyBoardSlots,
  getTodayMissionLabel,
} from "../src/game";

describe("daily waste retention loop", () => {
  it("explains score as defense grade instead of an unclear 100-point score", () => {
    expect(getDefenseGrade(6, 6)).toMatchObject({
      title: "완전 방어",
      label: "3번 모두 막음",
      percent: 100,
    });
    expect(getDefenseGrade(4, 6)).toMatchObject({
      title: "아슬 방어",
      label: "2번 막음",
    });
    expect(getDefenseGrade(0, 6)).toMatchObject({
      title: "내일 복수전",
      label: "0번 막음",
    });
  });

  it("adds visible urgency with a short countdown copy", () => {
    expect(getCountdownCopy(5)).toBe("5초 안에 탭");
    expect(getCountdownCopy(0)).toBe("시간 끝");
  });

  it("uses a monthly comeback board, not a dead-end 7 day board", () => {
    expect(DAILY_BOARD_DAYS).toBe(30);
    expect(getMonthlyBoardSlots(["2026-05-01", "2026-05-02"])).toHaveLength(30);
    expect(getMonthlyBoardSlots(["2026-05-01"])[0]).toEqual({
      day: 1,
      filled: true,
    });
  });

  it("labels today as a daily mission with tomorrow teaser", () => {
    expect(getTodayMissionLabel("배달비 괴물")).toBe("오늘 미션 · 배달비 괴물");
  });
});

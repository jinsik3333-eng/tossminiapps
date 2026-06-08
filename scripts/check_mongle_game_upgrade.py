#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APPS = [
    "09-mongle-run",
    "10-mongle-detective",
    "11-mongle-jump",
    "12-mongle-maze",
]


def require(errors: list[str], condition: bool, label: str) -> None:
    if not condition:
        errors.append(label)


def main() -> int:
    errors: list[str] = []

    for app in APPS:
        app_dir = ROOT / "apps" / app
        app_tsx = (app_dir / "src" / "App.tsx").read_text()
        app_css = (app_dir / "src" / "App.css").read_text()

        require(errors, "TossBannerAd" in app_tsx, f"{app}: bottom banner ad component missing")
        require(errors, "useInAppAds" in app_tsx, f"{app}: rewarded next-round ad hook missing")
        require(errors, "VITE_TOSS_BANNER_AD_GROUP_ID" in app_tsx, f"{app}: banner ad env missing")
        require(errors, "VITE_TOSS_REWARDED_AD_GROUP_ID" in app_tsx, f"{app}: rewarded ad env missing")
        require(errors, "StageRail" in app_tsx, f"{app}: stage rail missing")
        require(errors, "nextStageCopy" in app_tsx, f"{app}: next stage copy missing")
        require(errors, "RUN_STAGE_EFFECTS" in app_tsx, f"{app}: run stage variation missing")
        require(errors, "JUMP_STAGE_EFFECTS" in app_tsx, f"{app}: jump stage variation missing")
        require(errors, "MAZE_LEVELS" in app_tsx, f"{app}: maze level variation missing")
        require(errors, "ad-banner-shell" in app_css, f"{app}: banner ad CSS missing")
        require(errors, "stage-rail" in app_css, f"{app}: stage rail CSS missing")
        require(errors, (app_dir / "public" / "game-assets" / "mongle-runner.png").exists(), f"{app}: runner character asset missing")
        require(errors, (app_dir / "public" / "game-assets" / "mongle-detective.png").exists(), f"{app}: detective character asset missing")
        require(errors, (app_dir / "public" / "game-assets" / "mongle-jump.png").exists(), f"{app}: jump character asset missing")
        require(errors, (app_dir / "public" / "game-assets" / "mongle-maze.png").exists(), f"{app}: maze character asset missing")

    run_tsx = (ROOT / "apps" / "09-mongle-run" / "src" / "App.tsx").read_text()
    run_css = (ROOT / "apps" / "09-mongle-run" / "src" / "App.css").read_text()
    require(errors, "moveRunLane(-1)" in run_tsx and "moveRunLane(1)" in run_tsx, "run: left/right movement controls missing")
    require(errors, "가운데" not in run_tsx, "run: center lane button copy must be removed")
    require(errors, "runImpact" in run_tsx, "run: impact state missing")
    require(errors, "impact-burst" in run_css, "run: visual impact burst CSS missing")

    detective_tsx = (ROOT / "apps" / "10-mongle-detective" / "src" / "App.tsx").read_text()
    require(errors, "도둑 몽글을 찾는 게임" in detective_tsx, "detective: game rule copy missing")
    require(errors, "case-brief" in detective_tsx, "detective: case brief panel missing")
    require(errors, "DETECTIVE_RULES" in detective_tsx, "detective: multi-rule cases missing")
    require(errors, "targetRule" in detective_tsx and "isTarget" in detective_tsx, "detective: target-rule card logic missing")
    require(errors, "표식 하나만 보는 게임이 아니에요" in detective_tsx, "detective: complexity explanation missing")
    require(errors, "card.role === \"thief\"" not in detective_tsx, "detective: still solved by fixed thief mark")
    require(errors, "Object.keys(rule.target)" in detective_tsx and "missKeys" in detective_tsx, "detective: distractors must miss a required clue")

    jump_tsx = (ROOT / "apps" / "11-mongle-jump" / "src" / "App.tsx").read_text()
    require(errors, "다음 구름" in jump_tsx, "jump: next cloud/stage copy missing")

    maze_tsx = (ROOT / "apps" / "12-mongle-maze" / "src" / "App.tsx").read_text()
    require(errors, "열쇠 → 조각 → 출구" in maze_tsx, "maze: route rule copy missing")
    require(errors, "maze-legend" in maze_tsx, "maze: map legend missing")

    if errors:
        print("Mongle game upgrade checks failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Mongle game upgrade checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

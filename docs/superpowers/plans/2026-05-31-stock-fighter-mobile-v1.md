# Stock Fighter Mobile V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved mobile-first `주식 파이터` flow with intro, 10-charge quiz gauge, in-game mini-game guide/countdown, playable chart chase, and success/failure result art.

**Architecture:** Keep the existing React/Vite app and pure logic module. Lock progression behavior in `stockFighterLogic.test.mjs`, then update `stockFighterLogic.mjs`, `App.tsx`, and `App.css`. Generated PNG concepts become app assets under `public/assets/stock-fighter`.

**Tech Stack:** React 18, Vite, Apps in Toss WebView framework, CSS animations, Node test runner.

---

### Task 1: Lock 10-Charge Quiz Trigger

**Files:**
- Modify: `apps/18-stock-fighter/tests/stockFighterLogic.test.mjs`
- Modify: `apps/18-stock-fighter/src/lib/stockFighterLogic.mjs`

- [ ] **Step 1: Write the failing test**

Replace the old five-streak progression test with assertions that correct answers fill a 10-point `quizCharge`, wrong answers reduce it by 2, and the mini-game launches only when charge reaches 10.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:logic` in `apps/18-stock-fighter`.
Expected: FAIL because current logic still launches at five consecutive correct answers and has no `quizCharge`.

- [ ] **Step 3: Implement minimal logic**

Add `MINI_GAME_TRIGGER_CHARGE = 10`, `QUIZ_CHARGE_MISS_PENALTY = 2`, initialize `quizCharge: 0`, and update `applyQuizAnswer`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:logic`.
Expected: PASS.

### Task 2: Move Approved Art Into App Assets

**Files:**
- Create: `apps/18-stock-fighter/public/assets/stock-fighter/*.png`

- [ ] **Step 1: Copy approved visual assets**

Copy intro five-panel PNGs and mini-game popup/success/failure PNGs from `.superpowers/brainstorm/64521-1780206239/content`.

- [ ] **Step 2: Verify asset paths**

Run `ls apps/18-stock-fighter/public/assets/stock-fighter`.
Expected: intro, popup, failure, and success assets are present.

### Task 3: Add Mobile Flow Screens

**Files:**
- Modify: `apps/18-stock-fighter/src/App.tsx`
- Modify: `apps/18-stock-fighter/src/App.css`

- [ ] **Step 1: Add intro screen**

Add `intro` screen, skip/next behavior, fade panel layout, and `hasSeenIntro`.

- [ ] **Step 2: Add quiz charge gauge**

Replace quiz combo display with `투지 게이지 0/10`, remove quiz rival framing, and trigger mini-game from charge.

- [ ] **Step 3: Add in-game guide/countdown**

When mini-game starts, pause play and show central popup: first `"장 끝나기 전 20초를 불태워야 한다!"`, then control explanation, then `3,2,1,GO!`.

- [ ] **Step 4: Upgrade chart chase**

Render 20+ flowing code-native candles on a white chart, add runner/chaser jump animation, combo pop, invincible flash, and mobile thumb buttons.

- [ ] **Step 5: Add success/failure result art**

Use approved success/failure PNGs with code-native result text and buttons. Failure offers revive ticket or rewarded-ad revival when available.

### Task 4: Verify

**Files:**
- Test: `apps/18-stock-fighter/tests/stockFighterLogic.test.mjs`

- [ ] **Step 1: Run logic tests**

Run: `npm run test:logic`.
Expected: PASS.

- [ ] **Step 2: Run lint**

Run: `npm run lint`.
Expected: PASS.

- [ ] **Step 3: Run build**

Run: `npm run build`.
Expected: PASS.

- [ ] **Step 4: Run mobile smoke**

Start dev server on port 5191, open mobile viewport, and verify home, intro, quiz, charge trigger, mini-game popup, countdown, chase, success/failure result are visible without overlap.

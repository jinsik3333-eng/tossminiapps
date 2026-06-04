import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const appSource = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const cssSource = readFileSync(new URL("../src/App.css", import.meta.url), "utf8");

describe("quiz layout contract", () => {
  it("binds answer layout to the actual number of choices", () => {
    assert.match(appSource, /data-option-count=\{currentQuestionChoices\.length\}/);
  });

  it("does not append answer keywords to quiz hints", () => {
    assert.doesNotMatch(appSource, /정답 쪽 키워드/);
    assert.doesNotMatch(appSource, /question\.options\[question\.answerIndex\]/);
    assert.match(
      appSource,
      /function formatQuestionHint\(question: Question\)\s*{\s*return `힌트: \$\{question\.hint\}`;\s*}/,
    );
  });

  it("renders the selected fighter over the quiz scene instead of hardcoding only the ant", () => {
    assert.match(appSource, /className="quiz-fighter-stand"/);
    assert.match(appSource, /data-fighter-id=\{selectedFighter\.id\}/);
    assert.match(
      cssSource,
      /\.quiz-fighter-stand:not\(\[data-fighter-id="ant-fighter"\]\)\s*{[\s\S]*?background-image:\s*var\(--fighter-quiz-image\)/,
    );
    assert.match(appSource, /--fighter-quiz-image/);
    assert.match(appSource, /--fighter-runner-image/);
  });

  it("makes two-choice beginner answers fill the upper and lower background slots", () => {
    assert.match(
      cssSource,
      /\.quiz-screen \.option-grid\[data-option-count="2"\]\s*{[\s\S]*?grid-template-rows:\s*repeat\(2,\s*minmax\(72px,\s*1fr\)\);/,
    );
    assert.match(
      cssSource,
      /\.quiz-screen \.option-grid\[data-option-count="2"\] \.option-button\s*{[\s\S]*?min-height:\s*72px;/,
    );
  });
});

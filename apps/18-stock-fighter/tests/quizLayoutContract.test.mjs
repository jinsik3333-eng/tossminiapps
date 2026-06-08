import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { getQuizQuestionsForSet } from "../src/lib/stockFighterLogic.mjs";

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
      /function formatQuestionHint\(question: Question\)\s*{\s*return `퀴즈힌트: \$\{question\.hint\}`;\s*}/,
    );
    assert.match(appSource, /퀴즈힌트 \{appState\.hints\}/);
  });

  it("keeps repeated quiz set hints free of extra set-point copy", () => {
    for (const setIndex of [1, 2]) {
      const hints = getQuizQuestionsForSet(setIndex).map((question) => question.hint);

      assert.ok(hints.every((hint) => !hint.includes("세트 포인트")));
      assert.ok(hints.every((hint) => !hint.includes("끝 단어를 비교")));
      assert.ok(hints.every((hint) => !hint.includes("단정적인 보기")));
    }
  });

  it("types only the question prompt without set-prefix copy", () => {
    assert.match(appSource, /const quizPromptText = stripQuizSetPrefix\(currentQuestion\.prompt\);/);
    assert.match(appSource, /const text = quizPromptText;/);
    assert.match(
      appSource,
      /function stripQuizSetPrefix\(prompt: string\)\s*{[\s\S]*?return prompt\.replace\(\s*\/\^\(실전 복습\\s\*2세트\|고수 점검\\s\*3세트\)\\\.\\s\*\/,\s*""\s*\);[\s\S]*?}/,
    );
    assert.doesNotMatch(appSource, /typedPrompt \|\| currentQuestion\.prompt\.slice\(0,\s*1\)/);
  });

  it("layers hidden fighter quiz characters over the clean base frame", () => {
    assert.match(appSource, /className="quiz-fighter-stand"/);
    assert.match(appSource, /data-fighter-id=\{selectedFighter\.id\}/);
    assert.match(appSource, /data-fighter-id=\{selectedFighter\.id\}\s*style=\{selectedFighterSceneStyle\}/);
    assert.match(appSource, /--fighter-quiz-character-image/);
    assert.match(appSource, /\/quiz-character\/\$\{fighter\.id\}\.png/);
    assert.doesNotMatch(appSource, /--fighter-quiz-bg-image/);
    assert.doesNotMatch(appSource, /\/quiz-bg\/\$\{fighter\.id\}\.png/);
    assert.doesNotMatch(appSource, /\/quiz-full\/\$\{fighter\.id\}\.png/);
    assert.match(
      cssSource,
      /\.quiz-screen:not\(\[data-fighter-id="ant-fighter"\]\)\s*{[\s\S]*?url\("\/assets\/stock-fighter\/fighters\/quiz-bg-base\/quiz-frame-hidden-base-v1\.png"\)/,
    );
    assert.match(
      cssSource,
      /\.quiz-fighter-stand:not\(\[data-fighter-id="ant-fighter"\]\)\s*{[\s\S]*?display:\s*block;[\s\S]*?left:\s*-26\.6%;[\s\S]*?top:\s*12\.1%;[\s\S]*?width:\s*108\.8%;/,
    );
    assert.match(
      cssSource,
      /\.quiz-fighter-stand:not\(\[data-fighter-id="ant-fighter"\]\):not\(\[data-fighter-id="gold-tariff-king"\]\):not\(\[data-fighter-id="loss-cut-swordsman"\]\):not\(\[data-fighter-id="upper-limit-fairy"\]\):not\(\[data-fighter-id="lower-limit-ghost"\]\):not\(\[data-fighter-id="diversified-shield"\]\):not\(\[data-fighter-id="meme-coin-dog"\]\)\s*{[\s\S]*?left:\s*calc\(-26\.6% - 15px\);/,
    );
    assert.match(
      cssSource,
      /\.quiz-screen:not\(\[data-fighter-id="ant-fighter"\]\) \.ant-cry-panel\s*{[\s\S]*?padding-left:\s*33px;/,
    );
    assert.match(
      cssSource,
      /\.quiz-fighter-stand:not\(\[data-fighter-id="ant-fighter"\]\)\s*{[\s\S]*?background:\s*var\(--fighter-quiz-character-image\) center \/ contain no-repeat;[\s\S]*?z-index:\s*0;/,
    );
    assert.match(appSource, /--fighter-runner-image/);
    assert.doesNotMatch(cssSource, /--fighter-quiz-bg-image/);
  });

  it("nudges only the ant fighter quiz cry text to the right", () => {
    assert.match(
      cssSource,
      /\.quiz-screen\[data-fighter-id="ant-fighter"\] \.ant-cry-panel :is\(span,\s*strong\)\s*{[\s\S]*?transform:\s*translateX\(15px\);/,
    );
    assert.match(
      cssSource,
      /\.quiz-screen:not\(\[data-fighter-id="ant-fighter"\]\) \.ant-cry-panel\s*{[\s\S]*?padding-left:\s*33px;/,
    );
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

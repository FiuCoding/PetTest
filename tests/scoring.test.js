"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const oracle = require("../data.js");

const { QUESTIONS, DESTINIES, TIE_ORDER, calculateResult } = oracle;

function allAnswerCombinations() {
  const combinations = [];
  const walk = (index, answers) => {
    if (index === QUESTIONS.length) {
      combinations.push([...answers]);
      return;
    }
    QUESTIONS[index].options.forEach((option) => {
      answers.push(option.id);
      walk(index + 1, answers);
      answers.pop();
    });
  };
  walk(0, []);
  return combinations;
}

test("题目与命格配置完整且 ID 唯一", () => {
  assert.equal(QUESTIONS.length, 7);
  assert.equal(DESTINIES.length, 8);
  QUESTIONS.forEach((question) => {
    assert.ok(question.options.length >= 3 && question.options.length <= 4);
    assert.equal(new Set(question.options.map((option) => option.id)).size, question.options.length);
  });
  assert.equal(new Set(DESTINIES.map((destiny) => destiny.id)).size, 8);
  DESTINIES.forEach((destiny) => {
    ["name", "title", "quote", "goodLuck", "reminder", "closing", "shareTitle", "shareText"].forEach(
      (key) => assert.ok(destiny[key] && String(destiny[key]).length > 0, `${destiny.id}.${key}`)
    );
    assert.equal(destiny.keywords.length, 3);
    assert.ok(destiny.theme.bg && destiny.theme.accent && destiny.theme.motif);
  });
});

test("8 种命格都可以由答题组合得到", () => {
  const counts = Object.fromEntries(DESTINIES.map((destiny) => [destiny.id, 0]));
  allAnswerCombinations().forEach((answers) => {
    counts[calculateResult(answers).destiny.id] += 1;
  });
  Object.entries(counts).forEach(([id, count]) => {
    assert.ok(count > 0, `${id} 无法达成`);
  });
});

test("同一组答案始终得到完全相同的结果", () => {
  const answers = ["q1d", "q2d", "q3b", "q4c", "q5a", "q6b", "q7b"];
  const first = calculateResult(answers);
  const second = calculateResult(answers);
  assert.deepEqual(first, second);
  assert.equal(first.destiny.name, "治愈系天使");
  assert.equal(first.signature, second.signature);
});

test("平分时使用固定命格优先级，而非随机数", () => {
  const answers = ["q1a", "q2a", "q3a", "q4a", "q5a", "q6a", "q7d"];
  const result = calculateResult(answers);
  assert.equal(result.isTie, true);
  assert.equal(result.ranking[0].score, result.ranking[1].score);
  assert.equal(result.destiny.id, TIE_ORDER[0]);
  assert.equal(result.destiny.name, "招财小福星");
});

test("三项指数在 0-100 内，且随答案确定变化", () => {
  const answers = ["q1c", "q2c", "q3d", "q4d", "q5d", "q6c", "q7a"];
  const result = calculateResult(answers);
  ["bond", "heal", "luck"].forEach((key) => {
    assert.ok(Number.isInteger(result.indices[key]));
    assert.ok(result.indices[key] >= 0 && result.indices[key] <= 100);
  });
  assert.notDeepEqual(result.indices, calculateResult(["q1d", "q2a", "q3a", "q4c", "q5a", "q6d", "q7b"]).indices);
});

test("报告叙事会融入玩家实际选项", () => {
  const answers = ["q1b", "q2b", "q3c", "q4a", "q5b", "q6a", "q7a"];
  const result = calculateResult(answers);
  const narrative = oracle.buildNarrative(result);
  assert.match(narrative.relation, /高冷/);
  assert.match(narrative.relation, /小福星/);
  assert.match(narrative.wish, /财运加持/);
  assert.ok(narrative.summary.length > 20);
  const notes = oracle.getMetricNotes(result.indices);
  assert.equal(Object.keys(notes).length, 3);
});

test("缺题、重复题型或非法答案会被拒绝", () => {
  assert.throws(() => calculateResult(["q1a"]));
  assert.throws(() => calculateResult(["q1a", "q1a", "q3a", "q4a", "q5a", "q6a", "q7a"]));
  assert.throws(() => calculateResult(["q1a", "q2a", "q3a", "q4a", "q5a", "q6a", "invalid"]));
});

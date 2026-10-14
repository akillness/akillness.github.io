import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';

// Synthetic adapter test, not the newsletter app or a call to TypeSafe.
const criteria = Object.freeze(['page_team', 'inspect_read_only', 'stop']);
const allowed = new Set(criteria);

function ownProbability(answer) {
  if (!answer || answer.type !== 'choice' || !allowed.has(answer.choice)) {
    throw new Error('Unknown answer or action');
  }
  const probabilities = answer.probabilities;
  if (!probabilities || typeof probabilities !== 'object' || Array.isArray(probabilities)) {
    throw new Error('Missing probability map');
  }
  const keys = Object.keys(probabilities);
  if (keys.length !== criteria.length || keys.some(key => !allowed.has(key))) {
    throw new Error('Probability keys do not match requested criteria');
  }
  if (!Object.hasOwn(probabilities, answer.choice)) {
    throw new Error('Selected action has no own probability');
  }
  const values = criteria.map(key => probabilities[key]);
  if (values.some(value => typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1)) {
    throw new Error('Invalid probability');
  }
  if (Math.abs(values.reduce((sum, value) => sum + value, 0) - 1) > 1e-6) {
    throw new Error('Distribution does not sum to one');
  }
  const selected = probabilities[answer.choice];
  if (selected + 1e-6 < Math.max(...values)) {
    throw new Error('Selected action is not a maximum-probability option');
  }
  return selected;
}

function gate(answer, policy) {
  let p;
  try { p = ownProbability(answer); }
  catch (error) { return { action: 'handoff', reason: 'invalid_response', detail: error.message }; }
  const signal = { selectedChoice: answer.choice, selectedChoiceProbability: p };
  if (p < 0.55) return { action: 'handoff', reason: 'low_probability', ...signal };
  // This is a policy fallback, not the model's probability for inspect_read_only.
  // A read-only next step is separately authorized. Thresholds are illustrative.
  const candidate = p < 0.80 ? 'inspect_read_only' : answer.choice;
  if (!policy.freshEvidence || !policy.allowedActions.includes(candidate)) {
    return { action: 'hold', reason: 'policy_or_evidence_denied', ...signal };
  }
  return { action: candidate, actionSource: candidate === answer.choice ? 'selected-choice' : 'policy-read-only-fallback', ...signal };
}

function brokenGate(answer) {
  const p = answer.probabilities[answer.choice] ?? Math.max(...Object.values(answer.probabilities));
  return p >= 0.80 ? answer.choice : 'inspect_read_only';
}

const policy = { freshEvidence: true, allowedActions: criteria };
const answer = (choice, probabilities) => ({ type: 'choice', choice, probabilities });
const malformed = answer('page_team', { inspect_read_only: 0.90, stop: 0.10 });
assert.equal(brokenGate(malformed), 'page_team');
assert.equal(gate(malformed, policy).action, 'handoff');

const cases = [
  ['high probability, authorized', answer('page_team', { page_team: 0.85, inspect_read_only: 0.10, stop: 0.05 }), policy, 'page_team'],
  ['medium probability uses authorized read-only step', answer('page_team', { page_team: 0.60, inspect_read_only: 0.30, stop: 0.10 }), policy, 'inspect_read_only'],
  ['low probability abstains', answer('page_team', { page_team: 0.40, inspect_read_only: 0.35, stop: 0.25 }), policy, 'handoff'],
  ['exact high boundary', answer('page_team', { page_team: 0.80, inspect_read_only: 0.15, stop: 0.05 }), policy, 'page_team'],
  ['missing selected probability', malformed, policy, 'handoff'],
  ['unknown action', answer('delete_all', { page_team: 0.90, inspect_read_only: 0.05, stop: 0.05 }), policy, 'handoff'],
  ['unknown probability key', answer('page_team', { page_team: 0.90, inspect_read_only: 0.05, delete_all: 0.05 }), policy, 'handoff'],
  ['NaN probability', answer('page_team', { page_team: NaN, inspect_read_only: 0.05, stop: 0.05 }), policy, 'handoff'],
  ['infinite probability', answer('page_team', { page_team: Infinity, inspect_read_only: 0.05, stop: 0.05 }), policy, 'handoff'],
  ['negative probability', answer('page_team', { page_team: 0.95, inspect_read_only: 0.10, stop: -0.05 }), policy, 'handoff'],
  ['numeric string rejected', answer('page_team', { page_team: '0.90', inspect_read_only: 0.05, stop: 0.05 }), policy, 'handoff'],
  ['wrong normalization', answer('page_team', { page_team: 0.90, inspect_read_only: 0.10, stop: 0.10 }), policy, 'handoff'],
  ['choice is not distribution maximum', answer('page_team', { page_team: 0.10, inspect_read_only: 0.85, stop: 0.05 }), policy, 'handoff'],
  ['null answer', null, policy, 'handoff'],
  ['high probability does not grant permission', answer('page_team', { page_team: 0.90, inspect_read_only: 0.05, stop: 0.05 }), { freshEvidence: true, allowedActions: ['inspect_read_only'] }, 'hold'],
  ['high probability does not refresh evidence', answer('page_team', { page_team: 0.90, inspect_read_only: 0.05, stop: 0.05 }), { freshEvidence: false, allowedActions: criteria }, 'hold'],
  ['medium probability cannot grant a read-only capability', answer('page_team', { page_team: 0.60, inspect_read_only: 0.30, stop: 0.10 }), { freshEvidence: true, allowedActions: ['stop'] }, 'hold']
];
const results = cases.map(([name, input, authorization, expected]) => {
  const actual = gate(input, authorization);
  assert.equal(actual.action, expected, name);
  return { name, expected, actual, passed: true };
});
assert.equal(results[1].actual.selectedChoice, 'page_team');
assert.equal(results[1].actual.selectedChoiceProbability, 0.60);
assert.equal(results[1].actual.actionSource, 'policy-read-only-fallback');
const report = {
  observed_at: new Date().toISOString(),
  runtime: process.version,
  command: 'node decision-gate.mjs',
  scope: 'Hand-constructed inputs and local JavaScript adapter only. No TypeSafe call, deployed app, production incident, or CodeRabbit test.',
  thresholds: { low: 0.55, high: 0.80, status: 'illustrative, not calibrated' },
  statistic: 'probabilities[originalAnswer.choice], never reassigned to the fallback action',
  wire_scope: 'Projection containing type/choice/probabilities only; confidence and the full HTTP response envelope are not validated or consumed.',
  authorization_scope: 'freshEvidence boolean and allowedActions only; no authenticated principal, ownership, expiry or real executor implemented.',
  numeric_tolerance: 1e-6,
  counterexample: { input: malformed, brokenGateAction: brokenGate(malformed), strictGateAction: gate(malformed, policy).action },
  assertions_passed: results.length + 5,
  cases_passed: results.length,
  results
};
writeFileSync(new URL('./decision-gate-results.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ runtime: report.runtime, cases_passed: results.length, assertions_passed: report.assertions_passed, counterexample: report.counterexample }));

/* Dry Run scoring. Pure functions only: no DOM, no storage. */
var DryRun = (function () {
  'use strict';

  function norm(text) {
    return String(text == null ? '' : text).trim().toLowerCase();
  }

  /* One answer = { primary, backup }. Returns { result, reason }. */
  function scoreAnswer(answer) {
    var primary = norm(answer && answer.primary);
    var backup = norm(answer && answer.backup);
    if (!backup) return { result: 'BREAKS', reason: 'no-backup' };
    if (backup === primary) return { result: 'BREAKS', reason: 'same-as-primary' };
    return { result: 'HOLDS', reason: 'distinct-backup' };
  }

  function scorePlan(plan) {
    return plan.map(scoreAnswer);
  }

  function countBreaks(plan) {
    return scorePlan(plan).filter(function (s) { return s.result === 'BREAKS'; }).length;
  }

  /* Same PRIMARY on 3 or more questions. Warning only; never changes scoring. */
  function concentration(plan) {
    var groups = {};
    var order = [];
    plan.forEach(function (answer) {
      var key = norm(answer && answer.primary);
      if (!key) return;
      if (!groups[key]) {
        groups[key] = { answer: String(answer.primary).trim(), n: 0 };
        order.push(key);
      }
      groups[key].n += 1;
    });
    return order
      .map(function (key) { return groups[key]; })
      .filter(function (group) { return group.n >= 3; });
  }

  /* Game feedback, not a risk rating. */
  function meterLabel(breaks) {
    if (breaks <= 0) return { level: 'green', text: 'Holding strong' };
    if (breaks <= 2) return { level: 'yellow', text: 'Vulnerabilities found' };
    return { level: 'red', text: 'Critical weaknesses' };
  }

  return {
    norm: norm,
    scoreAnswer: scoreAnswer,
    scorePlan: scorePlan,
    countBreaks: countBreaks,
    concentration: concentration,
    meterLabel: meterLabel
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = DryRun;

/* Records gaps and user reflections. Never predicts safety or validates a backup. */
var DryRun = (function () {
  'use strict';
  function norm(value) { return String(value == null ? '' : value).trim().toLowerCase(); }
  function scoreAnswer(answer) {
    answer = answer || {};
    if (!norm(answer.primary)) return { result: 'GAP', reason: 'no-primary' };
    if (!norm(answer.backup)) return { result: 'GAP', reason: 'no-backup' };
    if (norm(answer.primary) === norm(answer.backup)) return { result: 'GAP', reason: 'same-as-primary' };
    if (answer.assessment === 'no') return { result: 'GAP', reason: 'self-reported-gap' };
    if (answer.assessment !== 'yes' || !norm(answer.reason)) return { result: 'CHECK', reason: 'unconfirmed' };
    return { result: 'BACKUP', reason: 'self-reported-backup' };
  }
  function scorePlan(plan) { return plan.map(scoreAnswer); }
  function summary(plan) {
    return scorePlan(plan).reduce(function (counts, score) { counts[score.result] += 1; return counts; }, { GAP: 0, CHECK: 0, BACKUP: 0 });
  }
  function cleanPlan(saved, questions) {
    // Match stable flood-topic IDs only. Never reinterpret the old business answers.
    return questions.map(function (q) {
      var a = saved && saved[q.id] || {};
      function text(v) { return typeof v === 'string' ? v.slice(0, 600) : ''; }
      return { primary: text(a.primary), backup: text(a.backup), assessment: ['yes','no','unsure'].indexOf(a.assessment) >= 0 ? a.assessment : '', reason: text(a.reason) };
    });
  }
  function revise(answer, primary, backup) {
    var changed = primary.trim() !== answer.primary || backup.trim() !== answer.backup;
    return { primary: primary.trim(), backup: backup.trim(), assessment: changed ? '' : answer.assessment, reason: changed ? '' : answer.reason };
  }
  return { norm: norm, scoreAnswer: scoreAnswer, scorePlan: scorePlan, summary: summary, cleanPlan: cleanPlan, revise: revise };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = DryRun;

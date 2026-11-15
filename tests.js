/* Plain assertions for scoring.js. Open tests.html to see PASS or FAIL. */
var DryRunTests = (function () {
  'use strict';
  var results = [];

  function check(name, actual, expected) {
    var a = JSON.stringify(actual);
    var e = JSON.stringify(expected);
    results.push({ name: name, pass: a === e, actual: a, expected: e });
  }

  function plan(rows) {
    return rows.map(function (r) { return { primary: r[0], backup: r[1] }; });
  }

  // Scoring rule
  check('no backup breaks', DryRun.scoreAnswer({ primary: 'Ali', backup: '' }).result, 'BREAKS');
  check('no backup reason', DryRun.scoreAnswer({ primary: 'Ali', backup: '' }).reason, 'no-backup');
  check('missing backup field breaks', DryRun.scoreAnswer({ primary: 'Ali' }).result, 'BREAKS');
  check('whitespace-only backup breaks', DryRun.scoreAnswer({ primary: 'Ali', backup: '   ' }).result, 'BREAKS');
  check('distinct backup holds', DryRun.scoreAnswer({ primary: 'Ali', backup: 'Mei' }).result, 'HOLDS');

  // Same-as-primary case
  check('backup same as primary breaks', DryRun.scoreAnswer({ primary: 'Ali', backup: 'Ali' }).result, 'BREAKS');
  check('same-as-primary reason', DryRun.scoreAnswer({ primary: 'Ali', backup: 'Ali' }).reason, 'same-as-primary');
  check('same ignoring case and spaces breaks', DryRun.scoreAnswer({ primary: ' Ali ', backup: 'aLI' }).result, 'BREAKS');
  check('different name that contains primary holds', DryRun.scoreAnswer({ primary: 'Ali', backup: "Ali's phone" }).result, 'HOLDS');

  // Counting
  var example = plan([['Ali', ''], ['Drawer', 'Drawer'], ['Ali', 'Notebook'], ['Ali', ''], ['WhatsApp', 'Surau']]);
  check('counts breaks across a plan', DryRun.countBreaks(example), 3);
  check('all distinct backups gives zero breaks',
    DryRun.countBreaks(plan([['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H'], ['I', 'J']])), 0);
  check('empty plan answers all break',
    DryRun.countBreaks(plan([['A', ''], ['B', ''], ['C', ''], ['D', ''], ['E', '']])), 5);

  // Concentration warning
  check('same primary 3 times triggers warning', DryRun.concentration(example), [{ answer: 'Ali', n: 3 }]);
  check('same primary 2 times does not trigger',
    DryRun.concentration(plan([['Ali', ''], ['Ali', ''], ['C', ''], ['D', ''], ['E', '']])), []);
  check('concentration ignores case and spaces',
    DryRun.concentration(plan([['Ali', ''], [' ali', ''], ['ALI ', ''], ['D', ''], ['E', '']])), [{ answer: 'Ali', n: 3 }]);
  check('concentration ignores empty primaries',
    DryRun.concentration(plan([['', ''], ['', ''], ['', ''], ['D', ''], ['E', '']])), []);
  check('warning does not change scoring: concentrated plan with distinct backups has zero breaks',
    DryRun.countBreaks(plan([['Ali', 'Mei'], ['Ali', 'Raj'], ['Ali', 'Siti'], ['Ali', 'Tan'], ['X', 'Y']])), 0);
  check('warning still fires on that plan',
    DryRun.concentration(plan([['Ali', 'Mei'], ['Ali', 'Raj'], ['Ali', 'Siti'], ['Ali', 'Tan'], ['X', 'Y']])), [{ answer: 'Ali', n: 4 }]);

  // Meter labels
  check('0 breaks is green', DryRun.meterLabel(0), { level: 'green', text: 'Holding strong' });
  check('1 break is yellow', DryRun.meterLabel(1).level, 'yellow');
  check('2 breaks is yellow', DryRun.meterLabel(2).level, 'yellow');
  check('3 breaks is red', DryRun.meterLabel(3), { level: 'red', text: 'Critical weaknesses' });
  check('5 breaks is red', DryRun.meterLabel(5).level, 'red');

  return results;
})();

if (typeof document !== 'undefined') {
  (function () {
    var list = document.getElementById('results');
    var failed = 0;
    DryRunTests.forEach(function (t) {
      var li = document.createElement('li');
      li.className = t.pass ? 'pass' : 'fail';
      li.textContent = (t.pass ? 'PASS  ' : 'FAIL  ') + t.name +
        (t.pass ? '' : '  (expected ' + t.expected + ', got ' + t.actual + ')');
      list.appendChild(li);
      if (!t.pass) failed += 1;
    });
    document.getElementById('summary').textContent =
      (DryRunTests.length - failed) + ' of ' + DryRunTests.length + ' passed';
  })();
}
if (typeof module !== 'undefined' && module.exports) module.exports = DryRunTests;

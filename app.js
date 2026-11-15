/* Dry Run app: screens, state, and storage. Scoring lives in scoring.js. */
(function () {
  'use strict';

  var QUESTIONS = DRY_RUN_QUESTIONS;
  var STORE_KEY = 'dryrun.v1';
  var app = document.getElementById('app');
  var water = document.getElementById('water');

  /* state.plan: 5 answers. state.lastBreaks: breaks in the last finished run (or null).
     state.lastBroken: ids of questions that broke in the last finished run. */
  var state = load() || { plan: emptyPlan(), lastBreaks: null, lastBroken: [] };
  var run = null; // the drill in progress

  function emptyPlan() {
    return QUESTIONS.map(function () { return { primary: '', backup: '' }; });
  }

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORE_KEY));
      if (saved && Array.isArray(saved.plan) && saved.plan.length === QUESTIONS.length) return saved;
    } catch (e) { /* storage unavailable or corrupt: start fresh */ }
    return null;
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* keep going in memory */ }
  }

  /* Small DOM helper. Text always goes in as text, never as HTML. */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === 'class') node.className = attrs[key];
      else if (key === 'text') node.textContent = attrs[key];
      else if (key.indexOf('on') === 0) node.addEventListener(key.slice(2), attrs[key]);
      else node.setAttribute(key, attrs[key]);
    });
    (children || []).forEach(function (child) { if (child) node.appendChild(child); });
    return node;
  }

  function show(nodes) {
    app.textContent = '';
    nodes.forEach(function (node) { if (node) app.appendChild(node); });
    window.scrollTo(0, 0);
  }

  function setWater(breaks) {
    water.style.height = (breaks / QUESTIONS.length * 100) + 'vh';
    water.classList.toggle('empty', breaks === 0);
  }

  function meterChip(breaks) {
    var label = DryRun.meterLabel(breaks);
    return el('div', { class: 'meter ' + label.level, role: 'status' }, [
      el('span', { class: 'dot' }),
      el('span', { text: label.text })
    ]);
  }

  /* Five cells, one lit per break. Same numbers as the water behind the page. */
  function meterBar(breaks) {
    var cells = QUESTIONS.map(function (q, i) {
      return el('span', { class: 'cell' + (i < breaks ? ' on' : '') });
    });
    return el('div', {
      class: 'cells', role: 'img',
      'aria-label': 'Water level: ' + breaks + ' of ' + QUESTIONS.length + ' steps'
    }, cells);
  }

  function statusBar(label, onHome) {
    var brand = onHome
      ? el('button', { class: 'brand', id: 'home', type: 'button', text: 'DRY RUN', 'aria-label': 'Dry Run home', onclick: onHome })
      : el('span', { class: 'brand', text: 'DRY RUN' });
    return el('div', { class: 'statusbar' }, [
      brand,
      el('span', { class: 'status-label' }, [el('span', { class: 'blink', 'aria-hidden': 'true' }), el('span', { text: label })])
    ]);
  }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }

  /* ---------- Screen 0: home ---------- */

  function homeScreen() {
    setWater(0);
    var total = QUESTIONS.length;
    var hasRun = state.lastBreaks !== null;
    var held = hasRun ? total - state.lastBreaks : 0;
    var level = hasRun ? DryRun.meterLabel(state.lastBreaks).level : 'idle';

    var ring = el('div', {
      class: 'ring ' + level, style: '--held:' + held, role: 'img',
      'aria-label': hasRun
        ? 'Last drill: ' + held + ' of ' + total + ' parts of the plan held.'
        : 'Resilience meter. No drill run yet.'
    }, [
      el('div', { class: 'ring-sweep' }),
      el('div', { class: 'ring-core' }, [
        el('div', { class: 'ring-num', text: hasRun ? held + '/' + total : '?' }),
        el('div', { class: 'ring-cap', text: hasRun ? 'held last drill' : 'not tested yet' })
      ])
    ]);

    var steps = [
      ['01', 'Write your plan', 'Five questions. A primary and a backup for each.'],
      ['02', 'Break it', 'Five failure events hit your own answers. Bet on each one.'],
      ['03', 'Patch and replay', 'Fix what broke, run it again, compare before and after.']
    ].map(function (s) {
      return el('li', {}, [
        el('span', { class: 'step-no', text: s[0] }),
        el('div', {}, [el('strong', { text: s[1] }), el('span', { class: 'muted', text: s[2] })])
      ]);
    });

    show([
      el('section', { class: 'hero' }, [
        el('p', { class: 'eyebrow', text: 'Disaster plan drill' }),
        el('h1', { class: 'hero-title', text: 'DRY RUN' }),
        el('p', { class: 'tagline', text: 'Find the failure before the disaster does.' }),
        ring,
        hasRun
          ? el('div', { class: 'hero-meter' }, [meterChip(state.lastBreaks)])
          : el('p', { class: 'hero-meter muted small', text: 'Resilience meter: waiting for your first drill.' }),
        el('button', {
          class: 'btn-primary btn-hero', id: 'begin',
          text: hasRun ? 'CONTINUE SIMULATION' : 'START SIMULATION', onclick: planScreen
        })
      ]),
      el('ol', { class: 'steps' }, steps),
      el('p', { class: 'small muted center', text: 'A drill for a kedai, a household, or a committee. ' +
        'The meter is game feedback, not a risk rating. Your plan stays on this device.' })
    ]);
  }

  /* ---------- Screen 1: the plan ---------- */

  function planScreen() {
    setWater(0);
    var isReplay = state.lastBreaks !== null;
    var error = el('p', { class: 'error', role: 'alert' });
    var inputs = [];
    var total = QUESTIONS.length;

    var pips = QUESTIONS.map(function () { return el('span', { class: 'pip' }); });
    var countText = el('span', { class: 'progress-count' });
    var progress = el('div', { class: 'progress', role: 'status' }, [
      el('div', { class: 'progress-pips', 'aria-hidden': 'true' }, pips),
      countText
    ]);

    var blocks = QUESTIONS.map(function (q, i) {
      var broke = isReplay && state.lastBroken.indexOf(q.id) !== -1;
      var primary = el('input', { type: 'text', id: q.id + '-primary', placeholder: q.primaryHint, maxlength: '60', autocomplete: 'off' });
      var backup = el('input', { type: 'text', id: q.id + '-backup', placeholder: q.backupHint, maxlength: '60', autocomplete: 'off' });
      primary.value = state.plan[i].primary;
      backup.value = state.plan[i].backup;
      var chip = el('span', { class: 'chip' });
      var block = el('section', { class: 'panel q-card' + (broke ? ' broke' : '') }, [
        el('div', { class: 'q-head' }, [
          el('span', { class: 'q-no', 'aria-hidden': 'true', text: '0' + (i + 1) }),
          el('span', { class: 'q-emoji', 'aria-hidden': 'true', text: q.emoji }),
          el('span', { class: 'q-text', text: q.question })
        ]),
        el('div', { class: 'q-status' }, [
          chip,
          broke ? el('span', { class: 'badge', text: 'BROKE' }) : null
        ]),
        el('div', { class: 'field primary' }, [
          el('label', { for: q.id + '-primary', text: 'Primary' }),
          primary
        ]),
        el('div', { class: 'field backup' }, [
          el('label', { for: q.id + '-backup', text: 'Backup (optional)' }),
          backup
        ])
      ]);
      inputs.push({ primary: primary, backup: backup, chip: chip, block: block });
      primary.addEventListener('input', refresh);
      backup.addEventListener('input', refresh);
      return block;
    });

    /* Shows what is filled in. It does not score: that is the drill's job. */
    function refresh() {
      var primaries = 0;
      var backups = 0;
      inputs.forEach(function (pair, i) {
        var hasPrimary = !!pair.primary.value.trim();
        var hasBackup = !!pair.backup.value.trim();
        if (hasPrimary) primaries += 1;
        if (hasBackup) backups += 1;
        pair.chip.textContent = !hasPrimary ? 'To do' : hasBackup ? 'Backup named' : 'Primary set';
        pair.chip.className = 'chip' + (!hasPrimary ? '' : hasBackup ? ' two' : ' one');
        pair.block.classList.toggle('has-primary', hasPrimary);
        pair.block.classList.toggle('has-backup', hasBackup);
        pips[i].className = 'pip' + (!hasPrimary ? '' : hasBackup ? ' two' : ' one');
      });
      countText.textContent = primaries + ' of ' + total + ' primaries set · ' +
        backups + ' of ' + total + ' backups named';
    }

    function readForm() {
      state.plan = inputs.map(function (pair) {
        return { primary: pair.primary.value.trim(), backup: pair.backup.value.trim() };
      });
      save();
    }

    function start() {
      readForm();
      var missing = state.plan.some(function (a) { return !a.primary; });
      if (missing) {
        error.textContent = 'Fill in the primary for all five before the drill.';
        return;
      }
      startDrill();
    }

    function fillExample() {
      DRY_RUN_EXAMPLE.forEach(function (answer, i) {
        inputs[i].primary.value = answer.primary;
        inputs[i].backup.value = answer.backup;
      });
      error.textContent = '';
      refresh();
    }

    function startOver() {
      state = { plan: emptyPlan(), lastBreaks: null, lastBroken: [] };
      save();
      planScreen();
    }

    refresh();
    show([
      statusBar(isReplay ? 'Patch your plan' : 'Preparedness checklist', function () { readForm(); homeScreen(); }),
      el('h1', { text: isReplay ? 'Patch your plan' : 'Your plan' }),
      isReplay
        ? el('p', { class: 'lead', text: 'Patch your plan. Add or change a backup where it broke, then run the drill again.' })
        : el('p', { class: 'lead', text: 'Write down your plan. Then we break things, one card at a time, and see what holds.' }),
      progress
    ].concat(blocks).concat([
      error,
      el('button', { class: 'btn-primary', id: 'start', text: isReplay ? 'Run the drill again' : 'Run the drill', onclick: start }),
      el('div', { class: 'row', style: 'margin-top:12px' }, [
        el('button', { class: 'btn-ghost', id: 'example', text: 'Fill example', onclick: fillExample }),
        isReplay ? el('button', { class: 'btn-ghost', id: 'reset', text: 'Start over', onclick: startOver }) : null
      ])
    ]));
  }

  /* ---------- Screen 2: the drill ---------- */

  function startDrill() {
    var scores = DryRun.scorePlan(state.plan);
    run = {
      order: shuffle(QUESTIONS.map(function (q, i) { return i; })),
      scores: scores,
      step: 0,
      breaks: 0,
      correctBets: 0,
      previousBreaks: state.lastBreaks
    };
    setWater(0);
    cardScreen();
  }

  function whyText(index) {
    var answer = state.plan[index];
    var reason = run.scores[index].reason;
    if (reason === 'no-backup') return 'No backup named. Nothing takes over.';
    if (reason === 'same-as-primary') return 'The backup is the same as the primary.';
    return answer.backup + ' takes over.';
  }

  /* Primary knocked out on the left; on the right, what takes over (or nothing). */
  function relay(index) {
    var answer = state.plan[index];
    var reason = run.scores[index].reason;
    var holds = reason === 'distinct-backup';
    var backupText = holds ? answer.backup : reason === 'no-backup' ? 'None named' : 'Same as primary';
    return el('div', { class: 'relay ' + (holds ? 'holds' : 'breaks') }, [
      el('div', { class: 'node down' }, [
        el('span', { class: 'node-cap', text: 'Primary' }),
        el('span', { class: 'node-name', text: answer.primary })
      ]),
      el('div', { class: 'link', 'aria-hidden': 'true' }),
      el('div', { class: 'node ' + (holds ? 'up' : 'none') }, [
        el('span', { class: 'node-cap', text: 'Backup' }),
        el('span', { class: 'node-name', text: backupText })
      ])
    ]);
  }

  function cardScreen() {
    var index = run.order[run.step];
    var q = QUESTIONS[index];
    var score = run.scores[index];
    var holds = score.result === 'HOLDS';
    var cardText = q.card.replace('{primary}', function () { return state.plan[index].primary; });

    var call = el('div', { class: 'call' });
    var front = el('div', { class: 'face front' }, [
      el('div', { class: 'alert-strip' }, [
        el('span', { class: 'blink', 'aria-hidden': 'true' }),
        el('span', { text: 'Incoming event' })
      ]),
      el('div', { class: 'card-emoji', 'aria-hidden': 'true', text: q.emoji }),
      el('div', { class: 'card-topic', text: q.topic }),
      el('p', { class: 'card-text', text: cardText })
    ]);
    var back = el('div', { class: 'face back ' + (holds ? 'holds' : 'breaks'), 'aria-hidden': 'true' }, [
      el('div', { class: 'alert-strip' }, [
        el('span', { text: holds ? 'Backup activated' : 'Plan failure' })
      ]),
      el('div', { class: 'card-emoji', 'aria-hidden': 'true', text: holds ? '🛟' : '💥' }),
      el('div', { class: 'verdict', text: score.result }),
      relay(index),
      el('div', { class: 'why', text: whyText(index) }),
      call
    ]);
    var card = el('div', { class: 'card', id: 'card' }, [el('div', { class: 'card-inner' }, [front, back])]);
    var meterSlot = el('div', {}, [meterChip(run.breaks)]);
    var barSlot = el('div', { class: 'bar-slot' }, [meterBar(run.breaks)]);
    var actions = el('div', { class: 'actions', 'aria-live': 'polite' });

    function bet(guess) {
      var right = guess === score.result;
      if (right) run.correctBets += 1;
      if (!holds) run.breaks += 1;
      call.textContent = right ? 'You called it.' : 'You did not see that coming.';
      card.classList.add('flipped');
      card.classList.add(holds ? 'is-holds' : 'is-breaks');
      front.setAttribute('aria-hidden', 'true');
      back.removeAttribute('aria-hidden');
      setWater(run.breaks);
      meterSlot.textContent = '';
      meterSlot.appendChild(meterChip(run.breaks));
      barSlot.textContent = '';
      barSlot.appendChild(meterBar(run.breaks));

      var last = run.step === run.order.length - 1;
      actions.textContent = '';
      var next = el('button', {
        class: 'btn-primary', id: 'next',
        text: last ? 'See results' : 'Next card',
        onclick: function () {
          run.step += 1;
          if (last) finishDrill(); else cardScreen();
        }
      });
      actions.appendChild(next);
      next.focus();
    }

    actions.appendChild(el('p', { class: 'muted center', text: 'Place your bet. Does your plan survive this?' }));
    actions.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'btn-holds', id: 'bet-holds', 'aria-label': 'My plan HOLDS', onclick: function () { bet('HOLDS'); } }, [
        el('span', { class: 'bet-main', text: 'HOLDS' }),
        el('span', { class: 'bet-sub', text: 'My plan survives' })
      ]),
      el('button', { class: 'btn-breaks', id: 'bet-breaks', 'aria-label': 'My plan BREAKS', onclick: function () { bet('BREAKS'); } }, [
        el('span', { class: 'bet-main', text: 'BREAKS' }),
        el('span', { class: 'bet-sub', text: 'My plan fails' })
      ])
    ]));

    var dots = run.order.map(function (o, i) {
      return el('span', { class: 'pip' + (i < run.step ? ' two' : i === run.step ? ' now' : '') });
    });

    show([
      statusBar('Simulation running'),
      el('div', { class: 'topbar' }, [
        el('div', { class: 'event-count' }, [
          el('strong', { text: 'Card ' + (run.step + 1) + ' of ' + run.order.length }),
          el('div', { class: 'progress-pips', 'aria-hidden': 'true' }, dots)
        ]),
        meterSlot
      ]),
      el('div', { class: 'meter-row' }, [
        el('span', { class: 'mono-cap', text: 'Water level' }),
        barSlot
      ]),
      card,
      actions
    ]);
  }


  /* ---------- Paper copy ---------- */

  function today() {
    var d = new Date();
    function two(n) { return (n < 10 ? '0' : '') + n; }
    return two(d.getDate()) + '/' + two(d.getMonth() + 1) + '/' + d.getFullYear();
  }

  /* One page for the fridge or the shop wall. Only visible when printing. */
  function printSheet() {
    var rows = QUESTIONS.map(function (q, i) {
      var answer = state.plan[i];
      var holds = DryRun.scoreAnswer(answer).result === 'HOLDS';
      return el('tr', {}, [
        el('th', { scope: 'row', text: q.question }),
        el('td', { text: answer.primary }),
        el('td', { class: holds ? '' : 'gap', text: holds ? answer.backup : 'No backup yet: ____________________' })
      ]);
    });
    return el('section', { id: 'sheet', 'aria-hidden': 'true' }, [
      el('h1', { text: 'Our plan if disaster strikes' }),
      el('p', { text: 'Tested with Dry Run on ' + today() + '. Keep this on paper, where everyone can find it.' }),
      el('table', {}, [
        el('thead', {}, [el('tr', {}, [
          el('th', { scope: 'col', text: 'Question' }),
          el('th', { scope: 'col', text: 'First choice' }),
          el('th', { scope: 'col', text: 'If that fails' })
        ])]),
        el('tbody', {}, rows)
      ]),
      el('p', { class: 'sheet-note', text: 'Fill any blank line by hand, then run the drill again.' }),
      el('h2', { text: 'Official information (needs internet)' }),
      el('ul', {}, DRY_RUN_SOURCES.map(function (src) {
        return el('li', { text: src.name + ' (' + src.by + '): ' + src.url.replace('https://', '') });
      })),
      el('p', { text: 'In an emergency, call 999.' })
    ]);
  }

  /* Where to look for real warnings. Links only; nothing is fetched. */
  function sourcesPanel() {
    return el('section', { class: 'panel sources', id: 'sources' }, [
      el('h2', { text: 'When it is real: official sources' }),
      el('p', { text: 'Dry Run tests your plan. It does not show warnings, flood levels or which shelters are open. ' +
        'For those, use the official sources below and follow instructions from local authorities.' }),
      el('ul', { class: 'list' }, DRY_RUN_SOURCES.map(function (src) {
        return el('li', {}, [
          el('a', { href: src.url, target: '_blank', rel: 'noopener noreferrer', text: src.name }),
          el('span', { class: 'src-by', text: src.by }),
          el('span', { text: src.what })
        ]);
      })),
      el('p', { class: 'small muted', text: 'These links open other websites and need an internet connection. ' +
        'In an emergency, call 999.' })
    ]);
  }

  /* ---------- Screen 3: results ---------- */

  function finishDrill() {
    state.lastBreaks = run.breaks;
    state.lastBroken = QUESTIONS.filter(function (q, i) { return run.scores[i].result === 'BREAKS'; })
      .map(function (q) { return q.id; });
    save();
    resultsScreen();
  }

  function gauge(title, breaks, id) {
    var fill = el('div', { class: 'fill' });
    setTimeout(function () { fill.style.height = (breaks / QUESTIONS.length * 100) + '%'; }, 30);
    return el('div', { class: 'gauge ' + DryRun.meterLabel(breaks).level, id: id }, [
      el('div', { class: 'gauge-title', text: title }),
      el('div', { class: 'tube' }, [fill]),
      el('div', { class: 'gauge-num', text: plural(breaks, 'break') }),
      el('div', { class: 'gauge-label', text: DryRun.meterLabel(breaks).text })
    ]);
  }

  function resultsScreen() {
    var breaks = run.breaks;
    var total = QUESTIONS.length;
    setWater(breaks);

    var warnings = DryRun.concentration(state.plan).map(function (group) {
      return el('section', { class: 'panel warn', role: 'note' }, [
        el('strong', { text: 'Concentration warning. ' }),
        el('span', { text: 'You rely on ' + group.answer + ' for ' + group.n +
          ' parts of your plan. Check whether your backups are truly independent.' })
      ]);
    });

    var concentrated = DryRun.concentration(state.plan).map(function (g) { return DryRun.norm(g.answer); });
    var rows = QUESTIONS.map(function (q, i) {
      return { q: q, i: i, score: run.scores[i], heavy: concentrated.indexOf(DryRun.norm(state.plan[i].primary)) !== -1 };
    });
    var broken = rows.filter(function (r) { return r.score.result === 'BREAKS'; })
      .sort(function (a, b) { return (b.heavy ? 1 : 0) - (a.heavy ? 1 : 0); });
    var held = rows.filter(function (r) { return r.score.result === 'HOLDS'; });

    function item(r) {
      var tag = r.score.result === 'BREAKS' ? 'breaks' : 'holds';
      return el('li', { class: tag }, [
        el('span', { class: 'tag ' + tag, text: r.score.result }),
        el('strong', { text: r.q.emoji + ' ' + r.q.topic + ': ' }),
        el('span', { text: state.plan[r.i].primary + '. ' + whyText(r.i) })
      ]);
    }

    var compare = null;
    if (run.previousBreaks !== null) {
      var diff = run.previousBreaks - breaks;
      var verdict = diff > 0 ? plural(diff, 'break') + ' fixed since last run.'
        : diff < 0 ? plural(-diff, 'more break') + ' than last run.'
        : 'Same as last run.';
      compare = el('section', { class: 'panel compare-panel ' + (diff > 0 ? 'better' : diff < 0 ? 'worse' : 'same'), id: 'compare' }, [
        el('h2', { text: 'Before and after' }),
        el('div', { class: 'compare' }, [
          gauge('Last run', run.previousBreaks, 'gauge-before'),
          el('div', { class: 'arrow', 'aria-hidden': 'true', text: '→' }),
          gauge('This run', breaks, 'gauge-after')
        ]),
        el('p', { class: 'compare-verdict', text: verdict })
      ]);
    }

    var tiles = el('div', { class: 'tiles' }, [
      el('section', { class: 'panel tile ' + (breaks === 0 ? 'good' : 'bad') }, [
        el('div', { class: 'mono-cap', text: 'Failures' }),
        el('div', { class: 'tile-num', 'aria-hidden': 'true', text: breaks + '/' + total }),
        el('p', { class: 'tile-cap', id: 'score', text: breaks === 0 ? 'Nothing broke.' : plural(breaks, 'break') + ' out of ' + total + '.' })
      ]),
      el('section', { class: 'panel tile' }, [
        el('div', { class: 'mono-cap', text: 'Your predictions' }),
        el('div', { class: 'tile-num', 'aria-hidden': 'true', text: run.correctBets + '/' + total }),
        el('p', { class: 'tile-cap', id: 'bets', text: 'You called ' + run.correctBets + ' of ' + total + ' correctly.' })
      ]),
      el('section', { class: 'panel tile wide' }, [
        el('div', { class: 'tile-head' }, [el('div', { class: 'mono-cap', text: 'Resilience meter' }), meterChip(breaks)]),
        meterBar(breaks),
        el('p', { class: 'tile-cap', text: 'Water rose ' + plural(breaks, 'step') + ' out of ' + total + '.' })
      ])
    ]);

    show([
      statusBar('Drill report'),
      el('h1', { text: 'Results' }),
      tiles,
      compare
    ].concat(warnings).concat([
      broken.length ? el('section', { class: 'panel' }, [
        el('h2', { text: 'Where it broke' }),
        el('ul', { class: 'list', id: 'breaks' }, broken.map(item))
      ]) : null,
      held.length ? el('section', { class: 'panel' }, [
        el('h2', { text: 'What held' }),
        el('ul', { class: 'list', id: 'holds' }, held.map(item))
      ]) : null,
      el('button', { class: 'btn-primary', id: 'patch', text: 'Patch and replay', onclick: planScreen }),
      el('button', { class: 'btn-ghost', id: 'print', style: 'width:100%;margin-top:12px', text: 'Print my plan',
        onclick: function () { window.print(); } }),
      sourcesPanel(),
      el('p', { class: 'small muted', text: 'The meter labels are game feedback, not a risk rating. ' +
        'A backup only counts here if you named one that is different from the primary. ' +
        'Whether it would really work is for you to check.' }),
      printSheet()
    ]));
  }

  homeScreen();

  /* Offline refresh. Only on a deployed https page, never on file://. */
  if (location.protocol === 'https:' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function () { /* the app works without it */ });
  }
})();

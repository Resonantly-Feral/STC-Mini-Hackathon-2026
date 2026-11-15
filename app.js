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

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }

  /* ---------- Screen 1: the plan ---------- */

  function planScreen() {
    setWater(0);
    var isReplay = state.lastBreaks !== null;
    var error = el('p', { class: 'error', role: 'alert' });
    var inputs = [];

    var blocks = QUESTIONS.map(function (q, i) {
      var broke = isReplay && state.lastBroken.indexOf(q.id) !== -1;
      var primary = el('input', { type: 'text', id: q.id + '-primary', placeholder: q.primaryHint, maxlength: '60', autocomplete: 'off' });
      var backup = el('input', { type: 'text', id: q.id + '-backup', placeholder: q.backupHint, maxlength: '60', autocomplete: 'off' });
      primary.value = state.plan[i].primary;
      backup.value = state.plan[i].backup;
      inputs.push({ primary: primary, backup: backup });
      return el('section', { class: 'panel' + (broke ? ' broke' : '') }, [
        el('div', { class: 'q-head' }, [
          el('span', { class: 'q-emoji', 'aria-hidden': 'true', text: q.emoji }),
          el('span', { text: q.question }),
          broke ? el('span', { class: 'badge', text: 'BROKE' }) : null
        ]),
        el('label', { for: q.id + '-primary', text: 'Primary' }),
        primary,
        el('label', { for: q.id + '-backup', text: 'Backup (optional)' }),
        backup
      ]);
    });

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
    }

    function startOver() {
      state = { plan: emptyPlan(), lastBreaks: null, lastBroken: [] };
      save();
      planScreen();
    }

    show([
      el('h1', { text: 'Dry Run' }),
      el('p', { class: 'tagline', text: 'Find the failure before the disaster does.' }),
      isReplay
        ? el('p', { text: 'Patch your plan. Add or change a backup where it broke, then run the drill again.' })
        : el('p', { text: 'Write down your plan. Then we break things, one card at a time, and see what holds.' })
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

  function cardScreen() {
    var index = run.order[run.step];
    var q = QUESTIONS[index];
    var score = run.scores[index];
    var holds = score.result === 'HOLDS';
    var cardText = q.card.replace('{primary}', state.plan[index].primary);

    var call = el('div', { class: 'call' });
    var front = el('div', { class: 'face front' }, [
      el('div', { class: 'card-emoji', 'aria-hidden': 'true', text: q.emoji }),
      el('div', { class: 'card-topic', text: q.topic }),
      el('p', { class: 'card-text', text: cardText })
    ]);
    var back = el('div', { class: 'face back ' + (holds ? 'holds' : 'breaks'), 'aria-hidden': 'true' }, [
      el('div', { class: 'card-emoji', 'aria-hidden': 'true', text: holds ? '🛟' : '💥' }),
      el('div', { class: 'verdict', text: score.result }),
      el('div', { class: 'why', text: whyText(index) }),
      call
    ]);
    var card = el('div', { class: 'card', id: 'card' }, [el('div', { class: 'card-inner' }, [front, back])]);
    var meterSlot = el('div', {}, [meterChip(run.breaks)]);
    var actions = el('div', { 'aria-live': 'polite' });

    function bet(guess) {
      var right = guess === score.result;
      if (right) run.correctBets += 1;
      if (!holds) run.breaks += 1;
      call.textContent = right ? 'You called it.' : 'You did not see that coming.';
      card.classList.add('flipped');
      front.setAttribute('aria-hidden', 'true');
      back.removeAttribute('aria-hidden');
      setWater(run.breaks);
      meterSlot.textContent = '';
      meterSlot.appendChild(meterChip(run.breaks));

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

    actions.appendChild(el('p', { class: 'muted', text: 'Place your bet. Does your plan survive this?' }));
    actions.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'btn-holds', id: 'bet-holds', text: 'My plan HOLDS', onclick: function () { bet('HOLDS'); } }),
      el('button', { class: 'btn-breaks', id: 'bet-breaks', text: 'My plan BREAKS', onclick: function () { bet('BREAKS'); } })
    ]));

    show([
      el('div', { class: 'topbar' }, [
        el('strong', { text: 'Card ' + (run.step + 1) + ' of ' + run.order.length }),
        meterSlot
      ]),
      card,
      actions
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
    return el('div', { class: 'gauge', id: id }, [
      el('div', { class: 'tube' }, [fill]),
      el('div', { text: title }),
      el('div', { class: 'small muted', text: plural(breaks, 'break') })
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
      return el('li', {}, [
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
      compare = el('section', { class: 'panel', id: 'compare' }, [
        el('h2', { text: 'Before and after' }),
        el('div', { class: 'compare' }, [
          gauge('Last run', run.previousBreaks, 'gauge-before'),
          el('div', { class: 'arrow', 'aria-hidden': 'true', text: '→' }),
          gauge('This run', breaks, 'gauge-after')
        ]),
        el('p', { style: 'text-align:center;font-weight:800', text: verdict })
      ]);
    }

    show([
      el('div', { class: 'topbar' }, [el('h1', { text: 'Results' }), meterChip(breaks)]),
      el('p', { class: 'big', id: 'score', text: breaks === 0 ? 'Nothing broke.' : plural(breaks, 'break') + ' out of ' + total + '.' }),
      el('p', { id: 'bets', text: 'You called ' + run.correctBets + ' of ' + total + ' correctly.' })
    ].concat(warnings).concat([
      compare,
      broken.length ? el('section', { class: 'panel' }, [
        el('h2', { text: 'Where it broke' }),
        el('ul', { class: 'list', id: 'breaks' }, broken.map(item))
      ]) : null,
      held.length ? el('section', { class: 'panel' }, [
        el('h2', { text: 'What held' }),
        el('ul', { class: 'list', id: 'holds' }, held.map(item))
      ]) : null,
      el('button', { class: 'btn-primary', id: 'patch', text: 'Patch and replay', onclick: planScreen }),
      el('p', { class: 'small muted', text: 'The meter labels are game feedback, not a risk rating. ' +
        'A backup only counts here if you named one that is different from the primary. ' +
        'Whether it would really work is for you to check.' })
    ]));
  }

  planScreen();
})();

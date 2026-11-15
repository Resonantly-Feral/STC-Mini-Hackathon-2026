/* Dry Run town: a small isometric neighbourhood drawn in code as inline SVG.
   Five buildings, one per plan question. View only: it shows the states it is
   given and never scores anything. Scoring lives in scoring.js. */
var DryRunTown = (function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var UX = 20, UY = 10, OX = 180, OY = 50;   // isometric tile half-width, half-height, origin
  var WATER_EMPTY = 192, WATER_STEP = 23;    // water surface y at 0 breaks, rise per break

  /* Grid (gx, gy) at height z to screen. */
  function pt(gx, gy, z) {
    return [OX + (gx - gy) * UX, OY + (gx + gy) * UY - (z || 0)];
  }

  function node(tag, attrs, kids) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (kid) { if (kid) n.appendChild(kid); });
    return n;
  }

  function poly(points, fill, cls) {
    var attrs = { points: points.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '), fill: fill };
    if (cls) attrs['class'] = cls;
    return node('polygon', attrs);
  }

  /* A box sitting on the ground: left wall, right wall, top. */
  function box(b, cols) {
    var x = b.x, y = b.y, w = b.w, d = b.d, h = b.h;
    return [
      poly([pt(x, y + d, 0), pt(x + w, y + d, 0), pt(x + w, y + d, h), pt(x, y + d, h)], cols[1], 'f-left'),
      poly([pt(x + w, y, 0), pt(x + w, y + d, 0), pt(x + w, y + d, h), pt(x + w, y, h)], cols[2], 'f-right'),
      poly([pt(x, y, h), pt(x + w, y, h), pt(x + w, y + d, h), pt(x, y + d, h)], cols[0], 'f-top')
    ];
  }

  /* A rectangle on the left wall (u along the wall, v up the wall, both 0..1). */
  function onLeft(b, u1, v1, u2, v2, fill, cls) {
    var y = b.y + b.d;
    return poly([pt(b.x + u1 * b.w, y, v1 * b.h), pt(b.x + u2 * b.w, y, v1 * b.h),
      pt(b.x + u2 * b.w, y, v2 * b.h), pt(b.x + u1 * b.w, y, v2 * b.h)], fill, cls);
  }

  function onRight(b, u1, v1, u2, v2, fill, cls) {
    var x = b.x + b.w;
    return poly([pt(x, b.y + b.d - u1 * b.d, v1 * b.h), pt(x, b.y + b.d - u2 * b.d, v1 * b.h),
      pt(x, b.y + b.d - u2 * b.d, v2 * b.h), pt(x, b.y + b.d - u1 * b.d, v2 * b.h)], fill, cls);
  }

  var WIN = '#ffe9a6';

  /* The five buildings, in question order: keys, documents, contacts, knowledge, reach. */
  var BUILDINGS = [
    {
      name: 'House', emoji: '🔑', x: 0.6, y: 4.3, w: 2.1, d: 1.7, h: 16, top: 30,
      draw: function (b) {
        var r = 13, x = b.x, y = b.y, w = b.w, d = b.d, h = b.h, m = y + d / 2;
        return box(b, ['#f3e3c2', '#f3e3c2', '#cdb88f']).concat([
          onLeft(b, .1, 0, .3, .62, '#7a4a2b', 'win'),
          onLeft(b, .5, .3, .8, .72, WIN, 'win'),
          onRight(b, .3, .3, .7, .72, WIN, 'win'),
          poly([pt(x + w, y, h), pt(x + w, y + d, h), pt(x + w, m, h + r)], '#e6d2a8', 'f-right'),
          poly([pt(x - .12, y + d + .12, h - 1), pt(x + w + .12, y + d + .12, h - 1), pt(x + w + .12, m, h + r), pt(x - .12, m, h + r)], '#d9603f', 'f-top')
        ]);
      }
    },
    {
      name: 'Records office', emoji: '📄', x: 0.9, y: 0.8, w: 2.1, d: 2.1, h: 46, top: 48,
      draw: function (b) {
        var parts = box(b, ['#8fb8ff', '#5f8fe6', '#3f69bd']);
        [.12, .34, .56, .78].forEach(function (v) {
          [.1, .4, .7].forEach(function (u) {
            parts.push(onLeft(b, u, v, u + .2, v + .13, WIN, 'win'));
            parts.push(onRight(b, u, v, u + .2, v + .13, WIN, 'win'));
          });
        });
        return parts;
      }
    },
    {
      name: 'Community hall', emoji: '📇', x: 3.2, y: 2.8, w: 1.7, d: 1.7, h: 19, top: 21,
      draw: function (b) {
        return box(b, ['#ffe08a', '#ffc94d', '#d99c1f']).concat([
          onLeft(b, .36, 0, .64, .6, '#7a4a2b', 'win'),
          onLeft(b, .08, .4, .26, .75, WIN, 'win'),
          onLeft(b, .74, .4, .92, .75, WIN, 'win'),
          onRight(b, .15, .4, .42, .75, WIN, 'win'),
          onRight(b, .58, .4, .85, .75, WIN, 'win')
        ]);
      }
    },
    {
      name: 'Kedai', emoji: '🧠', x: 4.5, y: 4.5, w: 2.1, d: 1.7, h: 16, top: 18,
      draw: function (b) {
        var parts = box(b, ['#7fe3d2', '#3fc4b0', '#2a9484']);
        parts.push(onLeft(b, .08, 0, .92, .5, '#17443d', 'win'));
        parts.push(onRight(b, .25, .25, .75, .7, WIN, 'win'));
        var y = b.y + b.d, i;
        for (i = 0; i < 6; i++) {   // striped awning over the shopfront
          var x1 = b.x + b.w * i / 6, x2 = b.x + b.w * (i + 1) / 6;
          parts.push(poly([pt(x1, y, b.h * .82), pt(x2, y, b.h * .82), pt(x2, y + .5, b.h * .5), pt(x1, y + .5, b.h * .5)],
            i % 2 ? '#ffffff' : '#ff8a4c', 'awn'));
        }
        return parts;
      }
    },
    {
      name: 'Signal tower', emoji: '📡', x: 4.5, y: 0.7, w: 1.2, d: 1.2, h: 12, top: 62,
      draw: function (b) {
        var parts = box(b, ['#c9d3e6', '#9fb0cc', '#74859f']);
        var base = pt(b.x + b.w / 2, b.y + b.d / 2, b.h), tip = pt(b.x + b.w / 2, b.y + b.d / 2, 58);
        parts.push(onLeft(b, .3, 0, .7, .7, '#3a4a66', 'win'));
        parts.push(node('path', { d: 'M' + (base[0] - 7) + ' ' + base[1] + ' L' + tip[0] + ' ' + tip[1] + ' L' + (base[0] + 7) + ' ' + base[1] +
          ' M' + (base[0] - 4.5) + ' ' + (base[1] - 15) + ' H' + (base[0] + 4.5) + ' M' + (base[0] - 2.5) + ' ' + (base[1] - 30) + ' H' + (base[0] + 2.5),
          fill: 'none', stroke: '#dfe7f5', 'stroke-width': 2, 'stroke-linejoin': 'round', 'class': 'mast' }));
        [7, 12, 17].forEach(function (r, i) {
          parts.push(node('path', { d: 'M' + (tip[0] - r) + ' ' + (tip[1] - r * .5) + ' A' + r + ' ' + r + ' 0 0 1 ' + (tip[0] + r) + ' ' + (tip[1] - r * .5),
            fill: 'none', stroke: '#22e1ff', 'stroke-width': 1.6, 'stroke-linecap': 'round', 'class': 'signal sig' + i }));
        });
        parts.push(node('circle', { cx: tip[0], cy: tip[1], r: 2.6, fill: '#ff4d5e', 'class': 'beacon-light' }));
        return parts;
      }
    }
  ];

  var TREES = [[0.5, 2.9], [3.6, 0.6], [6.3, 2.6], [3.0, 6.2], [6.4, 6.4], [1.2, 6.6], [6.1, 0.5]];

  function tree(t) {
    var foot = pt(t[0], t[1], 0), crown = pt(t[0], t[1], 12);
    return node('g', { 'class': 'tree' }, [
      node('path', { d: 'M' + foot[0] + ' ' + foot[1] + ' V' + crown[1], stroke: '#6b4a2e', 'stroke-width': 2.4, 'stroke-linecap': 'round' }),
      node('circle', { cx: crown[0], cy: crown[1] - 2, r: 6.5, fill: '#2f9d63' }),
      node('circle', { cx: crown[0] - 2, cy: crown[1] - 4, r: 3.5, fill: '#4cc383' })
    ]);
  }

  function ground() {
    var g = 7, t = 9;
    return node('g', { 'class': 'ground' }, [
      poly([pt(0, g, 0), pt(g, g, 0), pt(g, g, -t), pt(0, g, -t)], '#2a7d57'),
      poly([pt(g, 0, 0), pt(g, g, 0), pt(g, g, -t), pt(g, 0, -t)], '#1d5c41'),
      poly([pt(0, 0, 0), pt(g, 0, 0), pt(g, g, 0), pt(0, g, 0)], '#49c486'),
      // a lane across the middle of town
      poly([pt(0, 3.75, 0), pt(g, 3.75, 0), pt(g, 4.2, 0), pt(0, 4.2, 0)], '#d8ccb0'),
      poly([pt(3.0, 0, 0), pt(3.0, 2.6, 0), pt(3.0, 2.6, 0), pt(2.55, 2.6, 0), pt(2.55, 0, 0)], '#d8ccb0')
    ]);
  }

  /* opts: { states: five of 'idle' | 'holds' | 'breaks', active: index or -1,
             water: breaks so far, storm: bool, label: text for screen readers,
             onPick: function(index) for tappable buildings (optional) } */
  function build(opts) {
    var groups = [];
    var items = BUILDINGS.map(function (b, i) {
      var centre = pt(b.x + b.w / 2, b.y + b.d / 2, 0);
      var badgeAt = pt(b.x + b.w / 2, b.y + b.d / 2, b.top + 15);
      var body = node('g', { 'class': 'body' }, b.draw(b));
      var mark = node('text', { x: badgeAt[0] + 9, y: badgeAt[1] - 6, 'class': 'mark', 'text-anchor': 'middle' });
      var g = node('g', { 'class': 'bld' }, [
        node('ellipse', { cx: centre[0], cy: centre[1], rx: 30, ry: 15, 'class': 'ring-pulse' }),
        body,
        node('g', { 'class': 'badge' }, [
          node('circle', { cx: badgeAt[0], cy: badgeAt[1], r: 11.5, 'class': 'badge-ring' }),
          node('text', { x: badgeAt[0], y: badgeAt[1] + 4.5, 'class': 'badge-emoji', 'text-anchor': 'middle' }, [document.createTextNode(b.emoji)]),
          node('circle', { cx: badgeAt[0] + 9, cy: badgeAt[1] - 9, r: 6, 'class': 'mark-dot' }),
          mark
        ])
      ]);
      if (opts.onPick) {
        g.addEventListener('click', function () { if (g.classList.contains('s-breaks')) opts.onPick(i); });
      }
      groups.push({ g: g, mark: mark });
      return { key: b.x + b.w + b.y + b.d, el: g };
    });
    TREES.forEach(function (t) { items.push({ key: t[0] + t[1], el: tree(t) }); });
    items.sort(function (a, b) { return a.key - b.key; });

    var water = node('g', { 'class': 'town-water' }, [
      node('rect', { x: -2000, y: 0, width: 4360, height: 260, fill: 'url(#dr-water)' }),
      node('rect', { x: -2000, y: 0, width: 4360, height: 2.5, fill: '#bfe0ff', opacity: .8 })
    ]);
    var svg = node('svg', { viewBox: '14 6 332 200', role: 'img', preserveAspectRatio: 'xMidYMid meet' }, [
      node('defs', {}, [
        node('linearGradient', { id: 'dr-water', x1: 0, y1: 0, x2: 0, y2: 1 }, [
          node('stop', { offset: 0, 'stop-color': '#3d9bff', 'stop-opacity': .78 }),
          node('stop', { offset: 1, 'stop-color': '#0f3fb0', 'stop-opacity': .92 })
        ])
      ]),
      node('g', { 'class': 'clouds' }, [
        node('ellipse', { cx: 70, cy: 30, rx: 34, ry: 11 }),
        node('ellipse', { cx: 96, cy: 24, rx: 22, ry: 10 }),
        node('ellipse', { cx: 285, cy: 22, rx: 30, ry: 10 }),
        node('ellipse', { cx: 262, cy: 28, rx: 20, ry: 8 })
      ]),
      ground()
    ].concat(items.map(function (it) { return it.el; })).concat([water]));

    var wrap = document.createElement('div');
    wrap.className = 'town';
    wrap.appendChild(svg);

    function set(next) {
      var states = next.states || [];
      var broken = 0;
      groups.forEach(function (item, i) {
        var s = states[i] || 'idle';
        if (s === 'breaks') broken += 1;
        item.g.setAttribute('class', 'bld s-' + s + (next.active === i ? ' active' : '') +
          (opts.onPick && s === 'breaks' ? ' pick' : ''));
        item.mark.textContent = s === 'breaks' ? '✕' : s === 'holds' ? '✓' : '';
      });
      var level = next.water == null ? broken : next.water;
      water.style.transform = 'translateY(' + (WATER_EMPTY - level * WATER_STEP) + 'px)';
      wrap.classList.toggle('storm', !!next.storm);
      svg.setAttribute('aria-label', next.label || ('Town: ' + broken + ' of ' + BUILDINGS.length + ' buildings flooded.'));
    }

    set(opts);
    return { el: wrap, set: set };
  }

  return { build: build, names: BUILDINGS.map(function (b) { return b.name; }) };
})();

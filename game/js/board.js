/*
 * A Jornada até Einstein — o tabuleiro ilustrado (SVG gerado localmente).
 *
 * - Caminho sinuoso em serpentina: uma faixa por região (6 colunas no computador,
 *   3 colunas em telas estreitas).
 * - Cenário diferente em cada região (laboratório, oficina, circuitos, observatório, cosmos).
 * - Cada casa é identificada por ícone, nome curto e número (não só por cor).
 * - O personagem (token) anda casa a casa com animação.
 */
(function (root, factory) {
  var api = factory(root.JE.Logic, root.JE.Character);
  root.JE.Board = api;
})(typeof self !== 'undefined' ? self : this, function (Logic, Character) {
  'use strict';
  var root = typeof self !== 'undefined' ? self : this;

  var CELL_COLORS = { start: '#7cf0a1', desafio: '#59b8ff', lab: '#2fe0c0', desc: '#ffd24d', rev: '#c39bff', gd: '#ff7a59', marco: '#ffcf5a', final: '#ffffff' };
  var REGION_COLORS = ['#2fc4b2', '#9bd94f', '#4aa8ff', '#a58bff', '#ffcf5a'];
  var BAND_FILL = [['#0f4455', '#0a2b3b'], ['#244a2e', '#16301f'], ['#17367a', '#0d2255'], ['#382866', '#221650'], ['#201347', '#080620']];

  var ICONS = {
    start: '<path d="M6 21V3.5"/><path d="M6 4.5h11l-2.5 4 2.5 4H6" fill="currentColor" fill-opacity=".3"/>',
    desafio: '<ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)"/><circle cx="12" cy="12" r="1.9" fill="currentColor"/>',
    lab: '<path d="M7 15.2h10l2 3.4a1.6 1.6 0 0 1-1.4 2.4H6.4A1.6 1.6 0 0 1 5 18.6z" fill="currentColor" fill-opacity=".38" stroke="none"/><path d="M9.5 3h5M10.5 3v6.2L5.2 18a2.2 2.2 0 0 0 1.9 3.3h9.8a2.2 2.2 0 0 0 1.9-3.3L13.5 9.2V3"/>',
    desc: '<path d="M9 18h6M10 21.5h4"/><path d="M12 2.5a6.2 6.2 0 0 0-3.9 11c.9.8 1.4 1.7 1.4 3h5c0-1.3.5-2.2 1.4-3A6.2 6.2 0 0 0 12 2.5z" fill="currentColor" fill-opacity=".25"/>',
    rev: '<path d="M20 11.5A8 8 0 0 0 5.8 7M4 4v4h4"/><path d="M4 12.5A8 8 0 0 0 18.2 17M20 20v-4h-4"/>',
    gd: '<path d="M13.5 2L4.5 13.5h6.5L10 22l9.5-12h-6.5z" fill="currentColor" fill-opacity=".3"/>',
    marco: '<path d="M12 2.5l3 6.3 6.9.9-5 4.8 1.3 6.9L12 18.1 5.8 21.4l1.3-6.9-5-4.8 6.9-.9z" fill="currentColor" fill-opacity=".3"/>',
    final: '<path d="M8 3.5h8v5.5a4 4 0 0 1-8 0z" fill="currentColor" fill-opacity=".3"/><path d="M8 5.5H4.5v1.2a3.8 3.8 0 0 0 3.8 3.8M16 5.5h3.5v1.2a3.8 3.8 0 0 1-3.8 3.8M12 13v4M8.5 21h7M9.8 17h4.4"/>',
    medal: '<circle cx="12" cy="14.5" r="6" fill="currentColor" fill-opacity=".25"/><path d="M8 2.5l4 6.2 4-6.2"/><path d="M12 11.6l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3z" fill="currentColor"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>'
  };

  function iconSvg(type, opts) {
    opts = opts || {};
    return '<svg class="' + (opts.className || 'icon') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ICONS[type] + '</svg>';
  }

  function symbols() {
    var s = '';
    Object.keys(ICONS).forEach(function (k) {
      s += '<symbol id="ic-' + k + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + ICONS[k] + '</symbol>';
    });
    return s;
  }

  /* ---------------------------- geometria ---------------------------- */

  function mulberry(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function computeLayout(containerWidth) {
    var cols = containerWidth >= 700 ? 6 : 3;
    var L = { cols: cols, pos: [null], bulges: [] };
    var i, n;
    if (cols === 6) {
      L.W = 1200; L.rowH = 116; L.padX = 105; L.r = 31; L.amp = 15; L.head = 66; L.rpb = 1;
    } else {
      L.W = 480; L.rowH = 112; L.padX = 84; L.r = 33; L.amp = 9; L.head = 70; L.rpb = 2;
    }
    L.gx = (L.W - 2 * L.padX) / (cols - 1);
    L.bandH = L.head + L.rpb * L.rowH;
    L.H = 5 * L.bandH;
    for (n = 1; n <= 30; n++) {
      i = n - 1;
      var row = Math.floor(i / cols), c = i % cols;
      if (row % 2 === 1) c = cols - 1 - c;
      L.pos.push({ x: L.padX + c * L.gx, y: Math.floor(row / L.rpb) * L.bandH + L.head + (row % L.rpb) * L.rowH + L.rowH / 2 + Math.sin(i * 1.25) * L.amp, row: row });
    }
    // pontos de curva nas voltas da serpentina
    for (n = cols; n < 30; n += cols) {
      var a = L.pos[n], b = L.pos[n + 1];
      var dir = (Math.floor((n - 1) / cols) % 2 === 0) ? 1 : -1;
      L.bulges[n] = { x: a.x + dir * L.gx * 0.42, y: (a.y + b.y) / 2 };
    }
    L.bands = Logic.REGIONS.map(function (rg, k) { return { y: k * L.bandH, h: L.bandH, id: rg.id }; });
    return L;
  }

  /** Curva suave (Catmull-Rom → Bézier) por todos os pontos; devolve um d por par de casas. */
  function buildPaths(L) {
    var P = [];
    for (var n = 1; n <= 30; n++) {
      P.push({ x: L.pos[n].x, y: L.pos[n].y, cell: n });
      if (L.bulges[n]) P.push({ x: L.bulges[n].x, y: L.bulges[n].y, cell: 0 });
    }
    function pieceD(j) {
      var p0 = P[Math.max(0, j - 1)], p1 = P[j], p2 = P[j + 1], p3 = P[Math.min(P.length - 1, j + 2)];
      var c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
      var c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
      return 'C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2.x.toFixed(1) + ' ' + p2.y.toFixed(1);
    }
    var idx = {}; P.forEach(function (p, j) { if (p.cell) idx[p.cell] = j; });
    var segs = [null];
    for (var m = 1; m < 30; m++) {
      var d = 'M' + P[idx[m]].x.toFixed(1) + ' ' + P[idx[m]].y.toFixed(1);
      for (var j = idx[m]; j < idx[m + 1]; j++) d += pieceD(j);
      segs[m] = d;
    }
    var all = 'M' + P[0].x.toFixed(1) + ' ' + P[0].y.toFixed(1);
    for (var q = 0; q < P.length - 1; q++) all += pieceD(q);
    return { segs: segs, all: all, points: P };
  }

  /* ---------------------------- cenários ---------------------------- */

  var MOTIFS = {
    beaker: '<path d="M-12-16h24M-10-16v8L-18 14a4 4 0 0 0 3.4 6h29a4 4 0 0 0 3.4-6L10-8v-8"/><path d="M-14 6h28"/>',
    tubes: '<rect x="-20" y="-18" width="9" height="36" rx="4.5"/><rect x="-4.5" y="-18" width="9" height="36" rx="4.5"/><rect x="11" y="-18" width="9" height="36" rx="4.5"/><path d="M-20 4h9M-4.5 8h9M11 0h9"/>',
    atom: '<ellipse rx="22" ry="8.5"/><ellipse rx="22" ry="8.5" transform="rotate(60)"/><ellipse rx="22" ry="8.5" transform="rotate(-60)"/><circle r="3.6" fill="currentColor"/>',
    microscope: '<path d="M-6-20l10 6-4 10-10-6zM-1-4L8 12M-12 20h26M2 20c9 0 14-6 11-14"/><path d="M-12 20v-4"/>',
    gear: '<circle r="9"/><path d="M0-20v6M0 14v6M-20 0h6M14 0h6M-14-14l4 4M10 10l4 4M-14 14l4-4M10-10l4-4"/><circle r="16"/>',
    ramp: '<path d="M-24 14L22-14M-24 14h50M22-14v28"/><circle cx="-4" cy="-10" r="6" fill="currentColor" fill-opacity=".25"/>',
    pendulum: '<path d="M0-22v0M-18-22h36"/><path d="M0-22L-13 12"/><circle cx="-13" cy="16" r="6.5" fill="currentColor" fill-opacity=".25"/><path d="M-26 8a28 28 0 0 0 0 0"/>',
    spring: '<path d="M-26 0h8l3-10 6 20 6-20 6 20 6-20 3 10h8"/><path d="M-26-14v28M26-14v28"/>',
    thermo: '<path d="M-5-22a5 5 0 0 1 10 0v26a10 10 0 1 1-10 0z"/><path d="M0-6v18"/><circle cy="16" r="4" fill="currentColor" fill-opacity=".4"/>',
    magnet: '<path d="M-16-18v22a16 16 0 0 0 32 0v-22M-16-18h9v22a7 7 0 0 0 14 0v-22h9"/>',
    trace: '<path d="M-30 10h14l8-18h16l8 18h20"/><circle cx="-30" cy="10" r="3"/><circle cx="-8" cy="-8" r="3"/><circle cx="8" cy="-8" r="3"/><circle cx="30" cy="10" r="3"/>',
    bulb: '<path d="M-6 18h12M-4 23h8"/><path d="M0-22a12 12 0 0 0-8 21c2 2 3 4 3 6h10c0-2 1-4 3-6a12 12 0 0 0-8-21z"/>',
    battery: '<rect x="-20" y="-11" width="36" height="22" rx="3"/><path d="M16-5h5v10h-5M-10-5v10M-4-5v10M2-5v10"/>',
    wave: '<path d="M-32 0q8-20 16 0t16 0 16 0 16 0"/>',
    lens: '<path d="M0-22c-14 8-14 36 0 44 14-8 14-36 0-44z"/><path d="M-30 0h60M-18-4l4 4-4 4M18-4l-4 4 4 4"/>',
    resistor: '<path d="M-30 0h10l3-10 6 20 6-20 6 20 6-20 3 10h10"/>',
    dome: '<path d="M-24 18v-14a24 24 0 0 1 48 0v14zM-24 18h48"/><path d="M-6 4a6 6 0 0 1 12 0M0-20v10"/>',
    saturn: '<circle r="11"/><ellipse rx="28" ry="8" transform="rotate(-18)"/>',
    constel: '<path d="M-30 10L-12-8 6 4 18-14 32 2"/><circle cx="-30" cy="10" r="3" fill="currentColor"/><circle cx="-12" cy="-8" r="3" fill="currentColor"/><circle cx="6" cy="4" r="3" fill="currentColor"/><circle cx="18" cy="-14" r="3" fill="currentColor"/><circle cx="32" cy="2" r="3" fill="currentColor"/>',
    moon: '<path d="M10-18A18 18 0 1 0 10 18 14 14 0 0 1 10-18z"/>',
    telescope: '<path d="M-26 6l34-18 6 12-34 18zM-6 22l8-20M8 22L2 2"/>',
    planet: '<circle r="14" fill="currentColor" fill-opacity=".12"/><path d="M-10-4q10 5 20 0M-12 4q12 6 24 0"/>',
    spiral: '<path d="M0 0c3-3 7-1 7 3 0 7-10 9-14 3-6-9 3-20 14-18 14 3 18 20 8 30"/><circle r="2.4" fill="currentColor"/>',
    orbit: '<ellipse rx="34" ry="12" transform="rotate(-20)"/><circle cx="-28" cy="-14" r="4" fill="currentColor"/>',
    comet: '<circle r="5" fill="currentColor"/><path d="M-6 3L-34 18M-4 6L-26 24M-7 0L-36 8" />'
  };
  var EQS = ['E = mc²', 'F = m·a', 'ΔS = v·Δt', 'E = h·f', 'U = R·i'];
  var SCENES = [
    ['beaker', 'tubes', 'atom', 'microscope', 'gear', 'beaker', 'atom', 'tubes', 'microscope'],
    ['gear', 'ramp', 'pendulum', 'spring', 'thermo', 'magnet', 'gear', 'ramp', 'thermo'],
    ['trace', 'bulb', 'battery', 'wave', 'lens', 'resistor', 'trace', 'bulb', 'wave'],
    ['dome', 'saturn', 'constel', 'moon', 'telescope', 'constel', 'saturn', 'dome', 'moon'],
    ['planet', 'spiral', 'orbit', 'comet', 'planet', 'spiral', 'orbit', 'comet', 'planet']
  ];

  function sceneryFor(k, L, pathInfo) {
    var rng = mulberry(9100 + k * 77 + L.cols);
    var band = L.bands[k];
    var avoid = [];
    pathInfo.points.forEach(function (p) { avoid.push([p.x, p.y]); });
    for (var m = 1; m < 30; m++) { // pontos intermediários para cada trecho
      var a = L.pos[m], b = L.pos[m + 1];
      avoid.push([(a.x + b.x) / 2, (a.y + b.y) / 2]);
    }
    var placed = [], out = '';
    var want = L.cols === 6 ? 9 : 12;
    var minPath = L.cols === 6 ? 78 : 70;
    var tries = 0;
    var list = SCENES[k];
    while (placed.length < want && tries < 600) {
      tries++;
      var x = 36 + rng() * (L.W - 72);
      var y = band.y + 22 + rng() * (band.h - 44);
      if (y < band.y + 52 && x < L.W * 0.55) continue; // reserva o título da região
      var ok = true, i;
      for (i = 0; i < avoid.length; i++) { var dx = avoid[i][0] - x, dy = avoid[i][1] - y; if (dx * dx + dy * dy < minPath * minPath) { ok = false; break; } }
      if (!ok) continue;
      for (i = 0; i < placed.length; i++) { var ex = placed[i][0] - x, ey = placed[i][1] - y; if (ex * ex + ey * ey < 92 * 92) { ok = false; break; } }
      if (!ok) continue;
      placed.push([x, y]);
      var key = list[(placed.length - 1) % list.length];
      var sc = (L.cols === 6 ? 1.0 : 0.95) * (0.85 + rng() * 0.5);
      var rot = (rng() - 0.5) * 24;
      out += '<g class="motif" transform="translate(' + x.toFixed(0) + ' ' + y.toFixed(0) + ') rotate(' + rot.toFixed(0) + ') scale(' + sc.toFixed(2) + ')">' + MOTIFS[key] + '</g>';
    }
    if (k === 4) { // equações tênues no cosmos
      for (i = 0; i < 4; i++) {
        var ex2 = 60 + rng() * (L.W - 220), ey2 = band.y + 30 + rng() * (band.h - 50);
        var bad = false;
        for (var q = 0; q < avoid.length; q++) { var ddx = avoid[q][0] - ex2 - 40, ddy = avoid[q][1] - ey2; if (ddx * ddx + ddy * ddy < 70 * 70) { bad = true; break; } }
        if (!bad && !(ey2 < band.y + 52 && ex2 < L.W * 0.55)) out += '<text class="motif-eq" x="' + ex2.toFixed(0) + '" y="' + ey2.toFixed(0) + '">' + EQS[i] + '</text>';
      }
    }
    // estrelas/pontos
    for (var s = 0; s < (L.cols === 6 ? 46 : 38); s++) {
      var sx = rng() * L.W, sy = band.y + 6 + rng() * (band.h - 12);
      out += '<circle class="dust" cx="' + sx.toFixed(0) + '" cy="' + sy.toFixed(0) + '" r="' + (0.8 + rng() * 1.6).toFixed(1) + '" opacity="' + (0.25 + rng() * 0.5).toFixed(2) + '"/>';
    }
    return out;
  }

  /* ---------------------------- montagem do SVG ---------------------------- */

  function cellState(n, pos, status) {
    if (status === 'won' && n <= pos) return n === pos ? 'current' : 'done';
    if (n < pos) return 'done';
    if (n === pos) return 'current';
    if (n === pos + 1 && status === 'playing') return 'next';
    return 'future';
  }

  function typeLabel(t) { return Logic.CELL_TYPES[t].label; }

  function create(container, handlers) {
    var svg = null, layout = null, pathInfo = null, lastState = null, tokenEl = null, tokenCharEl = null;
    var reduce = root.matchMedia ? root.matchMedia('(prefers-reduced-motion: reduce)') : null;
    handlers = handlers || {};

    function tokenMarkup(state, mood, uid) {
      var st = Logic.stageOf(state);
      var p = Character.parts({ stage: st.stage, hairT: st.hairT, blend: st.blend, aura: st.stage === 5 ? 1 : 0, mood: mood || 'idle', portrait: true, uid: uid || 'tk' });
      var r = layout.r;
      var w = r * 2.5, h = w * 146 / 120;
      return '<svg x="' + (-w / 2).toFixed(1) + '" y="' + (-h + r * 0.95).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" viewBox="' + p.viewBox + '" overflow="visible">' + p.body + '</svg>';
    }

    function render(state, mood) {
      lastState = state;
      var w = container.clientWidth || 900;
      var cols = w >= 700 ? 6 : 3;
      if (!layout || layout.cols !== cols) { layout = computeLayout(w); pathInfo = buildPaths(layout); }
      var L = layout, pos = state.pos;
      var s = '<svg id="board-svg" class="board-svg" viewBox="0 0 ' + L.W + ' ' + L.H + '" role="group" aria-label="Tabuleiro da jornada, com 30 casas em 5 regiões. Você está na casa ' + pos + '." xmlns="http://www.w3.org/2000/svg">';
      s += '<defs>' + symbols();
      Logic.REGIONS.forEach(function (rg, k) {
        s += '<linearGradient id="band' + k + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + BAND_FILL[k][0] + '"/><stop offset="1" stop-color="' + BAND_FILL[k][1] + '"/></linearGradient>';
      });
      s += '<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>';
      s += '<radialGradient id="tokglow"><stop offset="0" stop-color="#fff2b8" stop-opacity=".9"/><stop offset="1" stop-color="#ffcf5a" stop-opacity="0"/></radialGradient>';
      s += '</defs>';

      // faixas das regiões
      Logic.REGIONS.forEach(function (rg, k) {
        var b = L.bands[k];
        s += '<g class="band band-' + (k + 1) + '"><rect x="0" y="' + b.y + '" width="' + L.W + '" height="' + b.h + '" fill="url(#band' + k + ')"/>';
        s += '<g class="scenery" color="' + REGION_COLORS[k] + '">' + sceneryFor(k, L, pathInfo) + '</g>';
        if (k > 0) s += '<line class="band-sep" x1="0" y1="' + b.y + '" x2="' + L.W + '" y2="' + b.y + '"/>';
        var done = state.medals[k];
        var stars = '';
        for (var z = 0; z < 5; z++) stars += z < rg.stars ? '★' : '☆';
        s += '<text class="band-title" x="' + (L.cols === 6 ? 30 : 22) + '" y="' + (b.y + (L.cols === 6 ? 36 : 34)) + '" fill="' + REGION_COLORS[k] + '">' + rg.name +
          '<tspan class="band-stars" dx="14" aria-hidden="true">' + stars + '</tspan></text>';
        s += '<text class="band-sub" x="' + (L.cols === 6 ? 30 : 22) + '" y="' + (b.y + (L.cols === 6 ? 58 : 56)) + '">' + (done ? 'Região concluída · medalha conquistada' : rg.difficulty) + '</text>';
        if (done) s += '<g class="band-medal" transform="translate(' + (L.W - 46) + ' ' + (b.y + 38) + ')" color="' + REGION_COLORS[k] + '"><circle r="22" fill="rgba(0,0,0,.35)" stroke="currentColor" stroke-width="2.5"/><use href="#ic-medal" x="-14" y="-14" width="28" height="28"/></g>';
        s += '</g>';
      });

      // estrada
      s += '<path class="road-edge" d="' + pathInfo.all + '"/><path class="road" d="' + pathInfo.all + '"/><path class="road-dash" d="' + pathInfo.all + '"/>';
      for (var m = 1; m < 30; m++) {
        if (m < pos) s += '<path class="road-done" style="stroke:' + REGION_COLORS[Logic.regionOf(m + 1).id - 1] + '" d="' + pathInfo.segs[m] + '"/>';
      }

      // casas
      for (var n = 1; n <= 30; n++) {
        var cell = Logic.BOARD[n], T = Logic.CELL_TYPES[cell.type], P = L.pos[n];
        var st = cellState(n, pos, state.status);
        var big = (cell.type === 'marco' || cell.type === 'final');
        var r = L.r * (big ? 1.18 : 1);
        var color = CELL_COLORS[cell.type];
        var rc = REGION_COLORS[cell.region - 1];
        var label = 'Casa ' + n + ', ' + T.label + (st === 'done' ? ', já concluída' : st === 'current' ? ', você está aqui' : st === 'next' ? ', próxima casa, ative para enfrentar o desafio' : ', ainda bloqueada');
        s += '<g class="cell cell-' + cell.type + ' is-' + st + '" data-cell="' + n + '" transform="translate(' + P.x.toFixed(1) + ' ' + P.y.toFixed(1) + ')" style="--tc:' + color + ';--rc:' + rc + '"' +
          ' role="button" aria-disabled="' + (st === 'next' ? 'false' : 'true') + '" tabindex="' + (st === 'next' ? '0' : '-1') + '" aria-label="' + label + '">';
        if (st === 'next') s += '<circle class="pulse" r="' + (r + 6) + '"/><circle class="pulse pulse2" r="' + (r + 6) + '"/>';
        if (st === 'current') s += '<circle class="here-glow" r="' + (r + 16) + '" fill="url(#tokglow)"/>';
        s += '<circle class="c-body" r="' + r + '"/>';
        if (big) s += '<circle class="c-ring" r="' + (r - 5) + '"/>';
        s += '<use class="c-icon" href="#ic-' + cell.type + '" x="' + (-r * 0.5).toFixed(1) + '" y="' + (-r * 0.5).toFixed(1) + '" width="' + (r).toFixed(1) + '" height="' + (r).toFixed(1) + '"/>';
        // número
        s += '<g class="c-num" transform="translate(' + (-r * 0.78).toFixed(1) + ' ' + (-r * 0.78).toFixed(1) + ')"><circle r="11.5"/><text y="4.4">' + n + '</text></g>';
        if (st === 'done') s += '<g class="c-check" transform="translate(' + (r * 0.74).toFixed(1) + ' ' + (r * 0.74).toFixed(1) + ')"><circle r="10.5"/><use href="#ic-check" x="-7.5" y="-7.5" width="15" height="15"/></g>';
        s += '<text class="c-label" y="' + (r + 17).toFixed(0) + '">' + T.short + '</text>';
        s += '<title>' + label + '</title></g>';
      }

      // linha de chegada
      var f = L.pos[30];
      s += '<g class="finish" transform="translate(' + f.x.toFixed(0) + ' ' + (f.y - L.r * 1.18 - 34).toFixed(0) + ')"><path d="M-22 0v-26M-22-26h38l-8 9 8 9h-38" class="flag"/><text x="26" y="-10" class="finish-txt">Chegada</text></g>';

      // personagem
      var P0 = L.pos[pos];
      s += '<g class="token" id="token" style="transform:translate(' + P0.x.toFixed(1) + 'px,' + P0.y.toFixed(1) + 'px)">' +
        '<ellipse class="token-shadow" cx="0" cy="' + (L.r * 0.95).toFixed(1) + '" rx="' + (L.r * 0.85).toFixed(1) + '" ry="' + (L.r * 0.22).toFixed(1) + '"/>' +
        '<g class="token-char">' + tokenMarkup(state, mood) + '</g></g>';
      s += '</svg>';
      container.innerHTML = s;
      svg = container.firstChild;
      tokenEl = svg.querySelector('#token');
      tokenCharEl = svg.querySelector('.token-char');
    }

    function onClick(ev) {
      var g = ev.target.closest ? ev.target.closest('[data-cell]') : null;
      if (g && handlers.onCell) handlers.onCell(parseInt(g.getAttribute('data-cell'), 10), g);
    }
    function onKey(ev) {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      var g = ev.target.closest ? ev.target.closest('[data-cell]') : null;
      if (g) { ev.preventDefault(); if (handlers.onCell) handlers.onCell(parseInt(g.getAttribute('data-cell'), 10), g); }
    }
    container.addEventListener('click', onClick);
    container.addEventListener('keydown', onKey);

    var rz = null;
    if (root.ResizeObserver) {
      new root.ResizeObserver(function () {
        if (!lastState) return;
        var cols = container.clientWidth >= 700 ? 6 : 3;
        if (layout && cols !== layout.cols) { clearTimeout(rz); rz = setTimeout(function () { render(lastState); }, 80); }
      }).observe(container);
    }

    function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
    function reduced() { return !!(reduce && reduce.matches); }

    function cellCenterOnScreen(n) {
      var el = svg.querySelector('[data-cell="' + n + '"]');
      return el ? el.getBoundingClientRect() : null;
    }

    function scrollToCell(n) {
      var rect = cellCenterOnScreen(n);
      if (!rect) return;
      var vh = root.innerHeight;
      var margin = 140;
      if (rect.top < margin || rect.bottom > vh - margin - 80) {
        var target = root.scrollY + rect.top - vh / 2 + rect.height / 2;
        root.scrollTo({ top: Math.max(0, target), behavior: reduced() ? 'auto' : 'smooth' });
      }
    }

    /** Anda casa a casa pelo caminho informado. */
    function moveAlong(path, onStep) {
      if (!tokenEl || !path || !path.length) return Promise.resolve();
      var chain = Promise.resolve();
      path.forEach(function (n) {
        chain = chain.then(function () {
          var P = layout.pos[n];
          tokenEl.style.transform = 'translate(' + P.x.toFixed(1) + 'px,' + P.y.toFixed(1) + 'px)';
          tokenEl.classList.remove('hop'); void tokenEl.getBoundingClientRect(); tokenEl.classList.add('hop');
          if (onStep) onStep(n);
          scrollToCell(n);
          var el = svg.querySelector('[data-cell="' + n + '"]');
          if (el) { el.classList.remove('landed'); void el.getBoundingClientRect(); el.classList.add('landed'); }
          return sleep(reduced() ? 0 : 340);
        });
      });
      return chain;
    }

    function setMood(state, mood) {
      if (!tokenCharEl) return;
      tokenCharEl.innerHTML = tokenMarkup(state, mood, 'tm' + Math.floor(Math.random() * 1e6));
    }

    function tokenRect() { return tokenEl ? tokenEl.getBoundingClientRect() : null; }
    function nextCellEl() { return svg ? svg.querySelector('.cell.is-next') : null; }
    function cellEl(n) { return svg ? svg.querySelector('[data-cell="' + n + '"]') : null; }

    return { render: render, moveAlong: moveAlong, setMood: setMood, tokenRect: tokenRect, nextCellEl: nextCellEl, cellEl: cellEl,
      scrollToCell: scrollToCell, layout: function () { return layout; } };
  }

  return { create: create, iconSvg: iconSvg, CELL_COLORS: CELL_COLORS, REGION_COLORS: REGION_COLORS, ICONS: ICONS };
});

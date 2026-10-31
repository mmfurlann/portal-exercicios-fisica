/*
 * A Jornada até Einstein — o personagem, desenhado em SVG próprio.
 *
 * Cinco estágios realmente diferentes (roupa, acessórios, cabelo, óculos, bigode),
 * sobre uma mesma base (rosto, olhos, proporções) para manter a identidade.
 * A transformação é gradual: o cabelo vai do castanho ao grisalho e ao branco
 * ao longo das 30 casas, e o "físico experiente" ganha volume de cabelo e bigode
 * à medida que se aproxima da última casa.
 *
 *   Character.svg({ stage: 1..5, hairT: 0..1, blend: 0..1, aura: 0..1,
 *                   mood: 'idle'|'happy'|'oops', portrait: bool, props: bool, uid: 'x' })
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.JE = root.JE || {}; root.JE.Character = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var INK = '#1b2240';
  var SKIN = '#f4c7a0';
  var SKIN_SH = '#e4a97d';
  var NAMES = [null, 'Estudante curioso', 'Aprendiz de Física', 'Jovem cientista', 'Físico experiente', 'Einstein'];

  function hexToRgb(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
  function mix(a, b, t) {
    var x = hexToRgb(a), y = hexToRgb(b), o = '#';
    for (var i = 0; i < 3; i++) { var v = Math.round(x[i] + (y[i] - x[i]) * t); o += (v < 16 ? '0' : '') + v.toString(16); }
    return o;
  }
  function hairColor(t) {
    // castanho escuro → castanho acinzentado → grisalho → branco
    var stops = [[0, '#3b281c'], [0.4, '#5d4636'], [0.68, '#a7a29c'], [1, '#f6f6f4']];
    for (var i = 1; i < stops.length; i++) {
      if (t <= stops[i][0]) {
        var a = stops[i - 1], b = stops[i];
        return mix(a[1], b[1], (t - a[0]) / (b[0] - a[0]));
      }
    }
    return stops[stops.length - 1][1];
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function circle(cx, cy, r, fill, stroke, sw) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"' +
      (stroke ? ' stroke="' + stroke + '" stroke-width="' + (sw || 2.5) + '"' : '') + '/>';
  }
  function path(d, fill, stroke, sw, extra) {
    return '<path d="' + d + '" fill="' + (fill || 'none') + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="' + (sw || 2.5) + '" stroke-linejoin="round" stroke-linecap="round"' : '') + (extra || '') + '/>';
  }

  /* ---------------------------- roupas por estágio ---------------------------- */

  function legs(s) {
    var pants = [null, '#3a5aa8', '#2c3f78', '#2d3550', '#2d3550', '#3b3f55'][s];
    var shoe = [null, '#ffffff', '#4aa3ff', '#262b3f', '#262b3f', '#6b4a2f'][s];
    var o = '';
    o += '<rect x="77" y="196" width="21" height="64" rx="9" fill="' + pants + '" stroke="' + INK + '" stroke-width="2.5"/>';
    o += '<rect x="102" y="196" width="21" height="64" rx="9" fill="' + pants + '" stroke="' + INK + '" stroke-width="2.5"/>';
    o += '<ellipse cx="86" cy="262" rx="16" ry="8.5" fill="' + shoe + '" stroke="' + INK + '" stroke-width="2.5"/>';
    o += '<ellipse cx="114" cy="262" rx="16" ry="8.5" fill="' + shoe + '" stroke="' + INK + '" stroke-width="2.5"/>';
    if (s === 1) o += '<path d="M72 266 H100 M100 266 H128" stroke="#e5484d" stroke-width="3" stroke-linecap="round"/>';
    return o;
  }

  var TORSO = 'M63 142 Q63 124 84 122 L116 122 Q137 124 137 142 L139 206 Q100 214 61 206 Z';
  var COAT = 'M62 138 Q62 121 84 119 L116 119 Q138 121 138 138 L143 240 Q100 249 57 240 Z';

  function sleeve(color) {
    return path('M67 136 Q52 164 54 192', 'none', INK, 21) + path('M133 136 Q148 164 146 192', 'none', INK, 21) +
      path('M67 136 Q52 164 54 192', 'none', color, 16.5) + path('M133 136 Q148 164 146 192', 'none', color, 16.5);
  }
  function hands() {
    return circle(54, 197, 9, SKIN, INK) + circle(146, 197, 9, SKIN, INK);
  }

  function clothes(s, o) {
    var t = '';
    if (s === 1) { // camiseta + mochila
      t += '<rect x="53" y="126" width="94" height="76" rx="16" fill="#f08a3c" stroke="' + INK + '" stroke-width="2.5"/>';
      t += path(TORSO, '#2fc4b2', INK, 2.5);
      t += sleeve('#2fc4b2');
      // emblema de átomo
      t += '<g transform="translate(100 160)" fill="none" stroke="#ffffff" stroke-width="2" opacity=".95"><ellipse rx="13" ry="5"/><ellipse rx="13" ry="5" transform="rotate(60)"/><ellipse rx="13" ry="5" transform="rotate(-60)"/><circle r="2.6" fill="#ffffff" stroke="none"/></g>';
      // alças
      t += path('M79 123 L77 190', 'none', '#c9621c', 6, '') + path('M121 123 L123 190', 'none', '#c9621c', 6, '');
      t += path('M90 122 Q100 132 110 122', '#26a595', INK, 2.2);
    } else if (s === 2) { // camisa + colete + caderno
      t += path(TORSO, '#ffffff', INK, 2.5);
      t += sleeve('#ffffff');
      t += path('M66 138 Q66 124 84 123 L92 123 L100 160 L108 123 L116 123 Q134 124 134 138 L136 206 Q100 213 64 206 Z', '#f2b84b', INK, 2.5);
      t += path('M92 123 L100 138 L108 123', '#ffffff', INK, 2.2);
      t += '<circle cx="100" cy="176" r="3.2" fill="' + INK + '"/><circle cx="100" cy="192" r="3.2" fill="' + INK + '"/>';
    } else if (s === 3 || s === 4) { // jaleco
      t += path(COAT, '#ffffff', INK, 2.5);
      t += sleeve('#f6f8ff');
      t += path('M85 120 L100 168 L115 120', s === 3 ? '#4a7bd8' : '#7a2f3b', INK, 2.2); // camisa / gravata aparece abaixo
      t += path('M84 119 L100 152 L90 176 L72 130 Z', '#f6f8ff', INK, 2.2) + path('M116 119 L100 152 L110 176 L128 130 Z', '#f6f8ff', INK, 2.2);
      if (s === 4) t += path('M96 152 L104 152 L106 200 L100 206 L94 200 Z', '#7a2f3b', INK, 2); // gravata
      t += '<rect x="108" y="190" width="24" height="22" rx="3" fill="#eef2fb" stroke="' + INK + '" stroke-width="2"/>';
      t += '<path d="M114 190 V183 M120 190 V181 M126 190 V184" stroke="' + (s === 3 ? '#e5484d' : '#2b3a8f') + '" stroke-width="3" stroke-linecap="round"/>';
      t += '<rect x="68" y="196" width="20" height="9" rx="2" fill="#2b3a8f"/><text x="78" y="203.5" font-size="6.5" font-weight="700" fill="#fff" text-anchor="middle" font-family="system-ui,sans-serif">FÍSICA</text>';
      t += path('M100 168 L100 236', 'none', '#c8cfe3', 1.6);
    } else { // cardigã
      t += path(TORSO, '#ffffff', INK, 2.5);
      t += sleeve('#6e7ba3');
      t += path('M64 140 Q64 124 84 122 L92 122 L100 150 L108 122 L116 122 Q136 124 136 140 L138 206 Q100 214 62 206 Z', '#6e7ba3', INK, 2.5);
      t += path('M92 122 L100 142 L108 122', '#ffffff', INK, 2);
      t += path('M100 150 L100 208', 'none', '#4a557a', 2.2);
      [162, 178, 194].forEach(function (y) { t += circle(100, y, 3.1, '#c9d2ee', INK, 1.8); });
      t += path('M70 150 Q76 170 74 196', 'none', '#586592', 1.8, ' opacity=".7"') + path('M130 150 Q124 170 126 196', 'none', '#586592', 1.8, ' opacity=".7"');
    }
    return t;
  }

  function heldProps(s, uid) {
    var t = '';
    if (s === 2) { // caderno na mão esquerda do personagem (lado esquerdo da imagem)
      t += '<g transform="rotate(-10 44 190)"><rect x="24" y="168" width="36" height="46" rx="3.5" fill="#2b3a8f" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<path d="M31 168 V214" stroke="#ffffff" stroke-opacity=".5" stroke-width="2"/>' +
        '<g transform="translate(46 184)" fill="none" stroke="#ffd24d" stroke-width="1.6"><ellipse rx="8" ry="3.2"/><ellipse rx="8" ry="3.2" transform="rotate(60)"/><ellipse rx="8" ry="3.2" transform="rotate(-60)"/></g>' +
        '<rect x="35" y="200" width="20" height="3" rx="1.5" fill="#ffffff" opacity=".7"/></g>';
    } else if (s === 3) { // erlenmeyer
      t += '<g transform="translate(150 164)"><path d="M-6 0 h12 v12 l13 26 a5 5 0 0 1 -4.5 7 h-29 a5 5 0 0 1 -4.5 -7 l13 -26 z" fill="#e9f6ff" fill-opacity=".85" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M-12 30 h24 l5 11 a3 3 0 0 1 -2.7 4.2 h-28.6 a3 3 0 0 1 -2.7 -4.2 z" fill="#3ddc97" stroke="none"/>' +
        '<g class="bubbles"><circle cx="-3" cy="34" r="2" fill="#d6ffe9"/><circle cx="4" cy="30" r="1.6" fill="#d6ffe9"/><circle cx="0" cy="38" r="1.4" fill="#d6ffe9"/></g>' +
        '<path d="M-7 -1 h14" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/></g>';
    } else if (s === 4) { // ponteiro
      t += path('M146 197 L184 128', 'none', INK, 6.5) + path('M146 197 L184 128', 'none', '#e0b36a', 3.4);
      t += circle(185, 126, 3.2, '#ffd24d', INK, 1.8);
    } else if (s === 5) { // giz
      t += '<g transform="rotate(25 146 190)"><rect x="141" y="178" width="12" height="7" rx="2" fill="#ffffff" stroke="' + INK + '" stroke-width="1.8"/></g>';
    }
    return t;
  }

  function board(s, uid) {
    if (s < 4) return '';
    var t = '<g class="char-board">';
    var bx = s === 5 ? 170 : 160, bw = 236 - bx;
    t += '<rect x="' + bx + '" y="' + (s === 5 ? 86 : 62) + '" width="' + bw + '" height="' + (s === 5 ? 56 : 72) + '" rx="5" fill="#173a34" stroke="#8a5a2b" stroke-width="4.5"/>';
    if (s === 4) {
      t += '<g fill="#f4f7ff" font-family="Georgia,serif" font-style="italic" font-size="11.5">' +
        '<text x="168" y="86">F = m·a</text><text x="168" y="105">E = ½mv²</text><text x="168" y="123">v = λ·f</text></g>';
    } else {
      t += '<g class="chalk-glow" fill="#fff6c8" font-family="Georgia,serif" font-style="italic" font-weight="700">' +
        '<text x="203" y="122" font-size="17" text-anchor="middle" filter="url(#glow-' + uid + ')">E = mc²</text></g>';
      t += '<path d="M180 98 q4 -5 8 0 M216 134 q4 4 8 0" stroke="#fff6c8" stroke-width="1.5" fill="none" stroke-linecap="round" transform="translate(0 -8)"/>';
    }
    t += '<path d="M' + bx + ' ' + (s === 5 ? 144 : 138) + ' h' + bw + '" stroke="#8a5a2b" stroke-width="5" stroke-linecap="round"/></g>';
    return t;
  }

  /* ---------------------------- cabeça, rosto e cabelo ---------------------------- */

  function face(o) {
    var s = o.stage, mood = o.mood || 'idle';
    var t = '';
    var hair = o.hair;
    // bochechas
    t += '<ellipse cx="79" cy="102" rx="7" ry="4.5" fill="#ff8f8f" opacity=".32"/><ellipse cx="121" cy="102" rx="7" ry="4.5" fill="#ff8f8f" opacity=".32"/>';
    // olhos
    var oy = mood === 'oops' ? 1.2 : 0;
    t += '<g class="eyes" style="transform-origin:100px 91px">' +
      '<ellipse cx="87" cy="91" rx="7.6" ry="8.6" fill="#ffffff" stroke="' + INK + '" stroke-width="2"/>' +
      '<ellipse cx="113" cy="91" rx="7.6" ry="8.6" fill="#ffffff" stroke="' + INK + '" stroke-width="2"/>' +
      circle(88.4, 92 + oy, 4.4, INK) + circle(114.4, 92 + oy, 4.4, INK) +
      circle(89.9, 90 + oy, 1.5, '#ffffff') + circle(115.9, 90 + oy, 1.5, '#ffffff') + '</g>';
    // sobrancelhas
    var bc = s === 5 ? '#f3f3f1' : (s === 4 ? mix(hair, '#ffffff', 0.15) : hair);
    var bw = s === 5 ? 4.6 : 3.4;
    var bl, br;
    if (mood === 'oops') { bl = 'M78 83 L95 78'; br = 'M105 78 L122 83'; }
    else if (mood === 'happy') { bl = 'M78 79 Q87 72 96 78'; br = 'M104 78 Q113 72 122 79'; }
    else { bl = 'M78 80 Q87 73 96 79'; br = 'M104 80 Q113 78 122 80'; } // curioso: sobrancelha esquerda erguida
    if (s === 5) t += path(bl, 'none', INK, bw + 2.4) + path(br, 'none', INK, bw + 2.4);
    t += path(bl, 'none', bc, bw) + path(br, 'none', bc, bw);
    // nariz
    t += path('M100 95 Q96 103 101 104', 'none', SKIN_SH, 2.4);
    // boca
    var my = s === 5 ? 3 : 0;
    var mouth;
    if (mood === 'happy') mouth = path('M88 ' + (107 + my) + ' Q100 ' + (122 + my) + ' 112 ' + (107 + my) + ' Z', '#7a2d3a', INK, 2.2) +
      '<path d="M93 ' + (113 + my) + ' Q100 ' + (118 + my) + ' 107 ' + (113 + my) + '" fill="#ff8f8f"/>';
    else if (mood === 'oops') mouth = path('M91 ' + (113 + my) + ' Q100 ' + (106 + my) + ' 109 ' + (113 + my), 'none', INK, 2.6);
    else mouth = path('M91 ' + (108 + my) + ' Q100 ' + (115 + my) + ' 109 ' + (108 + my), 'none', INK, 2.6);
    t += mouth;
    return t;
  }

  function wrinkles(s) {
    if (s < 4) return '';
    var c = '#c9976d';
    var t = path('M72 91 q-3 3 -3 7 M128 91 q3 3 3 7', 'none', c, 1.6);
    t += path('M80 100 q3 3 7 2 M120 100 q-3 3 -7 2', 'none', c, 1.4);
    if (s === 5) t += path('M82 69 q18 -4 36 0 M85 74 q15 -3 30 0', 'none', c, 1.5);
    return t;
  }

  function glasses(s) {
    if (s !== 3 && s !== 4) return '';
    var w = s === 4 ? 2.8 : 2.4;
    return '<g fill="rgba(190,225,255,.22)" stroke="' + INK + '" stroke-width="' + w + '">' +
      '<circle cx="87" cy="91" r="12"/><circle cx="113" cy="91" r="12"/>' +
      '<path d="M98.6 89 Q100 86 101.4 89" fill="none"/><path d="M75 90 L66 87 M125 90 L134 87" fill="none" stroke-linecap="round"/></g>' +
      '<path d="M79 85 q3 -3 7 -3.5 M105 85 q3 -3 7 -3.5" stroke="#ffffff" stroke-opacity=".8" stroke-width="2" fill="none" stroke-linecap="round"/>';
  }

  function mustache(s, blend, hair) {
    if (s < 4) return '';
    var op, scale;
    if (s === 4) { op = clamp((blend - 0.45) * 2.2, 0, 1); scale = 0.62 + 0.3 * blend; if (op <= 0.02) return ''; }
    else { op = 1; scale = 1.1; }
    var col = s === 5 ? '#e9e9e6' : mix(hair, '#ffffff', 0.1);
    return '<g opacity="' + op.toFixed(2) + '" transform="translate(100 107) scale(' + scale.toFixed(2) + ') translate(-100 -107)">' +
      path('M76 108 Q86 95 100 103 Q114 95 124 108 Q118 120 100 112 Q82 120 76 108 Z', col, INK, 2.2) +
      path('M90 107 Q96 110 100 109 Q104 110 110 107', 'none', '#b9b9b5', 1.4) + '</g>';
  }

  function hairBack(s, hair) {
    if (s !== 5) return '';
    var w = hair;
    var t = '<g stroke="' + INK + '" stroke-width="2.2">';
    var cs = [[100, 44, 22], [76, 50, 20], [124, 50, 20], [58, 68, 18], [142, 68, 18], [50, 90, 15], [150, 90, 15], [64, 54, 16], [136, 54, 16], [88, 38, 16], [112, 38, 16], [46, 108, 11], [154, 108, 11]];
    cs.forEach(function (c) { t += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="' + w + '"/>'; });
    t += '</g>';
    t += '<g fill="#d7d9e4" opacity=".55">' + circle(50, 98, 7, '#d7d9e4') + circle(150, 98, 7, '#d7d9e4') + circle(60, 72, 7, '#d7d9e4') + circle(140, 72, 7, '#d7d9e4') + '</g>';
    return t;
  }

  function hairFront(s, hair, blend) {
    if (s === 1 || s === 2 || s === 3) {
      var h = path('M64 88 C58 52 84 43 100 43 C118 43 142 52 136 88 C132 77 124 69 112 66 C106 72 96 72 90 66 C78 68 68 76 64 88 Z', hair, INK, 2.5);
      h += path('M96 44 q-5 -11 9 -9', 'none', INK, 2.6);
      h += path('M82 52 q8 -6 18 -6', 'none', '#ffffff', 2.2, ' opacity=".28"');
      return h;
    }
    if (s === 4) {
      var tuft = 5 + 8 * blend;
      var h4 = circle(62, 84, tuft, hair, INK, 2.2) + circle(138, 84, tuft, hair, INK, 2.2);
      h4 += path('M64 86 C60 56 84 46 100 46 C118 46 140 56 136 86 C133 74 126 62 114 59 C106 63 96 63 88 59 C76 62 67 74 64 86 Z', hair, INK, 2.5);
      h4 += path('M84 55 q8 -5 16 -5', 'none', '#ffffff', 2, ' opacity=".35"');
      return h4;
    }
    // Einstein: topete volumoso na frente
    var e = '<g stroke="' + INK + '" stroke-width="2.2" fill="' + hair + '">' +
      '<path d="M66 82 C64 62 80 54 92 58 C98 52 112 52 118 58 C128 56 138 64 134 82 C130 72 124 68 116 66 C108 70 94 70 86 66 C76 68 70 74 66 82 Z"/></g>';
    e += path('M80 62 q6 -4 12 -2 M110 60 q8 -2 14 3', 'none', '#cfd2de', 2, ' opacity=".8"');
    return e;
  }

  function accessories(s) {
    if (s === 2) { // lápis atrás da orelha
      return path('M131 84 L147 62', 'none', INK, 6) + path('M131 84 L147 62', 'none', '#ffd24d', 3.4) + path('M147 62 L150 57', 'none', INK, 4);
    }
    return '';
  }

  /* ---------------------------- montagem ---------------------------- */

  function parts(opts) {
    opts = opts || {};
    var s = clamp(Math.round(opts.stage || 1), 1, 5);
    var uid = opts.uid || 'c';
    var hairT = opts.hairT === undefined ? (s - 1) / 4 : clamp(opts.hairT, 0, 1);
    var blend = clamp(opts.blend || 0, 0, 1);
    var hair = s === 5 ? '#f6f6f4' : hairColor(hairT);
    var aura = clamp(opts.aura || 0, 0, 1);
    var mood = opts.mood || 'idle';
    var props = opts.props !== false && !opts.portrait;

    var defs = '<defs>' +
      '<radialGradient id="aura-' + uid + '" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffe9a3" stop-opacity=".95"/><stop offset="55%" stop-color="#ffcf5a" stop-opacity=".35"/><stop offset="100%" stop-color="#ffcf5a" stop-opacity="0"/></radialGradient>' +
      '<filter id="glow-' + uid + '" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '</defs>';

    var body = defs;
    if (aura > 0.02) body += '<circle class="aura" cx="100" cy="150" r="' + (96 + 40 * aura).toFixed(0) + '" fill="url(#aura-' + uid + ')" opacity="' + (0.25 + 0.65 * aura).toFixed(2) + '"/>';
    body += '<ellipse cx="100" cy="270" rx="56" ry="9" fill="#000" opacity=".28"/>';
    if (props) body += board(s, uid);
    body += legs(s);
    body += clothes(s);
    if (props) body += heldProps(s, uid);
    body += hands();
    // pescoço e cabeça
    body += '<rect x="91" y="112" width="18" height="17" rx="5" fill="' + SKIN_SH + '" stroke="' + INK + '" stroke-width="2.2"/>';
    body += hairBack(s, hair);
    body += circle(66, 94, 7.5, SKIN, INK, 2.2) + circle(134, 94, 7.5, SKIN, INK, 2.2);
    body += circle(100, 90, 35, SKIN, INK, 2.5);
    body += face({ stage: s, mood: mood, hair: hair });
    body += wrinkles(s);
    body += mustache(s, blend, hair);
    body += glasses(s);
    body += hairFront(s, hair, blend);
    body += accessories(s);

    return { viewBox: opts.portrait ? '40 14 120 146' : '0 0 240 290', body: body, stage: s };
  }

  function svg(opts) {
    opts = opts || {};
    var p = parts(opts);
    var label = opts.label || ('Personagem: ' + NAMES[p.stage]);
    return '<svg class="char char-s' + p.stage + (opts.className ? ' ' + opts.className : '') + '" viewBox="' + p.viewBox +
      '" role="img" aria-label="' + label + '" xmlns="http://www.w3.org/2000/svg">' + p.body + '</svg>';
  }

  return { svg: svg, parts: parts, hairColor: hairColor, NAMES: NAMES };
});

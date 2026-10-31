/*
 * A Jornada até Einstein — figuras das questões (tabelas, gráficos, circuitos)
 * Tudo é gerado localmente em SVG/HTML: nenhuma imagem externa.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.JE = root.JE || {}; root.JE.Figures = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function num(v) { return String(Math.round(v * 100) / 100).replace('.', ','); }

  function table(fig) {
    var h = '<table class="fig-table"><caption>' + esc(fig.caption || '') + '</caption><thead><tr>';
    fig.headers.forEach(function (t) { h += '<th scope="col">' + esc(t) + '</th>'; });
    h += '</tr></thead><tbody>';
    fig.rows.forEach(function (r) {
      h += '<tr>';
      r.forEach(function (c, i) { h += (i === 0 ? '<th scope="row">' : '<td>') + esc(c) + (i === 0 ? '</th>' : '</td>'); });
      h += '</tr>';
    });
    return h + '</tbody></table>';
  }

  function graph(fig) {
    var W = 380, H = 250, l = 56, r = 18, t = 16, b = 50;
    var pw = W - l - r, ph = H - t - b;
    var sx = function (x) { return l + (x / fig.xMax) * pw; };
    var sy = function (y) { return t + ph - (y / fig.yMax) * ph; };
    var s = '<svg class="fig-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(fig.alt) + '" xmlns="http://www.w3.org/2000/svg">';
    var x, y;
    for (x = 0; x <= fig.xMax + 1e-9; x += fig.xStep) {
      s += '<line class="fig-grid" x1="' + sx(x) + '" y1="' + t + '" x2="' + sx(x) + '" y2="' + (t + ph) + '"/>';
      s += '<text class="fig-tick" x="' + sx(x) + '" y="' + (t + ph + 16) + '" text-anchor="middle">' + num(x) + '</text>';
    }
    for (y = 0; y <= fig.yMax + 1e-9; y += fig.yStep) {
      s += '<line class="fig-grid" x1="' + l + '" y1="' + sy(y) + '" x2="' + (l + pw) + '" y2="' + sy(y) + '"/>';
      s += '<text class="fig-tick" x="' + (l - 8) + '" y="' + (sy(y) + 4) + '" text-anchor="end">' + num(y) + '</text>';
    }
    s += '<line class="fig-axis" x1="' + l + '" y1="' + t + '" x2="' + l + '" y2="' + (t + ph) + '"/>';
    s += '<line class="fig-axis" x1="' + l + '" y1="' + (t + ph) + '" x2="' + (l + pw) + '" y2="' + (t + ph) + '"/>';
    var pts = fig.points.map(function (p) { return sx(p[0]).toFixed(1) + ',' + sy(p[1]).toFixed(1); }).join(' ');
    s += '<polyline class="fig-line" points="' + pts + '" fill="none"/>';
    fig.points.forEach(function (p) { s += '<circle class="fig-dot" cx="' + sx(p[0]).toFixed(1) + '" cy="' + sy(p[1]).toFixed(1) + '" r="3.6"/>'; });
    s += '<text class="fig-label" x="' + (l + pw / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(fig.xLabel) + '</text>';
    s += '<text class="fig-label" transform="translate(14 ' + (t + ph / 2) + ') rotate(-90)" text-anchor="middle">' + esc(fig.yLabel) + '</text>';
    return s + '</svg>';
  }

  function svgFigure(fig) {
    return '<svg class="fig-svg fig-circuit" viewBox="' + esc(fig.viewBox) + '" role="img" aria-label="' + esc(fig.alt) +
      '" xmlns="http://www.w3.org/2000/svg">' + fig.body + '</svg>';
  }

  /** Devolve o HTML da figura (ou string vazia). */
  function render(fig) {
    if (!fig) return '';
    var inner = fig.type === 'table' ? table(fig) : fig.type === 'graph' ? graph(fig) : fig.type === 'svg' ? svgFigure(fig) : '';
    if (!inner) return '';
    var cap = fig.type === 'table' ? '' : '<figcaption>' + esc(fig.caption || '') + '</figcaption>';
    return '<figure class="q-figure">' + inner + cap + '</figure>';
  }

  return { render: render, table: table, graph: graph, svgFigure: svgFigure, esc: esc };
});

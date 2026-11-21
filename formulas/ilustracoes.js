/* Biblioteca de Fórmulas · ilustrações dos exemplos resolvidos.
   Cada desenho é uma função que recebe rótulos (os números do exemplo) e devolve um SVG.
   As cores vêm de classes (k, s, a, b, g, r para traço; fa, fb, fk, fs, fp, fw, fg, fr, fh para preenchimento),
   definidas em formulas.css a partir das cores do site. MAPA (no fim) liga cada fórmula ao seu desenho. */
(function () {
const E = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const n1 = v => Math.round(v * 10) / 10;
const rad = d => d * Math.PI / 180;
const P = (cx, cy, r, deg) => [cx + r * Math.cos(rad(deg)), cy - r * Math.sin(rad(deg))];
const svg = (body, w = 300, h = 160) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${body}</svg>`;

/* ---------- primitivas ---------- */
const ln = (x1, y1, x2, y2, c = 'k', w = 2, dash) => `<line x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(x2)}" y2="${n1(y2)}" class="${c}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
// rótulo em tipografia matemática: variáveis em itálico, índices rebaixados, unidades e palavras retas
function mathTxt(t) {
  const s = String(t); let out = '', last = 0, m;
  const re = /([A-Za-zΑ-Ωα-ω]+)(?:_([A-Za-z0-9]+))?/g;
  while ((m = re.exec(s))) {
    out += E(s.slice(last, m.index));
    last = m.index + m[0].length;
    const base = m[1], sub = m[2], antes = s.slice(0, m.index), depois = s.slice(last);
    const letraSimples = base.length === 1 || (base.length === 2 && base[0] === 'Δ');
    const variavel = letraSimples && !/([\d⁰-⁹\/·×^])\s?$/.test(antes) && (sub !== undefined || /^\s*([=≈<>≤≥,.)+\-−·]|$)|^[′₀-₉⁰-⁹]/.test(depois));
    out += variavel ? `<tspan font-style="italic">${E(base)}</tspan>` : E(base);
    if (sub !== undefined) out += `<tspan dy="0.3em" font-size="72%">${E(sub)}</tspan><tspan dy="-0.3em"></tspan>`;
  }
  return out + E(s.slice(last));
}
function tx(x, y, t, c = 'k', anchor = 'middle', size = 12) {
  if (t === '' || t == null) return '';
  const w = [...String(t)].length * size * 0.6, W = 298;
  if (anchor === 'start' && x + w > W) { x = W; anchor = 'end'; }
  if (anchor === 'end' && x - w < 2) { x = 2; anchor = 'start'; }
  if (anchor === 'middle') { if (x + w / 2 > W) x = W - w / 2; if (x - w / 2 < 2) x = 2 + w / 2; }
  return `<text x="${n1(x)}" y="${n1(y)}" class="t${c}" text-anchor="${anchor}" font-size="${size}">${mathTxt(t)}</text>`;
}
const ci = (cx, cy, r, c = 'k', f = 'fn', w = 2) => `<circle cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r)}" class="${c} ${f}" stroke-width="${w}"/>`;
const re = (x, y, w, h, c = 'k', f = 'fn', rx = 0, sw = 2) => `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" rx="${rx}" class="${c} ${f}" stroke-width="${sw}"/>`;
const pa = (d, c = 'k', f = 'fn', w = 2, dash) => `<path d="${d}" class="${c} ${f}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''} stroke-linejoin="round" stroke-linecap="round"/>`;
const el = (cx, cy, rx, ry, c = 'k', f = 'fn', w = 2, dash) => `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(rx)}" ry="${n1(ry)}" class="${c} ${f}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
// seta com ponta desenhada (sem marcadores, para não repetir ids na página)
function ar(x1, y1, x2, y2, c = 'a', lab, lx, ly, anchor = 'start', w = 2.4) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 9, s = 4.5;
  const pts = [[x2, y2], [x2 - h * Math.cos(a) + s * Math.sin(a), y2 - h * Math.sin(a) - s * Math.cos(a)], [x2 - h * Math.cos(a) - s * Math.sin(a), y2 - h * Math.sin(a) + s * Math.cos(a)]];
  return ln(x1, y1, x2 - h * 0.7 * Math.cos(a), y2 - h * 0.7 * Math.sin(a), c, w) + `<polygon points="${pts.map(p => p.map(n1).join(',')).join(' ')}" class="f${c}"/>`
    + (lab ? tx(lx == null ? x2 + 6 : lx, ly == null ? y2 + 4 : ly, lab, c, anchor) : '');
}
// cota (dimensão) com tracinhos nas pontas
function dim(x1, y1, x2, y2, lab, ox = 0, oy = 0) {
  const a = Math.atan2(y2 - y1, x2 - x1), px = -Math.sin(a) * 4, py = Math.cos(a) * 4;
  return ln(x1, y1, x2, y2, 's', 1.2) + ln(x1 - px, y1 - py, x1 + px, y1 + py, 's', 1.2) + ln(x2 - px, y2 - py, x2 + px, y2 + py, 's', 1.2)
    + (Math.abs(x2 - x1) < Math.abs(y2 - y1)
      ? tx((x1 + x2) / 2 + (ox < 0 ? -7 : 7), (y1 + y2) / 2 + 4, lab, 's', ox < 0 ? 'end' : 'start')
      : tx((x1 + x2) / 2 + ox, (y1 + y2) / 2 + (oy > 0 ? 15 : -6), lab, 's'));
}
// arco de ângulo (graus no sentido matemático, y para cima)
function arc(cx, cy, r, a1, a2, lab, c = 'a') {
  const [x1, y1] = P(cx, cy, r, a1), [x2, y2] = P(cx, cy, r, a2), large = Math.abs(a2 - a1) > 180 ? 1 : 0, sweep = a2 > a1 ? 0 : 1;
  const [lx, ly] = P(cx, cy, r + 12, (a1 + a2) / 2);
  return pa(`M${n1(x1)},${n1(y1)} A${r},${r} 0 ${large} ${sweep} ${n1(x2)},${n1(y2)}`, c, 'fn', 1.5) + tx(lx, ly + 4, lab, c);
}
function ground(x1, x2, y) { let h = ln(x1, y, x2, y, 'k', 2); for (let x = x1 + 6; x < x2; x += 10) h += ln(x, y + 1, x - 6, y + 7, 's', 1); return h; }
function wall(x, y1, y2, side = -1) { let h = ln(x, y1, x, y2, 'k', 2); for (let y = y1 + 4; y < y2; y += 10) h += ln(x, y, x + 6 * side, y + 6, 's', 1); return h; }
function ceiling(x1, x2, y) { let h = ln(x1, y, x2, y, 'k', 2); for (let x = x1 + 6; x < x2; x += 10) h += ln(x, y, x - 6, y - 6, 's', 1); return h; }
const car = (x, y) => re(x, y - 30, 90, 18, 'k', 'fp', 5) + pa(`M${x + 16},${y - 30} L${x + 28},${y - 44} L${x + 62},${y - 44} L${x + 76},${y - 30}`, 'k', 'fp')
  + ci(x + 20, y - 10, 9, 'k', 'fs') + ci(x + 70, y - 10, 9, 'k', 'fs');
const blk = (x, y, w, h, lab, f = 'fp') => re(x, y, w, h, 'k', f, 3) + tx(x + w / 2, y + h / 2 + 4, lab);
const person = (x, y, c = 'k') => ci(x, y - 44, 7, c, 'fn') + ln(x, y - 37, x, y - 16, c) + ln(x, y - 30, x - 10, y - 22, c) + ln(x, y - 30, x + 10, y - 22, c) + ln(x, y - 16, x - 8, y, c) + ln(x, y - 16, x + 8, y, c);
const ball = (x, y, r = 7, f = 'fa') => ci(x, y, r, 'k', f, 1.5);
function spring(x1, y, x2, coils = 8, amp = 8, c = 'k') {
  const step = (x2 - x1) / (coils * 2); let d = `M${x1},${y}`;
  for (let i = 0; i < coils * 2; i++) d += ` L${n1(x1 + step * (i + 0.5))},${y + (i % 2 ? amp : -amp)}`;
  return pa(d + ` L${x2},${y}`, c);
}
function vspring(x, y1, y2, coils = 7, amp = 8) {
  const step = (y2 - y1) / (coils * 2); let d = `M${x},${y1}`;
  for (let i = 0; i < coils * 2; i++) d += ` L${x + (i % 2 ? amp : -amp)},${n1(y1 + step * (i + 0.5))}`;
  return pa(d + ` L${x},${y2}`);
}
function sine(x1, x2, y, A, lambda, phase = 0, c = 'b', w = 2.2) {
  let d = ''; for (let x = x1; x <= x2; x += 2) d += (x === x1 ? 'M' : 'L') + n1(x) + ',' + n1(y - A * Math.sin(2 * Math.PI * (x - x1) / lambda + phase)) + ' ';
  return pa(d, c, 'fn', w);
}
function wavy(x1, y1, x2, y2, c = 'a', lab) { // fóton: seta ondulada
  const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L; let d = '';
  for (let s = 0; s <= L - 10; s += 2) { const o = Math.sin(s / 4) * 4; d += (s ? 'L' : 'M') + n1(x1 + ux * s - uy * o) + ',' + n1(y1 + uy * s + ux * o) + ' '; }
  return pa(d, c, 'fn', 2) + ar(x1 + ux * (L - 12), y1 + uy * (L - 12), x2, y2, c, lab);
}
const resistor = (x, y, w = 40, vertical = false) => {
  const n = 6, s = w / n; let d = vertical ? `M${x},${y}` : `M${x},${y}`;
  for (let i = 0; i < n; i++) d += vertical ? ` L${x + (i % 2 ? -7 : 7)},${n1(y + s * (i + 0.5))}` : ` L${n1(x + s * (i + 0.5))},${y + (i % 2 ? 7 : -7)}`;
  return pa(d + (vertical ? ` L${x},${y + w}` : ` L${x + w},${y}`), 'a', 'fn', 2.2);
};
const battery = (x, y, vertical = true) => vertical
  ? ln(x - 12, y - 4, x + 12, y - 4, 'k', 2.5) + ln(x - 6, y + 4, x + 6, y + 4, 'k', 4) + tx(x + 18, y - 4, '+', 'a') + tx(x + 14, y + 10, '−', 'b')
  : ln(x - 4, y - 12, x - 4, y + 12, 'k', 2.5) + ln(x + 4, y - 6, x + 4, y + 6, 'k', 4);
const lensShape = (x, y, h, conv = true) => conv
  ? pa(`M${x},${y - h} Q${x + 14},${y} ${x},${y + h} Q${x - 14},${y} ${x},${y - h} Z`, 'b', 'fw', 1.8)
  : pa(`M${x - 8},${y - h} L${x + 8},${y - h} Q${x},${y} ${x + 8},${y + h} L${x - 8},${y + h} Q${x},${y} ${x - 8},${y - h} Z`, 'b', 'fw', 1.8);
const tree = (x, y, h) => re(x - 3, y - h * 0.35, 6, h * 0.35, 'k', 'fs', 0, 1) + pa(`M${x},${y - h} L${x + h * 0.28},${y - h * 0.3} L${x - h * 0.28},${y - h * 0.3} Z`, 'g', 'fg', 1.5);
const sun = (x, y, r = 16) => { let h = ci(x, y, r, 'a', 'fa', 1.5); for (let k = 0; k < 8; k++) { const [a1, b1] = P(x, y, r + 4, k * 45), [a2, b2] = P(x, y, r + 11, k * 45); h += ln(a1, b1, a2, b2, 'a', 2); } return h; };
const nucleus = (x, y, n = 7, r = 5) => { let h = ''; for (let i = 0; i < n; i++) { const [a, b] = P(x, y, i ? r * 1.6 : 0, i * 360 / (n - 1)); h += ci(a, b, r, 'k', i % 2 ? 'fb' : 'fa', 1); } return h; };
const thermometer = (x, y, h, fill, lab) => re(x - 6, y - h, 12, h, 'k', 'fp', 6, 1.5) + ci(x, y + 6, 10, 'k', 'fr', 1.5) + re(x - 2.5, y - fill, 5, fill + 4, 'n', 'fr', 2) + tx(x, y + 30, lab);
const beaker = (x, y, w, h, level = 0.6, f = 'fw') => re(x + 2, y + h * (1 - level), w - 4, h * level - 2, 'n', f) + pa(`M${x},${y} L${x},${y + h} L${x + w},${y + h} L${x + w},${y}`, 'k', 'fn', 2);
const flame = (x, y) => pa(`M${x},${y} Q${x - 14},${y - 14} ${x - 4},${y - 30} Q${x},${y - 18} ${x + 6},${y - 34} Q${x + 16},${y - 14} ${x},${y} Z`, 'a', 'fh', 1.5);
const plusminus = (x, y, sign) => sign > 0 ? ln(x - 4, y, x + 4, y, 'a', 2) + ln(x, y - 4, x, y + 4, 'a', 2) : ln(x - 4, y, x + 4, y, 'b', 2);
const charge = (x, y, r, sign, lab) => ci(x, y, r, sign > 0 ? 'a' : 'b', sign > 0 ? 'fh' : 'fw', 2) + plusminus(x, y, sign) + tx(x, y + r + 14, lab);
const xfield = (x1, y1, x2, y2, gap = 24, sym = '×') => { let h = ''; for (let x = x1; x <= x2; x += gap) for (let y = y1; y <= y2; y += gap) h += tx(x, y + 4, sym, 's'); return h; };
const axes = (x0, y0, w, h, lx, ly) => ar(x0, y0, x0 + w, y0, 'k', lx, x0 + w - 2, y0 + 16, 'end') + ar(x0, y0, x0, y0 - h, 'k', ly, x0 + 6, y0 - h + 10, 'start');

/* =================================================================
   DESENHOS
   ================================================================= */
const D = {};

/* ---------- Mecânica ---------- */
D.carro = p => svg(ground(10, 290, 130) + car(40, 130) + ar(140, 102, 205, 102, 'a', p.v || 'v', 212, 106)
  + (p.a ? (p.a[0] === '−' ? ar(190, 78, 140, 78, 'b', p.a, 133, 82, 'end') : ar(140, 78, 190, 78, 'b', p.a, 197, 82)) : '') + (p.d ? dim(40, 148, 260, 148, p.d, 0, -5) : '') + tx(60, 30, p.t || '', 's', 'start'));
D.encontro = p => svg(ground(10, 290, 130) + car(20, 130) + car(190, 130) + ar(55, 66, 100, 66, 'a', p.va || 'v_A', 55, 58, 'start') + ar(245, 66, 200, 66, 'b', p.vb || 'v_B', 245, 58, 'end')
  + dim(20, 148, 280, 148, p.d || 'd', 0, -5));
D.queda = p => svg(re(30, 25, 50, 115, 'k', 'fs', 2) + ground(10, 290, 140) + ball(110, 30) + ln(110, 40, 110, 128, 's', 1.5, '4 5')
  + ar(110, 108, 110, 136, 'a', p.v || 'v', 118, 128) + dim(160, 30, 160, 140, p.h || 'h', 18, 4) + tx(210, 40, p.t || '', 's', 'start'));
D.vertical = p => svg(ground(10, 290, 140) + person(80, 140) + ball(150, 128) + ln(150, 118, 150, 34, 's', 1.5, '4 5') + ball(150, 28, 6, 'fp')
  + ar(160, 120, 160, 70, 'a', p.v || 'v₀', 168, 90) + tx(150, 18, 'v = 0', 's') + dim(205, 28, 205, 128, p.h || 'H', 22, 4) + tx(250, 140 - 4, p.t || '', 's', 'start'));
D.horizontal = p => svg(re(50, 40, 50, 100, 'k', 'fs', 2) + ground(10, 290, 140) + ball(100, 34) + pa('M100,34 Q175,34 255,136', 's', 'fn', 1.5, '4 5')
  + ar(108, 34, 150, 34, 'a', p.v || 'v₀', 155, 30) + dim(36, 34, 36, 140, p.h || 'h', -1, 0) + dim(100, 154, 255, 154, p.A || 'A', 0, -4));
D.obliquo = p => { const th = (p.ang || 50) * Math.PI / 180, v = 20, g = 10, Rng = v * v * Math.sin(2 * th) / g, K = 220 / Rng, x0 = 40, y0 = 135, N = 80;
  const T = 2 * v * Math.sin(th) / g, Hp = K * (v * Math.sin(th)) ** 2 / (2 * g), xa = x0 + K * v * Math.cos(th) * T / 2;
  let d = ''; for (let i = 0; i <= N; i++) { const t = T * i / N, x = x0 + K * v * Math.cos(th) * t, y = y0 - K * (v * Math.sin(th) * t - g * t * t / 2); d += (i ? 'L' : 'M') + n1(x) + ',' + n1(y) + ' '; }
  let w = '';
  if (p.wall) { const wx = x0 + K * p.wall, wy = y0 - K * p.wallY; w = ln(wx, y0, wx, y0 - 80, 'k', 3) + ln(x0, wy, wx, wy, 's', 1, '3 3') + dim(wx + 12, y0, wx + 12, wy, p.H || '', 0, 0); }
  return svg(ground(10, 290, y0) + pa(d, 's', 'fn', 1.5, '4 5') + w + ar(x0, y0, x0 + 40 * Math.cos(th), y0 - 40 * Math.sin(th), 'a', p.v || 'v₀')
    + arc(x0, y0, 26, 0, p.ang || 50, p.th || 'θ') + ball(xa, y0 - Hp, 6)
    + (p.H && !p.wall ? dim(xa + 16, y0, xa + 16, y0 - Hp, p.H, 0, 0) : '') + (p.A && !p.wall ? dim(x0, 152, x0 + K * Rng, 152, p.A, 0, -4) : '')
    + (p.wall ? tx(x0 + K * p.wall - 6, 150, p.A || '', 's', 'end') : '')); };
D.grafico = p => svg(axes(40, 135, 240, 120, p.x || 't (s)', p.y || 'v (m/s)') + pa(`M40,135 L220,${p.flat ? 75 : 45} L220,135 Z`, 'n', 'fh')
  + ln(40, 135, 220, p.flat ? 75 : 45, 'a', 2.5) + ln(220, 135, 220, p.flat ? 75 : 45, 's', 1, '3 3') + tx(220, 150, p.tx || '', 's') + tx(32, p.flat ? 79 : 49, p.ty || '', 's', 'end')
  + tx(150, 118, p.area || 'área = Δs', 'a'));
D.vetores = p => { const t = p.ang || 60, [bx, by] = P(60, 125, 95, t);
  return svg(ar(60, 125, 190, 125, 'b', p.a || 'a', 195, 129) + ar(60, 125, bx, by, 'g', p.b || 'b', bx - 4, by - 6, 'end') + ln(190, 125, 190 + bx - 60, by, 's', 1.2, '4 4') + ln(bx, by, 190 + bx - 60, by, 's', 1.2, '4 4')
  + ar(60, 125, 190 + bx - 60, by, 'a', p.R || 'R', 190 + bx - 52, by - 2) + arc(60, 125, 24, 0, t, p.th || 'θ', 'k')); };
D.componentes = p => { const t = p.ang || 37, [ex, ey] = P(50, 135, 190, t);
  return svg(axes(50, 135, 240, 125, 'x', 'y') + ar(50, 135, ex, ey, 'a', p.a || 'a', ex + 4, ey + 4) + ln(ex, ey, ex, 135, 's', 1.2, '4 4') + ln(ex, ey, 50, ey, 's', 1.2, '4 4')
  + ar(50, 135, ex, 135, 'b', p.ax || 'aₓ', (50 + ex) / 2, 150, 'middle') + ar(50, 135, 50, ey, 'g', p.ay || 'a_y', 44, (135 + ey) / 2, 'end') + arc(50, 135, 30, 0, t, 'θ', 'k')); };
D.circulo = p => { const px = 212, py = 82, [rx, ry] = P(150, 82, 62, 150);
  return svg(ci(150, 82, 62, 's', 'fn', 1.5) + ci(150, 82, 3, 'k', 'fk') + ln(150, 82, rx, ry, 'k', 1.5, '4 3') + tx(rx - 6, ry - 6, p.R || 'R', 'k', 'end')
  + ar(px, py, px, py - 52, 'a') + tx(px + 5, py - 40, p.v || 'v', 'a', 'start', 11) + (p.noacp ? '' : ar(px, py, px - 42, py, 'b', p.acp || 'a_cp', 150, 104, 'middle')) + ball(px, py, 7) + tx(296, 152, p.t || '', 's', 'end')); };
D.meiaVolta = p => svg(ci(150, 80, 60, 's', 'fn', 1.5, '4 4') + pa('M90,80 A60,60 0 0 1 210,80', 'a', 'fn', 2.5) + ball(90, 80, 6, 'fp') + ball(210, 80, 6) + ar(96, 92, 204, 92, 'b', p.dr || 'Δr', 150, 108, 'middle')
  + tx(150, 12, p.arco || 'arco = πR', 'a') + ci(150, 80, 2.5, 'k', 'fk') + tx(296, 152, p.t || '', 's', 'end'));
D.disco = p => { let h = ci(150, 80, 58, 'k', 'fp', 2) + ci(150, 80, 6, 'k', 'fk'); for (let k = 0; k < 6; k++) { const [x, y] = P(150, 80, 54, k * 60 + 15); h += ln(150, 80, x, y, 's', 1.5); }
  return svg(h + arc(150, 80, 72, 20, 140, '', 'a') + ar(...P(150, 80, 72, 130), ...P(150, 80, 72, 142), 'a') + tx(150, 156, p.f || 'f', 'a') + tx(6, 16, p.t || '', 's', 'start')); };
D.correia = p => svg(ci(90, 82, 46, 'k', 'fp') + ci(90, 82, 4, 'k', 'fk') + ci(225, 82, 20, 'k', 'fp') + ci(225, 82, 3, 'k', 'fk') + ln(90, 36, 225, 62, 'a', 2) + ln(90, 128, 225, 102, 'a', 2)
  + dim(90, 82, 90, 36, p.Ra || 'R_A', -16, 4) + dim(225, 82, 225, 62, '', 0, 0) + tx(225, 50, p.Rb || 'R_B', 's') + tx(90, 150, p.fa || 'f_A') + tx(225, 150, p.fb || 'f_B'));
D.eixo = p => svg(ci(150, 82, 62, 'k', 'fp') + ci(150, 82, 18, 'a', 'fh') + ci(150, 82, 3, 'k', 'fk') + dim(168, 82, 212, 82, p.R || 'R', 0, 6) + tx(150, 124, p.r || 'catraca', 'a') + tx(150, 158, p.t || 'mesmo eixo: mesma ω', 's'));
D.trem = p => svg(ground(10, 290, 135) + re(30, 55, 230, 66, 'k', 'fp', 6) + [55, 105, 155, 205].map(x => re(x, 66, 32, 22, 's', 'fw', 2, 1)).join('') + ci(70, 127, 8, 'k', 'fk') + ci(220, 127, 8, 'k', 'fk')
  + person(150, 118) + ar(165, 100, 200, 100, 'b', p.u || 'v_rel', 205, 104) + ar(110, 40, 190, 40, 'a', p.v || 'v_trem', 196, 44));
D.rio = p => svg(re(0, 30, 300, 100, 'n', 'fw') + ln(0, 30, 300, 30, 'k', 2) + ln(0, 130, 300, 130, 'k', 2) + [60, 150, 240].map(x => ar(x - 20, 112, x + 20, 112, 's')).join('')
  + pa('M95,130 l12,-14 l12,14 z', 'k', 'fp') + ar(107, 124, 107, 62, 'b', p.vb || 'v_barco', 100, 70, 'end') + ar(107, 124, 155, 124, 'g', p.vc || 'v_c', 160, 120) + ar(107, 124, 155, 62, 'a', p.vr || 'v', 160, 64)
  + dim(18, 30, 18, 130, p.L || 'L', 14, 4) + tx(250, 20, p.t || '', 's'));
D.blocoForca = p => { const t = p.ang ?? 30, usa = [[p.F, p.Fv], [p.f, p.fv], [p.N, p.Nv], [p.P, p.Pv]].filter(([r]) => r);
  const kk = usa.every(([, v]) => v != null) ? 40 / Math.max(...usa.map(([, v]) => v)) : null, L = (v, d) => (kk != null ? v * kk : d);
  const FL = L(p.Fv, 75), fL = L(p.fv, 50), NL = L(p.Nv, 45), PL = L(p.Pv, 44);
  return svg(ground(10, 290, 135) + blk(110, 90, 70, 45, p.m || 'm')
    + (t < 20 ? ar(180, 112, 180 + FL, 112, 'a', p.F || 'F', 180 + FL, 102, 'end') : ar(180, 112, 180 + FL * Math.cos(rad(t)), 112 - FL * Math.sin(rad(t)), 'a', p.F || 'F'))
    + (t ? arc(180, 112, 22, 0, t, 'α', 'k') + ln(180, 112, 215, 112, 's', 1, '3 3') : '')
    + (p.f ? ar(110, 131, 110 - fL, 131, 'r', p.f, 106 - fL, 127, 'end') : '')
    + (p.N ? ar(145, 90, 145, 90 - NL, 'g', p.N, 151, 90 - NL / 2) : '')
    + (p.P ? ar(145, 112, 145, 112 + PL, 'b', p.P, 151, 112 + PL) : '')
    + (p.d ? dim(110, 150, 260, 150, p.d, 0, -4) : '')); };
D.peso = p => svg(ground(10, 290, 120) + blk(120, 70, 60, 50, p.m || 'm') + ar(150, 95, 150, 150, 'b', p.P || 'P = mg', 158, 150) + ar(150, 70, 150, 15, 'g', p.N || 'N', 158, 22) + tx(250, 40, p.t || '', 's'));
D.acaoReacao = p => svg(ground(10, 290, 130) + blk(80, 80, 60, 50, 'A') + blk(140, 90, 50, 40, 'B') + ar(140, 105, 190, 105, 'a', 'F_A→B', 196, 109) + ar(140, 115, 90, 115, 'b', 'F_B→A', 84, 119, 'end'));
D.pendurado = p => { const kk = p.Tv ? 40 / p.Tv : null, PL = kk && p.Pv ? p.Pv * kk : 33;
  return svg(ceiling(90, 210, 18) + ln(150, 18, 150, 82, 'k', 2) + blk(120, 82, 60, 40, p.m || 'm') + ar(150, 82, 150, 42, 'a', p.T || 'T', 158, 50)
    + ar(150, 122, 150, 122 + PL, 'b', p.P || 'P', 158, 122 + PL) + (p.a ? ar(220, 120, 220, 80, 'g', p.a, 228, 92) : '')); };
D.mola = p => svg(ground(10, 290, 130) + wall(30, 60, 130, -1) + spring(30, 105, 150, 9, 9) + blk(150, 80, 55, 50, p.m || 'm') + ln(118, 60, 118, 132, 's', 1, '3 3')
  + dim(118, 70, 150, 70, p.x || 'x', 0, -6) + ar(205, 105, 260, 105, 'a', p.F || 'F', 262, 100) + tx(118, 52, 'natural', 's') + tx(150, 155, p.k || 'k', 's'));
D.plano = p => { const th = p.ang || 30, x0 = 40, y0 = 140, L = Math.min(220, 118 / Math.tan(rad(th))), [xt, yt] = [x0 + L, y0 - L * Math.tan(rad(th))];
  const a = Math.atan2(yt - y0, xt - x0), cx = x0 + 150 * Math.cos(a), cy = y0 + 150 * Math.sin(a), bw = 44, bh = 28, ux = Math.cos(a), uy = Math.sin(a), nx = uy, ny = -ux;
  const pts = [[cx - ux * bw / 2, cy - uy * bw / 2], [cx + ux * bw / 2, cy + uy * bw / 2], [cx + ux * bw / 2 + nx * bh, cy + uy * bw / 2 + ny * bh], [cx - ux * bw / 2 + nx * bh, cy - uy * bw / 2 + ny * bh]];
  const mx = cx + nx * bh / 2, my = cy + ny * bh / 2;
  const kk = p.Pv ? 52 / p.Pv : null, tL = kk && p.Ptv != null ? p.Ptv * kk : 40, nL = kk && p.Nv != null ? p.Nv * kk : 40;
  return svg(pa(`M${x0},${y0} L${n1(xt)},${y0} L${n1(xt)},${n1(yt)} Z`, 'k', 'fs', 2) + `<polygon points="${pts.map(q => q.map(n1).join(',')).join(' ')}" class="k fp" stroke-width="2"/>`
    + ar(mx, my, mx, my + 52, 'b', p.P || 'P', mx + 6, my + 52) + ar(mx, my, mx - ux * tL, my - uy * tL, 'a', p.Pt || 'P sen θ', mx - ux * tL - 4, my - uy * tL + 14, 'end')
    + ar(mx, my, mx + nx * nL, my + ny * nL, 'g', p.N || 'N', mx + nx * nL + 4, my + ny * nL) + arc(x0, y0, 34, 0, th, p.th || 'θ', 'k')); };
D.blocos = p => svg(ground(10, 290, 130) + blk(110, 85, 60, 45, p.A || 'A') + blk(170, 95, 50, 35, p.B || 'B') + ar(50, 107, 108, 107, 'a', p.F || 'F', 50, 98, 'start') + tx(170, 70, p.t || '', 's'));
D.mesaPolia = p => svg(re(20, 70, 210, 8, 'k', 'fs', 0) + ln(30, 78, 30, 150, 'k', 2) + ln(215, 78, 215, 150, 'k', 2)
  + re(70, 38, 60, 32, 'k', 'fp', 3) + tx(100, 42, p.A || 'A · 3 kg', 'k')                       // bloco A sobre a mesa lisa
  + ar(100, 38, 100, 8, 'g', 'N = 30 N', 106, 20, 'start') + ar(100, 62, 100, 92, 'b', 'P_A = 30 N', 106, 92, 'start')   // normal e peso de A (1 px = 1 N)
  + ar(130, 60, 142, 60, 'a', 'T = 12 N', 146, 64, 'start')                                        // tração de A, para a polia
  + ci(238, 70, 10, 'k', 'fp') + ln(130, 54, 236, 54, 'k', 1.5) + ln(248, 70, 248, 110, 'k', 1.5)  // corda e polia
  + re(228, 110, 40, 32, 'k', 'fp', 3) + tx(248, 130, p.B || 'B · 2 kg', 'k')                     // bloco B pendurado
  + ar(238, 126, 238, 112, 'a', '', 0, 0) + tx(226, 150, 'T = 12 N', 'a', 'end')                  // tração de B, para cima
  + ar(262, 142, 262, 162, 'b', 'P_B = 20 N', 268, 172, 'start')                                  // peso de B
  + tx(20, 186, 'a = 4 m/s²', 's', 'start'), 300, 190); 

D.atwood = p => { const k = 40 / 30;   // m₁ (3 kg) desce: fica mais embaixo; 30 N → 40 px
  return svg(ceiling(110, 190, 14) + ln(150, 14, 150, 22, 'k', 2) + ci(150, 36, 14, 'k', 'fp') + ci(150, 36, 3, 'k', 'fk')
    + ln(136, 36, 136, 96, 'k', 1.5) + ln(164, 36, 164, 58, 'k', 1.5)
    + re(100, 96, 40, 28, 'k', 'fp', 2) + tx(120, 114, p.m1 || 'm₁', 'k') + re(160, 58, 36, 26, 'k', 'fp', 2) + tx(178, 74, p.m2 || 'm₂', 'k')
    + ar(108, 110, 108, 110 - 24 * k, 'a', 'T = 24 N', 100, 70, 'end') + ar(126, 110, 126, 110 + 30 * k, 'b', 'P₁ = 30 N', 132, 150)
    + ar(170, 71, 170, 71 - 24 * k, 'a', 'T = 24 N', 176, 44, 'start') + ar(186, 71, 186, 71 + 20 * k, 'b', 'P₂ = 20 N', 192, 104)
    + tx(292, 152, 'a = 2 m/s²', 's', 'end')); };

D.elevador = p => { const k = 40 / 840;
  return svg(ln(150, 0, 150, 18, 'k', 2) + re(95, 18, 110, 130, 'k', 'fp', 3) + re(130, 136, 40, 8, 's', 'fs', 1, 1) + person(150, 136) + tx(150, 158, 'balança', 's')
    + ar(178, 124, 178, 124 - 840 * k, 'g', 'N = 840 N', 184, 84, 'start') + ar(194, 124, 194, 124 + 700 * k, 'b', 'P = 700 N', 200, 152, 'start')
    + ar(272, 110, 272, 50, 'a', 'a = 2 m/s²', 266, 44, 'end') + tx(60, 40, p.t || '', 's')); };

D.curva = p => { const [cx, cy] = [150, 175]; let road = pa(`M${n1(P(cx, cy, 150, 160)[0])},${n1(P(cx, cy, 150, 160)[1])} A150,150 0 0 1 ${n1(P(cx, cy, 150, 20)[0])},${n1(P(cx, cy, 150, 20)[1])}`, 's', 'fn', 26);
  return svg(road + pa(`M${n1(P(cx, cy, 150, 160)[0])},${n1(P(cx, cy, 150, 160)[1])} A150,150 0 0 1 ${n1(P(cx, cy, 150, 20)[0])},${n1(P(cx, cy, 150, 20)[1])}`, 'k', 'fn', 1, '6 6')
    + re(135, 18, 30, 16, 'k', 'fa', 4) + ar(166, 26, 215, 30, 'b', p.v || 'v', 220, 34) + ar(150, 36, 150, 92, 'a', p.F || 'F_cp', 156, 84) + tx(60, 150, p.R || 'R', 's')
    + (p.t ? tx(250, 150, p.t, 's') : '')); };
D.loop = p => svg(ground(10, 290, 140) + ci(150, 78, 58, 'k', 'fn', 3) + pa('M20,140 Q120,140 150,136', 'k', 'fn', 3) + re(136, 12, 28, 14, 'k', 'fa', 4) + ar(150, 26, 150, 60, 'b', 'P', 156, 56) + ar(166, 18, 200, 18, 'a', p.v || 'v', 204, 22)
  + dim(150, 78, 208, 78, p.R || 'R', 0, -6));
D.rampa = p => svg(ground(10, 290, 140) + pa('M72,30 Q86,138 190,138 L290,138', 'k', 'fn', 3) + ball(77, 26, 7) + ar(200, 128, 250, 128, 'a', p.v || 'v', 250, 118, 'end') + dim(60, 26, 60, 138, p.h || 'h', -1, 0)
  + tx(96, 26, p.t || '', 's', 'start') + (p.atr ? tx(150, 104, p.atr, 'r') : ''));
D.guincho = p => svg(ground(10, 290, 140) + re(120, 10, 60, 24, 'k', 'fs', 3) + tx(150, 27, 'motor', 'k', 'middle', 11) + ln(150, 34, 150, 70, 'k', 1.5) + blk(125, 70, 50, 34, p.m || 'm') + ar(195, 105, 195, 60, 'a', 'v cte', 201, 70)
  + dim(240, 104, 240, 140, '', 0, 0) + dim(240, 28, 240, 140, p.h || 'h', 18, 4) + tx(70, 60, p.t || '', 's'));
D.sankey = p => svg(pa('M10,50 L120,50 L120,110 L10,110 Z', 'n', 'fh') + pa('M120,50 L200,50 Q240,50 270,60 L270,90 Q240,90 200,90 L200,110 L120,110 Z', 'n', 'fh')
  + pa('M120,90 L200,90 Q225,90 225,120 L225,150 L190,150 L190,120 Q190,110 175,110 L120,110 Z', 'n', 'fs') + re(110, 40, 30, 80, 'k', 'fp', 4) + tx(125, 84, '⚙', 'k')
  + tx(55, 84, p.tot || 'P total', 'a') + tx(215, 76, p.util || 'útil', 'k') + tx(235, 145, p.diss || 'dissipada', 's', 'start'));
D.parede = p => svg(wall(250, 20, 140, 1) + ball(140, 60, 9) + ar(70, 60, 125, 60, 'a', p.v1 || 'v', 70, 50, 'start') + (p.v2 === '' ? '' : ball(140, 115, 9) + ar(125, 115, 70, 115, 'b', p.v2 || 'v′', 70, 105, 'start') + tx(30, 119, 'depois', 's', 'start')) + tx(30, 64, p.v2 === '' ? '' : 'antes', 's', 'start')
  + tx(200, 150, p.t || '', 's'));
D.quique = p => svg(ground(10, 290, 135) + ball(110, 50, 9) + ar(110, 62, 110, 118, 'a', p.v1 || 'v', 118, 100) + ball(190, 60, 9, 'fp') + ar(190, 118, 190, 75, 'b', p.v2 || 'v′', 198, 90) + pa('M110,62 Q150,165 190,72', 's', 'fn', 1, '4 4'));
D.recuo = p => svg(ground(10, 290, 135) + pa('M70,90 L190,90 L190,100 L120,100 L100,125 L80,125 L90,100 L70,100 Z', 'k', 'fs', 2) + ball(222, 95, 4, 'fk') + ar(232, 95, 280, 95, 'a', p.vb || 'v_bala', 280, 82, 'end')
  + ar(68, 95, 25, 95, 'b', p.vr || 'v_recuo', 22, 82, 'start') + tx(150, 150, 'Q antes = Q depois = 0', 's'));
D.colisao = p => { const cart = (x, y, w, lab, f) => re(x, y - 26, w, 22, 'k', f, 3) + ci(x + 9, y - 3, 4, 'k', 'fk') + ci(x + w - 9, y - 3, 4, 'k', 'fk') + tx(x + w / 2, y - 11, lab, 'k', 'middle', 11);
  return svg(ln(10, 70, 290, 70, 'k', 1.5) + ln(10, 140, 290, 140, 'k', 1.5) + tx(14, 20, 'antes', 's', 'start') + tx(14, 90, 'depois', 's', 'start')
    + cart(60, 70, 50, p.ma || 'A', 'fh') + ar(114, 57, 150, 57, 'a', p.va || 'v_A', 132, 47, 'middle') + cart(180, 70, 50, p.mb || 'B', 'fw') + (p.vb ? ar(232, 57, 270, 57, 'b', p.vb, 251, 47, 'middle') : tx(205, 36, 'parado', 's'))
    + (p.juntos ? cart(140, 140, 100, (p.ma || 'A') + ' + ' + (p.mb || 'B'), 'fs') + ar(244, 127, 282, 127, 'a', p.v || 'v′', 263, 108, 'middle')
      : cart(60, 140, 50, p.ma || 'A', 'fh') + (p.vaa && p.vaa.startsWith('−') ? ar(56, 127, 22, 127, 'a', p.vaa, 39, 108, 'middle') : ar(114, 127, 150, 127, 'a', p.vaa || 'v′_A', 132, 108, 'middle'))
        + cart(180, 140, 50, p.mb || 'B', 'fw') + ar(232, 127, 270, 127, 'b', p.vbb || 'v′_B', 251, 108, 'middle'))); };
D.massas = p => svg(ci(70, 80, 34, 'k', 'fs') + ci(240, 80, 18, 'k', 'fs') + tx(70, 84, p.M || 'M') + tx(240, 84, p.m || 'm') + ar(104, 80, 150, 80, 'a', 'F', 150, 72, 'end') + ar(222, 80, 176, 80, 'a', 'F', 176, 72, 'start')
  + dim(70, 135, 240, 135, p.d || 'd', 0, -5));
D.altitude = p => svg(pa('M0,160 Q150,60 300,160 Z', 'k', 'fw', 2) + tx(150, 140, p.planeta || 'Terra', 'b') + ci(150, 110, 3, 'k', 'fk') + ball(150, 28, 7) + ar(150, 38, 150, 70, 'a', p.g || 'g', 142, 64, 'end')
  + dim(205, 28, 205, 112, p.h || 'h', 16, 4) + tx(60, 30, p.t || '', 's', 'start'));
// órbita elíptica com o Sol em um dos focos: a = semi-eixo maior, e = excentricidade; periélio à esquerda, afélio à direita
D.orbita = p => { const circ = !!p.circ, a = circ ? 66 : (p.a || 72), e = circ ? 0 : (p.e ?? 0.5), c = a * e, b = a * Math.sqrt(1 - e * e), cx = 150, cy = 80, F = cx - c;
  const peri = [cx - a, cy], afe = [cx + a, cy];
  return svg(el(cx, cy, a, b, 's', 'fn', 1.5, circ ? '' : '5 5') + sun(F, cy, 13)
    + (circ ? ci(cx + a, cy, 8, 'b', 'fw', 2) + dim(cx, cy, cx + a - 9, cy, p.r || 'r', 0, 16) + tx(F, cy + 34, p.astro || 'Sol', 'a')
      : ci(peri[0], peri[1], 6, 'b', 'fw', 2) + ci(afe[0], afe[1], 8, 'b', 'fw', 2) + ar(afe[0], cy - 10, afe[0], cy - 48, 'a', p.v || 'v', afe[0] + 6, cy - 40)
        + tx(afe[0], cy + 26, p.af || 'afélio', 's') + tx(peri[0] + 2, cy + 42, p.peri || 'periélio', 's', 'start') + tx(F, cy - 22, p.astro || 'Sol', 'a'))
    + tx(150, 156, p.t || '', 's')); };
D.sinodico = p => svg(sun(150, 80, 12) + ci(150, 80, 40, 's', 'fn', 1.2) + ci(150, 80, 70, 's', 'fn', 1.2) + ci(190, 80, 6, 'b', 'fw') + ci(220, 80, 7, 'r', 'fr') + ln(150, 80, 226, 80, 's', 1, '3 3')
  + tx(190, 66, p.a || 'Terra', 'b', 'middle', 11) + tx(236, 66, p.b || 'Marte', 'r', 'start', 11) + tx(150, 156, p.t || 'alinhamento a cada S', 's'));
D.escape = p => svg(pa('M0,160 Q150,80 300,160 Z', 'k', 'fw', 2) + pa('M144,118 L150,96 L156,118 Z', 'k', 'fp', 1.5) + ar(150, 92, 150, 30, 'a', p.v || 'v_e', 158, 40) + tx(150, 150, p.planeta || 'Terra', 'b') + tx(6, 16, p.t || '', 's', 'start'));
D.luminaria = p => svg(ceiling(30, 270, 18) + ln(60, 18, 150, 70, 'k', 1.5) + ln(240, 18, 150, 70, 'k', 1.5) + pa('M135,70 L165,70 L175,95 L125,95 Z', 'k', 'fh', 2) + ar(150, 95, 150, 145, 'b', p.P || 'P', 158, 140)
  + ar(150, 70, 112, 48, 'a', p.T || 'T', 104, 50, 'end') + ar(150, 70, 188, 48, 'a', p.T || 'T', 196, 50) + arc(60, 18, 30, -30, 0, p.th || '30°', 'k'));
D.chave = p => svg(pa('M60,70 l14,-8 l14,8 l0,16 l-14,8 l-14,-8 z', 'k', 'fs', 2) + re(80, 72, 160, 12, 'k', 'fp', 6) + ci(74, 78, 4, 'k', 'fk') + ar(232, 84, 232, 140, 'a', p.F || 'F', 240, 132) + dim(74, 52, 232, 52, p.b || 'braço b', 0, -6));
D.gangorra = p => svg(pa('M150,112 L132,140 L168,140 Z', 'k', 'fs', 2) + ground(80, 220, 140) + ln(30, 112, 270, 112, 'k', 4) + person(p.x1 || 60, 110) + person(p.x2 || 210, 110) + ar(p.x1 || 60, 116, p.x1 || 60, 150, 'b', p.P1 || 'P₁', (p.x1 || 60) + 6, 150)
  + ar(p.x2 || 210, 116, p.x2 || 210, 150, 'b', p.P2 || 'P₂', (p.x2 || 210) + 6, 150) + dim(p.x1 || 60, 18, 150, 18, p.b1 || 'b₁', 0, -5) + dim(150, 18, p.x2 || 210, 18, p.b2 || 'b₂', 0, -5));
D.alavanca = p => svg(pa('M100,110 L88,132 L112,132 Z', 'k', 'fs', 2) + ground(20, 280, 132) + ln(30, 104, 270, 98, 'k', 5) + blk(28, 66, 46, 34, p.R || 'carga') + ar(262, 70, 262, 96, 'a', p.F || 'F', 268, 80)
  + dim(51, 150, 100, 150, p.br || 'b_r', 0, -5) + dim(100, 150, 262, 150, p.bp || 'b_p', 0, -5));
D.polias = p => svg(ceiling(40, 260, 12) + ci(110, 40, 15, 'k', 'fp') + ln(95, 12, 95, 40, 'k', 1.5) + ln(125, 40, 125, 75, 'k', 1.5) + ci(140, 85, 15, 'k', 'fp') + ln(155, 12, 155, 85, 'k', 1.5) + ln(140, 100, 140, 108, 'k', 1.5)
  + ci(175, 118, 12, 'k', 'fp') + ln(187, 12, 187, 118, 'k', 1.5) + ln(175, 130, 175, 136, 'k', 1.5) + blk(155, 136, 40, 22, p.P || 'P') + ln(95, 40, 95, 120, 'k', 1.5) + ar(95, 110, 95, 140, 'a', p.F || 'F', 88, 140, 'end')
  + tx(250, 80, p.n || 'n polias móveis', 's'));
D.stevin = p => svg(re(70, 20, 160, 125, 'k', 'fn', 2) + re(72, 40, 156, 103, 'n', 'fw') + ln(70, 40, 230, 40, 'b', 1.5) + ci(110, 110, 5, 'k', 'fa', 1.5) + tx(120, 114, p.ponto || 'p', 'a', 'start')
  + dim(250, 40, 250, 110, p.h || 'h', 14, 4) + tx(150, 32, p.p0 || 'p_atm', 's'));
D.prensa = p => svg(pa('M40,62 L40,140 L260,140 L260,78 L190,78 L190,110 L90,110 L90,62 Z', 'n', 'fw', 0)
  + pa('M40,40 L40,140 L260,140 L260,40 L190,40 L190,110 L90,110 L90,40 Z', 'k', 'fn', 2)
  + re(40, 52, 50, 10, 'k', 'fs', 1) + re(190, 68, 70, 10, 'k', 'fs', 1) + ar(65, 18, 65, 50, 'a', p.F1 || 'F₁', 72, 30)
  + re(200, 40, 50, 28, 'k', 'fp', 3) + tx(203, 58, p.carga || 'carro', 'k', 'start') + ar(246, 66, 246, 44, 'g')
  + tx(186, 58, 'F₂ = ' + (p.F2 || '?'), 'g', 'end') + tx(296, 18, 'figura sem escala', 's', 'end', 11)
  + tx(65, 156, p.A1 || 'A₁', 's') + tx(225, 156, p.A2 || 'A₂', 's'));
D.empuxo = p => svg(re(70, 15, 160, 135, 'k', 'fn', 2) + re(72, 35, 156, 113, 'n', 'fw') + ln(70, 35, 230, 35, 'b', 1.5) + blk(125, 70, 50, 40, p.m || 'corpo', 'fs') + ar(150, 70, 150, 46, 'g', p.E || 'E', 158, 54));
D.iceberg = p => svg(re(0, 60, 300, 100, 'n', 'fw') + ln(0, 60, 300, 60, 'b', 1.5) + pa('M120,60 L135,40 L160,46 L175,60 L210,95 L190,140 L120,148 L90,110 Z', 'k', 'fp', 2) + tx(150, 100, p.sub || 'parte submersa', 's') + tx(230, 40, p.t || '', 's'));
D.tuboU = p => svg(pa('M90,20 L90,140 Q90,150 100,150 L200,150 Q210,150 210,140 L210,20', 'k', 'fn', 2) + pa('M110,20 L110,130 L190,130 L190,20', 'k', 'fn', 2)
  + re(92, 70, 16, 80, 'n', 'fw') + re(108, 132, 84, 16, 'n', 'fw') + re(192, 51, 16, 99, 'n', 'fw') + re(92, 46, 16, 24, 'n', 'fh') + ln(70, 70, 230, 70, 's', 1, '3 3')
  + dim(78, 46, 78, 70, p.h1 || 'h₁', -12, 4) + dim(222, 51, 222, 70, '', 0, 0) + tx(250, 64, p.h2 || 'h₂', 's') + tx(100, 12, p.l1 || 'óleo', 'a') + tx(200, 12, p.l2 || 'água', 'b'));
D.cubo = p => svg(pa('M100,60 L170,60 L170,130 L100,130 Z', 'k', 'fp', 2) + pa('M100,60 L125,40 L195,40 L170,60 M195,40 L195,110 L170,130', 'k', 'fs', 2) + tx(135, 100, p.m || 'm') + tx(240, 90, p.V || 'V', 's'));
D.pressao = p => svg(ground(10, 290, 130) + re(115, 128, 70, 6, 'n', 'fh') + person(150, 128) + ar(150, 40, 150, 70, 'a', p.F || 'F', 158, 52) + tx(150, 152, p.A || 'área A', 'a'));

/* ---------- Termologia ---------- */
D.termometros = p => svg(thermometer(70, 120, 100, p.f1 || 55, p.l1 || '°C') + thermometer(150, 120, 100, p.f2 || 55, p.l2 || '°F') + thermometer(230, 120, 100, p.f3 || 55, p.l3 || 'K')
  + tx(70, 14, p.v1 || '', 'a') + tx(150, 14, p.v2 || '', 'a') + tx(230, 14, p.v3 || '', 'a'));
D.barra = p => svg(re(40, 40, 170, 16, 'k', 'fs', 2) + re(40, 92, 200, 16, 'k', 'fh', 2) + ln(40, 30, 40, 120, 's', 1, '3 3') + dim(40, 70, 210, 70, p.L0 || 'L₀', 0, -5) + dim(210, 122, 240, 122, p.dL || 'ΔL', 0, 16)
  + flame(150, 150) + tx(40, 34, p.t1 || 'θ₀', 's', 'start') + tx(40, 86, p.t2 || 'θ', 'a', 'start'));
D.chapa = p => svg(re(70, 35, 140, 90, 'k', 'fs', 2) + re(62, 28, 156, 104, 'a', 'fn', 2).replace('stroke-width="2"', 'stroke-width="1.5" stroke-dasharray="5 4"') + tx(140, 84, p.A || 'A₀') + tx(250, 30, p.dA || 'A₀ + ΔA', 'a'));
D.frasco = p => svg(pa('M110,30 L110,60 Q80,75 80,110 L80,140 L220,140 L220,110 Q220,75 190,60 L190,30', 'k', 'fn', 2) + re(82, 62, 136, 76, 'n', 'fw') + re(112, 28, 76, 34, 'n', 'fw') + pa('M188,30 Q205,30 205,50', 'b', 'fn', 2)
  + ci(205, 60, 4, 'b', 'fb') + flame(150, 160 - 4) + tx(296, 16, p.t || 'transborda', 'b', 'end'));
D.aquecimento = p => svg(beaker(100, 30, 100, 80, 0.65) + ln(85, 110, 215, 110, 'k', 3) + ln(100, 110, 90, 150, 'k', 2) + ln(200, 110, 210, 150, 'k', 2) + flame(150, 150) + thermometer(175, 85, 60, 40, '').replace(/<text[^>]*><\/text>/, '')
  + tx(6, 60, p.m || 'm', 'b', 'start') + tx(6, 80, p.t || 'θ₀ → θ', 's', 'start') + tx(296, 16, p.Q || 'Q', 'a', 'end'));
D.gelo = p => svg(ground(30, 270, 135) + re(110, 60, 70, 60, 'b', 'fw', 6) + pa('M100,135 Q145,124 200,135', 'b', 'fw', 1.5) + tx(145, 95, p.m || 'gelo') + ar(60, 40, 100, 70, 'a', p.Q || 'Q', 54, 38, 'end') + tx(240, 50, p.t || '0 °C', 's'));
D.mistura = p => svg(beaker(30, 40, 60, 70, 0.7, 'fh') + tx(60, 130, p.a || 'quente', 'k', 'middle', 10) + beaker(120, 40, 60, 70, 0.7, 'fw') + tx(150, 130, p.b || 'fria', 'k', 'middle', 10) + ar(190, 75, 220, 75, 'k') + beaker(230, 40, 60, 70, 0.85, 'fs') + tx(260, 130, p.e || 'θ_e', 'a'));
D.curvaAq = p => svg(axes(30, 140, 260, 128, 'Q', 'θ') + pa('M30,130 L60,105 L120,105 L150,70 L230,70 L250,40', 'a', 'fn', 2.5) + tx(90, 98, 'fusão', 's') + tx(190, 63, 'vaporização', 's') + tx(45, 125, 'gelo', 'b', 'start', 10)
  + tx(150, 90, 'água', 'b', 'end', 10) + tx(256, 40, 'vapor', 'b', 'start', 10));
D.paredeCalor = p => svg(re(120, 20, 60, 125, 'k', 'fs', 2) + re(20, 20, 98, 125, 'n', 'fh') + re(182, 20, 98, 125, 'n', 'fw') + ar(60, 82, 250, 82, 'a', p.phi || 'Φ', 250, 74, 'end') + dim(120, 152, 180, 152, p.L || 'L', 0, -4)
  + tx(60, 40, p.Tq || 'quente', 'a') + tx(240, 40, p.Tf || 'frio', 'b') + tx(150, 14, p.A || 'área A', 's'));
D.radiacao = p => { let h = ci(150, 80, 30, 'a', 'fh', 2); for (let k = 0; k < 8; k++) { const [x1, y1] = P(150, 80, 38, k * 45 + 22), [x2, y2] = P(150, 80, 70, k * 45 + 22); h += wavy(x1, y1, x2, y2, 'r'); }
  return svg(h + tx(150, 84, p.T || 'T') + tx(150, 156, p.t || '', 's')); };
D.gas = p => { let dots = ''; const pos = [[72, 78], [98, 70], [130, 84], [150, 72], [84, 100], [116, 106], [142, 112], [70, 124], [100, 130], [134, 132], [120, 92], [88, 116], [152, 96], [108, 82], [76, 92], [146, 128]]; pos.forEach(([x, y]) => { dots += ci(x, y, 2.5, 'n', 'fb'); });
  return svg(pa('M58,40 L58,140 L162,140 L162,40', 'k', 'fn', 2.5) + re(60, 50, 100, 10, 'k', 'fs', 1) + ln(110, 50, 110, 14, 'k', 3) + dots + (p.Q ? ar(8, 122, 52, 122, 'a', p.Q, 8, 112, 'start') : '') + (p.W ? ar(120, 32, 120, 8, 'g', p.W, 126, 18) : '')
    + tx(176, 70, p.a || 'p, V, T', 's', 'start') + tx(176, 92, p.b || '', 's', 'start') + tx(176, 114, p.c || '', 's', 'start') + (p.flame ? flame(110, 160) : '')); };
D.pv = p => { const path = p.ciclo ? 'M80,110 L80,50 L220,50 L220,110 Z' : p.iso ? 'M70,40 Q110,105 230,118' : 'M80,70 L220,70';
  return svg(axes(40, 140, 250, 128, 'V', 'p') + (p.ciclo ? pa(path, 'a', 'fh', 2.5) : pa(p.iso ? 'M70,40 Q110,105 230,118 L230,140 L70,140 Z' : 'M80,70 L220,70 L220,140 L80,140 Z', 'n', 'fh') + pa(path, 'a', 'fn', 2.5))
    + tx(150, p.ciclo ? 85 : 110, p.lab || 'área = τ', 'a') + tx(80, 154, p.v1 || 'V₁', 's') + tx(220, 154, p.v2 || 'V₂', 's') + (p.ciclo ? ar(150, 50, 160, 50, 'a') : '')); };
D.maquina = p => { const ref = p.ref;
  return svg(re(90, 6, 120, 30, 'a', 'fh', 6) + tx(150, 26, p.Tq || 'fonte quente') + ci(150, 82, 22, 'k', 'fp') + tx(150, 87, ref ? '❄' : '⚙') + re(90, 128, 120, 30, 'b', 'fw', 6) + tx(150, 148, p.Tf || 'fonte fria')
    + (ref ? ar(150, 58, 150, 38, 'a', p.Qq || 'Q_q', 158, 50) + ar(150, 126, 150, 106, 'b', p.Qf || 'Q_f', 158, 120) + ar(240, 82, 175, 82, 'g', p.W || 'τ', 244, 86)
      : ar(150, 38, 150, 58, 'a', p.Qq || 'Q_q', 158, 52) + ar(150, 106, 150, 126, 'b', p.Qf || 'Q_f', 158, 120) + ar(175, 82, 240, 82, 'g', p.W || 'τ', 244, 86)) + tx(6, 86, p.t || '', 'a', 'start')); };

/* ---------- Ondulatória ---------- */
D.mhs = p => svg(ground(10, 290, 130) + wall(30, 70, 130, -1) + spring(30, 108, 140, 8, 8) + blk(140, 88, 40, 40, 'm') + [100, 160, 220].map((x, i) => ln(x, 60, x, 136, 's', 1, '3 3') + tx(x, 54, ['−A', '0', '+A'][i], 's')).join('')
  + ar(185, 76, 230, 76, 'a', p.v || 'v', 234, 80) + tx(150, 155, p.t || '', 's'));
D.pendulo = p => svg(ceiling(110, 190, 14) + ln(150, 14, 196, 120, 'k', 1.5) + ln(150, 14, 150, 128, 's', 1, '3 3') + ball(196, 120, 10) + pa('M104,120 Q150,140 196,120', 's', 'fn', 1.2, '4 4') + dim(130, 14, 176, 120, p.L || 'L', -18, 0) + arc(150, 14, 30, -90, -66, 'θ', 'k')
  + tx(240, 40, p.t || '', 's'));
D.onda = p => svg(ln(20, 80, 290, 80, 's', 1, '3 3') + sine(20, 280, 80, 40, 120) + dim(50, 26, 170, 26, p.lambda || 'λ', 0, -6) + dim(230, 80, 230, 40, p.A || 'A', 14, 4) + ar(200, 142, 260, 142, 'a', p.v || 'v', 260, 132, 'end') + tx(6, 154, p.f || '', 's', 'start'));
D.som = p => { let h = re(16, 55, 22, 50, 'k', 'fs', 3) + pa('M38,62 L58,45 L58,115 L38,98 Z', 'k', 'fp', 2); for (let k = 0; k < 7; k++) h += re(75 + k * 32, 35, 10, 90, 'n', 'fb').replace('class="n fb"', 'class="n fb" opacity="0.55"');
  return svg(h + ar(200, 145, 270, 145, 'a', p.v || 'v', 196, 149, 'end') + dim(75, 22, 107, 22, p.lambda || 'λ', 0, -5) + tx(296, 14, p.t || '', 's', 'end')); };
D.pulso = p => svg(wall(250, 40, 130, 1) + ln(20, 85, 250, 85, 'k', 1.5) + pa('M60,85 Q80,85 90,55 Q100,85 120,85', 'a', 'fn', 2.5) + ar(130, 60, 170, 60, 'a', 'vai', 174, 64) + pa('M170,85 Q190,85 200,115 Q210,85 230,85', 'b', 'fn', 2, '4 3')
  + ar(170, 125, 130, 125, 'b', 'volta invertido', 124, 129, 'end'));
D.refracaoOnda = p => { let h = re(0, 0, 150, 160, 'n', 'fw') + ln(150, 0, 150, 160, 'k', 2) + tx(75, 152, p.m1 || 'fundo', 'b') + tx(225, 152, p.m2 || 'raso', 's');
  for (let k = 0; k < 5; k++) h += ln(20 + k * 28, 10, 20 + k * 28, 135, 'b', 2); for (let k = 0; k < 6; k++) h += ln(162 + k * 21, 10, 162 + k * 21, 135, 'a', 2);
  return svg(h + dim(20, 140 - 120, 48, 20, p.l1 || 'λ₁', 0, -6) + dim(162, 20, 183, 20, p.l2 || 'λ₂', 0, -6)); };
D.interferencia = p => { let h = ''; for (const sy of [55, 105]) for (let r = 20; r <= 140; r += 24) h += pa(`M${20},${sy - r} A${r},${r} 0 0 1 ${20},${sy + r}`.replace(/^M20/, `M20`), 'b', 'fn', 1.2).replace('class="b fn"', 'class="b fn" opacity="0.6"');
  return svg(h + ci(20, 55, 5, 'k', 'fa') + ci(20, 105, 5, 'k', 'fa') + tx(12, 50, 'S₁', 'k', 'end') + tx(12, 110, 'S₂', 'k', 'end') + ci(240, 70, 5, 'k', 'fk') + ln(20, 55, 240, 70, 's', 1, '3 3') + ln(20, 105, 240, 70, 's', 1, '3 3') + tx(250, 74, p.P || 'P', 'k', 'start')
    + tx(150, 152, p.t || 'Δx = |d₂ − d₁|', 's')); };
D.young = p => { let h = ln(90, 10, 90, 150, 'k', 3) + re(86, 62, 8, 8, 'n', 'fp') + re(86, 90, 8, 8, 'n', 'fp') + ln(250, 10, 250, 150, 'k', 2);
  for (let k = -3; k <= 3; k++) h += re(252, 80 + k * 18 - 4, 12, 8, 'n', k % 2 ? 'fs' : 'fa');
  for (let k = 0; k < 4; k++) h += ln(20 + k * 14, 30, 20 + k * 14, 130, 'a', 1.5); return svg(h + dim(100, 66, 100, 94, p.d || 'd', 14, 4) + dim(90, 156 - 4, 250, 152, p.D || 'D', 0, -5) + tx(285, 84, p.y || 'Δy', 'a', 'end')); };
D.cordaEst = p => { const n = p.n || 2; let up = '', dn = ''; for (let x = 40; x <= 260; x += 2) { const y = 40 * Math.sin(n * Math.PI * (x - 40) / 220); up += (x === 40 ? 'M' : 'L') + x + ',' + n1(80 - y) + ' '; dn += (x === 40 ? 'M' : 'L') + x + ',' + n1(80 + y) + ' '; }
  return svg(re(30, 40, 10, 80, 'k', 'fs', 1) + re(260, 40, 10, 80, 'k', 'fs', 1) + pa(up, 'a', 'fn', 2.2) + pa(dn, 'a', 'fn', 1.5, '4 4') + dim(40, 140, 260, 140, p.L || 'L', 0, -5) + tx(150, 22, p.t || 'nós nas pontas', 's')); };
D.tubo = p => { const closed = p.fechado; let up = '', dn = ''; for (let x = 40; x <= 260; x += 2) { const s = closed ? Math.sin(Math.PI / 2 * (x - 40) / 220) : Math.cos(Math.PI * (x - 40) / 220); up += (x === 40 ? 'M' : 'L') + x + ',' + n1(80 - 30 * s) + ' '; dn += (x === 40 ? 'M' : 'L') + x + ',' + n1(80 + 30 * s) + ' '; }
  return svg(ln(40, 40, 260, 40, 'k', 3) + ln(40, 120, 260, 120, 'k', 3) + (closed ? ln(40, 40, 40, 120, 'k', 5) : '') + pa(up, 'b', 'fn', 2) + pa(dn, 'b', 'fn', 1.5, '4 4') + dim(40, 140, 260, 140, p.L || 'L', 0, -5)
    + tx(150, 24, closed ? 'tubo fechado: nó na ponta fechada' : 'tubo aberto: ventres nas pontas', 's')); };
D.doppler = p => { let h = ''; for (let k = 0; k < 5; k++) { const cx = 150 - k * 14, r = 18 + k * 22; h += ci(cx, 85, r, 'b', 'fn', 1.2).replace('class="b fn"', 'class="b fn" opacity="0.6"'); }
  return svg(ground(10, 290, 135) + h + car(105, 135).replace(/<path/, '<path') + re(140, 82, 14, 6, 'n', 'fr') + ar(200, 60, 245, 60, 'a', p.v || 'v_f', 250, 64) + person(275, 135) + person(25, 135) + tx(272, 20, 'agudo', 'a') + tx(30, 20, 'grave', 'b')); };
D.eco = p => svg(re(0, 30, 300, 130, 'n', 'fw') + ln(0, 30, 300, 30, 'b', 1.5) + pa('M110,30 L120,14 L180,14 L190,30 Z', 'k', 'fp', 2) + pa('M0,150 Q80,140 150,150 Q220,160 300,145 L300,160 L0,160 Z', 'k', 'fs', 1.5)
  + ar(140, 34, 140, 138, 'a', 'ida', 132, 90, 'end') + ar(160, 138, 160, 34, 'g', 'volta', 168, 90) + dim(230, 30, 230, 148, p.d || 'd', 14, 4) + tx(60, 50, p.t || '', 's'));
D.batimento = p => { let d1 = '', env = ''; for (let x = 20; x <= 280; x += 1.5) { const t = (x - 20) / 260; const y = 30 * Math.cos(2 * Math.PI * 2 * t) * Math.sin(2 * Math.PI * 24 * t); d1 += (x === 20 ? 'M' : 'L') + n1(x) + ',' + n1(80 - y) + ' '; }
  for (let x = 20; x <= 280; x += 3) { const t = (x - 20) / 260; env += (x === 20 ? 'M' : 'L') + x + ',' + n1(80 - 30 * Math.abs(Math.cos(2 * Math.PI * 2 * t))) + ' '; }
  return svg(pa(d1, 'b', 'fn', 1.5) + pa(env, 'a', 'fn', 2, '4 3') + tx(150, 150, p.t || 'volume oscila com f_bat', 's')); };
D.fonte = p => { let h = ''; for (let r = 20; r <= 110; r += 18) h += pa(`M${n1(40 + r * Math.cos(rad(40)))},${n1(80 - r * Math.sin(rad(40)))} A${r},${r} 0 0 1 ${n1(40 + r * Math.cos(rad(40)))},${n1(80 + r * Math.sin(rad(40)))}`, p.sol ? 'a' : 'b', 'fn', 1.4);
  return svg((p.sol ? sun(30, 80, 14) : re(14, 62, 18, 36, 'k', 'fs', 3) + pa('M32,66 L48,52 L48,108 L32,94 Z', 'k', 'fp', 2)) + h + ci(250, 80, 5, 'k', 'fk') + tx(258, 84, p.P || 'P', 'k', 'start') + dim(40, 130, 250, 130, p.r || 'r', 0, -5) + tx(150, 22, p.t || '', 's')); };

/* ---------- Óptica ---------- */
/* ---------- óptica: câmara escura, sombra, espelhos em ângulo e lentes delgadas (raios traçados) ---------- */
const unitV = v => { const L = Math.hypot(v[0], v[1]); return [v[0] / L, v[1] / L]; };
const seg2 = (A, B, c = 'a', w = 1.2, dash) => ln(A[0], A[1], B[0], B[1], c, w, dash);
const ySobre = (T, O, X) => T[1] + (O[1] - T[1]) * (X - T[0]) / (O[0] - T[0]);   // altura, em x = X, de um raio que passa por T e O
// câmara escura: os raios do topo e da base da árvore passam pelo orifício e formam a imagem invertida na tela
D.camara = p => { const T = [40, 18], B0 = [40, 128], O = [150, 80], X = 230, yT = ySobre(T, O, X), yB = ySobre(B0, O, X);
  return svg(ground(10, 290, 128) + tree(40, 128, 110) + seg2(T, [X, yT]) + seg2(B0, [X, yB])
    + re(X, 30, 6, 110, 'k', 'fs', 1) + ci(O[0], O[1], 3, 'k', 'fk') + tx(O[0], O[1] - 10, 'orifício', 's')
    + ar(X + 12, yB, X + 12, yT, 'g', p.i || 'i', X + 20, (yT + yB) / 2 + 4, 'start')
    + dim(40, 150, O[0], 150, p.p || 'p', 0, 0) + dim(O[0], 150, X, 150, p.pp || 'p′', 0, 0)); };
// sombra: o sol manda raios paralelos; a vara e o prédio têm a mesma razão altura/sombra (1/0,8 = 30/24)
D.sombra = p => { const d = [80, 100], P = [60, 100], Q = [170, 40];
  const raio = (A, t0, t1) => seg2([A[0] - t1 * d[0], A[1] - t1 * d[1]], [A[0] - t0 * d[0], A[1] - t0 * d[1]], 's', 1, '4 4');
  return svg(ground(10, 290, 140) + raio(P, 0, 0.5) + raio(Q, 0, 0.25)
    + ln(60, 140, 60, 100, 'k', 4) + re(60, 138, 32, 3, 'n', 'fk') + re(150, 40, 20, 100, 'k', 'fs', 2) + re(170, 138, 80, 3, 'n', 'fk')
    + tx(52, 124, p.h || 'h', 'k', 'end') + tx(196, 34, p.H || 'H', 'k', 'start') + tx(76, 156, p.s || 's', 's') + tx(210, 156, p.S || 'S', 's')
    + tx(12, 12, 'prédio fora de escala', 's', 'start', 10)); };
// espelhos em ângulo: a imagem de cada espelho é refletida de novo; com 60° restam 5 imagens à mesma distância do vértice
D.espelhos = p => { const V = [150, 128], r = 40, O = P(V[0], V[1], r, 90); let h = ln(V[0], V[1], ...P(V[0], V[1], 95, 60), 'b', 3) + ln(V[0], V[1], ...P(V[0], V[1], 95, 120), 'b', 3);
  for (const a of [30, 150, 210, 270, 330]) { const [x, y] = P(V[0], V[1], r, a); h += ci(x, y, 5, 's', 'fn', 1.5); }
  return svg(h + arc(V[0], V[1], 14, 60, 120, p.ang || '60°', 'k') + ci(O[0], O[1], 6, 'a', 'fa') + tx(O[0] + 10, O[1] + 4, 'objeto', 'a', 'start')
    + tx(292, 22, p.n || '5 imagens', 's', 'end')); };
// lente delgada: raio paralelo passa pelo foco F′; raio pelo centro não desvia; imagem pela equação 1/f = 1/p + 1/p′
function lenteCena(o) {
  const f = o.f, conv = f > 0, K = o.K, xl = o.xl, y0 = 90, edge = 292, Fa = Math.abs(f) * K;
  const Q = conv ? [xl + Fa, y0] : [xl - Fa, y0], Fo = conv ? [xl - Fa, y0] : [xl + Fa, y0];
  let g = ln(8, y0, edge, y0, 's', 1) + lensShape(xl, y0, 40, conv)
    + ci(Q[0], y0, 3, 'k', 'fk') + tx(Q[0], y0 + 16, 'F′', 'k') + ci(Fo[0], y0, 3, 'k', 'fk') + tx(Fo[0], y0 + 16, 'F', 'k');
  const fora = (A, d) => { const L = (edge - A[0]) / d[0]; return [A[0] + d[0] * L, A[1] + d[1] * L]; };
  if (o.p == null) {                                               // só raios paralelos ao eixo
    for (const h of [-30, -15, 15, 30]) {
      const L = [xl, y0 + h], d = conv ? unitV([Q[0] - L[0], Q[1] - L[1]]) : unitV([L[0] - Q[0], L[1] - Q[1]]);
      g += seg2([8, y0 + h], L) + seg2(L, fora(L, d));
      if (!conv) g += seg2(L, Q, 'a', 1, '3 3');
    }
    return g + tx(150, 156, o.t || '', 's');
  }
  const pp = 1 / (1 / f - 1 / o.p), A = -pp / o.p, xo = xl - o.p * K, T = [xo, y0 - o.ho], L1 = [xl, y0 - o.ho], C = [xl, y0];
  const d1 = conv ? unitV([Q[0] - L1[0], Q[1] - L1[1]]) : unitV([L1[0] - Q[0], L1[1] - Q[1]]), d2 = unitV([C[0] - T[0], C[1] - T[1]]);
  const real = pp > 0, I = [xl + pp * K, y0 - A * o.ho];
  g += ar(xo, y0, xo, T[1], 'a', o.o || 'o', xo - 7, y0 - o.ho / 2, 'end') + seg2(T, L1) + seg2(T, C);
  if (I[0] <= edge) {
    if (real) g += seg2(L1, I) + seg2(C, I) + ar(I[0], y0, I[0], I[1], 'g', o.i || 'i', I[0] + 7, (y0 + I[1]) / 2, 'start');
    else { g += seg2(L1, fora(L1, d1)) + seg2(C, fora(C, d2)) + seg2(L1, I, 'a', 1, '3 3') + seg2(C, I, 'a', 1, '3 3') + seg2([I[0], y0], I, 'g', 2, '3 3') + tx(I[0] + 7, (y0 + I[1]) / 2, o.i || 'i', 'g', 'start'); }
  } else g += seg2(L1, fora(L1, d1)) + seg2(C, fora(C, d2)) + tx(292, 30, o.i || '', 'g', 'end');
  g += dim(xo, 146, xl, 146, `p = ${o.p} cm`, 0, -4);
  if (I[0] >= 8 && I[0] <= edge) g += dim(I[0], 18, xl, 18, `p′ = ${(pp > 0 ? '' : '−') + Math.abs(pp).toFixed(0)} cm`, 0, -4);
  return g + tx(150, 156, o.t || '', 's');
}
D.lenteReal = p => svg(lenteCena(p));
D.luz = p => svg(sun(40, 80, 22) + ci(260, 80, 12, 'b', 'fw') + wavy(70, 80, 244, 80, 'a', '') + dim(40, 125, 260, 125, p.d || 'd', 0, -5) + tx(150, 60, p.c || 'c', 'a') + tx(150, 150, p.t || '', 's'));
D.reflexao = p => svg(re(30, 120, 240, 8, 'k', 'fs', 0) + ln(150, 20, 150, 120, 's', 1.2, '4 4') + ar(70, 40, 148, 118, 'a') + ar(150, 120, 230, 40, 'a') + arc(150, 120, 34, 90, 135, p.i || 'i', 'k') + arc(150, 120, 34, 45, 90, p.r || 'r', 'k') + tx(150, 14, 'normal', 's'));
D.espelhoPlano = p => svg(ln(150, 20, 150, 140, 'b', 4) + ground(10, 290, 140) + person(80, 140) + person(220, 140, 's') + dim(80, 154, 150, 154, p.d || 'd', 0, -4) + dim(150, 154, 220, 154, p.d || 'd', 0, -4) + tx(220, 84, 'imagem', 's') + tx(80, 84, p.h || '', 'k'));
D.concavo = p => svg(ln(10, 90, 290, 90, 's', 1) + pa('M270,30 Q245,90 270,150', 'b', 'fn', 4) + ci(200, 90, 3, 'k', 'fk') + tx(200, 106, 'F', 'k') + ci(130, 90, 3, 'k', 'fk') + tx(130, 106, 'C', 'k')
  + ar(90, 90, 90, 60, 'a', p.o || 'o', 82, 66, 'end') + ln(90, 60, 262, 60, 'a', 1.2) + ln(262, 60, 30, 135, 'a', 1.2) + ln(90, 60, 200, 90, 'a', 1.2, '3 3') + ar(165, 90, 165, 120, 'g', p.i || 'i', 172, 120)
  + dim(90, 20, 262, 20, p.p || 'p', 0, -4) + tx(60, 150, p.t || '', 's'));
D.refracao = p => svg(re(0, 80, 300, 80, 'n', 'fw') + ln(0, 80, 300, 80, 'k', 2) + ln(150, 10, 150, 150, 's', 1.2, '4 4') + ar(70, 20, 148, 78, 'a') + ar(150, 80, 196, 150, 'a') + arc(150, 80, 34, 90, 143, p.i || 'θ₁', 'k') + arc(150, 80, 34, -90, -57, p.r || 'θ₂', 'k')
  + tx(260, 40, p.n1 || 'n₁ (ar)', 's') + tx(260, 120, p.n2 || 'n₂', 'b'));
/* ---------- espelho côncavo: raios traçados pela lei da reflexão (r = u − 2(u·N)N) ---------- */
const OPT = { V: [262, 90], K: 4 };                        // vértice do espelho; escala de distâncias: 4 px por cm
const espelho = f => ({ C: [OPT.V[0] - 2 * f * OPT.K, OPT.V[1]], R: 2 * f * OPT.K });   // centro de curvatura C e raio R = 2f
function alvo(P, u, S) {                                   // ponto em que o raio P + t·u atinge o espelho (a partir de dentro da esfera)
  const dx = P[0] - S.C[0], dy = P[1] - S.C[1], b = dx * u[0] + dy * u[1], c = dx * dx + dy * dy - S.R * S.R, t = -b + Math.sqrt(b * b - c);
  return [P[0] + t * u[0], P[1] + t * u[1]];
}
function reflete(u, M, S) {
  const N = [(M[0] - S.C[0]) / S.R, (M[1] - S.C[1]) / S.R], k = 2 * (u[0] * N[0] + u[1] * N[1]), r = [u[0] - k * N[0], u[1] - k * N[1]], L = Math.hypot(r[0], r[1]);
  return [r[0] / L, r[1] / L];
}
function cruza(P1, d1, P2, d2) {                           // ponto de encontro de duas retas
  const det = -d1[0] * d2[1] + d2[0] * d1[1], rx = P2[0] - P1[0], ry = P2[1] - P1[1], k = (-rx * d2[1] + ry * d2[0]) / det;
  return [P1[0] + k * d1[0], P1[1] + k * d1[1]];
}
const segm = (A, B, c = 'a', w = 1.2) => ln(A[0], A[1], B[0], B[1], c, w);
function raioAte(P, d, x0, c = 'a') {                      // raio refletido seguindo até a borda da figura
  const Lx = (P[0] - x0) / -d[0], Ly = d[1] > 0 ? (156 - P[1]) / d[1] : d[1] < 0 ? (P[1] - 4) / -d[1] : Infinity, L = Math.min(Lx, Ly);
  return segm(P, [P[0] + d[0] * L, P[1] + d[1] * L], c);
}
function baseEspelho(S, F) {                               // eixo, espelho (arco de raio R), foco e centro
  const hh = 60, x1 = S.C[0] + Math.sqrt(S.R * S.R - hh * hh);
  return ln(8, 90, 292, 90, 's', 1) + pa(`M${n1(x1)},${90 - hh} A${S.R},${S.R} 0 0 1 ${n1(x1)},${90 + hh}`, 'b', 'fn', 4)
    + ci(F[0], 90, 3, 'k', 'fk') + tx(F[0], 106, 'F', 'k') + ci(S.C[0], 90, 3, 'k', 'fk') + tx(S.C[0], 106, 'C', 'k');
}
// foco: raios paralelos ao eixo refletem passando pelo foco F
D.focoEspelho = p => { const S = espelho(20), F = [OPT.V[0] - 20 * OPT.K, 90]; let g = baseEspelho(S, F);
  for (const h of [-44, -20, 20, 44]) {
    const P = [18, 90 + h], M = alvo(P, [1, 0], S), r = reflete([1, 0], M, S);
    g += segm(P, M) + raioAte(M, r, 18);
  }
  return svg(g + tx(150, 156, p.t || '', 's')); };
// imagem de Gauss: p = 30 cm, f = 20 cm → p′ = 60 cm; a imagem fica na posição da fórmula (aproximação paraxial)
function desenhaEspelho(p, pp, ho, lab) {
  const S = espelho(20), F = [OPT.V[0] - 20 * OPT.K, 90], xo = OPT.V[0] - p * OPT.K, P1 = [xo, 90 - ho];
  const M1 = alvo(P1, [1, 0], S);
  const u2 = [F[0] - P1[0], F[1] - P1[1]], L2 = Math.hypot(u2[0], u2[1]), d2 = [u2[0] / L2, u2[1] / L2];
  const M2 = alvo(P1, d2, S);
  const I = [OPT.V[0] - pp * OPT.K, 90 + (pp / p) * ho];
  const seta = (x, y1, y2, c, lab2, lx, ly, anc) => ln(x, y1, x, y2 - Math.sign(y2 - y1) * 5, c, 2.4)
    + `<polygon points="${x},${y2} ${n1(x - 3.5)},${n1(y2 - Math.sign(y2 - y1) * 6)} ${n1(x + 3.5)},${n1(y2 - Math.sign(y2 - y1) * 6)}" class="f${c}"/>`
    + (lab2 ? tx(lx, ly, lab2, c, anc) : '');
  return baseEspelho(S, F)
    + seta(xo, 90, 90 - ho, 'a', lab.o, xo - 7, 90 - ho - 2, 'end')
    + segm(P1, M1) + segm(M1, I) + segm(P1, M2) + segm(M2, I)
    + seta(I[0], 90, I[1], 'g', lab.i, I[0] + 7, 90 + (I[1] - 90) / 2 + 4, 'start')
    + dim(xo, 28, OPT.V[0], 28, lab.p, 0, -4) + dim(I[0], 46, OPT.V[0], 46, lab.pp, 0, -4)
    + tx(150, 156, lab.t || '', 's');
}
D.espelhoGauss = p => svg(desenhaEspelho(30, 60, 12, { o: p.o || 'o', i: p.i || 'i', p: p.p || 'p', pp: 'p′', t: p.t }));
D.espelhoAumento = p => svg(desenhaEspelho(30, 60, 8, { o: p.o || 'o', i: p.i || 'i', p: p.p || 'p', pp: 'p′', t: p.t }));
D.refracaoSnell = p => svg(re(0, 80, 300, 80, 'n', 'fw') + ln(0, 80, 300, 80, 'k', 2) + ln(150, 10, 150, 150, 's', 1.2, '4 4') + ar(90, 20, 147, 77, 'a') + ar(150, 80, 190, 144, 'a') + arc(150, 80, 34, 90, 135, p.i || 'θ₁', 'k') + arc(150, 80, 34, -90, -58, p.r || 'θ₂', 'k')
  + tx(260, 40, p.n1 || 'n₁ (ar)', 's') + tx(260, 120, p.n2 || 'n₂', 'b'));
/* ---------- refração e reflexão total: ângulos do enunciado (n = 1,33 para a água) ---------- */
// ângulo-limite: sen L = n₂/n₁ = 1/1,33 ⇒ L ≈ 49°; acima de L a luz é refletida totalmente (água → ar)
D.reflexaoTotal = p => { const y0 = 90, x0 = 150, L = Math.asin(1 / 1.33), Ld = L * 180 / Math.PI, th = 60 * Math.PI / 180, R = 58;
  const fonte = a => [x0 - Math.sin(a) * R, y0 + Math.cos(a) * R];
  return svg(re(0, y0, 300, 70, 'n', 'fw') + ln(0, y0, 300, y0, 'k', 2) + ln(x0, 14, x0, 150, 's', 1.2, '4 4')
    + ar(...fonte(L), x0, y0, 'a') + ar(x0, y0, 292, y0, 'g', '', 0, 0)
    + ar(...fonte(th), x0, y0, 'a') + ar(x0, y0, x0 + R * Math.sin(th), y0 + R * Math.cos(th), 'b')
    + arc(x0, y0, 30, -90, -90 - Ld, 'L', 'k')
    + tx(286, 78, p.t || '', 'g', 'end') + tx(20, 40, 'ar', 's', 'start') + tx(20, 150, 'água', 'b', 'start')); };
// dioptro plano: a água de 2 m parece ter 2/1,33 ≈ 1,5 m; o raio que sai da água se afasta da normal
D.dioptro = p => { const x0 = 150, yS = 40, yR = 120, ang = 10 * Math.PI / 180, aa = Math.asin(1.33 * Math.sin(ang)), xs = x0 + (yR - yS) * Math.tan(ang), yA = yS + (xs - x0) / Math.tan(aa);
  const ponto = [x0, yR], sup = [xs, yS], topo = [xs + 28 * Math.sin(aa), yS - 28 * Math.cos(aa)];
  return svg(re(0, yS, 300, 120, 'n', 'fw') + ln(0, yS, 300, yS, 'k', 2) + ln(x0, 14, x0, yR, 's', 1, '3 3') + ln(xs, 14, xs, 66, 's', 1, '3 3')
    + ci(x0, yR, 4, 'k', 'fk') + tx(x0 + 12, yR + 4, 'real', 'k', 'start')
    + ci(x0, yA, 4, 'b', 'fn', 1.5) + tx(x0 - 10, yA + 4, 'aparente', 'b', 'end')
    + segm(ponto, sup, 'a', 1.2) + segm(sup, topo, 'a', 1.2) + segm(sup, [x0, yA], 's', 1, '3 3')
    + dim(236, yS, 236, yR, p.p || '2 m', 14, 4) + dim(266, yS, 266, yA, p.pp || '1,5 m', 14, 4)
    + tx(20, 30, 'ar', 's', 'start') + tx(20, 152, 'água · n = 1,33', 'b', 'start')); };
// lâmina paralela: e = 3 cm, i = 60°, r = 30° ⇒ d = e·sen(i − r)/cos r ≈ 1,7 cm; o raio sai paralelo ao incidente
D.lamina = p => { const K = 20, yT = 50, yB = yT + 3 * K, P1 = [80, yT], P2 = [80 + (yB - yT) * Math.tan(Math.PI / 6), yB];
  const u = [Math.sin(Math.PI / 3), Math.cos(Math.PI / 3)], fonte = [P1[0] - 60 * u[0], P1[1] - 60 * u[1]];
  const fim = [P2[0] + (150 - yB) * Math.tan(Math.PI / 3), 150];
  const ultimo = [P1[0] + (150 - yT) * u[0] / u[1], 150];
  return svg(re(40, yT, 260, yB - yT, 'n', 'fw') + ln(40, yT, 300, yT, 'k', 2) + ln(40, yB, 300, yB, 'k', 2)
    + ln(P1[0], 14, P1[0], 150, 's', 1, '3 3') + segm(fonte, P1, 'a', 1.2) + segm(P1, P2, 'a', 1.2) + segm(P2, fim, 'a', 1.2)
    + segm(P1, ultimo, 's', 1, '3 3') + arc(P1[0], P1[1], 24, 90, 150, p.i || 'i', 'k') + arc(P1[0], P1[1], 24, -90, -60, p.r || 'r', 'k')
    + tx(278, 90, 'e = 3 cm', 's', 'end') + tx(208, 132, p.d || 'd', 'b', 'start')); };
// prisma: A = 60°; no desvio mínimo o raio interno é paralelo à base, com i = 60° e r = 30° em cada face
D.prisma = p => { const V = [150, 20], Bl = [150 - 120 * Math.tan(Math.PI / 6), 140], Br = [150 + 120 * Math.tan(Math.PI / 6), 140];
  const Ex = V[0] + (80 - V[1]) * (Bl[0] - V[0]) / (Bl[1] - V[1]), Fx = V[0] + (80 - V[1]) * (Br[0] - V[0]) / (Br[1] - V[1]);
  const dIn = [Math.sin(Math.PI / 3), -Math.cos(Math.PI / 3)], src = [Ex - 60 * dIn[0], 80 - 60 * dIn[1]];
  const dOut = [Math.sin(Math.PI / 3), Math.cos(Math.PI / 3)], fim = [Fx + (150 - 80) * dOut[0] / dOut[1], 150];
  return svg(pa(`M${n1(V[0])},${V[1]} L${n1(Bl[0])},${Bl[1]} L${n1(Br[0])},${Br[1]} Z`, 'b', 'fw', 2)
    + segm(src, [Ex, 80], 'a', 1.2) + segm([Ex, 80], [Fx, 80], 'a', 1.2) + segm([Fx, 80], [Math.min(fim[0], 292), 80 + (Math.min(fim[0], 292) - Fx) * dOut[1] / dOut[0]], 'a', 1.2)
    + tx(150, 156, p.A || 'A', 'b') + tx(292, 30, 'D = 60° (mínimo)', 's', 'end', 11)); };
D.lente = p => { const conv = !p.div;
  return svg(ln(10, 90, 290, 90, 's', 1) + lensShape(150, 90, 60, conv) + ci(100, 90, 3, 'k', 'fk') + ci(200, 90, 3, 'k', 'fk') + tx(100, 106, 'F', 'k') + tx(200, 106, 'F′', 'k')
    + ar(55, 90, 55, 55, 'a', p.o || 'o', 48, 62, 'end') + ln(55, 55, 150, 55, 'a', 1.2) + (conv ? ln(150, 55, 280, 128, 'a', 1.2) + ln(55, 55, 280, 141, 'a', 1.2, '3 3') + ar(258, 90, 258, 121, 'g', p.i || 'i', 264, 120)
      : ln(150, 55, 280, 15, 'a', 1.2) + ln(100, 90, 150, 55, 's', 1, '3 3') + ar(118, 90, 118, 73, 'g', p.i || 'i', 112, 76, 'end'))
    + dim(55, 150, 150, 150, p.p || 'p', 0, -4) + tx(240, 22, p.f || '', 's')); };
/* ---------- instrumentos e olho: imagem intermediária no foco da ocular; correção por lente ---------- */
// luneta: a objetiva forma a imagem no foco da ocular (F₁ = F₂); a ocular devolve raios paralelos (olho relaxado)
D.luneta = p => { const xI = 218, xo = xI - 150, xe = xI + 12, y0 = 90;
  let g = ln(8, y0, 292, y0, 's', 1) + lensShape(xo, y0, 40, true) + lensShape(xe, y0, 24, true);
  for (const h of [-34, 34]) {
    const L = [xo, y0 + h], E = [xe, y0 + h + (y0 - (y0 + h)) * (xe - xo) / (xI - xo)];
    g += seg2([8, y0 + h], L) + seg2(L, E) + seg2(E, [292, E[1]]);
  }
  g += ci(xI, y0, 2.5, 'a', 'fa') + tx(xI, y0 - 8, 'F₁ = F₂', 'a') + tx(xo, 152, p.a || '', 'k') + tx(xe, 152, p.b || '', 'k')
    + tx(150, 14, p.t || '', 's') + tx(10, 30, 'esquema fora de escala', 's', 'start', 10);
  return svg(g); };
// microscópio: a objetiva forma uma imagem real invertida e ampliada, que está no foco da ocular
D.microscopio = p => { const xo = 90, f1 = 22, po = 26, hob = 8, xob = xo - po, xI = xo + f1 * po / (po - f1), xe = xI + 12, y0 = 90;
  const hI = hob * f1 / (po - f1), T = [xob, y0 - hob], Lt = [xo, y0 - hob], Ip = [xI, y0 + hI], C = [xo, y0];
  let g = ln(8, y0, 292, y0, 's', 1) + lensShape(xo, y0, 40, true) + lensShape(xe, y0, 24, true)
    + ar(xob, y0, xob, y0 - hob, 'a', p.o || 'objeto', xob - 6, y0 - hob / 2, 'end')
    + seg2(T, Lt) + seg2(Lt, Ip) + seg2(T, C) + seg2(C, Ip)
    + ar(xI, y0, xI, Ip[1], 'g', '', 0, 0) + tx(xI - 6, Ip[1] + 4, 'imagem intermediária', 'g', 'end', 10)
    + ci(xo + f1, y0, 2.5, 'k', 'fk') + tx(xo + f1, y0 - 8, 'F₁', 'k')
    + tx(xo, 152, p.a || '', 'k') + tx(xe, 152, p.b || '', 'k') + tx(150, 14, p.t || '', 's') + tx(10, 30, 'esquema fora de escala', 's', 'start', 10);
  return svg(g); };
// olho: sem correção (tracejado), o foco fica antes (míope) ou depois (hipermétrope) da retina; com a lente (cheio), o foco volta à retina
D.olho = p => { const mio = !p.hiper, xL = 160, xR = 256, y0 = 90, Fu = mio ? 232 : 284, h = 22, Rr = [xR, y0], sx = 100, k = mio ? 1.25 : 0.8;
  let g = el(200, y0, 62, 52, 'k', 'fp', 2) + pa(`M${xR},58 Q266,${y0} ${xR},122`, 'r', 'fn', 3) + lensShape(xL, y0, 26, true)
    + ln(8, y0, 292, y0, 's', 1, '3 3') + lensShape(sx, y0, 40, !mio);
  for (const s of [-1, 1]) {
    const Lh = y0 + s * h, yR = y0 + s * h * (1 - (xR - xL) / (Fu - xL));
    g += seg2([8, Lh], [xL, Lh], 's', 1, '3 3');                                  // feixe incidente, sem correção
    if (Fu <= xR) g += seg2([xL, Lh], [Fu, y0], 's', 1, '3 3');                    // foco antes da retina (míope)
    else g += seg2([xL, Lh], [xR, yR], 's', 1, '3 3') + seg2([xR, yR], [Fu, y0], 's', 1, '2 3');   // foco depois da retina
    const S = [sx, Lh], E = [xL, y0 + s * h * k];                                  // com a lente: feixe corrigido
    g += seg2([8, Lh], S, 'a', 1.2) + seg2(S, E, 'a', 1.2) + seg2(E, Rr, 'a', 1.2);
  }
  return svg(g + tx(262, 132, 'retina', 'r', 'end') + tx(150, 14, p.t || '', 'b')
    + tx(sx, 152, mio ? 'lente divergente' : 'lente convergente', 'b')); };
/* ---------- Eletricidade ---------- */
D.cargas = p => svg(charge(70, 80, 22, p.s1 ?? 1, p.q1 || 'Q') + charge(230, 80, 22, p.s2 ?? 1, p.q2 || 'q') + ((p.s1 ?? 1) * (p.s2 ?? 1) > 0
  ? ar(48, 80, 14, 80, 'a', 'F', 14, 70) + ar(252, 80, 286, 80, 'a', 'F', 286, 70, 'end') : ar(92, 80, 130, 80, 'a', 'F', 130, 70, 'end') + ar(208, 80, 170, 80, 'a', 'F', 170, 70, 'start'))
  + dim(70, 140, 230, 140, p.d || 'd', 0, -5));
D.campo = p => { let h = ''; for (let k = 0; k < 8; k++) { const [x1, y1] = P(80, 80, 26, k * 45), [x2, y2] = P(80, 80, 62, k * 45); h += ar(x1, y1, x2, y2, 's'); }
  return svg(h + charge(80, 80, 18, 1, '') + tx(80, 84 + 30, p.Q || 'Q', 'k') + ci(240, 80, 4, 'k', 'fk') + ar(244, 80, 285, 80, 'a', p.E || 'E', 285, 70, 'end') + dim(80, 140, 240, 140, p.d || 'd', 0, -5)); };
D.placas = p => { let h = re(60, 20, 10, 120, 'a', 'fh', 1) + re(230, 20, 10, 120, 'b', 'fw', 1); for (let y = 35; y < 140; y += 22) h += ar(75, y, 222, y, 's') + plusminus(65, y, 1) + plusminus(235, y, -1);
  return svg(h + (p.e ? ci(200, 80, 6, 'b', 'fw') + ar(192, 80, 140, 80, 'b', p.e, 134, 72, 'end') : '') + dim(70, 152, 230, 152, p.d || 'd', 0, -4) + tx(150, 14, p.U || 'U', 'k')); };
D.esfera = p => { let h = ci(150, 80, 55, 'k', 'fp', 2); for (let k = 0; k < 10; k++) { const [x, y] = P(150, 80, 55, k * 36); h += ci(x, y, 7, 'a', 'fh', 1) + plusminus(x, y, p.neg ? -1 : 1); }
  return svg(h + tx(150, 78, p.in || 'E = 0', 'b') + tx(150, 96, 'dentro', 's') + dim(150, 80, 205, 80, '', 0, 0) + tx(180, 72, p.R || 'R', 's') + tx(150, 156, p.Q || '', 'a')); };
D.eletrons = p => { let h = ci(150, 80, 50, 'b', 'fw', 2); for (let i = 0; i < 12; i++) { const [x, y] = P(150, 80, 18 + (i % 3) * 12, i * 30); h += plusminus(x, y, -1); } return svg(h + tx(150, 150, p.Q || 'Q = n·e', 'b')); };
D.contato = p => svg(ci(100, 70, 34, 'k', 'fh') + ci(168, 70, 34, 'k', 'fw') + tx(100, 74, p.a || 'Q₁') + tx(168, 74, p.b || 'Q₂') + tx(134, 128, p.t || 'depois do contato: cargas iguais', 's') + tx(134, 148, p.r || '', 'a'));
D.circuito = p => svg(pa('M60,30 L240,30 L240,130 L60,130 Z', 'k', 'fn', 2) + re(110, 22, 80, 16, 'n', 'fq') + resistor(110, 30, 80) + re(52, 68, 16, 24, 'n', 'fq') + battery(60, 80) + tx(150, 18, p.R || 'R', 'a')
  + tx(60, 152, p.E || 'ε', 'k', 'start') + ar(240, 60, 240, 100, 'a', p.i || 'i', 248, 90) + (p.m ? ci(150, 130, 14, 'k', 'fp') + tx(150, 135, 'M') : '') + tx(296, 152, p.t || '', 's', 'end'));
D.fio = p => svg(el(60, 80, 12, 28, 'k', 'fs', 2) + ln(60, 52, 240, 52, 'k', 2) + ln(60, 108, 240, 108, 'k', 2) + pa('M240,52 A12,28 0 0 1 240,108', 'k', 'fn', 2) + dim(60, 130, 240, 130, p.L || 'L', 0, -5) + tx(60, 40, p.A || 'A', 'a') + tx(150, 84, p.rho || 'ρ', 's'));
D.serie = p => svg(pa('M40,30 L260,30 L260,130 L40,130 Z', 'k', 'fn', 2) + [70, 130, 190].map((x, i) => re(x, 22, 46, 16, 'n', 'fp') + resistor(x + 3, 30, 40) + tx(x + 23, 16, (p.R || ['R₁', 'R₂', 'R₃'])[i], 'a')).join('')
  + re(32, 68, 16, 24, 'n', 'fp') + battery(40, 80) + tx(20, 84, p.U || 'U', 'k', 'end') + ar(260, 60, 260, 100, 'a', p.i || 'i', 268, 90));
D.paralelo = p => svg(pa('M40,30 L260,30 L260,130 L40,130 Z', 'k', 'fn', 2) + ln(120, 30, 120, 130, 'k', 2) + ln(200, 30, 200, 130, 'k', 2) + re(110, 55, 20, 50, 'n', 'fp') + resistor(120, 58, 44, true) + re(190, 55, 20, 50, 'n', 'fp') + resistor(200, 58, 44, true)
  + tx(108, 84, (p.R || ['R₁'])[0], 'a', 'end') + tx(212, 84, (p.R || ['', 'R₂'])[1], 'a', 'start') + re(32, 68, 16, 24, 'n', 'fp') + battery(40, 80) + ln(260, 30, 260, 130, 'k', 2).replace('k', 'k'));
D.chuveiro = p => { let h = pa('M90,30 L210,30 L190,50 L110,50 Z', 'k', 'fs', 2) + ln(150, 10, 150, 30, 'k', 4); for (let k = 0; k < 7; k++) h += ln(118 + k * 11, 58, 112 + k * 12, 110 + (k % 2) * 12, 'b', 2, '4 6');
  return svg(h + tx(150, 140, p.P || 'P', 'a') + tx(150, 156, p.U || '', 's') + tx(255, 40, p.t || '', 's')); };
D.no = p => svg(ci(150, 80, 6, 'k', 'fk') + ar(30, 40, 144, 77, 'a', p.i1 || 'i₁', 40, 32) + ar(30, 120, 144, 83, 'a', p.i2 || 'i₂', 40, 140) + ar(156, 80, 280, 80, 'g', p.i3 || 'i₃', 276, 70, 'end') + tx(150, 150, 'o que chega = o que sai', 's'));
D.ponte = p => { const N = [150, 20], W = [60, 80], S = [150, 140], Ea = [240, 80];
  return svg(pa(`M${N} L${W} L${S} L${Ea} Z`.replace(/,/g, ',').replace(/(\d+),(\d+)/g, '$1,$2'), 'k', 'fn', 2) + ln(W[0], W[1], Ea[0], Ea[1], 'k', 1.5) + ci(150, 80, 12, 'k', 'fp') + tx(150, 85, 'G')
    + tx(92, 42, p.R1 || 'R₁', 'a') + tx(210, 42, p.R2 || 'R₂', 'a') + tx(222, 124, p.R3 || 'R₃', 'a', 'start') + tx(92, 128, p.R4 || 'R₄', 'a') + tx(150, 156, 'R₁·R₃ = R₂·R₄', 's')); };
D.capacitor = p => svg(pa('M135,30 L60,30 L60,130 L240,130 L240,30 L165,30', 'k', 'fn', 2) + ln(135, 10, 135, 50, 'a', 4) + ln(165, 10, 165, 50, 'b', 4) + tx(118, 20, '+Q', 'a', 'end') + tx(182, 20, '−Q', 'b', 'start')
  + re(52, 68, 16, 24, 'n', 'fp') + battery(60, 80) + tx(28, 84, p.U || 'U', 'k', 'end') + tx(150, 72, p.C || 'C', 'k') + tx(150, 152, p.t || '', 's'));

/* ---------- Eletromagnetismo ---------- */
D.fioCampo = p => { let h = ''; for (const r of [24, 46, 68]) h += el(150, 95, r * 1.6, r * 0.45, 'b', 'fn', 1.5) + ar(150 + r * 0.3, 95 + r * 0.45, 150 - r * 0.3, 95 + r * 0.45, 'b');
  return svg(h + ln(150, 150, 150, 10, 'k', 3) + ar(150, 60, 150, 16, 'a', p.i || 'i', 158, 26) + tx(268, 108, p.B || 'B', 'b') + (p.d ? dim(150, 140, 223, 140, p.d, 0, -5) : '')); };
D.fiosParalelos = p => svg(ln(100, 10, 100, 150, 'k', 3) + ln(200, 10, 200, 150, 'k', 3) + ar(100, 60, 100, 18, 'a', p.i1 || 'i₁', 92, 26, 'end') + ar(200, 60, 200, 18, 'a', p.i2 || 'i₂', 208, 26) + ar(104, 100, 140, 100, 'g', 'F', 140, 92, 'end') + ar(196, 100, 160, 100, 'g', 'F', 160, 92, 'start')
  + dim(100, 140, 200, 140, p.d || 'd', 0, -5));
D.espira = p => svg(el(150, 80, 70, 70, 'k', 'fn', 3) + ar(...P(150, 80, 70, 100), ...P(150, 80, 70, 125), 'a', p.i || 'i') + ci(150, 80, 9, 'b', 'fw') + ci(150, 80, 2.5, 'b', 'fb') + tx(165, 70, p.B || 'B', 'b', 'start') + dim(150, 80, 220, 80, '', 0, 0) + tx(196, 96, p.R || 'R', 's'));
D.solenoide = p => { let h = ''; for (let k = 0; k < 10; k++) h += el(70 + k * 18, 80, 8, 34, 'k', 'fn', 2); return svg(h + ar(60, 80, 250, 80, 'b', p.B || 'B', 254, 84) + dim(62, 132, 240, 132, p.L || 'L', 0, -5) + tx(150, 20, p.N || 'N espiras', 's')); };
D.particulaB = p => svg(xfield(30, 20, 290, 150, 26) + ci(160, 85, 55, 'a', 'fn', 2, '5 4') + ci(105, 85, 7, 'k', 'fh') + ar(105, 78, 105, 40, 'b', p.v || 'v', 98, 46, 'end') + ar(112, 85, 145, 85, 'g', p.F || 'F', 140, 76, 'end') + dim(160, 85, 215, 85, p.R || 'R', 0, -5)
  + tx(270, 152, 'B (entrando)', 's', 'end'));
D.fioB = p => svg(re(20, 30, 50, 100, 'r', 'fr', 3) + tx(45, 85, 'N', 'k') + re(230, 30, 50, 100, 'b', 'fb', 3) + tx(255, 85, 'S', 'k') + ar(75, 140, 225, 140, 's', 'B', 150, 154, 'middle') + ci(150, 80, 10, 'k', 'fp') + ci(150, 80, 3, 'k', 'fk')
  + ar(150, 68, 150, 22, 'a', p.F || 'F', 158, 30) + tx(150, 108, p.i || 'i (saindo)', 's'));
D.fluxo = p => { let h = ''; for (let x = 90; x <= 210; x += 30) h += ar(x, 150, x, 20, 'b'); return svg(h + el(150, 85, 80, 22, 'a', 'fn', 3) + tx(260, 40, p.B || 'B', 'b') + tx(260, 90, p.A || 'área A', 'a') + tx(60, 150, p.t || '', 's')); };
D.ima = p => svg(re(20, 65, 50, 30, 'r', 'fr', 2) + tx(45, 85, 'N') + re(70, 65, 50, 30, 'b', 'fb', 2) + tx(95, 85, 'S') + ar(140, 80, 175, 80, 'k', 'v', 160, 72, 'middle') + el(220, 80, 16, 48, 'k', 'fn', 3)
  + ar(...[236, 60], ...[230, 40], 'a', p.i || 'i induzida', 244, 40) + tx(150, 150, p.t || 'a corrente induzida se opõe à aproximação', 's'));
D.trilho = p => svg(xfield(60, 30, 280, 135, 28) + ln(40, 40, 290, 40, 'k', 3) + ln(40, 120, 290, 120, 'k', 3) + re(32, 60, 16, 40, 'n', 'fp') + resistor(40, 60, 40, true) + tx(22, 84, p.R || 'R', 'a', 'end') + ln(190, 34, 190, 126, 'g', 5)
  + ar(196, 80, 250, 80, 'a', p.v || 'v', 254, 84) + dim(212, 40, 212, 120, '', 0, 0) + tx(222, 108, p.L || 'L', 's', 'start'));
D.geradorCA = p => svg(re(20, 40, 50, 80, 'r', 'fr', 3) + tx(45, 85, 'N') + re(230, 40, 50, 80, 'b', 'fb', 3) + tx(255, 85, 'S') + pa('M110,50 L190,40 L190,120 L110,110 Z', 'k', 'fn', 3) + ln(150, 20, 150, 140, 's', 1, '4 4')
  + arc(150, 20, 18, 200, 340, 'ω', 'a') + tx(150, 156, p.t || '', 's'));
D.transformador = p => { let c1 = '', c2 = ''; for (let k = 0; k < 6; k++) { c1 += el(80, 45 + k * 14, 18, 6, 'a', 'fn', 2); } for (let k = 0; k < 3; k++) c2 += el(220, 60 + k * 18, 18, 6, 'b', 'fn', 2);
  return svg(re(70, 25, 160, 110, 'k', 'fn', 14) + re(90, 45, 120, 70, 'k', 'fn', 2) + c1 + c2 + tx(30, 84, p.Up || 'U_p', 'a') + tx(272, 84, p.Us || 'U_s', 'b') + tx(80, 150, p.Np || 'N_p', 'a') + tx(220, 150, p.Ns || 'N_s', 'b')); };

/* ---------- Física moderna ---------- */
D.nave = p => svg(pa('M60,70 L200,70 L240,85 L200,100 L60,100 Z', 'k', 'fp', 2) + pa('M60,70 L40,55 L80,70 M60,100 L40,115 L80,100', 'k', 'fs', 2) + ci(205, 85, 6, 'b', 'fw') + ar(250, 85, 290, 85, 'a', '', 0, 0) + tx(150, 50, p.v || 'v', 'a')
  + (p.L ? dim(40, 130, 240, 130, p.L, 0, -5) : '') + tx(150, 152, p.t || '', 's'));
D.emc2 = p => { let h = ''; for (let k = 0; k < 12; k++) { const [x1, y1] = P(200, 80, 22, k * 30), [x2, y2] = P(200, 80, 52, k * 30); h += ln(x1, y1, x2, y2, 'a', 2); }
  return svg(blk(40, 60, 46, 40, p.m || 'm', 'fs') + ar(95, 80, 150, 80, 'k') + ci(200, 80, 18, 'a', 'fh') + h + tx(200, 150, p.E || 'E = mc²', 'a')); };
D.foton = p => svg(wavy(20, 80, 240, 80, 'a', '') + tx(130, 50, p.E || 'E = hf', 'a') + dim(60, 110, 60 + 8 * Math.PI, 110, p.l || 'λ', 0, 16));
D.fotoeletrico = p => svg(re(40, 30, 16, 100, 'k', 'fs', 2) + wavy(230, 30, 62, 70, 'a', '') + tx(190, 26, p.hf || 'hf', 'a') + ci(60, 90, 5, 'g', 'fg') + ar(66, 92, 200, 120, 'g', p.K || 'K_máx', 204, 124) + tx(48, 150, p.m || 'metal', 's'));
D.ondaMateria = p => { let d = ''; for (let x = 40; x <= 260; x += 2) { const t = (x - 150) / 50; d += (x === 40 ? 'M' : 'L') + x + ',' + n1(80 - 30 * Math.exp(-t * t) * Math.cos(x / 5)) + ' '; }
  return svg(pa(d, 'b', 'fn', 2) + ci(150, 80, 6, 'g', 'fg') + ar(200, 130, 250, 130, 'a', p.v || 'v', 254, 134) + tx(150, 20, p.t || 'λ = h / (m v)', 's')); };
D.bohr = p => svg(nucleus(80, 80, 5, 5) + [26, 48, 74].map((r, i) => ci(80, 80, r, 's', 'fn', 1.2) + tx(80 + r * 0.77 + 3, 80 + r * 0.64 + 4, 'n=' + (i + 1), 's', 'start', 10)).join('') + ci(80 + 74 * Math.cos(rad(30)), 80 - 74 * Math.sin(rad(30)), 5, 'b', 'fb')
  + ar(80 + 72 * Math.cos(rad(30)), 80 - 72 * Math.sin(rad(30)), 80 + 51 * Math.cos(rad(30)), 80 - 51 * Math.sin(rad(30)), 'k') + wavy(150, 50, 270, 30, p.c || 'r', '') + tx(210, 20, p.f || 'fóton', p.c || 'r') + tx(296, 152, p.t || '', 's', 'end'));
D.decaimento = p => svg(nucleus(90, 80, 9, 7) + nucleus(230, 60, 4, 5) + ar(130, 74, 205, 62, 'a', p.a || 'α', 168, 56, 'middle') + tx(90, 135, p.X || 'U-238', 'k') + tx(230, 100, p.Y || '+ Th-234', 's'));
D.meiaVida = p => { let d = ''; for (let x = 40; x <= 280; x += 3) d += (x === 40 ? 'M' : 'L') + x + ',' + n1(140 - 110 * Math.pow(0.5, (x - 40) / 60)) + ' ';
  return svg(axes(40, 140, 250, 125, 't', 'N') + pa(d, 'a', 'fn', 2.5) + [0, 1, 2, 3].map(k => ln(40 + 60 * k, 140, 40 + 60 * k, 140 - 110 * Math.pow(0.5, k), 's', 1, '3 3') + tx(40 + 60 * k, 154, k ? k + 'T' : '0', 's', 'middle', 10)).join('')
    + tx(48, 34, 'N₀', 's', 'start', 10) + tx(108, 89, 'N₀/2', 's', 'start', 10) + tx(168, 114, 'N₀/4', 's', 'start', 10) + tx(240, 40, p.t || '', 'a')); };
D.fissao = p => svg(ci(30, 80, 5, 'k', 'fs') + ar(36, 80, 70, 80, 'k') + nucleus(100, 80, 9, 7) + ar(130, 80, 160, 80, 'k') + nucleus(195, 50, 6, 6) + nucleus(195, 115, 6, 6) + [30, 80, 130].map(y => ci(260, y, 5, 'k', 'fs') + ar(225, 80, 252, y, 's')).join('')
  + tx(100, 135, p.a || 'U-235', 'k') + tx(150, 155, p.E || '≈ 200 MeV', 'a'));
D.usina = p => svg(ground(10, 290, 140) + pa('M40,140 L40,80 Q70,40 100,80 L100,140 Z', 'k', 'fs', 2) + pa('M150,140 Q160,90 150,40 L210,40 Q200,90 210,140 Z', 'k', 'fp', 2) + pa('M170,36 Q160,20 180,12 Q200,4 195,24', 's', 'fn', 2)
  + pa('M250,60 L238,96 L252,96 L242,130', 'a', 'fn', 3) + tx(70, 118, 'reator', 's', 'middle', 10) + tx(250, 150, p.P || '', 'a'));

/* ---------- Astronomia ---------- */
D.espectro = p => { const B = l => 1 / (Math.pow(l, 5) * (Math.exp(1.15 / l) - 1)), lam = x => (x - 40) / 240 * 1.15 + 0.05, max = B(1.15 / 4.965);
  let d = ''; for (let x = 42; x <= 280; x += 2) d += (x === 42 ? 'M' : 'L') + x + ',' + n1(140 - 100 * B(lam(x)) / max) + ' ';
  const xp = 40 + (1.15 / 4.965 - 0.05) / 1.15 * 240;
  return svg(axes(40, 140, 250, 125, 'λ', 'brilho') + pa(d, 'a', 'fn', 2.5) + ln(xp, 140, xp, 40, 's', 1, '3 3') + tx(xp + 6, 36, p.l || 'λ_máx', 'a', 'start') + tx(296, 70, p.T || '', 's', 'end')); };
D.estrela = p => svg(ci(110, 80, 50, 'a', 'fh', 2) + dim(110, 80, 160, 80, p.R || 'R', 0, -6) + [0, 40, 80, 280, 320].map(a => { const [x1, y1] = P(110, 80, 58, a), [x2, y2] = P(110, 80, 80, a); return ar(x1, y1, x2, y2, 'a'); }).join('') + tx(240, 70, p.T || 'T', 'k') + tx(240, 92, p.L || 'L', 'a'));
D.galaxia = p => svg(el(80, 80, 50, 18, 's', 'fs', 1) + pa('M80,80 Q110,60 125,78 M80,80 Q50,100 35,82', 'k', 'fn', 2) + ci(80, 80, 6, 'a', 'fa') + ar(140, 80, 190, 80, 'a', p.v || 'v', 194, 84)
  + re(200, 110, 90, 22, 'k', 'fs', 2) + ln(225, 110, 225, 132, 's', 2) + ln(238, 110, 238, 132, 'r', 3) + tx(245, 150, p.t || 'linhas desviadas ao vermelho', 'r'));
D.paralaxe = p => svg(sun(150, 120, 10) + el(150, 120, 70, 18, 's', 'fn', 1.2) + ci(80, 120, 6, 'b', 'fw') + ci(220, 120, 6, 'b', 'fw') + ci(150, 18, 4, 'a', 'fa') + ln(80, 120, 150, 18, 's', 1, '3 3') + ln(220, 120, 150, 18, 's', 1, '3 3')
  + ln(150, 120, 150, 18, 's', 1) + arc(150, 18, 26, -90, -55, p.p || 'p', 'k') + tx(180, 16, p.e || 'estrela', 'a', 'start') + tx(150, 152, p.t || '1 UA', 's'));
D.escala = p => svg(sun(30, 60, 12) + ci(120, 60, 5, 'b', 'fw') + dim(30, 84, 120, 84, '1 UA', 0, 14) + ln(30, 120, 280, 120, 'a', 2, '6 4') + tx(150, 112, p.ly || '1 ano-luz ≈ 63 000 UA', 'a') + tx(150, 150, p.t || '', 's'));
D.magnitude = p => svg(re(0, 0, 300, 160, 'n', 'fd') + [[80, 70, 14, 'm = 1'], [220, 80, 4, 'm = 6']].map(([x, y, r, l]) => { let h = ci(x, y, r, 'a', 'fa', 1); for (let k = 0; k < 4; k++) { const [x1, y1] = P(x, y, r + 3, k * 45), [x2, y2] = P(x, y, r + 3 + r, k * 45), [x3, y3] = P(x, y, r + 3, k * 45 + 180), [x4, y4] = P(x, y, r + 3 + r, k * 45 + 180); h += ln(x1, y1, x2, y2, 'a', 1.5) + ln(x3, y3, x4, y4, 'a', 1.5); } return h + tx(x, 140, l, 'p'); }).join(''));
D.buracoNegro = p => svg(re(0, 0, 300, 160, 'n', 'fd') + el(150, 80, 110, 22, 'a', 'fn', 4) + ci(150, 80, 36, 'p', 'fd', 2) + ci(150, 80, 50, 'p', 'fn', 1).replace('stroke-width="1"', 'stroke-width="1" stroke-dasharray="4 4"') + tx(150, 150, p.R || 'R_S', 'p'));
D.planeta = p => svg(ci(130, 80, 60, 'k', 'fw', 2) + pa('M75,60 Q130,75 185,58 M72,96 Q130,110 188,98', 'b', 'fn', 1.5) + dim(130, 80, 190, 80, p.R || 'R', 0, -6) + ar(230, 30, 200, 52, 'a', p.g || 'g₀', 236, 28) + tx(130, 156, p.d || '', 's'));
D.satelite = p => svg(ci(150, 80, 26, 'b', 'fw', 2) + ci(150, 80, 66, 's', 'fn', 1.2) + re(208, 40, 14, 10, 'k', 'fs', 1) + ln(200, 45, 230, 45, 'k', 2) + dim(150, 80, 176, 80, '', 0, 0) + dim(150, 100, 216, 100, p.r || 'r', 0, 14)
  + tx(150, 84, p.planeta || 'Terra', 'k', 'middle', 10) + tx(250, 20, p.t || 'T = 1 dia', 's'));

/* =================================================================
   MAPA: fórmula → [desenho, rótulos com os números do exemplo]
   ================================================================= */
const MAPA = {
  // Mecânica · cinemática escalar
  'vel-media': ['carro', { v: '80 km/h', d: '120 km', t: '1,5 h' }],
  'acel-media': ['carro', { v: '0 → 30 m/s', a: 'a', t: '10 s' }],
  'mu-horaria': ['carro', { v: '5 m/s', d: 's₀ = 20 m', t: 't = 4 s' }],
  'mu-encontro': ['encontro', { va: '20 m/s', vb: '10 m/s', d: '300 m' }],
  'muv-posicao': ['carro', { v: 'v₀ = 4 m/s', a: 'a = 2 m/s²', t: 't = 3 s' }],
  'muv-velocidade': ['grafico', { tx: '3 s', ty: '10', area: 'v = v₀ + at' }],
  'torricelli': ['carro', { v: '20 m/s', a: '−5 m/s²', d: 'Δs = ?' }],
  'muv-vel-media': ['grafico', { tx: '3 s', ty: '10', area: 'Δs = área = 21 m', flat: false }],
  'queda-livre': ['queda', { h: '45 m', v: 'v = 30 m/s', t: 't = 3 s' }],
  'lanc-vertical': ['vertical', { v: '30 m/s', h: 'H = 45 m', t: '' }],
  'lanc-horizontal': ['horizontal', { v: '15 m/s', h: '20 m', A: 'A = 30 m' }],
  'obl-componentes': ['componentes', { a: 'v₀ = 20 m/s', ax: 'v₀ₓ', ay: 'v₀y', ang: 30 }],
  'obl-tempo-altura': ['obliquo', { v: '20 m/s', th: '30°', ang: 30, H: 'H = 5 m', A: '' }],
  'obl-alcance': ['obliquo', { v: '20 m/s', th: '30°', ang: 30, A: 'A ≈ 34,6 m', H: '' }],
  'obl-trajetoria': ['obliquo', { v: '20 m/s', th: '45°', ang: 45, A: 'parede a 20 m', H: 'y = 10 m', wall: 20, wallY: 10 }],
  'graf-areas': ['grafico', { tx: '4 s', ty: '20', area: 'área = 40 m' }],
  // vetorial
  'vet-resultante': ['vetores', { a: '4 N', b: '3 N', R: 'R ≈ 6,1 N', th: '60°', ang: 60 }],
  'vet-componentes': ['componentes', { a: 'a = 10', ax: 'aₓ = 8', ay: 'a_y = 6', ang: 37 }],
  'vet-vel-media': ['meiaVolta', { dr: '|Δr| = 2R = 20 m', arco: 'arco = πR ≈ 31,4 m', t: 'R = 10 m · 5 s' }],
  'vet-acel': ['curva', { v: '10 m/s', F: 'a_cp = 2', R: 'R = 50 m', t: 'a_t = 1,5' }],
  'mov-relativo': ['trem', { u: '1 m/s', v: '20 m/s' }],
  'travessia-rio': ['rio', { vb: '4 m/s', vc: '3 m/s', vr: '5 m/s', L: '80 m' }],
  // circular
  'periodo-frequencia': ['disco', { f: '1 200 rpm = 20 Hz', t: 'T = 0,05 s' }],
  'vel-angular': ['disco', { f: 'ω = 2π/T ≈ 126 rad/s' }],
  'vel-tangencial': ['circulo', { R: '0,3 m', v: 'v ≈ 18,8 m/s', noacp: true, t: 'f = 10 Hz' }],
  'mcu-angular': ['circulo', { R: '', v: 'ω', noacp: true, t: 'T₁ = 60 s · T₂ = 90 s' }],
  'acel-centripeta': ['circulo', { R: '100 m', v: '20 m/s', acp: 'a_cp = 4 m/s²' }],
  'mcuv': ['disco', { f: '0 → 20 rad/s em 4 s', t: 'α = 5 rad/s²' }],
  'transmissao-correia': ['correia', { Ra: '10 cm', Rb: '4 cm', fa: '1 Hz', fb: 'f = 2,5 Hz' }],
  'transmissao-eixo': ['eixo', { R: '35 cm', r: 'catraca 2,5 Hz', t: 'v ≈ 5,5 m/s' }],
  // dinâmica
  'newton-1': ['carro', { v: 'v constante', t: 'F_R = 0' }],
  'newton-2': ['blocoForca', { Fv: 10, m: '2 kg', F: 'F_R = 10 N', ang: 0 }],
  'newton-3': ['acaoReacao', {}],
  'peso': ['peso', { m: '60 kg', P: 'P = 600 N', N: 'N', t: 'Lua: 96 N' }],
  'normal': ['blocoForca', { Fv: 50, Nv: 70, Pv: 100, m: '10 kg', F: '50 N', ang: 37, N: 'N = 70 N', P: 'P = 100 N' }],
  'tracao': ['pendurado', { Tv: 6000, Pv: 5000, m: '500 kg', T: 'T = 6 000 N', P: 'P', a: '2 m/s²' }],
  'elastica': ['mola', { k: 'k = 200 N/m', x: '5 cm', F: 'F = 10 N' }],
  'molas-associacao': ['mola', { k: 'série: 50 N/m · paralelo: 200 N/m', x: 'x', F: 'F' }],
  'atrito-estatico': ['blocoForca', { Fv: 30, fv: 30, m: '10 kg', F: '30 N', ang: 0, f: 'f_e = 30 N' }],
  'atrito-cinetico': ['blocoForca', { m: '5 kg', F: 'F', ang: 0, f: 'f_c = 10 N' }],
  'plano-componentes': ['plano', { Pv: 40, Ptv: 20, Nv: 34.6, ang: 30, P: 'P = 40 N', Pt: 'P_t = 20 N', N: 'N ≈ 34,6 N', th: '30°' }],
  'plano-aceleracao': ['plano', { Pv: 1, Ptv: 0.5, Nv: 0.866, ang: 30, P: 'P', Pt: 'a = 5 m/s²', N: 'N', th: '30°' }],
  'plano-iminencia': ['plano', { Pv: 1, Ptv: 0.6, Nv: 0.8, ang: 37, P: 'P', Pt: 'f_e máx', N: 'N', th: '37°' }],
  'blocos-contato': ['blocos', { A: '2 kg', B: '4 kg', F: '30 N', t: 'F_AB = 20 N' }],
  'bloco-mesa': ['mesaPolia', { A: '3 kg', B: '2 kg' }],
  'atwood': ['atwood', { m1: '3 kg', m2: '2 kg' }],
  'elevador': ['elevador', { N: 'N = 840 N', a: '2 m/s²', t: '70 kg' }],
  'resultante-centripeta': ['curva', { v: '20 m/s', F: 'F_cp = 4 000 N', R: 'R = 100 m', t: '1 000 kg' }],
  'loop': ['loop', { v: 'v_mín = 5 m/s', R: '2,5 m' }],
  'curva-atrito': ['curva', { v: 'v_máx = 20 m/s', F: 'atrito', R: 'R = 80 m', t: 'μ = 0,5' }],
  'curva-sobrelevada': ['plano', { ang: 22, P: 'P', Pt: 'curva inclinada', N: 'N', th: '22°' }],
  // energia
  'trabalho-constante': ['blocoForca', { m: 'caixa', F: '50 N', ang: 60, d: 'd = 10 m' }],
  'trabalho-peso': ['rampa', { h: '5 m', v: 'τ_P = +100 J', t: '2 kg' }],
  'trabalho-variavel': ['mola', { k: 'k = 400 N/m', x: '10 cm', F: 'τ = 2 J' }],
  'energia-cinetica': ['carro', { v: '72 km/h = 20 m/s', t: '1 000 kg' }],
  'teorema-ec': ['carro', { v: '20 m/s → 0', d: '40 m', a: '−5 000 N', t: '1 000 kg' }],
  'ep-gravitacional': ['altitude', { h: '10 m', g: 'g', planeta: 'solo', t: '50 kg' }],
  'ep-elastica': ['mola', { k: 'k = 200 N/m', x: '20 cm', F: 'E = 4 J' }],
  'conservacao-em': ['rampa', { h: '5 m', v: 'v = 10 m/s', t: 'sem atrito' }],
  'em-dissipativa': ['rampa', { h: '60,3 m', v: 'v = 30 m/s', t: '70 kg', atr: 'atrito: 10 710 J' }],
  'potencia-media': ['guincho', { m: '100 kg', h: '10 m', t: '20 s → 500 W' }],
  'potencia-instantanea': ['carro', { v: '30 m/s', a: 'F = 3 000 N', t: 'P = 90 kW' }],
  'rendimento': ['sankey', { tot: '2 000 W', util: '1 500 W', diss: '500 W' }],
  // impulso
  'quantidade-movimento': ['parede', { v1: '15 m/s', v2: '', t: 'Q = 0,4 · 15 = 6 kg·m/s' }],
  'impulso': ['blocoForca', { m: 'bola', F: '200 N por 0,05 s', ang: 0 }],
  'teorema-impulso': ['parede', { v1: '20 m/s', v2: '20 m/s', t: '0,5 kg · 0,01 s' }],
  'conservacao-q': ['recuo', { vb: '400 m/s', vr: '2 m/s' }],
  'coef-restituicao': ['quique', { v1: '10 m/s', v2: '6 m/s' }],
  'colisao-inelastica': ['colisao', { ma: '2 kg', mb: '1 kg', va: '6 m/s', juntos: true, v: '4 m/s' }],
  'colisao-elastica': ['colisao', { ma: '1 kg', mb: '3 kg', va: '4 m/s', vaa: '−2 m/s', vbb: '2 m/s' }],
  // gravitação
  'gravitacao-universal': ['massas', { M: '1 t', m: '1 t', d: '1 m' }],
  'campo-gravitacional': ['altitude', { h: 'h = R', g: 'g = 2,5 m/s²', planeta: 'Terra' }],
  'ep-universal': ['escape', { v: 'até o infinito', planeta: 'Terra', t: 'ΔE = m g₀ R' }],
  'kepler-1': ['orbita', { a: 72, e: 0.017, peri: '147 mi km', af: '152 mi km', t: 'a ≈ 150 milhões de km' }],
  'kepler-2': ['orbita', { a: 80, e: 0.5, peri: '1 UA · 30 km/s', af: '3 UA', v: 'v_a = 10 km/s', astro: 'Sol', t: '' }],
  'kepler-3': ['orbita', { circ: true, r: '1,52 UA', v: 'Marte', t: 'T ≈ 1,87 ano' }],
  'velocidade-orbital': ['satelite', { r: 'r ≈ R', t: 'v = 8 km/s' }],
  'velocidade-escape': ['escape', { v: '11,3 km/s', planeta: 'Terra' }],
  'energia-orbita': ['orbita', { circ: true, r: 'r → 2r', v: 'satélite', astro: 'planeta', t: 'ΔE = GMm/4r' }],
  // estática
  'equilibrio-ponto': ['luminaria', { P: 'P = 20 N', T: 'T = 20 N', th: '30°' }],
  'lamy': ['luminaria', { P: 'P', T: 'T', th: '' }],
  'momento': ['chave', { F: '20 N', b: '0,3 m' }],
  'equilibrio-extenso': ['gangorra', { P1: '300 N', P2: '400 N', b1: '2 m', b2: '1,5 m', x1: 50, x2: 225 }],
  'centro-gravidade': ['gangorra', { P1: '2 kg', P2: '3 kg', b1: 'x_CM = 3 m', b2: '', x1: 50, x2: 230 }],
  'alavanca': ['alavanca', { R: '600 N', F: 'F = 100 N', br: '0,5 m', bp: '3 m' }],
  'polias': ['polias', { P: '800 N', F: '100 N', n: '3 polias móveis' }],
  // hidrostática
  'densidade': ['cubo', { m: '540 g', V: '200 cm³' }],
  'pressao': ['pressao', { F: '600 N', A: '0,04 m²' }],
  'stevin': ['stevin', { h: '10 m', ponto: 'p = 2·10⁵ Pa', p0: 'p_atm = 10⁵ Pa' }],
  'pascal': ['prensa', { F1: '200 N', F2: '10 000 N', A1: 'A₁', A2: 'A₂ = 50 A₁' }],
  'empuxo': ['empuxo', { m: '2 L', E: 'E = 20 N' }],
  'flutuacao': ['iceberg', { sub: '92% submerso', t: 'gelo 0,92 g/cm³' }],
  'vasos-comunicantes': ['tuboU', { h1: '10 cm', h2: '8 cm', l1: 'óleo', l2: 'água' }],
  // Termologia
  'conversao-escalas': ['termometros', { v1: '40 °C', v2: '104 °F', v3: '313 K', f1: 52, f2: 52, f3: 52 }],
  'variacao-escalas': ['termometros', { v1: 'Δ = 10 °C', v2: 'Δ = 18 °F', v3: 'Δ = 10 K' }],
  'escala-arbitraria': ['termometros', { l1: '°C', l2: '°X', l3: '', v1: '50 °C', v2: '35 °X', v3: '', f3: 0 }],
  'dilatacao-linear': ['barra', { L0: '10 m', dL: '3,6 mm', t2: '+30 °C' }],
  'dilatacao-superficial': ['chapa', { A: '2 m²', dA: '+ 4·10⁻³ m²' }],
  'dilatacao-volumetrica': ['frasco', { t: '1 000 L → +20 L' }],
  'dilatacao-aparente': ['frasco', { t: '≈ 48,7 mL transbordam' }],
  'calor-sensivel': ['aquecimento', { m: '200 g', t: '20 → 70 °C', Q: 'Q = 10 000 cal' }],
  'capacidade-termica': ['aquecimento', { m: 'panela 500 g', t: 'c = 0,22', Q: 'C = 110 cal/°C' }],
  'equilibrio-termico': ['mistura', { a: '200 g · 80 °C', b: '300 g · 20 °C', e: '44 °C' }],
  'potencia-termica': ['aquecimento', { m: '1 L', t: '20 → 100 °C', Q: '1 000 W ≈ 5,6 min' }],
  'calor-latente': ['gelo', { m: '100 g', Q: 'Q = 8 000 cal', t: '0 °C' }],
  'curva-aquecimento': ['curvaAq', {}],
  'fourier': ['paredeCalor', { phi: 'Φ = 4 000 W', L: '4 mm', A: 'vidro 2 m²', Tq: 'Δθ = 10 °C' }],
  'stefan-boltzmann': ['radiacao', { T: '300 K', t: 'P ≈ 459 W por m²' }],
  'clapeyron': ['gas', { a: '1 mol', b: '0 °C · 1 atm', c: 'V = 22,4 L' }],
  'lei-geral-gases': ['gas', { a: '2 atm · 10 L · 300 K', b: '→ 12 L · 450 K', c: 'p = 2,5 atm' }],
  'dalton': ['gas', { a: 'ar: 21% O₂', b: 'p_O₂ = 0,21 atm' }],
  'energia-interna': ['gas', { a: '2 mol de He', b: '300 K', c: 'U ≈ 7,5 kJ' }],
  'teoria-cinetica': ['gas', { a: 'O₂ a 300 K', b: 'v ≈ 483 m/s' }],
  'isotermica': ['pv', { iso: true, lab: 'pV constante', v1: '6 L', v2: '3 L' }],
  'isobarica': ['gas', { a: 'p constante', b: '10 L → 15 L', c: '300 K → 450 K', flame: true }],
  'isovolumetrica': ['gas', { a: 'V constante (pneu)', b: '2 → 2,2 atm', c: '300 → 330 K' }],
  'adiabatica': ['pv', { iso: true, lab: 'Q = 0', v1: 'V', v2: 'V/2' }],
  'primeira-lei': ['gas', { Q: '500 J', W: 'τ = 200 J', a: 'ΔU = 300 J', flame: true }],
  'casos-primeira-lei': ['gas', { W: 'τ = 300 J', a: 'adiabática: Q = 0', b: 'ΔU = −300 J' }],
  'calores-molares': ['gas', { a: 'monoatômico', b: 'C_v ≈ 12,5', c: 'C_p ≈ 20,8 J/(mol·K)', flame: true }],
  'trabalho-isobarico': ['pv', { lab: 'τ = 600 J', v1: '2 L', v2: '5 L' }],
  'trabalho-area': ['pv', { ciclo: true, lab: 'τ = 200 J', v1: '2 L', v2: '4 L' }],
  'trabalho-isotermico': ['pv', { iso: true, lab: 'τ ≈ 1,7 kJ', v1: 'V', v2: '2V' }],
  'rendimento-maquina': ['maquina', { Qq: '1 000 J', Qf: '700 J', W: '300 J' }],
  'refrigerador': ['maquina', { ref: true, Qq: '800 J', Qf: '600 J', W: '200 J', Tq: 'cozinha', Tf: 'interior' }],
  'carnot': ['maquina', { Tq: '600 K', Tf: '300 K', W: 'τ', t: 'η máx = 50%' }],
  'entropia': ['gelo', { m: '100 g', Q: 'ΔS ≈ 122 J/K', t: '273 K' }],
  // Ondulatória
  'mhs-posicao': ['mhs', { v: 'v_máx = 1 m/s', t: 'A = 0,1 m · ω = 10 rad/s' }],
  'mhs-velocidade-x': ['mhs', { v: 'v = 0,8 m/s', t: 'x = 0,06 m' }],
  'massa-mola': ['mhs', { v: '', t: '0,5 kg · 50 N/m → T ≈ 0,63 s' }],
  'pendulo-simples': ['pendulo', { L: '2,5 m', t: 'T ≈ 3,1 s' }],
  'energia-mhs': ['mhs', { v: '', t: 'k = 200 N/m · A = 0,1 m → 1 J' }],
  'equacao-fundamental': ['som', { lambda: 'λ = 0,5 m', v: '340 m/s', t: '680 Hz' }],
  'periodo-onda': ['onda', { lambda: 'λ', A: 'A', v: 'v', f: '30 cristas em 10 s' }],
  'equacao-onda': ['onda', { lambda: 'λ = 0,5 m', A: '0,02 m', v: '5 m/s', f: 'f = 10 Hz' }],
  'taylor-corda': ['onda', { lambda: 'λ', A: 'A', v: '≈ 126 m/s', f: 'corda 2 m · 10 g · 80 N' }],
  'som-gases': ['som', { lambda: 'λ', v: '340 → 380 m/s', t: '289 K → 361 K' }],
  'reflexao-pulsos': ['pulso', {}],
  'refracao-ondas': ['refracaoOnda', { l1: '1 m', l2: '0,75 m', m1: 'fundo: 2 m/s', m2: 'raso: 1,5 m/s' }],
  'interferencia': ['interferencia', { P: 'P', t: 'Δx = 0,75 m = 1,5 λ' }],
  'young': ['young', { d: '0,2 mm', D: '2 m', y: 'Δy = 6 mm' }],
  'rede-difracao': ['young', { d: 'd', D: '', y: 'θ ≈ 14,5°' }],
  'estacionaria-corda': ['cordaEst', { n: 1, L: '0,65 m', t: 'f₁ = 220 Hz' }],
  'tubo-aberto': ['tubo', { L: '0,5 m' }],
  'tubo-fechado': ['tubo', { fechado: true, L: '0,5 m' }],
  'doppler': ['doppler', { v: '20 m/s' }],
  'eco': ['eco', { d: 'd = 600 m', t: 'eco em 0,8 s' }],
  'batimento': ['batimento', { t: '440 Hz e 443 Hz → 3 batimentos/s' }],
  'intensidade-sonora': ['fonte', { r: '10 m', t: 'I = 0,01 W/m²' }],
  'nivel-sonoro': ['fonte', { r: '', t: '0,01 W/m² → 100 dB' }],
  // Óptica
  'camara-escura': ['camara', { p: '12 m', pp: '20 cm', i: 'i = 10 cm', H: 100 }],
  'sombra': ['sombra', { h: '1 m', H: 'H = 30 m', s: '0,8 m', S: '24 m' }],
  'velocidade-luz': ['luz', { d: '1,5·10¹¹ m', c: 'c', t: 'Δt = 500 s ≈ 8,3 min' }],
  'leis-reflexao': ['reflexao', { i: '60°', r: '60°' }],
  'espelho-plano': ['espelhoPlano', { d: 'd', h: '1,80 m' }],
  'associacao-espelhos': ['espelhos', { ang: '60°', n: '5 imagens' }],
  'foco-raio': ['focoEspelho', { o: 'o', i: 'i', p: '', t: 'R = 40 cm → f = 20 cm' }],
  'gauss': ['espelhoGauss', { o: 'o', i: 'i', p: 'p = 30 cm', t: 'f = 20 cm → p′ = 60 cm' }],
  'aumento-linear': ['espelhoAumento', { o: '2 cm', i: '−4 cm', p: '30 cm', t: 'A = −2' }],
  'indice-refracao': ['refracaoSnell', { i: 'θ₁', r: 'θ₂', n1: 'vácuo (c)', n2: 'água · n = 1,33' }],
  'snell': ['refracaoSnell', { i: '45°', r: '32°', n1: 'ar', n2: 'água 1,33' }],
  'angulo-limite': ['reflexaoTotal', { t: 'L ≈ 49°' }],
  'dioptro-plano': ['dioptro', { p: '2 m', pp: '1,5 m' }],
  'lamina-paralela': ['lamina', { e: 'e = 3 cm', d: 'd ≈ 1,7 cm' }],
  'prisma': ['prisma', { A: 'A = 60° · n ≈ 1,73' }],
  'equacao-lentes': ['lenteReal', { f: 10, p: 10.2, K: 3, xl: 110, ho: 16, o: 'slide', i: 'imagem a ≈ 5 m →', t: 'f = 10 cm' }],
  'vergencia': ['lenteReal', { f: -50, p: null, K: 1.6, xl: 190, t: '−2 di → f = −50 cm' }],
  'fabricantes': ['lenteReal', { f: 20, p: null, K: 2.4, xl: 150, t: 'R = 20 cm · n = 1,5 → f = 20 cm' }],
  'associacao-lentes': ['lenteReal', { f: 50, p: null, K: 1.6, xl: 150, t: 'V = +2 di (encostadas)' }],
  'lupa': ['lenteReal', { f: 10, p: 8, K: 3, xl: 170, ho: 14, o: 'o', i: 'i', t: 'f = 10 cm → A = 5' }],
  'microscopio': ['microscopio', { a: 'objetiva 40×', b: 'ocular 10×', t: 'aumento 400×' }],
  'luneta': ['luneta', { a: 'objetiva f = 1 m', b: 'ocular f = 2 cm', t: 'G = f₁/f₂ = 50' }],
  'miopia': ['olho', { t: 'ponto remoto: 50 cm → −2 di' }],
  'hipermetropia': ['olho', { hiper: true, t: 'ponto próximo: 1 m → +3 di' }],
  // Eletricidade
  'carga-quantizada': ['eletrons', { Q: 'Q = −3,2 μC → 2·10¹³ elétrons' }],
  'coulomb': ['cargas', { q1: '2 μC', q2: '2 μC', d: '30 cm' }],
  'campo-eletrico': ['campo', { Q: '1 nC', d: '3 cm', E: 'E = 10⁴ N/C' }],
  'campo-uniforme': ['placas', { d: '2 mm', U: 'U = 100 V', e: 'e⁻' }],
  'potencial-eletrico': ['campo', { Q: '+3 μC', d: '0,9 m', E: 'V = 3·10⁴ V' }],
  'energia-potencial-eletrica': ['placas', { d: '', U: 'V = 1 000 V', e: 'próton' }],
  'trabalho-eletrico': ['placas', { d: '', U: 'U = 1 000 V', e: '1 keV' }],
  'condutor-esferico': ['esfera', { R: '10 cm', Q: 'Q = 2 nC · V = 180 V' }],
  'contato-esferas': ['contato', { a: '+8 μC', b: '−2 μC', r: '+3 μC em cada' }],
  'corrente': ['circuito', { R: 'R', E: 'ε', i: '2 A', t: '120 C em 1 min' }],
  'ohm-1': ['circuito', { R: '20 Ω', E: '120 V', i: 'i = 6 A' }],
  'ohm-2': ['fio', { L: '100 m de cobre', A: '2 mm²', rho: 'R = 0,85 Ω' }],
  'resistores-serie': ['serie', { R: ['2 Ω', '3 Ω', '5 Ω'], U: '20 V', i: '2 A' }],
  'resistores-paralelo': ['paralelo', { R: ['6 Ω', '3 Ω'] }],
  'potencia-eletrica': ['chuveiro', { P: '5 500 W', U: '220 V → 25 A', t: '' }],
  'energia-eletrica': ['chuveiro', { P: '5,5 kW · 20 min/dia', U: '55 kWh no mês', t: '' }],
  'gerador': ['circuito', { R: 'R', E: '12 V · 0,5 Ω', i: '4 A', t: 'U = 10 V' }],
  'receptor': ['circuito', { R: '', E: '110 V', i: '5 A', m: true, t: 'motor: ε′ = 100 V' }],
  'pouillet': ['circuito', { R: '5 Ω', E: '12 V · r = 1 Ω', i: 'i = 2 A' }],
  'kirchhoff': ['no', { i1: '3 A', i2: '2 A', i3: '5 A' }],
  'wheatstone': ['ponte', { R1: '10 Ω', R2: '20 Ω', R3: 'R₃ = 30 Ω', R4: '15 Ω' }],
  'capacitancia': ['capacitor', { U: '12 V', C: '100 μF', t: 'Q = 1,2 mC' }],
  'capacitor-plano': ['placas', { d: '1 mm', U: 'C ≈ 89 pF (0,01 m²)' }],
  'capacitores-associacao': ['capacitor', { U: 'U', C: '6 μF + 6 μF', t: 'série: 3 μF · paralelo: 12 μF' }],
  'energia-capacitor': ['capacitor', { U: '2 000 V', C: '100 μF', t: 'E = 200 J' }],
  // Eletromagnetismo
  'campo-fio': ['fioCampo', { i: '20 A', B: 'B = 4·10⁻⁵ T', d: '10 cm' }],
  'campo-espira': ['espira', { i: '5 A', R: '2π cm', B: 'B = 5·10⁻⁵ T' }],
  'campo-solenoide': ['solenoide', { N: '1 000 espiras · 2 A', L: '0,5 m', B: 'B ≈ 5 mT' }],
  'ampere': ['fioCampo', { i: 'i', B: 'B', d: 'r' }],
  'forca-carga': ['particulaB', { v: '10⁶ m/s', F: 'F', R: '' }],
  'raio-ciclotron': ['particulaB', { v: '10⁷ m/s', F: 'F', R: 'R ≈ 5,7 cm' }],
  'seletor-velocidades': ['placas', { d: '', U: 'E = 3·10⁴ V/m · B = 0,01 T', e: 'v = 3·10⁶ m/s' }],
  'forca-condutor': ['fioB', { F: 'F = 0,4 N', i: '5 A · 0,2 m · 0,4 T' }],
  'fios-paralelos': ['fiosParalelos', { i1: '1 A', i2: '1 A', d: '1 m' }],
  'fluxo-magnetico': ['fluxo', { B: '0,5 T', A: '0,02 m²', t: 'Φ = 0,01 Wb' }],
  'faraday': ['ima', { i: 'ε = 10 V', t: '100 espiras · ΔΦ = 0,01 Wb em 0,1 s' }],
  'lenz': ['ima', {}],
  'fem-movimento': ['trilho', { R: '2 Ω', v: '4 m/s', L: '0,5 m' }],
  'gerador-ca': ['geradorCA', { t: '127 V eficazes → 180 V de pico' }],
  'transformador': ['transformador', { Up: '220 V', Us: '11 V', Np: '2 000', Ns: '100' }],
  // Moderna
  'lorentz': ['nave', { v: 'v = 0,8 c → γ ≈ 1,67' }],
  'dilatacao-tempo': ['nave', { v: '0,8 c', t: '1 ano a bordo = 1,67 ano na Terra' }],
  'contracao-espaco': ['nave', { v: '0,6 c', L: '100 m → 80 m' }],
  'composicao-relativistica': ['nave', { v: '0,5 c + 0,5 c = 0,8 c' }],
  'emc2': ['emc2', { m: '1 g', E: 'E = 9·10¹³ J' }],
  'energia-relativistica': ['nave', { v: 'elétron a 0,6 c', t: 'E ≈ 0,64 MeV' }],
  'foton': ['foton', { E: 'E ≈ 2,5 eV', l: '500 nm' }],
  'fotoeletrico': ['fotoeletrico', { hf: '400 nm · 3,10 eV', K: 'K = 0,82 eV', m: 'sódio' }],
  'de-broglie': ['ondaMateria', { v: '10⁶ m/s', t: 'λ ≈ 0,73 nm' }],
  'heisenberg': ['ondaMateria', { v: 'Δp', t: 'Δx · Δp ≥ h/4π' }],
  'bohr-energia': ['bohr', { f: 'E₂ = −3,4 eV', t: '' }],
  'transicao': ['bohr', { f: '656 nm', c: 'r', t: 'n = 3 → n = 2' }],
  'decaimentos': ['decaimento', { a: 'α', X: 'U-238', Y: 'Th-234' }],
  'meia-vida': ['meiaVida', { t: '25% → 2 meias-vidas' }],
  'decaimento-exponencial': ['meiaVida', { t: '24 dias = 3T → 1/8' }],
  'energia-ligacao': ['decaimento', { a: '', X: 'He-4', Y: 'E_L ≈ 28,3 MeV' }],
  'fissao-fusao': ['fissao', { a: 'U-235', E: '≈ 200 MeV por fissão' }],
  'usina-nuclear': ['usina', { P: '1 GW' }],
  // Astronomia
  'kepler-ua': ['orbita', { circ: true, r: '5,2 UA', v: 'Júpiter', t: 'T ≈ 11,9 anos' }],
  'massa-astro': ['orbita', { circ: true, r: '1,5·10¹¹ m', v: 'Terra', t: 'M ≈ 2·10³⁰ kg' }],
  'geoestacionario': ['satelite', { r: 'r ≈ 42 000 km', t: 'T = 1 dia' }],
  'constante-solar': ['fonte', { sol: true, r: '1,5·10¹¹ m', P: 'Terra', t: 'I ≈ 1 360 W/m²' }],
  'densidade-planeta': ['planeta', { R: '6,4·10⁶ m', g: '10 m/s²', d: 'd ≈ 5,6 g/cm³' }],
  'velocidade-orbital-media': ['orbita', { circ: true, r: '1 UA', v: '≈ 30 km/s', t: '' }],
  'periodo-sinodico': ['sinodico', { a: 'Terra', b: 'Marte', t: 'S ≈ 2,1 anos' }],
  'schwarzschild': ['buracoNegro', { R: 'R_S ≈ 3 km (massa do Sol)' }],
  'wien': ['espectro', { l: '500 nm', T: 'T ≈ 5 800 K' }],
  'luminosidade': ['estrela', { R: '7·10⁸ m', T: '5 800 K', L: 'L ≈ 4·10²⁶ W' }],
  'redshift': ['galaxia', { v: '3 000 km/s', t: '656,3 → 662,9 nm' }],
  'hubble': ['galaxia', { v: '7 000 km/s', t: 'd = 100 Mpc' }],
  'unidades-astronomicas': ['escala', { ly: '1 ano-luz ≈ 63 000 UA' }],
  'paralaxe': ['paralaxe', { p: '0,77″', e: 'Próxima Centauri', t: 'd ≈ 1,3 pc' }],
  'magnitude': ['magnitude', {}],
};

window.ILUSTRACAO = id => { const m = MAPA[id]; if (!m || !D[m[0]]) return ''; try { return D[m[0]](m[1] || {}); } catch (e) { return ''; } };
window.ILUSTRACOES = { desenhos: D, mapa: MAPA }; // usado nos testes
})();

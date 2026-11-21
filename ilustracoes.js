/* Biblioteca de Fórmulas · ilustrações dos exemplos resolvidos.
   Cada desenho é uma função que recebe rótulos (os números do exemplo) e devolve um SVG responsivo.
   Linguagem visual: livro didático contemporâneo. O percurso de leitura é sempre objeto → grandeza → seta ou
   medida → valor. Objetos têm volume discreto (gradientes de luz por cima da cor chapada); vetores são grossos,
   coloridos e com rótulo em negrito; medidas são finas, cinzentas, com o valor sobre a própria linha.
   As cores vêm de classes (formulas.css) ligadas às variáveis do site, então o desenho segue o tema e a impressão.
   Traço: k tinta, s tinta suave, a laranja, b azul, g verde, r vermelho, p claro (sobre fundo escuro).
   Preenchimento: fn nenhum, fk tinta, fp cartão, fo objeto, fm metal, fs cinza, fa laranja, fb azul, fg verde,
   fr vermelho, fw azul claro (água, vidro), fh laranja claro, fd noite, fq papel (máscara).
   Texto: tk, ts, ta, tb, tg, tr, tp.
   Rótulos passam por um gerenciador que evita sobreposição e mantém tudo dentro da área de desenho; legendas
   longas vão para uma faixa própria, embaixo, com quebra de linha. MAPA (no fim) liga cada fórmula ao desenho. */
(function () {
const E = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const n1 = v => Math.round(v * 10) / 10;
const rad = d => d * Math.PI / 180;
const P = (cx, cy, r, deg) => [cx + r * Math.cos(rad(deg)), cy - r * Math.sin(rad(deg))];
const FS = 13.5, FSS = 12;          // corpo dos rótulos e corpo mínimo (em unidades do desenho; a largura-base é 300)
const ESCALA_MAX = 1.4;             // no desktop o desenho cresce no máximo 1,4× (13,5 → 19 px)
let UID = 0;

/* ---------- tipografia ---------- */
// rótulo em tipografia matemática: variáveis em itálico, índices rebaixados, unidades e palavras retas
function mathTxt(t) {
  const s = String(t); let out = '', last = 0, m;
  const re = /([A-Za-zΑ-Ωα-ωℓ]+)(?:_([A-Za-z0-9áéíóúçãõâêô,]+))?/g;
  while ((m = re.exec(s))) {
    out += E(s.slice(last, m.index));
    last = m.index + m[0].length;
    const base = m[1], sub = m[2], antes = s.slice(0, m.index), depois = s.slice(last);
    const letraSimples = base.length === 1 || (base.length === 2 && base[0] === 'Δ');
    const unidadeParen = /\(\s*$/.test(antes) && /^\s*\)/.test(depois);
    const variavel = letraSimples && !unidadeParen && !/([\d⁰-⁹\/·×^°])\s?$/.test(antes) && !/[°]$/.test(antes)
      && (sub !== undefined || /^\s*([=≈<>≤≥,.:;)+\-−·→/]|$)|^[′₀-₉⁰-⁹ₓ]|^ \(/.test(depois));
    out += variavel ? `<tspan font-style="italic">${E(base)}</tspan>` : E(base);
    if (sub !== undefined) out += `<tspan dy="0.28em" font-size="74%">${E(sub)}</tspan><tspan dy="-0.28em"> </tspan>`.replace('> </tspan>', '>&#8203;</tspan>');
  }
  return out + E(s.slice(last));
}
// largura estimada (em em) de cada caractere da Atkinson Hyperlegible
function cw(ch) {
  if (/[ilIj.,:;'|!·′″]/.test(ch)) return 0.27;
  if (/[frt()\[\]\/]/.test(ch)) return 0.37;
  if (ch === ' ' || ch === ' ' || ch === ' ') return 0.25;
  if (/[mwMW]/.test(ch)) return 0.84;
  if (/[A-ZΔΦΩΣ]/.test(ch)) return 0.66;
  if (/[0-9]/.test(ch)) return 0.58;
  if (/[→⇒=+−×<>≤≥≈~]/.test(ch)) return 0.64;
  if (/[⁰-⁹₀-₉ⁿ⁻⁺]/.test(ch)) return 0.36;
  if (/[°]/.test(ch)) return 0.36;
  return 0.55;
}
function largura(t, s = FS, bold = false) {
  let w = 0; const str = String(t);
  str.replace(/_([A-Za-z0-9áéíóúçãõâêô,]+)|([^_])/g, (m0, sub, ch) => { if (sub) for (const c of sub) w += cw(c) * 0.74; else w += cw(ch); return ''; });
  return w * s * (bold ? 1.06 : 1);
}
// quebra uma frase em linhas que caibam em "max" unidades
function quebra(t, max, s) {
  const pal = String(t).split(' '), linhas = []; let cur = '';
  for (const p of pal) { const tent = cur ? cur + ' ' + p : p; if (largura(tent, s) > max && cur) { linhas.push(cur); cur = p; } else cur = tent; }
  if (cur) linhas.push(cur);
  return linhas;
}

/* ---------- primitivas de traço ---------- */
const ln = (x1, y1, x2, y2, c = 'k', w = 2, dash) => `<line x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(x2)}" y2="${n1(y2)}" class="${c}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''} stroke-linecap="round"/>`;
const ci = (cx, cy, r, c = 'k', f = 'fn', w = 2, extra = '') => `<circle cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r)}" class="${c} ${f}" stroke-width="${w}"${extra}/>`;
const re = (x, y, w, h, c = 'k', f = 'fn', rx = 0, sw = 2, extra = '') => `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" rx="${rx}" class="${c} ${f}" stroke-width="${sw}"${extra}/>`;
const pa = (d, c = 'k', f = 'fn', w = 2, dash, extra = '') => `<path d="${d}" class="${c} ${f}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''} stroke-linejoin="round" stroke-linecap="round"${extra}/>`;
const el = (cx, cy, rx, ry, c = 'k', f = 'fn', w = 2, dash, extra = '') => `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(rx)}" ry="${n1(ry)}" class="${c} ${f}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}${extra}/>`;
const poly = (pts, c = 'k', f = 'fn', w = 2, extra = '') => `<polygon points="${pts.map(q => n1(q[0]) + ',' + n1(q[1])).join(' ')}" class="${c} ${f}" stroke-width="${w}" stroke-linejoin="round"${extra}/>`;
const path = pts => pts.map((q, i) => (i ? 'L' : 'M') + n1(q[0]) + ',' + n1(q[1])).join(' ');
const op = (s, o) => s.replace(/\/>$/, ` opacity="${o}"/>`);
const unit = (dx, dy) => { const L = Math.hypot(dx, dy) || 1; return [dx / L, dy / L]; };

/* ---------- a área de desenho ---------- */
class Fig {
  constructor(w, h) { this.w = w; this.h = h; this.id = 'il' + (++UID); this.partes = []; this.textos = []; this.caixas = []; this.legendas = []; this.defs = {}; this.avisos = []; this.rotulos = []; this.escuro = false; }
  add(...s) { this.partes.push(...s); return this; }
  // ----- volume: gradientes sobrepostos à cor chapada -----
  g(tipo) {
    const id = `${this.id}-${tipo}`;
    if (!this.defs[tipo]) this.defs[tipo] = ({
      vol: `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".62"/><stop offset=".45" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>`,
      esf: `<radialGradient id="${id}" cx=".36" cy=".32" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".35" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></radialGradient>`,
      cil: `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".3" stop-color="#fff" stop-opacity=".6"/><stop offset=".55" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".24"/></linearGradient>`,
      cilv: `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".3" stop-color="#fff" stop-opacity=".6"/><stop offset=".55" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".24"/></linearGradient>`,
      liq: `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".12" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>`,
      brilho: `<radialGradient id="${id}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".5" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`,
      sombra: `<radialGradient id="${id}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`,
    })[tipo];
    return `url(#${id})`;
  }
  luz(forma, tipo = 'vol') { return forma.replace(/class="[^"]*"/, `class="n" fill="${this.g(tipo)}"`).replace(/stroke-width="[^"]*"/, 'stroke-width="0"'); }
  // ----- rótulos sem colisão -----
  caixa(x, y, t, s, a, b) { const w = largura(t, s, b); const x0 = a === 'start' ? x : a === 'end' ? x - w : x - w / 2; return [x0, y - s * 0.8, w, s * 1.02]; }
  livre(bx) {
    const [x, y, w, h] = bx;
    if (x < 2 || x + w > this.w - 2 || y < 1 || y + h > this.h - 1) return false;
    return !this.caixas.some(o => x < o[0] + o[2] + 1.5 && x + w + 1.5 > o[0] && y < o[1] + o[3] + 1 && y + h + 1 > o[1]);
  }
  reserva(x, y, w, h) { this.caixas.push([x, y, w, h]); return this; }
  t(x, y, t, o = {}) {
    if (t === '' || t == null) return this;
    const s = o.s || FS, a0 = o.a || 'middle', c = o.c || 'k', b = !!o.b;
    const cands = [[0, 0]].concat(o.alt || [], o.fixo ? [] : [[0, -s * 0.7], [0, s * 0.7], [0, -s * 1.3], [0, s * 1.3], [s, 0], [-s, 0]]);
    let esc = null, recurso = null;
    for (const cand of cands) {
      const [dx, dy] = cand, a = cand[2] || a0;
      let X = x + dx, Y = y + dy, ajuste = 0; const bx = this.caixa(X, Y, t, s, a, b);
      if (bx[0] < 3) { ajuste += 3 - bx[0]; X += 3 - bx[0]; bx[0] = 3; } if (bx[0] + bx[2] > this.w - 3) { const d = bx[0] + bx[2] - (this.w - 3); ajuste += d; X -= d; bx[0] = this.w - 3 - bx[2]; }
      if (bx[1] < 2) { ajuste += 2 - bx[1]; Y += 2 - bx[1]; bx[1] = 2; } if (bx[1] + bx[3] > this.h - 2) { const d = bx[1] + bx[3] - (this.h - 2); ajuste += d; Y -= d; bx[1] = this.h - 2 - bx[3]; }
      const ok = this.livre(bx);
      if (!esc) esc = [X, Y, bx, a];
      if (ok && ajuste <= 4) { esc = [X, Y, bx, a]; recurso = null; break; }
      if (ok && !recurso) recurso = [X, Y, bx, a];
    }
    if (recurso) esc = recurso; else if (!this.livre(esc[2])) this.avisos.push('sobreposição: ' + t);
    const [X, Y, bx, a] = esc; this.caixas.push(bx); this.rotulos.push(String(t));
    this.textos.push(`<text x="${n1(X)}" y="${n1(Y)}" class="t${c}${b ? ' tb7' : ''}${o.it ? ' ti' : ''}${o.escuro ? ' th' : ''}" text-anchor="${a}" font-size="${s}">${mathTxt(t)}</text>`);
    return this;
  }
  // rótulo na ponta de uma seta: escolhe o lado pelo sentido da seta
  ponta(x2, y2, ux, uy, t, c, o = {}) {
    if (!t) return this;
    const s = o.s || FS, gap = o.gap ?? 7, lw = largura(t, s, true);
    let a, X, Y;
    if (ux > 0.38) { a = 'start'; X = x2 + gap * ux + 2; Y = y2 + s * 0.35 + gap * uy; }
    else if (ux < -0.38) { a = 'end'; X = x2 + gap * ux - 2; Y = y2 + s * 0.35 + gap * uy; }
    else { a = 'start'; X = x2 + 8; Y = uy < 0 ? y2 + s * 0.75 : y2 - 1; }
    const alt = (o.alt || []).slice();
    if (o.base) {                       // acima e abaixo da haste, ou ao lado dela
      const [x1, y1] = o.base, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      if (Math.abs(ux) > 0.38) { alt.push([mx - X, my - 8 - Y, 'middle'], [mx - X, my + s + 6 - Y, 'middle']); }
      else { alt.push([-16, 0, 'end'], [mx + 8 - X, my + 5 - Y, 'start'], [mx - 8 - X, my + 5 - Y, 'end']); }
    }
    if (Math.abs(ux) > 0.38) alt.push([0, -s * 0.9], [0, s * 0.9]); else alt.push([-(lw / 2 + 8) - 8, uy < 0 ? -s - 6 : s + 8, 'middle']);
    return this.t(X, Y, t, Object.assign({ c, a, b: true }, o, { alt }));
  }
  legenda(t, c = 's') { if (Array.isArray(t)) t.forEach(l => this.legenda(l, c)); else if (t) this.legendas.push([t, c]); return this; }
  foraEscala(txt = 'fora de escala') { this.t(this.w - 4, 13, txt, { a: 'end', c: 's', s: FSS - 0.5, it: true, fixo: true, alt: [[0, 14]] }); return this; }
  svg() {
    // faixa de legenda: frases longas, centralizadas, com quebra de linha
    let extra = '', H = this.h;
    if (this.legendas.length) {
      const s = FSS + 0.5, lh = s * 1.32; let y = H + 4;
      extra += re(0, H, this.w, 400, 'n', 'fq', 0, 0) + ln(16, y, this.w - 16, y, 's', 0.8, '2 3');
      y += 4;
      for (const [t, c] of this.legendas) for (const l of quebra(t, this.w - 20, s)) { y += lh; extra += `<text x="${this.w / 2}" y="${n1(y - lh * 0.24)}" class="t${c} leg" text-anchor="middle" font-size="${s}">${mathTxt(l)}</text>`; this.rotulos.push(l); }
      H = y + 6;
    }
    const defs = Object.values(this.defs).join('');
    const rot = this.rotulos.filter(Boolean).join('; ');
    return `<svg viewBox="0 0 ${this.w} ${n1(H)}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${E('Ilustração do exemplo' + (rot ? ': ' + rot : ''))}" focusable="false" class="fb-svg${this.escuro ? ' escuro' : ''}" style="max-width:${Math.round(this.w * ESCALA_MAX)}px" data-avisos="${this.avisos.length}">`
      + (defs ? `<defs>${defs}</defs>` : '') + this.partes.join('') + `<g class="rot">${this.textos.join('')}${extra}</g></svg>`;
  }
}
const fig = (w, h, build) => { const c = new Fig(w, h); build(c); return c; };

/* ---------- setas, cotas e ângulos ---------- */
// vetor: haste grossa e ponta desenhada (sem marcadores, para não repetir ids)
function seta(x1, y1, x2, y2, c = 'a', w = 2.8, o = {}) {
  const [ux, uy] = unit(x2 - x1, y2 - y1), h = o.h || (5 + w * 2.1), s = o.s || (2.2 + w * 1.05);
  const bx = x2 - ux * h, by = y2 - uy * h, px = -uy, py = ux;
  const cabeca = `<path d="M${n1(x2)},${n1(y2)} L${n1(bx + px * s)},${n1(by + py * s)} Q${n1(x2 - ux * h * 0.72)},${n1(y2 - uy * h * 0.72)} ${n1(bx - px * s)},${n1(by - py * s)} Z" class="n f${c}" stroke-width="0"/>`;
  return ln(x1, y1, x2 - ux * h * 0.6, y2 - uy * h * 0.6, c, w, o.dash) + cabeca;
}
// vetor com rótulo na ponta
function vetor(F, x1, y1, x2, y2, c, lab, o = {}) {
  F.add(seta(x1, y1, x2, y2, c, o.w || 2.8, o));
  if (lab) { const [ux, uy] = unit(x2 - x1, y2 - y1); F.ponta(x2, y2, ux, uy, lab, c, Object.assign({ base: [x1, y1] }, o)); }
  return F;
}
// ponta de seta pequena no meio de um raio de luz (sentido de propagação)
function sentido(A, B, c = 'a', k = 0.5) {
  const [ux, uy] = unit(B[0] - A[0], B[1] - A[1]), x = A[0] + (B[0] - A[0]) * k, y = A[1] + (B[1] - A[1]) * k, px = -uy, py = ux;
  return `<path d="M${n1(x + ux * 5)},${n1(y + uy * 5)} L${n1(x - ux * 4 + px * 4)},${n1(y - uy * 4 + py * 4)} L${n1(x - ux * 4 - px * 4)},${n1(y - uy * 4 - py * 4)} Z" class="n f${c}"/>`;
}
// cota: linha fina com pontas de seta e o valor sobre a linha (o halo do texto abre um vão no traço)
function cota(F, x1, y1, x2, y2, lab, o = {}) {
  const [ux, uy] = unit(x2 - x1, y2 - y1), px = -uy, py = ux, L = Math.hypot(x2 - x1, y2 - y1), k = 5, c = o.c || 's';
  const tick = (x, y) => ln(x - px * 5, y - py * 5, x + px * 5, y + py * 5, c, 1.1);
  const cab = (x, y, sx) => `<path d="M${n1(x)},${n1(y)} L${n1(x + sx * ux * k + px * 2.6)},${n1(y + sx * uy * k + py * 2.6)} L${n1(x + sx * ux * k - px * 2.6)},${n1(y + sx * uy * k - py * 2.6)} Z" class="n f${c === 's' ? 'k' : c}" opacity=".7"/>`;
  F.add(ln(x1, y1, x2, y2, c, 1.1) + tick(x1, y1) + tick(x2, y2) + (L > 18 ? cab(x1, y1, 1) + cab(x2, y2, -1) : ''));
  if (lab) {
    const mx = (x1 + x2) / 2 + (o.dx || 0), my = (y1 + y2) / 2 + (o.dy || 0), s = o.s || FS;
    const lw = largura(lab, s);
    if (Math.abs(ux) > 0.7 && (lw < L - 14 || o.sobre)) { const n0 = F.textos.length; F.t(mx, my + s * 0.35, lab, { c: o.tc || 's', alt: [[0, -s * 0.85], [0, s * 0.95]] }); const bx = F.caixas[F.caixas.length - 1]; if (F.textos.length > n0 && Math.abs(bx[1] + bx[3] / 2 - my) < s * 0.6) F.add(re(bx[0] - 3, bx[1] + 1, bx[2] + 6, bx[3] - 2, 'n', 'fq', 2, 0)); }
    else if (Math.abs(ux) > 0.7) F.t(mx, my + (o.lado === 'acima' ? -6 : s + 3), lab, { c: o.tc || 's', alt: [[0, o.lado === 'acima' ? s + 9 : -s - 9]] });
    else { const ld = o.lado === 'esq' ? -1 : 1; F.t(mx + ld * 7, my + s * 0.35, lab, { c: o.tc || 's', a: ld < 0 ? 'end' : 'start', alt: [[0, -s], [0, s], [-ld * 14 - ld * lw, 0]] }); }
  }
  return F;
}
// arco de ângulo (graus no sentido matemático, y para cima)
function angulo(F, cx, cy, r, a1, a2, lab, c = 'k', o = {}) {
  const [x1, y1] = P(cx, cy, r, a1), [x2, y2] = P(cx, cy, r, a2), large = Math.abs(a2 - a1) > 180 ? 1 : 0, sweep = a2 > a1 ? 0 : 1;
  F.add(pa(`M${n1(x1)},${n1(y1)} A${r},${r} 0 ${large} ${sweep} ${n1(x2)},${n1(y2)}`, c === 'k' ? 's' : c, 'fn', 1.4));
  if (lab) { const rr = r + (o.fora ?? 10) + largura(lab, FS) * 0.32, [lx, ly] = P(cx, cy, rr, (a1 + a2) / 2); F.t(lx, ly + FS * 0.35, lab, { c: c === 's' ? 's' : c === 'k' ? 'k' : c, alt: o.alt || [] }); }
  return F;
}
const reto = (x, y, ux, uy, k = 9) => pa(`M${n1(x + ux * k)},${n1(y + uy * k)} L${n1(x + ux * k - uy * k)},${n1(y + uy * k + ux * k)} L${n1(x - uy * k)},${n1(y + ux * k)}`, 's', 'fn', 1.1);

/* ---------- cenário ---------- */
function chao(F, x1, x2, y, o = {}) {
  F.add(re(x1, y, x2 - x1, o.alto || 10, 'n', 'fs', 0, 0, ' opacity=".55"'));
  let h = ''; for (let x = x1 + 4; x < x2 - 2; x += 8) h += ln(x, y + 2, x - 5, y + 8, 's', 0.8);
  F.add(`<g opacity=".7">${h}</g>` + ln(x1, y, x2, y, 'k', 2));
  return F;
}
function parede(F, x, y1, y2, lado = -1) {
  F.add(re(lado < 0 ? x - 10 : x, y1, 10, y2 - y1, 'n', 'fs', 0, 0, ' opacity=".55"'));
  let h = ''; for (let y = y1 + 4; y < y2 - 2; y += 8) h += ln(x + 2 * lado, y, x + 8 * lado, y + 5, 's', 0.8);
  F.add(`<g opacity=".7">${h}</g>` + ln(x, y1, x, y2, 'k', 2));
  return F;
}
function teto(F, x1, x2, y) {
  F.add(re(x1, y - 9, x2 - x1, 9, 'n', 'fs', 0, 0, ' opacity=".55"'));
  let h = ''; for (let x = x1 + 4; x < x2 - 2; x += 8) h += ln(x, y - 2, x - 5, y - 8, 's', 0.8);
  F.add(`<g opacity=".7">${h}</g>` + ln(x1, y, x2, y, 'k', 2));
  return F;
}
// sombra de contato no chão
const sombraChao = (F, cx, y, rx) => F.add(el(cx, y + 1, rx, 3.2, 'n', 'fn', 0).replace('class="n fn"', `class="n" fill="${F.g('sombra')}"`));

/* ---------- objetos com volume ---------- */
function bloco(F, x, y, w, h, lab, o = {}) {
  const f = o.f || 'fo', rx = o.rx ?? 3;
  if (!o.semSombra && o.chao) sombraChao(F, x + w / 2, y + h, w * 0.62);
  const r = re(x, y, w, h, 'k', f, rx, 1.8);
  F.add(r + F.luz(r) + ln(x + 3, y + 2.2, x + w - 3, y + 2.2, 'p', 1.2).replace('/>', ' opacity=".7"/>'));
  F.reserva(x + 1, y + 1, w - 2, h - 2);
  const sb = o.s || Math.max(11, Math.min(FS, (w - 8) / (largura(lab || '', 1, true) || 1)));
  if (lab) F.add(`<text x="${n1(x + w / 2)}" y="${n1(y + h / 2 + FS * 0.36)}" class="tk tb7" text-anchor="middle" font-size="${n1(sb)}">${mathTxt(lab)}</text>`) && F.rotulos.push(lab);
  return F;
}
// bloco girado (plano inclinado): centro da base, ângulo em graus (sentido anti-horário visto na tela = subida para a direita)
function blocoGirado(F, bx, by, w, h, ang, lab) {
  const a = -rad(ang), ux = Math.cos(a), uy = Math.sin(a), nx = uy, ny = -ux;   // u: ao longo da rampa (para cima); n: normal para fora
  const pts = [[bx - ux * w / 2, by - uy * w / 2], [bx + ux * w / 2, by + uy * w / 2], [bx + ux * w / 2 + nx * h, by + uy * w / 2 + ny * h], [bx - ux * w / 2 + nx * h, by - uy * w / 2 + ny * h]];
  const p = poly(pts, 'k', 'fo', 1.8);
  F.add(p + F.luz(p));
  if (lab) F.add(`<text x="${n1(bx + nx * h / 2)}" y="${n1(by + ny * h / 2 + 4)}" class="tk tb7" text-anchor="middle" font-size="${FSS}" transform="rotate(${-ang} ${n1(bx + nx * h / 2)} ${n1(by + ny * h / 2)})">${mathTxt(lab)}</text>`);
  return { c: [bx + nx * h / 2, by + ny * h / 2], u: [ux, uy], n: [nx, ny] };
}
function bola(F, x, y, r, f = 'fa', o = {}) {
  if (o.chao != null) sombraChao(F, x, o.chao, r * 0.9);
  const c = ci(x, y, r, 'k', f, 1.5);
  F.add(c + F.luz(c, 'esf'));
  if (o.lab) F.add(`<text x="${n1(x)}" y="${n1(y + FSS * 0.36)}" class="tk tb7" text-anchor="middle" font-size="${o.s || FSS}">${mathTxt(o.lab)}</text>`);
  return F;
}
// carro de perfil, virado para a direita (dir = -1 vira para a esquerda); (x, y) = ponto do chão sob a traseira
function carro(F, x, y, o = {}) {
  const d = o.dir || 1, L = o.L || 96, k = L / 96, X = v => x + d * v * k, Y = v => y - v * k;
  sombraChao(F, x + d * L / 2, y, L * 0.55);
  const corpo = `M${X(4)},${Y(12)} L${X(4)},${Y(26)} Q${X(5)},${Y(31)} ${X(12)},${Y(32)} L${X(24)},${Y(33)} L${X(36)},${Y(46)} Q${X(39)},${Y(48)} ${X(44)},${Y(48)} L${X(64)},${Y(48)} Q${X(68)},${Y(48)} ${X(71)},${Y(45)} L${X(81)},${Y(33)} L${X(89)},${Y(31)} Q${X(94)},${Y(29)} ${X(94)},${Y(24)} L${X(94)},${Y(15)} Q${X(94)},${Y(12)} ${X(90)},${Y(12)} Z`;
  const b = pa(corpo, 'k', o.f || 'fcar', 1.8);
  const vid = pa(`M${X(28)},${Y(33.5)} L${X(38)},${Y(44)} L${X(52)},${Y(44)} L${X(52)},${Y(33.5)} Z M${X(56)},${Y(33.5)} L${X(56)},${Y(44)} L${X(65)},${Y(44)} L${X(74)},${Y(33.5)} Z`, 's', 'fw', 1.2);
  F.add(b + F.luz(b) + vid + ln(X(8), Y(20), X(90), Y(20), 's', 0.8).replace('/>', ' opacity=".6"/>'));
  for (const wx of [22, 74]) { const r1 = ci(X(wx), Y(10), 10 * k, 'k', 'fk', 1.5), r2 = ci(X(wx), Y(10), 4.6 * k, 's', 'fm', 1.2); F.add(r1 + r2 + F.luz(r2, 'esf')); }
  F.reserva(Math.min(X(4), X(94)), Y(48), L * 0.94, 38 * k);
  if (o.lab) F.add(`<text x="${n1(X(48))}" y="${n1(Y(21))}" class="tk tb7" text-anchor="middle" font-size="${FSS}">${mathTxt(o.lab)}</text>`);
  return { frente: X(96), tras: X(2), topo: Y(48), meio: Y(24) };
}
// pessoa estilizada (silhueta cheia), pés em (x, y)
function pessoa(F, x, y, o = {}) {
  const k = (o.h || 60) / 60, c = o.f || 'fpes';
  sombraChao(F, x, y, 11 * k);
  const corpo = pa(`M${n1(x - 9 * k)},${n1(y - 26 * k)} Q${n1(x - 10 * k)},${n1(y - 42 * k)} ${n1(x)},${n1(y - 43 * k)} Q${n1(x + 10 * k)},${n1(y - 42 * k)} ${n1(x + 9 * k)},${n1(y - 26 * k)} L${n1(x + 6 * k)},${n1(y - 26 * k)} L${n1(x + 6 * k)},${n1(y)} L${n1(x + 1 * k)},${n1(y)} L${n1(x)},${n1(y - 14 * k)} L${n1(x - 1 * k)},${n1(y)} L${n1(x - 6 * k)},${n1(y)} L${n1(x - 6 * k)},${n1(y - 26 * k)} Z`, 'k', c, 1.4);
  const cab = ci(x, y - 51 * k, 7.5 * k, 'k', c, 1.4);
  F.add(corpo + F.luz(corpo) + cab + F.luz(cab, 'esf'));
  return F;
}
function mola(x1, y, x2, voltas = 9, amp = 8, c = 'k') {
  const passo = (x2 - x1 - 8) / voltas; let d = `M${n1(x1)},${y} L${n1(x1 + 4)},${y}`;
  for (let i = 0; i < voltas; i++) { const a = x1 + 4 + i * passo; d += ` C${n1(a + passo * 0.15)},${y - amp * 1.3} ${n1(a + passo * 0.85)},${y - amp * 1.3} ${n1(a + passo * 0.75)},${y} S${n1(a + passo * 0.95)},${y + amp * 1.3} ${n1(a + passo)},${y}`; }
  return pa(d + ` L${n1(x2)},${y}`, c, 'fn', 1.8);
}
function molaV(x, y1, y2, voltas = 7, amp = 8) {
  const passo = (y2 - y1 - 8) / voltas; let d = `M${x},${n1(y1)} L${x},${n1(y1 + 4)}`;
  for (let i = 0; i < voltas; i++) { const a = y1 + 4 + i * passo; d += ` C${x + amp * 1.3},${n1(a + passo * 0.15)} ${x + amp * 1.3},${n1(a + passo * 0.85)} ${x},${n1(a + passo * 0.75)} S${x - amp * 1.3},${n1(a + passo * 0.95)} ${x},${n1(a + passo)}`; }
  return pa(d + ` L${x},${n1(y2)}`, 'k', 'fn', 1.8);
}
function polia(F, x, y, r, o = {}) {
  const a = ci(x, y, r, 'k', 'fm', 1.6), b = ci(x, y, r * 0.72, 's', 'fn', 0.9);
  F.add(a + F.luz(a, 'esf') + b + ci(x, y, Math.max(2, r * 0.18), 'k', 'fk', 1));
  return F;
}
function senoide(x1, x2, y, A, lambda, fase = 0, c = 'b', w = 2.4, dash) {
  let d = ''; for (let x = x1; x <= x2 + 0.01; x += 1.5) d += (x === x1 ? 'M' : 'L') + n1(x) + ',' + n1(y - A * Math.sin(2 * Math.PI * (x - x1) / lambda + fase)) + ' ';
  return pa(d, c, 'fn', w, dash);
}
function ondulada(x1, y1, x2, y2, c = 'a', amp = 4, per = 12) { // fóton: seta ondulada
  const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L; let d = '';
  for (let s = 0; s <= L - 11; s += 1.5) { const o = Math.sin(s / per * 2 * Math.PI) * amp; d += (s ? 'L' : 'M') + n1(x1 + ux * s - uy * o) + ',' + n1(y1 + uy * s + ux * o) + ' '; }
  return pa(d, c, 'fn', 2) + seta(x1 + ux * (L - 14), y1 + uy * (L - 14), x2, y2, c, 2);
}
function sol(F, x, y, r = 16) {
  let h = ''; for (let k = 0; k < 12; k++) { const [a1, b1] = P(x, y, r + 4, k * 30 + 15), [a2, b2] = P(x, y, r + (k % 2 ? 9 : 12), k * 30 + 15); h += ln(a1, b1, a2, b2, 'a', 2); }
  const c = ci(x, y, r, 'a', 'fsol', 1.5);
  F.add(h + c + F.luz(c, 'esf'));
  return F;
}
function astro(F, x, y, r, f = 'fw', c = 'b') { const a = ci(x, y, r, c, f, 1.5); F.add(a + F.luz(a, 'esf')); return F; }
const arvore = (F, x, y, h) => { const tr = re(x - 3.5, y - h * 0.34, 7, h * 0.34, 'k', 'fmad', 1, 1.2); const co = pa(`M${x},${n1(y - h)} C${n1(x + h * 0.36)},${n1(y - h * 0.8)} ${n1(x + h * 0.34)},${n1(y - h * 0.3)} ${x},${n1(y - h * 0.3)} C${n1(x - h * 0.34)},${n1(y - h * 0.3)} ${n1(x - h * 0.36)},${n1(y - h * 0.8)} ${x},${n1(y - h)} Z`, 'g', 'fg2', 1.5); F.add(tr + co + F.luz(co, 'esf')); return F; };
const chama = (F, x, y, k = 1) => F.add(pa(`M${x},${y} Q${n1(x - 14 * k)},${n1(y - 12 * k)} ${n1(x - 5 * k)},${n1(y - 30 * k)} Q${n1(x)},${n1(y - 19 * k)} ${n1(x + 6 * k)},${n1(y - 34 * k)} Q${n1(x + 16 * k)},${n1(y - 14 * k)} ${x},${y} Z`, 'a', 'fh', 1.5)
  + pa(`M${x},${y} Q${n1(x - 6 * k)},${n1(y - 7 * k)} ${n1(x - 1 * k)},${n1(y - 16 * k)} Q${n1(x + 2 * k)},${n1(y - 10 * k)} ${n1(x + 4 * k)},${n1(y - 18 * k)} Q${n1(x + 8 * k)},${n1(y - 7 * k)} ${x},${y} Z`, 'n', 'fa', 0));
function termometro(F, x, y, h, fill) {
  const tubo = re(x - 6, y - h, 12, h, 'k', 'fp', 6, 1.4);
  F.add(tubo + F.luz(tubo, 'cilv') + re(x - 2.4, y - fill, 4.8, fill + 4, 'n', 'fr', 2, 0));
  const b = ci(x, y + 6, 10, 'k', 'fr', 1.4); F.add(b + F.luz(b, 'esf'));
  for (let k = 1; k < 8; k++) F.add(ln(x + 6, y - h * k / 8, x + 10, y - h * k / 8, 's', 0.8));
  return F;
}
function bequer(F, x, y, w, h, nivel = 0.6, f = 'fw') {
  const liq = re(x + 2, y + h * (1 - nivel), w - 4, h * nivel - 2, 'n', f, 0, 0);
  F.add(liq + F.luz(liq, 'liq') + pa(`M${x - 3},${y} L${x},${y + 3} L${x},${y + h - 3} Q${x},${y + h} ${x + 3},${y + h} L${x + w - 3},${y + h} Q${x + w},${y + h} ${x + w},${y + h - 3} L${x + w},${y + 3} L${x + w + 3},${y}`, 'k', 'fn', 2)
    + ln(x + w - 7, y + 10, x + w - 7, y + h - 10, 'p', 2).replace('/>', ' opacity=".7"/>'));
  return F;
}
/* ---------- eletricidade ---------- */
const resistor = (x, y, w = 40, vertical = false, c = 'a') => {
  const n = 6, s = w / n; let d = `M${x},${y}`;
  for (let i = 0; i < n; i++) d += vertical ? ` L${x + (i % 2 ? -7 : 7)},${n1(y + s * (i + 0.5))}` : ` L${n1(x + s * (i + 0.5))},${y + (i % 2 ? 7 : -7)}`;
  return pa(d + (vertical ? ` L${x},${y + w}` : ` L${x + w},${y}`), c, 'fn', 2.3);
};
// pilha: placa longa (+) e curta (−); vertical com o + em cima
function pilha(F, x, y, vertical = true, sinais = true) {
  if (vertical) { F.add(re(x - 16, y - 9, 32, 18, 'n', 'fq', 0, 0) + ln(x - 14, y - 5, x + 14, y - 5, 'k', 2.4) + ln(x - 7, y + 4, x + 7, y + 4, 'k', 5)); if (sinais) F.reserva(x + 17, y - 14, 12, 30).add(`<text x="${x + 19}" y="${y - 3}" class="ta tb7" font-size="${FS}">+</text><text x="${x + 13}" y="${y + 13}" class="tb tb7" font-size="${FS}">−</text>`); }
  else { F.add(re(x - 9, y - 16, 18, 32, 'n', 'fq', 0, 0) + ln(x - 5, y - 14, x - 5, y + 14, 'k', 2.4) + ln(x + 4, y - 7, x + 4, y + 7, 'k', 5)); if (sinais) F.add(`<text x="${x - 9}" y="${y - 18}" class="ta tb7" font-size="${FS}" text-anchor="middle">+</text><text x="${x + 6}" y="${y - 10}" class="tb tb7" font-size="${FS}" text-anchor="middle">−</text>`); }
  return F;
}
const mascara = (x, y, w, h) => re(x, y, w, h, 'n', 'fq', 0, 0);
function carga(F, x, y, r, sinal, lab) {
  const c = ci(x, y, r, sinal > 0 ? 'a' : 'b', sinal > 0 ? 'fh' : 'fw', 1.8);
  F.add(c + F.luz(c, 'esf') + (sinal > 0 ? ln(x - 5, y, x + 5, y, 'a', 2.4) + ln(x, y - 5, x, y + 5, 'a', 2.4) : ln(x - 5, y, x + 5, y, 'b', 2.4)));
  if (lab) F.t(x, y + r + FS + 2, lab, { b: true });
  return F;
}
const maisMenos = (x, y, sinal, k = 4) => sinal > 0 ? ln(x - k, y, x + k, y, 'a', 2) + ln(x, y - k, x, y + k, 'a', 2) : ln(x - k, y, x + k, y, 'b', 2);
function campoX(F, x1, y1, x2, y2, gap = 24, entrando = true) { let h = ''; for (let x = x1; x <= x2; x += gap) for (let y = y1; y <= y2; y += gap) h += entrando ? ln(x - 3.5, y - 3.5, x + 3.5, y + 3.5, 's', 1.3) + ln(x - 3.5, y + 3.5, x + 3.5, y - 3.5, 's', 1.3) : ci(x, y, 4, 's', 'fn', 1.1) + ci(x, y, 1.2, 's', 'fk', 0); F.add(`<g opacity=".75">${h}</g>`); return F; }
function ima(F, x, y, w, h, vertical = false, invert = false) {
  const a = invert ? ['S', 'fb', 'N', 'fr'] : ['N', 'fr', 'S', 'fb'];
  if (!vertical) { const r1 = re(x, y, w / 2, h, 'k', a[1], 2, 1.6), r2 = re(x + w / 2, y, w / 2, h, 'k', a[3], 2, 1.6); F.add(r1 + F.luz(r1) + r2 + F.luz(r2) + `<text x="${x + w / 4}" y="${y + h / 2 + 5}" class="tp tb7 th" text-anchor="middle" font-size="${FS}">${a[0]}</text><text x="${x + 3 * w / 4}" y="${y + h / 2 + 5}" class="tp tb7 th" text-anchor="middle" font-size="${FS}">${a[2]}</text>`); }
  else { const r1 = re(x, y, w, h / 2, 'k', a[1], 2, 1.6), r2 = re(x, y + h / 2, w, h / 2, 'k', a[3], 2, 1.6); F.add(r1 + F.luz(r1) + r2 + F.luz(r2) + `<text x="${x + w / 2}" y="${y + h / 4 + 5}" class="tp tb7 th" text-anchor="middle" font-size="${FS}">${a[0]}</text><text x="${x + w / 2}" y="${y + 3 * h / 4 + 5}" class="tp tb7 th" text-anchor="middle" font-size="${FS}">${a[2]}</text>`); }
  F.rotulos.push('ímã');
  return F;
}
function nucleo(F, x, y, n = 7, r = 5) { for (let i = 0; i < n; i++) { const ang = i * 137.5, rr = i ? r * 0.95 * Math.sqrt(i) : 0, [a, b] = P(x, y, rr, ang); const c = ci(a, b, r, 'k', i % 2 ? 'fb' : 'fr', 0.9); F.add(c + F.luz(c, 'esf')); } return F; }

/* ---------- gráficos ---------- */
// eixos com grade leve, marcas e títulos; devolve as funções de escala X(v), Y(v)
function grafico(F, o) {
  const { x0, y0, w, h, xmin = 0, xmax, ymin = 0, ymax } = o;
  const X = v => x0 + (v - xmin) / (xmax - xmin) * w, Y = v => y0 - (v - ymin) / (ymax - ymin) * h;
  let g = '';
  for (const [v] of (o.xt || [])) g += ln(X(v), y0, X(v), y0 - h, 's', 0.6, '2 3');
  for (const [v] of (o.yt || [])) g += ln(x0, Y(v), x0 + w, Y(v), 's', 0.6, '2 3');
  F.add(`<g opacity=".55">${g}</g>`);
  F.add(seta(x0, y0, x0 + w + 14, y0, 'k', 1.6) + seta(x0, y0, x0, y0 - h - 14, 'k', 1.6));
  for (const [v, l] of (o.xt || [])) { F.add(ln(X(v), y0, X(v), y0 + 4, 'k', 1.2)); F.t(X(v), y0 + FS + 4, l, { c: 's', s: FSS + 0.5 }); }
  for (const [v, l] of (o.yt || [])) { F.add(ln(x0 - 4, Y(v), x0, Y(v), 'k', 1.2)); F.t(x0 - 7, Y(v) + 4.5, l, { c: 's', a: 'end', s: FSS + 0.5 }); }
  if (o.xl) F.t(x0 + w + 14, y0 + FS + 4, o.xl, { a: 'end', c: 'k', b: true, alt: [[0, -FS - 10]] });
  if (o.yl) F.t(x0 + 6, y0 - h - 6, o.yl, { a: 'start', c: 'k', b: true });
  return { X, Y };
}
const curvaPts = (f, a, b, n, X, Y) => { const pts = []; for (let i = 0; i <= n; i++) { const v = a + (b - a) * i / n; pts.push([X(v), Y(f(v))]); } return pts; };

/* =================================================================
   DESENHOS
   ================================================================= */
const D = {};
const O = {};   // desenhos feitos sob medida para uma fórmula (têm prioridade sobre o MAPA)

O['forca-carga'] = () => fig(300, 178, F => {
  const cx = 132, cy = 86, raio = 62;
  const protonX = cx + raio;

  campoX(F, 18, 18, 282, 154, 24);
  F.add(ci(cx, cy, raio, 'a', 'fn', 2.2));
  cota(F, cx - raio, cy, cx, cy, 'R');
  vetor(F, protonX, cy, protonX - 48, cy, 'g', '');
  F.t(protonX - 34, cy - 9, 'F', { c: 'g', b: true, it: true });
  vetor(F, protonX, cy, protonX, cy - 44, 'b', '10⁶ m/s');
  carga(F, protonX, cy, 8, 1);
  F.t(282, 170, 'B (entrando)', { c: 's', a: 'end' });
  F.rotulos.push('Próton com velocidade para cima e força magnética para a esquerda, em direção ao centro');
}).svg();

/* ---------- PILOTO 1 · plano inclinado: decomposição do peso ---------- */
// p: ang, P, Pt, N, Pn (rótulos); Pv, Ptv, Nv (módulos para a escala); atrito: rótulo da força de atrito (plano acima)
D.plano = p => fig(300, 200, F => {
  const th = p.ang || 30, t = rad(th), x0 = 18, y0 = 182, L = Math.min(266, 150 / Math.tan(t)), xt = x0 + L, yt = y0 - L * Math.tan(t);
  const pl = poly([[x0, y0], [xt, y0], [xt, yt]], 'k', 'fs', 2);
  F.add(pl + F.luz(pl)); chao(F, 6, 294, y0, { alto: 8 });
  const sBase = Math.min(L * 0.56, 150);
  const bx = x0 + sBase * Math.cos(t), by = y0 - sBase * Math.sin(t);
  const B = blocoGirado(F, bx, by, 44, 28, th, '');
  if (p.m) F.t(bx + 30 * Math.cos(t) + 10, by - 30 * Math.sin(t) - 18, p.m, { c: 'k', a: 'start' });
  const [cx, cy] = B.c, k = 62 / (p.Pv || 1);
  const PL = (p.Pv || 1) * k, tL = (p.Ptv ?? Math.sin(t)) * k, nL = (p.Nv ?? Math.cos(t)) * k;
  const dn = [-Math.cos(t), Math.sin(t)];               // ao longo da rampa, para baixo (esquerda)
  const nn = [-Math.sin(t), -Math.cos(t)];              // normal para fora da rampa
  const pnx = cx - nn[0] * nL, pny = cy - nn[1] * nL;   // ponta de Pn (para dentro da rampa)
  const ptx = cx + dn[0] * tL, pty = cy + dn[1] * tL;
  // paralelogramo da decomposição
  F.add(ln(ptx, pty, cx, cy + PL, 's', 1, '3 3') + ln(pnx, pny, cx, cy + PL, 's', 1, '3 3'));
  F.add(seta(cx, cy, pnx, pny, 's', 1.8, { dash: '5 3' }));
  if (p.Pn) F.ponta(pnx, pny, -nn[0], -nn[1], p.Pn, 's', { b: false });
  F.add(seta(cx, cy, cx, cy + PL, 'b')); F.t(cx + 8, cy + PL - 2, p.P || 'P', { c: 'b', a: 'start', b: true, alt: [[-16, 0]] });
  vetor(F, cx, cy, ptx, pty, 'a', p.Pt || 'P_t');
  vetor(F, cx, cy, cx + nn[0] * nL, cy + nn[1] * nL, 'g', p.N || 'N');
  if (p.atrito) { const fL = p.fv != null ? p.fv * k : tL; const [ux, uy] = [-dn[0], -dn[1]]; const ax = cx - nn[0] * 12 + ux * 4, ay = cy - nn[1] * 12 + uy * 4; vetor(F, ax, ay, ax + ux * fL, ay + uy * fL, 'r', p.atrito); }
  if (p.a) { const ax = x0 + 26, ay = y0 - 26 * Math.tan(t) - 30; F.add(seta(ax + (-dn[0]) * 46, ay + (-dn[1]) * 46, ax, ay, 'k', 1.8)); F.t(ax + (-dn[0]) * 23 - 4, ay + (-dn[1]) * 23 - 12, p.a, { c: 'k', b: true }); }
  angulo(F, x0, y0, 40, 0, th, p.th || th + '°', 'k');
  F.add(reto(cx, cy, dn[0], dn[1], 0));
  F.legenda(p.t);
});

/* ---------- PILOTO 2 · lente delgada: raios traçados pela equação 1/f = 1/p + 1/p′ ---------- */
// p: f (cm, negativo = divergente), p (cm, null = feixe paralelo), K (px/cm), xl (posição da lente), ho (altura do objeto em px)
// o, i (rótulos), t (legenda), dupla: par de lentes encostadas (rótulos em dupla), longe: texto quando a imagem sai da figura
// pp: p′ do enunciado (cm) — quando dado, p sai da própria equação (p = 1/(1/f − 1/p′)), sem arredondar a geometria
// quebra { x, xI, hI }: imagem real distante. Até x tudo em escala (K); depois de uma quebra no eixo, a imagem fica em xI
//   com altura hI (px) fora de escala — os raios em escala seguem até a quebra e convergem na ponta da imagem esquemática
D.lente = p => fig(300, p.p == null && p.pp == null ? 170 : 196, F => {
  if (p.p == null && p.pp != null) p = Object.assign({}, p, { p: 1 / (1 / p.f - 1 / p.pp) });
  const f = p.f, conv = f > 0, K = p.K, xl = p.xl, y0 = p.y0 ?? (p.p == null ? 88 : 108), Fa = Math.abs(f) * K, borda = 296, H = p.p == null ? 50 : p.quebra ? 46 : 58;
  const Fi = conv ? xl + Fa : xl - Fa, Fo = conv ? xl - Fa : xl + Fa;         // foco imagem F′ e foco objeto F
  F.add(ln(4, y0, borda, y0, 's', 1, '6 3 1 3'));
  const vidro = (x, c) => { const s = c ? pa(`M${x},${y0 - H} Q${x + 17},${y0} ${x},${y0 + H} Q${x - 17},${y0} ${x},${y0 - H} Z`, 'b', 'fw', 1.8)
    : pa(`M${x - 9},${y0 - H} L${x + 9},${y0 - H} Q${x + 1},${y0} ${x + 9},${y0 + H} L${x - 9},${y0 + H} Q${x - 1},${y0} ${x - 9},${y0 - H} Z`, 'b', 'fw', 1.8); F.add(s + F.luz(s, 'cilv')); };
  if (p.dupla) { vidro(xl - 7, true); vidro(xl + 9, false); F.t(xl - 12, y0 - H - 8, p.dupla[0], { c: 'b', a: 'end', b: true }); F.t(xl + 14, y0 - H - 8, p.dupla[1], { c: 'b', a: 'start', b: true }); }
  else vidro(xl, conv);
  const foco = (x, l) => { F.add(ci(x, y0, 3.2, 'k', 'fk', 0)); F.t(x, y0 + FS + 5, l, { c: 'k', alt: [[0, 4]] }); };
  if (p.quebra) { F.add(ci(Fi, y0, 3.2, 'k', 'fk', 0)); F.t(Fi + 6, y0 - 7, 'F′', { c: 'k', a: 'start', fixo: true }); }   // acima do eixo: o raio 1 desce depois de F′
  else foco(Fi, 'F′');
  if (Fo > 6 && Fo < borda) foco(Fo, 'F');
  const fora = (A, d) => { let L = d[0] > 0 ? (borda - A[0]) / d[0] : (A[0] - 4) / -d[0]; if (d[1] > 0) L = Math.min(L, (F.h - 4 - A[1]) / d[1]); if (d[1] < 0) L = Math.min(L, (A[1] - 4) / -d[1]); return [A[0] + d[0] * L, A[1] + d[1] * L]; };
  const raio = (A, B, ar = true, k = 0.5) => F.add(ln(A[0], A[1], B[0], B[1], 'a', 1.6) + (ar ? sentido(A, B, 'a', k) : ''));
  const virt = (A, B) => F.add(ln(A[0], A[1], B[0], B[1], 'a', 1.1, '4 3'));
  if (p.p == null) {                                   // feixe paralelo ao eixo
    for (const h of [-34, -17, 17, 34]) {
      const L = [xl, y0 + h], d = conv ? unit(Fi - L[0], y0 - L[1]) : unit(L[0] - Fi, L[1] - y0);
      raio([8, y0 + h], L, h === -34 || h === 34, 0.55); raio(L, fora(L, d), false);
      if (!conv) virt(L, [Fi, y0]);
    }
    if (p.fd) cota(F, xl, y0 + H + 14, Fi, y0 + H + 14, p.fd, { sobre: true });
    F.legenda(p.t); return;
  }
  const pp = 1 / (1 / f - 1 / p.p), A = -pp / p.p, xo = xl - p.p * K, T = [xo, y0 - p.ho], L1 = [xl, y0 - p.ho], C = [xl, y0];
  const d1 = conv ? unit(Fi - L1[0], y0 - L1[1]) : unit(L1[0] - Fi, L1[1] - y0), d2 = unit(C[0] - T[0], C[1] - T[1]);
  const I = [xl + pp * K, y0 - A * p.ho], real = pp > 0, dentro = I[0] >= 6 && I[0] <= borda && I[1] > 4 && I[1] < F.h - 4;
  const fmt = v => (Math.abs(v - Math.round(v)) < 0.05 ? '= ' + Math.round(v) : '≈ ' + v.toFixed(1).replace('.', ','));
  raio(T, L1); raio(T, C);
  if (real && !dentro && p.quebra) {                    // imagem distante: escala até a quebra, depois esquema
    const q = p.quebra, xb = q.x, xb2 = q.x + 16, IS = [q.xI, y0 + q.hI], yEm = (Q, d, x) => Q[1] + d[1] * (x - Q[0]) / d[0];
    const B1 = [xb, yEm(L1, d1, xb)], B2 = [xb, yEm(C, d2, xb)];
    raio(L1, B1, true, 0.6); raio(C, B2, true, 0.6);
    raio([xb2, B1[1]], IS, true, 0.45); raio([xb2, B2[1]], IS, false);
    F.add(re(xb, y0 - 3, 16, 6, 'n', 'fq', 0, 0));    // abre o eixo na quebra
    const zig = x => pa(`M${x - 2},${y0 - 16} L${x + 2},${y0 - 8} L${x - 2},${y0} L${x + 2},${y0 + 8} L${x - 2},${y0 + 16} L${x + 2},${y0 + 24} L${x - 2},${y0 + 32}`, 's', 'fn', 1.2);
    F.add(zig(xb + 2) + zig(xb2 - 2)).reserva(xb - 3, y0 - 18, 22, 52);
    // tela do projetor e imagem real invertida sobre ela
    F.add(re(IS[0] + 4, y0 - 34, 5, q.hI + 46, 's', 'fs', 1, 1));
    F.t(IS[0] + 6, y0 - 40, 'tela', { c: 's', s: FSS });
    F.add(seta(IS[0], y0, IS[0], IS[1], 'g', 3));
    F.t(IS[0] - 7, IS[1] + 12, p.i || 'imagem', { c: 'g', a: 'end', b: true, fixo: true });   // abaixo dos raios que chegam à ponta
    F.t(4, 13, 'em escala', { a: 'start', c: 's', s: FSS - 0.5, it: true, fixo: true });
    F.t(xb2 + 4, 13, 'fora de escala', { a: 'start', c: 's', s: FSS - 0.5, it: true, fixo: true });
    vetor(F, xo, y0, xo, T[1], 'k', '', { w: 3 }); F.t(xo, T[1] - 8, p.o || 'o', { c: 'k', b: true, alt: [[-12, 8]] });
    // f e p lado a lado: o slide fica só um pouco além do foco (p ligeiramente maior que f)
    // f numa linha; p e p′ na linha de baixo, um de cada lado da lente (p só um pouco maior que f)
    const yA = y0 + H + 12, yB = yA + 30;
    cota(F, Fo, yA, xl, yA, `f = ${Math.abs(f)} cm`, { lado: 'abaixo' });
    cota(F, xo, yB, xl, yB, `p ${fmt(p.p)} cm`, { lado: 'abaixo' });
    cota(F, xl, yB, IS[0], yB, p.ppLab || `p′ ${fmt(pp)} cm`, { sobre: true, dx: (xl + xb) / 2 - (xl + IS[0]) / 2 + 6 });
    F.add(re(xb, yB - 6, 16, 12, 'n', 'fq', 0, 0) + ln(xb + 1, yB + 5, xb + 5, yB - 5, 's', 1.2) + ln(xb2 - 5, yB + 5, xb2 - 1, yB - 5, 's', 1.2));
    [].concat(p.t || []).forEach(l => F.legenda(l)); return;
  }
  if (!isFinite(pp) || Math.abs(1 / f - 1 / p.p) < 1e-9) {   // objeto no foco: raios emergem paralelos, sem imagem a distância finita
    raio(L1, fora(L1, d1), true, 0.4); raio(C, fora(C, d2), true, 0.4);
    vetor(F, xo, y0, xo, T[1], 'k', '', { w: 3 }); F.t(xo, T[1] - 8, p.o || 'o', { c: 'k', b: true, alt: [[-12, 8]] });
    F.t(borda - 2, F.h - 10, 'raios paralelos: imagem no infinito', { c: 'g', a: 'end', b: true, s: FSS });
    cota(F, xo, F.h - 30, xl, F.h - 30, `p ${fmt(p.p)} cm`, { lado: 'acima' });
    F.legenda(p.t); return;
  }
  if (real && dentro) { raio(L1, I); raio(C, I); }
  else { raio(L1, fora(L1, d1), true, 0.4); raio(C, fora(C, d2), true, 0.4); if (!real && dentro) { virt(L1, I); virt(C, I); } }
  vetor(F, xo, y0, xo, T[1], 'k', '', { w: 3 });
  if (p.oAbaixo) F.t(xo + 4, y0 + FS + 5, p.o || 'o', { c: 'k', b: true, a: 'start', fixo: true });   // abaixo do eixo: acima, os prolongamentos passam pela ponta do objeto
  else F.t(xo, T[1] - 8, p.o || 'o', { c: 'k', b: true, alt: [[-12, 8]] });
  if (dentro) { F.add(seta(I[0], y0, I[0], I[1], 'g', 3, real ? {} : { dash: '5 3' })); F.t(I[0] + (I[0] < xl ? -7 : 7), (y0 + I[1]) / 2 + 4, p.i || 'i', { c: 'g', a: I[0] < xl ? 'end' : 'start', b: true }); }
  else if (p.longe) F.t(borda - 2, 34, p.longe, { c: 'g', a: 'end', b: true });
  cota(F, xo, F.h - 14, xl, F.h - 14, `p = ${String(p.p).replace('.', ',')} cm`, { lado: 'acima', dx: p.pdx || 0 });
  if (dentro) { const yd = real ? F.h - 34 : 14; cota(F, Math.min(I[0], xl), yd, Math.max(I[0], xl), yd, `p′ = ${pp > 0 ? '' : '−'}${Math.abs(pp).toFixed(0)} cm`); }
  if (p.escala) F.foraEscala();
  F.legenda(p.t);
});

/* ---------- PILOTO 3 · circuito simples: gerador real, resistor, motor ---------- */
// p: E (fem), r (resistência interna), R (resistor), i (corrente), U (tensão nos terminais), motor {e, r}, t (legenda)
D.circuito = p => fig(300, 196, F => {
  const xL = Math.max(56, 36 + largura(p.E || 'ε', FS, true) + (p.r ? 12 : 0)), xR = 248, yT = 46, yB = 162, ym = (yT + yB) / 2;
  F.add(pa(`M${xL},${yT} L${xR},${yT} L${xR},${yB} L${xL},${yB} Z`, 'k', 'fn', 2.2));
  // gerador no ramo esquerdo: pilha (+ em cima) e, se houver, resistência interna; caixa tracejada
  const real = !!p.r;
  pilha(F, xL, real ? ym + 18 : ym, true, true);
  F.t(xL - (real ? 34 : 22), (real ? ym + 18 : ym) + 5, p.E || 'ε', { c: 'k', a: 'end', b: true });
  if (real) { F.add(mascara(xL - 9, ym - 34, 18, 34) + resistor(xL, ym - 32, 30, true, 'k')); F.t(xL - 34, ym - 13, p.r, { c: 'k', a: 'end' });
    F.add(re(xL - 26, ym - 44, 54, 82, 's', 'fn', 6, 1.1, ' stroke-dasharray="4 3"')).t(xL - 4, ym + 54, 'gerador', { c: 's', s: FSS }); }
  // carga: resistor no ramo de cima ou motor no ramo direito
  if (p.R) { F.add(mascara(120, yT - 9, 60, 18) + resistor(120, yT, 60)); F.t(150, yT - 14, p.R, { c: 'a', b: true }); }
  if (p.motor) { const m = ci(xR, ym, 18, 'k', 'fo', 2); F.add(m + F.luz(m, 'esf') + `<text x="${xR}" y="${ym + 5}" class="tk tb7" text-anchor="middle" font-size="${FS}">M</text>`); F.reserva(xR - 18, ym - 18, 36, 36);
    F.t(xR - 24, ym - 6, p.motor.e, { c: 'k', a: 'end', b: true }); F.t(xR - 24, ym + 12, p.motor.r, { c: 'k', a: 'end' }); }
  // corrente convencional: sai do + e percorre o circuito no sentido horário
  const xi = p.motor ? 150 : xR, yi1 = p.motor ? yB : ym - 22, yi2 = p.motor ? yB : ym + 22;
  if (p.motor) { F.add(seta(176, yB, 124, yB, 'a', 2.8)); F.t(150, yB - 10, p.i, { c: 'a', b: true }); }
  else { F.add(seta(xi, yi1, xi, yi2, 'a', 2.8)); F.t(xi + 10, ym + 5, p.i, { c: 'a', a: 'start', b: true }); }
  F.add(ci(xL, yT, 3, 'k', 'fk', 0) + ci(xL, yB, 3, 'k', 'fk', 0));
  if (p.U) { const xU = xL + 40; F.add(seta(xU, ym, xU, yT + 3, 's', 1.2) + seta(xU, ym, xU, yB - 3, 's', 1.2)); F.t(xU + 6, ym + 5, p.U, { c: 'k', a: 'start', b: true }); }
  F.legenda(p.t);
});

/* ---------- PILOTO 4 · diagrama p × V com escala numérica ---------- */
// p: tipo ('isot' | 'adia' | 'isob' | 'ciclo'), V1, V2 (números), p1, p2, unidades, rótulos de marcas e área
D.pv = p => fig(300, 210, F => {
  const tipo = p.tipo, V1 = p.V1, V2 = p.V2, Vmax = p.Vmax, pmax = p.pmax;
  const G = grafico(F, { x0: 52, y0: 172, w: 214, h: 140, xmax: Vmax, ymax: pmax, xt: p.xt, yt: p.yt, xl: p.xl || 'V', yl: p.yl || 'p' });
  const { X, Y } = G;
  let pts, area;
  if (tipo === 'isob') { pts = [[X(V1), Y(p.p1)], [X(V2), Y(p.p1)]]; }
  else if (tipo === 'ciclo') { pts = null; }
  else { const g = tipo === 'adia' ? 5 / 3 : 1, c = p.p1 * Math.pow(V1, g); pts = curvaPts(v => c / Math.pow(v, g), V1, V2, 48, X, Y);
    if (tipo === 'adia') { const c1 = p.p1 * V1; F.add(pa(path(curvaPts(v => c1 / v, Math.min(V1, V2), Math.max(V1, V2), 40, X, Y)), 's', 'fn', 1.4, '5 4')); F.t(X(Math.min(V1, V2)) - 4, Y(c1 / Math.min(V1, V2)) + 18, 'isotérmica', { c: 's', a: 'end', s: FSS }); } }
  if (tipo === 'ciclo') {
    const [a, b, c, d] = [[X(V1), Y(p.p2)], [X(V2), Y(p.p2)], [X(V2), Y(p.p1)], [X(V1), Y(p.p1)]];
    F.add(poly([a, b, c, d], 'n', 'fh', 0, ' opacity=".9"') + pa(path([a, b, c, d]) + ' Z', 'a', 'fn', 2.8));
    for (const [A, B] of [[a, b], [b, c], [c, d], [d, a]]) F.add(sentido(A, B, 'a'));
    F.t((a[0] + b[0]) / 2, (a[1] + d[1]) / 2 + 5, p.lab, { c: 'a', b: true });
    F.t(X(V2) + 4, Y(p.p2) - 6, 'sentido horário: τ > 0', { c: 's', a: 'end', s: FSS, alt: [[0, -12]] });
  } else {
    if (p.area !== false) { const xa = Math.min(X(V1), X(V2)), xb = Math.max(X(V1), X(V2)); F.add(pa(path(pts) + ` L${n1(pts[pts.length - 1][0])},${G.Y(0)} L${n1(pts[0][0])},${G.Y(0)} Z`, 'n', 'fh', 0)); F.t((xa + xb) / 2, Y(0) - 16, p.lab, { c: 'a', b: true }); }
    F.add(pa(path(pts), 'a', 'fn', 3) + sentido(pts[Math.floor(pts.length * 0.45)], pts[Math.floor(pts.length * 0.55)], 'a', 0.5));
    for (const [k, q] of [[1, pts[0]], [2, pts[pts.length - 1]]]) { F.add(ci(q[0], q[1], 4, 'k', 'fp', 2)); F.t(q[0] + 7, q[1] - 7, String(k), { c: 'k', a: 'start', b: true }); }
    if (p.lab && p.area === false) F.t(X((V1 + V2) / 2) + 16, Y(p.p1 * 1.15) - 2, p.lab, { c: 'a', b: true, a: 'start' });
  }
  F.legenda(p.t);
});


/* ---------- Mecânica · cinemática ---------- */
// carro na estrada. Cores: velocidade azul, aceleração tinta, força laranja, resistência vermelha.
// p: v, a (sinal pelo "−" inicial), F, Fr, d (cota), eixo [[x, rótulo]] (posições na estrada), lab (no carro), t (legenda)
D.carro = p => fig(300, p.eixo ? 186 : 168, F => {
  const y = 128 + (p.Fr ? 8 : 0), x = 26; chao(F, 4, 296, y);
  const C = carro(F, x, y, { lab: p.lab });
  vetor(F, C.frente + 6, C.meio + 2, C.frente + 64, C.meio + 2, 'b', p.v || 'v');
  let yy = C.topo - 14;
  if (p.a) { const neg = /(^|=\s*)[−-]/.test(p.a) || p.aneg; if (neg) vetor(F, C.frente + 50, yy, C.frente - 4, yy, 'k', p.a, { w: 2.2 }); else vetor(F, C.frente - 4, yy, C.frente + 50, yy, 'k', p.a, { w: 2.2 }); yy -= 26; }
  if (p.F) vetor(F, x + 84, yy + 4, x + 24, yy + 4, 'a', p.F.replace(/^[−-]\s?/, ''));
  if (p.Fm) vetor(F, x + 56, yy + 4, x + 120, yy + 4, 'a', p.Fm);
  if (p.Fr) { vetor(F, x + 50, yy - 26, x + 4, yy - 26, 'r', ''); F.t(x + 56, yy - 22, p.Fr, { c: 'r', a: 'start', b: true }); }
  if (p.d) cota(F, x, y + 26, p.dx || 276, y + 26, p.d, { sobre: true });
  if (p.eixo) { const ye = y + 40; F.add(seta(8, ye, 294, ye, 's', 1.2)); F.t(292, ye - 6, 's (m)', { c: 's', a: 'end', s: FSS });
    for (const [xx, l] of p.eixo) { F.add(ln(xx, ye - 4, xx, ye + 4, 'k', 1.4)); F.t(xx, ye + FS + 3, l, { c: 'k', b: true }); } }
  F.legenda(p.t);
});
D.encontro = p => fig(300, 170, F => {
  const y = 118; chao(F, 4, 296, y);
  carro(F, 12, y, { L: 78 }); carro(F, 288, y, { L: 78, dir: -1, f: 'fh' });
  vetor(F, 96, 92, 142, 92, 'b', ''); F.t(118, 80, p.va, { c: 'b', b: true });
  vetor(F, 204, 92, 158, 92, 'b', ''); F.t(182, 80 + 0, p.vb, { c: 'b', b: true, alt: [[0, -16]] });
  cota(F, 51, y + 24, 249, y + 24, p.d, { sobre: true });
  F.legenda(p.t);
});
// queda livre a partir do repouso: pedra solta do alto de um prédio
D.queda = p => fig(300, 196, F => {
  const yb = 178; chao(F, 4, 296, yb);
  const pr = re(30, 34, 58, yb - 34, 'k', 'fs', 2, 1.8); F.add(pr + F.luz(pr));
  for (let yy = 46; yy < yb - 10; yy += 22) F.add(re(40, yy, 14, 12, 's', 'fw', 1, 1) + re(64, yy, 14, 12, 's', 'fw', 1, 1));
  F.add(ln(110, 40, 110, yb - 4, 's', 1.2, '3 4'));
  bola(F, 110, 34, 7, 'fm'); F.t(122, 38, 'v₀ = 0', { c: 's', a: 'start' });
  bola(F, 110, yb - 16, 7, 'fm');
  vetor(F, 128, yb - 60, 128, yb - 14, 'b', ''); F.t(136, yb - 34, p.v, { c: 'b', a: 'start', b: true });
  cota(F, 220, 34, 220, yb, p.h, { lado: 'dir' });
  F.legenda(p.t);
});
D.vertical = p => fig(300, 196, F => {
  const yb = 178; chao(F, 4, 296, yb);
  pessoa(F, 70, yb, { h: 62 });
  F.add(ln(120, yb - 66, 120, 40, 's', 1.2, '3 4'));
  bola(F, 120, yb - 70, 7, 'fa'); bola(F, 120, 32, 7, 'fh');
  vetor(F, 134, yb - 66, 134, yb - 116, 'b', p.v);
  F.t(132, 30, 'v = 0 no topo', { c: 's', a: 'start' });
  cota(F, 222, 32, 222, yb - 70, p.h, { lado: 'dir' });
  F.legenda(p.t);
});
D.horizontal = p => fig(300, 200, F => {
  const yb = 176, top = 44, x0 = 82; chao(F, 4, 296, yb);
  const pr = re(24, top, 58, yb - top, 'k', 'fs', 2, 1.8); F.add(pr + F.luz(pr));
  // trajetória parabólica até o alcance A
  const xA = 262, pts = curvaPts(s => top + (yb - top) * s * s, 0, 1, 40, s => x0 + (xA - x0) * s, v => v); F.add(pa(path(pts.map(q => [q[0], q[1]])), 's', 'fn', 1.5, '4 4'));
  bola(F, x0 + 6, top - 7, 7, 'fa');
  vetor(F, x0 + 16, top - 7, x0 + 62, top - 7, 'b', p.v);
  if (p.vf) { const [x2, y2] = [xA - 2, yb - 4]; vetor(F, x2 - 30, y2 - 40, x2, y2, 'g', ''); F.t(x2 - 34, y2 - 44, p.vf, { c: 'g', a: 'end', b: true }); }
  cota(F, x0 + 10, top + 4, x0 + 10, yb, p.h, { lado: 'dir' });
  cota(F, x0, yb + 14, xA, yb + 14, p.A, { sobre: true });
  F.legenda(p.t);
});
// lançamento oblíquo: trajetória calculada com o ângulo do exemplo
D.obliquo = p => { const th = rad(p.ang || 30), v = 20, g = 10, Rng = v * v * Math.sin(2 * th) / g, Hm = v * v * Math.sin(th) ** 2 / (2 * g);
  const K = Math.min(244 / Rng, 120 / Hm), y0 = Math.max(K * Hm, 60) + 50; return fig(300, y0 + 30, F => {
  const x0 = 26, T = 2 * v * Math.sin(th) / g;
  chao(F, 4, 296, y0);
  const pt = t => [x0 + K * v * Math.cos(th) * t, y0 - K * (v * Math.sin(th) * t - g * t * t / 2)];
  const pts = []; for (let i = 0; i <= 60; i++) pts.push(pt(T * i / 60)); F.add(pa(path(pts), 's', 'fn', 1.5, '4 4'));
  const [xa, ya] = pt(T / 2);
  if (p.wall) { const wx = x0 + K * p.wall, wy = y0 - K * p.wallY; const w = re(wx, wy - 26, 9, y0 - wy + 26, 'k', 'fs', 1, 1.6); F.add(w + F.luz(w, 'cilv'));
    bola(F, wx - 7, wy, 6, 'fa'); cota(F, wx + 24, y0, wx + 24, wy, p.H, { lado: 'dir' }); cota(F, x0, y0 + 16, wx, y0 + 16, p.A, { sobre: true }); }
  else { bola(F, xa, ya, 6, 'fa'); F.add(ln(xa, ya + 8, xa, y0, 's', 1, '2 3'));
    if (p.H) cota(F, xa + 30, y0, xa + 30, ya, p.H, { lado: 'dir' });
    if (p.A) cota(F, x0, y0 + 16, x0 + K * Rng, y0 + 16, p.A, { sobre: true }); }
  vetor(F, x0, y0, x0 + 52 * Math.cos(th), y0 - 52 * Math.sin(th), 'b', p.v, { alt: [[0, -14]] });
  angulo(F, x0, y0, 28, 0, p.ang || 30, p.th, 'k');
  F.legenda(p.t);
}); };
// gráfico v × t do MUV com a área do deslocamento
D.grafico = p => fig(300, 200, F => {
  const G = grafico(F, { x0: 50, y0: 168, w: 220, h: 130, xmax: p.tmax, ymax: p.vmax, xt: [[p.t1, p.t1 + '']], yt: [[p.v0, p.v0 + '']].concat(p.v0 ? [[p.v1, p.v1 + '']] : [[p.v1, p.v1 + '']]).filter(q => q[0] !== 0), xl: 't (s)', yl: 'v (m/s)' });
  const { X, Y } = G, A = [X(0), Y(p.v0)], B = [X(p.t1), Y(p.v1)];
  F.add(poly([[X(0), Y(0)], A, B, [X(p.t1), Y(0)]], 'n', 'fh', 0) + ln(B[0], B[1], B[0], Y(0), 's', 1, '3 3'));
  F.add(pa(path([A, B]), 'a', 'fn', 3) + ci(A[0], A[1], 3.5, 'k', 'fp', 1.6) + ci(B[0], B[1], 3.5, 'k', 'fp', 1.6));
  F.t((X(0) + X(p.t1)) / 2 + 6, Y(Math.min(p.v0, p.v1) / 2) + 6, p.area, { c: 'a', b: true });
  if (p.inc) F.t((A[0] + B[0]) / 2 - 8, (A[1] + B[1]) / 2 - 10, p.inc, { c: 'k', a: 'end' });
  F.legenda(p.t);
});
// soma de dois vetores pela regra do paralelogramo (desenhada em escala)
D.vetores = p => fig(300, 180, F => {
  const t = p.ang || 60, k = 30, o = [40, 150], a = p.av * k, b = p.bv * k, [bx, by] = P(o[0], o[1], b, t), ax = o[0] + a;
  F.add(ln(ax, o[1], ax + bx - o[0], by, 's', 1.2, '4 4') + ln(bx, by, ax + bx - o[0], by, 's', 1.2, '4 4'));
  vetor(F, o[0], o[1], ax, o[1], 'b', p.a, { alt: [[0, 18]] });
  vetor(F, o[0], o[1], bx, by, 'g', p.b);
  vetor(F, o[0], o[1], ax + bx - o[0], by, 'a', p.R, { w: 3.2 });
  angulo(F, o[0], o[1], 22, 0, t, p.th, 'k');
  F.legenda(p.t);
});
// decomposição de um vetor em x e y
D.componentes = p => fig(300, 186, F => {
  const t = p.ang || 37, o = [104, 156], L = 172, [ex, ey] = P(o[0], o[1], L, t);
  F.add(seta(o[0], o[1], 290, o[1], 'k', 1.4) + seta(o[0], o[1], o[0], 16, 'k', 1.4));
  F.t(286, o[1] + 18, 'x', { c: 'k', a: 'end' }); F.t(o[0] - 8, 24, 'y', { c: 'k', a: 'end', it: true });
  F.add(ln(ex, ey, ex, o[1], 's', 1.2, '4 4') + ln(ex, ey, o[0], ey, 's', 1.2, '4 4'));
  vetor(F, o[0], o[1], ex, o[1], 'b', '', {}); F.t((o[0] + ex) / 2, o[1] + 20, p.ax, { c: 'b', b: true });
  vetor(F, o[0], o[1], o[0], ey, 'g', ''); F.t(o[0] - 8, (o[1] + ey) / 2 + 5, p.ay, { c: 'g', a: 'end', b: true });
  vetor(F, o[0], o[1], ex, ey, 'a', p.a, { w: 3.2 });
  angulo(F, o[0], o[1], 34, 0, t, p.th || t + '°', 'k');
  F.legenda(p.t);
});
// movimento circular: ponto na borda, v tangente, a_cp para o centro
D.circulo = p => fig(300, 176, F => {
  const cx = 126, cy = 88, R = 66, [px, py] = [cx + R, cy];
  F.add(ci(cx, cy, R, 's', 'fn', 1.6, ' stroke-dasharray="5 4"') + ci(cx, cy, 3, 'k', 'fk', 0));
  if (p.R) { const [rx, ry] = P(cx, cy, R, 215); F.add(ln(cx, cy, rx, ry, 'k', 1.3)); F.t((cx + rx) / 2 - 6, (cy + ry) / 2 + 14, p.R, { c: 'k', a: 'end' }); }
  if (p.sentido) { const [a1, b1] = P(cx, cy, R + 12, 60), [a2, b2] = P(cx, cy, R + 12, 100); F.add(pa(`M${n1(a1)},${n1(b1)} A${R + 12},${R + 12} 0 0 0 ${n1(a2)},${n1(b2)}`, 's', 'fn', 1.4) + seta(a2 + 4, b2 + 0.5, a2 - 2, b2 + 1.5, 's', 1.4)); F.t(cx, cy - R - 18, p.sentido, { c: 's' }); }
  bola(F, px, py, 8, 'fa');
  vetor(F, px, py - 10, px, py - 62, 'b', p.v);
  if (p.acp) vetor(F, px - 10, py, px - 52, py, 'g', p.acp, { alt: [[0, 22]] });
  if (p.at) vetor(F, px + 2, py + 10, px + 2, py + 48, 'k', p.at);
  F.legenda(p.t);
});
D.meiaVolta = p => fig(300, 176, F => {
  const cx = 150, cy = 112, R = 74;
  F.add(ci(cx, cy, R, 's', 'fn', 1.2, ' stroke-dasharray="4 4"') + pa(`M${cx - R},${cy} A${R},${R} 0 0 1 ${cx + R},${cy}`, 'a', 'fn', 3.2) + sentido([cx - 4, cy - R], [cx + 4, cy - R], 'a') + ci(cx, cy, 2.5, 'k', 'fk', 0));
  pessoa(F, cx - R, cy, { h: 26 }); bola(F, cx + R, cy, 6, 'fa');
  vetor(F, cx - R + 4, cy + 14, cx + R - 4, cy + 14, 'b', ''); F.t(cx, cy + 32, p.dr, { c: 'b', b: true });
  F.t(cx, cy - R - 10, p.arco, { c: 'a', b: true });
  F.t(cx + 4, cy - 6, 'R = 10 m', { c: 's', a: 'start' });
  F.legenda(p.t);
});
// disco girando: raios, sentido de rotação e rótulos
D.disco = p => fig(300, 176, F => {
  const cx = 84, cy = 86, R = 62; const d = ci(cx, cy, R, 'k', 'fm', 2); F.add(d + F.luz(d, 'esf'));
  for (let k = 0; k < 6; k++) { const [x, y] = P(cx, cy, R - 6, k * 60 + 15); F.add(ln(cx, cy, x, y, 's', 1.4)); }
  F.add(ci(cx, cy, 9, 'k', 'fk', 0) + ci(cx + R - 12, cy, 4, 'k', 'fa', 1));
  const [a1, b1] = P(cx, cy, R + 12, -20), [a2, b2] = P(cx, cy, R + 12, 70);
  F.add(pa(`M${n1(a1)},${n1(b1)} A${R + 12},${R + 12} 0 0 0 ${n1(a2)},${n1(b2)}`, 'a', 'fn', 2.4) + seta(...P(cx, cy, R + 12, 62), a2, b2, 'a', 2.4));
  F.t(166, 70, p.f, { c: 'a', a: 'start', b: true }); F.t(166, 96, p.t2 || '', { c: 'k', a: 'start' });
  F.legenda(p.t);
});
// transmissão por corrente (ou correia): mesma velocidade linear na borda
D.correia = p => fig(300, 180, F => {
  const A = [86, 86], rA = 60, B = [238, 86], rB = 24;
  const tg = (s) => { const d = B[0] - A[0], a = Math.asin((rA - rB) / d); return [[A[0] + rA * Math.sin(a) * 1, A[1] + s * rA * Math.cos(a)], [B[0] + rB * Math.sin(a), B[1] + s * rB * Math.cos(a)]]; };
  const [t1, t2] = tg(-1), [b1, b2] = tg(1);
  polia(F, A[0], A[1], rA); polia(F, B[0], B[1], rB);
  F.add(ln(t1[0], t1[1], t2[0], t2[1], 'k', 3, '7 2') + ln(b1[0], b1[1], b2[0], b2[1], 'k', 3, '7 2'));
  F.add(sentido(t1, t2, 'a', 0.5));
  F.add(ln(A[0], A[1], A[0] - rA, A[1], 'k', 1.6)); F.t(A[0] - rA / 2, A[1] - 8, p.Ra, { c: 'k', b: true });
  F.add(ln(B[0], B[1], B[0] + rB, B[1], 'k', 1.6)); F.t(B[0], B[1] - rB - 10, p.Rb, { c: 'k', b: true });
  F.t(A[0], A[1] + rA + 18, p.fa, { c: 'a', b: true }); F.t(B[0], B[1] + rB + 34, p.fb, { c: 'a', b: true });
  F.legenda(p.t);
});
// catraca no eixo da roda: mesma ω
D.eixo = p => fig(300, 186, F => {
  const cx = 120, cy = 96, R = 72; const r = ci(cx, cy, R, 'k', 'fp', 7); F.add(r + ci(cx, cy, R - 5, 's', 'fn', 1));
  for (let k = 0; k < 16; k++) { const [x, y] = P(cx, cy, R - 6, k * 22.5); F.add(ln(cx, cy, x, y, 's', 0.8)); }
  const c = ci(cx, cy, 16, 'a', 'fh', 2); F.add(c + F.luz(c, 'esf') + ci(cx, cy, 3, 'k', 'fk', 0));
  F.add(ln(cx + 16, cy, cx + R - 4, cy, 'k', 1.6)); F.t(cx + R / 2 + 8, cy - 9, p.R, { c: 'k', b: true });
  F.t(cx + R + 8, cy + 40, p.r, { c: 'a', a: 'start', b: true }); F.add(ln(cx + 12, cy + 10, cx + R + 6, cy + 36, 'a', 1, '2 2'));
  vetor(F, cx, cy - R - 2, cx + 56, cy - R - 2, 'b', p.v);
  F.legenda(p.t);
});
D.trem = p => fig(300, 176, F => {
  const y = 140; chao(F, 4, 296, y + 6);
  const v = re(24, 58, 252, 72, 'k', 'fcar', 8, 2); F.add(v + F.luz(v));
  for (const x of [40, 92, 196, 248]) F.add(re(x - 14, 70, 28, 22, 's', 'fw', 3, 1.2));
  for (const x of [58, 98, 202, 242]) { const w = ci(x, y, 9, 'k', 'fk', 1); F.add(w + ci(x, y, 3.5, 's', 'fm', 1)); }
  F.add(ln(24, 118, 276, 118, 'k', 1.5));
  pessoa(F, 140, 118, { h: 42 });
  vetor(F, 156, 92, 196, 92, 'g', p.u, { alt: [[0, -14]] });
  vetor(F, 96, 40, 176, 40, 'b', p.v);
  F.t(30, 40, 'trem', { c: 's', a: 'start' });
  F.legenda(p.t);
});
// travessia de rio: velocidades somadas como vetores
D.rio = p => fig(300, 188, F => {
  const y1 = 34, y2 = 154; F.add(re(0, y1, 300, y2 - y1, 'n', 'fw', 0, 0)); F.add(F.luz(re(0, y1, 300, y2 - y1, 'n', 'fw', 0, 0), 'liq'));
  F.add(re(0, 0, 300, y1, 'n', 'fg2', 0, 0, ' opacity=".35"') + re(0, y2, 300, 34, 'n', 'fg2', 0, 0, ' opacity=".35"') + ln(0, y1, 300, y1, 'k', 2) + ln(0, y2, 300, y2, 'k', 2));
  for (const x of [200, 250]) for (const yy of [60, 130]) F.add(op(seta(x - 16, yy, x + 16, yy, 's', 1.2), 0.6));
  const o = [86, y2 - 8], k = 20;
  F.add(pa(`M${o[0] - 8},${o[1] + 6} L${o[0] - 8},${o[1] - 12} L${o[0]},${o[1] - 22} L${o[0] + 8},${o[1] - 12} L${o[0] + 8},${o[1] + 6} Z`, 'k', 'fo', 1.5));
  F.add(ln(o[0] + 3 * k, o[1] - 4 * k, o[0] + 3 * k, o[1], 's', 1, '3 3') + ln(o[0], o[1] - 4 * k, o[0] + 3 * k, o[1] - 4 * k, 's', 1, '3 3'));
  vetor(F, o[0], o[1] - 20, o[0], o[1] - 4 * k, 'b', p.vb, { alt: [[-40, 0]] });
  vetor(F, o[0], o[1], o[0] + 3 * k, o[1], 'g', p.vc, { alt: [[0, -18]] });
  vetor(F, o[0], o[1], o[0] + 3 * k, o[1] - 4 * k, 'a', p.vr, { w: 3.2 });
  cota(F, 22, y1, 22, y2, p.L, { lado: 'dir' });
  F.legenda(p.t);
});

/* ---------- Mecânica · dinâmica ---------- */
// bloco sobre o piso com forças em escala (quando os módulos vêm em Fv, fv, Nv, Pv)
D.blocoForca = p => fig(300, p.d ? 196 : 176, F => {
  const t = p.ang ?? 0, yb = 140, bx = 106, bw = 72, bh = 46; chao(F, 4, 296, yb);
  bloco(F, bx, yb - bh, bw, bh, p.m, { chao: true });
  const usa = [p.Fv, p.fv, p.Nv, p.Pv].filter(v => v != null), k = usa.length ? 64 / Math.max(...usa) : null, L = (v, d) => (k && v != null ? v * k : d);
  const cx = bx + bw / 2, cy = yb - bh / 2, FL = L(p.Fv, 70);
  if (p.F) { if (t < 5) vetor(F, bx + bw, cy, bx + bw + FL, cy, 'a', p.F); else { vetor(F, bx + bw, cy, bx + bw + FL * Math.cos(rad(t)), cy - FL * Math.sin(rad(t)), 'a', p.F); F.add(ln(bx + bw, cy, bx + bw + 40, cy, 's', 1, '3 3')); angulo(F, bx + bw, cy, 24, 0, t, p.th || t + '°', 'k'); }
    if (p.Fdec) { const fx = FL * Math.cos(rad(t)), fy = FL * Math.sin(rad(t)); F.add(seta(bx + bw, cy, bx + bw, cy - fy, 'a', 1.6, { dash: '4 3' })); F.t(bx + bw - 6, cy - fy - 4, p.Fdec, { c: 'a', a: 'end' }); } }
  if (p.f) vetor(F, bx, yb - 6, bx - L(p.fv, 50), yb - 6, 'r', p.f);
  if (p.N) vetor(F, cx - 10, yb - bh, cx - 10, yb - bh - L(p.Nv, 46), 'g', p.N);
  if (p.P) vetor(F, cx + 10, cy, cx + 10, cy + L(p.Pv, 46), 'b', p.P, { alt: [[0, 0]] });
  if (p.d) { F.add(ln(bx, yb + 26, bx, yb + 20, 's', 1)); cota(F, bx, yb + 30, 286, yb + 30, p.d, { sobre: true }); }
  F.legenda(p.t);
});
// bola com velocidade (quantidade de movimento) ou recebendo uma força por um intervalo curto (impulso)
D.bolaVel = p => fig(300, 150, F => {
  const y = 118; chao(F, 4, 296, y);
  bola(F, 110, y - 26, 26, 'fh', { chao: y, lab: p.m });
  if (p.F) { vetor(F, 30, y - 26, 82, y - 26, 'a', ''); F.t(30, y - 64, p.F, { c: 'a', a: 'start', b: true }); }
  if (p.v) vetor(F, 140, y - 26, 210, y - 26, 'b', p.v);
  F.legenda(p.t);
});
D.peso = p => fig(300, 196, F => {
  const yb = 170; chao(F, 4, 296, yb);
  pessoa(F, 110, yb, { h: 92 });
  vetor(F, 110, yb - 56, 110, yb + 0 - 2 + 18, 'b', p.P, { alt: [[60, -30]] });
  vetor(F, 136, yb, 136, yb - 62, 'g', p.N);
  F.t(110, 22, p.m, { c: 'k', b: true });
  F.legenda(p.t);
});
D.pendurado = p => fig(300, 196, F => {
  const kk = 56 / (p.Tv || 1), PL = (p.Pv || 1) * kk; teto(F, 90, 210, 18);
  F.add(ln(150, 18, 150, 96, 'k', 2.4));
  bloco(F, 116, 96, 68, 46, p.m, {});
  vetor(F, 150, 96, 150, 96 - 56, 'a', p.T);
  vetor(F, 150, 142, 150, 142 + PL, 'b', p.P);
  if (p.a) vetor(F, 232, 140, 232, 96, 'k', p.a, { w: 2.2 });
  F.legenda(p.t);
});
// mola presa à parede, esticada (padrão) ou comprimida (p.comp)
D.mola = p => fig(300, 180, F => {
  const yb = 132, comp = !!p.comp, xn = 152, dx = comp ? -34 : 34, xb = xn + dx; chao(F, 4, 296, yb); parede(F, 30, 50, yb, -1);
  F.add(mola(30, yb - 24, xb, comp ? 12 : 9, comp ? 9 : 8));
  bloco(F, xb, yb - 48, 52, 48, p.m || '', { chao: true });
  F.add(ln(xn, 46, xn, yb, 's', 1.1, '3 3')); F.t(xn, 40, 'posição natural', { c: 's', s: FSS });
  cota(F, Math.min(xn, xb), 62, Math.max(xn, xb), 62, p.x, { lado: 'acima' });
  if (p.F) comp ? vetor(F, xb + 100, yb - 24, xb + 56, yb - 24, 'a', p.F) : vetor(F, xb + 52, yb - 24, xb + 96, yb - 24, 'a', p.F);
  F.t(90, yb + 30, p.k, { c: 'k', b: true });
  F.legenda(p.t);
});
// duas molas iguais, em série e em paralelo
D.molas = p => fig(300, 176, F => {
  teto(F, 20, 280, 16);
  F.add(molaV(80, 16, 62, 5, 7) + ln(74, 62, 86, 62, 'k', 2) + molaV(80, 62, 110, 5, 7)); bloco(F, 62, 110, 36, 26, '');
  F.add(molaV(196, 16, 80, 6, 7) + molaV(232, 16, 80, 6, 7) + ln(186, 80, 242, 80, 'k', 3)); bloco(F, 196, 80, 36, 26, '');
  F.t(80, 160, p.a, { c: 'k', b: true }); F.t(214, 130, p.b, { c: 'k', b: true });
  F.t(80, 176 - 2, '', {}); F.legenda(p.t);
});
// dois blocos encostados empurrados por F
D.blocos = p => fig(300, 170, F => {
  const yb = 130; chao(F, 4, 296, yb);
  bloco(F, 112, yb - 52, 60, 52, p.A, { chao: true }); bloco(F, 172, yb - 40, 54, 40, p.B, { chao: true });
  vetor(F, 50, yb - 26, 110, yb - 26, 'a', ''); F.t(50, yb - 40, p.F, { c: 'a', a: 'start', b: true });
  F.add(ln(172, yb - 40, 172, yb - 66, 's', 1, '2 2')); vetor(F, 172, yb - 62, 214, yb - 62, 'g', '', { w: 2.4 }); F.t(218, yb - 58, p.FAB, { c: 'g', a: 'start', b: true }); F.t(172, yb - 74, 'A em B', { c: 's', s: FSS });
  F.legenda(p.t);
});
// bloco A na mesa lisa ligado a B pendurado (forças em escala: 1 px por N × 1,5)
D.mesaPolia = p => fig(300, 216, F => {
  const ym = 78, k = 1.4; const tb = re(14, ym, 214, 10, 'k', 'fmad', 1, 1.6); F.add(tb + F.luz(tb) + re(24, ym + 10, 10, 120, 'k', 'fmad', 1, 1.4) + re(208, ym + 10, 10, 120, 'k', 'fmad', 1, 1.4));
  chao(F, 4, 296, ym + 130);
  bloco(F, 70, ym - 40, 64, 40, p.A);
  const px = 240, py = ym - 8; F.add(ln(134, ym - 20, px, ym - 20, 'k', 1.6) + ln(px + 12, py, px + 12, 128, 'k', 1.6) + ln(226, ym, px, py, 'k', 2));
  polia(F, px, py, 12);
  bloco(F, px - 8, 128, 40, 40, p.B);
  vetor(F, 134, ym - 30, 134 + 12 * k * 1.6, ym - 30, 'a', p.T, { alt: [[0, -12]] });
  vetor(F, px + 12, 128, px + 12, 128 - 12 * k * 1.6, 'a', '');
  vetor(F, px + 22, 168, px + 22, 168 + 20 * k, 'b', p.PB);
  vetor(F, 112, ym - 40, 112, ym - 40 - 30 * k, 'g', p.N);
  vetor(F, 92, ym - 20, 92, ym - 20 + 30 * k, 'b', ''); F.t(100, ym + 36, p.PA, { c: 'b', a: 'start', b: true });
  F.t(px - 14, 112, p.T2 || '', { c: 'a', a: 'end', b: true });
  F.legenda(p.t);
});
// máquina de Atwood: m₁ desce, m₂ sobe (forças em escala)
D.atwood = p => fig(300, 206, F => {
  const k = 40 / 30; teto(F, 100, 200, 14);
  F.add(ln(150, 14, 150, 24, 'k', 2.4)); polia(F, 150, 40, 16);
  F.add(ln(134, 40, 134, 112, 'k', 1.6) + ln(166, 40, 166, 70, 'k', 1.6));
  bloco(F, 112, 112, 44, 34, p.m1); bloco(F, 148, 70, 40, 30, p.m2);
  vetor(F, 120, 112, 120, 112 - 24 * k, 'a', p.T);
  vetor(F, 140, 146, 140, 146 + 30 * k, 'b', p.P1);
  vetor(F, 180, 70, 180, 70 - 24 * k, 'a', p.T, { alt: [[0, -10]] });
  vetor(F, 166, 100, 166, 100 + 20 * k, 'b', p.P2);
  vetor(F, 64, 120, 64, 160, 'k', '', { w: 2 }); F.t(58, 140, 'a', { c: 'k', a: 'end', b: true });
  vetor(F, 236, 106, 236, 66, 'k', '', { w: 2 }); F.t(244, 88, 'a', { c: 'k', a: 'start', b: true });
  F.legenda(p.t);
});
D.elevador = p => fig(300, 210, F => {
  const k = 50 / 840; F.add(ln(150, 0, 150, 18, 'k', 2.4));
  const cab = re(40, 18, 220, 158, 'k', 'fp', 4, 2); F.add(cab + F.luz(cab) + re(126, 162, 48, 7, 'k', 'fm', 1, 1.2));
  pessoa(F, 150, 162, { h: 82 });
  vetor(F, 170, 160, 170, 160 - 840 * k, 'g', ''); F.t(176, 128, p.N, { c: 'g', a: 'start', b: true });
  vetor(F, 130, 120, 130, 120 + 700 * k, 'b', ''); F.t(124, 150, p.P, { c: 'b', a: 'end', b: true });
  vetor(F, 282, 130, 282, 70, 'k', ''); F.t(278, 60, p.a, { c: 'k', a: 'end', b: true });
  F.t(150, 190 - 2, 'balança', { c: 's', s: FSS });
  F.legenda(p.t);
});
// curva plana vista de cima: v tangente, resultante para o centro
D.curva = p => fig(300, 196, F => {
  const cx = 150, cy = 230, R = 170;
  const arco = (r, c, w, dash) => { const [x1, y1] = P(cx, cy, r, 150), [x2, y2] = P(cx, cy, r, 30); return pa(`M${n1(x1)},${n1(y1)} A${r},${r} 0 0 1 ${n1(x2)},${n1(y2)}`, c, 'fn', w, dash); };
  F.add(arco(R, 's', 34).replace('class="s fn"', 'class="n fn" stroke="currentColor"').replace('stroke="currentColor"', 'style="stroke:var(--grid)"') + arco(R + 17, 'k', 1.6) + arco(R - 17, 'k', 1.6) + arco(R, 'p', 1.4, '8 7'));
  const c = re(cx - 18, cy - R - 9, 36, 18, 'k', 'fcar', 5, 1.6); F.add(c + F.luz(c));
  vetor(F, cx + 20, cy - R, cx + 78, cy - R, 'b', p.v, { alt: [[0, -14]] });
  vetor(F, cx, cy - R + 12, cx, cy - R + 70, 'a', p.F);
  if (p.at) { vetor(F, cx + 20, cy - R + 14, cx + 60, cy - R + 14, 'k', p.at, { w: 2 }); }
  F.add(ln(cx, cy - R + 72, cx, 196, 's', 1, '3 3')); F.t(cx + 8, 186, p.R, { c: 's', a: 'start' });
  F.t(cx - 8, 186, 'centro ↓', { c: 's', a: 'end', s: FSS });
  F.legenda(p.t);
});
// curva sobrelevada em corte: N e P somam uma resultante horizontal, para o centro
D.curvaInclinada = p => fig(300, 190, F => {
  const th = rad(p.ang || 22), x0 = 30, y0 = 160, L = 250, xt = x0 + L * Math.cos(th), yt = y0 - L * Math.sin(th);
  const pl = poly([[x0, y0], [xt, yt], [xt, y0]], 'k', 'fs', 2); F.add(pl + F.luz(pl));
  const s = 120, bx = x0 + s * Math.cos(th), by = y0 - s * Math.sin(th);
  const B = blocoGirado(F, bx, by, 50, 22, p.ang || 22, '');
  const [cx, cy] = B.c, N = 70, Pl = N * Math.cos(th), nx = -Math.sin(th), ny = -Math.cos(th);
  F.add(ln(cx + nx * N, cy + ny * N, cx + nx * N, cy, 's', 1, '3 3') + ln(cx, cy + Pl, cx + nx * N, cy + Pl - Pl, 's', 0, ''));
  vetor(F, cx, cy, cx + nx * N, cy + ny * N, 'g', p.N);
  vetor(F, cx, cy, cx, cy + Pl, 'b', p.P, { alt: [[18, 0]] });
  vetor(F, cx, cy, cx + nx * N, cy, 'a', p.Fcp, { w: 3.2, alt: [[0, 18]] });
  angulo(F, x0, y0, 44, 0, p.ang || 22, p.th, 'k');
  F.t(x0 + 4, 26, '← centro da curva', { c: 's', a: 'start', s: FSS });
  F.legenda(p.t);
});
D.loop = p => fig(300, 200, F => {
  const cx = 150, cy = 96, R = 66, yb = 176; chao(F, 4, 296, yb);
  F.add(ci(cx, cy, R, 'k', 'fn', 5) + ci(cx, cy, R, 'p', 'fn', 1.4, ' stroke-dasharray="6 6"') + pa(`M10,${yb - 3} Q${cx - 30},${yb - 3} ${cx},${cy + R}`, 'k', 'fn', 5));
  F.add(ci(cx, cy, 2.5, 'k', 'fk', 0)); cota(F, cx, cy, cx + R - 3, cy, p.R, { sobre: true });
  const c = re(cx - 16, cy - R + 4, 32, 14, 'k', 'fcar', 4, 1.5); F.add(c + F.luz(c));
  vetor(F, cx + 18, cy - R + 10, cx + 72, cy - R + 10, 'b', p.v);
  vetor(F, cx, cy - R + 20, cx, cy - R + 56, 'b', 'P', { w: 2.2 });
  F.t(cx - R - 6, cy - R + 8, 'no topo: só P', { c: 's', a: 'end', s: FSS });
  F.legenda(p.t);
});
// rampa curva: só a altura importa para o trabalho do peso e para a energia
D.rampa = p => fig(300, 190, F => {
  const yb = 164; chao(F, 4, 296, yb);
  const rp = pa(`M64,30 Q80,${yb} 190,${yb} L296,${yb} L296,${yb + 0} L60,${yb} L56,30 Z`, 'k', 'fs', 0); F.add(rp.replace('stroke-width="0"', 'stroke-width="0" opacity=".55"') + pa(`M64,30 Q80,${yb} 190,${yb}`, 'k', 'fn', 3));
  if (p.pessoa) pessoa(F, 66, 26, { h: 28 }); else bola(F, 70, 24, 7, 'fa');
  F.add(ln(68, 22, 22, 22, 's', 1, '2 3'));
  cota(F, 26, 22, 26, yb, p.h, { lado: 'dir' });
  vetor(F, 214, yb - 14, 270, yb - 14, 'b', p.v, { alt: [[-40, -14]] });
  if (p.atr) F.t(150, yb - 56, p.atr, { c: 'r', b: true });
  F.t(120, 60, p.m || '', { c: 'k', a: 'start' });
  F.legenda(p.t);
});
D.guincho = p => fig(300, 196, F => {
  const yb = 176; chao(F, 4, 296, yb);
  const m = re(110, 10, 80, 26, 'k', 'fm', 4, 1.8); F.add(m + F.luz(m) + `<text x="150" y="28" class="tk tb7" text-anchor="middle" font-size="${FSS}">motor</text>`); F.reserva(110, 10, 80, 26);
  F.add(ln(150, 36, 150, 60, 'k', 1.6)); bloco(F, 122, 60, 56, 40, p.m);
  F.add(re(122, yb - 40, 56, 40, 's', 'fn', 3, 1.2, ' stroke-dasharray="4 3"')); F.t(150, yb - 15, 'início', { c: 's', s: FSS });
  vetor(F, 200, 104, 200, 62, 'b', 'v constante');
  F.add(ln(122, 100, 52, 100, 's', 1, '2 3')); cota(F, 60, 100, 60, yb, p.h, { lado: 'esq' });
  F.legenda(p.t);
});
// diagrama de Sankey: largura das faixas proporcional à potência
D.sankey = p => fig(300, 176, F => {
  const k = 100 / p.total, H = p.total * k, U = p.util * k, Dd = H - U, y = 30;
  F.add(pa(`M10,${y} L110,${y} L110,${y + H} L10,${y + H} Z`, 'n', 'fh', 0));
  F.add(pa(`M140,${y} L250,${y} L278,${y + U / 2} L250,${y + U} L140,${y + U} Z`, 'n', 'fh', 0));
  F.add(pa(`M140,${y + U} L150,${y + U} Q${150 + Dd},${y + U} ${150 + Dd},${y + H + 10} L${150 + Dd},${y + H + 26} L150,${y + H + 26} L150,${y + H + 10} Q150,${y + H} 140,${y + H} Z`, 'n', 'fs', 0));
  const mo = re(106, y - 6, 38, H + 12, 'k', 'fm', 5, 1.8); F.add(mo + F.luz(mo)); F.reserva(106, y - 6, 38, H + 12);
  F.add(`<text x="125" y="${y + H / 2 + 5}" class="tk tb7" text-anchor="middle" font-size="${FSS}">motor</text>`.replace('<text', `<text transform="rotate(-90 125 ${y + H / 2})"`));
  F.t(58, y + H / 2 + 5, p.tot, { c: 'a', b: true }); F.t(206, y + U / 2 + 5, p.utilL, { c: 'k', b: true });
  F.t(150 + Dd + 8, y + H + 22, p.diss, { c: 's', a: 'start', b: true });
  F.legenda(p.t);
});
D.parede = p => fig(300, 176, F => {
  parede(F, 260, 20, 150, 1); chao(F, 4, 260, 150);
  bola(F, 150, 62, 12, 'fh'); vetor(F, 70, 62, 134, 62, 'b', ''); F.t(102, 50, p.v1, { c: 'b', b: true }); F.t(20, 66, 'antes', { c: 's', a: 'start' });
  bola(F, 150, 120, 12, 'fh'); vetor(F, 134, 120, 70, 120, 'b', ''); F.t(102, 108, p.v2, { c: 'b', b: true }); F.t(20, 124, 'depois', { c: 's', a: 'start' });
  F.legenda(p.t);
});
D.quique = p => fig(300, 176, F => {
  const yb = 150; chao(F, 4, 296, yb);
  F.add(pa(`M100,40 L100,${yb - 9} Q150,${yb + 4} 200,${yb - 9} L200,70`, 's', 'fn', 1.2, '4 4'));
  bola(F, 100, 40, 9, 'fh'); bola(F, 200, 70, 9, 'fp');
  vetor(F, 80, 70, 80, 130, 'b', p.v1, { alt: [[-24, 0]] });
  vetor(F, 222, 130, 222, 90, 'g', p.v2);
  F.t(80, 26, 'chegada', { c: 's' }); F.t(222, 60, 'saída', { c: 's' });
  F.legenda(p.t);
});
// rifle e bala: Q total nula antes e depois
D.recuo = p => fig(300, 156, F => {
  const y = 80;
  const r = pa(`M70,${y - 7} L196,${y - 7} L196,${y + 3} L128,${y + 3} L118,${y + 10} L102,${y + 10} Q96,${y + 26} 80,${y + 34} L64,${y + 34} Q70,${y + 16} 70,${y + 3} Z`, 'k', 'fmad', 1.8);
  F.add(r + F.luz(r)); F.t(122, y + 32, p.mr || '', { c: 'k', a: 'start' });
  bola(F, 226, y - 2, 4.5, 'fm'); F.t(226, y - 12, p.mb || '', { c: 'k' });
  vetor(F, 240, y - 2, 290, y - 2, 'b', '', {}); F.t(286, y + 22, p.vb, { c: 'b', a: 'end', b: true });
  vetor(F, 60, y - 2, 14, y - 2, 'g', '', {}); F.t(14, y - 14, p.vr, { c: 'g', a: 'start', b: true });
  F.legenda(p.t);
});
// colisão em linha reta: antes e depois
D.colisao = p => fig(300, 196, F => {
  const cart = (x, y, w, lab, f) => { const r = re(x, y - 30, w, 24, 'k', f, 4, 1.6); F.add(r + F.luz(r) + ci(x + 10, y - 4, 5, 'k', 'fk', 0) + ci(x + w - 10, y - 4, 5, 'k', 'fk', 0)); F.reserva(x, y - 30, w, 24).add(`<text x="${x + w / 2}" y="${y - 13}" class="tk tb7" text-anchor="middle" font-size="${FSS}">${mathTxt(lab)}</text>`); F.rotulos.push(lab); };
  F.add(ln(6, 84, 294, 84, 'k', 1.6) + ln(6, 172, 294, 172, 'k', 1.6)); F.t(8, 24, 'antes', { c: 's', a: 'start', b: true }); F.t(8, 112, 'depois', { c: 's', a: 'start', b: true });
  cart(50, 84, 60, p.ma, 'fh'); vetor(F, 112, 70, 160, 70, 'b', ''); F.t(136, 58, p.va, { c: 'b', b: true }); cart(186, 84, 60, p.mb, 'fw'); F.t(216, 44, 'parado', { c: 's' });
  if (p.juntos) { cart(110, 172, 120, (p.ma) + ' + ' + (p.mb), 'fo'); vetor(F, 232, 158, 280, 158, 'b', ''); F.t(256, 146, p.v, { c: 'b', b: true }); }
  else { cart(70, 172, 60, p.ma, 'fh'); vetor(F, 66, 158, 20, 158, 'b', ''); F.t(43, 146, p.vaa, { c: 'b', b: true }); cart(186, 172, 60, p.mb, 'fw'); vetor(F, 248, 158, 294, 158, 'b', ''); F.t(271, 146, p.vbb, { c: 'b', b: true }); }
  F.legenda(p.t);
});

/* ---------- Mecânica · gravitação ---------- */
D.massas = p => fig(300, 156, F => {
  astro(F, 70, 70, 30, 'fm', 'k'); astro(F, 230, 70, 30, 'fm', 'k');
  F.add(`<text x="70" y="75" class="tk tb7" text-anchor="middle" font-size="${FS}">${mathTxt(p.M)}</text><text x="230" y="75" class="tk tb7" text-anchor="middle" font-size="${FS}">${mathTxt(p.m)}</text>`); F.reserva(50, 60, 40, 20).reserva(210, 60, 40, 20);
  vetor(F, 102, 70, 140, 70, 'a', ''); vetor(F, 198, 70, 160, 70, 'a', ''); F.t(121, 58, 'F', { c: 'a', b: true }); F.t(179, 58, 'F', { c: 'a', b: true });
  cota(F, 70, 124, 230, 124, p.d, { sobre: true });
  F.legenda(p.t);
});
// planeta visto de longe: superfície, altura h e g no ponto
D.altitude = p => fig(300, 196, F => {
  const cx = 150, cy = 230, R = 130; astro(F, cx, cy, R, 'fw', 'b');
  F.add(pa(`M${cx - 80},${cy - 98} Q${cx - 40},${cy - 116} ${cx},${cy - 108} Q${cx + 40},${cy - 100} ${cx + 70},${cy - 108}`, 'g', 'fn', 2).replace('/>', ' opacity=".6"/>'));
  F.t(cx, 186, p.planeta, { c: 'b', b: true });
  if (p.boneco) { const yb = cy - R; pessoa(F, cx, yb - 66, { h: 30 }); const pl = re(cx - 36, yb - 66, 50, 6, 'k', 'fmad', 1, 1.4); F.add(pl + ln(cx + 10, yb - 60, cx + 10, yb, 'k', 3)); cota(F, cx + 56, yb, cx + 56, yb - 66, p.h, { lado: 'dir' }); vetor(F, cx - 24, yb - 94, cx - 24, yb - 70, 'b', p.g, { alt: [[-14, 0]] }); }
  else { const yh = 34; bola(F, cx, yh, 7, 'fa'); vetor(F, cx, yh + 10, cx, yh + 42, 'b', p.g, { alt: [[-50, 0]] }); cota(F, cx + 56, cy - R, cx + 56, yh, p.h, { lado: 'dir' }); }
  F.t(30, 30, p.m || '', { c: 'k', a: 'start' });
  F.legenda(p.t);
});
// órbita elíptica com o Sol num foco (ou circular)
D.orbita = p => fig(300, p.circ ? 188 : 178, F => {
  const circ = !!p.circ, a = circ ? (p.r2 ? 46 : 70) : (p.a || 90), e = circ ? 0 : (p.e ?? 0.5), c = a * e, b = a * Math.sqrt(1 - e * e), cx = 150, cy = circ ? 92 : 86, Fx = cx - c;
  F.add(el(cx, cy, a, b, 's', 'fn', 1.5, circ ? '' : '5 4'));
  if (p.r2) F.add(ci(cx, cy, a * 1.55, 's', 'fn', 1.2, ' stroke-dasharray="3 4"'));
  sol(F, Fx, cy, circ ? 15 : 12); F.t(Fx, cy + (circ ? 38 : 32), p.astro || 'Sol', { c: 'a', b: true, alt: [[0, -62]] });
  if (circ) { astro(F, cx + a, cy, 8, 'fw', 'b'); cota(F, cx + 2, cy, cx + a - 10, cy, '', {}); F.t(cx + a / 2 + 8, cy + 20, p.r, { c: 'k', b: true }); F.t(cx + a + 12, cy + 4, p.v, { c: 'b', a: 'start', b: true });
    if (p.r2) { astro(F, cx + a * 1.55 * 0.7, cy - a * 1.55 * 0.71, 6, 'fw', 'b'); F.t(cx + a * 1.55 * 0.7 + 10, cy - a * 1.55 * 0.71, p.r2, { c: 'k', a: 'start', b: true }); } }
  else { astro(F, cx - a, cy, 6, 'fw', 'b'); astro(F, cx + a, cy, 7, 'fw', 'b');
    if (p.vp) vetor(F, cx - a, cy - 8, cx - a, cy - 64, 'b', p.vp, { alt: [] });
    if (p.v) vetor(F, cx + a, cy - 9, cx + a, cy - 9 - 64 / 3, 'b', p.v);
    F.t(cx - a, cy + 22, p.peri, { c: 's', alt: [[30, 0]] }); F.t(cx + a, cy + 24, p.af, { c: 's' });
    if (p.semi) { cota(F, cx - a, cy + b + 12, cx + a, cy + b + 12, p.semi, { sobre: true }); } }
  F.legenda(p.t);
});
D.escape = p => fig(300, 190, F => {
  const cx = 150, cy = 250, R = 130; astro(F, cx, cy, R, 'fw', 'b'); F.t(cx, 178, p.planeta, { c: 'b', b: true });
  const fg = pa(`M${cx - 7},${cy - R - 2} L${cx - 7},${cy - R - 28} Q${cx},${cy - R - 44} ${cx + 7},${cy - R - 28} L${cx + 7},${cy - R - 2} Z`, 'k', 'fp', 1.5); F.add(fg + F.luz(fg, 'cilv'));
  chama(F, cx, cy - R + 10, 0.5);
  vetor(F, cx, cy - R - 50, cx, 18, 'b', p.v, { alt: [[60, 20]] });
  F.t(cx + 14, 24, p.inf || '', { c: 's', a: 'start' });
  F.legenda(p.t);
});
D.satelite = p => fig(300, 190, F => {
  const cx = 130, cy = 96, Rp = 36, r = 80; astro(F, cx, cy, Rp, 'fw', 'b'); F.t(cx, cy + 5, p.planeta || 'Terra', { c: 'k', b: true, s: FSS });
  F.add(ci(cx, cy, r, 's', 'fn', 1.3, ' stroke-dasharray="5 4"'));
  const [sx, sy] = P(cx, cy, r, 40); const s = re(sx - 6, sy - 5, 12, 10, 'k', 'fm', 1, 1.2); F.add(ln(sx - 16, sy, sx + 16, sy, 'b', 3) + s);
  vetor(F, sx + 6, sy + 6, sx + 6 + 40 * Math.sin(rad(40)), sy + 6 + 40 * Math.cos(rad(40)), 'b', '');
  cota(F, cx, cy, ...P(cx, cy, r - 2, -30), '', {}); F.t(...P(cx + 4, cy + 18, r / 2, -30), p.r, { c: 'k', a: 'start', b: true });
  F.t(250, 30, p.v || '', { c: 'b', b: true });
  F.legenda(p.t);
});
/* ---------- Mecânica · estática ---------- */
// luminária presa por dois fios simétricos
D.luminaria = p => fig(300, 196, F => {
  const th = p.ang || 30, K = [150, 96], L = 100; teto(F, 20, 280, 22);
  const A = [K[0] - (K[1] - 22) / Math.tan(rad(th)), 22], B = [K[0] + (K[1] - 22) / Math.tan(rad(th)), 22];
  F.add(ln(A[0], A[1], K[0], K[1], 'k', 1.6) + ln(B[0], B[1], K[0], K[1], 'k', 1.6) + ln(K[0], K[1], K[0], 112, 'k', 1.6));
  const lm = pa(`M134,112 L166,112 L180,138 L120,138 Z`, 'k', 'fh', 1.8); F.add(lm + F.luz(lm) + ci(150, 142, 5, 'a', 'fsol', 1));
  vetor(F, ...K, K[0] - 56 * Math.cos(rad(th)), K[1] - 56 * Math.sin(rad(th)), 'a', p.T, { alt: [[0, 14]] });
  vetor(F, ...K, K[0] + 56 * Math.cos(rad(th)), K[1] - 56 * Math.sin(rad(th)), 'a', p.T2 || p.T, { alt: [[0, 14]] });
  vetor(F, 150, 148, 150, 148 + 40, 'b', p.P);
  F.add(ln(A[0], 22, A[0] + 50, 22, 's', 0));
  angulo(F, A[0], A[1], 34, 0, -th, p.th || th + '°', 'k');
  if (p.ang120) { angulo(F, K[0], K[1], 18, 30, 150, '120°', 's'); }
  F.legenda(p.t);
});
D.chave = p => fig(300, 170, F => {
  const y = 72; const c = pa(`M60,${y - 10} l12,-8 l12,8 l0,20 l-12,8 l-12,-8 z`, 'k', 'fm', 1.8);
  const h = re(84, y - 7, 160, 14, 'k', 'fm', 7, 1.8); F.add(h + F.luz(h, 'cil') + c + F.luz(c) + ci(72, y, 5, 'k', 'fk', 0));
  vetor(F, 232, y + 9, 232, y + 66, 'a', p.F);
  F.add(ln(72, y, 72, y + 84, 's', 1, '2 3')); cota(F, 72, y - 34, 232, y - 34, p.b, { sobre: true });
  F.add(reto(232, y, 0, 1, 8)); F.t(72, y + 98, 'eixo', { c: 's', s: FSS });
  F.legenda(p.t);
});
// gangorra: pesos e braços em escala
D.gangorra = p => fig(300, 190, F => {
  const yb = 168, yt = 126, x0 = 150; chao(F, 60, 240, yb);
  const ap = pa(`M${x0},${yt + 4} L${x0 - 20},${yb} L${x0 + 20},${yb} Z`, 'k', 'fm', 2); F.add(ap + F.luz(ap));
  const tb = re(20, yt - 4, 260, 8, 'k', 'fmad', 2, 1.6); F.add(tb + F.luz(tb, 'cil'));
  pessoa(F, p.x1, yt - 4, { h: 44 }); pessoa(F, p.x2, yt - 4, { h: 52 });
  vetor(F, p.x1, yt + 6, p.x1, yt + 40, 'b', ''); F.t(p.x1 + 6, yt + 30, p.P1, { c: 'b', a: 'start', b: true }); vetor(F, p.x2, yt + 6, p.x2, yt + 40, 'b', ''); F.t(p.x2 + 6, yt + 30, p.P2, { c: 'b', a: 'start', b: true });
  F.add(ln(p.x1, 30, p.x1, 60, 's', 0.8, '2 2') + ln(x0, 30, x0, yt - 6, 's', 0.8, '2 2') + ln(p.x2, 30, p.x2, 60, 's', 0.8, '2 2'));
  cota(F, p.x1, 36, x0, 36, p.b1, { sobre: true }); cota(F, x0, 36, p.x2, 36, p.b2, { sobre: true });
  F.legenda(p.t);
});
// centro de massa de duas massas numa barra (eixo x em escala)
D.cm = p => fig(300, 170, F => {
  const X = x => 40 + x * 44, y = 84;
  const b = re(X(0) - 6, y - 3, X(5) - X(0) + 12, 6, 'k', 'fmad', 2, 1.2); F.add(b + F.luz(b, 'cil'));
  bloco(F, X(0) - 16, y - 34, 32, 31, p.m1); bloco(F, X(5) - 19, y - 40, 38, 37, p.m2);
  F.add(seta(20, 128, 290, 128, 'k', 1.4)); F.t(288, 146, 'x (m)', { c: 's', a: 'end', s: FSS });
  for (const v of [0, 1, 2, 3, 4, 5]) { F.add(ln(X(v), 124, X(v), 132, 'k', 1.2)); F.t(X(v), 148, String(v), { c: 's', s: FSS + 0.5 }); }
  F.add(ci(X(3), y, 8, 'k', 'fp', 1.6) + pa(`M${X(3)},${y - 8} A8,8 0 0 1 ${X(3) + 8},${y} L${X(3)},${y} Z M${X(3)},${y + 8} A8,8 0 0 1 ${X(3) - 8},${y} L${X(3)},${y} Z`, 'n', 'fk', 0));
  F.add(ln(X(3), y + 10, X(3), 124, 'a', 1.6, '3 3')); F.t(X(3), y - 18, p.cm, { c: 'a', b: true });
  F.legenda(p.t);
});
// alavanca (pé de cabra), braços em escala: 0,5 m até a carga e 3 m até a mão
D.alavanca = p => fig(300, 196, F => {
  const yb = 168, yr = 124, k = 62, xa = 82, xc = xa - 0.5 * k, xf = xa + 3 * k;
  chao(F, 6, 294, yb);
  const ap = pa(`M${xa},${yr + 4} L${xa - 14},${yb} L${xa + 14},${yb} Z`, 'k', 'fm', 2); F.add(ap + F.luz(ap));
  const bar = re(xc - 10, yr - 3, xf - xc + 16, 7, 'k', 'fm', 3, 1.6); F.add(bar + F.luz(bar, 'cil'));
  bloco(F, xc - 34, yr - 50, 44, 47, '', {});
  vetor(F, xc, yr + 4, xc, yr + 40, 'b', ''); F.t(xc - 6, yr + 32, p.R, { c: 'b', a: 'end', b: true });
  vetor(F, xf, yr - 50, xf, yr - 5, 'a', ''); F.t(xf - 8, yr - 30, p.F, { c: 'a', a: 'end', b: true });
  for (const x of [xc, xa, xf]) F.add(ln(x, 34, x, x === xa ? yr - 4 : x === xc ? yr - 52 : yr - 54, 's', 0.8, '2 2'));
  cota(F, xc, 40, xa, 40, '', {}); F.t((xc + xa) / 2, 28, p.br, { c: 's' });
  cota(F, xa, 40, xf, 40, p.bp, { sobre: true });
  F.legenda(p.t);
});
// talha exponencial: 3 polias móveis em cascata. Cada corda tem uma ponta no teto, passa por baixo de uma polia
// e puxa o eixo da polia de cima; a tração cai à metade a cada polia (400 N, 200 N, 100 N)
D.polias = p => fig(300, 226, F => {
  const r = 17, yt = 16, xs = [66, 83, 100], ys = [176, 126, 76], tr = ['400 N', '200 N', '100 N'];
  teto(F, 20, 280, yt);
  const xf = xs[2] + r + 16, yf = 40;                     // polia fixa
  F.add(ln(xf, yt, xf, yf, 'k', 2.2));
  for (let i = 0; i < 3; i++) {
    const x = xs[i], y = ys[i], topo = i < 2 ? ys[i + 1] + r + 16 : null;
    F.add(ln(x - r, yt, x - r, y, 'k', 1.6));                                        // ponta presa ao teto
    if (i < 2) F.add(ln(x + r, y, x + r, topo, 'k', 1.6) + ln(xs[i + 1], ys[i + 1], xs[i + 1], topo, 'k', 2.4));  // sobe até a alça da polia de cima
    else F.add(ln(x + r, y, x + r, yf, 'k', 1.6));
    F.add(pa(`M${x - r},${y} A${r},${r} 0 0 0 ${x + r},${y}`, 'k', 'fn', 1.6));
    polia(F, x, y, r - 3);
    F.t(x - r - 6, y - 14, tr[i], { c: 'a', a: 'end', s: FSS, b: true });
  }
  polia(F, xf, yf, 16); F.add(pa(`M${xs[2] + r},${yf} A16,16 0 0 1 ${xf + 16},${yf}`, 'k', 'fn', 1.6) + ln(xf + 16, yf, xf + 16, 150, 'k', 1.6));
  F.add(ln(xs[0], ys[0], xs[0], 200, 'k', 2.4)); bloco(F, xs[0] - 24, 200, 48, 22, p.P);
  vetor(F, xf + 16, 150, xf + 16, 196, 'a', p.F);
  F.t(250, 60, 'polia fixa', { c: 's', s: FSS });
  F.legenda(p.t);
});
/* ---------- Mecânica · hidrostática ---------- */
// tanque de água: pressão em profundidade
D.stevin = p => fig(300, 190, F => {
  const x = 40, y = 30, w = 170, h = 140, ys = 48;
  const ag = re(x + 2, ys, w - 4, y + h - ys - 2, 'n', 'fw', 0, 0); F.add(ag + F.luz(ag, 'liq') + pa(`M${x},${y} L${x},${y + h} L${x + w},${y + h} L${x + w},${y}`, 'k', 'fn', 2.4) + ln(x, ys, x + w, ys, 'b', 1.5));
  F.add(pa(`M${x + 30},${ys - 5} l6,5 l-12,0 z`, 'b', 'fb', 1));
  F.t(x + w / 2, ys - 8, p.p0, { c: 's' });
  F.add(ci(110, 142, 5, 'k', 'fa', 1.5)); F.t(110, 160, p.ponto, { c: 'a', b: true });
  F.add(ln(110, ys, 110, 136, 's', 1, '2 3'));
  cota(F, x + w + 18, ys, x + w + 18, 142, p.h, { lado: 'dir' }); F.add(ln(126, 142, x + w + 22, 142, 's', 0.8, '2 3'));
  F.legenda(p.t);
});
// elevador hidráulico: F₁ no pistão pequeno ergue o carro no grande (fora de escala)
D.prensa = p => fig(300, 200, F => {
  const yb = 176, y1 = 104, y2 = 92;
  const liq = pa(`M42,${y1} L42,${yb} L262,${yb} L262,${y2} L178,${y2} L178,148 L76,148 L76,${y1} Z`, 'n', 'fw', 0); F.add(liq + F.luz(liq, 'liq'));
  F.add(pa(`M40,60 L40,${yb + 2} L264,${yb + 2} L264,60 M176,60 L176,146 L78,146 L78,60`, 'k', 'fn', 2.4));
  const p1 = re(42, y1 - 10, 34, 10, 'k', 'fm', 1, 1.4), p2 = re(178, y2 - 10, 84, 10, 'k', 'fm', 1, 1.4); F.add(p1 + F.luz(p1) + p2 + F.luz(p2));
  carro(F, 180, y2 - 10, { L: 80 });
  vetor(F, 59, 40, 59, y1 - 12, 'a', ''); F.t(66, 52, p.F1, { c: 'a', a: 'start', b: true });
  vetor(F, 220, y2 + 30, 220, y2 + 2, 'g', ''); F.t(292, 132, p.F2, { c: 'g', a: 'end', b: true });
  F.t(59, yb + 18, p.A1, { c: 's' }); F.t(220, yb + 18, p.A2, { c: 's' });
  F.foraEscala();
  F.legenda(p.t);
});
D.empuxo = p => fig(300, 186, F => {
  const x = 70, y = 20, w = 160, h = 150, ys = 40;
  const ag = re(x + 2, ys, w - 4, y + h - ys - 2, 'n', 'fw', 0, 0); F.add(ag + F.luz(ag, 'liq') + pa(`M${x},${y} L${x},${y + h} L${x + w},${y + h} L${x + w},${y}`, 'k', 'fn', 2.4) + ln(x, ys, x + w, ys, 'b', 1.5));
  bloco(F, 124, 84, 52, 44, p.m, { f: 'fm' });
  vetor(F, 150, 84, 150, 50, 'g', p.E, { alt: [[60, 10]] });
  vetor(F, 168, 128, 168, 160, 'b', p.P || '', {});
  F.legenda(p.t);
});
D.iceberg = p => fig(300, 190, F => {
  const yw = 58; const ag = re(0, yw, 300, 132, 'n', 'fw', 0, 0); F.add(ag + F.luz(ag, 'liq') + ln(0, yw, 300, yw, 'b', 1.6));
  // 8% acima, 92% abaixo (áreas aproximadas na proporção)
  const ic = pa(`M128,${yw} L138,${yw - 14} L158,${yw - 18} L170,${yw - 6} L174,${yw} L214,${yw + 40} L200,${yw + 118} L124,${yw + 124} L86,${yw + 62} Z`, 'k', 'fp', 1.8); F.add(ic + F.luz(ic));
  F.add(ln(86, yw, 214, yw, 'b', 1.2, '4 3'));
  F.t(150, yw + 70, p.sub, { c: 'b', b: true }); F.t(236, yw - 16, p.acima || '8% acima', { c: 'k', a: 'start' });
  F.legenda(p.t);
});
// tubo em U: coluna de óleo (10 cm) equilibra coluna de água (8 cm) acima da interface
D.tuboU = p => fig(300, 196, F => {
  const k = 6, yi = 140, xl = 92, xr = 192, wt = 18, base = 176;
  const yo = yi - 10 * k, ya = yi - 8 * k;
  const agua = pa(`M${xl},${yi} L${xl},${base - 8} Q${xl},${base} ${xl + 8},${base} L${xr + wt - 8},${base} Q${xr + wt},${base} ${xr + wt},${base - 8} L${xr + wt},${ya} L${xr},${ya} L${xr},${base - wt} L${xl + wt},${base - wt} L${xl + wt},${yi} Z`, 'n', 'fw', 0);
  F.add(agua + F.luz(agua, 'liq') + re(xl, yo, wt, yi - yo, 'n', 'fh', 0, 0));
  F.add(pa(`M${xl},40 L${xl},${base - 8} Q${xl},${base} ${xl + 8},${base} L${xr + wt - 8},${base} Q${xr + wt},${base} ${xr + wt},${base - 8} L${xr + wt},40 M${xr},40 L${xr},${base - wt} L${xl + wt},${base - wt} L${xl + wt},40`, 'k', 'fn', 2.2));
  F.add(ln(50, yi, 250, yi, 's', 1, '4 3')); F.t(250, yi + 16, 'mesmo nível', { c: 's', a: 'end', s: FSS });
  cota(F, xl - 16, yo, xl - 16, yi, p.h1, { lado: 'esq' }); cota(F, xr + wt + 16, ya, xr + wt + 16, yi, p.h2, { lado: 'dir' });
  F.t(xl + 9, yo - 8, p.l1, { c: 'a', b: true }); F.t(xr + 9, ya - 8, p.l2, { c: 'b', b: true });
  F.legenda(p.t);
});
D.cubo = p => fig(300, 170, F => {
  const x = 96, y = 56, a = 72, d = 26;
  const fr = re(x, y, a, a, 'k', 'fm', 0, 1.8), top = poly([[x, y], [x + d, y - d * 0.7], [x + a + d, y - d * 0.7], [x + a, y]], 'k', 'fm', 1.8), lado = poly([[x + a, y], [x + a + d, y - d * 0.7], [x + a + d, y + a - d * 0.7], [x + a, y + a]], 'k', 'fm', 1.8);
  F.add(fr + F.luz(fr) + top + top.replace(/class="[^"]*"/, 'class="n" fill="#fff" opacity=".35"') + lado + lado.replace(/class="[^"]*"/, 'class="n" fill="#000" opacity=".12"'));
  F.reserva(x, y, a, a).add(`<text x="${x + a / 2}" y="${y + a / 2 + 5}" class="tk tb7" text-anchor="middle" font-size="${FS}">${mathTxt(p.m)}</text>`); F.rotulos.push(p.m);
  F.t(x + a + d + 12, y + a / 2, p.V, { c: 'k', a: 'start', b: true });
  F.legenda(p.t);
});
D.pressao = p => fig(300, 196, F => {
  const yb = 160; chao(F, 4, 296, yb);
  F.add(re(118, yb - 3, 64, 5, 'n', 'fh', 1, 0)); pessoa(F, 150, yb, { h: 100 });
  vetor(F, 150, 14, 150, 50, 'a', '', {}); F.t(160, 30, p.F, { c: 'a', a: 'start', b: true });
  cota(F, 118, yb + 16, 182, yb + 16, '', {}); F.t(150, yb + 33, p.A, { c: 'a', b: true });
  F.legenda(p.t);
});
// plataforma de salto: altura em relação ao solo (nível de referência)
D.trampolim = p => fig(300, 196, F => {
  const yb = 176, yt = 44; chao(F, 4, 296, yb);
  const t = re(92, yt, 14, yb - yt, 'k', 'fm', 1, 1.6); F.add(t + F.luz(t, 'cilv'));
  const pl = re(92, yt - 6, 86, 7, 'k', 'fmad', 1, 1.4); F.add(pl + F.luz(pl));
  pessoa(F, 160, yt - 6, { h: 30 });
  F.add(ln(178, yt, 230, yt, 's', 1, '2 3')); cota(F, 222, yt, 222, yb, p.h, { lado: 'dir' });
  vetor(F, 56, 60, 56, 100, 'b', 'g');
  F.t(140, yt - 22, p.m, { c: 'k', a: 'end', b: true });
  F.t(290, yb - 8, 'E_pg = 0 no solo', { c: 's', a: 'end', s: FSS });
  F.legenda(p.t);
});


/* ---------- Termologia ---------- */
// termômetros lado a lado marcando a mesma temperatura em escalas diferentes
D.termometros = p => fig(300, 196, F => {
  const xs = p.l3 === '' ? [100, 200] : [64, 150, 236], ls = [p.l1 || '°C', p.l2 || '°F', p.l3 || 'K'], vs = [p.v1, p.v2, p.v3], fs = [p.f1 ?? 70, p.f2 ?? 70, p.f3 ?? 70];
  xs.forEach((x, i) => { termometro(F, x, 150, 108, fs[i]); F.t(x, 186, ls[i], { c: 'k', b: true }); F.t(x, 24, vs[i], { c: 'a', b: true });
    F.add(ln(x - 6, 150 - fs[i], x - 18, 150 - fs[i], 'a', 1.4)); });
  if (p.ref) for (const [y, l] of p.ref) { F.add(ln(xs[0] - 30, y, xs[xs.length - 1] + 30, y, 's', 0.8, '2 3')); F.t(xs[xs.length - 1] + 32, y + 4, l, { c: 's', a: 'start', s: FSS }); }
  F.legenda(p.t);
});
// dilatação linear: barra antes e depois do aquecimento (ΔL exagerado)
D.barra = p => fig(300, 176, F => {
  const x0 = 30, L = 200, dL = 34;
  const b1 = re(x0, 38, L, 16, 'k', 'fm', 2, 1.6), b2 = re(x0, 98, L + dL, 16, 'k', 'fh', 2, 1.6);
  F.add(b1 + F.luz(b1, 'cil') + b2 + F.luz(b2, 'cil') + ln(x0, 26, x0, 128, 's', 1, '3 3') + ln(x0 + L, 56, x0 + L, 128, 's', 1, '3 3'));
  cota(F, x0, 70, x0 + L, 70, p.L0, { sobre: true }); cota(F, x0 + L, 128, x0 + L + dL, 128, '', {}); F.t(x0 + L + dL / 2, 146, p.dL, { c: 'a', b: true });
  F.t(x0, 30, p.t1 || 'antes', { c: 's', a: 'start' }); F.t(x0, 92, p.t2, { c: 'a', a: 'start', b: true });
  chama(F, 120, 160, 0.7); chama(F, 170, 160, 0.7);
  F.foraEscala('ΔL exagerado');
  F.legenda(p.t);
});
D.chapa = p => fig(300, 176, F => {
  const c = re(76, 44, 130, 86, 'k', 'fm', 2, 1.6); F.add(c + F.luz(c));
  F.add(re(66, 36, 150, 102, 'a', 'fn', 2, 1.6, ' stroke-dasharray="5 4"'));
  F.t(141, 93, p.A, { c: 'k', b: true }); F.t(222, 34, p.dA, { c: 'a', a: 'start', b: true, alt: [[-10, -16]] });
  F.t(141, 160, p.dt || '', { c: 's' });
  F.legenda(p.t);
});
// frasco cheio sendo aquecido: o líquido dilata mais que o vidro e transborda
D.frasco = p => fig(300, 196, F => {
  const vid = `M120,30 L120,62 Q86,78 86,114 L86,150 Q86,158 94,158 L206,158 Q214,158 214,150 L214,114 Q214,78 180,62 L180,30`;
  const liq = pa(vid.replace('M120,30', 'M120,28') + ' Z', 'n', 'fw', 0); F.add(liq + F.luz(liq, 'liq'));
  F.add(pa(vid, 'k', 'fn', 2.2) + ln(176, 60, 176, 36, 'p', 2).replace('/>', ' opacity=".7"/>'));
  F.add(pa('M180,28 Q196,26 198,44 L198,62', 'b', 'fn', 2.4) + ci(198, 70, 4, 'b', 'fb', 0) + ci(199, 84, 3, 'b', 'fb', 0));
  F.add(re(78, 164, 144, 6, 'k', 'fm', 1, 1.2)); chama(F, 128, 194, 0.7); chama(F, 172, 194, 0.7);
  F.t(150, 116, p.liq || 'líquido', { c: 'b', b: true }); F.t(206, 82, p.vaza, { c: 'b', a: 'start', b: true });
  F.legenda(p.t);
});
D.aquecimento = p => fig(300, 196, F => {
  bequer(F, 92, 40, 96, 92, 0.7);
  F.add(re(78, 132, 124, 5, 'k', 'fm', 1, 1.2) + ln(88, 137, 78, 182, 'k', 2) + ln(192, 137, 202, 182, 'k', 2));
  if (p.ebulidor) F.add(pa('M138,24 L138,86 Q138,104 124,104 Q110,104 110,90 Q110,78 124,80', 'a', 'fn', 3)); else chama(F, 140, 178, 0.9);
  termometro(F, 206, 110, 70, 40); F.add(ln(214, 50, 196, 60, 's', 0));
  F.t(140, 100, p.m, { c: 'b', b: true }); F.t(216, 46, p.th, { c: 'k', a: 'start', b: true, alt: [[-6, -16]] });
  F.t(40, 70, p.Q, { c: 'a', b: true, a: 'middle' });
  if (p.Q) F.add(seta(40, 80, 86, 120, 'a', 2.6));
  F.legenda(p.t);
});
D.mistura = p => fig(300, 176, F => {
  bequer(F, 16, 40, 66, 70, 0.7, 'fh'); bequer(F, 112, 40, 66, 70, 0.7, 'fw'); bequer(F, 216, 32, 70, 78, 0.85, 'fo');
  F.t(98, 82, '+', { c: 'k', b: true, s: 20 }); F.add(seta(188, 74, 208, 74, 'k', 2));
  F.t(49, 130, p.a1, { c: 'a', b: true, s: FSS }); F.t(49, 146, p.a2, { c: 'a', s: FSS });
  F.t(145, 130, p.b1, { c: 'b', b: true, s: FSS }); F.t(145, 146, p.b2, { c: 'b', s: FSS });
  F.t(251, 134, p.e, { c: 'k', b: true });
  F.legenda(p.t);
});
// gelo derretendo a 0 °C recebendo calor
D.gelo = p => fig(300, 176, F => {
  const yb = 140; F.add(pa(`M70,${yb} Q130,${yb - 10} 210,${yb}`, 'b', 'fw', 1.5));
  const g = re(104, 66, 72, 66, 'b', 'fw', 7, 1.8); F.add(g + F.luz(g) + pa('M116,80 L132,74 M150,96 L164,92', 'p', 'fn', 2.2));
  F.t(140, 104, p.m, { c: 'k', b: true });
  for (const [x1, y1] of [[40, 50], [40, 100]]) F.add(ondulada(x1, y1, 96, y1 + (y1 < 80 ? 26 : 0), 'r', 3, 10));
  F.t(30, 32, p.Q, { c: 'r', a: 'start', b: true });
  termometro(F, 244, 120, 70, 24); F.t(258, 50, p.th, { c: 'k', a: 'start', b: true, alt: [[-30, -14]] });
  F.legenda(p.t);
});
// curva de aquecimento da água: patamares de fusão e vaporização (calor em escala)
D.curvaAq = p => fig(300, 216, F => {
  const G = grafico(F, { x0: 48, y0: 176, w: 220, h: 140, xmax: 76000, ymin: -20, ymax: 120, yt: [[-10, '−10'], [0, '0'], [100, '100']], xl: 'Q (cal)', yl: 'θ (°C)' });
  const { X, Y } = G, pts = [[0, -10], [500, 0], [8500, 0], [18500, 100], [72500, 100]];
  F.add(pa(path(pts.map(q => [X(q[0]), Y(q[1])])), 'a', 'fn', 3));
  for (const q of pts) F.add(ci(X(q[0]), Y(q[1]), 3, 'k', 'fp', 1.4));
  F.t(X(4500), Y(0) + 18, 'fusão: 8 000', { c: 's', s: FSS }); F.t(X(13500) + 4, Y(50), 'água: 10 000', { c: 's', a: 'start', s: FSS });
  F.t(X(45500), Y(100) - 10, 'vaporização: 54 000', { c: 's', s: FSS });
  F.t(X(72500), Y(100) + 18, '72 500', { c: 'a', a: 'end', b: true });
  F.legenda(p.t);
});
// condução através de uma parede (janela de vidro)
D.paredeCalor = p => fig(300, 180, F => {
  F.add(re(10, 24, 118, 120, 'n', 'fh', 0, 0) + re(172, 24, 118, 120, 'n', 'fw', 0, 0));
  const v = re(128, 24, 44, 120, 'k', 'fw', 0, 1.8); F.add(v + F.luz(v, 'cilv'));
  for (const y of [56, 84, 112]) F.add(seta(40, y, 262, y, 'r', 2.4));
  F.t(150, 18, p.A, { c: 'k', b: true });
  F.t(66, 44, p.Tq || 'lado quente', { c: 'a', b: true }); F.t(232, 44, p.Tf || 'lado frio', { c: 'b', b: true });
  F.t(232, 136, p.phi, { c: 'r', b: true });
  cota(F, 128, 156, 172, 156, '', {}); F.t(150, 174, p.L, { c: 'k', b: true });
  F.legenda(p.t);
});
D.radiacao = p => fig(300, 180, F => {
  const c = ci(150, 86, 32, 'k', 'fd', 1.6); F.add(c + F.luz(c, 'esf'));
  for (let k = 0; k < 8; k++) { const [x1, y1] = P(150, 86, 40, k * 45 + 22.5), [x2, y2] = P(150, 86, 78, k * 45 + 22.5); F.add(ondulada(x1, y1, x2, y2, 'r', 3, 9)); }
  F.t(150, 91, p.T, { c: 'p', b: true, escuro: true });
  F.t(150, 178, p.area || '', { c: 's' });
  F.legenda(p.t);
});
// gás num cilindro com êmbolo: estado inicial e final, calor e trabalho
D.gas = p => fig(300, 180, F => {
  const x = 40, y = 30, w = 110, h = 120, ye = p.alto ? 50 : 66;
  const g = re(x + 2, ye + 10, w - 4, y + h - ye - 12, 'n', 'fw', 0, 0); F.add(g + F.luz(g, 'liq'));
  const pos = [[56, 98], [84, 90], [116, 104], [134, 92], [70, 122], [102, 126], [128, 132], [58, 140], [88, 142], [118, 142], [104, 110], [76, 108], [138, 116], [94, 96]];
  for (const [px, py] of pos) if (py > ye + 16) { const b = ci(px, py, 3.4, 'n', 'fb', 0); F.add(b + F.luz(b, 'esf')); }
  F.add(pa(`M${x},${y} L${x},${y + h} L${x + w},${y + h} L${x + w},${y}`, 'k', 'fn', 2.4));
  const em = re(x + 2, ye, w - 4, 10, 'k', 'fm', 1, 1.4); F.add(em + F.luz(em) + ln(x + w / 2, ye, x + w / 2, 14, 'k', 3));
  if (p.travado) F.add(ln(x - 6, ye - 3, x + 8, ye - 3, 'k', 3) + ln(x + w - 8, ye - 3, x + w + 6, ye - 3, 'k', 3));
  if (p.Q) { F.add(seta(8, 140, x - 4, 140, 'r', 2.8)); F.t(8, 128, p.Q, { c: 'r', a: 'start', b: true }); }
  if (p.W) { F.add(seta(x + w / 2 + 16, ye - 4, x + w / 2 + 16, ye - 34, 'g', 2.8)); F.t(x + w / 2 + 24, ye - 18, p.W, { c: 'g', a: 'start', b: true }); }
  if (p.flame) chama(F, x + w / 2, 178, 0.8);
  const L = [p.a, p.b, p.c].filter(Boolean); L.forEach((l, i) => F.t(166, 64 + i * 24, l, { c: i === L.length - 1 && L.length > 1 ? 'a' : 'k', a: 'start', b: i === L.length - 1 && L.length > 1 }));
  F.legenda(p.t);
});
// máquina térmica (ou refrigerador) entre duas fontes: larguras proporcionais à energia
D.maquina = p => fig(300, 196, F => {
  const ref = !!p.ref, tot = p.qq || 1, k = 40 / tot, wq = (p.qq || 1) * k, wf = (p.qf || 1) * k, ww = (p.qw || 1) * k;
  const q = re(70, 6, 160, 32, 'a', 'fh', 6, 1.8), f = re(70, 156, 160, 32, 'b', 'fw', 6, 1.8); F.add(q + F.luz(q) + f + F.luz(f));
  F.reserva(70, 6, 160, 32).reserva(70, 156, 160, 32).add(`<text x="150" y="27" class="ta tb7" text-anchor="middle" font-size="${FS}">${mathTxt(p.Tq || 'fonte quente')}</text><text x="150" y="177" class="tb tb7" text-anchor="middle" font-size="${FS}">${mathTxt(p.Tf || 'fonte fria')}</text>`);
  const m = ci(150, 97, 26, 'k', 'fm', 2); F.add(m + F.luz(m, 'esf')); F.reserva(124, 71, 52, 52).add(`<text x="150" y="102" class="tk tb7" text-anchor="middle" font-size="${FSS}">${ref ? 'geladeira' : 'motor'}</text>`);
  if (!ref) { F.add(seta(150, 40, 150, 70, 'a', Math.max(3, wq / 4))); F.add(seta(150, 124, 150, 152, 'b', Math.max(3, wf / 4))); F.add(seta(178, 97, 236, 97, 'g', Math.max(3, ww / 4))); }
  else { F.add(seta(150, 152, 150, 124, 'b', Math.max(3, wf / 4))); F.add(seta(150, 70, 150, 40, 'a', Math.max(3, wq / 4))); F.add(seta(236, 97, 178, 97, 'g', Math.max(3, ww / 4))); }
  F.t(162, 60, p.Qq, { c: 'a', a: 'start', b: true }); F.t(162, 142, p.Qf, { c: 'b', a: 'start', b: true }); F.t(240, 102, p.W, { c: 'g', a: 'start', b: true, alt: [[-30, -16]] });
  F.legenda(p.t);
});


/* ---------- Ondulatória ---------- */
// massa-mola horizontal: posições −A, 0 e +A
D.mhs = p => fig(300, 176, F => {
  const yb = 132, x0 = 150, A = 56; chao(F, 4, 296, yb); parede(F, 24, 60, yb, -1);
  const xb = x0 + (p.x ?? 0);
  F.add(mola(24, yb - 22, xb - 26, 10, 8)); bloco(F, xb - 26, yb - 44, 52, 44, p.m || 'm', { chao: true });
  [[x0 - A, '−A'], [x0, '0'], [x0 + A, '+A']].forEach(([x, l]) => { F.add(ln(x, 50, x, yb + 6, 's', 1, '3 3')); F.t(x, 44, l, { c: 's', b: true }); });
  if (p.v) vetor(F, xb + 24, yb - 54, xb + 70, yb - 54, 'b', p.v);
  F.legenda(p.t);
});
D.pendulo = p => fig(300, 196, F => {
  const O = [130, 22], L = 130, th = 18; teto(F, 90, 170, O[1]);
  const [bx, by] = [O[0] + L * Math.sin(rad(th)), O[1] + L * Math.cos(rad(th))];
  F.add(ln(O[0], O[1], O[0], O[1] + L + 10, 's', 1, '3 3') + pa(`M${n1(O[0] - L * Math.sin(rad(th)))},${n1(O[1] + L * Math.cos(rad(th)))} A${L},${L} 0 0 0 ${n1(bx)},${n1(by)}`, 's', 'fn', 1.2, '4 4') + ln(O[0], O[1], bx, by, 'k', 1.8));
  bola(F, bx, by, 11, 'fm');
  F.t((O[0] + bx) / 2 + 10, (O[1] + by) / 2, p.L, { c: 'k', a: 'start', b: true });
  vetor(F, bx, by + 13, bx, by + 44, 'b', 'g', { w: 2.2 });
  angulo(F, O[0], O[1], 36, -90, -90 + th, 'θ', 'k');
  F.t(270, 60, p.T || '', { c: 'a', a: 'end', b: true });
  F.legenda(p.t);
});
// onda numa corda: λ entre cristas, A da linha média à crista
D.onda = p => fig(300, 176, F => {
  const y = 92, x1 = 16, lam = 112;
  F.add(ln(8, y, 292, y, 's', 1, '4 3') + senoide(x1, 284, y, 40, lam, 0, 'b', 2.8));
  const xc = x1 + lam / 4; F.add(ln(xc, y - 40, xc, 24, 's', 0.8, '2 2') + ln(xc + lam, y - 40, xc + lam, 24, 's', 0.8, '2 2'));
  cota(F, xc, 28, xc + lam, 28, p.lambda, { sobre: true });
  cota(F, xc + lam + 22, y, xc + lam + 22, y - 40, p.A, { lado: 'dir' });
  vetor(F, 200, 156, 260, 156, 'a', p.v, { alt: [[-60, 0, 'end']] });
  F.t(16, 160, p.f || '', { c: 'k', a: 'start', b: true });
  F.legenda(p.t);
});
// som no ar: compressões e rarefações; λ entre duas compressões
D.som = p => fig(300, 176, F => {
  const fala = re(12, 64, 22, 50, 'k', 'fm', 3, 1.6), cone = pa('M34,70 L54,52 L54,126 L34,108 Z', 'k', 'fo', 1.6); F.add(fala + F.luz(fala) + cone + F.luz(cone));
  for (let x = 62; x < 292; x += 4) { const d = 0.5 + 0.5 * Math.cos(2 * Math.PI * (x - 70) / 56); F.add(ln(x, 46, x, 132, 'b', 1.2).replace('/>', ` opacity="${n1(0.15 + 0.75 * d)}"/>`)); }
  cota(F, 70, 30, 126, 30, p.lambda, { sobre: true, s: FS });
  F.add(ln(70, 36, 70, 46, 's', 0.8) + ln(126, 36, 126, 46, 's', 0.8));
  vetor(F, 190, 152, 250, 152, 'a', p.v, { alt: [[-60, 0, 'end']] });
  F.t(16, 156, p.f || '', { c: 'k', a: 'start', b: true });
  F.legenda(p.t);
});
// pulso numa corda presa: volta invertido
D.pulso = p => fig(300, 196, F => {
  parede(F, 266, 20, 176, 1);
  F.add(ln(10, 62, 266, 62, 'k', 1.6) + pa('M50,62 Q72,62 82,30 Q92,62 114,62', 'a', 'fn', 3));
  vetor(F, 130, 40, 176, 40, 'a', 'chegando', { w: 2.2 });
  F.add(ln(10, 142, 266, 142, 'k', 1.6) + pa('M150,142 Q172,142 182,174 Q192,142 214,142', 'b', 'fn', 3));
  vetor(F, 140, 120, 94, 120, 'b', 'volta invertido', { w: 2.2 });
  F.t(14, 26, 'antes', { c: 's', a: 'start', b: true }); F.t(14, 106, 'depois', { c: 's', a: 'start', b: true });
  F.t(258, 100, 'ponta presa', { c: 's', a: 'end', s: FSS });
  F.legenda(p.t);
});
// frentes de onda passando do fundo para o raso: λ diminui, f se mantém
D.refracaoOnda = p => fig(300, 176, F => {
  F.add(re(0, 20, 150, 120, 'n', 'fw', 0, 0) + re(150, 20, 150, 120, 'n', 'fw', 0, 0, ' opacity=".5"') + ln(150, 16, 150, 144, 'k', 1.8, '5 3'));
  for (let k = 0; k < 5; k++) F.add(ln(18 + k * 30, 30, 18 + k * 30, 130, 'b', 2.4));
  for (let k = 0; k < 6; k++) F.add(ln(162 + k * 22.5, 30, 162 + k * 22.5, 130, 'a', 2.4));
  cota(F, 48, 40, 78, 40, '', {}); F.t(63, 160, '', {});
  F.t(63, 156, p.m1, { c: 'b', b: true }); F.t(228, 156, p.m2, { c: 'a', b: true });
  F.t(48 + 15, 64, p.l1, { c: 'b', b: true }); cota(F, 184.5, 40, 207, 40, '', {}); F.t(196, 64, p.l2, { c: 'a', b: true });
  F.legenda(p.t);
});
// interferência de dois alto-falantes em fase num ponto P
D.interferencia = p => fig(300, 186, F => {
  const S1 = [30, 50], S2 = [30, 140], Pp = [258, 90];
  for (const S of [S1, S2]) for (let r = 22; r <= 170; r += 26) F.add(pa(`M${n1(S[0] + r * Math.cos(rad(-60)))},${n1(S[1] - r * Math.sin(rad(-60)))} A${r},${r} 0 0 0 ${n1(S[0] + r * Math.cos(rad(60)))},${n1(S[1] - r * Math.sin(rad(60)))}`, 'b', 'fn', 1).replace('/>', ' opacity=".35"/>'));
  for (const [S, l] of [[S1, 'S₁'], [S2, 'S₂']]) { const f = re(S[0] - 18, S[1] - 12, 16, 24, 'k', 'fm', 2, 1.4); F.add(f + F.luz(f)); F.t(S[0] - 22, S[1] + 5, l, { c: 'k', a: 'end', b: true }); }
  F.add(ln(S1[0], S1[1], Pp[0], Pp[1], 'a', 1.6) + ln(S2[0], S2[1], Pp[0], Pp[1], 'g', 1.6) + ci(Pp[0], Pp[1], 5, 'k', 'fk', 0));
  F.t(Pp[0] + 8, Pp[1] + 5, p.P || 'P', { c: 'k', a: 'start', b: true });
  F.t(150, 56, p.d1 || 'd₁', { c: 'a', b: true }); F.t(150, 140, p.d2 || 'd₂', { c: 'g', b: true });
  F.legenda(p.t);
});
// fenda dupla de Young: franjas claras e escuras no anteparo (fora de escala)
D.young = p => fig(300, 196, F => {
  const xf = 80, xa = 246, yc = 92;
  for (let k = 0; k < 4; k++) F.add(ln(14 + k * 14, 40, 14 + k * 14, 144, 'a', 1.6));
  F.add(re(xf - 3, 14, 6, yc - 14 - 12, 'k', 'fk', 0, 0) + re(xf - 3, yc - 6, 6, 12, 'k', 'fk', 0, 0) + re(xf - 3, yc + 12, 6, 170 - yc - 12, 'k', 'fk', 0, 0));
  for (let y = 18; y < 170; y += 2) { const d = Math.cos(Math.PI * (y - yc) / 18) ** 2; F.add(re(xa, y, 12, 2.2, 'n', 'fa', 0, 0, ` opacity="${n1(0.1 + 0.9 * d)}"`)); }
  F.add(ln(xa, 14, xa, 172, 'k', 1.2) + ln(xf, yc - 9, xa, yc, 's', 0.8, '3 3') + ln(xf, yc + 9, xa, yc, 's', 0.8, '3 3'));
  cota(F, xf - 14, yc - 9, xf - 14, yc + 9, '', {}); F.t(xf - 20, yc - 18, p.d, { c: 'k', a: 'end', b: true });
  cota(F, xf, 182, xa, 182, p.D, { sobre: true });
  cota(F, xa + 20, yc, xa + 20, yc + 36, '', {}); F.t(xa + 24, yc + 54, p.y, { c: 'a', a: 'end', b: true });
  F.foraEscala();
  F.legenda(p.t);
});
// rede de difração: muitas fendas, primeiro máximo a θ do centro
D.rede = p => fig(300, 186, F => {
  const xr = 90, yc = 92, th = rad(p.ang || 14.5);
  for (let k = 0; k < 4; k++) F.add(ln(14 + k * 14, 40, 14 + k * 14, 144, 'a', 1.6));
  for (let y = 24; y < 162; y += 8) F.add(re(xr - 3, y, 6, 5, 'k', 'fk', 0, 0));
  F.add(ln(xr, yc, 290, yc, 's', 1, '4 3'));
  for (const s of [1, -1]) { F.add(ln(xr, yc, xr + 190 * Math.cos(th), yc - s * 190 * Math.sin(th), 'a', 2)); }
  angulo(F, xr, yc, 78, 0, p.ang || 14.5, p.th, 'k');
  F.t(xr, 178, p.d, { c: 'k', b: true });
  F.t(286, yc - 190 * Math.sin(th) - 8, '1ª ordem', { c: 'a', a: 'end', s: FSS });
  F.legenda(p.t);
});
// onda estacionária numa corda presa: nós nas pontas
D.cordaEst = p => fig(300, 176, F => {
  const n = p.n || 1, x1 = 40, x2 = 260, yc = 82; let up = '', dn = '';
  for (let x = x1; x <= x2; x += 2) { const y = 40 * Math.sin(n * Math.PI * (x - x1) / (x2 - x1)); up += (x === x1 ? 'M' : 'L') + x + ',' + n1(yc - y) + ' '; dn += (x === x1 ? 'M' : 'L') + x + ',' + n1(yc + y) + ' '; }
  const a = re(x1 - 12, 40, 12, 84, 'k', 'fm', 1, 1.4), b = re(x2, 40, 12, 84, 'k', 'fm', 1, 1.4); F.add(a + F.luz(a) + b + F.luz(b));
  F.add(pa(up, 'a', 'fn', 2.6) + pa(dn, 'a', 'fn', 1.6, '5 4') + ci(x1, yc, 3.5, 'k', 'fk', 0) + ci(x2, yc, 3.5, 'k', 'fk', 0));
  F.t(x1, 140, 'nó', { c: 's', s: FSS }); F.t(x2, 140, 'nó', { c: 's', s: FSS }); F.t(150, 30, 'ventre', { c: 's', s: FSS });
  cota(F, x1, 158, x2, 158, p.L, { sobre: true });
  F.t(294, 24, p.f || '', { c: 'a', a: 'end', b: true });
  F.legenda(p.t);
});
// tubo sonoro: envoltória do deslocamento do ar no modo fundamental
D.tubo = p => fig(300, 176, F => {
  const fe = !!p.fechado, x1 = 40, x2 = 260, yt = 46, yb = 118, yc = 82; let up = '', dn = '';
  for (let x = x1; x <= x2; x += 2) { const u = (x - x1) / (x2 - x1), s = fe ? Math.sin(Math.PI / 2 * u) : Math.cos(Math.PI * u); up += (x === x1 ? 'M' : 'L') + x + ',' + n1(yc - 28 * s) + ' '; dn += (x === x1 ? 'M' : 'L') + x + ',' + n1(yc + 28 * s) + ' '; }
  const t1 = re(x1, yt - 8, x2 - x1, 8, 'k', 'fm', 1, 1.2), t2 = re(x1, yb, x2 - x1, 8, 'k', 'fm', 1, 1.2); F.add(t1 + F.luz(t1, 'cil') + t2 + F.luz(t2, 'cil'));
  if (fe) F.add(re(x1 - 8, yt - 8, 8, yb - yt + 16, 'k', 'fk', 1, 1));
  F.add(pa(up, 'b', 'fn', 2.4) + pa(dn, 'b', 'fn', 1.6, '5 4'));
  F.t(fe ? x1 + 6 : x1, 30, fe ? 'nó (ponta fechada)' : 'ventre', { c: 's', a: fe ? 'start' : 'middle', s: FSS });
  F.t(fe ? x2 : 150, 30, fe ? 'ventre' : 'nó', { c: 's', s: FSS }); if (!fe) F.t(x2, 30, 'ventre', { c: 's', s: FSS });
  cota(F, x1, 146, x2, 146, p.L, { sobre: true });
  F.legenda(p.t);
});
// efeito Doppler: fonte se aproximando do ouvinte
D.doppler = p => fig(300, 186, F => {
  const yb = 156; chao(F, 4, 296, yb);
  for (let k = 0; k < 5; k++) { const cx = 132 - k * 16, r = 14 + k * 24; F.add(ci(cx, yb - 30, r, 'b', 'fn', 1.2).replace('/>', ' opacity=".45"/>')); }
  carro(F, 88, yb, { L: 84, f: 'fp' }); F.add(re(124, yb - 48, 14, 7, 'k', 'fr', 2, 1));
  vetor(F, 180, yb - 70, 226, yb - 70, 'b', p.v, { alt: [[0, -16]] });
  pessoa(F, 266, yb, { h: 46 }); pessoa(F, 22, yb, { h: 46 });
  F.t(266, 34, p.fa || 'mais agudo', { c: 'a', b: true, a: 'end', alt: [[20, 0]] }); F.t(22, 34, p.fg || 'mais grave', { c: 'b', b: true, a: 'start' });
  F.legenda(p.t);
});
// sonar: ida e volta do som até o fundo
D.eco = p => fig(300, 196, F => {
  const ys = 40, yf = 164; const ag = re(0, ys, 300, yf - ys, 'n', 'fw', 0, 0); F.add(ag + F.luz(ag, 'liq') + ln(0, ys, 300, ys, 'b', 1.6));
  F.add(pa(`M0,${yf} Q80,${yf - 10} 150,${yf} Q220,${yf + 8} 300,${yf - 4} L300,196 L0,196 Z`, 'k', 'fmad', 1.4).replace('/>', ' opacity=".7"/>'));
  const b = pa(`M96,${ys} L106,${ys - 18} L190,${ys - 18} L200,${ys} Z`, 'k', 'fp', 1.8); F.add(b + F.luz(b));
  vetor(F, 136, ys + 6, 136, yf - 8, 'a', ''); F.t(128, 104, 'ida', { c: 'a', a: 'end', b: true });
  vetor(F, 160, yf - 8, 160, ys + 6, 'g', ''); F.t(168, 104, 'volta', { c: 'g', a: 'start', b: true });
  cota(F, 226, ys, 226, yf, p.d, { lado: 'dir' });
  F.t(60, 26, p.tempo || '', { c: 'k', b: true });
  F.legenda(p.t);
});
// batimento: soma de 440 Hz e 443 Hz (frequências reduzidas no desenho)
D.batimento = p => fig(300, 170, F => {
  let d = '', env = '', env2 = ''; const x1 = 16, x2 = 284, yc = 80, A = 46;
  for (let x = x1; x <= x2; x += 0.8) { const t = (x - x1) / (x2 - x1); const y = A * Math.cos(Math.PI * 3 * t) * Math.sin(2 * Math.PI * 30 * t); d += (x === x1 ? 'M' : 'L') + n1(x) + ',' + n1(yc - y) + ' '; }
  for (let x = x1; x <= x2; x += 2) { const t = (x - x1) / (x2 - x1), e = A * Math.abs(Math.cos(Math.PI * 3 * t)); env += (x === x1 ? 'M' : 'L') + x + ',' + n1(yc - e) + ' '; env2 += (x === x1 ? 'M' : 'L') + x + ',' + n1(yc + e) + ' '; }
  F.add(pa(d, 'b', 'fn', 1.2) + pa(env, 'a', 'fn', 2.2, '5 3') + pa(env2, 'a', 'fn', 2.2, '5 3'));
  cota(F, x1, 142, x1 + (x2 - x1) / 3, 142, '', {}); F.t(x1 + (x2 - x1) / 6, 160, p.Tb || 'T_bat', { c: 'a', b: true });
  F.legenda(p.t);
});
// fonte puntiforme: a potência se espalha numa esfera de área 4πr²
D.fonte = p => fig(300, 176, F => {
  const S = [44, 84];
  if (p.sol) sol(F, S[0], S[1], 18); else { const f = re(20, 66, 18, 36, 'k', 'fm', 2, 1.4), c = pa('M38,70 L54,58 L54,110 L38,98 Z', 'k', 'fo', 1.6); F.add(f + F.luz(f) + c + F.luz(c)); }
  for (let r = 30; r <= 210; r += 30) F.add(pa(`M${n1(S[0] + r * Math.cos(rad(38)))},${n1(S[1] - r * Math.sin(rad(38)))} A${r},${r} 0 0 1 ${n1(S[0] + r * Math.cos(rad(38)))},${n1(S[1] + r * Math.sin(rad(38)))}`, p.sol ? 'a' : 'b', 'fn', 1.3).replace('/>', ' opacity=".5"/>'));
  if (p.planeta) astro(F, 254, S[1], 9, 'fw', 'b'); else F.add(ci(254, S[1], 5, 'k', 'fk', 0));
  F.t(254, S[1] - 16, p.P || 'P', { c: 'k', b: true });
  if (p.r) cota(F, S[0], 150, 254, 150, p.r, { sobre: true });
  F.t(150, 26, p.I || '', { c: 'a', b: true });
  F.legenda(p.t);
});


/* ---------- Óptica ---------- */
const raioL = (F, A, B, c = 'a', mid = true, k = 0.5) => F.add(ln(A[0], A[1], B[0], B[1], c, 1.7) + (mid ? sentido(A, B, c, k) : ''));
const ySobre = (T, O, X) => T[1] + (O[1] - T[1]) * (X - T[0]) / (O[0] - T[0]);
// câmara escura de orifício: imagem invertida na parede do fundo (fora de escala)
D.camara = p => fig(300, 190, F => {
  const yb = 150, T = [44, 34], B0 = [44, yb], cx0 = 170, cx1 = 270, O = [cx0, 96];
  chao(F, 4, 150, yb); arvore(F, 44, yb, 116);
  const cx = re(cx0, 50, cx1 - cx0, 92, 'k', 'fm', 2, 1.8); F.add(cx + F.luz(cx) + re(cx0 + 4, 54, cx1 - cx0 - 8, 84, 'n', 'fd', 1, 0, ' opacity=".85"'));
  F.add(re(cx0 - 2, O[1] - 2.5, 6, 5, 'n', 'fq', 0, 0));
  const yT = ySobre(T, O, cx1 - 4), yB = ySobre(B0, O, cx1 - 4);
  raioL(F, T, O, 'a'); raioL(F, B0, O, 'a'); F.add(ln(O[0], O[1], cx1 - 4, yT, 'a', 1.4) + ln(O[0], O[1], cx1 - 4, yB, 'a', 1.4));
  F.add(seta(cx1 - 8, yB, cx1 - 8, yT, 'g', 2.6)); F.t((cx0 + cx1) / 2 + 20, 40, p.i, { c: 'g', b: true });
  F.t(T[0] + 2, 20, p.H || '', { c: 'k', b: true });
  cota(F, 44, yb + 18, cx0, yb + 18, p.p, { sobre: true }); cota(F, cx0, yb + 18, cx1, yb + 18, p.pp, { sobre: true });
  F.foraEscala();
  F.legenda(p.t);
});
// raios do Sol paralelos: vara e prédio com a mesma razão altura/sombra
D.sombra = p => fig(300, 190, F => {
  const yb = 160, u = unit(0.8, 1), vx = 50, px = 170, H = 120, h = 40;
  chao(F, 4, 296, yb);
  F.add(ln(vx, yb, vx, yb - h, 'k', 4) + re(vx, yb - 2, 0.8 * h, 4, 'n', 'fk', 0, 0, ' opacity=".6"'));
  const pr = re(px - 24, yb - H, 24, H, 'k', 'fm', 1, 1.6); F.add(pr + F.luz(pr) + re(px, yb - 2, 0.8 * H, 4, 'n', 'fk', 0, 0, ' opacity=".6"'));
  for (const [X, Y] of [[vx, yb - h], [px, yb - H]]) { const s = 60; raioL(F, [X - u[0] * s, Y - u[1] * s], [X + 0.8 * (yb - Y) - 0, yb], 'a', true, 0.25); }
  F.t(vx - 8, yb - h / 2, p.h, { c: 'k', a: 'end', b: true }); F.t(px - 30, yb - H / 2, p.H, { c: 'k', a: 'end', b: true });
  F.t(vx + 0.4 * h, yb + 18, p.s, { c: 's' }); F.t(px + 0.4 * H, yb + 18, p.S, { c: 's' });
  F.foraEscala('alturas fora de escala');
  F.legenda(p.t);
});
D.luz = p => fig(300, 150, F => {
  sol(F, 40, 70, 22); astro(F, 262, 70, 11, 'fw', 'b');
  F.add(ondulada(72, 70, 246, 70, 'a', 3.5, 12));
  F.t(160, 48, p.c, { c: 'a', b: true });
  cota(F, 40, 118, 262, 118, p.d, { sobre: true });
  F.legenda(p.t);
});
// espelho plano: ângulos medidos a partir da normal
D.reflexao = p => fig(300, 176, F => {
  const O = [150, 136], i = p.ang || 60, L = 110;
  const m = re(30, O[1], 240, 9, 'k', 'fw', 0, 1.6); F.add(m + F.luz(m, 'cil'));
  let h = ''; for (let x = 34; x < 270; x += 8) h += ln(x, O[1] + 9, x - 5, O[1] + 15, 's', 0.8); F.add(h);
  F.add(ln(O[0], O[1], O[0], 20, 's', 1.2, '5 4')); F.t(O[0], 14, 'normal', { c: 's', s: FSS });
  const A = [O[0] - L * Math.sin(rad(i)), O[1] - L * Math.cos(rad(i))], B = [O[0] + L * Math.sin(rad(i)), O[1] - L * Math.cos(rad(i))];
  raioL(F, A, O); raioL(F, O, B);
  angulo(F, O[0], O[1], 36, 90, 90 + i, p.i, 'k'); angulo(F, O[0], O[1], 48, 90 - i, 90, p.r, 'k');
  F.t(40, O[1] - 8, p.sup || '', { c: 's', a: 'start', s: FSS });
  F.legenda(p.t);
});
// espelho plano vertical: tamanho mínimo é metade da altura da pessoa
D.espelhoPlano = p => fig(300, 196, F => {
  const yb = 172, xm = 150, xp = 82, H = 120; chao(F, 4, 296, yb);
  pessoa(F, xp, yb, { h: H }); pessoa(F, 2 * xm - xp, yb, { h: H, f: 'fs' });
  const olho = yb - H * 0.85, topo = yb - H * 0.98, pe = yb;
  const yTop = (olho + topo) / 2, yBot = (olho + pe) / 2;
  F.add(re(xm - 3, yTop, 6, yBot - yTop, 'b', 'fw', 1, 2) + ln(xm, 30, xm, yTop, 's', 1, '3 3') + ln(xm, yBot, xm, yb, 's', 1, '3 3'));
  raioL(F, [xp + 2, topo], [xm, yTop], 'a', false); raioL(F, [xm, yTop], [xp + 4, olho], 'a', true);
  raioL(F, [xp + 4, pe], [xm, yBot], 'a', false); raioL(F, [xm, yBot], [xp + 4, olho], 'a', true);
  cota(F, xm + 16, yTop, xm + 16, yBot, p.hm, { lado: 'dir' });
  F.t(xp - 22, yb - H / 2, p.h, { c: 'k', a: 'end', b: true }); F.t(2 * xm - xp, 24, 'imagem', { c: 's', s: FSS });
  F.legenda(p.t);
});
// dois espelhos a 60°: 5 imagens sobre a circunferência do vértice
D.espelhos = p => fig(300, 196, F => {
  const V = [150, 168], r = 64, O = P(V[0], V[1], r, 90);
  for (const a of [60, 120]) { const [x, y] = P(V[0], V[1], 140, a); F.add(ln(V[0], V[1], x, y, 'b', 4)); }
  F.add(ci(V[0], V[1], r, 's', 'fn', 1, ' stroke-dasharray="3 4"'));
  for (const a of [30, 150, 210, 270, 330]) { const [x, y] = P(V[0], V[1], r, a); if (y < 192) F.add(ci(x, y, 6, 's', 'fn', 1.6)); }
  bola(F, O[0], O[1], 7, 'fa'); F.t(O[0], O[1] - 14, 'objeto', { c: 'a', b: true });
  angulo(F, V[0], V[1], 22, 60, 120, p.ang, 'k');
  F.t(292, 28, p.n, { c: 'k', a: 'end', b: true }); F.t(292, 46, '(círculos vazios)', { c: 's', a: 'end', s: FSS });
  F.legenda(p.t);
});
/* espelho côncavo: raios traçados pela lei da reflexão (r = u − 2(u·N)N) */
const OPT = { V: [262, 96], K: 4 };
const espelho = f => ({ C: [OPT.V[0] - 2 * f * OPT.K, OPT.V[1]], R: 2 * f * OPT.K });
function alvo(Pt, u, S) { const dx = Pt[0] - S.C[0], dy = Pt[1] - S.C[1], b = dx * u[0] + dy * u[1], c = dx * dx + dy * dy - S.R * S.R, t = -b + Math.sqrt(b * b - c); return [Pt[0] + t * u[0], Pt[1] + t * u[1]]; }
function reflete(u, M, S) { const N = [(M[0] - S.C[0]) / S.R, (M[1] - S.C[1]) / S.R], k = 2 * (u[0] * N[0] + u[1] * N[1]); return unit(u[0] - k * N[0], u[1] - k * N[1]); }
function baseEspelho(F, S, Fx, y0) {
  const hh = 66, x1 = S.C[0] + Math.sqrt(S.R * S.R - hh * hh);
  F.add(ln(8, y0, 292, y0, 's', 1, '6 3 1 3'));
  F.add(pa(`M${n1(x1)},${y0 - hh} A${S.R},${S.R} 0 0 1 ${n1(x1)},${y0 + hh}`, 'b', 'fn', 5));
  let h = ''; for (let k = -6; k <= 6; k++) { const a = Math.asin(k * 10 / S.R), x = S.C[0] + S.R * Math.cos(a), y = y0 + S.R * Math.sin(a); h += ln(x + 3, y, x + 9, y - 5, 's', 0.8); } F.add(h);
  for (const [x, l] of [[Fx, 'F'], [S.C[0], 'C']]) { F.add(ci(x, y0, 3.2, 'k', 'fk', 0)); F.t(x, y0 + FS + 5, l, { c: 'k', b: true }); }
}
D.focoEspelho = p => fig(300, 176, F => {
  const S = espelho(20), Fx = OPT.V[0] - 20 * OPT.K, y0 = OPT.V[1]; baseEspelho(F, S, Fx, y0);
  for (const h of [-46, -22, 22, 46]) { const A = [16, y0 + h], M = alvo(A, [1, 0], S), r = reflete([1, 0], M, S); raioL(F, A, M, 'a', true, 0.4); const L = (M[0] - 30) / -r[0]; F.add(ln(M[0], M[1], M[0] + r[0] * L, M[1] + r[1] * L, 'a', 1.7)); }
  cota(F, Fx, 166, OPT.V[0], 166, p.f, { sobre: true });
  F.legenda(p.t);
});
function desenhaEspelho(F, p) {
  const S = espelho(20), Fx = OPT.V[0] - 20 * OPT.K, y0 = OPT.V[1], xo = OPT.V[0] - p.p * OPT.K, ho = p.ho, T = [xo, y0 - ho];
  baseEspelho(F, S, Fx, y0);
  const M1 = alvo(T, [1, 0], S), d2 = unit(Fx - T[0], y0 - T[1]), M2 = alvo(T, d2, S), I = [OPT.V[0] - p.pp * OPT.K, y0 + p.pp / p.p * ho];
  raioL(F, T, M1); raioL(F, M1, I); raioL(F, T, M2, 'a', true, 0.35); raioL(F, M2, I);
  F.add(seta(xo, y0, xo, T[1], 'k', 3)); F.t(xo - 6, T[1] + 4, p.o, { c: 'k', a: 'end', b: true });
  F.add(seta(I[0], y0, I[0], I[1], 'g', 3)); F.t(I[0] + 8, I[1] + 6, p.i, { c: 'g', a: 'start', b: true });
  cota(F, xo, 20, OPT.V[0], 20, p.pL, { sobre: true }); cota(F, I[0], 176, OPT.V[0], 176, p.ppL, { sobre: true });
  F.legenda(p.t);
}
D.espelhoGauss = p => fig(300, 190, F => desenhaEspelho(F, p));
// refração ar → água com ângulos do enunciado
D.refracaoSnell = p => fig(300, 196, F => {
  const O = [150, 96], i = p.ang1 || 45, r = p.ang2 || 32, L = 96;
  const ag = re(0, O[1], 300, 100, 'n', 'fw', 0, 0); F.add(ag + F.luz(ag, 'liq') + ln(0, O[1], 300, O[1], 'k', 1.8) + ln(O[0], 10, O[0], 186, 's', 1.2, '5 4'));
  const A = [O[0] - L * Math.sin(rad(i)), O[1] - L * Math.cos(rad(i))], B = [O[0] + L * Math.sin(rad(r)), O[1] + L * Math.cos(rad(r))];
  raioL(F, A, O); raioL(F, O, B);
  angulo(F, O[0], O[1], 34, 90, 90 + i, p.i, 'k'); angulo(F, O[0], O[1], 44, -90, -90 + r, p.r, 'k');
  F.t(290, 30, p.n1, { c: 's', a: 'end', b: true }); F.t(290, 180, p.n2, { c: 'b', a: 'end', b: true });
  if (p.v) F.t(14, 180, p.v, { c: 'b', a: 'start' });
  F.legenda(p.t);
});
// ângulo-limite: água → ar; em L o raio sai rasante; acima de L, reflexão total
D.reflexaoTotal = p => fig(300, 196, F => {
  const O = [150, 84], L = Math.asin(1 / 1.33) * 180 / Math.PI, R = 92;
  const ag = re(0, O[1], 300, 112, 'n', 'fw', 0, 0); F.add(ag + F.luz(ag, 'liq') + ln(0, O[1], 300, O[1], 'k', 1.8) + ln(O[0], 12, O[0], 190, 's', 1.2, '5 4'));
  const fonte = a => [O[0] - R * Math.sin(rad(a)), O[1] + R * Math.cos(rad(a))];
  raioL(F, fonte(L), O, 'a'); F.add(ln(O[0], O[1] - 1.5, 292, O[1] - 1.5, 'a', 1.7) + sentido([O[0], O[1] - 1.5], [292, O[1] - 1.5], 'a', 0.6));
  raioL(F, fonte(62), O, 'r', true, 0.5); raioL(F, O, [O[0] + R * Math.sin(rad(62)), O[1] + R * Math.cos(rad(62))], 'r', true, 0.6);
  angulo(F, O[0], O[1], 34, -90, -90 - L, p.L, 'k');
  F.t(250, O[1] - 10, 'rasante', { c: 'a', s: FSS }); F.t(276, 182, 'reflexão total', { c: 'r', a: 'end', s: FSS, b: true });
  F.t(16, 32, 'ar', { c: 's', a: 'start', b: true }); F.t(16, 182, 'água · n = 1,33', { c: 'b', a: 'start', b: true });
  F.legenda(p.t);
});
// dioptro plano: o fundo parece mais raso (ângulos pequenos, exagerados no desenho)
D.dioptro = p => fig(300, 196, F => {
  const x0 = 120, yS = 44, yR = 160, ang = rad(14), aa = Math.asin(1.33 * Math.sin(ang)), xs = x0 + (yR - yS) * Math.tan(ang), yA = yS + (xs - x0) / Math.tan(aa);
  const ag = re(0, yS, 300, 152, 'n', 'fw', 0, 0); F.add(ag + F.luz(ag, 'liq') + ln(0, yS, 300, yS, 'k', 1.8) + ln(xs, 14, xs, 76, 's', 1, '3 3'));
  const peixe = pa(`M${x0 - 12},${yR} Q${x0},${yR - 9} ${x0 + 12},${yR} Q${x0},${yR + 9} ${x0 - 12},${yR} Z M${x0 + 12},${yR} L${x0 + 20},${yR - 6} L${x0 + 20},${yR + 6} Z`, 'k', 'fo', 1.3); F.add(peixe + F.luz(peixe));
  F.add(ci(x0, yA, 4.5, 'b', 'fn', 1.6) + ln(xs, yS, x0, yA, 's', 1, '3 3'));
  raioL(F, [x0 + 8, yR - 3], [xs, yS]); raioL(F, [xs, yS], [xs + 40 * Math.sin(aa), yS - 40 * Math.cos(aa)]);
  F.t(x0 - 18, yR + 4, 'real', { c: 'k', a: 'end', b: true }); F.t(x0 - 12, yA + 4, 'aparente', { c: 'b', a: 'end', b: true });
  cota(F, 214, yS, 214, yA, p.pp, { lado: 'esq' }); cota(F, 244, yS, 244, yR, p.p, { lado: 'dir' });
  F.t(16, 30, 'ar', { c: 's', a: 'start', b: true }); F.t(16, 186, 'água · n = 1,33', { c: 'b', a: 'start', b: true });
  F.legenda(p.t);
});
// lâmina de faces paralelas: o raio sai paralelo ao incidente, deslocado de d
D.lamina = p => fig(300, 196, F => {
  const K = 24, yT = 56, yB = yT + 3 * K, P1 = [92, yT], P2 = [92 + (yB - yT) * Math.tan(rad(30)), yB];
  const u = [Math.sin(rad(60)), Math.cos(rad(60))], A = [P1[0] - 56 * u[0], P1[1] - 56 * u[1]], fim = [P2[0] + 62 * u[0], P2[1] + 62 * u[1]];
  const v = re(20, yT, 280, yB - yT, 'n', 'fw', 0, 0); F.add(v + F.luz(v, 'cil') + ln(20, yT, 300, yT, 'k', 1.8) + ln(20, yB, 300, yB, 'k', 1.8));
  F.add(ln(P1[0], 18, P1[0], yB + 20, 's', 1, '3 3') + ln(P2[0], yB - 30, P2[0], 190, 's', 1, '3 3'));
  raioL(F, A, P1); raioL(F, P1, P2); raioL(F, P2, fim);
  const pr = [P1[0] + (yB - yT + 62 * u[1]) * u[0] / u[1], yB + 62 * u[1]]; F.add(ln(P1[0], P1[1], pr[0], pr[1], 's', 1, '4 3'));
  angulo(F, P1[0], P1[1], 26, 90, 150, p.i, 'k'); angulo(F, P1[0], P1[1], 30, -90, -60, p.r, 'k');
  { const n = [u[1], -u[0]], t0 = 40, Q = [P2[0] + t0 * u[0], P2[1] + t0 * u[1]], dist = (P2[0] - P1[0]) * n[0] + (P2[1] - P1[1]) * n[1]; F.add(seta(Q[0], Q[1], Q[0] - n[0] * dist, Q[1] - n[1] * dist, 'k', 1.3, { h: 6, s: 3 }) + seta(Q[0] - n[0] * dist, Q[1] - n[1] * dist, Q[0], Q[1], 'k', 1.3, { h: 6, s: 3 })); }
  F.t(296, yT + (yB - yT) / 2 + 5, p.e, { c: 'k', a: 'end', b: true }); F.t(pr[0] + 10, pr[1] - 2, p.d, { c: 'k', a: 'start', b: true });
  F.legenda(p.t);
});
// prisma de 60° no desvio mínimo: raio interno paralelo à base
D.prisma = p => fig(300, 190, F => {
  const V = [150, 22], Bl = [150 - 124 * Math.tan(rad(30)), 146], Br = [150 + 124 * Math.tan(rad(30)), 146], yr = 88;
  const pr = poly([V, Bl, Br], 'b', 'fw', 2); F.add(pr + F.luz(pr));
  const Ex = V[0] + (yr - V[1]) * (Bl[0] - V[0]) / (Bl[1] - V[1]), Fx = V[0] + (yr - V[1]) * (Br[0] - V[0]) / (Br[1] - V[1]);
  const A = [Ex - 70 * Math.cos(rad(30)), yr - 70 * Math.sin(rad(30))], B = [Fx + 70 * Math.cos(rad(30)), yr - 70 * Math.sin(rad(30))];
  raioL(F, A, [Ex, yr]); raioL(F, [Ex, yr], [Fx, yr]); raioL(F, [Fx, yr], B);
  F.add(ln(A[0], A[1], A[0] + 210 * Math.cos(rad(30)), A[1] + 210 * Math.sin(rad(30)), 's', 1, '4 3'));
  angulo(F, V[0], V[1], 22, -120, -60, p.A, 'k');
  F.t(150, 172, p.n, { c: 'b', b: true });
  F.t(292, 120 + 40, p.D || '', { c: 's', a: 'end', s: FSS });
  F.legenda(p.t);
});
// microscópio: objetiva forma imagem real ampliada; a ocular funciona como lupa
D.microscopio = p => fig(300, 176, F => {
  const y0 = 92, xo = 86, f1 = 22, po = 27, hob = 9, xob = xo - po, xI = xo + f1 * po / (po - f1), xe = xI + 16;
  const hI = hob * f1 / (po - f1), T = [xob, y0 - hob], Lt = [xo, y0 - hob], Ip = [xI, y0 + hI], C = [xo, y0];
  F.add(ln(4, y0, 296, y0, 's', 1, '6 3 1 3'));
  const lente = (x, H) => { const s = pa(`M${x},${y0 - H} Q${x + 14},${y0} ${x},${y0 + H} Q${x - 14},${y0} ${x},${y0 - H} Z`, 'b', 'fw', 1.8); F.add(s + F.luz(s, 'cilv')); };
  lente(xo, 40); lente(xe, 28);
  F.add(seta(xob, y0, xob, T[1], 'k', 2.6)); raioL(F, T, Lt, 'a', false); raioL(F, Lt, Ip); raioL(F, T, C, 'a', false); raioL(F, C, Ip);
  F.add(seta(xI, y0, xI, Ip[1], 'g', 2.6)); F.t(xI - 6, Ip[1] + 16, 'imagem real', { c: 'g', a: 'middle', s: FSS });
  F.t(xo, 160, p.a, { c: 'b', b: true }); F.t(xe + 20, 160, p.b, { c: 'b', b: true, a: 'middle' });
  F.foraEscala('esquema fora de escala');
  F.legenda(p.t);
});
// luneta: feixe paralelo entra, foca em F₁ = F₂ e sai paralelo (olho relaxado)
D.luneta = p => fig(300, 176, F => {
  const y0 = 90, xI = 214, xo = 40, xe = xI + 24;
  F.add(ln(4, y0, 296, y0, 's', 1, '6 3 1 3'));
  const lente = (x, H) => { const s = pa(`M${x},${y0 - H} Q${x + 14},${y0} ${x},${y0 + H} Q${x - 14},${y0} ${x},${y0 - H} Z`, 'b', 'fw', 1.8); F.add(s + F.luz(s, 'cilv')); };
  lente(xo, 44); lente(xe, 22);
  for (const h of [-36, 36]) { const L = [xo, y0 + h], E = [xe, y0 - h * (xe - xI) / (xI - xo)]; raioL(F, [6, y0 + h], L, 'a', true, 0.4); raioL(F, L, E, 'a', false); raioL(F, E, [296, E[1]], 'a', true, 0.6); }
  F.add(ci(xI, y0, 3.2, 'k', 'fk', 0)); F.t(xI, y0 - 10, 'F₁ = F₂', { c: 'k', b: true, s: FSS });
  F.t(xo + 6, 156, p.a, { c: 'b', a: 'start', b: true }); F.t(xe, 150, p.b, { c: 'b', a: 'end', b: true });
  F.foraEscala('esquema fora de escala');
  F.legenda(p.t);
});
// olho míope ou hipermétrope: sem lente (tracejado) o foco cai fora da retina; com a lente, volta para a retina
D.olho = p => fig(300, 196, F => {
  const mio = !p.hiper, y0 = 96, xc = 164, xR = 254, Fu = mio ? 228 : 290, h = 22, sx = 88;
  const ol = el(206, y0, 56, 50, 'k', 'fp', 2); F.add(ol + F.luz(ol, 'esf') + pa(`M${xR},64 Q${xR + 10},${y0} ${xR},128`, 'r', 'fn', 3.4));
  const cr = pa(`M${xc},${y0 - 26} Q${xc + 12},${y0} ${xc},${y0 + 26} Q${xc - 12},${y0} ${xc},${y0 - 26} Z`, 'b', 'fw', 1.6); F.add(cr + F.luz(cr, 'cilv'));
  const corr = mio ? pa(`M${sx - 9},${y0 - 40} L${sx + 9},${y0 - 40} Q${sx + 1},${y0} ${sx + 9},${y0 + 40} L${sx - 9},${y0 + 40} Q${sx - 1},${y0} ${sx - 9},${y0 - 40} Z`, 'b', 'fw', 1.8) : pa(`M${sx},${y0 - 40} Q${sx + 16},${y0} ${sx},${y0 + 40} Q${sx - 16},${y0} ${sx},${y0 - 40} Z`, 'b', 'fw', 1.8);
  F.add(corr + F.luz(corr, 'cilv') + ln(4, y0, 296, y0, 's', 0.8, '6 3 1 3'));
  for (const s of [-1, 1]) {
    const Lh = y0 + s * h, yR = y0 + s * h * (1 - (xR - xc) / (Fu - xc));
    F.add(ln(xc, Lh, Math.min(Fu, xR), Fu <= xR ? y0 : yR, 's', 1.2, '4 3'));
    if (Fu <= xR) F.add(ln(Fu, y0, xR, y0 - s * h * (xR - Fu) / (Fu - xc), 's', 1.2, '4 3'));
    const k = mio ? 1.22 : 0.82, E = [xc, y0 + s * h * k];
    raioL(F, [6, Lh], [sx, Lh], 'a', s < 0, 0.5); raioL(F, [sx, Lh], E, 'a', false); raioL(F, E, [xR, y0], 'a', false);
  }
  F.add(ci(xR, y0, 3, 'a', 'fa', 0));
  F.t(xR - 4, 150, 'retina', { c: 'r', s: FSS, b: true }); F.t(sx, 160, mio ? 'lente divergente' : 'lente convergente', { c: 'b', b: true });
  F.t(xR + 4, 52, mio ? 'sem lente: foco antes' : 'sem lente: foco depois', { c: 's', a: 'end', s: FSS });
  F.t(150, 20, p.ponto, { c: 'k', b: true });
  F.legenda(p.t);
});


/* ---------- Eletricidade ---------- */
D.eletrons = p => fig(300, 170, F => {
  const c = ci(150, 80, 58, 'b', 'fw', 2); F.add(c + F.luz(c, 'esf'));
  for (let i = 0; i < 14; i++) { const [x, y] = P(150, 80, 16 + (i % 3) * 14, i * 51); F.add(ci(x, y, 6, 'b', 'fp', 1.2) + maisMenos(x, y, -1, 3.5)); }
  F.t(150, 160, p.Q, { c: 'b', b: true });
  F.legenda(p.t);
});
D.cargas = p => fig(300, 160, F => {
  const s1 = p.s1 ?? 1, s2 = p.s2 ?? 1; carga(F, 76, 70, 22, s1); carga(F, 224, 70, 22, s2);
  F.t(76, 112, p.q1, { c: s1 > 0 ? 'a' : 'b', b: true }); F.t(224, 112, p.q2, { c: s2 > 0 ? 'a' : 'b', b: true });
  if (s1 * s2 > 0) { vetor(F, 52, 70, 10, 70, 'k', ''); vetor(F, 248, 70, 290, 70, 'k', ''); F.t(30, 56, 'F', { c: 'k', b: true }); F.t(270, 56, 'F', { c: 'k', b: true }); }
  else { vetor(F, 100, 70, 136, 70, 'k', ''); vetor(F, 200, 70, 164, 70, 'k', ''); F.t(118, 56, 'F', { c: 'k', b: true }); F.t(182, 56, 'F', { c: 'k', b: true }); }
  cota(F, 76, 136, 224, 136, p.d, { sobre: true });
  F.legenda(p.t);
});
// carga puntiforme positiva: linhas de campo para fora; ponto P a uma distância d
D.campo = p => fig(300, 170, F => {
  const Q = [80, 80];
  for (let k = 0; k < 8; k++) { const [x1, y1] = P(Q[0], Q[1], 26, k * 45), [x2, y2] = P(Q[0], Q[1], 64, k * 45); F.add(seta(x1, y1, x2, y2, 's', 1.3)); }
  carga(F, Q[0], Q[1], 18, 1); F.t(Q[0], Q[1] - 26, p.Q, { c: 'a', b: true, alt: [[0, 56]] });
  const Pp = [240, 80]; F.add(ci(Pp[0], Pp[1], 4, 'k', 'fk', 0)); F.t(Pp[0], Pp[1] + 20, 'P', { c: 'k', b: true });
  if (p.equi) F.add(pa(`M${Q[0] + 160 * Math.cos(rad(25))},${Q[1] - 160 * Math.sin(rad(25))} A160,160 0 0 1 ${Q[0] + 160 * Math.cos(rad(25))},${Q[1] + 160 * Math.sin(rad(25))}`, 'a', 'fn', 1.4, '5 4'));
  if (p.E) { vetor(F, Pp[0] + 6, Pp[1], Pp[0] + 50, Pp[1], 'a', ''); F.t(Pp[0] + 28, Pp[1] - 12, p.E, { c: 'a', b: true }); }
  if (p.V) F.t(Pp[0] + 4, 30, p.V, { c: 'a', b: true });
  cota(F, Q[0], 140, Pp[0], 140, p.d, { sobre: true });
  F.legenda(p.t);
});
// placas paralelas: E do + para o −; elétron, próton ou carga entre elas
D.placas = p => fig(300, 186, F => {
  const xa = 60, xb = 232, y1 = 26, y2 = 146;
  const A = re(xa - 10, y1, 10, y2 - y1, 'a', 'fh', 1, 1.4), B = re(xb, y1, 10, y2 - y1, 'b', 'fw', 1, 1.4); F.add(A + F.luz(A, 'cilv') + B + F.luz(B, 'cilv'));
  for (let y = y1 + 12; y < y2; y += 24) { F.add(maisMenos(xa - 5, y, 1, 3.5) + maisMenos(xb + 5, y, -1, 3.5) + op(seta(xa + 8, y, xb - 8, y, 's', 1.2), 0.7)); }
  F.t((xa + xb) / 2, y1 - 6, 'E', { c: 's', b: true, it: true });
  if (p.part) { const neg = p.part === 'e'; const x = neg ? xb - 22 : xa + 22, y = 98; carga(F, x, y, 8, neg ? -1 : 1);
    if (p.Fp) { vetor(F, x + (neg ? -12 : 12), y, x + (neg ? -60 : 60), y, neg ? 'b' : 'a', ''); F.t(x + (neg ? -36 : 36), y - 14, p.Fp, { c: neg ? 'b' : 'a', b: true }); } }
  if (p.d) cota(F, xa, 168, xb, 168, p.d, { sobre: true });
  if (p.U) F.t(292, 20, p.U, { c: 'k', a: 'end', b: true, alt: [[0, 160]] });
  F.legenda(p.t);
});
D.esfera = p => fig(300, 170, F => {
  const c = ci(130, 84, 58, 'k', 'fm', 2); F.add(c + F.luz(c, 'esf'));
  for (let k = 0; k < 12; k++) { const [x, y] = P(130, 84, 58, k * 30); F.add(ci(x, y, 6.5, 'a', 'fh', 1) + maisMenos(x, y, 1, 3.4)); }
  F.t(130, 82, 'E = 0', { c: 'b', b: true }); F.t(130, 100, 'dentro', { c: 's', s: FSS });
  F.add(ln(130, 84, 130 + 58 * Math.cos(rad(-35)), 84 + 58 * Math.sin(rad(35)), 'k', 1.2)); F.t(160, 128, p.R, { c: 'k', a: 'start', b: true, alt: [[40, 0]] });
  F.t(202, 40, p.Q, { c: 'a', a: 'start', b: true }); F.t(202, 62, p.V, { c: 'k', a: 'start', b: true });
  F.legenda(p.t);
});
D.contato = p => fig(300, 196, F => {
  const sf = (x, y, f, l, c) => { const s = ci(x, y, 28, 'k', f, 1.8); F.add(s + F.luz(s, 'esf')); F.t(x, y + 5, l, { c, b: true }); };
  F.t(16, 22, 'antes', { c: 's', a: 'start', b: true }); sf(80, 56, 'fh', p.a, 'a'); sf(220, 56, 'fw', p.b, 'b');
  F.add(seta(150, 96, 150, 116, 'k', 1.6)); F.t(160, 110, 'contato', { c: 's', a: 'start', s: FSS });
  F.t(16, 128, 'depois', { c: 's', a: 'start', b: true }); sf(80, 156, 'fh', p.r, 'a'); sf(220, 156, 'fh', p.r, 'a');
  F.legenda(p.t);
});
// fio cilíndrico: comprimento L e seção A
D.fio = p => fig(300, 156, F => {
  const c = re(56, 52, 190, 36, 'n', 'fh', 0, 0); F.add(c + F.luz(c, 'cil') + ln(56, 52, 246, 52, 'k', 1.8) + ln(56, 88, 246, 88, 'k', 1.8) + pa('M246,52 A9,18 0 0 1 246,88', 'k', 'fn', 1.8));
  const s = el(56, 70, 9, 18, 'k', 'fa', 1.8); F.add(s + F.luz(s, 'esf'));
  F.t(56, 40, p.A, { c: 'a', b: true }); F.t(150, 75, p.rho || '', { c: 'k', b: true });
  cota(F, 56, 112, 246, 112, p.L, { sobre: true });
  F.legenda(p.t);
});
// resistores em série com a bateria; corrente única
D.serie = p => fig(300, 176, F => {
  const xL = 40, xR = 266, yT = 40, yB = 140, ym = 90;
  F.add(pa(`M${xL},${yT} L${xR},${yT} L${xR},${yB} L${xL},${yB} Z`, 'k', 'fn', 2.2));
  (p.R || []).forEach((r, i) => { const x = 74 + i * 62; F.add(mascara(x, yT - 9, 44, 18) + resistor(x + 2, yT, 40)); F.t(x + 22, yT - 14, r, { c: 'a', b: true }); });
  pilha(F, xL, ym); F.t(xL + 32, ym + 4, p.U, { c: 'k', a: 'start', b: true });
  F.add(seta(xR, ym - 20, xR, ym + 20, 'a', 2.8)); F.t(xR - 8, ym + 5, p.i, { c: 'a', a: 'end', b: true });
  if (p.U3) F.t(198, yT + 26, p.U3, { c: 'k', b: true, s: FSS });
  F.legenda(p.t);
});
// resistores em paralelo: mesma tensão, correntes que se somam
D.paralelo = p => fig(300, 176, F => {
  const xL = 40, xR = 262, yT = 36, yB = 140;
  F.add(pa(`M${xL},${yT} L${xR},${yT} M${xL},${yB} L${xR},${yB} M${xL},${yT} L${xL},${yB}`, 'k', 'fn', 2.2));
  for (const [x, r] of [[150, (p.R || [])[0]], [230, (p.R || [])[1]]]) { F.add(ln(x, yT, x, yB, 'k', 2.2) + mascara(x - 9, 66, 18, 44) + resistor(x, 68, 40, true)); F.t(x + 14, 92, r, { c: 'a', a: 'start', b: true }); F.add(ci(x, yT, 3, 'k', 'fk', 0) + ci(x, yB, 3, 'k', 'fk', 0)); }
  pilha(F, xL, 88); F.t(xL + 32, 92, p.U || 'U', { c: 'k', a: 'start', b: true });
  F.t(150, 166, p.Req || '', { c: 'k', b: true });
  F.legenda(p.t);
});
D.chuveiro = p => fig(300, 196, F => {
  F.add(ln(150, 6, 150, 30, 'k', 5));
  const c = pa('M96,30 L204,30 L188,52 L112,52 Z', 'k', 'fm', 1.8); F.add(c + F.luz(c));
  for (let k = 0; k < 8; k++) F.add(ln(118 + k * 9.5, 60, 106 + k * 12.5, 132 + (k % 2) * 14, 'b', 2, '5 6'));
  F.add(ln(204, 22, 250, 22, 'k', 1.6) + ln(204, 28, 250, 28, 'k', 1.6)); F.t(256, 30, p.U, { c: 'k', a: 'start', b: true, alt: [[-60, -14]] });
  F.t(150, 166, p.P, { c: 'a', b: true }); F.t(150, 186, p.extra || '', { c: 'k' });
  F.legenda(p.t);
});
// nó: a soma das correntes que chegam é igual à das que saem
D.no = p => fig(300, 170, F => {
  const N = [150, 80];
  F.add(ln(30, 30, N[0], N[1], 'k', 2.2) + ln(30, 130, N[0], N[1], 'k', 2.2) + ln(N[0], N[1], 280, N[1], 'k', 2.2) + ci(N[0], N[1], 6, 'k', 'fk', 0));
  F.add(sentido([30, 30], N, 'a', 0.55) + sentido([30, 130], N, 'a', 0.55) + sentido(N, [280, 80], 'g', 0.5));
  F.t(70, 36, p.i1, { c: 'a', b: true }); F.t(70, 136, p.i2, { c: 'a', b: true }); F.t(226, 66, p.i3, { c: 'g', b: true });
  F.legenda(p.t);
});
// ponte de Wheatstone equilibrada: G não acusa corrente
D.ponte = p => fig(300, 210, F => {
  const N = [150, 24], W = [60, 100], S = [150, 176], Ea = [240, 100];
  const lado = (A, B, lab, c) => { const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, [ux, uy] = unit(B[0] - A[0], B[1] - A[1]), L = 18;
    F.add(ln(A[0], A[1], mx - ux * L, my - uy * L, 'k', 2) + ln(mx + ux * L, my + uy * L, B[0], B[1], 'k', 2));
    F.add(`<g transform="translate(${n1(mx)} ${n1(my)}) rotate(${n1(Math.atan2(uy, ux) * 180 / Math.PI)})">${resistor(-L, 0, 2 * L)}</g>`);
    F.t(mx + (mx < 150 ? -14 : 14), my + (my < 100 ? -6 : 18), lab, { c: c || 'a', a: mx < 150 ? 'end' : 'start', b: true }); };
  lado(N, W, p.R1); lado(N, Ea, p.R2); lado(Ea, S, p.R3, 'k'); lado(W, S, p.R4);
  F.add(ln(W[0], W[1], 132, W[1], 'k', 1.6) + ln(168, W[1], Ea[0], W[1], 'k', 1.6)); const g = ci(150, 100, 16, 'k', 'fp', 2); F.add(g + F.luz(g, 'esf') + `<text x="150" y="105" class="tk tb7" text-anchor="middle" font-size="${FS}">G</text>`); F.reserva(134, 84, 32, 32);
  F.add(ln(N[0], N[1], 290, N[1], 'k', 1.6) + ln(290, N[1], 290, S[1], 'k', 1.6) + ln(S[0], S[1], 290, S[1], 'k', 1.6)); pilha(F, 290, 100, true, false);
  for (const q of [N, W, S, Ea]) F.add(ci(q[0], q[1], 3.5, 'k', 'fk', 0));
  F.legenda(p.t);
});
D.capacitor = p => fig(300, 186, F => {
  const xL = 60, xR = 240, yT = 36, yB = 150, xc = 150;
  F.add(pa(`M${xc - 7},${yT} L${xL},${yT} L${xL},${yB} L${xR},${yB} L${xR},${yT} L${xc + 7},${yT}`, 'k', 'fn', 2.2));
  F.add(ln(xc - 7, yT - 22, xc - 7, yT + 22, 'a', 4) + ln(xc + 7, yT - 22, xc + 7, yT + 22, 'b', 4));
  F.t(xc - 14, yT - 10, '+Q', { c: 'a', a: 'end', b: true }); F.t(xc + 14, yT - 10, '−Q', { c: 'b', a: 'start', b: true });
  F.t(xc, yT + 42, p.C, { c: 'k', b: true });
  pilha(F, xL, 94); F.t(xL - 22, 98, p.U, { c: 'k', a: 'end', b: true });
  F.t(xc, yB - 14, p.Q || '', { c: 'a', b: true });
  F.legenda(p.t);
});
// dois capacitores iguais em série e em paralelo
D.capAssoc = p => fig(300, 176, F => {
  const cap = (x, y, vert = false) => vert ? F.add(ln(x - 14, y - 5, x + 14, y - 5, 'k', 3.4) + ln(x - 14, y + 5, x + 14, y + 5, 'k', 3.4)) : F.add(ln(x - 5, y - 14, x - 5, y + 14, 'k', 3.4) + ln(x + 5, y - 14, x + 5, y + 14, 'k', 3.4));
  F.add(ln(14, 50, 55, 50, 'k', 2) + ln(65, 50, 95, 50, 'k', 2) + ln(105, 50, 136, 50, 'k', 2)); cap(60, 50); cap(100, 50);
  F.t(75, 24, 'série', { c: 's', b: true }); F.t(75, 88, p.a, { c: 'a', b: true });
  F.add(pa('M170,50 L190,50 L190,22 L216,22 M226,22 L250,22 L250,50 L280,50 M190,50 L190,78 L216,78 M226,78 L250,78 L250,50', 'k', 'fn', 2)); cap(221, 22); cap(221, 78);
  F.t(221, 112, p.b, { c: 'a', b: true }); F.t(232, 6 + 12, 'paralelo', { c: 's', b: true, a: 'start', alt: [[-60, 0]] });
  F.t(150, 150, p.c1 || '', { c: 'k' });
  F.legenda(p.t);
});

/* ---------- Eletromagnetismo ---------- */
// fio retilíneo vertical: linhas de B em circunferências (vistas em perspectiva), regra da mão direita
D.fioCampo = p => fig(300, 196, F => {
  const x = 150, yc = 112;
  for (const r of [30, 56, 84]) { F.add(el(x, yc, r * 1.3, r * 0.4, 'b', 'fn', 1.5)); F.add(seta(x + 8, yc + r * 0.4, x - 8, yc + r * 0.4, 'b', 1.6)); }
  const fio = re(x - 4, 12, 8, 176, 'k', 'fm', 2, 1.4); F.add(fio + F.luz(fio, 'cilv'));
  vetor(F, x + 16, 70, x + 16, 26, 'a', ''); F.t(x + 24, 44, p.i, { c: 'a', a: 'start', b: true });
  F.t(270, yc + 56, p.B, { c: 'b', a: 'end', b: true, alt: [[0, -66]] });
  if (p.d) { F.add(ln(x, yc, x + 56 * 1.3, yc, 's', 1.1, '3 2')); F.t(x + 40, yc - 6, p.d, { c: 'k', b: true }); }
  F.legenda(p.t);
});
// fio grosso de raio a visto de frente (corrente saindo): curva amperiana de raio r < a
D.fioGrosso = p => fig(300, 186, F => {
  const c = [130, 88], a = 70, r = 40; const s = ci(c[0], c[1], a, 'a', 'fh', 2); F.add(s + F.luz(s, 'esf'));
  for (let k = 0; k < 18; k++) { const [x, y] = P(c[0], c[1], 14 + (k % 3) * 20, k * 41); F.add(ci(x, y, 3.2, 'a', 'fn', 1) + ci(x, y, 0.9, 'a', 'fa', 0)); }
  F.add(ci(c[0], c[1], r, 'b', 'fn', 2, ' stroke-dasharray="5 4"'));
  F.add(seta(...P(c[0], c[1], r, 30), ...P(c[0], c[1], r, 55), 'b', 2.4)); F.t(...P(c[0], c[1] + 4, r + 18, 50), 'B', { c: 'b', b: true, it: true });
  F.add(ln(c[0], c[1], ...P(c[0], c[1], r, -40), 'k', 1.4) + ln(c[0], c[1], ...P(c[0], c[1], a, 200), 'k', 1.4));
  F.t(...P(c[0] + 6, c[1] + 16, r / 2, -40), 'r', { c: 'k', b: true, it: true }); F.t(...P(c[0], c[1] - 2, a / 2, 200), 'a', { c: 'k', b: true, it: true });
  F.t(226, 30, 'i saindo do plano', { c: 'a', a: 'start', s: FSS, b: true, alt: [[-10, 0]] });
  F.legenda(p.t);
});
D.fiosParalelos = p => fig(300, 176, F => {
  for (const x of [100, 200]) { const f = re(x - 4, 10, 8, 150, 'k', 'fm', 2, 1.4); F.add(f + F.luz(f, 'cilv')); }
  vetor(F, 88, 68, 88, 24, 'a', ''); F.t(80, 46, p.i1, { c: 'a', a: 'end', b: true });
  vetor(F, 212, 68, 212, 24, 'a', ''); F.t(220, 46, p.i2, { c: 'a', a: 'start', b: true });
  vetor(F, 106, 104, 140, 104, 'g', ''); vetor(F, 194, 104, 160, 104, 'g', ''); F.t(150, 92, 'atração', { c: 'g', b: true });
  cota(F, 100, 140, 200, 140, p.d, { sobre: true });
  F.legenda(p.t);
});
// espira circular no plano do papel: corrente anti-horária, B saindo no centro
D.espira = p => fig(300, 186, F => {
  const c = [130, 92], R = 68; F.add(ci(c[0], c[1], R, 'k', 'fn', 5) + ci(c[0], c[1], R, 'p', 'fn', 1.4));
  for (const a of [40, 160, 280]) F.add(seta(...P(c[0], c[1], R, a), ...P(c[0], c[1], R, a + 22), 'a', 2.8));
  F.t(...P(c[0], c[1], R + 18, 62), p.i, { c: 'a', b: true });
  F.add(ci(c[0], c[1], 9, 'b', 'fw', 2) + ci(c[0], c[1], 2.8, 'b', 'fb', 0));
  F.t(c[0] + 14, c[1] - 8, p.B, { c: 'b', a: 'start', b: true });
  F.add(ln(c[0], c[1] + 2, ...P(c[0], c[1], R, -50), 'k', 1.2)); F.t(...P(c[0] + 6, c[1] + 14, R / 2, -50), p.R, { c: 'k', a: 'start', b: true });
  F.t(286, 176, '⊙ B saindo do papel', { c: 's', a: 'end', s: FSS });
  F.legenda(p.t);
});
// solenoide: B uniforme no interior, ao longo do eixo; corrente descendo nos trechos da frente
D.solenoide = p => fig(300, 176, F => {
  const x0 = 60, n = 11, dx = 18, yc = 82, ry = 34;
  for (let k = 0; k < n; k++) { const x = x0 + k * dx; F.add(pa(`M${x},${yc - ry} A7,${ry} 0 0 0 ${x},${yc + ry}`, 's', 'fn', 1.4).replace('/>', ' opacity=".5"/>')); }
  F.add(seta(36, yc, 280, yc, 'b', 2.8)); F.t(280, yc - 10, p.B, { c: 'b', a: 'end', b: true });
  for (let k = 0; k < n; k++) { const x = x0 + k * dx; F.add(pa(`M${x},${yc - ry} A7,${ry} 0 0 1 ${x},${yc + ry}`, 'a', 'fn', 2.6)); }
  F.add(seta(x0 + 5 * dx + 7, yc - 8, x0 + 5 * dx + 7, yc + 10, 'a', 2)); F.t(x0 + 5 * dx + 16, yc + 30, 'i', { c: 'a', b: true, it: true });
  cota(F, x0, 140, x0 + (n - 1) * dx, 140, p.L, { sobre: true });
  F.t(150, 26, p.N, { c: 'k', b: true });
  F.legenda(p.t);
});
// partícula num campo B entrando no papel: trajetória circular (elétron: força para o centro, à direita)
D.particulaB = p => fig(300, 196, F => {
  campoX(F, 18, 18, 282, 162, 24);
  const c = [170, 92], R = 62, x = c[0] - R; F.add(ci(c[0], c[1], R, 'a', 'fn', 2, ' stroke-dasharray="6 4"') + ci(c[0], c[1], 2.5, 'k', 'fk', 0));
  carga(F, x, c[1], 9, p.neg ? -1 : 1);
  vetor(F, x, c[1] - 12, x, c[1] - 58, 'b', ''); F.t(x - 8, c[1] - 40, p.v, { c: 'b', a: 'end', b: true });
  vetor(F, x + 12, c[1], x + 50, c[1], 'g', ''); F.t(x + 30, c[1] - 10, p.F, { c: 'g', b: true });
  cota(F, c[0], c[1] + 6, c[0] + R, c[1] + 6, p.R, { sobre: true });
  F.t(286, 186, 'B entrando no papel', { c: 's', a: 'end', s: FSS });
  F.legenda(p.t);
});
// seletor de velocidades: forças elétrica e magnética se anulam
D.seletor = p => fig(300, 186, F => {
  campoX(F, 30, 54, 280, 120, 26);
  const A = re(20, 30, 270, 9, 'a', 'fh', 1, 1.4), B = re(20, 136, 270, 9, 'b', 'fw', 1, 1.4); F.add(A + F.luz(A, 'cil') + B + F.luz(B, 'cil'));
  for (let x = 40; x < 290; x += 34) F.add(maisMenos(x, 34.5, 1, 3) + maisMenos(x, 140.5, -1, 3));
  const y = 88; F.add(ln(20, y, 286, y, 'b', 1.2, '4 4')); carga(F, 120, y, 8, 1);
  vetor(F, 132, y, 182, y, 'b', ''); F.t(158, y - 10, 'v', { c: 'b', b: true, it: true });
  vetor(F, 120, y - 12, 120, y - 44, 'g', ''); F.t(112, y - 30, 'F_m', { c: 'g', a: 'end', b: true });
  vetor(F, 120, y + 12, 120, y + 44, 'a', ''); F.t(112, y + 34, 'F_e', { c: 'a', a: 'end', b: true });
  F.t(150, 172, p.E, { c: 'k', b: true }); F.t(286, 64, 'B ⊗', { c: 's', a: 'end', s: FSS });
  F.t(286, 112, p.v, { c: 'b', a: 'end', b: true });
  F.legenda(p.t);
});
// fio entre os polos de um ímã: B para a direita, i saindo, F para cima
D.fioB = p => fig(300, 176, F => {
  const r1 = re(12, 40, 27, 92, 'k', 'fr', 2, 1.6), r2 = re(261, 40, 27, 92, 'k', 'fb', 2, 1.6); F.add(r1 + F.luz(r1) + r2 + F.luz(r2) + `<text x="25" y="91" class="tp tb7 th" text-anchor="middle" font-size="${FS}">N</text><text x="275" y="91" class="tp tb7 th" text-anchor="middle" font-size="${FS}">S</text>`);
  for (const y of [56, 116]) F.add(op(seta(46, y, 254, y, 's', 1.2), 0.7)); F.t(232, 108, 'B', { c: 's', b: true, it: true });
  const w = ci(150, 86, 11, 'k', 'fp', 2); F.add(w + F.luz(w, 'esf') + ci(150, 86, 3, 'k', 'fk', 0));
  vetor(F, 150, 72, 150, 24, 'g', ''); F.t(160, 38, p.F, { c: 'g', a: 'start', b: true });
  F.t(150, 160, p.i, { c: 'a', b: true });
  F.legenda(p.t);
});
// fluxo: espira com o plano perpendicular a B
D.fluxo = p => fig(300, 176, F => {
  const e = el(150, 92, 86, 26, 'a', 'fh', 2.6); F.add(e + F.luz(e));
  for (const x of [96, 128, 160, 192, 214, 112, 176]) F.add(seta(x, 160, x, 26, 'b', 1.8));
  F.t(258, 36, p.B, { c: 'b', a: 'start', b: true, alt: [[-12, 0]] }); F.t(250, 96, p.A, { c: 'a', a: 'start', b: true });
  F.t(16, 30, 'θ = 0°', { c: 's', a: 'start' });
  F.legenda(p.t);
});
// ímã e espira: lei de Lenz (N se aproxima, a espira cria um N voltado para ele)
D.ima = p => fig(300, 186, F => {
  const xe = 226, yc = 88, afasta = !!p.afasta;
  ima(F, 30, yc - 16, 96, 32, false);
  if (afasta) { vetor(F, 110, yc - 30, 60, yc - 30, 'k', ''); F.t(116, yc - 26, 'afastando', { c: 'k', a: 'start', s: FSS }); }
  else { vetor(F, 138, yc - 30, 176, yc - 30, 'k', ''); F.t(157, yc - 40, 'v', { c: 'k', b: true, it: true }); }
  F.add(pa(`M${xe},${yc - 52} A16,52 0 0 0 ${xe},${yc + 52}`, 'k', 'fn', 3).replace('/>', ' opacity=".45"/>'));
  F.add(pa(`M${xe},${yc - 52} A16,52 0 0 1 ${xe},${yc + 52}`, 'k', 'fn', 4));
  if (p.ind) { F.add(seta(xe + 12, yc - 40, xe + 4, yc - 50, 'a', 2.6) + seta(xe + 4, yc + 50, xe + 12, yc + 40, 'a', 2.6));
    vetor(F, xe - 6, yc, xe - 46, yc, 'g', ''); F.t(xe - 26, yc + 18, 'B induzido', { c: 'g', b: true, s: FSS });
    F.t(xe - 22, yc - 26, 'N', { c: 'r', a: 'end', b: true }); }
  F.t(xe + 6, 22, p.i, { c: 'a', b: true, alt: [[-30, 0]] });
  F.legenda(p.t);
});
// barra condutora nos trilhos dentro de B entrando: fem induzida, corrente sobe na barra
D.trilho = p => fig(300, 176, F => {
  campoX(F, 64, 40, 284, 128, 24);
  F.add(ln(40, 30, 292, 30, 'k', 3) + ln(40, 138, 292, 138, 'k', 3) + ln(40, 30, 40, 138, 'k', 3) + mascara(31, 62, 18, 44) + resistor(40, 64, 40, true, 'a'));
  F.t(28, 88, p.R, { c: 'a', a: 'end', b: true });
  const b = re(186, 24, 9, 120, 'k', 'fm', 2, 1.4); F.add(b + F.luz(b, 'cilv'));
  vetor(F, 198, 84, 250, 84, 'b', ''); F.t(254, 88, p.v, { c: 'b', a: 'start', b: true, alt: [[-30, -16]] });
  F.add(seta(180, 112, 180, 60, 'a', 2.4)); F.t(174, 64, 'i', { c: 'a', a: 'end', b: true, it: true });
  F.add(sentido([40, 50], [40, 120], 'a', 0.2));
  cota(F, 210, 30, 210, 138, '', {}); F.t(216, 128, p.L, { c: 'k', a: 'start', b: true });
  F.t(286, 168, 'B ⊗ ' + (p.B || ''), { c: 's', a: 'end', s: FSS });
  F.legenda(p.t);
});
// tensão alternada da tomada: pico e valor eficaz
D.geradorCA = p => fig(300, 186, F => {
  const G = grafico(F, { x0: 46, y0: 96, w: 226, h: 70, xmax: 2, ymin: 0, ymax: 200, yt: [[180, '180'], [127, '127']], xl: 't', yl: 'U (V)' });
  F.add(pa(path(curvaPts(t => 180 * Math.sin(2 * Math.PI * t), 0, 2, 80, G.X, v => 96 - v / 200 * 70)), 'a', 'fn', 2.8));
  F.add(ln(46, 96 - 127 * 0.35, 272, 96 - 127 * 0.35, 'b', 1.4, '6 4')); F.t(272, 96 - 127 * 0.35 - 6, 'U_ef', { c: 'b', a: 'end', b: true });
  F.add(ln(46, 96 + 180 * 0.35, 272, 96 + 180 * 0.35, 's', 0.6, '2 3')); F.t(40, 96 + 180 * 0.35 + 4, '−180', { c: 's', a: 'end', s: FSS + 0.5 });
  F.legenda(p.t);
});
// transformador: núcleo de ferro, primário com mais espiras
D.transformador = p => fig(300, 186, F => {
  const nuc = re(80, 26, 140, 118, 'k', 'fm', 6, 2); F.add(nuc + F.luz(nuc) + re(104, 50, 92, 70, 'k', 'fq', 3, 2));
  for (let k = 0; k < 8; k++) F.add(el(92, 54 + k * 9, 20, 5, 'a', 'fn', 2.2));
  for (let k = 0; k < 3; k++) F.add(el(208, 72 + k * 12, 20, 5, 'b', 'fn', 2.2));
  F.add(ln(72, 54, 40, 54, 'a', 2) + ln(72, 117, 40, 117, 'a', 2) + ln(228, 72, 260, 72, 'b', 2) + ln(228, 96, 260, 96, 'b', 2));
  F.t(36, 90, p.Up, { c: 'a', a: 'end', b: true, alt: [[30, -46]] }); F.t(264, 88, p.Us, { c: 'b', a: 'start', b: true, alt: [[-30, -40]] });
  F.t(92, 166, p.Np, { c: 'a', b: true }); F.t(208, 166, p.Ns, { c: 'b', b: true });
  F.legenda(p.t);
});


/* ---------- Física moderna ---------- */
function nave(F, x, y, L, o = {}) {
  const h = L * 0.22, k = o.f || 'fp';
  const c = pa(`M${x},${y - h / 2} L${x + L * 0.78},${y - h / 2} Q${x + L},${y} ${x + L * 0.78},${y + h / 2} L${x},${y + h / 2} Z`, 'k', k, 1.8);
  const as = pa(`M${x + L * 0.1},${y - h / 2} L${x - L * 0.06},${y - h * 0.9} L${x + L * 0.3},${y - h / 2} M${x + L * 0.1},${y + h / 2} L${x - L * 0.06},${y + h * 0.9} L${x + L * 0.3},${y + h / 2}`, 'k', 'fm', 1.6);
  F.add(as + c + F.luz(c, 'cil') + ci(x + L * 0.66, y, h * 0.24, 'b', 'fw', 1.4));
  if (o.chama) F.add(pa(`M${x},${y - h * 0.3} L${x - L * 0.16},${y} L${x},${y + h * 0.3} Z`, 'a', 'fh', 1.2));
  return F;
}
D.nave = p => fig(300, p.L ? 186 : 170, F => {
  if (p.L) { // contração: mesma nave em repouso e em movimento
    nave(F, 40, 38, 180); F.t(230, 42, 'em repouso', { c: 's', a: 'start', s: FSS });
    cota(F, 34, 80, 220, 80, p.L0, { sobre: true });
    nave(F, 40, 122, 144, { chama: true }); vetor(F, 194, 122, 244, 122, 'b', p.v, { alt: [[0, -16]] });
    cota(F, 34, 162, 184, 162, p.L, { sobre: true });
  } else {
    nave(F, 54, 80, 150, { chama: true });
    vetor(F, 214, 80, 270, 80, 'b', p.v, { alt: [[-20, -24, 'middle']] });
    if (p.proj) { bola(F, 250, 46, 5, 'fa'); vetor(F, 258, 46, 290, 46, 'a', ''); F.t(286, 30, p.proj, { c: 'a', a: 'end', b: true }); }
    if (p.relogio) { const r = ci(130, 80, 11, 'k', 'fp', 1.6); F.add(r + ln(130, 80, 130, 72, 'k', 1.6) + ln(130, 80, 136, 82, 'k', 1.6)); }
  }
  F.t(150, 158, p.g || '', { c: 'k', b: true });
  F.legenda(p.t);
});
D.emc2 = p => fig(300, 156, F => {
  bloco(F, 30, 54, 52, 44, p.m, { f: 'fm' }); F.add(seta(92, 76, 140, 76, 'k', 2.2));
  for (let k = 0; k < 12; k++) { const [x1, y1] = P(204, 76, 26, k * 30), [x2, y2] = P(204, 76, k % 2 ? 52 : 62, k * 30); F.add(ln(x1, y1, x2, y2, 'a', 2.2)); }
  const c = ci(204, 76, 20, 'a', 'fsol', 1.6); F.add(c + F.luz(c, 'esf'));
  F.t(204, 152 - 6, p.E, { c: 'a', b: true });
  F.legenda(p.t);
});
// fóton: comprimento de onda na escala do desenho
D.foton = p => fig(300, 140, F => {
  F.add(ondulada(20, 70, 270, 70, 'g', 14, 46));
  cota(F, 20 + 46 * 0.25, 34, 20 + 46 * 1.25, 34, p.l, { sobre: true });
  F.t(160, 122, p.E, { c: 'g', b: true });
  F.legenda(p.t);
});
D.fotoeletrico = p => fig(300, 180, F => {
  const m = re(30, 40, 20, 110, 'k', 'fm', 2, 1.6); F.add(m + F.luz(m, 'cilv'));
  for (const y of [56, 92]) F.add(ondulada(240, y - 30, 56, y + 10, 'r', 4, 10));
  F.t(196, 26, p.hf, { c: 'r', b: true });
  carga(F, 60, 128, 6, -1); vetor(F, 70, 132, 196, 156, 'b', p.K, { alt: [[-40, 18]] });
  F.t(40, 172, p.m, { c: 'k', b: true }); F.t(290, 120, p.phi || '', { c: 's', a: 'end' });
  F.legenda(p.t);
});
// pacote de onda associado à partícula (de Broglie) ou incerteza de posição (Heisenberg)
D.ondaMateria = p => fig(300, 160, F => {
  let d = ''; for (let x = 30; x <= 270; x += 1.5) { const t = (x - 150) / 52; d += (x === 30 ? 'M' : 'L') + n1(x) + ',' + n1(80 - 34 * Math.exp(-t * t) * Math.cos((x - 150) / 6)) + ' '; }
  F.add(pa(d, 'b', 'fn', 2.2)); carga(F, 150, 80, 6, -1);
  if (p.dx) cota(F, 96, 132, 204, 132, p.dx, { sobre: true }); else cota(F, 150 - 18.8, 32, 150 + 18.8, 32, p.l, { sobre: true });
  if (p.v) vetor(F, 212, 112, 262, 112, 'k', p.v);
  F.legenda(p.t);
});
// níveis de energia do hidrogênio (escala em eV)
D.niveis = p => fig(300, 196, F => {
  const ys = { 1: 172, 2: 66, 3: 40, 4: 30 };
  for (const [n, E] of [[1, '−13,6'], [2, '−3,4'], [3, '−1,51'], [4, '−0,85']]) {
    const y = ys[n], dest = (p.destaque || 0) == n;
    F.add(ln(60, y, 200, y, dest ? 'a' : 'k', dest ? 3 : 1.8)); F.t(52, y + 4, 'n = ' + n, { c: 'k', a: 'end', b: true, s: FSS, alt: [[0, 0]] }); F.t(208, y + 4, E + ' eV', { c: dest ? 'a' : 's', a: 'start', s: FSS, b: dest });
  }
  F.add(ln(60, 14, 200, 14, 's', 1, '4 3')); F.t(208, 18, '0 eV', { c: 's', a: 'start', s: FSS });
  if (p.de) { vetor(F, 130, ys[p.de] + 2, 130, ys[p.para] - 2, 'k', '', { w: 2.2 }); F.add(ondulada(136, (ys[p.de] + ys[p.para]) / 2, 196, 106, 'r', 4, 9)); F.t(200, 120, p.f, { c: 'r', a: 'middle', b: true, alt: [[40, 0]] }); }
  F.t(130, 120, p.lab || '', { c: 'a', b: true });
  F.legenda(p.t);
});
// decaimento alfa (ou núcleo de hélio com energia de ligação)
D.decaimento = p => fig(300, 170, F => {
  if (p.he) { for (const [x, y, f] of [[136, 68, 'fr'], [156, 68, 'fb'], [136, 88, 'fb'], [156, 88, 'fr']]) { const c = ci(x, y, 11, 'k', f, 1); F.add(c + F.luz(c, 'esf')); }
    F.t(146, 120, p.X, { c: 'k', b: true }); F.t(146, 146, p.Y, { c: 'a', b: true }); F.t(250, 64, 'próton', { c: 'r', s: FSS }); F.t(250, 92, 'nêutron', { c: 'b', s: FSS });
    F.legenda(p.t); return; }
  nucleo(F, 76, 76, 26, 6); nucleo(F, 200, 70, 22, 6); nucleo(F, 270, 40, 4, 5);
  F.add(seta(112, 76, 158, 72, 'k', 2)); vetor(F, 222, 58, 254, 44, 'a', '');
  F.t(76, 128, p.X, { c: 'k', b: true }); F.t(200, 128, p.Y, { c: 'k', b: true }); F.t(270, 72, p.a, { c: 'a', b: true });
  F.legenda(p.t);
});
// curva de decaimento N × t: metade a cada meia-vida
D.meiaVida = p => fig(300, 196, F => {
  const G = grafico(F, { x0: 46, y0: 166, w: 230, h: 136, xmax: 4.3, ymax: 1.08, xt: [[1, '1T'], [2, '2T'], [3, '3T'], [4, '4T']], yt: [[1, 'N₀'], [0.5, 'N₀/2'], [0.25, 'N₀/4'], [0.125, 'N₀/8']], xl: 't', yl: 'N' });
  F.add(pa(path(curvaPts(t => Math.pow(0.5, t), 0, 4.2, 60, G.X, G.Y)), 'a', 'fn', 3));
  const k = p.k || 2; F.add(ln(G.X(k), G.Y(0), G.X(k), G.Y(Math.pow(0.5, k)), 'a', 1.4, '3 3') + ci(G.X(k), G.Y(Math.pow(0.5, k)), 4.5, 'k', 'fa', 1.4));
  F.t(G.X(k) + 8, G.Y(Math.pow(0.5, k)) - 8, p.lab, { c: 'a', a: 'start', b: true });
  F.legenda(p.t);
});
D.fissao = p => fig(300, 176, F => {
  bola(F, 24, 84, 6, 'fm'); F.add(seta(32, 84, 66, 84, 'k', 1.8)); F.t(24, 66, 'n', { c: 'k', b: true, it: true });
  nucleo(F, 100, 84, 30, 6); F.add(seta(134, 84, 160, 84, 'k', 1.8));
  nucleo(F, 196, 52, 14, 6); nucleo(F, 196, 118, 14, 6);
  for (const y of [34, 84, 136]) { bola(F, 274, y, 5, 'fm'); F.add(op(seta(220, 84, 266, y, 's', 1.4), 0.8)); }
  F.t(100, 132, p.a, { c: 'k', b: true }); F.t(150, 168, p.E, { c: 'a', b: true });
  F.legenda(p.t);
});
// usina nuclear: reator → vapor → turbina → gerador
D.usina = p => fig(300, 176, F => {
  const yb = 140; chao(F, 4, 296, yb);
  const r = pa(`M24,${yb} L24,82 Q24,52 56,52 Q88,52 88,82 L88,${yb} Z`, 'k', 'fm', 1.8); F.add(r + F.luz(r)); F.t(56, 106, 'reator', { c: 'k', b: true, s: FSS });
  F.add(pa(`M88,70 L122,70`, 'r', 'fn', 3) + seta(110, 70, 124, 70, 'r', 2.6));
  const tu = pa(`M126,58 L166,48 L166,${yb - 46} L126,${yb - 56} Z`, 'k', 'fo', 1.6); F.add(tu + F.luz(tu)); F.t(146, 118, 'turbina', { c: 's', s: FSS });
  const g = re(176, 54, 40, 36, 'k', 'fm', 4, 1.6); F.add(g + F.luz(g) + ln(166, 72, 176, 72, 'k', 3)); F.t(196, 108, 'gerador', { c: 's', s: FSS });
  F.add(pa('M216,64 L234,64 L228,76 L246,76', 'a', 'fn', 3)); vetor(F, 246, 76, 278, 76, 'a', '');
  const t = pa(`M252,${yb} Q262,96 250,40 L292,40 Q280,96 290,${yb} Z`, 'k', 'fp', 1.6); F.add(t.replace('M252', 'M252'));
  F.t(150, 26, p.P, { c: 'a', b: true });
  F.legenda(p.t);
});

/* ---------- Astronomia ---------- */
D.sinodico = p => fig(300, 196, F => {
  const c = [130, 98]; sol(F, c[0], c[1], 13);
  F.add(ci(c[0], c[1], 50, 's', 'fn', 1.2) + ci(c[0], c[1], 84, 's', 'fn', 1.2, ' stroke-dasharray="5 4"') + ln(c[0], c[1], c[0] + 100, c[1], 's', 1, '3 3'));
  astro(F, c[0] + 50, c[1], 7, 'fw', 'b'); astro(F, c[0] + 84, c[1], 7, 'fr', 'r');
  F.t(c[0] + 50, c[1] - 14, p.a, { c: 'b', b: true, s: FSS }); F.t(c[0] + 98, c[1] - 12, p.b, { c: 'r', b: true, s: FSS, a: 'start' });
  F.t(286, 30, 'alinhados (oposição)', { c: 's', a: 'end', s: FSS });
  F.legenda(p.t);
});
D.buracoNegro = p => fig(300, 176, F => {
  F.escuro = true; F.add(re(0, 0, 300, 176, 'n', 'fd', 0, 0));
  for (let k = 0; k < 40; k++) F.add(ci((k * 73) % 300, (k * 41) % 170, k % 5 ? 0.8 : 1.4, 'n', 'fp', 0));
  F.add(el(150, 84, 120, 22, 'a', 'fn', 6).replace('/>', ' opacity=".55"/>') + ci(150, 84, 40, 'p', 'fd', 1.2) + ci(150, 84, 40, 'n', 'fd', 0));
  F.add(pa('M30,84 A120,22 0 0 0 270,84', 'a', 'fn', 6).replace('/>', ' opacity=".9"/>'));
  F.add(ln(150, 84, 190, 84, 'p', 1.4)); F.t(176, 76, 'R_S', { c: 'p', b: true });
  F.t(150, 160, p.R, { c: 'p', b: true });
  F.legenda(p.t);
});
// espectro de corpo negro (Planck) a 5 800 K: pico em 500 nm, faixa visível colorida
D.espectro = p => fig(300, 196, F => {
  const T = p.Tk || 5800, B = l => 1 / (Math.pow(l, 5) * (Math.exp(1.4388e7 / (l * T)) - 1)), lp = 2.898e6 / T, max = B(lp);
  const G = grafico(F, { x0: 40, y0: 160, w: 236, h: 120, xmin: 100, xmax: 2000, ymax: 1.1, xt: [[500, '500'], [1000, '1 000'], [1500, '1 500']], xl: 'λ (nm)', yl: 'intensidade' });
  const cores = ['#7b3fbf', '#3156c9', '#1f9ad6', '#2fae55', '#e2c92a', '#f08a24', '#d8352a'];
  cores.forEach((c, i) => F.add(`<rect x="${n1(G.X(400 + i * 43))}" y="${G.Y(1.08)}" width="${n1(G.X(443) - G.X(400))}" height="${n1(G.Y(0) - G.Y(1.08))}" fill="${c}" opacity=".16"/>`));
  F.add(pa(path(curvaPts(l => B(l) / max, 120, 2000, 90, G.X, G.Y)), 'a', 'fn', 3) + ln(G.X(lp), G.Y(0), G.X(lp), G.Y(1), 'k', 1.2, '3 3'));
  F.t(G.X(lp) + 36, G.Y(0.82), p.l, { c: 'k', a: 'start', b: true }); F.add(ln(G.X(lp) + 2, G.Y(0.86), G.X(lp) + 34, G.Y(0.84), 's', 0.8)); F.t(G.X(400 + 150), G.Y(0) - 6, 'visível', { c: 's', s: FSS });
  F.t(276, 60, p.T, { c: 'a', a: 'end', b: true });
  F.legenda(p.t);
});
D.estrela = p => fig(300, 176, F => {
  const c = [100, 84]; for (let k = 0; k < 16; k++) { const [x1, y1] = P(c[0], c[1], 64, k * 22.5), [x2, y2] = P(c[0], c[1], k % 2 ? 76 : 84, k * 22.5); F.add(ln(x1, y1, x2, y2, 'a', 2)); }
  const s = ci(c[0], c[1], 56, 'a', 'fsol', 1.6); F.add(s + F.luz(s, 'esf')); F.add(ln(c[0], c[1], c[0] + 56, c[1], 'k', 1.4)); F.t(c[0] + 26, c[1] - 8, 'R', { c: 'k', b: true, it: true });
  F.t(190, 56, p.R, { c: 'k', a: 'start', b: true }); F.t(190, 82, p.T, { c: 'k', a: 'start', b: true }); F.t(190, 112, p.L, { c: 'a', a: 'start', b: true });
  F.legenda(p.t);
});
// linha espectral deslocada para o vermelho (laboratório × galáxia)
D.galaxia = p => fig(300, 176, F => {
  const X = l => 30 + (l - 640) / 30 * 240;
  const faixa = (y, l, lab) => { for (let k = 0; k < 60; k++) { const lx = 640 + k * 0.5; F.add(`<rect x="${n1(X(lx))}" y="${y}" width="${n1(X(640.6) - X(640))}" height="26" fill="#d8352a" opacity="${n1(0.25 + k / 120)}"/>`); } F.add(ln(X(l), y - 2, X(l), y + 28, 'k', 3)); F.t(X(l), y + 44, String(l).replace('.', ',') + ' nm', { c: 'k', b: true }); F.t(26, y + 18, lab, { c: 's', a: 'end', s: FSS }); };
  faixa(26, 656.3, ''); F.t(30, 20, 'laboratório', { c: 's', a: 'start', s: FSS });
  faixa(96, 662.9, ''); F.t(30, 90, 'galáxia', { c: 's', a: 'start', s: FSS });
  F.add(seta(X(656.3), 82, X(662.9), 82, 'r', 2)); F.t(290, 152, p.v, { c: 'r', a: 'end', b: true, alt: [[0, -10]] });
  F.legenda(p.t);
});
// lei de Hubble: v = H₀ d
D.hubble = p => fig(300, 196, F => {
  const G = grafico(F, { x0: 52, y0: 160, w: 216, h: 124, xmax: 140, ymax: 10000, xt: [[100, '100']], yt: [[7000, '7 000']], xl: 'd (Mpc)', yl: 'v (km/s)' });
  F.add(pa(path([[G.X(0), G.Y(0)], [G.X(140), G.Y(9800)]]), 'a', 'fn', 2.6) + ci(G.X(100), G.Y(7000), 5, 'k', 'fa', 1.4) + ln(G.X(100), G.Y(7000), G.X(100), G.Y(0), 's', 1, '3 3') + ln(G.X(0), G.Y(7000), G.X(100), G.Y(7000), 's', 1, '3 3'));
  F.t(G.X(70), G.Y(6200), 'H₀ = 70 km/s/Mpc', { c: 'a', a: 'end', b: true });
  F.legenda(p.t);
});
// paralaxe: ângulo p visto da estrela, com base de 1 UA (fora de escala)
D.paralaxe = p => fig(300, 196, F => {
  const S = [150, 162], E = [150, 24];
  sol(F, S[0], S[1], 10); F.add(el(S[0], S[1], 90, 16, 's', 'fn', 1.2, '4 4'));
  astro(F, S[0] - 90, S[1], 6, 'fw', 'b'); astro(F, S[0] + 90, S[1], 6, 'fw', 'b');
  F.add(ln(S[0] - 90, S[1], E[0], E[1], 's', 1, '4 3') + ln(S[0], S[1], E[0], E[1], 'k', 1.2) + ci(E[0], E[1], 5, 'a', 'fsol', 1.2));
  angulo(F, E[0], E[1], 40, -90, -90 - Math.atan(90 / 138) * 180 / Math.PI, p.p, 'k', { fora: 12 });
  cota(F, S[0], 186, S[0] + 90, 186, '1 UA', { sobre: true });
  F.t(E[0] + 10, E[1] + 4, p.e, { c: 'a', a: 'start', b: true });
  F.foraEscala();
  F.legenda(p.t);
});
// escala: a UA cabe 63 000 vezes num ano-luz (a barra do ano-luz não cabe na página)
D.escala = p => fig(300, 150, F => {
  sol(F, 30, 50, 11); astro(F, 120, 50, 6, 'fw', 'b'); cota(F, 30, 80, 120, 80, '1 UA', { sobre: true });
  F.add(ln(30, 116, 260, 116, 'a', 3) + ln(264, 112, 272, 120, 'a', 2) + ln(270, 112, 278, 120, 'a', 2) + ln(282, 116, 294, 116, 'a', 3));
  F.t(150, 106, p.ly, { c: 'a', b: true });
  F.legenda(p.t);
});
D.magnitude = p => fig(300, 170, F => {
  F.escuro = true; F.add(re(0, 0, 300, 170, 'n', 'fd', 0, 0));
  for (let k = 0; k < 30; k++) F.add(ci((k * 89) % 300, (k * 53) % 150, 0.8, 'n', 'fp', 0));
  for (const [x, r, l] of [[86, 20, 'm = 1'], [226, 4, 'm = 6']]) { F.add(ci(x, 70, r * 2.4, 'n', 'fn', 0).replace('class="n fn"', `class="n" fill="${F.g('brilho')}"`) + ci(x, 70, r, 'n', 'fsol', 0)); F.t(x, 134, l, { c: 'p', b: true }); }
  F.t(150, 160, p.r || '', { c: 'p' });
  F.legenda(p.t);
});
D.planeta = p => fig(300, 176, F => {
  const c = [120, 88]; astro(F, c[0], c[1], 64, 'fw', 'b');
  F.add(pa(`M${c[0] - 50},${c[1] - 20} Q${c[0]},${c[1] - 2} ${c[0] + 52},${c[1] - 24} M${c[0] - 46},${c[1] + 30} Q${c[0]},${c[1] + 44} ${c[0] + 48},${c[1] + 26}`, 'g', 'fn', 2).replace('/>', ' opacity=".6"/>'));
  F.add(ln(c[0], c[1], c[0] + 64, c[1], 'k', 1.4)); F.t(c[0] + 30, c[1] - 8, p.R, { c: 'k', b: true });
  vetor(F, 240, 30, 196, 62, 'b', ''); F.t(246, 30, p.g, { c: 'b', a: 'start', b: true, alt: [[-20, -14]] });
  F.t(240, 150, p.d, { c: 'a', b: true });
  F.legenda(p.t);
});

/* =================================================================
   MAPA: fórmula → [desenho, rótulos com os números do exemplo]
   ================================================================= */
const MAPA = {
  // pilotos
  'plano-componentes': ['plano', { Pv: 40, Ptv: 20, Nv: 34.6, ang: 30, P: 'P = 40 N', Pt: 'P_t = 20 N', N: 'N ≈ 34,6 N', Pn: 'P_n', m: '4 kg' }],
  'plano-aceleracao': ['plano', { ang: 30, P: 'P', Pt: 'P_t', N: 'N', a: 'a = 5 m/s²', t: 'sem atrito: a = g·sen 30° = 5 m/s² · com μ = 0,2: a ≈ 3,3 m/s²' }],
  'plano-iminencia': ['plano', { ang: 37, P: 'P', Pt: 'P_t', N: 'N', atrito: 'f_e,máx', t: 'na iminência: f_e,máx = P_t ⇒ μ_e = tg 37° = 0,75' }],
  'equacao-lentes': ['lente', { f: 10, pp: 500, K: 5, xl: 84, y0: 74, ho: 14, o: 'slide', i: 'imagem', ppLab: 'p′ = 5 m', quebra: { x: 176, xI: 262, hI: 52 }, t: ['p = 500/49 ≈ 10,2 cm · A = −p′/p ≈ −49', 'imagem real, invertida e 49× maior que o slide'] }],
  'vergencia': ['lente', { f: -50, p: null, K: 1.6, xl: 196, fd: 'f = −50 cm', t: 'V = −2 di: lente divergente' }],
  'fabricantes': ['lente', { f: 20, p: null, K: 2.6, xl: 120, fd: 'f = 20 cm', t: 'biconvexa · R = 20 cm · n = 1,5 → V = 5 di' }],
  'associacao-lentes': ['lente', { f: 50, p: null, K: 1.9, xl: 90, dupla: ['+5 di', '−3 di'], fd: 'f = 50 cm', t: 'lentes encostadas: V = +5 − 3 = +2 di' }],
  'lupa': ['lente', { f: 10, p: 8, K: 4, xl: 214, ho: 13, o: 'o', i: 'i', oAbaixo: true, pdx: -22, t: 'f = 10 cm · imagem virtual, direita e 5× maior' }],
  'corrente': ['circuito', { R: 'R', E: 'ε', i: 'i = 2 A', t: 'em 1 min passam 120 C (7,5·10²⁰ elétrons)' }],
  'ohm-1': ['circuito', { R: 'R = 20 Ω', E: '120 V', i: 'i = 6 A' }],
  'gerador': ['circuito', { R: 'R', E: '12 V', r: 'r = 0,5 Ω', i: 'i = 4 A', U: 'U = 10 V', t: 'U = ε − r i · rendimento ≈ 83%' }],
  'receptor': ['circuito', { E: 'U = 110 V', motor: { e: 'ε′ = 100 V', r: 'r′ = 2 Ω' }, i: 'i = 5 A', t: 'motor (receptor): U = ε′ + r′ i' }],
  'pouillet': ['circuito', { R: 'R = 5 Ω', E: '12 V', r: 'r = 1 Ω', i: 'i = 2 A' }],
  'isotermica': ['pv', { tipo: 'isot', V1: 6, V2: 3, p1: 2, Vmax: 7.5, pmax: 5, xt: [[3, '3'], [6, '6']], yt: [[2, '2'], [4, '4']], xl: 'V (L)', yl: 'p (atm)', lab: 'pV = 12 atm·L', area: false, t: 'compressão isotérmica: 6 L → 3 L, 2 atm → 4 atm' }],
  'adiabatica': ['pv', { tipo: 'adia', V1: 2, V2: 1, p1: 1, Vmax: 2.5, pmax: 3.8, xt: [[1, 'V/2'], [2, 'V']], yt: [[1, 'p₁'], [2, '2p₁'], [3.17, '3,2p₁']], xl: 'V', yl: 'p', lab: 'Q = 0', area: false, t: 'na adiabática a pressão sobe mais (3,2p₁) que na isotérmica (2p₁)' }],
  'trabalho-isobarico': ['pv', { tipo: 'isob', V1: 2, V2: 5, p1: 2, Vmax: 6, pmax: 3, xt: [[2, '2'], [5, '5']], yt: [[2, '2']], xl: 'V (L)', yl: 'p (10⁵ Pa)', lab: 'τ = área = 600 J' }],
  'trabalho-area': ['pv', { tipo: 'ciclo', V1: 2, V2: 4, p1: 1, p2: 2, Vmax: 5, pmax: 2.6, xt: [[2, '2'], [4, '4']], yt: [[1, '1'], [2, '2']], xl: 'V (L)', yl: 'p (10⁵ Pa)', lab: 'τ = 200 J' }],
  'trabalho-isotermico': ['pv', { tipo: 'isot', V1: 1, V2: 2, p1: 2, Vmax: 2.5, pmax: 2.6, xt: [[1, 'V'], [2, '2V']], yt: [[1, 'p/2'], [2, 'p']], xl: 'V', yl: 'p', lab: 'τ ≈ 1,7 kJ', t: '1 mol a 300 K: τ = nRT·ln 2' }],
  // Mecânica · cinemática escalar
  'vel-media': ['carro', { v: 'v_m = 80 km/h', d: 'Δs = 120 km em Δt = 1,5 h', t: '80 km/h ÷ 3,6 ≈ 22,2 m/s' }],
  'acel-media': ['carro', { v: '0 → 30 m/s', a: 'a_m = 3 m/s²', t: '108 km/h = 30 m/s, atingidos em 10 s' }],
  'mu-horaria': ['carro', { v: 'v = 5 m/s', eixo: [[20, '0'], [120, 's₀ = 20'], [220, 's = 40']], t: 's = 20 + 5t · em t = 4 s, s = 40 m' }],
  'mu-encontro': ['encontro', { va: '20 m/s', vb: '10 m/s', d: '300 m', t: 'encontro em t = 300 / (20 + 10) = 10 s' }],
  'newton-1': ['carro', { v: 'v constante', t: 'F_R = 0' }],
  'muv-posicao': ['carro', { v: 'v₀ = 4 m/s', a: 'a = 2 m/s²', eixo: [[26, 's₀ = 0'], [250, 's = 21 m']], t: 'em t = 3 s o móvel está em s = 21 m' }],
  'muv-velocidade': ['grafico', { v0: 4, v1: 10, t1: 3, tmax: 4, vmax: 12, area: 'Δs = 21 m', inc: 'a = 2 m/s²', t: 'v = v₀ + at = 4 + 2·3 = 10 m/s' }],
  'torricelli': ['carro', { v: 'v₀ = 20 m/s', a: 'a = −5 m/s²', d: 'Δs = 40 m (até parar)', t: '0 = 20² + 2(−5)Δs' }],
  'muv-vel-media': ['grafico', { v0: 4, v1: 10, t1: 3, tmax: 4, vmax: 12, area: 'Δs = área = 21 m', t: 'v_m = (4 + 10)/2 = 7 m/s' }],
  'queda-livre': ['queda', { h: 'h = 45 m', v: 'v = 30 m/s', t: 'chega ao solo em t = 3 s' }],
  'lanc-vertical': ['vertical', { v: 'v₀ = 30 m/s', h: 'H = 45 m', t: 'subida em 3 s; volta à mão em 6 s, a 30 m/s' }],
  'lanc-horizontal': ['horizontal', { v: 'v₀ = 15 m/s', h: 'h = 20 m', A: 'A = 30 m', vf: 'v = 25 m/s', t: 'queda em 2 s; na chegada v_y = 20 m/s' }],
  'obl-componentes': ['componentes', { a: 'v₀ = 20 m/s', ax: 'v_0x ≈ 17,3 m/s', ay: 'v_0y = 10 m/s', ang: 30 }],
  'obl-tempo-altura': ['obliquo', { v: 'v₀ = 20 m/s', th: '30°', ang: 30, H: 'H = 5 m', t: 'subida em t_s = 1 s' }],
  'obl-alcance': ['obliquo', { v: 'v₀ = 20 m/s', th: '30°', ang: 30, A: 'A ≈ 34,6 m', t: 'o mesmo alcance de um lançamento a 60°' }],
  'obl-trajetoria': ['obliquo', { v: 'v₀ = 20 m/s', th: '45°', ang: 45, A: 'parede a 20 m', H: 'y = 10 m', wall: 20, wallY: 10 }],
  'graf-areas': ['grafico', { v0: 0, v1: 20, t1: 4, tmax: 5, vmax: 24, area: 'área = 40 m', t: 'Δs = área do triângulo = 4 · 20 / 2' }],
  // vetorial
  'vet-resultante': ['vetores', { av: 4, bv: 3, a: '4 N', b: '3 N', R: 'R ≈ 6,1 N', th: '60°', ang: 60 }],
  'vet-componentes': ['componentes', { a: 'a = 10', ax: 'aₓ = 8', ay: 'a_y = 6', ang: 37 }],
  'vet-vel-media': ['meiaVolta', { dr: '|Δr| = 2R = 20 m', arco: 'arco = πR ≈ 31,4 m', t: 'em 5 s: |v_m| = 4 m/s; escalar ≈ 6,3 m/s' }],
  'vet-acel': ['curva', { v: 'v = 10 m/s', F: 'a_cp = 2 m/s²', at: 'a_t = 1,5', R: 'R = 50 m', t: '|a| = √(1,5² + 2²) = 2,5 m/s²' }],
  'mov-relativo': ['trem', { u: '1 m/s', v: 'v_trem = 20 m/s', t: 'em relação ao solo: 20 + 1 = 21 m/s' }],
  'travessia-rio': ['rio', { vb: 'v_barco = 4 m/s', vc: 'v_c = 3 m/s', vr: 'v = 5 m/s', L: 'L = 80 m', t: 'travessia em 20 s; arrasto de 60 m rio abaixo' }],
  // circular
  'periodo-frequencia': ['disco', { f: 'f = 20 Hz', t2: '1 200 rpm', t: 'T = 1/20 = 0,05 s' }],
  'vel-angular': ['disco', { f: 'ω ≈ 126 rad/s', t2: 'T = 0,05 s', t: 'ω = 2π/T = 40π rad/s' }],
  'vel-tangencial': ['circulo', { R: 'R = 0,3 m', v: 'v ≈ 18,8 m/s', t: 'f = 10 Hz · v = 2πRf' }],
  'mcu-angular': ['circulo', { v: 'ω₁ > ω₂', sentido: 'mesmo sentido', t: 'T₁ = 60 s e T₂ = 90 s: o mais rápido dá uma volta a mais em 180 s' }],
  'acel-centripeta': ['circulo', { R: 'R = 100 m', v: 'v = 20 m/s', acp: 'a_cp = 4 m/s²' }],
  'mcuv': ['disco', { f: 'α = 5 rad/s²', t2: '0 → 20 rad/s em 4 s', t: 'Δφ = 40 rad ≈ 6,4 voltas' }],
  'transmissao-correia': ['correia', { Ra: 'R_A = 10 cm', Rb: 'R_B = 4 cm', fa: 'f_A = 1 Hz', fb: 'f_B = 2,5 Hz', t: 'mesma velocidade na borda: f_A R_A = f_B R_B' }],
  'transmissao-eixo': ['eixo', { R: 'R = 35 cm', r: 'catraca: 2,5 Hz', v: 'v ≈ 5,5 m/s', t: 'mesmo eixo, mesma ω: v = 2π · 0,35 · 2,5 ≈ 20 km/h' }],
  // dinâmica
  'newton-2': ['blocoForca', { Fv: 10, m: '2 kg', F: 'F_R = 10 N', t: 'a = F_R/m = 5 m/s²' }],
  'newton-3': ['blocos', { A: 'A', B: 'B', F: 'F', FAB: 'F_AB' }],
  'peso': ['peso', { m: '60 kg', P: 'P = 600 N', N: 'N', t: 'na Lua (g = 1,6 m/s²): P = 96 N' }],
  'normal': ['blocoForca', { Fv: 50, Nv: 70, Pv: 100, m: '10 kg', F: 'F = 50 N', ang: 37, th: '37°', Fdec: '30 N', N: 'N = 70 N', P: 'P = 100 N', t: 'N = P − F sen 37° = 100 − 30' }],
  'tracao': ['pendurado', { Tv: 6000, Pv: 5000, m: '500 kg', T: 'T = 6 000 N', P: 'P = 5 000 N', a: 'a = 2 m/s²' }],
  'elastica': ['mola', { k: 'k = 200 N/m', x: 'x = 5 cm', F: 'F = 10 N' }],
  'molas-associacao': ['molas', { a: 'série: 50 N/m', b: 'paralelo: 200 N/m', t: 'duas molas de 100 N/m cada' }],
  'atrito-estatico': ['blocoForca', { Fv: 30, fv: 30, Nv: 100, Pv: 100, m: '10 kg', F: 'F = 30 N', f: 'f_e = 30 N', N: 'N', P: 'P', t: 'f_e,máx = 40 N > 30 N: o bloco não se move' }],
  'atrito-cinetico': ['blocoForca', { fv: 10, Nv: 50, Pv: 50, m: '5 kg', f: 'f_c = 10 N', N: 'N = 50 N', P: 'P', t: 'desliza para a direita; μ_c = 0,2' }],
  'curva-sobrelevada': ['curvaInclinada', { ang: 22, N: 'N', P: 'P', Fcp: 'F_cp', th: 'θ ≈ 22°', t: 'R = 100 m, v = 20 m/s: tg θ = v²/(Rg) = 0,4' }],
  'blocos-contato': ['blocos', { A: '2 kg', B: '4 kg', F: 'F = 30 N', FAB: 'F_AB = 20 N', t: 'a = 30/6 = 5 m/s²' }],
  'bloco-mesa': ['mesaPolia', { A: '3 kg', B: '2 kg', T: 'T = 12 N', N: 'N = 30 N', PA: 'P_A = 30 N', PB: 'P_B = 20 N', t: 'mesa lisa · a = 4 m/s²' }],
  'atwood': ['atwood', { m1: '3 kg', m2: '2 kg', T: 'T = 24 N', P1: 'P₁ = 30 N', P2: 'P₂ = 20 N', t: 'a = 2 m/s²: m₁ desce e m₂ sobe' }],
  'elevador': ['elevador', { N: 'N = 840 N', P: 'P = 700 N', a: 'a = 2 m/s²', t: '70 kg: a balança marca 84 kg' }],
  'resultante-centripeta': ['curva', { v: 'v = 20 m/s', F: 'F_at = 4 000 N', R: 'R = 100 m', t: 'carro de 1 000 kg: o atrito é a resultante centrípeta' }],
  'loop': ['loop', { v: 'v_mín = 5 m/s', R: 'R = 2,5 m', t: 'no topo, com velocidade mínima, só o peso faz a curva' }],
  'curva-atrito': ['curva', { v: 'v_máx = 20 m/s', F: 'f_at', R: 'R = 80 m', t: 'μ_e = 0,5 → v_máx = 72 km/h' }],
  // energia
  'trabalho-constante': ['blocoForca', { m: 'caixa', F: 'F = 50 N', ang: 60, th: '60°', d: 'd = 10 m', t: 'τ = F d cos 60° = 250 J' }],
  'trabalho-peso': ['rampa', { h: 'h = 5 m', v: 'τ_P = +100 J', m: '2 kg', t: 'só o desnível conta, não a forma da rampa' }],
  'trabalho-variavel': ['mola', { comp: true, k: 'k = 400 N/m', x: 'x = 10 cm', F: 'F', t: 'τ = kx²/2 = 2 J' }],
  'energia-cinetica': ['carro', { v: 'v = 72 km/h = 20 m/s', lab: '1 000 kg', t: 'E_c = mv²/2 = 2·10⁵ J' }],
  'teorema-ec': ['carro', { v: '20 m/s → 0', F: '−F = 5 000 N', lab: '1 000 kg', d: 'd = 40 m', t: 'τ = ΔE_c ⇒ F = 5 000 N' }],
  'ep-gravitacional': ['trampolim', { h: 'h = 10 m', m: '50 kg', t: 'nível de referência no solo: E_pg = mgh = 5 000 J' }],
  'ep-elastica': ['mola', { comp: true, k: 'k = 200 N/m', x: 'x = 20 cm', t: 'E_pel = kx²/2 = 4 J' }],
  'conservacao-em': ['rampa', { h: 'h = 5 m', v: 'v = 10 m/s', pessoa: true, t: 'sem atrito: mgh = mv²/2' }],
  'em-dissipativa': ['rampa', { h: 'h = 60,3 m', v: 'v = 30 m/s', pessoa: true, atr: 'atrito dissipa 10 710 J', m: '70 kg', t: 'mgh = mv²/2 + E_dissipada' }],
  'potencia-media': ['guincho', { m: '100 kg', h: 'h = 10 m', t: 'em 20 s: P = mgh/Δt = 500 W' }],
  'potencia-instantanea': ['carro', { v: 'v = 30 m/s', Fm: 'F_motor = 3 000 N', Fr: 'F_res = 3 000 N', t: 'P = F v = 90 kW ≈ 122 cv' }],
  'rendimento': ['sankey', { total: 2000, util: 1500, tot: '2 000 W', utilL: 'útil: 1 500 W', diss: 'dissipada: 500 W', t: 'η = 1 500/2 000 = 75%' }],
  // impulso
  'quantidade-movimento': ['bolaVel', { m: '0,4 kg', v: 'v = 15 m/s', t: 'Q = mv = 6 kg·m/s' }],
  'impulso': ['bolaVel', { m: 'bola', F: 'F = 200 N por 0,05 s', t: 'I = F Δt = 10 N·s' }],
  'teorema-impulso': ['parede', { v1: '20 m/s', v2: '20 m/s', t: '0,5 kg · contato de 0,01 s → ΔQ = 20 N·s, F_m = 2 000 N' }],
  'conservacao-q': ['recuo', { vb: 'v_bala = 400 m/s', vr: 'v_recuo = 2 m/s', mr: 'rifle 4 kg', mb: '20 g', t: 'Q antes = Q depois = 0' }],
  'coef-restituicao': ['quique', { v1: '10 m/s', v2: '6 m/s', t: 'e = 6/10 = 0,6' }],
  'colisao-inelastica': ['colisao', { ma: '2 kg', mb: '1 kg', va: '6 m/s', juntos: true, v: '4 m/s', t: 'E_c cai de 36 J para 24 J' }],
  'colisao-elastica': ['colisao', { ma: '1 kg', mb: '3 kg', va: '4 m/s', vaa: '2 m/s', vbb: '2 m/s', t: 'A volta a 2 m/s; B segue a 2 m/s · Q = 4 e E_c = 8 J' }],
  // gravitação
  'gravitacao-universal': ['massas', { M: '1 t', m: '1 t', d: 'd = 1 m', t: 'F ≈ 6,7·10⁻⁵ N' }],
  'campo-gravitacional': ['altitude', { h: 'h = R', g: 'g = 2,5 m/s²', planeta: 'Terra (raio R)', t: 'a 2R do centro: g = g₀/4' }],
  'ep-universal': ['escape', { v: '', planeta: 'Terra', inf: 'até o infinito ↑', t: '1 kg: ΔE = m g₀ R = 6,4·10⁷ J' }],
  'kepler-1': ['orbita', { a: 74, e: 0.017, peri: 'periélio: 147', af: 'afélio: 152', semi: 'a ≈ 150 milhões de km', t: 'distâncias em milhões de km; órbita quase circular' }],
  'kepler-2': ['orbita', { a: 96, e: 0.5, peri: '1 UA', af: '3 UA', vp: '30 km/s', v: 'v_a = 10', t: 'v_p r_p = v_a r_a → 10 km/s no afélio' }],
  'kepler-3': ['orbita', { circ: true, r: '1,52 UA', v: 'Marte', t: 'T² = 1,52³ ⇒ T ≈ 1,87 ano (anos e UA)' }],
  'velocidade-orbital': ['satelite', { r: 'r ≈ R', v: 'v = 8 km/s', t: 'órbita rasante: v = √(g₀R)' }],
  'velocidade-escape': ['escape', { v: 'v_e ≈ 11,3 km/s', planeta: 'Terra', t: 'v_e = √(2 g₀ R)' }],
  'energia-orbita': ['orbita', { circ: true, r: 'r', r2: '2r', v: '', astro: 'planeta', t: 'ΔE = −GMm/4r − (−GMm/2r) = GMm/4r' }],
  // estática
  'equilibrio-ponto': ['luminaria', { P: 'P = 20 N', T: 'T = 20 N', th: '30°', t: '2 T sen 30° = P' }],
  'lamy': ['luminaria', { P: 'P', T: 'T', th: '30°', ang120: true, t: 'ângulos de 120° entre as forças: T = P = 20 N' }],
  'momento': ['chave', { F: 'F = 20 N', b: 'b = 0,3 m', t: 'M = F b = 6 N·m' }],
  'equilibrio-extenso': ['gangorra', { P1: '300 N', P2: '400 N', b1: '2 m', b2: '1,5 m', x1: 50, x2: 225, t: '300 · 2 = 400 · 1,5' }],
  'centro-gravidade': ['cm', { m1: '2 kg', m2: '3 kg', cm: 'x_CM = 3 m' }],
  'alavanca': ['alavanca', { R: '600 N', F: 'F = 100 N', br: '0,5 m', bp: '3 m', t: 'F · 3 = 600 · 0,5' }],
  'polias': ['polias', { P: '800 N', F: 'F = 100 N', t: '3 polias móveis: F = 800 / 2³; para subir 1 m puxam-se 8 m' }],
  // hidrostática
  'densidade': ['cubo', { m: '540 g', V: 'V = 200 cm³', t: 'd = 2,7 g/cm³ (alumínio)' }],
  'pressao': ['pressao', { F: 'F = 600 N', A: 'A = 0,04 m²', t: 'p = F/A = 15 000 Pa' }],
  'stevin': ['stevin', { h: 'h = 10 m', ponto: 'p = 2·10⁵ Pa', p0: 'p_atm = 10⁵ Pa' }],
  'pascal': ['prensa', { F1: 'F₁ = 200 N', F2: 'carro: 10 000 N', A1: 'A₁', A2: 'A₂ = 50 A₁' }],
  'empuxo': ['empuxo', { m: '2 L', E: 'E = 20 N', P: 'P', t: 'totalmente mergulhado: E = d g V' }],
  'flutuacao': ['iceberg', { sub: '92% submerso', t: 'gelo (0,92 g/cm³) em água doce' }],
  'vasos-comunicantes': ['tuboU', { h1: '10 cm', h2: '8 cm', l1: 'óleo', l2: 'água', t: '0,8 · 10 = 1 · h ⇒ h = 8 cm' }],
  // Termologia
  'conversao-escalas': ['termometros', { v1: '40 °C', v2: '104 °F', v3: '313 K', f1: 64, f2: 64, f3: 64, t: 'a mesma temperatura lida em três escalas' }],
  'variacao-escalas': ['termometros', { v1: 'Δθ = 10 °C', v2: 'Δθ = 18 °F', v3: 'ΔT = 10 K', f1: 50, f2: 50, f3: 50, t: 'variação: Δθ_F = 1,8 Δθ_C e ΔT = Δθ_C' }],
  'escala-arbitraria': ['termometros', { l1: '°C', l2: '°X', l3: '', v1: '50 °C', v2: '35 °X', f1: 54, f2: 54, ref: [[150 - 4, ''], [150 - 104, '']], t: 'gelo: 0 °C = 10 °X · vapor: 100 °C = 60 °X' }],
  'dilatacao-linear': ['barra', { L0: 'L₀ = 10 m', dL: 'ΔL = 3,6 mm', t2: 'depois de +30 °C', t: 'aço: α = 1,2·10⁻⁵ °C⁻¹' }],
  'dilatacao-superficial': ['chapa', { A: 'A₀ = 2 m²', dA: 'ΔA = 4·10⁻³ m²', dt: 'aquecida em 50 °C', t: 'β = 4·10⁻⁵ °C⁻¹ (contorno tracejado exagerado)' }],
  'dilatacao-volumetrica': ['frasco', { liq: 'gasolina', vaza: '+20 L', t: '1 000 L aquecidos em 20 °C: ΔV = 20 L' }],
  'dilatacao-aparente': ['frasco', { liq: '1 L', vaza: '48,7 mL', t: 'transborda a diferença entre as dilatações do líquido e do vidro' }],
  'calor-sensivel': ['aquecimento', { m: '200 g de água', th: '20 → 70 °C', Q: 'Q = 10 000 cal' }],
  'capacidade-termica': ['aquecimento', { m: 'panela 500 g', th: 'c = 0,22 cal/(g·°C)', t: 'capacidade térmica: C = m c = 110 cal/°C' }],
  'equilibrio-termico': ['mistura', { a1: '200 g', a2: '80 °C', b1: '300 g', b2: '20 °C', e: 'θ_e = 44 °C' }],
  'potencia-termica': ['aquecimento', { m: '1 L de água', th: '20 → 100 °C', Q: 'P = 1 000 W', ebulidor: true, t: 'Δt ≈ 334 s ≈ 5,6 min' }],
  'calor-latente': ['gelo', { m: '100 g', Q: 'Q = 8 000 cal', th: '0 °C', t: 'derrete sem mudar de temperatura' }],
  'curva-aquecimento': ['curvaAq', { t: '100 g de gelo a −10 °C até vapor a 100 °C: 72 500 cal' }],
  'fourier': ['paredeCalor', { phi: 'Φ = 4 000 W', L: '4 mm', A: 'vidro de 2 m²', Tq: 'Δθ = 10 °C', Tf: ' ', t: 'k = 0,8 W/(m·K)' }],
  'stefan-boltzmann': ['radiacao', { T: '300 K', area: 'corpo negro de 1 m²', t: 'P = σ A T⁴ ≈ 459 W' }],
  'clapeyron': ['gas', { a: '1 mol', b: '0 °C · 1 atm', c: 'V ≈ 22,4 L' }],
  'lei-geral-gases': ['gas', { a: '2 atm · 10 L · 300 K', b: '→ 12 L · 450 K', c: 'p = 2,5 atm', alto: true }],
  'dalton': ['gas', { a: 'ar a 1 atm: 21% O₂', b: 'p_O₂ = 0,21 atm' }],
  'energia-interna': ['gas', { a: '2 mol de hélio', b: '300 K', c: 'U ≈ 7,5 kJ' }],
  'teoria-cinetica': ['gas', { a: 'O₂ a 300 K', b: 'v_qm ≈ 483 m/s' }],
  'isobarica': ['gas', { a: 'p constante', b: '10 L → 15 L', c: '300 K → 450 K', flame: true, alto: true }],
  'isovolumetrica': ['gas', { a: 'V constante (pneu)', b: '27 °C → 57 °C', c: '2 atm → 2,2 atm', travado: true }],
  'primeira-lei': ['gas', { Q: 'Q = 500 J', W: 'τ = 200 J', a: 'ΔU = Q − τ', b: 'ΔU = 300 J', flame: true, alto: true, t: 'a energia interna aumenta: o gás esquenta' }],
  'casos-primeira-lei': ['gas', { W: 'τ = 300 J', a: 'adiabática: Q = 0', b: 'ΔU = −300 J', alto: true, t: 'expansão adiabática: o gás esfria' }],
  'calores-molares': ['gas', { a: 'gás monoatômico', b: 'C_v ≈ 12,5 J/(mol·K)', c: 'C_p ≈ 20,8 J/(mol·K)', flame: true }],
  'rendimento-maquina': ['maquina', { qq: 1000, qf: 700, qw: 300, Qq: 'Q_q = 1 000 J', Qf: 'Q_f = 700 J', W: 'τ = 300 J', t: 'η = 300/1 000 = 30%' }],
  'refrigerador': ['maquina', { ref: true, qq: 800, qf: 600, qw: 200, Qq: 'Q_q = 800 J', Qf: 'Q_f = 600 J', W: 'τ = 200 J', Tq: 'cozinha', Tf: 'interior', t: 'eficiência e = 600/200 = 3' }],
  'carnot': ['maquina', { qq: 1, qf: 0.5, qw: 0.5, Tq: 'T_q = 600 K', Tf: 'T_f = 300 K', Qq: 'Q_q', Qf: 'Q_f', W: 'τ', t: 'η_máx = 1 − 300/600 = 50%: os 60% são impossíveis' }],
  'entropia': ['gelo', { m: '100 g', Q: 'Q ≈ 33 440 J', th: '273 K', t: 'ΔS = Q/T ≈ 122 J/K' }],
  // Ondulatória
  'mhs-posicao': ['mhs', { v: 'v_máx = 1 m/s', t: 'A = 0,1 m e ω = 10 rad/s · na posição 0: v máxima; a_máx = 10 m/s² nos extremos' }],
  'mhs-velocidade-x': ['mhs', { x: 34, v: 'v = 0,8 m/s', t: 'em x = 0,06 m (A = 0,1 m, ω = 10 rad/s)' }],
  'massa-mola': ['mhs', { m: '0,5 kg', x: 40, t: 'k = 50 N/m → T = 2π√(m/k) ≈ 0,63 s' }],
  'pendulo-simples': ['pendulo', { L: 'L = 2,5 m', T: 'T ≈ 3,1 s', t: 'g = 10 m/s² · oscilações pequenas' }],
  'energia-mhs': ['mhs', { x: 56, t: 'k = 200 N/m e A = 0,1 m → E = kA²/2 = 1 J (no extremo, toda potencial)' }],
  'equacao-fundamental': ['som', { lambda: 'λ = 0,5 m', v: 'v = 340 m/s', f: 'f = 680 Hz' }],
  'periodo-onda': ['onda', { lambda: 'λ', A: 'A', v: 'v', f: '30 cristas em 10 s', t: 'f = 3 Hz · T ≈ 0,33 s' }],
  'equacao-onda': ['onda', { lambda: 'λ = 0,5 m', A: 'A = 0,02 m', v: 'v = 5 m/s', f: 'f = 10 Hz', t: 'y = 0,02 cos(20πt − 4πx)' }],
  'taylor-corda': ['onda', { lambda: 'λ', A: 'A', v: 'v ≈ 126 m/s', f: 'corda: 2 m, 10 g, 80 N', t: 'μ = 0,005 kg/m → v = √(T/μ)' }],
  'som-gases': ['som', { lambda: 'λ', v: '340 → 380 m/s', f: '289 K → 361 K', t: 'v ∝ √T: v = 340·19/17' }],
  'reflexao-pulsos': ['pulso', { t: 'na ponta presa o pulso volta com a fase invertida' }],
  'refracao-ondas': ['refracaoOnda', { l1: 'λ₁ = 1 m', l2: 'λ₂ = 0,75 m', m1: 'fundo: 2 m/s', m2: 'raso: 1,5 m/s', t: 'a frequência não muda: f = 2 Hz' }],
  'interferencia': ['interferencia', { P: 'P', d1: 'd₁ = 3,0 m', d2: 'd₂ = 3,75 m', t: 'Δx = 0,75 m = 1,5λ (λ = 0,5 m): interferência destrutiva' }],
  'young': ['young', { d: 'd = 0,2 mm', D: 'D = 2 m', y: 'Δy = 6 mm', t: 'luz de 600 nm' }],
  'rede-difracao': ['rede', { ang: 14.5, th: 'θ₁ ≈ 14,5°', d: '500 fendas/mm: d = 2 μm', t: 'λ = 500 nm · sen θ₁ = λ/d = 0,25' }],
  'estacionaria-corda': ['cordaEst', { n: 1, L: 'L = 0,65 m', f: 'f₁ = 220 Hz', t: 'v = 286 m/s: f₁ = v/2L (nota lá); f₂ = 440 Hz' }],
  'tubo-aberto': ['tubo', { L: 'L = 0,5 m', t: 'aberto: f₁ = v/2L = 340 Hz' }],
  'tubo-fechado': ['tubo', { fechado: true, L: 'L = 0,5 m', t: 'fechado: f₁ = v/4L = 170 Hz; f₃ = 510 Hz' }],
  'doppler': ['doppler', { v: 'v_f = 20 m/s', fa: '722,5 Hz', fg: '≈ 642 Hz', t: 'sirene de 680 Hz · som a 340 m/s' }],
  'eco': ['eco', { d: 'd = 600 m', tempo: 'eco em 0,8 s', t: 'som na água: 1 500 m/s · d = v t / 2' }],
  'batimento': ['batimento', { Tb: '1/3 s', t: '440 Hz + 443 Hz: o volume oscila 3 vezes por segundo' }],
  'intensidade-sonora': ['fonte', { r: 'r = 10 m', I: 'I = 0,01 W/m²', t: 'P = 4π W espalhada em 4πr²' }],
  'nivel-sonoro': ['fonte', { I: 'I = 0,01 W/m² → β = 100 dB', t: 'β = 10 log(I/10⁻¹²)' }],
  // Óptica
  'camara-escura': ['camara', { p: 'p = 12 m', pp: 'p′ = 20 cm', i: 'i = 10 cm', H: 'árvore de 6 m', t: 'i/o = p′/p ⇒ i = 6 · 0,2/12' }],
  'sombra': ['sombra', { h: '1 m', H: 'H = 30 m', s: '0,8 m', S: '24 m', t: 'raios do Sol paralelos: H/24 = 1/0,8' }],
  'velocidade-luz': ['luz', { d: 'd = 1,5·10¹¹ m', c: 'c = 3·10⁸ m/s', t: 'Δt = d/c = 500 s ≈ 8,3 min' }],
  'leis-reflexao': ['reflexao', { ang: 60, i: 'i = 60°', r: 'r = 60°', sup: '30° com o espelho', t: 'ângulos medidos a partir da normal' }],
  'espelho-plano': ['espelhoPlano', { h: '1,80 m', hm: '0,90 m', t: 'tamanho mínimo: metade da altura, a qualquer distância' }],
  'associacao-espelhos': ['espelhos', { ang: '60°', n: '5 imagens', t: 'N = 360/60 − 1 = 5' }],
  'foco-raio': ['focoEspelho', { f: 'f = 20 cm', t: 'R = 40 cm: raios paralelos refletem passando por F' }],
  'gauss': ['espelhoGauss', { p: 30, pp: 60, ho: 17, o: 'o', i: 'i', pL: 'p = 30 cm', ppL: 'p′ = 60 cm', t: 'f = 20 cm: imagem real, na frente do espelho' }],
  'aumento-linear': ['espelhoGauss', { p: 30, pp: 60, ho: 17, o: 'o = 2 cm', i: 'i = −4 cm', pL: 'p = 30 cm', ppL: 'p′ = 60 cm', t: 'A = −p′/p = −2: invertida e com o dobro do tamanho' }],
  'indice-refracao': ['refracaoSnell', { ang1: 45, ang2: 32, i: 'θ₁', r: 'θ₂', n1: 'vácuo / ar: c', n2: 'água: n = 1,33', v: 'v = c/n ≈ 2,26·10⁸ m/s' }],
  'snell': ['refracaoSnell', { ang1: 45, ang2: 32, i: '45°', r: '32°', n1: 'ar', n2: 'água · n = 1,33', t: 'sen θ₂ = sen 45°/1,33 ≈ 0,53' }],
  'angulo-limite': ['reflexaoTotal', { L: 'L ≈ 49°', t: 'sen L = 1/1,33 ≈ 0,75' }],
  'dioptro-plano': ['dioptro', { p: '2 m', pp: '1,5 m', t: 'a piscina parece mais rasa: p′ = 2/1,33 (ângulos exagerados)' }],
  'lamina-paralela': ['lamina', { e: 'e = 3 cm', d: 'd ≈ 1,7 cm', i: '60°', r: '30°', t: 'd = e · sen(i − r)/cos r' }],
  'prisma': ['prisma', { A: 'A = 60°', n: 'n ≈ 1,73', t: 'desvio mínimo de 60°: o raio interno fica paralelo à base' }],
  'microscopio': ['microscopio', { a: 'objetiva 40×', b: 'ocular 10×', t: 'aumento total: 40 × 10 = 400×' }],
  'luneta': ['luneta', { a: 'objetiva: f = 1 m', b: 'ocular: f = 2 cm', t: 'G = f_ob / f_oc = 50 · tubo de 1,02 m' }],
  'miopia': ['olho', { ponto: 'míope: ponto remoto a 50 cm', t: 'lente divergente de f = −0,5 m: V = −2 di' }],
  'hipermetropia': ['olho', { hiper: true, ponto: 'hipermétrope: ponto próximo a 1 m', t: 'lente convergente: V = 4 − 1 = +3 di' }],
  // Eletricidade
  'carga-quantizada': ['eletrons', { Q: 'Q = −3,2 μC', t: 'n = Q/e = 2·10¹³ elétrons em excesso' }],
  'coulomb': ['cargas', { q1: '2 μC', q2: '2 μC', d: 'd = 30 cm', t: 'cargas de mesmo sinal se repelem: F = 0,4 N' }],
  'campo-eletrico': ['campo', { Q: 'Q = 1 nC', d: 'd = 3 cm', E: 'E = 10⁴ N/C', t: 'E aponta para longe da carga positiva' }],
  'campo-uniforme': ['placas', { d: 'd = 2 mm', U: 'U = 100 V', part: 'e', Fp: 'F', t: 'E = U/d = 5·10⁴ V/m; o elétron é puxado para a placa +' }],
  'potencial-eletrico': ['campo', { Q: 'Q = +3 μC', d: 'd = 0,9 m', V: 'V = 3·10⁴ V', equi: true, t: 'equipotencial (tracejada): mesmo V em toda a circunferência' }],
  'energia-potencial-eletrica': ['campo', { Q: 'Q', d: '', V: 'V = 1 000 V', equi: true, t: 'próton em P: E_p = qV = 1,6·10⁻¹⁶ J' }],
  'trabalho-eletrico': ['placas', { U: 'U = 1 000 V', part: 'e', Fp: 'F', t: 'acelerado do repouso: E_c = 1 000 eV = 1,6·10⁻¹⁶ J' }],
  'condutor-esferico': ['esfera', { R: 'R = 10 cm', Q: 'Q = 2 nC', V: 'V = 180 V', t: 'cargas na superfície; o potencial do centro também é 180 V' }],
  'contato-esferas': ['contato', { a: '+8 μC', b: '−2 μC', r: '+3 μC', t: 'esferas iguais dividem a carga total: (8 − 2)/2' }],
  'ohm-2': ['fio', { L: 'L = 100 m', A: 'A = 2 mm²', rho: 'cobre', t: 'R = ρL/A = 0,85 Ω' }],
  'resistores-serie': ['serie', { R: ['2 Ω', '3 Ω', '5 Ω'], U: '20 V', i: 'i = 2 A', t: 'R_eq = 10 Ω · no resistor de 5 Ω, U = 10 V' }],
  'resistores-paralelo': ['paralelo', { R: ['6 Ω', '3 Ω'], U: 'U', Req: 'R_eq = 6·3/(6 + 3) = 2 Ω' }],
  'potencia-eletrica': ['chuveiro', { P: 'P = 5 500 W', U: 'U = 220 V', extra: 'i = 25 A · R = 8,8 Ω' }],
  'energia-eletrica': ['chuveiro', { P: '5,5 kW · 20 min por dia', U: '220 V', extra: 'em 30 dias: 55 kWh', t: 'a R$ 0,80 o kWh: R$ 44' }],
  'kirchhoff': ['no', { i1: '3 A', i2: '2 A', i3: 'i = 5 A', t: 'o que chega ao nó é igual ao que sai' }],
  'wheatstone': ['ponte', { R1: 'R₁ = 10 Ω', R2: 'R₂ = 20 Ω', R3: 'R₃ = 30 Ω', R4: 'R₄ = 15 Ω', t: 'equilíbrio (G não acusa corrente): R₁R₃ = R₂R₄' }],
  'capacitancia': ['capacitor', { U: '12 V', C: 'C = 100 μF', Q: 'Q = 1,2 mC' }],
  'capacitor-plano': ['placas', { d: 'd = 1 mm', U: 'A = 0,01 m²', t: 'no ar: C = ε₀A/d ≈ 89 pF' }],
  'capacitores-associacao': ['capAssoc', { a: '3 μF', b: '12 μF', c1: 'dois capacitores de 6 μF' }],
  'energia-capacitor': ['capacitor', { U: '2 000 V', C: 'C = 100 μF', Q: 'E = CU²/2 = 200 J', t: 'desfibrilador' }],
  // Eletromagnetismo
  'campo-fio': ['fioCampo', { i: 'i = 20 A', B: 'B = 4·10⁻⁵ T', d: 'd = 10 cm', t: 'linhas de B em circunferências: regra da mão direita' }],
  'campo-espira': ['espira', { i: 'i = 5 A', R: 'R = 2π cm', B: 'B = 5·10⁻⁵ T' }],
  'campo-solenoide': ['solenoide', { N: '1 000 espiras · i = 2 A', L: 'L = 0,5 m', B: 'B ≈ 5 mT', t: 'campo uniforme no interior, ao longo do eixo' }],
  'ampere': ['fioGrosso', { t: 'só conta a corrente dentro da curva: B = μ₀ i r / (2π a²)' }],
  'raio-ciclotron': ['particulaB', { neg: true, v: '10⁷ m/s', F: 'F', R: 'R ≈ 5,7 cm', t: 'elétron em B = 10⁻³ T: a força aponta para o centro' }],
  'seletor-velocidades': ['seletor', { E: 'E = 3·10⁴ V/m · B = 0,01 T', v: 'v = E/B = 3·10⁶ m/s', t: 'passa sem desviar quando qE = qvB' }],
  'forca-condutor': ['fioB', { F: 'F = 0,4 N', i: 'i = 5 A saindo · L = 0,2 m · B = 0,4 T' }],
  'fios-paralelos': ['fiosParalelos', { i1: '1 A', i2: '1 A', d: 'd = 1 m', t: 'correntes no mesmo sentido se atraem: F/L = 2·10⁻⁷ N/m' }],
  'fluxo-magnetico': ['fluxo', { B: 'B = 0,5 T', A: 'A = 0,02 m²', t: 'Φ = B A cos 0° = 0,01 Wb' }],
  'faraday': ['ima', { afasta: true, i: 'ε = 10 V', t: '100 espiras · o fluxo cai de 0,01 Wb a zero em 0,1 s' }],
  'lenz': ['ima', { ind: true, i: 'i induzida', t: 'vista do ímã, a corrente circula no sentido anti-horário' }],
  'fem-movimento': ['trilho', { R: 'R = 2 Ω', v: 'v = 4 m/s', L: 'L = 0,5 m', B: '0,2 T', t: 'ε = BLv = 0,4 V · i = 0,2 A' }],
  'gerador-ca': ['geradorCA', { t: 'U_ef = 127 V → U_máx = 127√2 ≈ 180 V · 60 Hz' }],
  'transformador': ['transformador', { Up: 'U_p = 220 V', Us: 'U_s = 11 V', Np: 'N_p = 2 000', Ns: 'N_s = 100' }],
  // Física moderna
  'lorentz': ['nave', { v: 'v = 0,8c', g: 'γ = 1/√(1 − 0,64) ≈ 1,67' }],
  'dilatacao-tempo': ['nave', { v: 'v = 0,8c', relogio: true, g: '1 ano a bordo = 1,67 ano na Terra' }],
  'contracao-espaco': ['nave', { v: 'v = 0,6c', L0: 'L₀ = 100 m', L: 'L = 80 m', t: 'contração só na direção do movimento: γ = 1,25' }],
  'composicao-relativistica': ['nave', { v: '0,5c', proj: '0,5c em relação à nave', g: 'em relação à Terra: 0,8c (e não c)' }],
  'emc2': ['emc2', { m: '1 g', E: 'E = mc² = 9·10¹³ J' }],
  'energia-relativistica': ['nave', { v: 'elétron a 0,6c', g: 'E = γ mc² ≈ 0,64 MeV · E_c ≈ 0,13 MeV', t: 'mc² = 0,511 MeV' }],
  'foton': ['foton', { E: 'E ≈ 2,5 eV ≈ 4·10⁻¹⁹ J', l: 'λ = 500 nm', t: 'luz verde (escala do desenho ilustrativa)' }],
  'fotoeletrico': ['fotoeletrico', { hf: '400 nm · hf = 3,10 eV', K: 'K_máx = 0,82 eV', m: 'sódio', phi: 'φ = 2,28 eV', t: 'tensão de corte de 0,82 V' }],
  'de-broglie': ['ondaMateria', { v: '10⁶ m/s', l: 'λ ≈ 0,73 nm', t: 'elétron: λ = h/(mv), da ordem do tamanho de um átomo' }],
  'heisenberg': ['ondaMateria', { dx: 'Δx = 10⁻¹⁰ m', t: 'Δp ≥ h/(4πΔx) ≈ 5,3·10⁻²⁵ kg·m/s' }],
  'bohr-energia': ['niveis', { destaque: 2, lab: 'E₂ = −13,6/4 = −3,4 eV' }],
  'transicao': ['niveis', { de: 3, para: 2, f: 'λ ≈ 656 nm', lab: 'ΔE ≈ 1,89 eV', t: 'n = 3 → n = 2: fóton vermelho' }],
  'decaimentos': ['decaimento', { a: 'α', X: 'U-238', Y: 'Th-234', t: '²³⁸₉₂U → ²³⁴₉₀Th + ⁴₂α' }],
  'meia-vida': ['meiaVida', { k: 2, lab: '25%: 2T', t: 'carbono-14: t = 2 · 5 730 = 11 460 anos' }],
  'decaimento-exponencial': ['meiaVida', { k: 3, lab: '1/8 em 3T', t: 'iodo-131 (T = 8 dias): restam 12,5%' }],
  'energia-ligacao': ['decaimento', { he: true, X: 'He-4: defeito de massa 0,0304 u', Y: 'E_L ≈ 28,3 MeV', t: 'cerca de 7 MeV por núcleon' }],
  'fissao-fusao': ['fissao', { a: 'U-235', E: '≈ 200 MeV por fissão', t: '1 kg de U-235 ≈ 8·10¹³ J' }],
  'usina-nuclear': ['usina', { P: '1 GW elétricos (rendimento 1/3)', t: '≈ 9·10¹⁹ fissões por segundo' }],
  // Astronomia
  'kepler-ua': ['orbita', { circ: true, r: '5,2 UA', v: 'Júpiter', t: 'T² = 5,2³ ⇒ T ≈ 11,9 anos' }],
  'massa-astro': ['orbita', { circ: true, r: '1,5·10¹¹ m', v: 'Terra', t: 'T = 1 ano → M_Sol ≈ 2·10³⁰ kg' }],
  'geoestacionario': ['satelite', { r: 'r ≈ 42 000 km', v: 'T = 1 dia', t: 'altitude de cerca de 36 000 km (fora de escala)' }],
  'constante-solar': ['fonte', { sol: true, planeta: true, r: 'd = 1,5·10¹¹ m', P: 'Terra', I: 'I ≈ 1 360 W/m²', t: 'em Marte (1,52 UA): cerca de 590 W/m²' }],
  'densidade-planeta': ['planeta', { R: '6,4·10⁶ m', g: 'g₀ = 10 m/s²', d: 'd ≈ 5,6 g/cm³' }],
  'velocidade-orbital-media': ['orbita', { circ: true, r: '1 UA', v: 'v ≈ 30 km/s', t: 'v = 2π · 1 UA / 1 ano' }],
  'periodo-sinodico': ['sinodico', { a: 'Terra', b: 'Marte', t: '1/S = 1 − 1/1,88 → S ≈ 2,1 anos (≈ 780 dias)' }],
  'schwarzschild': ['buracoNegro', { R: 'R_S ≈ 3 km (massa do Sol)' }],
  'wien': ['espectro', { l: 'λ_máx = 500 nm', T: 'T ≈ 5 800 K', t: 'λ_máx T = 2,9·10⁻³ m·K' }],
  'luminosidade': ['estrela', { R: 'R = 7·10⁸ m', T: 'T = 5 800 K', L: 'L ≈ 4·10²⁶ W', t: 'L = 4πR² σT⁴' }],
  'redshift': ['galaxia', { v: 'v ≈ 3 000 km/s (afastando)', t: 'z = 6,6/656,3 ≈ 0,01' }],
  'hubble': ['hubble', { t: 'd = 7 000/70 = 100 Mpc ≈ 330 milhões de anos-luz' }],
  'unidades-astronomicas': ['escala', { ly: '1 ano-luz ≈ 63 000 UA', t: 'a barra do ano-luz deveria ter 63 000 vezes a da UA' }],
  'paralaxe': ['paralaxe', { p: 'p = 0,77″', e: 'Próxima Centauri', t: 'd = 1/p ≈ 1,3 pc ≈ 4,2 anos-luz' }],
  'magnitude': ['magnitude', { r: '5 magnitudes = brilho 100 vezes menor', t: '−5 = −2,5 log(F₁/F₂) ⇒ F₁/F₂ = 100' }],
};

const render = (nome, p) => { const r = D[nome](p || {}); return typeof r === 'string' ? r : r.svg(); };
window.ILUSTRACAO = id => {
  try {
    if (Object.hasOwn(O, id)) return O[id]();
    const m = MAPA[id]; if (!m || !D[m[0]]) return '';
    return render(m[0], m[1]);
  } catch (e) { if (window.console) console.error('ilustração ' + id, e); return ''; }
};
window.ILUSTRACOES = { desenhos: D, sobMedida: O, mapa: MAPA, render }; // usado nos testes
})();

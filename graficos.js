// Gráficos e áreas: cada gráfico é uma linha poligonal; a área entre ela e o eixo horizontal
// é calculada por trapézios (separando as partes acima e abaixo do eixo) e sombreada no canvas.
(function () {
  const fmt = (n, d = 1) => n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }).replace("-", "−");
  const par = (n, d = 1) => n < 0 ? `(${fmt(n, d)})` : fmt(n, d); // negativos entre parênteses dentro das contas
  const $ = id => document.getElementById(id);
  const val = id => +$(id).value;
  const mono = px => `${px}px 'JetBrains Mono', monospace`;
  const C = {};
  function readColors() {
    const s = getComputedStyle(document.documentElement);
    ["grid", "ink", "ink-soft", "accent", "accent-ink", "blue", "card"].forEach(k => C[k] = s.getPropertyValue("--" + k).trim());
  }
  readColors();
  function niceStep(span, n) {
    const raw = span / n, p = 10 ** Math.floor(Math.log10(raw)), m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }
  const sci = n => { const e = Math.floor(Math.log10(Math.abs(n))); return `${fmt(n / 10 ** e, 2)} × 10${String(e).replace(/-/g, "⁻").replace(/\d/g, d => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d])}`; };

  // Divide cada trecho no ponto em que cruza o eixo e devolve os pedaços com a área de cada um
  function pieces(pts) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
      if (x2 === x1) continue;
      if (y1 * y2 < 0) {
        const x0 = x1 + (x2 - x1) * y1 / (y1 - y2);
        out.push([[x1, y1], [x0, 0]], [[x0, 0], [x2, y2]]);
      } else out.push([[x1, y1], [x2, y2]]);
    }
    return out.map(([a, b]) => ({ a, b, area: (a[1] + b[1]) / 2 * (b[0] - a[0]) }));
  }
  function areaParts(pts) {
    let pos = 0, neg = 0;
    pieces(pts).forEach(p => { if (p.area >= 0) pos += p.area; else neg -= p.area; });
    return { pos, neg, net: pos - neg };
  }

  // o: { pts, xl, yl, sym, fill? (cor fixa para a área), arrow? (seta no sentido do trecho), from0? (eixo x começa no 0) }
  function plot(cv, o) {
    const c = cv.getContext("2d"), W = cv.width, H = cv.height;
    const padL = 78, padR = 26, padT = 34, padB = 58;
    const xs = o.pts.map(p => p[0]), ys = o.pts.map(p => p[1]);
    const xmax = Math.max(...xs) * 1.12 || 1, ymaxRaw = Math.max(0, ...ys), yminRaw = Math.min(0, ...ys);
    const span = (ymaxRaw - yminRaw) || 1, ymax = ymaxRaw + span * 0.18, ymin = yminRaw < 0 ? yminRaw - span * 0.12 : 0;
    const X = x => padL + x / xmax * (W - padL - padR), Y = y => padT + (ymax - y) / (ymax - ymin) * (H - padT - padB);
    c.fillStyle = C.card; c.fillRect(0, 0, W, H);
    // grade e marcações
    c.font = mono(16); c.lineWidth = 1;
    const sx = niceStep(xmax, 6), sy = niceStep(ymax - ymin, 5);
    c.textAlign = "center"; c.textBaseline = "top";
    for (let x = sx; x < xmax; x += sx) { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(X(x), padT); c.lineTo(X(x), H - padB); c.stroke(); c.fillStyle = C["ink-soft"]; c.fillText(fmt(x, sx < 1 ? (sx < 0.1 ? 2 : 1) : 0), X(x), H - padB + 8); }
    c.textAlign = "right"; c.textBaseline = "middle";
    for (let y = Math.ceil(ymin / sy) * sy; y <= ymax; y += sy) {
      if (Math.abs(y) < 1e-9) continue;
      c.strokeStyle = C.grid; c.beginPath(); c.moveTo(padL, Y(y)); c.lineTo(W - padR, Y(y)); c.stroke();
      c.fillStyle = C["ink-soft"]; c.fillText(fmt(y, sy < 1 ? (sy < 0.1 ? 2 : 1) : 0), padL - 10, Y(y));
    }
    c.fillText("0", padL - 10, Y(0));
    // área sombreada
    pieces(o.pts).forEach(p => {
      c.fillStyle = o.fill || (p.area >= 0 ? C.accent : C.blue); c.globalAlpha = 0.32;
      c.beginPath(); c.moveTo(X(p.a[0]), Y(0)); c.lineTo(X(p.a[0]), Y(p.a[1])); c.lineTo(X(p.b[0]), Y(p.b[1])); c.lineTo(X(p.b[0]), Y(0)); c.closePath(); c.fill();
      c.globalAlpha = 1;
    });
    // eixos
    c.strokeStyle = C.ink; c.lineWidth = 2;
    c.beginPath(); c.moveTo(padL, padT - 10); c.lineTo(padL, H - padB); c.stroke();
    c.beginPath(); c.moveTo(padL, Y(0)); c.lineTo(W - padR + 6, Y(0)); c.stroke();
    c.fillStyle = C.ink; c.font = mono(17);
    c.textAlign = "left"; c.textBaseline = "bottom"; c.fillText(o.yl, padL + 8, padT - 8);
    c.textAlign = "right"; c.textBaseline = "top"; c.fillText(o.xl, W - padR, H - 26);
    // guias tracejadas e a curva
    c.setLineDash([5, 5]); c.strokeStyle = C["ink-soft"]; c.lineWidth = 1.2;
    o.pts.forEach(([x, y]) => { if (x > 0 && Math.abs(y) > 1e-9) { c.beginPath(); c.moveTo(X(x), Y(y)); c.lineTo(X(x), Y(0)); c.stroke(); } });
    c.setLineDash([]);
    c.strokeStyle = o.fill || C.accent; c.lineWidth = 3.5; c.lineJoin = "round"; c.beginPath();
    o.pts.forEach(([x, y], i) => i ? c.lineTo(X(x), Y(y)) : c.moveTo(X(x), Y(y))); c.stroke();
    c.fillStyle = C.ink; o.pts.forEach(([x, y]) => { c.beginPath(); c.arc(X(x), Y(y), 4.5, 0, Math.PI * 2); c.fill(); });
    if (o.arrow) { // seta no meio da curva indicando o sentido da transformação
      const [a, b] = [o.pts[0], o.pts[o.pts.length - 1]], mx = (X(a[0]) + X(b[0])) / 2, my = (Y(a[1]) + Y(b[1])) / 2, ang = Math.atan2(Y(b[1]) - Y(a[1]), X(b[0]) - X(a[0]));
      c.fillStyle = o.fill || C.accent; c.beginPath(); c.moveTo(mx + 14 * Math.cos(ang), my + 14 * Math.sin(ang));
      c.lineTo(mx - 10 * Math.cos(ang - 0.6), my - 10 * Math.sin(ang - 0.6)); c.lineTo(mx - 10 * Math.cos(ang + 0.6), my - 10 * Math.sin(ang + 0.6)); c.fill();
    }
    // símbolo da grandeza dentro de cada região grande o bastante
    c.font = "800 26px 'Bricolage Grotesque', sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
    const regs = []; let cur = null;
    pieces(o.pts).forEach(p => { const s = p.area >= 0; if (!cur || cur.s !== s) { cur = { s, x0: p.a[0], x1: p.b[0], h: Math.abs(p.a[1] + p.b[1]) / 2, area: Math.abs(p.area) }; regs.push(cur); } else { cur.x1 = p.b[0]; cur.h = Math.max(cur.h, Math.abs(p.a[1] + p.b[1]) / 2); cur.area += Math.abs(p.area); } });
    regs.forEach(r => {
      const wpx = X(r.x1) - X(r.x0), hpx = Math.abs(Y(r.h) - Y(0));
      if (wpx < 60 || hpx < 34) return;
      c.fillStyle = C.ink; c.fillText(o.sym, (X(r.x0) + X(r.x1)) / 2, Y(0) + (r.s ? -1 : 1) * hpx * 0.42);
    });
  }

  // Cada gráfico: ids dos controles, função que lê os controles e devolve os pontos e o resultado
  const GRAPHS = [
    { cv: "g-vt", ids: ["vt-v0", "vt-a", "vt-t"], run() {
      const v0 = val("vt-v0"), a = val("vt-a"), t = val("vt-t"), v = v0 + a * t;
      const pts = [[0, v0], [t, v]], A = areaParts(pts);
      const out = { "vt-v0o": fmt(v0, 0) + " m/s", "vt-ao": fmt(a) + " m/s²", "vt-to": fmt(t, 0) + " s" };
      const res = `<span class="big">Δs = ${fmt(A.net)} m</span>
        <span>Área do trapézio: (v₀ + v)/2 · t = (${par(v0, 0)} + ${par(v)})/2 · ${fmt(t, 0)} = ${fmt(A.net)} m</span>` +
        (A.neg > 1e-9 && A.pos > 1e-9 ? `<span>A curva cruza o eixo: o móvel volta. Área acima ${fmt(A.pos)} m, abaixo ${fmt(A.neg)} m. Distância percorrida = ${fmt(A.pos + A.neg)} m.</span>` : "") +
        (A.net < 0 && A.pos < 1e-9 ? "<span>Área abaixo do eixo: deslocamento negativo, no sentido contrário ao da trajetória.</span>" : "");
      return { plot: { pts, xl: "t (s)", yl: "v (m/s)", sym: "Δs" }, out, res };
    } },
    { cv: "g-at", ids: ["at-a1", "at-a2", "at-T"], run() {
      const a1 = val("at-a1"), a2 = val("at-a2"), T = val("at-T"), dv = a1 * T + a2 * T;
      const pts = [[0, a1], [T, a1], [T, a2], [2 * T, a2]];
      return {
        plot: { pts, xl: "t (s)", yl: "a (m/s²)", sym: "Δv" },
        out: { "at-a1o": fmt(a1) + " m/s²", "at-a2o": fmt(a2) + " m/s²", "at-To": fmt(T, 0) + " s" },
        res: `<span class="big">Δv = ${fmt(dv)} m/s</span>
          <span>Dois retângulos: a₁·Δt + a₂·Δt = ${par(a1)}·${fmt(T, 0)} + ${par(a2)}·${fmt(T, 0)} = ${fmt(dv)} m/s</span>
          <span>Partindo do repouso, a velocidade final seria ${fmt(dv)} m/s.</span>`
      };
    } },
    { cv: "g-fd", ids: ["fd-F", "fd-d1", "fd-d2"], run() {
      const F = val("fd-F"), d1 = val("fd-d1"), d2 = val("fd-d2"), W = F * d1 + F * d2 / 2;
      const pts = [[0, F], [d1, F], [d1 + d2, 0]];
      return {
        plot: { pts, xl: "d (m)", yl: "F (N)", sym: "W" },
        out: { "fd-Fo": fmt(F, 0) + " N", "fd-d1o": fmt(d1, 0) + " m", "fd-d2o": fmt(d2, 0) + " m" },
        res: `<span class="big">W = ${fmt(W, 0)} J</span>
          <span>Retângulo + triângulo: F·d₁ + F·d₂/2 = ${fmt(F, 0)}·${fmt(d1, 0)} + ${fmt(F, 0)}·${fmt(d2, 0)}/2 = ${fmt(W, 0)} J</span>
          <span>Força constante enquanto empurra, depois diminui até zero.</span>`
      };
    } },
    { cv: "g-el", ids: ["el-k", "el-x"], run() {
      const k = val("el-k"), x = val("el-x"), F = k * x, E = k * x * x / 2;
      return {
        plot: { pts: [[0, 0], [x, F]], xl: "x (m)", yl: "F (N)", sym: "Eₚ" },
        out: { "el-ko": fmt(k, 0) + " N/m", "el-xo": fmt(x, 2) + " m" },
        res: `<span class="big">E<sub>p</sub> = ${fmt(E, 2)} J</span>
          <span>Triângulo: base · altura / 2 = x · (k·x) / 2 = ${fmt(x, 2)} · ${fmt(F)} / 2 = ${fmt(E, 2)} J</span>
          <span>Por isso E<sub>p</sub> = k·x²/2: dobrar a deformação quadruplica a energia.</span>`
      };
    } },
    { cv: "g-ft", ids: ["ft-F", "ft-dt", "ft-m"], run() {
      const F = val("ft-F"), dtms = val("ft-dt"), m = val("ft-m"), I = F * dtms / 1000 / 2;
      return {
        plot: { pts: [[0, 0], [dtms / 2, F], [dtms, 0]], xl: "t (ms)", yl: "F (N)", sym: "I" },
        out: { "ft-Fo": fmt(F, 0) + " N", "ft-dto": fmt(dtms, 0) + " ms", "ft-mo": fmt(m, 2) + " kg" },
        res: `<span class="big">I = ${fmt(I, 2)} N·s</span>
          <span>Triângulo: F<sub>máx</sub>·Δt/2 = ${fmt(F, 0)} · ${fmt(dtms / 1000, 3)} / 2 = ${fmt(I, 2)} N·s</span>
          <span>Teorema do impulso: I = Δp. Uma bola parada de ${fmt(m, 2)} kg sai a ${fmt(I / m)} m/s.</span>`
      };
    } },
    { cv: "g-it", ids: ["it-i", "it-t1", "it-t2"], run() {
      const i = val("it-i"), t1 = val("it-t1"), t2 = val("it-t2"), Q = i * t1 + i * t2 / 2;
      return {
        plot: { pts: [[0, i], [t1, i], [t1 + t2, 0]], xl: "t (s)", yl: "i (A)", sym: "Q" },
        out: { "it-io": fmt(i) + " A", "it-t1o": fmt(t1, 0) + " s", "it-t2o": fmt(t2, 0) + " s" },
        res: `<span class="big">Q = ${fmt(Q)} C</span>
          <span>Retângulo + triângulo: i·t₁ + i·t₂/2 = ${fmt(i)}·${fmt(t1, 0)} + ${fmt(i)}·${fmt(t2, 0)}/2 = ${fmt(Q)} C</span>` +
          (Q > 0 ? `<span>Isso equivale a n = Q/e = ${sci(Q / 1.602e-19)} elétrons.</span>` : "")
      };
    } },
    { cv: "g-pv", ids: ["pv-p1", "pv-p2", "pv-V1", "pv-V2"], run() {
      const p1 = val("pv-p1"), p2 = val("pv-p2"), V1 = val("pv-V1"), V2 = val("pv-V2"), W = (p1 + p2) / 2 * (V2 - V1);
      const exp = V2 > V1, iso = p1 === p2;
      return {
        plot: { pts: [[V1, p1], [V2, p2]], xl: "V (L)", yl: "p (kPa)", sym: "W", fill: V2 === V1 ? undefined : exp ? C.accent : C.blue, arrow: V2 !== V1 },
        out: { "pv-p1o": fmt(p1, 0) + " kPa", "pv-p2o": fmt(p2, 0) + " kPa", "pv-V1o": fmt(V1, 0) + " L", "pv-V2o": fmt(V2, 0) + " L" },
        res: `<span class="big">W = ${fmt(W, 0)} J</span>
          <span>${iso ? `Isobárica, um retângulo: p·ΔV = ${fmt(p1, 0)} kPa · (${fmt(V2, 0)} − ${fmt(V1, 0)}) L` : `Trapézio: (p₁ + p₂)/2 · ΔV = (${fmt(p1, 0)} + ${fmt(p2, 0)})/2 kPa · (${fmt(V2, 0)} − ${fmt(V1, 0)}) L`} = ${fmt(W, 0)} J (1 kPa·L = 1 J)</span>
          <span>${V2 === V1 ? "Sem variação de volume (isocórica): não há área e o trabalho é zero." : exp ? "Expansão: o gás realiza trabalho sobre o ambiente (W > 0)." : "Compressão: o ambiente realiza trabalho sobre o gás (W < 0)."}</span>`
      };
    } },
    { cv: "g-pt", ids: ["pt-P", "pt-t"], run() {
      const P = val("pt-P"), tm = val("pt-t"), E = P * tm * 60, kwh = P / 1000 * tm / 60;
      return {
        plot: { pts: [[0, P], [tm, P]], xl: "t (min)", yl: "P (W)", sym: "E" },
        out: { "pt-Po": fmt(P, 0) + " W", "pt-to": fmt(tm, 0) + " min" },
        res: `<span class="big">E = ${fmt(E / 1000, 0)} kJ = ${fmt(kwh, 3)} kWh</span>
          <span>Retângulo: P·Δt = ${fmt(P, 0)} W · ${fmt(tm * 60, 0)} s = ${fmt(E, 0)} J</span>
          <span>Na conta de luz, a R$ 0,80 por kWh, isso custa R$ ${fmt(kwh * 0.8, 2)}. Todo dia durante um mês: R$ ${fmt(kwh * 0.8 * 30, 2)}.</span>`
      };
    } }
  ];

  const draws = [];
  GRAPHS.forEach(g => {
    const cv = $(g.cv);
    if (!cv) return;
    const resEl = $(g.cv + "-res");
    const draw = () => {
      const r = g.run();
      Object.entries(r.out).forEach(([id, s]) => { $(id).textContent = s; });
      resEl.innerHTML = r.res;
      plot(cv, r.plot);
    };
    g.ids.forEach(id => $(id).addEventListener("input", draw));
    draw(); draws.push(draw);
  });
  if (document.fonts) document.fonts.ready.then(() => { readColors(); draws.forEach(f => f()); });
})();

// Simulador de vetores do ensino médio: soma, subtração, variação e decomposição.
// Os vetores saem da origem e são arrastados pela ponta ou editados na tabela
// (componentes ou módulo e ângulo); as cópias tracejadas mostram as regras gráficas.
(function () {
  const $ = id => document.getElementById(id);
  const fmt = (n, d = 2) => !isFinite(n) ? "—" : (Math.abs(n) < 0.5 * 10 ** -d ? 0 : n).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: d }).replace("-", "−");
  const par = (n, d = 2) => n < 0 ? `(${fmt(n, d)})` : fmt(n, d);   // negativos entre parênteses dentro das contas
  const pair = (x, y) => `(${fmt(x)} ; ${fmt(y)})`;
  const deg = r => ((r * 180 / Math.PI) % 360 + 360) % 360;
  const rad = d => d * Math.PI / 180;
  const mod = v => Math.hypot(v.x, v.y);
  const ang = v => deg(Math.atan2(v.y, v.x));
  const mono = (px, w = 400) => `${w} ${px}px 'JetBrains Mono', monospace`;
  const C = {};
  const css = getComputedStyle(document.documentElement);
  ["grid", "ink", "ink-soft", "accent", "accent-ink", "blue", "ok", "card"].forEach(k => C[k] = css.getPropertyValue("--" + k).trim());
  const COL = { A: C.accent, B: C.blue, C: "#c7a6ec" };

  const cv = $("v-cv"), c = cv.getContext("2d");
  let W = 900, H = 700;
  // o canvas acompanha o tamanho na tela, para os textos ficarem legíveis também no celular
  function resize() {
    const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    if (!r.width) return;
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const V = { A: { x: 4, y: 1 }, B: { x: 1, y: 3 }, C: { x: -2, y: 1.5 } };
  const st = { mode: "soma", hover: null };

  const L = () => +$("zoom").value;
  const s = () => W / (2 * L());
  const X = x => W / 2 + x * s(), Y = y => H / 2 - y * s();
  const wx = px => (px - W / 2) / s(), wy = py => (H / 2 - py) / s();
  const snap = n => { const k = +$("snap").value; return +(Math.round(n / k) * k).toFixed(2); };

  const name = k => st.mode === "var" ? { A: "v₁", B: "v₂" }[k] : k;
  const visible = () => st.mode === "dec" ? ["A"] : st.mode === "soma" && $("useC").checked ? ["A", "B", "C"] : ["A", "B"];

  // ---------- desenho ----------
  function arrow(x1, y1, x2, y2, col, w = 3, dashed = false, hd = 14) {
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    if (len < 1) return;
    const h = Math.min(hd, len * 0.45), ux = dx / len, uy = dy / len;
    c.save();
    c.strokeStyle = c.fillStyle = col; c.lineWidth = w; c.lineCap = "round";
    if (dashed) c.setLineDash([8, 7]);
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2 - ux * h * 0.8, y2 - uy * h * 0.8); c.stroke();
    c.setLineDash([]);
    c.beginPath(); c.moveTo(x2, y2);
    c.lineTo(x2 - ux * h - uy * h * 0.42, y2 - uy * h + ux * h * 0.42);
    c.lineTo(x2 - ux * h + uy * h * 0.42, y2 - uy * h - ux * h * 0.42);
    c.closePath(); c.fill();
    c.restore();
  }
  // seta de vetor (origem, ponta) em coordenadas do plano
  const warrow = (a, b, col, w, dashed) => arrow(X(a.x), Y(a.y), X(b.x), Y(b.y), col, w, dashed);
  function line(a, b, col, w = 1.5, dash = [5, 5]) {
    c.save(); c.setLineDash(dash); c.strokeStyle = col; c.lineWidth = w;
    c.beginPath(); c.moveTo(X(a.x), Y(a.y)); c.lineTo(X(b.x), Y(b.y)); c.stroke(); c.restore();
  }
  // nome com a setinha por cima (a fonte não tem o caractere combinante), ao lado do meio do vetor
  function vname(txt, a, b, col, side = 1) {
    const dx = X(b.x) - X(a.x), dy = Y(b.y) - Y(a.y), l = Math.hypot(dx, dy);
    if (l < 8) return;
    const px = (X(a.x) + X(b.x)) / 2 + side * (-dy / l) * 24, py = (Y(a.y) + Y(b.y)) / 2 + side * (dx / l) * 24;
    c.font = mono(17, 600); c.textAlign = "center"; c.textBaseline = "middle";
    const w = c.measureText(txt).width;
    c.fillStyle = C.card; c.globalAlpha = .75; c.fillRect(px - w / 2 - 4, py - 22, w + 8, 34); c.globalAlpha = 1;
    c.fillStyle = col; c.fillText(txt, px, py);
    arrow(px - w / 2, py - 15, px + w / 2 + 3, py - 15, col, 1.6, false, 6);
  }
  function coordTag(v, col) {
    if (!$("coords").checked) return;
    const t = pair(v.x, v.y);
    c.font = mono(12); c.textAlign = v.x >= 0 ? "left" : "right"; c.textBaseline = "middle";
    const ox = v.x >= 0 ? 14 : -14, oy = v.y >= 0 ? -16 : 16, w = c.measureText(t).width;
    const x0 = X(v.x) + ox, y0 = Y(v.y) + oy;
    c.fillStyle = C.card; c.globalAlpha = .8; c.fillRect(v.x >= 0 ? x0 - 3 : x0 - w - 3, y0 - 10, w + 6, 20); c.globalAlpha = 1;
    c.fillStyle = col; c.fillText(t, x0, y0);
  }
  function dot(v, col, r = 7) {
    c.beginPath(); c.arc(X(v.x), Y(v.y), r, 0, 2 * Math.PI); c.fillStyle = col; c.fill();
    c.lineWidth = 2.5; c.strokeStyle = C.card; c.stroke();
  }
  // arco do menor ângulo entre duas direções (em graus) com rótulo
  function angArc(a1, a2, r, col, label) {
    let d = ((a2 - a1) % 360 + 360) % 360;
    if (d > 180) [a1, d] = [a2, 360 - d];
    c.beginPath(); c.arc(X(0), Y(0), r, -rad(a1), -rad(a1 + d), true);
    c.strokeStyle = col; c.lineWidth = 1.8; c.stroke();
    const m = rad(a1 + d / 2);
    c.font = mono(13, 600); c.fillStyle = col; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(label, X(0) + (r + 16) * Math.cos(m), Y(0) - (r + 16) * Math.sin(m));
  }
  function grid() {
    c.fillStyle = C.card; c.fillRect(0, 0, W, H);
    const Lx = L(), Ly = H / (2 * s()), major = Lx > 10 ? 2 : 1;
    const lines = (step, alpha) => {
      c.strokeStyle = C.grid; c.globalAlpha = alpha; c.lineWidth = 1; c.beginPath();
      for (let x = Math.ceil(-Lx / step) * step; x <= Lx; x += step) { c.moveTo(Math.round(X(x)) + .5, 0); c.lineTo(Math.round(X(x)) + .5, H); }
      for (let y = Math.ceil(-Ly / step) * step; y <= Ly; y += step) { c.moveTo(0, Math.round(Y(y)) + .5); c.lineTo(W, Math.round(Y(y)) + .5); }
      c.stroke(); c.globalAlpha = 1;
    };
    if (Lx <= 8) lines(0.5, .35);
    lines(major, 1);
    c.strokeStyle = C["ink-soft"]; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(0, Y(0)); c.lineTo(W, Y(0)); c.moveTo(X(0), 0); c.lineTo(X(0), H); c.stroke();
    c.font = mono(11); c.fillStyle = C["ink-soft"];
    c.textAlign = "center"; c.textBaseline = "top";
    for (let x = Math.ceil(-Lx / major) * major; x < Lx; x += major) if (x) c.fillText(fmt(x), X(x), Y(0) + 5);
    c.textAlign = "right"; c.textBaseline = "middle";
    for (let y = Math.ceil(-Ly / major) * major; y < Ly; y += major) if (y) c.fillText(fmt(y), X(0) - 6, Y(y));
    c.font = mono(14, 600); c.textAlign = "right"; c.textBaseline = "bottom"; c.fillText("x", W - 8, Y(0) - 4);
    c.textAlign = "left"; c.textBaseline = "top"; c.fillText("y", X(0) + 8, 6);
  }

  // ---------- contas ----------
  const add = (...vs) => ({ x: vs.reduce((t, v) => t + v.x, 0), y: vs.reduce((t, v) => t + v.y, 0) });
  const neg = v => ({ x: -v.x, y: -v.y });
  const O = { x: 0, y: 0 };
  // ângulo entre dois vetores que saem do mesmo ponto (0 a 180°)
  const between = (a, b) => { const m = mod(a) * mod(b); return m ? Math.acos(Math.max(-1, Math.min(1, (a.x * b.x + a.y * b.y) / m))) * 180 / Math.PI : NaN; };

  function cosLaw(sign, nameR) {
    const a = V.A, b = V.B, th = between(a, b), A = mod(a), B = mod(b);
    if (!isFinite(th)) return "";
    const R2 = A * A + B * B + sign * 2 * A * B * Math.cos(rad(th));
    return `<span class="step">Lei dos cossenos (θ = ${fmt(th, 1)}° entre A e B): |${nameR}|² = ${fmt(A)}² + ${fmt(B)}² ${sign > 0 ? "+" : "−"} 2·${fmt(A)}·${fmt(B)}·cos ${fmt(th, 1)}° = ${fmt(R2)} → |${nameR}| = ${fmt(Math.sqrt(Math.max(0, R2)))}</span>`;
  }
  function special(sign) {
    const th = between(V.A, V.B), A = mod(V.A), B = mod(V.B);
    if (!isFinite(th)) return "Um dos vetores é nulo.";
    if (th < 0.5) return sign > 0 ? `Mesmo sentido: os módulos simplesmente se somam, |R| = ${fmt(A)} + ${fmt(B)} = ${fmt(A + B)}. É a maior resultante possível.` : `Mesmo sentido: na diferença os módulos se subtraem, |D| = |${fmt(A)} − ${fmt(B)}| = ${fmt(Math.abs(A - B))}.`;
    if (th > 179.5) return sign > 0 ? `Sentidos opostos: |R| = |${fmt(A)} − ${fmt(B)}| = ${fmt(Math.abs(A - B))}. É a menor resultante possível, e ela aponta no sentido do maior.` : `Sentidos opostos: na diferença os módulos se somam, |D| = ${fmt(A)} + ${fmt(B)} = ${fmt(A + B)}.`;
    if (Math.abs(th - 90) < 0.5) return `Perpendiculares: vale Pitágoras, √(${fmt(A)}² + ${fmt(B)}²) = ${fmt(Math.hypot(A, B))}.`;
    return `O módulo do resultado sempre fica entre ${fmt(Math.abs(A - B))} (sentidos opostos) e ${fmt(A + B)} (mesmo sentido).`;
  }
  // contas componente a componente: R = keys[0] op keys[1] op ...
  function compLines(nameR, keys, op, R) {
    const terms = f => keys.map((k, i) => (i ? ` ${op} ` : "") + par(V[k][f])).join("");
    const names = f => keys.map((k, i) => (i ? ` ${op} ` : "") + name(k) + f).join("");
    return `<span class="step">${nameR}x = ${names("x")} = ${terms("x")} = <span class="hl">${fmt(R.x)}</span></span>
      <span class="step">${nameR}y = ${names("y")} = ${terms("y")} = <span class="hl">${fmt(R.y)}</span></span>
      <span class="step">|${nameR}| = √(${nameR}x² + ${nameR}y²) = √(${par(R.x)}² + ${par(R.y)}²) = <span class="hl">${fmt(mod(R))}</span> · direção: ${fmt(ang(R), 1)}° com o eixo x</span>`;
  }

  // ---------- modos ----------
  function drawSoma(out) {
    const keys = visible(), para = document.querySelector('input[name="met"]:checked').value === "para" && keys.length === 2;
    const R = add(...keys.map(k => V[k]));
    if (para) { warrow(V.A, R, COL.B, 2, true); warrow(V.B, R, COL.A, 2, true); }
    else {
      let p = V.A;
      keys.slice(1).forEach(k => { const q = add(p, V[k]); warrow(p, q, COL[k], 2.2, true); p = q; });
    }
    if (keys.length === 2 && mod(V.A) && mod(V.B)) angArc(ang(V.A), ang(V.B), 34, C["ink-soft"], "θ");
    warrow(O, R, C.ok, 4.5);
    vname("R", O, R, C.ok, -1);
    coordTag(R, C.ok);
    out.push(`<span class="big">R = ${keys.join(" + ")} = ${pair(R.x, R.y)} · |R| = ${fmt(mod(R))}</span>`);
    out.push(compLines("R", keys, "+", R));
    if (keys.length === 2) { out.push(cosLaw(1, "R")); out.push(`<span class="note">${special(1)}</span>`); }
    out.push(`<span class="note">${para ? "Paralelogramo: as cópias tracejadas de A e B fecham a figura, e a resultante é a diagonal que sai da origem." : "Polígono: coloque cada vetor com a origem na ponta do anterior (cópias tracejadas). A resultante liga a origem do primeiro à ponta do último."}</span>`);
  }
  function drawSub(out) {
    const D = add(V.A, neg(V.B));
    warrow(V.A, D, COL.B, 2.2, true);
    vname("−B", V.A, D, COL.B, 1);
    warrow(V.B, V.A, C.ok, 2, true);
    if (mod(V.A) && mod(V.B)) angArc(ang(V.A), ang(V.B), 34, C["ink-soft"], "θ");
    warrow(O, D, C.ok, 4.5);
    vname("D", O, D, C.ok, -1);
    coordTag(D, C.ok);
    out.push(`<span class="big">D = A − B = A + (−B) = ${pair(D.x, D.y)} · |D| = ${fmt(mod(D))}</span>`);
    out.push(compLines("D", ["A", "B"], "−", D));
    out.push(cosLaw(-1, "D"));
    out.push(`<span class="note">${special(-1)} Graficamente, subtrair B é somar o oposto −B (mesmo módulo, sentido contrário). A mesma seta D também liga a ponta de B à ponta de A (tracejado verde).</span>`);
  }
  function drawVar(out) {
    const v1 = V.A, v2 = V.B, dv = add(v2, neg(v1)), dt = Math.max(0.01, +$("dt").value || 1);
    const m1 = mod(v1), m2 = mod(v2), md = mod(dv);
    warrow(v1, v2, C.ok, 4.5);
    vname("Δv", v1, v2, C.ok, 1);
    warrow(O, dv, C.ok, 2, true);
    coordTag(dv, C.ok);
    out.push(`<span class="big">Δv = v₂ − v₁ = ${pair(dv.x, dv.y)} m/s · |Δv| = ${fmt(md)} m/s</span>`);
    out.push(compLines("Δv", ["B", "A"], "−", dv));
    out.push(`<span class="step">Aceleração média: a = Δv / Δt = ${pair(dv.x, dv.y)} / ${fmt(dt)} = <span class="hl">${pair(dv.x / dt, dv.y / dt)} m/s²</span> · |a| = ${fmt(md / dt)} m/s²</span>`);
    out.push(`<span class="step">Variação do módulo (da rapidez): Δ|v| = |v₂| − |v₁| = ${fmt(m2)} − ${fmt(m1)} = <span class="hl">${fmt(m2 - m1)} m/s</span></span>`);
    out.push(`<span class="note">${Math.abs(m2 - m1) < 0.01 && md > 0.01
      ? "O módulo não mudou, mas a direção sim, então |Δv| não é zero. É o que acontece no movimento circular uniforme: há aceleração (centrípeta) mesmo com a velocidade escalar constante."
      : "Cuidado: |Δv| (módulo da variação) não é o mesmo que Δ|v| (variação do módulo)."} Δv liga a ponta de v₁ à ponta de v₂; a cópia tracejada mostra o mesmo vetor saindo da origem. A aceleração média tem sempre a direção e o sentido de Δv.</span>`);
  }
  function drawDec(out) {
    const a = V.A, rot = $("rot").checked, al = rot ? +$("alpha").value : 0;
    const e1 = { x: Math.cos(rad(al)), y: Math.sin(rad(al)) }, e2 = { x: -e1.y, y: e1.x };
    const c1 = a.x * e1.x + a.y * e1.y, c2 = a.x * e2.x + a.y * e2.y;
    const P1 = { x: c1 * e1.x, y: c1 * e1.y }, P2 = { x: c2 * e2.x, y: c2 * e2.y };
    if (rot) {
      const far = 3 * L();
      line({ x: -far * e1.x, y: -far * e1.y }, { x: far * e1.x, y: far * e1.y }, C["accent-ink"], 1.6, [10, 6]);
      line({ x: -far * e2.x, y: -far * e2.y }, { x: far * e2.x, y: far * e2.y }, C["accent-ink"], 1.6, [10, 6]);
      c.font = mono(14, 600); c.fillStyle = C["accent-ink"]; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText("x'", X(0.85 * L() * e1.x), Y(0.85 * L() * e1.y) - 16);
      c.fillText("y'", X(0.55 * L() * e2.x) + 16, Y(0.55 * L() * e2.y));
      angArc(0, al, 76, C["accent-ink"], "α");
    }
    line(a, P1, C["ink-soft"]); line(a, P2, C["ink-soft"]);
    // marca de ângulo reto no pé da componente
    if (Math.abs(c1) > 0.3 && Math.abs(c2) > 0.3) {
      const k = 12 / s(), sx = -Math.sign(c1), sy = Math.sign(c2);
      const p = { x: P1.x + sx * k * e1.x, y: P1.y + sx * k * e1.y };
      const q = { x: p.x + sy * k * e2.x, y: p.y + sy * k * e2.y }, r = { x: P1.x + sy * k * e2.x, y: P1.y + sy * k * e2.y };
      c.strokeStyle = C["ink-soft"]; c.lineWidth = 1.4; c.beginPath();
      c.moveTo(X(p.x), Y(p.y)); c.lineTo(X(q.x), Y(q.y)); c.lineTo(X(r.x), Y(r.y)); c.stroke();
    }
    warrow(O, P1, C.ok, 4); warrow(O, P2, C.blue, 4);
    const nx = rot ? "Ax'" : "Ax", ny = rot ? "Ay'" : "Ay";
    vname(nx, O, P1, C.ok, c2 >= 0 ? -1 : 1);
    vname(ny, O, P2, C.blue, c1 >= 0 ? 1 : -1);
    const th = ((ang(a) - al) % 360 + 360) % 360, m = mod(a);
    if (m) angArc(al, ang(a), 46, C["accent-ink"], "θ");
    out.push(`<span class="big">${nx} = ${fmt(c1)} · ${ny} = ${fmt(c2)}</span>`);
    out.push(`<span class="step">θ = ${fmt(th, 1)}° (medido a partir do eixo ${rot ? "x'" : "x"}, no sentido anti-horário)</span>`);
    out.push(`<span class="step">${nx} = |A|·cos θ = ${fmt(m)}·cos ${fmt(th, 1)}° = ${fmt(m)}·${par(Math.cos(rad(th)), 3)} = <span class="hl">${fmt(c1)}</span></span>`);
    out.push(`<span class="step">${ny} = |A|·sen θ = ${fmt(m)}·sen ${fmt(th, 1)}° = ${fmt(m)}·${par(Math.sin(rad(th)), 3)} = <span class="hl">${fmt(c2)}</span></span>`);
    out.push(`<span class="step">Conferindo: √(${par(c1)}² + ${par(c2)}²) = ${fmt(Math.hypot(c1, c2))} = |A| ✓</span>`);
    out.push(`<span class="note">${rot
      ? `Com os eixos inclinados de α = ${al}°, as componentes passam a ser ao longo da rampa (x') e perpendicular a ela (y'). Para o peso, que é vertical: P·sen α ao longo da rampa e P·cos α contra ela.${Math.abs(a.x) < 1e-9 && a.y < 0 ? ` Aqui: ${fmt(m)}·sen ${al}° = ${fmt(m * Math.sin(rad(al)))} e ${fmt(m)}·cos ${al}° = ${fmt(m * Math.cos(rad(al)))} — os mesmos módulos de cima.` : ""}`
      : "Cada componente é a “sombra” do vetor sobre um eixo, e é negativa quando aponta para o lado negativo do eixo. Trocar um vetor inclinado por suas componentes deixa as somas fáceis: x com x, y com y."}</span>`);
  }

  function draw() {
    grid();
    const out = [];
    ({ soma: drawSoma, sub: drawSub, var: drawVar, dec: drawDec })[st.mode](out);
    // vetores originais por cima de tudo
    for (const k of visible()) {
      const v = V[k];
      warrow(O, v, COL[k], 4);
      vname(name(k), O, v, COL[k], 1);
      coordTag(v, COL[k]);
      dot(v, COL[k]);
    }
    dot(O, C.ink, 4);
    if (st.hover) {
      const t = `x = ${fmt(st.hover[0])} ; y = ${fmt(st.hover[1])}`;
      c.font = mono(12); c.textAlign = "right"; c.textBaseline = "top";
      const w = c.measureText(t).width;
      c.fillStyle = C.card; c.globalAlpha = .85; c.fillRect(W - w - 20, 8, w + 12, 24); c.globalAlpha = 1;
      c.fillStyle = C["ink-soft"]; c.fillText(t, W - 14, 13);
    }
    $("res").innerHTML = out.join("");
  }

  // ---------- tabela de vetores ----------
  function buildRows() {
    $("vrows").innerHTML = `<div class="vrow head"><span></span><span>x</span><span>y</span><span>módulo</span><span>ângulo °</span></div>` +
      visible().map(k => `<div class="vrow" data-k="${k}"><b style="color:${COL[k]}">${name(k)}</b>
        <input type="number" step="any" data-f="x" aria-label="${name(k)}: componente x">
        <input type="number" step="any" data-f="y" aria-label="${name(k)}: componente y">
        <input type="number" step="any" min="0" data-f="m" aria-label="${name(k)}: módulo">
        <input type="number" step="any" data-f="a" aria-label="${name(k)}: ângulo em graus"></div>`).join("");
    syncRows();
  }
  const r2 = n => +n.toFixed(2);
  function syncRows(except) {
    document.querySelectorAll(".vrow[data-k]").forEach(row => {
      const v = V[row.dataset.k], val = { x: r2(v.x), y: r2(v.y), m: r2(mod(v)), a: r2(ang(v)) };
      row.querySelectorAll("input").forEach(inp => { if (inp !== except) inp.value = val[inp.dataset.f]; });
    });
  }
  $("vrows").addEventListener("input", e => {
    const inp = e.target, v = V[inp.closest(".vrow").dataset.k], f = inp.dataset.f, n = parseFloat(inp.value);
    if (!isFinite(n)) return;
    if (f === "x" || f === "y") v[f] = n;
    else {
      const m = f === "m" ? Math.max(0, n) : mod(v), a = f === "a" ? n : ang(v);
      v.x = +(m * Math.cos(rad(a))).toFixed(6); v.y = +(m * Math.sin(rad(a))).toFixed(6);
    }
    syncRows(inp); draw();
  });
  $("vrows").addEventListener("change", () => syncRows());

  // ---------- arrastar as pontas ----------
  const evPos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  let drag = null;
  function pick(p, e) {
    const rmax = e.pointerType === "touch" ? 30 : 16;
    let best = null, bd = rmax;
    for (const k of visible()) { const d = Math.hypot(X(V[k].x) - p[0], Y(V[k].y) - p[1]); if (d < bd) { bd = d; best = k; } }
    return best;
  }
  function moveTo(k, p) {
    const lx = L(), ly = H / (2 * s());
    V[k].x = Math.max(-lx, Math.min(lx, snap(wx(p[0]))));
    V[k].y = Math.max(-ly, Math.min(ly, snap(wy(p[1]))));
  }
  cv.addEventListener("pointerdown", e => {
    const p = evPos(e);
    drag = pick(p, e);
    if (!drag) return;
    cv.setPointerCapture(e.pointerId); cv.style.cursor = "grabbing"; e.preventDefault();
    moveTo(drag, p); syncRows(); draw();
  });
  cv.addEventListener("pointermove", e => {
    const p = evPos(e);
    st.hover = [snap(wx(p[0])), snap(wy(p[1]))];
    if (drag) { moveTo(drag, p); syncRows(); }
    else cv.style.cursor = pick(p, e) ? "grab" : "crosshair";
    draw();
  });
  const stop = () => { drag = null; cv.style.cursor = ""; };
  cv.addEventListener("pointerup", stop); cv.addEventListener("pointercancel", stop);
  cv.addEventListener("pointerleave", () => { if (!drag) { st.hover = null; draw(); } });

  // ---------- controles ----------
  const EX = {
    curva: [{ x: 5, y: 0 }, { x: 0, y: 5 }],
    freada: [{ x: 6, y: 0 }, { x: 2, y: 0 }],
    rebote: [{ x: 5, y: 0 }, { x: -4, y: 0 }],
    lanc: [{ x: 3, y: 4 }, { x: 3, y: -4 }]
  };
  const saved = {};   // cada aba lembra os próprios vetores
  const clone = o => JSON.parse(JSON.stringify(o));
  function setMode(m) {
    saved[st.mode] = clone(V);
    st.mode = m;
    if (saved[m]) Object.keys(V).forEach(k => Object.assign(V[k], saved[m][k]));
    else if (m === "var") { Object.assign(V.A, EX.curva[0]); Object.assign(V.B, EX.curva[1]); }
    else if (m === "dec") Object.assign(V.A, { x: 4, y: 3 });
    document.querySelectorAll(".tabs button").forEach(b => b.setAttribute("aria-selected", b.dataset.mode === m));
    $("opt-soma").hidden = m !== "soma"; $("opt-var").hidden = m !== "var"; $("opt-dec").hidden = m !== "dec";
    buildRows(); draw();
  }
  document.querySelectorAll(".tabs button").forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));
  document.querySelectorAll('input[name="met"]').forEach(r => r.addEventListener("change", draw));
  $("useC").addEventListener("change", () => {
    const on = $("useC").checked;
    if (on) document.querySelector('input[name="met"][value="poli"]').checked = true;
    document.querySelector('input[name="met"][value="para"]').disabled = on;
    buildRows(); draw();
  });
  document.querySelectorAll("[data-ex]").forEach(b => b.addEventListener("click", () => {
    const [a, bb] = EX[b.dataset.ex];
    Object.assign(V.A, a); Object.assign(V.B, bb); syncRows(); draw();
  }));
  $("dt").addEventListener("input", draw);
  $("rot").addEventListener("change", () => { $("alpha-wrap").hidden = !$("rot").checked; draw(); });
  $("alpha").addEventListener("input", () => { $("alpha-o").textContent = $("alpha").value + "°"; draw(); });
  $("ex-rampa").addEventListener("click", () => {
    $("rot").checked = true; $("alpha-wrap").hidden = false; $("alpha").value = 30; $("alpha-o").textContent = "30°";
    Object.assign(V.A, { x: 0, y: -5 }); syncRows(); draw();
  });
  ["snap", "zoom", "coords"].forEach(id => $(id).addEventListener("change", draw));

  new ResizeObserver(() => { resize(); draw(); }).observe(cv);
  buildRows(); resize(); draw();
})();

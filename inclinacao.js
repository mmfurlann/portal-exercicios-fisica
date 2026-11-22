// Gráfico-modelo s × t: secante entre A e B, tangente em A e derivada.
// Todas as inclinações saem dos valores dos eixos (metros e segundos), nunca do ângulo na tela:
// secante = (s(tB) − s(tA)) / (tB − tA) e tangente = v(tA) = ds/dt, a derivada exata de s(t).
(function () {
  const cv = document.getElementById("g-st");
  if (!cv) return;
  const $ = id => document.getElementById(id);

  // s(t) = t³ − 7,5t² + 12t + 10  →  v(t) = 3t² − 15t + 12 = 3(t − 1)(t − 4)
  const s = t => t ** 3 - 7.5 * t * t + 12 * t + 10;
  const v = t => 3 * t * t - 15 * t + 12;
  const T0 = 0, T1 = 5, S0 = 0, S1 = 18; // janela dos eixos
  const ZERO = 1e-9;

  const fmt = (n, d = 2) => {
    if (Math.abs(n) < 0.5 * 10 ** -d) n = 0;
    return n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }).replace("-", "−");
  };
  const snap = t => Math.min(T1, Math.max(T0, Math.round(t * 10) / 10));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  const inA = $("st-a"), inB = $("st-b"), chk = $("st-tan"), btn = $("st-approach"), res = $("g-st-res");
  let tA = +inA.value, tB = +inB.value, anim = 0, drag = null, geo;

  let C = {};
  const readColors = () => {
    const st = getComputedStyle(document.documentElement), g = k => st.getPropertyValue("--" + k).trim();
    C = { ink: g("ink"), soft: g("ink-soft"), grid: g("grid"), lines: g("lines"), card: g("card"), sec: g("ribbon-deep"), tan: g("blue") };
  };

  // Painel de leitura: montado uma vez; só os textos mudam (a mensagem final é a região viva)
  res.innerHTML = `
    <div class="row"><span>A</span><b id="st-ra"></b></div>
    <div class="row"><span>B</span><b id="st-rb"></b></div>
    <div class="row"><span>Δs = s(B) − s(A)</span><b id="st-rds"></b></div>
    <div class="row"><span>Δt = t(B) − t(A)</span><b id="st-rdt"></b></div>
    <div class="row"><span class="k-sec">Secante: v<sub>média</sub> = Δs/Δt</span><b class="k-sec" id="st-rvm"></b></div>
    <div class="row"><span class="k-tan">Tangente: v(t<sub>A</sub>) = ds/dt</span><b class="k-tan" id="st-rv"></b></div>
    <p class="msg" id="st-msg" aria-live="polite"></p>`;

  function size() {
    const w = cv.clientWidth, h = cv.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    if (!w || !h) return false;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const small = w < 560;
    const pad = small ? { l: 44, r: 14, t: 28, b: 40 } : { l: 64, r: 26, t: 34, b: 52 };
    const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
    geo = {
      w, h, dpr, small, pad,
      X: t => pad.l + (t - T0) / (T1 - T0) * pw,
      Y: y => pad.t + (S1 - y) / (S1 - S0) * ph,
      T: px => T0 + (px - pad.l) / pw * (T1 - T0)
    };
    return true;
  }

  // Reta que passa por (t0, y0) com inclinação m (em m/s), recortada na área de plotagem
  function line(c, t0, y0, m, dash, color, width) {
    const { X, Y } = geo;
    c.save();
    c.beginPath(); c.rect(X(T0), Y(S1), X(T1) - X(T0), Y(S0) - Y(S1)); c.clip();
    c.strokeStyle = color; c.lineWidth = width; c.setLineDash(dash); c.lineCap = "round";
    c.beginPath(); c.moveTo(X(T0), Y(y0 + m * (T0 - t0))); c.lineTo(X(T1), Y(y0 + m * (T1 - t0))); c.stroke();
    c.restore();
  }

  function label(c, text, x, y, color, align = "center", base = "bottom") {
    c.textAlign = align; c.textBaseline = base;
    c.lineWidth = 4; c.strokeStyle = C.card; c.lineJoin = "round"; c.strokeText(text, x, y); // halo para ler sobre a grade
    c.fillStyle = color; c.fillText(text, x, y);
  }

  function draw() {
    if (!geo) return;
    const c = cv.getContext("2d"), { w, h, dpr, small, X, Y } = geo;
    const sA = s(tA), sB = s(tB), dt = tB - tA, same = Math.abs(dt) < ZERO;
    const showTan = chk.checked || same;
    const fs = small ? 12 : 14, mono = (px, wgt = 400) => `${wgt} ${px}px 'JetBrains Mono', ui-monospace, monospace`;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = C.card; c.fillRect(0, 0, w, h);

    // grade discreta: fina a cada 0,5 s e 1 m, um pouco mais marcada a cada 1 s e 2 m
    c.lineWidth = 1; c.setLineDash([]);
    for (let k = 0; k <= (T1 - T0) * 2; k++) {
      const t = T0 + k / 2, x = Math.round(X(t)) + 0.5;
      c.strokeStyle = k % 2 ? C.lines : C.grid; c.globalAlpha = k % 2 ? 1 : 0.55;
      c.beginPath(); c.moveTo(x, Y(S1)); c.lineTo(x, Y(S0)); c.stroke();
    }
    for (let y = S0; y <= S1; y++) {
      const py = Math.round(Y(y)) + 0.5;
      c.strokeStyle = y % 2 ? C.lines : C.grid; c.globalAlpha = y % 2 ? 1 : 0.55;
      c.beginPath(); c.moveTo(X(T0), py); c.lineTo(X(T1), py); c.stroke();
    }
    c.globalAlpha = 1;

    // eixos, marcas e rótulos com unidade
    c.strokeStyle = C.ink; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(X(T0), Y(S1) - 8); c.lineTo(X(T0), Y(S0)); c.lineTo(X(T1) + 8, Y(S0)); c.stroke();
    c.font = mono(fs); c.fillStyle = C.soft;
    c.textAlign = "center"; c.textBaseline = "top";
    for (let t = T0; t <= T1; t++) c.fillText(fmt(t, 0), X(t), Y(S0) + 7);
    c.textAlign = "right"; c.textBaseline = "middle";
    for (let y = S0; y <= S1; y += small ? 4 : 2) c.fillText(fmt(y, 0), X(T0) - 8, Y(y));
    c.font = mono(fs + 1, 600); c.fillStyle = C.ink;
    c.textAlign = "left"; c.textBaseline = "bottom"; c.fillText("s (m)", X(T0) + 8, Y(S1) - 4);
    c.textAlign = "right"; c.textBaseline = "bottom"; c.fillText("t (s)", X(T1), Y(S0) - 6);

    // catetos Δt e Δs do triângulo da secante
    if (!same) {
      c.strokeStyle = C.soft; c.lineWidth = 1.5; c.setLineDash([3, 4]);
      c.beginPath(); c.moveTo(X(tA), Y(sA)); c.lineTo(X(tB), Y(sA)); c.lineTo(X(tB), Y(sB)); c.stroke();
      c.setLineDash([]);
      c.font = mono(fs - 1);
      const below = sA < 3;
      label(c, "Δt", (X(tA) + X(tB)) / 2, Y(sA) + (below ? -6 : 6), C.soft, "center", below ? "bottom" : "top");
      if (Math.abs(Y(sB) - Y(sA)) > 18) label(c, "Δs", X(tB) + (dt > 0 ? 6 : -6), (Y(sA) + Y(sB)) / 2, C.soft, dt > 0 ? "left" : "right", "middle");
    }

    // secante (laranja, tracejada) e tangente (azul, contínua)
    if (!same) line(c, tA, sA, (sB - sA) / dt, [11, 7], C.sec, 2.5);
    if (showTan) line(c, tA, sA, v(tA), [], C.tan, 2.5);

    // curva s(t)
    c.strokeStyle = C.ink; c.lineWidth = 3; c.lineJoin = "round"; c.setLineDash([]);
    c.beginPath();
    for (let i = 0; i <= 240; i++) { const t = T0 + (T1 - T0) * i / 240; i ? c.lineTo(X(t), Y(s(t))) : c.moveTo(X(t), Y(s(t))); }
    c.stroke();

    // pontos: B vazado (laranja), A cheio (tinta)
    const pt = (t, y, fill, stroke, name, dx) => {
      c.beginPath(); c.arc(X(t), Y(y), 7, 0, Math.PI * 2);
      c.fillStyle = fill; c.fill(); c.lineWidth = 3; c.strokeStyle = stroke; c.stroke();
      c.font = mono(fs + 1, 600);
      const up = Y(y) > Y(S1) + 30;
      label(c, name, X(t) + dx, Y(y) + (up ? -12 : 14), stroke, "center", up ? "bottom" : "top");
    };
    if (!same) pt(tB, sB, C.card, C.sec, "B", Math.abs(X(tB) - X(tA)) < 22 ? (dt > 0 ? 12 : -12) : 0);
    pt(tA, sA, C.ink, C.ink, same ? "A = B" : "A", 0);
  }

  function describe(v0) {
    if (Math.abs(v0) < ZERO) return "Tangente horizontal: velocidade nula, o carrinho está parado neste instante.";
    return v0 > 0 ? "Tangente subindo: velocidade positiva, o carrinho avança."
                  : "Tangente descendo: velocidade negativa, o carrinho volta.";
  }

  function update() {
    const sA = s(tA), sB = s(tB), dt = tB - tA, ds = sB - sA, same = Math.abs(dt) < ZERO, vA = v(tA);
    $("st-ao").textContent = fmt(tA) + " s";
    $("st-bo").textContent = fmt(tB) + " s";
    $("st-ra").textContent = `t = ${fmt(tA)} s · s = ${fmt(sA)} m`;
    $("st-rb").textContent = `t = ${fmt(tB)} s · s = ${fmt(sB)} m`;
    $("st-rds").textContent = `${fmt(ds)} m`;
    $("st-rdt").textContent = `${fmt(dt)} s`;
    $("st-rvm").textContent = same ? "não existe (Δt = 0)" : `${fmt(ds / dt)} m/s`;
    $("st-rv").textContent = `${fmt(vA)} m/s`;
    let msg;
    if (same) msg = `A e B coincidem: Δt = 0 e a conta Δs/Δt seria 0/0, sem valor. Não há secante; sobra a tangente, com inclinação v = ${fmt(vA)} m/s. ${describe(vA)}`;
    else if (Math.abs(dt) <= 0.3) msg = `B está bem perto de A: a secante (${fmt(ds / dt)} m/s) já quase coincide com a tangente (${fmt(vA)} m/s).`;
    else msg = `A secante dá a velocidade média entre ${fmt(tA)} s e ${fmt(tB)} s: ${fmt(ds / dt)} m/s.` + (chk.checked ? ` ${describe(vA)}` : "");
    $("st-msg").textContent = msg;
    btn.textContent = same ? "Afastar B de A" : "Aproximar B de A";
    cv.setAttribute("aria-label", `Gráfico s × t. A em ${fmt(tA)} s, B em ${fmt(tB)} s. ` +
      (same ? "" : `Secante com inclinação ${fmt(ds / dt)} m/s. `) + ((chk.checked || same) ? `Tangente em A com inclinação ${fmt(vA)} m/s.` : ""));
    draw();
  }

  // Tabela do passo 2: A fixo, Δt cada vez menor (B à direita de A, ou à esquerda perto do fim)
  function table() {
    const dir = tA + 1 <= T1 ? 1 : -1;
    const rows = [1, 0.5, 0.1, 0.01, 0.001].map(h => {
      const dt = dir * h, m = (s(tA + dt) - s(tA)) / dt;
      return `<tr><td>${fmt(dt, 3)} s</td><td>${fmt(m, 3)} m/s</td></tr>`;
    });
    rows.push(`<tr class="lim"><td>Δt → 0</td><td>${fmt(v(tA), 3)} m/s</td></tr>`);
    $("st-tab").innerHTML = rows.join("");
    $("st-tab-a").textContent = fmt(tA) + " s";
  }

  const stop = () => { if (anim) cancelAnimationFrame(anim); anim = 0; };
  const setA = t => { tA = t; inA.value = t; table(); update(); };
  const setB = t => { tB = t; inB.value = t; update(); };

  inA.addEventListener("input", () => { stop(); setA(+inA.value); });
  inB.addEventListener("input", () => { stop(); setB(+inB.value); });
  chk.addEventListener("change", update);

  btn.addEventListener("click", () => {
    stop();
    if (Math.abs(tB - tA) < ZERO) { setB(snap(tA + 2 <= T1 ? tA + 2 : tA - 2)); return; }
    const from = tB, to = tA, dur = 1800, t0 = performance.now();
    const end = () => { anim = 0; chk.checked = true; setB(to); };
    if (reduce.matches) { end(); return; }
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - (1 - k) ** 3; // desacelera ao chegar
      if (k >= 1) { end(); return; }
      tB = from + (to - from) * e; inB.value = tB; update();
      anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  });

  // Arrastar A ou B no gráfico (só na horizontal; na vertical a página continua rolando)
  const local = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener("pointerdown", e => {
    if (!geo) return;
    const [x, y] = local(e), { X, Y } = geo;
    const dA = Math.hypot(x - X(tA), y - Y(s(tA))), dB = Math.hypot(x - X(tB), y - Y(s(tB)));
    const near = Math.min(dA, dB);
    if (near > (e.pointerType === "mouse" ? 18 : 30)) return;
    drag = dB < dA ? "B" : "A";
    stop(); try { cv.setPointerCapture(e.pointerId); } catch (_) { /* ponteiro já liberado */ }
    cv.classList.add("dragging"); e.preventDefault();
  });
  cv.addEventListener("pointermove", e => {
    if (!drag) return;
    const t = snap(geo.T(local(e)[0]));
    if (drag === "A" && t !== tA) setA(t);
    if (drag === "B" && t !== tB) setB(t);
  });
  const release = () => { drag = null; cv.classList.remove("dragging"); };
  cv.addEventListener("pointerup", release);
  cv.addEventListener("pointercancel", release);

  readColors();
  const redraw = () => { if (size()) draw(); };
  if ("ResizeObserver" in window) new ResizeObserver(redraw).observe(cv); else window.addEventListener("resize", redraw);
  if (document.fonts) document.fonts.ready.then(redraw);
  table(); size(); update();
})();

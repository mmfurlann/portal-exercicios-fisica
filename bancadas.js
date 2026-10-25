// Bancadas de simulação do A Tal da Física. Cada bancada só é ligada se o canvas dela existir na página,
// então o mesmo arquivo serve à página inicial e ao laboratório.
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmt = (n, d = 1) => n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
  const $ = id => document.getElementById(id);
  const set = (id, s) => { $(id).textContent = s; };
  const onInput = (ids, fn) => ids.forEach(id => $(id).addEventListener("input", fn));
  const deg = r => r * 180 / Math.PI, rad = d => d * Math.PI / 180;
  const mono = px => `${px}px 'JetBrains Mono', monospace`;
  const C = {};
  function readColors() {
    const s = getComputedStyle(document.documentElement);
    ["paper", "grid", "ink", "ink-soft", "accent", "accent-ink", "blue", "ok", "bad", "card"].forEach(k => C[k] = s.getPropertyValue("--" + k).trim());
  }
  readColors();
  const redraws = [];
  const clear = (c, cv) => { c.fillStyle = C.card; c.fillRect(0, 0, cv.width, cv.height); };
  function niceStep(span, n = 6) {
    const raw = span / n, p = 10 ** Math.floor(Math.log10(raw)), m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }
  function arrow(c, x1, y1, x2, y2, color, w = 3, head = 14) {
    const len = Math.hypot(x2 - x1, y2 - y1);
    if (len < 2) return;
    const a = Math.atan2(y2 - y1, x2 - x1), hd = Math.min(head, len * 0.6);
    c.strokeStyle = color; c.fillStyle = color; c.lineWidth = w;
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2 - Math.cos(a) * hd * 0.7, y2 - Math.sin(a) * hd * 0.7); c.stroke();
    c.beginPath(); c.moveTo(x2, y2);
    c.lineTo(x2 - hd * Math.cos(a - 0.42), y2 - hd * Math.sin(a - 0.42));
    c.lineTo(x2 - hd * Math.cos(a + 0.42), y2 - hd * Math.sin(a + 0.42));
    c.closePath(); c.fill();
  }
  // Animação contínua que só roda enquanto o canvas aparece na tela. draw(dt) recebe os segundos desde o quadro anterior.
  // Devolve uma função de redesenho pontual, usada quando um controle muda.
  function animate(cv, draw) {
    let visible = !("IntersectionObserver" in window), raf = null, last = null;
    const frame = now => {
      const dt = last == null ? 0 : Math.min((now - last) / 1000, 0.05);
      last = now; draw(dt);
      if (visible) raf = requestAnimationFrame(frame); else { raf = null; last = null; }
    };
    const start = () => { if (!raf && !reduce) raf = requestAnimationFrame(frame); };
    if (!visible) new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) start(); }).observe(cv);
    draw(0); start();
    const redraw = () => { if (!raf) draw(0); };
    redraws.push(redraw);
    return redraw;
  }

  /* ---------- Lançamento oblíquo ---------- */
  if ($("proj")) {
    const cv = $("proj"), ctx = cv.getContext("2d");
    const v0 = $("v0"), ang = $("ang"), grav = $("grav");
    let anim = null, tNow = null;
    const params = () => {
      const v = +v0.value, th = rad(+ang.value), g = +grav.value;
      return { v, th, g, T: 2 * v * Math.sin(th) / g, R: v * v * Math.sin(2 * th) / g, H: (v * Math.sin(th)) ** 2 / (2 * g) };
    };
    function drawProj(t) {
      const P = params(), W = cv.width, Hh = cv.height;
      const padL = 64, padB = 48, padT = 24, padR = 24;
      const spanX = Math.max(P.R, 1) * 1.08, spanY = Math.max(P.H * 1.25, spanX * (Hh - padB - padT) / (W - padL - padR) * 0.25);
      const s = Math.min((W - padL - padR) / spanX, (Hh - padB - padT) / spanY);
      const X = x => padL + x * s, Y = y => Hh - padB - y * s;
      clear(ctx, cv);
      const step = niceStep(spanX);
      ctx.font = mono(20); ctx.textBaseline = "top"; ctx.lineWidth = 1;
      for (let x = 0; X(x) <= W - padR + 1; x += step) {
        ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X(x), padT); ctx.lineTo(X(x), Y(0)); ctx.stroke();
        ctx.fillStyle = C["ink-soft"]; ctx.textAlign = "center"; ctx.fillText(fmt(x, step < 1 ? 1 : 0), X(x), Y(0) + 8);
      }
      ctx.textBaseline = "middle"; ctx.textAlign = "right";
      for (let y = step; Y(y) >= padT; y += step) {
        ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(padL, Y(y)); ctx.lineTo(W - padR, Y(y)); ctx.stroke();
        ctx.fillStyle = C["ink-soft"]; ctx.fillText(fmt(y, step < 1 ? 1 : 0), padL - 8, Y(y));
      }
      ctx.textAlign = "left"; ctx.fillText("m", W - padR - 16, Y(0) + 18);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(padL, Y(0)); ctx.lineTo(W - padR, Y(0)); ctx.stroke();
      // trajetória prevista
      ctx.setLineDash([8, 8]); ctx.strokeStyle = C["ink-soft"]; ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const tt = P.T * i / 120, x = P.v * Math.cos(P.th) * tt, y = P.v * Math.sin(P.th) * tt - 0.5 * P.g * tt * tt;
        i ? ctx.lineTo(X(x), Y(Math.max(y, 0))) : ctx.moveTo(X(x), Y(y));
      }
      ctx.stroke(); ctx.setLineDash([]);
      // altura máxima
      const xa = P.R / 2;
      ctx.strokeStyle = C.blue; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(xa), Y(0)); ctx.lineTo(X(xa), Y(P.H)); ctx.stroke();
      ctx.fillStyle = C.blue; ctx.textAlign = "left"; ctx.textBaseline = "bottom";
      ctx.fillText("H = " + fmt(P.H) + " m", X(xa) + 8, Y(P.H / 2));
      // vetor velocidade inicial
      ctx.strokeStyle = C.accent; ctx.lineWidth = 3; ctx.beginPath();
      ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(0) + 70 * Math.cos(P.th), Y(0) - 70 * Math.sin(P.th)); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(0), Y(0), 30, -P.th, 0); ctx.strokeStyle = C["ink-soft"]; ctx.lineWidth = 1.5; ctx.stroke();
      // projétil
      const tt = t == null ? P.T * 0.5 : Math.min(t, P.T);
      const bx = P.v * Math.cos(P.th) * tt, by = Math.max(P.v * Math.sin(P.th) * tt - 0.5 * P.g * tt * tt, 0);
      if (t != null) {
        ctx.strokeStyle = C.accent; ctx.lineWidth = 3; ctx.beginPath();
        for (let i = 0; i <= 60; i++) {
          const q = tt * i / 60, x = P.v * Math.cos(P.th) * q, y = Math.max(P.v * Math.sin(P.th) * q - 0.5 * P.g * q * q, 0);
          i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y));
        }
        ctx.stroke();
      }
      ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(X(bx), Y(by), 11, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = C.ink; ctx.textBaseline = "top"; ctx.textAlign = "left";
      ctx.fillText("t = " + fmt(tt, 2) + " s", padL + 10, padT + 4);
    }
    function updateProj() {
      const P = params();
      set("v0o", P.v + " m/s"); set("ango", ang.value + "°");
      set("rR", fmt(P.R) + " m"); set("rH", fmt(P.H) + " m"); set("rT", fmt(P.T, 2) + " s");
      if (anim) { cancelAnimationFrame(anim); anim = null; }
      tNow = null; drawProj(null);
    }
    function launch() {
      const P = params();
      if (anim) cancelAnimationFrame(anim);
      if (reduce) { drawProj(P.T); return; }
      const speed = Math.max(1, P.T / 2.5); // voos longos são acelerados
      let start = null;
      const frame = ts => {
        if (start == null) start = ts;
        tNow = (ts - start) / 1000 * speed;
        drawProj(tNow);
        anim = tNow < P.T ? requestAnimationFrame(frame) : null;
      };
      anim = requestAnimationFrame(frame);
    }
    onInput(["v0", "ang", "grav"], updateProj);
    $("launch").addEventListener("click", launch);
    updateProj();
    redraws.push(() => drawProj(tNow));
  }

  /* ---------- Pêndulo simples ---------- */
  if ($("pend")) {
    const pc = $("pend"), px = pc.getContext("2d"), theta0 = 0.35;
    let t = 0;
    const redraw = animate(pc, dt => {
      t += dt;
      const L = +$("len").value, g = +$("pg").value, w = Math.sqrt(g / L);
      const th = reduce ? theta0 : theta0 * Math.cos(w * t);
      const W = pc.width, H = pc.height, ox = W / 2, oy = 40, scale = (H - 120) / 2.5;
      clear(px, pc);
      // escala vertical em metros
      px.strokeStyle = C.grid; px.lineWidth = 1; px.font = mono(18); px.fillStyle = C["ink-soft"]; px.textBaseline = "middle"; px.textAlign = "left";
      for (let m = 0.5; m <= 2.5; m += 0.5) {
        const y = oy + m * scale; px.beginPath(); px.moveTo(24, y); px.lineTo(W - 24, y); px.stroke();
        px.fillText(fmt(m, 1) + " m", 28, y - 12);
      }
      px.fillStyle = C.ink; px.fillRect(ox - 60, oy - 10, 120, 8);
      px.setLineDash([6, 6]); px.strokeStyle = C["ink-soft"]; px.beginPath();
      px.arc(ox, oy, L * scale, Math.PI / 2 - theta0, Math.PI / 2 + theta0); px.stroke(); px.setLineDash([]);
      const bx = ox + L * scale * Math.sin(th), by = oy + L * scale * Math.cos(th);
      px.strokeStyle = C.ink; px.lineWidth = 2; px.beginPath(); px.moveTo(ox, oy); px.lineTo(bx, by); px.stroke();
      px.fillStyle = C.accent; px.beginPath(); px.arc(bx, by, 18, 0, Math.PI * 2); px.fill();
      px.strokeStyle = C.ink; px.stroke();
    });
    const update = () => {
      const L = +$("len").value, g = +$("pg").value;
      set("leno", fmt(L, 2) + " m");
      set("pT", "T = " + fmt(2 * Math.PI * Math.sqrt(L / g), 2) + " s");
      t = 0; redraw();
    };
    onInput(["len", "pg"], update);
    update();
  }

  /* ---------- Plano inclinado ---------- */
  if ($("incl")) {
    const cv = $("incl"), c = cv.getContext("2d"), g = 9.81, L = 4; // rampa de 4 m
    let s = 0, v = 0;
    const phys = () => {
      const th = rad(+$("ia").value), mu = +$("imu").value, m = +$("im").value;
      const P = m * g, N = P * Math.cos(th), Px = P * Math.sin(th), fmax = mu * N, slides = Px > fmax + 1e-9;
      return { th, mu, m, P, N, Px, fmax, slides, fat: slides ? fmax : Px, a: slides ? (Px - fmax) / m : 0 };
    };
    const redraw = animate(cv, dt => {
      const F = phys(), W = cv.width;
      if (F.slides && !reduce && s < L) { v += F.a * dt; s = Math.min(L, s + v * dt); }
      const pos = reduce && F.slides ? L / 2 : s;
      clear(c, cv);
      const Lp = 520, x0 = 110, yb = 450;
      const ex = x0 + Lp * Math.cos(F.th), y0 = yb - Lp * Math.sin(F.th);
      c.strokeStyle = C.ink; c.lineWidth = 2.5;
      c.beginPath(); c.moveTo(30, yb); c.lineTo(ex + 50, yb); c.stroke();
      c.fillStyle = C.paper; c.beginPath(); c.moveTo(x0, yb); c.lineTo(x0, y0); c.lineTo(ex, yb); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = C["ink-soft"]; c.lineWidth = 1.5; c.beginPath(); c.arc(ex, yb, 64, Math.PI, Math.PI + F.th); c.stroke();
      c.font = mono(20); c.fillStyle = C["ink-soft"]; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText("θ", ex - 86 * Math.cos(F.th / 2), yb - 86 * Math.sin(F.th / 2));
      // bloco apoiado na rampa
      const u = [Math.cos(F.th), Math.sin(F.th)], n = [Math.sin(F.th), -Math.cos(F.th)];
      const d = 44 + pos / L * (Lp - 190), bx = x0 + u[0] * d + n[0] * 34, by = y0 + u[1] * d + n[1] * 34;
      c.save(); c.translate(bx, by); c.rotate(F.th);
      c.fillStyle = C.accent; c.fillRect(-34, -34, 68, 68); c.strokeStyle = C.ink; c.lineWidth = 2; c.strokeRect(-34, -34, 68, 68);
      c.fillStyle = C.card; c.font = mono(18); c.fillText(fmt(F.m, 0) + " kg", 0, 0);
      c.restore();
      // forças, na mesma escala
      const k = 85 / F.P;
      c.setLineDash([6, 6]);
      arrow(c, bx, by, bx + u[0] * F.Px * k, by + u[1] * F.Px * k, C["ink-soft"], 1.5, 10);
      arrow(c, bx, by, bx - n[0] * F.N * k, by - n[1] * F.N * k, C["ink-soft"], 1.5, 10);
      c.setLineDash([]);
      arrow(c, bx, by, bx, by + F.P * k, C.bad);
      arrow(c, bx, by, bx + n[0] * F.N * k, by + n[1] * F.N * k, C.blue);
      if (F.fat > 0.01) arrow(c, bx, by, bx - u[0] * F.fat * k, by - u[1] * F.fat * k, C.ok);
      c.font = mono(18); c.textAlign = "left";
      c.fillStyle = C.bad; c.fillText("P", bx + 8, by + F.P * k - 6);
      c.fillStyle = C.blue; c.fillText("N", bx + n[0] * F.N * k + 8, by + n[1] * F.N * k);
      if (F.fat > 0.01) { c.fillStyle = C.ok; c.fillText("Fat", bx - u[0] * F.fat * k - 44, by - u[1] * F.fat * k - 14); }
      // legenda com as contas
      const lx = Math.max(ex + 70, 690);
      const rows = [
        [C.bad, `P = m·g = ${fmt(F.P)} N`],
        [C["ink-soft"], `P·sen θ = ${fmt(F.Px)} N`],
        [C.blue, `N = P·cos θ = ${fmt(F.N)} N`],
        [C["ink-soft"], `Fat máx = μ·N = ${fmt(F.fmax)} N`],
        [C.ok, `Fat = ${fmt(F.fat)} N`]
      ];
      c.font = mono(17); c.textBaseline = "top";
      rows.forEach(([col, txt], i) => { c.fillStyle = col; c.fillText(txt, Math.min(lx, W - 330), 40 + i * 30); });
      c.fillStyle = F.slides ? C.accent : C.ok; c.font = mono(18);
      c.fillText(F.slides ? "Desliza: P·sen θ > Fat máx" : "Parado: o atrito segura", Math.min(lx, W - 330), 200);
    });
    const update = () => {
      const F = phys();
      set("iao", $("ia").value + "°"); set("imuo", fmt(F.mu, 2)); set("imo", fmt(F.m, 0) + " kg");
      set("iA", fmt(F.a, 2) + " m/s²"); set("iF", fmt(F.fat) + " N"); set("iN", fmt(F.N) + " N");
      const lim = fmt(deg(Math.atan(F.mu))) + "°";
      set("iNote", F.slides
        ? `Chega à base da rampa de 4 m em ${fmt(Math.sqrt(2 * L / F.a), 2)} s, a ${fmt(Math.sqrt(2 * F.a * L))} m/s. Ângulo limite: arctg μ = ${lim}.`
        : `O bloco fica parado até θ passar do ângulo limite: arctg μ = ${lim}.`);
      s = 0; v = 0; redraw();
    };
    onInput(["ia", "imu", "im"], update);
    $("irel").addEventListener("click", () => { s = 0; v = 0; redraw(); });
    update();
  }

  /* ---------- Colisões em uma dimensão ---------- */
  if ($("coll")) {
    const cv = $("coll"), c = cv.getContext("2d"), K = 45; // px por metro
    const par = () => ({ m1: +$("km1").value, v1: +$("kv1").value, m2: +$("km2").value, v2: +$("kv2").value, e: +$("ke").value });
    function outcome(p) {
      const M = p.m1 + p.m2, Q = p.m1 * p.v1 + p.m2 * p.v2;
      const u1 = (Q + p.m2 * p.e * (p.v2 - p.v1)) / M, u2 = (Q + p.m1 * p.e * (p.v1 - p.v2)) / M;
      const Ei = 0.5 * p.m1 * p.v1 ** 2 + 0.5 * p.m2 * p.v2 ** 2, Ef = 0.5 * p.m1 * u1 ** 2 + 0.5 * p.m2 * u2 ** 2;
      return { meet: p.v1 > p.v2, u1, u2, Q, Ei, Ef };
    }
    const wid = m => 56 + m * 8;
    let st;
    const reset = () => { const p = par(); st = { p, x1: 230, x2: 700, v1: p.v1, v2: p.v2, hit: false, t: 0, run: false, flash: 0 }; };
    reset();
    const redraw = animate(cv, dt => {
      const W = cv.width, yr = 300, p = st.p;
      if (st.run) {
        st.t += dt; st.x1 += st.v1 * K * dt; st.x2 += st.v2 * K * dt;
        const gap = st.x2 - st.x1 - (wid(p.m1) + wid(p.m2)) / 2;
        if (!st.hit && gap <= 0 && st.v1 > st.v2) {
          const o = outcome(p); st.v1 = o.u1; st.v2 = o.u2; st.hit = true; st.flash = 0.35;
          st.x1 += gap / 2; st.x2 -= gap / 2;
        }
        // para quando um carrinho chega à borda, para que os dois continuem à vista
        const edge = (x, m) => x - wid(m) / 2 < 4 || x + wid(m) / 2 > W - 4;
        if (st.t > 8 || edge(st.x1, p.m1) || edge(st.x2, p.m2)) st.run = false;
      }
      st.flash = Math.max(0, st.flash - dt);
      clear(c, cv);
      c.strokeStyle = C.ink; c.lineWidth = 3; c.beginPath(); c.moveTo(0, yr + 16); c.lineTo(W, yr + 16); c.stroke();
      c.strokeStyle = C.grid; c.lineWidth = 1;
      for (let x = 0; x < W; x += K) { c.beginPath(); c.moveTo(x, yr + 16); c.lineTo(x, yr + 26); c.stroke(); }
      const cart = (x, m, vel, col, name) => {
        const w = wid(m), h = 58;
        c.fillStyle = col; c.beginPath(); c.roundRect(x - w / 2, yr - h, w, h, 8); c.fill();
        c.fillStyle = C.ink; [x - w / 3, x + w / 3].forEach(wx => { c.beginPath(); c.arc(wx, yr + 6, 9, 0, Math.PI * 2); c.fill(); });
        c.fillStyle = C.card; c.font = mono(18); c.textAlign = "center"; c.textBaseline = "middle";
        c.fillText(fmt(m, m % 1 ? 1 : 0) + " kg", x, yr - h / 2);
        if (Math.abs(vel) > 0.01) arrow(c, x, yr - h - 34, x + vel * 16, yr - h - 34, col, 3, 12);
        c.fillStyle = col; c.font = mono(17); c.fillText(`${name} = ${fmt(vel)} m/s`, x, yr - h - 62);
      };
      cart(st.x1, p.m1, st.v1, C.accent, "v₁");
      cart(st.x2, p.m2, st.v2, C.blue, "v₂");
      if (st.flash > 0) {
        const cx = (st.x1 + wid(p.m1) / 2 + st.x2 - wid(p.m2) / 2) / 2, cy = yr - 30;
        c.strokeStyle = C.accent; c.lineWidth = 3;
        for (let i = 0; i < 8; i++) {
          const a = i * Math.PI / 4, r1 = 14, r2 = 14 + st.flash * 90;
          c.beginPath(); c.moveTo(cx + r1 * Math.cos(a), cy + r1 * Math.sin(a)); c.lineTo(cx + r2 * Math.cos(a), cy + r2 * Math.sin(a)); c.stroke();
        }
      }
      // balanço antes e depois
      const o = outcome(p);
      c.font = mono(17); c.textAlign = "left"; c.textBaseline = "top"; c.fillStyle = C["ink-soft"];
      c.fillText(`Antes:  Q = ${fmt(o.Q)} kg·m/s   Ec = ${fmt(o.Ei)} J`, 24, 22);
      if (st.hit) { c.fillStyle = C.ink; c.fillText(`Depois: Q = ${fmt(o.Q)} kg·m/s   Ec = ${fmt(o.Ef)} J`, 24, 50); }
    });
    const update = () => {
      const p = par(), o = outcome(p);
      set("km1o", fmt(p.m1) + " kg"); set("kv1o", fmt(p.v1) + " m/s"); set("km2o", fmt(p.m2) + " kg"); set("kv2o", fmt(p.v2) + " m/s"); set("keo", fmt(p.e));
      if (!o.meet) {
        set("kV", "—"); set("kQ", fmt(o.Q) + " kg·m/s"); set("kE", fmt(o.Ei) + " J");
        set("kNote", "Com v₁ menor ou igual a v₂ os carrinhos não se encontram. Aumente v₁ ou deixe v₂ negativa.");
      } else {
        const kind = p.e === 1 ? "Choque perfeitamente elástico: a energia cinética se conserva." :
                     p.e === 0 ? "Choque perfeitamente inelástico: os carrinhos seguem juntos e a perda de energia é a maior possível." :
                                 "Choque parcialmente elástico.";
        set("kV", `${fmt(o.u1)} · ${fmt(o.u2)} m/s`); set("kQ", fmt(o.Q) + " kg·m/s");
        set("kE", `${fmt(o.Ei)} → ${fmt(o.Ef)} J`);
        set("kNote", `${kind} Energia dissipada: ${fmt(o.Ei - o.Ef)} J. A quantidade de movimento vale ${fmt(o.Q)} kg·m/s antes e depois.`);
      }
      reset(); redraw();
    };
    onInput(["km1", "kv1", "km2", "kv2", "ke"], update);
    $("kgo").addEventListener("click", () => {
      reset();
      if (reduce) {
        const o = outcome(st.p);
        if (o.meet) { st.hit = true; st.v1 = o.u1; st.v2 = o.u2; const mid = 465, half = (wid(st.p.m1) + wid(st.p.m2)) / 2; st.x1 = mid - half / 2 - 2; st.x2 = mid + half / 2 + 2; }
      } else st.run = true;
      redraw();
    });
    update();
  }

  /* ---------- Refração ---------- */
  if ($("refr")) {
    const rc = $("refr"), rx = rc.getContext("2d");
    const inc = $("inc"), n1s = $("n1"), n2s = $("n2");
    function drawRefr() {
      const n1 = +n1s.value, n2 = +n2s.value, a1 = rad(+inc.value);
      const s2 = n1 * Math.sin(a1) / n2, total = s2 > 1, a2 = total ? 0 : Math.asin(s2);
      const W = rc.width, H = rc.height, cx = W / 2, cy = H / 2, L = H * 0.46;
      clear(rx, rc);
      rx.fillStyle = C.blue;
      rx.globalAlpha = Math.min(0.06 + (n1 - 1) * 0.18, 0.36); rx.fillRect(0, 0, W, cy);
      rx.globalAlpha = Math.min(0.06 + (n2 - 1) * 0.18, 0.36); rx.fillRect(0, cy, W, H - cy);
      rx.globalAlpha = 1;
      rx.font = mono(22); rx.fillStyle = C.ink; rx.textAlign = "left";
      rx.textBaseline = "top"; rx.fillText(n1s.selectedOptions[0].textContent, 20, 18);
      rx.textBaseline = "bottom"; rx.fillText(n2s.selectedOptions[0].textContent, 20, H - 18);
      rx.strokeStyle = C.ink; rx.lineWidth = 2; rx.beginPath(); rx.moveTo(0, cy); rx.lineTo(W, cy); rx.stroke();
      rx.setLineDash([8, 8]); rx.strokeStyle = C["ink-soft"]; rx.beginPath(); rx.moveTo(cx, 20); rx.lineTo(cx, H - 20); rx.stroke(); rx.setLineDash([]);
      rx.fillStyle = C["ink-soft"]; rx.textBaseline = "top"; rx.fillText("normal", cx + 10, 18);
      const ray = (x1, y1, x2, y2, alpha) => { rx.globalAlpha = alpha; arrow(rx, x1, y1, (x1 + x2) / 2, (y1 + y2) / 2, C.accent, 4, 20); rx.strokeStyle = C.accent; rx.lineWidth = 4; rx.beginPath(); rx.moveTo(x1, y1); rx.lineTo(x2, y2); rx.stroke(); rx.globalAlpha = 1; };
      ray(cx - L * Math.sin(a1), cy - L * Math.cos(a1), cx, cy, 1);
      ray(cx, cy, cx + L * Math.sin(a1), cy - L * Math.cos(a1), total ? 1 : 0.3);
      if (!total) ray(cx, cy, cx + L * Math.sin(a2), cy + L * Math.cos(a2), 1);
      rx.strokeStyle = C.ink; rx.lineWidth = 1.5; rx.fillStyle = C.ink; rx.textAlign = "center"; rx.textBaseline = "middle";
      rx.beginPath(); rx.arc(cx, cy, 70, -Math.PI / 2 - a1, -Math.PI / 2); rx.stroke();
      rx.fillText("θ₁", cx + 100 * Math.cos(-Math.PI / 2 - a1 / 2), cy + 100 * Math.sin(-Math.PI / 2 - a1 / 2));
      if (!total) {
        rx.beginPath(); rx.arc(cx, cy, 70, Math.PI / 2 - a2, Math.PI / 2); rx.stroke();
        rx.fillText("θ₂", cx + 100 * Math.cos(Math.PI / 2 - a2 / 2), cy + 100 * Math.sin(Math.PI / 2 - a2 / 2));
      } else {
        rx.fillText("Nenhuma luz atravessa", cx, cy + 80);
      }
      set("inco", inc.value + "°");
      set("rT2", total ? "reflexão total" : fmt(deg(a2)) + "°");
      set("rC", n1 > n2 ? fmt(deg(Math.asin(n2 / n1))) + "°" : "não há");
      set("rV", fmt(2.998 / n2, 2) + " × 10⁸ m/s");
    }
    onInput(["inc", "n1", "n2"], drawRefr);
    drawRefr();
    redraws.push(drawRefr);
  }

  /* ---------- Lentes e espelhos esféricos (mesma equação de Gauss) ---------- */
  // pre = prefixo dos ids ("l" lente, "m" espelho). Coordenadas físicas em cm, com o elemento óptico em x = 0
  // e o objeto à esquerda, em x = −p. Na lente a imagem real se forma à direita; no espelho, à esquerda.
  function optics(id, pre, mirror) {
    const cv = $(id), c = cv.getContext("2d"), K = 12, OBJ = 4, HALF = 12;
    function draw() {
      const conv = $(pre + "t").value === "c", f = (conv ? 1 : -1) * +$(pre + "f").value, p = +$(pre + "p").value;
      const W = cv.width, H = cv.height, X0 = mirror ? 720 : 470, Y0 = H / 2;
      const X = x => X0 + x * K, Y = y => Y0 - y * K, side = mirror ? -1 : 1;
      const inf = Math.abs(p - f) < 1e-9, q = inf ? Infinity : f * p / (p - f), A = -q / p, yi = A * OBJ;
      clear(c, cv);
      c.strokeStyle = C["ink-soft"]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, Y0); c.lineTo(W, Y0); c.stroke();
      // pontos notáveis
      c.font = mono(17); c.textAlign = "center"; c.textBaseline = "top";
      const mark = (x, label) => { if (X(x) < 10 || X(x) > W - 10) return; c.fillStyle = C.ink; c.beginPath(); c.arc(X(x), Y0, 4.5, 0, Math.PI * 2); c.fill(); c.fillStyle = C["ink-soft"]; c.fillText(label, X(x), Y0 + 10); };
      const af = Math.abs(f);
      if (mirror) { mark(-f, "F"); mark(-2 * f, "C"); mark(0, "V"); }
      else { mark(-af, "F"); mark(af, "F'"); mark(-2 * af, "2F"); mark(2 * af, "2F'"); }
      // elemento óptico
      c.strokeStyle = C.ink; c.lineWidth = 3;
      if (mirror) {
        const sag = conv ? -14 : 14; // pontas curvadas para o lado do objeto no côncavo
        c.beginPath(); c.moveTo(X0 + sag, Y(HALF)); c.quadraticCurveTo(X0 - sag, Y0, X0 + sag, Y(-HALF)); c.stroke();
        c.lineWidth = 1.5; c.strokeStyle = C["ink-soft"];
        // hachuras atrás do espelho, seguindo a mesma parábola da curva
        for (let y = -HALF + 1; y < HALF; y += 1.5) { const yy = Y(y), xx = X0 + sag * (y / HALF) ** 2; c.beginPath(); c.moveTo(xx + 3, yy); c.lineTo(xx + 13, yy - 10); c.stroke(); }
      } else {
        c.beginPath(); c.moveTo(X0, Y(HALF)); c.lineTo(X0, Y(-HALF)); c.stroke();
        const tip = (y, dir) => { c.beginPath(); c.moveTo(X0 - 12, Y(y) + dir * 12); c.lineTo(X0, Y(y)); c.lineTo(X0 + 12, Y(y) + dir * 12); c.stroke(); };
        if (conv) { tip(HALF, 1); tip(-HALF, -1); } else { tip(HALF, -1); tip(-HALF, 1); }
      }
      // raios principais a partir da ponta do objeto
      const tipP = [-p, OBJ], img = inf ? null : [side * q, yi];
      const hc = inf ? null : OBJ * f / (f - p);
      const hits = [OBJ, 0].concat(hc != null && Math.abs(hc) < HALF + 1 ? [hc] : []);
      const cols = [C.accent, C.ok, C.blue];
      hits.forEach((h, i) => {
        const col = cols[i];
        c.strokeStyle = col; c.lineWidth = 2.2; c.setLineDash([]);
        c.beginPath(); c.moveTo(X(tipP[0]), Y(tipP[1])); c.lineTo(X(0), Y(h)); c.stroke();
        let dx, dy;
        if (inf) { dx = side; dy = -OBJ / p; }
        else { const sg = Math.sign(q); dx = sg * (img[0] - 0); dy = sg * (img[1] - h); }
        const n = Math.hypot(dx, dy) || 1, far = 200;
        c.beginPath(); c.moveTo(X(0), Y(h)); c.lineTo(X(dx / n * far), Y(h + dy / n * far)); c.stroke();
        if (!inf && q < 0) { // prolongamento até a imagem virtual
          c.setLineDash([7, 6]); c.globalAlpha = 0.7;
          c.beginPath(); c.moveTo(X(0), Y(h)); c.lineTo(X(img[0]), Y(img[1])); c.stroke();
          c.setLineDash([]); c.globalAlpha = 1;
        }
      });
      // objeto e imagem
      arrow(c, X(-p), Y0, X(-p), Y(OBJ), C.accent, 4, 14);
      c.fillStyle = C.accent; c.textBaseline = "bottom"; c.fillText("objeto", X(-p), Y(OBJ) - 8);
      if (!inf && Math.abs(yi) < 19 && X(img[0]) > 0 && X(img[0]) < W) {
        if (q < 0) c.setLineDash([8, 6]);
        arrow(c, X(img[0]), Y0, X(img[0]), Y(yi), C.ink, 4, 14); c.setLineDash([]);
        c.fillStyle = C.ink; c.textBaseline = yi > 0 ? "bottom" : "top";
        c.fillText(q > 0 ? "imagem real" : "imagem virtual", X(img[0]), Y(yi) + (yi > 0 ? -8 : 8));
      }
      // leituras
      set(pre + "fo", `${conv ? "+" : "−"}${$(pre + "f").value} cm`); set(pre + "po", p + " cm");
      if (inf) {
        set(pre + "P", "no infinito"); set(pre + "A", "—"); set(pre + "N", "imprópria");
        set(pre + "Note", "Com o objeto exatamente sobre o foco, os raios saem paralelos e não formam imagem: ela é imprópria.");
      } else {
        const nat = [q > 0 ? "real" : "virtual", A < 0 ? "invertida" : "direita", Math.abs(A) > 1.005 ? "maior" : Math.abs(A) < 0.995 ? "menor" : "do mesmo tamanho"];
        set(pre + "P", fmt(q) + " cm"); set(pre + "A", fmt(A, 2)); set(pre + "N", nat.join(", "));
        set(pre + "Note", `1/f = 1/p + 1/p' → p' = f·p/(p − f) = (${fmt(f, 0)})·${p}/(${p} − (${fmt(f, 0)})) = ${fmt(q)} cm. ` +
          (mirror ? "p' positivo: imagem na frente do espelho (real); negativo: atrás dele (virtual)." : "p' positivo: imagem do outro lado da lente (real); negativo: do mesmo lado do objeto (virtual)."));
      }
    }
    onInput([pre + "t", pre + "f", pre + "p"], draw);
    draw();
    redraws.push(draw);
  }
  if ($("lens")) optics("lens", "l", false);
  if ($("mir")) optics("mir", "m", true);

  /* ---------- Fenômenos ondulatórios: efeito Doppler e onda estacionária ---------- */
  if ($("wave")) {
    const cv = $("wave"), c = cv.getContext("2d");
    // Doppler: som a 340 m/s, sirene de 440 Hz; na tela, 1 m/s vira 0,45 px/s
    const PX = 0.45, VSOM = 340, F0 = 440, T = 0.3;
    let t = 0, fronts = [], srcX = 0, emit = 0;
    const mode = () => $("wm").value;
    const showControls = () => document.querySelectorAll("[data-wmode]").forEach(el => { el.hidden = el.dataset.wmode !== mode(); });
    const labels = (a, b, d) => { set("w1l", a); set("w2l", b); set("w3l", d); };
    const startX = vs => vs === 0 ? cv.width / 2 : 260;
    function person(x, y, col, side, txt, hz) {
      c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 4; c.lineCap = "round";
      c.beginPath(); c.arc(x, y - 62, 13, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(x, y - 48); c.lineTo(x, y - 18); c.moveTo(x, y - 18); c.lineTo(x - 11, y); c.moveTo(x, y - 18); c.lineTo(x + 11, y);
      c.moveTo(x - 14, y - 38); c.lineTo(x + 14, y - 38); c.stroke(); c.lineCap = "butt";
      c.textAlign = side; c.textBaseline = "alphabetic";
      const tx = side === "left" ? x - 16 : x + 16;
      c.font = mono(16); c.fillStyle = C["ink-soft"]; c.fillText(txt, tx, y - 130);
      c.font = mono(22); c.fillStyle = col; c.fillText(hz, tx, y - 102);
    }
    function vehicle(x, y, flash) {
      c.fillStyle = C.ink; c.beginPath(); c.roundRect(x - 52, y - 40, 104, 36, 8); c.fill();
      c.beginPath(); c.roundRect(x + 14, y - 62, 34, 24, 6); c.fill();
      c.fillStyle = C.card; c.fillRect(x - 8, y - 32, 6, 20); c.fillRect(x - 15, y - 25, 20, 6);
      c.fillStyle = flash ? C.accent : C.blue; c.beginPath(); c.roundRect(x - 14, y - 52, 22, 12, 4); c.fill();
      c.fillStyle = C["ink-soft"]; [x - 30, x + 30].forEach(wx => { c.beginPath(); c.arc(wx, y - 2, 10, 0, Math.PI * 2); c.fill(); });
    }
    const redraw = animate(cv, dt => {
      t += dt;
      const W = cv.width, H = cv.height, m = mode();
      clear(c, cv);
      if (m === "dop") {
        const vs = +$("wv").value, vpx = VSOM * PX, spx = vs * PX, road = 430, sy = road - 52;
        if (!reduce) {
          srcX += spx * dt; emit += dt;
          if (emit >= T) { emit -= T; fronts.push({ x: srcX, t }); }
          if (srcX > W - 230) { srcX = startX(vs); emit = 0; } // as frentes antigas seguem se espalhando e somem sozinhas
        } else if (!fronts.length) {
          srcX = vs === 0 ? W / 2 : W * 0.55;
          for (let i = 0; i < 12; i++) fronts.push({ x: srcX - spx * T * i, t: -T * i });
        }
        fronts = fronts.filter(fr => (t - fr.t) * vpx < 1300);
        // estrada
        c.strokeStyle = C.grid; c.lineWidth = 3; c.beginPath(); c.moveTo(0, road + 10); c.lineTo(W, road + 10); c.stroke();
        c.setLineDash([24, 18]); c.lineWidth = 2; c.beginPath(); c.moveTo(0, road + 40); c.lineTo(W, road + 40); c.stroke(); c.setLineDash([]);
        // frentes de onda saindo da sirene
        c.lineWidth = 2.5;
        fronts.forEach(fr => {
          const r = (t - fr.t) * vpx; if (r <= 0) return;
          c.globalAlpha = Math.max(0.1, 1 - r / 1000); c.strokeStyle = C.accent;
          c.beginPath(); c.arc(fr.x, sy, r, 0, Math.PI * 2); c.stroke();
        });
        c.globalAlpha = 1;
        const sup = vs >= VSOM;
        const front = sup ? "estrondo" : fmt(F0 * VSOM / (VSOM - vs), 0) + " Hz", back = fmt(F0 * VSOM / (VSOM + vs), 0) + " Hz";
        person(70, road + 8, C.blue, "left", "atrás, mais grave", back);
        person(W - 70, road + 8, C.accent, "right", "à frente, mais agudo", front);
        vehicle(srcX, road + 8, reduce || Math.floor(t * 4) % 2 === 0);
        if (vs > 0) arrow(c, srcX - 30, road - 92, srcX + 30, road - 92, C.ink, 2.5, 10);
        c.font = mono(16); c.fillStyle = C["ink-soft"]; c.textAlign = "center"; c.textBaseline = "alphabetic";
        c.fillText(`sirene: ${F0} Hz`, srcX, road - 104);
      } else {
        // corda de 1,2 m, presa nas pontas
        const n = +$("wn").value, x0 = 80, x1 = W - 80, yc = H / 2, Aamp = 120, wt = 2 * Math.PI * t * 0.7;
        const cosw = reduce ? 1 : Math.cos(wt);
        c.font = mono(18); c.textBaseline = "top";
        c.setLineDash([6, 6]); c.strokeStyle = C["ink-soft"]; c.lineWidth = 1.5;
        [1, -1].forEach(sg => { c.beginPath(); for (let i = 0; i <= 300; i++) { const x = x0 + (x1 - x0) * i / 300, y = yc - sg * Aamp * Math.sin(n * Math.PI * i / 300); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); });
        c.setLineDash([]); c.strokeStyle = C.accent; c.lineWidth = 4; c.beginPath();
        for (let i = 0; i <= 300; i++) { const x = x0 + (x1 - x0) * i / 300, y = yc - Aamp * Math.sin(n * Math.PI * i / 300) * cosw; i ? c.lineTo(x, y) : c.moveTo(x, y); }
        c.stroke();
        c.fillStyle = C.ink; [x0, x1].forEach(x => c.fillRect(x - 6, yc - 40, 12, 80));
        c.textAlign = "center";
        for (let kk = 0; kk <= n; kk++) {
          const x = x0 + (x1 - x0) * kk / n;
          c.fillStyle = C.blue; c.beginPath(); c.arc(x, yc, 7, 0, Math.PI * 2); c.fill();
          if (kk < n) { c.fillStyle = C["ink-soft"]; c.fillText("ventre", x + (x1 - x0) / n / 2, yc + Aamp + 18); }
        }
        c.fillStyle = C.blue; c.fillText("nós", x0 + 30, yc + 20);
      }
    });
    const update = () => {
      const m = mode(); showControls();
      t = 0; fronts = []; emit = 0;
      if (m === "dop") {
        const vs = +$("wv").value, sup = vs >= VSOM;
        srcX = startX(vs);
        set("wvo", vs + " m/s");
        labels("Velocidade da fonte", "Ouvido à frente", "Ouvido atrás");
        set("w1", `${vs} m/s · Mach ${fmt(vs / VSOM, 2)}`);
        set("w2", sup ? "onda de choque" : fmt(F0 * VSOM / (VSOM - vs), 0) + " Hz");
        set("w3", fmt(F0 * VSOM / (VSOM + vs), 0) + " Hz");
        set("wNote", vs === 0
          ? "Fonte parada: as frentes de onda são círculos com o mesmo centro e os dois observadores ouvem os mesmos 440 Hz."
          : sup
            ? "A fonte anda tão rápido quanto o som ou mais: as frentes de onda se empilham num cone e quem está à frente ouve um estrondo, o boom sônico."
            : `À frente, as frentes de onda chegam espremidas: f' = 440·340/(340 − ${vs}). Atrás, chegam espaçadas: f' = 440·340/(340 + ${vs}). É o que acontece quando a ambulância passa por você.`);
      } else {
        const n = +$("wn").value;
        srcX = startX(0);
        set("wno", n + "º harmônico");
        labels("Harmônico", "λ = 2L/n", "f = n·v/(2L)");
        set("w1", "n = " + n); set("w2", fmt(2 * 1.2 / n, 2) + " m"); set("w3", fmt(n * 50, 0) + " Hz");
        set("wNote", "Corda de 1,2 m com ondas a 120 m/s, presa nas duas pontas. Só cabem números inteiros de meias ondas, então a frequência fundamental é 50 Hz e os harmônicos são múltiplos dela.");
      }
      redraw();
    };
    onInput(["wm", "wn", "wv"], update);
    update();
  }

  /* ---------- Ciclo de Carnot (1 mol de gás ideal monoatômico) ---------- */
  if ($("carnot")) {
    const cv = $("carnot"), c = cv.getContext("2d"), R = 8.314, G = 5 / 3, VA = 10;
    const STAGES = [
      "1 → 2 · expansão isotérmica: recebe calor da fonte quente",
      "2 → 3 · expansão adiabática: sem trocar calor, esfria",
      "3 → 4 · compressão isotérmica: cede calor à fonte fria",
      "4 → 1 · compressão adiabática: sem trocar calor, esquenta"
    ];
    let t = 0;
    function cycle() {
      const Tq = +$("tq").value;
      let Tf = +$("tf").value;
      if (Tf > Tq - 50) { Tf = Tq - 50; $("tf").value = Tf; }
      const r = +$("tr").value, k = Math.pow(Tq / Tf, 1 / (G - 1));
      return { Tq, Tf, r, V: [VA, VA * r, VA * r * k, VA * k] };
    }
    // estado (V em litros, p em kPa, T em K) na fração s ∈ [0, 4) do ciclo
    function state(cy, s) {
      const i = Math.floor(s) % 4, f = s - Math.floor(s), Va = cy.V[i], Vb = cy.V[(i + 1) % 4];
      const V = Va * Math.pow(Vb / Va, f);
      const T = i === 0 ? cy.Tq : i === 2 ? cy.Tf : (i === 1 ? cy.Tq : cy.Tf) * Math.pow(Va / V, G - 1);
      return { V, T, p: R * T / V, i };
    }
    const redraw = animate(cv, dt => {
      t += dt;
      const cy = cycle(), W = cv.width, H = cv.height, padL = 90, padB = 64, padT = 30, padR = 30;
      const Vmax = cy.V[2] * 1.06, Pmax = R * cy.Tq / VA * 1.08;
      const X = V => padL + V / Vmax * (W - padL - padR), Y = p => H - padB - p / Pmax * (H - padB - padT);
      clear(c, cv);
      c.font = mono(17); c.lineWidth = 1;
      const sv = niceStep(Vmax, 7), sp = niceStep(Pmax, 5);
      c.textAlign = "center"; c.textBaseline = "top";
      for (let v = 0; v <= Vmax; v += sv) { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(X(v), padT); c.lineTo(X(v), Y(0)); c.stroke(); c.fillStyle = C["ink-soft"]; c.fillText(fmt(v, 0), X(v), Y(0) + 8); }
      c.textAlign = "right"; c.textBaseline = "middle";
      for (let p = 0; p <= Pmax; p += sp) { c.strokeStyle = C.grid; c.beginPath(); c.moveTo(padL, Y(p)); c.lineTo(W - padR, Y(p)); c.stroke(); c.fillStyle = C["ink-soft"]; c.fillText(fmt(p, 0), padL - 10, Y(p)); }
      c.fillStyle = C["ink-soft"]; c.textAlign = "left"; c.fillText("V (L)", W - padR - 50, Y(0) + 40);
      c.save(); c.translate(24, padT + 90); c.rotate(-Math.PI / 2); c.textAlign = "center"; c.fillText("p (kPa)", 0, 0); c.restore();
      // área do ciclo = trabalho
      const path = []; for (let s = 0; s < 4; s += 0.01) { const e = state(cy, s); path.push([X(e.V), Y(e.p)]); }
      c.fillStyle = C.accent; c.globalAlpha = 0.16; c.beginPath(); path.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill(); c.globalAlpha = 1;
      const cols = [C.accent, C["ink-soft"], C.blue, C["ink-soft"]];
      for (let i = 0; i < 4; i++) {
        c.strokeStyle = cols[i]; c.lineWidth = i % 2 ? 2 : 3.5; c.beginPath();
        for (let s = i; s <= i + 1.0001; s += 0.01) { const e = state(cy, Math.min(s, i + 0.9999)); s === i ? c.moveTo(X(e.V), Y(e.p)) : c.lineTo(X(e.V), Y(e.p)); }
        c.stroke();
      }
      c.fillStyle = C.ink; c.font = mono(19); c.textAlign = "center"; c.textBaseline = "middle";
      cy.V.forEach((V, i) => { const e = state(cy, i); const dx = i < 2 ? 0 : 0, off = [[-14, -16], [16, -16], [14, 18], [-16, 18]][i]; c.fillText(String(i + 1), X(e.V) + off[0] + dx, Y(e.p) + off[1]); });
      c.font = mono(16); c.fillStyle = C.accent; c.textAlign = "left";
      const mq = state(cy, 0.5); c.fillText(`T = ${cy.Tq} K`, X(mq.V) + 12, Y(mq.p) - 14);
      const mf = state(cy, 2.5); c.fillStyle = C.blue; c.fillText(`T = ${cy.Tf} K`, X(mf.V) + 10, Y(mf.p) + 16);
      // ponto percorrendo o ciclo, 2 s por etapa
      const s = reduce ? 0.5 : (t * 0.5) % 4, e = state(cy, s);
      c.fillStyle = e.i === 2 ? C.blue : C.accent; c.beginPath(); c.arc(X(e.V), Y(e.p), 10, 0, Math.PI * 2); c.fill();
      c.strokeStyle = C.ink; c.lineWidth = 2; c.stroke();
      c.font = mono(17); c.fillStyle = C.ink; c.textAlign = "right"; c.textBaseline = "top";
      c.fillText(STAGES[e.i], W - padR - 6, padT + 4);
      c.fillStyle = C["ink-soft"]; c.fillText(`V = ${fmt(e.V)} L   p = ${fmt(e.p, 0)} kPa   T = ${fmt(e.T, 0)} K`, W - padR - 6, padT + 30);
    });
    const update = () => {
      const cy = cycle(), eta = 1 - cy.Tf / cy.Tq, Qq = R * cy.Tq * Math.log(cy.r), Wc = eta * Qq;
      set("tqo", cy.Tq + " K"); set("tfo", cy.Tf + " K"); set("tro", fmt(cy.r));
      set("tE", fmt(eta * 100) + " %"); set("tQ", fmt(Qq, 0) + " J"); set("tW", fmt(Wc, 0) + " J");
      set("tNote", `η = 1 − T_f/T_q = 1 − ${cy.Tf}/${cy.Tq}. Por ciclo, o gás recebe ${fmt(Qq, 0)} J da fonte quente, realiza ${fmt(Wc, 0)} J de trabalho (a área colorida) e cede ${fmt(Qq - Wc, 0)} J à fonte fria. Nenhuma máquina entre essas temperaturas rende mais que a de Carnot.`);
      redraw();
    };
    onInput(["tq", "tf", "tr"], update);
    update();
  }

  /* ---------- Circuito resistivo ---------- */
  if ($("circ")) {
    const cc = $("circ"), cxx = cc.getContext("2d");
    const LOOP = 1360; // perímetro do circuito em px: 2·(400 + 280)
    let dotOff = 0;
    const circ = () => {
      const u = +$("cu").value, r1 = +$("r1").value, r2 = +$("r2").value, par = $("mode").value === "p";
      const req = par ? r1 * r2 / (r1 + r2) : r1 + r2;
      return { u, r1, r2, par, req, i: u / req };
    };
    function loopPoint(s) {
      s = ((s % LOOP) + LOOP) % LOOP;
      if (s < 400) return [150 + s, 50];
      if (s < 680) return [550, 50 + s - 400];
      if (s < 1080) return [550 - (s - 680), 330];
      return [150, 330 - (s - 1080)];
    }
    function resistor(x1, y1, x2, y2, label) {
      const vert = x1 === x2, len = vert ? y2 - y1 : x2 - x1;
      cxx.fillStyle = C.card;
      vert ? cxx.fillRect(x1 - 18, y1, 36, len) : cxx.fillRect(x1, y1 - 18, len, 36);
      cxx.strokeStyle = C.ink; cxx.lineWidth = 3; cxx.beginPath(); cxx.moveTo(x1, y1);
      for (let k = 1; k < 8; k++) {
        const d = len * k / 8, off = k % 2 ? 14 : -14;
        vert ? cxx.lineTo(x1 + off, y1 + d) : cxx.lineTo(x1 + d, y1 + off);
      }
      cxx.lineTo(x2, y2); cxx.stroke();
      cxx.fillStyle = C.ink; cxx.textBaseline = "middle";
      if (vert) { cxx.textAlign = "right"; cxx.fillText(label, x1 - 26, (y1 + y2) / 2); }
      else { cxx.textAlign = "center"; cxx.fillText(label, (x1 + x2) / 2, y1 + 38); }
    }
    const redraw = animate(cc, dt => {
      const P = circ(), W = cc.width, H = cc.height;
      dotOff = (dotOff + Math.min(Math.max(P.i * 30, 6), 240) * dt) % LOOP;
      cxx.fillStyle = C.card; cxx.fillRect(0, 0, W, H);
      cxx.strokeStyle = C.ink; cxx.lineWidth = 3; cxx.lineJoin = "round";
      cxx.strokeRect(150, 50, 400, 280);
      if (P.par) {
        cxx.beginPath(); cxx.moveTo(350, 50); cxx.lineTo(350, 330); cxx.stroke();
        cxx.fillStyle = C.ink; [50, 330].forEach(y => { cxx.beginPath(); cxx.arc(350, y, 6, 0, Math.PI * 2); cxx.fill(); });
      }
      // bateria: a placa longa é o polo positivo
      cxx.fillStyle = C.card; cxx.fillRect(126, 172, 48, 36);
      cxx.strokeStyle = C.ink; cxx.lineWidth = 3; cxx.beginPath(); cxx.moveTo(128, 182); cxx.lineTo(172, 182); cxx.stroke();
      cxx.lineWidth = 7; cxx.beginPath(); cxx.moveTo(140, 198); cxx.lineTo(160, 198); cxx.stroke();
      cxx.font = mono(20); cxx.fillStyle = C.ink; cxx.textBaseline = "middle";
      cxx.textAlign = "left"; cxx.fillText("+", 180, 174);
      cxx.textAlign = "right"; cxx.fillText(fmt(P.u) + " V", 116, 190);
      const l1 = "R₁ = " + P.r1 + " Ω", l2 = "R₂ = " + P.r2 + " Ω";
      if (P.par) { resistor(350, 130, 350, 250, l1); resistor(550, 130, 550, 250, l2); }
      else { resistor(290, 50, 410, 50, l1); resistor(550, 130, 550, 250, l2); }
      // cargas no sentido convencional da corrente
      cxx.fillStyle = C.accent;
      for (let s = dotOff; s < dotOff + LOOP; s += 40) {
        const [x, y] = loopPoint(s);
        if (x === 150 && y > 164 && y < 216) continue;
        cxx.beginPath(); cxx.arc(x, y, 5, 0, Math.PI * 2); cxx.fill();
      }
    });
    const update = () => {
      const P = circ();
      set("cuo", fmt(P.u) + " V"); set("r1o", P.r1 + " Ω"); set("r2o", P.r2 + " Ω");
      set("cReq", fmt(P.req, P.req < 10 ? 2 : 1) + " Ω"); set("cI", fmt(P.i, 2) + " A"); set("cP", fmt(P.u * P.i, 1) + " W");
      set("cNote", P.par
        ? "i₁ = " + fmt(P.u / P.r1, 2) + " A · i₂ = " + fmt(P.u / P.r2, 2) + " A · mesma tensão nos dois ramos"
        : "U₁ = " + fmt(P.i * P.r1, 2) + " V · U₂ = " + fmt(P.i * P.r2, 2) + " V · mesma corrente nos dois");
      redraw();
    };
    onInput(["cu", "r1", "r2", "mode"], update);
    update();
  }

  /* fontes carregadas: redesenha com a tipografia certa */
  if (document.fonts) document.fonts.ready.then(() => { readColors(); redraws.forEach(f => f()); });
})();

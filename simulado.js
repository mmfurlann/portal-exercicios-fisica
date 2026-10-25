// Motor dos simulados (ENEM, eletricidade...). Cada página define window.SIMULADO antes de carregar este arquivo:
// { topics: [nomes], questions: [{ g, t, q, fig?, o, a, e }], cheers?: [mensagens de acerto] }
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cfg = window.SIMULADO;
  const TOPICS = cfg.topics, Q = cfg.questions;
  const CHEERS = cfg.cheers || [
    "Mandou bem!",
    "Acertou! Raciocínio de quem estuda.",
    "Isso aí! Você não caiu na pegadinha.",
    "Na mosca!",
    "Excelente! Continue nesse ritmo.",
    "Perfeito! Conta certinha."
  ];
  const LETTERS = "ABCDE";
  const $ = id => document.getElementById(id);
  const card = $("card"), stepsEl = $("steps"), scoreEl = $("score"), topicsEl = $("topics"), scoreBox = $("scoreBox");
  let idx, right, streak, results, choice, seen, cheerPos;
  scoreBox.querySelector("small").textContent = ` / ${Q.length} acertos`;

  /* ---------- confete ---------- */
  const cv = $("confetti"), cx = cv.getContext("2d");
  let parts = [], raf = null;
  function palette() {
    const s = getComputedStyle(document.documentElement);
    return ["--ok", "--accent", "--blue", "--accent-ink"].map(k => s.getPropertyValue(k).trim());
  }
  function fitCanvas() {
    const dpr = window.devicePixelRatio || 1;
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function burst(x, y, n) {
    if (reduce) return;
    if (!raf) fitCanvas();
    const cols = palette();
    for (let i = 0; i < n; i++) {
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, sp = 4 + Math.random() * 8;
      parts.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, s: 5 + Math.random() * 5,
        r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4, c: cols[i % cols.length], life: 0 });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    cx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(p => p.life < 90 && p.y < innerHeight + 20);
    parts.forEach(p => {
      p.vy += 0.25; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
      cx.save(); cx.globalAlpha = Math.max(0, 1 - p.life / 90);
      cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c;
      cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); cx.restore();
    });
    raf = parts.length ? requestAnimationFrame(tick) : (cx.clearRect(0, 0, innerWidth, innerHeight), null);
  }
  addEventListener("resize", () => { if (raf) fitCanvas(); });

  /* ---------- som (gerado na hora pelo navegador, sem arquivos de áudio) ---------- */
  let actx = null, soundOn = true;
  try { soundOn = localStorage.getItem("som") !== "off"; } catch (e) { /* sem armazenamento: som ligado */ }
  function audio() {
    if (!soundOn) return null;
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
    }
    if (actx.state === "suspended") actx.resume();
    return actx;
  }
  function tone(ac, t, freq, dur, type, vol) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  // estouro curto: ruído filtrado que cai de agudo para grave, junto com o confete
  function boom(ac, t, vol) {
    const len = Math.floor(ac.sampleRate * 0.3), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = buf; f.type = "bandpass"; f.Q.value = 0.7;
    f.frequency.setValueAtTime(2400, t); f.frequency.exponentialRampToValueAtTime(400, t + 0.3);
    g.gain.value = vol;
    src.connect(f).connect(g).connect(ac.destination); src.start(t);
  }
  // acerto: estouro + arpejo ascendente; em sequência de acertos o arpejo sobe de tom
  function soundRight(n) {
    const ac = audio(); if (!ac) return;
    const t = ac.currentTime + 0.01, k = Math.pow(2, Math.min(Math.max(n - 2, 0), 4) / 12);
    boom(ac, t, 0.55);
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(ac, t + 0.03 + i * 0.065, f * k, 0.32, "triangle", 0.16));
    tone(ac, t + 0.3, 2093 * k, 0.4, "sine", 0.05);
  }
  function soundWrong() {
    const ac = audio(); if (!ac) return;
    const t = ac.currentTime + 0.01;
    tone(ac, t, 330, 0.16, "sine", 0.12); tone(ac, t + 0.13, 247, 0.28, "sine", 0.12);
  }
  function soundFinal() {
    const ac = audio(); if (!ac) return;
    const t = ac.currentTime + 0.01;
    [0, 0.18, 0.36].forEach(d => boom(ac, t + d, 0.45));
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(ac, t + 0.05 + i * 0.09, f, 0.5, "triangle", 0.15));
  }
  const soundBtn = document.createElement("button");
  soundBtn.type = "button"; soundBtn.className = "sound-toggle"; soundBtn.id = "sound";
  function paintSound() {
    soundBtn.setAttribute("aria-pressed", String(soundOn));
    soundBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor"/>${soundOn
      ? '<path d="M11 5.5a3.5 3.5 0 0 1 0 5M12.5 3.5a6 6 0 0 1 0 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'
      : '<path d="M11 6l4 4M15 6l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'}</svg>${soundOn ? "Som ligado" : "Som desligado"}`;
  }
  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    try { localStorage.setItem("som", soundOn ? "on" : "off"); } catch (e) { /* preferência só nesta visita */ }
    paintSound();
    if (soundOn) soundRight(0);
  });
  paintSound();
  document.querySelector(".side .label").after(soundBtn);

  /* ---------- painel lateral ---------- */
  const statusEl = $("status"), finishBtn = $("finish");
  const answeredCount = () => Q.filter((_, i) => results[i] !== undefined).length;
  function renderSide() {
    scoreEl.textContent = right;
    stepsEl.innerHTML = Q.map((_, i) => {
      const st = results[i] === true ? "ok" : results[i] === false ? "bad" : seen[i] && i !== idx ? "skip" : "";
      const what = results[i] === true ? "acertou" : results[i] === false ? "errou" : seen[i] && i !== idx ? "pulada" : "sem resposta";
      return `<button type="button" class="${st}${i === idx ? " now" : ""}" data-i="${i}" aria-label="Questão ${i + 1}, ${what}"${i === idx ? ' aria-current="step"' : ""}>${i + 1}</button>`;
    }).join("");
    topicsEl.innerHTML = TOPICS.map((name, g) => {
      const qs = Q.map((q, i) => i).filter(i => Q[i].g === g);
      const hit = qs.filter(i => results[i] === true).length;
      return `<div><span>${name}</span><span class="mono">${hit}/${qs.length}</span></div>`;
    }).join("");
    const done = answeredCount(), skipped = Q.filter((_, i) => seen[i] && results[i] === undefined && i !== idx).length;
    statusEl.textContent = `${done} de ${Q.length} respondidas` + (skipped ? ` · ${skipped} pulada${skipped > 1 ? "s" : ""}` : "");
    finishBtn.hidden = idx === -1 || done === 0;
  }
  stepsEl.addEventListener("click", e => { const b = e.target.closest("button"); if (b) go(+b.dataset.i); });
  finishBtn.addEventListener("click", renderResult);
  function plusOne() {
    if (reduce) return;
    const s = document.createElement("span"); s.className = "plus"; s.textContent = "+1";
    scoreBox.appendChild(s); setTimeout(() => s.remove(), 1000);
  }

  /* ---------- navegação ---------- */
  // próxima questão sem resposta depois de `from`, dando a volta; -1 quando todas foram respondidas
  function nextOpen(from) {
    for (let k = 1; k <= Q.length; k++) {
      const i = (from + k) % Q.length;
      if (i !== from && results[i] === undefined) return i;
    }
    return -1;
  }
  function go(i) {
    idx = i; renderQuestion();
    card.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }
  function updateNav() {
    const answered = results[idx] !== undefined, n = nextOpen(idx), next = $("next");
    $("skip").hidden = answered || n === -1;
    next.hidden = !answered;
    next.textContent = n === -1 ? "Ver resultado ▸" : "Próxima questão ▸";
  }

  /* ---------- questões ---------- */
  function renderQuestion() {
    const item = Q[idx];
    seen[idx] = true;
    card.innerHTML = `
      <div class="exam-meta"><span class="label">Questão ${String(idx + 1).padStart(2, "0")} de ${Q.length}</span><span class="pill i">${item.t}</span></div>
      <p class="exam-q">${item.q}</p>
      ${item.fig ? `<figure class="figure">${item.fig}</figure>` : ""}
      <div class="alts" role="group" aria-label="Alternativas"></div>
      <div class="feedback" id="feedback" hidden></div>
      <div class="exam-nav">
        <button class="btn ghost" type="button" id="prev"${idx === 0 ? " hidden" : ""}>◂ Anterior</button>
        <span class="spacer"></span>
        <button class="btn ghost" type="button" id="skip" hidden>Pular questão</button>
        <button class="btn" type="button" id="next" hidden></button>
      </div>`;
    const alts = card.querySelector(".alts");
    item.o.forEach((txt, oi) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "alt"; b.id = `alt${oi}`;
      b.innerHTML = `<span class="letter">${LETTERS[oi]}</span><span>${txt}</span>`;
      b.addEventListener("click", () => answer(oi));
      alts.appendChild(b);
    });
    $("prev").addEventListener("click", () => go(idx - 1));
    $("skip").addEventListener("click", () => go(nextOpen(idx)));
    $("next").addEventListener("click", () => { const n = nextOpen(idx); n === -1 ? renderResult() : go(n); });
    if (results[idx] !== undefined) showAnswer(choice[idx], false); else updateNav();
    renderSide();
  }
  function answer(oi) {
    const ok = oi === Q[idx].a;
    results[idx] = ok; choice[idx] = oi;
    if (ok) { right++; streak++; } else streak = 0;
    showAnswer(oi, true);
    renderSide();
    $("next").focus({ preventScroll: true });
  }
  // live = resposta dada agora (com animação); false = revendo uma questão já respondida
  function showAnswer(oi, live) {
    const item = Q[idx], ok = oi === item.a, fb = $("feedback");
    const btns = card.querySelectorAll(".alt"), btn = btns[oi], L = LETTERS[item.a];
    btns.forEach((b, bi) => {
      b.disabled = true;
      if (bi === item.a) b.classList.add("right"); else if (bi !== oi) b.classList.add("dim");
    });
    const pop = live ? " pop" : "";
    if (ok) {
      const msg = !live ? "Você acertou esta." : streak >= 3 ? `${streak} seguidas! Você está voando.` : CHEERS[cheerPos++ % CHEERS.length];
      fb.innerHTML = `<div class="cheer${pop}">
          <svg class="${live ? "check-draw" : ""}" width="40" height="40" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="17" fill="var(--ok)"/><path d="M10 18.5l5.5 5.5L26 13" fill="none" stroke="var(--card)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div><div class="big">${msg}</div><div>Resposta certa: alternativa ${L}.</div></div>
        </div><p class="explain">${item.e}</p>`;
      if (live) {
        btn.classList.add("celebrate");
        const r = btn.querySelector(".letter").getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2, 80);
        plusOne();
        soundRight(streak);
      }
    } else {
      btn.classList.add("wrong");
      if (live) { btn.classList.add("shake"); soundWrong(); }
      const sub = live ? "Leia a resolução e siga em frente, errar aqui é melhor que errar na prova." : `Você marcou a alternativa ${LETTERS[oi]}.`;
      fb.innerHTML = `<div class="cheer miss${pop}"><div><div class="big">${live ? "Quase! " : ""}A resposta é a ${L}.</div><div>${sub}</div></div></div><p class="explain">${item.e}</p>`;
    }
    fb.hidden = false;
    updateNav();
  }
  function renderResult() {
    const pct = Math.round(right / Q.length * 100), blank = Q.length - answeredCount();
    const [title, text] =
      right >= 9 ? ["Nível aprovação!", "Você dominou os temas que mais caem. Mantenha o ritmo com revisões curtas ao longo da semana."] :
      right >= 7 ? ["Muito bem!", "Sua base está sólida. Revise as questões que errou e você chega lá."] :
      right >= 5 ? ["Bom começo!", "Metade do caminho já foi. Revise os temas com menos acertos no painel e refaça o simulado."] :
                   ["Todo mundo começa de algum lugar.", "Use as bancadas do laboratório para ver cada fórmula funcionando e tente de novo."];
    card.innerHTML = `
      <div class="exam-meta"><span class="label">Resultado do simulado</span></div>
      <h3 class="result-title" id="resultTitle">${title}</h3>
      <p class="mono result-score">${right} de ${Q.length} acertos · ${pct}%${blank ? ` · ${blank} em branco` : ""}</p>
      <p class="explain">${text} Clique nos números do painel para rever qualquer questão com a resolução.</p>
      <div class="cta-row" style="margin-top: 0;">
        ${blank ? '<button class="btn accent" type="button" id="resume">Responder as que faltam</button>' : ""}
        <button class="btn ${blank ? "ghost" : "accent"}" type="button" id="again">Refazer simulado</button>
        <a class="btn ghost" href="laboratorio.html">Ir para o laboratório</a>
      </div>`;
    idx = -1; renderSide();
    $("again").addEventListener("click", start);
    if (blank) $("resume").addEventListener("click", () => go(nextOpen(-1)));
    if (right >= 7) {
      soundFinal();
      const r = $("resultTitle").getBoundingClientRect();
      [0.2, 0.5, 0.8].forEach((f, i) => setTimeout(() => burst(r.left + r.width * f, r.top + r.height / 2, 70), i * 180));
    }
  }
  function start() {
    idx = 0; right = 0; streak = 0; results = []; choice = []; seen = [];
    cheerPos = Math.floor(Math.random() * CHEERS.length);
    renderQuestion();
  }
  start();
})();

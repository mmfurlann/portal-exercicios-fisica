/*
 * A Jornada até Einstein — lógica do jogo (sem DOM, testável em Node)
 * ------------------------------------------------------------
 * Todas as regras vivem aqui: tabuleiro, casas especiais, sorteio de questões,
 * pontuação, sequência, medalhas, conquistas, evolução do personagem e
 * salvamento/recuperação (com tratamento de dados inválidos).
 *
 * O estado é um objeto simples (serializável em JSON). As funções que mudam o
 * jogo (startChallenge, answer, ...) alteram o estado recebido e devolvem um
 * resultado descrevendo o que aconteceu, para a interface animar.
 */
(function (root, factory) {
  var isNode = typeof module === 'object' && module.exports;
  var Questions = isNode ? require('./questions.js') : (root.JE && root.JE.Questions);
  var api = factory(Questions);
  if (isNode) module.exports = api;
  else { root.JE = root.JE || {}; root.JE.Logic = api; }
})(typeof self !== 'undefined' ? self : this, function (Questions) {
  'use strict';

  const SAVE_VERSION = 1;
  const STORAGE_KEY = 'jornada-einstein:save';
  const TOTAL_CELLS = 30;
  const MAX_HINTS = 3;           // limite de Pistas guardadas
  const LEVEL_BASE = [100, 150, 200, 250, 300];
  const HISTORY_CAP = 1000;

  /* ------------------------------------------------------------------ */
  /* Regiões, tipos de casa e tabuleiro                                  */
  /* ------------------------------------------------------------------ */

  const REGIONS = [
    { id: 1, name: 'Curiosidade científica', start: 1, end: 6, level: 1, stars: 1, difficulty: 'Fácil',
      scene: 'laboratório', blurb: 'Grandezas, unidades e observações do dia a dia.' },
    { id: 2, name: 'Aprendiz de Física', start: 7, end: 12, level: 2, stars: 2, difficulty: 'Fácil a intermediário',
      scene: 'oficina', blurb: 'Movimento, força, energia, calor, densidade e eletricidade básica.' },
    { id: 3, name: 'Jovem cientista', start: 13, end: 18, level: 3, stars: 3, difficulty: 'Intermediário',
      scene: 'circuitos', blurb: 'Leis de Newton, gráficos, potência, circuitos, ondas e óptica.' },
    { id: 4, name: 'Mestre dos fenômenos', start: 19, end: 24, level: 4, stars: 4, difficulty: 'Intermediário a avançado',
      scene: 'observatório', blurb: 'Gráficos, experimentos, problemas quantitativos e sistemas físicos.' },
    { id: 5, name: 'Desafio de Einstein', start: 25, end: 30, level: 5, stars: 5, difficulty: 'Avançado',
      scene: 'cosmos', blurb: 'Problemas com várias etapas, integração de conteúdos e análise crítica.' }
  ];

  const CELL_TYPES = {
    start:   { id: 'start',   label: 'Largada',             short: 'Início',  mult: 0,    adv: 0, question: false,
               rule: 'Aqui começa a sua jornada.' },
    desafio: { id: 'desafio', label: 'Desafio científico',  short: 'Desafio', mult: 1,    adv: 1, question: true,
               rule: 'Questão obrigatória. Acertou: avança 1 casa.' },
    lab:     { id: 'lab',     label: 'Laboratório',         short: 'Lab',     mult: 1.25, adv: 1, question: true,
               rule: 'Questão experimental ou de interpretação de dados. Acertou: avança 1 casa, com pontos ×1,25.' },
    desc:    { id: 'desc',    label: 'Descoberta',          short: 'Eureca',  mult: 1,    adv: 2, question: true, bonus: 150, hint: 1,
               rule: 'Acertou: avança 2 casas, ganha 150 pontos de bônus e 1 Pista.' },
    rev:     { id: 'rev',     label: 'Revisão',             short: 'Revisão', mult: 1,    adv: 1, question: true, recoverBonus: 80,
               rule: 'Retoma um conceito anterior (de preferência uma questão que você errou). Recuperar o conceito vale +80 pontos.' },
    gd:      { id: 'gd',      label: 'Grande desafio',      short: 'Grande',  mult: 2,    adv: 1, question: true, hintOnWrong: 1,
               rule: 'Questão mais difícil da região, com pontos ×2. Se errar, você ganha 1 Pista para tentar de novo.' },
    marco:   { id: 'marco',   label: 'Marco científico',    short: 'Marco',   mult: 0,    adv: 0, question: false, auto: true,
               rule: 'Ao completar a região você recebe uma medalha, pontos de bônus e o personagem evolui.' },
    final:   { id: 'final',   label: 'Desafio de Einstein', short: 'Final',   mult: 3,    adv: 1, question: true, bonus: 500,
               rule: 'A última casa. Acertar completa a sua transformação em Einstein e vence o jogo.' }
  };

  // tipo de cada casa, de 1 a 30
  const PLAN = [null,
    'start', 'desafio', 'desc', 'lab', 'gd', 'marco',
    'desafio', 'desc', 'lab', 'rev', 'gd', 'marco',
    'desafio', 'rev', 'desc', 'lab', 'gd', 'marco',
    'rev', 'desafio', 'desc', 'lab', 'gd', 'marco',
    'desafio', 'desc', 'lab', 'rev', 'gd', 'final'
  ];

  function regionOf(n) {
    for (let i = 0; i < REGIONS.length; i++) if (n >= REGIONS[i].start && n <= REGIONS[i].end) return REGIONS[i];
    return REGIONS[REGIONS.length - 1];
  }

  const BOARD = [null];
  for (let n = 1; n <= TOTAL_CELLS; n++) {
    BOARD.push({ n: n, type: PLAN[n], region: regionOf(n).id });
  }

  function cellInfo(n) { return BOARD[n] || null; }
  function typeOf(n) { return CELL_TYPES[BOARD[n].type]; }

  const STAGES = [
    null,
    { id: 1, name: 'Estudante curioso',   motto: 'Tudo começa com uma pergunta.' },
    { id: 2, name: 'Aprendiz de Física',  motto: 'Caderno na mão e olhar atento.' },
    { id: 3, name: 'Jovem cientista',     motto: 'Jaleco, óculos e muitos experimentos.' },
    { id: 4, name: 'Físico experiente',   motto: 'Equações no quadro, ideias em ebulição.' },
    { id: 5, name: 'Einstein',            motto: 'A imaginação é mais importante que o conhecimento.' }
  ];

  /* ------------------------------------------------------------------ */
  /* Utilidades                                                          */
  /* ------------------------------------------------------------------ */

  function makeRng(seed) { // mulberry32 — determinístico, útil para testes
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor((rng || Math.random)() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const round5 = (v) => Math.round(v / 5) * 5;
  const isInt = (v) => typeof v === 'number' && isFinite(v) && Math.floor(v) === v;
  const nonNegInt = (v, d) => (isInt(v) && v >= 0 ? v : d);

  function isPermutation(arr) {
    if (!Array.isArray(arr) || arr.length !== 5) return false;
    const seen = [false, false, false, false, false];
    for (let i = 0; i < 5; i++) {
      if (!isInt(arr[i]) || arr[i] < 0 || arr[i] > 4 || seen[arr[i]]) return false;
      seen[arr[i]] = true;
    }
    return true;
  }

  /* ------------------------------------------------------------------ */
  /* Estado                                                              */
  /* ------------------------------------------------------------------ */

  function emptyThemeStats() {
    const o = {};
    Questions.THEME_IDS.forEach((t) => { o[t] = { c: 0, w: 0 }; });
    return o;
  }

  function newGame(now) {
    const t = typeof now === 'number' ? now : Date.now();
    return {
      version: SAVE_VERSION,
      status: 'playing',        // 'playing' | 'won'
      pos: 1,
      score: 0,
      streak: 0,
      bestStreak: 0,
      correct: 0,
      wrong: 0,
      wrongRun: 0,              // erros consecutivos (ativa o apoio automático)
      hints: 1,                 // Pistas disponíveis
      activeMs: 0,
      startedAt: t,
      finishedAt: null,
      medals: [false, false, false, false, false],
      achievements: {},
      used: [],
      missed: [],
      themeStats: emptyThemeStats(),
      history: [],
      pending: null,
      lastResult: null,
      ceremonies: []
    };
  }

  function hasProgress(state) {
    return !!state && (state.pos > 1 || state.history.length > 0 || !!state.pending || state.status === 'won');
  }

  function medalsFromPosition(state) {
    return REGIONS.map((r, i) => (i < 4 ? state.pos >= r.end : state.status === 'won'));
  }

  /** Estágio visual do personagem (1..5) e variáveis de transformação gradual. */
  function stageOf(state) {
    if (state.status === 'won') return { stage: 5, blend: 1, hairT: 1 };
    let medals = 0;
    for (let i = 0; i < 4; i++) if (state.pos >= REGIONS[i].end) medals++;
    const stage = Math.min(4, medals + 1);
    let region = regionOf(state.pos);
    let idx = region.id - 1;
    if (state.pos >= region.end && region.id < 5) idx++;
    const r = REGIONS[idx];
    const blend = clamp((state.pos - r.start) / (r.end - r.start), 0, 1);
    const hairT = clamp((state.pos - 1) / (TOTAL_CELLS - 1), 0, 1);
    return { stage: stage, blend: blend, hairT: hairT, medals: medals };
  }

  /* ------------------------------------------------------------------ */
  /* Sorteio de questões                                                 */
  /* ------------------------------------------------------------------ */

  function themeCount(state, theme) {
    const t = state.themeStats[theme];
    return t ? t.c + t.w : 0;
  }

  function pickWeighted(cands, state, rng) {
    // prefere temas ainda pouco vistos, para variar o conteúdo
    let min = Infinity;
    cands.forEach((q) => { min = Math.min(min, themeCount(state, q.theme)); });
    const best = cands.filter((q) => themeCount(state, q.theme) === min);
    return best[Math.floor((rng || Math.random)() * best.length)];
  }

  function pickQuestion(state, cellN, rng) {
    const all = Questions.QUESTIONS;
    const type = BOARD[cellN].type;
    const L = regionOf(cellN).level;
    const used = {};
    state.used.forEach((id) => { used[id] = true; });
    const last = state.history.length ? state.history[state.history.length - 1].qid : null;
    const fresh = (q) => !used[q.id] && q.id !== last;

    if (type === 'rev') {
      const missed = state.missed.filter((id) => Questions.BY_ID[id] && id !== last);
      if (missed.length) return { q: Questions.BY_ID[missed[0]], review: true };
      const earlier = all.filter((q) => q.level < L && fresh(q));
      if (earlier.length) return { q: pickWeighted(earlier, state, rng), review: false };
    }

    const filters = [];
    if (type === 'lab') filters.push((q) => q.level === L && q.kind === 'lab' && !q.final, (q) => q.level === L && q.kind === 'lab');
    if (type === 'gd') filters.push((q) => q.level === L && q.big && !q.final, (q) => q.level === L && q.big);
    if (type === 'final') filters.push((q) => q.level === 5 && q.final, (q) => q.level === 5 && q.big);
    filters.push(
      (q) => q.level === L && q.kind !== 'lab' && !q.final,
      (q) => q.level === L && !q.final,
      (q) => q.level === L,
      (q) => Math.abs(q.level - L) === 1 && !q.final
    );

    for (let i = 0; i < filters.length; i++) {
      const cands = all.filter((q) => filters[i](q) && fresh(q));
      if (cands.length) return { q: pickWeighted(cands, state, rng), review: false };
    }

    // banco esgotado: reaproveita a questão do nível vista há mais tempo
    const lastSeen = (id) => {
      for (let i = state.history.length - 1; i >= 0; i--) if (state.history[i].qid === id) return i;
      return -1;
    };
    const pool = all.filter((q) => q.level === L && q.id !== last).sort((a, b) => lastSeen(a.id) - lastSeen(b.id));
    return { q: pool[0] || all[0], review: false };
  }

  /* ------------------------------------------------------------------ */
  /* Desafios                                                            */
  /* ------------------------------------------------------------------ */

  function chooseEliminations(q, order, rng, keep) {
    // índices (na ordem apresentada) das alternativas erradas
    const wrongPres = [];
    for (let i = 0; i < 5; i++) if (order[i] !== q.correct && keep.indexOf(i) < 0) wrongPres.push(i);
    return shuffle(wrongPres, rng).slice(0, 2).sort();
  }

  function canAdvanceTo(state, n) {
    if (state.status !== 'playing') return { ok: false, reason: 'A jornada já foi concluída.' };
    if (n === state.pos) return { ok: false, reason: 'Você já está nesta casa.' };
    if (n < state.pos) return { ok: false, reason: 'Você já passou por esta casa.' };
    if (n !== state.pos + 1) return { ok: false, reason: 'Só é possível avançar para a próxima casa, respondendo ao desafio dela.' };
    return { ok: true };
  }

  /** Abre (ou retoma) o desafio da próxima casa. Nunca troca a questão de um desafio já aberto. */
  function startChallenge(state, rng) {
    if (state.status !== 'playing') return { ok: false, error: 'not-playing' };
    if (state.pending) return { ok: true, resumed: true, view: pendingView(state) };
    const cellN = state.pos + 1;
    if (cellN > TOTAL_CELLS) return { ok: false, error: 'end-of-board' };
    const type = BOARD[cellN].type;
    if (!CELL_TYPES[type].question) return { ok: false, error: 'no-challenge' };

    const pick = pickQuestion(state, cellN, rng);
    const q = pick.q;
    const order = q.fixedOrder ? [0, 1, 2, 3, 4] : shuffle([0, 1, 2, 3, 4], rng);
    const pending = { cell: cellN, qid: q.id, order: order, hintUsed: false, eliminated: [], support: false, review: !!pick.review };
    if (state.wrongRun >= 2) { // apoio automático após dois erros seguidos
      pending.eliminated = chooseEliminations(q, order, rng, []);
      pending.support = true;
    }
    state.pending = pending;
    return { ok: true, resumed: false, view: pendingView(state) };
  }

  /** Dados do desafio aberto, SEM o gabarito. */
  function pendingView(state) {
    const p = state.pending;
    if (!p) return null;
    const q = Questions.BY_ID[p.qid];
    const cell = BOARD[p.cell];
    const region = regionOf(p.cell);
    return {
      cell: p.cell,
      type: cell.type,
      typeInfo: CELL_TYPES[cell.type],
      region: region,
      level: q.level,
      theme: q.theme,
      themeLabel: Questions.themeLabel(q.theme),
      qid: q.id,
      statement: q.statement,
      figure: q.figure || null,
      alternatives: p.order.map((orig) => q.alternatives[orig]),
      eliminated: p.eliminated.slice(),
      hintUsed: p.hintUsed,
      hasHint: !!q.hint,
      hintsLeft: state.hints,
      support: p.support,
      review: p.review
    };
  }

  /** Dica de texto: gratuita, mas reduz em 25% os pontos-base da questão. */
  function useHint(state) {
    const p = state.pending;
    if (!p) return { ok: false, error: 'no-pending' };
    const q = Questions.BY_ID[p.qid];
    p.hintUsed = true;
    return { ok: true, text: q.hint || 'Releia o enunciado, identifique os dados e a grandeza pedida e escolha a fórmula adequada.' };
  }

  /** Pista de cientista: gasta 1 Pista e elimina 2 alternativas erradas. */
  function usePista(state, rng) {
    const p = state.pending;
    if (!p) return { ok: false, error: 'no-pending' };
    if (p.eliminated.length > 0) return { ok: false, error: 'already-used' };
    if (state.hints <= 0) return { ok: false, error: 'no-hints' };
    const q = Questions.BY_ID[p.qid];
    p.eliminated = chooseEliminations(q, p.order, rng, []);
    state.hints -= 1;
    return { ok: true, eliminated: p.eliminated.slice(), hintsLeft: state.hints };
  }

  /* ------------------------------------------------------------------ */
  /* Resposta                                                            */
  /* ------------------------------------------------------------------ */

  const CORRECT_MSGS = [
    'Excelente raciocínio, cientista!',
    'É isso aí! A Física está do seu lado.',
    'Hipótese confirmada!',
    'Muito bem! Você leu os dados com atenção.',
    'Que dedução brilhante!',
    'Resultado certeiro. Continue assim!'
  ];
  const WRONG_MSGS = [
    'Quase lá! Errar faz parte do método científico.',
    'Todo grande cientista já errou muito. Veja o raciocínio e tente de novo.',
    'Boa tentativa! O erro é um dado valioso.',
    'Sem problema: entender o erro já é aprender.',
    'Cada tentativa deixa você mais perto da resposta.'
  ];

  const ACHIEVEMENTS = [
    { id: 'primeiro',    title: 'Primeira descoberta',      desc: 'Acerte a sua primeira questão.',
      test: (s) => s.correct >= 1 },
    { id: 'seq3',        title: 'Em ritmo de laboratório',  desc: 'Acerte 3 questões seguidas.',
      test: (s) => s.bestStreak >= 3 },
    { id: 'seq5',        title: 'Mente afiada',             desc: 'Acerte 5 questões seguidas.',
      test: (s) => s.bestStreak >= 5 },
    { id: 'seq10',       title: 'Cientista imparável',      desc: 'Acerte 10 questões seguidas.',
      test: (s) => s.bestStreak >= 10 },
    { id: 'persistente', title: 'Persistência é o método',  desc: 'Acerte uma casa depois de ter errado nela.',
      test: (s, c) => c.ok && c.retry },
    { id: 'eureca',      title: 'Eureca!',                  desc: 'Acerte uma casa de Descoberta.',
      test: (s, c) => c.ok && c.type === 'desc' },
    { id: 'laboratorio', title: 'Mão na massa',             desc: 'Acerte 3 questões de Laboratório.',
      test: (s) => s.history.filter((h) => h.ok && h.type === 'lab').length >= 3 },
    { id: 'revisor',     title: 'Aprendendo com o erro',    desc: 'Recupere um conceito que você havia errado.',
      test: (s, c) => c.recovered },
    { id: 'semdica',     title: 'Sem muletas',              desc: 'Acerte 5 questões sem usar dicas.',
      test: (s) => s.history.filter((h) => h.ok && !h.hint).length >= 5 },
    { id: 'polimata',    title: 'Polímata',                 desc: 'Acerte questões de 8 temas diferentes.',
      test: (s) => { const t = {}; s.history.forEach((h) => { if (h.ok) t[h.theme] = 1; }); return Object.keys(t).length >= 8; } },
    { id: 'grande',      title: 'Grande desafio vencido',   desc: 'Vença um Grande desafio.',
      test: (s, c) => c.ok && c.type === 'gd' },
    { id: 'colecionador',title: 'Colecionador de medalhas', desc: 'Conquiste 4 medalhas de região.',
      test: (s) => s.medals.filter(Boolean).length >= 4 },
    { id: 'einstein',    title: 'Einstein!',                desc: 'Complete a jornada e se transforme em Einstein.',
      test: (s) => s.status === 'won' },
    { id: 'impecavel',   title: 'Jornada impecável',        desc: 'Vença com pelo menos 85% de acertos.',
      test: (s) => s.status === 'won' && accuracy(s) >= 0.85 }
  ];

  function accuracy(state) {
    const total = state.correct + state.wrong;
    return total ? state.correct / total : 0;
  }

  function computePoints(state, q, type, pending, streakAfter, recovered) {
    const T = CELL_TYPES[type];
    const base = LEVEL_BASE[q.level - 1] * T.mult * (pending.hintUsed ? 0.75 : 1);
    const parts = { base: round5(base), streak: Math.min(streakAfter - 1, 10) * 10, bonus: 0, recovered: 0 };
    if (T.bonus && type === 'desc') parts.bonus = T.bonus;
    if (recovered) parts.recovered = T.recoverBonus || 80;
    parts.total = parts.base + parts.streak + parts.bonus + parts.recovered;
    return parts;
  }

  function pushCeremony(state, c) { state.ceremonies.push(c); return c; }

  /**
   * Registra a resposta (índice na ordem APRESENTADA, 0..4) ao desafio aberto.
   * O desafio é consumido imediatamente: respostas repetidas são rejeitadas,
   * então a pontuação não pode ser acumulada por cliques repetidos.
   */
  function answer(state, chosen, now) {
    if (state.status !== 'playing') return { ok: false, error: 'not-playing' };
    const p = state.pending;
    if (!p) return { ok: false, error: 'no-pending' };
    if (!isInt(chosen) || chosen < 0 || chosen > 4) return { ok: false, error: 'invalid-choice' };
    if (p.eliminated.indexOf(chosen) >= 0) return { ok: false, error: 'eliminated' };
    const q = Questions.BY_ID[p.qid];
    if (!q) { state.pending = null; return { ok: false, error: 'unknown-question' }; }

    state.pending = null; // consome o desafio antes de qualquer outra coisa

    const t = typeof now === 'number' ? now : Date.now();
    const cellN = p.cell;
    const type = BOARD[cellN].type;
    const T = CELL_TYPES[type];
    const region = regionOf(cellN);
    const origChosen = p.order[chosen];
    const correct = origChosen === q.correct;
    const correctPres = p.order.indexOf(q.correct);
    const from = state.pos;
    const events = [];
    const wasMissed = state.missed.indexOf(q.id) >= 0;
    const retry = state.history.some((h) => h.cell === cellN && !h.ok);

    const result = {
      ok: true, correct: correct, qid: q.id, cell: cellN, type: type, regionId: region.id,
      chosen: chosen, correctPres: correctPres, order: p.order.slice(),
      solution: q.solution,
      chosenNote: correct ? null : q.distractors[origChosen],
      from: from, to: from, path: [], points: 0, parts: null,
      recovered: false, hintGained: 0, events: events, victory: false
    };

    if (state.used.indexOf(q.id) < 0) state.used.push(q.id);
    const ts = state.themeStats[q.theme] || (state.themeStats[q.theme] = { c: 0, w: 0 });

    if (correct) {
      state.correct += 1;
      state.streak += 1;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      state.wrongRun = 0;
      ts.c += 1;
      if (wasMissed) { state.missed = state.missed.filter((id) => id !== q.id); result.recovered = true; }

      const parts = computePoints(state, q, type, p, state.streak, result.recovered);
      result.parts = parts;
      let gained = parts.total;

      if (T.hint) { state.hints = Math.min(MAX_HINTS, state.hints + T.hint); result.hintGained += T.hint; }

      // avanço pelo tabuleiro
      let to = from;
      for (let k = 1; k <= T.adv; k++) {
        const c = from + k;
        if (c > TOTAL_CELLS) break;
        if (k > 1 && (BOARD[c].type === 'gd' || BOARD[c].type === 'final' || BOARD[c].type === 'marco')) break;
        to = c;
        result.path.push(c);
      }
      state.pos = to;

      if (type === 'final') {
        state.status = 'won';
        state.finishedAt = t;
        state.medals = medalsFromPosition(state);
        gained += T.bonus;
        result.parts.final = T.bonus;
        result.parts.total += T.bonus;
        result.victory = true;
        events.push({ type: 'medal', region: 5 });
        events.push({ type: 'victory' });
      } else {
        // casas de Marco são atravessadas automaticamente após o desafio anterior
        while (state.pos < TOTAL_CELLS && BOARD[state.pos + 1].type === 'marco') {
          state.pos += 1;
          result.path.push(state.pos);
          const r = regionOf(state.pos);
          const medalBonus = 200 * r.id;
          gained += medalBonus;
          result.parts.marco = (result.parts.marco || 0) + medalBonus;
          result.parts.total += medalBonus;
          state.medals = medalsFromPosition(state);
          events.push({ type: 'medal', region: r.id });
          events.push({ type: 'stage', stage: stageOf(state).stage, region: r.id });
        }
      }
      result.to = state.pos;
      state.score += gained;
      result.points = gained;
      result.message = CORRECT_MSGS[state.history.length % CORRECT_MSGS.length];
    } else {
      state.wrong += 1;
      state.streak = 0;
      state.wrongRun += 1;
      ts.w += 1;
      if (state.missed.indexOf(q.id) < 0) state.missed.push(q.id);
      if (T.hintOnWrong && state.hints < MAX_HINTS) { state.hints += T.hintOnWrong; result.hintGained += T.hintOnWrong; }
      result.message = WRONG_MSGS[state.history.length % WRONG_MSGS.length];
    }

    state.history.push({ cell: cellN, type: type, qid: q.id, theme: q.theme, level: q.level, ok: correct,
      hint: p.hintUsed, pts: result.points, t: t });
    if (state.history.length > HISTORY_CAP) state.history.splice(0, state.history.length - HISTORY_CAP);

    state.lastResult = { qid: q.id, order: p.order.slice(), chosen: chosen, ok: correct, points: result.points, cell: cellN };

    // conquistas
    const ctx = { ok: correct, type: type, retry: retry, recovered: result.recovered, q: q };
    ACHIEVEMENTS.forEach((a) => {
      if (!state.achievements[a.id] && a.test(state, ctx)) {
        state.achievements[a.id] = t;
        events.push({ type: 'achievement', id: a.id });
      }
    });

    events.forEach((e) => pushCeremony(state, e));
    return result;
  }

  /** Remove e devolve a próxima cerimônia pendente (medalha, evolução, conquista, vitória). */
  function nextCeremony(state) { return state.ceremonies.length ? state.ceremonies.shift() : null; }

  function addActiveTime(state, ms) {
    if (state.status !== 'playing' || !(ms > 0)) return;
    state.activeMs += Math.min(ms, 5000); // ignora intervalos longos (aba parada)
  }

  /* ------------------------------------------------------------------ */
  /* Resumo                                                              */
  /* ------------------------------------------------------------------ */

  function summary(state) {
    const total = state.correct + state.wrong;
    const byTheme = Questions.THEME_IDS.map((id) => {
      const s = state.themeStats[id] || { c: 0, w: 0 };
      const n = s.c + s.w;
      return { theme: id, label: Questions.themeLabel(id), correct: s.c, wrong: s.w, total: n, pct: n ? Math.round(100 * s.c / n) : null };
    }).filter((t) => t.total > 0);
    return {
      score: state.score, correct: state.correct, wrong: state.wrong, answered: total,
      accuracy: total ? state.correct / total : 0,
      bestStreak: state.bestStreak,
      elapsedMs: state.activeMs,
      byTheme: byTheme,
      medals: state.medals.filter(Boolean).length,
      achievements: Object.keys(state.achievements).length
    };
  }

  function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    const mm = (h ? String(m).padStart(2, '0') : String(m));
    return (h ? h + ':' : '') + mm + ':' + String(sec).padStart(2, '0');
  }

  /* ------------------------------------------------------------------ */
  /* Salvamento e recuperação                                            */
  /* ------------------------------------------------------------------ */

  /**
   * Valida e repara um estado vindo do navegador. Devolve um estado seguro ou
   * null (dados ausentes, inválidos ou de versão futura). Nunca lança erro.
   */
  function sanitizeState(raw, now) {
    try {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
      if (isInt(raw.version) && raw.version > SAVE_VERSION) return null; // versão desconhecida
      const s = newGame(now);
      s.pos = isInt(raw.pos) ? clamp(raw.pos, 1, TOTAL_CELLS) : 1;
      s.score = nonNegInt(raw.score, 0);
      s.correct = nonNegInt(raw.correct, 0);
      s.wrong = nonNegInt(raw.wrong, 0);
      s.streak = nonNegInt(raw.streak, 0);
      s.bestStreak = Math.max(s.streak, nonNegInt(raw.bestStreak, 0));
      s.wrongRun = nonNegInt(raw.wrongRun, 0);
      s.hints = clamp(nonNegInt(raw.hints, 1), 0, MAX_HINTS);
      s.activeMs = nonNegInt(raw.activeMs, 0);
      s.startedAt = isInt(raw.startedAt) && raw.startedAt > 0 ? raw.startedAt : s.startedAt;
      s.finishedAt = isInt(raw.finishedAt) ? raw.finishedAt : null;

      if (Array.isArray(raw.used)) s.used = raw.used.filter((id, i, a) => typeof id === 'string' && Questions.BY_ID[id] && a.indexOf(id) === i);
      if (Array.isArray(raw.missed)) s.missed = raw.missed.filter((id, i, a) => typeof id === 'string' && Questions.BY_ID[id] && a.indexOf(id) === i);

      if (raw.themeStats && typeof raw.themeStats === 'object') {
        Questions.THEME_IDS.forEach((id) => {
          const t = raw.themeStats[id];
          if (t && typeof t === 'object') s.themeStats[id] = { c: nonNegInt(t.c, 0), w: nonNegInt(t.w, 0) };
        });
      }
      if (raw.achievements && typeof raw.achievements === 'object') {
        ACHIEVEMENTS.forEach((a) => { if (isInt(raw.achievements[a.id])) s.achievements[a.id] = raw.achievements[a.id]; });
      }
      if (Array.isArray(raw.history)) {
        s.history = raw.history.filter((h) => h && typeof h === 'object' && Questions.BY_ID[h.qid] && isInt(h.cell) && typeof h.ok === 'boolean')
          .map((h) => ({ cell: h.cell, type: typeof h.type === 'string' ? h.type : 'desafio', qid: h.qid,
            theme: Questions.BY_ID[h.qid].theme, level: Questions.BY_ID[h.qid].level, ok: h.ok,
            hint: !!h.hint, pts: nonNegInt(h.pts, 0), t: isInt(h.t) ? h.t : 0 }))
          .slice(-HISTORY_CAP);
      }

      // status só pode ser "won" se o jogador está na última casa
      s.status = raw.status === 'won' && s.pos === TOTAL_CELLS ? 'won' : 'playing';
      if (s.status === 'playing') s.finishedAt = null;
      s.medals = medalsFromPosition(s);

      // desafio aberto: precisa ser coerente com a posição e com o banco de questões
      const p = raw.pending;
      if (s.status === 'playing' && p && typeof p === 'object' && p.cell === s.pos + 1 && s.pos < TOTAL_CELLS
          && CELL_TYPES[BOARD[p.cell].type].question && Questions.BY_ID[p.qid] && isPermutation(p.order)) {
        const q = Questions.BY_ID[p.qid];
        const correctPres = p.order.indexOf(q.correct);
        const elim = Array.isArray(p.eliminated)
          ? p.eliminated.filter((i, k, a) => isInt(i) && i >= 0 && i <= 4 && i !== correctPres && a.indexOf(i) === k).slice(0, 2)
          : [];
        s.pending = { cell: p.cell, qid: p.qid, order: p.order.slice(), hintUsed: !!p.hintUsed, eliminated: elim,
          support: !!p.support, review: !!p.review };
      }

      const lr = raw.lastResult;
      if (lr && typeof lr === 'object' && Questions.BY_ID[lr.qid] && isPermutation(lr.order) && isInt(lr.chosen) && lr.chosen >= 0 && lr.chosen <= 4) {
        s.lastResult = { qid: lr.qid, order: lr.order.slice(), chosen: lr.chosen, ok: !!lr.ok, points: nonNegInt(lr.points, 0), cell: isInt(lr.cell) ? lr.cell : 0 };
      }

      if (Array.isArray(raw.ceremonies)) {
        s.ceremonies = raw.ceremonies.filter((c) => c && typeof c === 'object' &&
          (c.type === 'medal' || c.type === 'stage' || c.type === 'achievement' || c.type === 'victory')).slice(0, 20)
          .map((c) => {
            const o = { type: c.type };
            if (isInt(c.region)) o.region = c.region;
            if (isInt(c.stage)) o.stage = c.stage;
            if (typeof c.id === 'string') o.id = c.id;
            return o;
          });
      }
      return s;
    } catch (e) {
      return null;
    }
  }

  function serialize(state, now) {
    return JSON.stringify({ version: SAVE_VERSION, savedAt: typeof now === 'number' ? now : Date.now(), state: state });
  }

  /** Lê o texto salvo. Aceita o formato atual e dados antigos sem "version". Nunca lança erro. */
  function deserialize(text, now) {
    try {
      if (typeof text !== 'string' || !text) return null;
      const raw = JSON.parse(text);
      if (!raw || typeof raw !== 'object') return null;
      const inner = raw.state && typeof raw.state === 'object' ? raw.state : raw; // formato antigo: estado direto
      if (isInt(raw.version) && raw.version > SAVE_VERSION) return null;
      return sanitizeState(inner, now);
    } catch (e) {
      return null;
    }
  }

  /** Armazenamento com fallback em memória (navegação privada, localStorage bloqueado). */
  function createStore(storage, key) {
    const k = key || STORAGE_KEY;
    let mem = null;
    const ok = (() => { try { return !!storage && typeof storage.getItem === 'function'; } catch (e) { return false; } })();
    return {
      load() {
        try { const t = ok ? storage.getItem(k) : mem; return deserialize(t); } catch (e) { return deserialize(mem); }
      },
      save(state) {
        const text = serialize(state);
        mem = text;
        try { if (ok) storage.setItem(k, text); return true; } catch (e) { return false; }
      },
      clear() {
        mem = null;
        try { if (ok) storage.removeItem(k); } catch (e) { /* ignora */ }
      }
    };
  }

  return {
    SAVE_VERSION: SAVE_VERSION, STORAGE_KEY: STORAGE_KEY, TOTAL_CELLS: TOTAL_CELLS, MAX_HINTS: MAX_HINTS,
    REGIONS: REGIONS, CELL_TYPES: CELL_TYPES, BOARD: BOARD, STAGES: STAGES, ACHIEVEMENTS: ACHIEVEMENTS,
    LEVEL_BASE: LEVEL_BASE,
    makeRng: makeRng, shuffle: shuffle,
    regionOf: regionOf, cellInfo: cellInfo, typeOf: typeOf,
    newGame: newGame, hasProgress: hasProgress, stageOf: stageOf, accuracy: accuracy,
    canAdvanceTo: canAdvanceTo, startChallenge: startChallenge, pendingView: pendingView,
    useHint: useHint, usePista: usePista, answer: answer, nextCeremony: nextCeremony,
    addActiveTime: addActiveTime, summary: summary, formatTime: formatTime,
    sanitizeState: sanitizeState, serialize: serialize, deserialize: deserialize, createStore: createStore
  };
});

/*
 * A Jornada até Einstein — controlador da interface.
 * Liga a lógica (logic.js) ao DOM: telas, painel de questões, cerimônias,
 * salvamento automático, som, teclado e acessibilidade.
 */
(function () {
  'use strict';
  var JE = window.JE;
  var Logic = JE.Logic, Questions = JE.Questions, Figures = JE.Figures, Character = JE.Character,
    Board = JE.Board, FX = JE.FX, Sound = JE.Audio, Music = JE.Music;

  var LETTERS = ['A', 'B', 'C', 'D', 'E'];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = Figures.esc;

  var state = null;
  var store = null;
  var settings = { sound: true, music: true };
  var board = null;
  var busy = false;           // animações/cerimônias em andamento
  var q = null;               // desafio exibido: { view, answered, selected, result, review }
  var lastTick = 0;
  var shownStage = 1;
  var reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reduced() { return !!(reduceMotion && reduceMotion.matches); }

  /* ------------------------------ utilidades ------------------------------ */

  function rich(text) {
    return esc(text).replace(/\^\{([^}]*)\}/g, '<sup>$1</sup>').replace(/_\{([^}]*)\}/g, '<sub>$1</sub>');
  }
  function paragraphs(text) {
    return String(text).split('\n').map(function (l) {
      return '<p>' + rich(l).replace(/^(Etapa \d+)( — )/, '<strong>$1</strong>$2') + '</p>';
    }).join('');
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, reduced() ? Math.min(ms, 30) : ms); }); }
  function icon(type, cls) { return Board.iconSvg(type, { className: cls || 'icon' }); }
  function starsText(n) { var s = ''; for (var i = 0; i < 5; i++) s += i < n ? '★' : '☆'; return s; }
  function pad(n) { return n; }

  function toast(msg, kind) {
    var host = $('#toasts');
    var el = document.createElement('div');
    el.className = 'toast' + (kind ? ' toast-' + kind : '');
    el.innerHTML = msg;
    host.appendChild(el);
    setTimeout(function () { el.classList.add('out'); }, 4200);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 4800);
  }

  function openDialog(dlg) {
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); }
    else dlg.setAttribute('open', '');
    if (dlg.id === 'dlg-question') Music.duck(true); // silêncio enquanto o aluno resolve
  }
  function closeDialog(dlg) {
    if (dlg.id === 'dlg-question') Music.duck(false);
    if (typeof dlg.close === 'function') { if (dlg.open) dlg.close(); }
    else dlg.removeAttribute('open');
  }

  function save() { try { store.save(state); } catch (e) { /* ignora */ } }

  function loadSettings() {
    try {
      var raw = window.localStorage.getItem('jornada-einstein:settings');
      if (raw) { var s = JSON.parse(raw); if (s && typeof s.sound === 'boolean') settings.sound = s.sound; if (s && typeof s.music === 'boolean') settings.music = s.music; }
    } catch (e) { /* ignora */ }
  }
  function saveSettings() {
    try { window.localStorage.setItem('jornada-einstein:settings', JSON.stringify(settings)); } catch (e) { /* ignora */ }
  }

  function animateNumber(el, to) {
    var from = parseInt(el.getAttribute('data-v') || '0', 10);
    el.setAttribute('data-v', String(to));
    if (reduced() || from === to) { el.textContent = String(to); return; }
    var start = performance.now(), dur = 600;
    function step(t) {
      var k = Math.min(1, (t - start) / dur);
      el.textContent = String(Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ------------------------------ telas ------------------------------ */

  function showScreen(name) {
    ['start', 'game', 'end'].forEach(function (n) { $('#screen-' + n).hidden = (n !== name); });
    document.body.setAttribute('data-screen', name);
    // a trilha toca só no tabuleiro; na tela inicial e no resultado final ela para
    if (name === 'game' && settings.music) Music.start(); else Music.stop();
    window.scrollTo(0, 0);
    $('#btn-ach').hidden = name === 'start';
    if (name === 'start') renderStart();
    if (name === 'game') {
      requestAnimationFrame(function () {
        shownStage = Logic.stageOf(state).stage;
        board.render(state);
        renderChrome();
        setTimeout(function () { board.scrollToCell(state.pos); }, 60);
        runCeremonies();
      });
    }
    if (name === 'end') renderEnd();
    var h = $('#screen-' + name + ' [data-focus]');
    if (h) h.focus({ preventScroll: true });
  }

  function renderStart() {
    var saved = store.load();
    var cont = $('#btn-continue');
    var info = $('#continue-info');
    var viewEnd = $('#btn-view-end');
    cont.hidden = true; viewEnd.hidden = true; info.hidden = true;
    if (saved && saved.status === 'playing' && Logic.hasProgress(saved)) {
      cont.hidden = false; info.hidden = false;
      info.textContent = 'Partida salva: casa ' + saved.pos + ' de 30 · ' + saved.score + ' pontos';
    } else if (saved && saved.status === 'won') {
      viewEnd.hidden = false; info.hidden = false;
      info.textContent = 'Você já completou a jornada com ' + saved.score + ' pontos.';
    }
    var html = '';
    for (var s = 1; s <= 5; s++) {
      html += '<li class="stage-item" style="--i:' + (s - 1) + '"><div class="stage-fig">' +
        Character.svg({ stage: s, hairT: [0, 0.18, 0.4, 0.72, 1][s - 1], blend: s === 4 ? 0.9 : 0.4, aura: s === 5 ? 1 : 0, uid: 'ln' + s, props: s >= 4, label: Logic.STAGES[s].name }) +
        '</div><p class="stage-name">' + Logic.STAGES[s].name + '</p><p class="stage-where">' + (s < 5 ? 'Região ' + s : 'Última casa') + '</p></li>';
    }
    $('#lineup').innerHTML = html;
  }

  /* ------------------------------ HUD e painel lateral ------------------------------ */

  function renderChrome() {
    renderHUD();
    renderSide();
    renderChallengeButton();
  }

  function renderHUD() {
    var pos = state.pos;
    var rgN = Logic.regionOf(state.status === 'won' ? 30 : Math.min(30, pos < 30 && Logic.BOARD[pos].type === 'marco' ? pos + 1 : pos));
    $('#hud-region').textContent = 'Região ' + rgN.id + ' · ' + rgN.name;
    $('#hud-level').innerHTML = '<span class="stars" aria-hidden="true">' + starsText(rgN.stars) + '</span> ' +
      '<span class="sr-only">Dificuldade ' + rgN.stars + ' de 5: </span>' + rgN.difficulty;
    $('#hud-fill').style.width = ((pos - 1) / 29 * 100).toFixed(1) + '%';
    $('#hud-progress').setAttribute('aria-valuenow', String(pos));
    $('#hud-progress').setAttribute('aria-valuetext', 'Casa ' + pos + ' de 30');
    $('#hud-progress-text').textContent = 'Casa ' + pos + ' de 30';
    animateNumber($('#hud-score'), state.score);
    $('#hud-streak').textContent = String(state.streak);
    $('#hud-streak-best').textContent = 'melhor: ' + state.bestStreak;
    var flame = $('#hud-streak-wrap');
    flame.classList.toggle('hot', state.streak >= 3);
    $('#st-correct').textContent = String(state.correct);
    $('#st-wrong').textContent = String(state.wrong);
    $('#st-hints').textContent = String(state.hints);
    $('#st-time').textContent = Logic.formatTime(state.activeMs);
  }

  function renderSide() {
    var st = Logic.stageOf(state);
    var info = Logic.STAGES[st.stage];
    $('#side-char').innerHTML = Character.svg({ stage: st.stage, hairT: st.hairT, blend: st.blend, aura: st.stage === 5 ? 1 : (st.stage >= 4 ? 0.35 : 0.12), uid: 'side', className: 'float' });
    $('#side-stage').textContent = info.name;
    $('#side-motto').textContent = info.motto;
    var dots = '';
    for (var i = 1; i <= 5; i++) dots += '<li class="' + (i < st.stage ? 'done' : i === st.stage ? 'now' : '') + '"><span class="sr-only">' + Logic.STAGES[i].name + (i === st.stage ? ' (atual)' : i < st.stage ? ' (concluído)' : ' (bloqueado)') + '</span></li>';
    $('#side-dots').innerHTML = dots;
    var m = '';
    Logic.REGIONS.forEach(function (rg, k) {
      var got = state.medals[k];
      m += '<li class="medal ' + (got ? 'got' : '') + '" style="--rc:' + Board.REGION_COLORS[k] + '">' + icon('medal', 'icon') +
        '<span class="medal-n">' + rg.id + '</span><span class="sr-only">Medalha da região ' + rg.id + ', ' + rg.name + ': ' + (got ? 'conquistada' : 'ainda não conquistada') + '</span></li>';
    });
    $('#medals').innerHTML = m;
    $('#btn-review-last').hidden = !state.lastResult;
  }

  function renderChallengeButton() {
    var b = $('#btn-challenge');
    if (state.status !== 'playing') { b.hidden = true; return; }
    b.hidden = false;
    var n = state.pos + 1;
    var t = Logic.CELL_TYPES[Logic.BOARD[n].type];
    var color = Board.CELL_COLORS[Logic.BOARD[n].type];
    b.style.setProperty('--tc', color);
    b.disabled = busy;
    b.innerHTML = '<span class="cta-ic">' + icon(Logic.BOARD[n].type) + '</span><span class="cta-tx"><strong>' +
      (state.pending ? 'Retomar desafio da casa ' + n : 'Enfrentar a casa ' + n) + '</strong><small>' + t.label + ' · ' + t.rule.split('.')[0] + '</small></span>';
  }

  /* ------------------------------ painel de questões ------------------------------ */

  function populateQuestion(view, opts) {
    opts = opts || {};
    var type = view.typeInfo;
    $('#q-chips').innerHTML =
      '<span class="chip chip-region" style="--rc:' + Board.REGION_COLORS[view.region.id - 1] + '">Região ' + view.region.id + ' · ' + esc(view.region.name) + '</span>' +
      '<span class="chip chip-level"><span aria-hidden="true">' + starsText(view.region.stars) + '</span><span class="sr-only">Dificuldade ' + view.region.stars + ' de 5:</span> ' + esc(view.region.difficulty) + '</span>' +
      '<span class="chip chip-theme">' + esc(view.themeLabel) + '</span>';
    $('#q-title').innerHTML = '<span class="q-cell" style="--tc:' + Board.CELL_COLORS[view.type] + '">' + icon(view.type) + '</span>' +
      '<span>Casa ' + view.cell + ' · ' + esc(type.label) + '</span>';
    var banner = '';
    if (view.review && !opts.review) banner += '<p class="q-note">' + icon('rev') + ' Revisão: esta questão retoma um conceito que vale a pena rever.</p>';
    if (view.support && !opts.review) banner += '<p class="q-note q-support">' + icon('desc') + ' Apoio automático: duas alternativas erradas foram descartadas para ajudar você a continuar.</p>';
    $('#q-banner').innerHTML = banner;
    $('#q-figure').innerHTML = Figures.render(view.figure);
    $('#q-statement').innerHTML = paragraphs(view.statement);
    var o = '';
    view.alternatives.forEach(function (alt, i) {
      var elim = view.eliminated.indexOf(i) >= 0;
      o += '<label class="opt" data-i="' + i + '"' + (elim ? ' data-state="eliminated"' : '') + '>' +
        '<input type="radio" name="alt" value="' + i + '"' + (elim ? ' disabled' : '') + '>' +
        '<span class="opt-letter" aria-hidden="true">' + LETTERS[i] + '</span>' +
        '<span class="opt-text"><span class="sr-only">Alternativa ' + LETTERS[i] + ': </span>' + rich(alt) + '</span>' +
        '<span class="opt-flag">' + (elim ? 'Descartada pela Pista' : '') + '</span></label>';
    });
    $('#q-options').innerHTML = o;
    $('#q-hint-text').hidden = true; $('#q-hint-text').textContent = '';
    $('#q-result').hidden = true; $('#q-result').innerHTML = '';
    $('#q-tools').hidden = !!opts.review;
    $('#q-confirm').hidden = !!opts.review; $('#q-confirm').disabled = true;
    $('#q-continue').hidden = true;
    updateTools(view);
    $('#q-body').scrollTop = 0;
  }

  function updateTools(view) {
    var dica = $('#btn-dica'), pista = $('#btn-pista');
    dica.disabled = !!(q && (q.answered || view.hintUsed));
    dica.innerHTML = view.hintUsed ? 'Dica usada' : 'Ver dica <small>(−25% dos pontos-base)</small>';
    var used = view.eliminated.length > 0;
    pista.disabled = !!(q && q.answered) || used || state.hints <= 0;
    pista.innerHTML = used ? 'Pista usada' : 'Usar Pista <small>(' + state.hints + ' ' + (state.hints === 1 ? 'disponível' : 'disponíveis') + ')</small>';
    if (view.hintUsed && q) { var qq = Questions.BY_ID[state.pending ? state.pending.qid : ''] || null; if (qq && qq.hint) showHintText(qq.hint); }
  }

  function showHintText(t) { var h = $('#q-hint-text'); h.hidden = false; h.innerHTML = '<strong>Dica:</strong> ' + rich(t); }

  function openChallenge() {
    if (busy || !state || state.status !== 'playing') return;
    var res = Logic.startChallenge(state, Math.random);
    if (!res.ok) { toast('Não foi possível abrir este desafio agora.', 'warn'); return; }
    save();
    q = { view: res.view, answered: false, selected: null, result: null, review: false };
    populateQuestion(res.view);
    Sound.play('click');
    openDialog($('#dlg-question'));
    var t = $('#q-title'); if (t) t.focus({ preventScroll: true });
    renderChallengeButton();
  }

  function selectOption(i) {
    if (!q || q.answered) return;
    var inp = $('#q-options input[value="' + i + '"]');
    if (!inp || inp.disabled) return;
    inp.checked = true;
    onSelect(i);
    inp.focus({ preventScroll: true });
  }
  function onSelect(i) {
    if (!q || q.answered) return;
    q.selected = i;
    $$('#q-options .opt').forEach(function (l) { l.classList.toggle('sel', parseInt(l.getAttribute('data-i'), 10) === i); });
    $('#q-confirm').disabled = false;
    Sound.play('select');
  }

  function confirmAnswer() {
    if (!q || q.answered || q.selected === null) return;
    var btn = $('#q-confirm');
    btn.disabled = true;              // evita cliques repetidos
    q.answered = true;
    var before = { score: state.score };
    var res = Logic.answer(state, q.selected);
    if (!res.ok) { q.answered = false; btn.disabled = false; toast('Essa resposta não pôde ser registrada.', 'warn'); return; }
    save();
    q.result = res;
    showResult(res, q.view);
    renderHUD();
    board.setMood(state, res.correct ? 'happy' : 'oops');
    Sound.play(res.correct ? 'correct' : 'wrong');
    if (res.correct) { var r = btn.getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top, { count: 30, speed: 7 }); }
    if (res.hintGained) setTimeout(function () { Sound.play('pista'); toast('+' + res.hintGained + ' Pista' + (res.hintGained > 1 ? 's' : '') + ' para usar quando precisar.', 'good'); }, 500);
  }

  function showResult(res, view, opts) {
    opts = opts || {};
    var chosen = res.chosen, correct = res.correctPres;
    $$('#q-options .opt').forEach(function (l) {
      var i = parseInt(l.getAttribute('data-i'), 10);
      var inp = l.querySelector('input'); inp.disabled = true;
      var flag = l.querySelector('.opt-flag');
      l.classList.remove('sel');
      if (i === correct) { l.setAttribute('data-state', 'correct'); flag.textContent = i === chosen ? '✓ Sua resposta · correta' : '✓ Alternativa correta'; }
      else if (i === chosen) { l.setAttribute('data-state', 'wrong'); flag.textContent = '✗ Sua resposta'; }
    });
    var h = '';
    if (res.correct) {
      h += '<div class="result-banner ok"><span class="rb-ic">' + icon('check') + '</span><div><h3>Resposta correta!</h3><p>' + esc(res.message || '') + '</p></div></div>';
      if (res.parts) {
        var p = res.parts, chips = '';
        chips += '<li>Questão <b>+' + p.base + '</b></li>';
        if (p.streak) chips += '<li>Sequência <b>+' + p.streak + '</b></li>';
        if (p.bonus) chips += '<li>Descoberta <b>+' + p.bonus + '</b></li>';
        if (p.recovered) chips += '<li>Conceito recuperado <b>+' + p.recovered + '</b></li>';
        if (p.marco) chips += '<li>Marco científico <b>+' + p.marco + '</b></li>';
        if (p.final) chips += '<li>Desafio final <b>+' + p.final + '</b></li>';
        h += '<ul class="chips-pts">' + chips + '<li class="total">Total <b>+' + res.points + ' pontos</b></li></ul>';
        if (res.hintGained) h += '<p class="q-note good">' + icon('desc') + ' Você ganhou ' + res.hintGained + ' Pista' + (res.hintGained > 1 ? 's' : '') + '.</p>';
      }
      if (res.to > res.from) {
        h += '<p class="move-note">' + (res.victory ? 'Você chegou à última casa!' : 'Você avança da casa ' + res.from + ' para a casa ' + res.to + '.') + '</p>';
      }
    } else {
      h += '<div class="result-banner no"><span class="rb-ic">' + icon('rev') + '</span><div><h3>Ainda não foi desta vez</h3><p>' + esc(res.message || '') + '</p></div></div>';
      h += '<p class="correct-is">A alternativa correta é a <b>' + LETTERS[correct] + '</b>.</p>';
      if (res.chosenNote) {
        var tag = res.chosenNote.kind === 'calculo' ? 'Erro de cálculo' : 'Erro conceitual';
        h += '<section class="why"><h4>Por que a alternativa ' + LETTERS[chosen] + ' não procede <span class="tag tag-' + res.chosenNote.kind + '">' + tag + '</span></h4><p>' + rich(res.chosenNote.text) + '</p></section>';
      }
      if (res.hintGained) h += '<p class="q-note good">' + icon('desc') + ' Para ajudar na próxima tentativa, você ganhou ' + res.hintGained + ' Pista.</p>';
      if (!opts.review) h += '<p class="move-note">Você continua na casa ' + res.from + '. Ao tentar de novo, virá uma nova questão para esta casa.</p>';
    }
    h += '<section class="solution"><h4>Resolução comentada</h4>' + paragraphs(res.solution) + '</section>';
    var r = $('#q-result');
    r.innerHTML = h; r.hidden = false;
    $('#q-tools').hidden = true;
    $('#q-confirm').hidden = true;
    var c = $('#q-continue');
    c.hidden = false;
    c.textContent = opts.review ? 'Fechar' : (res.victory ? 'Continuar' : (res.correct ? 'Continuar jornada' : 'Tentar de novo'));
    var body = $('#q-body');
    setTimeout(function () { r.scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' }); c.focus({ preventScroll: true }); }, 80);
  }

  function useDica() {
    if (!q || q.answered) return;
    var r = Logic.useHint(state);
    if (!r.ok) return;
    save();
    q.view.hintUsed = true;
    showHintText(r.text);
    $('#btn-dica').disabled = true;
    $('#btn-dica').innerHTML = 'Dica usada';
    Sound.play('pista');
  }

  function usePista() {
    if (!q || q.answered) return;
    var r = Logic.usePista(state, Math.random);
    if (!r.ok) { toast(r.error === 'no-hints' ? 'Você não tem Pistas agora. Acerte uma Descoberta para ganhar mais.' : 'A Pista já foi usada nesta questão.', 'warn'); return; }
    save();
    q.view.eliminated = r.eliminated.slice();
    r.eliminated.forEach(function (i) {
      var l = $('#q-options .opt[data-i="' + i + '"]');
      if (l) { l.setAttribute('data-state', 'eliminated'); l.querySelector('input').disabled = true; l.querySelector('.opt-flag').textContent = 'Descartada pela Pista'; l.classList.remove('sel'); }
    });
    if (q.selected !== null && r.eliminated.indexOf(q.selected) >= 0) { q.selected = null; $('#q-confirm').disabled = true; $$('#q-options input').forEach(function (x) { x.checked = false; }); }
    updateTools(q.view);
    renderHUD();
    Sound.play('pista');
  }

  function closeQuestion(fromContinue) {
    var dlg = $('#dlg-question');
    var current = q;
    closeDialog(dlg);
    q = null;
    if (!current) return;
    if (current.review) return;
    if (current.answered && current.result) afterAnswer(current.result);
    else renderChallengeButton();
  }

  async function afterAnswer(res) {
    busy = true; renderChallengeButton();
    try {
      if (res.correct && res.path.length) {
        await board.moveAlong(res.path, function () { Sound.play('step'); });
      }
      board.render(state, 'idle');
      renderHUD(); renderSide();
      await runCeremonies();
    } finally {
      busy = false;
      renderChallengeButton();
    }
  }

  function reviewLast() {
    var lr = state.lastResult;
    if (!lr) return;
    var qu = Questions.BY_ID[lr.qid];
    if (!qu) return;
    var cell = Logic.BOARD[lr.cell] || Logic.BOARD[2];
    var region = Logic.regionOf(lr.cell || 2);
    var view = {
      cell: lr.cell, type: cell.type, typeInfo: Logic.CELL_TYPES[cell.type], region: region, level: qu.level, theme: qu.theme,
      themeLabel: Questions.themeLabel(qu.theme), statement: qu.statement, figure: qu.figure || null,
      alternatives: lr.order.map(function (o) { return qu.alternatives[o]; }), eliminated: [], hintUsed: false, review: false, support: false
    };
    q = { view: view, answered: true, selected: lr.chosen, result: null, review: true };
    populateQuestion(view, { review: true });
    var correctPres = lr.order.indexOf(qu.correct);
    var res = { correct: lr.ok, chosen: lr.chosen, correctPres: correctPres, solution: qu.solution,
      chosenNote: lr.ok ? null : qu.distractors[lr.order[lr.chosen]], message: lr.ok ? 'Esta foi a sua última resposta.' : 'Esta foi a sua última resposta.',
      points: lr.points, parts: null, from: state.pos, to: state.pos, hintGained: 0 };
    showResult(res, view, { review: true });
    openDialog($('#dlg-question'));
  }

  /* ------------------------------ cerimônias ------------------------------ */

  function showCeremony(opts) {
    return new Promise(function (resolve) {
      var dlg = $('#dlg-ceremony');
      dlg.className = 'dlg ceremony ' + (opts.className || '');
      $('#cer-body').innerHTML = opts.html;
      var ok = $('#cer-ok');
      ok.textContent = opts.okLabel || 'Continuar';
      ok.hidden = !!opts.hideOk;
      var done = false;
      function finish() {
        if (done) return; done = true;
        ok.removeEventListener('click', finish);
        dlg.removeEventListener('cancel', onCancel);
        closeDialog(dlg);
        resolve();
      }
      function onCancel(e) { e.preventDefault(); if (!opts.hideOk) finish(); }
      ok.addEventListener('click', finish);
      dlg.addEventListener('cancel', onCancel);
      openDialog(dlg);
      if (opts.onShow) opts.onShow(dlg, finish);
      if (!opts.hideOk) setTimeout(function () { ok.focus({ preventScroll: true }); }, 50);
    });
  }

  var STAGE_NEWS = {
    2: 'Você ganhou um caderno e um lápis atrás da orelha: agora é um aprendiz de verdade!',
    3: 'Jaleco, óculos e um frasco borbulhante: bem-vindo ao laboratório!',
    4: 'Os cabelos já ficam grisalhos e o quadro de equações está pronto. O físico experiente chegou.'
  };

  async function runCeremonies() {
    var c;
    while ((c = Logic.nextCeremony(state))) {
      save();
      if (c.type === 'medal') {
        if (c.region === 5) continue; // a vitória cuida da última medalha
        var rg = Logic.REGIONS[c.region - 1];
        Sound.play('medal');
        await showCeremony({
          className: 'cer-medal',
          html: '<div class="medal-big" style="--rc:' + Board.REGION_COLORS[c.region - 1] + '">' + icon('medal') + '<span>' + c.region + '</span></div>' +
            '<h2 id="cer-title">Região concluída!</h2><p class="cer-lead">Você conquistou a medalha <b>' + esc(rg.name) + '</b> e ganhou ' + (200 * c.region) + ' pontos de bônus.</p>',
          onShow: function (dlg) { var r = $('.medal-big', dlg).getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top + r.height / 2, { count: 60, speed: 9 }); }
        });
      } else if (c.type === 'stage') {
        var st = Logic.stageOf(state);
        var prev = shownStage;
        var info = Logic.STAGES[st.stage];
        Sound.play('evolve');
        if (st.stage !== prev) {
          await showCeremony({
            className: 'cer-stage',
            html: '<div class="morph"><div class="morph-from">' + Character.svg({ stage: prev, hairT: st.hairT, blend: 1, uid: 'mf' }) + '</div>' +
              '<div class="morph-to">' + Character.svg({ stage: st.stage, hairT: st.hairT, blend: 0, aura: 0.5, mood: 'happy', uid: 'mt' }) + '</div><div class="flash"></div></div>' +
              '<h2 id="cer-title">Nova forma desbloqueada!</h2><p class="cer-stage-name">' + esc(info.name) + '</p><p class="cer-lead">' + esc(STAGE_NEWS[st.stage] || info.motto) + '</p>',
            onShow: function (dlg) { var r = $('.morph', dlg).getBoundingClientRect(); setTimeout(function () { FX.burst(r.left + r.width / 2, r.top + r.height / 2, { count: 70, speed: 9 }); }, reduced() ? 0 : 700); }
          });
        } else {
          await showCeremony({
            className: 'cer-stage',
            html: '<div class="morph"><div class="morph-to static">' + Character.svg({ stage: 4, hairT: st.hairT, blend: 0.9, aura: 0.7, mood: 'happy', uid: 'mn' }) + '</div></div>' +
              '<h2 id="cer-title">Falta só um passo!</h2><p class="cer-lead">O cabelo embranquece e o bigode já aparece. A última casa guarda o Desafio de Einstein: acerte-o e a transformação se completa.</p>'
          });
        }
        shownStage = st.stage;
        renderSide();
      } else if (c.type === 'achievement') {
        var a = Logic.ACHIEVEMENTS.filter(function (x) { return x.id === c.id; })[0];
        if (a) { Sound.play('achieve'); toast('<b>Conquista:</b> ' + esc(a.title) + '<br><small>' + esc(a.desc) + '</small>', 'ach'); }
      } else if (c.type === 'victory') {
        await playVictory();
        showScreen('end');
        return;
      }
    }
  }

  async function playVictory() {
    var st = Logic.stageOf(state);
    Sound.play('victory');
    await showCeremony({
      className: 'cer-victory',
      hideOk: true,
      html: '<div class="victory-stage"><div class="eq-layer" aria-hidden="true"></div>' +
        '<div class="vc vc-old">' + Character.svg({ stage: 4, hairT: 0.95, blend: 1, aura: 0.6, uid: 'vo' }) + '</div>' +
        '<div class="vc vc-new">' + Character.svg({ stage: 5, aura: 1, mood: 'happy', uid: 'vn' }) + '</div>' +
        '<div class="vflash"></div></div>' +
        '<h2 id="cer-title" class="victory-title">Você se transformou em Einstein!</h2>' +
        '<p class="cer-lead victory-lead">Você completou a jornada: de estudante curioso a cientista inspirado pelo maior físico do século XX.</p>' +
        '<button class="btn btn-primary victory-btn" id="victory-ok" type="button">Ver o resumo da jornada</button>',
      onShow: function (dlg, finish) {
        FX.equations($('.eq-layer', dlg), reduced() ? 0 : 20);
        if (reduced()) dlg.classList.add('transformed');
        else {
          setTimeout(function () { dlg.classList.add('charging'); }, 300);
          setTimeout(function () { dlg.classList.add('transformed'); FX.confetti(160); var r = $('.vc-new', dlg).getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top + r.height / 3, { count: 90, speed: 11 }); }, 2300);
        }
        $('#victory-ok', dlg).addEventListener('click', finish);
        setTimeout(function () { var b = $('#victory-ok', dlg); if (b) b.focus({ preventScroll: true }); }, reduced() ? 50 : 3200);
      }
    });
  }

  /* ------------------------------ tela final ------------------------------ */

  function renderEnd() {
    var s = Logic.summary(state);
    $('#end-char').innerHTML = Character.svg({ stage: 5, aura: 1, mood: 'happy', uid: 'end', className: 'float' });
    $('#end-score').textContent = String(s.score);
    $('#end-correct').textContent = String(s.correct);
    $('#end-wrong').textContent = String(s.wrong);
    $('#end-acc').textContent = Math.round(s.accuracy * 100) + '%';
    $('#end-time').textContent = Logic.formatTime(s.elapsedMs);
    $('#end-streak').textContent = String(s.bestStreak);
    var t = '';
    s.byTheme.forEach(function (th) {
      t += '<li><span class="th-name">' + esc(th.label) + '</span><span class="th-bar" aria-hidden="true"><span style="width:' + th.pct + '%"></span></span>' +
        '<span class="th-val">' + th.correct + ' de ' + th.total + ' · ' + th.pct + '%</span></li>';
    });
    $('#end-themes').innerHTML = t || '<li>Sem respostas registradas.</li>';
    var m = '';
    Logic.REGIONS.forEach(function (rg, k) {
      m += '<li class="medal got" style="--rc:' + Board.REGION_COLORS[k] + '">' + icon('medal') + '<span class="medal-n">' + rg.id + '</span><span class="sr-only">Medalha: ' + rg.name + '</span></li>';
    });
    $('#end-medals').innerHTML = m;
    var ach = Logic.ACHIEVEMENTS.filter(function (a) { return state.achievements[a.id]; });
    $('#end-ach').innerHTML = ach.length ? ach.map(function (a) { return '<li><b>' + esc(a.title) + '</b><span>' + esc(a.desc) + '</span></li>'; }).join('') : '<li>Nenhuma conquista extra desta vez.</li>';
    $('#end-lead').textContent = s.accuracy >= 0.85 ? 'Uma jornada brilhante! Você acertou a maior parte dos desafios.'
      : s.accuracy >= 0.6 ? 'Ótima jornada! Cada erro virou aprendizado, e você chegou lá.'
        : 'Você persistiu e chegou ao final. É assim que a ciência avança: tentando de novo!';
    // melhor/pior tema para estudo
    var weak = s.byTheme.filter(function (th) { return th.wrong > 0; }).sort(function (a, b) { return a.pct - b.pct; })[0];
    $('#end-tip').textContent = weak ? 'Para revisar: ' + weak.label + '.' : 'Você acertou tudo o que enfrentou. Que tal tentar de novo e buscar outros temas?';
  }

  /* ------------------------------ diálogos auxiliares ------------------------------ */

  function confirmBox(title, text, okLabel, cancelLabel) {
    return new Promise(function (resolve) {
      var dlg = $('#dlg-confirm');
      $('#cf-title').textContent = title;
      $('#cf-text').textContent = text;
      $('#cf-ok').textContent = okLabel || 'Confirmar';
      $('#cf-cancel').textContent = cancelLabel || 'Cancelar';
      var done = false;
      function end(v) { if (done) return; done = true; $('#cf-ok').onclick = null; $('#cf-cancel').onclick = null; dlg.oncancel = null; closeDialog(dlg); resolve(v); }
      $('#cf-ok').onclick = function () { end(true); };
      $('#cf-cancel').onclick = function () { end(false); };
      dlg.oncancel = function (e) { e.preventDefault(); end(false); };
      openDialog(dlg);
      setTimeout(function () { $('#cf-cancel').focus(); }, 30);
    });
  }

  function buildRules() {
    var types = ['desafio', 'lab', 'desc', 'rev', 'gd', 'marco', 'final'];
    var h = '<p class="rules-lead">Você é um estudante curioso e precisa percorrer o tabuleiro até se transformar em Einstein. Para avançar, responda às questões de Física de cada casa.</p>';
    h += '<h3>Como jogar</h3><ol class="rules-steps">' +
      '<li>Clique em <b>“Enfrentar a casa”</b> (ou na casa brilhante do tabuleiro). Só a próxima casa está liberada: não dá para pular etapas.</li>' +
      '<li>Leia o enunciado, escolha uma das cinco alternativas (A a E) e toque em <b>Confirmar resposta</b>.</li>' +
      '<li>Acertou? Seu personagem avança. Errou? Ele fica na mesma casa, você lê a explicação e tenta uma nova questão. Errar não tira pontos nem faz você voltar.</li>' +
      '<li>Ao concluir cada região, você ganha uma medalha e o personagem se transforma. Na casa 30, acerte o Desafio de Einstein para vencer.</li></ol>';
    h += '<h3>Casas do tabuleiro</h3><ul class="rules-types">';
    types.forEach(function (t) {
      var T = Logic.CELL_TYPES[t];
      h += '<li style="--tc:' + Board.CELL_COLORS[t] + '"><span class="rt-ic">' + icon(t) + '</span><div><b>' + T.label + '</b><span>' + esc(T.rule) + '</span></div></li>';
    });
    h += '</ul><h3>Pontuação</h3><p>Cada acerto vale pontos de acordo com a dificuldade (100 a 300 por questão), multiplicados pelo tipo da casa. Acertos seguidos rendem bônus de até +100. Usar a dica reduz em 25% os pontos-base daquela questão.</p>';
    h += '<h3>Dica e Pista</h3><p>A <b>dica</b> é um empurrãozinho em texto (−25% dos pontos-base). A <b>Pista</b> descarta duas alternativas erradas e não custa pontos, mas você tem poucas: ganhe mais acertando Descobertas ou errando um Grande desafio (até 3 guardadas). Depois de dois erros seguidos, a próxima questão já vem com duas alternativas descartadas.</p>';
    h += '<h3>Salvamento e teclado</h3><p>Seu progresso é salvo automaticamente neste navegador. Para jogar pelo teclado: use <kbd>Tab</kbd> para navegar, as teclas <kbd>A</kbd> a <kbd>E</kbd> (ou <kbd>1</kbd> a <kbd>5</kbd>) para escolher uma alternativa e <kbd>Enter</kbd> para confirmar e continuar.</p>';
    return h;
  }

  function showAchievements() {
    var h = '';
    Logic.ACHIEVEMENTS.forEach(function (a) {
      var got = state && state.achievements[a.id];
      h += '<li class="' + (got ? 'got' : '') + '"><span class="ach-ic" aria-hidden="true">' + (got ? icon('check') : icon('medal')) + '</span><div><b>' + esc(a.title) + '</b><span>' + esc(a.desc) + '</span><em>' + (got ? 'Desbloqueada' : 'Bloqueada') + '</em></div></li>';
    });
    $('#ach-list').innerHTML = h;
    openDialog($('#dlg-ach'));
  }

  /* ------------------------------ nova partida ------------------------------ */

  async function newGame(askFirst) {
    var inProgress = state && state.status === 'playing' && Logic.hasProgress(state);
    var saved = store.load();
    var savedInProgress = saved && saved.status === 'playing' && Logic.hasProgress(saved);
    if (askFirst !== false && (inProgress || savedInProgress)) {
      var s = inProgress ? state : saved;
      var ok = await confirmBox('Começar uma nova partida?', 'Sua partida atual (casa ' + s.pos + ', ' + s.score + ' pontos) será apagada e você volta para a casa 1.', 'Sim, recomeçar', 'Continuar a partida atual');
      if (!ok) return;
    }
    state = Logic.newGame();
    shownStage = 1;
    save();
    Sound.play('click');
    showScreen('game');
  }

  function continueGame() {
    var saved = store.load();
    if (saved) state = saved;
    if (!state) state = Logic.newGame();
    showScreen(state.status === 'won' ? 'end' : 'game');
  }

  /* ------------------------------ tempo e eventos ------------------------------ */

  function tick() {
    var now = Date.now();
    if (lastTick && !document.hidden && state && state.status === 'playing' && document.body.getAttribute('data-screen') === 'game') {
      Logic.addActiveTime(state, now - lastTick);
      $('#st-time').textContent = Logic.formatTime(state.activeMs);
      if (Math.floor(now / 1000) % 5 === 0) save();
    }
    lastTick = now;
  }

  function onKey(ev) {
    var dlg = $('#dlg-question');
    if (!dlg.open || !q) return;
    var k = ev.key;
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    if (!q.answered) {
      var idx = -1;
      if (/^[a-eA-E]$/.test(k)) idx = LETTERS.indexOf(k.toUpperCase());
      else if (/^[1-5]$/.test(k)) idx = parseInt(k, 10) - 1;
      if (idx >= 0) { ev.preventDefault(); selectOption(idx); return; }
      if (k === 'Enter' && q.selected !== null && document.activeElement && document.activeElement.tagName !== 'BUTTON') { ev.preventDefault(); confirmAnswer(); }
    } else if (k === 'Enter' && document.activeElement && document.activeElement.tagName !== 'BUTTON') {
      ev.preventDefault(); closeQuestion(true);
    }
  }

  function setSound(on) {
    settings.sound = !!on;
    Sound.setEnabled(settings.sound);
    var b = $('#btn-sound');
    b.setAttribute('aria-pressed', settings.sound ? 'true' : 'false');
    b.querySelector('.lbl').textContent = settings.sound ? 'Som ligado' : 'Som desligado';
    b.classList.toggle('off', !settings.sound);
    saveSettings();
  }

  function setMusic(on) {
    settings.music = !!on;
    Music.setEnabled(settings.music);
    var b = $('#btn-music');
    b.setAttribute('aria-pressed', settings.music ? 'true' : 'false');
    b.querySelector('.lbl').textContent = settings.music ? 'Música ligada' : 'Música desligada';
    b.classList.toggle('off', !settings.music);
    if (settings.music && document.body.getAttribute('data-screen') === 'game') Music.start();
    saveSettings();
  }

  function wire() {
    $('#btn-start').addEventListener('click', function () { Sound.unlock(); newGame(true); });
    $('#btn-continue').addEventListener('click', function () { Sound.unlock(); continueGame(); });
    $('#btn-view-end').addEventListener('click', function () { var s = store.load(); if (s) { state = s; showScreen('end'); } });
    $('#btn-rules-start').addEventListener('click', function () { $('#rules-body').innerHTML = buildRules(); openDialog($('#dlg-rules')); });
    $('#btn-rules').addEventListener('click', function () { $('#rules-body').innerHTML = buildRules(); openDialog($('#dlg-rules')); });
    $('#btn-ach').addEventListener('click', function () { if (state) showAchievements(); });
    $('#btn-sound').addEventListener('click', function () { setSound(!settings.sound); Sound.unlock(); Sound.play('click'); });
    $('#btn-music').addEventListener('click', function () { setMusic(!settings.music); });
    $('#btn-new').addEventListener('click', function () { newGame(true); });
    $('#brand').addEventListener('click', function (e) { e.preventDefault(); if (state) { save(); } showScreen('start'); });
    $('#btn-challenge').addEventListener('click', openChallenge);
    $('#btn-review-last').addEventListener('click', reviewLast);
    $('#btn-again').addEventListener('click', function () { newGame(false); });
    $('#btn-home').addEventListener('click', function () { showScreen('start'); });
    $('#btn-dica').addEventListener('click', useDica);
    $('#btn-pista').addEventListener('click', usePista);
    $('#q-confirm').addEventListener('click', confirmAnswer);
    $('#q-continue').addEventListener('click', function () { closeQuestion(true); });
    $('#q-close').addEventListener('click', function () { closeQuestion(false); });
    $('#q-options').addEventListener('change', function (e) { if (e.target && e.target.name === 'alt') onSelect(parseInt(e.target.value, 10)); });
    $('#dlg-question').addEventListener('cancel', function (e) { e.preventDefault(); closeQuestion(false); });
    $$('[data-close]').forEach(function (b) { b.addEventListener('click', function () { closeDialog(b.closest('dialog')); }); });
    $$('dialog').forEach(function (d) {
      d.addEventListener('click', function (e) { if (e.target === d && d.id !== 'dlg-question' && d.id !== 'dlg-ceremony' && d.id !== 'dlg-confirm') closeDialog(d); });
    });
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', function () { Sound.unlock(); }, { once: true });
    document.addEventListener('visibilitychange', function () { if (document.hidden && state) save(); lastTick = Date.now(); if (document.hidden) Music.pause(); else Music.resume(); });
    window.addEventListener('pagehide', function () { if (state) save(); });
    setInterval(tick, 1000);
  }

  function boot() {
    try { store = Logic.createStore(window.localStorage); } catch (e) { store = Logic.createStore(null); }
    loadSettings();
    board = Board.create($('#board'), {
      onCell: function (n) {
        if (busy || !state) return;
        var can = Logic.canAdvanceTo(state, n);
        if (can.ok) openChallenge();
        else toast(can.reason, 'warn');
      }
    });
    wire();
    setSound(settings.sound);
    setMusic(settings.music);
    state = store.load();
    showScreen('start');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

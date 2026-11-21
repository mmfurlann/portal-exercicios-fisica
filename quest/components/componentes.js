/* FÍSICA QUEST · componentes de interface reutilizáveis. Cada função devolve HTML a partir de dados.
   ProgressBar (trilha com foguete), ScoreBoard (placar da sessão), FormulaCard (quadro com a fórmula
   em KaTeX, no padrão visual do logo), AnswerOption (alternativa), ActivityCard (cartão do menu),
   SessionSummary (resultado da sessão), ResumoProgresso (painel do aluno).
   Os textos entram sempre escapados; as fórmulas são desenhadas por renderizarFormulas(). */
(function () {
  const QUEST = (window.QUEST = window.QUEST || {});
  const LETRAS = ['A', 'B', 'C', 'D'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  function tempo(segundos) {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function plural(n, um, varios) {
    return n + ' ' + (n === 1 ? um : varios);
  }

  // Foguetes em traço de cartum, com as cores do site (classes definidas em quest/quest.css).
  const FOGUETE_H = '<svg class="fq-foguete" viewBox="0 0 60 24" aria-hidden="true" focusable="false">' +
    '<path class="fq-chama" d="M18 10 L4 12 L18 14 Z"/>' +
    '<path class="fq-aleta" d="M20 7 L12 1 L16 9 Z"/>' +
    '<path class="fq-aleta" d="M20 17 L12 23 L16 15 Z"/>' +
    '<path class="fq-corpo" d="M18 7 H46 Q56 12 46 17 H18 Z"/>' +
    '<circle class="fq-janela" cx="34" cy="12" r="3"/></svg>';

  const FOGUETE_V = '<svg class="fq-foguete-v" viewBox="0 0 40 80" aria-hidden="true" focusable="false">' +
    '<path class="fq-chama" d="M14 62 Q20 80 26 62 Z"/>' +
    '<path class="fq-aleta" d="M12 44 L4 60 L12 58 Z"/>' +
    '<path class="fq-aleta" d="M28 44 L36 60 L28 58 Z"/>' +
    '<path class="fq-corpo" d="M20 4 Q28 16 28 40 V60 H12 V40 Q12 16 20 4 Z"/>' +
    '<circle class="fq-janela" cx="20" cy="34" r="4"/></svg>';

  const CADEADO = '<svg class="fq-cadeado" viewBox="0 0 16 18" aria-hidden="true" focusable="false">' +
    '<path d="M4 8 V5.5 a4 4 0 0 1 8 0 V8" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
    '<rect x="2" y="8" width="12" height="9" rx="1.5" fill="currentColor"/></svg>';

  // Trilha da sessão: o foguete avança conforme as questões respondidas.
  function ProgressBar(o) {
    const pct = o.total ? Math.min(100, Math.round((o.feitas / o.total) * 100)) : 0;
    return '<div class="fq-trilha" role="progressbar" aria-label="Progresso da sessão" aria-valuemin="0"' +
      ' aria-valuemax="' + o.total + '" aria-valuenow="' + o.feitas + '"' +
      ' aria-valuetext="' + esc(o.feitas + ' de ' + o.total + ' questões') + '">' +
      '<div class="fq-trilha-barra"><span style="width:' + pct + '%"></span></div>' +
      '<span class="fq-trilha-nave" style="left:' + pct + '%">' + FOGUETE_H + '</span></div>';
  }

  // Placar lateral da sessão.
  function ScoreBoard(o) {
    const bonus = 'Mais ' + plural(o.faltam, 'acerto', 'acertos') + ' seguido' + (o.faltam === 1 ? '' : 's') + ' para o bônus de +25';
    return '<dl class="fq-placar">' +
      '<div><dt>Sequência</dt><dd class="mono" data-sequencia>' + o.sequencia + '</dd></div>' +
      '<div><dt>Acertos</dt><dd class="mono">' + o.acertos + '</dd></div>' +
      '<div><dt>Erros</dt><dd class="mono">' + o.erros + '</dd></div>' +
      '<div><dt>Respondidas</dt><dd class="mono">' + o.respondidas + ' / ' + o.total + '</dd></div>' +
      '</dl><p class="fq-bonus">' + esc(bonus) + '</p>';
  }

  // Quadro da fórmula: céu estrelado, órbitas do logo e rótulo em fita laranja.
  function FormulaCard(o) {
    return '<figure class="fq-quadro">' +
      '<svg class="fq-quadro-orbitas" viewBox="0 0 240 120" aria-hidden="true" focusable="false">' +
      '<ellipse cx="120" cy="60" rx="110" ry="40" transform="rotate(-16 120 60)"/>' +
      '<ellipse cx="120" cy="60" rx="110" ry="40" transform="rotate(16 120 60)"/></svg>' +
      '<figcaption class="fq-quadro-rotulo">' + esc(o.rotulo || 'Fórmula') + '</figcaption>' +
      '<div class="fq-quadro-tex" data-tex="' + esc(o.tex) + '"></div></figure>';
  }

  // Troca o texto LaTeX pela fórmula renderizada (data-inline: símbolo na linha; sem ele: bloco).
  // Sem KaTeX, mostra o código LaTeX.
  function renderizarFormulas(raiz) {
    raiz.querySelectorAll('[data-tex]').forEach(el => {
      const tex = el.getAttribute('data-tex');
      if (window.katex) {
        try {
          window.katex.render(tex, el, { displayMode: !el.hasAttribute('data-inline'), throwOnError: false, strict: 'ignore' });
          return;
        } catch (e) { /* cai no texto simples abaixo */ }
      }
      el.classList.add('fq-tex-cru');
      el.textContent = tex;
    });
  }

  function AnswerOption(o) {
    return '<button type="button" class="alt fq-opcao" data-opcao="' + o.indice + '">' +
      '<span class="letter" aria-hidden="true">' + o.letra + '</span>' +
      '<span class="fq-opcao-texto">' + esc(o.texto) + '</span></button>';
  }

  // Cartão do menu: ativo (com link) ou futuro (bloqueado, identificado como "Em breve").
  function ActivityCard(o) {
    const n = String(o.numero).padStart(2, '0');
    if (o.disponivel) {
      return '<article class="fq-card fq-card-ativa">' +
        '<p class="fq-card-topo"><span class="fq-card-num">Atividade ' + n + '</span></p>' +
        '<h3 class="fq-card-titulo">' + esc(o.nome) + '</h3>' +
        '<p class="fq-card-frase">' + esc(o.frase) + '</p>' +
        '<div class="fq-card-rodape"><span class="fq-card-info mono">' + esc(o.info || '') + '</span>' +
        '<a class="btn accent" href="' + esc(o.pagina) + '">Jogar <span aria-hidden="true">→</span></a></div></article>';
    }
    return '<article class="fq-card fq-card-futura" aria-label="Atividade ' + n + ', em breve: ' + esc(o.nome) + '">' +
      '<p class="fq-card-topo"><span class="fq-card-num">Atividade ' + n + '</span>' +
      '<span class="fq-selo">' + CADEADO + 'Em breve</span></p>' +
      '<h3 class="fq-card-titulo">' + esc(o.nome) + '</h3>' +
      '<p class="fq-card-frase">' + esc(o.frase) + '</p></article>';
  }

  // Categorias em que o aluno mais errou, da maior taxa de erro para a menor (só as com erros).
  function rankingErros(porCategoria) {
    return Object.keys(porCategoria)
      .map(id => ({ id: id, total: porCategoria[id].total, erros: porCategoria[id].erros }))
      .filter(x => x.erros > 0)
      .sort((a, b) => (b.erros / b.total) - (a.erros / a.total) || b.erros - a.erros);
  }

  // Números finais da sessão (o cabeçalho e os botões ficam na tela de resultado).
  function SessionSummary(o) {
    const r = o.resumo;
    const ranking = rankingErros(r.porCategoria);
    const lista = ranking.length
      ? '<ol class="fq-ranking">' + ranking.map(x => '<li><span>' + esc(o.nomeCategoria(x.id)) + '</span>' +
        '<span class="mono">' + x.erros + ' de ' + x.total + ' erradas</span></li>').join('') + '</ol>'
      : '<p class="explain">Nenhuma questão errada nesta sessão.</p>';
    return '<div class="fq-resumo-topo">' +
      '<p class="fq-pontos-final"><span class="fq-grande mono">' + r.pontos + '</span> <small>de ' + r.maximo + ' possíveis</small></p>' +
      '<p class="fq-aprov"><span class="mono">' + r.aproveitamento + '%</span> de aproveitamento</p>' +
      (o.recordeNovo ? '<p class="fq-recorde-novo">Novo recorde de pontuação!</p>' : '') +
      '</div>' +
      '<dl class="fq-stats">' +
      '<div><dt>Acertos</dt><dd class="mono">' + r.acertos + ' de ' + r.respondidas + '</dd></div>' +
      '<div><dt>Erros</dt><dd class="mono">' + r.erros + '</dd></div>' +
      '<div><dt>Tempo</dt><dd class="mono">' + tempo(r.segundos) + '</dd></div>' +
      '<div><dt>Melhor sequência</dt><dd class="mono">' + r.melhorSequencia + '</dd></div>' +
      '</dl>' +
      '<h3 class="fq-sub">Categorias com mais dificuldade</h3>' + lista;
  }

  // Painel do aluno no menu: pontos, sessões, aproveitamento médio e recorde.
  function ResumoProgresso(t) {
    const item = (rotulo, valor, nota) => '<div><dt>' + esc(rotulo) + '</dt><dd class="mono">' + valor +
      '</dd>' + (nota ? '<small>' + esc(nota) + '</small>' : '') + '</div>';
    return '<dl class="fq-progresso">' +
      item('Pontos acumulados', t.pontos, '') +
      item('Sessões realizadas', t.sessoes, '') +
      item('Aproveitamento médio', t.aproveitamento == null ? '—' : t.aproveitamento + '%', 'pontos sobre o máximo possível') +
      item('Recorde de pontuação', t.recorde, 'melhor sessão') +
      '</dl>';
  }

  QUEST.ui = {
    esc: esc,
    tempo: tempo,
    LETRAS: LETRAS,
    FOGUETE_H: FOGUETE_H,
    FOGUETE_V: FOGUETE_V,
    ProgressBar: ProgressBar,
    ScoreBoard: ScoreBoard,
    FormulaCard: FormulaCard,
    renderizarFormulas: renderizarFormulas,
    AnswerOption: AnswerOption,
    ActivityCard: ActivityCard,
    rankingErros: rankingErros,
    SessionSummary: SessionSummary,
    ResumoProgresso: ResumoProgresso
  };
})();

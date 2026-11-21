/* FÍSICA QUEST · motor de atividades. Monta, para qualquer atividade registrada, as quatro telas:
   ajuste (quantidade e assunto), jogo (uma questão por vez), resultado e revisão dos erros.
   A atividade fornece os dados (ver quest/engine/registro.js); o motor cuida do fluxo, da pontuação
   e da persistência. Uso: QUEST.montarAtividade('reconheca-formula', elemento). */
(function () {
  const QUEST = window.QUEST;
  const UI = QUEST.ui;
  const S = QUEST.sessao;
  const SO = QUEST.sorteio;
  const ST = QUEST.armazenamento;
  const PT = QUEST.pontuacao;
  const MENU = '../quest.html'; // páginas de atividade ficam em quest/
  const reduzir = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
  const pad = n => String(n).padStart(2, '0');

  function estruturar(raiz, def) {
    const qtds = def.quantidades.map(n => '<label class="fq-qtd"><input type="radio" name="fq-qtd" value="' + n + '">' +
      '<span class="fq-qtd-num mono">' + n + '</span><span class="fq-qtd-txt">questões</span></label>').join('');
    raiz.innerHTML =
      '<section class="fq-tela" data-tela="ajuste">' +
        '<header class="fq-cabeca"><p class="label">Atividade ' + pad(def.numero) + '</p>' +
        '<h2>' + UI.esc(def.nome) + '</h2><p class="fq-intro">' + UI.esc(def.frase) + '</p></header>' +
        '<div class="fq-ajuste">' +
          '<fieldset class="fq-grupo"><legend class="label">Quantas questões nesta sessão?</legend>' +
          '<div class="fq-qtds">' + qtds + '</div></fieldset>' +
          '<label class="fq-grupo"><span class="label">Assunto</span><select data-role="assunto"></select></label>' +
          '<p class="fq-disponivel mono" data-role="disponivel" aria-live="polite"></p>' +
          '<div class="fq-regras">' +
            '<p><b>Acerto:</b> 100 pontos. Erro: 0.</p>' +
            '<p><b>Sequência:</b> a cada três acertos seguidos, um bônus de 25 pontos.</p>' +
            '<p>Você responde, vê a explicação e decide quando seguir. Nada avança sozinho.</p>' +
          '</div>' +
          '<div class="fq-acao-principal"><button type="button" class="btn accent" data-acao="comecar">Começar sessão</button></div>' +
        '</div></section>' +

      '<section class="fq-tela" data-tela="jogo" hidden>' +
        '<div class="exam">' +
          '<article class="exam-card fq-questao" data-role="questao">' +
            '<div class="exam-meta"><span class="label" data-role="rotulo"></span><span class="mono fq-numero" data-role="numero"></span></div>' +
            '<div data-role="enunciado"></div>' +
            '<div class="alts" data-role="alternativas"></div>' +
            '<div class="feedback" data-role="feedback" aria-live="polite" hidden></div>' +
            '<div class="fq-acoes"><button type="button" class="btn ghost" data-acao="encerrar">Encerrar sessão</button></div>' +
          '</article>' +
          '<aside class="side" aria-label="Seu desempenho">' +
            '<span class="label">Seu desempenho</span>' +
            '<div class="score-big fq-pontos" data-role="pontos"><span class="mono" data-valor>0</span><small> pontos</small></div>' +
            '<div data-role="placar"></div>' +
            '<div data-role="trilha"></div>' +
            '<p class="side-status mono" data-role="tempo"></p>' +
          '</aside>' +
        '</div></section>' +

      '<section class="fq-tela" data-tela="resultado" hidden>' +
        '<article class="exam-card fq-resultado">' +
          '<p class="label" data-role="res-titulo"></p>' +
          '<div class="fq-res-corpo" data-role="res-corpo"></div>' +
          '<div class="cta-row fq-cta">' +
            '<button type="button" class="btn accent" data-acao="jogar-novamente">Jogar novamente</button>' +
            '<button type="button" class="btn ghost" data-acao="revisar" data-role="btn-revisar">Revisar questões erradas</button>' +
            '<a class="btn ghost" href="' + MENU + '">Voltar ao menu de atividades</a>' +
          '</div>' +
          '<p class="fq-trocar"><button type="button" class="fq-link" data-acao="ajuste">Mudar a quantidade ou o assunto</button></p>' +
        '</article></section>' +

      '<section class="fq-tela" data-tela="revisao" hidden>' +
        '<header class="fq-cabeca"><p class="label">Revisão</p><h2>Questões que você errou</h2>' +
        '<p class="fq-intro" data-role="rev-resumo"></p></header>' +
        '<div class="fq-revisao" data-role="revisao-lista"></div>' +
        '<div class="cta-row"><button type="button" class="btn ghost" data-acao="voltar-resultado">Voltar ao resultado</button></div>' +
      '</section>';
  }

  function montar(raiz, def) {
    estruturar(raiz, def);
    const q = sel => raiz.querySelector(sel);
    const cfg = { quantidade: def.quantidades.indexOf(10) >= 0 ? 10 : def.quantidades[0], categoria: 'todas' };
    let sess = null;          // sessão em andamento
    let ordens = [];          // ordem em que as alternativas foram mostradas, por questão
    let ordem = [];           // ordem da questão atual
    let travado = false;      // a questão atual já foi respondida
    let recordeAntes = 0;
    let relogio = null;
    let ultimaResposta = null;

    function telaAtiva() {
      const t = raiz.querySelector('[data-tela]:not([hidden])');
      return t ? t.dataset.tela : null;
    }

    function mostrarTela(nome) {
      const anterior = telaAtiva();
      raiz.querySelectorAll('[data-tela]').forEach(s => { s.hidden = s.dataset.tela !== nome; });
      if (anterior && anterior !== nome) raiz.scrollIntoView({ block: 'start', behavior: reduzir ? 'auto' : 'smooth' });
    }

    /* ---------- ajuste ---------- */
    function poolAtual() {
      return def.itens().filter(x => cfg.categoria === 'todas' || x.categoria === cfg.categoria);
    }

    function prepararAjuste() {
      const pool = def.itens();
      q('[data-role="assunto"]').innerHTML = '<option value="todas">Todos os assuntos (' + pool.length + ')</option>' +
        QUEST.data.categorias.map(c => '<option value="' + c.id + '">' + UI.esc(c.nome) + ' (' +
          pool.filter(x => x.categoria === c.id).length + ')</option>').join('');
      q('[data-role="assunto"]').value = cfg.categoria;
      raiz.querySelectorAll('input[name="fq-qtd"]').forEach(r => { r.checked = Number(r.value) === cfg.quantidade; });
      atualizarDisponivel();
    }

    function atualizarDisponivel() {
      const n = poolAtual().length;
      const efetiva = Math.min(cfg.quantidade, n);
      q('[data-role="disponivel"]').textContent = n + (n === 1 ? ' questão disponível' : ' questões disponíveis') +
        (efetiva < cfg.quantidade ? ' · esta sessão terá ' + efetiva + ', porque o assunto tem menos questões' : '');
    }

    /* ---------- sessão ---------- */
    function iniciar() {
      const dados = ST.carregar();
      const a = ST.atividade(dados, def.id);
      recordeAntes = a.recorde;
      const itens = SO.escolher(poolAtual(), cfg.quantidade, { vistas: new Set(a.vistas) });
      sess = S.criar(itens, { agora: Date.now });
      ordens = [];
      ultimaResposta = null;
      renderQuestao();
      iniciarRelogio();
      mostrarTela('jogo');
    }

    function renderQuestao() {
      const item = sess.atual();
      travado = false;
      ordem = SO.ordemDasOpcoes(4);
      ordens[sess.indice] = ordem;
      const r = def.rotulos(item);
      q('[data-role="rotulo"]').textContent = r.categoria + ' · ' + r.subcategoria;
      q('[data-role="numero"]').innerHTML = 'Questão ' + (sess.indice + 1) + ' de ' + sess.itens.length +
        ' <span class="fq-nivel">' + UI.esc(r.dificuldade) + '</span>';
      const enunciado = q('[data-role="enunciado"]');
      enunciado.innerHTML = def.renderizarEnunciado(item);
      UI.renderizarFormulas(enunciado);
      const alts = def.alternativas(item);
      q('[data-role="alternativas"]').innerHTML = ordem.map((idx, k) =>
        UI.AnswerOption({ letra: UI.LETRAS[k], texto: alts[idx], indice: idx })).join('');
      const fb = q('[data-role="feedback"]');
      fb.hidden = true;
      fb.innerHTML = '';
      atualizarPlacar();
    }

    function responder(indice) {
      if (travado || !sess || sess.respondida()) return;
      travado = true;
      const r = sess.responder(indice);
      ultimaResposta = r;
      const certa = def.correta(r.item);
      raiz.querySelectorAll('[data-opcao]').forEach(b => {
        const idx = Number(b.dataset.opcao);
        b.disabled = true;
        if (idx === certa) b.classList.add('right');
        else if (idx === indice) b.classList.add('wrong');
        else b.classList.add('dim');
      });
      const escolhido = raiz.querySelector('[data-opcao="' + indice + '"]');
      if (escolhido && !reduzir) escolhido.classList.add(r.acertou ? 'celebrate' : 'shake');
      mostrarFeedback(r);
      atualizarPlacar();
      if (r.ganho + r.bonus > 0) ganhoVisual('+' + (r.ganho + r.bonus));
    }

    function mostrarFeedback(r) {
      const item = r.item;
      const alts = def.alternativas(item);
      const certa = def.correta(item);
      const letra = idx => UI.LETRAS[ordem.indexOf(idx)];
      const fb = q('[data-role="feedback"]');
      let ganhos = r.acertou ? 'Mais 100 pontos.' : 'Sua sequência recomeça do zero.';
      if (r.bonus) ganhos = 'Mais 100 pontos e um bônus de 25 por sequência de três acertos!';
      let html = '<div class="cheer' + (r.acertou ? '' : ' miss') + (reduzir ? '' : ' pop') + '" role="status">' +
        '<div><p class="big">' + (r.acertou ? 'Acertou!' : 'Não foi dessa vez.') + '</p><p class="fq-ganho">' + UI.esc(ganhos) + '</p></div></div>';
      if (!r.acertou) {
        html += '<p class="fq-motivo"><b>Você marcou ' + letra(r.escolha) + ') ' + UI.esc(alts[r.escolha]) + '.</b> ' +
          UI.esc(def.motivo(item, r.escolha)) + '</p>';
      }
      html += '<p class="fq-certa"><b>Resposta correta: ' + letra(certa) + ') ' + UI.esc(alts[certa]) + '.</b></p>';
      html += '<div class="explain fq-explicacao"><p><b>A fórmula.</b> ' + UI.esc(def.explicacao(item)) + '</p>' +
        variaveisHtml(def.variaveis(item)) + '</div>';
      html += '<div class="fq-avanco"><button type="button" class="btn accent" data-acao="proxima">' +
        (ultimaQuestao() ? 'Ver resultado →' : 'Próxima questão →') + '</button></div>';
      fb.innerHTML = html;
      fb.hidden = false;
      UI.renderizarFormulas(fb);
      fb.querySelector('[role="status"]').scrollIntoView({ block: 'nearest', behavior: reduzir ? 'auto' : 'smooth' });
    }

    function variaveisHtml(vars) {
      if (!vars || !vars.length) return '';
      return '<dl class="fq-vars">' + vars.map(v => '<div><dt><span class="fq-sim" data-tex="' + UI.esc(v[0]) +
        '" data-inline></span></dt><dd>' + UI.esc(v[1]) + (v[2] ? ' <span class="mono">(' + UI.esc(v[2]) + ')</span>' : '') +
        '</dd></div>').join('') + '</dl>';
    }

    function ultimaQuestao() {
      return sess.indice + 1 >= sess.itens.length;
    }

    function proxima() {
      if (!sess || !sess.respondida()) return;
      if (sess.avancar()) renderQuestao();
      else finalizar();
    }

    function encerrarSessao() {
      if (!sess || sess.terminou()) return;
      const mensagem = sess.respostas.length
        ? 'Encerrar agora? As ' + sess.respostas.length + ' questões já respondidas serão contadas.'
        : 'Encerrar agora? Nenhuma questão foi respondida, então esta sessão não será contada.';
      if (window.confirm(mensagem)) {
        sess.encerrar();
        finalizar();
      }
    }

    function atualizarPlacar() {
      const acertos = sess.respostas.filter(r => r.acertou).length;
      q('[data-role="placar"]').innerHTML = UI.ScoreBoard({ sequencia: sess.sequencia, faltam: PT.faltamParaBonus(sess.sequencia),
        acertos: acertos, erros: sess.respostas.length - acertos, respondidas: sess.respostas.length, total: sess.itens.length });
      q('[data-role="trilha"]').innerHTML = UI.ProgressBar({ feitas: sess.respostas.length, total: sess.itens.length });
      q('[data-role="pontos"] [data-valor]').textContent = sess.pontos;
    }

    function ganhoVisual(texto) {
      const el = document.createElement('span');
      el.className = 'plus';
      el.textContent = texto;
      q('[data-role="pontos"]').appendChild(el);
      setTimeout(() => el.remove(), 1100);
    }

    function iniciarRelogio() {
      pararRelogio();
      const atualizar = () => {
        if (sess) q('[data-role="tempo"]').textContent = 'Tempo de sessão ' + UI.tempo(Math.floor((Date.now() - sess.inicio) / 1000));
      };
      atualizar();
      relogio = setInterval(atualizar, 1000);
    }

    function pararRelogio() {
      if (relogio) { clearInterval(relogio); relogio = null; }
    }

    /* ---------- resultado e revisão ---------- */
    function finalizar() {
      pararRelogio();
      const resumo = sess.resumo();
      let recordeNovo = false;
      if (resumo.respondidas > 0) {
        const dados = ST.carregar();
        const anterior = ST.registrarSessao(dados, def.id, resumo, sess.respostas.map(r => r.item.id), new Date().toISOString());
        ST.salvar(dados);
        recordeNovo = anterior > 0 && resumo.pontos > anterior;
      }
      const completa = sess.respostas.length === sess.itens.length;
      q('[data-role="res-titulo"]').textContent = completa ? 'Sessão concluída' : 'Sessão encerrada antes do fim';
      q('[data-role="res-corpo"]').innerHTML = resumo.respondidas
        ? UI.SessionSummary({ resumo: resumo, recordeNovo: recordeNovo, nomeCategoria: QUEST.data.categoriaNome })
        : '<p class="explain">Nenhuma questão foi respondida, por isso esta sessão não entrou no seu progresso.</p>';
      const btnRevisar = q('[data-role="btn-revisar"]');
      btnRevisar.disabled = resumo.erros === 0;
      btnRevisar.title = resumo.erros === 0 ? 'Não há questões erradas nesta sessão' : '';
      mostrarTela('resultado');
    }

    function revisar() {
      const erradas = sess.respostas.map((r, k) => ({ r: r, k: k })).filter(x => !x.r.acertou);
      q('[data-role="rev-resumo"]').textContent = erradas.length + (erradas.length === 1 ? ' questão errada' : ' questões erradas') +
        ' nesta sessão. Veja, em cada uma, a sua escolha, a resposta correta e o motivo do erro.';
      const lista = q('[data-role="revisao-lista"]');
      lista.innerHTML = erradas.map(x => cardRevisao(x.r, ordens[x.k])).join('');
      UI.renderizarFormulas(lista);
      mostrarTela('revisao');
    }

    function cardRevisao(r, ordemMostrada) {
      const item = r.item;
      const alts = def.alternativas(item);
      const certa = def.correta(item);
      const letra = idx => UI.LETRAS[ordemMostrada.indexOf(idx)];
      return '<article class="exam-card fq-rev">' + def.renderizarEnunciado(item) +
        '<p class="fq-rev-linha"><span class="pill a">Sua resposta</span> ' + letra(r.escolha) + ') ' + UI.esc(alts[r.escolha]) + '</p>' +
        '<p class="fq-rev-linha"><span class="pill b">Correta</span> ' + letra(certa) + ') ' + UI.esc(alts[certa]) + '</p>' +
        '<p class="fq-motivo">' + UI.esc(def.motivo(item, r.escolha)) + '</p>' +
        '<div class="explain"><p><b>A fórmula.</b> ' + UI.esc(def.explicacao(item)) + '</p>' + variaveisHtml(def.variaveis(item)) + '</div>' +
        '</article>';
    }

    /* ---------- eventos ---------- */
    raiz.addEventListener('click', e => {
      const alvo = e.target.closest('[data-opcao], [data-acao]');
      if (!alvo || !raiz.contains(alvo)) return;
      if (alvo.hasAttribute('data-opcao')) { responder(Number(alvo.dataset.opcao)); return; }
      switch (alvo.dataset.acao) {
        case 'comecar': case 'jogar-novamente': iniciar(); break;
        case 'proxima': proxima(); break;
        case 'encerrar': encerrarSessao(); break;
        case 'revisar': revisar(); break;
        case 'voltar-resultado': mostrarTela('resultado'); break;
        case 'ajuste': prepararAjuste(); mostrarTela('ajuste'); break;
      }
    });

    raiz.addEventListener('change', e => {
      if (e.target.name === 'fq-qtd') { cfg.quantidade = Number(e.target.value); atualizarDisponivel(); }
      if (e.target.getAttribute('data-role') === 'assunto') { cfg.categoria = e.target.value; atualizarDisponivel(); }
    });

    // atalhos: 1 a 4 escolhem a alternativa mostrada nessa posição
    document.addEventListener('keydown', e => {
      if (telaAtiva() !== 'jogo' || travado || !/^[1-4]$/.test(e.key) || e.altKey || e.ctrlKey || e.metaKey) return;
      const idx = ordem[Number(e.key) - 1];
      if (idx !== undefined) responder(idx);
    });

    prepararAjuste();
    mostrarTela('ajuste');
    UI.renderizarFormulas(raiz);
  }

  QUEST.montarAtividade = function (id, raiz) {
    const def = QUEST.registro.obter(id);
    if (!def) throw new Error('Atividade não registrada: ' + id);
    montar(raiz, def);
  };
})();

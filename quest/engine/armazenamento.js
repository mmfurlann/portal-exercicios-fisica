/* FÍSICA QUEST · motor · progresso do aluno guardado neste navegador (localStorage).
   Nenhum dado sai do aparelho. Todo acesso passa por try/catch: se o navegador bloquear
   o armazenamento (aba privada, dados do site apagados), o jogo continua sem salvar.
   Estrutura: { versao, atividades: { [id]: { sessoes, pontos, maximo, respostas, acertos,
   recorde, melhorSequencia, vistas: [ids], historico: [últimas sessões] } } } */
(function () {
  const QUEST = (window.QUEST = window.QUEST || {});
  const CHAVE = 'tal-da-fisica-quest-v1';
  const LIMITE_HISTORICO = 20;
  const LIMITE_VISTAS = 300;

  function vazio() {
    return { versao: 1, atividades: {} };
  }

  function carregar() {
    try {
      const d = JSON.parse(localStorage.getItem(CHAVE) || 'null');
      if (d && d.versao === 1 && d.atividades && typeof d.atividades === 'object') return d;
    } catch (e) { /* sem acesso ao armazenamento ou dado corrompido: começa do zero */ }
    return vazio();
  }

  function salvar(dados) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(dados));
      return true;
    } catch (e) {
      return false;
    }
  }

  function limpar() {
    try { localStorage.removeItem(CHAVE); } catch (e) { /* nada a apagar */ }
  }

  // Estatísticas de uma atividade (cria o registro na primeira vez).
  function atividade(dados, id) {
    if (!dados.atividades[id]) {
      dados.atividades[id] = { sessoes: 0, pontos: 0, maximo: 0, respostas: 0, acertos: 0,
        recorde: 0, melhorSequencia: 0, vistas: [], historico: [] };
    }
    return dados.atividades[id];
  }

  // Soma de todas as atividades, para o painel do menu.
  function totais(dados) {
    const t = { pontos: 0, maximo: 0, sessoes: 0, respostas: 0, acertos: 0, recorde: 0, melhorSequencia: 0, aproveitamento: null };
    Object.keys(dados.atividades).forEach(id => {
      const a = dados.atividades[id];
      t.pontos += a.pontos;
      t.maximo += a.maximo;
      t.sessoes += a.sessoes;
      t.respostas += a.respostas;
      t.acertos += a.acertos;
      t.recorde = Math.max(t.recorde, a.recorde);
      t.melhorSequencia = Math.max(t.melhorSequencia, a.melhorSequencia);
    });
    t.aproveitamento = t.maximo ? Math.round((t.pontos / t.maximo) * 100) : null;
    return t;
  }

  // Registra uma sessão com pelo menos uma resposta. Devolve o recorde anterior da atividade.
  function registrarSessao(dados, id, resumo, idsRespondidos, quando) {
    const a = atividade(dados, id);
    const recordeAnterior = a.recorde;
    a.sessoes++;
    a.pontos += resumo.pontos;
    a.maximo += resumo.maximo;
    a.respostas += resumo.respondidas;
    a.acertos += resumo.acertos;
    a.recorde = Math.max(a.recorde, resumo.pontos);
    a.melhorSequencia = Math.max(a.melhorSequencia, resumo.melhorSequencia);
    // as questões mais recentes ficam no fim da lista; as antigas saem primeiro
    a.vistas = a.vistas.filter(v => !idsRespondidos.includes(v)).concat(idsRespondidos).slice(-LIMITE_VISTAS);
    a.historico.unshift({ quando: quando, questoes: resumo.respondidas, pontos: resumo.pontos, maximo: resumo.maximo,
      acertos: resumo.acertos, erros: resumo.erros, segundos: resumo.segundos, melhorSequencia: resumo.melhorSequencia });
    a.historico = a.historico.slice(0, LIMITE_HISTORICO);
    return recordeAnterior;
  }

  QUEST.armazenamento = {
    chave: CHAVE,
    carregar: carregar,
    salvar: salvar,
    limpar: limpar,
    atividade: atividade,
    totais: totais,
    registrarSessao: registrarSessao
  };
})();

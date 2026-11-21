/* FÍSICA QUEST · motor · estado de uma sessão de perguntas (sem tela).
   Uma sessão recebe a lista de questões já sorteada. A cada resposta o escolhido é
   o índice da alternativa na lista original (item.alt), e a correção compara com item.ok.
   O relógio (agora) é injetável para testes. */
(function () {
  const QUEST = (window.QUEST = window.QUEST || {});
  const P = QUEST.pontuacao;

  function criar(itens, opcoes) {
    const o = opcoes || {};
    const agora = o.agora || Date.now;
    const inicio = agora();
    const respostas = [];
    let indice = 0;
    let sequencia = 0;
    let melhorSequencia = 0;
    let pontos = 0;
    let encerrada = false;
    let fim = null;

    function atual() {
      return indice < itens.length ? itens[indice] : null;
    }

    function respondida() {
      return respostas.length > indice;
    }

    function responder(escolha) {
      const item = atual();
      if (!item) throw new Error('Não há questão atual.');
      if (respondida()) throw new Error('Esta questão já foi respondida.');
      const acertou = escolha === item.ok;
      const r = P.pontuar(sequencia, acertou);
      sequencia = r.sequencia;
      if (sequencia > melhorSequencia) melhorSequencia = sequencia;
      pontos += r.ganho + r.bonus;
      const resposta = { item: item, escolha: escolha, acertou: acertou, ganho: r.ganho, bonus: r.bonus, sequencia: sequencia };
      respostas.push(resposta);
      return resposta;
    }

    // Avança para a próxima questão; devolve false quando não há mais questões.
    function avancar() {
      if (!respondida()) throw new Error('Responda a questão antes de avançar.');
      indice++;
      return indice < itens.length;
    }

    function encerrar() {
      if (!encerrada) { encerrada = true; fim = agora(); }
    }

    function terminou() {
      return encerrada || indice >= itens.length;
    }

    // Resumo da sessão: se foi encerrada antes do fim, a pontuação máxima vale só para o que foi respondido.
    function resumo() {
      const n = respostas.length;
      const acertos = respostas.filter(r => r.acertou).length;
      const erros = n - acertos;
      const porCategoria = {};
      respostas.forEach(r => {
        const c = r.item.categoria;
        porCategoria[c] = porCategoria[c] || { total: 0, erros: 0 };
        porCategoria[c].total++;
        if (!r.acertou) porCategoria[c].erros++;
      });
      const fimReal = encerrada ? fim : agora();
      return {
        total: itens.length,
        respondidas: n,
        acertos: acertos,
        erros: erros,
        pontos: pontos,
        maximo: P.maximo(n),
        aproveitamento: P.aproveitamento(pontos, n),
        melhorSequencia: melhorSequencia,
        segundos: Math.max(0, Math.round((fimReal - inicio) / 1000)),
        porCategoria: porCategoria,
        erradas: respostas.filter(r => !r.acertou)
      };
    }

    return {
      itens: itens,
      respostas: respostas,
      atual: atual,
      respondida: respondida,
      responder: responder,
      avancar: avancar,
      encerrar: encerrar,
      terminou: terminou,
      resumo: resumo,
      get indice() { return indice; },
      get pontos() { return pontos; },
      get sequencia() { return sequencia; },
      get melhorSequencia() { return melhorSequencia; },
      get inicio() { return inicio; }
    };
  }

  QUEST.sessao = { criar: criar };
})();

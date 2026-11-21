/* FÍSICA QUEST · ATIVIDADE 01 · Reconheça a fórmula.
   Mostra uma fórmula e pede o conceito físico correspondente, entre quatro alternativas.
   Os dados vêm de quest/data (QUEST.data.questoes); a tela e o fluxo vêm do motor. */
(function () {
  const QUEST = window.QUEST;
  const UI = QUEST.ui;

  QUEST.registro.registrar({
    id: 'reconheca-formula',
    numero: 1,
    nome: 'Reconheça a fórmula',
    frase: 'Descubra o conceito por trás de cada equação.',
    pagina: 'quest/reconheca-formula.html',
    quantidades: [5, 10, 15, 20],
    itens: () => QUEST.data.questoes,
    rotulos: item => ({
      categoria: QUEST.data.categoriaNome(item.categoria),
      subcategoria: QUEST.data.subNome(item.sub),
      dificuldade: item.dificuldade
    }),
    renderizarEnunciado: item => UI.FormulaCard({ tex: item.f, rotulo: 'Fórmula' }) +
      '<p class="fq-pergunta">' + UI.esc(item.pergunta) + '</p>',
    alternativas: item => item.alt,
    correta: item => item.ok,
    motivo: (item, i) => item.err[i],
    explicacao: item => item.exp,
    variaveis: item => item.vars
  });
})();

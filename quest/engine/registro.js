/* FÍSICA QUEST · registro de atividades.
   Cada atividade jogável chama QUEST.registro.registrar(definição) ao carregar seu arquivo
   (ver quest/activities/). As planejadas aparecem no menu como "Em breve" e não têm tela:
   não há página vazia nem função falsa. Para publicar uma delas, crie a pasta da atividade,
   registre-a e remova a entrada daqui. */
(function () {
  const QUEST = (window.QUEST = window.QUEST || {});
  const ativas = [];

  const planejadas = [
    { numero: 2, nome: 'Resolução rápida', frase: 'Apresentar um pequeno problema numérico e pedir que o aluno encontre o resultado.' },
    { numero: 3, nome: 'Certo ou errado', frase: 'Apresentar afirmações sobre Física para o aluno julgar.' },
    { numero: 4, nome: 'Notação científica', frase: 'Conversão, operações e interpretação de grandezas.' },
    { numero: 5, nome: 'Complete a equação', frase: 'Apresentar fórmulas incompletas para o aluno preencher.' },
    { numero: 6, nome: 'Identifique a grandeza', frase: 'Mostrar uma unidade, símbolo ou grandeza e pedir sua identificação.' },
    { numero: 7, nome: 'Desafio conceitual', frase: 'Questões rápidas de interpretação física.' }
  ];

  // Contrato de uma atividade: id, numero, nome, frase, pagina, quantidades,
  // itens() → lista de questões; rotulos(item) → {categoria, subcategoria, dificuldade};
  // renderizarEnunciado(item) → HTML; alternativas(item); correta(item) → índice;
  // motivo(item, i) → texto para uma alternativa errada; explicacao(item); variaveis(item) → [[símbolo, significado, unidade]].
  function registrar(def) {
    if (!def || !def.id) throw new Error('Atividade sem identificador.');
    if (ativas.some(a => a.id === def.id)) throw new Error('Atividade repetida: ' + def.id);
    ativas.push(def);
  }

  QUEST.registro = {
    registrar: registrar,
    ativas: () => ativas.slice().sort((a, b) => a.numero - b.numero),
    obter: id => ativas.find(a => a.id === id) || null,
    planejadas: () => planejadas.slice()
  };
})();

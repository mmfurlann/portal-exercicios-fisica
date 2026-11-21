/* FÍSICA QUEST · banco de dados (independente da interface).
   Este arquivo define a taxonomia e o construtor de questões. Cada arquivo de
   conteúdo (mecanica.js, termologia.js…) chama QUEST.data.registrar(categoria, lista).
   Campos de uma questão:
     id      identificador único (ex.: mec-cin-01)
     sub     id da subcategoria (ver CATEGORIAS)
     dif     1 básico · 2 intermediário · 3 avançado
     f       fórmula em LaTeX
     alt     quatro alternativas (conceitos)
     ok      índice da alternativa correta na lista escrita (a interface embaralha ao apresentar)
     exp     explicação curta da fórmula (o que ela diz, quando vale)
     err     motivo de cada alternativa errada, no mesmo índice de alt (null na correta)
     vars    variáveis: [símbolo LaTeX, significado, unidade SI]
     tags    palavras-chave
     exames  exames em que o tema costuma ser cobrado (classificação curatorial)
     pergunta (opcional) enunciado; padrão: "A qual conceito físico essa expressão corresponde?" */
(function () {
  const QUEST = (window.QUEST = window.QUEST || {});
  const PERGUNTA_PADRAO = 'A qual conceito físico essa expressão corresponde?';
  const DIFICULDADES = { 1: 'Básico', 2: 'Intermediário', 3: 'Avançado' };

  const CATEGORIAS = [
    { id: 'mecanica', nome: 'Mecânica', sym: 'F', subs: [
      { id: 'cinematica', nome: 'Cinemática' },
      { id: 'mu-muv', nome: 'MU e MUV' },
      { id: 'queda-livre', nome: 'Queda livre' },
      { id: 'lancamentos', nome: 'Lançamentos' },
      { id: 'mcu-mcuv', nome: 'MCU e MCUV' },
      { id: 'dinamica', nome: 'Dinâmica' },
      { id: 'leis-newton', nome: 'Leis de Newton' },
      { id: 'atrito', nome: 'Atrito' },
      { id: 'trabalho-energia', nome: 'Trabalho e energia' },
      { id: 'impulso-quantidade', nome: 'Impulso e quantidade de movimento' },
      { id: 'colisoes', nome: 'Colisões' },
      { id: 'gravitacao', nome: 'Gravitação' },
      { id: 'estatica', nome: 'Estática' },
      { id: 'hidrostatica', nome: 'Hidrostática' } ] },
    { id: 'termologia', nome: 'Termologia e Termodinâmica', sym: 'Q', subs: [
      { id: 'temperatura', nome: 'Temperatura' },
      { id: 'dilatacao', nome: 'Dilatação' },
      { id: 'calorimetria', nome: 'Calorimetria' },
      { id: 'mudancas-estado', nome: 'Mudanças de estado' },
      { id: 'gases-ideais', nome: 'Gases ideais' },
      { id: 'transformacoes-gasosas', nome: 'Transformações gasosas' },
      { id: 'primeira-lei', nome: 'Primeira lei da Termodinâmica' },
      { id: 'maquinas-termicas', nome: 'Máquinas térmicas' } ] },
    { id: 'ondulatoria', nome: 'Ondulatória', sym: 'λ', subs: [
      { id: 'mhs', nome: 'MHS' },
      { id: 'ondas', nome: 'Ondas' },
      { id: 'frequencia-periodo', nome: 'Frequência e período' },
      { id: 'interferencia', nome: 'Interferência' },
      { id: 'doppler', nome: 'Efeito Doppler' },
      { id: 'acustica', nome: 'Acústica' } ] },
    { id: 'optica', nome: 'Óptica', sym: 'n', subs: [
      { id: 'reflexao', nome: 'Reflexão' },
      { id: 'espelhos-planos', nome: 'Espelhos planos' },
      { id: 'espelhos-esfericos', nome: 'Espelhos esféricos' },
      { id: 'refracao', nome: 'Refração' },
      { id: 'lentes', nome: 'Lentes' },
      { id: 'instrumentos-opticos', nome: 'Instrumentos ópticos' } ] },
    { id: 'eletricidade', nome: 'Eletricidade', sym: 'i', subs: [
      { id: 'eletrostatica', nome: 'Eletrostática' },
      { id: 'coulomb', nome: 'Lei de Coulomb' },
      { id: 'campo-potencial', nome: 'Campo e potencial elétrico' },
      { id: 'corrente', nome: 'Corrente elétrica' },
      { id: 'leis-ohm', nome: 'Leis de Ohm' },
      { id: 'resistores', nome: 'Resistores' },
      { id: 'circuitos', nome: 'Circuitos' },
      { id: 'potencia-eletrica', nome: 'Potência e energia elétrica' },
      { id: 'capacitores', nome: 'Capacitores' } ] },
    { id: 'eletromagnetismo', nome: 'Eletromagnetismo', sym: 'B', subs: [
      { id: 'campo-magnetico', nome: 'Campo magnético' },
      { id: 'forca-magnetica', nome: 'Força magnética' },
      { id: 'inducao', nome: 'Indução eletromagnética' },
      { id: 'faraday-lenz', nome: 'Faraday e Lenz' },
      { id: 'transformadores', nome: 'Transformadores' } ] },
    { id: 'fisica-moderna', nome: 'Física Moderna', sym: 'h', subs: [
      { id: 'relatividade', nome: 'Relatividade' },
      { id: 'fotoeletrico', nome: 'Efeito fotoelétrico' },
      { id: 'quantica', nome: 'Física quântica' },
      { id: 'radioatividade', nome: 'Radioatividade' },
      { id: 'meia-vida', nome: 'Meia-vida' },
      { id: 'fissao-fusao', nome: 'Fissão e fusão nuclear' } ] }
  ];

  const porId = new Map();
  const questoes = [];
  const alertas = [];

  // Normaliza uma questão para o formato interno e registra avisos de consistência.
  function normalizar(categoria, raw) {
    const q = {
      id: raw.id,
      categoria: categoria,
      sub: raw.sub,
      dif: raw.dif,
      dificuldade: DIFICULDADES[raw.dif] || '',
      f: raw.f,
      pergunta: raw.pergunta || PERGUNTA_PADRAO,
      alt: raw.alt.slice(),
      ok: raw.ok,
      exp: raw.exp,
      err: raw.err ? raw.err.slice() : [],
      vars: raw.vars || [],
      tags: raw.tags || [],
      exames: raw.exames || []
    };
    if (porId.has(q.id)) alertas.push('id repetido: ' + q.id);
    if (!CATEGORIAS.find(c => c.id === categoria)) alertas.push('categoria desconhecida: ' + q.id);
    if (!CATEGORIAS.some(c => c.subs.some(s => s.id === q.sub))) alertas.push('subcategoria desconhecida: ' + q.id);
    if (q.alt.length !== 4) alertas.push('são necessárias 4 alternativas: ' + q.id);
    if (!(q.ok >= 0 && q.ok < 4)) alertas.push('índice correto inválido: ' + q.id);
    if (new Set(q.alt).size !== q.alt.length) alertas.push('alternativas repetidas: ' + q.id);
    for (let i = 0; i < q.alt.length; i++) {
      if (i === q.ok) continue;
      if (!q.err[i]) alertas.push('falta o motivo da alternativa ' + (i + 1) + ': ' + q.id);
    }
    porId.set(q.id, q);
    questoes.push(q);
    return q;
  }

  QUEST.data = {
    categorias: CATEGORIAS,
    dificuldades: DIFICULDADES,
    questoes: questoes,
    alertas: alertas,
    registrar: function (categoria, lista) {
      lista.forEach(raw => normalizar(categoria, raw));
    },
    porId: id => porId.get(id) || null,
    categoriaDe: subId => {
      const c = CATEGORIAS.find(cat => cat.subs.some(s => s.id === subId));
      return c ? c.id : null;
    },
    subNome: subId => {
      for (const c of CATEGORIAS) {
        const s = c.subs.find(x => x.id === subId);
        if (s) return s.nome;
      }
      return subId;
    },
    categoriaNome: catId => {
      const c = CATEGORIAS.find(x => x.id === catId);
      return c ? c.nome : catId;
    }
  };
})();

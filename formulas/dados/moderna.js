/* Biblioteca de Fórmulas · G. FÍSICA MODERNA
   Campos: veja o comentário no topo de formulas/app.js. Texto com matemática entre $...$. */
(function () {
const T = String.raw;
const F = window.FORMULAS = window.FORMULAS || { areas: [], formulas: [] };

F.areas.push({
  id: 'moderna', nome: 'Física moderna', sym: 'h',
  intro: T`A física do século XX: relatividade, quantização da energia, o átomo e o núcleo. Duas constantes dominam tudo: a velocidade da luz $c$ e a constante de Planck $h$.`,
  subs: [
    { id: 'relatividade', nome: 'Relatividade restrita', topicos: ['Fator de Lorentz', 'Dilatação do tempo e contração do espaço', 'Composição de velocidades'] },
    { id: 'massa-energia', nome: 'Equivalência massa-energia', topicos: ['Energia de repouso', 'Energia relativística'] },
    { id: 'quantica', nome: 'Quantização da energia e efeito fotoelétrico', topicos: ['Fótons', 'Efeito fotoelétrico', 'Dualidade onda-partícula'] },
    { id: 'atomo', nome: 'Modelo atômico', topicos: ['Modelo de Bohr', 'Espectros atômicos'] },
    { id: 'radioatividade', nome: 'Radioatividade e meia-vida', topicos: ['Decaimentos radioativos', 'Meia-vida', 'Decaimento exponencial'] },
    { id: 'nuclear', nome: 'Fissão, fusão e energia nuclear', topicos: ['Energia de ligação', 'Fissão e fusão', 'Usinas nucleares'] },
  ],
});

const L = [
/* ===================== RELATIVIDADE ===================== */
{ id: 'lorentz', sub: 'relatividade', topico: 'Fator de Lorentz', top: true,
  nome: 'Fator de Lorentz', tex: T`\gamma = \dfrac{1}{\sqrt{1 - \dfrac{v^2}{c^2}}}`,
  vars: [[T`\gamma`, 'fator de Lorentz (sempre ≥ 1)', 'adimensional'], [T`v`, 'velocidade relativa entre os referenciais', 'm/s'], [T`c`, 'velocidade da luz: 3 × 10⁸', 'm/s']],
  uso: T`Aparece em todas as fórmulas da relatividade restrita.`,
  val: T`Postulados de Einstein: as leis da física são as mesmas em todos os referenciais inerciais, e $c$ é a mesma para todos os observadores. Para $v \ll c$, $\gamma \approx 1$ e volta-se à física clássica.`,
  obs: T`Valores úteis: $v = 0{,}6c \Rightarrow \gamma = 1{,}25$; $v = 0{,}8c \Rightarrow \gamma = 5/3$.`,
  ex: [T`Qual o fator de Lorentz para $v = 0{,}8\,c$?`, T`$\gamma = \dfrac{1}{\sqrt{1 - 0{,}64}} = \dfrac{1}{0{,}6} \approx 1{,}67$`],
  tags: 'fator de lorentz gama relatividade restrita einstein postulados' },

{ id: 'dilatacao-tempo', sub: 'relatividade', topico: 'Dilatação do tempo e contração do espaço', top: true,
  nome: 'Dilatação do tempo', tex: T`\Delta t = \gamma\,\Delta t_0`,
  vars: [[T`\Delta t_0`, 'tempo próprio: medido no referencial em que os eventos ocorrem no mesmo lugar (relógio que se move junto)', 's'], [T`\Delta t`, 'tempo medido pelo observador em relação ao qual o relógio se move', 's']],
  uso: T`Múons que chegam ao solo, relógios de GPS, "paradoxo dos gêmeos".`,
  val: T`Referenciais inerciais. Relógios em movimento andam mais devagar para quem os vê passar.`,
  ex: [T`Uma nave viaja a 0,8c durante 1 ano medido a bordo.`, T`$\Delta t = \dfrac{5}{3} \cdot 1 \approx 1{,}67$ ano na Terra`],
  tags: 'dilatacao do tempo tempo proprio relatividade gemeos muon' },

{ id: 'contracao-espaco', sub: 'relatividade', topico: 'Dilatação do tempo e contração do espaço',
  nome: 'Contração do comprimento', tex: T`L = \dfrac{L_0}{\gamma}`,
  vars: [[T`L_0`, 'comprimento próprio (medido em repouso em relação ao objeto)', 'm'], [T`L`, 'comprimento medido por quem vê o objeto passar', 'm']],
  uso: T`Comprimentos de naves, réguas e distâncias percorridas a velocidades próximas à da luz.`,
  val: T`Só na direção do movimento; as dimensões perpendiculares não mudam.`,
  ex: [T`Uma nave de 100 m passa a 0,6c.`, T`$L = \dfrac{100}{1{,}25} = 80\ \text{m}$`],
  tags: 'contracao do comprimento espaco relatividade' },

{ id: 'composicao-relativistica', sub: 'relatividade', topico: 'Composição de velocidades',
  nome: 'Composição relativística de velocidades', tex: T`u = \dfrac{u' + v}{1 + \dfrac{u'\,v}{c^2}}`,
  vars: [[T`u'`, 'velocidade do corpo medida no referencial móvel', 'm/s'], [T`v`, 'velocidade do referencial móvel', 'm/s'], [T`u`, 'velocidade do corpo no referencial fixo', 'm/s']],
  uso: T`Para somar velocidades próximas à da luz. Nível ITA/IME.`,
  val: T`Movimentos na mesma direção. Nunca dá mais que $c$; se $u' = c$, o resultado é $c$. Para baixas velocidades, vira a soma de Galileu.`,
  ex: [T`Uma nave a 0,5c dispara um projétil a 0,5c (em relação a ela), para a frente.`, T`$u = \dfrac{c}{1 + 0{,}25} = 0{,}8\,c$ (e não $c$)`],
  ver: [['Composição de velocidades clássica', '#f/mov-relativo']], tags: 'composicao relativistica velocidades' },

/* ===================== MASSA-ENERGIA ===================== */
{ id: 'emc2', sub: 'massa-energia', topico: 'Energia de repouso', top: true,
  nome: 'Equivalência massa-energia', tex: T`E = m\,c^2`,
  alt: [[T`Variação de massa e energia`, T`\Delta E = \Delta m\,c^2`], [T`Unidade de massa atômica`, T`1\ \text{u} \cdot c^2 \approx 931{,}5\ \text{MeV}`]],
  vars: [[T`E`, 'energia de repouso', 'J'], [T`m`, 'massa', 'kg'], [T`c`, 'velocidade da luz', 'm/s']],
  uso: T`Energia liberada em reações nucleares, aniquilação matéria-antimatéria, defeito de massa.`,
  val: T`Massa e energia são equivalentes. Em reações químicas a variação de massa é desprezível; nas nucleares, não.`,
  ex: [T`Quanta energia corresponde a 1 g de massa?`, T`$E = 10^{-3} \cdot (3 \cdot 10^8)^2 = 9 \cdot 10^{13}\ \text{J}$ (cerca de uma bomba de Hiroshima)`],
  ver: [['FUVEST 2027, questão 42', 'fuvest.html#q42']], tags: 'e=mc2 massa energia einstein equivalencia repouso' },

{ id: 'energia-relativistica', sub: 'massa-energia', topico: 'Energia relativística',
  nome: 'Energia e momento relativísticos', tex: T`E = \gamma\,m\,c^2 \qquad E_c = (\gamma - 1)\,m\,c^2`,
  alt: [[T`Relação entre energia e momento`, T`E^2 = (p\,c)^2 + (m\,c^2)^2`], [T`Momento linear`, T`p = \gamma\,m\,v`]],
  vars: [[T`E`, 'energia total da partícula', 'J'], [T`E_c`, 'energia cinética', 'J'], [T`p`, 'momento linear', 'kg·m/s'], [T`m`, 'massa (de repouso)', 'kg']],
  uso: T`Partículas rápidas em aceleradores. Para o fóton ($m = 0$): $E = pc$. Nível ITA/IME.`,
  val: T`Qualquer velocidade abaixo de $c$. Para $v \ll c$, $E_c$ volta a ser $mv^2/2$.`,
  ex: [T`Um elétron ($mc^2 = 0{,}511$ MeV) a 0,6c.`, T`$E = 1{,}25 \cdot 0{,}511 \approx 0{,}64\ \text{MeV}; \quad E_c \approx 0{,}13\ \text{MeV}$`],
  tags: 'energia relativistica momento gama particula acelerador' },

/* ===================== QUANTIZAÇÃO E FOTOELÉTRICO ===================== */
{ id: 'foton', sub: 'quantica', topico: 'Fótons', top: true,
  nome: 'Energia do fóton (Planck-Einstein)', tex: T`E = h\,f = \dfrac{h\,c}{\lambda}`,
  alt: [[T`Atalho em eV e nm`, T`E\ (\text{eV}) \approx \dfrac{1240}{\lambda\ (\text{nm})}`], [T`Quantização de Planck`, T`E_n = n\,h\,f`]],
  vars: [[T`E`, 'energia de um fóton', 'J ou eV'], [T`h`, 'constante de Planck: 6,63 × 10⁻³⁴ J·s = 4,14 × 10⁻¹⁵ eV·s', ''], [T`f`, 'frequência da radiação', 'Hz'], [T`\lambda`, 'comprimento de onda', 'm']],
  uso: T`Para a energia de cada "pacote" de luz: cores, ultravioleta, raios X, radiação de celulares.`,
  val: T`Qualquer radiação eletromagnética. A energia de cada fóton depende só da frequência; a intensidade mede **quantos** fótons chegam.`,
  ex: [T`Energia de um fóton de luz verde (500 nm).`, T`$E \approx \dfrac{1240}{500} \approx 2{,}5\ \text{eV} \approx 4 \cdot 10^{-19}\ \text{J}$`],
  tags: 'foton planck energia quantum constante de planck hf' },

{ id: 'fotoeletrico', sub: 'quantica', topico: 'Efeito fotoelétrico', top: true,
  nome: 'Equação do efeito fotoelétrico (Einstein)', tex: T`K_{máx} = h\,f - \phi`,
  alt: [[T`Frequência e comprimento de onda de corte`, T`f_0 = \dfrac{\phi}{h} \qquad \lambda_0 = \dfrac{h\,c}{\phi}`], [T`Tensão de corte`, T`e\,V_0 = K_{máx}`]],
  vars: [[T`K_{máx}`, 'energia cinética máxima dos elétrons arrancados', 'J ou eV'], [T`\phi`, 'função trabalho do metal', 'J ou eV'], [T`V_0`, 'tensão (potencial) de corte', 'V']],
  uso: T`Células fotoelétricas, sensores de luz, explicação da natureza corpuscular da luz.`,
  val: T`Só há emissão se $hf > \phi$, **qualquer que seja a intensidade**. A intensidade só altera o número de elétrons (a corrente), não a energia deles.`,
  ex: [T`Luz de 400 nm ilumina sódio ($\phi = 2{,}28$ eV).`, T`$K_{máx} = 3{,}10 - 2{,}28 = 0{,}82\ \text{eV}$; tensão de corte de 0,82 V`],
  ver: [['Simulador de efeito fotoelétrico', 'fotoeletrico.html']], tags: 'efeito fotoeletrico funcao trabalho einstein tensao de corte limiar' },

{ id: 'de-broglie', sub: 'quantica', topico: 'Dualidade onda-partícula',
  nome: 'Comprimento de onda de De Broglie', tex: T`\lambda = \dfrac{h}{p} = \dfrac{h}{m\,v}`,
  alt: [[T`Momento do fóton`, T`p = \dfrac{h}{\lambda} = \dfrac{E}{c}`]],
  vars: [[T`\lambda`, 'comprimento de onda associado à partícula', 'm'], [T`p`, 'momento linear', 'kg·m/s'], [T`m,\ v`, 'massa e velocidade', 'kg, m/s']],
  uso: T`Microscópio eletrônico, difração de elétrons, por que não vemos o caráter ondulatório de bolas de futebol.`,
  val: T`Partículas não relativísticas para $p = mv$. Efeitos ondulatórios aparecem quando $\lambda$ é comparável ao tamanho dos obstáculos.`,
  ex: [T`Um elétron a $10^6$ m/s ($m = 9{,}1 \cdot 10^{-31}$ kg).`, T`$\lambda = \dfrac{6{,}63 \cdot 10^{-34}}{9{,}1 \cdot 10^{-31} \cdot 10^6} \approx 7{,}3 \cdot 10^{-10}\ \text{m}$, da ordem de um átomo`],
  tags: 'de broglie dualidade onda particula comprimento de onda materia' },

{ id: 'heisenberg', sub: 'quantica', topico: 'Dualidade onda-partícula',
  nome: 'Princípio da incerteza de Heisenberg', tex: T`\Delta x \cdot \Delta p \ge \dfrac{h}{4\pi}`,
  alt: [[T`Energia e tempo`, T`\Delta E \cdot \Delta t \ge \dfrac{h}{4\pi}`]],
  vars: [[T`\Delta x`, 'incerteza na posição', 'm'], [T`\Delta p`, 'incerteza no momento linear', 'kg·m/s']],
  uso: T`Para entender os limites fundamentais de medida no mundo atômico.`,
  val: T`Não é limitação dos instrumentos: é uma propriedade da natureza. Quanto mais precisa a posição, menos preciso o momento.`,
  ex: [T`Um elétron confinado em $\Delta x = 10^{-10}$ m.`, T`$\Delta p \ge \dfrac{6{,}63 \cdot 10^{-34}}{4\pi \cdot 10^{-10}} \approx 5{,}3 \cdot 10^{-25}\ \text{kg·m/s}$`],
  tags: 'heisenberg incerteza mecanica quantica' },

/* ===================== ÁTOMO ===================== */
{ id: 'bohr-energia', sub: 'atomo', topico: 'Modelo de Bohr',
  nome: 'Níveis de energia do átomo de hidrogênio (Bohr)', tex: T`E_n = -\,\dfrac{13{,}6}{n^2}\ \text{eV}`,
  alt: [[T`Raio das órbitas`, T`r_n = n^2\,r_1 \qquad r_1 \approx 0{,}53 \cdot 10^{-10}\ \text{m}`]],
  vars: [[T`E_n`, 'energia do elétron no nível n', 'eV'], [T`n`, 'número quântico principal (1, 2, 3, …)', 'adimensional']],
  uso: T`Espectro do hidrogênio, energia de ionização, transições eletrônicas.`,
  val: T`Átomo de hidrogênio (ou íons com um só elétron, multiplicando por $Z^2$). Energia negativa: elétron ligado. Ionização a partir do fundamental: 13,6 eV.`,
  ex: [T`Energia do nível 2 do hidrogênio.`, T`$E_2 = -\dfrac{13{,}6}{4} = -3{,}4\ \text{eV}$`],
  tags: 'bohr niveis de energia hidrogenio orbita ionizacao' },

{ id: 'transicao', sub: 'atomo', topico: 'Espectros atômicos', top: true,
  nome: 'Transição eletrônica (emissão e absorção)', tex: T`h\,f = E_i - E_f`,
  alt: [[T`Fórmula de Rydberg (hidrogênio)`, T`\dfrac{1}{\lambda} = R_H\left(\dfrac{1}{n_f^2} - \dfrac{1}{n_i^2}\right) \qquad R_H \approx 1{,}097 \cdot 10^7\ \text{m}^{-1}`]],
  vars: [[T`E_i,\ E_f`, 'energias dos níveis inicial e final', 'J ou eV'], [T`f`, 'frequência do fóton emitido ou absorvido', 'Hz'], [T`n_i,\ n_f`, 'números quânticos inicial e final', 'adimensional']],
  uso: T`Cores de fogos de artifício, lâmpadas de neon e de sódio, análise espectral de estrelas.`,
  val: T`Emissão: o elétron desce de nível ($E_i > E_f$). Absorção: só fótons com energia **exatamente** igual a uma diferença de níveis são absorvidos. Cada elemento tem um espectro próprio, como uma impressão digital.`,
  ex: [T`O elétron do hidrogênio cai do nível 3 para o 2.`, T`$\Delta E = 13{,}6\left(\dfrac{1}{4} - \dfrac{1}{9}\right) \approx 1{,}89\ \text{eV} \Rightarrow \lambda \approx \dfrac{1240}{1{,}89} \approx 656\ \text{nm}$ (vermelho)`],
  tags: 'transicao eletronica espectro emissao absorcao rydberg balmer' },

/* ===================== RADIOATIVIDADE ===================== */
{ id: 'decaimentos', sub: 'radioatividade', topico: 'Decaimentos radioativos', top: true,
  nome: 'Decaimentos alfa, beta e gama', tex: T`{}^{A}_{Z}X \to {}^{A-4}_{Z-2}Y + {}^{4}_{2}\alpha \qquad {}^{A}_{Z}X \to {}^{A}_{Z+1}Y + {}^{\;\,0}_{-1}\beta + \bar\nu`,
  alt: [[T`Gama: só energia (o núcleo excitado se acomoda)`, T`{}^{A}_{Z}X^{*} \to {}^{A}_{Z}X + \gamma`]],
  vars: [[T`A`, 'número de massa (prótons + nêutrons)', 'adimensional'], [T`Z`, 'número atômico (prótons)', 'adimensional'], [T`\alpha`, 'partícula alfa: núcleo de hélio', ''], [T`\beta`, 'partícula beta: elétron emitido pelo núcleo', ''], [T`\gamma`, 'radiação gama: fóton de alta energia', '']],
  uso: T`Para completar equações de decaimento e séries radioativas.`,
  val: T`Em toda reação nuclear se conservam o número de massa (soma de A) e a carga (soma de Z). Poder de penetração: α < β < γ.`,
  ex: [T`O urânio-238 emite uma partícula alfa.`, T`$\,{}^{238}_{\;92}\text{U} \to {}^{234}_{\;90}\text{Th} + {}^{4}_{2}\alpha$`],
  tags: 'decaimento alfa beta gama radioatividade numero de massa numero atomico' },

{ id: 'meia-vida', sub: 'radioatividade', topico: 'Meia-vida', top: true,
  nome: 'Meia-vida (decaimento radioativo)', tex: T`N = N_0\left(\dfrac{1}{2}\right)^{t/T_{1/2}}`,
  alt: [[T`Também para massa e atividade`, T`m = m_0\left(\dfrac{1}{2}\right)^{t/T_{1/2}} \qquad A = A_0\left(\dfrac{1}{2}\right)^{t/T_{1/2}}`]],
  vars: [[T`N`, 'número de núcleos que ainda não decaíram', 'adimensional'], [T`N_0`, 'número inicial', 'adimensional'], [T`t`, 'tempo decorrido', 's, anos…'], [T`T_{1/2}`, 'meia-vida: tempo para metade dos núcleos decair', 's, anos…']],
  uso: T`Datação por carbono-14, lixo radioativo, medicina nuclear (iodo-131, tecnécio).`,
  val: T`Processo aleatório: vale para grandes quantidades de núcleos. A meia-vida não depende da temperatura, da pressão nem da quantidade inicial.`,
  ex: [T`Um fóssil tem 25% do carbono-14 original ($T_{1/2} = 5\,730$ anos).`, T`$\dfrac{1}{4} = \left(\dfrac{1}{2}\right)^2 \Rightarrow t = 2 \cdot 5\,730 = 11\,460\ \text{anos}$`],
  tags: 'meia vida decaimento radioativo carbono 14 datacao' },

{ id: 'decaimento-exponencial', sub: 'radioatividade', topico: 'Decaimento exponencial',
  nome: 'Lei do decaimento exponencial', tex: T`N = N_0\,e^{-\lambda t}`,
  alt: [[T`Relação com a meia-vida`, T`T_{1/2} = \dfrac{\ln 2}{\lambda}`], [T`Atividade`, T`A = \lambda\,N`]],
  vars: [[T`\lambda`, 'constante de decaimento', 's⁻¹'], [T`A`, 'atividade (decaimentos por segundo)', 'Bq (becquerel)']],
  uso: T`Cálculos com tempos que não são múltiplos inteiros da meia-vida. Nível ITA/IME.`,
  val: T`É a mesma lei da meia-vida escrita na base $e$. Não confunda esta constante $\lambda$ com comprimento de onda.`,
  ex: [T`O iodo-131 tem meia-vida de 8 dias. Que fração resta após 24 dias?`, T`$\left(\dfrac{1}{2}\right)^{24/8} = \dfrac{1}{8} = 12{,}5\%$`],
  tags: 'decaimento exponencial constante de decaimento atividade becquerel' },

/* ===================== NUCLEAR ===================== */
{ id: 'energia-ligacao', sub: 'nuclear', topico: 'Energia de ligação',
  nome: 'Defeito de massa e energia de ligação', tex: T`E_L = \Delta m\,c^2 \qquad \Delta m = Z\,m_p + (A - Z)\,m_n - m_{núcleo}`,
  vars: [[T`E_L`, 'energia de ligação do núcleo', 'J ou MeV'], [T`\Delta m`, 'defeito de massa: quanto o núcleo pesa a menos que as partes separadas', 'kg ou u'], [T`m_p,\ m_n`, 'massas do próton e do nêutron', 'kg ou u']],
  uso: T`Para entender a estabilidade dos núcleos e de onde vem a energia nuclear.`,
  val: T`A energia de ligação **por núcleon** é máxima perto do ferro: núcleos pesados liberam energia ao se dividir (fissão) e leves, ao se juntar (fusão).`,
  ex: [T`O hélio-4 tem defeito de massa de 0,0304 u.`, T`$E_L = 0{,}0304 \cdot 931{,}5 \approx 28{,}3\ \text{MeV}$ (cerca de 7 MeV por núcleon)`],
  tags: 'energia de ligacao defeito de massa nucleo estabilidade' },

{ id: 'fissao-fusao', sub: 'nuclear', topico: 'Fissão e fusão', top: true,
  nome: 'Energia liberada numa reação nuclear', tex: T`Q = (m_{reagentes} - m_{produtos})\,c^2`,
  alt: [[T`Fissão típica do urânio-235`, T`{}^{235}\text{U} + n \to {}^{141}\text{Ba} + {}^{92}\text{Kr} + 3\,n + {\approx}\,200\ \text{MeV}`], [T`Fusão deutério-trítio`, T`{}^{2}\text{H} + {}^{3}\text{H} \to {}^{4}\text{He} + n + 17{,}6\ \text{MeV}`]],
  vars: [[T`Q`, 'energia liberada (Q > 0: reação exotérmica)', 'J ou MeV'], [T`m`, 'massas antes e depois', 'kg ou u']],
  uso: T`Reatores e bombas (fissão), Sol e estrelas (fusão do hidrogênio em hélio).`,
  val: T`Conservação do número de massa e da carga. A fissão em cadeia exige massa crítica; a fusão exige temperaturas de milhões de kelvin.`,
  ex: [T`Quanta energia liberaria a fissão de 1 kg de urânio-235 (200 MeV por fissão)?`, T`$N = \dfrac{1000}{235} \cdot 6{,}02 \cdot 10^{23} \approx 2{,}6 \cdot 10^{24} \Rightarrow E \approx 2{,}6 \cdot 10^{24} \cdot 3{,}2 \cdot 10^{-11} \approx 8 \cdot 10^{13}\ \text{J}$`],
  tags: 'fissao fusao reacao nuclear energia liberada uranio sol' },

{ id: 'usina-nuclear', sub: 'nuclear', topico: 'Usinas nucleares',
  nome: 'Potência de uma usina nuclear', tex: T`P_{elétrica} = \eta \cdot N_f \cdot E_f`,
  vars: [[T`\eta`, 'rendimento da usina (térmica)', 'adimensional'], [T`N_f`, 'fissões por segundo', 's⁻¹'], [T`E_f`, 'energia liberada por fissão (≈ 200 MeV = 3,2 × 10⁻¹¹ J)', 'J']],
  uso: T`Para dimensionar o consumo de combustível de reatores como os de Angra.`,
  val: T`Uma usina nuclear é uma usina **térmica**: o calor da fissão ferve água e o vapor move turbinas; o rendimento é limitado como em qualquer máquina térmica (cerca de 33%).`,
  ex: [T`Quantas fissões por segundo para 1 GW elétricos com rendimento de 1/3?`, T`$N_f = \dfrac{3 \cdot 10^9}{3{,}2 \cdot 10^{-11}} \approx 9 \cdot 10^{19}$ fissões por segundo`],
  ver: [['Rendimento de máquinas térmicas', '#f/rendimento-maquina']], tags: 'usina nuclear reator angra potencia' },
];

L.forEach(f => { f.area = 'moderna'; });
F.formulas.push(...L);
})();

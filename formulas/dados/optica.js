/* Biblioteca de Fórmulas · D. ÓPTICA
   Campos: veja o comentário no topo de formulas/app.js. Texto com matemática entre $...$.
   Convenção de sinais (referencial de Gauss): p > 0 objeto real; p' > 0 imagem real; f > 0 espelho côncavo ou lente convergente. */
(function () {
const T = String.raw;
const F = window.FORMULAS = window.FORMULAS || { areas: [], formulas: [] };

F.areas.push({
  id: 'optica', nome: 'Óptica', sym: 'n',
  intro: T`Óptica geométrica: a luz tratada como raios. Em espelhos esféricos e lentes, as mesmas duas equações (Gauss e aumento) resolvem quase tudo; o segredo está na convenção de sinais.`,
  subs: [
    { id: 'fundamentos', nome: 'Fundamentos e propagação da luz', topicos: ['Princípios da propagação da luz', 'Velocidade da luz'] },
    { id: 'reflexao', nome: 'Reflexão e espelhos planos', topicos: ['Leis da reflexão', 'Espelhos planos'] },
    { id: 'esfericos', nome: 'Espelhos esféricos e equação de Gauss', topicos: ['Foco e raio', 'Equação de Gauss', 'Aumento linear'] },
    { id: 'refracao', nome: 'Refração da luz', topicos: ['Índice de refração', 'Lei de Snell-Descartes', 'Reflexão total', 'Dioptros e lâminas', 'Prismas'] },
    { id: 'lentes', nome: 'Lentes esféricas', topicos: ['Equação das lentes', 'Vergência', 'Equação dos fabricantes', 'Associação de lentes'] },
    { id: 'instrumentos', nome: 'Instrumentos ópticos', topicos: ['Lupa', 'Microscópio', 'Luneta e telescópio'] },
    { id: 'olho', nome: 'Olho humano e defeitos da visão', topicos: ['Miopia', 'Hipermetropia e presbiopia'] },
  ],
});

const L = [
/* ===================== FUNDAMENTOS ===================== */
{ id: 'camara-escura', sub: 'fundamentos', topico: 'Princípios da propagação da luz',
  nome: 'Câmara escura de orifício', tex: T`\dfrac{i}{o} = \dfrac{p'}{p}`,
  vars: [[T`i`, 'tamanho da imagem (invertida)', 'm'], [T`o`, 'tamanho do objeto', 'm'], [T`p'`, 'distância do orifício à parede onde se forma a imagem', 'm'], [T`p`, 'distância do objeto ao orifício', 'm']],
  uso: T`Câmara escura, máquina pinhole e qualquer problema de semelhança de triângulos com raios que se cruzam num ponto.`,
  val: T`Propagação retilínea da luz em meio homogêneo e transparente. A imagem é invertida e não depende da forma do orifício (se ele for pequeno).`,
  ex: [T`Uma árvore de 6 m, a 12 m de uma câmara de 20 cm de profundidade.`, T`$i = 6 \cdot \dfrac{0{,}2}{12} = 0{,}1\ \text{m} = 10\ \text{cm}$`],
  tags: 'camara escura orificio propagacao retilinea pinhole' },

{ id: 'sombra', sub: 'fundamentos', topico: 'Princípios da propagação da luz',
  nome: 'Sombra e semelhança de triângulos', tex: T`\dfrac{H}{S} = \dfrac{h}{s}`,
  vars: [[T`H,\ h`, 'alturas de dois objetos verticais', 'm'], [T`S,\ s`, 'comprimentos das sombras, no mesmo instante', 'm']],
  uso: T`Medir alturas de prédios ou árvores pela sombra (como Tales fez com as pirâmides).`,
  val: T`Raios solares paralelos (fonte muito distante) e objetos verticais em solo plano. Os princípios da óptica: propagação retilínea, independência dos raios e reversibilidade.`,
  ex: [T`Uma vara de 1 m faz sombra de 0,8 m; ao mesmo tempo, um prédio faz sombra de 24 m.`, T`$H = 24 \cdot \dfrac{1}{0{,}8} = 30\ \text{m}$`],
  tags: 'sombra penumbra semelhanca tales eclipse' },

{ id: 'velocidade-luz', sub: 'fundamentos', topico: 'Velocidade da luz',
  nome: 'Velocidade da luz e tempo de percurso', tex: T`c = 3{,}0 \cdot 10^8\ \text{m/s} \qquad \Delta t = \dfrac{d}{c}`,
  vars: [[T`c`, 'velocidade da luz no vácuo (≈ no ar)', 'm/s'], [T`d`, 'distância percorrida', 'm']],
  uso: T`Quanto tempo a luz leva para chegar (do Sol, da Lua, de um satélite).`,
  val: T`No vácuo. Em outros meios a luz é mais lenta: $v = c/n$.`,
  ex: [T`Quanto tempo a luz do Sol leva até a Terra (1,5 × 10¹¹ m)?`, T`$\Delta t = \dfrac{1{,}5 \cdot 10^{11}}{3 \cdot 10^8} = 500\ \text{s} \approx 8{,}3\ \text{min}$`],
  ver: [['Ano-luz e unidades astronômicas', '#f/unidades-astronomicas']], tags: 'velocidade da luz tempo de percurso' },

/* ===================== REFLEXÃO E ESPELHOS PLANOS ===================== */
{ id: 'leis-reflexao', sub: 'reflexao', topico: 'Leis da reflexão', top: true,
  nome: 'Leis da reflexão', tex: T`\hat{i} = \hat{r}`,
  vars: [[T`\hat i`, 'ângulo de incidência (com a normal)', '°'], [T`\hat r`, 'ângulo de reflexão (com a normal)', '°']],
  uso: T`Qualquer reflexão regular: espelhos, superfícies polidas, água parada.`,
  val: T`Os ângulos são medidos em relação à **normal** (reta perpendicular à superfície), não à superfície. 1ª lei: raio incidente, normal e raio refletido estão no mesmo plano.`,
  ex: [T`Um raio faz 30° com a superfície de um espelho.`, T`O ângulo com a normal é 60°, então ele reflete a 60° da normal.`],
  tags: 'leis da reflexao angulo incidencia normal' },

{ id: 'espelho-plano', sub: 'reflexao', topico: 'Espelhos planos', top: true,
  nome: 'Imagem no espelho plano', tex: T`d_{imagem} = d_{objeto} \qquad i = o`,
  alt: [[T`Espelho que se afasta com velocidade v`, T`v_{imagem} = 2\,v`], [T`Espelho girado de um ângulo α`, T`\text{o raio refletido gira } 2\alpha`], [T`Altura mínima do espelho para se ver por inteiro`, T`h_{mín} = \dfrac{H}{2}`]],
  vars: [[T`d`, 'distâncias da imagem e do objeto ao espelho', 'm'], [T`i,\ o`, 'tamanhos da imagem e do objeto', 'm']],
  uso: T`Espelhos de parede, retrovisores planos, periscópios.`,
  val: T`A imagem é virtual, direita, do mesmo tamanho e simétrica ao objeto (troca direita e esquerda: é "enantiomorfa").`,
  ex: [T`Uma pessoa de 1,80 m quer se ver por inteiro num espelho plano vertical.`, T`$h_{mín} = 0{,}90\ \text{m}$, qualquer que seja a distância ao espelho.`],
  tags: 'espelho plano imagem virtual simetrica translacao rotacao' },

{ id: 'associacao-espelhos', sub: 'reflexao', topico: 'Espelhos planos',
  nome: 'Associação de espelhos planos (número de imagens)', tex: T`N = \dfrac{360°}{\alpha} - 1`,
  vars: [[T`N`, 'número de imagens', 'adimensional'], [T`\alpha`, 'ângulo entre os espelhos', '°']],
  uso: T`Caleidoscópios, provadores de loja, espelhos em ângulo.`,
  val: T`Vale sempre que $360°/\alpha$ é par; se for ímpar, vale com o objeto no plano bissetor. Espelhos paralelos: infinitas imagens.`,
  ex: [T`Dois espelhos formam 60°.`, T`$N = \dfrac{360}{60} - 1 = 5$ imagens`],
  tags: 'associacao espelhos numero de imagens caleidoscopio angulo' },

/* ===================== ESPELHOS ESFÉRICOS ===================== */
{ id: 'foco-raio', sub: 'esfericos', topico: 'Foco e raio',
  nome: 'Distância focal de um espelho esférico', tex: T`f = \dfrac{R}{2}`,
  vars: [[T`f`, 'distância focal (positiva no côncavo, negativa no convexo)', 'm'], [T`R`, 'raio de curvatura', 'm']],
  uso: T`Para obter o foco a partir do raio do espelho.`,
  val: T`Espelhos de Gauss: pequena abertura e raios próximos do eixo (paraxiais).`,
  obs: T`Côncavo (convergente): faróis, espelhos de maquiagem, telescópios. Convexo (divergente): retrovisores de moto, espelhos de garagem, dão campo visual maior.`,
  ex: [T`Um espelho côncavo tem raio de 40 cm.`, T`$f = +20\ \text{cm}$`],
  tags: 'foco raio de curvatura espelho concavo convexo' },

{ id: 'gauss', sub: 'esfericos', topico: 'Equação de Gauss', top: true,
  nome: 'Equação de Gauss (pontos conjugados)', tex: T`\dfrac{1}{f} = \dfrac{1}{p} + \dfrac{1}{p'}`,
  alt: [[T`Forma prática para isolar p'`, T`p' = \dfrac{p\,f}{p - f}`]],
  vars: [[T`f`, 'distância focal (+ côncavo, − convexo)', 'm'], [T`p`, 'distância do objeto ao espelho (+ real)', 'm'], [T`p'`, 'distância da imagem (+ real, na frente; − virtual, atrás)', 'm']],
  uso: T`Para localizar a imagem formada por espelhos esféricos (e, com a mesma forma, por lentes).`,
  val: T`Espelhos de Gauss (pequena abertura). Respeite a convenção de sinais: é a fonte de quase todos os erros.`,
  obs: T`Objeto no foco de um côncavo: imagem no infinito. Espelho convexo: imagem sempre virtual, direita e menor.`,
  ex: [T`Objeto a 30 cm de um espelho côncavo de foco 20 cm.`, T`$p' = \dfrac{30 \cdot 20}{30 - 20} = 60\ \text{cm}$: imagem real, na frente do espelho.`],
  tags: 'gauss equacao espelho esferico conjugados imagem' },

{ id: 'aumento-linear', sub: 'esfericos', topico: 'Aumento linear', top: true,
  nome: 'Aumento linear transversal', tex: T`A = \dfrac{i}{o} = -\,\dfrac{p'}{p}`,
  alt: [[T`Em função do foco`, T`A = \dfrac{f}{f - p}`]],
  vars: [[T`A`, 'aumento (A > 0: imagem direita; A < 0: invertida)', 'adimensional'], [T`i,\ o`, 'alturas da imagem e do objeto', 'm']],
  uso: T`Para o tamanho e a orientação da imagem, em espelhos e lentes.`,
  val: T`Mesma convenção de Gauss. $|A| > 1$: imagem maior; $|A| < 1$: menor.`,
  ex: [T`No exemplo anterior ($p = 30$ cm, $p' = 60$ cm), o objeto tem 2 cm.`, T`$A = -\dfrac{60}{30} = -2 \Rightarrow i = -4\ \text{cm}$: invertida e com o dobro do tamanho.`],
  tags: 'aumento linear transversal tamanho imagem invertida direita' },

/* ===================== REFRAÇÃO ===================== */
{ id: 'indice-refracao', sub: 'refracao', topico: 'Índice de refração', top: true,
  nome: 'Índice de refração absoluto', tex: T`n = \dfrac{c}{v}`,
  alt: [[T`Índice relativo entre dois meios`, T`n_{2,1} = \dfrac{n_2}{n_1} = \dfrac{v_1}{v_2} = \dfrac{\lambda_1}{\lambda_2}`]],
  vars: [[T`n`, 'índice de refração do meio (n ≥ 1)', 'adimensional'], [T`c`, 'velocidade da luz no vácuo', 'm/s'], [T`v`, 'velocidade da luz no meio', 'm/s']],
  uso: T`Para comparar meios: quanto maior $n$, mais lenta a luz e mais "refringente" o meio.`,
  val: T`Luz monocromática. $n$ varia um pouco com a cor (dispersão): no vidro, o violeta tem $n$ maior que o vermelho, daí o arco-íris do prisma.`,
  ex: [T`Na água ($n = 1{,}33$), qual a velocidade da luz?`, T`$v = \dfrac{3 \cdot 10^8}{1{,}33} \approx 2{,}26 \cdot 10^8\ \text{m/s}$`],
  tags: 'indice de refracao refringencia velocidade da luz meio dispersao' },

{ id: 'snell', sub: 'refracao', topico: 'Lei de Snell-Descartes', top: true,
  nome: 'Lei de Snell-Descartes', tex: T`n_1\sen\theta_1 = n_2\sen\theta_2`,
  vars: [[T`n_1, n_2`, 'índices de refração dos meios de incidência e de refração', 'adimensional'], [T`\theta_1, \theta_2`, 'ângulos com a normal, nos meios 1 e 2', '°']],
  uso: T`Para o desvio da luz ao mudar de meio: piscinas, lentes, fibras, prismas.`,
  val: T`Ângulos medidos com a normal. Ao passar para meio mais refringente, o raio se aproxima da normal. Incidência normal ($\theta_1 = 0$): não desvia. A frequência não muda.`,
  ex: [T`Luz passa do ar para a água ($n = 1{,}33$) com 45° de incidência.`, T`$\sen\theta_2 = \dfrac{\sen 45°}{1{,}33} \approx 0{,}53 \Rightarrow \theta_2 \approx 32°$`],
  ver: [['Refração no laboratório', 'laboratorio.html#optica']], tags: 'snell descartes refracao lei angulo normal' },

{ id: 'angulo-limite', sub: 'refracao', topico: 'Reflexão total', top: true,
  nome: 'Ângulo limite e reflexão total', tex: T`\sen L = \dfrac{n_{menor}}{n_{maior}}`,
  vars: [[T`L`, 'ângulo limite (incidência no meio mais refringente)', '°'], [T`n_{menor},\ n_{maior}`, 'índices dos dois meios', 'adimensional']],
  uso: T`Fibras ópticas, brilho do diamante, miragens, prismas de binóculos.`,
  val: T`Só ocorre com a luz indo do meio **mais** refringente para o **menos** refringente. Se a incidência for maior que $L$, toda a luz é refletida.`,
  ex: [T`Ângulo limite da água ($n = 1{,}33$) para o ar.`, T`$\sen L = \dfrac{1}{1{,}33} \approx 0{,}75 \Rightarrow L \approx 49°$`],
  tags: 'angulo limite reflexao total fibra optica miragem' },

{ id: 'dioptro-plano', sub: 'refracao', topico: 'Dioptros e lâminas',
  nome: 'Dioptro plano (profundidade aparente)', tex: T`\dfrac{p'}{p} = \dfrac{n_{obs}}{n_{obj}}`,
  vars: [[T`p'`, 'profundidade aparente (onde a imagem parece estar)', 'm'], [T`p`, 'profundidade real do objeto', 'm'], [T`n_{obs}`, 'índice do meio do observador', 'adimensional'], [T`n_{obj}`, 'índice do meio do objeto', 'adimensional']],
  uso: T`Piscinas que parecem rasas, peixes vistos de fora, lápis "quebrado" no copo.`,
  val: T`Observação quase perpendicular à superfície (raios próximos da normal).`,
  ex: [T`Uma piscina de 2 m vista de cima (água: 1,33; ar: 1).`, T`$p' = 2 \cdot \dfrac{1}{1{,}33} \approx 1{,}5\ \text{m}$: parece mais rasa.`],
  tags: 'dioptro plano profundidade aparente piscina' },

{ id: 'lamina-paralela', sub: 'refracao', topico: 'Dioptros e lâminas',
  nome: 'Lâmina de faces paralelas (desvio lateral)', tex: T`d = \dfrac{e\,\sen(i - r)}{\cos r}`,
  vars: [[T`d`, 'deslocamento lateral do raio', 'm'], [T`e`, 'espessura da lâmina', 'm'], [T`i,\ r`, 'ângulos de incidência e de refração na primeira face', '°']],
  uso: T`Vidros de janela e lâminas: o raio sai paralelo ao que entrou, mas deslocado.`,
  val: T`Lâmina com o mesmo meio dos dois lados. O raio emergente é paralelo ao incidente.`,
  ex: [T`Lâmina de 3 cm, com $i = 60°$ e $r = 30°$.`, T`$d = \dfrac{3 \cdot \sen 30°}{\cos 30°} = \dfrac{1{,}5}{0{,}87} \approx 1{,}7\ \text{cm}$`],
  tags: 'lamina faces paralelas desvio lateral' },

{ id: 'prisma', sub: 'refracao', topico: 'Prismas',
  nome: 'Prisma óptico', tex: T`A = r_1 + r_2 \qquad \delta = i_1 + i_2 - A`,
  alt: [[T`Desvio mínimo (i₁ = i₂)`, T`n = \dfrac{\sen\left(\frac{A + \delta_{mín}}{2}\right)}{\sen\left(\frac{A}{2}\right)}`]],
  vars: [[T`A`, 'ângulo de abertura (refringência) do prisma', '°'], [T`r_1, r_2`, 'ângulos de refração internos nas duas faces', '°'], [T`i_1, i_2`, 'ângulos de incidência e de emergência', '°'], [T`\delta`, 'desvio total do raio', '°']],
  uso: T`Prismas que decompõem a luz branca e prismas de reflexão total. Nível ITA/IME para o desvio mínimo.`,
  val: T`Prisma no ar, luz monocromática. O desvio mínimo ocorre quando o raio atravessa o prisma simetricamente.`,
  ex: [T`Um prisma de 60° tem desvio mínimo de 60°.`, T`$n = \dfrac{\sen 60°}{\sen 30°} = \dfrac{0{,}87}{0{,}5} \approx 1{,}73$`],
  tags: 'prisma desvio minimo dispersao abertura' },

/* ===================== LENTES ===================== */
{ id: 'equacao-lentes', sub: 'lentes', topico: 'Equação das lentes', top: true,
  nome: 'Equação de Gauss para lentes', tex: T`\dfrac{1}{f} = \dfrac{1}{p} + \dfrac{1}{p'} \qquad A = -\,\dfrac{p'}{p}`,
  vars: [[T`f`, 'distância focal (+ convergente, − divergente)', 'm'], [T`p`, 'distância do objeto à lente', 'm'], [T`p'`, 'distância da imagem (+ real, do outro lado; − virtual, do mesmo lado do objeto)', 'm']],
  uso: T`Câmeras, projetores, óculos, lupas: mesma equação e mesmo aumento dos espelhos.`,
  val: T`Lentes delgadas. Na lente, a imagem real fica do lado **oposto** ao objeto (no espelho, do mesmo lado).`,
  ex: [T`Um projetor com lente de 10 cm forma imagem nítida numa tela a 5 m. A que distância fica o slide?`, T`$\dfrac{1}{p} = \dfrac{1}{10} - \dfrac{1}{500} \Rightarrow p \approx 10{,}2\ \text{cm}$; aumento ≈ −49.`],
  ver: [['Espelhos esféricos: Gauss', '#f/gauss'], ['Lentes no laboratório', 'laboratorio.html#optica']], tags: 'lente equacao de gauss convergente divergente imagem' },

{ id: 'vergencia', sub: 'lentes', topico: 'Vergência', top: true,
  nome: 'Vergência (grau de uma lente)', tex: T`V = \dfrac{1}{f}`,
  vars: [[T`V`, 'vergência ou convergência ("grau" dos óculos)', 'di = m⁻¹'], [T`f`, '**em metros** (+ convergente, − divergente)', 'm']],
  uso: T`Receitas de óculos e lentes de contato.`,
  val: T`A distância focal precisa estar em metros para a vergência sair em dioptrias.`,
  ex: [T`Uma lente de −2 di.`, T`$f = -\dfrac{1}{2} = -0{,}5\ \text{m}$: lente divergente de 50 cm de foco.`],
  tags: 'vergencia dioptria grau oculos' },

{ id: 'fabricantes', sub: 'lentes', topico: 'Equação dos fabricantes',
  nome: 'Equação dos fabricantes de lentes (Halley)', tex: T`V = \dfrac{1}{f} = \left(\dfrac{n_{lente}}{n_{meio}} - 1\right)\left(\dfrac{1}{R_1} + \dfrac{1}{R_2}\right)`,
  vars: [[T`n_{lente},\ n_{meio}`, 'índices de refração da lente e do meio externo', 'adimensional'], [T`R_1, R_2`, 'raios das faces (+ convexa, − côncava; face plana: 1/R = 0)', 'm']],
  uso: T`Para o foco a partir do formato e do material da lente, e para entender por que uma lente muda de comportamento dentro da água.`,
  val: T`Lente delgada. Convenção: face convexa vista de fora, raio positivo. Se $n_{lente} < n_{meio}$, uma lente biconvexa passa a ser divergente.`,
  ex: [T`Lente biconvexa de vidro ($n = 1{,}5$), com raios de 20 cm, no ar.`, T`$V = 0{,}5\left(\dfrac{1}{0{,}2} + \dfrac{1}{0{,}2}\right) = 5\ \text{di} \Rightarrow f = 20\ \text{cm}$`],
  tags: 'fabricantes halley lente raio de curvatura indice' },

{ id: 'associacao-lentes', sub: 'lentes', topico: 'Associação de lentes',
  nome: 'Lentes justapostas', tex: T`V_{eq} = V_1 + V_2 \qquad \dfrac{1}{f_{eq}} = \dfrac{1}{f_1} + \dfrac{1}{f_2}`,
  vars: [[T`V_{eq}`, 'vergência da lente equivalente', 'di'], [T`V_1, V_2`, 'vergências das lentes (com sinal)', 'di']],
  uso: T`Lentes encostadas: objetivas de câmeras, correção de aberração cromática.`,
  val: T`Lentes delgadas e encostadas (distância entre elas desprezível).`,
  ex: [T`Uma lente de +5 di encostada em uma de −3 di.`, T`$V_{eq} = +2\ \text{di} \Rightarrow f = 50\ \text{cm}$ (convergente)`],
  tags: 'associacao lentes justapostas vergencia' },

/* ===================== INSTRUMENTOS ===================== */
{ id: 'lupa', sub: 'instrumentos', topico: 'Lupa',
  nome: 'Lupa (microscópio simples)', tex: T`A = \dfrac{f}{f - p} \quad (p < f)`,
  vars: [[T`A`, 'aumento linear (positivo: imagem direita e virtual)', 'adimensional'], [T`f`, 'distância focal da lente convergente', 'm'], [T`p`, 'distância do objeto à lente, menor que f', 'm']],
  uso: T`Lentes de aumento, leitura de letras pequenas.`,
  val: T`Lente convergente com o objeto entre o foco e a lente: imagem virtual, direita e maior.`,
  ex: [T`Uma lupa de foco 10 cm, com o objeto a 8 cm.`, T`$A = \dfrac{10}{10 - 8} = 5$: imagem 5 vezes maior.`],
  tags: 'lupa lente de aumento' },

{ id: 'microscopio', sub: 'instrumentos', topico: 'Microscópio',
  nome: 'Aumento do microscópio composto', tex: T`A_{total} = A_{obj} \cdot A_{oc}`,
  vars: [[T`A_{obj}`, 'aumento da objetiva (imagem real, invertida e maior)', 'adimensional'], [T`A_{oc}`, 'aumento da ocular (funciona como lupa)', 'adimensional']],
  uso: T`Microscópios ópticos de laboratório.`,
  val: T`Duas lentes convergentes: a imagem da objetiva serve de objeto para a ocular. A imagem final é invertida.`,
  ex: [T`Objetiva de 40× e ocular de 10×.`, T`$A_{total} = 400$ vezes`],
  tags: 'microscopio objetiva ocular aumento' },

{ id: 'luneta', sub: 'instrumentos', topico: 'Luneta e telescópio',
  nome: 'Aumento da luneta astronômica', tex: T`G = \dfrac{f_{obj}}{f_{oc}}`,
  alt: [[T`Comprimento do tubo (focalizada no infinito)`, T`L = f_{obj} + f_{oc}`]],
  vars: [[T`G`, 'aumento angular', 'adimensional'], [T`f_{obj}`, 'distância focal da objetiva (grande)', 'm'], [T`f_{oc}`, 'distância focal da ocular (pequena)', 'm']],
  uso: T`Lunetas e telescópios refratores para observar objetos distantes.`,
  val: T`Objeto no infinito e instrumento ajustado para vista relaxada. A imagem é invertida (o que não atrapalha na astronomia).`,
  ex: [T`Objetiva de 1 m e ocular de 2 cm.`, T`$G = \dfrac{100}{2} = 50$ vezes; tubo de 1,02 m.`],
  tags: 'luneta telescopio aumento angular' },

/* ===================== OLHO HUMANO ===================== */
{ id: 'miopia', sub: 'olho', topico: 'Miopia', top: true,
  nome: 'Correção da miopia', tex: T`f = -\,D_{PR}`,
  vars: [[T`f`, 'distância focal da lente divergente de correção', 'm'], [T`D_{PR}`, 'distância do ponto remoto do míope ao olho', 'm']],
  uso: T`Para calcular o "grau" dos óculos de um míope.`,
  val: T`Olho míope: imagem de objetos distantes se forma **antes** da retina (olho alongado ou córnea muito curva). A lente divergente leva o infinito até o ponto remoto. Lente encostada no olho.`,
  ex: [T`Um míope enxerga nítido só até 50 cm.`, T`$f = -0{,}5\ \text{m} \Rightarrow V = -2\ \text{di}$ (2 graus de miopia)`],
  tags: 'miopia olho ponto remoto lente divergente oculos' },

{ id: 'hipermetropia', sub: 'olho', topico: 'Hipermetropia e presbiopia', top: true,
  nome: 'Correção da hipermetropia e da presbiopia', tex: T`V = \dfrac{1}{0{,}25} - \dfrac{1}{D_{PP}}`,
  vars: [[T`V`, 'vergência da lente convergente de correção', 'di'], [T`0{,}25`, 'ponto próximo normal (25 cm)', 'm'], [T`D_{PP}`, 'ponto próximo da pessoa', 'm']],
  uso: T`Óculos de quem não enxerga bem de perto.`,
  val: T`Hipermetropia: imagem se forma **depois** da retina (olho curto). Presbiopia ("vista cansada"): o cristalino perde a capacidade de acomodação com a idade. As duas se corrigem com lente convergente. Astigmatismo usa lentes cilíndricas.`,
  ex: [T`Uma pessoa só lê nitidamente a partir de 1 m.`, T`$V = 4 - 1 = +3\ \text{di}$`],
  tags: 'hipermetropia presbiopia vista cansada ponto proximo lente convergente' },
];

L.forEach(f => { f.area = 'optica'; });
F.formulas.push(...L);
})();

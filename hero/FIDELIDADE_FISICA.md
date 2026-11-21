# Fidelidade física da abertura 3D

A abertura mostra quatro momentos (A Terra, B Terra e Lua, C a maçã, D a mesma lei). Este documento separa **o que é física** do que é **escolha cinematográfica**, lista os parâmetros e diz o que foi testado e o que não foi.

Arquitetura: a dinâmica vive em `hero/fisica.js` (sem DOM e sem Three.js, testada em Node). `hero/cena.js` só desenha esses estados e conduz a câmera. A câmera nunca altera a física.

## 1. Sistema de coordenadas e sentidos

Referencial destro, eclíptico.

| Elemento | Definição |
|---|---|
| `+y` | normal da eclíptica (norte eclíptico); o plano x–z é a eclíptica |
| Sol | direção fixa `(1, 0, 0,38)` normalizada, contida na eclíptica |
| Eixo da Terra | `+y` inclinado 23,44° para o lado do Sol (verão no hemisfério norte) |
| Rotação da Terra | positiva em torno do eixo = **anti-horária vista do polo norte**, isto é, de oeste para leste |
| Órbita lunar | **movimento direto**: mesmo sentido da rotação da Terra, com `L_orbital·ŷ > 0` |
| Plano orbital da Lua | eclíptica inclinada 5,145°, com a linha dos nodos ao longo de `x` |

Conferência visual: com o norte para cima, a superfície passa da esquerda para a direita diante da câmera, como na Terra real. Esse sentido sai do mapeamento de texturas do Three.js e foi conferido numericamente no teste "ponto do equador vai de +x para −z".

## 2. Leis usadas

- **Gravitação:** `F = G·m₁·m₂/r²`, com `G = 6,67430·10⁻¹¹`, `M_T = 5,9722·10²⁴ kg`, `M_L = 7,342·10²² kg`, `R_T = 6,371·10⁶ m`, `d = 3,844·10⁸ m`. Para Terra–Lua o resultado é **1,98·10²⁰ N**, e a legenda da cena D mostra esse valor calculado.
- **Queda local:** aceleração de módulo **g = 9,81 m/s²** apontando **para o centro da Terra**: `a = g·(c − p)/|c − p|`, com `c = (0, −R_T, 0)` na origem local. Integração por velocity-Verlet com passo fixo de 1 ms, independente do fps.
- **Baricentro:** Terra e Lua giram em torno do centro de massa do par. Ele fica a `d·M_L/(M_T+M_L) = 4,67·10⁶ m = 0,733 R_T` do centro da Terra, **dentro da Terra**. A Terra faz o pequeno círculo de raio `f·d` em torno desse ponto. A Terra **não** é tratada como imóvel.
- **Período orbital:** `T = 2π·√(d³/(G(M_T+M_L)))`, com a massa **total**. Resultado: 27,285 dias, contra 27,32 d do mês sideral real.
- **Rotação sincronizada da Lua:** um giro por órbita, com a face próxima sempre voltada para a Terra (textura LRO com o meridiano zero na face próxima).

## 3. Escalas didáticas (declaradas na interface)

| O que é didático | Real | Na cena | Como é avisado |
|---|---|---|---|
| Distância Terra–Lua | 60,34 R_T | 16 R_T (compressão 3,77×) | legenda da cena B ("comprimida 3,8×") |
| Raios de Terra e Lua | R_L/R_T = 0,2727 | **mantidos em escala** | legenda |
| Baricentro | 1,2% da separação | **mesma fração** da separação visual (0,19 R_T) | proporção preservada por teste |
| Tempo | rotação 23 h 56 min; órbita 27,3 d | rotação em 100 s; órbita em 140 s | legenda da cena A ("tempo acelerado") |
| Razão rotação/órbita | 27,3 giros por órbita | 1,4 giro por órbita | **não preservada**; só vale o sentido |
| Queda da maçã | 0,45 s | câmera lenta 0,25× | legenda da cena C |
| Setas de força (cena D) | 1,98·10²⁰ N | comprimento fixo | legenda ("fora de escala"); as duas são iguais por Newton III |
| Seta de g (cena C) | 9,81 m/s² | comprimento fixo; direção e sentido reais | indicada como `a = 9,81 m/s²` |

A leitura numérica na cena C (`t`, `v`, `altura`) mostra o **tempo físico** da simulação, não o de relógio.

## 4. Simplificações assumidas

1. **Órbita circular** em torno do baricentro. A real tem e ≈ 0,055; a distância varia entre 356 000 e 407 000 km. A cena D mostra o valor médio.
2. **Sol fixo.** Ele se desloca cerca de 1° por dia, o que é desprezível numa visita à página. Por isso as fases da Lua não evoluem com o calendário.
3. **Sem precessão, nutação e libração.** Eixo e orientação da Lua são fixos. A inclinação axial da Lua (≈ 1,5°) é ignorada.
4. **g constante** na queda, e chão como plano tangente: em 3 m o desvio de curvatura é `3²/(2R_T) ≈ 0,7 µm`. A **direção** de g continua radial (o teste de convergência horizontal confirma o sentido).
5. **Sem resistência do ar** e sem rotação da maçã (cai do repouso, sem torque). A maçã para ao tocar o solo, sem quique.
6. **Altura de queda de 1,0 m** (macieira jovem), escolhida para que a queda caiba no quadro. A maçã real de Newton não é o ponto aqui.
7. **Nuvens** giram 4% mais rápido que a superfície: recurso visual, **sem significado físico**.
8. **Cena C é estilizada:** luz de pôr do sol e relva instanciada são cenografia. O céu é gradiente com estrelas sorteadas (não é o céu real).
9. **Cena A omite a Lua** (ela entra por fade a partir de p = 0,24). A Lua real estaria lá, só fora do enquadramento; a omissão é de composição.
10. **Texturas:** a Terra usa mapas derivados de dados da NASA (Blue Marble, luzes noturnas, máscara de oceanos) distribuídos nos exemplos do three.js (licença MIT). A Lua usa o mapa de cor e a elevação do LRO/NASA (domínio público). Os arquivos estão em `hero/tex/`. O relevo da Lua é um *bump map* (efeito de iluminação), não geometria deslocada.

## 5. Vetores e trajetórias exibidos

Só aparece o que tem significado físico:

- Cena B e D: círculo da órbita lunar (calculado por `estadoTerraLua`), círculo do movimento da Terra em torno do baricentro e um ponto no baricentro.
- Cena C: vetor `g` apenas durante a queda.
- Cena D: duas forças de atração, iguais em módulo e opostas.

Nenhuma seta, linha ou trajetória foi acrescentada só por estética.

## 6. Separação entre física e câmera

- `fisica.js`: posições, rotações, queda, constantes. Nenhuma referência a câmera, rolagem ou DOM.
- `cena.js`: `KF` (keyframes), `cameraEspacial`, `enquadramento` e `aplicaPerspectiva` só movem a câmera. A rolagem `p ∈ [0, 1]` escolhe a tomada e liga o véu, sem alterar a dinâmica. O único acoplamento é o gatilho de soltar a maçã (`p` local > 0,16), que **começa** a queda; depois a integração é por tempo.

## 7. Testes executados

`node hero/fisica.test.mjs` → **20 verificações, todas aprovadas** na última execução:

| Verificação | Resultado |
|---|---|
| `G·M/R²` vs 9,81 m/s² | 9,820 (dentro de ±0,05) |
| `F` Terra–Lua | 1,981·10²⁰ N |
| Baricentro | 4,668·10⁶ m = 0,733 R_T, dentro da Terra |
| Período orbital | 27,285 d (±0,3 d de 27,32) |
| Centro de massa do par fixo na origem | 1·10⁻¹⁷ |
| Separação em escala real e em escala didática | exata; fração do baricentro preservada |
| Lua em movimento direto (`L_y > 0`) | aprovado |
| Equador gira de +x para −z (leste) | aprovado |
| Inclinação orbital máxima | 5,145° |
| Tempo de queda de 0,5, 2,2 e 10 m vs `√(2h/g)` | erro ≤ 1 ms |
| Velocidade antes do solo vs `√(2gh)` | 6,568 vs 6,570 m/s |
| Aceleração radial (x diminui ao cair deslocado) | aprovado |
| Energia mecânica conservada | desvio 7·10⁻¹² % |
| Rotação de 2π em um dia sideral | aprovado |
| Sol unitário e na eclíptica; eixo a 23,44°; polo norte voltado ao Sol | aprovado |

No navegador, a cena C usou a mesma `fisica.js`: a maçã caiu 1,0 m em **0,4521 s**, contra 0,4515 s analíticos, e a leitura em `t = 0,34 s` deu `v = 3,3 m/s`, coerente com `g·t`.

**Não testado:** comparação com efemérides reais (JPL Horizons); a escala dos raios foi conferida só pelos números das constantes, não por medição na imagem.

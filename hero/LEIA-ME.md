# Abertura cinematográfica 3D · guia de revisão

Substitui **somente** a seção de abertura (`<section id="abertura">`) da página inicial. Cabeçalho, logomarca, menu, `estilo.css`, `site.js`, `inicio.js` e as demais seções não foram alterados. Nada foi publicado.

Branch: `redesign/hero-3d-cinematografico` (criada a partir de `main`, que ficou intacta).

## Como executar e revisar localmente

O site é estático, mas os módulos ES exigem HTTP (não funciona abrindo o arquivo com `file://`).

```bash
cd /Users/marcelo/Documents/site
python3 -m http.server 8765
```

Abra `http://localhost:8765/index.html`. Parâmetros de teste:

| URL | Efeito |
|---|---|
| `index.html` | experiência completa |
| `index.html?3d=off` | força o fallback estático (nenhum recurso 3D é baixado) |
| `index.html?movimento=reduzido` | força o modo de movimento reduzido (um quadro estático, sem animação nem rolagem cinematográfica) |

No console: `__abertura3d.diagnostico()` mostra o estado físico, o pixel ratio e a memória da GPU.

Testes numéricos da física: `node hero/fisica.test.mjs` (não precisa de navegador).

## Como a rolagem funciona

A seção tem uma pista alta (`430svh`) com um palco `sticky`. A rolagem normal da página avança a sequência A→D; nada captura a roda do mouse nem o toque. O texto (HTML real) desaparece depois de uns 15% da pista, e a legenda científica assume. Se o 3D não estiver pronto, a pista não é alongada.

## Comparação visual antes e depois

Capturas em `hero/comparacao/`: `antes-800x600.jpg` (versão antiga com órbitas em SVG), `depois-desktop-1440x900.jpg`, `depois-celular-375x812.jpg`.

| Antes | Depois |
|---|---|
| SVG 2D: logo ao centro de cinco órbitas com ícones | Terra 3D com terminador, atmosfera e luzes noturnas; Lua com relevo; maçã com física; rolagem em quatro cenas |
| Fundo `#07050c`, laranja `#f99f29` no título e no botão | Fundo `#0A0B11`, título em cor única, apoio `#D18A32` só no botão e na legenda |
| Título "Da maçã à Lua…" com uma palavra colorida | "A mesma Física que move os planetas move você." em cor única |
| Link "Experimentar as simulações →" | "Explorar simulações" (mesmo destino, `laboratorio.html`) |

A logomarca original permanece no cabeçalho com suas cores. Ela **deixou de aparecer no centro do hero** (era o planeta do SVG antigo); isso é consequência da troca por uma Terra 3D. Se quiser a logo também na abertura, é decisão de design a combinar.

## Desempenho e limitações (o que foi e o que não foi medido)

**Peso transferido (compactado quando textual):**

| Perfil | JS | Texturas | Total aproximado |
|---|---|---|---|
| Desktop (≥ 1100 px) | Three.js 171 KB + cena 10 KB + física 3 KB + hero 2 KB | 1,8 MB (mapas 2k) | ~2,0 MB |
| Tablet e celular | idem | 0,67 MB (mapas 1k, nuvens 512) | ~0,85 MB |

Nada disso bloqueia a primeira pintura: o HTML e o CSS renderizam o texto de imediato, e o 3D só começa depois do evento `load`, em tempo ocioso (`requestIdleCallback`).

**Medidas de custo da cena (no painel de teste, GPU Apple M5 Pro):** no perfil tablet, a abertura (Terra) usou 4 chamadas de desenho e ~20 mil triângulos; os perfis desktop e celular não tiveram essa contagem registrada. Geometrias e texturas liberadas ao destruir: 4 → 0.

**NÃO medido, e preciso dizer isso com clareza:**

- **fps real.** O painel de teste limita o `requestAnimationFrame` a ~10 quadros/s mesmo para um laço vazio, então qualquer número de fps daqui seria falso. Não fiz medição de fps em dispositivo real.
- **iPhone e Safari.** Não testei em Safari nem em iPhone. O código usa `importmap` (Safari 16.4 ou mais novo) e WebGL 2. Em navegador sem suporte, o `import()` falha e o fallback estático aparece, mas esse caminho de falha **por importmap** não foi exercitado, apenas o forçado por `?3d=off` e pela ausência de WebGL simulada.
- **Aquecimento e bateria** em uso prolongado.
- **Lighthouse / Core Web Vitals.**

**Mecanismos de proteção implementados e como cada um foi verificado:**

| Mecanismo | Verificação |
|---|---|
| Lazy loading do 3D após `load` + ocioso | Com `?3d=off`, nenhum arquivo de Three.js, cena ou textura foi requisitado |
| Fallback estático | Executado com `?3d=off`: texto, botões e planeta CSS corretos, sem pista alta |
| Pixel ratio limitado por perfil (2 / 1,5 / 1,25) | Observados 1,5 no tablet e 1,25 no celular; no desktop só o vi já reduzido (1,6) pelo mecanismo adaptativo, não o teto de 2 |
| Pixel ratio adaptativo (reduz se o quadro médio passa de 26 ms) | **Encontrei e corrigi um defeito**: ele tratava a limitação de rAF do painel como lentidão. Agora ignora intervalos > 250 ms. A correção foi feita **depois** do último teste de carga e não foi reexecutada sob carga real |
| Pausa fora da tela ou com a aba oculta | Medido: 0 quadros e relógio da cena parado durante a pausa |
| Perda e restauração de contexto WebGL | Provocadas via `WEBGL_lose_context`: `estatico` e depois `pronto` |
| Liberação de recursos (`destruir`) | Memória da GPU de 4 geometrias e 4 texturas para 0 |
| `prefers-reduced-motion` | Testado pelo parâmetro `?movimento=reduzido` (um quadro estático); **não** testado com a configuração real do sistema |
| Sem áudio | Não há nenhuma chamada de áudio |

**Limitações conhecidas:**

- O fallback é um globo em CSS (gradiente), bem menos rico que o 3D. Um pôster renderizado da própria cena seria melhor e não foi gerado.
- Em celulares o texto é `visibility: hidden` depois de rolar além de ~15% (para sair da ordem de foco). Leitores de tela recebem o texto normalmente no carregamento, mas, depois de rolar, ele deixa de ser lido até voltar ao topo.
- A perspectiva por mouse/dedo usa `pointermove` no palco; o arrasto vertical continua rolando a página (`touch-action: pan-y`).
- Em telas muito baixas (< 540 px de altura útil) o `min-height` do palco pode gerar rolagem interna do hero.
- O estilo antigo `.ab*` e `.sistema` continua dentro do `<style>` do `index.html` como código morto (não removido para manter o diff pequeno), e `inicio.js` não faz nada sem o SVG.
- O cabeçalho em 1440 px quebra o menu em duas linhas. Esse comportamento é anterior ao redesign e não foi tocado.

## Arquivos

**Modificado:** `index.html` (troca do bloco da abertura, `<link>` para `hero/hero.css`, `importmap` e `<script type="module" src="hero/hero.js">`).

**Novos:**

- `hero/cena.js`, `hero/fisica.js`, `hero/hero.js`, `hero/hero.css`
- `hero/fisica.test.mjs`
- `hero/FIDELIDADE_FISICA.md`, `hero/LEIA-ME.md`
- `hero/tex/*` (12 texturas em dois tamanhos)
- `hero/comparacao/*` (3 capturas)
- `vendor/three/three.module.min.js` (Three.js r170, MIT) e `vendor/three/LICENSE`
- `.claude/launch.json` (só para o preview local do app; pode ser descartado)

**Lixo local não relacionado:** `.DS_Store` aparece sem rastreio (já existia).

## Publicação no Cloudflare Pages (quando você decidir)

Nada aqui altera domínio, DNS ou configuração do Cloudflare.

1. Revise localmente e faça o commit na branch `redesign/hero-3d-cinematografico` (inclua `hero/`, `vendor/` e `index.html`; deixe `.DS_Store` e `.claude/` de fora).
2. Abra um Pull Request para `main`. O Cloudflare Pages costuma gerar uma **URL de pré-visualização** para o PR: teste ali no iPhone e no Safari antes de mesclar.
3. Se o Pages estiver sem etapa de build (site estático puro), nenhuma configuração muda.
4. Opcional, para cache longo dos arquivos pesados, um arquivo `_headers` na raiz:

```
/hero/tex/*
  Cache-Control: public, max-age=31536000, immutable
/vendor/three/*
  Cache-Control: public, max-age=31536000, immutable
```

   Só use `immutable` se os nomes mudarem a cada troca de conteúdo (se você substituir uma textura mantendo o nome, o cache antigo continuará valendo).
5. Depois de mesclar, confira no navegador que `hero/hero.js` e `vendor/three/three.module.min.js` retornam `200` com `Content-Type` de JavaScript.
6. Para reverter: `git revert` do commit de merge. O restante do site não depende destes arquivos.

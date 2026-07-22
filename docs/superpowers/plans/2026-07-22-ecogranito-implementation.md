# Ecogranito Vertical Chão Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir, testar e publicar uma landing page estática de aplicação de Ecogranito com o design institucional aprovado, os contatos comerciais atuais e os IDs de tracking da página original.

**Architecture:** HTML, CSS e JavaScript sem framework, com ativos locais e build determinístico para `dist/`. Contratos Node verificam conteúdo, telefones, tracking, links e artefato publicável; Playwright valida responsividade, acessibilidade, consentimento e o formulário. A copy é fechada e auditada antes de entrar no HTML.

**Tech Stack:** HTML5, CSS3, JavaScript ES2022, Node.js 20+, `node:test`, Playwright, GitHub CLI e Wrangler 4.

---

## Estrutura de arquivos

```text
outputs/ecogranito-verticalchao/
  research/
    source-contract.json
    source-copy.txt
    source-desktop.png
    source-mobile.png
  analysis/
    copy-original.md
    copy-humanizada.md
    anti-ai-report.md
    text-editor-analysis.json
    text-editor-report.html
    copy-final.md
  lp/
    prompt_ecogranito-verticalchao.md
    build/
    qa/
      desktop.png
      mobile.png
      qa-summary.json
    deploy/github-cloudflare/
      assets/
      docs/superpowers/
      scripts/
      index.html
      styles.css
      script.js
      package.json
      build.json
      robots.txt
      _headers
      README.md
```

`index.html` cuida da semântica e do conteúdo; `styles.css`, do sistema visual e dos breakpoints; `script.js`, do formulário, consentimento e eventos. Os scripts em `scripts/` têm uma responsabilidade cada: build, validação estrutural, links e contratos.

---

### Task 1: Congelar a fonte, os IDs e o reference contract

**Files:**
- Create: `D:/OpenAI-Codex/PageMind Skills/outputs/ecogranito-verticalchao/research/source-contract.json`
- Create: `D:/OpenAI-Codex/PageMind Skills/outputs/ecogranito-verticalchao/research/source-copy.txt`
- Create: `D:/OpenAI-Codex/PageMind Skills/outputs/ecogranito-verticalchao/lp/prompt_ecogranito-verticalchao.md`
- Create: `D:/OpenAI-Codex/PageMind Skills/outputs/ecogranito-verticalchao/analysis/copy-original.md`

- [ ] **Step 1: Reextrair os dados da página original**

Executar uma leitura fresca de `https://ecogranito.verticalchao.com.br/` e registrar em `source-contract.json`:

```json
{
  "source_url": "https://ecogranito.verticalchao.com.br/",
  "tracking": {
    "gtm": "GTM-M7GS29F",
    "ga4": "G-L2NNH9T18X",
    "google_ads": "AW-956995439"
  },
  "source_assets": [
    "https://ecogranito.verticalchao.com.br/wp-content/uploads/2023/02/e12-1-577x1024.jpg",
    "https://ecogranito.verticalchao.com.br/wp-content/uploads/2023/02/e9-1-577x1024.jpg",
    "https://ecogranito.verticalchao.com.br/wp-content/uploads/2023/02/e3-1-577x1024.jpg"
  ],
  "reference_contract": {
    "status": "valid",
    "references": [
      "https://ecogranito.verticalchao.com.br/",
      "https://verticalchao-institucional.pages.dev/",
      "https://pinturadefachadas-verticalchao.pages.dev/"
    ]
  }
}
```

- [ ] **Step 2: Extrair a copy visível sem scripts, navegação e estilos**

Salvar o texto bruto em `source-copy.txt` e uma versão estruturada em `copy-original.md`. Preservar nomes e cargos dos três depoimentos; marcar que os relatos se referem à empresa, não necessariamente ao Ecogranito.

- [ ] **Step 3: Criar o prompt PageMind com reference contract**

O arquivo `lp/prompt_ecogranito-verticalchao.md` deve declarar:

```markdown
PAGEMIND-PARADIGMA: mainstream

## REFERENCE CONTRACT
status: valid
- source/content/tracking IDs: https://ecogranito.verticalchao.com.br/
- visual system: https://verticalchao-institucional.pages.dev/
- responsive/form pattern: https://pinturadefachadas-verticalchao.pages.dev/

## REQUIRED CONTACTS
- commercial: (31) 99684-8477 / +5531996848477
- footer secondary: (31) 98712-2106 / +5531987122106
- forbidden: (31) 99471-1393 / 5531994711393 / Edvaldo

## REQUIRED TRACKING IDS
- GTM-M7GS29F
- G-L2NNH9T18X
- AW-956995439
```

- [ ] **Step 4: Confirmar o contrato**

Run:

```powershell
$contract = Get-Content -Raw 'D:\OpenAI-Codex\PageMind Skills\outputs\ecogranito-verticalchao\research\source-contract.json' | ConvertFrom-Json
if ($contract.tracking.gtm -ne 'GTM-M7GS29F') { throw 'GTM divergente' }
if ($contract.tracking.ga4 -ne 'G-L2NNH9T18X') { throw 'GA4 divergente' }
if ($contract.tracking.google_ads -ne 'AW-956995439') { throw 'Ads divergente' }
if ($contract.reference_contract.references.Count -lt 3) { throw 'Reference contract incompleto' }
```

Expected: exit 0.

- [ ] **Step 5: Commit**

Somente o prompt fica dentro do escopo de entrega PageMind fora do repositório; o snapshot de pesquisa e a análise permanecem no projeto local. Não incluir arquivos externos ao repositório no commit.

---

### Task 2: Fechar a copy antes da build

**Files:**
- Create: `D:/OpenAI-Codex/PageMind Skills/outputs/ecogranito-verticalchao/analysis/copy-humanizada.md`
- Create: `D:/OpenAI-Codex/PageMind Skills/outputs/ecogranito-verticalchao/analysis/anti-ai-report.md`
- Create: `D:/OpenAI-Codex/PageMind Skills/outputs/ecogranito-verticalchao/analysis/text-editor-analysis.json`
- Create: `D:/OpenAI-Codex/PageMind Skills/outputs/ecogranito-verticalchao/analysis/text-editor-report.html`
- Create: `D:/OpenAI-Codex/PageMind Skills/outputs/ecogranito-verticalchao/analysis/copy-final.md`

- [ ] **Step 1: Ler o lexicon completo do anti-ai-writing**

Run:

```powershell
Get-Content -Raw 'C:\Users\Marcilio\.codex\skills\anti-ai-writing\references\lexicon.md'
```

Expected: leitura até o fim antes da reescrita.

- [ ] **Step 2: Produzir a copy humanizada**

Aplicar `anti-ai-writing` sobre `copy-original.md`. Manter o fluxo AIDA, fatos da origem e depoimentos; remover contadores quebrados, garantias sem base, paralelismo negativo, listas simétricas e linguagem de IA. Salvar texto completo em `copy-humanizada.md` e o relatório exigido pela skill em `anti-ai-report.md`.

- [ ] **Step 3: Rodar o text-editor-br em modo LP**

Run:

```powershell
python 'C:\Users\Marcilio\.codex\skills\text-editor-br\scripts\analyze.py' --input 'D:\OpenAI-Codex\PageMind Skills\outputs\ecogranito-verticalchao\analysis\copy-humanizada.md' --content-type lp --output 'D:\OpenAI-Codex\PageMind Skills\outputs\ecogranito-verticalchao\analysis\text-editor-analysis.json'
python 'C:\Users\Marcilio\.codex\skills\text-editor-br\scripts\report.py' --json 'D:\OpenAI-Codex\PageMind Skills\outputs\ecogranito-verticalchao\analysis\text-editor-analysis.json' --output 'D:\OpenAI-Codex\PageMind Skills\outputs\ecogranito-verticalchao\analysis\text-editor-report.html'
```

Expected: JSON e HTML gerados; nenhum erro de execução.

- [ ] **Step 4: Corrigir a legibilidade e fazer o segundo scan anti-AI**

Resolver frases muito difíceis, gerundismo, nominalização, parágrafos longos, ecos e inícios repetidos. Fazer novo scan pelas 12 categorias do `anti-ai-writing`, inclusive tells de segunda ordem. Salvar somente a versão aprovada em `copy-final.md`.

- [ ] **Step 5: Verificar os gates de copy**

Run:

```powershell
$copy = Get-Content -Raw 'D:\OpenAI-Codex\PageMind Skills\outputs\ecogranito-verticalchao\analysis\copy-final.md'
if ($copy -match 'Não é .+\. É ') { throw 'Paralelismo negativo encontrado' }
if ($copy -match '\b(crucial|robusto|jornada|mergulhar|alavancar)\b') { throw 'Vocabulário artificial encontrado' }
if ($copy -match '0\s*%|0\s*\+') { throw 'Contador quebrado encontrado' }
if ($copy -match 'garantia de 7 anos|dura por 7 anos') { throw 'Promessa sem comprovação' }
```

Expected: exit 0.

---

### Task 3: Criar o contrato automatizado e o build seguro

**Files:**
- Create: `package.json`
- Create: `scripts/build.mjs`
- Create: `scripts/check-links.mjs`
- Create: `scripts/validate-site.mjs`
- Create: `scripts/contracts.test.mjs`
- Modify: `.gitignore`

- [ ] **Step 1: Escrever testes que falham para a página ainda inexistente**

Os testes em `scripts/contracts.test.mjs` devem usar `node:test` e verificar:

```js
const required = ['GTM-M7GS29F', 'G-L2NNH9T18X', 'AW-956995439', '5531996848477', '5531987122106'];
const forbidden = ['5531994711393', '99471-1393', 'Edvaldo', 'menu-toggle', 'data-menu-toggle'];
```

Também exigir um `h1`, canonical `https://ecogranito-verticalchao.pages.dev/`, exatamente 3 IDs configurados, seis ou menos figuras, controle `data-consent-manage` e eventos sem chaves `nome`, `telefone`, `email` ou `mensagem`.

- [ ] **Step 2: Rodar o teste para confirmar RED**

Run: `npm test`

Expected: FAIL porque `index.html`, `script.js` e `build.json` ainda não existem.

- [ ] **Step 3: Implementar build com staging e rollback**

`scripts/build.mjs` deve copiar apenas o manifesto publicável (`index.html`, `styles.css`, `script.js`, `_headers`, `robots.txt`, `build.json`, `assets/**`) para um diretório temporário, validar a presença de cada arquivo e substituir `dist/` somente depois do preflight.

- [ ] **Step 4: Implementar validação e links**

`validate-site.mjs` verifica o contrato de conteúdo e tracking. `check-links.mjs` rejeita traversal, caminhos Windows, barras duplas e referências fora do manifesto.

- [ ] **Step 5: Configurar comandos**

```json
{
  "private": true,
  "scripts": {
    "test": "node --test scripts/contracts.test.mjs",
    "build": "node scripts/build.mjs",
    "validate": "node scripts/validate-site.mjs && node scripts/check-links.mjs",
    "check": "npm test && npm run build && npm run validate"
  }
}
```

- [ ] **Step 6: Confirmar que o harness ainda falha apenas pela página ausente**

Run: `npm test`

Expected: FAIL em contratos do site, sem erro de sintaxe do harness.

- [ ] **Step 7: Commit**

```powershell
git add package.json scripts .gitignore
git commit -m "test: define ecogranito landing page contract"
```

---

### Task 4: Baixar e normalizar os ativos oficiais

**Files:**
- Create: `assets/img/webp/logo.webp`
- Create: `assets/img/webp/ecogranito-obra-1.webp`
- Create: `assets/img/webp/ecogranito-obra-2.webp`
- Create: `assets/img/webp/ecogranito-obra-3.webp`
- Create: `assets/favicon-32.png`
- Create: `assets/apple-touch-icon.png`
- Create: `assets/fonts/outfit-700.woff2`
- Create: `assets/fonts/poppins-400.woff2`
- Create: `assets/fonts/poppins-600.woff2`

- [ ] **Step 1: Baixar somente ativos oficiais**

Usar as URLs registradas em `source-contract.json`; obter logo e favicon da página original. Não usar imagens geradas por IA ou bancos de imagens.

- [ ] **Step 2: Converter as três fotos para WebP**

Preservar proporção, orientação e qualidade visual. Lado maior máximo de 1600 px; qualidade WebP entre 80 e 86.

- [ ] **Step 3: Verificar dimensões e decodificação**

Run:

```powershell
Get-ChildItem assets\img\webp\*.webp | ForEach-Object { if ($_.Length -eq 0) { throw "Ativo vazio: $($_.Name)" } }
```

Expected: todos os arquivos com tamanho maior que zero.

- [ ] **Step 4: Commit**

```powershell
git add assets
git commit -m "assets: add official ecogranito media"
```

---

### Task 5: Implementar HTML, SEO e tracking base

**Files:**
- Create: `index.html`
- Create: `robots.txt`
- Create: `build.json`

- [ ] **Step 1: Escrever o HTML sem CSS/JS funcional**

Usar a copy final, a estrutura aprovada e os seguintes hooks:

```html
<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
<header class="site-header" data-site-header>...</header>
<main id="conteudo" tabindex="-1">...</main>
<form data-whatsapp-form novalidate>...</form>
<aside data-consent-banner aria-labelledby="consent-title">...</aside>
<button type="button" data-consent-manage>Alterar preferências de cookies</button>
```

Incluir exatamente três figuras da origem. Não criar menu móvel, lightbox, carrossel ou contadores.

- [ ] **Step 2: Inserir SEO e dados estruturados**

Canonical e `og:url`: `https://ecogranito-verticalchao.pages.dev/`. JSON-LD: `HomeAndConstructionBusiness`, com os contatos aprovados e sem avaliação agregada inventada.

- [ ] **Step 3: Implementar tracking com IDs preservados**

Antes dos loaders, definir Consent Mode `denied` para `analytics_storage`, `ad_storage`, `ad_user_data` e `ad_personalization`. Carregar o GTM `GTM-M7GS29F` e configurar `G-L2NNH9T18X` e `AW-956995439` uma vez cada. Não inserir um segundo loader para o mesmo mecanismo.

- [ ] **Step 4: Criar o build.json**

Registrar reference contract, IDs, contatos, `mobile_menu: false`, origem dos ativos e `copy_gates` com os caminhos dos relatórios.

- [ ] **Step 5: Rodar contratos**

Run: `npm test`

Expected: contratos de HTML/SEO/tracking passam; contratos dependentes de CSS/JS podem continuar falhando de forma específica.

- [ ] **Step 6: Commit**

```powershell
git add index.html robots.txt build.json
git commit -m "feat: add ecogranito page content and tracking"
```

---

### Task 6: Aplicar o sistema visual responsivo

**Files:**
- Create: `styles.css`

- [ ] **Step 1: Implementar tokens, fontes e layout editorial**

Definir graphite, vermelho institucional, papel quente, escalas de espaçamento e tipografia local. Manter corpo com pelo menos 16 px no mobile e medida entre 45 e 75 caracteres.

- [ ] **Step 2: Implementar header e hero**

Header transparente no topo e `.is-scrolled` sobre fundo sólido. No breakpoint móvel, ocultar `.main-nav` e `.header-actions`, sem mostrar substituto.

- [ ] **Step 3: Implementar seções, cards e galeria**

Desktop pode usar grade editorial assimétrica. Em até 680 px:

```css
.gallery figure {
  min-height: 0;
  aspect-ratio: 4 / 3;
}
```

- [ ] **Step 4: Implementar estados e acessibilidade**

Alvos com pelo menos 24 px, `:focus-visible` de alto contraste, erros de formulário redundantes e `@media (prefers-reduced-motion: reduce)` removendo movimento não essencial. Nunca usar `transition: all`.

- [ ] **Step 5: Rodar contratos e inspeção estática**

Run:

```powershell
npm test
if (Select-String -Path styles.css -Pattern 'transition\s*:\s*all') { throw 'transition: all encontrado' }
```

Expected: testes de estrutura passam e nenhuma transição genérica é encontrada.

- [ ] **Step 6: Commit**

```powershell
git add styles.css
git commit -m "feat: apply institutional ecogranito visual system"
```

---

### Task 7: Implementar formulário, eventos e consentimento

**Files:**
- Create: `script.js`
- Modify: `scripts/contracts.test.mjs`

- [ ] **Step 1: Escrever o teste de consentimento revisável**

Exigir os hooks `data-consent-accept`, `data-consent-reject` e `data-consent-manage`, além das quatro chaves de Consent Mode e do armazenamento defensivo.

- [ ] **Step 2: Confirmar RED**

Run: `npm test`

Expected: FAIL porque `script.js` ainda não implementa os fluxos.

- [ ] **Step 3: Implementar header e eventos**

O header alterna apenas `.is-scrolled`. `cta_clicked` envia `cta_text`, `cta_location` e `contact_method`. `form_submitted` envia `form_name: "ecogranito_orcamento"` e `contact_method: "whatsapp"`.

- [ ] **Step 4: Implementar validação e WhatsApp**

Nome, telefone com pelo menos 10 dígitos, assunto e mensagem são obrigatórios; e-mail é opcional e validado quando preenchido. Em sucesso, montar mensagem com `encodeURIComponent` e abrir `https://api.whatsapp.com/send?phone=5531996848477&text=...` usando `_blank,noopener`. Dados do formulário nunca entram no `dataLayer`.

- [ ] **Step 5: Implementar consentimento e foco**

Persistir `granted` ou `denied` sob `verticalchao_consent`. Aceitar/recusar atualiza os quatro sinais. O controle do rodapé reabre o banner sem mudar a decisão; foco vai para Aceitar e retorna ao controle de origem após a nova escolha.

- [ ] **Step 6: Confirmar GREEN**

Run: `npm run check`

Expected: todos os contratos, build, validação e links passam.

- [ ] **Step 7: Commit**

```powershell
git add script.js scripts\contracts.test.mjs
git commit -m "feat: add ecogranito form consent and conversion events"
```

---

### Task 8: Documentar, auditar e validar visualmente

**Files:**
- Create: `README.md`
- Create: `_headers`
- Modify: `build.json`
- Create: `D:/OpenAI-Codex/PageMind Skills/outputs/ecogranito-verticalchao/lp/qa/mobile.png`
- Create: `D:/OpenAI-Codex/PageMind Skills/outputs/ecogranito-verticalchao/lp/qa/desktop.png`
- Create: `D:/OpenAI-Codex/PageMind Skills/outputs/ecogranito-verticalchao/lp/qa/qa-summary.json`

- [ ] **Step 1: Documentar build e publicação**

README: `npm run check`, `dist/`, repositório/projeto `ecogranito-verticalchao`, URL Pages, telefones e troca de canonical após o domínio personalizado.

- [ ] **Step 2: Adicionar headers**

Configurar CSP compatível com GTM/GA4/Ads, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` e cache imutável para `/assets/*`.

- [ ] **Step 3: Rodar verificação completa fresca**

Run: `npm run check && git diff --check`

Expected: exit 0, sem warnings de whitespace.

- [ ] **Step 4: Auditar 390×844 e 1280×900 com Playwright**

Coletar:

```js
({
  hamburgerCount: document.querySelectorAll('[data-menu-toggle], .menu-toggle').length,
  bodyWidth: document.body.scrollWidth,
  viewportWidth: innerWidth,
  galleryHeights: [...document.querySelectorAll('.gallery figure')].map((el) => Math.round(el.getBoundingClientRect().height)),
});
```

Expected mobile: `hamburgerCount: 0`, `bodyWidth === viewportWidth`, três alturas entre 240 e 290 px.

- [ ] **Step 5: Testar interações e tracking**

Testar skip link, primeiro erro, envio válido, consentimento aceitar → reabrir → recusar → reload. Confirmar WhatsApp `5531996848477`, eventos esperados, nenhum campo pessoal e nenhuma configuração duplicada.

- [ ] **Step 6: Atualizar evidências e copiar dist para lp/build**

`qa-summary.json` e `build.json` devem registrar métricas reais. Copiar o conteúdo de `dist/` para `D:/OpenAI-Codex/PageMind Skills/outputs/ecogranito-verticalchao/lp/build/` e confirmar `index.html` e `build.json` nesse destino.

- [ ] **Step 7: Commit**

```powershell
git add README.md _headers build.json
git commit -m "docs: complete ecogranito deployment handoff"
```

---

### Task 9: Integrar, criar GitHub e publicar no Cloudflare Pages

**Files:**
- Merge: `feature/ecogranito-build` into `main`

- [ ] **Step 1: Revisão final independente**

Solicitar revisão global do diff contra `main`, corrigir todos os achados Critical/Important e repetir `npm run check`.

- [ ] **Step 2: Integrar por fast-forward**

```powershell
git switch main
git merge --ff-only feature/ecogranito-build
npm run check
```

Expected: merge e testes com exit 0.

- [ ] **Step 3: Criar e enviar o repositório**

```powershell
gh repo create trafegocomprado/ecogranito-verticalchao --public --source . --remote origin --push
```

Expected: `main` publicado no novo repositório.

- [ ] **Step 4: Criar o projeto Pages e publicar**

```powershell
npx wrangler pages project create ecogranito-verticalchao --production-branch main
$deployCommit = git rev-parse HEAD
npx wrangler pages deploy dist --project-name ecogranito-verticalchao --branch main --commit-hash $deployCommit --commit-dirty=false
```

Expected: deployment de produção em `https://ecogranito-verticalchao.pages.dev/` associado ao commit final.

- [ ] **Step 5: Verificar produção**

Confirmar HTTP 200, IDs preservados, telefones, ausência do número antigo/Edvaldo/menu móvel, galeria compacta, consentimento revisável e formulário em produção.

- [ ] **Step 6: Limpar worktree**

Depois do push e da verificação de produção, remover o worktree isolado e a branch já integrada conforme `superpowers:finishing-a-development-branch`.

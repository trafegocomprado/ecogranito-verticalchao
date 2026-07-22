# Ecogranito Vertical Chão — especificação de design

## Objetivo

Reconstruir a landing page de aplicação de Ecogranito da Vertical Chão como um site estático, leve e publicável no Cloudflare Pages. A nova versão deve manter as informações legítimas da página original, adotar o sistema visual institucional já aprovado e corrigir problemas de copy, hierarquia, acessibilidade e responsividade.

## Reference contract

Status: `valid`

| Responsabilidade | URL | Uso autorizado |
| --- | --- | --- |
| Conteúdo, imagens, depoimentos, funcionalidades e tracking | https://ecogranito.verticalchao.com.br/ | Fonte primária e única do tracking; fonte de verdade do serviço |
| Sistema visual institucional | https://verticalchao-institucional.pages.dev/ | Paleta, tipografia, ritmo editorial, cabeçalho e acabamento |
| Padrão técnico responsivo e de formulário | https://pinturadefachadas-verticalchao.pages.dev/ | Ausência de menu móvel, galeria compacta, consentimento e acessibilidade |

O tracking não será herdado das outras landing pages. Os identificadores e scripts serão auditados novamente na página original de Ecogranito e registrados no `build.json`.

## Abordagem escolhida

Modernização fiel. Preservar fotos e depoimentos reais, eliminar contadores quebrados ou alegações sem comprovação e reescrever a argumentação para falar especificamente de Ecogranito. Não criar números, certificações, garantias, prazos ou resultados que não estejam sustentados pela fonte.

## Arquitetura

Site estático em HTML, CSS e JavaScript, com build determinístico para `dist/`. O pacote de produção ficará em `lp/deploy/github-cloudflare/`; uma cópia do artefato final ficará em `lp/build/`, conforme a convenção do workspace.

O repositório e o projeto Pages usarão o nome `ecogranito-verticalchao`.

## Sistema visual

- Base grafite escura, vermelho institucional e superfícies em papel quente.
- Outfit nos títulos e Poppins no texto, servidos localmente.
- Hero fotográfico de largura total, com contraste garantido por sobreposição.
- Cabeçalho transparente sobre o hero e sólido após a rolagem.
- Navegação desktop enxuta. No mobile, exibir apenas a marca; nenhum menu sanduíche.
- Galeria sem carrossel ou lightbox. As imagens devem ficar compactas no celular, com proporção aproximada de 4:3 e altura entre 240 e 290 px em 390 px de viewport.
- Movimento limitado a feedback de interação; respeitar `prefers-reduced-motion`.

## Estrutura de conteúdo

1. Hero: aplicação de Ecogranito em fachadas, benefício principal e CTAs de orçamento/telefone.
2. Faixa de sinais: serviço em altura, responsabilidade técnica, acabamento e avaliação do edifício; sem contadores numéricos quebrados.
3. Contexto do material: acabamento, versatilidade, resistência e manutenção, sem promessas absolutas.
4. Execução especializada: diagnóstico do substrato, preparação, aplicação e inspeção.
5. Galeria: usar somente imagens da página original ou de ativos oficiais da Vertical Chão associados ao serviço.
6. Depoimentos: preservar autoria e teor dos relatos reais. Apresentá-los como experiência com a empresa, sem afirmar que todos se referem a Ecogranito.
7. Serviços relacionados: limpeza de fachadas, reposição de pastilhas e pintura de fachadas.
8. Orçamento: formulário acessível que monta uma mensagem e abre o WhatsApp comercial.
9. Rodapé: dados institucionais, contatos, atalhos e controle para revisar preferências de cookies.

## Copy e legibilidade

A copy será finalizada antes da build e passará, nesta ordem, por:

1. `anti-ai-writing`: remoção de fórmulas, paralelismo negativo, abstrações e ritmo uniforme, mantendo a arquitetura de conversão.
2. `text-editor-br` em modo `lp`: diagnóstico de frases longas, voz passiva, gerundismo, nominalização, ecos e Flesch PT-BR.
3. Nova revisão anti-AI para impedir que as correções de legibilidade introduzam maneirismos de humanizer.

Serão salvos a copy final e os relatórios de mudanças/legibilidade em `analysis/`.

## Contatos

- Comercial, cabeçalho, CTAs, formulário e widget: `(31) 99684-8477`.
- Ligação comercial: `tel:+5531996848477`.
- WhatsApp comercial: `https://api.whatsapp.com/send?phone=5531996848477&text=Ol%C3%A1,%20preciso%20de%20um%20atendimento!`.
- Segundo telefone, somente no rodapé: `(31) 98712-2106`, `tel:+5531987122106`.
- Remover `(31) 99471-1393`, `5531994711393` e qualquer card do Edvaldo.

## Tracking e privacidade

- Auditar a página original imediatamente antes da implementação.
- Reproduzir os contêineres/IDs existentes na origem. A inspeção inicial encontrou `GTM-M7GS29F`, `G-L2NNH9T18X` e `AW-956995439`; esses valores precisam ser confirmados no contrato automatizado.
- Eventos próprios: `cta_clicked` e `form_submitted`.
- Nunca enviar nome, telefone, e-mail ou mensagem ao `dataLayer`.
- Google Consent Mode com armazenamento negado por padrão.
- Banner acessível para aceitar ou recusar e controle no rodapé para rever a escolha.

## Formulário

Campos: nome, telefone, e-mail opcional, assunto e mensagem. Validar no cliente, mostrar erros próximos aos campos, marcar `aria-invalid` e levar o foco ao primeiro erro. Em envio válido, registrar apenas metadados permitidos e abrir o WhatsApp `5531996848477` com a mensagem codificada.

## SEO e metadados

- Um `h1` descritivo.
- Title, description, canonical, Open Graph e JSON-LD coerentes com aplicação de Ecogranito.
- Canonical inicial: `https://ecogranito-verticalchao.pages.dev/`.
- Logo, favicon e imagens com dimensões declaradas, textos alternativos e carregamento adequado.
- O README deve orientar a troca do canonical após a configuração do domínio personalizado.

## Tratamento de falhas

- Build deve falhar se algum ativo local estiver ausente.
- Validação deve falhar se os telefones antigos, Edvaldo, menu móvel, IDs de tracking divergentes ou dados pessoais no tracking aparecerem.
- Se o WhatsApp for bloqueado pelo navegador, manter mensagem de status clara no formulário.
- Acesso ao `localStorage` deve ser protegido contra exceções.

## Testes e critérios de aceite

- Contratos automatizados para telefones, tracking da origem, links, SEO, consentimento e ausência de elementos proibidos.
- Build e validação local sem erros.
- Playwright em 390×844 e 1280×900.
- Em 390 px: sem overflow, nenhum menu sanduíche, seis ou menos imagens compactas e todos os alvos interativos com pelo menos 24 px.
- Navegação por teclado, skip link, validação, revisão do consentimento e retorno de foco testados.
- Formulário abre o número correto e o `dataLayer` não recebe dados pessoais.
- HTTP 200 e nova implantação de produção associada ao commit final.

## Publicação

Criar o repositório `trafegocomprado/ecogranito-verticalchao`, enviar `main`, criar ou conectar o projeto Cloudflare Pages `ecogranito-verticalchao` e publicar a build. A personalização do domínio fica fora do escopo, conforme solicitado pelo usuário.

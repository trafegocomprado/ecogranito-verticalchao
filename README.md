# Ecogranito Vertical Chão

Landing page de aplicação de Ecogranito em fachadas. O projeto usa HTML, CSS e JavaScript estáticos, ativos oficiais da Vertical Chão e os identificadores de tracking da página original.

## Verificação local

```bash
npm run check
```

O comando executa os contratos, gera `dist/`, prepara `public/` e valida os links locais. Para visualizar:

```bash
npx serve public
```

## GitHub

```bash
git add .
git commit -m "feat: publish ecogranito landing page"
git branch -M main
git remote add origin https://github.com/trafegocomprado/ecogranito-verticalchao.git
git push -u origin main
```

## Cloudflare Pages

Conecte o repositório do GitHub com estas opções:

- Framework preset: None / Static HTML
- Build command: `npm run build`
- Build output directory: `public`
- Root directory: `/`
- Production branch: `main`

`public/` é o artefato publicado. Os arquivos na raiz são a fonte editável e `dist/` é usado para validação local.

Depois de configurar o domínio personalizado, atualize a URL canônica e o `og:url` em `index.html`, além das URLs de `robots.txt` e `sitemap.xml`.

## Contatos e tracking

- Comercial: `(31) 99684-8477`
- Telefone secundário no rodapé: `(31) 98712-2106`
- Google Tag Manager: `GTM-M7GS29F`
- Google Analytics 4: `G-L2NNH9T18X`
- Google Ads: `AW-956995439`

O Consent Mode v2 começa negado e pode ser revisado pelo controle no rodapé. Eventos de CTA e formulário não enviam nome, telefone, e-mail ou mensagem ao `dataLayer`.

## Formulário por e-mail

O formulário usa `contact-form.js` e `contact-config.js` para enviar os dados ao Worker Cloudflare. O e-mail é obrigatório para resposta; o telefone é opcional. O formulário exige validação Turnstile e só confirma o envio depois de uma resposta `{ ok: true, requestId }`. Os botões de WhatsApp continuam independentes.

`contact-config.js` já contém o endpoint `https://verticalchao-contato.mpxedl.workers.dev/api/contato` e a sitekey de produção do Turnstile. A entrega real a `verticalchao@gmail.com` ainda depende da validação final de publicação. Se a configuração estiver ausente, o cliente mantém o envio desativado e oferece o e-mail como alternativa. Sem JavaScript, o botão continua desativado e há uma alternativa de contato por e-mail.

`npm run check` inclui testes de integração e testes do cliente de envio com respostas simuladas; esses testes não enviam pedidos reais.

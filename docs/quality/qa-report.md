# Relatório final de QA

Data: 22 de julho de 2026.

## Resultado

- Contratos automatizados: 10 aprovados, 0 falhas.
- Validação do pacote e links locais: aprovada.
- Desktop 1280 × 900: sem overflow, imagens quebradas ou erros de console.
- Mobile 390 × 844: sem menu sanduíche; galeria com três imagens de 273 px de altura.
- Mobile 375 × 667: CTA principal visível no primeiro fold.
- Formulário: validação de campos, foco no primeiro erro, abertura do WhatsApp e fallback para popup bloqueado aprovados.
- Consentimento: aceitar, recusar, reabrir e persistir escolha aprovados.
- Tracking: somente `GTM-M7GS29F`, `G-L2NNH9T18X` e `AW-956995439`; nenhum dado pessoal nos eventos testados.
- Acessibilidade visual: leitura preservada nas simulações de protanopia, deuteranopia, tritanopia e escala de cinza.
- Anti-widow: 0 ocorrências em desktop e mobile.
- Produção: HTTP 200 em HTML, CSS, JavaScript, `robots.txt` e sitemap; sem falhas em ativos locais.
- Lighthouse em produção: performance 99, acessibilidade 100, boas práticas 100 e SEO 100.

Os dados estruturados da execução estão em `qa-summary.json`.

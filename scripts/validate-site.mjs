import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const [html, css, javascript, buildRaw] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../styles.css', import.meta.url), 'utf8'),
  readFile(new URL('../script.js', import.meta.url), 'utf8'),
  readFile(new URL('../build.json', import.meta.url), 'utf8'),
]);
const source = `${html}\n${css}\n${javascript}`;
const failures = [];
const fail = (message) => failures.push(message);
const count = (value, pattern) => [...value.matchAll(pattern)].length;

for (const required of [
  '(31) 99684-8477',
  'tel:+5531996848477',
  '(31) 98712-2106',
  'tel:+5531987122106',
  'https://api.whatsapp.com/send?phone=5531996848477&amp;text=Ol%C3%A1,%20preciso%20de%20um%20atendimento!',
  'data-whatsapp-form',
  'HomeAndConstructionBusiness',
  'data-consent-manage',
]) {
  if (!html.includes(required)) fail(`missing required content: ${required}`);
}

for (const forbidden of ['5531994711393', '99471-1393', 'Edvaldo', 'menu-toggle', 'data-menu-toggle', 'transition: all']) {
  if (source.includes(forbidden)) fail(`forbidden legacy content: ${forbidden}`);
}

const h1Count = count(html, /<h1\b[^>]*>/gi);
if (h1Count !== 1) fail(`expected exactly one h1, found ${h1Count}`);

const figures = count(html, /<figure\b/gi);
if (figures !== 3) fail(`expected exactly three gallery figures, found ${figures}`);

const gtmOccurrences = count(html, /GTM-M7GS29F/g);
const gtmScripts = count(html, /dataLayer','GTM-M7GS29F'\);/g);
const gtmNoscripts = count(html, /ns\.html\?id=GTM-M7GS29F/g);
if (gtmOccurrences !== 2 || gtmScripts !== 1 || gtmNoscripts !== 1) {
  fail(`GTM expected once in loader and once in noscript; found ${gtmOccurrences} total`);
}

for (const [label, pattern] of [
  ['GA4', /gtag\s*\(\s*['"]config['"]\s*,\s*['"]G-L2NNH9T18X['"]\s*\)/g],
  ['Google Ads', /gtag\s*\(\s*['"]config['"]\s*,\s*['"]AW-956995439['"]\s*\)/g],
]) {
  const matches = count(html, pattern);
  if (matches !== 1) fail(`${label} config expected once, found ${matches}`);
}

for (const signal of ['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization']) {
  if (!source.includes(signal)) fail(`missing Consent Mode signal: ${signal}`);
}

for (const [event, metadata] of [
  ['cta_clicked', 'cta_location'],
  ['form_submitted', "form_name: 'ecogranito_orcamento'"],
]) {
  if (!javascript.includes(`track('${event}'`)) fail(`missing event: ${event}`);
  if (!javascript.includes(metadata)) fail(`missing event metadata: ${metadata}`);
}

for (const payload of javascript.matchAll(/dataLayer\.push\s*\(\s*\{([\s\S]*?)\}\s*\)/g)) {
  if (/\b(nome|telefone|email|mensagem)\s*:/i.test(payload[1])) fail('PII key found in dataLayer payload');
}

for (const asset of [
  'assets/img/webp/logo.webp',
  'assets/img/webp/ecogranito-obra-1.webp',
  'assets/img/webp/ecogranito-obra-2.webp',
  'assets/img/webp/ecogranito-obra-3.webp',
  'assets/favicon-32.png',
  'assets/apple-touch-icon.png',
]) {
  if (!html.includes(asset)) fail(`missing asset reference: ${asset}`);
}

if (!/@media\s*\(max-width:680px\)[\s\S]*?\.gallery figure[\s\S]*?min-height:0;aspect-ratio:4\s*\/\s*3/i.test(css)) {
  fail('missing compact 4:3 mobile gallery contract');
}

const build = JSON.parse(buildRaw);
if (build.mobile_menu !== false) fail('build metadata must disable mobile menu');
if (build.tracking.gtm !== 'GTM-M7GS29F' || build.tracking.ga4 !== 'G-L2NNH9T18X' || build.tracking.google_ads !== 'AW-956995439') {
  fail('build metadata tracking IDs diverge from the source page');
}

if (failures.length) {
  console.error(`Site validation failed (${failures.length}):`);
  failures.forEach((message) => console.error(`- ${message}`));
  process.exitCode = 1;
} else {
  console.log(`Site validation passed for ${root}`);
}

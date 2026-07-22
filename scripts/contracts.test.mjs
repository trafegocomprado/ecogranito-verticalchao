import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = async (file) => {
  try {
    return await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
  } catch {
    return '';
  }
};

const compact = (value) => value.replace(/[\s()-]/g, '');

test('publishes the approved Ecogranito identity and contacts', async () => {
  const html = await read('index.html');
  const script = await read('script.js');
  const combined = `${html}\n${script}`;

  assert.match(html, /<h1\b/i, 'the page needs one primary heading');
  assert.equal((html.match(/<h1\b/gi) ?? []).length, 1, 'the page needs exactly one h1');
  assert.match(html, /rel=["']canonical["'][^>]+https:\/\/ecogranito-verticalchao\.pages\.dev\//i);
  assert.ok(compact(combined).includes('5531996848477'), 'commercial phone is required');
  assert.ok(compact(combined).includes('5531987122106'), 'secondary footer phone is required');

  for (const forbidden of ['5531994711393', '99471-1393', 'Edvaldo', 'menu-toggle', 'data-menu-toggle']) {
    assert.ok(!combined.includes(forbidden), `forbidden content found: ${forbidden}`);
  }
});

test('preserves only the original tracking accounts and supports consent revision', async () => {
  const html = await read('index.html');
  const script = await read('script.js');
  const combined = `${html}\n${script}`;
  const requiredIds = ['GTM-M7GS29F', 'G-L2NNH9T18X', 'AW-956995439'];

  for (const id of requiredIds) {
    assert.ok(combined.includes(id), `tracking ID missing: ${id}`);
  }
  assert.deepEqual(
    [...new Set(combined.match(/(?:GTM|G|AW)-[A-Z0-9-]+/g) ?? [])].sort(),
    [...requiredIds].sort(),
    'only the approved tracking IDs may be configured',
  );
  for (const signal of ['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization']) {
    assert.ok(combined.includes(signal), `consent signal missing: ${signal}`);
  }
  for (const hook of ['data-consent-accept', 'data-consent-reject', 'data-consent-manage']) {
    assert.ok(combined.includes(hook), `consent hook missing: ${hook}`);
  }
  assert.ok(script.includes('verticalchao_consent'), 'consent decision must be stored defensively');
});

test('keeps the mobile layout simple and the official gallery compact', async () => {
  const html = await read('index.html');
  const css = await read('styles.css');
  const figures = html.match(/<figure\b/g) ?? [];

  assert.equal(figures.length, 3, 'the gallery must use the three official Ecogranito images');
  assert.match(css, /@media[^{}]*max-width:\s*680px[\s\S]*?\.gallery\s+figure\s*\{[\s\S]*?aspect-ratio:\s*4\s*\/\s*3/i);
  assert.doesNotMatch(css, /transition\s*:\s*all/i);
});

test('builds a private WhatsApp form without sending personal data to analytics', async () => {
  const html = await read('index.html');
  const script = await read('script.js');

  assert.ok(html.includes('data-whatsapp-form'), 'WhatsApp form is required');
  assert.ok(script.includes('form_submitted'), 'form conversion event is required');
  assert.ok(script.includes('cta_clicked'), 'CTA conversion event is required');
  assert.ok(script.includes('encodeURIComponent'), 'WhatsApp message must be URL encoded');
  assert.ok(script.includes('5531996848477'), 'form must target the commercial WhatsApp');
  assert.ok(html.includes('data-form-status'), 'form needs an accessible status region');
  assert.ok(html.includes('data-form-fallback'), 'form needs a fallback link when popups are blocked');
  assert.ok(script.includes('popup_blocked'), 'blocked WhatsApp popups need an explicit status');

  const dataLayerPushes = [...script.matchAll(/dataLayer\.push\s*\(\s*\{([\s\S]*?)\}\s*\)/g)].map((match) => match[1]);
  for (const payload of dataLayerPushes) {
    assert.doesNotMatch(payload, /\b(nome|telefone|email|mensagem)\s*:/i, 'analytics payload contains PII');
  }
});

test('does not steal focus when the first-visit consent banner appears', async () => {
  const script = await read('script.js');

  assert.match(script, /showBanner\(\{\s*focus:\s*false\s*\}\)/);
  assert.match(script, /showBanner\(\{\s*focus:\s*true\s*\}\)/);
  assert.ok(script.includes("document.querySelector('#conteudo')"), 'dismissal needs a meaningful focus fallback');
});

test('exposes a complete production artifact contract', async () => {
  const buildRaw = await read('build.json');
  assert.ok(buildRaw, 'build.json is required');
  const build = JSON.parse(buildRaw);

  assert.equal(build.product, 'Ecogranito Vertical Chão');
  assert.equal(build.mobile_menu, false);
  assert.deepEqual(build.tracking, {
    gtm: 'GTM-M7GS29F',
    ga4: 'G-L2NNH9T18X',
    google_ads: 'AW-956995439',
  });
  assert.equal(build.reference_contract.status, 'valid');
  assert.ok(build.reference_contract.reference_urls.length >= 3);
});

test('documents a GitHub-first Cloudflare Pages package', async () => {
  const readme = await read('README.md');
  const manifestRaw = await read('package-manifest.json');
  const redirects = await read('_redirects');

  assert.match(readme, /Cloudflare Pages/i);
  assert.match(readme, /Build output directory:\s*`public`/i);
  assert.match(redirects, /\/\*\s+\/index\.html\s+200/);
  assert.ok(manifestRaw, 'package-manifest.json is required');
  const manifest = JSON.parse(manifestRaw);
  assert.equal(manifest.cloudflare.build_output_directory, 'public');
  assert.equal(manifest.cloudflare.root_directory, '/');
});

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

const luminance = (hex) => {
  const channels = hex.match(/[a-f\d]{2}/gi).map((value) => Number.parseInt(value, 16) / 255);
  const linear = channels.map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
};

const contrast = (foreground, background) => {
  const values = [luminance(foreground), luminance(background)];
  return (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05);
};

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

test('keeps independent CTA and consent analytics free from personal form data', async () => {
  const script = await read('script.js');
  const trackedPayloads = [...script.matchAll(/track\(\s*['"][^'"]+['"]\s*,\s*\{([\s\S]*?)\}\s*\)/g)].map((match) => match[1]);
  assert.ok(trackedPayloads.length >= 2);
  for (const payload of trackedPayloads) assert.doesNotMatch(payload, /\b(nome|telefone|email|mensagem)\s*:/i);
});

test('keeps a high-contrast keyboard focus indicator on form controls', async () => {
  const css = await read('styles.css');

  assert.match(css, /\.field\s+(?:input|input[^}]*)?:focus-visible[\s\S]*?outline:\s*3px\s+solid\s+#fff[\s\S]*?box-shadow:\s*0\s+0\s+0\s+6px\s+var\(--red-dark\)/i);
  assert.doesNotMatch(css, /\.field[^{}]*:focus[^{}]*\{[^}]*outline:\s*0/i);
});

test('keeps brand-red text and controls at WCAG AA contrast', async () => {
  const css = await read('styles.css');
  const brandRed = css.match(/--red:(#[a-f\d]{6})/i)?.[1];
  const darkSurface = css.match(/--ink:(#[a-f\d]{6})/i)?.[1];
  const processRed = css.match(/\.process-card>span\{color:(#[a-f\d]{6})/i)?.[1];

  assert.ok(brandRed && darkSurface && processRed, 'semantic contrast colors are required');
  assert.ok(contrast(brandRed, '#ffffff') >= 4.5, 'white button text needs AA contrast');
  assert.ok(contrast(brandRed, '#fbf8f1') >= 4.5, 'red labels on paper need AA contrast');
  assert.ok(contrast(processRed, darkSurface) >= 4.5, 'red process labels on dark panels need AA contrast');
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
  const headers = await read('_headers');
  const sitemap = await read('sitemap.xml');

  assert.match(readme, /Cloudflare Pages/i);
  assert.match(readme, /Build command:\s*`npm run build`/i);
  assert.match(readme, /Build output directory:\s*`public`/i);
  assert.match(redirects, /\/\*\s+\/index\.html\s+200/);
  assert.match(headers, /Cache-Control:\s*public,\s*max-age=86400,\s*must-revalidate/i);
  assert.doesNotMatch(headers, /immutable/i);
  assert.match(sitemap, /<loc>https:\/\/ecogranito-verticalchao\.pages\.dev\/<\/loc>/);
  assert.ok(manifestRaw, 'package-manifest.json is required');
  const manifest = JSON.parse(manifestRaw);
  assert.equal(manifest.cloudflare.build_output_directory, 'public');
  assert.equal(manifest.cloudflare.build_command, 'npm run build');
  assert.equal(manifest.cloudflare.root_directory, '/');
});

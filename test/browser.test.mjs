// Optional browser acceptance test. Supply PLAYWRIGHT_MODULE if Playwright is
// installed elsewhere. The game is served from this checkout via route.fulfill.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true });
const root = new URL('../', import.meta.url);
const errors = [];
const types = { html: 'text/html', js: 'text/javascript', css: 'text/css', png: 'image/png', woff2: 'font/woff2' };
const fonts = ['fredoka', 'nunito', 'jetbrains-mono'].flatMap(name => [`fonts/${name}-latin.woff2`, `fonts/${name}-latin-ext.woff2`]);
const files = new Set(['index.html', 'game.js', 'renderer.js', 'audio.js', 'style.css', 'generated-levels.js', 'authored-levels.js', 'banana-sprite.png', ...fonts]);

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    const name = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    if (url.hostname !== 'codemonkey.test' || !files.has(name)) return route.abort();
    await route.fulfill({ contentType: types[name.split('.').at(-1)], body: await readFile(new URL(name, root)) });
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    if (localStorage.getItem('test-seeded')) return;
    localStorage.setItem('test-seeded', '1');
    localStorage.setItem('kodmaymunu_welcome_seen', 'true');
    localStorage.setItem('kodmaymunu_dev_mode', 'true');
    localStorage.setItem('kodmaymunu_sound', 'false');
    localStorage.setItem('kodmaymunu_level', '99');
    localStorage.setItem('kodmaymunu_code_lvl_99_indent', '# old draft stays safe');
    localStorage.setItem('kodmaymunu_best_lines', JSON.stringify({ 99: 2 }));
    localStorage.setItem('kodmaymunu_stars', JSON.stringify({ 0: 3 }));
  });
  await page.goto('http://codemonkey.test');
  await page.locator('#active-level-title').filter({ hasText: 'Algoritma Tapınağı' }).waitFor();
  assert.equal(await page.locator('#scenario-bar button').count(), 4);
  assert.equal(await page.locator('#cmd-iken').isVisible(), true);
  assert.equal(await page.locator('.mission-chip-record').count(), 0, 'old record must not describe a redesigned board');
  const initialDraft = await page.locator('#code-editor').inputValue();
  assert.ok(!initialDraft.includes('old draft'));

  await page.locator('#btn-atlas-main').click();
  assert.equal(await page.locator('.world-card').count(), 5);
  await page.waitForFunction(() => getComputedStyle(document.getElementById('atlas-modal')).opacity === '1');
  await page.screenshot({ path: '/tmp/codemonkey-atlas.png', fullPage: true });
  await page.keyboard.press('Escape');

  await page.locator('#btn-smart-route').click();
  for (let i = 1; i <= 3; i++) {
    await page.locator('#btn-next-hint').click();
    assert.equal(await page.locator('.coach-hints .revealed').count(), i);
  }
  assert.equal(await page.locator('#code-editor').inputValue(), initialDraft);
  await page.locator('#solution-disclosure summary').click();
  await page.locator('#btn-use-solution').click();
  const solution = await page.locator('#code-editor').inputValue();
  assert.ok(solution.includes('iken(hedefteDegilim())'));
  await page.locator('#scenario-bar button').nth(3).click();
  assert.equal(await page.locator('#scenario-bar button').nth(3).getAttribute('aria-pressed'), 'true');
  await page.screenshot({ path: '/tmp/codemonkey-desktop.png', fullPage: true });

  // Keep the real VM, animation and callbacks; only shorten movement duration.
  await page.evaluate(async () => {
    const { Game } = await import('./game.js?v=20260923-v5');
    const original = Game.prototype.runCodeText;
    Game.prototype.runCodeText = function (code) { this.executionSpeed = 1; return original.call(this, code); };
  });
  await page.locator('#btn-run').click();
  await page.locator('#success-modal.show').waitFor({ timeout: 30000 });
  assert.match(await page.locator('#star-details').innerText(), /4 farklı parkuru geçti/);
  assert.match(await page.locator('#star-details').innerText(), /Ustalık rozeti kazanıldı/);
  assert.equal(await page.locator('#modal-stars .earned').count(), 3);
  assert.equal(await page.locator('#modal-btn-next').isVisible(), false);
  assert.equal(await page.evaluate(() => localStorage.getItem('kodmaymunu_code_lvl_99_indent')), '# old draft stays safe');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('kodmaymunu_stars'))[0]), 3);
  await page.screenshot({ path: '/tmp/codemonkey-victory.png', fullPage: true });
  await page.reload();
  await page.locator('.mission-chip-record').filter({ hasText: 'Ustalık' }).waitFor();
  assert.equal(await page.locator('#code-editor').inputValue(), solution);

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.screenshot({ path: '/tmp/codemonkey-laptop.png', fullPage: true });
  const canvasBounds = await page.locator('#game-canvas').boundingBox();
  assert.ok(canvasBounds.height >= 170, 'laptop board is too small to play');
  const backing = await page.evaluate(() => {
    const canvas = document.getElementById('game-canvas');
    return { width: canvas.width, cssWidth: canvas.clientWidth };
  });
  assert.ok(backing.cssWidth > 300 && backing.width >= backing.cssWidth, 'canvas backing store must follow its CSS box');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '/tmp/codemonkey-mobile.png', fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'mobile page has horizontal overflow');
  await page.locator('#btn-atlas-main').click();
  assert.ok(await page.locator('#atlas-modal').isVisible());
  await page.waitForFunction(() => getComputedStyle(document.getElementById('atlas-modal')).opacity === '1');
  await page.screenshot({ path: '/tmp/codemonkey-atlas-mobile.png', fullPage: true });
  await page.keyboard.press('Escape');
  await page.locator('#settings-menu summary').click();
  await page.locator('#btn-theme-toggle').click();
  await page.locator('#syntax-mode').selectOption('bracket');
  await page.keyboard.press('Escape');
  await page.locator('#btn-smart-route').click();
  await page.locator('#solution-disclosure summary').click();
  await page.locator('#btn-use-solution').click();
  assert.ok((await page.locator('#code-editor').inputValue()).includes('iken(hedefteDegilim()) {'));
  await page.screenshot({ path: '/tmp/codemonkey-light-mobile.png', fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));

  // Also cover the actual new-player path, with developer mode off.
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('test-seeded', '1'); });
  await page.reload();
  await page.locator('#welcome-overlay.show').waitFor();
  await page.locator('#btn-welcome-start').click();
  assert.match(await page.locator('#active-level-title').innerText(), /İlk Adım/);
  assert.equal(await page.locator('#cmd-iken').isVisible(), false);
  await page.locator('#btn-atlas-main').click();
  assert.equal(await page.locator('.world-card:disabled').count(), 4);
  await page.keyboard.press('Escape');
  await page.locator('#code-editor').fill('ilerle()\nilerle()\nilerle()\nilerle()');
  await page.locator('#btn-run').click();
  await page.locator('#success-modal.show').waitFor({ timeout: 10000 });
  await page.locator('#modal-btn-next').click();
  assert.match(await page.locator('#active-level-title').innerText(), /Temasla Topla/);
  assert.deepEqual(errors, [], 'uncaught browser errors');
  console.log('Browser acceptance passed: desktop, mobile, atlas, hints, four-map finale, mastery, draft migration, reload, light theme and both syntax modes.');
} finally {
  await browser.close();
}

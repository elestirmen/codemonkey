// Tarayıcı kabul testi: gerçek Chromium'da arayüzü sürer ve 60 görevin
// hepsini örnek çözümle editörden çalıştırır. Dosyalar bu klasörden istek
// yakalamayla sunulur; canlı oyuncu kaydına dokunulmaz.
//
//   node test/browser.test.mjs
//   PUPPETEER_MODULE=/yol/puppeteer node test/browser.test.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const puppeteer = require(process.env.PUPPETEER_MODULE || `${process.env.HOME}/.npm-global/lib/node_modules/puppeteer`);

const ROOT = new URL('../', import.meta.url);
const ORIGIN = 'http://kodmaymunu.test';
const TYPES = { html: 'text/html', js: 'text/javascript', css: 'text/css', woff2: 'font/woff2' };
const SHOTS = process.env.SHOTS || '/tmp';
const errors = [];

async function serve(page) {
  await page.setRequestInterception(true);
  page.on('request', async request => {
    const url = new URL(request.url());
    if (url.origin !== ORIGIN) return request.abort();
    const name = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    if (!/^[\w\-./]+$/.test(name) || name.includes('..')) return request.respond({ status: 404, body: '' });
    try {
      const body = await readFile(new URL(name, ROOT));
      request.respond({ status: 200, contentType: TYPES[name.split('.').at(-1)] || 'application/octet-stream', body });
    } catch (_) {
      request.respond({ status: 404, body: '' });
    }
  });
}

async function openPage(browser, viewport, seed = {}) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' && !/favicon/.test(message.text())) errors.push(message.text());
  });
  await serve(page);
  await page.evaluateOnNewDocument(values => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.clear();
    for (const [key, value] of Object.entries(values)) localStorage.setItem(key, value);
  }, { km5_sound: 'false', ...seed });
  await page.goto(`${ORIGIN}/`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.kodmaymunu && window.kodmaymunu.LEVELS.length === 60);
  return page;
}

const visible = (page, selector) => page.$eval(selector, el => !el.hidden);

const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
try {
  // 1) İlk ziyaret: hoş geldin, ilk ders, palet ile kod yazma ve zafer.
  {
    const page = await openPage(browser, { width: 1440, height: 900 });
    assert.equal(await visible(page, '#welcome-overlay'), true);
    await page.click('#btn-welcome');
    await page.waitForFunction(() => !document.getElementById('learn-overlay').hidden);
    assert.match(await page.$eval('#learn-title', el => el.textContent), /sırayla/);
    await page.keyboard.press('Escape');
    for (let i = 0; i < 3; i++) await page.click('#palette .cmd');
    assert.equal(await page.$eval('#code', el => el.value), 'ilerle()\nilerle()\nilerle()');
    assert.match(await page.$eval('#line-meter', el => el.textContent), /3 satır/);
    await page.evaluate(() => { window.kodmaymunu.game.speed = 1; });
    await page.click('#btn-run');
    await page.waitForFunction(() => !document.getElementById('win-overlay').hidden, { timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 1300));
    assert.equal(await page.$$eval('#win-stars .on', els => els.length), 3);
    await page.screenshot({ path: `${SHOTS}/kodmaymunu-win.png` });
    await page.click('#btn-win-next');
    await page.waitForFunction(() => document.getElementById('level-title').textContent.startsWith('2.'));
    await page.waitForFunction(() => !document.getElementById('learn-overlay').hidden && /sayı/.test(document.getElementById('learn-title').textContent));
    await page.keyboard.press('Escape');

    // Yazım hatası: satır işaretlenir, Mojo ne olduğunu söyler.
    await page.$eval('#code', el => { el.value = 'ilerle(8\n'; el.dispatchEvent(new Event('input')); });
    await page.click('#btn-run');
    await page.waitForFunction(() => !document.getElementById('bubble').hidden);
    assert.match(await page.$eval('#bubble-text', el => el.textContent), /Satır 1/);
    assert.equal(await page.$$eval('.code-layer .ln.error', els => els.length), 1);

    // Kilitli görev açılmaz; ada haritası açılır.
    await page.click('#btn-map');
    assert.equal(await page.$$eval('.level-dot', els => els.length), 60);
    assert.equal(await page.$$eval('.level-dot:disabled', els => els.length), 58);
    await page.screenshot({ path: `${SHOTS}/kodmaymunu-map.png` });
    await page.keyboard.press('Escape');
    await page.close();
  }

  // 2) Bütün görevler: örnek çözüm editöre yazılır ve arayüzden çalıştırılır.
  {
    const page = await openPage(browser, { width: 1366, height: 768 }, {
      km5_welcome: 'true',
      km5_dev: 'true',
      km5_learned: JSON.stringify(['basics', 'param', 'loop', 'function', 'if', 'while', 'variable'])
    });
    const count = await page.evaluate(() => window.kodmaymunu.LEVELS.length);
    for (let index = 0; index < count; index++) {
      const info = await page.evaluate(i => {
        const { loadLevel, LEVELS, game } = window.kodmaymunu;
        loadLevel(i, { fromUser: false });
        game.speed = 1;
        const level = LEVELS[i];
        const code = document.getElementById('code');
        code.value = level.solution;
        code.dispatchEvent(new Event('input'));
        return { id: level.id, title: level.title, starter: Boolean(level.starter), scenarios: level.scenarios ? level.scenarios.length : 1 };
      }, index);
      await page.click('#btn-run');
      try {
        await page.waitForFunction(() => !document.getElementById('win-overlay').hidden, { timeout: 30000 });
      } catch (error) {
        const status = await page.$eval('#status-text', el => el.textContent);
        const bubble = await page.$eval('#bubble-text', el => el.textContent);
        throw new Error(`${info.id}. ${info.title} kazanılamadı: ${status} / ${bubble}`);
      }
      await new Promise(resolve => setTimeout(resolve, 1100));
      assert.equal(await page.$$eval('#win-stars .on', els => els.length), 3, `${info.id} üç yıldız`);
      if (info.scenarios > 1) {
        assert.equal(await page.$$eval('#scenario-tabs button[data-state="pass"]', els => els.length), info.scenarios, `${info.id} parkurlar`);
      }
      await page.keyboard.press('Escape');
      if ([1, 13, 25, 37, 49, 53, 60].includes(info.id)) await page.screenshot({ path: `${SHOTS}/kodmaymunu-${info.id}.png` });
    }

    // Hata avı: başlangıç kodu yüklenir ve kazanmaz.
    // Az önce yazılan çözüm taslak olarak saklandı; silinince başlangıç kodu gelir.
    await page.evaluate(() => {
      localStorage.removeItem('km5_code_7_indent');
      window.kodmaymunu.loadLevel(6, { fromUser: false });
    });
    assert.match(await page.$eval('#code', el => el.value), /ilerle\(6\)/);
    await page.evaluate(() => { window.kodmaymunu.game.speed = 1; });
    await page.click('#btn-run');
    await page.waitForFunction(() => document.getElementById('status-chip').dataset.tone === 'error', { timeout: 15000 });
    await page.waitForFunction(() => !document.getElementById('bubble').hidden && /Satır 1/.test(document.getElementById('bubble-text').textContent));

    // Adım adım: ileri, geri ve devam.
    await page.evaluate(() => {
      window.kodmaymunu.loadLevel(2, { fromUser: false });
      window.kodmaymunu.game.speed = 1;
      const code = document.getElementById('code');
      code.value = 'ilerle(6)\nsagaDon()\nilerle(3)';
      code.dispatchEvent(new Event('input'));
    });
    await page.click('#btn-step');
    await page.waitForFunction(() => !document.getElementById('btn-back').disabled);
    await page.click('#btn-step');
    await new Promise(resolve => setTimeout(resolve, 200));
    const before = await page.evaluate(() => [window.kodmaymunu.game.player.x, window.kodmaymunu.game.player.y]);
    await page.click('#btn-back');
    const after = await page.evaluate(() => [window.kodmaymunu.game.player.x, window.kodmaymunu.game.player.y]);
    assert.equal(after[0], before[0] - 1);
    assert.equal(await page.$$eval('.code-layer .ln.active', els => els.length), 1);
    await page.click('#btn-run');
    await page.waitForFunction(() => !document.getElementById('win-overlay').hidden, { timeout: 15000 });
    await page.close();
  }

  // 3) Telefon: yatay kaydırma yok, sahne ve editör görünür.
  {
    const page = await openPage(browser, { width: 390, height: 844, isMobile: true, hasTouch: true }, { km5_welcome: 'true', km5_learned: JSON.stringify(['basics']) });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 0, `yatay taşma ${overflow}px`);
    const stage = await page.$eval('.stage', el => el.getBoundingClientRect().height);
    assert.ok(stage >= 260);
    await page.screenshot({ path: `${SHOTS}/kodmaymunu-mobile.png`, fullPage: true });
    await page.close();
  }

  // 4) Önceki sürümün ilerlemesi: ulaşılan bölümün adası açılır.
  {
    const page = await openPage(browser, { width: 1280, height: 800 }, {
      km5_welcome: 'true',
      kodmaymunu_unlocked: JSON.stringify(Array.from({ length: 46 }, (_, i) => i))
    });
    const unlocked = await page.evaluate(() => window.kodmaymunu.state.unlocked);
    assert.equal(unlocked, 24, 'üçüncü adanın ilk görevi açık olmalı');
    assert.match(await page.$eval('#level-title', el => el.textContent), /^25\./);
    await page.close();
  }

  assert.deepEqual(errors, [], `sayfa hataları: ${errors.join(' | ')}`);
  console.log('Tarayıcı testleri geçti.');
} finally {
  await browser.close();
}

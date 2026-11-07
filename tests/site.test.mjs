import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { once } from 'node:events';
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

let server;
let browser;
let baseURL;
const results = new URL('../test-results/', import.meta.url);

before(async () => {
  process.env.PORT = '0';
  ({ server } = await import('../scripts/serve.mjs'));
  if (!server.listening) await once(server, 'listening');
  baseURL = `http://127.0.0.1:${server.address().port}`;
  await mkdir(results, { recursive: true });
  await mkdir(new URL('downloads/', results), { recursive: true });
  browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless: true, downloadsPath: fileURLToPath(new URL('downloads/', results)), args: ['--enable-unsafe-swiftshader'] });
});

after(async () => {
  await browser?.close();
  if (server) await new Promise((resolve) => server.close(resolve));
});

test('desktop: character, projects, links, and keyboard motion controls work', async () => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  const failedAssets = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.url().startsWith(baseURL) && response.status() >= 400) failedAssets.push(response.url());
  });
  await page.goto(baseURL);
  await page.locator('#avatar-canvas').waitFor({ state: 'visible', timeout: 20000 });
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.locator('.project-card:visible').count(), 5);
  await page.getByRole('button', { name: 'Backend', exact: true }).click();
  assert.equal(await page.locator('.project-card:visible').count(), 3);
  await page.getByRole('button', { name: 'Mobile', exact: true }).click();
  assert.equal(await page.locator('.project-card:visible').count(), 1);
  assert.match(await page.locator('#filter-status').textContent(), /1 mobile project\./);
  await page.getByRole('button', { name: /All work/ }).click();
  assert.equal(await page.locator('.project-card:visible').count(), 5);
  await page.getByRole('button', { name: 'Say hello' }).click();
  assert.match(await page.locator('#avatar-status').textContent(), /Hey there/);
  await page.getByRole('button', { name: 'Pause character animation' }).focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.getByRole('button', { name: 'Resume character animation' }).getAttribute('aria-pressed'), 'true');
  assert.equal(await page.getByRole('button', { name: 'Say hello' }).isDisabled(), true);
  await page.getByRole('button', { name: 'Resume character animation' }).click();
  assert.equal(await page.getByRole('button', { name: 'Say hello' }).isEnabled(), true);
  const canvasBounds = await page.locator('#avatar-canvas').boundingBox();
  await page.locator('#avatar-canvas').click({ position: { x: canvasBounds.width / 2, y: canvasBounds.height * 0.52 } });
  assert.match(await page.locator('#avatar-status').textContent(), /Hey there/);
  assert.deepEqual(await page.locator('a[href^="#"]').evaluateAll((links) => links.filter((link) => !document.getElementById(link.hash.slice(1))).map((link) => link.hash)), []);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.locator('.portrait-frame img').scrollIntoViewIfNeeded();
  await page.locator('.portrait-frame img').evaluate((image) => image.decode());
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.locator('#motion-button').blur();
  await page.screenshot({ path: fileURLToPath(new URL('desktop.png', results)), fullPage: true, animations: 'disabled' });
  assert.deepEqual(errors, []);
  assert.deepEqual(failedAssets, []);
  await context.close();
});

test('mobile: navigation opens, closes with Escape and links, and fits narrow screens', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(baseURL);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  assert.equal(await page.locator('#navigation').isVisible(), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#navigation').isVisible(), false);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.locator('#navigation').getByRole('link', { name: 'Work', exact: true }).click();
  assert.equal(await page.locator('#navigation').isVisible(), false);
  for (const width of [320, 390, 600, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `No horizontal overflow at ${width}px`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL);
  await page.locator('#avatar-canvas').waitFor({ state: 'visible' });
  await page.locator('.portrait-frame img').scrollIntoViewIfNeeded();
  await page.locator('.portrait-frame img').evaluate((image) => image.decode());
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: fileURLToPath(new URL('mobile.png', results)), fullPage: true, animations: 'disabled' });
  await context.close();
});

test('reduced motion starts paused and responds to preference changes', async () => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(baseURL);
  await page.getByRole('button', { name: 'Resume character animation' }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Say hello' }).isDisabled(), true);
  await page.getByRole('button', { name: 'Resume character animation' }).click();
  assert.equal(await page.getByRole('button', { name: 'Say hello' }).isEnabled(), true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForFunction(() => document.querySelector('#avatar-status').textContent === 'Animation resumed.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Resume character animation' }).waitFor();
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
  await context.close();
});

test('failed 3D module and disabled JavaScript preserve the content and illustration', async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.route('**/assets/avatar.bundle.js', (route) => route.abort());
  await page.goto(baseURL);
  assert.equal(await page.locator('#avatar-fallback').isVisible(), true);
  assert.equal(await page.locator('#avatar-controls').isVisible(), false);
  assert.equal(await page.locator('.project-card:visible').count(), 5);
  await page.getByRole('button', { name: 'Mobile', exact: true }).click();
  assert.equal(await page.locator('.project-card:visible').count(), 1);
  await context.close();
  const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const noJSPage = await noJS.newPage();
  await noJSPage.goto(baseURL);
  assert.equal(await noJSPage.locator('#avatar-fallback').isVisible(), true);
  assert.equal(await noJSPage.locator('.project-card:visible').count(), 5);
  assert.equal(await noJSPage.getByRole('heading', { name: 'Good things start with a hello.' }).isVisible(), true);
  assert.equal(await noJSPage.getByRole('navigation', { name: 'Main navigation' }).isVisible(), true);
  assert.equal(await noJSPage.locator('.filters').isVisible(), false);
  assert.match(await noJSPage.locator('#last-updated').textContent(), /\d{2}:\d{2}/);
  await noJS.close();
});

test('preview server serves assets but keeps repository and local config private', async () => {
  for (const resource of ['/', '/styles.css', '/js/main.js', '/assets/companion.svg', '/assets/avatar.bundle.js', '/assets/social-card.png', '/robots.txt']) {
    assert.equal((await fetch(baseURL + resource)).status, 200, resource);
  }
  for (const resource of ['/.git/config', '/.env', '/package.json', '/docs/portfolio-brief.md', '/missing']) {
    assert.equal((await fetch(baseURL + resource)).status, 404, resource);
  }
});

test('CV link initiates a download and serves the exact supplied PDF', async () => {
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  await page.goto(baseURL);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: 'Download CV' }).click(),
  ]);
  assert.equal(download.suggestedFilename(), 'Asen-Mayuranga-Wijesiri-CV.pdf');
  assert.equal(download.url(), baseURL + '/assets/documents/asen-mayuranga-cv.pdf');
  // Chromium's headless PDF handling can cancel saving after the download event.
  // Verify the site's contract: a download link and an exact, valid PDF response.
  const response = await context.request.get(download.url());
  assert.equal(response.status(), 200);
  const downloaded = await response.body();
  const supplied = await readFile(new URL('../docs/Asen_Mayuranga_Wijesiri_Software_Engineer_CV.pdf', import.meta.url));
  assert.equal(downloaded.equals(supplied), true);
  assert.equal(response.headers()['content-type'], 'application/pdf');
  assert.equal(await page.locator('a[href^="mailto:"]').getAttribute('href'), 'mailto:ashen.ayuranga@gmail.com');
  assert.equal(await page.locator('a[href^="tel:"]').getAttribute('href'), 'tel:+94769895035');
  await context.close();
});

test('last updated is a fixed Sri Lanka build timestamp, independent of visitor timezone', async () => {
  let firstTimestamp;
  let firstText;
  for (const timezoneId of ['America/New_York', 'Asia/Tokyo']) {
    const context = await browser.newContext({ timezoneId });
    const page = await context.newPage();
    await page.goto(baseURL);
    const time = page.locator('#last-updated');
    const iso = await time.getAttribute('datetime');
    const text = await time.textContent();
    assert.equal(Number.isFinite(Date.parse(iso)), true);
    assert.ok(text.includes(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Colombo', month: 'short' }).format(new Date(iso))));
    assert.match(await page.locator('.last-updated').textContent(), /Sri Lanka \(UTC\+05:30\)/);
    if (firstTimestamp) { assert.equal(iso, firstTimestamp); assert.equal(text, firstText); }
    firstTimestamp = iso;
    firstText = text;
    await page.clock.setFixedTime(new Date('2035-01-01T12:00:00Z'));
    assert.equal(await time.textContent(), text);
    const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
    assert.equal(schema.dateModified, iso);
    await context.close();
  }
});

test('fonts and social assets work locally without third-party network requests', async () => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  const external = [];
  page.on('request', (request) => { if (!request.url().startsWith(baseURL)) external.push(request.url()); });
  await page.goto(baseURL);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.evaluate(() => document.fonts.check('600 16px Manrope') && document.fonts.check('400 16px "DM Sans"')), true);
  assert.deepEqual(external, []);
  const image = await readFile(new URL('../assets/social-card.png', import.meta.url));
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
  assert.equal(await page.locator('meta[property="og:image"]').getAttribute('content'), './assets/social-card.png');
  await context.close();
});

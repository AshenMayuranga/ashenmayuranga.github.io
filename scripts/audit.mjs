import { once } from 'node:events';
import { mkdir, writeFile, stat } from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

process.env.PORT = '0';
const { server } = await import('./serve.mjs');
if (!server.listening) await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;
const reports = new URL('../test-results/', import.meta.url);
await mkdir(reports, { recursive: true });
let browser;
const summary = [];
try {
  browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless: true, args: ['--enable-unsafe-swiftshader'] });
  for (const [name, width] of [['desktop', 1440], ['mobile', 390]]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    await writeFile(new URL(`accessibility-${name}.json`, reports), JSON.stringify(result, null, 2));
    const violations = result.violations.map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.map((node) => ({ target: node.target, reason: node.failureSummary })) }));
    summary.push({ viewport: name, violations });
    console.log(`${name}: ${violations.length} automated accessibility violations.`);
    if (violations.length) { console.log(JSON.stringify(violations, null, 2)); process.exitCode = 1; }
    await context.close();
  }
  const bundle = await stat(new URL('../assets/avatar.bundle.js', import.meta.url));
  await writeFile(new URL('quality-summary.json', reports), JSON.stringify({ accessibility: summary, characterBundleBytes: bundle.size }, null, 2));
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}

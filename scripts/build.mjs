import { cp, mkdir } from 'node:fs/promises';
import './vendor.mjs';
import { updateSiteMetadata } from './site-metadata.mjs';

const root = new URL('../', import.meta.url);
const output = new URL('dist/', root);
await updateSiteMetadata();
await mkdir(output, { recursive: true });
for (const file of ['index.html', 'styles.css', 'js', 'assets', 'robots.txt', '.nojekyll']) {
  await cp(new URL(file, root), new URL(file, output), { recursive: true });
}
console.log('Static site ready in dist/. The root files also work directly with GitHub Pages.');

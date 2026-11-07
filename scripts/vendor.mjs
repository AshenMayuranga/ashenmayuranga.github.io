import { copyFile, mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = new URL('../', import.meta.url);
await mkdir(new URL('assets/vendor/', root), { recursive: true });
await build({
  entryPoints: [fileURLToPath(new URL('js/avatar.js', root))],
  outfile: fileURLToPath(new URL('assets/avatar.bundle.js', root)),
  bundle: true,
  minify: true,
  treeShaking: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  legalComments: 'linked',
  logLevel: 'silent',
});
await copyFile(new URL('node_modules/three/LICENSE', root), new URL('assets/vendor/THREE-LICENSE.txt', root));

const fonts = new URL('assets/fonts/', root);
await mkdir(fonts, { recursive: true });
for (const family of ['dm-sans', 'manrope']) {
  const source = new URL(`node_modules/@fontsource-variable/${family}/`, root);
  const filename = `${family}-latin-wght-normal.woff2`;
  await copyFile(new URL(`files/${filename}`, source), new URL(filename, fonts));
  await copyFile(new URL('LICENSE', source), new URL(`${family}-LICENSE.txt`, fonts));
}

await mkdir(new URL('assets/documents/', root), { recursive: true });
await copyFile(new URL('docs/Asen_Mayuranga_Wijesiri_Software_Engineer_CV.pdf', root), new URL('assets/documents/asen-mayuranga-cv.pdf', root));
const bundle = await stat(new URL('assets/avatar.bundle.js', root));
console.log(`Assets ready: ${(bundle.size / 1024).toFixed(0)} KB character bundle, local fonts, and downloadable CV.`);

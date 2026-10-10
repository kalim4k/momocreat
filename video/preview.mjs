/**
 * Apercu rapide : rend quelques images fixes d'une scene, sans encoder de video.
 *
 *   node preview.mjs <dossier> <Composition> <image> [image ...] [--theme=dark]
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { enableTailwind } from '@remotion/tailwind-v4';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const theme = args.find((a) => a.startsWith('--theme='))?.slice(8);
const [outDir, id, ...frames] = args.filter((a) => !a.startsWith('--'));
fs.mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({
  entryPoint: path.join(here, 'src', 'index.ts'),
  publicDir: path.join(here, '..', 'public'),
  webpackOverride: (c) => enableTailwind(c),
});
const inputProps = theme ? { theme } : {};
const composition = await selectComposition({ serveUrl, id, inputProps });
for (const f of frames) {
  const output = path.join(outDir, `${id}${theme ? '-' + theme : ''}-${String(f).padStart(4, '0')}.png`);
  await renderStill({ composition, serveUrl, frame: Number(f), output, inputProps });
  console.log(output);
}

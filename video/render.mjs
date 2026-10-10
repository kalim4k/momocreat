/**
 * Rend les scenes de la landing dans ../public/videos.
 *
 * Pour chaque scene : un .webm (VP9, le plus leger, lu par Chrome / Firefox / Android) et un
 * .mp4 (H.264, pour Safari et iOS), plus un .jpg d'apercu affiche avant la lecture et a la
 * place de la video quand le visiteur a demande moins d'animations.
 *
 *   npm run render            -> toutes les scenes
 *   npm run render -- StepEarn -> une seule
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { ensureBrowser, renderMedia, renderStill, selectComposition } from '@remotion/renderer';

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(here, '..', 'public');
const outDir = path.join(publicDir, 'videos');
fs.mkdirSync(outDir, { recursive: true });

// `poster` : l'image la plus parlante de la scene. La landing demarre aussi la lecture a cette
// image, pour que l'apercu et le debut de la video soient la meme image.
const JOBS = [
  { id: 'HeroPayment', name: 'hero-paiement', themes: [null], poster: 0 },
  { id: 'StepUpload', name: 'etape-fichier', themes: ['light', 'dark'], poster: 150 },
  { id: 'StepShare', name: 'etape-lien', themes: ['light', 'dark'], poster: 140 },
  { id: 'StepEarn', name: 'etape-retrait', themes: ['light', 'dark'], poster: 96 },
];

const only = process.argv.slice(2);
const jobs = only.length ? JOBS.filter((j) => only.includes(j.id)) : JOBS;

await ensureBrowser();
console.log('Bundling…');
const serveUrl = await bundle({ entryPoint: path.join(here, 'src', 'index.ts'), publicDir });

for (const job of jobs) {
  for (const theme of job.themes) {
    const inputProps = theme ? { theme } : {};
    const base = theme ? `${job.name}-${theme}` : job.name;
    const composition = await selectComposition({ serveUrl, id: job.id, inputProps });

    for (const [codec, ext, quality] of [['vp9', 'webm', { crf: 36 }], ['h264', 'mp4', { crf: 24, x264Preset: 'slow' }]]) {
      const outputLocation = path.join(outDir, `${base}.${ext}`);
      // bt709 : l'espace couleur que les navigateurs supposent a la lecture. Sans lui, le fond
      // prune du theme sombre ressortait presque noir.
      await renderMedia({ composition, serveUrl, codec, inputProps, outputLocation, muted: true, pixelFormat: 'yuv420p', colorSpace: 'bt709', ...quality });
      console.log(`${base}.${ext}`, Math.round(fs.statSync(outputLocation).size / 1024), 'Ko');
    }

    const poster = path.join(outDir, `${base}.jpg`);
    await renderStill({ composition, serveUrl, frame: job.poster, output: poster, imageFormat: 'jpeg', jpegQuality: 82, inputProps });
    console.log(`${base}.jpg`, Math.round(fs.statSync(poster).size / 1024), 'Ko');
  }
}

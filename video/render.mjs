/**
 * Rend les scenes de la landing dans ../public/videos.
 *
 * Pour chaque scene : un .webm (VP9, le plus leger, lu par Chrome / Firefox / Android) et un
 * .mp4 (H.264, pour Safari et iOS), plus un .jpg d'apercu affiche avant la lecture et a la
 * place de la video quand le visiteur a demande moins d'animations.
 *
 *   npm run render                 -> toutes les scenes
 *   npm run render -- StepPublish  -> une seule
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { ensureBrowser, renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { enableTailwind } from '@remotion/tailwind-v4';

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(here, '..', 'public');
const outDir = path.join(publicDir, 'videos');
fs.mkdirSync(outDir, { recursive: true });

// `poster` : l'image la plus parlante de la scene. La landing demarre aussi la lecture a cette
// image (startAt = poster / 30), pour que l'apercu et le debut de la video soient la meme image.
// La boutique publique n'a pas de theme sombre dans l'application : les scenes du telephone
// n'existent qu'en clair.
const JOBS = [
  { id: 'DashboardTour', name: 'tableau-de-bord', themes: ['light', 'dark'], poster: 0 },
  { id: 'FanPurchase', name: 'fan-achat', themes: [null], poster: 192 },
  { id: 'FanDonation', name: 'fan-don', themes: [null], poster: 160 },
  { id: 'StepPublish', name: 'etape-publier', themes: ['light', 'dark'], poster: 138 },
  { id: 'StepShare', name: 'etape-partager', themes: ['light', 'dark'], poster: 50 },
  { id: 'StepWithdraw', name: 'etape-retirer', themes: ['light', 'dark'], poster: 190 },
];

const only = process.argv.slice(2);
const jobs = only.length ? JOBS.filter((j) => only.includes(j.id)) : JOBS;

await ensureBrowser();
console.log('Bundling…');
// Tailwind : les scenes utilisent la feuille de style de l'application (voir src/styles.css)
const serveUrl = await bundle({ entryPoint: path.join(here, 'src', 'index.ts'), publicDir, webpackOverride: (c) => enableTailwind(c) });

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

/**
 * Etape 1 « Deposez votre fichier » : onglet « Mon contenu », en gros plan. Le curseur ouvre
 * le formulaire, tape le titre et le prix, depose le PDF et publie ; la carte arrive en tete
 * de la grille avec son badge « Publie » et la pluie de confettis de l'application.
 */
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FileText } from 'lucide-react';
import { DashboardFrame, DESK_H, DESK_W } from '../app/DashboardFrame';
import { ContentCard, ContentForm, ContentHeader, type FormState } from '../app/ContentView';
import { CONTENTS, PACK } from '../app/data';
import { AppTheme, Camera, Confetti, Cursor, pointAt, type CursorKey, type Shot } from '../app/kit';
import { EASE_OUT, Stage, progress, typed } from '../motion';
import type { ThemeName } from '../theme';

/** Les deux autres etapes durent 8 s ; celle-ci 9 s, le temps que les confettis traversent le cadre. */
export const STEP_DURATION = 240;
export const PUBLISH_DURATION = 270;
const STAGE_W = 640;

const T = {
  add: 20,
  title: 40,
  price: 78,
  grab: 100,
  drop: 135,
  publish: 166,
  collapse: 190,
  loop: 252,
};

const FORM_H = 440;
const FILE = { name: 'booster-tiktok-30-jours.pdf', size: '2.40 MB' };

const SHOTS: Shot[] = [
  { at: 0, x: 744, y: 64, w: 520 },
  { at: 40, from: 24, x: 300, y: 222, w: 500 },
  { at: 106, from: 88, x: 736, y: 214, w: 520 },
  { at: 160, from: 140, x: 790, y: 410, w: 470 },
  { at: 206, from: 190, x: 284, y: 140, w: 500 },
];

const CURSOR: CursorKey[] = [
  { at: 0, x: 1010, y: 300 },
  { at: 6, x: 1010, y: 300 },
  { at: T.add, x: 1160, y: 128, click: true },
  { at: T.title, x: 600, y: 296, click: true },
  { at: T.price, x: 650, y: 486, click: true },
  { at: T.grab, x: 1236, y: 470 },
  { at: T.grab + 6, x: 1236, y: 470 },
  { at: T.drop, x: 1000, y: 352 },
  { at: T.publish, x: 1136, y: 578, click: true },
  { at: 208, x: 712, y: 424 },
  { at: 236, x: 712, y: 424 },
  { at: 266, x: 1010, y: 300 },
];

function Scene({ frame, theme }: { frame: number; theme: ThemeName }) {
  const open = frame < T.add + 2 ? 0 : frame < T.collapse ? progress(frame, T.add + 2, T.add + 11, EASE_OUT) : 1 - progress(frame, T.collapse, T.collapse + 9, EASE_OUT);
  const published = frame >= T.collapse + 4;

  const form: FormState = {
    title: typed(PACK.title, frame, T.title + 3, T.title + 30),
    description: '',
    price: typed('2500', frame, T.price + 3, T.price + 12),
    focus: frame >= T.publish ? null : frame >= T.price ? 'price' : frame >= T.title ? 'title' : null,
    dragActive: frame >= T.drop - 10 && frame < T.drop,
    file: frame >= T.drop ? FILE : null,
    publishing: frame >= T.publish + 2,
    publishPressed: frame >= T.publish && frame < T.publish + 6,
  };

  const newCard = progress(frame, T.collapse + 4, T.collapse + 14);
  const list = published ? [{ ...PACK, date: '10 oct. 2026' }, ...CONTENTS.slice(1)] : CONTENTS.slice(1);

  return (
    <AppTheme theme={theme}>
      <DashboardFrame active="content">
        <div className="flex flex-col gap-6">
          <ContentHeader count={list.length} formOpen={open > 0} />
          {open > 0 && (
            <div style={{ height: FORM_H * open, opacity: open, overflow: 'hidden', marginBottom: -24 * (1 - open) }}>
              <ContentForm form={form} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-5">
            {list.map((c, i) => (
              <ContentCard
                key={c.id}
                content={c}
                style={published && i === 0 ? { opacity: newCard, transform: `translateY(${(1 - newCard) * 10}px) scale(${0.97 + 0.03 * newCard})` } : undefined}
              />
            ))}
          </div>
        </div>
      </DashboardFrame>
    </AppTheme>
  );
}

/** Le fichier qu'on fait glisser jusqu'a la zone de depot. */
function DraggedFile({ frame }: { frame: number }) {
  if (frame < T.grab || frame >= T.drop) return null;
  const { x, y } = pointAt(CURSOR, frame);
  return (
    <div
      className="absolute flex items-center gap-2 rounded-xl border border-border-custom bg-bg-surface px-3 py-2 shadow-xl text-xs font-semibold text-text-primary"
      style={{ left: x + 10, top: y + 8, zIndex: 150, opacity: progress(frame, T.grab, T.grab + 5), transform: 'rotate(-3deg)' }}
    >
      <FileText size={16} className="text-emerald-400" />
      {FILE.name}
    </div>
  );
}

export function StepPublish({ theme }: { theme: ThemeName }) {
  const frame = useCurrentFrame();
  const back = progress(frame, T.loop, PUBLISH_DURATION - 2);
  return (
    <AbsoluteFill className={theme === 'dark' ? 'dark' : ''} style={{ background: 'var(--color-bg-primary)' }}>
      <Stage width={STAGE_W} height={STAGE_W / 1.6}>
        <Camera shots={SHOTS} width={STAGE_W}>
          <div className="relative" style={{ width: DESK_W, height: DESK_H }}>
            <Scene frame={frame} theme={theme} />
            <DraggedFile frame={frame} />
            <Confetti at={T.collapse + 2} height={DESK_H} />
          </div>
        </Camera>
        {/* Retour a la premiere image pour la boucle */}
        {back > 0 && (
          <div className="absolute inset-0" style={{ opacity: back }}>
            <Camera shots={SHOTS.slice(0, 1)} width={STAGE_W}>
              <div style={{ width: DESK_W, height: DESK_H }}>
                <Scene frame={0} theme={theme} />
              </div>
            </Camera>
          </div>
        )}
        <Camera shots={SHOTS} width={STAGE_W}>
          <Cursor keys={CURSOR} />
        </Camera>
      </Stage>
    </AbsoluteFill>
  );
}

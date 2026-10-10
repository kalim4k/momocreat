/**
 * Etape 2 « Collez le lien en bio » : le createur copie le lien de sa boutique depuis
 * l'en-tete du tableau de bord, puis on voit la page que ses fans ouvrent depuis la bio :
 * la boutique publique, telle qu'elle s'affiche sur un telephone.
 */
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CheckCircle2 } from 'lucide-react';
import { COPY_BUTTON, DashboardFrame, DESK_H, DESK_W } from '../app/DashboardFrame';
import { HomeView } from '../app/HomeView';
import { BrowserTop, PHONE_W, PublicProfile } from '../app/FanViews';
import { TOTALS } from '../app/data';
import { AppTheme, Camera, Cursor, type CursorKey, type Shot } from '../app/kit';
import { Stage, progress } from '../motion';
import type { ThemeName } from '../theme';
import { STEP_DURATION } from './StepPublish';

const STAGE_W = 640;

const T = { copy: 30, swap: 64, loop: 222 };

const DESK_SHOT: Shot[] = [{ at: 0, x: 860, y: 0, w: 420 }];

/** La page publique, cadree sur une largeur de 420 px (le telephone en fait 390). */
const PHONE_SHOTS: Shot[] = [
  { at: 0, x: -15, y: 0, w: 420 },
  { at: 92, x: -15, y: 0, w: 420 },
  { at: 132, from: 106, x: -15, y: 300, w: 420 },
  { at: 186, from: 158, x: -15, y: 792, w: 420 },
];

const CURSOR: CursorKey[] = [
  { at: 0, x: 1040, y: 190 },
  { at: 10, x: 1040, y: 190 },
  { at: T.copy, x: COPY_BUTTON.x, y: COPY_BUTTON.y, click: true },
  { at: 60, x: 1150, y: 120 },
];

function Desk({ theme, copied }: { theme: ThemeName; copied: boolean }) {
  return (
    <AppTheme theme={theme}>
      <DashboardFrame active="home" copied={copied}>
        <HomeView revenue={TOTALS.revenue30d} donations={0} earnings={TOTALS.earnings} published={TOTALS.published} chartExtra={0} activity={[]} />
      </DashboardFrame>
    </AppTheme>
  );
}

function CopiedChip({ frame }: { frame: number }) {
  const t = progress(frame, T.copy + 2, T.copy + 12);
  if (t <= 0) return null;
  return (
    <div
      className="absolute flex items-center gap-1.5 rounded-full border border-border-custom bg-bg-surface px-3 py-1.5 text-[11px] font-semibold text-text-primary shadow-lg"
      style={{ left: COPY_BUTTON.x - 110, top: COPY_BUTTON.y + 30, opacity: t, transform: `translateY(${(1 - t) * -6}px)`, zIndex: 120 }}
    >
      <CheckCircle2 size={13} className="text-emerald-500" />
      Lien de la boutique copié
    </div>
  );
}

export function StepShare({ theme }: { theme: ThemeName }) {
  const frame = useCurrentFrame();
  const swap = progress(frame, T.swap, T.swap + 16);
  const back = progress(frame, T.loop, STEP_DURATION - 2);

  return (
    <AbsoluteFill className={theme === 'dark' ? 'dark' : ''} style={{ background: 'var(--color-bg-primary)' }}>
      <Stage width={STAGE_W} height={STAGE_W / 1.6}>
        {/* Tableau de bord : copie du lien */}
        <div className="absolute inset-0" style={{ opacity: 1 - swap, transform: `scale(${1 + swap * 0.04})` }}>
          <Camera shots={DESK_SHOT} width={STAGE_W}>
            <div className="relative" style={{ width: DESK_W, height: DESK_H }}>
              <Desk theme={theme} copied={frame >= T.copy + 1} />
              <CopiedChip frame={frame} />
              <Cursor keys={CURSOR} />
            </div>
          </Camera>
        </div>

        {/* La boutique ouverte depuis la bio */}
        {swap > 0 && (
          <div className="absolute inset-0 bg-[#FAF8FC]" style={{ opacity: swap * (1 - back), transform: `scale(${0.97 + 0.03 * swap})` }}>
            <PhoneCamera />
          </div>
        )}

        {/* Retour a la premiere image pour la boucle */}
        {back > 0 && (
          <div className="absolute inset-0" style={{ opacity: back }}>
            <Camera shots={DESK_SHOT} width={STAGE_W}>
              <div className="relative" style={{ width: DESK_W, height: DESK_H }}>
                <Desk theme={theme} copied={false} />
              </div>
            </Camera>
          </div>
        )}
      </Stage>
    </AbsoluteFill>
  );
}

function PhoneCamera() {
  return (
    <AppTheme theme="light">
      <Camera shots={PHONE_SHOTS} width={STAGE_W}>
        <div className="relative bg-[#FAF8FC]" style={{ width: PHONE_W }}>
          <BrowserTop />
          <PublicProfile />
        </div>
      </Camera>
    </AppTheme>
  );
}

/**
 * Etape 3 « Retirez sur votre numero » : onglet « Retraits », en gros plan. Le curseur
 * demande un retrait, saisit le montant, confirme ; la demande apparait « En attente » dans
 * l'historique avec le bandeau de confirmation de l'application.
 */
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { DashboardFrame, DESK_H, DESK_W } from '../app/DashboardFrame';
import { WithdrawModal, WithdrawalsView, type WithdrawalRow } from '../app/MoneyViews';
import { NEW_DONATION, NEW_SALE, TOTALS, WITHDRAWALS } from '../app/data';
import { AppTheme, Camera, Cursor, type CursorKey, type Shot } from '../app/kit';
import { Stage, progress, typed } from '../motion';
import type { ThemeName } from '../theme';
import { STEP_DURATION } from './StepPublish';

const STAGE_W = 640;

const T = { ask: 36, amount: 66, confirm: 112, closed: 134, loop: 222 };

const BALANCE = TOTALS.balance + NEW_SALE.net + NEW_DONATION.net;
const REQUESTED = 15000;

const SHOTS: Shot[] = [
  { at: 0, x: 285, y: 196, w: 400 },
  { at: 60, from: 42, x: 420, y: 290, w: 450 },
  { at: 104, from: 88, x: 500, y: 372, w: 420 },
  { at: 156, from: 136, x: 690, y: 150, w: 560 },
];

const CURSOR: CursorKey[] = [
  { at: 0, x: 600, y: 330 },
  { at: 18, x: 600, y: 330 },
  { at: T.ask, x: 483, y: 443, click: true },
  { at: T.amount, x: 660, y: 386, click: true },
  { at: T.confirm, x: 756, y: 582, click: true },
  { at: 170, x: 1000, y: 470 },
  { at: 236, x: 600, y: 330 },
];

function Scene({ frame, theme, fps }: { frame: number; theme: ThemeName; fps: number }) {
  const open =
    frame < T.ask + 4
      ? 0
      : frame < T.confirm + 12
        ? spring({ frame: frame - (T.ask + 4), fps, config: { damping: 200 }, durationInFrames: 12 })
        : 1 - progress(frame, T.confirm + 12, T.closed);
  const balance = frame < T.closed ? BALANCE : interpolate(progress(frame, T.closed, T.closed + 28), [0, 1], [BALANCE, BALANCE - REQUESTED]);
  const rows: WithdrawalRow[] = [
    ...(frame >= T.closed + 2 ? [{ amount: REQUESTED, date: '10 oct. 2026, 18:42', status: 'pending' as const, enter: progress(frame, T.closed + 2, T.closed + 18) }] : []),
    ...WITHDRAWALS,
  ];
  return (
    <AppTheme theme={theme}>
      <DashboardFrame
        active="withdrawals"
        overlay={
          <WithdrawModal
            open={open}
            balance={BALANCE}
            amount={typed(String(REQUESTED), frame, T.amount + 4, T.amount + 20)}
            focused={frame >= T.amount}
            confirmPressed={frame >= T.confirm && frame < T.confirm + 6}
            submitting={frame >= T.confirm + 2}
          />
        }
      >
        <WithdrawalsView balance={balance} rows={rows} success={progress(frame, T.closed, T.closed + 14)} pressed={frame >= T.ask && frame < T.ask + 6} />
      </DashboardFrame>
    </AppTheme>
  );
}

export function StepWithdraw({ theme }: { theme: ThemeName }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const back = progress(frame, T.loop, STEP_DURATION - 2);
  return (
    <AbsoluteFill className={theme === 'dark' ? 'dark' : ''} style={{ background: 'var(--color-bg-primary)' }}>
      <Stage width={STAGE_W} height={STAGE_W / 1.6}>
        <Camera shots={SHOTS} width={STAGE_W}>
          <div className="relative" style={{ width: DESK_W, height: DESK_H }}>
            <Scene frame={frame} theme={theme} fps={fps} />
          </div>
        </Camera>
        {back > 0 && (
          <div className="absolute inset-0" style={{ opacity: back }}>
            <Camera shots={SHOTS.slice(0, 1)} width={STAGE_W}>
              <div className="relative" style={{ width: DESK_W, height: DESK_H }}>
                <Scene frame={0} theme={theme} fps={fps} />
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

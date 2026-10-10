/**
 * Etape 3 — les ventes tombent une a une, le solde monte, le retrait part sur Wave.
 * Repere 360 × 225, rendu en 720 × 450.
 */
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Check } from 'lucide-react';
import { PALETTE, fontBody, fontDisplay, type ThemeName } from '../theme';
import { EASE_OUT, Stage, TapRipple, progress, usePopSpring, useUiSpring } from '../motion';

const SALES = [
  { at: 12, amount: 2250, op: 'Wave', logo: 'payment-icons/wave.png' },
  { at: 32, amount: 4500, op: 'Orange', logo: 'payment-icons/orange-money.png' },
  { at: 52, amount: 1350, op: 'MTN', logo: 'payment-icons/mtn-money.jpg' },
  { at: 72, amount: 9000, op: 'Moov', logo: 'payment-icons/moov-money.png' },
];
const ROW = 40;

const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR').replace(/ | /g, ' ');

function Sale({ index, theme }: { index: number; theme: ThemeName }) {
  const P = PALETTE[theme];
  const s = SALES[index];
  const appear = useUiSpring(s.at, 16);
  // Les ventes suivantes poussent celle-ci vers le bas, comme une pile de notifications
  const frame = useCurrentFrame();
  const pushed = SALES.slice(index + 1).reduce((acc, next) => acc + progress(frame, next.at, next.at + 14), 0);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: pushed * ROW,
        height: 34,
        borderRadius: 12,
        background: P.surface,
        border: `1px solid ${P.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 9px',
        opacity: appear,
        transform: `translateX(${interpolate(appear, [0, 1], [30, 0])}px)`,
      }}
    >
      <Img src={staticFile(s.logo)} style={{ width: 20, height: 20, borderRadius: 6, objectFit: 'contain', background: '#FFFFFF' }} />
      <div style={{ flex: 1, minWidth: 0, fontSize: 10.5, fontWeight: 600, color: P.text, whiteSpace: 'nowrap', overflow: 'hidden' }}>{s.op}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: P.success, fontVariantNumeric: 'tabular-nums' }}>+{fmt(s.amount)}</div>
    </div>
  );
}

export function StepEarn({ theme }: { theme: ThemeName }) {
  const P = PALETTE[theme];
  const frame = useCurrentFrame();

  const balance = SALES.reduce((acc, s) => acc + s.amount * progress(frame, s.at + 2, s.at + 14, EASE_OUT), 0);
  const press = frame >= 104 && frame < 112 ? 0.95 : 1;
  const sent = usePopSpring(112);
  const reset = progress(frame, 164, 179);
  const total = SALES.reduce((a, s) => a + s.amount, 0);

  return (
    <AbsoluteFill style={{ background: P.bg, fontFamily: fontBody }}>
      <Stage width={360} height={225}>
        <div style={{ position: 'absolute', inset: 0, opacity: 1 - reset }}>
          {/* Solde */}
          <div style={{ position: 'absolute', left: 18, top: 24, width: 160, height: 177, borderRadius: 20, background: P.surface, border: `1px solid ${P.border}`, padding: 14 }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: P.muted }}>Solde disponible</div>
            <div style={{ marginTop: 6, fontFamily: fontDisplay, fontWeight: 600, fontSize: 26, letterSpacing: -0.6, color: P.text, fontVariantNumeric: 'tabular-nums' }}>
              {fmt(frame < 112 ? balance : interpolate(sent, [0, 1], [total, 0], { extrapolateRight: 'clamp' }))}
              <span style={{ marginLeft: 4, fontSize: 12, fontWeight: 600, color: P.muted }}>FCFA</span>
            </div>

            {/* Petites barres : une par vente */}
            <div style={{ marginTop: 10, height: 34, display: 'flex', alignItems: 'flex-end', gap: 5 }}>
              {SALES.map((s) => {
                const h = progress(frame, s.at, s.at + 14);
                return <div key={s.at} style={{ flex: 1, height: 6 + 28 * h * (s.amount / 9000), borderRadius: 4, background: h > 0 ? P.primary : P.surface2, opacity: 0.35 + 0.65 * h }} />;
              })}
            </div>

            <div style={{ position: 'absolute', left: 14, right: 14, bottom: 14, height: 36, borderRadius: 12, background: frame < 112 ? P.primary : P.successSoft, color: frame < 112 ? '#FFFFFF' : P.success, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, fontWeight: 600, transform: `scale(${press})` }}>
              {frame < 112 ? (
                'Retirer sur Wave'
              ) : (
                <>
                  <Check size={13} strokeWidth={3} style={{ transform: `scale(${sent})` }} /> Retrait envoyé
                </>
              )}
            </div>
            <TapRipple at={104} x={80} y={159} color="#FFFFFF" />
          </div>

          {/* Notifications de vente */}
          <div style={{ position: 'absolute', left: 190, top: 24, width: 152, height: 160 }}>
            {SALES.map((_, i) => (
              <Sale key={i} index={i} theme={theme} />
            ))}
          </div>
          <div style={{ position: 'absolute', left: 190, top: 186, width: 152, fontSize: 10, color: P.muted, textAlign: 'center', opacity: progress(frame, 116, 128) }}>
            Reçu sous 24 h
          </div>
        </div>
      </Stage>
    </AbsoluteFill>
  );
}

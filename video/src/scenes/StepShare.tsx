/**
 * Etape 2 — le lien de la boutique se copie et atterrit dans la bio TikTok, Instagram,
 * WhatsApp. Repere 360 × 225, rendu en 720 × 450.
 */
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Check, Copy, Instagram, MessageCircle, Music2 } from 'lucide-react';
import { PALETTE, fontBody, fontDisplay, type ThemeName } from '../theme';
import { Stage, TapRipple, progress, typed, usePopSpring } from '../motion';

const LINK = 'momolink.app/@awa';

const PLATFORMS = [
  { label: 'TikTok', icon: Music2, at: 74 },
  { label: 'Instagram', icon: Instagram, at: 92 },
  { label: 'WhatsApp', icon: MessageCircle, at: 110 },
];

function PlatformRow({ label, Icon, at, theme }: { label: string; Icon: typeof Music2; at: number; theme: ThemeName }) {
  const P = PALETTE[theme];
  const frame = useCurrentFrame();
  const on = progress(frame, at, at + 10);
  const pop = usePopSpring(at + 4);
  return (
    <div style={{ height: 44, borderRadius: 14, border: `1px solid ${on > 0.5 ? P.primary : P.border}`, background: on > 0 ? (theme === 'light' ? `rgba(109,40,217,${0.07 * on})` : `rgba(139,92,246,${0.14 * on})`) : P.surface, display: 'flex', alignItems: 'center', gap: 8, padding: '0 9px 0 11px' }}>
      <Icon size={15} color={P.text} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0, fontSize: 11.5, fontWeight: 600, color: P.text, whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ width: 18, height: 18, borderRadius: 999, background: P.primary, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop})`, opacity: Math.min(1, pop * 1.5) }}>
        <Check size={11} strokeWidth={3} />
      </div>
    </div>
  );
}

export function StepShare({ theme }: { theme: ThemeName }) {
  const P = PALETTE[theme];
  const frame = useCurrentFrame();

  const link = typed(LINK, frame, 12, 48);
  const typing = frame >= 8 && frame < 54;
  const caret = typing && Math.floor(frame / 7) % 2 === 0;
  const copied = usePopSpring(58);
  const copiedFade = 1 - progress(frame, 120, 132);
  const reset = progress(frame, 164, 179);

  return (
    <AbsoluteFill style={{ background: P.bg, fontFamily: fontBody }}>
      <Stage width={360} height={225}>
        <div style={{ position: 'absolute', inset: 0, opacity: 1 - reset }}>
          {/* Profil */}
          <div style={{ position: 'absolute', left: 16, top: 24, width: 186, height: 177, borderRadius: 20, background: P.surface, border: `1px solid ${P.border}`, padding: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: P.mango, color: P.mangoInk, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fontDisplay, fontWeight: 700, fontSize: 16 }}>AN</div>
            <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: P.text }}>@awa.creatrice</div>
            <div style={{ fontSize: 10.5, color: P.muted }}>Coach contenu · Dakar</div>

            <div style={{ position: 'absolute', left: 14, right: 14, bottom: 14, height: 38, borderRadius: 12, background: P.surface2, display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px 0 10px' }}>
              <span style={{ flex: 1, minWidth: 0, fontSize: 11, fontWeight: 600, color: P.primary, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {link}
                <span style={{ display: 'inline-block', width: 1.5, height: 12, marginLeft: 1, verticalAlign: -2, background: caret ? P.primary : 'transparent' }} />
              </span>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: P.surface, color: P.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Copy size={12} />
              </div>
            </div>
            <TapRipple at={56} x={160} y={158} color={P.primary} />
          </div>

          {/* "Lien copie" */}
          <div style={{ position: 'absolute', left: 62, top: 132, padding: '5px 10px', borderRadius: 999, background: P.text, color: P.bg, fontSize: 10.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, opacity: Math.min(1, copied * 1.4) * copiedFade, transform: `translateY(${interpolate(copied, [0, 1], [8, 0])}px) scale(${0.9 + 0.1 * copied})` }}>
            <Check size={11} strokeWidth={3} /> Lien copié
          </div>

          {/* Le lien atterrit dans chaque bio */}
          <div style={{ position: 'absolute', left: 214, top: 24, width: 130, display: 'flex', flexDirection: 'column', gap: 9 }}>
            {PLATFORMS.map((p) => (
              <PlatformRow key={p.label} label={p.label} Icon={p.icon} at={p.at} theme={theme} />
            ))}
            <div style={{ marginTop: 2, fontSize: 10, color: P.muted, textAlign: 'center' }}>Un seul lien, partout</div>
          </div>
        </div>
      </Stage>
    </AbsoluteFill>
  );
}

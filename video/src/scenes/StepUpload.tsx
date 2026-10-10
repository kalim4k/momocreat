/**
 * Etape 1 — le createur depose son fichier, fixe le prix, le contenu passe "Publie".
 * Repere 360 × 225, rendu en 720 × 450. Boucle : la carte s'efface et la zone de depot
 * revient, identique a la premiere image.
 */
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FileText, UploadCloud } from 'lucide-react';
import { PALETTE, fontBody, fontDisplay, type ThemeName } from '../theme';
import { Stage, progress, typed, usePopSpring, useUiSpring } from '../motion';

export const STEP_DURATION = 180;

export function StepUpload({ theme }: { theme: ThemeName }) {
  const P = PALETTE[theme];
  const frame = useCurrentFrame();

  const drop = useUiSpring(10, 20);
  const upload = progress(frame, 38, 84);
  const toCard = progress(frame, 88, 102);
  const price = typed('2 500', frame, 110, 128);
  const badge = usePopSpring(136);
  const reset = progress(frame, 164, 179);

  const zone = Math.max(1 - toCard, reset);
  const chip = (1 - toCard) * drop;
  const card = toCard * (1 - reset);

  return (
    <AbsoluteFill style={{ background: P.bg, fontFamily: fontBody }}>
      <Stage width={360} height={225}>
        {/* Zone de depot */}
        <div style={{ position: 'absolute', left: 34, top: 26, width: 292, height: 173, borderRadius: 20, border: `1.5px dashed ${P.border}`, background: P.surface, opacity: zone, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 600, color: P.muted }}>
            <UploadCloud size={14} />
            Glissez votre fichier ici
          </div>
        </div>

        {/* Fichier qui tombe dans la zone, puis s'envoie */}
        <div
          style={{
            position: 'absolute',
            left: 82,
            top: 56,
            width: 196,
            padding: 12,
            borderRadius: 16,
            background: P.surface,
            border: `1px solid ${P.border}`,
            boxShadow: '0 14px 30px -18px rgba(29,19,39,0.45)',
            opacity: chip,
            transform: `translateY(${interpolate(drop, [0, 1], [-70, 0])}px) rotate(${interpolate(drop, [0, 1], [-6, 0])}deg)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: P.primarySoft, color: P.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={17} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: P.text }}>guide-tiktok.pdf</div>
              <div style={{ fontSize: 10, color: P.muted }}>8,4 Mo · {Math.round(upload * 100)} %</div>
            </div>
          </div>
          <div style={{ marginTop: 10, height: 5, borderRadius: 3, background: P.surface2, overflow: 'hidden' }}>
            <div style={{ width: `${upload * 100}%`, height: '100%', borderRadius: 3, background: P.primary }} />
          </div>
        </div>

        {/* Le fichier devient un contenu en vente */}
        <div
          style={{
            position: 'absolute',
            left: 34,
            top: 26,
            width: 292,
            height: 173,
            borderRadius: 20,
            background: P.surface,
            border: `1px solid ${P.border}`,
            padding: 18,
            opacity: card,
            transform: `scale(${0.96 + 0.04 * card})`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: P.primarySoft, color: P.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} />
            </div>
            <div>
              <div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 15, color: P.text }}>Booster son audience TikTok</div>
              <div style={{ fontSize: 11, color: P.muted }}>PDF · 42 pages</div>
            </div>
          </div>

          <div style={{ marginTop: 18, fontSize: 10.5, fontWeight: 600, color: P.muted }}>Prix</div>
          <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ height: 38, minWidth: 150, borderRadius: 11, border: `1.5px solid ${frame < 134 ? P.primary : P.border}`, display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 15, fontWeight: 600, color: P.text, letterSpacing: 0.2 }}>
              {price}
              <span style={{ marginLeft: 5, color: P.muted, fontWeight: 500 }}>FCFA</span>
            </div>
            <div style={{ padding: '6px 12px', borderRadius: 999, background: P.mango, color: P.mangoInk, fontSize: 11.5, fontWeight: 700, opacity: Math.min(1, badge * 1.4), transform: `scale(${badge})` }}>
              Publié
            </div>
          </div>
        </div>
      </Stage>
    </AbsoluteFill>
  );
}

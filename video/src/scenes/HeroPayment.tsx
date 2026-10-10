/**
 * Hero — ce que vit une fan qui ouvre le lien en bio : elle debloque un PDF et paie en Wave,
 * sans compte. Rendu a la taille d'un ecran de telephone ; le cadre de l'appareil est dessine
 * en CSS sur la landing, la video ne contient que l'ecran.
 *
 * Concu dans un repere 390 × 845 (points iPhone), rendu en 540 × 1170 par <Stage>.
 * La boucle se referme d'elle-meme : la feuille de paiement redescend et laisse la boutique
 * exactement comme a la premiere image.
 */
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Check, Download, FileText, Heart, Lock, Play, ShieldCheck } from 'lucide-react';
import { PALETTE, fontBody, fontDisplay } from '../theme';
import { EASE_IN_OUT, Stage, TapRipple, progress, typed, usePopSpring, useUiSpring } from '../motion';

const P = PALETTE.light;
export const HERO_DURATION = 330;

/** Images clefs (30 i/s). */
const T = {
  tapUnlock: 34,
  sheetIn: 42,
  tapWave: 80,
  typeFrom: 94,
  typeTo: 140,
  tapPay: 154,
  processing: 160,
  success: 214,
  sheetOut: 286,
};

const W = 390;
const H = 845;
const SHEET_H = 560;
const SHEET_TOP = H - SHEET_H;

const PHONE = '77 123 45 67';

const OPERATORS = [
  { id: 'wave', label: 'Wave', logo: 'payment-icons/wave.png' },
  { id: 'orange', label: 'Orange Money', logo: 'payment-icons/orange-money.png' },
  { id: 'mtn', label: 'MTN MoMo', logo: 'payment-icons/mtn-money.jpg' },
  { id: 'moov', label: 'Moov Money', logo: 'payment-icons/moov-money.png' },
];

function StatusBar() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', color: P.text, fontWeight: 600, fontSize: 15 }}>
      <span>9:41</span>
      <span style={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
        {[5, 8, 11, 14].map((h) => (
          <span key={h} style={{ width: 3.5, height: h, borderRadius: 2, background: P.text }} />
        ))}
        <span style={{ marginLeft: 6, width: 24, height: 12, borderRadius: 4, border: `1.5px solid ${P.text}`, padding: 1.5, display: 'flex' }}>
          <span style={{ flex: 1, borderRadius: 2, background: P.text }} />
        </span>
      </span>
    </div>
  );
}

function Store({ unlockScale }: { unlockScale: number }) {
  return (
    <>
      <StatusBar />

      {/* Banniere */}
      <div style={{ position: 'absolute', top: 52, left: 16, right: 16, height: 128, borderRadius: 26, overflow: 'hidden', background: `linear-gradient(135deg, ${P.primary} 0%, #8B5CF6 58%, #C084FC 100%)` }}>
        <div style={{ position: 'absolute', right: -30, top: -40, width: 170, height: 170, borderRadius: 999, background: P.mango, opacity: 0.55, filter: 'blur(28px)' }} />
        <div style={{ position: 'absolute', left: 40, bottom: -70, width: 160, height: 160, borderRadius: 999, background: '#FFFFFF', opacity: 0.16, filter: 'blur(20px)' }} />
      </div>

      {/* Avatar */}
      <div style={{ position: 'absolute', top: 138, left: 32, width: 78, height: 78, borderRadius: 26, background: P.mango, border: `4px solid ${P.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fontDisplay, fontWeight: 700, fontSize: 26, color: P.mangoInk }}>
        AN
      </div>

      <div style={{ position: 'absolute', top: 228, left: 22, right: 22 }}>
        <div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 23, letterSpacing: -0.4, color: P.text }}>Awa Ndiaye</div>
        <div style={{ marginTop: 2, fontSize: 13.5, color: P.muted }}>@awa.creatrice · Dakar</div>
        <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.45, color: P.muted }}>
          Coaching contenu et croissance organique. Mes méthodes en PDF et vidéo.
        </div>
      </div>

      <div style={{ position: 'absolute', top: 344, left: 22, fontSize: 11.5, fontWeight: 700, letterSpacing: 1.2, color: P.muted }}>CONTENUS</div>

      {/* Contenu verrouille */}
      <div style={{ position: 'absolute', top: 366, left: 16, right: 16, borderRadius: 22, background: P.surface, border: `1px solid ${P.border}`, padding: 14, boxShadow: '0 12px 30px -22px rgba(29,19,39,0.35)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: P.primarySoft, color: P.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={21} />
          </div>
          <div>
            <div style={{ fontSize: 15.5, fontWeight: 600, color: P.text }}>Booster son audience TikTok</div>
            <div style={{ marginTop: 2, fontSize: 12.5, color: P.muted }}>PDF · 42 pages</div>
          </div>
        </div>
        <div style={{ marginTop: 14, height: 48, borderRadius: 15, background: P.primary, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15, fontWeight: 600, transform: `scale(${unlockScale})` }}>
          <Lock size={16} strokeWidth={2.4} />
          Débloquer · 2 500 FCFA
        </div>
      </div>

      <div style={{ position: 'absolute', top: 514, left: 16, right: 16, borderRadius: 22, background: P.surface, border: `1px solid ${P.border}`, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: P.surface2, color: P.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Play size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15.5, fontWeight: 600, color: P.text }}>Masterclass TikTok</div>
          <div style={{ marginTop: 2, fontSize: 12.5, color: P.muted }}>Vidéo · 20 min</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: P.primary, background: P.primarySoft, padding: '7px 11px', borderRadius: 999 }}>5 000 FCFA</div>
      </div>

      <div style={{ position: 'absolute', top: 606, left: 16, right: 16, height: 48, borderRadius: 15, border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14.5, fontWeight: 600, color: P.text }}>
        <Heart size={16} color={P.mango} fill={P.mango} />
        Envoyer un pourboire
      </div>

      <div style={{ position: 'absolute', top: 690, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 12, color: P.muted }}>Paiement Mobile Money, sans compte</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {OPERATORS.map((op) => (
            <Img key={op.id} src={staticFile(op.logo)} style={{ width: 30, height: 30, borderRadius: 9, objectFit: 'contain', background: '#FFFFFF', border: `1px solid ${P.border}` }} />
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 9, left: '50%', width: 134, height: 5, marginLeft: -67, borderRadius: 3, background: P.text, opacity: 0.85 }} />
    </>
  );
}

function Spinner({ frame }: { frame: number }) {
  return (
    <svg width={76} height={76} viewBox="0 0 76 76" style={{ transform: `rotate(${frame * 9}deg)` }}>
      <circle cx={38} cy={38} r={31} fill="none" stroke={P.surface2} strokeWidth={6} />
      <circle cx={38} cy={38} r={31} fill="none" stroke={P.primary} strokeWidth={6} strokeLinecap="round" strokeDasharray="60 200" />
    </svg>
  );
}

function Sheet({ frame }: { frame: number }) {
  const waveOn = progress(frame, T.tapWave + 2, T.tapWave + 12);
  const number = typed(PHONE, frame, T.typeFrom, T.typeTo);
  const typing = frame >= T.typeFrom - 6 && frame < T.processing;
  const caretOn = typing && Math.floor(frame / 8) % 2 === 0;
  const payReady = progress(frame, T.typeTo, T.typeTo + 8);
  const payPress = frame >= T.tapPay && frame < T.tapPay + 8 ? 0.96 : 1;

  // Trois etats successifs, en fondu croise court
  const selectOut = progress(frame, T.processing, T.processing + 8);
  const processIn = progress(frame, T.processing + 4, T.processing + 14) * (1 - progress(frame, T.success, T.success + 8));
  const successIn = progress(frame, T.success + 4, T.success + 14);
  const check = usePopSpring(T.success + 6);
  const bar = progress(frame, T.processing, T.success, EASE_IN_OUT);

  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: SHEET_H, borderRadius: '30px 30px 0 0', background: P.surface, boxShadow: '0 -20px 50px -20px rgba(29,19,39,0.35)' }}>
      <div style={{ position: 'absolute', top: 10, left: '50%', width: 44, height: 5, marginLeft: -22, borderRadius: 3, background: P.border }} />

      {/* Choix de l'operateur et numero */}
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - selectOut, transform: `translateY(${-selectOut * 12}px)` }}>
        <div style={{ position: 'absolute', top: 34, left: 22, right: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: P.muted }}>
            <ShieldCheck size={14} color={P.success} /> Paiement sécurisé
          </div>
          <div style={{ marginTop: 6, fontFamily: fontDisplay, fontWeight: 600, fontSize: 32, letterSpacing: -0.8, color: P.text }}>2 500 FCFA</div>
          <div style={{ marginTop: 2, fontSize: 13.5, color: P.muted }}>Booster son audience TikTok · Awa Ndiaye</div>
        </div>

        <div style={{ position: 'absolute', top: 142, left: 22, fontSize: 12.5, fontWeight: 600, color: P.text }}>Payer avec</div>
        <div style={{ position: 'absolute', top: 164, left: 20, right: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {OPERATORS.map((op) => {
            const on = op.id === 'wave' ? waveOn : 0;
            return (
              <div
                key={op.id}
                style={{
                  position: 'relative',
                  height: 58,
                  borderRadius: 16,
                  border: `${1 + on}px solid ${on > 0.5 ? P.primary : P.border}`,
                  background: on > 0 ? `rgba(109,40,217,${0.08 * on})` : P.surface,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '0 12px',
                }}
              >
                <Img src={staticFile(op.logo)} style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'contain', background: '#FFFFFF', border: `1px solid ${P.border}` }} />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: P.text }}>{op.label}</span>
                {op.id === 'wave' && on > 0 && (
                  <span style={{ position: 'absolute', right: 10, top: 10, width: 18, height: 18, borderRadius: 999, background: P.primary, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${on})` }}>
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ position: 'absolute', top: 306, left: 22, fontSize: 12.5, fontWeight: 600, color: P.text }}>Numéro Wave</div>
        <div style={{ position: 'absolute', top: 328, left: 20, right: 20, height: 52, borderRadius: 15, border: `1.5px solid ${typing ? P.primary : P.border}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', fontSize: 16, color: P.text }}>
          <span style={{ fontWeight: 600, color: P.muted }}>+221</span>
          <span style={{ width: 1, height: 22, background: P.border }} />
          <span style={{ fontWeight: 500, letterSpacing: 0.4 }}>
            {number}
            <span style={{ display: 'inline-block', width: 2, height: 19, marginLeft: 1, verticalAlign: -3, background: caretOn ? P.primary : 'transparent' }} />
          </span>
        </div>

        <div style={{ position: 'absolute', top: 398, left: 20, right: 20, height: 54, borderRadius: 16, background: P.primary, opacity: 0.45 + 0.55 * payReady, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, transform: `scale(${payPress})` }}>
          Payer 2 500 FCFA
        </div>
        <div style={{ position: 'absolute', top: 466, left: 0, right: 0, textAlign: 'center', fontSize: 12, color: P.muted }}>Sans compte · reçu envoyé par email</div>
      </div>

      {/* Validation en cours */}
      <div style={{ position: 'absolute', inset: 0, opacity: processIn, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 92 }}>
        <Spinner frame={frame} />
        <div style={{ marginTop: 24, fontFamily: fontDisplay, fontWeight: 600, fontSize: 22, color: P.text }}>Validez sur votre téléphone</div>
        <div style={{ marginTop: 8, width: 290, textAlign: 'center', fontSize: 14, lineHeight: 1.5, color: P.muted }}>
          Une demande Wave a été envoyée au +221 {PHONE}.
        </div>
        <div style={{ marginTop: 26, width: 250, height: 6, borderRadius: 3, background: P.surface2, overflow: 'hidden' }}>
          <div style={{ width: `${bar * 100}%`, height: '100%', borderRadius: 3, background: P.primary }} />
        </div>
      </div>

      {/* Paiement reussi */}
      <div style={{ position: 'absolute', inset: 0, opacity: successIn, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80 }}>
        <div style={{ width: 92, height: 92, borderRadius: 999, background: P.successSoft, color: P.success, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.5 + 0.5 * check})` }}>
          <Check size={46} strokeWidth={3} />
        </div>
        <div style={{ marginTop: 22, fontFamily: fontDisplay, fontWeight: 600, fontSize: 26, letterSpacing: -0.5, color: P.text }}>Paiement réussi</div>
        <div style={{ marginTop: 6, fontSize: 14.5, color: P.muted }}>Votre PDF est débloqué.</div>
        <div style={{ marginTop: 30, width: 350, height: 54, borderRadius: 16, background: P.primary, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, fontSize: 16, fontWeight: 600 }}>
          <Download size={18} strokeWidth={2.4} />
          Télécharger le PDF
        </div>
        <div style={{ marginTop: 14, fontSize: 12.5, color: P.muted }}>Lien personnel, valable 1 heure</div>
      </div>
    </div>
  );
}

export function HeroPayment() {
  const frame = useCurrentFrame();
  const sheetIn = useUiSpring(T.sheetIn, 20);
  const sheetOut = progress(frame, T.sheetOut, T.sheetOut + 18, EASE_IN_OUT);
  const sheetT = sheetIn * (1 - sheetOut);
  const unlockScale = frame >= T.tapUnlock && frame < T.tapUnlock + 8 ? interpolate(frame, [T.tapUnlock, T.tapUnlock + 4, T.tapUnlock + 8], [1, 0.96, 1]) : 1;

  return (
    <AbsoluteFill style={{ background: P.bg, fontFamily: fontBody }}>
      <Stage width={W} height={H}>
        <Store unlockScale={unlockScale} />
        <TapRipple at={T.tapUnlock} x={195} y={465} color="#FFFFFF" />

        {/* Voile + feuille de paiement */}
        <div style={{ position: 'absolute', inset: 0, background: `rgba(29,19,39,${0.4 * sheetT})` }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: SHEET_TOP, height: SHEET_H, transform: `translateY(${(1 - sheetT) * (SHEET_H + 20)}px)` }}>
          <Sheet frame={frame} />
          <TapRipple at={T.tapWave} x={105} y={193} color={P.primary} />
          <TapRipple at={T.tapPay} x={195} y={425} color="#FFFFFF" />
        </div>
      </Stage>
    </AbsoluteFill>
  );
}

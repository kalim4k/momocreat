/**
 * Vocabulaire de mouvement partage par les scenes.
 *
 * Meme parti pris que la landing : des ressorts sans rebond pour l'interface, le rebond
 * reserve au moment ou quelque chose aboutit (paiement valide, contenu publie). Chaque
 * scene boucle : sa derniere image est identique a la premiere, pour que la video tourne en
 * continu sur la page sans saut visible.
 */
import type { CSSProperties, ReactNode } from 'react';
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

/** Courbe "sortie expo" : demarre vite, se pose en douceur. */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** 0 → 1 entre deux images, avec une courbe douce. */
export function progress(frame: number, from: number, to: number, easing = EASE_OUT) {
  return interpolate(frame, [from, to], [0, 1], { ...clamp, easing });
}

/** Ressort critique (pas de rebond) qui part a l'image `delay`. */
export function useUiSpring(delay: number, durationInFrames = 18) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, durationInFrames, config: { damping: 200 } });
}

/** Ressort avec un leger rebond, pour un aboutissement. */
export function usePopSpring(delay: number) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 11, stiffness: 160, mass: 0.7 } });
}

/** Texte qui se tape caractere par caractere entre `from` et `to`. */
export function typed(text: string, frame: number, from: number, to: number) {
  const n = Math.round(interpolate(frame, [from, to], [0, text.length], clamp));
  return text.slice(0, n);
}

/** Onde de toucher : un cercle qui s'agrandit et s'efface la ou le doigt appuie. */
export function TapRipple({ at, x, y, color }: { at: number; x: number; y: number; color: string }) {
  const frame = useCurrentFrame();
  const t = progress(frame, at, at + 16);
  if (frame < at || frame > at + 16) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 22,
        top: y - 22,
        width: 44,
        height: 44,
        borderRadius: 999,
        background: color,
        opacity: 0.35 * (1 - t),
        transform: `scale(${0.4 + t * 1.2})`,
        pointerEvents: 'none',
      }}
    />
  );
}

/**
 * Concoit une scene a une taille de reference (ex. 360 × 225) et la rend a la taille de la
 * video avec `zoom` plutot que `transform: scale` : Chrome remet alors le texte en page a la
 * taille finale au lieu d'agrandir une image deja rasterisee, et il reste net.
 */
export function Stage({ width, height, style, children }: { width: number; height: number; style?: CSSProperties; children: ReactNode }) {
  const { width: vw } = useVideoConfig();
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'relative', width, height, zoom: vw / width, ...style }}>{children}</div>
    </div>
  );
}

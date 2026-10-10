/**
 * Outils communs aux scenes de l'application : theme, montants, curseur, toucher.
 */
import { createContext, useContext, type ReactNode } from 'react';
import { interpolate, random, useCurrentFrame } from 'remotion';
import { EASE_IN_OUT, EASE_OUT, progress } from '../motion';
import type { ThemeName } from '../theme';

const DarkContext = createContext(false);

/** Equivalent de `isDarkMode` dans l'application. */
export const useDark = () => useContext(DarkContext);

/**
 * Racine d'un ecran de l'application : pose la classe `.dark` comme ThemeContext, ce qui
 * bascule les jetons de couleur de src/index.css.
 */
export function AppTheme({ theme, className = '', children }: { theme: ThemeName; className?: string; children: ReactNode }) {
  const dark = theme === 'dark';
  return (
    <DarkContext.Provider value={dark}>
      <div className={`${dark ? 'dark' : ''} h-full w-full`}>
        <div className={`h-full w-full bg-bg-primary text-text-primary font-sans ${className}`}>{children}</div>
      </div>
    </DarkContext.Provider>
  );
}

/** Montant au format de l'application (« 32 850 »), quel que soit la langue du navigateur de rendu. */
export const fcfa = (n: number) => Math.round(n).toLocaleString('fr-FR');

/** Valeur qui glisse de `from` a `to` entre deux images (compteur). */
export function useCount(from: number, to: number, start: number, end: number) {
  const frame = useCurrentFrame();
  return interpolate(frame, [start, end], [from, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_OUT });
}

/** Image a laquelle un compteur ou un etat bascule, pour les rendus conditionnels. */
export const useAfter = (at: number) => useCurrentFrame() >= at;

export interface CursorKey {
  /** Image a laquelle le curseur atteint ce point. */
  at: number;
  x: number;
  y: number;
  /** Clic a l'arrivee. */
  click?: boolean;
}

/** Position du curseur a une image donnee (pour accrocher un objet au pointeur). */
export function pointAt(keys: CursorKey[], frame: number) {
  if (frame <= keys[0].at) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (frame <= b.at) {
      // Un deplacement de souris dure ~16 images et part juste avant d'arriver, comme une main.
      const start = Math.max(a.at, b.at - 16);
      const t = progress(frame, start, b.at, EASE_IN_OUT);
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
  }
  return keys[keys.length - 1];
}

/** Pointeur de souris (bureau) : se deplace de point en point et clique. */
export function Cursor({ keys, color }: { keys: CursorKey[]; color?: string }) {
  const frame = useCurrentFrame();
  const { x, y } = pointAt(keys, frame);
  const click = keys.find((k) => k.click && frame >= k.at && frame < k.at + 14);
  const t = click ? (frame - click.at) / 14 : 1;
  const press = click ? (t < 0.3 ? 1 - t * 0.5 : 0.85 + (t - 0.3) * 0.21) : 1;
  return (
    <div style={{ position: 'absolute', left: x, top: y, zIndex: 200, pointerEvents: 'none' }}>
      {click && (
        <div
          style={{
            position: 'absolute',
            left: -20,
            top: -20,
            width: 40,
            height: 40,
            borderRadius: 999,
            background: color ?? 'var(--color-accent-corail)',
            opacity: 0.28 * (1 - t),
            transform: `scale(${0.3 + t * 1.1})`,
          }}
        />
      )}
      <svg width="22" height="24" viewBox="0 0 22 24" style={{ transform: `scale(${press})`, transformOrigin: '3px 2px', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.28))' }}>
        <path d="M3 2 L3 19.5 L7.6 15.4 L10.6 22 L13.6 20.7 L10.7 14.2 L17 14.2 Z" fill="#FFFFFF" stroke="#111111" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** Toucher sur ecran tactile : un disque gris comme l'option « afficher les touchers ». */
export function Touch({ at, x, y, hold = 6 }: { at: number; x: number; y: number; hold?: number }) {
  const frame = useCurrentFrame();
  const local = frame - at;
  if (local < -4 || local > hold + 10) return null;
  const appear = progress(frame, at - 4, at + 2);
  const leave = progress(frame, at + hold, at + hold + 10);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 21,
        top: y - 21,
        width: 42,
        height: 42,
        borderRadius: 999,
        background: 'rgba(120,120,128,0.42)',
        border: '1.5px solid rgba(255,255,255,0.75)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
        opacity: appear * (1 - leave),
        transform: `scale(${0.7 + 0.3 * appear + 0.25 * leave})`,
        zIndex: 300,
        pointerEvents: 'none',
      }}
    />
  );
}

export interface Shot {
  /** Image a laquelle la camera arrive sur ce cadrage. */
  at: number;
  /** Image a laquelle elle quitte le cadrage precedent (par defaut : `at` - 18). */
  from?: number;
  /** Coin haut gauche et largeur du cadrage, en px du decor ; la hauteur suit le format. */
  x: number;
  y: number;
  w: number;
}

/**
 * Camera : cadre une zone du decor et la remplit, puis glisse d'un cadrage a l'autre. Sert
 * aux gros plans des cartes « Comment ca marche », affichees trop petites sur la landing
 * pour montrer l'ecran entier lisiblement.
 */
export function Camera({ shots, width, children }: { shots: Shot[]; width: number; children: ReactNode }) {
  const frame = useCurrentFrame();
  let cur = { x: shots[0].x, y: shots[0].y, w: shots[0].w };
  for (let i = 1; i < shots.length; i++) {
    const s = shots[i];
    const start = s.from ?? s.at - 18;
    if (frame <= start) break;
    const t = progress(frame, start, s.at, EASE_IN_OUT);
    cur = { x: cur.x + (s.x - cur.x) * t, y: cur.y + (s.y - cur.y) * t, w: cur.w + (s.w - cur.w) * t };
  }
  const scale = width / cur.w;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `scale(${scale}) translate(${-cur.x}px, ${-cur.y}px)` }}>
      {children}
    </div>
  );
}

/** Glissement du doigt (defilement) : le disque suit le doigt de `from` a `to`. */
export function Swipe({ start, end, from, to }: { start: number; end: number; from: { x: number; y: number }; to: { x: number; y: number } }) {
  const frame = useCurrentFrame();
  if (frame < start - 4 || frame > end + 8) return null;
  const t = progress(frame, start, end, EASE_IN_OUT);
  const appear = progress(frame, start - 4, start + 2);
  const leave = progress(frame, end, end + 8);
  return (
    <div
      style={{
        position: 'absolute',
        left: from.x + (to.x - from.x) * t - 21,
        top: from.y + (to.y - from.y) * t - 21,
        width: 42,
        height: 42,
        borderRadius: 999,
        background: 'rgba(120,120,128,0.42)',
        border: '1.5px solid rgba(255,255,255,0.75)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
        opacity: appear * (1 - leave),
        zIndex: 300,
        pointerEvents: 'none',
      }}
    />
  );
}

/** Rotation d'un spinner (remplace animate-spin, qui tournerait a l'horloge). */
export const useSpin = (turnsPerSecond = 1.1) => (useCurrentFrame() / 30) * 360 * turnsPerSecond;

/** Remplace animate-pulse : opacite qui respire. */
export const usePulse = () => 0.6 + 0.4 * Math.cos((useCurrentFrame() / 30) * Math.PI);

/** Remplace animate-ping : anneau qui grandit et s'efface. */
export function usePing() {
  const t = (useCurrentFrame() % 30) / 30;
  return { transform: `scale(${1 + t})`, opacity: 0.75 * (1 - t) };
}

const CONFETTI_COLORS = ['#8B5CF6', '#FFC14D', '#7C3AED', '#10B981', '#3B82F6', '#EC4899'];

/**
 * Pluie de confettis apres une publication — src/components/ConfettiBurst.tsx : 70 morceaux,
 * chute de 1,4 a 2,3 s acceleree, derive laterale, fondu sur la seconde moitie. Le hasard est
 * fixe (random() de Remotion) pour que chaque rendu donne la meme pluie.
 */
export function Confetti({ at, height }: { at: number; height: number }) {
  const frame = useCurrentFrame();
  const t0 = frame - at;
  if (t0 < 0 || t0 > 80) return null;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 100 }}>
      {Array.from({ length: 70 }).map((_, i) => {
        const delay = random(`d${i}`) * 9;
        const duration = (1.4 + random(`u${i}`) * 0.9) * 30;
        const p = (t0 - delay) / duration;
        if (p <= 0 || p >= 1) return null;
        const e = p * p;
        const size = 6 + random(`s${i}`) * 6;
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: `${random(`l${i}`) * 100}%`,
              top: 0,
              width: size,
              height: size,
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              borderRadius: random(`o${i}`) > 0.5 ? 9999 : 2,
              opacity: p < 0.5 ? 1 : 1 - (p - 0.5) / 0.5,
              transform: `translate(${(random(`x${i}`) - 0.5) * 160 * e}px, ${-0.1 * height + 1.2 * height * e}px) rotate(${random(`r${i}`) * 360 * e}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}

export { EASE_OUT };

/**
 * Palette et polices des scenes video — les memes valeurs que src/index.css (palette
 * "Prune & Mangue"), recopiees ici parce que ce sous-projet est rendu hors de l'application.
 * Si la palette change dans index.css, elle change ici aussi.
 */
import { loadFont as loadJakarta } from '@remotion/google-fonts/PlusJakartaSans';
import { loadFont as loadBricolage } from '@remotion/google-fonts/BricolageGrotesque';

export const fontBody = loadJakarta('normal', {
  weights: ['400', '500', '600', '700'],
  subsets: ['latin', 'latin-ext'],
}).fontFamily;

export const fontDisplay = loadBricolage('normal', {
  weights: ['500', '600', '700'],
  subsets: ['latin', 'latin-ext'],
}).fontFamily;

export type ThemeName = 'light' | 'dark';

export interface Palette {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  text: string;
  muted: string;
  primary: string;
  primarySoft: string;
  mango: string;
  mangoInk: string;
  success: string;
  successSoft: string;
}

export const PALETTE: Record<ThemeName, Palette> = {
  light: {
    bg: '#FAF8FC',
    surface: '#FFFFFF',
    surface2: '#F3EEF9',
    border: '#E8E2F0',
    text: '#1D1327',
    muted: '#645878',
    primary: '#6D28D9',
    primarySoft: 'rgba(109,40,217,0.10)',
    mango: '#FFB020',
    mangoInk: '#2B1A00',
    success: '#0E7A55',
    successSoft: 'rgba(16,163,110,0.12)',
  },
  dark: {
    bg: '#110B18',
    surface: '#1B1325',
    surface2: '#2A1F38',
    border: '#322746',
    text: '#F4EFFA',
    muted: '#AFA2C3',
    primary: '#8B5CF6',
    primarySoft: 'rgba(139,92,246,0.18)',
    mango: '#FFB938',
    mangoInk: '#2B1A00',
    success: '#3DD39A',
    successSoft: 'rgba(61,211,154,0.14)',
  },
};

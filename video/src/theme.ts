/**
 * Polices des scenes. Les couleurs, elles, viennent de src/index.css (voir styles.css).
 *
 * L'application charge ses polices par l'URL Google Fonts en tete de src/index.css ; on
 * charge exactement la meme URL (memes graisses, meme axe optique pour Bricolage), sinon le
 * texte des videos ne serait pas celui de l'application : avec une graisse 700 chargee ici,
 * un titre `font-bold` serait dessine en vrai gras alors que l'application l'epaissit a
 * partir du 500. Remotion attend que les polices soient pretes avant la premiere image.
 */
import { continueRender, delayRender } from 'remotion';

const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap';

if (typeof document !== 'undefined' && !document.querySelector(`link[href="${FONTS_HREF}"]`)) {
  const handle = delayRender('Chargement des polices Google');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = FONTS_HREF;
  const done = () => continueRender(handle);
  link.onload = () => {
    Promise.all(
      ['400 16px "Plus Jakarta Sans"', '500 16px "Plus Jakarta Sans"', '600 16px "Plus Jakarta Sans"', '500 16px "Bricolage Grotesque"'].map((f) =>
        document.fonts.load(f),
      ),
    ).then(done, done);
  };
  link.onerror = done;
  document.head.appendChild(link);
}

export type ThemeName = 'light' | 'dark';

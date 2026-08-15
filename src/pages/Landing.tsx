/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Landing page publique.
 *
 * Parti pris de mise en page : la page precedente empilait dix sections sur le meme fond creme,
 * separees par des filets de 1px, et ne montrait jamais le produit. D'ou trois decisions
 * structurantes ici :
 *
 *   - RYTHME. Des bandes sombres pleine largeur (parcours, tarifs, pied de page) coupent la
 *     page. L'oeil a des reperes, et chaque bloc se lit comme une etape distincte au lieu d'un
 *     defilement uniforme.
 *   - PREUVE. Le hero montre l'ecran reel qu'un fan voit — profil, contenu verrouille, prix,
 *     bouton de paiement — au lieu de le decrire. Un produit se montre.
 *   - HIERARCHIE INEGALE. Grille bento plutot que des rangees de trois cartes identiques :
 *     la vente de contenu est l'offre principale, elle occupe donc quatre fois la surface des
 *     deux autres.
 *
 * Le vocabulaire de mouvement vient du skill `apple-design` :
 *
 *   - Ressorts, pas durees (§4). Une duree fixe ne sait pas repondre a une nouvelle entree.
 *     Amortissement critique (`bounce: 0`) par defaut ; le rebond est reserve aux moments qui
 *     portaient de l'elan.
 *   - Matiere (§12). Les surfaces flottantes sont translucides et le contenu passe dessous.
 *   - Typographie (§15). L'interlettrage depend de la taille : negatif sur les grands titres,
 *     ~0 sur le corps, positif sur les petites capitales.
 *   - Mouvement reduit (§14) n'est pas l'absence de mouvement : les glissements deviennent des
 *     fondus courts.
 */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Transition } from 'motion/react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useMotionValueEvent,
} from 'motion/react';
import {
  ArrowRight,
  Check,
  CreditCard,
  Download,
  Facebook,
  FileText,
  Globe,
  Heart,
  Instagram,
  Linkedin,
  Lock,
  MessageCircle,
  Play,
  Plus,
  Quote,
  Share2,
  ShoppingBag,
  Smartphone,
  UploadCloud,
  Wallet,
  X,
  Youtube,
  Zap,
} from 'lucide-react';
import PlatformImpact from '../components/PlatformImpact';

const LOGO_URL =
  'https://valqykbgglvvxmkqrenx.supabase.co/storage/v1/object/public/avatars/file_00000000588081f9b9f6b6484a7be967.png';

/** Encre des bandes sombres. Volontairement fixe : une bande sombre reste sombre en theme clair
 *  comme en theme sombre — c'est un choix de composition, pas une couleur de surface. */
const INK = '#131110';

/**
 * Pays couverts — source unique pour toute la page. La liste apparait a quatre endroits (le
 * point Mobile Money de la demo, la FAQ, le CTA final, le pied de page) ; les tenir a jour
 * separement garantissait qu'ils finiraient par se contredire.
 */
const COVERED_COUNTRIES = [
  { flag: '🇹🇬', code: 'TG', name: 'Togo' },
  { flag: '🇧🇯', code: 'BJ', name: 'Bénin' },
  { flag: '🇨🇮', code: 'CI', name: "Côte d'Ivoire" },
  { flag: '🇸🇳', code: 'SN', name: 'Sénégal' },
  { flag: '🇨🇲', code: 'CM', name: 'Cameroun' },
  { flag: '🇬🇦', code: 'GA', name: 'Gabon' },
  { flag: '🇲🇱', code: 'ML', name: 'Mali' },
  { flag: '🇳🇪', code: 'NE', name: 'Niger' },
  { flag: '🇧🇫', code: 'BF', name: 'Burkina Faso' },
  { flag: '🇨🇩', code: 'CD', name: 'RDC' },
  { flag: '🇨🇬', code: 'CG', name: 'Congo-Brazzaville' },
] as const;

const COUNTRY_COUNT = COVERED_COUNTRIES.length;

/** « Togo, Bénin, …, RDC et Congo-Brazzaville » — pour les phrases en prose. */
const COUNTRY_SENTENCE = COVERED_COUNTRIES.map((c) => c.name).join(', ').replace(/, ([^,]*)$/, ' et $1');

/**
 * Vocabulaire de ressorts d'Apple traduit pour Motion. Apple a remplace le triplet
 * masse/raideur/amortissement par deux reglages lisibles : l'amortissement (le rebond) et la
 * reponse (la vivacite, en secondes) — ce que Motion appelle `bounce` et `duration`.
 */
const SPRING: Record<'ui' | 'snappy' | 'momentum', Transition> = {
  ui: { type: 'spring', bounce: 0, duration: 0.4 },
  snappy: { type: 'spring', bounce: 0, duration: 0.28 },
  momentum: { type: 'spring', bounce: 0.22, duration: 0.4 },
};

/** Le retour visuel se joue a l'appui, pas au relachement : attendre le `click` donne une
 *  interface qui semble morte. */
const PRESSABLE =
  'transition-transform duration-100 ease-out active:scale-[0.97] motion-reduce:active:scale-100';

/** Ombre en deux couches — une courte pour poser l'objet, une longue pour la profondeur. */
const CARD =
  'rounded-[28px] bg-bg-surface border border-border-custom/70 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-24px_rgba(0,0,0,0.14)]';

function useEnter() {
  const reduce = useReducedMotion();
  return (distance = 24, delay = 0) =>
    ({
      initial: reduce ? { opacity: 0 } : { opacity: 0, y: distance },
      whileInView: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
      viewport: { once: true, margin: '-72px' },
      transition: reduce ? { duration: 0.2, delay } : { ...SPRING.ui, delay },
    }) as const;
}

/* ================================================================== */
/* Navigation                                                          */
/* ================================================================== */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 16));

  return (
    <div className="sticky top-0 z-50 px-4 pt-3 sm:pt-4">
      {/* Transition CSS assumee : rien ici ne se manipule au doigt, donc l'argument
          « une transition ne se rattrape pas en plein vol » ne s'applique pas. */}
      <header
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border px-3 py-2 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-out sm:px-4 ${
          scrolled
            ? 'border-white/60 bg-bg-surface/70 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-20px_rgba(0,0,0,0.25)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/10'
            : 'border-transparent bg-transparent'
        }`}
      >
        <Link to="/" className={`flex items-center gap-2.5 pl-1 ${PRESSABLE}`}>
          <img src={LOGO_URL} alt="" className="h-8 w-8 shrink-0 rounded-lg object-contain" />
          <span className="font-display text-lg font-medium tracking-[-0.02em] text-text-primary">
            MomoLink
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            { href: '#how-it-works', label: 'Comment ça marche' },
            { href: '#live-demo', label: 'Démonstration' },
            { href: '#pricing', label: 'Tarifs' },
            { href: '#faq', label: 'Questions' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-[13px] font-medium tracking-[-0.005em] text-text-secondary transition-colors duration-150 hover:bg-text-primary/5 hover:text-text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Link
          to="/auth/signup"
          className={`shrink-0 rounded-full bg-accent-corail px-4 py-2 text-[13px] font-semibold tracking-[-0.005em] text-white shadow-[0_1px_2px_rgba(0,0,0,0.10),0_8px_20px_-10px_var(--color-accent-corail)] hover:bg-accent-corail-hover ${PRESSABLE}`}
        >
          Devenir créateur
        </Link>
      </header>
    </div>
  );
}

/* ================================================================== */
/* Maquette telephone — la preuve visuelle du hero                     */
/* ================================================================== */

/**
 * L'ecran que voit un fan qui ouvre le lien depuis une bio TikTok. Construit en DOM plutot
 * qu'en image : il suit le theme, reste net a toutes les densites, et ne coute pas un
 * telechargement de plus.
 */
function PhoneMock() {
  const reduce = useReducedMotion();

  return (
    <div className="relative">
      {/* Halo derriere l'appareil — separe le telephone du fond sans bordure */}
      <div className="pointer-events-none absolute inset-0 -z-10 translate-y-8 scale-90 rounded-full bg-accent-corail/20 blur-[80px]" />

      <div className="relative w-[276px] rounded-[2.75rem] border-[9px] border-[#1c1a18] bg-[#1c1a18] shadow-[0_8px_16px_rgba(0,0,0,0.12),0_40px_80px_-32px_rgba(0,0,0,0.45)]">
        {/* Encoche */}
        <div className="absolute left-1/2 top-1.5 z-20 h-[22px] w-[92px] -translate-x-1/2 rounded-full bg-[#1c1a18]" />

        <div className="relative overflow-hidden rounded-[2.15rem] bg-bg-surface">
          {/* Banniere + avatar */}
          <div className="h-[86px] bg-linear-to-br from-accent-corail via-pink-500 to-purple-600" />
          <div className="px-4 pb-4">
            <div className="-mt-8 mb-3 flex items-end justify-between">
              <div className="h-16 w-16 rounded-2xl border-[3px] border-bg-surface bg-linear-to-br from-amber-200 to-orange-300" />
              <button className="mb-1 rounded-full bg-text-primary px-3 py-1.5 text-[10px] font-semibold text-bg-surface">
                Suivre
              </button>
            </div>

            <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-text-primary">
              Awa Ndiaye
            </h3>
            <p className="text-[11px] text-text-secondary">@awa.creatrice · Dakar 🇸🇳</p>
            <p className="mt-2 text-[11px] leading-[1.5] text-text-secondary">
              Coaching contenu & croissance organique. Mes méthodes en PDF et vidéo.
            </p>

            {/* Contenu verrouille — l'element central du produit */}
            <div className="mt-4 flex flex-col gap-2">
              <div className="rounded-2xl border border-border-custom/80 bg-bg-primary p-3">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-corail/12 text-accent-corail">
                    <FileText size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] font-semibold leading-tight text-text-primary">
                      Booster son audience TikTok
                    </p>
                    <p className="mt-0.5 text-[10px] text-text-secondary">PDF · 42 pages</p>
                  </div>
                </div>
                <button className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent-corail py-2 text-[11px] font-semibold text-white">
                  <Lock size={11} />
                  Débloquer · 2 500 FCFA
                </button>
              </div>

              <div className="rounded-2xl border border-border-custom/80 bg-bg-primary p-3">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/12 text-purple-600">
                    <Play size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] font-semibold leading-tight text-text-primary">
                      Masterclass algorithme
                    </p>
                    <p className="mt-0.5 text-[10px] text-text-secondary">Vidéo · 20 min</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-emerald-500/12 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">
                    PAYÉ
                  </span>
                </div>
              </div>

              <button className="flex items-center justify-center gap-1.5 rounded-xl border border-border-custom/80 py-2 text-[11px] font-semibold text-text-secondary">
                <Heart size={11} className="text-pink-500" />
                Envoyer un pourboire
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification de vente — c'est la promesse cote createur, elle merite d'etre visible.
          Rebond autorise : quelque chose vient d'aboutir. */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={reduce ? { duration: 0.25, delay: 0.8 } : { ...SPRING.momentum, delay: 0.9 }}
        className="absolute -right-4 bottom-24 flex items-center gap-2.5 rounded-2xl border border-white/60 bg-bg-surface/85 py-2.5 pl-2.5 pr-4 shadow-[0_2px_6px_rgba(0,0,0,0.06),0_20px_40px_-20px_rgba(0,0,0,0.3)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 sm:-right-12"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600">
          <Check size={15} className="stroke-[3]" />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold leading-tight tracking-[-0.005em] text-text-primary">
            Vente encaissée
          </span>
          <span className="text-[10px] tabular-nums text-text-secondary">+2 250 FCFA · Wave</span>
        </div>
      </motion.div>
    </div>
  );
}

/* ================================================================== */
/* Hero — deux colonnes                                                */
/* ================================================================== */

const ROTATING_WORDS = ['PDF', 'formations', 'vidéos', 'photos', 'audios'];

const PAYMENT_LOGOS = [
  { url: '/payment-icons/wave.png', name: 'Wave' },
  { url: '/payment-icons/orange-money.png', name: 'Orange Money' },
  { url: '/payment-icons/mtn-money.jpg', name: 'MTN MoMo' },
  { url: '/payment-icons/moov-money.png', name: 'Moov Money' },
  { url: '/payment-icons/mixx-by-yas.jpg', name: 'Mixx by Yas' },
];

function Hero() {
  const reduce = useReducedMotion();
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setWordIdx((p) => (p + 1) % ROTATING_WORDS.length), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-10 sm:pt-16">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_70%_60%_at_30%_10%,black_40%,transparent_100%)]" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-8">
        {/* Colonne texte — alignee a gauche sur desktop : une colonne centree impose un
            retour de l'oeil a chaque ligne, ce qui coute cher sur un titre de cette taille */}
        <div className="flex flex-col items-center gap-6 text-center lg:col-span-7 lg:items-start lg:text-left">
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING.ui}
            className="inline-flex items-center gap-2.5 rounded-full border border-accent-corail/20 bg-accent-corail/[0.07] px-3.5 py-1.5 text-[11px] font-bold tracking-[0.02em] text-accent-corail"
          >
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-corail opacity-70 motion-reduce:animate-none" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-corail" />
            </span>
            TikTok · Instagram · YouTube · Snapchat
          </motion.div>

          <motion.h1
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING.ui, delay: 0.06 }}
            className="font-display text-[3rem] font-medium leading-[0.98] tracking-[-0.04em] text-text-primary sm:text-[4rem] lg:text-[4.75rem]"
          >
            Vos{' '}
            <span className="relative inline-flex h-[1em] items-center overflow-hidden align-bottom">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={wordIdx}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: '60%' }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: '-60%' }}
                  transition={reduce ? { duration: 0.18 } : SPRING.snappy}
                  className="whitespace-nowrap bg-linear-to-r from-accent-corail via-pink-500 to-purple-600 bg-clip-text pr-1 text-transparent"
                >
                  {ROTATING_WORDS[wordIdx]}
                </motion.span>
              </AnimatePresence>
            </span>
            <br />
            payés en Mobile&nbsp;Money.
          </motion.h1>

          <motion.p
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING.ui, delay: 0.12 }}
            className="max-w-lg text-[16px] leading-[1.6] tracking-[-0.005em] text-text-secondary sm:text-[18px]"
          >
            Un lien dans votre bio. Vos fans paient en dix secondes avec{' '}
            <strong className="font-semibold text-text-primary">Wave, Orange, MTN ou Moov</strong>,
            sans créer de compte, dans{' '}
            <strong className="font-semibold text-text-primary">
              {COUNTRY_COUNT} pays d'Afrique de l'Ouest et Centrale
            </strong>
            . Le fichier part tout seul, l'argent arrive sur votre solde.
          </motion.p>

          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING.ui, delay: 0.18 }}
            className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
          >
            <Link
              to="/auth/signup"
              className={`flex w-full items-center justify-center gap-2 rounded-full bg-accent-corail px-7 py-4 text-[15px] font-semibold tracking-[-0.01em] text-white shadow-[0_2px_4px_rgba(0,0,0,0.08),0_16px_36px_-16px_var(--color-accent-corail)] hover:bg-accent-corail-hover sm:w-auto ${PRESSABLE}`}
            >
              Ouvrir ma boutique — gratuit
              <ArrowRight size={17} />
            </Link>
            <a
              href="#live-demo"
              className={`flex w-full items-center justify-center gap-2 rounded-full border border-border-custom bg-bg-surface px-6 py-4 text-[15px] font-semibold tracking-[-0.01em] text-text-primary hover:bg-bg-surface-hover sm:w-auto ${PRESSABLE}`}
            >
              Voir un paiement
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.32, duration: 0.4 }}
            className="flex flex-col items-center gap-4 sm:flex-row lg:items-center"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2.5">
                {[
                  'photo-1534528741775-53994a69daeb',
                  'photo-1507003211169-0a1dd7228f2d',
                  'photo-1494790108377-be9c29b29330',
                  'photo-1500648767791-00dcc994a43e',
                ].map((id) => (
                  <img
                    key={id}
                    src={`https://images.unsplash.com/${id}?auto=format&fit=crop&w=80&h=80&q=80`}
                    alt=""
                    className="h-7 w-7 rounded-full border-2 border-bg-primary object-cover"
                  />
                ))}
              </div>
              <span className="text-[12.5px] font-semibold tracking-[-0.005em] text-text-primary">
                +500 créateurs · <span className="text-amber-500">★★★★★</span>
              </span>
            </div>

            <span className="hidden h-4 w-px bg-border-custom sm:block" />

            <div className="flex items-center gap-1.5">
              {PAYMENT_LOGOS.map((logo) => (
                <img
                  key={logo.name}
                  src={logo.url}
                  alt={logo.name}
                  title={logo.name}
                  referrerPolicy="no-referrer"
                  className="h-7 w-7 rounded-md border border-border-custom/60 bg-white object-contain p-0.5"
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Colonne produit */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 32, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: -3 }}
          transition={reduce ? { duration: 0.3, delay: 0.2 } : { ...SPRING.ui, delay: 0.24 }}
          className="flex justify-center lg:col-span-5"
        >
          <PhoneMock />
        </motion.div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Bandeau defilant                                                    */
/* ================================================================== */

const MARQUEE_ITEMS = [
  { name: 'FACEBOOK', icon: <Facebook size={13} className="text-[#1877F2]" /> },
  {
    name: 'TIKTOK',
    icon: (
      <svg className="h-3.5 w-3.5 fill-current text-text-primary" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.97 1.2 2.27 2.05 3.71 2.45v3.98c-1.8-.12-3.51-.83-4.88-2.02-.19-.17-.37-.36-.54-.56V15c.09 1.41-.33 2.82-1.19 3.94-.85 1.12-2.12 1.88-3.53 2.13-1.41.25-2.88-.04-4.08-.82-1.2-.78-2.06-2.02-2.39-3.44-.33-1.41-.12-2.91.59-4.17.7-1.26 1.88-2.17 3.26-2.53 1.09-.28 2.24-.2 3.28.23V5.51c0-1.83.02-3.66.02-5.49z" />
      </svg>
    ),
  },
  { name: 'LINKEDIN', icon: <Linkedin size={13} className="text-[#0A66C2]" /> },
  { name: 'VOTRE SITE', icon: <Globe size={13} className="text-emerald-600" /> },
  { name: 'CITATIONS', icon: <Quote size={13} className="text-rose-500" /> },
  { name: 'YOUTUBE', icon: <Youtube size={13} className="text-[#FF0000]" /> },
  { name: 'PRODUITS', icon: <ShoppingBag size={13} className="text-purple-600" /> },
  { name: 'X.COM', icon: <X size={13} className="text-text-primary" /> },
  { name: 'INSTAGRAM', icon: <Instagram size={13} className="text-pink-600" /> },
];

function Marquee() {
  return (
    <section className="overflow-hidden border-y border-border-custom/70 bg-bg-surface/50 py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-text-secondary/70">
          Un seul lien, partout où vous êtes
        </span>
        <div className="mask-fade-edges relative w-full overflow-hidden">
          <div className="animate-marquee-infinite flex items-center gap-6 py-1">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                className="flex shrink-0 items-center gap-2 rounded-full border border-border-custom/70 bg-bg-surface px-3.5 py-1.5"
              >
                {item.icon}
                <span className="text-[10px] font-bold tracking-[0.08em] text-text-primary">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Parcours — bande sombre                                             */
/* ================================================================== */

const STEPS = [
  {
    icon: UploadCloud,
    title: 'Déposez votre fichier',
    body: "PDF, vidéo, audio ou photo. Vous fixez le prix en FCFA, nous générons un lien d'accès signé qui expire après une heure.",
  },
  {
    icon: Share2,
    title: 'Collez le lien en bio',
    body: "TikTok, Instagram, Snapchat, WhatsApp. Vos fans arrivent sur votre page et achètent sans jamais créer de compte.",
  },
  {
    icon: Wallet,
    title: 'Retirez sur votre numéro',
    body: 'Chaque vente crédite votre solde immédiatement. Vous demandez un retrait Wave, Orange, MTN ou Moov, traité sous 24h.',
  },
];

function HowItWorks() {
  const enter = useEnter();

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden px-4 py-24 sm:py-28"
      style={{ backgroundColor: INK }}
    >
      <div className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-accent-corail/15 blur-[130px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-[360px] w-[360px] rounded-full bg-purple-600/12 blur-[130px]" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-16">
        <motion.div {...enter(20)} className="flex max-w-2xl flex-col gap-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent-corail">
            Le parcours complet
          </span>
          <h2 className="font-display text-[2.25rem] font-medium leading-[1.05] tracking-[-0.03em] text-[#FAFAF8] sm:text-[3.25rem]">
            De votre fichier à votre numéro,<br className="hidden sm:block" /> en trois gestes.
          </h2>
          <p className="max-w-md text-[15px] leading-[1.6] tracking-[-0.005em] text-white/55">
            Aucun compte marchand à ouvrir, aucune paperasse, aucune intégration technique.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl bg-white/10 md:grid-cols-3">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.article
                key={step.title}
                {...enter(24, idx * 0.07)}
                className="relative flex flex-col gap-5 p-8 sm:p-9"
                style={{ backgroundColor: INK }}
              >
                {/* Numeral en filigrane : donne l'ordre de lecture sans ajouter de bruit */}
                <span className="font-display pointer-events-none absolute right-6 top-4 text-[4.5rem] font-medium leading-none tracking-[-0.05em] text-white/[0.06]">
                  {idx + 1}
                </span>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.07] text-accent-corail ring-1 ring-inset ring-white/10">
                  <Icon size={21} />
                </div>
                <h3 className="font-display relative text-[20px] font-medium leading-tight tracking-[-0.02em] text-[#FAFAF8]">
                  {step.title}
                </h3>
                <p className="relative text-[14px] leading-[1.65] tracking-[-0.005em] text-white/55">
                  {step.body}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Demonstration interactive                                           */
/* ================================================================== */

type DemoMethod = 'wave' | 'orange' | 'carte';
type DemoState = 'idle' | 'paying' | 'success';

const DEMO_METHODS: { id: DemoMethod; label: string; active: string }[] = [
  { id: 'wave', label: 'Wave', active: 'border-[#1D9BF0] bg-[#1D9BF0]/10 text-[#1D9BF0]' },
  { id: 'orange', label: 'Orange', active: 'border-[#FF6600] bg-[#FF6600]/10 text-[#FF6600]' },
  { id: 'carte', label: 'Carte', active: 'border-accent-corail bg-accent-corail/10 text-accent-corail' },
];

const DEMO_POINTS = [
  {
    icon: Smartphone,
    title: `Mobile Money dans ${COUNTRY_COUNT} pays`,
    body: `Wave, Orange Money, MTN ou Moov. Vos acheteurs paient depuis leur téléphone au ${COVERED_COUNTRIES[0].name}, au ${COVERED_COUNTRIES[1].name}, en ${COVERED_COUNTRIES[2].name} et dans ${COUNTRY_COUNT - 3} autres pays d'Afrique de l'Ouest et Centrale.`,
  },
  {
    icon: CreditCard,
    title: 'Cartes pour la diaspora',
    body: 'Vos abonnés en Europe ou en Amérique paient par Visa ou Mastercard. Aucun fan international perdu.',
  },
  {
    icon: Zap,
    title: 'Livraison automatique',
    body: "Le fichier part dès la validation du paiement. Pas d'envoi manuel : tout s'exécute pendant que vous dormez.",
  },
];

function CheckoutDemo() {
  const enter = useEnter();
  const reduce = useReducedMotion();
  const [method, setMethod] = useState<DemoMethod>('carte');
  const [state, setState] = useState<DemoState>('idle');
  const [phone, setPhone] = useState('');
  const [card, setCard] = useState('4242 4242 4242 4242');
  const timerRef = useRef<number | null>(null);

  // Un minuteur laisse pendant sur une page qu'on quitte rallume l'etat plus tard, sur une
  // carte que l'utilisateur a peut-etre deja reinitialisee.
  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);

  const pay = () => {
    setState('paying');
    timerRef.current = window.setTimeout(() => setState('success'), 1700);
  };

  const reset = () => {
    setState('idle');
    setPhone('');
    setCard('4242 4242 4242 4242');
  };

  /** Materialiser, pas seulement fondre : le flou et l'echelle bougent ensemble, donc l'ecran
   *  suivant se lit comme une matiere qui arrive et non comme une opacite qui monte. */
  const materialize = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.97, filter: 'blur(6px)' },
        animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, scale: 0.98, filter: 'blur(6px)' },
      };

  return (
    <section id="live-demo" className="px-4 py-24 sm:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Argumentaire a gauche, produit a droite — l'inverse du hero, pour que la page
            n'alterne pas mecaniquement le meme schema a chaque section */}
        <motion.div {...enter(24)} className="flex flex-col gap-7 lg:col-span-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent-corail">
            Essayez, c'est réel
          </span>
          <h2 className="font-display text-[2.25rem] font-medium leading-[1.05] tracking-[-0.03em] text-text-primary sm:text-[3rem]">
            Voilà ce que votre fan voit.
          </h2>
          <p className="max-w-md text-[15px] leading-[1.65] tracking-[-0.005em] text-text-secondary">
            Choisissez un moyen de paiement et appuyez. L'interface est celle de production —
            seul le débit est simulé.
          </p>

          <div className="flex flex-col gap-5 pt-1">
            {DEMO_POINTS.map((point) => {
              const Icon = point.icon;
              return (
                <div key={point.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-corail/10 text-accent-corail">
                    <Icon size={18} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-[15px] font-semibold tracking-[-0.01em] text-text-primary">
                      {point.title}
                    </h4>
                    <p className="text-[13.5px] leading-[1.6] tracking-[-0.005em] text-text-secondary">
                      {point.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div {...enter(28, 0.08)} className="flex justify-center lg:col-span-6">
          <div
            className={`${CARD} flex min-h-[430px] w-full max-w-[380px] flex-col justify-between overflow-hidden p-6`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {state === 'idle' && (
                <motion.div key="idle" {...materialize} transition={SPRING.snappy} className="flex flex-col gap-5">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-corail/10 text-accent-corail">
                      <Download size={19} />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-[14px] font-semibold leading-tight tracking-[-0.01em] text-text-primary">
                        Guide : Booster sa communauté
                      </h4>
                      <span className="mt-0.5 text-[12px] text-text-secondary">Par Awa Ndiaye</span>
                    </div>
                  </div>

                  <div className="py-1 text-center">
                    <span className="font-display text-[2rem] font-medium tracking-[-0.03em] tabular-nums text-text-primary">
                      2 500 FCFA
                    </span>
                  </div>

                  <div className="h-px w-full bg-border-custom" />

                  <div className="flex flex-col gap-2">
                    <span className="text-center text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">
                      Moyen de paiement
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {DEMO_METHODS.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setMethod(m.id)}
                          className={`rounded-xl border py-2 text-[12px] font-semibold ${PRESSABLE} ${
                            method === m.id
                              ? m.active
                              : 'border-border-custom bg-bg-primary text-text-secondary hover:bg-bg-surface-hover'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">
                      {method === 'carte' ? 'Numéro de carte' : 'Numéro de téléphone'}
                    </span>
                    <div className="flex items-center gap-3 rounded-xl border border-border-custom bg-bg-primary px-4 py-3 transition-colors duration-150 focus-within:border-accent-corail focus-within:bg-bg-surface">
                      {method === 'carte' ? (
                        <>
                          <CreditCard size={17} className="shrink-0 text-text-secondary" />
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={19}
                            value={card}
                            onChange={(e) => setCard(e.target.value)}
                            placeholder="4242 •••• •••• 4242"
                            className="w-full border-none bg-transparent p-0 text-[14px] font-medium tracking-[0.01em] text-text-primary outline-none placeholder:text-text-secondary/40"
                          />
                        </>
                      ) : (
                        <>
                          <Smartphone size={17} className="shrink-0 text-text-secondary" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder={method === 'wave' ? '+221 77 123 45 67' : '+225 07 123 456 78'}
                            className="w-full border-none bg-transparent p-0 text-[14px] font-medium tracking-[0.01em] text-text-primary outline-none placeholder:text-text-secondary/40"
                          />
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={pay}
                    className={`mt-1 w-full rounded-xl bg-accent-corail py-3.5 text-[14px] font-semibold tracking-[-0.005em] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_12px_28px_-14px_var(--color-accent-corail)] hover:bg-accent-corail-hover ${PRESSABLE}`}
                  >
                    Payer 2 500 FCFA
                  </button>
                </motion.div>
              )}

              {state === 'paying' && (
                <motion.div
                  key="paying"
                  {...materialize}
                  transition={SPRING.snappy}
                  className="my-auto flex flex-col items-center gap-5 py-10 text-center"
                >
                  <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-border-custom border-t-accent-corail motion-reduce:animate-none" />
                  <div className="flex flex-col gap-1.5 px-2">
                    <h5 className="text-[14px] font-semibold tracking-[-0.01em] text-text-primary">
                      {method === 'carte' ? 'Validation 3D Secure…' : 'Envoi de la demande…'}
                    </h5>
                    <p className="text-[12.5px] leading-[1.6] text-text-secondary">
                      {method === 'carte'
                        ? 'Vérification en cours avec votre établissement bancaire.'
                        : 'Confirmez la transaction via la notification de votre opérateur.'}
                    </p>
                  </div>
                </motion.div>
              )}

              {state === 'success' && (
                <motion.div
                  key="success"
                  {...materialize}
                  transition={SPRING.snappy}
                  className="flex h-full flex-col justify-between gap-6 py-1"
                >
                  <div className="my-auto flex flex-col items-center gap-4 px-2 text-center">
                    {/* Rebond autorise : quelque chose vient d'aboutir */}
                    <motion.div
                      initial={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={reduce ? { duration: 0.2 } : SPRING.momentum}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600"
                    >
                      <Check size={30} className="stroke-[3]" />
                    </motion.div>
                    <div className="flex flex-col gap-1">
                      <h4 className="font-display text-[19px] font-medium tracking-[-0.02em] text-text-primary">
                        Paiement réussi
                      </h4>
                      <p className="text-[12.5px] leading-[1.6] text-text-secondary">
                        Le guide a été déverrouillé et envoyé automatiquement.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={reset}
                    className={`w-full rounded-xl border border-border-custom py-3 text-[12.5px] font-semibold text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary ${PRESSABLE}`}
                  >
                    Recommencer la démonstration
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Sources de revenus — grille bento                                   */
/* ================================================================== */

function RevenueStreams() {
  const enter = useEnter();

  return (
    <section
      id="features"
      className="border-y border-border-custom/70 bg-bg-surface/40 px-4 py-24 sm:py-28"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <motion.div {...enter(20)} className="flex max-w-xl flex-col gap-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent-corail">
            Trois façons d'encaisser
          </span>
          <h2 className="font-display text-[2.25rem] font-medium leading-[1.05] tracking-[-0.03em] text-text-primary sm:text-[3rem]">
            Bien plus qu'une boutique.
          </h2>
        </motion.div>

        {/* Bento : la vente de contenu est l'offre principale, elle occupe quatre fois la
            surface des deux autres. Trois cartes egales feraient croire a trois options
            equivalentes. */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">
          <motion.article
            {...enter(24)}
            className={`${CARD} relative flex flex-col justify-between overflow-hidden p-8 md:col-span-2 md:row-span-2 sm:p-10`}
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent-corail/10 blur-3xl" />

            <div className="relative flex flex-col gap-4">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-accent-corail/10 p-3.5 text-accent-corail">
                <ShoppingBag size={22} />
              </div>
              <h3 className="font-display max-w-sm text-[26px] font-medium leading-[1.15] tracking-[-0.025em] text-text-primary sm:text-[30px]">
                Vendez vos contenus exclusifs
              </h3>
              <p className="max-w-md text-[14.5px] leading-[1.65] tracking-[-0.005em] text-text-secondary">
                Guides, formations, photos, vidéos. Vous fixez le prix, MomoLink encaisse et livre
                automatiquement dès le paiement validé — avec un lien signé qui expire au bout
                d'une heure.
              </p>
            </div>

            {/* Petite preuve visuelle : les formats acceptes, plutot qu'une liste a puces */}
            <div className="relative mt-8 flex flex-wrap gap-2">
              {['PDF', 'Vidéo', 'Audio', 'Photo', 'Archive ZIP'].map((format) => (
                <span
                  key={format}
                  className="rounded-full border border-border-custom/70 bg-bg-primary px-3 py-1.5 text-[11.5px] font-semibold tracking-[-0.005em] text-text-secondary"
                >
                  {format}
                </span>
              ))}
            </div>
          </motion.article>

          <motion.article {...enter(24, 0.06)} className={`${CARD} flex flex-col gap-3.5 p-7`}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-500">
              <Heart size={19} />
            </div>
            <h3 className="font-display text-[19px] font-medium leading-tight tracking-[-0.02em] text-text-primary">
              Dons & pourboires
            </h3>
            <p className="text-[13.5px] leading-[1.6] tracking-[-0.005em] text-text-secondary">
              Un don libre dès 1 000 FCFA depuis votre page, avec un message si le fan le souhaite.
            </p>
          </motion.article>

          <motion.article {...enter(24, 0.12)} className={`${CARD} flex flex-col gap-3.5 p-7`}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
              <MessageCircle size={19} />
            </div>
            <h3 className="font-display text-[19px] font-medium leading-tight tracking-[-0.02em] text-text-primary">
              Messages directs
            </h3>
            <p className="text-[13.5px] leading-[1.6] tracking-[-0.005em] text-text-secondary">
              Messages et propositions de partenariat, gratuits, centralisés dans votre tableau de
              bord.
            </p>
          </motion.article>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Tarifs — bande sombre                                               */
/* ================================================================== */

function Pricing() {
  const enter = useEnter();

  return (
    <section
      id="pricing"
      className="relative overflow-hidden px-4 py-24 sm:py-28"
      style={{ backgroundColor: INK }}
    >
      <div className="pointer-events-none absolute -right-32 top-10 h-[420px] w-[420px] rounded-full bg-accent-corail/15 blur-[130px]" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <motion.div {...enter(24)} className="flex flex-col gap-5 lg:col-span-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent-corail">
            Tarifs transparents
          </span>
          <h2 className="font-display text-[2.25rem] font-medium leading-[1.05] tracking-[-0.03em] text-[#FAFAF8] sm:text-[3rem]">
            Sans Stripe.<br />Sans PayPal.<br />Sans blocage.
          </h2>
          <p className="max-w-md text-[15px] leading-[1.65] tracking-[-0.005em] text-white/55">
            La plupart des outils de monétisation imposent un compte Stripe ou PayPal,
            inaccessibles ou très limités en Afrique de l'Ouest et Centrale. MomoLink se branche
            sur ce que vos fans utilisent déjà tous les jours.
          </p>

          <ul className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              'Taux de conversion imbattable',
              'Support réactif 24/7',
              'Sécurisation contre le partage',
              "Zéro frais d'installation",
            ].map((label) => (
              <li key={label} className="flex items-start gap-2">
                <Check size={15} className="mt-0.5 shrink-0 text-accent-corail" />
                <span className="text-[13px] font-medium tracking-[-0.005em] text-white/80">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          {...enter(24, 0.08)}
          className="relative flex flex-col gap-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl sm:p-9 lg:col-span-6"
        >
          <div className="flex flex-col gap-1">
            <h3 className="font-display text-[1.5rem] font-medium tracking-[-0.025em] text-[#FAFAF8]">
              Combien ça coûte ?
            </h3>
            <p className="text-[13px] text-white/50">Aucun frais caché, aucun engagement.</p>
          </div>

          <div className="flex flex-col">
            {[
              { label: 'Inscription & création de boutique', value: 'Gratuit', tone: 'text-emerald-400' },
              { label: 'Commission par vente ou don', value: '10%', tone: 'text-accent-corail' },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 border-b border-white/10 py-3.5"
              >
                <span className="text-[13.5px] font-medium tracking-[-0.005em] text-white/85">
                  {row.label}
                </span>
                <span className={`text-[14px] font-bold tabular-nums ${row.tone}`}>{row.value}</span>
              </div>
            ))}

            <div className="flex items-start justify-between gap-4 py-3.5">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13.5px] font-medium tracking-[-0.005em] text-white/85">
                  Formule MomoLink Pro
                </span>
                <span className="text-[12px] leading-[1.5] text-white/45">
                  Requise pour publier du contenu et demander des retraits.
                </span>
              </div>
              <span className="whitespace-nowrap text-[14px] font-bold tabular-nums text-accent-corail">
                4 990 FCFA<span className="text-[11px] font-medium text-white/45">/mois</span>
              </span>
            </div>
          </div>

          <Link
            to="/auth/signup"
            className={`w-full rounded-full bg-accent-corail py-4 text-center text-[14.5px] font-semibold tracking-[-0.005em] text-white shadow-[0_2px_4px_rgba(0,0,0,0.2),0_16px_36px_-16px_var(--color-accent-corail)] hover:bg-accent-corail-hover ${PRESSABLE}`}
          >
            Ouvrir ma boutique — 2 minutes
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* FAQ                                                                 */
/* ================================================================== */

const FAQ_DATA = [
  {
    q: 'Comment mes abonnés paient-ils ?',
    a: "Vos abonnés paient directement avec leur compte Mobile Money local (Wave, Orange Money, MTN, Moov). Le processus prend moins de 10 secondes, s'effectue en FCFA et ne nécessite aucune création de compte pour l'acheteur.",
  },
  {
    q: 'Quels sont les frais de MomoLink ?',
    a: "L'inscription et la création de votre boutique sont 100% gratuites. Nous prélevons une commission de 10% sur chaque vente ou don réussi. Pour publier du contenu et demander des retraits, un abonnement MomoLink Pro à 4 990 FCFA/mois est requis — votre page publique reste visible même sans abonnement actif.",
  },
  {
    q: "À quoi sert l'abonnement MomoLink Pro ?",
    a: "L'abonnement Pro (4 990 FCFA/mois) débloque la publication de nouveaux contenus et les demandes de retrait vers votre Mobile Money. En cas d'expiration, vous disposez de 3 jours de grâce avant que vos contenus ne soient temporairement archivés ; votre page reste visible par vos fans dans tous les cas.",
  },
  {
    q: 'Puis-je recevoir des dons de mes fans ?',
    a: "Oui, chaque page de créateur inclut un bouton de don. Vos fans peuvent vous envoyer un pourboire libre (à partir de 1 000 FCFA), accompagné d'un message optionnel, directement en Mobile Money. La même commission de 10% s'applique.",
  },
  {
    q: 'Comment mes fans peuvent-ils me contacter ?',
    a: 'Votre page publique intègre un formulaire de message et de proposition de partenariat. Ces messages sont gratuits et arrivent directement dans votre tableau de bord.',
  },
  {
    q: 'Dans quels pays le service est-il disponible ?',
    a: `MomoLink couvre ${COUNTRY_COUNT} pays d'Afrique de l'Ouest et Centrale : ${COUNTRY_SENTENCE}. Nous supportons les intégrations Mobile Money majeures de ces régions, et vos fans du reste du monde peuvent toujours payer par carte bancaire.`,
  },
  {
    q: 'Comment puis-je retirer mes gains ?',
    a: 'Vous pouvez demander un retrait vers votre numéro Mobile Money (Wave, Orange, MTN ou Moov) à tout moment depuis votre tableau de bord, à condition que votre abonnement MomoLink Pro soit actif. Les demandes sont traitées en moins de 24h ouvrées.',
  },
  {
    q: 'La livraison des fichiers est-elle sécurisée ?',
    a: "Oui. À chaque achat, nous générons un lien d'accès sécurisé et temporaire lié à l'email de l'acheteur. Le lien expire automatiquement après 1 heure, protégeant vos contenus contre la redistribution non autorisée.",
  },
];

function Faq() {
  const enter = useEnter();
  const reduce = useReducedMotion();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="px-4 py-24 sm:py-28">
      {/* Titre a gauche, liste a droite : la question courante reste alignee avec le titre
          au lieu de pousser tout le bloc vers le bas a chaque ouverture */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <motion.div {...enter(20)} className="flex flex-col gap-4 lg:col-span-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent-corail">
            Questions fréquentes
          </span>
          <h2 className="font-display text-[2rem] font-medium leading-[1.08] tracking-[-0.03em] text-text-primary sm:text-[2.5rem]">
            Tout ce que vous devez savoir.
          </h2>
          <p className="text-[14px] leading-[1.6] text-text-secondary">
            Une question qui n'est pas là ?{' '}
            <a href="mailto:support@momolink.pro" className="text-accent-corail hover:underline">
              Écrivez-nous
            </a>
            , on répond sous 24h.
          </p>
        </motion.div>

        <motion.div {...enter(20, 0.06)} className="flex flex-col gap-2.5 lg:col-span-8">
          {FAQ_DATA.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-2xl border border-border-custom/70 bg-bg-surface"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-150 hover:bg-text-primary/[0.03]"
                >
                  <span className="text-[14px] font-semibold tracking-[-0.01em] text-text-primary">
                    {faq.q}
                  </span>
                  {/* Le chevron tourne au lieu d'etre remplace : meme objet, meme trajet
                      aller/retour */}
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={reduce ? { duration: 0.15 } : SPRING.snappy}
                    className={`shrink-0 ${isOpen ? 'text-accent-corail' : 'text-text-secondary'}`}
                  >
                    <Plus size={17} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={reduce ? { duration: 0.18 } : SPRING.snappy}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-[13.5px] leading-[1.65] tracking-[-0.005em] text-text-secondary">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* CTA final + pied de page sombre                                     */
/* ================================================================== */

function FinalCta() {
  const enter = useEnter();
  return (
    <section className="px-4 pb-8">
      <motion.div
        {...enter(28)}
        className="relative mx-auto flex max-w-6xl flex-col items-center gap-7 overflow-hidden rounded-[36px] bg-linear-to-br from-accent-corail via-pink-600 to-purple-700 px-6 py-20 text-center sm:px-16"
      >
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/20 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-[90px]" />

        <h2 className="font-display relative max-w-3xl text-[2.25rem] font-medium leading-[1.02] tracking-[-0.035em] text-white sm:text-[3.5rem]">
          Votre audience est déjà là.<br className="hidden sm:block" /> Faites-la payer.
        </h2>
        <p className="relative max-w-lg text-[15.5px] leading-[1.6] tracking-[-0.005em] text-white/85">
          Ouvrez votre boutique en deux minutes, collez le lien dans votre bio, encaissez votre
          première vente ce soir.
        </p>

        <Link
          to="/auth/signup"
          className={`relative flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-[15px] font-semibold tracking-[-0.01em] text-accent-corail shadow-[0_2px_6px_rgba(0,0,0,0.12),0_18px_40px_-18px_rgba(0,0,0,0.5)] ${PRESSABLE}`}
        >
          Créer mon compte créateur
          <ArrowRight size={17} />
        </Link>

        {/* Onze pays ne tiennent plus sur une ligne de texte : on passe en pastilles, qui
            supportent le retour a la ligne sans se lire comme une phrase coupee en deux */}
        <div className="relative flex flex-col items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
            Disponible dans {COUNTRY_COUNT} pays
          </span>
          <div className="flex max-w-2xl flex-wrap items-center justify-center gap-1.5">
            {COVERED_COUNTRIES.map((country) => (
              <span
                key={country.code}
                className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11.5px] font-semibold tracking-[-0.005em] text-white/90 backdrop-blur-sm"
              >
                <span aria-hidden="true">{country.flag}</span>
                {country.name}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function SiteFooter() {
  const columns = [
    {
      title: 'Ressources',
      links: [
        { to: '/auth/signup', label: 'Devenir créateur' },
        { to: '/portal', label: 'Espace client / achats' },
        { href: '#how-it-works', label: 'Comment ça marche' },
        { href: '#live-demo', label: 'Démonstration' },
      ],
    },
    {
      title: 'Légal',
      links: [
        { to: '/legal/terms', label: "Conditions d'utilisation" },
        { to: '/legal/sales', label: 'Conditions de vente (CGV)' },
        { to: '/legal/privacy', label: 'Politique de confidentialité' },
      ],
    },
  ];

  return (
    <footer className="px-6 py-16" style={{ backgroundColor: INK }}>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="" className="h-7 w-7 rounded-md object-contain" />
            <span className="font-display text-[15px] font-medium tracking-[-0.02em] text-[#FAFAF8]">
              MomoLink
            </span>
          </div>
          <p className="text-[13px] leading-[1.6] text-white/50">
            La plateforme pour monétiser vos contenus exclusifs en Afrique de l'Ouest et Centrale
            avec le Mobile Money.
          </p>
          <span className="text-[11px] text-white/30">
            © {new Date().getFullYear()} MomoLink Inc. Tous droits réservés.
          </span>
        </div>

        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#FAFAF8]">
              {col.title}
            </h4>
            <div className="flex flex-col gap-2">
              {col.links.map((link) =>
                'to' in link ? (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="text-[13px] text-white/50 transition-colors duration-150 hover:text-accent-corail"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-[13px] text-white/50 transition-colors duration-150 hover:text-accent-corail"
                  >
                    {link.label}
                  </a>
                ),
              )}
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-3">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#FAFAF8]">
            Disponibilité & support
          </h4>
          <p className="text-[13px] leading-[1.6] text-white/50">
            Support 24/7 par email :{' '}
            <a href="mailto:support@momolink.pro" className="text-accent-corail hover:underline">
              support@momolink.pro
            </a>
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {COVERED_COUNTRIES.map((country) => (
              <span
                key={country.code}
                title={country.name}
                className="flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-semibold text-white/70"
              >
                <span aria-hidden="true">{country.flag}</span>
                {country.code}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ================================================================== */

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg-primary font-sans text-text-primary">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <HowItWorks />
        <CheckoutDemo />
        <RevenueStreams />
        <PlatformImpact />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}

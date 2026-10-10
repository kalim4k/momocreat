/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Landing page publique — version epuree.
 *
 * Parti pris : un seul fond clair du haut en bas, de l'espace plutot que des separateurs, et
 * le produit montre en mouvement plutot que decrit. La version precedente coupait la page en
 * bandes sombres, ajoutait un bandeau defilant et un grand degrade final ; tout cela se
 * disputait l'attention. Il reste ici une idee par section et une animation par idee.
 *
 * Les scenes animees (paiement sur telephone, trois etapes) sont des videos rendues avec
 * Remotion depuis le sous-projet `video/` : `cd video && npm run render`. Elles pesent entre
 * 60 et 400 Ko, ne se lancent que lorsqu'elles sont a l'ecran, et laissent la place a leur
 * image fixe quand le visiteur a demande moins d'animations.
 *
 * Mouvement : ressorts sans rebond pour l'interface (le rebond est reserve a un
 * aboutissement), apparitions au defilement une seule fois, et mouvement reduit = fondus
 * courts, jamais de glissement.
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
  Heart,
  MessageCircle,
  Plus,
  ShoppingBag,
  Smartphone,
  Zap,
} from 'lucide-react';
import PlatformImpact from '../components/PlatformImpact';
import { LOGO_URL } from '../lib/brand';
import { useTheme } from '../context/ThemeContext';

/**
 * Pays couverts — source unique pour toute la page (demo, FAQ, appel final, pied de page).
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

/** Ressorts : `bounce` = rebond, `duration` = vivacite. Sans rebond par defaut. */
const SPRING: Record<'ui' | 'snappy' | 'momentum' | 'gentle', Transition> = {
  ui: { type: 'spring', bounce: 0, duration: 0.5 },
  snappy: { type: 'spring', bounce: 0, duration: 0.28 },
  momentum: { type: 'spring', bounce: 0.22, duration: 0.45 },
  gentle: { type: 'spring', bounce: 0, duration: 0.8 },
};

/** Le retour visuel se joue a l'appui, pas au relachement. */
const PRESSABLE =
  'transition-transform duration-100 ease-out active:scale-[0.97] motion-reduce:active:scale-100';

const CARD =
  'rounded-[28px] bg-bg-surface border border-border-custom/80 shadow-[0_1px_2px_rgba(29,19,39,0.04),0_18px_44px_-28px_rgba(29,19,39,0.22)]';

const EYEBROW = 'text-[12px] font-semibold uppercase tracking-[0.14em] text-accent-corail';
const H2 = 'font-display text-[2.25rem] font-medium leading-[1.04] tracking-[-0.035em] text-text-primary sm:text-[3.25rem] text-balance';

/** Apparition au defilement, une seule fois. */
function useEnter() {
  const reduce = useReducedMotion();
  return (distance = 28, delay = 0) =>
    ({
      initial: reduce ? { opacity: 0 } : { opacity: 0, y: distance },
      whileInView: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
      viewport: { once: true, margin: '-64px' },
      transition: reduce ? { duration: 0.2, delay } : { ...SPRING.ui, delay },
    }) as const;
}

/* ================================================================== */
/* Scenes video (rendues avec Remotion)                                */
/* ================================================================== */

/**
 * Une scene de `public/videos`. Ne se charge et ne tourne que lorsqu'elle est visible (un
 * telephone ne paie ni la bande passante ni la batterie d'une video hors ecran), demarre a
 * l'image de son apercu pour que le passage de l'image fixe a la video ne se voie pas, et
 * cede la place a l'image fixe quand le visiteur a demande moins d'animations.
 */
function MotionClip({
  name,
  themed = false,
  startAt = 0,
  eager = false,
  label,
  className = '',
}: {
  name: string;
  /** La scene existe en version claire et sombre (`-light` / `-dark`). */
  themed?: boolean;
  /** Seconde a laquelle demarrer : celle de l'image d'apercu. */
  startAt?: number;
  /** Charger tout de suite (scene du haut de page). */
  eager?: boolean;
  label: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const { isDarkMode } = useTheme();
  const ref = useRef<HTMLVideoElement>(null);
  const base = `/videos/${name}${themed ? (isDarkMode ? '-dark' : '-light') : ''}`;

  useEffect(() => {
    const video = ref.current;
    if (!video || reduce) return;
    video.muted = true; // la lecture automatique n'est permise que sans le son
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.2 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduce, base]);

  if (reduce) {
    return <img src={`${base}.jpg`} alt={label} className={className} />;
  }

  return (
    <video
      key={base}
      ref={ref}
      className={className}
      poster={`${base}.jpg`}
      muted
      loop
      playsInline
      preload={eager ? 'auto' : 'metadata'}
      aria-label={label}
      onLoadedMetadata={(e) => {
        if (startAt) e.currentTarget.currentTime = startAt;
      }}
    >
      <source src={`${base}.mp4`} type="video/mp4" />
      <source src={`${base}.webm`} type="video/webm" />
    </video>
  );
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
      <header
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border px-3 py-2 transition-[background-color,border-color,box-shadow] duration-300 ease-out sm:px-4 ${
          scrolled
            ? 'border-border-custom/70 bg-bg-surface/75 shadow-[0_12px_32px_-22px_rgba(29,19,39,0.35)] backdrop-blur-xl backdrop-saturate-150'
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
              className="rounded-full px-3 py-1.5 text-[13.5px] font-medium tracking-[-0.005em] text-text-secondary transition-colors duration-150 hover:bg-text-primary/5 hover:text-text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            to="/auth/login"
            className="hidden rounded-full px-3 py-2 text-[13.5px] font-medium text-text-secondary transition-colors hover:text-text-primary sm:block"
          >
            Connexion
          </Link>
          <Link
            to="/auth/signup"
            className={`shrink-0 rounded-full bg-accent-corail px-4 py-2 text-[13.5px] font-semibold tracking-[-0.005em] text-white hover:bg-accent-corail-hover ${PRESSABLE}`}
          >
            Devenir créateur
          </Link>
        </div>
      </header>
    </div>
  );
}

/* ================================================================== */
/* Hero                                                                */
/* ================================================================== */

/** `feminine` : le participe s'accorde (« vos vidéos payées », « vos PDF payés »). */
const ROTATING_WORDS = [
  { word: 'PDF', feminine: false },
  { word: 'formations', feminine: true },
  { word: 'vidéos', feminine: true },
  { word: 'photos', feminine: true },
  { word: 'audios', feminine: false },
];

const PAYMENT_LOGOS = [
  { url: '/payment-icons/wave.png', name: 'Wave' },
  { url: '/payment-icons/orange-money.png', name: 'Orange Money' },
  { url: '/payment-icons/mtn-money.jpg', name: 'MTN MoMo' },
  { url: '/payment-icons/moov-money.png', name: 'Moov Money' },
  { url: '/payment-icons/mixx-by-yas.jpg', name: 'Mixx by Yas' },
];

/** Le telephone : cadre en CSS (net a toutes les densites), ecran = scene Remotion. */
function PhoneScene() {
  const reduce = useReducedMotion();

  return (
    <div className="relative">
      {/* Halo : detache l'appareil du fond sans bordure */}
      <div className="pointer-events-none absolute inset-x-0 top-1/4 -z-10 mx-auto h-2/3 w-[120%] -translate-x-[8%] rounded-full bg-accent-corail/15 blur-[90px]" />

      <motion.div
        animate={reduce ? undefined : { y: [0, -10, 0] }}
        transition={reduce ? undefined : { duration: 7, ease: 'easeInOut', repeat: Infinity }}
      >
        <figure
          aria-label="Démonstration : une fan débloque un PDF et paie avec Wave, sans créer de compte"
          className="relative w-[272px] rounded-[2.9rem] bg-[#17101F] p-[9px] shadow-[0_10px_20px_-6px_rgba(23,16,31,0.25),0_50px_90px_-36px_rgba(23,16,31,0.55)] sm:w-[292px]"
        >
          <div className="absolute left-1/2 top-[15px] z-10 h-[24px] w-[88px] -translate-x-1/2 rounded-full bg-[#17101F]" />
          <MotionClip
            name="hero-paiement"
            eager
            label="Paiement d'un PDF en Mobile Money sur la boutique d'une créatrice"
            className="block aspect-[540/1170] w-full rounded-[2.3rem] bg-bg-primary object-cover"
          />
        </figure>
      </motion.div>

      {/* Ce que le createur recoit pendant ce temps — rebond : quelque chose vient d'aboutir */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={reduce ? { duration: 0.25, delay: 1 } : { ...SPRING.momentum, delay: 1.1 }}
        className="absolute -left-6 bottom-28 flex items-center gap-2.5 rounded-2xl border border-border-custom/70 bg-bg-surface/90 py-2.5 pl-2.5 pr-4 shadow-[0_20px_40px_-22px_rgba(29,19,39,0.45)] backdrop-blur-xl sm:-left-16"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600">
          <Check size={16} className="stroke-[3]" />
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] font-semibold leading-tight text-text-primary">Vente encaissée</span>
          <span className="text-[11px] tabular-nums text-text-secondary">+2 250 FCFA · Wave</span>
        </div>
      </motion.div>
    </div>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setWordIdx((p) => (p + 1) % ROTATING_WORDS.length), 2600);
    return () => clearInterval(id);
  }, [reduce]);

  const rise = (delay: number, distance = 18) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: distance },
    animate: { opacity: 1, y: 0 },
    transition: reduce ? { duration: 0.25, delay } : { ...SPRING.ui, delay },
  });

  return (
    <section className="relative px-4 pb-24 pt-12 sm:pb-32 sm:pt-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col items-center gap-7 text-center lg:col-span-7 lg:items-start lg:text-left">
          <motion.span
            {...rise(0, 10)}
            className="inline-flex items-center gap-2 rounded-full border border-border-custom bg-bg-surface px-3.5 py-1.5 text-[12px] font-semibold text-text-secondary"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent-mango" />
            TikTok · Instagram · YouTube · Snapchat
          </motion.span>

          <motion.h1
            {...rise(0.06, 22)}
            className="font-display text-[3rem] font-medium leading-[0.98] tracking-[-0.045em] text-text-primary sm:text-[4.25rem] lg:text-[5rem]"
          >
            Vos{' '}
            <span className="relative inline-flex h-[1.02em] items-center overflow-hidden align-bottom">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={wordIdx}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: '70%', filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: '-70%', filter: 'blur(6px)' }}
                  transition={reduce ? { duration: 0.18 } : SPRING.snappy}
                  className="whitespace-nowrap pr-1 text-accent-corail"
                >
                  {ROTATING_WORDS[wordIdx].word}
                </motion.span>
              </AnimatePresence>
            </span>
            <br />
            payé
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={ROTATING_WORDS[wordIdx].feminine ? 'es' : 's'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {ROTATING_WORDS[wordIdx].feminine ? 'es' : 's'}
              </motion.span>
            </AnimatePresence>{' '}
            en Mobile&nbsp;Money.
          </motion.h1>

          <motion.p
            {...rise(0.12, 16)}
            className="max-w-lg text-[16.5px] leading-[1.6] tracking-[-0.005em] text-text-secondary sm:text-[18px]"
          >
            Un lien dans votre bio. Vos fans paient en dix secondes avec{' '}
            <strong className="font-semibold text-text-primary">Wave, Orange, MTN ou Moov</strong>, sans créer de
            compte, dans{' '}
            <strong className="font-semibold text-text-primary">
              {COUNTRY_COUNT} pays d'Afrique de l'Ouest et Centrale
            </strong>
            . Le fichier part tout seul, l'argent arrive sur votre solde.
          </motion.p>

          <motion.div
            {...rise(0.18, 14)}
            className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
          >
            <Link
              to="/auth/signup"
              className={`group flex w-full items-center justify-center gap-2 rounded-full bg-accent-corail px-7 py-4 text-[15px] font-semibold tracking-[-0.01em] text-white shadow-[0_16px_34px_-16px_var(--color-accent-corail)] hover:bg-accent-corail-hover sm:w-auto ${PRESSABLE}`}
            >
              Ouvrir ma boutique — gratuit
              <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how-it-works"
              className={`flex w-full items-center justify-center rounded-full px-6 py-4 text-[15px] font-semibold tracking-[-0.01em] text-text-primary hover:bg-text-primary/5 sm:w-auto ${PRESSABLE}`}
            >
              Comment ça marche
            </a>
          </motion.div>

          <motion.div
            {...rise(0.28, 8)}
            className="flex flex-col items-center gap-4 sm:flex-row"
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
              <span className="text-[13px] font-semibold tracking-[-0.005em] text-text-primary">
                +500 créateurs · <span className="text-accent-mango">★★★★★</span>
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
                  className="h-7 w-7 rounded-lg border border-border-custom/70 bg-white object-contain p-0.5"
                />
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={reduce ? { duration: 0.3, delay: 0.2 } : { ...SPRING.gentle, delay: 0.15 }}
          className="flex justify-center lg:col-span-5"
        >
          <PhoneScene />
        </motion.div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Comment ca marche — trois etapes, trois scenes                      */
/* ================================================================== */

const STEPS = [
  {
    clip: 'etape-fichier',
    startAt: 5,
    title: 'Déposez votre fichier',
    body: "PDF, vidéo, audio ou photo. Vous fixez le prix en FCFA, nous générons un lien d'accès signé qui expire après une heure.",
    label: "Un fichier PDF est déposé, son prix est fixé à 2 500 FCFA et il passe en vente",
  },
  {
    clip: 'etape-lien',
    startAt: 4.67,
    title: 'Collez le lien en bio',
    body: 'TikTok, Instagram, Snapchat, WhatsApp. Vos fans arrivent sur votre page et achètent sans jamais créer de compte.',
    label: 'Le lien de la boutique est copié puis ajouté aux bios TikTok, Instagram et WhatsApp',
  },
  {
    clip: 'etape-retrait',
    startAt: 3.2,
    title: 'Retirez sur votre numéro',
    body: 'Chaque vente crédite votre solde immédiatement. Vous demandez un retrait Wave, Orange, MTN ou Moov, traité sous 24h.',
    label: 'Les ventes Wave, Orange, MTN et Moov arrivent, le solde monte, puis un retrait est envoyé sur Wave',
  },
];

function HowItWorks() {
  const enter = useEnter();

  return (
    <section id="how-it-works" className="scroll-mt-24 px-4 py-24 sm:py-32">
      <div className="mx-auto flex max-w-6xl flex-col gap-14">
        <motion.div {...enter(20)} className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className={EYEBROW}>Comment ça marche</span>
          <h2 className={H2}>De votre fichier à votre numéro, en trois gestes.</h2>
          <p className="max-w-md text-[16px] leading-[1.6] text-text-secondary">
            Aucun compte marchand à ouvrir, aucune paperasse, aucune intégration technique.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {STEPS.map((step, idx) => (
            <motion.article key={step.title} {...enter(32, idx * 0.08)} className={`${CARD} flex flex-col overflow-hidden p-2.5`}>
              <MotionClip
                name={step.clip}
                themed
                startAt={step.startAt}
                label={step.label}
                className="block aspect-[16/10] w-full rounded-[20px] bg-bg-primary object-cover ring-1 ring-border-custom/70"
              />
              <div className="flex flex-col gap-2.5 px-4 pb-5 pt-5">
                <span className="text-[12px] font-semibold tabular-nums text-accent-corail">Étape {idx + 1}</span>
                <h3 className="font-display text-[21px] font-medium leading-tight tracking-[-0.02em] text-text-primary">
                  {step.title}
                </h3>
                <p className="text-[14.5px] leading-[1.6] text-text-secondary">{step.body}</p>
              </div>
            </motion.article>
          ))}
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
  const [method, setMethod] = useState<DemoMethod>('wave');
  const [state, setState] = useState<DemoState>('idle');
  const [phone, setPhone] = useState('');
  const [card, setCard] = useState('4242 4242 4242 4242');
  const timerRef = useRef<number | null>(null);

  // Un minuteur laisse pendant sur une page qu'on quitte rallume l'etat plus tard.
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

  /** L'ecran suivant se materialise (flou + echelle) au lieu de simplement apparaitre. */
  const materialize = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.97, filter: 'blur(6px)' },
        animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, scale: 0.98, filter: 'blur(6px)' },
      };

  return (
    <section id="live-demo" className="scroll-mt-24 px-4 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <motion.div {...enter(24)} className="flex flex-col gap-7 lg:col-span-6">
          <span className={EYEBROW}>Essayez</span>
          <h2 className={H2}>Voilà ce que votre fan voit.</h2>
          <p className="max-w-md text-[16px] leading-[1.6] text-text-secondary">
            Choisissez un moyen de paiement et appuyez. L'interface est celle de production, seul le débit est simulé.
          </p>

          <div className="flex flex-col gap-6 pt-1">
            {DEMO_POINTS.map((point) => {
              const Icon = point.icon;
              return (
                <div key={point.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-corail/10 text-accent-corail">
                    <Icon size={18} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-[15.5px] font-semibold tracking-[-0.01em] text-text-primary">{point.title}</h3>
                    <p className="text-[14px] leading-[1.6] text-text-secondary">{point.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div {...enter(32, 0.08)} className="flex justify-center lg:col-span-6">
          <div className={`${CARD} flex min-h-[440px] w-full max-w-[390px] flex-col justify-between overflow-hidden p-6`}>
            <AnimatePresence mode="wait" initial={false}>
              {state === 'idle' && (
                <motion.div key="idle" {...materialize} transition={SPRING.snappy} className="flex flex-col gap-5">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-corail/10 text-accent-corail">
                      <Download size={19} />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-[14.5px] font-semibold leading-tight tracking-[-0.01em] text-text-primary">
                        Guide : Booster sa communauté
                      </h3>
                      <span className="mt-0.5 text-[12.5px] text-text-secondary">Par Awa Ndiaye</span>
                    </div>
                  </div>

                  <div className="py-1 text-center">
                    <span className="font-display text-[2.1rem] font-medium tracking-[-0.03em] tabular-nums text-text-primary">
                      2 500 FCFA
                    </span>
                  </div>

                  <div className="h-px w-full bg-border-custom" />

                  <div className="flex flex-col gap-2">
                    <span className="text-center text-[12px] font-semibold text-text-secondary">Moyen de paiement</span>
                    <div className="grid grid-cols-3 gap-2">
                      {DEMO_METHODS.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setMethod(m.id)}
                          aria-pressed={method === m.id}
                          className={`cursor-pointer rounded-xl border py-2.5 text-[13px] font-semibold ${PRESSABLE} ${
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
                    <label htmlFor="demo-number" className="text-[12px] font-semibold text-text-secondary">
                      {method === 'carte' ? 'Numéro de carte' : 'Numéro de téléphone'}
                    </label>
                    <div className="flex items-center gap-3 rounded-xl border border-border-custom bg-bg-primary px-4 py-3 transition-colors duration-150 focus-within:border-accent-corail focus-within:bg-bg-surface">
                      {method === 'carte' ? (
                        <>
                          <CreditCard size={17} className="shrink-0 text-text-secondary" />
                          <input
                            id="demo-number"
                            type="text"
                            inputMode="numeric"
                            maxLength={19}
                            value={card}
                            onChange={(e) => setCard(e.target.value)}
                            placeholder="4242 •••• •••• 4242"
                            className="w-full border-none bg-transparent p-0 text-[14.5px] font-medium tracking-[0.01em] text-text-primary outline-none placeholder:text-text-secondary/50"
                          />
                        </>
                      ) : (
                        <>
                          <Smartphone size={17} className="shrink-0 text-text-secondary" />
                          <input
                            id="demo-number"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder={method === 'wave' ? '+221 77 123 45 67' : '+225 07 123 456 78'}
                            className="w-full border-none bg-transparent p-0 text-[14.5px] font-medium tracking-[0.01em] text-text-primary outline-none placeholder:text-text-secondary/50"
                          />
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={pay}
                    className={`mt-1 w-full cursor-pointer rounded-xl bg-accent-corail py-3.5 text-[14.5px] font-semibold tracking-[-0.005em] text-white hover:bg-accent-corail-hover ${PRESSABLE}`}
                  >
                    Payer 2 500 FCFA
                  </button>
                </motion.div>
              )}

              {state === 'paying' && (
                <motion.div key="paying" {...materialize} transition={SPRING.snappy} className="my-auto flex flex-col items-center gap-5 py-10 text-center">
                  <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-border-custom border-t-accent-corail motion-reduce:animate-none" />
                  <div className="flex flex-col gap-1.5 px-2">
                    <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-text-primary">
                      {method === 'carte' ? 'Validation 3D Secure…' : 'Envoi de la demande…'}
                    </h3>
                    <p className="text-[13px] leading-[1.6] text-text-secondary">
                      {method === 'carte'
                        ? 'Vérification en cours avec votre établissement bancaire.'
                        : 'Confirmez la transaction via la notification de votre opérateur.'}
                    </p>
                  </div>
                </motion.div>
              )}

              {state === 'success' && (
                <motion.div key="success" {...materialize} transition={SPRING.snappy} className="flex h-full flex-col justify-between gap-6 py-1">
                  <div className="my-auto flex flex-col items-center gap-4 px-2 text-center">
                    <motion.div
                      initial={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={reduce ? { duration: 0.2 } : SPRING.momentum}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600"
                    >
                      <Check size={30} className="stroke-[3]" />
                    </motion.div>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-display text-[20px] font-medium tracking-[-0.02em] text-text-primary">Paiement réussi</h3>
                      <p className="text-[13px] leading-[1.6] text-text-secondary">
                        Le guide a été déverrouillé et envoyé automatiquement.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={reset}
                    className={`w-full cursor-pointer rounded-xl border border-border-custom py-3 text-[13px] font-semibold text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary ${PRESSABLE}`}
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
/* Trois facons d'encaisser                                            */
/* ================================================================== */

const STREAMS = [
  {
    icon: ShoppingBag,
    title: 'Vendez vos contenus exclusifs',
    body: "Guides, formations, photos, vidéos. Vous fixez le prix, MomoLink encaisse et livre automatiquement dès le paiement validé, avec un lien signé qui expire au bout d'une heure.",
    tags: ['PDF', 'Vidéo', 'Audio', 'Photo', 'Archive ZIP'],
  },
  {
    icon: Heart,
    title: 'Dons et pourboires',
    body: 'Un don libre dès 1 000 FCFA depuis votre page, avec un message si le fan le souhaite.',
  },
  {
    icon: MessageCircle,
    title: 'Messages directs',
    body: 'Messages et propositions de partenariat, gratuits, centralisés dans votre tableau de bord.',
  },
];

function RevenueStreams() {
  const enter = useEnter();

  return (
    <section id="features" className="px-4 py-24 sm:py-32">
      <div className="mx-auto flex max-w-6xl flex-col gap-14">
        <motion.div {...enter(20)} className="flex max-w-2xl flex-col gap-4">
          <span className={EYEBROW}>Trois façons d'encaisser</span>
          <h2 className={H2}>Bien plus qu'une boutique.</h2>
        </motion.div>

        {/* Trois colonnes separees par un filet en tete : la hierarchie vient de la largeur
            (la vente de contenu, offre principale, occupe deux colonnes sur quatre) et non de
            cadres et de degrades. */}
        <div className="grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
          {STREAMS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.article
                key={s.title}
                {...enter(24, idx * 0.08)}
                className={`flex flex-col gap-4 border-t border-border-custom pt-7 ${idx === 0 ? 'md:col-span-2' : ''}`}
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${idx === 1 ? 'bg-accent-mango/15 text-success-gold' : 'bg-accent-corail/10 text-accent-corail'}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-display text-[22px] font-medium leading-tight tracking-[-0.02em] text-text-primary">{s.title}</h3>
                <p className="text-[15px] leading-[1.6] text-text-secondary">{s.body}</p>
                {s.tags && (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {s.tags.map((t) => (
                      <span key={t} className="rounded-full border border-border-custom bg-bg-surface px-3 py-1.5 text-[12px] font-semibold text-text-secondary">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Tarifs                                                              */
/* ================================================================== */

const PRICES = [
  { value: 'Gratuit', label: 'Inscription et création de boutique' },
  { value: '10 %', label: 'Commission par vente ou don réussi' },
  { value: '4 990 FCFA', unit: '/mois', label: 'MomoLink Pro, pour publier du contenu et demander des retraits' },
];

function Pricing() {
  const enter = useEnter();

  return (
    <section id="pricing" className="scroll-mt-24 px-4 py-24 sm:py-32">
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        <motion.div {...enter(20)} className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className={EYEBROW}>Tarifs</span>
          <h2 className={H2}>Sans Stripe. Sans PayPal. Sans blocage.</h2>
          <p className="max-w-xl text-[16px] leading-[1.6] text-text-secondary">
            La plupart des outils de monétisation imposent un compte Stripe ou PayPal, inaccessibles ou très limités en
            Afrique de l'Ouest et Centrale. MomoLink se branche sur ce que vos fans utilisent déjà tous les jours.
          </p>
        </motion.div>

        <motion.div {...enter(28, 0.06)} className={`${CARD} overflow-hidden`}>
          <div className="grid grid-cols-1 divide-y divide-border-custom md:grid-cols-3 md:divide-x md:divide-y-0">
            {PRICES.map((p) => (
              <div key={p.label} className="flex flex-col gap-2 p-8 sm:p-9">
                <span className="font-display text-[2.25rem] font-medium leading-none tracking-[-0.035em] text-text-primary tabular-nums">
                  {p.value}
                  {p.unit && <span className="ml-1 text-[15px] font-medium tracking-normal text-text-secondary">{p.unit}</span>}
                </span>
                <span className="text-[14.5px] leading-[1.55] text-text-secondary">{p.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-6 border-t border-border-custom bg-bg-primary/60 p-6 sm:flex-row sm:px-9">
            <ul className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
              {['Aucun frais caché, aucun engagement', 'Sécurisation contre le partage', "Zéro frais d'installation", 'Support réactif 24/7'].map((label) => (
                <li key={label} className="flex items-center gap-2 text-[14px] text-text-primary">
                  <Check size={15} className="shrink-0 text-accent-corail" />
                  {label}
                </li>
              ))}
            </ul>
            <Link
              to="/auth/signup"
              className={`shrink-0 rounded-full bg-accent-corail px-7 py-3.5 text-[14.5px] font-semibold text-white hover:bg-accent-corail-hover ${PRESSABLE}`}
            >
              Ouvrir ma boutique
            </Link>
          </div>
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
  // Toutes fermees a l'arrivee : une reponse deja ouverte se lit comme un bug d'affichage.
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="scroll-mt-24 px-4 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <motion.div {...enter(20)} className="flex flex-col gap-4 lg:col-span-4">
          <span className={EYEBROW}>Questions fréquentes</span>
          <h2 className="font-display text-[2.1rem] font-medium leading-[1.06] tracking-[-0.035em] text-text-primary sm:text-[2.6rem]">
            Tout ce que vous devez savoir.
          </h2>
          <p className="text-[15px] leading-[1.6] text-text-secondary">
            Une question qui n'est pas là ?{' '}
            <a href="mailto:support@momolink.pro" className="font-medium text-accent-corail hover:underline">
              Écrivez-nous
            </a>
            , on répond sous 24h.
          </p>
        </motion.div>

        <motion.div {...enter(20, 0.06)} className="flex flex-col border-t border-border-custom lg:col-span-8">
          {FAQ_DATA.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={faq.q} className="border-b border-border-custom">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left"
                >
                  <span className="text-[15.5px] font-semibold tracking-[-0.01em] text-text-primary">{faq.q}</span>
                  {/* Le meme signe tourne en croix : un seul objet, aller et retour */}
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={reduce ? { duration: 0.15 } : SPRING.snappy}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
                      isOpen ? 'border-accent-corail bg-accent-corail text-white' : 'border-border-custom text-text-secondary'
                    }`}
                  >
                    <Plus size={16} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={reduce ? { duration: 0.18 } : SPRING.ui}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-6 pr-12 text-[14.5px] leading-[1.65] text-text-secondary">{faq.a}</p>
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
/* Appel final + pied de page                                          */
/* ================================================================== */

function FinalCta() {
  const enter = useEnter();
  return (
    <section className="px-4 pb-24 pt-8 sm:pb-32">
      <motion.div
        {...enter(28)}
        className="relative mx-auto flex max-w-4xl flex-col items-center gap-7 overflow-hidden px-6 py-16 text-center"
      >
        <img src={LOGO_URL} alt="" className="h-14 w-14 rounded-2xl object-contain shadow-[0_14px_30px_-16px_rgba(109,40,217,0.6)]" />
        <h2 className="font-display max-w-3xl text-[2.4rem] font-medium leading-[1.02] tracking-[-0.04em] text-text-primary sm:text-[3.75rem] text-balance">
          Votre audience est déjà là. Faites-la payer.
        </h2>
        <p className="max-w-lg text-[16.5px] leading-[1.6] text-text-secondary">
          Ouvrez votre boutique en deux minutes, collez le lien dans votre bio, encaissez votre première vente ce soir.
        </p>

        <Link
          to="/auth/signup"
          className={`group flex items-center justify-center gap-2 rounded-full bg-accent-corail px-8 py-4 text-[15px] font-semibold tracking-[-0.01em] text-white shadow-[0_16px_34px_-16px_var(--color-accent-corail)] hover:bg-accent-corail-hover ${PRESSABLE}`}
        >
          Créer mon compte créateur
          <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>

        <div className="flex flex-col items-center gap-3 pt-2">
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
            Disponible dans {COUNTRY_COUNT} pays
          </span>
          <div className="flex max-w-2xl flex-wrap items-center justify-center gap-1.5">
            {COVERED_COUNTRIES.map((country) => (
              <span
                key={country.code}
                className="flex items-center gap-1.5 rounded-full border border-border-custom bg-bg-surface px-3 py-1 text-[12.5px] font-medium text-text-secondary"
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
    <footer className="border-t border-border-custom px-6 py-14">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="" className="h-7 w-7 rounded-md object-contain" />
            <span className="font-display text-[15px] font-medium tracking-[-0.02em] text-text-primary">MomoLink</span>
          </div>
          <p className="text-[13.5px] leading-[1.6] text-text-secondary">
            La plateforme pour monétiser vos contenus exclusifs en Afrique de l'Ouest et Centrale avec le Mobile Money.
          </p>
          <span className="text-[12px] text-text-secondary">© {new Date().getFullYear()} MomoLink Inc. Tous droits réservés.</span>
        </div>

        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <h4 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-text-primary">{col.title}</h4>
            <div className="flex flex-col gap-2">
              {col.links.map((link) =>
                'to' in link ? (
                  <Link key={link.label} to={link.to} className="text-[13.5px] text-text-secondary transition-colors duration-150 hover:text-accent-corail">
                    {link.label}
                  </Link>
                ) : (
                  <a key={link.label} href={link.href} className="text-[13.5px] text-text-secondary transition-colors duration-150 hover:text-accent-corail">
                    {link.label}
                  </a>
                ),
              )}
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-3">
          <h4 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-text-primary">Disponibilité et support</h4>
          <p className="text-[13.5px] leading-[1.6] text-text-secondary">
            Support 24/7 par email :{' '}
            <a href="mailto:support@momolink.pro" className="font-medium text-accent-corail hover:underline">
              support@momolink.pro
            </a>
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {COVERED_COUNTRIES.map((country) => (
              <span
                key={country.code}
                title={country.name}
                className="flex items-center gap-1 rounded-md border border-border-custom bg-bg-surface px-2 py-1 text-[12px] font-semibold text-text-secondary"
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
  // Les liens d'ancre de la navigation glissent jusqu'a leur section ; reglage limite a cette
  // page et coupe quand le visiteur a demande moins d'animations.
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'smooth';
    return () => {
      root.style.scrollBehavior = previous;
    };
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary font-sans text-text-primary">
      <Nav />
      <main>
        <Hero />
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

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import Confetti from './Confetti';

interface TourStep {
  target: string | null; // matches a data-tour="..." attribute, or null for an untargeted intro step
  /** Used instead of `target` when the viewport is narrower than 768px, if the desktop target is hidden on mobile */
  mobileTarget?: string;
  title: string;
  description: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: null,
    title: 'Bienvenue sur votre dashboard !',
    description: "Petit tour rapide pour vous montrer où se trouve tout ce dont vous avez besoin. Vous pouvez le passer à tout moment."
  },
  {
    target: 'stat-cards',
    title: 'Vos statistiques',
    description: "Suivez vos revenus, vos dons reçus et vos contenus publiés en un coup d'œil."
  },
  {
    target: 'add-content-btn',
    mobileTarget: 'mobile-add-content-btn',
    title: 'Ajoutez du contenu',
    description: "Appuyez ici pour mettre en vente votre premier PDF, vidéo, audio ou photo."
  },
  {
    target: 'sidebar-nav',
    mobileTarget: 'mobile-menu-btn',
    title: 'Votre menu',
    description: "Retrouvez vos ventes, vos dons, vos retraits, vos messages et vos paramètres ici."
  },
  {
    target: 'header-visit-shop',
    mobileTarget: 'mobile-shop-menu',
    title: 'Partagez votre boutique',
    description: "Visitez votre profil public ou copiez son lien pour le partager sur vos réseaux et commencer à vendre."
  }
];

interface GuidedTourProps {
  /** localStorage key used to remember the tour was completed/skipped, e.g. `momo_tour_seen_${profileId}` */
  storageKey: string;
  /** Only auto-starts once this is true (e.g. once dashboard data has finished loading) */
  active: boolean;
}

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

const MOBILE_BREAKPOINT = 768;
const PADDING = 8;

export default function GuidedTour({ storageKey, active }: GuidedTourProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!active) return;
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(storageKey)) return;
    const timer = setTimeout(() => setIsRunning(true), 700);
    return () => clearTimeout(timer);
  }, [active, storageKey]);

  const currentStep = TOUR_STEPS[stepIndex];

  // Measures the target's final position: scrolls it into view instantly (no animation to race
  // against), then waits two animation frames so layout/paint has settled before reading the rect.
  const updateBox = useCallback(() => {
    setViewport({ width: window.innerWidth, height: window.innerHeight });

    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const selector = (isMobile && currentStep.mobileTarget) ? currentStep.mobileTarget : currentStep.target;

    if (!selector) {
      setBox(null);
      return;
    }
    const el = document.querySelector(`[data-tour="${selector}"]`) as HTMLElement | null;
    if (!el) {
      setBox(null);
      return;
    }

    const margin = 110;
    const initial = el.getBoundingClientRect();
    const isInView = initial.top >= margin && initial.bottom <= window.innerHeight - margin;
    if (!isInView) {
      el.scrollIntoView({ block: 'center', behavior: 'auto' });
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        setBox({
          top: r.top - PADDING,
          left: r.left - PADDING,
          width: r.width + PADDING * 2,
          height: r.height + PADDING * 2
        });
      });
    });
  }, [currentStep]);

  useEffect(() => {
    if (!isRunning) return;
    updateBox();
    window.addEventListener('resize', updateBox);
    return () => window.removeEventListener('resize', updateBox);
  }, [isRunning, updateBox]);

  const dismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setIsRunning(false);
  };

  const complete = () => {
    localStorage.setItem(storageKey, 'true');
    setIsRunning(false);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
  };

  const goNext = () => {
    if (stepIndex < TOUR_STEPS.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      complete();
    }
  };

  const goPrev = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  if (!isRunning) return <Confetti active={showConfetti} />;

  const isLastStep = stepIndex === TOUR_STEPS.length - 1;
  // Put the tooltip on the opposite half of the screen from the highlighted element,
  // so the card never covers the very thing it's explaining.
  const tooltipAtTop = !!box && box.top > viewport.height / 2;

  const dimClass = 'fixed bg-[#0F0C0A]/72 pointer-events-none z-[200]';

  return (
    <>
      <AnimatePresence>
        {box ? (
          // Four-box overlay: dims everything around the target while leaving the target
          // itself fully uncovered (no element sits on top of it, unlike a box-shadow cutout).
          <div key="dim">
            <div className={dimClass} style={{ top: 0, left: 0, right: 0, height: Math.max(0, box.top) }} />
            <div className={dimClass} style={{ top: box.top + box.height, left: 0, right: 0, bottom: 0 }} />
            <div className={dimClass} style={{ top: box.top, left: 0, width: Math.max(0, box.left), height: box.height }} />
            <div className={dimClass} style={{ top: box.top, left: box.left + box.width, right: 0, height: box.height }} />
            <motion.div
              initial={false}
              animate={{ top: box.top, left: box.left, width: box.width, height: box.height }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed rounded-2xl border-2 border-accent-corail pointer-events-none z-[201]"
              style={{ boxShadow: '0 0 0 3px rgba(225,79,48,0.25)' }}
            />
          </div>
        ) : (
          <div key="dim-full" className={dimClass} style={{ inset: 0 }} />
        )}

        <motion.div
          key={`tooltip-${stepIndex}`}
          initial={{ opacity: 0, y: tooltipAtTop ? -20 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={`fixed left-1/2 -translate-x-1/2 w-[92vw] max-w-sm bg-bg-surface border border-border-custom rounded-2xl p-5 shadow-2xl z-[210] ${
            tooltipAtTop ? 'top-20' : 'bottom-6'
          }`}
        >
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-primary transition-all cursor-pointer"
            title="Passer le tour"
          >
            <X size={14} />
          </button>

          <span className="text-[10px] font-bold uppercase tracking-widest text-accent-corail">
            Étape {stepIndex + 1} / {TOUR_STEPS.length}
          </span>
          <h3 className="font-display text-base font-semibold text-text-primary mt-1">{currentStep.title}</h3>
          <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">{currentStep.description}</p>

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={dismiss}
              className="text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              Passer le tour
            </button>

            <div className="flex items-center gap-2">
              {stepIndex > 0 && (
                <button
                  onClick={goPrev}
                  className="p-2 rounded-full border border-border-custom text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                >
                  <ArrowLeft size={14} />
                </button>
              )}
              <button
                onClick={goNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent-corail text-white text-xs font-bold hover:bg-accent-corail-hover transition-all cursor-pointer"
              >
                {isLastStep ? 'Terminer' : 'Suivant'}
                {!isLastStep && <ArrowRight size={12} />}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <Confetti active={showConfetti} />
    </>
  );
}

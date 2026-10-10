import { useEffect, useState, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

/**
 * Compteur qui defile jusqu'a sa valeur quand il entre dans le viewport.
 *
 * Le declencheur doit avoir un chemin de secours. Avec un seul IntersectionObserver cree au
 * montage, il suffisait qu'il rate son declenchement pour que le compteur reste bloque a zero
 * definitivement — et sur mobile il avait toutes les raisons de le rater : la page charge deux
 * polices distantes et une dizaine d'images, donc la mise en page se decale apres que
 * l'observateur a calcule sa position initiale. D'ou trois garde-fous :
 *
 *   1. si l'element est deja visible au montage, on demarre sans attendre l'observateur ;
 *   2. on revalide une fois la page entierement chargee, quand les decalages ont eu lieu ;
 *   3. la derniere image pose la valeur exacte, pour qu'une interruption ne laisse jamais un
 *      nombre approximatif a l'ecran.
 */
export function AnimatedCounter({ value, duration = 1500, suffix = '', prefix = '', decimals = 0 }: AnimatedCounterProps) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const run = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      // Mouvement reduit : on montre le chiffre, on ne le fait pas defiler.
      if (reduce) {
        setCount(value);
        return;
      }

      let start: number | null = null;
      const step = (timestamp: number) => {
        if (start === null) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        if (progress < 1) {
          setCount(progress * (2 - progress) * value); // easeOutQuad
          frameRef.current = requestAnimationFrame(step);
        } else {
          setCount(value);
        }
      };
      frameRef.current = requestAnimationFrame(step);
    };

    const isVisible = () => {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    };

    if (isVisible()) {
      run();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          run();
          observer.disconnect();
        }
      },
      // Seuil a 0 : le moindre pixel visible suffit. A 0.1, un element rogne par un parent
      // pouvait ne jamais franchir le seuil.
      { threshold: 0 },
    );
    observer.observe(el);

    const onLoad = () => {
      if (isVisible()) {
        run();
        observer.disconnect();
      }
    };
    window.addEventListener('load', onLoad);

    return () => {
      observer.disconnect();
      window.removeEventListener('load', onLoad);
    };
  }, [value, duration, reduce]);

  // Sans annulation, la boucle continue d'appeler setCount sur un composant demonte.
  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const formatNumber = (num: number) => {
    const fixed = num.toFixed(decimals);
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return parts.join('.');
  };

  return (
    <span ref={containerRef} className="tabular-nums">
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  );
}

/**
 * Les chiffres de la plateforme, en une rangee sobre : quatre nombres et leur legende, separes
 * par des filets. Ce sont des valeurs fixes, d'ou l'intitule « en chiffres » plutot qu'un
 * « en direct » qui promettait des donnees temps reel.
 */
export default function PlatformImpact() {
  const reduce = useReducedMotion();

  const stats = [
    { id: 'stat-creators', label: 'Créateurs actifs', value: 520, suffix: '+', decimals: 0 },
    { id: 'stat-volume', label: 'FCFA encaissés', value: 12.8, suffix: ' M+', decimals: 1 },
    { id: 'stat-transactions', label: 'Paiements réussis', value: 14200, suffix: '+', decimals: 0 },
    { id: 'stat-speed', label: 'Fichiers livrés automatiquement', value: 100, suffix: ' %', decimals: 0 },
  ];

  return (
    <section id="platform-impact" className="px-4 py-20 sm:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <p className="text-center text-[12px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
          MomoLink en chiffres
        </p>
        <div className="grid grid-cols-2 gap-y-10 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.id}
              id={stat.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={reduce ? { duration: 0.2 } : { type: 'spring', bounce: 0, duration: 0.5, delay: idx * 0.07 }}
              className={`flex flex-col items-center gap-1.5 px-4 text-center ${idx % 2 === 1 ? 'border-l border-border-custom' : ''} ${idx === 2 ? 'lg:border-l' : ''}`}
            >
              <span className="font-display text-[2.25rem] font-medium leading-none tracking-[-0.035em] text-text-primary sm:text-[2.75rem]">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
              </span>
              <span className="text-[13.5px] text-text-secondary">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

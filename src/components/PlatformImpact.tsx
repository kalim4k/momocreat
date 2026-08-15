import { useEffect, useState, useRef } from 'react';
import { Users, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
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

export default function PlatformImpact() {
  const { isDarkMode, styles } = useTheme();

  const stats = [
    {
      id: 'stat-creators',
      label: 'Créateurs actifs',
      value: 520,
      suffix: '+',
      decimals: 0,
      description: 'Entrepreneurs, influenceurs et formateurs en Afrique francophone.',
      icon: Users,
      colorClass: 'text-accent-corail bg-accent-corail/10',
    },
    {
      id: 'stat-volume',
      label: 'Volume de ventes',
      value: 12.8,
      suffix: 'M+ FCFA',
      decimals: 1,
      description: 'Générés directement dans les wallets mobiles des créateurs.',
      icon: TrendingUp,
      colorClass: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      id: 'stat-transactions',
      label: 'Transactions sécurisées',
      value: 14200,
      suffix: '+',
      decimals: 0,
      description: 'Paiements par Mobile Money et Cartes traités avec succès.',
      icon: ShieldCheck,
      colorClass: 'text-blue-500 bg-blue-500/10',
    },
    {
      id: 'stat-speed',
      label: 'Taux de livraison',
      value: 100,
      suffix: '%',
      decimals: 0,
      description: 'Fichiers livrés instantanément par mail ou téléchargement.',
      icon: Zap,
      colorClass: 'text-success-gold bg-success-gold/10',
    },
  ];

  return (
    <section id="platform-impact" className={`border-t ${styles.border} py-20 px-4 transition-colors duration-300`}>
      <div className="max-w-6xl w-full mx-auto flex flex-col gap-12">
        
        {/* Section Header */}
        <div className="text-center flex flex-col gap-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-corail/10 text-accent-corail text-[11px] font-bold tracking-wider uppercase mx-auto">
            Statistiques en direct
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-medium text-text-primary tracking-tight leading-tight">
            La plateforme de confiance pour monétiser vos contenus
          </h2>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            Rejoignez la nouvelle génération de créateurs africains qui développent leur activité de manière professionnelle, sécurisée et 100% automatisée.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.id}
                id={stat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`p-6 sm:p-8 rounded-[20px] border ${styles.surface} flex flex-col gap-4 transition-all duration-300 hover:shadow-md hover:border-accent-corail/30 group`}
              >
                {/* Icon wrapper */}
                <div className={`p-3 rounded-xl w-fit ${stat.colorClass} transition-transform duration-300 group-hover:scale-110`}>
                  <IconComponent size={24} />
                </div>

                {/* Counter and Label */}
                <div className="flex flex-col gap-1 mt-2">
                  <span className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary">
                    <AnimatedCounter 
                      value={stat.value} 
                      suffix={stat.suffix} 
                      decimals={stat.decimals} 
                    />
                  </span>
                  <span className="text-sm font-semibold text-text-primary">
                    {stat.label}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-text-secondary leading-relaxed">
                  {stat.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

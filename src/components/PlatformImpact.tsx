import { useEffect, useState, useRef } from 'react';
import { Users, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'motion/react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

export function AnimatedCounter({ value, duration = 1500, suffix = '', prefix = '', decimals = 0 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = progress * (2 - progress); // easeOutQuad
      
      const currentVal = easeProgress * value;
      setCount(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, hasStarted]);

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

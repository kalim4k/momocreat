import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const COLORS = ['#E14F30', '#F2B84B', '#9333EA', '#22C55E', '#3B82F6', '#EC4899'];
const PARTICLE_COUNT = 60;

interface Particle {
  id: number;
  left: number;
  color: string;
  size: number;
  rotate: number;
  duration: number;
  delay: number;
  drift: number;
}

export default function Confetti({ active }: { active: boolean }) {
  const particles = useMemo<Particle[]>(() => {
    if (!active) return [];
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 6,
      rotate: Math.random() * 360,
      duration: 1.6 + Math.random() * 1.2,
      delay: Math.random() * 0.3,
      drift: (Math.random() - 0.5) * 200
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 z-[220] pointer-events-none overflow-hidden">
          {particles.map((p) => (
            <motion.span
              key={p.id}
              initial={{ top: '-5%', left: `${p.left}%`, opacity: 1, rotate: 0 }}
              animate={{ top: '105%', left: `${p.left}%`, x: p.drift, opacity: [1, 1, 0], rotate: p.rotate }}
              transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.size * 0.4,
                backgroundColor: p.color,
                borderRadius: 2
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const COLORS = ['#FF6B4A', '#FFC542', '#7C3AED', '#10B981', '#3B82F6', '#EC4899'];

interface ConfettiPiece {
  id: number;
  left: number; // vw
  delay: number;
  duration: number;
  color: string;
  rotate: number;
  drift: number;
  size: number;
  isRound: boolean;
}

/** Fullscreen, non-interactive confetti burst. Mount with `active` toggled true briefly. */
export default function ConfettiBurst({ active }: { active: boolean }) {
  const pieces = useMemo<ConfettiPiece[]>(() => {
    return Array.from({ length: 70 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.3,
      duration: 1.4 + Math.random() * 0.9,
      color: COLORS[i % COLORS.length],
      rotate: Math.random() * 360,
      drift: (Math.random() - 0.5) * 160,
      size: 6 + Math.random() * 6,
      isRound: Math.random() > 0.5
    }));
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden" aria-hidden="true">
          {pieces.map((p) => (
            <motion.span
              key={p.id}
              initial={{ y: '-10vh', x: 0, opacity: 1, rotate: 0 }}
              animate={{ y: '110vh', x: p.drift, opacity: [1, 1, 0], rotate: p.rotate }}
              exit={{ opacity: 0 }}
              transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
              style={{
                position: 'absolute',
                left: `${p.left}vw`,
                top: 0,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: p.isRound ? '9999px' : '2px'
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

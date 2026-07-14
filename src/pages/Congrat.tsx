import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function Congrat() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#14120F] text-[#FAFAF8] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative premium glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-success-gold/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[480px] bg-[#1E1B17]/40 backdrop-blur-xl border border-neutral-800/60 rounded-[32px] p-10 flex flex-col items-center text-center shadow-2xl relative z-10"
      >
        {/* Animated Check badge matching success color */}
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 bg-success-gold/10 text-success-gold rounded-full border border-success-gold/20 flex items-center justify-center mb-8 shadow-inner"
        >
          <Check size={40} strokeWidth={2.5} />
        </motion.div>

        {/* Header / Text */}
        <div className="flex flex-col gap-3 mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-success-gold">
            Félicitations !
          </h1>
          <p className="text-sm text-neutral-400 max-w-[320px] mx-auto leading-relaxed">
            Votre paiement a été validé avec succès.
          </p>
          <p className="text-xs text-neutral-500 max-w-[280px] mx-auto leading-relaxed mt-2 border-t border-neutral-800/40 pt-4">
            (Cette page sera mise à jour avec vos détails personnalisés très bientôt.)
          </p>
        </div>

        {/* Minimal action button */}
        <div className="w-full">
          <button
            onClick={() => navigate('/pay')}
            className="w-full py-3.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-[#FAFAF8] bg-transparent hover:bg-white/5 transition-all cursor-pointer border border-neutral-800"
          >
            Retour à l'accueil
          </button>
        </div>
      </motion.div>
    </div>
  );
}

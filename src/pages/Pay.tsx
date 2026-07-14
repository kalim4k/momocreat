import React, { useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Pay() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/payment/create-anonymous-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Impossible d\'initier le paiement. Veuillez réessayer.');
      }

      const data = await response.json();
      if (data.redirectUrl && data.cartId) {
        sessionStorage.setItem('anonymous_payment_cart_id', data.cartId);
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('Données de redirection ou identifiant de panier manquants.');
      }
    } catch (err: any) {
      console.error('[Pay] Error initiating payment:', err);
      setError(err.message || 'Une erreur est survenue.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#14120F] text-[#FAFAF8] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium background glowing halos */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-corail/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-success-gold/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px] bg-[#1E1B17]/40 backdrop-blur-xl border border-neutral-800/60 rounded-[32px] p-10 flex flex-col items-center shadow-2xl relative z-10"
      >
        {/* Subtle decorative top line */}
        <div className="w-12 h-1 bg-gradient-to-r from-accent-corail to-success-gold rounded-full mb-8 opacity-60" />

        {/* Minimalist Button container */}
        <div className="w-full flex flex-col items-center gap-4">
          <motion.button
            onClick={handlePayment}
            disabled={isLoading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-2xl text-sm font-bold text-white bg-accent-corail hover:bg-accent-corail-hover transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group font-display tracking-wide uppercase"
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <>
                <span>Continuer</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </motion.button>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-red-400 mt-2 text-center"
            >
              {error}
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

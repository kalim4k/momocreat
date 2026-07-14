import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, X, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function PayConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cartId = searchParams.get('cartId') || sessionStorage.getItem('anonymous_payment_cart_id');

  const [status, setStatus] = useState<'loading' | 'failed' | 'timeout'>('loading');
  const [attempts, setAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!cartId) {
      setStatus('failed');
      setErrorMessage('Paramètre de transaction manquant.');
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/payment/check-anonymous-status?cartId=${cartId}`);
        if (!response.ok) {
          throw new Error('Erreur de communication avec le serveur.');
        }

        const data = await response.json();

        if (data.status === 'completed') {
          setStatus('loading'); // keep loading while redirecting
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          // Redirect immediately to congrat
          navigate('/congrat', { replace: true });
        } else if (data.status === 'failed') {
          setStatus('failed');
          setErrorMessage('Le paiement a été rejeté ou annulé par l\'opérateur.');
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
        } else {
          // 'waiting_payment'
          setAttempts(prev => {
            const nextAttempts = prev + 1;
            if (nextAttempts >= 6) { // ~18 seconds total polling time
              setStatus('timeout');
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
              }
            }
            return nextAttempts;
          });
        }
      } catch (err: any) {
        console.error('[PayConfirm] Error verifying payment:', err);
        // Do not fail immediately on minor network glitch
      }
    };

    // Initial check
    checkPaymentStatus();

    // Start polling every 3 seconds
    pollIntervalRef.current = setInterval(() => {
      checkPaymentStatus();
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [cartId, navigate]);

  const handleRetry = () => {
    navigate('/pay');
  };

  return (
    <div className="min-h-screen bg-[#14120F] text-[#FAFAF8] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent-corail/5 rounded-full blur-[80px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] bg-[#1E1B17]/60 backdrop-blur-xl border border-neutral-800/80 rounded-[28px] p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
      >
        {/* LOADING STATE */}
        {status === 'loading' && (
          <div className="py-6 flex flex-col items-center gap-6">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full border-4 border-accent-corail/10 animate-ping" />
              <Loader2 className="animate-spin text-accent-corail h-12 w-12" />
            </div>
            
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-xl font-bold tracking-tight">Vérification en cours...</h1>
              <p className="text-sm text-neutral-400 max-w-[300px] leading-relaxed">
                Nous confirmons la transaction auprès de l'opérateur. Veuillez ne pas fermer cette page.
              </p>
            </div>
            
            <div className="px-4 py-1.5 rounded-full bg-neutral-900/60 border border-neutral-800 text-[10px] font-mono text-neutral-500">
              Vérification {attempts + 1} / 6
            </div>
          </div>
        )}

        {/* TIMEOUT STATE */}
        {status === 'timeout' && (
          <div className="py-4 flex flex-col items-center gap-6">
            <div className="p-4 bg-yellow-500/10 text-yellow-500 rounded-full border border-yellow-500/20">
              <AlertTriangle size={36} />
            </div>
            
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-xl font-bold tracking-tight text-yellow-500">Délai dépassé</h1>
              <p className="text-sm text-neutral-400 max-w-[340px] leading-relaxed">
                La confirmation prend plus de temps que prévu. Si vous avez validé le paiement, il sera traité sous peu.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full mt-4">
              <button
                onClick={handleRetry}
                className="w-full py-3.5 rounded-xl text-xs font-semibold text-white bg-accent-corail hover:bg-accent-corail-hover transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Retour</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* FAILED STATE */}
        {status === 'failed' && (
          <div className="py-4 flex flex-col items-center gap-6">
            <div className="p-4 bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
              <X size={36} />
            </div>
            
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-xl font-bold tracking-tight text-red-500">Échec du paiement</h1>
              <p className="text-sm text-neutral-400 max-w-[340px] leading-relaxed">
                {errorMessage || 'La transaction n\'a pas pu être validée.'}
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full mt-4">
              <button
                onClick={handleRetry}
                className="w-full py-3.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-[#FAFAF8] bg-transparent hover:bg-white/5 transition-all cursor-pointer border border-neutral-800"
              >
                Réessayer le paiement
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

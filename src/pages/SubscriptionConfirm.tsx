/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Check, 
  X, 
  Loader2, 
  ArrowRight, 
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

export default function SubscriptionConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const cartId = searchParams.get('cartId');
  const creatorId = searchParams.get('creatorId');

  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'timeout'>('loading');
  const [attempts, setAttempts] = useState(0);
  const [endDate, setEndDate] = useState('');
  const [restoredCount, setRestoredCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!cartId || !creatorId) {
      setStatus('failed');
      setErrorMessage('Paramètres d\'abonnement manquants.');
      return;
    }

    const checkSubscriptionStatus = async () => {
      try {
        const response = await fetch(`/api/subscription/check-status?cartId=${cartId}&creatorId=${creatorId}`);
        if (!response.ok) {
          throw new Error('Erreur de communication avec le serveur.');
        }

        const data = await response.json();
        
        if (data.endDate) {
          try {
            const formattedDate = new Date(data.endDate).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });
            setEndDate(formattedDate);
          } catch (e) {
            setEndDate(data.endDate);
          }
        }
        
        if (data.restoredCount !== undefined) {
          setRestoredCount(data.restoredCount);
        }

        if (data.status === 'completed') {
          setStatus('success');
          
          // In Demo Mode, restore any auto-drafted local storage contents
          const isDemoMode = localStorage.getItem('momo_creator_profile') !== null;
          if (isDemoMode) {
            const localContentsStr = localStorage.getItem('momo_local_contents');
            if (localContentsStr) {
              const contents = JSON.parse(localContentsStr);
              let restored = 0;
              const updated = contents.map((c: any) => {
                if (c.auto_drafted_by_subscription === true) {
                  restored++;
                  return { ...c, status: 'published', is_published: true, auto_drafted_by_subscription: false };
                }
                return c;
              });
              if (restored > 0) {
                localStorage.setItem('momo_local_contents', JSON.stringify(updated));
                setRestoredCount(restored);
              }
            }
          }
          
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
        } else if (data.status === 'failed') {
          setStatus('failed');
          setErrorMessage('La transaction a échoué ou a été annulée.');
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
        } else {
          // 'waiting_payment'
          setAttempts(prev => {
            const nextAttempts = prev + 1;
            if (nextAttempts >= 6) {
              setStatus('timeout');
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
              }
            }
            return nextAttempts;
          });
        }
      } catch (err: any) {
        console.error('Error verifying subscription payment:', err);
      }
    };

    // Initial check
    checkSubscriptionStatus();

    // Start polling every 3 seconds
    pollIntervalRef.current = setInterval(() => {
      checkSubscriptionStatus();
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [cartId, creatorId]);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleRetry = () => {
    navigate('/dashboard/subscription');
  };

  return (
    <div className="min-h-screen bg-[#14120F] text-[#FAFAF8] flex items-center justify-center p-4">
      <div id="subscription-confirm-card" className="w-full max-w-[480px] bg-[#1E1B17] border border-neutral-800 rounded-[28px] p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
        
        {/* Glow decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-accent-corail/10 rounded-full blur-[60px] pointer-events-none" />

        {/* LOADING STATE */}
        {status === 'loading' && (
          <div className="py-6 flex flex-col items-center gap-6">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full border-4 border-accent-corail/10 animate-ping" />
              <Loader2 className="animate-spin text-accent-corail h-12 w-12" />
            </div>
            
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-xl font-bold tracking-tight">Validation de l'abonnement...</h1>
              <p className="text-sm text-neutral-400 max-w-[320px] leading-relaxed">
                Nous vérifions votre paiement de 5 000 FCFA auprès de l'opérateur. Veuillez patienter.
              </p>
            </div>
            
            <div className="px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-500">
              Tentative {attempts + 1} / 6
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
              <h1 className="font-display text-xl font-bold tracking-tight text-yellow-500">Paiement en attente</h1>
              <p className="text-sm text-neutral-400 max-w-[340px] leading-relaxed">
                Le délai de vérification automatique est dépassé, mais la transaction est toujours en cours de traitement.
              </p>
              <p className="text-xs text-neutral-500 mt-2 max-w-[320px] leading-relaxed">
                Votre abonnement sera activé dès réception de la confirmation. Vous pouvez retourner au tableau de bord.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full mt-4">
              <button
                onClick={handleGoToDashboard}
                className="w-full py-3.5 rounded-xl text-xs font-semibold text-white bg-accent-corail hover:bg-accent-corail-hover transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Aller au tableau de bord</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <div className="py-4 flex flex-col items-center gap-6">
            {/* Circle Checkmark in Gold #F2B84B */}
            <div className="p-4 bg-[#F2B84B]/10 text-[#F2B84B] rounded-full border border-[#F2B84B]/20">
              <Check size={40} strokeWidth={2.5} />
            </div>
            
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-[#F2B84B]">Abonnement activé !</h1>
              <p className="text-sm text-neutral-400 max-w-[340px] leading-relaxed">
                Vous pouvez maintenant publier du contenu exclusif jusqu'au <span className="text-[#FAFAF8] font-semibold">{endDate || 'prochain mois'}</span>.
              </p>
              {restoredCount > 0 && (
                <div className="mt-3 p-3 bg-[#4CAF50]/10 border border-[#4CAF50]/20 rounded-xl text-xs text-[#4CAF50] font-medium leading-relaxed max-w-[340px]">
                  {restoredCount} contenu(s) précédemment dépublié(s) ont été remis en ligne automatiquement.
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 w-full mt-6">
              <button
                onClick={handleGoToDashboard}
                className="w-full py-3.5 rounded-xl text-xs font-bold text-black bg-[#F2B84B] hover:bg-[#e0a941] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
              >
                <span>Aller au dashboard</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* FAILED STATE */}
        {status === 'failed' && (
          <div className="py-4 flex flex-col items-center gap-6">
            <div className="p-4 bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
              <X size={40} strokeWidth={2.5} />
            </div>
            
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-xl font-bold tracking-tight text-red-500">Échec du paiement</h1>
              <p className="text-sm text-neutral-400 max-w-[340px] leading-relaxed">
                {errorMessage || "Le paiement de votre abonnement a échoué."}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Aucun montant n'a été débité de votre compte.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full mt-6">
              <button
                onClick={handleRetry}
                className="w-full py-3.5 rounded-xl text-xs font-bold text-[#FAFAF8] bg-accent-corail hover:bg-accent-corail-hover transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
              >
                <RotateCcw size={14} />
                <span>Réessayer</span>
              </button>
              
              <button
                onClick={handleGoToDashboard}
                className="w-full py-3.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-[#FAFAF8] bg-transparent hover:bg-white/5 transition-all cursor-pointer border border-neutral-800"
              >
                Retour au dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

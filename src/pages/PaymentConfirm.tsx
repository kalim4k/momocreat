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
import { motion } from 'motion/react';

export default function PaymentConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const cartId = searchParams.get('cartId');
  const purchaseId = searchParams.get('purchaseId');

  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'timeout'>('loading');
  const [attempts, setAttempts] = useState(0);
  const [contentTitle, setContentTitle] = useState('');
  const [contentId, setContentId] = useState('');
  const [creatorUsername, setCreatorUsername] = useState('michella_coaching');
  const [errorMessage, setErrorMessage] = useState('');

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!cartId || !purchaseId) {
      setStatus('failed');
      setErrorMessage('Paramètres de transaction manquants.');
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/payment/check-status?cartId=${cartId}&purchaseId=${purchaseId}`);
        if (!response.ok) {
          throw new Error('Erreur de communication avec le serveur.');
        }

        const data = await response.json();
        
        if (data.contentTitle) setContentTitle(data.contentTitle);
        if (data.contentId) setContentId(data.contentId);
        if (data.creatorUsername) setCreatorUsername(data.creatorUsername);

        if (data.status === 'completed') {
          setStatus('success');
          
          // Auto-save buyer session details so they are authenticated as buyers back on the profile
          if (data.buyerEmail) {
            localStorage.setItem('momo_buyer_email', data.buyerEmail);
          }
          if (data.buyerPhone) {
            localStorage.setItem('momo_buyer_phone', data.buyerPhone);
          }
          
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
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
            if (nextAttempts >= 5) {
              setStatus('timeout');
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
              }
            }
            return nextAttempts;
          });
        }
      } catch (err: any) {
        console.error('Error verifying payment:', err);
        // Do not fail immediately on a network glitch during polling
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
  }, [cartId, purchaseId]);

  const handleRetry = () => {
    navigate(`/@${creatorUsername}`);
  };

  const handleViewContent = () => {
    navigate(`/content/${contentId}`);
  };

  return (
    <div className="min-h-screen bg-[#14120F] text-[#FAFAF8] flex items-center justify-center p-4">
      <div id="payment-confirm-card" className="w-full max-w-[480px] bg-[#1E1B17] border border-neutral-800 rounded-[28px] p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
        
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
              <h1 className="font-display text-xl font-bold tracking-tight">Vérification du paiement...</h1>
              <p className="text-sm text-neutral-400 max-w-[320px] leading-relaxed">
                Nous interrogeons l'opérateur pour confirmer votre transaction. Veuillez patienter.
              </p>
            </div>
            
            <div className="px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-500">
              Tentative {attempts + 1} / 5
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
              <h1 className="font-display text-xl font-bold tracking-tight text-yellow-500">Paiement en cours de traitement</h1>
              <p className="text-sm text-neutral-400 max-w-[340px] leading-relaxed">
                Le délai de vérification est dépassé, mais la transaction est toujours en attente côté opérateur.
              </p>
              <p className="text-xs text-neutral-500 mt-2 max-w-[320px] leading-relaxed">
                Paiement en cours de vérification, vérifiez votre email dans quelques minutes pour accéder au contenu.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full mt-4">
              <button
                onClick={handleRetry}
                className="w-full py-3.5 rounded-xl text-xs font-semibold text-white bg-accent-corail hover:bg-accent-corail-hover transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Retour au profil</span>
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
              <h1 className="font-display text-2xl font-bold tracking-tight text-[#F2B84B]">Paiement réussi !</h1>
              <p className="text-sm text-neutral-400 max-w-[340px] leading-relaxed">
                Votre contenu <strong className="text-[#FAFAF8]">{contentTitle || 'exclusif'}</strong> est maintenant disponible.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full mt-6">
              <button
                onClick={handleViewContent}
                className="w-full py-3.5 rounded-xl text-xs font-bold text-black bg-[#F2B84B] hover:bg-[#e0a941] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
              >
                <span>Voir le contenu</span>
                <ArrowRight size={14} />
              </button>
              
              <button
                onClick={handleRetry}
                className="w-full py-3.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-[#FAFAF8] bg-transparent hover:bg-white/5 transition-all cursor-pointer border border-neutral-800"
              >
                Retour au profil
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
              <h1 className="font-display text-xl font-bold tracking-tight text-red-500">Paiement non abouti</h1>
              <p className="text-sm text-neutral-400 max-w-[340px] leading-relaxed">
                {errorMessage || "Le paiement n'a pas pu être validé."}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Aucun montant n'a été débité.
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
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

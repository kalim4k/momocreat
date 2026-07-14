/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function BuyerPortal() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If buyer session is already active, redirect them to their purchases
  useEffect(() => {
    const existingEmail = sessionStorage.getItem('buyer_email');
    if (existingEmail) {
      navigate('/portal/purchases');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setErrorMsg('Veuillez entrer une adresse email valide.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/portal/verify?email=${encodeURIComponent(emailTrimmed)}`);
      if (!res.ok) {
        throw new Error('Une erreur s’est produite lors de la vérification.');
      }

      const data = await res.json();
      if (data.exists) {
        // Active buyer session stored in sessionStorage as per Étape 10b specs
        sessionStorage.setItem('buyer_email', emailTrimmed);
        navigate('/portal/purchases');
      } else {
        setErrorMsg('Aucun achat trouvé pour cet email.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Impossible de se connecter au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1815] flex flex-col justify-between items-center px-4 py-8 relative overflow-hidden font-sans">
      
      {/* Ambient background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent-corail/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-success-gold/5 blur-[120px] pointer-events-none" />

      {/* Minimal Header */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-8 z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-neutral-900 transition-colors cursor-pointer"
          id="btn-portal-back"
        >
          <ArrowLeft size={14} />
          <span>Retour</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="font-display font-bold text-sm tracking-tight text-neutral-900">
            MomoLink <span className="text-accent-corail text-xs font-semibold">Pro</span>
          </span>
        </div>
      </header>

      {/* Main card */}
      <main className="w-full flex-1 flex items-center justify-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[420px] bg-white border border-gray-200 p-8 rounded-[24px] shadow-xl"
          id="card-buyer-portal"
        >
          <div className="flex flex-col items-center mb-6">
            {/* Coral mail box icon */}
            <div className="w-14 h-14 rounded-full bg-accent-corail/10 text-accent-corail flex items-center justify-center border border-accent-corail/20 mb-4">
              <Mail size={24} strokeWidth={2} />
            </div>
            
            <h2 className="font-display text-2xl font-bold tracking-tight text-center text-neutral-900 leading-tight">
              Retrouvez vos achats
            </h2>
            <p className="text-xs text-gray-500 mt-2 text-center leading-relaxed">
              Entrez l'email utilisé lors de vos achats pour accéder à vos contenus.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-start gap-2"
              id="portal-error-banner"
            >
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <p className="leading-snug">{errorMsg}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 pl-0.5">
                Votre adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: jean.dupont@gmail.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-neutral-900 text-sm focus:border-accent-corail focus:outline-none transition-all duration-200"
                required
                id="input-portal-email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-accent-corail hover:bg-accent-corail-hover text-white font-semibold text-xs transition-all duration-200 shadow-lg shadow-accent-corail/15 active:scale-[0.98] disabled:opacity-70 mt-2 cursor-pointer flex items-center justify-center gap-1.5"
              id="btn-portal-submit"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Vérification en cours...</span>
                </>
              ) : (
                <>
                  <span>Accéder à mes achats</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Creator login link */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link
              to="/auth/login"
              className="text-xs text-gray-500 hover:text-accent-corail transition-colors font-medium inline-flex items-center gap-1"
              id="link-portal-creator"
            >
              <span>Vous êtes créateur ? Connectez-vous</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full text-center mt-8 z-10">
        <p className="text-[10px] text-gray-400 font-mono">
          MomoLink Pro — Paiements sécurisés via Mobile Money
        </p>
      </footer>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, ArrowLeft, Check, CheckCircle2, AlertCircle, Phone, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, profile, createProfile, checkUsernameUnique, loading: authLoading } = useAuth();

  // If user is already logged in and has profile, direct them to dashboard
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/login');
    } else if (!authLoading && profile) {
      navigate('/dashboard');
    }
  }, [user, profile, authLoading, navigate]);

  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Public Identity
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Step 2: Social Links (Optional)
  const [tiktok, setTiktok] = useState('');
  const [instagram, setInstagram] = useState('');
  const [snapchat, setSnapchat] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Step 3: Payout Details (Mobile Money)
  const [payoutProvider, setPayoutProvider] = useState<'wave' | 'orange' | 'mtn' | 'moov'>('wave');
  const [payoutPhone, setPayoutPhone] = useState('');

  // Real-time username check with debouncing
  useEffect(() => {
    if (!username) {
      setUsernameAvailable(null);
      return;
    }

    // Validation pattern check: 3-30 chars, lowercase, numbers, underscores
    const isValidPattern = /^[a-z0-9_]{3,30}$/.test(username);
    if (!isValidPattern) {
      setUsernameAvailable(false);
      return;
    }

    setCheckingUsername(true);
    const timeoutId = setTimeout(async () => {
      const available = await checkUsernameUnique(username);
      setUsernameAvailable(available);
      setCheckingUsername(false);
    }, 450);

    return () => clearTimeout(timeoutId);
  }, [username, checkUsernameUnique]);

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!displayName.trim() || displayName.length > 50) {
        setError("Le nom d'affichage est obligatoire (max 50 caractères).");
        return;
      }
      if (!username) {
        setError("Le nom d'utilisateur est obligatoire.");
        return;
      }
      if (usernameAvailable === false) {
        setError("Ce nom d'utilisateur est déjà pris ou invalide.");
        return;
      }
      if (username.length < 3 || username.length > 30) {
        setError("Le nom d'utilisateur doit contenir entre 3 et 30 caractères.");
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!payoutPhone.trim()) {
      setError('Veuillez renseigner votre numéro Mobile Money.');
      return;
    }

    if (!user) {
      setError('Utilisateur non connecté.');
      return;
    }

    setSubmitting(true);
    try {
      const socialLinks = {
        ...(tiktok && { tiktok: tiktok.startsWith('@') ? tiktok : `@${tiktok}` }),
        ...(instagram && { instagram: instagram.startsWith('@') ? instagram : `@${instagram}` }),
        ...(snapchat && { snapchat }),
        ...(whatsapp && { whatsapp }),
      };

      const result = await createProfile({
        user_id: user.id,
        username: username.toLowerCase().trim(),
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        social_links: socialLinks,
        payout_phone_number: payoutPhone.trim(),
        payout_provider: payoutProvider,
        status: 'active',
      });

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Une erreur s’est produite.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur s’est produite.');
    } finally {
      setSubmitting(false);
    }
  };

  // Safe layout styles
  const providerDetails = {
    wave: { name: 'Wave', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
    orange: { name: 'Orange Money', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
    mtn: { name: 'MTN MoMo', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' },
    moov: { name: 'Moov Money', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  };

  const currentHost = window.location.origin;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background radial highlight */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent-corail/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-success-gold/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[480px] z-10">
        
        {/* Progress Bar Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
              Étape {step} sur 3
            </span>
            <span className="text-xs font-medium text-accent-corail">
              {step === 1 && 'Identité publique'}
              {step === 2 && 'Réseaux sociaux'}
              {step === 3 && 'Méthode de paiement'}
            </span>
          </div>
          <div className="h-1.5 w-full bg-border-custom rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-accent-corail"
              initial={{ width: '33.33%' }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-bg-surface border border-border-custom p-8 rounded-[24px] shadow-xl">
          
          {error && (
            <div className="mb-6 p-4 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
              <p className="leading-relaxed font-medium">{error}</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col gap-5"
              >
                <div>
                  <h3 className="font-display text-2xl font-medium tracking-tight text-text-primary mb-1">
                    Créez votre espace public
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Ces informations seront visibles par vos abonnés lors de l'achat.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Nom d'affichage <span className="text-accent-corail">*</span>
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={50}
                    placeholder="ex: Ama Coaching ou Michella"
                    className="w-full px-4 py-3 rounded-[12px] border border-border-custom bg-bg-primary/50 text-text-primary text-sm focus:border-accent-corail focus:outline-none transition-all duration-200"
                    required
                  />
                  <span className="text-[10px] text-text-secondary self-end">{displayName.length}/50</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Nom d'utilisateur <span className="text-accent-corail">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium text-sm">
                      @
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      maxLength={30}
                      placeholder="ama_coaching"
                      className="w-full pl-8 pr-10 py-3 rounded-[12px] border border-border-custom bg-bg-primary/50 text-text-primary text-sm focus:border-accent-corail focus:outline-none transition-all duration-200"
                      required
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                      {checkingUsername && <Loader2 className="animate-spin text-accent-corail h-4 w-4" />}
                      {!checkingUsername && usernameAvailable === true && <CheckCircle2 className="text-emerald-600 h-4 w-4" />}
                      {!checkingUsername && usernameAvailable === false && username.length >= 3 && <AlertCircle className="text-red-600 h-4 w-4" />}
                    </div>
                  </div>
                  
                  {usernameAvailable === false && username.length >= 3 && (
                    <span className="text-[10px] text-red-600 font-medium">Ce nom d'utilisateur est déjà pris ou contient des caractères non autorisés (minuscules, chiffres et tiret bas uniquement).</span>
                  )}
                  {usernameAvailable === true && (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Check size={10} /> Nom d'utilisateur disponible !
                    </span>
                  )}

                  {/* Public Link Preview */}
                  <div className="p-3 bg-bg-primary/40 rounded-[12px] border border-border-custom text-xs font-mono break-all mt-1">
                    <span className="text-text-secondary">Votre lien public : </span>
                    <span className="text-accent-corail font-medium">
                      {currentHost}/@{username || 'votre_pseudo'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Biographie
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={160}
                    placeholder="Parlez brièvement de vos contenus (ex: Coach business, conseils TikTok quotidiens...)"
                    rows={3}
                    className="w-full px-4 py-3 rounded-[12px] border border-border-custom bg-bg-primary/50 text-text-primary text-sm focus:border-accent-corail focus:outline-none resize-none transition-all duration-200"
                  />
                  <span className="text-[10px] text-text-secondary self-end">{bio.length}/160</span>
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-3.5 px-4 rounded-[12px] bg-accent-corail hover:bg-accent-corail-hover text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-accent-corail/15 flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  Continuer
                  <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col gap-5"
              >
                <div>
                  <h3 className="font-display text-2xl font-medium tracking-tight text-text-primary mb-1">
                    Réseaux sociaux
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Ajoutez vos réseaux pour aider vos abonnés à vous retrouver (optionnel).
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Pseudo TikTok
                  </label>
                  <input
                    type="text"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    placeholder="@mon_compte"
                    className="w-full px-4 py-3 rounded-[12px] border border-border-custom bg-bg-primary/50 text-text-primary text-sm focus:border-accent-corail focus:outline-none transition-all duration-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Pseudo Instagram
                  </label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@mon_compte"
                    className="w-full px-4 py-3 rounded-[12px] border border-border-custom bg-bg-primary/50 text-text-primary text-sm focus:border-accent-corail focus:outline-none transition-all duration-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Pseudo Snapchat
                  </label>
                  <input
                    type="text"
                    value={snapchat}
                    onChange={(e) => setSnapchat(e.target.value)}
                    placeholder="mon_pseudo"
                    className="w-full px-4 py-3 rounded-[12px] border border-border-custom bg-bg-primary/50 text-text-primary text-sm focus:border-accent-corail focus:outline-none transition-all duration-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Numéro WhatsApp
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="ex: +22890000001"
                    className="w-full px-4 py-3 rounded-[12px] border border-border-custom bg-bg-primary/50 text-text-primary text-sm focus:border-accent-corail focus:outline-none transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="w-full py-3.5 px-4 rounded-[12px] border border-accent-corail/30 text-accent-corail hover:bg-accent-corail/5 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full py-3.5 px-4 rounded-[12px] bg-accent-corail hover:bg-accent-corail-hover text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-accent-corail/15 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Suivant
                    <ArrowRight size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTiktok('');
                    setInstagram('');
                    setSnapchat('');
                    setWhatsapp('');
                    setStep(3);
                  }}
                  className="text-center text-xs text-text-secondary hover:text-text-primary hover:underline mt-2 cursor-pointer"
                >
                  Passer cette étape
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col gap-5"
              >
                <div>
                  <h3 className="font-display text-2xl font-medium tracking-tight text-text-primary mb-1">
                    Réception des revenus
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Configurez votre numéro Mobile Money pour recevoir vos paiements directement.
                  </p>
                </div>

                {/* Provider Grid Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Opérateur Mobile Money <span className="text-accent-corail">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['wave', 'orange', 'mtn', 'moov'] as const).map((prov) => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => setPayoutProvider(prov)}
                        className={`p-3 rounded-[12px] border text-left flex flex-col justify-between h-20 transition-all duration-200 ${
                          payoutProvider === prov
                            ? 'border-accent-corail bg-accent-corail/5 text-text-primary shadow-md'
                            : 'border-border-custom bg-bg-primary/30 text-text-secondary hover:border-text-secondary/40'
                        }`}
                      >
                        <span className="text-xs font-bold capitalize">{prov}</span>
                        <span className="text-[10px] opacity-85">
                          {prov === 'wave' && 'Afrique de l’Ouest'}
                          {prov === 'orange' && 'Orange Money'}
                          {prov === 'mtn' && 'MTN MoMo'}
                          {prov === 'moov' && 'Moov Money'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Numéro de téléphone Mobile Money <span className="text-accent-corail">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                      <Phone size={15} />
                    </span>
                    <input
                      type="tel"
                      value={payoutPhone}
                      onChange={(e) => setPayoutPhone(e.target.value.replace(/[^0-9+ ]/g, ''))}
                      placeholder="ex: +228 90 00 00 01"
                      className="w-full pl-11 pr-4 py-3 rounded-[12px] border border-border-custom bg-bg-primary/50 text-text-primary text-sm focus:border-accent-corail focus:outline-none transition-all duration-200"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-text-secondary leading-normal">
                    C'est sur ce numéro que vous recevrez vos revenus lors de vos demandes de retrait.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={submitting}
                    className="w-full py-3.5 px-4 rounded-[12px] border border-accent-corail/30 text-accent-corail hover:bg-accent-corail/5 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <ArrowLeft size={16} />
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={submitting}
                    className="w-full py-3.5 px-4 rounded-[12px] bg-accent-corail hover:bg-accent-corail-hover text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-accent-corail/15 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70"
                  >
                    {submitting ? 'Finalisation...' : 'Terminer'}
                    {!submitting && <Check size={16} />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

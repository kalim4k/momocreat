/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, isDemoMode, setDemoMode, error: authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    setGoogleLoading(true);
    const res = await signInWithGoogle();
    if (!res.success) {
      setLocalError(res.error || 'Erreur lors de la connexion avec Google.');
      setGoogleLoading(false);
    }
  };

  const validateEmail = (emailStr: string) => {
    return /\S+@\S+\.\S+/.test(emailStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validations
    if (!email || !password || !confirmPassword) {
      setLocalError('Veuillez remplir tous les champs.');
      return;
    }

    if (!validateEmail(email)) {
      setLocalError('Veuillez entrer une adresse e-mail valide.');
      return;
    }

    if (password.length < 8) {
      setLocalError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const res = await signUp(email, password);
      if (res.success) {
        navigate('/onboarding');
      } else {
        setLocalError(res.error || 'Erreur lors de l’inscription.');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Une erreur s’est produite.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      
      {/* Background radial highlight */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent-corail/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-success-gold/5 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-bg-surface border border-border-custom p-8 rounded-[24px] shadow-xl z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full bg-accent-corail/15 flex items-center justify-center border border-accent-corail/35 mb-4">
            <Sparkles className="text-accent-corail h-6 w-6" />
          </div>
          <h2 className="font-display text-3xl font-medium tracking-tight text-center text-text-primary">
            Créer votre compte
          </h2>
          <p className="text-xs text-text-secondary mt-1.5 text-center">
            Rejoignez des milliers de créateurs en Afrique de l’Ouest
          </p>
        </div>

        {/* Error Notification */}
        {(localError || authError) && (
          <div className="mb-6 p-4 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <p className="leading-relaxed font-medium">{localError || authError}</p>
          </div>
        )}

        {!isDemoMode && (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full py-3 px-4 rounded-[12px] border border-border-custom bg-bg-primary/50 hover:bg-bg-primary text-text-primary font-semibold text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2.5"
            >
              <GoogleIcon />
              {googleLoading ? 'Redirection...' : 'Continuer avec Google'}
            </button>

            <div className="flex items-center gap-3 my-5">
              <div className="h-px flex-1 bg-border-custom" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary opacity-60">ou</span>
              <div className="h-px flex-1 bg-border-custom" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Adresse e-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full px-4 py-3 rounded-[12px] border border-border-custom bg-bg-primary/50 text-text-primary text-sm focus:border-accent-corail focus:outline-none transition-all duration-200"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
                className="w-full pl-4 pr-11 py-3 rounded-[12px] border border-border-custom bg-bg-primary/50 text-text-primary text-sm focus:border-accent-corail focus:outline-none transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Confirmer le mot de passe
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-[12px] border border-border-custom bg-bg-primary/50 text-text-primary text-sm focus:border-accent-corail focus:outline-none transition-all duration-200"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-[12px] bg-accent-corail hover:bg-accent-corail-hover text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-accent-corail/15 active:scale-[0.98] disabled:opacity-70 mt-4 cursor-pointer"
          >
            {loading ? 'Création en cours...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-text-secondary">
          Vous avez déjà un compte ?{' '}
          <Link to="/auth/login" className="text-accent-corail hover:underline font-medium ml-1">
            Se connecter
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Signup() {
  const navigate = useNavigate();
  const { signUp, isDemoMode, setDemoMode, error: authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

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

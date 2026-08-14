/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Supabase renvoie ses echecs OAuth dans l'URL, pas dans une exception : soit dans le
 * fragment (`#error_description=...`, flow implicite), soit dans la query (flow PKCE).
 * Sans cette lecture on redirigeait vers /auth/login sans le moindre message, ce qui rend
 * une mauvaise configuration cote Supabase/Google indistinguable d'un simple clic annule.
 */
function readOAuthError(): string | null {
  const raw = window.location.hash.replace(/^#/, '') || window.location.search.replace(/^\?/, '');
  if (!raw) return null;
  const params = new URLSearchParams(raw);
  return params.get('error_description') || params.get('error');
}

export default function Callback() {
  const navigate = useNavigate();
  const { user, profile, loading, error } = useAuth();
  const [urlError] = useState<string | null>(readOAuthError);

  useEffect(() => {
    if (urlError) return;
    if (loading) return;
    if (!user) {
      navigate('/auth/login', { replace: true });
      return;
    }
    navigate(profile ? '/dashboard' : '/onboarding', { replace: true });
  }, [urlError, loading, user, profile, navigate]);

  if (urlError) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-4 px-4 font-sans">
        <p className="text-sm font-semibold text-text-primary">Connexion Google impossible</p>
        <p className="text-xs text-red-600 max-w-sm text-center">{urlError}</p>
        <Link to="/auth/login" className="text-xs text-accent-corail hover:underline font-medium">
          Retour a la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-4 font-sans">
      <div className="w-10 h-10 rounded-full border-4 border-accent-corail border-t-transparent animate-spin" />
      <p className="text-sm text-text-secondary">Connexion en cours...</p>
      {error && <p className="text-xs text-red-600 max-w-sm text-center px-4">{error}</p>}
    </div>
  );
}

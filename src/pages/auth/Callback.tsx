/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Callback() {
  const navigate = useNavigate();
  const { user, profile, loading, error } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/auth/login', { replace: true });
      return;
    }
    navigate(profile ? '/dashboard' : '/onboarding', { replace: true });
  }, [loading, user, profile, navigate]);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-4 font-sans">
      <div className="w-10 h-10 rounded-full border-4 border-accent-corail border-t-transparent animate-spin" />
      <p className="text-sm text-text-secondary">Connexion en cours...</p>
      {error && <p className="text-xs text-red-600 max-w-sm text-center px-4">{error}</p>}
    </div>
  );
}

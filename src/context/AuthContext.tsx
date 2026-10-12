/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useCallback, useContext, useState, useEffect, ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { CreatorProfile } from '../types';

/**
 * Message lisible pour une erreur Supabase (Auth ou PostgREST). Les messages bruts sont en
 * anglais (« User already registered », « duplicate key value violates unique constraint »)
 * et ne disent pas au createur quoi faire.
 */
function toFrenchError(err: any, fallback: string): string {
  const code = err?.code as string | undefined;
  const message = (err?.message as string | undefined) || '';
  if (code === 'user_already_exists' || /already registered|already exists/i.test(message)) {
    return 'Un compte existe déjà avec cette adresse e-mail. Connectez-vous plutôt.';
  }
  if (code === 'invalid_credentials' || /invalid login credentials/i.test(message)) {
    return 'Adresse e-mail ou mot de passe incorrect.';
  }
  if (code === 'email_not_confirmed') return 'Confirmez d’abord votre adresse e-mail grâce au lien reçu par mail.';
  if (code === 'weak_password' || /password should/i.test(message)) return 'Mot de passe trop faible : 8 caractères minimum.';
  if (code === 'email_address_invalid' || /email address .* is invalid/i.test(message)) return 'Cette adresse e-mail n’est pas acceptée. Vérifiez-la ou utilisez-en une autre.';
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || /rate limit/i.test(message)) {
    return 'Trop de tentatives en peu de temps. Réessayez dans quelques minutes.';
  }
  if (code === 'signup_disabled') return 'Les inscriptions sont momentanément fermées.';
  if (code === '23505' && /username/i.test(message)) return 'Ce nom d’utilisateur vient d’être pris. Choisissez-en un autre.';
  if (err instanceof TypeError || /failed to fetch|network/i.test(message)) {
    return 'Connexion impossible. Vérifiez votre réseau puis réessayez.';
  }
  return message || fallback;
}

interface AuthContextType {
  user: any | null;
  profile: CreatorProfile | null;
  allProfiles: CreatorProfile[];
  /** Vrai seulement pendant la lecture de la session au chargement de l'application. */
  loading: boolean;
  isDemoMode: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; hasProfile?: boolean }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  createProfile: (profileData: Omit<CreatorProfile, 'id' | 'created_at'>) => Promise<{ success: boolean; error?: string; usernameTaken?: boolean }>;
  updateProfile: (profileData: Partial<CreatorProfile>) => Promise<{ success: boolean; error?: string }>;
  checkUsernameUnique: (username: string) => Promise<boolean>;
  setDemoMode: (val: boolean) => void;
  refreshStats: () => Promise<any>;
  switchProfile: (profileId: string) => Promise<void>;
  createAdditionalProfile: (profileData: Omit<CreatorProfile, 'id' | 'created_at'>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [allProfiles, setAllProfiles] = useState<CreatorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Active demo mode automatic fallback if Supabase keys are missing
  const hasKeys = !!supabase;
  const [isDemoMode, setIsDemoMode] = useState<boolean>(!hasKeys);

  /**
   * Charge les boutiques de l'utilisateur, puis pose l'utilisateur et sa boutique active en
   * une seule fois. Poser `user` avant d'avoir la boutique laissait un instant ou l'on etait
   * connecte « sans profil » : les gardes de route envoyaient alors vers l'onboarding un
   * createur qui avait deja sa boutique.
   */
  const applySession = async (sessionUser: any | null): Promise<CreatorProfile[] | null> => {
    if (!supabase || !sessionUser) {
      setUser(null);
      setProfile(null);
      setAllProfiles([]);
      return [];
    }
    const { data: profilesList, error: profilesErr } = await supabase
      .from('creator_profiles')
      .select('*')
      .eq('user_id', sessionUser.id);
    if (profilesErr) {
      // Sans la liste, on ne sait pas si le createur a une boutique : on garde l'etat actuel
      // plutot que de le renvoyer creer une deuxieme boutique.
      setUser(sessionUser);
      setError(toFrenchError(profilesErr, 'Impossible de charger votre boutique.'));
      return null;
    }
    const list = (profilesList || []) as CreatorProfile[];
    const activeProfileId = localStorage.getItem('momo_active_profile_id');
    const active = list.find((p) => p.id === activeProfileId) || list[0] || null;
    if (active) localStorage.setItem('momo_active_profile_id', active.id);
    setUser(sessionUser);
    setAllProfiles(list);
    setProfile(active);
    return list;
  };

  // Initialize Auth State
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initialize = async () => {
      try {
        if (!isDemoMode && supabase) {
          // 1. Get current session
          const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
          if (sessionErr) throw sessionErr;
          await applySession(session?.user ?? null);

          // 2. Listen for auth changes. Supabase deconseille d'attendre un autre appel Supabase
          // dans ce rappel (il s'execute pendant le traitement de l'evenement et peut bloquer) :
          // la lecture des boutiques part donc au tour suivant. INITIAL_SESSION est deja traite
          // ci-dessus.
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session: Session | null) => {
            if (event === 'INITIAL_SESSION') return;
            setTimeout(() => {
              void applySession(session?.user ?? null);
            }, 0);
          });

          unsubscribe = () => subscription.unsubscribe();
        } else {
          // Demo Mode - Load from localStorage
          const cachedUser = localStorage.getItem('momo_creator_user');
          const cachedProfile = localStorage.getItem('momo_creator_profile');
          const cachedAllProfiles = localStorage.getItem('momo_creator_profiles');

          if (cachedUser) {
            setUser(JSON.parse(cachedUser));
          }
          let activeProf: CreatorProfile | null = null;
          if (cachedProfile) {
            activeProf = JSON.parse(cachedProfile);
            setProfile(activeProf);
          }
          if (cachedAllProfiles) {
            setAllProfiles(JSON.parse(cachedAllProfiles));
          } else if (activeProf) {
            setAllProfiles([activeProf]);
            localStorage.setItem('momo_creator_profiles', JSON.stringify([activeProf]));
          }
        }
      } catch (err: any) {
        console.error('Error initializing authentication:', err);
        setError(err.message || 'Erreur lors de la connexion à Supabase.');
      } finally {
        setLoading(false);
      }
    };

    initialize();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isDemoMode]);

  // Les actions ci-dessous ne touchent pas a `loading` : les gardes de route remplacent la
  // page par un ecran de chargement tant qu'il est vrai, ce qui demontait le formulaire en
  // cours. Un echec a la derniere etape de l'onboarding ramenait ainsi a une etape 1 vide,
  // sans message. Chaque page affiche son propre etat d'envoi.

  // Sign Up
  const signUp = async (email: string, password: string) => {
    setError(null);
    try {
      if (!isDemoMode && supabase) {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (err) throw err;
        if (!data.session) {
          // Confirmation par e-mail activee cote Supabase. Une adresse deja inscrite revient
          // aussi sans session, mais sans identite (Supabase ne dit pas qu'elle existe).
          if (data.user && data.user.identities?.length === 0) {
            throw Object.assign(new Error('User already registered'), { code: 'user_already_exists' });
          }
          return { success: true, needsConfirmation: true };
        }
        setUser(data.user);
        setProfile(null);
        setAllProfiles([]);
        return { success: true };
      } else {
        // Mock Sign Up
        const mockUser = { id: `usr_${Math.random().toString(36).substr(2, 9)}`, email };
        localStorage.setItem('momo_creator_user', JSON.stringify(mockUser));
        localStorage.removeItem('momo_creator_profile'); // Clear any old profile
        setUser(mockUser);
        setProfile(null);
        return { success: true };
      }
    } catch (err: any) {
      const message = toFrenchError(err, 'Erreur lors de la création du compte.');
      setError(message);
      return { success: false, error: message };
    }
  };

  // Sign In
  const signIn = async (email: string, password: string) => {
    setError(null);
    try {
      if (!isDemoMode && supabase) {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;

        // Liste et non .maybeSingle() : un createur peut avoir plusieurs boutiques, et
        // .maybeSingle() echouait alors (« multiple rows returned ») au lieu de connecter.
        const list = await applySession(data.user);
        if (list === null) throw new Error('Impossible de charger votre boutique.');
        return { success: true, hasProfile: list.length > 0 };
      } else {
        // Mock Sign In
        const cachedUser = localStorage.getItem('momo_creator_user');
        const mockUser = cachedUser ? JSON.parse(cachedUser) : null;

        // If no user exists, let them log in with a newly generated one
        const activeUser = mockUser && mockUser.email === email 
          ? mockUser 
          : { id: `usr_${Math.random().toString(36).substr(2, 9)}`, email };

        localStorage.setItem('momo_creator_user', JSON.stringify(activeUser));
        setUser(activeUser);

        // Fetch corresponding profile from localStorage
        const cachedProfileStr = localStorage.getItem('momo_creator_profile');
        const cachedProfile = cachedProfileStr ? JSON.parse(cachedProfileStr) : null;

        if (cachedProfile && cachedProfile.user_id === activeUser.id) {
          setProfile(cachedProfile);
          return { success: true, hasProfile: true };
        } else {
          setProfile(null);
          return { success: true, hasProfile: false };
        }
      }
    } catch (err: any) {
      const message = toFrenchError(err, 'Adresse e-mail ou mot de passe incorrect.');
      setError(message);
      return { success: false, error: message };
    }
  };

  // Sign In with Google (Supabase-hosted OAuth redirect)
  const signInWithGoogle = async () => {
    setError(null);
    if (isDemoMode || !supabase) {
      const msg = 'La connexion Google nécessite une configuration Supabase active.';
      setError(msg);
      return { success: false, error: msg };
    }
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (err) throw err;
      // Browser is redirected to Google; nothing else to do here.
      return { success: true };
    } catch (err: any) {
      const message = toFrenchError(err, 'Erreur lors de la connexion avec Google.');
      setError(message);
      return { success: false, error: message };
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      if (!isDemoMode && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setAllProfiles([]);
      localStorage.removeItem('momo_creator_user');
      localStorage.removeItem('momo_creator_profile');
    }
  };

  // Check Username uniqueness. Fonction stable (useCallback) : l'onboarding la met dans les
  // dependances de sa verification en direct, qui repartait a chaque rendu du contexte.
  const checkUsernameUnique = useCallback(async (username: string): Promise<boolean> => {
    if (!username || username.length < 3) return false;
    if (profile && profile.username === username.toLowerCase()) return true;
    try {
      if (!isDemoMode && supabase) {
        const { data, error: err } = await supabase
          .from('creator_profiles')
          .select('username')
          .eq('username', username.toLowerCase())
          .maybeSingle();

        if (err) return true; // Graceful fallback
        return data === null;
      } else {
        // Local check
        const cachedProfileStr = localStorage.getItem('momo_creator_profile');
        if (cachedProfileStr) {
          const prof = JSON.parse(cachedProfileStr) as CreatorProfile;
          return prof.username !== username.toLowerCase();
        }
        return true;
      }
    } catch {
      return true;
    }
  }, [profile, isDemoMode]);

  // Create Profile (Onboarding)
  const createProfile = async (profileData: Omit<CreatorProfile, 'id' | 'created_at'>) => {
    setError(null);
    try {
      const generatedId = `cre_${Math.random().toString(36).substr(2, 9)}`;
      const newProfile: CreatorProfile = {
        ...profileData,
        id: generatedId,
        created_at: new Date().toISOString(),
      };

      if (!isDemoMode && supabase) {
        // `.select().single()` : on relit la ligne inserée pour recuperer l'UUID genere par
        // Postgres. Sans ca on gardait `generatedId` en memoire alors que la base avait attribue
        // un tout autre id — toute donnee indexee sur profile.id (cle localStorage de la visite
        // guidee, momo_active_profile_id) devenait caduque des la reconnexion suivante.
        const { data: inserted, error: err } = await supabase
          .from('creator_profiles')
          .insert({
            user_id: profileData.user_id,
            username: profileData.username.toLowerCase(),
            display_name: profileData.display_name,
            bio: profileData.bio,
            social_links: profileData.social_links,
            payout_phone_number: profileData.payout_phone_number,
            payout_provider: profileData.payout_provider,
            cover_url: profileData.cover_url || null,
            status: 'active'
          })
          .select()
          .single();

        if (err) throw err;
        const savedProfile = (inserted ?? newProfile) as CreatorProfile;
        setProfile(savedProfile);
        setAllProfiles((prev) => [...prev.filter((p) => p.id !== savedProfile.id), savedProfile]);
        localStorage.setItem('momo_active_profile_id', savedProfile.id);
        return { success: true };
      } else {
        // Mock Profile Create
        localStorage.setItem('momo_creator_profile', JSON.stringify(newProfile));
        setProfile(newProfile);
        return { success: true };
      }
    } catch (err: any) {
      const message = toFrenchError(err, 'Erreur lors de la création de votre profil.');
      setError(message);
      return { success: false, error: message, usernameTaken: err?.code === '23505' };
    }
  };

  // Update Profile (Dashboard Profile Editor)
  const updateProfile = async (profileData: Partial<CreatorProfile>) => {
    setError(null);
    try {
      if (!profile) throw new Error("Profil introuvable.");

      const updatedProfile: CreatorProfile = {
        ...profile,
        ...profileData,
      };

      if (!isDemoMode && supabase) {
        const { error: err } = await supabase
          .from('creator_profiles')
          .update({
            username: profileData.username?.toLowerCase(),
            display_name: profileData.display_name,
            bio: profileData.bio,
            social_links: profileData.social_links,
            payout_phone_number: profileData.payout_phone_number,
            payout_provider: profileData.payout_provider,
            cover_url: profileData.cover_url,
            avatar_url: profileData.avatar_url,
          })
          .eq('id', profile.id);

        if (err) throw err;
        setProfile(updatedProfile);
        return { success: true };
      } else {
        // Mock Profile Update
        localStorage.setItem('momo_creator_profile', JSON.stringify(updatedProfile));
        setProfile(updatedProfile);
        return { success: true };
      }
    } catch (err: any) {
      const message = toFrenchError(err, 'Erreur lors de la modification de votre profil.');
      setError(message);
      return { success: false, error: message };
    }
  };

  // Refresh Stats
  const refreshStats = async () => {
    if (!user) return null;
    try {
      if (!isDemoMode && supabase && profile) {
        const { data: contents } = await supabase
          .from('contents')
          .select('id, is_published')
          .eq('creator_id', profile.id);

        const { data: purchases } = await supabase
          .from('purchases')
          .select('id, amount_paid_fcfa, status, content_id')
          .eq('status', 'completed'); // Or filtered by contents if related

        // Filter purchases related to the creator's contents
        const contentIds = contents?.map(c => c.id) || [];
        const creatorPurchases = purchases?.filter(p => contentIds.includes(p.content_id)) || [];

        const totalEarned = creatorPurchases.reduce((acc, p) => acc + (p.amount_paid_fcfa || 0), 0);
        const thisMonthEarnings = totalEarned; // Simplification for Step 4
        
        return {
          totalEarned,
          thisMonthEarnings,
          salesCount: creatorPurchases.length,
          publishedCount: contents?.filter(c => c.is_published).length || 0,
          latestSales: []
        };
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const switchProfile = async (profileId: string) => {
    const matched = allProfiles.find(p => p.id === profileId);
    if (matched) {
      setProfile(matched);
      localStorage.setItem('momo_active_profile_id', profileId);
      if (isDemoMode) {
        localStorage.setItem('momo_creator_profile', JSON.stringify(matched));
      }
    }
  };

  const createAdditionalProfile = async (profileData: Omit<CreatorProfile, 'id' | 'created_at'>) => {
    setError(null);
    try {
      const generatedId = `cre_${Math.random().toString(36).substr(2, 9)}`;
      const newProfile: CreatorProfile = {
        ...profileData,
        id: generatedId,
        created_at: new Date().toISOString(),
      };

      if (!isDemoMode && supabase) {
        // Meme raison que dans createProfile : c'est l'id renvoye par la base qui fait foi.
        const { data: inserted, error: err } = await supabase
          .from('creator_profiles')
          .insert({
            user_id: profileData.user_id,
            username: profileData.username.toLowerCase(),
            display_name: profileData.display_name,
            bio: profileData.bio,
            social_links: profileData.social_links,
            payout_phone_number: profileData.payout_phone_number,
            payout_provider: profileData.payout_provider,
            cover_url: profileData.cover_url || null,
            status: 'active'
          })
          .select()
          .single();

        if (err) throw err;
        const savedProfile = (inserted ?? newProfile) as CreatorProfile;
        setAllProfiles(prev => [...prev, savedProfile]);
        setProfile(savedProfile);
        localStorage.setItem('momo_active_profile_id', savedProfile.id);
        return { success: true };
      } else {
        // Mock Additional Profile Create
        const updatedProfiles = [...allProfiles, newProfile];
        localStorage.setItem('momo_creator_profiles', JSON.stringify(updatedProfiles));
        localStorage.setItem('momo_creator_profile', JSON.stringify(newProfile));
        setAllProfiles(updatedProfiles);
        setProfile(newProfile);
        localStorage.setItem('momo_active_profile_id', generatedId);
        return { success: true };
      }
    } catch (err: any) {
      const message = toFrenchError(err, 'Erreur lors de la création de votre boutique.');
      setError(message);
      return { success: false, error: message };
    }
  };

  const handleSetDemoMode = (val: boolean) => {
    setIsDemoMode(val);
    setUser(null);
    setProfile(null);
    setAllProfiles([]);
    localStorage.removeItem('momo_creator_user');
    localStorage.removeItem('momo_creator_profile');
    localStorage.removeItem('momo_creator_profiles');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      allProfiles,
      loading, 
      isDemoMode, 
      error, 
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      createProfile, 
      updateProfile,
      checkUsernameUnique,
      setDemoMode: handleSetDemoMode,
      refreshStats,
      switchProfile,
      createAdditionalProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, getSupabaseClient } from '../lib/supabase';
import { CreatorProfile, SocialLinks } from '../types';

interface AuthContextType {
  user: any | null;
  profile: CreatorProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; hasProfile?: boolean }>;
  signOut: () => Promise<void>;
  createProfile: (profileData: Omit<CreatorProfile, 'id' | 'created_at'>) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (profileData: Partial<CreatorProfile>) => Promise<{ success: boolean; error?: string }>;
  checkUsernameUnique: (username: string) => Promise<boolean>;
  setDemoMode: (val: boolean) => void;
  refreshStats: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Active demo mode automatic fallback if Supabase keys are missing
  const hasKeys = !!supabase;
  const [isDemoMode, setIsDemoMode] = useState<boolean>(!hasKeys);

  // Initialize Auth State
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initialize = async () => {
      try {
        if (!isDemoMode && supabase) {
          // 1. Get current session
          const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
          if (sessionErr) throw sessionErr;

          if (session?.user) {
            setUser(session.user);
            // Fetch profile
            const { data: profileData, error: profileErr } = await supabase
              .from('creator_profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();

            if (!profileErr && profileData) {
              setProfile(profileData as CreatorProfile);
            }
          }

          // 2. Listen for auth changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
              setUser(session.user);
              const { data: profileData } = await supabase
                .from('creator_profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .maybeSingle();
              setProfile(profileData as CreatorProfile);
            } else {
              setUser(null);
              setProfile(null);
            }
          });
          
          unsubscribe = () => subscription.unsubscribe();
        } else {
          // Demo Mode - Load from localStorage
          const cachedUser = localStorage.getItem('momo_creator_user');
          const cachedProfile = localStorage.getItem('momo_creator_profile');

          if (cachedUser) {
            setUser(JSON.parse(cachedUser));
          }
          if (cachedProfile) {
            setProfile(JSON.parse(cachedProfile));
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

  // Sign Up
  const signUp = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      if (!isDemoMode && supabase) {
        const { data, error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setUser(data.user);
        setProfile(null);
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
      setError(err.message || 'Erreur lors de la création du compte.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign In
  const signIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      if (!isDemoMode && supabase) {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;

        setUser(data.user);

        // Fetch profile
        const { data: profileData, error: profileErr } = await supabase
          .from('creator_profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (profileErr) throw profileErr;

        if (profileData) {
          setProfile(profileData as CreatorProfile);
          return { success: true, hasProfile: true };
        } else {
          setProfile(null);
          return { success: true, hasProfile: false };
        }
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
      setError(err.message || 'Adresse email ou mot de passe incorrect.');
      return { success: false, error: err.message || 'Identifiants invalides.' };
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const signOut = async () => {
    setLoading(true);
    try {
      if (!isDemoMode && supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setProfile(null);
      localStorage.removeItem('momo_creator_user');
      localStorage.removeItem('momo_creator_profile');
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check Username uniqueness
  const checkUsernameUnique = async (username: string): Promise<boolean> => {
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
  };

  // Create Profile (Onboarding)
  const createProfile = async (profileData: Omit<CreatorProfile, 'id' | 'created_at'>) => {
    setError(null);
    setLoading(true);
    try {
      const generatedId = `cre_${Math.random().toString(36).substr(2, 9)}`;
      const newProfile: CreatorProfile = {
        ...profileData,
        id: generatedId,
        created_at: new Date().toISOString(),
      };

      if (!isDemoMode && supabase) {
        const { error: err } = await supabase
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
          });

        if (err) throw err;
        setProfile(newProfile);
        return { success: true };
      } else {
        // Mock Profile Create
        localStorage.setItem('momo_creator_profile', JSON.stringify(newProfile));
        setProfile(newProfile);
        return { success: true };
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de votre profil.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update Profile (Dashboard Profile Editor)
  const updateProfile = async (profileData: Partial<CreatorProfile>) => {
    setError(null);
    setLoading(true);
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
      setError(err.message || 'Erreur lors de la modification de votre profil.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
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

  const handleSetDemoMode = (val: boolean) => {
    setIsDemoMode(val);
    setUser(null);
    setProfile(null);
    localStorage.removeItem('momo_creator_user');
    localStorage.removeItem('momo_creator_profile');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isDemoMode, 
      error, 
      signUp, 
      signIn, 
      signOut, 
      createProfile, 
      updateProfile,
      checkUsernameUnique,
      setDemoMode: handleSetDemoMode,
      refreshStats
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

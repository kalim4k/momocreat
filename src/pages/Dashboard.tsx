/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getSupabaseClient } from '../lib/supabase';
import { Content } from '../types';
import { 
  Home, 
  Grid, 
  Wallet, 
  User, 
  LogOut, 
  Plus, 
  TrendingUp, 
  CheckCircle2, 
  CreditCard, 
  ShoppingBag, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  AlertCircle,
  Shield,
  MoreVertical,
  Archive,
  Trash2,
  UploadCloud,
  FileText,
  Video,
  Image as ImageIcon,
  Music,
  Sun,
  Moon,
  Check,
  X,
  Loader2,
  Phone,
  Store,
  Copy,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Seed data for demo mode
const SEEDED_PURCHASES_MOCK = [
  {
    id: 'p_1',
    buyer_phone: '+221 77 123 45 67',
    content_id: 'con_1',
    status: 'completed',
    payment_reference: 'WAVE-892374-MOMO',
    amount_paid_fcfa: 2500,
    commission_amount_fcfa: 250,
    creator_net_amount_fcfa: 2250,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    contents: { title: 'Pack PDF : Booster son audience TikTok en 30 jours' }
  },
  {
    id: 'p_2',
    buyer_phone: '+225 07 456 78 90',
    content_id: 'con_2',
    status: 'completed',
    payment_reference: 'OM-472918-MOMO',
    amount_paid_fcfa: 1500,
    commission_amount_fcfa: 150,
    creator_net_amount_fcfa: 1350,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    contents: { title: 'Template Notion : Organiser ses tournages Reels & TikTok' }
  },
  {
    id: 'p_3',
    buyer_phone: '+221 70 987 65 43',
    content_id: 'con_1',
    status: 'completed',
    payment_reference: 'WAVE-110293-MOMO',
    amount_paid_fcfa: 2500,
    commission_amount_fcfa: 250,
    creator_net_amount_fcfa: 2250,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    contents: { title: 'Pack PDF : Booster son audience TikTok en 30 jours' }
  },
  {
    id: 'p_4',
    buyer_phone: '+229 95 333 44 55',
    content_id: 'con_3',
    status: 'completed',
    payment_reference: 'MTN-998811-MOMO',
    amount_paid_fcfa: 5000,
    commission_amount_fcfa: 500,
    creator_net_amount_fcfa: 4500,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    contents: { title: "Masterclass : Décryptage de l'Algorithme 2026 (Vidéo 20m)" }
  },
  {
    id: 'p_5',
    buyer_phone: '+221 76 888 99 11',
    content_id: 'con_3',
    status: 'completed',
    payment_reference: 'WAVE-443322-MOMO',
    amount_paid_fcfa: 5000,
    commission_amount_fcfa: 500,
    creator_net_amount_fcfa: 4500,
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    contents: { title: "Masterclass : Décryptage de l'Algorithme 2026 (Vidéo 20m)" }
  },
  {
    id: 'p_6',
    buyer_phone: '+221 77 654 32 10',
    content_id: 'con_3',
    status: 'completed',
    payment_reference: 'WAVE-123456-MOMO',
    amount_paid_fcfa: 10000,
    commission_amount_fcfa: 1000,
    creator_net_amount_fcfa: 9000,
    created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
    contents: { title: "Coaching Individuel 1h" }
  },
  {
    id: 'p_7',
    buyer_phone: '+221 78 111 22 33',
    content_id: 'con_3',
    status: 'completed',
    payment_reference: 'OM-999888-MOMO',
    amount_paid_fcfa: 10000,
    commission_amount_fcfa: 1000,
    creator_net_amount_fcfa: 9000,
    created_at: new Date(Date.now() - 3600000 * 120).toISOString(),
    contents: { title: "Coaching Individuel 1h" }
  }
];

const SEEDED_WITHDRAWALS_MOCK = (creatorId: string) => [
  {
    id: 'w_1',
    creator_id: creatorId,
    amount_requested: 10000,
    payout_provider: 'wave',
    payout_phone_number: '+221 77 123 45 67',
    status: 'paid',
    requested_at: new Date(Date.now() - 3600000 * 240).toISOString(),
    processed_at: new Date(Date.now() - 3600000 * 220).toISOString()
  },
  {
    id: 'w_2',
    creator_id: creatorId,
    amount_requested: 5000,
    payout_provider: 'wave',
    payout_phone_number: '+221 77 123 45 67',
    status: 'approved',
    requested_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    processed_at: new Date(Date.now() - 3600000 * 40).toISOString()
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading: authLoading, signOut, isDemoMode } = useAuth();
  const { isDarkMode, setIsDarkMode, styles: themeStyles } = useTheme();

  // Determine active view based on current route
  const getActiveTab = (): 'content' | 'withdrawals' | 'profile' | 'subscription' | 'home' => {
    const path = location.pathname;
    if (path.includes('/content')) return 'content';
    if (path.includes('/withdrawals')) return 'withdrawals';
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/subscription')) return 'subscription';
    return 'home';
  };

  const activeTab = getActiveTab();

  // If not logged in, redirect to login. If logged in but no profile, redirect to onboarding
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth/login');
      } else if (!profile) {
        navigate('/onboarding');
      }
    }
  }, [user, profile, authLoading, navigate]);

  // Statistics State
  const [stats, setStats] = useState({
    monthlyEarnings: 0,
    monthlySalesCount: 0,
    totalEarnings: 0,
    publishedContentsCount: 0
  });

  // ==========================================
  // STEP 5: STATE & HANDLERS FOR CONTENT TAB
  // ==========================================
  const [contentsList, setContentsList] = useState<Content[]>([]);
  const [isLoadingContents, setIsLoadingContents] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<'video' | 'image' | 'pdf' | 'audio'>('pdf');
  const [file, setFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [priceFcfa, setPriceFcfa] = useState<number | ''>('');
  
  // Submit feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Card Action menu popover tracking
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Drag and Drop State
  const [dragActive, setDragActive] = useState(false);
  const [previewDragActive, setPreviewDragActive] = useState(false);

  // Profile Editor Form State
  const [profileDisplayName, setProfileDisplayName] = useState('');
  const [profileUsername, setProfileUsername] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileTiktok, setProfileTiktok] = useState('');
  const [profileInstagram, setProfileInstagram] = useState('');
  const [profileSnapchat, setProfileSnapchat] = useState('');
  const [profileWhatsapp, setProfileWhatsapp] = useState('');
  const [profilePayoutProvider, setProfilePayoutProvider] = useState<'wave' | 'orange' | 'mtn' | 'moov'>('wave');
  const [profilePayoutPhone, setProfilePayoutPhone] = useState('');
  const [profileCoverUrl, setProfileCoverUrl] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [profileUsernameAvailable, setProfileUsernameAvailable] = useState<boolean | null>(null);
  const [checkingProfileUsername, setCheckingProfileUsername] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileCopied, setProfileCopied] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('momo_sidebar_collapsed') === 'true');
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Auto-dismiss profile success and error messages
  useEffect(() => {
    if (profileSuccessMsg) {
      const timer = setTimeout(() => {
        setProfileSuccessMsg(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [profileSuccessMsg]);

  useEffect(() => {
    if (profileErrorMsg) {
      const timer = setTimeout(() => {
        setProfileErrorMsg(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [profileErrorMsg]);

  const { updateProfile, checkUsernameUnique } = useAuth();

  // Subscription states (Étape 9)
  const [subscriptionsList, setSubscriptionsList] = useState<any[]>([]);
  const [activeSub, setActiveSub] = useState<any | null>(null);
  const [autoDraftedCount, setAutoDraftedCount] = useState(0);
  const [isSubLoading, setIsSubLoading] = useState(true);
  const [isSubscribingProcess, setIsSubscribingProcess] = useState(false);

  // Withdrawals and Purchases State for withdrawals tab
  const [withdrawalsList, setWithdrawalsList] = useState<any[]>([]);
  const [purchasesList, setPurchasesList] = useState<any[]>([]);
  const latestPurchases = purchasesList.slice(0, 5);
  const [isLoadingWithdrawals, setIsLoadingWithdrawals] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState<string | null>(null);

  // Withdrawal confirmation modal state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);

  // Timeago helper
  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "à l'instant";
      if (diffMins < 60) return `il y a ${diffMins} min`;
      if (diffHours < 24) return `il y a ${diffHours} h`;
      return `il y a ${diffDays} j`;
    } catch {
      return "récemment";
    }
  };

  // Provider logo helper
  const getPayoutProviderLogo = (provider: string) => {
    const provLower = provider?.toLowerCase() || '';
    switch (provLower) {
      case 'mtn':
        return 'https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/73ceff4e-a60e-46d0-ade3-292133629a7a.jpg';
      case 'paypal':
        return 'https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/8cf1bfef-76e2-4c1b-a57d-74b3a39e6db1.png';
      case 'orange':
        return 'https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/7b451d8c-d330-480a-b731-80a611b8d090.png';
      case 'moov':
        return 'https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/22d27599-04ae-41da-90da-0037542b9dd4.png';
      case 'mixbyyass':
      case 'mix by yass':
        return 'https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/b97d7539-370a-42fb-81a4-6171a1c00e95.jpg';
      case 'wave':
        return 'https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/a8d55466-5d3f-4390-a52c-5c0183b659f2.png';
      default:
        return null;
    }
  };

  // Provider label helper
  const getPayoutProviderLabel = (provider: string) => {
    const provLower = provider?.toLowerCase() || '';
    switch (provLower) {
      case 'wave': return 'Wave';
      case 'orange': return 'Orange Money';
      case 'mtn': return 'MTN MoMo';
      case 'moov': return 'Moov Money';
      case 'paypal': return 'PayPal';
      case 'mixbyyass': return 'Mix By Yass';
      default: return provider?.toUpperCase() || 'Mobile Money';
    }
  };

  // Fetch withdrawals and completed purchases
  const fetchWithdrawalsAndPurchases = async () => {
    if (!profile) return;
    setIsLoadingWithdrawals(true);
    try {
      if (!isDemoMode) {
        const supabaseClient = getSupabaseClient();
        if (supabaseClient) {
          // 1. Fetch completed purchases safely without relying on foreign key joins
          const { data: creatorContents, error: contentsErr } = await supabaseClient
            .from('contents')
            .select('id, title')
            .eq('creator_id', profile.id);

          if (contentsErr) throw contentsErr;
          
          const contentIds = (creatorContents || []).map(c => c.id);
          let purchasesData: any[] = [];
          
          if (contentIds.length > 0) {
            const { data, error: purchasesError } = await supabaseClient
              .from('purchases')
              .select('*')
              .in('content_id', contentIds)
              .eq('status', 'completed');

            if (purchasesError) throw purchasesError;
            purchasesData = data || [];
          }

          const mappedPurchases = purchasesData.map(p => {
            const matchedContent = (creatorContents || []).find(c => c.id === p.content_id);
            return {
              ...p,
              contents: matchedContent ? { creator_id: profile.id, title: matchedContent.title } : undefined
            };
          });

          setPurchasesList(mappedPurchases);

          // 2. Fetch withdrawals
          const { data: withdrawalsData, error: withdrawalsError } = await supabaseClient
            .from('withdrawals')
            .select('*')
            .eq('creator_id', profile.id)
            .order('requested_at', { ascending: false });

          if (withdrawalsError) throw withdrawalsError;
          setWithdrawalsList(withdrawalsData || []);
        }
      } else {
        // Mock fallback using localStorage
        const isDefaultDemoCreator = profile.id === 'creator_1' || profile.id === 'creator_2' || profile.id === 'creator_3';
        
        if (!isDefaultDemoCreator) {
          // Newly signed up/registered creators start with zero sales and zero withdrawals
          setPurchasesList([]);
          setWithdrawalsList([]);
        } else {
          let localPurchases = localStorage.getItem('momo_local_purchases');
          if (!localPurchases) {
            localStorage.setItem('momo_local_purchases', JSON.stringify(SEEDED_PURCHASES_MOCK));
            localPurchases = JSON.stringify(SEEDED_PURCHASES_MOCK);
          }
          setPurchasesList(JSON.parse(localPurchases));

          let localWithdrawals = localStorage.getItem('momo_local_withdrawals');
          if (!localWithdrawals) {
            const seededW = SEEDED_WITHDRAWALS_MOCK(profile.id);
            localStorage.setItem('momo_local_withdrawals', JSON.stringify(seededW));
            localWithdrawals = JSON.stringify(seededW);
          }
          setWithdrawalsList(JSON.parse(localWithdrawals));
        }
      }
    } catch (err: any) {
      console.error('Error fetching withdrawals or purchases:', err);
    } finally {
      setIsLoadingWithdrawals(false);
    }
  };

  // Real-time balance calculations
  const totalCreatorEarnings = purchasesList.reduce((sum, p) => {
    return sum + (p.creator_net_amount_fcfa || p.creator_net_amount || 0);
  }, 0);

  const totalWithdrawnAndPending = withdrawalsList
    .filter(w => ['pending', 'approved', 'paid'].includes(w.status))
    .reduce((sum, w) => sum + (w.amount_requested || 0), 0);

  const availableBalance = Math.max(0, totalCreatorEarnings - totalWithdrawnAndPending);

  // Submit withdrawal handler
  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawalError(null);
    setWithdrawalSuccess(null);
    
    const amount = Number(withdrawAmount);
    if (isNaN(amount) || amount < 5000) {
      setWithdrawalError("Le montant minimum est de 5 000 FCFA.");
      return;
    }
    
    if (amount > availableBalance) {
      setWithdrawalError("Le montant demandé dépasse votre solde disponible.");
      return;
    }

    if (!profile?.payout_provider || !profile?.payout_phone_number) {
      setWithdrawalError("Veuillez d'abord configurer votre numéro de téléphone et opérateur de versement Mobile Money dans l'onglet Profil.");
      return;
    }

    setIsSubmittingWithdrawal(true);
    try {
      if (!isDemoMode) {
        const supabaseClient = getSupabaseClient();
        if (supabaseClient) {
          const { error } = await supabaseClient
            .from('withdrawals')
            .insert({
              creator_id: profile.id,
              amount_requested: amount,
              payout_provider: profile.payout_provider,
              payout_phone_number: profile.payout_phone_number,
              status: 'pending'
            });

          if (error) throw error;
        }
      } else {
        // Mock flow
        const newWithdrawal = {
          id: `w_${Math.random().toString(36).substring(2, 9)}`,
          creator_id: profile.id,
          amount_requested: amount,
          payout_provider: profile.payout_provider,
          payout_phone_number: profile.payout_phone_number,
          status: 'pending',
          requested_at: new Date().toISOString()
        };

        const localWithdrawals = localStorage.getItem('momo_local_withdrawals');
        const withdrawals = localWithdrawals ? JSON.parse(localWithdrawals) : [];
        const updated = [newWithdrawal, ...withdrawals];
        localStorage.setItem('momo_local_withdrawals', JSON.stringify(updated));
      }

      setWithdrawalSuccess("Votre demande de retrait a été enregistrée avec succès. Vous recevrez vos fonds sous 24-48h.");
      setWithdrawAmount('');
      setIsWithdrawModalOpen(false);
      
      // Refresh withdrawals and balances
      await fetchWithdrawalsAndPurchases();
    } catch (err: any) {
      console.error('Error submitting withdrawal:', err);
      setWithdrawalError(err.message || "Une erreur est survenue lors de la soumission.");
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  };

  // Initialize Profile form with current values
  useEffect(() => {
    if (profile) {
      setProfileDisplayName(profile.display_name || '');
      setProfileUsername(profile.username || '');
      setProfileBio(profile.bio || '');
      setProfileTiktok(profile.social_links?.tiktok || '');
      setProfileInstagram(profile.social_links?.instagram || '');
      setProfileSnapchat(profile.social_links?.snapchat || '');
      setProfileWhatsapp(profile.social_links?.whatsapp || '');
      setProfilePayoutProvider(profile.payout_provider || 'wave');
      setProfilePayoutPhone(profile.payout_phone_number || '');
      setProfileCoverUrl(profile.cover_url || '');
      setProfileAvatarUrl(profile.avatar_url || '');
      setAvatarFile(null);
      setAvatarPreview(null);
      setCoverFile(null);
      setCoverPreview(null);
    }
  }, [profile]);

  // Username check for profile tab
  useEffect(() => {
    if (!profileUsername) {
      setProfileUsernameAvailable(null);
      return;
    }

    if (profile && profile.username === profileUsername.toLowerCase()) {
      setProfileUsernameAvailable(true);
      return;
    }

    const isValidPattern = /^[a-z0-9_]{3,30}$/.test(profileUsername);
    if (!isValidPattern) {
      setProfileUsernameAvailable(false);
      return;
    }

    setCheckingProfileUsername(true);
    const timeoutId = setTimeout(async () => {
      const available = await checkUsernameUnique(profileUsername);
      setProfileUsernameAvailable(available);
      setCheckingProfileUsername(false);
    }, 450);

    return () => clearTimeout(timeoutId);
  }, [profileUsername, checkUsernameUnique, profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMsg(null);
    setProfileSuccessMsg(null);

    if (!profileDisplayName.trim()) {
      setProfileErrorMsg("Le nom d'affichage est obligatoire.");
      return;
    }

    if (!profileUsername.trim()) {
      setProfileErrorMsg("Le nom d'utilisateur est obligatoire.");
      return;
    }

    if (profileUsernameAvailable === false) {
      setProfileErrorMsg("Le nom d'utilisateur est déjà pris ou invalide.");
      return;
    }

    if (!profilePayoutPhone.trim()) {
      setProfileErrorMsg("Le numéro Mobile Money est obligatoire pour recevoir vos revenus.");
      return;
    }

    setIsSavingProfile(true);
    try {
      let finalCoverUrl = profileCoverUrl;
      if (coverFile) {
        try {
          if (!isDemoMode) {
            finalCoverUrl = await uploadFileToSupabase(coverFile, 'previews');
          } else {
            finalCoverUrl = await uploadFileMock(coverFile);
          }
        } catch (uploadErr: any) {
          console.error("Error uploading cover file:", uploadErr);
          setProfileErrorMsg("Erreur lors du chargement de la photo de couverture.");
          setIsSavingProfile(false);
          return;
        }
      }

      let finalAvatarUrl = profileAvatarUrl;
      if (avatarFile) {
        try {
          if (!isDemoMode) {
            finalAvatarUrl = await uploadFileToSupabase(avatarFile, 'avatars');
          } else {
            finalAvatarUrl = await uploadFileMock(avatarFile);
          }
        } catch (uploadErr: any) {
          console.error("Error uploading avatar file:", uploadErr);
          setProfileErrorMsg("Erreur lors du chargement de la photo de profil.");
          setIsSavingProfile(false);
          return;
        }
      }

      const socialLinks = {
        tiktok: profileTiktok.trim(),
        instagram: profileInstagram.trim(),
        snapchat: profileSnapchat.trim(),
        whatsapp: profileWhatsapp.trim()
      };

      const result = await updateProfile({
        display_name: profileDisplayName.trim(),
        username: profileUsername.toLowerCase().trim(),
        bio: profileBio.trim() || null,
        social_links: socialLinks,
        payout_provider: profilePayoutProvider,
        payout_phone_number: profilePayoutPhone.trim(),
        cover_url: finalCoverUrl,
        avatar_url: finalAvatarUrl
      });

      if (result.success) {
        setProfileSuccessMsg("Profil mis à jour avec succès !");
        // Scroll to top of profile tab
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setProfileErrorMsg(result.error || "Erreur lors de la mise à jour du profil.");
      }
    } catch (err: any) {
      setProfileErrorMsg(err.message || "Une erreur s'est produite.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Fetch creator's contents
  const fetchContents = async () => {
    if (!profile) return;
    setIsLoadingContents(true);
    try {
      if (!isDemoMode) {
        const supabaseClient = getSupabaseClient();
        if (supabaseClient) {
          const { data, error } = await supabaseClient
            .from('contents')
            .select('*')
            .eq('creator_id', profile.id)
            .neq('status', 'removed')
            .order('created_at', { ascending: false });

          if (error) throw error;
          setContentsList(data || []);
        }
      } else {
        // Mock fallback using localStorage
        const isDefaultDemoCreator = profile.id === 'creator_1' || profile.id === 'creator_2' || profile.id === 'creator_3';
        const localContentsStr = localStorage.getItem('momo_local_contents');
        if (localContentsStr) {
          const contents = JSON.parse(localContentsStr) as Content[];
          // Filter out removed ones
          setContentsList(contents.filter(c => c.creator_id === profile.id && c.status !== 'removed'));
        } else {
          if (!isDefaultDemoCreator) {
            // New creator starts with zero contents
            localStorage.setItem('momo_local_contents', JSON.stringify([]));
            setContentsList([]);
          } else {
            // Default seed data
            const defaultSeeded: Content[] = [
              {
                id: 'con_1',
                creator_id: profile.id,
                title: 'Pack PDF : Booster son audience TikTok en 30 jours',
                description: "Ma méthode exacte, mes scripts prêts à l'emploi et mon calendrier éditorial pour passer de 0 à 10 000 abonnés rapidement.",
                price_fcfa: 2500,
                thumbnail_url: null,
                preview_url: null,
                file_url: 'https://example.com/secured/guide-tiktok.pdf',
                content_type: 'pdf',
                status: 'published',
                is_published: true,
                created_at: new Date(Date.now() - 3600000 * 24).toISOString()
              },
              {
                id: 'con_2',
                creator_id: profile.id,
                title: 'Template Notion : Organiser ses tournages Reels & TikTok',
                description: "Le template complet que j'utilise au quotidien pour planifier mes tournages, rédiger mes accroches et suivre mes métriques.",
                price_fcfa: 1500,
                thumbnail_url: null,
                preview_url: null,
                file_url: 'https://example.com/secured/notion-template.zip',
                content_type: 'pdf',
                status: 'published',
                is_published: true,
                created_at: new Date(Date.now() - 3600000 * 48).toISOString()
              },
              {
                id: 'con_3',
                creator_id: profile.id,
                title: 'Masterclass : Décryptage de l\'Algorithme 2026 (Vidéo 20m)',
                description: "Une vidéo exclusive de 20 minutes où je vous montre les coulisses de l'algorithme actuel, et comment maximiser le taux de rétention.",
                price_fcfa: 5000,
                thumbnail_url: null,
                preview_url: null,
                file_url: 'https://example.com/secured/masterclass-algo.mp4',
                content_type: 'video',
                status: 'draft',
                is_published: false,
                created_at: new Date(Date.now() - 3600000 * 72).toISOString()
              }
            ];
            localStorage.setItem('momo_local_contents', JSON.stringify(defaultSeeded));
            setContentsList(defaultSeeded);
          }
        }
      }
    } catch (err: any) {
      console.error('Error loading contents:', err);
    } finally {
      setIsLoadingContents(false);
    }
  };

  // Load content and withdrawals on mount or profile load
  const fetchSubscriptionStatus = async () => {
    if (!profile?.id) return;
    try {
      setIsSubLoading(true);
      const res = await fetch(`/api/subscription/status?creatorId=${profile.id}`);
      if (res.ok) {
        const data = await res.json();
        setSubscriptionsList(data.subscriptions || []);
        setActiveSub(data.activeSubscription || null);
        setAutoDraftedCount(data.autoDraftedCount || 0);

        // Check if subscription has expired past grace (Case C)
        const sub = data.activeSubscription;
        let isExpiredPastGrace = false;
        if (sub) {
          const endDate = new Date(sub.end_date || sub.endDate);
          const graceLimit = endDate.getTime() + 3 * 24 * 60 * 60 * 1000;
          if (Date.now() > graceLimit) {
            isExpiredPastGrace = true;
          }
        } else if (data.subscriptions && data.subscriptions.length > 0) {
          isExpiredPastGrace = true;
        }

        if (isExpiredPastGrace) {
          if (isDemoMode) {
            const localContentsStr = localStorage.getItem('momo_local_contents');
            if (localContentsStr) {
              const contents = JSON.parse(localContentsStr) as Content[];
              let updatedCount = 0;
              const updated = contents.map(c => {
                if (c.creator_id === profile.id && c.status === 'published') {
                  updatedCount++;
                  return { ...c, status: 'draft' as const, is_published: false, auto_drafted_by_subscription: true };
                }
                return c;
              });
              if (updatedCount > 0) {
                localStorage.setItem('momo_local_contents', JSON.stringify(updated));
                setContentsList(updated.filter(c => c.creator_id === profile.id && c.status !== 'removed'));
                setAutoDraftedCount(prev => prev + updatedCount);
              }
            }
          } else {
            await fetch('/api/subscription/apply-expiry', { method: 'POST' });
          }
        }
      }
    } catch (err) {
      console.error('Error fetching subscription status:', err);
    } finally {
      setIsSubLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!profile?.id) return;
    try {
      setIsSubscribingProcess(true);
      const response = await fetch('/api/subscription/create-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creatorId: profile.id,
          buyerEmail: user?.email,
          buyerFirstName: profile.display_name?.split(' ')[0] || 'Créateur',
          buyerLastName: profile.display_name?.split(' ')[1] || 'MomoLink',
          buyerPhone: profile.payout_phone_number || ''
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du panier d\'abonnement.');
      }

      const data = await response.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (err: any) {
      console.error('Error initiating subscription:', err);
      alert(err.message || 'Impossible d\'initier le paiement.');
    } finally {
      setIsSubscribingProcess(false);
    }
  };

  const isSubscribed = () => {
    if (!activeSub) return false;
    const endDate = new Date(activeSub.end_date || activeSub.endDate);
    const graceLimit = endDate.getTime() + 3 * 24 * 60 * 60 * 1000;
    return activeSub.status === 'active' && Date.now() <= graceLimit;
  };

  const getSubCase = () => {
    if (!activeSub) {
      if (subscriptionsList.length === 0) {
        return 'D'; // Never subscribed
      }
      return 'C'; // Expired past grace
    }
    const endDate = new Date(activeSub.end_date || activeSub.endDate);
    const now = Date.now();
    const graceLimit = endDate.getTime() + 3 * 24 * 60 * 60 * 1000;

    if (now <= endDate.getTime()) {
      return 'A'; // Active
    } else if (now > endDate.getTime() && now <= graceLimit) {
      return 'B'; // Grace Period
    } else {
      return 'C'; // Expired past grace
    }
  };

  useEffect(() => {
    if (profile) {
      fetchContents();
      fetchWithdrawalsAndPurchases();
      fetchSubscriptionStatus();
    }
  }, [profile, isDemoMode]);

  // Sync statistics with actual database size and earnings
  useEffect(() => {
    const publishedCount = contentsList.filter(c => c.status === 'published').length;
    setStats(prev => {
      const updated = {
        ...prev,
        publishedContentsCount: publishedCount
      };
      
      if (purchasesList.length > 0) {
        const total = purchasesList.reduce((sum, p) => sum + (p.creator_net_amount_fcfa || p.creator_net_amount || 0), 0);
        
        // Calculate current month's earnings and sales count
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const monthlyPurchases = purchasesList.filter(p => {
          const pDate = new Date(p.created_at);
          return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
        });
        
        const monthlyE = monthlyPurchases.reduce((sum, p) => sum + (p.creator_net_amount_fcfa || p.creator_net_amount || 0), 0);
        const monthlySCount = monthlyPurchases.length;
        
        updated.totalEarnings = total;
        updated.monthlyEarnings = monthlyE > 0 ? monthlyE : total;
        updated.monthlySalesCount = monthlySCount > 0 ? monthlySCount : purchasesList.length;
      }
      
      return updated;
    });
  }, [contentsList, purchasesList]);

  // Click outside listener for the card action menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Drag and drop handlers for main file
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  // Drag and drop handlers for preview file
  const handlePreviewDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setPreviewDragActive(true);
    } else if (e.type === "dragleave") {
      setPreviewDragActive(false);
    }
  };

  const handlePreviewDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setPreviewFile(e.dataTransfer.files[0]);
    }
  };

  // Upload utility to Supabase Storage
  const uploadFileToSupabase = async (file: File, bucket: string): Promise<string> => {
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) throw new Error("Supabase n'est pas configuré.");

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${profile?.id || 'anonymous'}/${fileName}`;

    const { error } = await supabaseClient.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public url for public preview buckets
    if (bucket === 'previews' || bucket === 'avatars') {
      const { data: publicUrlData } = supabaseClient.storage.from(bucket).getPublicUrl(filePath);
      return publicUrlData.publicUrl;
    }

    // Return the relative file path for private contents
    return filePath;
  };

  // Mock file uploader
  const uploadFileMock = async (file: File): Promise<string> => {
    return URL.createObjectURL(file);
  };

  // Handle content publishing or draft save
  const handleCreateContent = async (status: 'published' | 'draft') => {
    if (!title.trim() || title.length > 80) {
      setErrorMsg("Le titre est obligatoire et ne doit pas dépasser 80 caractères.");
      return;
    }
    if (description && description.length > 300) {
      setErrorMsg("La description ne doit pas dépasser 300 caractères.");
      return;
    }
    if (!file) {
      setErrorMsg("Le fichier principal est obligatoire.");
      return;
    }
    if (!priceFcfa || Number(priceFcfa) < 100) {
      setErrorMsg("Le prix est obligatoire et doit être d'au moins 100 FCFA.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let fileUrl = '';
      let previewUrl = '';

      if (!isDemoMode && profile) {
        // Real Supabase storage flow
        fileUrl = await uploadFileToSupabase(file, 'contents');
        if (previewFile) {
          previewUrl = await uploadFileToSupabase(previewFile, 'previews');
        }

        // Database insert
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) throw new Error("Erreur de connexion à la base de données.");

        const { error } = await supabaseClient
          .from('contents')
          .insert({
            creator_id: profile.id,
            title: title.trim(),
            description: description.trim() || null,
            price_fcfa: Math.floor(Number(priceFcfa)),
            thumbnail_url: previewUrl || null,
            preview_url: previewUrl || null,
            file_url: fileUrl,
            content_type: contentType,
            status: status,
            is_published: status === 'published'
          });

        if (error) throw error;
      } else {
        // Mock flow
        fileUrl = await uploadFileMock(file);
        if (previewFile) {
          previewUrl = await uploadFileMock(previewFile);
        }

        const newContent: Content = {
          id: `con_${Math.random().toString(36).substring(2, 11)}`,
          creator_id: profile?.id || 'demo_creator',
          title: title.trim(),
          description: description.trim(),
          price_fcfa: Math.floor(Number(priceFcfa)),
          thumbnail_url: previewUrl || null,
          preview_url: previewUrl || null,
          file_url: fileUrl,
          content_type: contentType,
          status: status,
          is_published: status === 'published',
          created_at: new Date().toISOString()
        };

        const localContentsStr = localStorage.getItem('momo_local_contents');
        const localContents = localContentsStr ? JSON.parse(localContentsStr) : [];
        const updated = [newContent, ...localContents];
        localStorage.setItem('momo_local_contents', JSON.stringify(updated));
      }

      setSuccessMsg(`Votre contenu a été enregistré en tant que ${status === 'published' ? 'publié' : 'brouillon'} !`);
      
      // Reset form fields
      setTitle('');
      setDescription('');
      setContentType('pdf');
      setFile(null);
      setPreviewFile(null);
      setPriceFcfa('');
      setIsFormOpen(false);

      // Reload
      await fetchContents();
    } catch (err: any) {
      console.error('Error creating content:', err);
      setErrorMsg(err.message || "Une erreur est survenue lors de l'enregistrement de votre contenu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Change content status (Archive / Delete / Publish / Unpublish/Draft)
  const handleUpdateStatus = async (contentId: string, targetStatus: 'archived' | 'removed' | 'draft' | 'published') => {
    setActiveMenuId(null);
    try {
      if (!isDemoMode) {
        const supabaseClient = getSupabaseClient();
        if (supabaseClient) {
          const { error } = await supabaseClient
            .from('contents')
            .update({ 
              status: targetStatus,
              is_published: targetStatus === 'published'
            })
            .eq('id', contentId);

          if (error) throw error;
        }
      } else {
        // Mock fallback
        const localContentsStr = localStorage.getItem('momo_local_contents');
        if (localContentsStr) {
          const contents = JSON.parse(localContentsStr) as Content[];
          const updated = contents.map(c => 
            c.id === contentId 
              ? { ...c, status: targetStatus, is_published: targetStatus === 'published' } 
              : c
          );
          localStorage.setItem('momo_local_contents', JSON.stringify(updated));
        }
      }

      // Refresh list
      await fetchContents();
    } catch (err: any) {
      console.error('Error updating content status:', err);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth/login');
  };

  const isSubActionRequired = () => {
    if (!activeSub) return true;
    const endDate = new Date(activeSub.end_date || activeSub.endDate);
    const daysRemaining = (endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000);
    return !isSubscribed() || daysRemaining <= 5;
  };

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'bigardlamine@gmail.com';
  const isAdmin = user?.email === adminEmail;

  const navItems = [
    { id: 'home', label: 'Tableau de bord', icon: Home, path: '/dashboard' },
    { id: 'content', label: 'Mon contenu', icon: Grid, path: '/dashboard/content' },
    { id: 'withdrawals', label: 'Retraits', icon: Wallet, path: '/dashboard/withdrawals' },
    { id: 'profile', label: 'Mon profil', icon: User, path: '/dashboard/profile' },
    { id: 'subscription', label: 'Abonnement', icon: Sparkles, path: '/dashboard/subscription' },
    ...(isAdmin ? [{ id: 'admin', label: 'Administration', icon: Shield, path: '/admin' }] : []),
  ];

  const displayName = profile?.display_name || 'Créateur';
  const username = profile?.username || 'pseudo';

  // Helper to choose corresponding file type icon
  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video size={24} className="text-accent-corail" />;
      case 'image':
        return <ImageIcon size={24} className="text-blue-400" />;
      case 'audio':
        return <Music size={24} className="text-purple-400" />;
      default:
        return <FileText size={24} className="text-emerald-400" />;
    }
  };

  return (
    <div className={`min-h-screen ${themeStyles.bg} ${themeStyles.textPrimary} flex flex-col md:flex-row font-sans transition-colors duration-200`}>
      
      {/* 1. Sidebar - Fixed Left on Desktop */}
      <aside className={`hidden md:flex flex-col ${isSidebarCollapsed ? 'w-20 p-4' : 'w-64 p-6'} ${themeStyles.surface} border-r ${themeStyles.border} h-screen sticky top-0 justify-between shrink-0 transition-all duration-300 ease-in-out z-50`}>
        <div className="flex flex-col gap-8">
          {/* Logo Brand Header */}
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-2 px-2'} transition-all duration-300`}>
            <div className="w-8 h-8 rounded-full bg-accent-corail flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-white" />
            </div>
            {!isSidebarCollapsed && (
              <span className={`font-display font-bold text-lg ${themeStyles.textPrimary} tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300`}>
                MomoLink <span className="text-accent-corail text-xs font-semibold">Pro</span>
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const showDot = item.id === 'subscription' && isSubActionRequired();
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3'} rounded-[12px] text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-accent-corail/10 text-accent-corail border border-accent-corail/15 font-semibold' 
                      : `${themeStyles.textSecondary} hover:text-text-primary ${themeStyles.hoverBg} border border-transparent`
                  }`}
                >
                  <div className="flex items-center gap-3 relative">
                    <Icon size={18} className="shrink-0" />
                    {!isSidebarCollapsed && (
                      <span className="whitespace-nowrap transition-all duration-300">{item.label}</span>
                    )}
                    {isSidebarCollapsed && showDot && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                  </div>
                  {!isSidebarCollapsed && showDot && (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Creator Info, Logout and Collapse Button */}
        <div className={`flex flex-col gap-4 border-t ${themeStyles.border} pt-6`}>
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-2'} transition-all duration-300`}>
            <div 
              onClick={() => navigate('/dashboard/profile')}
              className="w-10 h-10 rounded-full bg-accent-corail/15 flex items-center justify-center border border-accent-corail/25 shrink-0 cursor-pointer hover:border-accent-corail/50 transition-colors overflow-hidden"
              title={isSidebarCollapsed ? `Profil de ${displayName}` : undefined}
            >
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={displayName} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-display text-sm font-semibold text-accent-corail uppercase">
                  {displayName.substring(0, 2)}
                </span>
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className={`text-xs font-semibold ${themeStyles.textPrimary} truncate`}>{displayName}</span>
                <span className={`text-[10px] ${themeStyles.textSecondary} truncate`}>@{username}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleSignOut}
            title={isSidebarCollapsed ? "Déconnexion" : undefined}
            className={`flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'} rounded-[12px] text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer`}
          >
            <LogOut size={16} className="shrink-0" />
            {!isSidebarCollapsed && <span>Déconnexion</span>}
          </button>

          {/* Collapse Toggle Button */}
          <button
            onClick={() => {
              setIsSidebarCollapsed(prev => {
                const newVal = !prev;
                localStorage.setItem('momo_sidebar_collapsed', String(newVal));
                return newVal;
              });
            }}
            className={`flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'} rounded-[12px] text-xs font-semibold ${themeStyles.textSecondary} hover:text-accent-corail hover:bg-neutral-800/5 dark:hover:bg-neutral-800/30 transition-all duration-200 border-t ${themeStyles.border} mt-1 pt-4 cursor-pointer`}
            title={isSidebarCollapsed ? "Développer le menu" : "Réduire le menu"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight size={16} className="shrink-0" />
            ) : (
              <>
                <ChevronLeft size={16} className="shrink-0" />
                <span>Réduire le menu</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Right Content Section Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* Global Dashboard Top Header */}
        <header className={`flex items-center justify-between ${themeStyles.surface} border-b ${themeStyles.border} px-4 md:px-8 py-3.5 sticky top-0 z-40 transition-colors duration-200 shadow-sm`}>
          {/* Left part: Brand on mobile, Navigation Page Title on desktop */}
          <div className="flex items-center gap-3">
            {/* Mobile Brand */}
            <div className="md:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-accent-corail flex items-center justify-center">
                <Sparkles size={13} className="text-white" />
              </div>
              <span className={`font-display font-bold text-sm ${themeStyles.textPrimary} tracking-tight`}>
                MomoLink <span className="text-accent-corail text-xs font-semibold">Pro</span>
              </span>
            </div>
          </div>

          {/* Right Side: Actions (Visiter le profil, copy link, and profile button) */}
          <div className="flex items-center gap-2.5">
            {/* "Visiter le profil" Action Button with Copy Button inside a stylish Group */}
            <div className={`flex items-center rounded-xl overflow-hidden border ${themeStyles.border} ${isDarkMode ? 'bg-neutral-900/40' : 'bg-gray-50/50'} p-0.5 shadow-sm`}>
              <a
                href={`/@${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold ${themeStyles.textPrimary} hover:bg-accent-corail hover:text-white transition-all duration-150 cursor-pointer`}
              >
                <Store size={14} />
                <span className="hidden sm:inline">Visiter ma boutique</span>
                <span className="sm:hidden">Ma boutique</span>
              </a>
              
              <div className={`w-px h-5 ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />
              
              <button
                onClick={() => {
                  const profileUrl = `${window.location.origin}/@${username}`;
                  navigator.clipboard.writeText(profileUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={`p-1.5 rounded-lg ${themeStyles.textSecondary} hover:text-accent-corail transition-all hover:bg-neutral-800/10 dark:hover:bg-neutral-800/50 cursor-pointer flex items-center justify-center`}
                title="Copier le lien"
              >
                {copied ? (
                  <CheckCircle2 size={14} className="text-emerald-500" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>

            {/* Profile Avatar Button */}
            <button
              onClick={() => navigate('/dashboard/profile')}
              className={`w-9 h-9 rounded-xl border ${themeStyles.border} ${themeStyles.textSecondary} hover:text-accent-corail hover:bg-neutral-800/10 dark:hover:bg-neutral-800/50 transition-all cursor-pointer flex items-center justify-center overflow-hidden`}
              title="Paramètres de mon profil"
            >
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={displayName} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={15} />
              )}
            </button>
          </div>
        </header>

        {/* 3. Mobile Bottom Navigation Bar */}
        <nav className={`md:hidden fixed bottom-0 left-0 right-0 ${themeStyles.surface} border-t ${themeStyles.border} px-4 py-2 flex justify-around items-center z-50 shadow-lg transition-colors duration-200`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const showDot = item.id === 'subscription' && isSubActionRequired();
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 transition-colors duration-200 relative ${
                  isActive ? 'text-accent-corail font-semibold' : themeStyles.textSecondary
                }`}
              >
                <div className="relative">
                  <Icon size={18} />
                  {showDot && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  )}
                </div>
                <span className="text-[9px] uppercase tracking-wider font-semibold">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center gap-1 p-2 text-red-400"
          >
            <LogOut size={18} />
            <span className="text-[9px] uppercase tracking-wider font-semibold">Quitter</span>
          </button>
        </nav>

        {/* 4. Main Dashboard Content Area */}
        <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10 overflow-y-auto max-w-6xl mx-auto w-full">
        
        {/* Active Tab: Home view */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-8">
            {/* Header section with Creator Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className={`font-display text-3xl md:text-4xl font-medium tracking-tight ${themeStyles.textPrimary}`}>
                  Bonjour, {displayName}
                </h1>
                <p className={`text-sm ${themeStyles.textSecondary} mt-1`}>
                  Voici un résumé de votre activité
                </p>
              </div>

              {/* Header CTA - Desktop Only */}
              <Link
                to="/dashboard/content"
                className="hidden sm:flex items-center gap-2 px-5 py-3 rounded-[12px] bg-accent-corail hover:bg-accent-corail-hover text-white text-xs font-semibold shadow-lg shadow-accent-corail/15 transition-all duration-200 active:scale-[0.98]"
              >
                <Plus size={16} />
                Ajouter un contenu
              </Link>
            </div>



            {/* 4 Stats Cards Grid 2x2 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat 1 */}
              <div className={`${themeStyles.surface} border ${themeStyles.border} p-5 rounded-[20px] flex flex-col justify-between min-h-[120px] shadow-sm hover:border-accent-corail/30 transition-all duration-200`}>
                <div className="flex justify-between items-start">
                  <span className={`text-[11px] font-bold ${themeStyles.textSecondary} uppercase tracking-widest`}>Revenus du mois</span>
                  <div className="p-2 rounded-[8px] bg-accent-corail/10 text-accent-corail">
                    <TrendingUp size={14} />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="font-display text-lg md:text-2xl font-semibold text-accent-corail">
                    {stats.monthlyEarnings.toLocaleString()} FCFA
                  </span>
                  <p className={`text-[10px] ${themeStyles.textSecondary} mt-0.5`}>Ce mois civil</p>
                </div>
              </div>

              {/* Stat 2 */}
              <div className={`${themeStyles.surface} border ${themeStyles.border} p-5 rounded-[20px] flex flex-col justify-between min-h-[120px] shadow-sm hover:border-accent-corail/30 transition-all duration-200`}>
                <div className="flex justify-between items-start">
                  <span className={`text-[11px] font-bold ${themeStyles.textSecondary} uppercase tracking-widest`}>Ventes du mois</span>
                  <div className="p-2 rounded-[8px] bg-success-gold/10 text-success-gold">
                    <ShoppingBag size={14} />
                  </div>
                </div>
                <div className="mt-4">
                  <span className={`font-display text-lg md:text-2xl font-semibold ${themeStyles.textPrimary}`}>
                    {stats.monthlySalesCount} ventes
                  </span>
                  <p className={`text-[10px] ${themeStyles.textSecondary} mt-0.5`}>Taux de conversion stable</p>
                </div>
              </div>

              {/* Stat 3 */}
              <div className={`${themeStyles.surface} border ${themeStyles.border} p-5 rounded-[20px] flex flex-col justify-between min-h-[120px] shadow-sm hover:border-accent-corail/30 transition-all duration-200`}>
                <div className="flex justify-between items-start">
                  <span className={`text-[11px] font-bold ${themeStyles.textSecondary} uppercase tracking-widest`}>Revenus totaux</span>
                  <div className="p-2 rounded-[8px] bg-green-500/10 text-green-400">
                    <CreditCard size={14} />
                  </div>
                </div>
                <div className="mt-4">
                  <span className={`font-display text-lg md:text-2xl font-semibold ${themeStyles.textPrimary}`}>
                    {stats.totalEarnings.toLocaleString()} FCFA
                  </span>
                  <p className={`text-[10px] ${themeStyles.textSecondary} mt-0.5`}>Cumul historique</p>
                </div>
              </div>

              {/* Stat 4 */}
              <div className={`${themeStyles.surface} border ${themeStyles.border} p-5 rounded-[20px] flex flex-col justify-between min-h-[120px] shadow-sm hover:border-accent-corail/30 transition-all duration-200`}>
                <div className="flex justify-between items-start">
                  <span className={`text-[11px] font-bold ${themeStyles.textSecondary} uppercase tracking-widest`}>Contenus publiés</span>
                  <div className="p-2 rounded-[8px] bg-purple-500/10 text-purple-400">
                    <Grid size={14} />
                  </div>
                </div>
                <div className="mt-4">
                  <span className={`font-display text-lg md:text-2xl font-semibold ${themeStyles.textPrimary}`}>
                    {stats.publishedContentsCount} guides
                  </span>
                  <p className={`text-[10px] ${themeStyles.textSecondary} mt-0.5`}>Actifs en ligne</p>
                </div>
              </div>
            </div>

            {/* Latest Sales / Transactions List */}
            <div className="flex flex-col gap-4">
              <h3 className={`font-display text-xl font-medium ${themeStyles.textPrimary} tracking-tight`}>
                Dernières ventes
              </h3>
              
              <div className={`${themeStyles.surface} border ${themeStyles.border} rounded-[20px] overflow-hidden shadow-md`}>
                {latestPurchases.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                    <ShoppingBag className={`${themeStyles.textSecondary} opacity-40 h-10 w-10`} />
                    <span className={`text-sm font-semibold ${themeStyles.textPrimary}`}>Aucune vente</span>
                    <span className={`text-xs ${themeStyles.textSecondary}`}>Vos premières ventes apparaîtront ici</span>
                  </div>
                ) : (
                  <div className={`divide-y ${themeStyles.border}`}>
                    {latestPurchases.map((purchase) => {
                      const amount = purchase.amount_paid_fcfa || purchase.amount || 0;
                      const title = purchase.contents?.title || purchase.title || 'Guide exclusif';
                      const timeString = purchase.created_at ? formatTimeAgo(purchase.created_at) : (purchase.time || 'récemment');
                      return (
                        <div key={purchase.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-black/10 transition-all duration-150">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-[10px] bg-accent-corail/10 flex items-center justify-center text-accent-corail shrink-0">
                              <ShoppingBag size={18} />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className={`text-xs font-semibold ${themeStyles.textPrimary} truncate block`}>{title}</span>
                              <span className={`text-[10px] ${themeStyles.textSecondary} flex items-center gap-1 mt-0.5`}>
                                <Clock size={10} />
                                {timeString} • {purchase.buyer_phone || 'Acheteur'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <span className={`text-sm font-bold ${isDarkMode ? 'text-success-gold' : 'text-neutral-950'} font-mono`}>
                              +{amount.toLocaleString()} FCFA
                            </span>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-600 text-white'} text-[10px] font-extrabold uppercase tracking-wider shadow-sm`}>
                              Payé
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Floating Action Button - Mobile Only */}
            <Link
              to="/dashboard/content"
              className="sm:hidden fixed bottom-20 right-6 w-14 h-14 rounded-full bg-accent-corail flex items-center justify-center text-white shadow-xl hover:bg-accent-corail-hover transition-transform duration-200 active:scale-95 z-40"
            >
              <Plus size={24} />
            </Link>
          </div>
        )}

        {/* ==========================================
            STEP 5: MON CONTENU - FULL TAB VIEW
           ========================================== */}
        {activeTab === 'content' && (
          <div className="flex flex-col gap-6">
            
            {/* Header section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`font-display text-2xl md:text-3xl font-medium tracking-tight ${themeStyles.textPrimary}`}>
                  Mon contenu
                </h1>
                <p className={`text-xs ${themeStyles.textSecondary} mt-0.5`}>
                  {contentsList.length} contenu{contentsList.length > 1 ? 's' : ''} géré{contentsList.length > 1 ? 's' : ''}
                </p>
              </div>

              {/* Add Content Button */}
              {!isFormOpen && (
                <div className="flex flex-col items-end gap-1.5">
                  <button
                    disabled={!isSubscribed()}
                    onClick={() => {
                      setIsFormOpen(true);
                      setSuccessMsg(null);
                      setErrorMsg(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-white text-xs font-semibold shadow-md transition-all duration-200 active:scale-95 ${
                      isSubscribed()
                        ? 'bg-accent-corail hover:bg-accent-corail-hover cursor-pointer'
                        : 'bg-neutral-300 dark:bg-neutral-800 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <Plus size={16} />
                    Ajouter un contenu
                  </button>
                  {!isSubscribed() && (
                    <span className="text-[10px] text-neutral-400">
                      Abonnement requis pour publier du contenu.{' '}
                      <Link to="/dashboard/subscription" className="text-accent-corail hover:underline font-semibold">
                        S'abonner
                      </Link>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Form Section (Opens inline under the header) */}
            <AnimatePresence>
              {isFormOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className={`${themeStyles.surface} border ${themeStyles.border} p-5 md:p-6 rounded-[20px] flex flex-col gap-5 shadow-inner`}>
                    
                    <div className={`flex justify-between items-center pb-2 border-b ${themeStyles.border}`}>
                      <h2 className={`font-display text-lg font-semibold ${themeStyles.textPrimary} flex items-center gap-2`}>
                        <Plus className="text-accent-corail" size={18} />
                        Créer un nouveau contenu exclusif
                      </h2>
                      <button
                        onClick={() => setIsFormOpen(false)}
                        className={`p-1.5 rounded-lg ${themeStyles.textSecondary} ${isDarkMode ? 'hover:text-text-primary' : 'hover:text-light-text-primary'} ${themeStyles.hoverBg} cursor-pointer`}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Notification Banners */}
                    {errorMsg && (
                      <div className="p-3.5 rounded-[12px] bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <span>{errorMsg}</span>
                      </div>
                    )}
                    
                    {successMsg && (
                      <div className="p-3.5 rounded-[12px] bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-start gap-2">
                        <Check size={16} className="shrink-0 mt-0.5" />
                        <span>{successMsg}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      
                      {/* Left: Metadata Inputs */}
                      <div className="flex flex-col gap-4">
                        
                        {/* Title input */}
                        <div className="flex flex-col gap-1.5">
                          <label className={`text-xs font-semibold ${themeStyles.textPrimary} flex justify-between`}>
                            <span>Titre du contenu *</span>
                            <span className={title.length > 80 ? 'text-red-400' : themeStyles.textSecondary}>
                              {title.length}/80
                            </span>
                          </label>
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="ex: Guide ultime pour doubler ses ventes TikTok"
                            maxLength={80}
                            required
                            className={`w-full px-3.5 py-2.5 rounded-[12px] ${isDarkMode ? 'bg-bg-primary' : 'bg-light-bg-primary'} border ${themeStyles.border} focus:border-accent-corail text-xs ${themeStyles.textPrimary} ${isDarkMode ? 'placeholder:text-text-secondary/60' : 'placeholder:text-gray-400'} outline-none transition-colors`}
                          />
                        </div>

                        {/* Description input */}
                        <div className="flex flex-col gap-1.5">
                          <label className={`text-xs font-semibold ${themeStyles.textPrimary} flex justify-between`}>
                            <span>Description (Optionnelle)</span>
                            <span className={description.length > 300 ? 'text-red-400' : themeStyles.textSecondary}>
                              {description.length}/300
                            </span>
                          </label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Décrivez brièvement la valeur de votre guide..."
                            maxLength={300}
                            rows={3}
                            className={`w-full px-3.5 py-2.5 rounded-[12px] ${isDarkMode ? 'bg-bg-primary' : 'bg-light-bg-primary'} border ${themeStyles.border} focus:border-accent-corail text-xs ${themeStyles.textPrimary} ${isDarkMode ? 'placeholder:text-text-secondary/60' : 'placeholder:text-gray-400'} outline-none transition-colors resize-none`}
                          />
                        </div>

                        {/* Content Type & Price */}
                        <div className="grid grid-cols-2 gap-4">
                          
                          <div className="flex flex-col gap-1.5">
                            <label className={`text-xs font-semibold ${themeStyles.textPrimary}`}>Type de contenu</label>
                            <select
                              value={contentType}
                              onChange={(e: any) => setContentType(e.target.value)}
                              className={`w-full px-3 py-2.5 rounded-[12px] ${isDarkMode ? 'bg-bg-primary' : 'bg-light-bg-primary'} border ${themeStyles.border} text-xs ${themeStyles.textPrimary} outline-none focus:border-accent-corail transition-colors`}
                            >
                              <option value="pdf">📄 Fichier PDF</option>
                              <option value="video">🎥 Vidéo</option>
                              <option value="image">🖼️ Image</option>
                              <option value="audio">🎵 Fichier Audio</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className={`text-xs font-semibold ${themeStyles.textPrimary}`}>Prix d'achat (FCFA) *</label>
                            <input
                              type="number"
                              value={priceFcfa}
                              onChange={(e) => setPriceFcfa(e.target.value === '' ? '' : Math.abs(parseInt(e.target.value)))}
                              placeholder="ex: 2000"
                              min={100}
                              required
                              className={`w-full px-3.5 py-2.5 rounded-[12px] ${isDarkMode ? 'bg-bg-primary' : 'bg-light-bg-primary'} border ${themeStyles.border} focus:border-accent-corail text-xs ${themeStyles.textPrimary} font-mono outline-none transition-colors`}
                            />
                          </div>

                        </div>

                      </div>

                      {/* Right: File Upload Zones */}
                      <div className="flex flex-col gap-4">
                        
                        {/* Main File Drag and Drop */}
                        <div className="flex flex-col gap-1.5 flex-1">
                          <label className={`text-xs font-semibold ${themeStyles.textPrimary}`}>Fichier principal obligatoire *</label>
                          <div
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('main-file-input')?.click()}
                            className={`flex-1 border-2 border-dashed rounded-[16px] p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                              dragActive 
                                ? 'border-accent-corail bg-accent-corail/5' 
                                : `${isDarkMode ? 'border-border-custom hover:bg-bg-surface-hover/30' : 'border-gray-300 hover:bg-gray-50'}`
                            }`}
                          >
                            <input
                              id="main-file-input"
                              type="file"
                              className="hidden"
                              onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                            />
                            
                            <UploadCloud size={28} className={`${themeStyles.textSecondary} mb-2`} />
                            
                            {file ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-xs font-semibold text-accent-corail truncate max-w-[200px]">
                                  {file.name}
                                </span>
                                <span className={`text-[10px] ${themeStyles.textSecondary}`}>
                                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-0.5">
                                <span className={`text-xs font-medium ${themeStyles.textPrimary}`}>Glissez-déposez votre fichier ici</span>
                                <span className={`text-[10px] ${themeStyles.textSecondary}`}>ou cliquez pour parcourir</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Optional Preview Image Upload */}
                        <div className="flex flex-col gap-1.5">
                          <label className={`text-xs font-semibold ${themeStyles.textPrimary}`}>Image de prévisualisation (Optionnelle)</label>
                          <div
                            onDragEnter={handlePreviewDrag}
                            onDragOver={handlePreviewDrag}
                            onDragLeave={handlePreviewDrag}
                            onDrop={handlePreviewDrop}
                            onClick={() => document.getElementById('preview-file-input')?.click()}
                            className={`border-2 border-dashed rounded-[16px] p-3 flex items-center justify-center text-center cursor-pointer transition-all ${
                              previewDragActive 
                                ? 'border-accent-corail bg-accent-corail/5' 
                                : `${isDarkMode ? 'border-border-custom hover:bg-bg-surface-hover/30' : 'border-gray-300 hover:bg-gray-50'}`
                            }`}
                          >
                            <input
                              id="preview-file-input"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => e.target.files?.[0] && setPreviewFile(e.target.files[0])}
                            />
                            <div className="flex items-center gap-3">
                              <ImageIcon size={18} className={`${themeStyles.textSecondary} shrink-0`} />
                              <div className="text-left">
                                {previewFile ? (
                                  <span className="text-xs font-semibold text-accent-corail block truncate max-w-[180px]">
                                    {previewFile.name}
                                  </span>
                                ) : (
                                  <span className={`text-[11px] ${themeStyles.textSecondary} block`}>
                                    PNG, JPG ou WEBP de couverture
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* Actions bar */}
                    <div className={`flex flex-wrap justify-end gap-3 mt-2 border-t ${themeStyles.border} pt-4`}>
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className={`px-4 py-2.5 rounded-[12px] text-xs font-semibold ${themeStyles.textSecondary} ${isDarkMode ? 'hover:text-text-primary' : 'hover:text-light-text-primary'} ${themeStyles.hoverBg} transition-all cursor-pointer`}
                      >
                        Annuler
                      </button>

                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleCreateContent('draft')}
                        className={`px-4 py-2.5 rounded-[12px] text-xs font-semibold ${isDarkMode ? 'bg-[#2E2A24] hover:bg-[#3E3A34] text-text-primary' : 'bg-gray-100 hover:bg-gray-200 text-light-text-primary'} transition-all disabled:opacity-50 cursor-pointer`}
                      >
                        {isSubmitting ? 'Enregistrement...' : 'Enregistrer en brouillon'}
                      </button>

                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleCreateContent('published')}
                        className="px-5 py-2.5 rounded-[12px] text-xs font-bold bg-accent-corail hover:bg-accent-corail-hover text-white transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                            Publication...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={14} />
                            Publier maintenant
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* List of contents */}
            {isLoadingContents ? (
              <div className="py-20 text-center flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-4 border-accent-corail border-t-transparent animate-spin" />
                <span className={`text-xs ${themeStyles.textSecondary}`}>Chargement de vos contenus...</span>
              </div>
            ) : contentsList.length === 0 ? (
              // Empty State
              <div className="flex flex-col gap-8 py-16 justify-center items-center text-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-accent-corail/10 flex items-center justify-center border border-accent-corail/25">
                  <Grid className="text-accent-corail h-8 w-8" />
                </div>
                <div>
                  <h2 className={`font-display text-xl font-medium ${themeStyles.textPrimary}`}>
                    Ajoutez votre premier contenu exclusif
                  </h2>
                  <p className={`text-xs ${themeStyles.textSecondary} mt-1.5 leading-relaxed`}>
                    Commencez à monétiser votre audience dès aujourd'hui en ajoutant votre premier PDF, vidéo, formation ou ressource audio.
                  </p>
                </div>
                
                {!isFormOpen && (
                  <div className="flex flex-col items-center gap-2">
                    <button
                      disabled={!isSubscribed()}
                      onClick={() => setIsFormOpen(true)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-[12px] text-white text-xs font-bold shadow-lg transition-transform duration-150 active:scale-95 ${
                        isSubscribed()
                          ? 'bg-accent-corail hover:bg-accent-corail-hover cursor-pointer'
                          : 'bg-neutral-300 dark:bg-neutral-800 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <Plus size={16} />
                      Ajouter un contenu
                    </button>
                    {!isSubscribed() && (
                      <span className="text-[10px] text-neutral-400">
                        Abonnement requis pour publier du contenu.{' '}
                        <Link to="/dashboard/subscription" className="text-accent-corail hover:underline font-semibold">
                          S'abonner
                        </Link>
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Contents Grid
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {contentsList.map((content) => (
                  <div
                    key={content.id}
                    className={`${themeStyles.surface} border rounded-[20px] p-4 flex flex-col justify-between gap-4 relative shadow-md group hover:border-[#FF6B4A]/40 transition-all duration-300`}
                  >
                    
                    {/* Top: Info & Actions dots */}
                    <div className="flex justify-between items-start gap-3">
                      
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Thumbnail or File Type Icon */}
                        <div className={`w-12 h-12 rounded-[12px] ${isDarkMode ? 'bg-[#14120F]' : 'bg-gray-50'} flex items-center justify-center shrink-0 border ${themeStyles.border} overflow-hidden`}>
                          {content.thumbnail_url || content.preview_url ? (
                            <img
                              src={content.thumbnail_url || content.preview_url || undefined}
                              alt={content.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            getFileTypeIcon(content.content_type)
                          )}
                        </div>

                        {/* Title and date */}
                        <div className="flex flex-col min-w-0">
                          <h4 className={`text-xs font-bold ${themeStyles.textPrimary} line-clamp-1 group-hover:text-accent-corail transition-colors`}>
                            {content.title}
                          </h4>
                          <span className={`text-[10px] ${themeStyles.textSecondary} mt-0.5 font-mono flex items-center gap-1`}>
                            <Clock size={10} />
                            {new Date(content.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Action trigger dots */}
                      <div className="relative shrink-0">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === content.id ? null : content.id)}
                          className={`p-1.5 rounded-lg hover:bg-black/10 ${themeStyles.textSecondary} ${isDarkMode ? 'hover:text-text-primary' : 'hover:text-light-text-primary'} transition-colors cursor-pointer`}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* Actions drop-down */}
                        <AnimatePresence>
                          {activeMenuId === content.id && (
                            <motion.div
                              ref={menuRef}
                              initial={{ opacity: 0, scale: 0.95, y: -5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -5 }}
                              transition={{ duration: 0.15 }}
                              className={`absolute right-0 mt-1.5 w-40 ${isDarkMode ? 'bg-bg-surface border-border-custom' : 'bg-white border-gray-200'} border rounded-[12px] py-1 shadow-xl z-50 overflow-hidden text-left`}
                            >
                              {content.status === 'published' ? (
                                <button
                                  onClick={() => handleUpdateStatus(content.id, 'draft')}
                                  className={`w-full px-3 py-2 text-[11px] font-semibold ${themeStyles.textSecondary} ${isDarkMode ? 'hover:text-text-primary' : 'hover:text-light-text-primary'} hover:bg-accent-corail/10 flex items-center gap-2 cursor-pointer transition-colors`}
                                >
                                  <FileText size={12} className={themeStyles.textSecondary} />
                                  Dépublier (Brouillon)
                                </button>
                              ) : content.status === 'draft' ? (
                                <button
                                  onClick={() => handleUpdateStatus(content.id, 'published')}
                                  className={`w-full px-3 py-2 text-[11px] font-semibold ${themeStyles.textSecondary} ${isDarkMode ? 'hover:text-text-primary' : 'hover:text-light-text-primary'} hover:bg-accent-corail/10 flex items-center gap-2 cursor-pointer transition-colors`}
                                >
                                  <CheckCircle2 size={12} className={themeStyles.textSecondary} />
                                  Publier le contenu
                                </button>
                              ) : null}

                              <button
                                onClick={() => handleUpdateStatus(content.id, 'archived')}
                                className={`w-full px-3 py-2 text-[11px] font-semibold ${themeStyles.textSecondary} ${isDarkMode ? 'hover:text-text-primary' : 'hover:text-light-text-primary'} hover:bg-accent-corail/10 flex items-center gap-2 cursor-pointer transition-colors`}
                              >
                                <Archive size={12} className={themeStyles.textSecondary} />
                                Archiver
                              </button>
                              
                              <button
                                onClick={() => handleUpdateStatus(content.id, 'removed')}
                                className="w-full px-3 py-2 text-[11px] font-semibold text-red-400 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Trash2 size={12} className="text-red-400" />
                                Supprimer
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                    </div>

                    {/* Description excerpt */}
                    {content.description && (
                      <p className={`text-[11px] ${themeStyles.textSecondary} line-clamp-2 leading-relaxed`}>
                        {content.description}
                      </p>
                    )}

                    {/* Bottom row: Price and Status Badge */}
                    <div className={`flex items-center justify-between border-t ${themeStyles.border} pt-3 mt-1`}>
                      
                      {/* Price in corail */}
                      <div className="flex flex-col">
                        <span className={`text-[9px] uppercase tracking-wider ${themeStyles.textSecondary} font-semibold`}>Prix</span>
                        <span className="text-sm font-extrabold text-[#FF6B4A] font-mono">
                          {content.price_fcfa.toLocaleString()} FCFA
                        </span>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2">
                        {content.status === 'published' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#F2B84B] text-[#14120F] text-[9px] font-extrabold uppercase tracking-widest shadow-sm">
                            Publié
                          </span>
                        ) : content.status === 'archived' ? (
                          <span className={`px-2.5 py-0.5 rounded-full ${isDarkMode ? 'bg-[#2E2A24] text-amber-500 border border-amber-500/25' : 'bg-amber-100 text-amber-700 border border-amber-200'} text-[9px] font-bold uppercase tracking-widest`}>
                            Archivé
                          </span>
                        ) : content.auto_drafted_by_subscription ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="px-2.5 py-1 rounded-full bg-red-950/40 text-red-400 border border-red-500/20 text-[9px] font-bold uppercase tracking-wider text-center">
                              Dépublié — abonnement expiré
                            </span>
                            <Link to="/dashboard/subscription" className="text-[9px] text-[#FF5252] hover:underline font-bold">
                              Se réabonner
                            </Link>
                          </div>
                        ) : (
                          <span className={`px-2.5 py-0.5 rounded-full ${isDarkMode ? 'bg-[#2E2A24] text-[#A8A296]' : 'bg-gray-100 text-gray-600'} text-[9px] font-bold uppercase tracking-widest`}>
                            Brouillon
                          </span>
                        )}
                        
                        <span className={`text-[10px] ${themeStyles.textSecondary} uppercase font-bold px-2 py-0.5 ${isDarkMode ? 'bg-[#14120F]' : 'bg-gray-100'} rounded-md border ${themeStyles.border} font-mono shrink-0`}>
                          {content.content_type}
                        </span>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 7: MES RETRAITS - TAB VIEW */}
        {activeTab === 'withdrawals' && (
          <div className="flex flex-col gap-8">
            {/* Header section */}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className={`font-display text-2xl font-bold tracking-tight ${themeStyles.textPrimary}`}>
                  Mes retraits
                </h2>
                <p className={`text-xs ${themeStyles.textSecondary} mt-0.5`}>
                  Les demandes sont traitées sous 24-48h ouvrées
                </p>
              </div>
            </div>

            {/* Error and Success notifications */}
            {withdrawalError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-[16px] text-xs flex items-center gap-2">
                <X className="shrink-0" size={14} />
                <span>{withdrawalError}</span>
              </div>
            )}
            {withdrawalSuccess && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-[16px] text-xs flex items-center gap-2">
                <Check className="shrink-0" size={14} />
                <span>{withdrawalSuccess}</span>
              </div>
            )}

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Balance and Action Card (cols: 5) */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* Solde Disponible Card */}
                <div className={`${themeStyles.surface} border ${themeStyles.border} rounded-[24px] p-6 shadow-md flex flex-col gap-5 relative overflow-hidden`}>
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-accent-corail" />
                  
                  <div className="flex flex-col gap-1">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${themeStyles.textSecondary}`}>
                      Disponible pour retrait
                    </span>
                    <span className="font-display text-[32px] font-black text-accent-corail leading-tight">
                      {availableBalance.toLocaleString()} FCFA
                    </span>
                  </div>

                  <div className={`pt-4 border-t ${themeStyles.border} flex flex-col gap-3`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] ${themeStyles.textSecondary}`}>Compte de versement</span>
                      <button
                        onClick={() => navigate('/dashboard/profile')}
                        className="text-[11px] font-bold text-accent-corail hover:underline"
                      >
                        Modifier
                      </button>
                    </div>

                    {profile?.payout_phone_number ? (
                      <div className={`p-3 rounded-[16px] ${isDarkMode ? 'bg-[#14120F]' : 'bg-gray-50'} flex items-center justify-between border ${themeStyles.border}`}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          {getPayoutProviderLogo(profile.payout_provider) ? (
                            <img 
                              src={getPayoutProviderLogo(profile.payout_provider)!} 
                              alt={profile.payout_provider}
                              className="w-7 h-7 rounded-full object-cover border border-white shrink-0" 
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-accent-corail/10 text-accent-corail flex items-center justify-center shrink-0">
                              <Phone size={14} />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className={`text-xs font-bold ${themeStyles.textPrimary}`}>
                              {getPayoutProviderLabel(profile.payout_provider)}
                            </span>
                            <span className={`text-[11px] ${themeStyles.textSecondary} font-mono truncate`}>
                              {profile.payout_phone_number}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-[16px] bg-amber-500/10 border border-amber-500/25 text-amber-500 text-xs flex flex-col gap-2">
                        <span>Opérateur de versement non configuré.</span>
                        <button
                          onClick={() => navigate('/dashboard/profile')}
                          className="px-4 py-2 rounded-full bg-amber-500 text-black font-bold text-[10px] uppercase hover:bg-amber-600 transition-colors self-start cursor-pointer"
                        >
                          Configurer maintenant
                        </button>
                      </div>
                    )}
                  </div>

                  {profile?.payout_phone_number && (
                    <div className="flex flex-col gap-1.5 w-full mt-2">
                      <button
                        disabled={availableBalance < 5000 || !isSubscribed()}
                        onClick={() => {
                          setWithdrawalError(null);
                          setWithdrawalSuccess(null);
                          setIsWithdrawModalOpen(true);
                        }}
                        className={`w-full py-3 rounded-[16px] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 ${
                          availableBalance >= 5000 && isSubscribed()
                            ? 'bg-accent-corail hover:bg-accent-corail-hover cursor-pointer'
                            : 'bg-neutral-300 dark:bg-neutral-800 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <Wallet size={14} />
                        Demander un retrait
                      </button>
                      {!isSubscribed() && (
                        <p className="text-[10px] text-red-500 font-semibold text-center mt-1">
                          Abonnement requis pour effectuer un retrait.{' '}
                          <Link to="/dashboard/subscription" className="text-accent-corail hover:underline font-bold">
                            S'abonner
                          </Link>
                        </p>
                      )}
                    </div>
                  )}
                  {profile?.payout_phone_number && availableBalance < 5000 && isSubscribed() && (
                    <p className={`text-[10px] ${themeStyles.textSecondary} text-center`}>
                      Minimum de retrait de 5 000 FCFA requis.
                    </p>
                  )}
                </div>

                {/* Subtitle / Help Box */}
                <div className={`p-4 rounded-[20px] ${isDarkMode ? 'bg-[#14120F]' : 'bg-gray-50'} border ${themeStyles.border} flex flex-col gap-2`}>
                  <h4 className={`text-xs font-bold ${themeStyles.textPrimary}`}>Comment ça marche ?</h4>
                  <p className={`text-[11px] ${themeStyles.textSecondary} leading-relaxed`}>
                    Chaque vente de votre profil génère des revenus nets crédités sur votre compte. Vous pouvez demander un transfert vers votre Mobile Money (Wave, Orange, MTN, Moov) dès que votre solde atteint 5 000 FCFA. Les demandes sont traitées sous 24-48h ouvrées de manière sécurisée.
                  </p>
                </div>

              </div>

              {/* Right Column: Historical Withdrawals List (cols: 7) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <h3 className={`font-display text-lg font-bold tracking-tight ${themeStyles.textPrimary}`}>
                  Historique des demandes
                </h3>

                <div className={`${themeStyles.surface} border ${themeStyles.border} rounded-[24px] overflow-hidden shadow-md`}>
                  {isLoadingWithdrawals ? (
                    <div className="p-12 text-center flex flex-col items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-4 border-accent-corail border-t-transparent animate-spin" />
                      <span className={`text-xs ${themeStyles.textSecondary}`}>Chargement de l'historique...</span>
                    </div>
                  ) : withdrawalsList.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
                      <Wallet className={`${themeStyles.textSecondary} opacity-40 h-10 w-10`} />
                      <span className={`text-sm font-semibold ${themeStyles.textPrimary}`}>Aucun retrait</span>
                      <p className={`text-xs ${themeStyles.textSecondary} max-w-xs mt-0.5 leading-relaxed`}>
                        Vos demandes de versement financier s'afficheront ici.
                      </p>
                    </div>
                  ) : (
                    <div className={`divide-y ${themeStyles.border}`}>
                      {withdrawalsList.map((withdraw) => {
                        const dateText = new Date(withdraw.requested_at || withdraw.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                        return (
                          <div key={withdraw.id} className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-black/5 transition-all">
                            <div className="flex items-center gap-3 min-w-0">
                              {getPayoutProviderLogo(withdraw.payout_provider) ? (
                                <img 
                                  src={getPayoutProviderLogo(withdraw.payout_provider)!} 
                                  alt={withdraw.payout_provider}
                                  className="w-9 h-9 rounded-full object-cover border border-white shrink-0 shadow-sm" 
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-accent-corail/10 text-accent-corail flex items-center justify-center shrink-0">
                                  <Wallet size={16} />
                                </div>
                              )}
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-xs font-bold ${themeStyles.textPrimary}`}>
                                    Retrait {getPayoutProviderLabel(withdraw.payout_provider)}
                                  </span>
                                  <span className={`text-[10px] ${themeStyles.textSecondary} font-mono hidden sm:inline`}>
                                    ({withdraw.payout_phone_number})
                                  </span>
                                </div>
                                <span className={`text-[10px] ${themeStyles.textSecondary} flex items-center gap-1 mt-0.5`}>
                                  <Clock size={10} />
                                  Demande le {dateText}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className={`text-xs sm:text-sm font-bold ${themeStyles.textPrimary} font-mono`}>
                                {withdraw.amount_requested.toLocaleString()} FCFA
                              </span>
                              
                              {withdraw.status === 'paid' ? (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/25' : 'bg-emerald-100 text-emerald-800'} text-[9px] font-extrabold uppercase tracking-wide`}>
                                  Payé
                                </span>
                              ) : withdraw.status === 'approved' ? (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${isDarkMode ? 'bg-blue-500/20 text-blue-400 border border-blue-500/25' : 'bg-blue-100 text-blue-800'} text-[9px] font-extrabold uppercase tracking-wide`}>
                                  Approuvé
                                </span>
                              ) : withdraw.status === 'rejected' ? (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${isDarkMode ? 'bg-red-500/20 text-red-400 border border-red-500/25' : 'bg-red-100 text-red-800'} text-[9px] font-extrabold uppercase tracking-wide`}>
                                  Rejeté
                                </span>
                              ) : (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${isDarkMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/25' : 'bg-amber-100 text-amber-800'} text-[9px] font-extrabold uppercase tracking-wide`}>
                                  En attente
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Step 8 Modal popup logic for Withdrawal Creation */}
            <AnimatePresence>
              {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className={`w-full max-w-md ${themeStyles.surface} border ${themeStyles.border} rounded-[28px] p-6 shadow-2xl flex flex-col gap-6 relative`}
                  >
                    <button
                      onClick={() => setIsWithdrawModalOpen(false)}
                      className={`absolute top-5 right-5 p-1.5 rounded-full ${themeStyles.hoverBg} ${themeStyles.textSecondary} hover:text-neutral-900 transition-colors`}
                    >
                      <X size={16} />
                    </button>

                    <div className="flex flex-col gap-2">
                      <h3 className={`font-display text-lg font-bold ${themeStyles.textPrimary}`}>
                        Demande de retrait financier
                      </h3>
                      <p className={`text-xs ${themeStyles.textSecondary} leading-relaxed`}>
                        Spécifiez le montant que vous souhaitez transférer vers votre compte Mobile Money.
                      </p>
                    </div>

                    <form onSubmit={handleSubmitWithdrawal} className="flex flex-col gap-5">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className={`text-xs font-semibold ${themeStyles.textPrimary}`}>Montant à retirer (FCFA)</label>
                          <span className={`text-[10px] ${themeStyles.textSecondary}`}>Disponible : {availableBalance.toLocaleString()} FCFA</span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="Min: 5000"
                            min={5000}
                            max={availableBalance}
                            required
                            className={`w-full px-4 py-3 rounded-[16px] ${isDarkMode ? 'bg-bg-primary' : 'bg-light-bg-primary'} border ${themeStyles.border} focus:border-accent-corail outline-none font-mono text-sm ${themeStyles.textPrimary} transition-all`}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-accent-corail">FCFA</span>
                        </div>
                      </div>

                      <div className={`p-4 rounded-[20px] ${isDarkMode ? 'bg-[#14120F]' : 'bg-gray-50'} border ${themeStyles.border} flex flex-col gap-2`}>
                        <div className="flex justify-between items-center text-xs">
                          <span className={`${themeStyles.textSecondary}`}>Mode de versement</span>
                          <span className={`font-bold ${themeStyles.textPrimary}`}>{getPayoutProviderLabel(profile?.payout_provider)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className={`${themeStyles.textSecondary}`}>Numéro Mobile Money</span>
                          <span className={`font-bold font-mono ${themeStyles.textPrimary}`}>{profile?.payout_phone_number}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs border-t border-dashed pt-2 mt-1 border-gray-200">
                          <span className={`${themeStyles.textSecondary}`}>Frais de transfert</span>
                          <span className="font-semibold text-emerald-500 font-mono">0 FCFA (Offerts)</span>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setIsWithdrawModalOpen(false)}
                          className={`px-4 py-2.5 rounded-[12px] text-xs font-semibold ${themeStyles.textSecondary} ${themeStyles.hoverBg} transition-all cursor-pointer`}
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingWithdrawal}
                          className="px-5 py-2.5 rounded-[12px] text-xs font-bold bg-accent-corail hover:bg-accent-corail-hover text-white transition-all disabled:opacity-50 cursor-pointer shadow-md flex items-center gap-1"
                        >
                          {isSubmittingWithdrawal ? "Traitement..." : "Confirmer la demande"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </div>
        )}

        {/* Mon profil public - Éditeur complet */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border-custom/10">
              <div className="flex flex-col gap-1.5">
                <h2 className={`font-display text-2xl font-medium ${themeStyles.textPrimary}`}>
                  Mon profil public
                </h2>
                <p className={`text-xs ${themeStyles.textSecondary} leading-relaxed`}>
                  Éditez vos coordonnées publiques, liens vers les réseaux sociaux, et coordonnées de versement.
                </p>
              </div>

              {/* Copy Profile Link Button */}
              <button
                type="button"
                onClick={() => {
                  const profileUrl = `${window.location.origin}/@${profileUsername || username}`;
                  navigator.clipboard.writeText(profileUrl);
                  setProfileCopied(true);
                  setTimeout(() => setProfileCopied(false), 2000);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[12px] text-xs font-bold bg-accent-corail hover:bg-accent-corail-hover text-white transition-all shadow-md cursor-pointer whitespace-nowrap self-start sm:self-center"
              >
                {profileCopied ? (
                  <>
                    <Check size={14} />
                    Lien copié !
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copier mon lien de profil
                  </>
                )}
              </button>
            </div>

            {profileSuccessMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-[16px] bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <p className="font-semibold">{profileSuccessMsg}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileSuccessMsg(null)}
                  className="p-1 rounded-full hover:bg-green-500/15 text-green-400 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}

            {profileErrorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-[16px] bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start justify-between gap-2.5"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>{profileErrorMsg}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileErrorMsg(null)}
                  className="p-1 rounded-full hover:bg-red-500/15 text-red-400 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
              
              {/* Section 1: Identité Publique */}
              <div className={`${themeStyles.surface} border ${themeStyles.border} p-6 rounded-[24px] shadow-sm flex flex-col gap-5`}>
                <div className="flex items-center gap-2 pb-1.5 border-b border-border-custom/30">
                  <User size={16} className="text-accent-corail" />
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${themeStyles.textPrimary}`}>
                    Identité publique
                  </h3>
                </div>

                {/* Photo de profil */}
                <div className="flex items-center gap-5">
                  <div className="relative group w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-gray-300 dark:border-border-custom bg-gray-50/50 dark:bg-[#1E1B17]/30 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-gray-100/50 shrink-0">
                    {avatarPreview || profileAvatarUrl ? (
                      <>
                        <img 
                          src={avatarPreview || profileAvatarUrl} 
                          alt="Profil" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <UploadCloud size={16} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <User size={20} className="text-gray-400 dark:text-text-secondary" />
                      </div>
                    )}
                    <input 
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setAvatarFile(file);
                          setAvatarPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-text-secondary' : 'text-neutral-950'} uppercase tracking-wider`}>
                      Photo de profil
                    </span>
                    <span className="text-[10px] text-text-secondary">PNG, JPG, max 2MB. Recommandé : Carré.</span>
                    {(avatarPreview || profileAvatarUrl) && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarFile(null);
                          setAvatarPreview(null);
                          setProfileAvatarUrl('');
                        }}
                        className="text-[10px] text-red-500 hover:underline font-semibold text-left cursor-pointer"
                      >
                        Supprimer la photo
                      </button>
                    )}
                  </div>
                </div>

                {/* Photo de couverture */}
                <div className="flex flex-col gap-2">
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-text-secondary' : 'text-neutral-950'} uppercase tracking-wider`}>
                    Photo de couverture
                  </label>
                  
                  <div className="relative group rounded-xl overflow-hidden border border-dashed border-gray-300 dark:border-border-custom bg-gray-50/50 dark:bg-[#1E1B17]/30 h-36 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-gray-100/50">
                    {coverPreview || profileCoverUrl ? (
                      <>
                        <img 
                          src={coverPreview || profileCoverUrl} 
                          alt="Couverture" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-semibold flex items-center gap-1.5 bg-black/60 px-3.5 py-1.5 rounded-full">
                            <UploadCloud size={14} /> Modifier la photo
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-center p-4">
                        <ImageIcon size={24} className="text-gray-400 dark:text-text-secondary" />
                        <span className="text-xs font-semibold text-text-primary">Ajouter une photo de couverture</span>
                        <span className="text-[10px] text-text-secondary">PNG, JPG, max 5MB</span>
                      </div>
                    )}
                    <input 
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setCoverFile(file);
                          setCoverPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-text-secondary' : 'text-neutral-950'} uppercase tracking-wider`}>
                    Nom d'affichage <span className="text-accent-corail">*</span>
                  </label>
                  <input
                    type="text"
                    value={profileDisplayName}
                    onChange={(e) => setProfileDisplayName(e.target.value)}
                    maxLength={50}
                    placeholder="ex: Ama Coaching ou Michella"
                    className={`w-full px-4 py-3 rounded-[12px] border ${isDarkMode ? 'border-border-custom bg-bg-primary/50 text-text-primary placeholder:text-text-secondary/60' : 'border-neutral-300 bg-white text-black font-semibold placeholder:text-neutral-400'} text-sm focus:border-accent-corail focus:outline-none transition-all duration-200`}
                    required
                  />
                  <span className={`text-[10px] ${themeStyles.textSecondary} self-end`}>
                    {profileDisplayName.length}/50
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-text-secondary' : 'text-neutral-950'} uppercase tracking-wider`}>
                    Nom d'utilisateur <span className="text-accent-corail">*</span>
                  </label>
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-text-secondary' : 'text-neutral-500'} font-semibold text-sm`}>
                      @
                    </span>
                    <input
                      type="text"
                      value={profileUsername}
                      onChange={(e) => setProfileUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      maxLength={30}
                      placeholder="ama_coaching"
                      className={`w-full pl-8 pr-10 py-3 rounded-[12px] border ${isDarkMode ? 'border-border-custom bg-bg-primary/50 text-text-primary placeholder:text-text-secondary/60' : 'border-neutral-300 bg-white text-black font-semibold placeholder:text-neutral-400'} text-sm focus:border-accent-corail focus:outline-none transition-all duration-200`}
                      required
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                      {checkingProfileUsername && <Loader2 className="animate-spin text-accent-corail h-4 w-4" />}
                      {!checkingProfileUsername && profileUsernameAvailable === true && <CheckCircle2 className="text-green-400 h-4 w-4" />}
                      {!checkingProfileUsername && profileUsernameAvailable === false && profileUsername.length >= 3 && <AlertCircle className="text-red-400 h-4 w-4" />}
                    </div>
                  </div>
                  
                  {profileUsernameAvailable === false && profileUsername.length >= 3 && (
                    <span className="text-[10px] text-red-400">
                      Ce nom d'utilisateur est déjà pris ou contient des caractères invalides (minuscules, chiffres et tiret bas uniquement).
                    </span>
                  )}
                  {profileUsernameAvailable === true && profileUsername.toLowerCase() !== profile?.username && (
                    <span className="text-[10px] text-green-400 flex items-center gap-1">
                      <Check size={10} /> Nom d'utilisateur disponible !
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-text-secondary' : 'text-neutral-950'} uppercase tracking-wider`}>
                    Biographie
                  </label>
                  <textarea
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    maxLength={160}
                    placeholder="Parlez brièvement de vos contenus (ex: Coach business, conseils TikTok quotidiens...)"
                    rows={3}
                    className={`w-full px-4 py-3 rounded-[12px] border ${isDarkMode ? 'border-border-custom bg-bg-primary/50 text-text-primary placeholder:text-text-secondary/60' : 'border-neutral-300 bg-white text-black font-semibold placeholder:text-neutral-400'} text-sm focus:border-accent-corail focus:outline-none resize-none transition-all duration-200`}
                  />
                  <span className={`text-[10px] ${themeStyles.textSecondary} self-end`}>
                    {profileBio.length}/160
                  </span>
                </div>
              </div>

              {/* Section 2: Réseaux Sociaux */}
              <div className={`${themeStyles.surface} border ${themeStyles.border} p-6 rounded-[24px] shadow-sm flex flex-col gap-5`}>
                <div className="flex items-center gap-2 pb-1.5 border-b border-border-custom/30">
                  <Sparkles size={16} className="text-accent-corail" />
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${themeStyles.textPrimary}`}>
                    Réseaux sociaux (Optionnel)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-xs font-bold ${isDarkMode ? 'text-text-secondary' : 'text-neutral-950'} uppercase tracking-wider`}>
                      Pseudo TikTok
                    </label>
                    <input
                      type="text"
                      value={profileTiktok}
                      onChange={(e) => setProfileTiktok(e.target.value)}
                      placeholder="@mon_compte"
                      className={`w-full px-4 py-3 rounded-[12px] border ${isDarkMode ? 'border-border-custom bg-bg-primary/50 text-text-primary placeholder:text-text-secondary/60' : 'border-neutral-300 bg-white text-black font-semibold placeholder:text-neutral-400'} text-sm focus:border-accent-corail focus:outline-none transition-all duration-200`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={`text-xs font-bold ${isDarkMode ? 'text-text-secondary' : 'text-neutral-950'} uppercase tracking-wider`}>
                      Pseudo Instagram
                    </label>
                    <input
                      type="text"
                      value={profileInstagram}
                      onChange={(e) => setProfileInstagram(e.target.value)}
                      placeholder="@mon_compte"
                      className={`w-full px-4 py-3 rounded-[12px] border ${isDarkMode ? 'border-border-custom bg-bg-primary/50 text-text-primary placeholder:text-text-secondary/60' : 'border-neutral-300 bg-white text-black font-semibold placeholder:text-neutral-400'} text-sm focus:border-accent-corail focus:outline-none transition-all duration-200`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={`text-xs font-bold ${isDarkMode ? 'text-text-secondary' : 'text-neutral-950'} uppercase tracking-wider`}>
                      Pseudo Snapchat
                    </label>
                    <input
                      type="text"
                      value={profileSnapchat}
                      onChange={(e) => setProfileSnapchat(e.target.value)}
                      placeholder="mon_pseudo"
                      className={`w-full px-4 py-3 rounded-[12px] border ${isDarkMode ? 'border-border-custom bg-bg-primary/50 text-text-primary placeholder:text-text-secondary/60' : 'border-neutral-300 bg-white text-black font-semibold placeholder:text-neutral-400'} text-sm focus:border-accent-corail focus:outline-none transition-all duration-200`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={`text-xs font-bold ${isDarkMode ? 'text-text-secondary' : 'text-neutral-950'} uppercase tracking-wider`}>
                      Numéro WhatsApp
                    </label>
                    <input
                      type="text"
                      value={profileWhatsapp}
                      onChange={(e) => setProfileWhatsapp(e.target.value)}
                      placeholder="ex: +22890000001"
                      className={`w-full px-4 py-3 rounded-[12px] border ${isDarkMode ? 'border-border-custom bg-bg-primary/50 text-text-primary placeholder:text-text-secondary/60' : 'border-neutral-300 bg-white text-black font-semibold placeholder:text-neutral-400'} text-sm focus:border-accent-corail focus:outline-none transition-all duration-200`}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Méthode de Paiement */}
              <div className={`${themeStyles.surface} border ${themeStyles.border} p-6 rounded-[24px] shadow-sm flex flex-col gap-5`}>
                <div className="flex items-center gap-2 pb-1.5 border-b border-border-custom/30">
                  <CreditCard size={16} className="text-accent-corail" />
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${themeStyles.textPrimary}`}>
                    Paiement Mobile Money
                  </h3>
                </div>

                <div className="flex flex-col gap-2">
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-text-secondary' : 'text-neutral-950'} uppercase tracking-wider`}>
                    Opérateur Mobile Money <span className="text-accent-corail">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(['wave', 'orange', 'mtn', 'moov'] as const).map((prov) => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => setProfilePayoutProvider(prov)}
                        className={`p-3 rounded-[12px] border text-left flex flex-col justify-between h-20 transition-all duration-200 cursor-pointer ${
                          profilePayoutProvider === prov
                            ? 'border-accent-corail bg-accent-corail/5 text-accent-corail shadow-sm font-bold'
                            : `${isDarkMode ? 'border-border-custom bg-bg-primary/20 text-text-secondary' : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-400'}`
                        }`}
                      >
                        <span className="text-xs font-bold capitalize">{prov}</span>
                        <span className="text-[10px] opacity-80 leading-normal">
                          {prov === 'wave' && 'Afrique Ouest'}
                          {prov === 'orange' && 'Orange Money'}
                          {prov === 'mtn' && 'MTN MoMo'}
                          {prov === 'moov' && 'Moov Money'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-text-secondary' : 'text-neutral-950'} uppercase tracking-wider`}>
                    Numéro de téléphone de paiement Mobile Money <span className="text-accent-corail">*</span>
                  </label>
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-text-secondary' : 'text-neutral-500'}`}>
                      <Phone size={14} />
                    </span>
                    <input
                      type="tel"
                      value={profilePayoutPhone}
                      onChange={(e) => setProfilePayoutPhone(e.target.value.replace(/[^0-9+ ]/g, ''))}
                      placeholder="ex: +228 90 00 00 01"
                      className={`w-full pl-11 pr-4 py-3 rounded-[12px] border ${isDarkMode ? 'border-border-custom bg-bg-primary/50 text-text-primary placeholder:text-text-secondary/60' : 'border-neutral-300 bg-white text-black font-semibold placeholder:text-neutral-400'} text-sm focus:border-accent-corail focus:outline-none transition-all duration-200`}
                      required
                    />
                  </div>
                  <p className={`text-[10px] ${themeStyles.textSecondary} leading-relaxed`}>
                    C'est sur ce numéro que vous recevrez vos retraits de gains Mobile Money.
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile || (profileUsernameAvailable === false && profileUsername.toLowerCase() !== profile?.username)}
                  className="px-8 py-3.5 rounded-[12px] bg-accent-corail hover:bg-accent-corail-hover text-white text-sm font-semibold transition-all duration-200 shadow-md shadow-accent-corail/10 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Enregistrer les modifications</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* SECTION ABONNEMENT CREATEUR (Étape 9) */}
        {activeTab === 'subscription' && (
          <div className="max-w-2xl mx-auto flex flex-col gap-8 pb-10">
            <div className="flex flex-col gap-1.5">
              <h2 className={`font-display text-2xl font-medium ${themeStyles.textPrimary}`}>
                Abonnement Créateur
              </h2>
              <p className={`text-xs ${themeStyles.textSecondary} leading-relaxed`}>
                Gérez votre abonnement MomoLink Pro pour continuer à publier du contenu et demander des retraits.
              </p>
            </div>

            {isSubLoading ? (
              <div className="py-20 text-center flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-4 border-accent-corail border-t-transparent animate-spin" />
                <span className={`text-xs ${themeStyles.textSecondary}`}>Chargement de vos données d'abonnement...</span>
              </div>
            ) : (
              <>
                {/* 1. Statut Actuel */}
                <div className={`${themeStyles.surface} border ${themeStyles.border} p-6 rounded-[24px] shadow-sm flex flex-col gap-6`}>
                  <div className={`flex justify-between items-center pb-4 border-b border-dashed ${isDarkMode ? 'border-neutral-800' : 'border-gray-200'}`}>
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Statut de votre compte</span>
                    
                    {/* CASE A — Active */}
                    {getSubCase() === 'A' && (
                      <div className="flex items-center gap-2">
                        {Math.max(0, Math.ceil((new Date(activeSub.end_date || activeSub.endDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000))) <= 5 && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                            Renouvellement conseillé
                          </span>
                        )}
                        <span className={`px-2.5 py-1 rounded-full border ${themeStyles.border} text-[10px] font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5 ${isDarkMode ? 'bg-neutral-900/50' : 'bg-gray-50'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Abonnement actif
                        </span>
                      </div>
                    )}

                    {/* CASE B — Grace Period */}
                    {getSubCase() === 'B' && (
                      <span className={`px-2.5 py-1 rounded-full border ${themeStyles.border} text-[10px] font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5 ${isDarkMode ? 'bg-neutral-900/50' : 'bg-gray-50'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Période de grâce
                      </span>
                    )}

                    {/* CASE C/D — Inactive */}
                    {(getSubCase() === 'C' || getSubCase() === 'D') && (
                      <span className={`px-2.5 py-1 rounded-full border ${themeStyles.border} text-[10px] font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5 ${isDarkMode ? 'bg-neutral-900/50' : 'bg-gray-50'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                        {getSubCase() === 'D' ? "Non abonné" : "Désactivé"}
                      </span>
                    )}
                  </div>

                  {/* Main status layout based on case */}
                  {getSubCase() === 'A' && (() => {
                    const endDate = new Date(activeSub.end_date || activeSub.endDate);
                    const startDate = new Date(activeSub.start_date || activeSub.startDate);
                    const totalDuration = endDate.getTime() - startDate.getTime();
                    const elapsed = Date.now() - startDate.getTime();
                    const progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
                    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));

                    return (
                      <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-3xl md:text-4xl font-extrabold font-mono text-accent-corail">
                            {daysRemaining} {daysRemaining > 1 ? 'jours restants' : 'jour restant'}
                          </span>
                          <span className={`text-xs ${themeStyles.textSecondary}`}>
                            Expire le {endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex flex-col gap-2">
                          <div className={`w-full h-3 rounded-full ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-100'} overflow-hidden`}>
                            <div 
                              className="h-full bg-accent-corail transition-all duration-300" 
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] font-bold font-mono text-neutral-400">
                            <span>Début : {startDate.toLocaleDateString('fr-FR')}</span>
                            <span>{Math.round(progressPercent)}% écoulé</span>
                          </div>
                        </div>

                        {/* Renewal notice if days remaining is <= 5 */}
                        {daysRemaining <= 5 && (
                          <div className={`p-4 rounded-[16px] border ${themeStyles.border} ${isDarkMode ? 'bg-neutral-900/30' : 'bg-gray-50/50'} text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3`}>
                            <div className="flex gap-2.5">
                              <span className="text-amber-500 mt-0.5 font-bold">⚠️</span>
                              <div className="flex flex-col gap-0.5">
                                <p className={`font-semibold ${themeStyles.textPrimary}`}>Votre abonnement expire bientôt</p>
                                <p className="text-neutral-400">Évitez toute interruption en renouvelant maintenant.</p>
                              </div>
                            </div>
                            <button
                              disabled={isSubscribingProcess}
                              onClick={handleSubscribe}
                              className="px-4 py-2 rounded-xl bg-accent-corail hover:bg-accent-corail-hover text-white font-bold text-xs shrink-0 cursor-pointer transition-colors"
                            >
                              {isSubscribingProcess ? 'Chargement...' : 'Renouveler'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {getSubCase() === 'B' && (() => {
                    const endDate = new Date(activeSub.end_date || activeSub.endDate);
                    const daysExpired = Math.max(1, Math.ceil((Date.now() - endDate.getTime()) / (24 * 60 * 60 * 1000)));
                    const graceLimit = endDate.getTime() + 3 * 24 * 60 * 60 * 1000;
                    const graceDaysRemaining = Math.max(0, Math.ceil((graceLimit - Date.now()) / (24 * 60 * 60 * 1000)));

                    return (
                      <div className="flex flex-col gap-6">
                        <div className={`p-4.5 rounded-[20px] border ${themeStyles.border} ${isDarkMode ? 'bg-neutral-900/30' : 'bg-gray-50/50'} text-xs flex flex-col gap-3`}>
                          <div className="flex items-center gap-2.5 text-amber-500 font-semibold text-sm">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span>Période de grâce active ({graceDaysRemaining} jours restants)</span>
                          </div>
                          <p className="leading-relaxed text-neutral-400">
                            Votre abonnement MomoLink Pro a expiré il y a {daysExpired} {daysExpired > 1 ? 'jours' : 'jour'}. 
                            Pour continuer à publier du contenu et demander des retraits, veuillez renouveler votre abonnement sous {graceDaysRemaining} {graceDaysRemaining > 1 ? 'jours' : 'jour'}.
                          </p>
                        </div>

                        <button
                          disabled={isSubscribingProcess}
                          onClick={handleSubscribe}
                          className="w-full py-3.5 rounded-xl bg-accent-corail hover:bg-accent-corail-hover text-white font-extrabold text-sm shadow-md cursor-pointer transition-transform duration-100 active:scale-98 flex justify-center items-center gap-2"
                        >
                          {isSubscribingProcess ? (
                            <Loader2 className="animate-spin h-5 w-5" />
                          ) : (
                            'Renouveler maintenant — 5 000 FCFA/mois'
                          )}
                        </button>
                      </div>
                    );
                  })()}

                  {(getSubCase() === 'C' || getSubCase() === 'D') && (
                    <div className="flex flex-col gap-6">
                      <div className={`p-5 rounded-[20px] border ${themeStyles.border} ${isDarkMode ? 'bg-neutral-900/20' : 'bg-gray-50/50'} text-xs flex flex-col gap-3`}>
                        <div className="flex items-center gap-2.5 text-neutral-300 font-bold text-sm">
                          <span className="w-2 h-2 rounded-full bg-neutral-600" />
                          <span>{getSubCase() === 'D' ? "Formule MomoLink Pro requise" : "Votre abonnement MomoLink Pro est expiré"}</span>
                        </div>
                        <p className="leading-relaxed text-neutral-400">
                          {getSubCase() === 'D' 
                            ? "Rejoignez MomoLink Pro pour débloquer la publication de vos contenus exclusifs et activer les retraits Mobile Money." 
                            : "Votre abonnement est arrivé à échéance. Renouvelez-le dès aujourd'hui pour réactiver instantanément vos avantages."
                          }
                        </p>
                        {getSubCase() === 'C' && autoDraftedCount > 0 && (
                          <div className="mt-1 p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-red-400/90 font-medium">
                            ⚠️ {autoDraftedCount} contenu{autoDraftedCount > 1 ? 's ont' : ' a'} été temporairement archivé{autoDraftedCount > 1 ? 's' : ''} automatiquement. Ils seront immédiatement remis en ligne après votre réabonnement.
                          </div>
                        )}
                      </div>

                      {/* Restrictions list */}
                      <div className="flex flex-col gap-3">
                        <h4 className={`text-xs font-bold ${themeStyles.textPrimary} uppercase tracking-wider`}>Avantages & Statut :</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                          <div className="flex items-start gap-2.5 text-neutral-400">
                            <X className="text-neutral-500 mt-0.5 shrink-0" size={14} />
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-neutral-300">Publication de contenu</span>
                              <span className="text-[11px] text-neutral-500">Mise en ligne de nouveaux fichiers bloquée</span>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2.5 text-neutral-400">
                            <X className="text-neutral-500 mt-0.5 shrink-0" size={14} />
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-neutral-300">Versements & Retraits</span>
                              <span className="text-[11px] text-neutral-500">Demandes de retraits temporairement suspendues</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 text-neutral-400">
                            <X className="text-neutral-500 mt-0.5 shrink-0" size={14} />
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-neutral-300">Contenus en ligne</span>
                              <span className="text-[11px] text-neutral-500">Archivage automatique (après délai de grâce)</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 text-neutral-400">
                            <Check className="text-emerald-500 mt-0.5 shrink-0" size={14} />
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-neutral-300">Page de Profil Public</span>
                              <span className="text-[11px] text-emerald-500/80">Reste accessible et visible par vos fans</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        disabled={isSubscribingProcess}
                        onClick={handleSubscribe}
                        className="w-full py-3.5 rounded-xl bg-accent-corail hover:bg-accent-corail-hover text-white font-extrabold text-sm shadow-md cursor-pointer transition-transform duration-100 active:scale-98 flex justify-center items-center gap-2"
                      >
                        {isSubscribingProcess ? (
                          <Loader2 className="animate-spin h-5 w-5" />
                        ) : (
                          "S'abonner — 5 000 FCFA/mois"
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Historique des transactions */}
                <div className="flex flex-col gap-4">
                  <h3 className={`font-display text-lg font-bold ${themeStyles.textPrimary}`}>
                    Historique des abonnements
                  </h3>

                  {subscriptionsList.length === 0 ? (
                    <div className={`p-8 text-center rounded-[24px] border ${themeStyles.border} ${themeStyles.surface}`}>
                      <p className={`text-xs ${themeStyles.textSecondary}`}>Aucun historique d'abonnement pour le moment.</p>
                    </div>
                  ) : (
                    <div className={`border ${themeStyles.border} rounded-[24px] overflow-hidden ${themeStyles.surface} shadow-sm`}>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className={`border-b ${themeStyles.border} ${isDarkMode ? 'bg-[#14120F]' : 'bg-gray-50'} text-neutral-400 font-bold uppercase tracking-wider text-[10px]`}>
                              <th className="p-4">Date de début</th>
                              <th className="p-4">Date de fin</th>
                              <th className="p-4">Montant</th>
                              <th className="p-4">Statut</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-800">
                            {subscriptionsList.map((sub, idx) => (
                              <tr key={sub.id || idx} className={`${isDarkMode ? 'hover:bg-neutral-900/30' : 'hover:bg-gray-50/50'} transition-colors font-mono`}>
                                <td className="p-4 text-neutral-300">
                                  {new Date(sub.start_date || sub.startDate).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="p-4 text-neutral-300">
                                  {new Date(sub.end_date || sub.endDate).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="p-4 font-bold text-accent-corail">
                                  {(sub.amount_paid || sub.amountPaid).toLocaleString()} FCFA
                                </td>
                                <td className="p-4">
                                  {sub.status === 'active' ? (
                                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] font-bold uppercase">
                                      Actif
                                    </span>
                                  ) : sub.status === 'expired' ? (
                                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/25 text-[10px] font-bold uppercase">
                                      Expiré
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700 text-[10px] font-bold uppercase">
                                      {sub.status}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

      </main>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getSupabaseClient } from '../lib/supabase';
import { Skeleton, StatCardSkeleton } from '../components/Skeleton';
import GuidedTour from '../components/dashboard/GuidedTour';
import ConfettiBurst from '../components/ConfettiBurst';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { Content, Donation, ProfileMessage } from '../types';
import { 
  Home, 
  Grid, 
  Wallet, 
  User, 
  LogOut,
  Bell, 
  Plus, 
  ChevronsUpDown,
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
  Pencil,
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
  ChevronRight,
  Menu,
  Search,
  Filter,
  Crown,
  PanelLeftClose,
  PanelLeftOpen,
  Mail,
  Heart,
  Briefcase,
  ArrowUpDown,
  Eye,
  EyeOff
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
  const { user, profile, allProfiles, loading: authLoading, signOut, isDemoMode, switchProfile, createAdditionalProfile } = useAuth();
  const { isDarkMode, setIsDarkMode, styles: themeStyles } = useTheme();

  // Determine active view based on current route
  const getActiveTab = (): 'content' | 'withdrawals' | 'profile' | 'subscription' | 'home' | 'sales' | 'messages' | 'donations' => {
    const path = location.pathname;
    if (path.includes('/content')) return 'content';
    if (path.includes('/withdrawals')) return 'withdrawals';
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/subscription')) return 'subscription';
    if (path.includes('/sales')) return 'sales';
    if (path.includes('/donations')) return 'donations';
    if (path.includes('/messages')) return 'messages';
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

  // Multi-boutique switcher states
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreSlug, setNewStoreSlug] = useState('');
  const [createStoreError, setCreateStoreError] = useState<string | null>(null);
  const [isCreatingStore, setIsCreatingStore] = useState(false);

  // Statistics State
  const [stats, setStats] = useState({
    monthlyEarnings: 0,
    monthlySalesCount: 0,
    totalEarnings: 0,
    publishedContentsCount: 0
  });

  const [salesSearch, setSalesSearch] = useState('');
  const [salesStatus, setSalesStatus] = useState('all');
  const [salesProductFilter, setSalesProductFilter] = useState('all');
  const [salesSortOrder, setSalesSortOrder] = useState<'recent' | 'oldest'>('recent');
  const [salesPage, setSalesPage] = useState(1);
  const SALES_PAGE_SIZE = 10;

  // Lets a creator blank out buyer phone / payment method / reference before sharing their
  // screen or recording a demo. Remembered across sessions so it doesn't have to be re-armed.
  const [hideSensitiveSales, setHideSensitiveSales] = useState<boolean>(
    () => localStorage.getItem('momo_hide_sensitive_sales') === '1'
  );

  useEffect(() => {
    localStorage.setItem('momo_hide_sensitive_sales', hideSensitiveSales ? '1' : '0');
  }, [hideSensitiveSales]);

  // Jump back to page 1 whenever a filter/sort changes, so the pagination never
  // lands the creator on an empty page from a previous, wider result set.
  useEffect(() => {
    setSalesPage(1);
  }, [salesSearch, salesStatus, salesProductFilter, salesSortOrder]);

  // Overview period filter - shared by the 4 stat cards AND the revenue chart, so the numbers
  // creators see never disagree with each other.
  const [overviewRange, setOverviewRange] = useState<'7d' | '30d' | '90d' | '365d' | 'custom'>('30d');
  const [overviewCustomStart, setOverviewCustomStart] = useState('');
  const [overviewCustomEnd, setOverviewCustomEnd] = useState('');

  const overviewRangeLabels: Record<typeof overviewRange, string> = {
    '7d': '7 jours',
    '30d': '30 jours',
    '90d': '90 jours',
    '365d': '12 mois',
    'custom': 'Personnalisé'
  };

  // Resolves the selected preset (or custom dates) into concrete start/end Date bounds
  const getOverviewRangeBounds = (): { startDate: Date; endDate: Date } => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    let startDate: Date;
    let endDate = now;

    if (overviewRange === 'custom' && overviewCustomStart && overviewCustomEnd) {
      startDate = new Date(overviewCustomStart);
      endDate = new Date(overviewCustomEnd);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const daysBack = overviewRange === '7d' ? 6 : overviewRange === '30d' ? 29 : overviewRange === '90d' ? 89 : 364;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - daysBack);
      startDate.setHours(0, 0, 0, 0);
    }

    if (startDate > endDate) [startDate, endDate] = [endDate, startDate];
    return { startDate, endDate };
  };

  // Sums sales revenue, donations, sales count and newly-published content within a date window —
  // used both for the stat cards (current period) and for computing the previous-period trend.
  const getPeriodTotals = (startDate: Date, endDate: Date) => {
    let salesRevenue = 0;
    let salesCount = 0;
    let donationsAmount = 0;
    let newContentCount = 0;

    purchasesList.forEach((p) => {
      const dateRaw = p.created_at || p.createdAt;
      if (!dateRaw) return;
      const pDate = new Date(dateRaw);
      if (pDate < startDate || pDate > endDate) return;
      salesRevenue += p.creator_net_amount_fcfa || p.creator_net_amount || 0;
      salesCount += 1;
    });

    donationsList.forEach((d) => {
      const dDate = new Date(d.created_at);
      if (dDate < startDate || dDate > endDate) return;
      donationsAmount += d.amount_fcfa || 0;
    });

    contentsList.forEach((c) => {
      const cDate = new Date(c.created_at);
      if (cDate < startDate || cDate > endDate || c.status !== 'published') return;
      newContentCount += 1;
    });

    return { salesRevenue, salesCount, donationsAmount, newContentCount };
  };

  // Percent change vs. the immediately preceding period of equal length.
  // Returns isNew=true when there's no previous data to compare against (avoids a meaningless "+Infinity%").
  const calcTrend = (current: number, previous: number): { pct: number; isNew: boolean } => {
    if (previous > 0) return { pct: Math.round(((current - previous) / previous) * 100), isNew: false };
    if (current > 0) return { pct: 0, isNew: true };
    return { pct: 0, isNew: false };
  };

  // Builds revenue chart buckets over the selected period, auto-adapting granularity
  // (jour / semaine / mois) to keep the chart readable regardless of the range length.
  const getChartData = () => {
    const { startDate, endDate } = getOverviewRangeBounds();

    const totalDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1);
    const granularity: 'day' | 'week' | 'month' = totalDays <= 31 ? 'day' : totalDays <= 180 ? 'week' : 'month';

    const buckets: { date: string; bucketStart: Date; revenu: number; ventes: number }[] = [];

    if (granularity === 'month') {
      const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      while (cursor <= endDate) {
        buckets.push({
          date: cursor.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
          bucketStart: new Date(cursor),
          revenu: 0,
          ventes: 0
        });
        cursor.setMonth(cursor.getMonth() + 1);
      }
    } else {
      const step = granularity === 'week' ? 7 : 1;
      const cursor = new Date(startDate);
      while (cursor <= endDate) {
        buckets.push({
          date: granularity === 'week'
            ? `Sem. du ${cursor.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
            : cursor.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          bucketStart: new Date(cursor),
          revenu: 0,
          ventes: 0
        });
        cursor.setDate(cursor.getDate() + step);
      }
    }

    const findBucketIndex = (d: Date) => {
      for (let idx = buckets.length - 1; idx >= 0; idx--) {
        if (d >= buckets[idx].bucketStart) return idx;
      }
      return -1;
    };

    purchasesList.forEach(p => {
      const dateRaw = p.created_at || p.createdAt;
      if (!dateRaw) return;
      const pDate = new Date(dateRaw);
      if (pDate < startDate || pDate > endDate) return;
      const idx = findBucketIndex(pDate);
      if (idx >= 0) {
        buckets[idx].revenu += p.creator_net_amount_fcfa || p.amount_paid_fcfa || 0;
        buckets[idx].ventes += 1;
      }
    });

    donationsList.forEach(d => {
      const dDate = new Date(d.created_at);
      if (dDate < startDate || dDate > endDate) return;
      const idx = findBucketIndex(dDate);
      if (idx >= 0) {
        buckets[idx].revenu += d.creator_net_amount_fcfa || 0;
      }
    });

    return buckets;
  };

  const handleCreateStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateStoreError(null);
    setIsCreatingStore(true);

    try {
      if (!newStoreName.trim()) {
        throw new Error("Le nom de la boutique est obligatoire.");
      }
      if (!newStoreSlug.trim()) {
        throw new Error("L'identifiant unique (URL) est obligatoire.");
      }
      if (newStoreSlug.length < 3) {
        throw new Error("L'identifiant doit comporter au moins 3 caractères.");
      }

      // Quota check
      const currentQuota = Math.max(...allProfiles.map(p => p.store_quota || 2), 2);
      if (allProfiles.length >= currentQuota) {
        throw new Error(`Vous avez atteint votre quota maximum de boutiques (${currentQuota}). Contactez l'administrateur pour l'augmenter.`);
      }

      // Check unique
      const isUnique = await checkUsernameUnique(newStoreSlug.trim());
      if (!isUnique) {
        throw new Error("Cet identifiant est déjà utilisé par un autre créateur.");
      }

      // Create profile
      const res = await createAdditionalProfile({
        user_id: user?.id || "",
        username: newStoreSlug.trim().toLowerCase(),
        display_name: newStoreName.trim(),
        bio: "",
        payout_phone_number: profile?.payout_phone_number || "",
        payout_provider: profile?.payout_provider || null
      });

      if (res.success) {
        setIsCreateModalOpen(false);
        setIsSwitchModalOpen(false);
        setNewStoreName('');
        setNewStoreSlug('');
      } else {
        throw new Error(res.error || "Une erreur s'est produite.");
      }
    } catch (err: any) {
      setCreateStoreError(err.message || "Erreur de création.");
    } finally {
      setIsCreatingStore(false);
    }
  };

  // ==========================================
  // STEP 5: STATE & HANDLERS FOR CONTENT TAB
  // ==========================================
  const [contentsList, setContentsList] = useState<Content[]>([]);
  const [isLoadingContents, setIsLoadingContents] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  // Non-null while editing an existing content instead of creating a new one — same inline
  // form is reused for both, branching in handleCreateContent/handleSaveContentEdit.
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [showPublishConfetti, setShowPublishConfetti] = useState(false);

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Mobile header : le header desktop etale switcher / visite / copie / recherche sur une seule
  // ligne, ce qui ne rentre pas sur un ecran de telephone. En mobile on garde la marque a gauche
  // et on regroupe toutes ces actions derriere un menu "Ma boutique" + une icone de recherche.
  const [isShopMenuOpen, setIsShopMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const shopMenuRef = useRef<HTMLDivElement>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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
  const [isLoadingWithdrawals, setIsLoadingWithdrawals] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState<string | null>(null);

  // Withdrawal confirmation modal state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);

  // Donations & Messages/Partnerships inbox state
  const [donationsList, setDonationsList] = useState<Donation[]>([]);
  const [messagesList, setMessagesList] = useState<ProfileMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const unreadMessagesCount = messagesList.filter((m: ProfileMessage) => !m.is_read).length;

  // Reverse-chronological feed of messages + partnership proposals (donations have their own tab)
  const inboxFeed: ProfileMessage[] = [...messagesList].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Reverse-chronological list of donations received
  const sortedDonations: Donation[] = [...donationsList].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Donations have no is_read column (unlike messages) — track "seen" client-side via a per-creator timestamp checkpoint
  const [donationsLastSeenAt, setDonationsLastSeenAt] = useState<number>(() => {
    if (!profile) return 0;
    const stored = localStorage.getItem(`momo_donations_last_seen_${profile.id}`);
    return stored ? Number(stored) : 0;
  });
  const newDonationsCount = donationsList.filter(
    (d) => new Date(d.created_at).getTime() > donationsLastSeenAt
  ).length;

  useEffect(() => {
    if (activeTab === 'donations' && profile) {
      const now = Date.now();
      localStorage.setItem(`momo_donations_last_seen_${profile.id}`, String(now));
      setDonationsLastSeenAt(now);
    }
  }, [activeTab, profile]);

  // Timeago helper. Clamped at 0 so a timestamp that's slightly in the future (clock skew
  // between client/server, or between the DB and whatever generated the record) reads as
  // "à l'instant" instead of permanently stuck there — a negative diff otherwise satisfies
  // `diffMins < 1` forever, no matter how far ahead the date is.
  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Math.max(0, Date.now() - new Date(dateStr).getTime());
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

  // Sale status pill (green "Payé" for the common case). Tinted rather than solid so it
  // stays readable in both themes.
  const getSaleStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return { label: 'En attente', icon: Clock, className: 'bg-amber-500/15 text-amber-600 border-amber-500/30' };
      case 'failed':
        return { label: 'Échoué', icon: X, className: 'bg-red-500/15 text-red-500 border-red-500/30' };
      default:
        return {
          label: 'Payé',
          icon: Check,
          className: `bg-emerald-500/15 border-emerald-500/30 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`
        };
    }
  };

  // Best-effort payment method for a sale, inferred from its payment_reference.
  // Real Maketou transactions only give us a bare cartId (no operator info in their
  // cart-status response), so those fall back to a generic "Mobile Money" badge —
  // only references generated by the admin's fake-sale tool (e.g. "WAVE-482913-MOMO")
  // actually encode a specific operator.
  const getSalePaymentMethod = (paymentReference?: string): { label: string; logo: string | null } => {
    const ref = (paymentReference || '').toUpperCase();
    if (ref.startsWith('WAVE')) return { label: 'Wave', logo: '/payment-icons/wave.png' };
    if (ref.startsWith('OM-') || ref.startsWith('ORANGE')) return { label: 'Orange Money', logo: '/payment-icons/orange-money.png' };
    if (ref.startsWith('MTN')) return { label: 'MTN MoMo', logo: '/payment-icons/mtn-money.jpg' };
    if (ref.startsWith('MOOV')) return { label: 'Moov Money', logo: '/payment-icons/moov-money.png' };
    return { label: 'Mobile Money', logo: null };
  };

  // Provider logo helper
  const getPayoutProviderLogo = (provider: string) => {
    const provLower = provider?.toLowerCase() || '';
    switch (provLower) {
      case 'mtn':
        return '/payment-icons/mtn-money.jpg';
      case 'orange':
        return '/payment-icons/orange-money.png';
      case 'moov':
        return '/payment-icons/moov-money.png';
      case 'mixbyyass':
      case 'mix by yass':
        return '/payment-icons/mixx-by-yas.jpg';
      case 'wave':
        return '/payment-icons/wave.png';
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
            .select('id, title, thumbnail_url, preview_url')
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
              contents: matchedContent
                ? {
                    creator_id: profile.id,
                    title: matchedContent.title,
                    thumbnail_url: matchedContent.thumbnail_url,
                    preview_url: matchedContent.preview_url
                  }
                : undefined
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

  // Fetch donations received and messages/partnership proposals sent to this creator's public profile
  const fetchMessagesAndDonations = async () => {
    if (!profile) return;
    setIsLoadingMessages(true);
    try {
      if (!isDemoMode) {
        const supabaseClient = getSupabaseClient();
        if (supabaseClient) {
          const { data: donationsData, error: donationsErr } = await supabaseClient
            .from('donations')
            .select('*')
            .eq('creator_id', profile.id)
            .eq('status', 'completed')
            .order('created_at', { ascending: false });

          if (!donationsErr) setDonationsList(donationsData || []);

          const { data: messagesData, error: messagesErr } = await supabaseClient
            .from('profile_messages')
            .select('*')
            .eq('creator_id', profile.id)
            .order('created_at', { ascending: false });

          if (!messagesErr) setMessagesList(messagesData || []);
        }
      } else {
        const localMessages = localStorage.getItem('momo_local_messages');
        setMessagesList(localMessages ? JSON.parse(localMessages).filter((m: ProfileMessage) => m.creator_id === profile.id) : []);
        setDonationsList([]);
      }
    } catch (err: any) {
      console.error('Error fetching messages or donations:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleMarkMessageRead = async (message: ProfileMessage) => {
    if (message.is_read) return;
    setMessagesList(prev => prev.map(m => m.id === message.id ? { ...m, is_read: true } : m));

    if (!isDemoMode) {
      const supabaseClient = getSupabaseClient();
      if (supabaseClient) {
        await supabaseClient.from('profile_messages').update({ is_read: true }).eq('id', message.id);
      }
    } else {
      const localMessages = JSON.parse(localStorage.getItem('momo_local_messages') || '[]');
      const updated = localMessages.map((m: ProfileMessage) => m.id === message.id ? { ...m, is_read: true } : m);
      localStorage.setItem('momo_local_messages', JSON.stringify(updated));
    }
  };

  // Real-time balance calculations
  const totalCreatorEarnings = purchasesList.reduce((sum, p) => {
    return sum + (p.creator_net_amount_fcfa || p.creator_net_amount || 0);
  }, 0) + donationsList.reduce((sum, d) => sum + (d.creator_net_amount_fcfa || 0), 0);

  const totalWithdrawnAndPending = withdrawalsList
    .filter(w => ['pending', 'approved', 'paid'].includes(w.status))
    .reduce((sum, w) => sum + (w.amount_requested || 0), 0);

  const availableBalance = Math.max(0, totalCreatorEarnings - totalWithdrawnAndPending);

  // True until both the contents and the withdrawals/purchases fetches have resolved at least once,
  // so overview numbers never flash "0" before the real database values are in.
  const isOverviewLoading = isLoadingContents || isLoadingWithdrawals;
  // "Activité récente" merges sales+withdrawals (isLoadingWithdrawals) with donations+messages
  // (isLoadingMessages) — it isn't ready until both underlying fetches have resolved.
  const isActivityLoading = isLoadingWithdrawals || isLoadingMessages;

  const { startDate: overviewStart, endDate: overviewEnd } = getOverviewRangeBounds();
  const currentPeriodTotals = getPeriodTotals(overviewStart, overviewEnd);
  const previousPeriodEnd = new Date(overviewStart.getTime() - 1);
  const previousPeriodStart = new Date(previousPeriodEnd.getTime() - (overviewEnd.getTime() - overviewStart.getTime()));
  const previousPeriodTotals = getPeriodTotals(previousPeriodStart, previousPeriodEnd);
  const revenueTrend = calcTrend(currentPeriodTotals.salesRevenue, previousPeriodTotals.salesRevenue);
  const donationsTrend = calcTrend(currentPeriodTotals.donationsAmount, previousPeriodTotals.donationsAmount);

  // Unified activity feed for the home tab: sales, donations, messages/partnerships and withdrawal
  // status changes merged into one reverse-chronological list, so creators don't have to check 4 tabs.
  type ActivityEvent = {
    id: string;
    type: 'sale' | 'donation' | 'message' | 'partnership' | 'withdrawal';
    title: string;
    subtitle: string;
    amount?: number;
    timestamp: string;
  };

  const recentActivity: ActivityEvent[] = [
    ...purchasesList.map((p): ActivityEvent => ({
      id: `sale-${p.id}`,
      type: 'sale',
      title: p.contents?.title || p.title || 'Vente de contenu',
      subtitle: p.buyer_phone || 'Acheteur',
      amount: p.amount_paid_fcfa || p.amount || 0,
      timestamp: p.created_at || p.createdAt,
    })),
    ...donationsList.map((d): ActivityEvent => ({
      id: `donation-${d.id}`,
      type: 'donation',
      title: `Don de ${d.donor_name}`,
      subtitle: d.donor_message || 'Merci pour votre soutien',
      amount: d.amount_fcfa,
      timestamp: d.created_at,
    })),
    ...messagesList.map((m): ActivityEvent => ({
      id: `message-${m.id}`,
      type: m.type,
      title: m.type === 'partnership' ? `Partenariat de ${m.sender_name}` : `Message de ${m.sender_name}`,
      subtitle: m.body,
      timestamp: m.created_at,
    })),
    ...withdrawalsList.map((w): ActivityEvent => ({
      id: `withdrawal-${w.id}`,
      type: 'withdrawal',
      title: w.status === 'paid' ? 'Retrait payé' : w.status === 'approved' ? 'Retrait approuvé' : w.status === 'rejected' ? 'Retrait rejeté' : 'Retrait demandé',
      subtitle: getPayoutProviderLabel(w.payout_provider),
      amount: w.amount_requested,
      timestamp: w.requested_at,
    })),
  ]
    .filter((e) => !!e.timestamp)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  // Submit withdrawal handler
  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawalError(null);
    setWithdrawalSuccess(null);

    if (profile?.is_test_account) {
      setWithdrawalError("Ce compte est un compte de test : les retraits sont désactivés (les données affichées ne sont pas de vrais revenus).");
      return;
    }

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
      fetchMessagesAndDonations();
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

  // Click outside listener for the mobile "Ma boutique" dropdown
  useEffect(() => {
    if (!isShopMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (shopMenuRef.current && !shopMenuRef.current.contains(e.target as Node)) {
        setIsShopMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isShopMenuOpen]);

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
    if (!priceFcfa || Number(priceFcfa) < 1000) {
      setErrorMsg("Le prix est obligatoire et doit être d'au moins 1000 FCFA.");
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

      if (status === 'published') {
        setShowPublishConfetti(true);
        setTimeout(() => setShowPublishConfetti(false), 1800);
      }

      // Reload
      await fetchContents();
    } catch (err: any) {
      console.error('Error creating content:', err);
      setErrorMsg(err.message || "Une erreur est survenue lors de l'enregistrement de votre contenu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Opens the same inline form as "Ajouter un contenu", but pre-filled and in edit mode.
  const handleStartEdit = (content: Content) => {
    setEditingContentId(content.id);
    setTitle(content.title);
    setDescription(content.description || '');
    setContentType(content.content_type);
    setPriceFcfa(content.price_fcfa);
    setFile(null);
    setPreviewFile(null);
    setErrorMsg(null);
    setSuccessMsg(null);
    setActiveMenuId(null);
    setIsFormOpen(true);
  };

  // Save edits to an existing content. Files are optional here — only the fields the
  // creator actually changed (title/description/price, and files if replaced) are sent.
  const handleSaveContentEdit = async () => {
    if (!editingContentId) return;
    if (!title.trim() || title.length > 80) {
      setErrorMsg("Le titre est obligatoire et ne doit pas dépasser 80 caractères.");
      return;
    }
    if (description && description.length > 300) {
      setErrorMsg("La description ne doit pas dépasser 300 caractères.");
      return;
    }
    if (!priceFcfa || Number(priceFcfa) < 1000) {
      setErrorMsg("Le prix est obligatoire et doit être d'au moins 1000 FCFA.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updates: Record<string, any> = {
        title: title.trim(),
        description: description.trim() || null,
        price_fcfa: Math.floor(Number(priceFcfa)),
        content_type: contentType
      };

      if (!isDemoMode && profile) {
        if (file) {
          updates.file_url = await uploadFileToSupabase(file, 'contents');
        }
        if (previewFile) {
          const previewUrl = await uploadFileToSupabase(previewFile, 'previews');
          updates.thumbnail_url = previewUrl;
          updates.preview_url = previewUrl;
        }

        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) throw new Error("Erreur de connexion à la base de données.");

        const { error } = await supabaseClient
          .from('contents')
          .update(updates)
          .eq('id', editingContentId);

        if (error) throw error;
      } else {
        if (file) {
          updates.file_url = await uploadFileMock(file);
        }
        if (previewFile) {
          const previewUrl = await uploadFileMock(previewFile);
          updates.thumbnail_url = previewUrl;
          updates.preview_url = previewUrl;
        }

        const localContentsStr = localStorage.getItem('momo_local_contents');
        const localContents = localContentsStr ? JSON.parse(localContentsStr) : [];
        const updatedList = localContents.map((c: Content) => c.id === editingContentId ? { ...c, ...updates } : c);
        localStorage.setItem('momo_local_contents', JSON.stringify(updatedList));
      }

      setSuccessMsg('Votre contenu a été mis à jour !');
      setTitle('');
      setDescription('');
      setContentType('pdf');
      setFile(null);
      setPreviewFile(null);
      setPriceFcfa('');
      setIsFormOpen(false);
      setEditingContentId(null);

      await fetchContents();
    } catch (err: any) {
      console.error('Error updating content:', err);
      setErrorMsg(err.message || "Une erreur est survenue lors de la mise à jour de votre contenu.");
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
    { id: 'home', label: 'Tableau de bord', icon: Home, path: '/dashboard', section: null as string | null },
    { id: 'messages', label: 'Messages', icon: Bell, path: '/dashboard/messages', badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined, section: null as string | null },
    { id: 'sales', label: 'Mes ventes', icon: ShoppingBag, path: '/dashboard/sales', section: 'Revenus' },
    { id: 'donations', label: 'Dons', icon: Heart, path: '/dashboard/donations', badge: newDonationsCount > 0 ? newDonationsCount : undefined, section: 'Revenus' },
    { id: 'withdrawals', label: 'Retraits', icon: Wallet, path: '/dashboard/withdrawals', section: 'Revenus' },
    { id: 'content', label: 'Mon contenu', icon: Grid, path: '/dashboard/content', section: 'Contenu' },
    { id: 'profile', label: 'Mon profil', icon: User, path: '/dashboard/profile', section: 'Compte' },
    { id: 'subscription', label: 'Abonnement', icon: Crown, path: '/dashboard/subscription', section: 'Compte' },
    ...(isAdmin ? [{ id: 'admin', label: 'Administration', icon: Shield, path: '/admin', section: null as string | null }] : []),
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

  // Distinct products that have at least one sale, for the "filter by product" dropdown.
  const salesProductOptions = Array.from(
    purchasesList.reduce((map, p) => {
      const id = p.content_id;
      if (id && !map.has(id)) {
        map.set(id, p.contents?.title || p.title || 'Guide exclusif');
      }
      return map;
    }, new Map<string, string>())
  );

  const filteredSalesList = purchasesList
    .filter(p => {
      const title = p.contents?.title || p.title || 'Guide exclusif';
      const matchesSearch =
        !salesSearch ||
        title.toLowerCase().includes(salesSearch.toLowerCase()) ||
        p.buyer_phone?.toLowerCase().includes(salesSearch.toLowerCase()) ||
        p.payment_reference?.toLowerCase().includes(salesSearch.toLowerCase());

      const matchesStatus = salesStatus === 'all' || p.status === salesStatus;
      const matchesProduct = salesProductFilter === 'all' || p.content_id === salesProductFilter;
      return matchesSearch && matchesStatus && matchesProduct;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt).getTime();
      const dateB = new Date(b.created_at || b.createdAt).getTime();
      return salesSortOrder === 'recent' ? dateB - dateA : dateA - dateB;
    });

  const totalSalesCount = filteredSalesList.length;
  const totalBrutRevenue = filteredSalesList.reduce((sum, p) => sum + (p.amount_paid_fcfa || p.amount || 0), 0);
  const totalNetRevenue = filteredSalesList.reduce((sum, p) => sum + (p.creator_net_amount_fcfa || 0), 0);
  const averageOrderValue = totalSalesCount > 0 ? Math.round(totalNetRevenue / totalSalesCount) : 0;

  const salesPageCount = Math.max(1, Math.ceil(filteredSalesList.length / SALES_PAGE_SIZE));
  const paginatedSalesList = filteredSalesList.slice(
    (salesPage - 1) * SALES_PAGE_SIZE,
    salesPage * SALES_PAGE_SIZE
  );

  return (
    <div className={`min-h-screen ${themeStyles.bg} ${themeStyles.textPrimary} flex flex-col md:flex-row font-sans transition-colors duration-200`}>
      
      {/* 1. Sidebar - Fixed Left on Desktop */}
      <aside className={`hidden md:flex flex-col ${isSidebarCollapsed ? 'w-20 p-4' : 'w-64 p-6'} ${themeStyles.surface} h-screen sticky top-0 justify-between shrink-0 transition-all duration-300 ease-in-out z-50`}>
        <div className="flex flex-col gap-8">
          {/* Logo Brand Header */}
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-2 px-2'} transition-all duration-300`}>
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <img 
                src="https://valqykbgglvvxmkqrenx.supabase.co/storage/v1/object/public/avatars/file_00000000588081f9b9f6b6484a7be967.png"
                alt="MomoLink Logo"
                className="w-8 h-8 object-contain rounded-lg shadow-sm"
              />
            </div>
            {!isSidebarCollapsed && (
              <span className={`font-display font-bold text-lg ${themeStyles.textPrimary} tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300`}>
                MomoLink {profile?.is_premium && <span className="text-accent-corail text-xs font-semibold">Pro</span>}
              </span>
            )}
          </div>



          {/* Navigation Links */}
          <nav data-tour="sidebar-nav" className="flex flex-col gap-1.5">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const showDot = item.id === 'subscription' && isSubActionRequired();
              const prevSection = idx > 0 ? navItems[idx - 1].section : null;
              const showSectionHeader = !!item.section && item.section !== prevSection;
              return (
                <React.Fragment key={item.id}>
                  {showSectionHeader && !isSidebarCollapsed && (
                    <span className={`px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest ${themeStyles.textSecondary} opacity-50`}>
                      {item.section}
                    </span>
                  )}
                  <Link
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
                      {isSidebarCollapsed && (showDot || !!item.badge) && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </div>
                    {!isSidebarCollapsed && showDot && (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                    )}
                    {!isSidebarCollapsed && !!item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full bg-accent-corail text-white text-[10px] font-bold shrink-0 min-w-[18px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </React.Fragment>
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
              <PanelLeftOpen size={16} className="shrink-0" />
            ) : (
              <>
                <PanelLeftClose size={16} className="shrink-0" />
                <span>Réduire le menu</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Right Content Section Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* Global Dashboard Top Header */}
        <header className={`flex items-center justify-between gap-2 ${themeStyles.surface} border-b ${themeStyles.border} px-4 md:px-8 py-3.5 sticky top-0 z-40 transition-colors duration-200 shadow-sm`}>
          {/* Left part: brand on mobile, store switcher on desktop */}
          <div className="flex items-center gap-3">

            {/* Mobile Brand (le switcher de boutique vit dans le menu "Ma boutique" a droite) */}
            <div className="flex md:hidden items-center gap-2 overflow-hidden">
              <img
                src="https://valqykbgglvvxmkqrenx.supabase.co/storage/v1/object/public/avatars/file_00000000588081f9b9f6b6484a7be967.png"
                alt="MomoLink Logo"
                className="w-8 h-8 object-contain rounded-lg shadow-sm shrink-0"
              />
              <span className={`font-display font-bold text-base ${themeStyles.textPrimary} tracking-tight whitespace-nowrap`}>
                MomoLink {profile?.is_premium && <span className="text-accent-corail text-[10px] font-semibold">Pro</span>}
              </span>
            </div>

            {/* Store Switcher Trigger Button (desktop) */}
            <button
              onClick={() => setIsSwitchModalOpen(true)}
              className={`hidden md:flex items-center justify-between gap-2 px-3 sm:px-4 py-2 rounded-xl border ${themeStyles.border} ${themeStyles.surface} hover:bg-neutral-800/5 dark:hover:bg-white/5 transition-all cursor-pointer text-left shadow-sm group w-[125px] sm:w-[220px]`}
            >
              <div className="flex items-center gap-2 overflow-hidden w-full justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Store size={14} className="text-accent-corail shrink-0" />
                  <span className={`font-bold ${themeStyles.textPrimary} truncate text-xs`}>
                    {displayName}
                  </span>
                </div>
                <ChevronsUpDown size={12} className="text-gray-400 group-hover:text-accent-corail transition-colors shrink-0" />
              </div>
            </button>
          </div>

          {/* Middle part: Search Bar (Desktop/Tablet optimized) */}
          <div className="hidden md:flex items-center relative w-full max-w-[200px] lg:max-w-sm mx-4">
            <Search size={14} className="absolute left-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Trouvez n'importe quoi : Appuyez sur ⌘K"
              className={`w-full pl-9 pr-12 py-2 rounded-xl text-xs border ${themeStyles.border} bg-neutral-50/50 dark:bg-neutral-900/10 focus:border-accent-corail outline-none transition-all`}
            />
            <div className={`absolute right-2 px-1.5 py-0.5 rounded border ${themeStyles.border} bg-neutral-100 dark:bg-neutral-800 text-[9px] font-mono text-neutral-400`}>
              ⌘K
            </div>
          </div>

          {/* Right Side: Actions (Visiter le profil, copy link, and profile button) */}
          <div className="flex items-center gap-2 sm:gap-2.5">

            {/* Mobile Search Icon (deplie la barre de recherche sous le header) */}
            <button
              onClick={() => setIsMobileSearchOpen((v) => !v)}
              className={`md:hidden w-9 h-9 rounded-xl border ${themeStyles.border} ${
                isMobileSearchOpen ? 'text-accent-corail border-accent-corail/40' : themeStyles.textSecondary
              } hover:text-accent-corail transition-all cursor-pointer flex items-center justify-center shrink-0`}
              title="Rechercher"
              aria-label="Rechercher"
              aria-expanded={isMobileSearchOpen}
            >
              <Search size={16} />
            </button>

            {/* Mobile "Ma boutique" dropdown : visiter / copier le lien / changer de boutique */}
            <div ref={shopMenuRef} className="md:hidden relative shrink-0">
              <button
                data-tour="mobile-shop-menu"
                onClick={() => setIsShopMenuOpen((v) => !v)}
                aria-expanded={isShopMenuOpen}
                aria-label="Ma boutique"
                title="Ma boutique"
                className={`w-9 h-9 rounded-xl border ${themeStyles.border} ${
                  isShopMenuOpen ? 'text-accent-corail border-accent-corail/40' : themeStyles.textSecondary
                } hover:text-accent-corail transition-all cursor-pointer flex items-center justify-center shrink-0`}
              >
                <ShoppingBag size={16} />
              </button>

              <AnimatePresence>
                {isShopMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-0 top-full mt-2 w-64 max-w-[80vw] rounded-2xl border ${themeStyles.border} ${themeStyles.surface} shadow-2xl p-1.5 z-50 flex flex-col gap-0.5 origin-top-right`}
                  >
                    <a
                      href={`/@${username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsShopMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${themeStyles.textPrimary} hover:bg-accent-corail hover:text-white transition-all cursor-pointer`}
                    >
                      <ArrowUpRight size={15} className="shrink-0" />
                      <span>Visiter ma boutique</span>
                    </a>

                    <button
                      onClick={() => {
                        const profileUrl = `${window.location.origin}/@${username}`;
                        navigator.clipboard.writeText(profileUrl);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${themeStyles.textPrimary} hover:bg-accent-corail hover:text-white transition-all cursor-pointer text-left`}
                    >
                      {copied ? (
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                      ) : (
                        <Copy size={15} className="shrink-0" />
                      )}
                      <span>{copied ? 'Lien copié !' : 'Copier le lien'}</span>
                    </button>

                    <div className={`h-px my-1 mx-2 ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />

                    <button
                      onClick={() => {
                        setIsShopMenuOpen(false);
                        setIsSwitchModalOpen(true);
                      }}
                      className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border ${themeStyles.border} ${
                        isDarkMode ? 'bg-neutral-900/40' : 'bg-gray-50/50'
                      } hover:bg-neutral-800/5 dark:hover:bg-white/5 transition-all cursor-pointer text-left group`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Store size={14} className="text-accent-corail shrink-0" />
                        <div className="flex flex-col overflow-hidden">
                          <span className={`text-xs font-bold ${themeStyles.textPrimary} truncate`}>
                            {displayName}
                          </span>
                          <span className={`text-[10px] ${themeStyles.textSecondary} truncate`}>
                            Changer de boutique
                          </span>
                        </div>
                      </div>
                      <ChevronsUpDown size={12} className="text-gray-400 group-hover:text-accent-corail transition-colors shrink-0" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* "Visiter le profil" Action Button with Copy Button inside a stylish Group (desktop) */}
            <div data-tour="header-visit-shop" className={`hidden md:flex items-center rounded-xl overflow-hidden border ${themeStyles.border} ${isDarkMode ? 'bg-neutral-900/40' : 'bg-gray-50/50'} p-0.5 shadow-sm shrink-0`}>
              <a
                href={`/@${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold ${themeStyles.textPrimary} hover:bg-accent-corail hover:text-white transition-all duration-150 cursor-pointer whitespace-nowrap`}
              >
                <Store size={14} className="shrink-0" />
                <span className="whitespace-nowrap">Visiter ma boutique</span>
              </a>

              <div className={`w-px h-5 ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-200'} shrink-0`} />

              <button
                onClick={() => {
                  const profileUrl = `${window.location.origin}/@${username}`;
                  navigator.clipboard.writeText(profileUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={`p-1.5 rounded-lg ${themeStyles.textSecondary} hover:text-accent-corail transition-all hover:bg-neutral-800/10 dark:hover:bg-neutral-800/50 cursor-pointer flex items-center justify-center shrink-0`}
                title="Copier le lien"
              >
                {copied ? (
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                ) : (
                  <Copy size={14} className="shrink-0" />
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

          {/* Mobile Search Bar (repliee par defaut, ouverte par l'icone loupe) */}
          <AnimatePresence>
            {isMobileSearchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className={`md:hidden absolute left-0 right-0 top-full ${themeStyles.surface} border-b ${themeStyles.border} px-4 py-3 shadow-sm`}
              >
                <div className="flex items-center relative">
                  <Search size={14} className="absolute left-3.5 text-gray-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Trouvez n'importe quoi..."
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs border ${themeStyles.border} bg-neutral-50/50 dark:bg-neutral-900/10 focus:border-accent-corail outline-none transition-all`}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* 3. Mobile Bottom Navigation Bar */}
        <nav className={`md:hidden fixed bottom-0 left-0 right-0 ${themeStyles.surface} border-t ${themeStyles.border} px-4 py-2 flex justify-around items-center z-50 shadow-lg transition-colors duration-200`}>
          {navItems.filter(item => ['home', 'content', 'withdrawals'].includes(item.id)).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 transition-colors duration-200 relative ${
                  isActive ? 'text-accent-corail font-semibold' : themeStyles.textSecondary
                }`}
              >
                <Icon size={18} />
                <span className="text-[9px] uppercase tracking-wider font-semibold">
                  {item.id === 'home' ? 'Accueil' : item.id === 'content' ? 'Contenu' : 'Retraits'}
                </span>
              </Link>
            );
          })}
          <button
            data-tour="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex flex-col items-center gap-1 p-2 transition-colors duration-200 relative cursor-pointer ${
              ['profile', 'subscription', 'admin'].includes(activeTab)
                ? 'text-accent-corail font-semibold'
                : themeStyles.textSecondary
            }`}
          >
            <div className="relative">
              <Menu size={18} />
              {isSubActionRequired() && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>
            <span className="text-[9px] uppercase tracking-wider font-semibold">MENU</span>
          </button>
        </nav>

        {/* Mobile Left Sidebar Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden fixed inset-0 bg-black/60 z-[55] backdrop-blur-xs"
              />

              {/* Drawer Container */}
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className={`md:hidden fixed inset-y-0 left-0 w-72 max-w-[80vw] ${themeStyles.surface} border-r ${themeStyles.border} h-full z-[60] p-6 flex flex-col justify-between shadow-2xl text-left overflow-y-auto`}
              >
                <div className="flex flex-col gap-6">
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-accent-corail flex items-center justify-center">
                        <Sparkles size={15} className="text-white" />
                      </div>
                      <span className={`font-display font-bold text-base ${themeStyles.textPrimary} tracking-tight`}>
                        MomoLink {profile?.is_premium && <span className="text-accent-corail text-xs font-semibold">Pro</span>}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`p-1.5 rounded-full border ${themeStyles.border} ${themeStyles.textSecondary} hover:text-accent-corail transition-colors cursor-pointer`}
                    >
                      <X size={15} />
                    </button>
                  </div>



                  {/* Creator Info Profile Card */}
                  <div className={`flex items-center gap-3 p-3 rounded-2xl border ${themeStyles.border} ${isDarkMode ? 'bg-neutral-900/40' : 'bg-gray-50/50'}`}>
                    <div 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate('/dashboard/profile');
                      }}
                      className="w-10 h-10 rounded-full bg-accent-corail/15 flex items-center justify-center border border-accent-corail/25 overflow-hidden shrink-0 cursor-pointer"
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
                    <div className="flex flex-col min-w-0">
                      <span className={`text-xs font-semibold ${themeStyles.textPrimary} truncate`}>{displayName}</span>
                      <span className={`text-[10px] ${themeStyles.textSecondary} truncate`}>@{username}</span>
                    </div>
                  </div>

                  {/* Navigation Links inside Drawer */}
                  <nav className="flex flex-col gap-1.5 mt-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-1">
                      Menu de navigation
                    </span>
                    
                    {navItems.map((item, idx) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      const showDot = item.id === 'subscription' && isSubActionRequired();
                      const prevSection = idx > 0 ? navItems[idx - 1].section : null;
                      const showSectionHeader = !!item.section && item.section !== prevSection;
                      return (
                        <React.Fragment key={item.id}>
                          {showSectionHeader && (
                            <span className={`px-2 pt-2 pb-0.5 text-[10px] font-bold uppercase tracking-widest ${themeStyles.textSecondary} opacity-50`}>
                              {item.section}
                            </span>
                          )}
                          <Link
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center justify-between px-4 py-3 rounded-[12px] text-xs font-semibold transition-all duration-200 ${
                              isActive
                                ? 'bg-accent-corail/10 text-accent-corail border border-accent-corail/15'
                                : `${themeStyles.textSecondary} hover:text-text-primary ${themeStyles.hoverBg} border border-transparent`
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon size={16} />
                              <span>{item.label}</span>
                            </div>
                            {showDot && (
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                            )}
                            {!!item.badge && (
                              <span className="px-1.5 py-0.5 rounded-full bg-accent-corail text-white text-[10px] font-bold min-w-[18px] text-center">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </React.Fragment>
                      );
                    })}
                  </nav>
                </div>

                {/* LogOut action inside Drawer */}
                <div className={`pt-4 border-t ${themeStyles.border}`}>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[12px] text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

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
                data-tour="add-content-btn"
                className="hidden sm:flex items-center gap-2 px-5 py-3 rounded-[12px] bg-accent-corail hover:bg-accent-corail-hover text-white text-xs font-semibold shadow-lg shadow-accent-corail/15 transition-all duration-200 active:scale-[0.98]"
              >
                <Plus size={16} />
                Ajouter un contenu
              </Link>
            </div>

            {/* Shared period selector - governs the 4 stat cards below AND the revenue chart,
                so the numbers never disagree with each other. */}
            <div className="flex flex-wrap items-center gap-2">
              {(['7d', '30d', '90d', '365d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setOverviewRange(range)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    overviewRange === range
                      ? 'bg-accent-corail text-white'
                      : `border ${themeStyles.border} ${themeStyles.textSecondary} hover:border-accent-corail/40`
                  }`}
                >
                  {overviewRangeLabels[range]}
                </button>
              ))}
              <button
                onClick={() => setOverviewRange('custom')}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  overviewRange === 'custom'
                    ? 'bg-accent-corail text-white'
                    : `border ${themeStyles.border} ${themeStyles.textSecondary} hover:border-accent-corail/40`
                }`}
              >
                Période personnalisée
              </button>

              {overviewRange === 'custom' && (
                <div className="flex items-center gap-2 ml-1">
                  <input
                    type="date"
                    value={overviewCustomStart}
                    onChange={(e) => setOverviewCustomStart(e.target.value)}
                    className={`px-2.5 py-1.5 rounded-lg border ${themeStyles.border} bg-transparent text-[11px] ${themeStyles.textPrimary} focus:outline-none focus:border-accent-corail`}
                  />
                  <span className={`text-[11px] ${themeStyles.textSecondary}`}>à</span>
                  <input
                    type="date"
                    value={overviewCustomEnd}
                    onChange={(e) => setOverviewCustomEnd(e.target.value)}
                    className={`px-2.5 py-1.5 rounded-lg border ${themeStyles.border} bg-transparent text-[11px] ${themeStyles.textPrimary} focus:outline-none focus:border-accent-corail`}
                  />
                </div>
              )}
            </div>

            {/* 4 Stats Cards Grid 2x2 */}
            {isOverviewLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </div>
            ) : (
              <div data-tour="stat-cards" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Stat 1 */}
                <div className={`${themeStyles.surface} border ${themeStyles.border} p-5 rounded-[20px] flex flex-col justify-between min-h-[120px] shadow-sm hover:border-accent-corail/30 transition-all duration-200`}>
                  <div className="flex justify-between items-start">
                    <span className={`text-[11px] font-bold ${themeStyles.textSecondary} uppercase tracking-widest`}>Revenus</span>
                    <div className="p-2 rounded-[8px] bg-accent-corail/10 text-accent-corail">
                      <TrendingUp size={14} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="font-display text-lg md:text-2xl font-semibold text-accent-corail">
                      {currentPeriodTotals.salesRevenue.toLocaleString()} FCFA
                    </span>
                    <div className={`flex items-center gap-1.5 mt-0.5`}>
                      <p className={`text-[10px] ${themeStyles.textSecondary}`}>Sur {overviewRangeLabels[overviewRange].toLowerCase()}</p>
                      {revenueTrend.isNew ? (
                        <span className="text-[10px] font-bold text-emerald-500">Nouveau</span>
                      ) : revenueTrend.pct !== 0 ? (
                        <span className={`text-[10px] font-bold ${revenueTrend.pct > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {revenueTrend.pct > 0 ? '↑' : '↓'}{Math.abs(revenueTrend.pct)}%
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className={`${themeStyles.surface} border ${themeStyles.border} p-5 rounded-[20px] flex flex-col justify-between min-h-[120px] shadow-sm hover:border-accent-corail/30 transition-all duration-200`}>
                  <div className="flex justify-between items-start">
                    <span className={`text-[11px] font-bold ${themeStyles.textSecondary} uppercase tracking-widest`}>Dons reçus</span>
                    <div className="p-2 rounded-[8px] bg-pink-500/10 text-pink-500">
                      <Heart size={14} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className={`font-display text-lg md:text-2xl font-semibold ${themeStyles.textPrimary}`}>
                      {currentPeriodTotals.donationsAmount.toLocaleString()} FCFA
                    </span>
                    <div className={`flex items-center gap-1.5 mt-0.5`}>
                      <p className={`text-[10px] ${themeStyles.textSecondary}`}>Sur {overviewRangeLabels[overviewRange].toLowerCase()}</p>
                      {donationsTrend.isNew ? (
                        <span className="text-[10px] font-bold text-emerald-500">Nouveau</span>
                      ) : donationsTrend.pct !== 0 ? (
                        <span className={`text-[10px] font-bold ${donationsTrend.pct > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {donationsTrend.pct > 0 ? '↑' : '↓'}{Math.abs(donationsTrend.pct)}%
                        </span>
                      ) : null}
                    </div>
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
                      {totalCreatorEarnings.toLocaleString()} FCFA
                    </span>
                    <p className={`text-[10px] ${themeStyles.textSecondary} mt-0.5`}>Cumul historique (ventes + dons)</p>
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
                    <p className={`text-[10px] ${themeStyles.textSecondary} mt-0.5`}>
                      {currentPeriodTotals.newContentCount > 0 ? `+${currentPeriodTotals.newContentCount} sur la période` : 'Actifs en ligne'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Graphique d'évolution des ventes */}
            <div className={`${themeStyles.surface} border ${themeStyles.border} p-5 md:p-6 rounded-[20px] shadow-sm`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className={`font-display text-lg font-semibold ${themeStyles.textPrimary} tracking-tight`}>
                    Évolution des revenus
                  </h3>
                  <p className={`text-xs ${themeStyles.textSecondary}`}>
                    Revenus nets créateur (ventes + dons) sur {overviewRangeLabels[overviewRange].toLowerCase()}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-accent-corail/10 text-accent-corail w-fit">
                  <span className="w-2 h-2 rounded-full bg-accent-corail animate-pulse" />
                  Données en temps réel
                </div>
              </div>

              <div className="h-[220px] w-full mt-2 font-sans text-[10px]">
                {purchasesList.length === 0 && donationsList.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-2 py-8">
                    <TrendingUp size={24} className={`${themeStyles.textSecondary} opacity-40`} />
                    <span className={`text-xs ${themeStyles.textSecondary}`}>Aucune donnée de transaction disponible</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={getChartData()}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorRevenu" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF5252" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#FF5252" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#33302c' : '#e5e5e0'} />
                      <XAxis 
                        dataKey="date" 
                        tickLine={false} 
                        axisLine={false} 
                        stroke={isDarkMode ? '#a19e99' : '#73706b'}
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        stroke={isDarkMode ? '#a19e99' : '#73706b'}
                        tickFormatter={(value) => `${value.toLocaleString()}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDarkMode ? '#1e1c1a' : '#ffffff', 
                          borderColor: isDarkMode ? '#33302c' : '#e5e5e0',
                          borderRadius: '12px',
                          color: isDarkMode ? '#ffffff' : '#1A1815'
                        }}
                        formatter={(value: any) => [`${value.toLocaleString()} FCFA`, 'Revenu']}
                        labelFormatter={(label) => `Date : ${label}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenu" 
                        stroke="#FF5252" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#colorRevenu)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Unified Recent Activity Feed: sales + donations + messages/partnerships + withdrawals */}
            <div className="flex flex-col gap-4">
              <h3 className={`font-display text-xl font-medium ${themeStyles.textPrimary} tracking-tight`}>
                Activité récente
              </h3>

              <div className={`${themeStyles.surface} border ${themeStyles.border} rounded-[20px] overflow-hidden shadow-md`}>
                {isActivityLoading ? (
                  <div className={`divide-y ${themeStyles.border}`}>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div key={idx} className="p-4 sm:p-5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Skeleton className="w-10 h-10 rounded-[10px] shrink-0" />
                          <div className="flex flex-col gap-1.5">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-2.5 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-3.5 w-16 shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                    <ShoppingBag className={`${themeStyles.textSecondary} opacity-40 h-10 w-10`} />
                    <span className={`text-sm font-semibold ${themeStyles.textPrimary}`}>Aucune activité</span>
                    <span className={`text-xs ${themeStyles.textSecondary}`}>Vos ventes, dons et messages apparaîtront ici</span>
                  </div>
                ) : (
                  <div className={`divide-y ${themeStyles.border}`}>
                    {recentActivity.map((event) => {
                      const visuals = {
                        sale: { icon: ShoppingBag, bg: 'bg-accent-corail/10', color: 'text-accent-corail' },
                        donation: { icon: Heart, bg: 'bg-pink-500/10', color: 'text-pink-500' },
                        message: { icon: Mail, bg: 'bg-accent-corail/10', color: 'text-accent-corail' },
                        partnership: { icon: Briefcase, bg: 'bg-purple-500/10', color: 'text-purple-500' },
                        withdrawal: { icon: Wallet, bg: 'bg-blue-500/10', color: 'text-blue-500' },
                      }[event.type];
                      const Icon = visuals.icon;
                      return (
                        <div key={event.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-black/10 transition-all duration-150 gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-[10px] ${visuals.bg} flex items-center justify-center ${visuals.color} shrink-0`}>
                              <Icon size={18} />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className={`text-xs font-semibold ${themeStyles.textPrimary} truncate block`}>{event.title}</span>
                              <span className={`text-[10px] ${themeStyles.textSecondary} flex items-center gap-1 mt-0.5 truncate`}>
                                <Clock size={10} className="shrink-0" />
                                {formatTimeAgo(event.timestamp)} • {event.subtitle}
                              </span>
                            </div>
                          </div>

                          {typeof event.amount === 'number' && (
                            <span className={`text-sm font-bold ${isDarkMode ? 'text-success-gold' : 'text-neutral-950'} font-mono shrink-0`}>
                              {event.type === 'withdrawal' ? '-' : '+'}{event.amount.toLocaleString()} FCFA
                            </span>
                          )}
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
              data-tour="mobile-add-content-btn"
              className="sm:hidden fixed bottom-20 right-6 w-14 h-14 rounded-full bg-accent-corail flex items-center justify-center text-white shadow-xl hover:bg-accent-corail-hover transition-transform duration-200 active:scale-95 z-40"
            >
              <Plus size={24} />
            </Link>
          </div>
        )}
        {activeTab === 'sales' && (
          <div className="flex flex-col gap-6" id="dashboard-sales-container">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className={`font-display text-2xl md:text-3xl font-medium tracking-tight ${themeStyles.textPrimary}`}>
                  Mes ventes
                </h1>
                <p className={`text-xs ${themeStyles.textSecondary} mt-1`}>
                  Consultez et gérez l'ensemble des revenus générés par vos créations.
                </p>
              </div>
            </div>

            {/* Sales stats grid (Brut, Net, count, average order value) */}
            {isLoadingWithdrawals ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Skeleton className="min-h-[110px] rounded-[20px]" />
                <Skeleton className="min-h-[110px] rounded-[20px]" />
                <Skeleton className="min-h-[110px] rounded-[20px]" />
                <Skeleton className="min-h-[110px] rounded-[20px]" />
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1 */}
                <div className={`${themeStyles.surface} border ${themeStyles.border} p-5 rounded-[20px] shadow-sm flex flex-col justify-between min-h-[110px]`}>
                  <span className={`text-[10px] font-bold ${themeStyles.textSecondary} uppercase tracking-widest`}>Total Brut</span>
                  <div className="mt-2">
                    <span className={`font-display text-base md:text-xl font-semibold ${themeStyles.textPrimary}`}>
                      {totalBrutRevenue.toLocaleString()} FCFA
                    </span>
                    <p className={`text-[9px] ${themeStyles.textSecondary} mt-0.5`}>Volume d'affaires brut</p>
                  </div>
                </div>

                {/* Card 2 */}
                <div className={`${themeStyles.surface} border ${themeStyles.border} p-5 rounded-[20px] shadow-sm flex flex-col justify-between min-h-[110px] border-accent-corail/25`}>
                  <span className={`text-[10px] font-bold ${themeStyles.textSecondary} uppercase tracking-widest`}>Revenu Net</span>
                  <div className="mt-2">
                    <span className="font-display text-base md:text-xl font-semibold text-accent-corail">
                      {totalNetRevenue.toLocaleString()} FCFA
                    </span>
                    <p className={`text-[9px] ${themeStyles.textSecondary} mt-0.5`}>Revenu dans votre poche</p>
                  </div>
                </div>

                {/* Card 3 */}
                <div className={`${themeStyles.surface} border ${themeStyles.border} p-5 rounded-[20px] shadow-sm flex flex-col justify-between min-h-[110px]`}>
                  <span className={`text-[10px] font-bold ${themeStyles.textSecondary} uppercase tracking-widest`}>Volume Ventes</span>
                  <div className="mt-2">
                    <span className={`font-display text-base md:text-xl font-semibold ${themeStyles.textPrimary}`}>
                      {totalSalesCount} {totalSalesCount > 1 ? 'ventes' : 'vente'}
                    </span>
                    <p className={`text-[9px] ${themeStyles.textSecondary} mt-0.5`}>Nombre total d'achats</p>
                  </div>
                </div>

                {/* Card 4 */}
                <div className={`${themeStyles.surface} border ${themeStyles.border} p-5 rounded-[20px] shadow-sm flex flex-col justify-between min-h-[110px]`}>
                  <span className={`text-[10px] font-bold ${themeStyles.textSecondary} uppercase tracking-widest`}>Panier Moyen</span>
                  <div className="mt-2">
                    <span className={`font-display text-base md:text-xl font-semibold ${themeStyles.textPrimary}`}>
                      {averageOrderValue.toLocaleString()} FCFA
                    </span>
                    <p className={`text-[9px] ${themeStyles.textSecondary} mt-0.5`}>Valeur nette par commande</p>
                  </div>
                </div>
              </div>
            )}

            {/* Filters Bar */}
            <div className={`${themeStyles.surface} border ${themeStyles.border} p-4 rounded-[20px] shadow-sm flex flex-col md:flex-row gap-3`}>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par article, client..."
                  value={salesSearch}
                  onChange={(e) => setSalesSearch(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-xl border ${themeStyles.border} text-xs focus:outline-none focus:border-accent-corail transition-colors bg-black/5 ${themeStyles.textPrimary}`}
                  id="sales-search-input"
                />
              </div>

              <div className="w-full md:w-48 relative">
                <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <select
                  value={salesStatus}
                  onChange={(e) => setSalesStatus(e.target.value)}
                  className={`w-full pl-9 pr-8 py-2 rounded-xl border ${themeStyles.border} text-xs focus:outline-none focus:border-accent-corail transition-colors bg-transparent appearance-none cursor-pointer ${themeStyles.textPrimary}`}
                  id="sales-status-select"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="completed">Payé / Complété</option>
                  <option value="pending">En attente</option>
                  <option value="failed">Échoué</option>
                </select>
              </div>

              <div className="w-full md:w-56 relative">
                <ShoppingBag className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <select
                  value={salesProductFilter}
                  onChange={(e) => setSalesProductFilter(e.target.value)}
                  className={`w-full pl-9 pr-8 py-2 rounded-xl border ${themeStyles.border} text-xs focus:outline-none focus:border-accent-corail transition-colors bg-transparent appearance-none cursor-pointer ${themeStyles.textPrimary}`}
                  id="sales-product-select"
                >
                  <option value="all">Tous les produits</option>
                  {salesProductOptions.map(([id, title]) => (
                    <option key={id} value={id}>{title}</option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-44 relative">
                <ArrowUpDown className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <select
                  value={salesSortOrder}
                  onChange={(e) => setSalesSortOrder(e.target.value as 'recent' | 'oldest')}
                  className={`w-full pl-9 pr-8 py-2 rounded-xl border ${themeStyles.border} text-xs focus:outline-none focus:border-accent-corail transition-colors bg-transparent appearance-none cursor-pointer ${themeStyles.textPrimary}`}
                  id="sales-sort-select"
                >
                  <option value="recent">Plus récent d'abord</option>
                  <option value="oldest">Plus ancien d'abord</option>
                </select>
              </div>

              {/* Desktop only: the columns this hides aren't rendered on mobile anyway. */}
              <button
                type="button"
                onClick={() => setHideSensitiveSales(v => !v)}
                title={hideSensitiveSales ? 'Afficher les informations client' : 'Masquer les informations client'}
                aria-pressed={hideSensitiveSales}
                className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                  hideSensitiveSales
                    ? 'border-accent-corail bg-accent-corail/5 text-accent-corail'
                    : `${themeStyles.border} ${themeStyles.textSecondary} hover:border-accent-corail/50`
                }`}
                id="sales-privacy-toggle"
              >
                {hideSensitiveSales ? <EyeOff size={14} /> : <Eye size={14} />}
                <span className="whitespace-nowrap">{hideSensitiveSales ? 'Masqué' : 'Masquer'}</span>
              </button>
            </div>

            {/* Sales List Table */}
            <div className={`${themeStyles.surface} border ${themeStyles.border} rounded-[20px] overflow-hidden shadow-sm`}>
              {filteredSalesList.length === 0 ? (
                <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
                  <ShoppingBag className={`${themeStyles.textSecondary} opacity-30 h-12 w-12`} />
                  <span className={`text-sm font-semibold ${themeStyles.textPrimary}`}>Aucune vente trouvée</span>
                  <span className={`text-xs ${themeStyles.textSecondary}`}>Modifiez vos critères de recherche ou attendez vos premières ventes.</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border-custom">
                    <thead className="bg-black/5">
                      <tr>
                        <th className={`px-4 md:px-5 py-4.5 text-left text-[10px] font-bold ${themeStyles.textSecondary} uppercase tracking-wider`}>Produit</th>
                        {/* Buyer/transaction detail columns are desktop-only: on a phone they
                            forced a cramped horizontal scroll. The mobile view keeps the product
                            (cover + title + amount) and the status pill, nothing else. */}
                        <th className={`hidden md:table-cell px-5 py-4.5 text-left text-[10px] font-bold ${themeStyles.textSecondary} uppercase tracking-wider`}>Client (Tel)</th>
                        <th className={`hidden md:table-cell px-5 py-4.5 text-left text-[10px] font-bold ${themeStyles.textSecondary} uppercase tracking-wider`}>Moyen de paiement</th>
                        <th className={`hidden md:table-cell px-5 py-4.5 text-left text-[10px] font-bold ${themeStyles.textSecondary} uppercase tracking-wider`}>Référence</th>
                        <th className={`hidden md:table-cell px-5 py-4.5 text-left text-[10px] font-bold ${themeStyles.textSecondary} uppercase tracking-wider`}>Date</th>
                        <th className={`hidden md:table-cell px-5 py-4.5 text-right text-[10px] font-bold ${themeStyles.textSecondary} uppercase tracking-wider`}>Revenu Net</th>
                        <th className={`px-4 md:px-5 py-4.5 text-right text-[10px] font-bold ${themeStyles.textSecondary} uppercase tracking-wider`}>Statut</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${themeStyles.border}`}>
                      <AnimatePresence>
                        {paginatedSalesList.map((p, idx) => {
                          const title = p.contents?.title || p.title || 'Guide exclusif';
                          const cover = p.contents?.thumbnail_url || p.contents?.preview_url || null;
                          const statusBadge = getSaleStatusBadge(p.status);
                          const dateString = p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : 'Date inconnue';
                          return (
                            <motion.tr
                              key={p.id || idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2, delay: idx * 0.03 }}
                              className="hover:bg-black/5 transition-colors animate-fade-in"
                            >
                              <td className="px-4 md:px-5 py-3.5 md:py-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={`w-11 h-11 md:w-10 md:h-10 rounded-[10px] overflow-hidden shrink-0 border ${themeStyles.border} bg-accent-corail/10 flex items-center justify-center`}>
                                    {cover ? (
                                      <img
                                        src={cover}
                                        alt=""
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <ShoppingBag size={16} className="text-accent-corail" />
                                    )}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span
                                      className={`text-xs font-semibold ${themeStyles.textPrimary} truncate max-w-[150px] sm:max-w-[220px]`}
                                      title={title}
                                    >
                                      {title}
                                    </span>
                                    {/* The amount lives here on mobile, where its own column is hidden. */}
                                    <span className={`md:hidden text-[11px] font-mono mt-0.5 ${themeStyles.textSecondary}`}>
                                      {(p.creator_net_amount_fcfa || 0).toLocaleString()} FCFA
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className={`hidden md:table-cell px-5 py-4 whitespace-nowrap text-xs font-mono font-medium ${themeStyles.textPrimary}`}>
                                {hideSensitiveSales ? '••• ••• •••' : (p.buyer_phone || 'Non renseigné')}
                              </td>
                              <td className="hidden md:table-cell px-5 py-4 whitespace-nowrap">
                                {hideSensitiveSales ? (
                                  <span className={`text-xs font-mono ${themeStyles.textSecondary}`}>••••••</span>
                                ) : (() => {
                                  const method = getSalePaymentMethod(p.payment_reference);
                                  return (
                                    <div className="flex items-center gap-2">
                                      {method.logo && (
                                        <img src={method.logo} alt="" className="h-4 w-4 object-contain rounded-sm bg-white p-0.5 shrink-0" />
                                      )}
                                      <span className={`text-xs font-medium ${themeStyles.textPrimary}`}>{method.label}</span>
                                    </div>
                                  );
                                })()}
                              </td>
                              <td className={`hidden md:table-cell px-5 py-4 whitespace-nowrap text-xs font-mono ${themeStyles.textSecondary}`}>
                                {hideSensitiveSales ? '••••••••••••' : (p.payment_reference || 'REF-MOMO')}
                              </td>
                              <td className={`hidden md:table-cell px-5 py-4 whitespace-nowrap text-xs ${themeStyles.textSecondary}`}>
                                {dateString}
                              </td>
                              <td className="hidden md:table-cell px-5 py-4 whitespace-nowrap text-right">
                                <span className={`text-xs font-bold ${isDarkMode ? 'text-success-gold' : 'text-neutral-950'} font-mono`}>
                                  +{(p.creator_net_amount_fcfa || 0).toLocaleString()} F
                                </span>
                              </td>
                              <td className="px-4 md:px-5 py-3.5 md:py-4 whitespace-nowrap text-right">
                                <span className={`inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-full border text-[11px] font-bold ${statusBadge.className}`}>
                                  <statusBadge.icon size={12} strokeWidth={3} className="shrink-0" />
                                  {statusBadge.label}
                                </span>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {salesPageCount > 1 && (
              <div className="flex items-center justify-between gap-4 px-1">
                <span className={`text-[11px] ${themeStyles.textSecondary}`}>
                  Page {salesPage} sur {salesPageCount} · {totalSalesCount} vente{totalSalesCount > 1 ? 's' : ''} au total
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSalesPage((p: number) => Math.max(1, p - 1))}
                    disabled={salesPage === 1}
                    className={`p-2 rounded-lg border ${themeStyles.border} ${themeStyles.textPrimary} disabled:opacity-30 disabled:cursor-not-allowed hover:border-accent-corail transition-colors cursor-pointer`}
                    id="sales-page-prev"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className={`text-xs font-semibold ${themeStyles.textPrimary} min-w-[1.5rem] text-center`}>
                    {salesPage}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSalesPage((p: number) => Math.min(salesPageCount, p + 1))}
                    disabled={salesPage === salesPageCount}
                    className={`p-2 rounded-lg border ${themeStyles.border} ${themeStyles.textPrimary} disabled:opacity-30 disabled:cursor-not-allowed hover:border-accent-corail transition-colors cursor-pointer`}
                    id="sales-page-next"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            MESSAGES & PARTENARIATS
           ========================================== */}
        {activeTab === 'messages' && (
          <div className="flex flex-col gap-6" id="dashboard-messages-container">
            <div>
              <h1 className={`font-display text-2xl md:text-3xl font-medium tracking-tight ${themeStyles.textPrimary}`}>
                Messages
              </h1>
              <p className={`text-xs ${themeStyles.textSecondary} mt-1`}>
                Messages et propositions de partenariat reçus sur votre profil public.
              </p>
            </div>

            {isLoadingMessages ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-20 w-full rounded-[16px]" />
                <Skeleton className="h-20 w-full rounded-[16px]" />
                <Skeleton className="h-20 w-full rounded-[16px]" />
              </div>
            ) : inboxFeed.length === 0 ? (
              <div className={`${themeStyles.surface} border ${themeStyles.border} rounded-[20px] p-10 flex flex-col items-center text-center gap-3`}>
                <div className="p-3 rounded-full bg-accent-corail/10 text-accent-corail">
                  <Mail size={24} />
                </div>
                <h3 className="font-display text-base font-medium">Rien pour le moment</h3>
                <p className={`text-xs ${themeStyles.textSecondary} max-w-sm`}>
                  Les messages et propositions de partenariat envoyés depuis votre profil public apparaîtront ici.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {inboxFeed.map((m) => {
                  const isPartnership = m.type === 'partnership';
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleMarkMessageRead(m)}
                      className={`${themeStyles.surface} border ${m.is_read ? themeStyles.border : 'border-accent-corail/40'} rounded-[16px] p-4 flex items-start gap-3.5 text-left w-full cursor-pointer hover:border-accent-corail/40 transition-colors`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${isPartnership ? 'bg-purple-500/10 text-purple-500' : 'bg-accent-corail/10 text-accent-corail'}`}>
                        {isPartnership ? <Briefcase size={16} /> : <Mail size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-sm font-semibold ${themeStyles.textPrimary} flex items-center gap-2`}>
                            {m.sender_name}
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${isPartnership ? 'bg-purple-500/10 text-purple-500' : 'bg-accent-corail/10 text-accent-corail'}`}>
                              {isPartnership ? 'Partenariat' : 'Message'}
                            </span>
                            {!m.is_read && <span className="w-1.5 h-1.5 rounded-full bg-accent-corail shrink-0" />}
                          </h4>
                          <span className={`text-[10px] ${themeStyles.textSecondary} shrink-0`}>{formatTimeAgo(m.created_at)}</span>
                        </div>
                        <p className={`text-xs ${themeStyles.textSecondary} mt-1 leading-relaxed line-clamp-2`}>{m.body}</p>
                        <span className={`text-[10px] ${themeStyles.textSecondary} opacity-70 mt-1 block`}>{m.sender_email}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            DONS REÇUS
           ========================================== */}
        {activeTab === 'donations' && (
          <div className="flex flex-col gap-6" id="dashboard-donations-container">
            <div>
              <h1 className={`font-display text-2xl md:text-3xl font-medium tracking-tight ${themeStyles.textPrimary}`}>
                Dons reçus
              </h1>
              <p className={`text-xs ${themeStyles.textSecondary} mt-1`}>
                Liste des personnes qui vous ont fait un don depuis votre profil public.
              </p>
            </div>

            {isLoadingMessages ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-20 w-full rounded-[16px]" />
                <Skeleton className="h-20 w-full rounded-[16px]" />
                <Skeleton className="h-20 w-full rounded-[16px]" />
              </div>
            ) : sortedDonations.length === 0 ? (
              <div className={`${themeStyles.surface} border ${themeStyles.border} rounded-[20px] p-10 flex flex-col items-center text-center gap-3`}>
                <div className="p-3 rounded-full bg-pink-500/10 text-pink-500">
                  <Heart size={24} />
                </div>
                <h3 className="font-display text-base font-medium">Aucun don pour le moment</h3>
                <p className={`text-xs ${themeStyles.textSecondary} max-w-sm`}>
                  Les dons reçus via le bouton "Faire un don" de votre profil public apparaîtront ici.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {sortedDonations.map((d) => (
                  <div key={d.id} className={`${themeStyles.surface} border ${themeStyles.border} rounded-[16px] p-4 flex items-start gap-3.5`}>
                    <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-500 shrink-0">
                      <Heart size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-sm font-semibold ${themeStyles.textPrimary}`}>
                          {d.donor_name} — <span className="text-pink-500">{d.amount_fcfa.toLocaleString()} FCFA</span>
                        </h4>
                        <span className={`text-[10px] ${themeStyles.textSecondary} shrink-0`}>{formatTimeAgo(d.created_at)}</span>
                      </div>
                      {d.donor_message && (
                        <p className={`text-xs ${themeStyles.textSecondary} mt-1 leading-relaxed`}>{d.donor_message}</p>
                      )}
                      {d.donor_email && (
                        <span className={`text-[10px] ${themeStyles.textSecondary} opacity-70 mt-1 block`}>{d.donor_email}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                      setEditingContentId(null);
                      setTitle('');
                      setDescription('');
                      setContentType('pdf');
                      setFile(null);
                      setPreviewFile(null);
                      setPriceFcfa('');
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
                        {editingContentId ? 'Modifier le contenu' : 'Créer un nouveau contenu exclusif'}
                      </h2>
                      <button
                        onClick={() => { setIsFormOpen(false); setEditingContentId(null); }}
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
                              min={1000}
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
                          <label className={`text-xs font-semibold ${themeStyles.textPrimary}`}>
                            {editingContentId ? 'Remplacer le fichier principal (optionnel)' : 'Fichier principal obligatoire *'}
                          </label>
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
                                <span className={`text-xs font-medium ${themeStyles.textPrimary}`}>
                                  {editingContentId ? 'Fichier actuel conservé' : 'Glissez-déposez votre fichier ici'}
                                </span>
                                <span className={`text-[10px] ${themeStyles.textSecondary}`}>
                                  {editingContentId ? 'Cliquez pour le remplacer' : 'ou cliquez pour parcourir'}
                                </span>
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
                                    {editingContentId ? 'Couverture actuelle conservée — cliquez pour la remplacer' : 'PNG, JPG ou WEBP de couverture'}
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
                        onClick={() => { setIsFormOpen(false); setEditingContentId(null); }}
                        className={`px-4 py-2.5 rounded-[12px] text-xs font-semibold ${themeStyles.textSecondary} ${isDarkMode ? 'hover:text-text-primary' : 'hover:text-light-text-primary'} ${themeStyles.hoverBg} transition-all cursor-pointer`}
                      >
                        Annuler
                      </button>

                      {editingContentId ? (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleSaveContentEdit()}
                          className="px-5 py-2.5 rounded-[12px] text-xs font-bold bg-accent-corail hover:bg-accent-corail-hover text-white transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              <Check size={14} />
                              Enregistrer les modifications
                            </>
                          )}
                        </button>
                      ) : (
                        <>
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
                        </>
                      )}
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
                              <button
                                onClick={() => handleStartEdit(content)}
                                className={`w-full px-3 py-2 text-[11px] font-semibold ${themeStyles.textSecondary} ${isDarkMode ? 'hover:text-text-primary' : 'hover:text-light-text-primary'} hover:bg-accent-corail/10 flex items-center gap-2 cursor-pointer transition-colors`}
                              >
                                <Pencil size={12} className={themeStyles.textSecondary} />
                                Modifier
                              </button>

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
                    {isLoadingWithdrawals ? (
                      <Skeleton className="h-9 w-40 mt-1" />
                    ) : (
                      <span className="font-display text-[32px] font-black text-accent-corail leading-tight">
                        {availableBalance.toLocaleString()} FCFA
                      </span>
                    )}
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
                        className={`p-3 rounded-[12px] border text-left flex items-center gap-3 h-20 transition-all duration-200 cursor-pointer ${
                          profilePayoutProvider === prov
                            ? 'border-accent-corail bg-accent-corail/5 text-accent-corail shadow-sm font-bold'
                            : `${isDarkMode ? 'border-border-custom bg-bg-primary/20 text-text-secondary' : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-400'}`
                        }`}
                      >
                        <img
                          src={getPayoutProviderLogo(prov) || ''}
                          alt={getPayoutProviderLabel(prov)}
                          className="h-9 w-9 object-contain rounded-md bg-white p-1 shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{getPayoutProviderLabel(prov)}</span>
                          <span className="text-[10px] opacity-80 leading-normal">
                            {prov === 'wave' && 'Afrique Ouest'}
                            {prov === 'orange' && 'Orange Money'}
                            {prov === 'mtn' && 'MTN MoMo'}
                            {prov === 'moov' && 'Moov Money'}
                          </span>
                        </div>
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
                <div className={`${themeStyles.surface} border ${themeStyles.border} p-6 sm:p-7 rounded-[28px] shadow-sm flex flex-col gap-6`}>
                  <div className={`flex flex-wrap justify-between items-center gap-2 pb-5 border-b ${themeStyles.border}`}>
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-accent-corail/10 text-accent-corail">
                        <Sparkles size={16} />
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${themeStyles.textSecondary}`}>MomoLink Pro</span>
                    </div>

                    {/* CASE A — Active */}
                    {getSubCase() === 'A' && (
                      <div className="flex items-center gap-2">
                        {Math.max(0, Math.ceil((new Date(activeSub.end_date || activeSub.endDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000))) <= 5 && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                            Renouvellement conseillé
                          </span>
                        )}
                        <span className={`px-2.5 py-1 rounded-full border border-emerald-500/25 text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5 bg-emerald-500/10`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Abonnement actif
                        </span>
                      </div>
                    )}

                    {/* CASE B — Grace Period */}
                    {getSubCase() === 'B' && (
                      <span className="px-2.5 py-1 rounded-full border border-amber-500/25 text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 bg-amber-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Période de grâce
                      </span>
                    )}

                    {/* CASE C/D — Inactive */}
                    {(getSubCase() === 'C' || getSubCase() === 'D') && (
                      <span className={`px-2.5 py-1 rounded-full border ${themeStyles.border} text-[10px] font-bold uppercase tracking-wider ${themeStyles.textSecondary} flex items-center gap-1.5 ${isDarkMode ? 'bg-neutral-900/50' : 'bg-gray-50'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-neutral-500' : 'bg-gray-400'}`} />
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
                          <div className={`flex justify-between text-[10px] font-bold font-mono ${themeStyles.textSecondary}`}>
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
                                <p className={themeStyles.textSecondary}>Évitez toute interruption en renouvelant maintenant.</p>
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
                          <p className={`leading-relaxed ${themeStyles.textSecondary}`}>
                            Votre abonnement MomoLink Pro a expiré il y a {daysExpired} {daysExpired > 1 ? 'jours' : 'jour'}.
                            Pour continuer à publier du contenu et demander des retraits, veuillez renouveler votre abonnement sous {graceDaysRemaining} {graceDaysRemaining > 1 ? 'jours' : 'jour'}.
                          </p>
                        </div>

                        <button
                          disabled={isSubscribingProcess}
                          onClick={handleSubscribe}
                          className="w-full py-3.5 rounded-xl bg-accent-corail hover:bg-accent-corail-hover text-white font-extrabold text-sm shadow-md shadow-accent-corail/20 cursor-pointer transition-transform duration-100 active:scale-98 flex justify-center items-center gap-2"
                        >
                          {isSubscribingProcess ? (
                            <Loader2 className="animate-spin h-5 w-5" />
                          ) : (
                            'Renouveler maintenant — 4 990 FCFA/mois'
                          )}
                        </button>
                      </div>
                    );
                  })()}

                  {(getSubCase() === 'C' || getSubCase() === 'D') && (
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 p-5 rounded-[20px] border border-accent-corail/20 bg-accent-corail/5">
                        <div className="flex flex-col gap-1.5">
                          <span className={`text-xs font-bold ${themeStyles.textPrimary}`}>
                            {getSubCase() === 'D' ? "Formule MomoLink Pro requise" : "Votre abonnement MomoLink Pro est expiré"}
                          </span>
                          <p className={`text-xs leading-relaxed max-w-md ${themeStyles.textSecondary}`}>
                            {getSubCase() === 'D'
                              ? "Rejoignez MomoLink Pro pour débloquer la publication de vos contenus exclusifs et activer les retraits Mobile Money."
                              : "Votre abonnement est arrivé à échéance. Renouvelez-le dès aujourd'hui pour réactiver instantanément vos avantages."
                            }
                          </p>
                        </div>
                        <div className="flex items-baseline gap-1 shrink-0">
                          <span className="text-3xl font-extrabold font-mono text-accent-corail">4 990</span>
                          <span className={`text-xs font-semibold ${themeStyles.textSecondary}`}>FCFA/mois</span>
                        </div>
                      </div>

                      {getSubCase() === 'C' && autoDraftedCount > 0 && (
                        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-red-400 text-xs font-medium">
                          ⚠️ {autoDraftedCount} contenu{autoDraftedCount > 1 ? 's ont' : ' a'} été temporairement archivé{autoDraftedCount > 1 ? 's' : ''} automatiquement. Ils seront immédiatement remis en ligne après votre réabonnement.
                        </div>
                      )}

                      {/* Restrictions list */}
                      <div className="flex flex-col gap-3">
                        <h4 className={`text-xs font-bold ${themeStyles.textPrimary} uppercase tracking-wider`}>Avantages & Statut</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                          <div className="flex items-start gap-2.5">
                            <div className={`p-1 rounded-full shrink-0 mt-0.5 ${isDarkMode ? 'bg-neutral-800 text-neutral-500' : 'bg-gray-100 text-gray-400'}`}>
                              <X size={12} />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className={`font-semibold ${themeStyles.textPrimary}`}>Publication de contenu</span>
                              <span className={`text-[11px] ${themeStyles.textSecondary}`}>Mise en ligne de nouveaux fichiers bloquée</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <div className={`p-1 rounded-full shrink-0 mt-0.5 ${isDarkMode ? 'bg-neutral-800 text-neutral-500' : 'bg-gray-100 text-gray-400'}`}>
                              <X size={12} />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className={`font-semibold ${themeStyles.textPrimary}`}>Versements & Retraits</span>
                              <span className={`text-[11px] ${themeStyles.textSecondary}`}>Demandes de retraits temporairement suspendues</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <div className={`p-1 rounded-full shrink-0 mt-0.5 ${isDarkMode ? 'bg-neutral-800 text-neutral-500' : 'bg-gray-100 text-gray-400'}`}>
                              <X size={12} />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className={`font-semibold ${themeStyles.textPrimary}`}>Contenus en ligne</span>
                              <span className={`text-[11px] ${themeStyles.textSecondary}`}>Archivage automatique (après délai de grâce)</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <div className="p-1 rounded-full shrink-0 mt-0.5 bg-emerald-500/10 text-emerald-500">
                              <Check size={12} />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className={`font-semibold ${themeStyles.textPrimary}`}>Page de Profil Public</span>
                              <span className="text-[11px] text-emerald-500">Reste accessible et visible par vos fans</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        disabled={isSubscribingProcess}
                        onClick={handleSubscribe}
                        className="w-full py-3.5 rounded-xl bg-accent-corail hover:bg-accent-corail-hover text-white font-extrabold text-sm shadow-md shadow-accent-corail/20 cursor-pointer transition-transform duration-100 active:scale-98 flex justify-center items-center gap-2"
                      >
                        {isSubscribingProcess ? (
                          <Loader2 className="animate-spin h-5 w-5" />
                        ) : (
                          "S'abonner — 4 990 FCFA/mois"
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
                            <tr className={`border-b ${themeStyles.border} ${isDarkMode ? 'bg-[#14120F]' : 'bg-gray-50'} ${themeStyles.textSecondary} font-bold uppercase tracking-wider text-[10px]`}>
                              <th className="p-4">Date de début</th>
                              <th className="p-4">Date de fin</th>
                              <th className="p-4">Montant</th>
                              <th className="p-4">Statut</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${isDarkMode ? 'divide-neutral-800' : 'divide-gray-100'}`}>
                            {subscriptionsList.map((sub, idx) => (
                              <tr key={sub.id || idx} className={`${isDarkMode ? 'hover:bg-neutral-900/30' : 'hover:bg-gray-50/50'} transition-colors font-mono`}>
                                <td className={`p-4 ${themeStyles.textPrimary}`}>
                                  {new Date(sub.start_date || sub.startDate).toLocaleDateString('fr-FR')}
                                </td>
                                <td className={`p-4 ${themeStyles.textPrimary}`}>
                                  {new Date(sub.end_date || sub.endDate).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="p-4 font-bold text-accent-corail">
                                  {(sub.amount_paid || sub.amountPaid).toLocaleString()} FCFA
                                </td>
                                <td className="p-4">
                                  {sub.status === 'active' ? (
                                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 text-[10px] font-bold uppercase">
                                      Actif
                                    </span>
                                  ) : sub.status === 'expired' ? (
                                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/25 text-[10px] font-bold uppercase">
                                      Expiré
                                    </span>
                                  ) : (
                                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${isDarkMode ? 'bg-neutral-800 text-neutral-400 border-neutral-700' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
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

      {/* 1. Modal: Changer de boutique */}
      <AnimatePresence>
        {isSwitchModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-sm p-6 rounded-[24px] border ${themeStyles.border} ${themeStyles.surface} relative shadow-2xl flex flex-col gap-6 text-left`}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsSwitchModalOpen(false)}
                className={`absolute top-4 right-4 p-1.5 rounded-full border ${themeStyles.border} ${themeStyles.textSecondary} hover:text-accent-corail transition-all cursor-pointer`}
              >
                <X size={14} />
              </button>

              {/* Title */}
              <div className="text-center mt-2">
                <h3 className={`font-display text-xl font-bold ${themeStyles.textPrimary}`}>
                  Changer de boutique
                </h3>
              </div>

              {/* Shop List */}
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                {allProfiles.map((p) => {
                  const isActive = p.id === profile?.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        if (!isActive) {
                          switchProfile(p.id);
                          setIsSwitchModalOpen(false);
                        }
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-xl border ${
                        isActive 
                          ? 'border-accent-corail/30 bg-accent-corail/5 font-bold' 
                          : `${themeStyles.border} bg-neutral-50/50 dark:bg-neutral-900/10 hover:bg-neutral-800/5 dark:hover:bg-white/5`
                      } transition-all cursor-pointer group`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className={`w-8 h-8 rounded-lg ${isActive ? 'bg-accent-corail/15 text-accent-corail' : 'bg-neutral-800/10 dark:bg-neutral-800/50 text-neutral-400'} flex items-center justify-center shrink-0`}>
                          <Store size={14} />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className={`text-xs font-bold ${themeStyles.textPrimary} truncate`}>
                            {p.display_name}
                          </span>
                          <span className={`text-[10px] ${themeStyles.textSecondary} truncate`}>
                            @{p.username}
                          </span>
                        </div>
                      </div>
                      <div className={`w-7 h-7 rounded-lg border ${themeStyles.border} flex items-center justify-center group-hover:bg-accent-corail group-hover:text-white transition-all shrink-0`}>
                        {isActive ? (
                          <Check size={12} className="text-accent-corail group-hover:text-white" />
                        ) : (
                          <span className="text-[10px] font-bold">→</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Yellow Button to Create Store */}
              <button
                onClick={() => {
                  setIsCreateModalOpen(true);
                  setCreateStoreError(null);
                }}
                className="w-full py-3 rounded-xl bg-accent-corail hover:bg-accent-corail-hover text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Créer une boutique</span>
                <Plus size={14} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Modal: Créer une boutique */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-sm p-6 rounded-[24px] border ${themeStyles.border} ${themeStyles.surface} relative shadow-2xl flex flex-col gap-5 text-left`}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className={`absolute top-4 right-4 p-1.5 rounded-full border ${themeStyles.border} ${themeStyles.textSecondary} hover:text-accent-corail transition-all cursor-pointer`}
              >
                <X size={14} />
              </button>

              {/* Title */}
              <div className="text-center mt-2">
                <h3 className={`font-display text-xl font-bold ${themeStyles.textPrimary}`}>
                  Créer une boutique
                </h3>
                <p className={`text-[11px] ${themeStyles.textSecondary} mt-1`}>
                  Lancez un nouveau profil de vente sous votre compte actuel.
                </p>
              </div>

              <form onSubmit={handleCreateStoreSubmit} className="flex flex-col gap-4">
                {/* Form fields */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${themeStyles.textSecondary}`}>
                    Nom de la boutique
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mon Super Store"
                    value={newStoreName}
                    onChange={(e) => {
                      setNewStoreName(e.target.value);
                      // Auto slug generation
                      const slug = e.target.value
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]/g, '');
                      setNewStoreSlug(slug);
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl border ${themeStyles.border} bg-neutral-50/50 dark:bg-neutral-900/10 text-xs focus:border-accent-corail outline-none transition-all`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${themeStyles.textSecondary}`}>
                    Identifiant URL unique
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-500 font-mono">
                      @
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="monstore"
                      value={newStoreSlug}
                      onChange={(e) => {
                        const slug = e.target.value
                          .toLowerCase()
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .replace(/[^a-z0-9]/g, '');
                        setNewStoreSlug(slug);
                      }}
                      className={`w-full pl-7 pr-4 py-2.5 rounded-xl border ${themeStyles.border} bg-neutral-50/50 dark:bg-neutral-900/10 text-xs font-mono focus:border-accent-corail outline-none transition-all`}
                    />
                  </div>
                  <span className="text-[9px] text-neutral-500">
                    Votre boutique sera disponible sur : {window.location.origin}/@{newStoreSlug || 'identifiant'}
                  </span>
                </div>

                {createStoreError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] leading-relaxed">
                    {createStoreError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isCreatingStore}
                  className="w-full py-3 mt-2 rounded-xl bg-accent-corail hover:bg-accent-corail-hover text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isCreatingStore ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Création...</span>
                    </>
                  ) : (
                    <>
                      <span>Créer ma boutique</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {profile && (
        <GuidedTour storageKey={`momo_tour_seen_${profile.id}`} active={!isOverviewLoading} />
      )}

      <ConfettiBurst active={showPublishConfetti} />

      </main>
      </div>
    </div>
  );
}

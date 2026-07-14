/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase, getSupabaseClient } from '../lib/supabase';
import { Content, CreatorProfile } from '../types';
import { 
  Lock, 
  X, 
  Smartphone, 
  ArrowRight, 
  Check, 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  Download, 
  UserCheck,
  Share2,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CreatorPublicProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { isDemoMode } = useAuth();
  const { isDarkMode, styles } = useTheme();

  // Profile data
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buyer verification tracking (Email-based)
  const [buyerEmailInput, setBuyerEmailInput] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(() => 
    sessionStorage.getItem('buyer_email')
  );
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(() => 
    sessionStorage.getItem('buyer_phone')
  );
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [purchaseMap, setPurchaseMap] = useState<Record<string, string>>({});
  const [showVerifyBar, setShowVerifyBar] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  // Payment modal tracking
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [buyerFirstName, setBuyerFirstName] = useState('');
  const [buyerLastName, setBuyerLastName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState(() => sessionStorage.getItem('buyer_email') || '');
  const [buyerPhone, setBuyerPhone] = useState(() => sessionStorage.getItem('buyer_phone') || '');
  const [selectedProvider, setSelectedProvider] = useState<'wave' | 'orange' | 'mtn' | 'moov'>('wave');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'loading' | 'success'>('details');
  const [paymentStatusMessage, setPaymentStatusMessage] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  const handleShareProfile = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile?.display_name} sur MomoLink Pro`,
          text: `Découvrez les contenus exclusifs de ${profile?.display_name} sur MomoLink Pro.`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Error sharing profile:", err);
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (copyErr) {
        console.error("Clipboard copy failed:", copyErr);
      }
    }
  };

  // Clean the username
  const cleanedUsername = username?.startsWith('@') ? username.slice(1) : username;

  // 1. Fetch Profile & Content
  useEffect(() => {
    const fetchProfileAndContents = async () => {
      if (!cleanedUsername) {
        setError("Nom d'utilisateur vide.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        if (!isDemoMode && supabase) {
          // Supabase Mode
          const { data: profileData, error: profileErr } = await supabase
            .from('creator_profiles')
            .select('*')
            .eq('username', cleanedUsername.toLowerCase())
            .eq('status', 'active')
            .maybeSingle();

          if (profileErr) throw profileErr;

          if (!profileData) {
            setProfile(null);
            setLoading(false);
            return;
          }

          setProfile(profileData as CreatorProfile);

          // Fetch published contents, sorted DESC by created_at
          const { data: contentsData, error: contentsErr } = await supabase
            .from('contents')
            .select('*')
            .eq('creator_id', profileData.id)
            .eq('status', 'published')
            .order('created_at', { ascending: false });

          if (contentsErr) throw contentsErr;
          setContents(contentsData || []);
        } else {
          // Demo fallback
          let profileData: CreatorProfile | null = null;
          
          if (cleanedUsername.toLowerCase() === 'michella_coaching') {
            profileData = {
              id: 'creator_1',
              user_id: 'user_1',
              username: 'michella_coaching',
              display_name: 'Michella Coaching',
              bio: 'Experte en croissance organique et stratégies de contenu.',
              avatar_url: null,
              social_links: { tiktok: '@michella_coaching', instagram: '@michella_coaching' },
              payout_phone_number: '+22890123456',
              payout_provider: 'wave',
              status: 'active',
              created_at: new Date().toISOString(),
            };
          } else {
            const cachedProfileStr = localStorage.getItem('momo_creator_profile');
            if (cachedProfileStr) {
              const prof = JSON.parse(cachedProfileStr) as CreatorProfile;
              if (prof.username.toLowerCase() === cleanedUsername.toLowerCase() && prof.status === 'active') {
                profileData = prof;
              }
            }
          }

          if (!profileData) {
            setProfile(null);
            setLoading(false);
            return;
          }

          setProfile(profileData);

          // Get local contents
          const localContentsStr = localStorage.getItem('momo_local_contents');
          let allContents: Content[] = [];
          if (localContentsStr) {
            allContents = JSON.parse(localContentsStr) as Content[];
          }

          let creatorContents = allContents.filter(
            c => c.creator_id === profileData!.id && c.status === 'published'
          );

          // Default seeding for Michella Coaching if no contents exist
          if (profileData.id === 'creator_1' && creatorContents.length === 0) {
            const defaultSeeded: Content[] = [
              {
                id: '1',
                creator_id: 'creator_1',
                title: 'Pack PDF : Booster son audience TikTok en 30 jours',
                description: "Ma méthode exacte, mes scripts prêts à l'emploi et mon calendrier éditorial pour passer de 0 à 10 000 abonnés rapidement.",
                price_fcfa: 2500,
                thumbnail_url: null,
                file_url: 'https://example.com/secured/guide-tiktok.pdf',
                content_type: 'pdf',
                status: 'published',
                is_published: true,
                created_at: new Date().toISOString(),
              },
              {
                id: '2',
                creator_id: 'creator_1',
                title: 'Template Notion : Organiser ses tournages Reels & TikTok',
                description: "Le template complet que j'utilise au quotidien pour planifier mes tournages, rédiger mes accroches et suivre mes métriques.",
                price_fcfa: 1500,
                thumbnail_url: null,
                file_url: 'https://example.com/secured/notion-template.zip',
                content_type: 'pdf',
                status: 'published',
                is_published: true,
                created_at: new Date().toISOString(),
              },
              {
                id: '3',
                creator_id: 'creator_1',
                title: 'Masterclass : Décryptage de l\'Algorithme 2026 (Vidéo 20m)',
                description: "Une vidéo exclusive de 20 minutes où je vous montre les coulisses de l'algorithme actuel, et comment maximiser le taux de rétention.",
                price_fcfa: 5000,
                thumbnail_url: null,
                file_url: 'https://example.com/secured/masterclass-algo.mp4',
                content_type: 'video',
                status: 'published',
                is_published: true,
                created_at: new Date().toISOString(),
              }
            ];
            // Seed
            localStorage.setItem('momo_local_contents', JSON.stringify([...allContents, ...defaultSeeded]));
            creatorContents = defaultSeeded;
          }

          // Sort DESC
          creatorContents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setContents(creatorContents);
        }
      } catch (err: any) {
        console.error('Error fetching creator profile:', err);
        setError("Une erreur s'est produite lors de la connexion.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndContents();
  }, [cleanedUsername, isDemoMode]);

  // 2. SEO head metatags
  useEffect(() => {
    if (profile) {
      document.title = `${profile.display_name} — contenus exclusifs`;
      
      // Update or create meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', profile.bio || `Découvrez les guides, vidéos et PDF de ${profile.display_name}.`);
    }
  }, [profile]);

  // 3. Check Purchases whenever verifiedEmail is set
  const checkPurchasesForEmail = async (email: string) => {
    if (!email || !profile?.id) return;
    try {
      const res = await fetch(`/api/portal/creator-purchases?email=${encodeURIComponent(email)}&creatorId=${encodeURIComponent(profile.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.purchasedContentIds) {
          setPurchasedIds(data.purchasedContentIds);
        }
        if (data.purchaseMap) {
          setPurchaseMap(data.purchaseMap);
        }
      }
    } catch (e) {
      console.error('Error fetching purchases for email:', e);
    }
  };

  useEffect(() => {
    if (verifiedEmail && profile?.id) {
      checkPurchasesForEmail(verifiedEmail);
    } else {
      setPurchasedIds([]);
      setPurchaseMap({});
    }
  }, [verifiedEmail, profile]);

  // Handle buyer manual verification
  const handleVerifyEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerEmailInput.trim()) return;
    
    setVerifyingEmail(true);
    const email = buyerEmailInput.trim();
    
    try {
      const res = await fetch(`/api/portal/verify?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          sessionStorage.setItem('buyer_email', email);
          setVerifiedEmail(email);
          if (profile?.id) {
            await checkPurchasesForEmail(email);
          }
          setShowVerifyBar(false);
        } else {
          alert("Aucun achat trouvé pour cet email.");
        }
      } else {
        alert("Une erreur s'est produite lors de la vérification.");
      }
    } catch (err) {
      console.error("Verification failed:", err);
    } finally {
      setVerifyingEmail(false);
    }
  };

  // Log out/Disconnect buyer profile
  const handleDisconnectBuyer = () => {
    sessionStorage.removeItem('buyer_email');
    sessionStorage.removeItem('buyer_phone');
    setVerifiedEmail(null);
    setVerifiedPhone(null);
    setPurchasedIds([]);
    setPurchaseMap({});
    setBuyerEmailInput('');
  };

  // Open pay modal or redirect immediately if purchased
  const handleUnlockClick = (content: Content) => {
    if (purchasedIds.includes(content.id)) {
      const pId = purchaseMap[content.id] || '';
      navigate(`/content/${content.id}${pId ? `?purchaseId=${pId}` : ''}`);
      return;
    }
    setSelectedContent(content);
    setBuyerEmail(verifiedEmail || '');
    setPaymentStep('details');
    setPaymentStatusMessage(null);
    setPaymentError(null);
    setIsPaymentModalOpen(true);
  };

  // Submit Payment with Maketou Creation
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerEmail.trim() || !buyerFirstName.trim() || !buyerLastName.trim() || !selectedContent) return;

    setPaymentStep('loading');
    setPaymentStatusMessage("Initialisation du paiement...");
    setIsPaying(true);
    setPaymentError(null);

    try {
      const res = await fetch('/api/payment/create-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId: selectedContent.id,
          buyerEmail: buyerEmail.trim(),
          buyerFirstName: buyerFirstName.trim(),
          buyerLastName: buyerLastName.trim(),
          buyerPhone: buyerPhone.trim() || undefined
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la transaction.');
      }

      const data = await res.json();
      
      // Save buyer info to session storage
      sessionStorage.setItem('buyer_email', buyerEmail.trim());
      if (buyerPhone.trim()) {
        sessionStorage.setItem('buyer_phone', buyerPhone.trim());
      }

      setPaymentStatusMessage("Redirection vers le paiement...");
      
      // Redirect to Maketou Checkout or simulated confirm page
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('Redirection URL non fournie par le serveur.');
      }

    } catch (err: any) {
      console.error('Payment submit error:', err);
      setPaymentError(err.message || 'Une erreur est survenue.');
      setPaymentStep('details');
    } finally {
      setIsPaying(false);
    }
  };

  // Helper to render placeholder icon according to content type
  const renderContentTypeIcon = (type: 'video' | 'image' | 'pdf' | 'audio') => {
    switch (type) {
      case 'video':
        return (
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        );
      case 'image':
        return (
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        );
      case 'audio':
        return (
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        );
      default: // pdf or other file
        return (
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        );
    }
  };

  // Safe inline SVG Social icons matching instructions strictly (no external packages)
  const renderSocialIcon = (platform: 'tiktok' | 'instagram' | 'snapchat' | 'whatsapp') => {
    switch (platform) {
      case 'tiktok':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" stroke="none">
            <path d="M12 2a1 1 0 0 0-1 1v11.69A3.33 3.33 0 0 1 8.33 18 3.34 3.34 0 0 1 5 14.67a3.34 3.34 0 0 1 3.33-3.34c.43 0 .84.09 1.22.25a1 1 0 1 0 .76-1.85 5.3 5.3 0 0 0-1.98-.4A5.34 5.34 0 0 0 3 14.67a5.34 5.34 0 0 0 5.33 5.33A5.34 5.34 0 0 0 13.67 15V9.45A7.01 7.01 0 0 0 18 11.5a1 1 0 1 0 0-2 5 5 0 0 1-5-5V3a1 1 0 0 0-1-1z" />
          </svg>
        );
      case 'instagram':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        );
      case 'snapchat':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a6.45 6.45 0 0 1 6.09 4.84c.15.54.34 1.15.61 1.7A1.5 1.5 0 0 0 20 9.5a1 1 0 0 0 .5-.13 1 1 0 0 1 1 .11 1 1 0 0 1 .4.82c0 .54-.2 1-.58 1.41a3 3 0 0 1-.77.56 1 1 0 0 0-.55.9c0 .72-.37 1.43-.88 2a5 5 0 0 1-3.6 1.83 5 5 0 0 1-3.6-1.83c-.51-.57-.88-1.28-.88-2a1 1 0 0 0-.55-.9 3 3 0 0 1-.77-.56A1.89 1.89 0 0 1 1 11.3a1 1 0 0 1 1-.82 1 1 0 0 0 .5-.13 1.5 1.5 0 0 0 1.3-.96c.27-.55.46-1.16.61-1.7A6.45 6.45 0 0 1 12 2z" />
          </svg>
        );
      case 'whatsapp':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        );
    }
  };

  // Loader state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-accent-corail h-10 w-10" />
        <span className="text-xs text-gray-500 font-mono">Chargement de la page créateur...</span>
      </div>
    );
  }

  // 404 Personalized missing profile screen
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md bg-white border border-gray-200 rounded-[24px] p-8 shadow-xl flex flex-col items-center gap-5"
        >
          <div className="w-16 h-16 rounded-full bg-accent-corail/10 text-accent-corail flex items-center justify-center">
            <Lock size={28} />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-2xl font-bold text-neutral-900">Créateur Introuvable</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Ce créateur n'existe pas ou n'est plus actif.
            </p>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="mt-2 px-6 py-2.5 rounded-full bg-accent-corail text-white text-xs font-semibold hover:bg-accent-corail-hover transition-colors cursor-pointer"
          >
            Retourner à l'accueil
          </button>
        </motion.div>
      </div>
    );
  }

  // Generate initials for profile placeholder
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1815] flex flex-col pb-16 relative">
      
      {/* Top Banner & Buyer verification bar */}
      <div className="border-b border-gray-200 bg-white/70 backdrop-blur px-4 py-3 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm tracking-tight text-neutral-900">
              MomoLink <span className="text-accent-corail text-xs font-semibold">Pro</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {verifiedEmail ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/portal/purchases"
                  className="text-xs font-bold text-accent-corail hover:underline"
                >
                  Mes achats
                </Link>
                <button
                  onClick={handleDisconnectBuyer}
                  className="text-[10px] text-gray-500 hover:text-red-500 font-semibold cursor-pointer py-1 px-2.5 rounded-full border border-gray-200 hover:border-red-100 bg-white"
                >
                  Se déconnecter
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/portal"
                  className="text-xs font-semibold text-gray-500 hover:text-neutral-900 transition-colors"
                >
                  Retrouvez vos contenus
                </Link>
                {showVerifyBar ? (
                  <form onSubmit={handleVerifyEmailSubmit} className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
                    <input
                      type="email"
                      value={buyerEmailInput}
                      onChange={(e) => setBuyerEmailInput(e.target.value)}
                      placeholder="Votre email d'achat"
                      className="bg-transparent px-2 py-0.5 text-[10px] focus:outline-none text-[#1A1815] w-28 placeholder:text-gray-400"
                      required
                    />
                    <button
                      type="submit"
                      disabled={verifyingEmail}
                      className="bg-accent-corail hover:bg-accent-corail-hover text-white text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer disabled:opacity-50"
                    >
                      {verifyingEmail ? '...' : 'Vérifier'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowVerifyBar(false)}
                      className="text-gray-400 hover:text-neutral-900 p-0.5"
                    >
                      <X size={10} />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowVerifyBar(true)}
                    className="text-[10px] border border-gray-200 hover:border-accent-corail/50 px-2.5 py-1 rounded-full font-bold text-gray-500 hover:text-neutral-900 transition-all cursor-pointer"
                  >
                    Vérifier
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Buyer Session Banner (Étape 10b) */}
      {verifiedEmail && (
        <div className="w-full bg-[#FFFBEB] border-b border-[#FDE68A] py-2 px-4 z-30 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[11px] font-medium text-[#78350F] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span>Session acheteur active : <strong className="font-mono">{verifiedEmail}</strong></span>
          </p>
          <Link
            to="/portal/purchases"
            className="text-[11px] font-bold text-accent-corail hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Accéder à tous mes achats</span>
            <ExternalLink size={11} />
          </Link>
        </div>
      )}

      {/* Cover Photo Banner */}
      <div className="relative w-full h-40 md:h-52 bg-gray-100 overflow-hidden border-b border-gray-200">
        {profile.cover_url ? (
          <img 
            src={profile.cover_url} 
            alt="Couverture" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-accent-corail/15 via-accent-corail/5 to-yellow-500/15" />
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 w-full -mt-16 md:-mt-20 flex flex-col gap-8 relative z-10">
        
        {/* Profile Header section (Centered) */}
        <div className="flex flex-col items-center text-center gap-4">
          
          {/* Avatar or Initials in corail circle */}
          <div className="relative">
            {profile.avatar_url ? (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-accent-corail bg-white">
                <img 
                  src={profile.avatar_url} 
                  alt={profile.display_name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-accent-corail flex items-center justify-center border-2 border-accent-corail text-white shadow-lg">
                <span className="font-display text-2xl md:text-3xl font-bold tracking-tight">
                  {getInitials(profile.display_name)}
                </span>
              </div>
            )}
            
            {/* Verification badge */}
            <span className="absolute bottom-0 right-0 bg-[#F2B84B] text-black rounded-full p-1 border-2 border-[#FAFAF8] shadow">
              <Sparkles size={12} />
            </span>
          </div>

          {/* Profile Name & Bio */}
          <div className="flex flex-col gap-2 max-w-md">
            <h1 className="font-display text-[22px] font-bold text-neutral-900 leading-tight">
              {profile.display_name}
            </h1>
            <span className="text-xs text-accent-corail font-mono font-semibold">@{profile.username}</span>
            {profile.bio && (
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Share profile button */}
          <button
            onClick={handleShareProfile}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-gray-200 hover:border-accent-corail text-xs font-semibold text-gray-700 hover:text-accent-corail transition-all cursor-pointer shadow-sm active:scale-95"
          >
            {copied ? (
              <>
                <Check size={14} className="text-green-500" strokeWidth={3} />
                <span className="text-green-600 font-bold">Lien copié !</span>
              </>
            ) : (
              <>
                <Share2 size={14} />
                <span>Partager le profil</span>
              </>
            )}
          </button>

          {/* Social Links line */}
          {profile.social_links && Object.keys(profile.social_links).length > 0 && (
            <div className="flex items-center justify-center gap-3.5 mt-1.5">
              {Object.entries(profile.social_links).map(([platform, value]) => {
                if (!value) return null;
                const valueStr = value as string;
                // Simple link generation
                let url = '#';
                if (platform === 'tiktok') {
                  const cleaned = valueStr.replace('@', '');
                  url = `https://www.tiktok.com/@${cleaned}`;
                } else if (platform === 'instagram') {
                  const cleaned = valueStr.replace('@', '');
                  url = `https://instagram.com/${cleaned}`;
                } else if (platform === 'snapchat') {
                  url = `https://www.snapchat.com/add/${valueStr}`;
                } else if (platform === 'whatsapp') {
                  // Standard whatsapp link
                  url = `https://wa.me/${valueStr.replace(/[^0-9]/g, '')}`;
                }

                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-accent-corail hover:border-accent-corail/30 transition-all cursor-pointer"
                    title={platform}
                  >
                    {renderSocialIcon(platform as any)}
                  </a>
                );
              })}
            </div>
          )}

          {/* Contents Counter Badge */}
          <div className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-[11px] font-medium text-gray-500 mt-2">
            <strong className="text-accent-corail font-semibold">{contents.length}</strong> {contents.length > 1 ? 'contenus exclusifs' : 'contenu exclusif'}
          </div>

        </div>

        {/* Content Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Contents Grid section */}
        <div className="flex flex-col gap-6">
          <h2 className="font-display text-lg font-bold text-neutral-900 tracking-tight">
            Contenus exclusifs
          </h2>

          {contents.length === 0 ? (
            <div className="p-16 rounded-[24px] bg-white border border-gray-200 text-center flex flex-col items-center justify-center gap-3">
              <Lock className="text-gray-400 h-10 w-10" />
              <span className="text-sm font-semibold text-neutral-900">Aucun contenu publié</span>
              <span className="text-xs text-gray-500">Ce créateur n'a pas encore de contenus en ligne.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               {contents.map((content) => {
                 const isAlreadyBought = purchasedIds.includes(content.id);
                 return (
                   <div
                     key={content.id}
                     className="bg-white border border-gray-200 rounded-[20px] p-4 flex flex-col justify-between gap-3 relative overflow-hidden group shadow-md"
                   >
                     
                     {/* Preview / Cover with Locked Overlay (Real content is never visible unless unlocked) */}
                     <div 
                       onClick={() => isAlreadyBought ? handleUnlockClick(content) : undefined}
                       className={`relative aspect-video w-full rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden ${isAlreadyBought ? 'cursor-pointer group' : ''}`}
                     >
                       {content.preview_url ? (
                         <img
                           src={content.preview_url}
                           alt={content.title}
                           referrerPolicy="no-referrer"
                           className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                         />
                       ) : (
                         <div className="text-gray-400">
                           {renderContentTypeIcon(content.content_type)}
                         </div>
                       )}
 
                       {/* Only show locked overlay if NOT bought (fond #14120F at 60% + padlock) */}
                       {!isAlreadyBought && (
                         <div className="absolute inset-0 bg-[#14120F]/60 flex items-center justify-center z-10 transition-colors group-hover:bg-[#14120F]/50">
                           <div className="p-2.5 bg-[#14120F]/80 rounded-full border border-gray-700 text-gray-400 group-hover:text-accent-corail transition-colors">
                             <Lock size={15} />
                           </div>
                         </div>
                       )}
                     </div>
 
                     {/* Meta Info */}
                     <div className="flex flex-col gap-1 min-w-0 flex-1">
                       <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-gray-400">
                         {content.content_type}
                       </span>
                       <h4 className="text-xs font-bold text-neutral-900 line-clamp-2 leading-snug">
                         {content.title}
                       </h4>
                     </div>
 
                     {/* Bottom Actions bar */}
                     <div className="pt-2 border-t border-gray-200 flex flex-col gap-2">
                       <div className="flex items-center justify-between">
                         <span className="text-[10px] uppercase text-gray-400 font-semibold">Tarif</span>
                         <span className="text-xs font-bold text-accent-corail font-mono">
                           {content.price_fcfa.toLocaleString('fr-FR')} FCFA
                         </span>
                       </div>
 
                       {isAlreadyBought ? (
                         <button
                           type="button"
                           onClick={() => handleUnlockClick(content)}
                           className="w-full py-2.5 rounded-xl text-[11px] font-bold text-white bg-[#F2B84B] hover:bg-[#E0A83A] transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-[#F2B84B]/10 active:scale-[0.98]"
                         >
                           <span>▶ Voir le contenu</span>
                         </button>
                       ) : (
                         <button
                           type="button"
                           onClick={() => handleUnlockClick(content)}
                           className="w-full py-2.5 rounded-xl text-[11px] font-bold text-white bg-accent-corail hover:bg-accent-corail-hover transition-colors flex items-center justify-center gap-1 cursor-pointer"
                         >
                           <span>Débloquer</span>
                         </button>
                       )}
                     </div>
 
                   </div>
                 );
               })}
             </div>
          )}
        </div>

      </div>

      {/* Payment Sheet & Download Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && selectedContent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            
            {/* Bottom Sheet style on Mobile, Centered Modal style on Desktop */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md w-full p-6 bg-white border-t md:border border-gray-200 rounded-t-[20px] md:rounded-[20px] shadow-2xl flex flex-col gap-5 z-50 text-left"
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            >
              {/* Close button top right */}
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-neutral-900 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* Checks if already purchased */}
              {purchasedIds.includes(selectedContent.id) ? (
                // SUCCESS / DOWNLOAD ACCESS PANEL
                <div className="py-2 flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest">
                      Contenu Débloqué
                    </span>
                    <h3 className="font-display text-lg font-medium text-neutral-900">Télécharger votre contenu</h3>
                    <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 mt-2 flex items-start gap-3">
                      <div className="p-2 bg-yellow-500/10 text-yellow-600 rounded-lg shrink-0">
                        <Check size={16} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-neutral-900 line-clamp-1">{selectedContent.title}</h4>
                        <span className="text-xs text-gray-500 mt-1 block">
                          Vous possédez déjà ce contenu.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Direct real-file access link per requirements */}
                  <button
                    onClick={() => {
                      setIsPaymentModalOpen(false);
                      navigate(`/content/${selectedContent.id}`);
                    }}
                    className="w-full py-3 rounded-xl text-xs font-bold text-black bg-yellow-500 hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Accéder au contenu</span>
                  </button>

                  <p className="text-[10px] text-gray-500 text-center">
                    Réf transaction stockée localement pour {verifiedEmail || 'votre email'}.
                  </p>
                </div>
              ) : (
                // MAIN PAYMENT SHEET FLOW
                <div className="flex flex-col gap-4">
                  {paymentStep === 'details' && (
                    <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-5">
                      
                      {/* Title & Product Info */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-accent-corail uppercase tracking-widest">
                          Achat Sécurisé par Mobile Money
                        </span>
                        <h3 className="font-display text-lg font-medium text-neutral-900">Débloquer le contenu</h3>
                        
                        <div className="p-3 rounded-xl border border-gray-200 mt-2 bg-gray-50 flex items-start gap-3">
                          <div className="p-2 bg-accent-corail/10 text-accent-corail rounded-lg shrink-0">
                            <Lock size={16} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-xs text-neutral-900 line-clamp-1">{selectedContent.title}</h4>
                            <span className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{selectedContent.description}</span>
                          </div>
                        </div>
                      </div>

                      {/* BIG BRICOLAGE PRICE DISPLAY */}
                      <div className="text-center py-2">
                        <span className="text-[10px] uppercase text-gray-500 tracking-widest font-bold">Montant à régler</span>
                        <div className="font-display text-3xl font-bold text-accent-corail mt-1">
                          {selectedContent.price_fcfa.toLocaleString('fr-FR')} FCFA
                        </div>
                      </div>

                      {/* First & Last Name fields */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 pl-0.5">Prénom</label>
                          <input
                            type="text"
                            value={buyerFirstName}
                            onChange={(e) => setBuyerFirstName(e.target.value)}
                            placeholder="John"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:border-accent-corail focus:ring-1 focus:ring-accent-corail transition-all text-neutral-900"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 pl-0.5">Nom d'usage</label>
                          <input
                            type="text"
                            value={buyerLastName}
                            onChange={(e) => setBuyerLastName(e.target.value)}
                            placeholder="Doe"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:border-accent-corail focus:ring-1 focus:ring-accent-corail transition-all text-neutral-900"
                            required
                          />
                        </div>
                      </div>

                      {/* Email field */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 pl-0.5">Adresse email</label>
                        <input
                          type="email"
                          value={buyerEmail}
                          onChange={(e) => setBuyerEmail(e.target.value)}
                          placeholder="buyer@email.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:border-accent-corail focus:ring-1 focus:ring-accent-corail transition-all text-neutral-900"
                          required
                        />
                        <span className="text-[9px] text-gray-500 pl-0.5 leading-none">
                          Obligatoire — servira d'identifiant pour accéder au contenu ultérieurement.
                        </span>
                      </div>

                      {/* Phone number field (Optional) */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 pl-0.5">Téléphone (facultatif)</label>
                        <div className="relative">
                          <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                          <input
                            type="tel"
                            value={buyerPhone}
                            onChange={(e) => setBuyerPhone(e.target.value)}
                            placeholder="+221 77 123 45 67"
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:border-accent-corail focus:ring-1 focus:ring-accent-corail transition-all font-mono text-neutral-900"
                          />
                        </div>
                      </div>

                      {/* Error Panel */}
                      {paymentError && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 flex items-start gap-2 text-xs">
                          <AlertCircle size={14} className="shrink-0 mt-0.5" />
                          <span>{paymentError}</span>
                        </div>
                      )}

                      {/* Pay Button */}
                      <button
                        type="submit"
                        disabled={isPaying || !buyerEmail.trim() || !buyerFirstName.trim() || !buyerLastName.trim()}
                        className="w-full py-3.5 rounded-xl text-xs font-semibold text-white bg-accent-corail hover:bg-accent-corail-hover transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPaying ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Lancement...</span>
                          </>
                        ) : (
                          <>
                            <span>Payer {selectedContent.price_fcfa.toLocaleString('fr-FR')} FCFA</span>
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>

                    </form>
                  )}

                  {/* LOADING SIMULATOR & INTEGRATION BANNER */}
                  {paymentStep === 'loading' && (
                    <div className="py-10 flex flex-col items-center justify-center gap-5 text-center">
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <span className="absolute inset-0 rounded-full border-4 border-accent-corail/20 animate-ping" />
                        <Loader2 className="animate-spin text-accent-corail h-10 w-10" />
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <h4 className="font-semibold text-sm text-neutral-900">Traitement en cours...</h4>
                        {paymentStatusMessage && (
                          <div className="mt-1 px-4 py-2 rounded-lg bg-accent-corail/10 text-accent-corail border border-accent-corail/20 text-xs font-medium inline-block animate-pulse">
                            {paymentStatusMessage}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1 max-w-[260px] mx-auto leading-relaxed">
                          Validation fictive via l'opérateur <strong className="uppercase">{selectedProvider}</strong> en cours.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* SUCCESS FLOW PANEL */}
                  {paymentStep === 'success' && (
                    <div className="py-4 flex flex-col items-center gap-5 text-center">
                      <div className="p-4 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
                        <Check size={32} />
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <h4 className="font-display text-lg font-bold text-neutral-900">Félicitations !</h4>
                        <p className="text-xs text-gray-500 max-w-[300px] leading-relaxed">
                          Le paiement de <strong>{selectedContent.price_fcfa.toLocaleString('fr-FR')} FCFA</strong> a été validé avec succès par Mobile Money.
                        </p>
                      </div>

                      {/* Direct access to download link */}
                      <a
                        href={selectedContent.file_url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-accent-corail hover:bg-accent-corail-hover transition-all flex items-center justify-center gap-2 shadow"
                      >
                        <Download size={14} />
                        <span>Télécharger le contenu</span>
                      </a>

                      <button
                        onClick={() => setIsPaymentModalOpen(false)}
                        className="text-xs text-gray-500 hover:text-neutral-900 font-medium mt-1 cursor-pointer"
                      >
                        Fermer la fenêtre
                      </button>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

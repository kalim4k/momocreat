/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Loader2, 
  AlertCircle, 
  FileText, 
  Video, 
  Image as ImageIcon, 
  Music, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface Creator {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

interface PurchaseItem {
  purchaseId: string;
  contentId: string;
  title: string;
  content_type: 'video' | 'image' | 'pdf' | 'audio';
  preview_url: string | null;
  price_fcfa: number;
  purchased_at: string;
}

interface CreatorGroup {
  creator: Creator;
  purchases: PurchaseItem[];
}

export default function BuyerPurchases() {
  const navigate = useNavigate();
  const [buyerEmail, setBuyerEmail] = useState<string | null>(null);
  const [groups, setGroups] = useState<CreatorGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const email = sessionStorage.getItem('buyer_email');
    if (!email) {
      navigate('/portal');
      return;
    }
    setBuyerEmail(email);
    fetchPurchases(email);
  }, [navigate]);

  const fetchPurchases = async (email: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/portal/purchases?email=${encodeURIComponent(email)}`);
      if (!res.ok) {
        throw new Error('Impossible de charger vos achats.');
      }
      const data = await res.json();
      setGroups(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('buyer_email');
    navigate('/portal');
  };

  const maskEmail = (email: string) => {
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 2) {
      return `${name}***@${domain}`;
    }
    return `${name.slice(0, 2)}***@${domain}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return 'récemment';
    }
  };

  const renderContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video size={20} className="text-accent-corail" />;
      case 'image':
        return <ImageIcon size={20} className="text-accent-corail" />;
      case 'audio':
        return <Music size={20} className="text-accent-corail" />;
      default:
        return <FileText size={20} className="text-accent-corail" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Vidéo';
      case 'image': return 'Image';
      case 'audio': return 'Audio';
      default: return 'PDF';
    }
  };

  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-accent-corail h-10 w-10" />
        <span className="text-xs text-gray-500 font-mono">Chargement de vos achats...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1815] pb-16 font-sans">
      
      {/* Header Bar */}
      <header className="border-b border-gray-200 bg-white/70 backdrop-blur sticky top-0 z-40 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-base tracking-tight text-neutral-900">
              MomoLink <span className="text-accent-corail text-xs font-semibold">Pro</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {buyerEmail && (
              <span className="text-xs text-gray-500 font-medium hidden sm:inline">
                Abonné : <span className="text-[#1A1815] font-semibold font-mono">{maskEmail(buyerEmail)}</span>
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors py-1.5 px-3 rounded-full border border-gray-200 hover:border-red-200 bg-white cursor-pointer active:scale-95"
              id="btn-portal-logout"
            >
              <LogOut size={13} />
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 mt-8">
        
        {/* Title area */}
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-900">
            Mes achats
          </h1>
          {buyerEmail && (
            <p className="text-xs text-gray-500">
              Contenus débloqués pour l'adresse <span className="font-mono text-neutral-800 font-semibold">{maskEmail(buyerEmail)}</span>
            </p>
          )}
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Empty state */}
        {groups.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-[24px] p-12 text-center flex flex-col items-center justify-center gap-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <FileText size={28} />
            </div>
            <div className="flex flex-col gap-1 max-w-sm">
              <h3 className="font-semibold text-neutral-900 text-base">Aucun achat trouvé</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Il n'y a aucun contenu exclusif débloqué associé à cet e-mail.
              </p>
            </div>
            <button
              onClick={() => navigate('/portal')}
              className="mt-2 px-6 py-2.5 bg-accent-corail hover:bg-accent-corail-hover text-white text-xs font-semibold rounded-full transition-all duration-200 shadow-sm cursor-pointer"
            >
              Retour à la vérification
            </button>
          </div>
        ) : (
          /* List of purchases grouped by creator */
          <div className="flex flex-col gap-10">
            {groups.map((group) => (
              <div 
                key={group.creator.id} 
                className="bg-white border border-gray-200 rounded-[24px] p-6 shadow-sm flex flex-col gap-6"
                id={`creator-group-${group.creator.username}`}
              >
                {/* Creator header */}
                <div className="flex items-center justify-between gap-4 flex-wrap border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    {group.creator.avatar_url ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 shrink-0">
                        <img 
                          src={group.creator.avatar_url} 
                          alt={group.creator.display_name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-accent-corail text-white flex items-center justify-center font-display font-bold text-base shrink-0">
                        {getInitials(group.creator.display_name)}
                      </div>
                    )}

                    <div className="flex flex-col">
                      <h3 className="font-semibold text-neutral-900 text-sm leading-tight">
                        {group.creator.display_name}
                      </h3>
                      <span className="text-[11px] text-accent-corail font-mono font-medium">
                        @{group.creator.username}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-medium bg-gray-50 border border-gray-100 text-gray-500 px-3 py-1.5 rounded-full">
                      {group.purchases.length} {group.purchases.length > 1 ? 'contenus achetés' : 'contenu acheté'}
                    </span>

                    <button
                      onClick={() => navigate(`/@${group.creator.username}`)}
                      className="flex items-center gap-1 text-[11px] font-bold text-neutral-800 hover:text-accent-corail transition-colors py-1.5 px-3 rounded-full hover:bg-gray-50 border border-gray-100 shrink-0 cursor-pointer"
                    >
                      <span>Voir le profil</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>

                {/* Grid of purchased contents */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {group.purchases.map((purchase) => (
                    <div 
                      key={purchase.purchaseId}
                      className="border border-gray-100 rounded-[18px] p-4 bg-[#FAFAF8] hover:bg-white hover:border-accent-corail/30 transition-all duration-300 flex flex-col justify-between gap-3 relative group"
                    >
                      {/* Thumbnail or Type icon overlay */}
                      <div className="relative aspect-video w-full rounded-xl bg-gray-200/50 flex items-center justify-center overflow-hidden border border-gray-100">
                        {purchase.preview_url ? (
                          <img 
                            src={purchase.preview_url} 
                            alt={purchase.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                            {renderContentTypeIcon(purchase.content_type)}
                          </div>
                        )}

                        {/* Content type tag (Top left) */}
                        <span className="absolute top-2.5 left-2.5 text-[9px] uppercase font-bold font-mono tracking-wider bg-white/95 text-neutral-800 border border-gray-100 px-2 py-0.5 rounded-md">
                          {getContentTypeLabel(purchase.content_type)}
                        </span>
                      </div>

                      {/* Info and action */}
                      <div className="flex flex-col gap-1 min-w-0">
                        <h4 className="text-xs font-bold text-neutral-900 leading-snug line-clamp-2">
                          {purchase.title}
                        </h4>
                        
                        <div className="flex items-center justify-between gap-2 mt-1.5">
                          <span className="text-[10px] text-gray-400 font-medium">
                            Acheté le {formatDate(purchase.purchased_at)}
                          </span>
                          <span className="text-[10px] font-bold text-neutral-500 font-mono bg-gray-200/40 px-1.5 py-0.5 rounded">
                            {purchase.price_fcfa.toLocaleString('fr-FR')} FCFA
                          </span>
                        </div>
                      </div>

                      {/* Direct action button to access real-file viewer */}
                      <button
                        onClick={() => navigate(`/content/${purchase.contentId}?purchaseId=${purchase.purchaseId}`)}
                        className="w-full py-2 bg-accent-corail hover:bg-accent-corail-hover text-white text-[11px] font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1 shadow-sm group-hover:shadow-md cursor-pointer mt-1"
                      >
                        <span>▶ Voir le contenu</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

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
  ChevronRight,
  Sun,
  Moon,
  Search,
  Filter
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
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
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [invoiceCreator, setInvoiceCreator] = useState<any | null>(null);

  const { isDarkMode, setIsDarkMode, styles: themeStyles } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const getFilteredGroups = () => {
    return groups.map(group => {
      const filteredPurchases = group.purchases.filter(p => {
        const matchesSearch = !searchTerm || p.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'all' || p.content_type === selectedType;
        return matchesSearch && matchesType;
      });
      return {
        ...group,
        purchases: filteredPurchases
      };
    }).filter(group => group.purchases.length > 0);
  };

  const filteredGroups = getFilteredGroups();

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
      <div className={`min-h-screen ${themeStyles.bg} flex flex-col items-center justify-center gap-3`}>
        <Loader2 className="animate-spin text-accent-corail h-10 w-10" />
        <span className={`text-xs ${themeStyles.textSecondary} font-mono`}>Chargement de vos achats...</span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeStyles.bg} ${themeStyles.textPrimary} pb-16 font-sans transition-colors duration-200`}>
      
      {/* Header Bar */}
      <header className={`border-b ${themeStyles.border} ${themeStyles.surface} backdrop-blur sticky top-0 z-40 px-4 py-4 bg-opacity-80`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img 
              src="https://valqykbgglvvxmkqrenx.supabase.co/storage/v1/object/public/avatars/file_00000000588081f9b9f6b6484a7be967.png"
              alt="MomoLink Logo"
              className="h-6 w-6 object-contain rounded-md"
            />
            <span className={`font-display font-bold text-base tracking-tight ${themeStyles.textPrimary}`}>
              MomoLink <span className="text-accent-corail text-xs font-semibold">Pro</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {buyerEmail && (
              <span className={`text-xs ${themeStyles.textSecondary} font-medium hidden sm:inline`}>
                Abonné : <span className={`${themeStyles.textPrimary} font-semibold font-mono`}>{maskEmail(buyerEmail)}</span>
              </span>
            )}
            
            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full border ${themeStyles.border} ${themeStyles.hoverBg} transition-all ${themeStyles.textSecondary} cursor-pointer`}
              title={isDarkMode ? "Activer le mode clair" : "Activer le mode sombre"}
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            <button
              onClick={handleLogout}
              className={`flex items-center gap-1 text-xs font-semibold ${themeStyles.textSecondary} hover:text-red-500 transition-colors py-1.5 px-3 rounded-full border ${themeStyles.border} hover:border-red-200 ${themeStyles.surface} cursor-pointer active:scale-95`}
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
          <h1 className={`font-display text-3xl font-bold tracking-tight ${themeStyles.textPrimary}`}>
            Mes achats
          </h1>
          {buyerEmail && (
            <p className={`text-xs ${themeStyles.textSecondary}`}>
              Contenus débloqués pour l'adresse <span className={`font-mono ${themeStyles.textPrimary} font-semibold`}>{maskEmail(buyerEmail)}</span>
            </p>
          )}
        </div>

        {/* Filters Bar */}
        {groups.length > 0 && (
          <div className={`${themeStyles.surface} border ${themeStyles.border} p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-3 mb-6`}>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un achat par titre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-xl border ${themeStyles.border} text-xs focus:outline-none focus:border-accent-corail transition-colors bg-black/5 dark:bg-neutral-800 ${themeStyles.textPrimary} placeholder:text-gray-400`}
              />
            </div>

            <div className="w-full sm:w-48 relative">
              <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className={`w-full pl-9 pr-8 py-2 rounded-xl border ${themeStyles.border} text-xs focus:outline-none focus:border-accent-corail transition-colors bg-transparent appearance-none cursor-pointer ${themeStyles.textPrimary}`}
              >
                <option value="all" className="bg-white dark:bg-neutral-900">Tous les formats</option>
                <option value="pdf" className="bg-white dark:bg-neutral-900">Fichiers PDF</option>
                <option value="video" className="bg-white dark:bg-neutral-900">Vidéos</option>
                <option value="image" className="bg-white dark:bg-neutral-900">Images</option>
                <option value="audio" className="bg-white dark:bg-neutral-900">Audios</option>
              </select>
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Empty state & Results */}
        {groups.length === 0 ? (
          <div className={`${themeStyles.surface} border ${themeStyles.border} rounded-[24px] p-12 text-center flex flex-col items-center justify-center gap-4 shadow-sm`}>
            <div className={`w-16 h-16 rounded-full ${themeStyles.badgeBg} flex items-center justify-center ${themeStyles.textSecondary}`}>
              <FileText size={28} />
            </div>
            <div className="flex flex-col gap-1 max-w-sm">
              <h3 className={`font-semibold ${themeStyles.textPrimary} text-base`}>Aucun achat trouvé</h3>
              <p className={`text-xs ${themeStyles.textSecondary} leading-relaxed`}>
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
        ) : filteredGroups.length === 0 ? (
          <div className={`${themeStyles.surface} border ${themeStyles.border} rounded-[24px] p-12 text-center flex flex-col items-center justify-center gap-4 shadow-sm`}>
            <div className={`w-16 h-16 rounded-full ${themeStyles.badgeBg} flex items-center justify-center ${themeStyles.textSecondary}`}>
              <Search size={28} />
            </div>
            <div className="flex flex-col gap-1 max-w-sm">
              <h3 className={`font-semibold ${themeStyles.textPrimary} text-base`}>Aucun résultat</h3>
              <p className={`text-xs ${themeStyles.textSecondary} leading-relaxed`}>
                Aucun de vos achats ne correspond à vos filtres de recherche.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
              }}
              className={`mt-2 px-5 py-2 border ${themeStyles.border} ${themeStyles.textPrimary} text-xs font-semibold rounded-full ${themeStyles.hoverBg} transition-all cursor-pointer`}
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          /* List of purchases grouped by creator */
          <div className="flex flex-col gap-10">
            {filteredGroups.map((group) => (
              <div 
                key={group.creator.id} 
                className={`${themeStyles.surface} border ${themeStyles.border} rounded-[24px] p-6 shadow-sm flex flex-col gap-6`}
                id={`creator-group-${group.creator.username}`}
              >
                {/* Creator header */}
                <div className={`flex items-center justify-between gap-4 flex-wrap border-b ${themeStyles.border} pb-4`}>
                  <div className="flex items-center gap-3">
                    {group.creator.avatar_url ? (
                      <div className={`w-12 h-12 rounded-full overflow-hidden border ${themeStyles.border} shrink-0`}>
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
                      <h3 className={`font-semibold ${themeStyles.textPrimary} text-sm leading-tight`}>
                        {group.creator.display_name}
                      </h3>
                      <span className="text-[11px] text-accent-corail font-mono font-medium">
                        @{group.creator.username}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-medium ${themeStyles.badgeBg} border ${themeStyles.border} ${themeStyles.textSecondary} px-3 py-1.5 rounded-full`}>
                      {group.purchases.length} {group.purchases.length > 1 ? 'contenus achetés' : 'contenu acheté'}
                    </span>

                    <button
                      onClick={() => navigate(`/@${group.creator.username}`)}
                      className={`flex items-center gap-1 text-[11px] font-bold ${themeStyles.textPrimary} hover:text-accent-corail transition-colors py-1.5 px-3 rounded-full ${themeStyles.hoverBg} border ${themeStyles.border} shrink-0 cursor-pointer`}
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
                      className={`border ${themeStyles.border} rounded-[18px] p-4 bg-bg-primary hover:bg-bg-surface hover:border-accent-corail/30 transition-all duration-300 flex flex-col justify-between gap-3 relative group`}
                    >
                      {/* Thumbnail or Type icon overlay */}
                      <div className={`relative aspect-video w-full rounded-xl bg-neutral-200/50 dark:bg-neutral-800/50 flex items-center justify-center overflow-hidden border ${themeStyles.border}`}>
                        {purchase.preview_url ? (
                          <img 
                            src={purchase.preview_url} 
                            alt={purchase.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-full ${themeStyles.surface} flex items-center justify-center shadow-sm`}>
                            {renderContentTypeIcon(purchase.content_type)}
                          </div>
                        )}

                        {/* Content type tag (Top left) */}
                        <span className={`absolute top-2.5 left-2.5 text-[9px] uppercase font-bold font-mono tracking-wider bg-bg-surface/95 ${themeStyles.textPrimary} border ${themeStyles.border} px-2 py-0.5 rounded-md`}>
                          {getContentTypeLabel(purchase.content_type)}
                        </span>
                      </div>

                      {/* Info and action */}
                      <div className="flex flex-col gap-1 min-w-0">
                        <h4 className={`text-xs font-bold ${themeStyles.textPrimary} leading-snug line-clamp-2`}>
                          {purchase.title}
                        </h4>
                        
                        <div className="flex items-center justify-between gap-2 mt-1.5">
                          <span className={`text-[10px] ${themeStyles.textSecondary} font-medium`}>
                            Acheté le {formatDate(purchase.purchased_at)}
                          </span>
                          <span className={`text-[10px] font-bold ${themeStyles.textSecondary} font-mono ${themeStyles.badgeBg} px-1.5 py-0.5 rounded`}>
                            {purchase.price_fcfa.toLocaleString('fr-FR')} FCFA
                          </span>
                        </div>
                      </div>

                      {/* Direct action button to access real-file viewer + receipt */}
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => navigate(`/content/${purchase.contentId}?purchaseId=${purchase.purchaseId}`)}
                          className="flex-1 py-2.5 bg-accent-corail hover:bg-accent-corail-hover text-white text-[11px] font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1 shadow-sm group-hover:shadow-md cursor-pointer"
                        >
                          <span>▶ Voir</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedInvoice(purchase);
                            setInvoiceCreator(group.creator);
                          }}
                          className={`py-2.5 px-3 border ${themeStyles.border} hover:border-accent-corail/30 text-text-secondary hover:text-accent-corail text-[11px] font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer ${themeStyles.surface}`}
                          title="Facture / Reçu de paiement"
                          id={`btn-invoice-${purchase.purchaseId}`}
                        >
                          <span>📄 Reçu</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Receipt / Invoice Modal */}
      {selectedInvoice && invoiceCreator && (
        <div className="fixed inset-0 bg-black/80 dark:bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className={`${themeStyles.surface} rounded-[24px] max-w-[480px] w-full border ${themeStyles.border} shadow-2xl p-6 md:p-8 relative`} id="print-receipt-modal">
            {/* Print Stylesheet Hook */}
            <style>{`
              @media print {
                body {
                  background: white !important;
                  color: black !important;
                }
                .no-print {
                  display: none !important;
                }
                #print-receipt-modal {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  max-width: 100% !important;
                  box-shadow: none !important;
                  border: none !important;
                  padding: 10px !important;
                  margin: 0 !important;
                  background: white !important;
                  color: black !important;
                }
                #print-receipt-modal * {
                  color: black !important;
                  border-color: #ddd !important;
                  background-color: transparent !important;
                }
                #print-receipt-modal .bg-emerald-50,
                #print-receipt-modal .bg-emerald-500\\/10 {
                  background-color: #e6f4ea !important;
                  color: #137333 !important;
                }
              }
            `}</style>

            {/* Header info */}
            <div className={`flex justify-between items-start mb-6 border-b border-dashed ${themeStyles.border} pb-5`}>
              <div>
                <span className={`font-display font-bold text-lg tracking-tight ${themeStyles.textPrimary}`}>
                  MomoLink <span className="text-accent-corail text-xs font-semibold">Pro</span>
                </span>
                <p className={`text-[10px] ${themeStyles.textSecondary} mt-1 uppercase tracking-widest font-mono`}>Facture d'achat officiel</p>
              </div>
              <button 
                onClick={() => {
                  setSelectedInvoice(null);
                  setInvoiceCreator(null);
                }}
                className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 ${themeStyles.textSecondary} hover:text-text-primary transition-colors no-print cursor-pointer`}
                id="btn-close-invoice"
              >
                <span className="text-xs font-bold">✕</span>
              </button>
            </div>

            {/* Receipt Content */}
            <div className={`space-y-5 text-xs ${themeStyles.textPrimary}`}>
              <div className="flex justify-between items-center bg-bg-primary p-3.5 rounded-xl border border-border-custom">
                <span className="font-semibold">Référence de paiement :</span>
                <span className={`font-mono font-bold ${themeStyles.textPrimary} bg-bg-surface border ${themeStyles.border} px-2 py-0.5 rounded shadow-sm`}>
                  {selectedInvoice.purchaseId?.slice(0, 18).toUpperCase() || 'MOMO-LINK-TX'}
                </span>
              </div>

              <div className={`grid grid-cols-2 gap-y-3 border-b ${themeStyles.border} pb-4`}>
                <span className={themeStyles.textSecondary}>Date d'achat :</span>
                <span className={`text-right font-medium ${themeStyles.textPrimary}`}>{formatDate(selectedInvoice.purchased_at)}</span>
                
                <span className={themeStyles.textSecondary}>Vendeur / Créateur :</span>
                <span className="text-right font-bold text-accent-corail">{invoiceCreator.display_name} (@{invoiceCreator.username})</span>

                <span className={themeStyles.textSecondary}>Client (Email) :</span>
                <span className={`text-right font-mono font-medium ${themeStyles.textPrimary}`}>{buyerEmail}</span>
              </div>

              {/* Purchase details table style */}
              <div>
                <span className={`text-[10px] font-bold ${themeStyles.textSecondary} uppercase tracking-widest block mb-2 font-mono`}>Détails de l'article</span>
                <div className={`border ${themeStyles.border} rounded-xl p-3 bg-bg-primary flex items-center justify-between gap-4`}>
                  <div className="min-w-0">
                    <span className={`font-bold ${themeStyles.textPrimary} block truncate`}>{selectedInvoice.title}</span>
                    <span className={`text-[10px] ${themeStyles.textSecondary} uppercase tracking-wider font-mono`}>{getContentTypeLabel(selectedInvoice.content_type)} numérique</span>
                  </div>
                  <span className={`font-bold ${themeStyles.textPrimary} font-mono shrink-0`}>
                    {selectedInvoice.price_fcfa.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              {/* Total calculations */}
              <div className={`pt-3 border-t border-dashed ${themeStyles.border} flex justify-between items-center`}>
                <span className={`font-display font-extrabold ${themeStyles.textPrimary} text-sm`}>Montant Total Payé :</span>
                <span className="font-display font-black text-green-600 dark:text-green-400 text-lg font-mono">
                  {selectedInvoice.price_fcfa.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              
              <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-lg text-[10px] flex items-center gap-1.5 border border-emerald-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Paiement traité avec succès via Wave/Mobile Money de manière sécurisée.</span>
              </div>
            </div>

            {/* Print action buttons */}
            <div className="mt-8 flex gap-3 no-print">
              <button
                onClick={() => {
                  setSelectedInvoice(null);
                  setInvoiceCreator(null);
                }}
                className={`flex-1 py-2.5 border ${themeStyles.border} hover:bg-black/5 dark:hover:bg-white/5 ${themeStyles.textSecondary} hover:text-text-primary text-xs font-bold rounded-xl transition-all cursor-pointer text-center`}
              >
                Fermer
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer text-center flex items-center justify-center gap-1.5"
                id="btn-trigger-print"
              >
                <span>🖨️ Imprimer / PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

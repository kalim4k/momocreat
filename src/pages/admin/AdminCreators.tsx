import React, { useState, useEffect } from 'react';
import { 
  Search, 
  UserX, 
  UserCheck, 
  Eye, 
  X, 
  Loader2, 
  Coins, 
  ExternalLink,
  Calendar,
  Wallet,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface Creator {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  cover_url: string;
  payout_phone_number: string;
  payout_provider: string;
  status: 'active' | 'inactive';
  is_premium: boolean;
  premium_expires_at: string | null;
  created_at: string;
  email: string;
  contentCount: number;
  revenueGenerated: number;
  subscriptionStatus: 'none' | 'active' | 'grace' | 'expired';
  subscriptionExpiry: string | null;
}

interface CreatorDetails {
  creator: Creator;
  balance: number;
  recentPurchases: Array<{
    id: string;
    createdAt: string;
    buyerEmail: string;
    amountPaid: number;
    status: string;
    contentTitle: string;
  }>;
  withdrawals: Array<{
    id: string;
    amount_requested: number;
    payout_provider: string;
    payout_phone_number: string;
    status: 'pending' | 'paid' | 'rejected';
    requested_at: string;
    processed_at?: string;
    notes?: string;
  }>;
  subscriptions: Array<{
    id: string;
    amount_paid: number;
    start_date: string;
    end_date: string;
    status: string;
    created_at: string;
  }>;
}

export default function AdminCreators() {
  const { user } = useAuth();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drawer state
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [creatorDetails, setCreatorDetails] = useState<CreatorDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchCreators();
  }, [user]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCreators();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const getHeaders = async () => {
    let token = '';
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      token = session?.access_token || '';
    }
    if (!token && user) {
      token = user.email || '';
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Admin-Email': user?.email || ''
    };
  };

  const fetchCreators = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/creators?search=${encodeURIComponent(search)}`, { headers });
      if (!res.ok) throw new Error('Erreur lors de la récupération des créateurs.');
      const data = await res.json();
      setCreators(data);
    } catch (err: any) {
      console.error(err);
      setError('Impossible de charger les créateurs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (creatorId: string) => {
    try {
      setIsTogglingStatus(creatorId);
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/creators/${creatorId}/toggle-status`, { 
        method: 'POST',
        headers 
      });
      if (!res.ok) throw new Error('Erreur de statut.');
      const result = await res.json();

      setCreators(prev => prev.map(c => c.id === creatorId ? { ...c, status: result.status } : c));
      
      // If currently displaying in details drawer, refresh details
      if (selectedCreatorId === creatorId && creatorDetails) {
        setCreatorDetails({
          ...creatorDetails,
          creator: {
            ...creatorDetails.creator,
            status: result.status
          }
        });
      }
    } catch (err) {
      console.error(err);
      alert('Erreur lors du changement de statut.');
    } finally {
      setIsTogglingStatus(null);
    }
  };

  const handleViewDetails = async (creatorId: string) => {
    try {
      setSelectedCreatorId(creatorId);
      setIsLoadingDetails(true);
      setCreatorDetails(null);
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/creators/${creatorId}/details`, { headers });
      if (!res.ok) throw new Error('Erreur de détails.');
      const data = await res.json();
      setCreatorDetails(data);
    } catch (err) {
      console.error(err);
      setSelectedCreatorId(null);
      alert('Impossible de charger les détails du créateur.');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const getSubStatusBadge = (status: Creator['subscriptionStatus']) => {
    switch (status) {
      case 'active':
        return <span className="bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] text-[10px] font-semibold px-2 py-0.5 rounded-full">Actif</span>;
      case 'grace':
        return <span className="bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2] text-[10px] font-semibold px-2 py-0.5 rounded-full">En grâce</span>;
      case 'expired':
        return <span className="bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] text-[10px] font-semibold px-2 py-0.5 rounded-full">Expiré</span>;
      default:
        return <span className="bg-bg-primary text-text-secondary border border-border-custom text-[10px] font-semibold px-2 py-0.5 rounded-full">Jamais</span>;
    }
  };

  return (
    <div className="space-y-6" id="admin-creators-container">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">Créateurs</h1>
          <p className="text-text-secondary text-sm mt-1">Gérer les comptes créateurs, modérer leur statut, et consulter leurs ventes.</p>
        </div>
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-text-secondary" />
          <input
            type="text"
            placeholder="Rechercher nom, username, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-surface border border-border-custom rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder-text-secondary/65 focus:outline-none focus:border-accent-corail transition-all"
            id="creators-search-input"
          />
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-bg-surface border border-border-custom rounded-xl overflow-hidden shadow-sm">
        {isLoading && creators.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-accent-corail animate-spin" />
            <p className="text-text-secondary text-xs">Recherche des créateurs...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500 text-sm">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-primary border-b border-border-custom">
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Créateur</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Contact</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Premium</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider text-center">Contenus</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider text-right">Revenus cumulés</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider text-center">Compte</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {creators.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-text-secondary text-sm">
                      Aucun créateur trouvé.
                    </td>
                  </tr>
                ) : (
                  creators.map((creator) => (
                    <tr key={creator.id} className="hover:bg-bg-surface-hover/30 transition-colors">
                      {/* Avatar / Username */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent-corail/15 flex-shrink-0 overflow-hidden border border-border-custom">
                            {creator.avatar_url ? (
                              <img 
                                src={creator.avatar_url} 
                                alt={creator.username} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-accent-corail text-sm">
                                {creator.display_name ? creator.display_name[0].toUpperCase() : creator.username[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary leading-tight">{creator.display_name || 'Sans Nom'}</p>
                            <p className="text-xs text-text-secondary">@{creator.username}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-text-primary font-mono leading-normal">{creator.email}</p>
                        <p className="text-xs text-text-secondary leading-normal">Inscrit le {new Date(creator.created_at).toLocaleDateString('fr-FR')}</p>
                      </td>

                      {/* Subscription Status */}
                      <td className="px-5 py-3.5">
                        <div className="space-y-1">
                          {getSubStatusBadge(creator.subscriptionStatus)}
                          {creator.subscriptionExpiry && (
                            <p className="text-[10px] text-text-secondary">
                              Exp: {new Date(creator.subscriptionExpiry).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Published count */}
                      <td className="px-5 py-3.5 text-center text-sm font-semibold text-text-primary">
                        {creator.contentCount}
                      </td>

                      {/* Cumulative revenue */}
                      <td className="px-5 py-3.5 text-right text-sm font-bold text-accent-corail">
                        {creator.revenueGenerated.toLocaleString()} FCFA
                      </td>

                      {/* Account status */}
                      <td className="px-5 py-3.5 text-center">
                        {creator.status === 'active' ? (
                          <span className="bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] text-[10px] font-semibold px-2 py-0.5 rounded">Actif</span>
                        ) : (
                          <span className="bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] text-[10px] font-semibold px-2 py-0.5 rounded">Suspendu</span>
                        )}
                      </td>

                      {/* Quick action buttons */}
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleViewDetails(creator.id)}
                          className="bg-bg-primary/60 text-text-secondary hover:text-text-primary border border-border-custom hover:bg-bg-surface-hover p-2 rounded-lg transition-all"
                          title="Consulter les détails"
                          id={`btn-view-${creator.id}`}
                        >
                          <Eye size={15} />
                        </button>
                        
                        <button
                          onClick={() => handleToggleStatus(creator.id)}
                          disabled={isTogglingStatus === creator.id}
                          className={`
                            p-2 rounded-lg border transition-all
                            ${creator.status === 'active'
                              ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700'
                            }
                          `}
                          title={creator.status === 'active' ? 'Suspendre le créateur' : 'Réactiver le créateur'}
                          id={`btn-toggle-${creator.id}`}
                        >
                          {isTogglingStatus === creator.id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : creator.status === 'active' ? (
                            <UserX size={15} />
                          ) : (
                            <UserCheck size={15} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-out details drawer */}
      {selectedCreatorId && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedCreatorId(null)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Inner Panel */}
          <div className="relative w-full max-w-[480px] bg-bg-surface h-full shadow-2xl flex flex-col z-10 border-l border-border-custom animate-slide-in text-text-primary">
            {/* Header */}
            <div className="p-5 border-b border-border-custom flex items-center justify-between bg-bg-primary">
              <h3 className="font-bold text-text-primary text-base">Fiche créateur</h3>
              <button 
                onClick={() => setSelectedCreatorId(null)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {isLoadingDetails ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 text-accent-corail animate-spin" />
                <p className="text-text-secondary text-xs">Chargement de la fiche...</p>
              </div>
            ) : creatorDetails ? (
              <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-bg-surface">
                {/* Profile Summary Card */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-bg-primary/40 border border-border-custom">
                  <div className="w-14 h-14 rounded-full bg-accent-corail/15 border border-border-custom flex-shrink-0 overflow-hidden">
                    {creatorDetails.creator.avatar_url ? (
                      <img 
                        src={creatorDetails.creator.avatar_url} 
                        alt={creatorDetails.creator.username} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-accent-corail text-xl">
                        {creatorDetails.creator.display_name ? creatorDetails.creator.display_name[0].toUpperCase() : creatorDetails.creator.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-text-primary truncate leading-none">{creatorDetails.creator.display_name || 'Sans Nom'}</h4>
                      {creatorDetails.creator.status === 'inactive' && (
                        <span className="bg-red-100 text-red-600 text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase border border-red-200">Suspendu</span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary leading-none">@{creatorDetails.creator.username}</p>
                    <p className="text-xs text-text-secondary pt-1 line-clamp-2 leading-relaxed italic">{creatorDetails.creator.bio || 'Aucune biographie.'}</p>
                  </div>
                </div>

                {/* Account Balances Block */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-bg-primary/40 border border-border-custom">
                    <span className="text-[10px] text-text-secondary font-semibold tracking-wide uppercase flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-accent-corail" />
                      Solde disponible
                    </span>
                    <p className="text-lg font-bold text-accent-corail mt-1 font-mono">{creatorDetails.balance.toLocaleString()} FCFA</p>
                    <span className="text-[9px] text-text-secondary">Retirable en temps réel</span>
                  </div>

                  <div className="p-4 rounded-xl bg-bg-primary/40 border border-border-custom">
                    <span className="text-[10px] text-text-secondary font-semibold tracking-wide uppercase flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                      Revenus générés
                    </span>
                    <p className="text-lg font-bold text-emerald-600 mt-1 font-mono">{creatorDetails.creator.revenueGenerated.toLocaleString()} FCFA</p>
                    <span className="text-[9px] text-text-secondary">Total cumulé ventes</span>
                  </div>
                </div>

                {/* Mobile Money Details */}
                <div className="p-4 rounded-xl bg-bg-primary/40 border border-border-custom space-y-2">
                  <h5 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Mode de retrait configuré</h5>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Opérateur :</span>
                    <span className="font-semibold text-text-primary uppercase">{creatorDetails.creator.payout_provider || 'Non configuré'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Téléphone de paiement :</span>
                    <span className="font-semibold text-text-primary font-mono">{creatorDetails.creator.payout_phone_number || 'Non configuré'}</span>
                  </div>
                </div>

                {/* Recent Purchases */}
                <div className="space-y-3">
                  <h5 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-accent-corail" />
                    Dernières ventes ({creatorDetails.recentPurchases.length})
                  </h5>
                  <div className="space-y-2">
                    {creatorDetails.recentPurchases.length === 0 ? (
                      <p className="text-xs text-text-secondary italic text-center py-4 bg-bg-primary/30 rounded-lg border border-border-custom">Aucune vente enregistrée.</p>
                    ) : (
                      creatorDetails.recentPurchases.map((purchase) => (
                        <div key={purchase.id} className="p-3 bg-bg-primary/30 rounded-lg border border-border-custom flex justify-between gap-3 text-xs">
                          <div className="overflow-hidden space-y-1">
                            <p className="font-semibold text-text-primary truncate" title={purchase.contentTitle}>{purchase.contentTitle}</p>
                            <p className="text-[10px] text-text-secondary">Acheteur: {purchase.buyerEmail}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-accent-corail">{purchase.amountPaid.toLocaleString()} FCFA</p>
                            <p className="text-[9px] text-text-secondary">{new Date(purchase.createdAt).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Withdrawals List */}
                <div className="space-y-3">
                  <h5 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-accent-corail" />
                    Historique des retraits ({creatorDetails.withdrawals.length})
                  </h5>
                  <div className="space-y-2">
                    {creatorDetails.withdrawals.length === 0 ? (
                      <p className="text-xs text-text-secondary italic text-center py-4 bg-bg-primary/30 rounded-lg border border-border-custom">Aucune demande de retrait.</p>
                    ) : (
                      creatorDetails.withdrawals.map((w) => (
                        <div key={w.id} className="p-3 bg-bg-primary/30 rounded-lg border border-border-custom flex items-center justify-between text-xs">
                          <div>
                            <p className="font-semibold text-text-primary font-mono">{w.amount_requested.toLocaleString()} FCFA</p>
                            <p className="text-[9px] text-text-secondary">Demandé le {new Date(w.requested_at).toLocaleDateString('fr-FR')}</p>
                            {w.notes && <p className="text-[10px] text-red-500 italic mt-0.5">Motif: {w.notes}</p>}
                          </div>
                          <div>
                            {w.status === 'paid' ? (
                              <span className="bg-[#E8F5E9] text-[#2E7D32] text-[9px] font-semibold px-2 py-0.5 rounded-full border border-[#C8E6C9]">Payé</span>
                            ) : w.status === 'pending' ? (
                              <span className="bg-[#FFF3E0] text-[#E65100] text-[9px] font-semibold px-2 py-0.5 rounded-full border border-[#FFE0B2]">En attente</span>
                            ) : (
                              <span className="bg-[#FFEBEE] text-[#C62828] text-[9px] font-semibold px-2 py-0.5 rounded-full border border-[#FFCDD2]">Rejeté</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Subscriptions List */}
                <div className="space-y-3">
                  <h5 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-accent-corail" />
                    Abonnements Premium ({creatorDetails.subscriptions.length})
                  </h5>
                  <div className="space-y-2">
                    {creatorDetails.subscriptions.length === 0 ? (
                      <p className="text-xs text-text-secondary italic text-center py-4 bg-bg-primary/30 rounded-lg border border-border-custom">Aucun abonnement enregistré.</p>
                    ) : (
                      creatorDetails.subscriptions.map((s) => (
                        <div key={s.id} className="p-3 bg-bg-primary/30 rounded-lg border border-border-custom flex items-center justify-between text-xs">
                          <div>
                            <p className="font-semibold text-text-primary font-mono">{s.amount_paid.toLocaleString()} FCFA</p>
                            <p className="text-[9px] text-text-secondary">Du {new Date(s.start_date).toLocaleDateString('fr-FR')} au {new Date(s.end_date).toLocaleDateString('fr-FR')}</p>
                          </div>
                          <div>
                            <span className="bg-[#E8F5E9] text-[#2E7D32] text-[9px] font-semibold px-2 py-0.5 rounded-full border border-[#C8E6C9]">Complété</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-text-secondary text-sm bg-bg-surface">Fiche indisponible.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

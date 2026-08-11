import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Loader2,
  Filter,
  Search,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Coins,
  Crown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/admin/Toast';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';

interface CreatorSubscription {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string;
  status: 'none' | 'active' | 'grace' | 'expired';
  expiryDate: string | null;
  daysRemaining: number;
  amountPaid: number;
  is_test_account?: boolean;
}

export default function AdminSubscriptions() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [subscriptions, setSubscriptions] = useState<CreatorSubscription[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grantingId, setGrantingId] = useState<string | null>(null);
  const [pendingGrant, setPendingGrant] = useState<{ creatorId: string; days: number } | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, [user, filter]);

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

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/subscriptions?filter=${filter}`, { headers });
      if (!res.ok) throw new Error('Erreur lors du chargement des abonnements.');
      const data = await res.json();
      setSubscriptions(data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger la liste des abonnements premium.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrantPremium = (creatorId: string, days: number) => {
    setPendingGrant({ creatorId, days });
  };

  const confirmGrantPremium = async () => {
    if (!pendingGrant) return;
    const { creatorId, days } = pendingGrant;
    setGrantingId(creatorId);
    try {
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/creators/${creatorId}/grant-premium`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ days })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de l\'attribution du premium.');
      }
      await fetchSubscriptions();
      showToast(`${days} jours de premium accordés avec succès.`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erreur lors de l\'attribution du premium.', 'error');
    } finally {
      setGrantingId(null);
      setPendingGrant(null);
    }
  };

  const getStatusBadge = (status: CreatorSubscription['status']) => {
    switch (status) {
      case 'active':
        return <span className="bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] text-xs font-semibold px-2.5 py-0.5 rounded-full">Premium Actif</span>;
      case 'grace':
        return <span className="bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2] text-xs font-semibold px-2.5 py-0.5 rounded-full">Période de grâce</span>;
      case 'expired':
        return <span className="bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] text-xs font-semibold px-2.5 py-0.5 rounded-full">Abonnement Expiré</span>;
      default:
        return <span className="bg-bg-primary text-text-secondary border border-border-custom text-xs font-semibold px-2.5 py-0.5 rounded-full">Pas d'abonnement</span>;
    }
  };

  // Client search filter
  const filteredSubscriptions = subscriptions.filter(s => {
    if (!search) return true;
    return (s.display_name || '').toLowerCase().includes(search.toLowerCase()) || 
           (s.username || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6" id="admin-subscriptions-container">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">Suivi des Abonnements</h1>
        <p className="text-text-secondary text-sm mt-1">Surveiller le statut premium des créateurs et l'expiration de leurs licences de service.</p>
      </div>

      {/* Filter and Search controls bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'active', label: 'Actifs' },
            { id: 'grace', label: 'En grâce' },
            { id: 'expired', label: 'Expirés' },
            { id: 'expiring_soon', label: 'Expire bientôt (<= 5j)' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`
                px-4 py-2 rounded-lg text-xs font-semibold border transition-all
                ${filter === item.id 
                  ? 'bg-accent-corail/15 border-accent-corail text-accent-corail shadow-sm' 
                  : 'bg-bg-surface border-border-custom text-text-secondary hover:text-text-primary hover:border-gray-400'
                }
              `}
              id={`filter-sub-${item.id}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-text-secondary" />
          <input
            type="text"
            placeholder="Filtrer par créateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-surface border border-border-custom rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-corail transition-all"
            id="sub-search-input"
          />
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-bg-surface border border-border-custom rounded-xl overflow-hidden shadow-sm">
        {isLoading && subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-accent-corail animate-spin" />
            <p className="text-text-secondary text-xs font-medium">Chargement des abonnements créateurs...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500 text-sm">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-primary border-b border-border-custom">
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Créateur</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Statut Premium</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Date d'expiration</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider text-center">Jours Restants</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider text-right">Financement Cumulé</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-text-secondary text-sm">
                      Aucun abonnement ne correspond aux critères sélectionnés.
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map((s) => {
                    const days = s.daysRemaining;
                    const isExpiringSoon = s.status === 'active' && days <= 5 && days >= 0;
                    const isGrace = s.status === 'grace';

                    return (
                      <tr key={s.id} className="hover:bg-bg-surface-hover/30 transition-colors">
                        {/* Name / Avatar */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-accent-corail/10 flex items-center justify-center font-bold text-accent-corail text-xs overflow-hidden">
                              {s.avatar_url ? (
                                <img 
                                  src={s.avatar_url} 
                                  alt={s.username} 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                s.display_name ? s.display_name[0].toUpperCase() : 'C'
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-text-primary leading-tight">{s.display_name || 'Sans Nom'}</p>
                                {s.is_test_account && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/25 text-[9px] font-bold uppercase tracking-wider">
                                    Test
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-text-secondary">@{s.username}</p>
                            </div>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-4">
                          {getStatusBadge(s.status)}
                        </td>

                        {/* Expiry date */}
                        <td className="px-5 py-4 text-sm font-medium text-text-secondary font-mono">
                          {s.expiryDate ? new Date(s.expiryDate).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }) : '-'}
                        </td>

                        {/* Days remaining count */}
                        <td className="px-5 py-4 text-center">
                          {s.expiryDate ? (
                            isGrace ? (
                              <span className="text-amber-600 font-medium text-xs flex items-center justify-center gap-1">
                                <Clock size={12} /> Expiré (En grâce)
                              </span>
                            ) : days < 0 ? (
                              <span className="text-red-600 font-medium text-xs flex items-center justify-center gap-1">
                                <ShieldAlert size={12} /> Échu
                              </span>
                            ) : isExpiringSoon ? (
                              <span className="text-amber-600 font-bold text-xs flex items-center justify-center gap-1 animate-pulse">
                                <AlertTriangle size={12} /> {days} jours restants
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-semibold text-xs font-mono">{days} jours</span>
                            )
                          ) : (
                            <span className="text-text-secondary font-mono text-xs">-</span>
                          )}
                        </td>

                        {/* Cumulative sub fees */}
                        <td className="px-5 py-4 text-right font-bold text-text-primary text-sm font-mono">
                          {s.amountPaid > 0 ? (
                            <span className="text-emerald-600">+{s.amountPaid.toLocaleString()} FCFA</span>
                          ) : (
                            <span className="text-text-secondary">0 FCFA</span>
                          )}
                        </td>

                        {/* Manual grant/extend premium action */}
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleGrantPremium(s.id, 30)}
                            disabled={grantingId === s.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-accent-corail/10 text-accent-corail hover:bg-accent-corail hover:text-white transition-all cursor-pointer disabled:opacity-50"
                            title="Accorder 30 jours de premium"
                          >
                            {grantingId === s.id ? <Loader2 size={12} className="animate-spin" /> : <Crown size={12} />}
                            {s.status === 'active' ? '+30j' : 'Accorder 30j'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingGrant}
        title="Accorder le premium ?"
        message={pendingGrant ? `Accorder ${pendingGrant.days} jours de premium à ce créateur ?` : ''}
        confirmLabel="Accorder"
        isSubmitting={!!grantingId}
        onConfirm={confirmGrantPremium}
        onCancel={() => setPendingGrant(null)}
      />
    </div>
  );
}

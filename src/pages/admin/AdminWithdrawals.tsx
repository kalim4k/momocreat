import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Loader2, 
  Check, 
  X, 
  AlertTriangle,
  FileText,
  User,
  Info,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/admin/Toast';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';

interface CreatorProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  payout_phone_number: string;
  payout_provider: string;
}

interface Withdrawal {
  id: string;
  creator_id: string;
  amount_requested: number;
  payout_provider: string;
  payout_phone_number: string;
  status: 'pending' | 'paid' | 'rejected';
  requested_at: string;
  processed_at?: string;
  notes?: string;
  creator_profiles: CreatorProfile;
  available_balance?: number; // fetched real-time
}

interface PendingConfirm {
  title: string;
  message: string;
  danger?: boolean;
  action: () => Promise<void>;
}

export default function AdminWithdrawals() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Withdrawal[]>([]);
  const [historyWithdrawals, setHistoryWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const [isConfirmSubmitting, setIsConfirmSubmitting] = useState(false);

  // Rejection dialog state
  const [rejectingWithdrawalId, setRejectingWithdrawalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState<string | null>(null);

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroupCollapsed = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Group pending withdrawals by user_id or phone number
  const groupedPendingWithdrawals = React.useMemo(() => {
    const groups: Record<string, {
      userId: string;
      email: string;
      displayName: string;
      avatarUrl: string;
      payoutProvider: string;
      payoutPhoneNumber: string;
      requests: Withdrawal[];
      totalRequested: number;
      totalAvailableBalance: number;
    }> = {};

    pendingWithdrawals.forEach(w => {
      const key = w.creator_profiles?.user_id || w.payout_phone_number;
      if (!groups[key]) {
        groups[key] = {
          userId: w.creator_profiles?.user_id || '',
          email: w.creator_profiles?.username ? `${w.creator_profiles.username}@momo.link` : 'createur@momo.link',
          displayName: w.creator_profiles?.display_name || 'Sans Nom',
          avatarUrl: w.creator_profiles?.avatar_url || '',
          payoutProvider: w.payout_provider,
          payoutPhoneNumber: w.payout_phone_number,
          requests: [],
          totalRequested: 0,
          totalAvailableBalance: 0
        };
      }
      groups[key].requests.push(w);
      groups[key].totalRequested += w.amount_requested;
    });

    // Calculate real unique balances
    Object.values(groups).forEach(g => {
      const seenCreatorIds = new Set<string>();
      g.requests.forEach(w => {
        if (!seenCreatorIds.has(w.creator_id)) {
          seenCreatorIds.add(w.creator_id);
          g.totalAvailableBalance += w.available_balance ?? 0;
        }
      });
    });

    return Object.values(groups).sort((a, b) => b.totalRequested - a.totalRequested);
  }, [pendingWithdrawals]);

  const performPayConsolidatedWithdrawal = async (group: typeof groupedPendingWithdrawals[0]) => {
    try {
      setIsSubmittingAction(`group-${group.userId}`);
      const headers = await getHeaders();

      const payPromises = group.requests.map(w =>
        fetch(`/api/admin/withdrawals/${w.id}/pay`, {
          method: 'POST',
          headers
        }).then(res => {
          if (!res.ok) throw new Error(`Erreur lors du paiement de la demande de ${w.amount_requested} FCFA`);
          return res.json();
        })
      );

      await Promise.all(payPromises);
      await fetchWithdrawals(); // Refresh
      showToast('Paiement consolidé validé avec succès !');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Une erreur est survenue lors du traitement du paiement consolidé.', 'error');
    } finally {
      setIsSubmittingAction(null);
    }
  };

  const handlePayConsolidatedWithdrawal = (group: typeof groupedPendingWithdrawals[0]) => {
    const isOverdrawing = group.totalAvailableBalance < group.totalRequested;
    setPendingConfirm({
      title: isOverdrawing ? 'Forcer le paiement consolidé ?' : 'Confirmer le paiement consolidé',
      message: isOverdrawing
        ? `ATTENTION : le solde disponible consolidé (${group.totalAvailableBalance.toLocaleString()} FCFA) est inférieur au montant total demandé (${group.totalRequested.toLocaleString()} FCFA). Voulez-vous quand même forcer le paiement consolidé ?`
        : `Voulez-vous marquer les ${group.requests.length} demandes de retrait d'un montant total de ${group.totalRequested.toLocaleString()} FCFA comme payées ?`,
      danger: isOverdrawing,
      action: () => performPayConsolidatedWithdrawal(group)
    });
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [user]);

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

  const fetchWithdrawals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const headers = await getHeaders();
      const res = await fetch('/api/admin/withdrawals', { headers });
      if (!res.ok) throw new Error('Erreur de chargement.');
      const data = await res.json();
      setPendingWithdrawals(data.pending || []);
      setHistoryWithdrawals(data.history || []);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les retraits.');
    } finally {
      setIsLoading(false);
    }
  };

  const performPayWithdrawal = async (id: string) => {
    try {
      setIsSubmittingAction(id);
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/withdrawals/${id}/pay`, {
        method: 'POST',
        headers
      });

      if (!res.ok) throw new Error('Erreur de validation.');
      await fetchWithdrawals(); // Refresh
      showToast('Paiement validé avec succès !');
    } catch (err) {
      console.error(err);
      showToast('Une erreur est survenue lors du traitement.', 'error');
    } finally {
      setIsSubmittingAction(null);
    }
  };

  const handlePayWithdrawal = (id: string, requestedAmount: number, availableBalance: number) => {
    const isOverdrawing = availableBalance < requestedAmount;
    setPendingConfirm({
      title: isOverdrawing ? 'Forcer le paiement ?' : 'Confirmer le paiement',
      message: isOverdrawing
        ? `ATTENTION : le solde disponible du créateur (${availableBalance.toLocaleString()} FCFA) est inférieur au montant demandé (${requestedAmount.toLocaleString()} FCFA). Voulez-vous quand même forcer le paiement ?`
        : `Voulez-vous marquer cette demande de retrait de ${requestedAmount.toLocaleString()} FCFA comme payée ?`,
      danger: isOverdrawing,
      action: () => performPayWithdrawal(id)
    });
  };

  const handleConfirmAction = async () => {
    if (!pendingConfirm) return;
    setIsConfirmSubmitting(true);
    try {
      await pendingConfirm.action();
    } finally {
      setIsConfirmSubmitting(false);
      setPendingConfirm(null);
    }
  };

  const handleOpenRejectDialog = (id: string) => {
    setRejectingWithdrawalId(id);
    setRejectionReason('');
  };

  const handleSubmitRejection = async () => {
    if (!rejectionReason.trim()) {
      showToast('La raison du rejet est obligatoire.', 'error');
      return;
    }

    try {
      setIsSubmittingAction(rejectingWithdrawalId);
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/withdrawals/${rejectingWithdrawalId}/reject`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason: rejectionReason.trim() })
      });

      if (!res.ok) throw new Error('Erreur lors du rejet.');
      
      setRejectingWithdrawalId(null);
      setRejectionReason('');
      await fetchWithdrawals(); // Refresh
      showToast('La demande de retrait a été rejetée.');
    } catch (err) {
      console.error(err);
      showToast('Une erreur est survenue.', 'error');
    } finally {
      setIsSubmittingAction(null);
    }
  };

  const getPayoutProviderLogo = (provider: string) => {
    const p = (provider || '').toLowerCase();
    if (p.includes('wave')) return 'https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/a8d55466-5d3f-4390-a52c-5c0183b659f2.png';
    if (p.includes('orange')) return 'https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/7b451d8c-d330-480a-b731-80a611b8d090.png';
    if (p.includes('mtn')) return 'https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/73ceff4e-a60e-46d0-ade3-292133629a7a.jpg';
    if (p.includes('moov')) return 'https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/22d27599-04ae-41da-90da-0037542b9dd4.png';
    return null;
  };

  const getPayoutProviderColor = (provider: string) => {
    const p = (provider || '').toLowerCase();
    if (p.includes('wave')) return 'bg-blue-50 text-blue-600 border-blue-200';
    if (p.includes('orange')) return 'bg-orange-50 text-orange-600 border-orange-200';
    if (p.includes('mtn')) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    if (p.includes('moov')) return 'bg-sky-50 text-sky-700 border-sky-200';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  return (
    <div className="space-y-6" id="admin-withdrawals-container">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">Validation des Retraits</h1>
        <p className="text-text-secondary text-sm mt-1">Traiter les demandes de retraits de fonds des créateurs de manière sécurisée.</p>
      </div>

      {/* Tabs Switch */}
      <div className="flex border-b border-border-custom space-x-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-sm font-semibold relative transition-colors ${activeTab === 'pending' ? 'text-accent-corail' : 'text-text-secondary hover:text-text-primary'}`}
          id="tab-withdrawals-pending"
        >
          En attente ({pendingWithdrawals.length})
          {activeTab === 'pending' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-corail" />}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-semibold relative transition-colors ${activeTab === 'history' ? 'text-accent-corail' : 'text-text-secondary hover:text-text-primary'}`}
          id="tab-withdrawals-history"
        >
          Historique ({historyWithdrawals.length})
          {activeTab === 'history' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-corail" />}
        </button>
      </div>

      {/* Main List view */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-accent-corail animate-spin" />
          <p className="text-text-secondary text-xs font-medium">Chargement des transactions de retraits...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 text-sm">{error}</div>
      ) : activeTab === 'pending' ? (
        // Pending withdrawals
        <div className="space-y-4">
          {pendingWithdrawals.length === 0 ? (
            <div className="bg-bg-surface border border-border-custom rounded-xl p-12 text-center text-text-secondary text-sm shadow-sm">
              <Wallet className="w-10 h-10 mx-auto text-text-secondary/70 mb-3" />
              Aucune demande de retrait en attente.
            </div>
          ) : (
            <div className="bg-bg-surface border border-border-custom rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bg-primary border-b border-border-custom">
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Créateur</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Montant demandé</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Opérateur / Téléphone</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Solde Disponible Réel</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Date de demande</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider text-right">Décision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom">
                    {groupedPendingWithdrawals.map((group) => {
                      const isCollapsed = !!collapsedGroups[group.userId || group.payoutPhoneNumber];
                      const isGroupOverdrawing = group.totalAvailableBalance < group.totalRequested;
                      const groupId = group.userId || group.payoutPhoneNumber;

                      return (
                        <React.Fragment key={groupId}>
                          {/* Owner/Consolidated Row */}
                          <tr className="bg-bg-primary/40 font-medium border-b border-border-custom/60">
                            <td className="px-5 py-3">
                              <button
                                onClick={() => toggleGroupCollapsed(groupId)}
                                className="flex items-center gap-2 text-text-primary hover:text-accent-corail transition-colors font-semibold cursor-pointer"
                              >
                                {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                                <span>{group.displayName}</span>
                                <span className="ml-1 text-[10px] bg-accent-corail/10 text-accent-corail border border-accent-corail/20 px-1.5 py-0.5 rounded-full font-normal">
                                  {group.requests.length} {group.requests.length > 1 ? 'retraits en attente' : 'retrait en attente'}
                                </span>
                              </button>
                            </td>
                            <td className="px-5 py-3 font-bold text-accent-corail text-sm font-mono">
                              {group.totalRequested.toLocaleString()} FCFA
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                {getPayoutProviderLogo(group.payoutProvider) ? (
                                  <img
                                    src={getPayoutProviderLogo(group.payoutProvider)!}
                                    alt={group.payoutProvider}
                                    className="w-5 h-5 rounded-full object-cover border border-border-custom shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPayoutProviderColor(group.payoutProvider)}`}>
                                    {group.payoutProvider}
                                  </span>
                                )}
                                <span className="text-xs font-mono text-text-primary">{group.payoutPhoneNumber}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <span className={`font-mono text-sm font-bold ${isGroupOverdrawing ? 'text-red-600' : 'text-emerald-600'}`}>
                                  {group.totalAvailableBalance.toLocaleString()} FCFA
                                </span>
                                {isGroupOverdrawing && (
                                  <span className="flex items-center gap-1 bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] text-[9px] px-1.5 py-0.5 rounded" title="Le solde consolidé est insuffisant">
                                    <AlertTriangle size={10} /> Insuffisant
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3 text-xs text-text-secondary">
                              Regroupement Mobile Money
                            </td>
                            <td className="px-5 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* Consolidated Pay Button */}
                                <button
                                  onClick={() => handlePayConsolidatedWithdrawal(group)}
                                  disabled={isSubmittingAction !== null}
                                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1"
                                >
                                  {isSubmittingAction === `group-${group.userId}` ? (
                                    <Loader2 size={13} className="animate-spin" />
                                  ) : (
                                    <Check size={13} />
                                  )}
                                  <span>Payer Tout</span>
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Nested requests rows */}
                          {!isCollapsed && group.requests.map((w) => {
                            const balance = w.available_balance ?? 0;
                            const isOverdrawing = balance < w.amount_requested;

                            return (
                              <tr key={w.id} className="bg-bg-surface hover:bg-bg-surface-hover/20 transition-colors">
                                <td className="px-5 py-3.5 pl-10 border-l-2 border-accent-corail/30">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-accent-corail/10 flex items-center justify-center font-bold text-accent-corail text-xs overflow-hidden">
                                      {w.creator_profiles?.avatar_url ? (
                                        <img 
                                          src={w.creator_profiles.avatar_url} 
                                          alt={w.creator_profiles.username} 
                                          className="w-full h-full object-cover"
                                          referrerPolicy="no-referrer"
                                        />
                                      ) : (
                                        w.creator_profiles?.display_name ? w.creator_profiles.display_name[0].toUpperCase() : 'C'
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-text-primary text-xs leading-tight">
                                        Boutique : {w.creator_profiles?.display_name || 'Sans Nom'}
                                      </p>
                                      <p className="text-[10px] text-text-secondary">@{w.creator_profiles?.username}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5 font-bold text-text-primary text-xs font-mono">
                                  {w.amount_requested.toLocaleString()} FCFA
                                </td>
                                <td className="px-5 py-3.5 text-xs text-text-secondary">
                                  Sous-boutique
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-mono text-xs font-bold ${isOverdrawing ? 'text-red-600' : 'text-emerald-600'}`}>
                                      {balance.toLocaleString()} FCFA
                                    </span>
                                    {isOverdrawing && (
                                      <span className="flex items-center gap-1 bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] text-[8px] px-1 py-0.5 rounded">
                                        Insuffisant
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-5 py-3.5 text-[10px] text-text-secondary font-mono">
                                  {new Date(w.requested_at).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center justify-end gap-2">
                                    {/* Mark paid (Individual) */}
                                    <button
                                      onClick={() => handlePayWithdrawal(w.id, w.amount_requested, balance)}
                                      disabled={isSubmittingAction !== null}
                                      className="bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9] border border-[#A5D6A7] font-medium text-[11px] px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1"
                                      id={`btn-pay-${w.id}`}
                                    >
                                      {isSubmittingAction === w.id ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                                      <span>Payer</span>
                                    </button>

                                    {/* Reject (Individual) */}
                                    <button
                                      onClick={() => handleOpenRejectDialog(w.id)}
                                      disabled={isSubmittingAction !== null}
                                      className="bg-[#FFEBEE] text-[#C62828] hover:bg-[#FFCDD2] border border-[#EF9A9A] font-medium text-[11px] px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center justify-center"
                                      id={`btn-reject-${w.id}`}
                                    >
                                      Rejeter
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        // History of processed withdrawals
        <div className="bg-bg-surface border border-border-custom rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-primary border-b border-border-custom">
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Créateur</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Montant</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Opérateur / Téléphone</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Date de demande</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Statut</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Date de traitement</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Motifs / Remarques</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {historyWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-text-secondary text-sm">
                      Aucun historique de retrait.
                    </td>
                  </tr>
                ) : (
                  historyWithdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-bg-surface-hover/10 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent-corail/10 flex items-center justify-center font-bold text-accent-corail text-xs overflow-hidden">
                            {w.creator_profiles?.avatar_url ? (
                              <img 
                                src={w.creator_profiles.avatar_url} 
                                alt={w.creator_profiles.username} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              w.creator_profiles?.display_name ? w.creator_profiles.display_name[0].toUpperCase() : 'C'
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary leading-tight">{w.creator_profiles?.display_name || 'Sans Nom'}</p>
                            <p className="text-xs text-text-secondary">@{w.creator_profiles?.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-bold font-mono text-sm text-text-primary">
                        {w.amount_requested.toLocaleString()} FCFA
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {getPayoutProviderLogo(w.payout_provider) ? (
                            <img
                              src={getPayoutProviderLogo(w.payout_provider)!}
                              alt={w.payout_provider}
                              className="w-5 h-5 rounded-full object-cover border border-border-custom shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPayoutProviderColor(w.payout_provider)}`}>
                              {w.payout_provider}
                            </span>
                          )}
                          <span className="text-xs font-mono text-text-secondary">{w.payout_phone_number}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-text-secondary font-mono">
                        {new Date(w.requested_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        {w.status === 'paid' ? (
                          <span className="bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">Payé</span>
                        ) : w.status === 'rejected' ? (
                          <span className="bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">Rejeté</span>
                        ) : (
                          <span className="bg-bg-primary text-text-secondary border border-border-custom text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase">{w.status}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-text-secondary font-mono">
                        {w.processed_at ? new Date(w.processed_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-text-secondary italic truncate max-w-xs" title={w.notes || ''}>
                        {w.notes || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejection obligatory reason Dialog modal */}
      {rejectingWithdrawalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setRejectingWithdrawalId(null)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <div className="relative bg-bg-surface border border-border-custom rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 z-10 animate-scale-up text-text-primary">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle size={24} />
              <h3 className="font-bold text-lg text-text-primary">Rejeter la demande de retrait</h3>
            </div>
            
            <p className="text-xs text-text-secondary">
              Veuillez spécifier un motif explicite de rejet. Ce motif sera enregistré et envoyé au créateur dans ses notifications de solde.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Raison du rejet *</label>
              <textarea
                placeholder="Ex: Le numéro de téléphone mobile money fourni n'est pas actif pour recevoir des transferts Wave."
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-bg-primary border border-border-custom rounded-lg p-3 text-sm text-text-primary placeholder-text-secondary/60 focus:outline-none focus:border-red-500 transition-all"
                id="reject-reason-textarea"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectingWithdrawalId(null)}
                className="bg-bg-primary text-text-secondary hover:text-text-primary border border-border-custom px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                id="reject-cancel-btn"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitRejection}
                disabled={!rejectionReason.trim() || isSubmittingAction !== null}
                className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                id="reject-confirm-btn"
              >
                {isSubmittingAction ? 'Traitement...' : 'Confirmer le rejet'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingConfirm}
        title={pendingConfirm?.title || ''}
        message={pendingConfirm?.message || ''}
        danger={pendingConfirm?.danger}
        isSubmitting={isConfirmSubmitting}
        confirmLabel={pendingConfirm?.danger ? 'Forcer le paiement' : 'Confirmer'}
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingConfirm(null)}
      />
    </div>
  );
}

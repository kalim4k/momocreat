import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Loader2, 
  Check, 
  X, 
  AlertTriangle,
  FileText,
  User,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

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

export default function AdminWithdrawals() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Withdrawal[]>([]);
  const [historyWithdrawals, setHistoryWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rejection dialog state
  const [rejectingWithdrawalId, setRejectingWithdrawalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState<string | null>(null);

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

  const handlePayWithdrawal = async (id: string, requestedAmount: number, availableBalance: number) => {
    if (availableBalance < requestedAmount) {
      const confirmPay = window.confirm(`ATTENTION: Le solde disponible du créateur (${availableBalance.toLocaleString()} FCFA) est inférieur au montant demandé (${requestedAmount.toLocaleString()} FCFA). Voulez-vous quand même forcer le paiement ?`);
      if (!confirmPay) return;
    } else {
      const confirmPay = window.confirm(`Voulez-vous marquer cette demande de retrait de ${requestedAmount.toLocaleString()} FCFA comme payée ?`);
      if (!confirmPay) return;
    }

    try {
      setIsSubmittingAction(id);
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/withdrawals/${id}/pay`, {
        method: 'POST',
        headers
      });

      if (!res.ok) throw new Error('Erreur de validation.');
      await fetchWithdrawals(); // Refresh
      alert('Paiement validé avec succès !');
    } catch (err) {
      console.error(err);
      alert('Une erreur est survenue lors du traitement.');
    } finally {
      setIsSubmittingAction(null);
    }
  };

  const handleOpenRejectDialog = (id: string) => {
    setRejectingWithdrawalId(id);
    setRejectionReason('');
  };

  const handleSubmitRejection = async () => {
    if (!rejectionReason.trim()) {
      alert('La raison du rejet est obligatoire.');
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
      alert('La demande de retrait a été rejetée.');
    } catch (err) {
      console.error(err);
      alert('Une erreur est survenue.');
    } finally {
      setIsSubmittingAction(null);
    }
  };

  const getPayoutProviderLogo = (provider: string) => {
    const p = (provider || '').toLowerCase();
    if (p.includes('wave')) return 'https://momo.link/wave-logo.png'; // Mock or fallback
    if (p.includes('orange')) return 'https://momo.link/orange-logo.png';
    if (p.includes('mtn')) return 'https://momo.link/mtn-logo.png';
    if (p.includes('moov')) return 'https://momo.link/moov-logo.png';
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
                    {pendingWithdrawals.map((w) => {
                      const balance = w.available_balance ?? 0;
                      const isOverdrawing = balance < w.amount_requested;

                      return (
                        <tr key={w.id} className="hover:bg-bg-surface-hover/20 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-accent-corail/10 flex items-center justify-center font-bold text-accent-corail text-xs overflow-hidden">
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
                          <td className="px-5 py-4 font-bold text-text-primary text-sm font-mono">
                            {w.amount_requested.toLocaleString()} FCFA
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPayoutProviderColor(w.payout_provider)}`}>
                                {w.payout_provider}
                              </span>
                              <span className="text-xs font-mono text-text-primary">{w.payout_phone_number}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`font-mono text-sm font-bold ${isOverdrawing ? 'text-red-600' : 'text-emerald-600'}`}>
                                {balance.toLocaleString()} FCFA
                              </span>
                              {isOverdrawing && (
                                <span className="flex items-center gap-1 bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] text-[9px] px-1.5 py-0.5 rounded" title="Le créateur tente de retirer plus que son solde">
                                  <AlertTriangle size={10} /> Insuffisant
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs text-text-secondary font-mono">
                            {new Date(w.requested_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-5 py-4 text-right space-x-2">
                            {/* Mark paid */}
                            <button
                              onClick={() => handlePayWithdrawal(w.id, w.amount_requested, balance)}
                              disabled={isSubmittingAction !== null}
                              className="bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9] border border-[#A5D6A7] font-medium text-xs px-3 py-1.5 rounded-lg transition-all"
                              id={`btn-pay-${w.id}`}
                            >
                              {isSubmittingAction === w.id ? <Loader2 size={13} className="animate-spin inline mr-1" /> : <Check size={13} className="inline mr-1" />}
                              Marquer comme payé
                            </button>

                            {/* Reject */}
                            <button
                              onClick={() => handleOpenRejectDialog(w.id)}
                              disabled={isSubmittingAction !== null}
                              className="bg-[#FFEBEE] text-[#C62828] hover:bg-[#FFCDD2] border border-[#EF9A9A] font-medium text-xs px-3 py-1.5 rounded-lg transition-all"
                              id={`btn-reject-${w.id}`}
                            >
                              <X size={13} className="inline mr-1" />
                              Rejeter
                            </button>
                          </td>
                        </tr>
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
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPayoutProviderColor(w.payout_provider)}`}>
                            {w.payout_provider}
                          </span>
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
    </div>
  );
}

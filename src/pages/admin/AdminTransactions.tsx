import React, { useState, useEffect } from 'react';
import { 
  History, 
  Loader2, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileSpreadsheet,
  Coins,
  ShoppingBag,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface Transaction {
  id: string;
  date: string;
  type: 'purchase' | 'subscription';
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string;
  buyerEmail: string;
  amount: number;
  commission: number;
  status: 'completed' | 'pending' | 'failed' | 'expired';
  providerTxId: string;
}

export default function AdminTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [user, type, status]);

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

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/transactions?type=${type}&status=${status}&search=${encodeURIComponent(search)}`, { headers });
      if (!res.ok) throw new Error('Erreur de récupération.');
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les transactions historiques.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchTransactions();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  return (
    <div className="space-y-6" id="admin-transactions-container">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">Historique des Transactions</h1>
        <p className="text-text-secondary text-sm mt-1">Consulter l'intégralité des flux financiers, achats de contenus et frais d'abonnements.</p>
      </div>

      {/* Interactive controls block */}
      <div className="bg-bg-surface border border-border-custom rounded-xl p-5 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search bar */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-text-secondary" />
            <input
              type="text"
              placeholder="Rechercher par ID transaction, créateur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-bg-primary border border-border-custom rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder-text-secondary/60 focus:outline-none focus:border-accent-corail transition-all"
              id="tx-search-input"
            />
          </div>

          {/* Type dropdown */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wide">Type de transaction</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-bg-primary border border-border-custom rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-corail transition-all"
              id="tx-type-select"
            >
              <option value="all">Tous les types</option>
              <option value="purchase">Achats de contenus</option>
              <option value="subscription">Abonnements Premium</option>
            </select>
          </div>

          {/* Status dropdown */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wide">Statut du paiement</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-bg-primary border border-border-custom rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-corail transition-all"
              id="tx-status-select"
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Succès (Complété)</option>
              <option value="pending">En attente</option>
              <option value="failed">Échoué</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-bg-surface border border-border-custom rounded-xl overflow-hidden shadow-sm">
        {isLoading && transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-accent-corail animate-spin" />
            <p className="text-text-secondary text-xs font-medium">Chargement des transactions historiques...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500 text-sm">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-primary border-b border-border-custom">
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Date & Heure</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Créateur</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Acheteur / Payeur</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Prix cumulé</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Com. MomoLink</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Statut</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Réf de paiement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-text-secondary text-sm">
                      Aucune transaction trouvée.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const dateText = new Date(tx.date).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <tr key={tx.id} className="hover:bg-bg-surface-hover/30 transition-colors">
                        {/* Date */}
                        <td className="px-5 py-4 text-xs font-mono text-text-secondary">
                          {dateText}
                        </td>

                        {/* Type indicator */}
                        <td className="px-5 py-4">
                          {tx.type === 'purchase' ? (
                            <span className="text-blue-600 font-semibold text-xs flex items-center gap-1">
                              <ShoppingBag size={12} /> Achat
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-semibold text-xs flex items-center gap-1">
                              <Calendar size={12} /> Premium
                            </span>
                          )}
                        </td>

                        {/* Creator */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-accent-corail/15 flex items-center justify-center font-bold text-[10px] text-accent-corail overflow-hidden">
                              {tx.creatorAvatar ? (
                                <img src={tx.creatorAvatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                tx.creatorName[0].toUpperCase()
                              )}
                            </div>
                            <span className="font-medium text-sm text-text-primary">{tx.creatorName}</span>
                          </div>
                        </td>

                        {/* Buyer phone/profile */}
                        <td className="px-5 py-4 text-xs text-text-secondary font-mono">
                          {tx.buyerEmail}
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-4 font-bold text-text-primary text-sm font-mono">
                          {tx.amount.toLocaleString()} FCFA
                        </td>

                        {/* Commission */}
                        <td className="px-5 py-4 text-xs font-semibold">
                          {tx.commission > 0 ? (
                            <span className="text-emerald-600">+{tx.commission.toLocaleString()} FCFA</span>
                          ) : (
                            <span className="text-text-secondary">0 FCFA</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 text-xs">
                          {tx.status === 'completed' || tx.status === 'success' ? (
                            <span className="bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-semibold px-2 py-0.5 rounded-full">Succès</span>
                          ) : tx.status === 'pending' ? (
                            <span className="bg-[#FFF3E0] text-[#E65100] text-[10px] font-semibold px-2 py-0.5 rounded-full">En attente</span>
                          ) : (
                            <span className="bg-[#FFEBEE] text-[#C62828] text-[10px] font-semibold px-2 py-0.5 rounded-full">Échoué</span>
                          )}
                        </td>

                        {/* Transaction ID */}
                        <td className="px-5 py-4 text-xs font-mono text-text-secondary max-w-[120px] truncate" title={tx.providerTxId}>
                          {tx.providerTxId || '-'}
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
    </div>
  );
}

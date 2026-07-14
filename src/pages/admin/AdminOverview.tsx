import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Wallet, 
  Coins, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface KPIs {
  activeCreators: number;
  platformEarnings: number;
  totalVolume: number;
  pendingWithdrawals: number;
}

interface ChartItem {
  date: string;
  revenu: number;
}

interface RecentPurchase {
  id: string;
  createdAt: string;
  creatorName: string;
  contentTitle: string;
  buyerEmail: string;
  amountPaid: number;
  commissionAmount: number;
  status: string;
}

export default function AdminOverview() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<RecentPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let token = '';
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token || '';
      }
      if (!token && user) {
        token = user.email || '';
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Admin-Email': user?.email || ''
      };

      // Fetch KPIs, Chart, and Recent purchases in parallel
      const [kpisRes, chartRes, purchasesRes] = await Promise.all([
        fetch('/api/admin/kpis', { headers }),
        fetch('/api/admin/chart', { headers }),
        fetch('/api/admin/recent-purchases', { headers })
      ]);

      if (!kpisRes.ok || !chartRes.ok || !purchasesRes.ok) {
        throw new Error('Erreur lors du chargement des données administratives.');
      }

      const kpisData = await kpisRes.json();
      const chartData = await chartRes.json();
      const purchasesData = await purchasesRes.json();

      setKpis(kpisData);
      setChartData(chartData);
      setRecentPurchases(purchasesData);

    } catch (err: any) {
      console.error('Error fetching admin dashboard:', err);
      setError(err.message || 'Impossible de charger les données.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-accent-corail animate-spin" />
        <p className="text-gray-400 text-sm">Chargement de la console super-admin...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-6 text-center space-y-4">
        <p className="text-red-400 font-medium">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="bg-accent-corail text-white px-5 py-2 rounded-lg text-sm hover:opacity-90 transition-all font-medium"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Créateurs actifs',
      value: kpis?.activeCreators.toLocaleString() || '0',
      description: 'Profils publiés actifs',
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Commission plateforme',
      value: `${kpis?.platformEarnings.toLocaleString()} FCFA`,
      description: 'Revenus nets générés ce mois',
      icon: Coins,
      color: 'text-accent-corail',
      bg: 'bg-accent-corail/10'
    },
    {
      title: 'Volume de transaction',
      value: `${kpis?.totalVolume.toLocaleString()} FCFA`,
      description: 'Transactions cumulées ce mois',
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Retraits en attente',
      value: kpis?.pendingWithdrawals.toLocaleString() || '0',
      description: 'Demandes à valider',
      icon: Wallet,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in" id="admin-overview-container">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">Vue d'ensemble</h1>
          <p className="text-text-secondary text-sm mt-1">Console de pilotage et indicateurs clés de la plateforme.</p>
        </div>
      </div>

      {kpis?.isDemoMode && (
        <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-4 flex items-start gap-3 text-amber-300 text-sm">
          <svg className="w-5 h-5 flex-shrink-0 text-amber-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-semibold">Mode Démo Actif (Données de simulation)</p>
            <p className="text-xs text-amber-400/80 mt-0.5">La base de données Supabase n'est pas connectée, ou certaines tables ne sont pas créées. L'application utilise des données locales temporaires pour garantir le bon fonctionnement de l'interface.</p>
          </div>
        </div>
      )}

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={i} 
              className="bg-bg-surface border border-border-custom rounded-xl p-5 flex items-center justify-between shadow-sm"
              id={`kpi-card-${i}`}
            >
              <div className="space-y-1.5">
                <span className="text-xs text-text-secondary font-medium tracking-wide uppercase">{card.title}</span>
                <p className="text-xl md:text-2xl font-bold text-accent-corail tracking-tight">{card.value}</p>
                <span className="text-[11px] text-text-secondary block">{card.description}</span>
              </div>
              <div className={`${card.bg} p-3 rounded-xl`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Graph & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph */}
        <div className="lg:col-span-2 bg-bg-surface border border-border-custom rounded-xl p-5 md:p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
          <div className="mb-4">
            <h3 className="font-semibold text-text-primary">Évolution des revenus</h3>
            <p className="text-xs text-text-secondary mt-0.5">Revenus nets de commissions perçues sur les 30 derniers jours (FCFA)</p>
          </div>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E14F30" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#E14F30" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4DFD6" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#5E5A52" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#5E5A52" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `${val >= 1000 ? (val / 1000) + 'k' : val}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E4DFD6', color: '#1F1C18', borderRadius: '8px', fontSize: '12px' }}
                  labelClassName="text-[#5E5A52]"
                />
                <Area 
                  type="monotone" 
                  dataKey="revenu" 
                  stroke="#E14F30" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenu)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions / Stats summary */}
        <div className="bg-bg-surface border border-border-custom rounded-xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Actions de modération</h3>
            <div className="space-y-3.5">
              <Link 
                to="/admin/withdrawals" 
                className="flex items-center justify-between p-3.5 rounded-lg bg-bg-primary border border-border-custom hover:bg-bg-surface-hover hover:border-accent-corail/40 transition-all group"
                id="action-validate-withdrawals"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary group-hover:text-accent-corail transition-colors">Traiter les retraits</p>
                  <p className="text-xs text-text-secondary mt-0.5">Valider ou rejeter les demandes</p>
                </div>
                <ArrowRight className="w-4 h-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link 
                to="/admin/creators" 
                className="flex items-center justify-between p-3.5 rounded-lg bg-bg-primary border border-border-custom hover:bg-bg-surface-hover hover:border-accent-corail/40 transition-all group"
                id="action-manage-creators"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary group-hover:text-accent-corail transition-colors">Gérer les créateurs</p>
                  <p className="text-xs text-text-secondary mt-0.5">Suspendre, réactiver ou voir les soldes</p>
                </div>
                <ArrowRight className="w-4 h-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link 
                to="/admin/subscriptions" 
                className="flex items-center justify-between p-3.5 rounded-lg bg-bg-primary border border-border-custom hover:bg-bg-surface-hover hover:border-accent-corail/40 transition-all group"
                id="action-subscriptions"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary group-hover:text-accent-corail transition-colors">Suivi abonnements</p>
                  <p className="text-xs text-text-secondary mt-0.5">Vérifier l'état premium des créateurs</p>
                </div>
                <ArrowRight className="w-4 h-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-border-custom mt-4">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Base de données connectée</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Purchases Table */}
      <div className="bg-bg-surface border border-border-custom rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-border-custom flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-text-primary">Dernières ventes complétées</h3>
            <p className="text-xs text-text-secondary mt-0.5">Historique instantané des derniers contenus achetés sur la plateforme.</p>
          </div>
          <Link 
            to="/admin/transactions" 
            className="text-xs font-semibold text-accent-corail hover:underline flex items-center gap-1"
          >
            Tout voir
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-primary border-b border-border-custom">
                <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Créateur</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Contenu</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Acheteur</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Prix payé</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Com. MomoLink</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {recentPurchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-text-secondary text-sm">
                    Aucune vente complétée pour le moment.
                  </td>
                </tr>
              ) : (
                recentPurchases.map((purchase) => {
                  const dateText = new Date(purchase.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={purchase.id} className="hover:bg-bg-surface-hover/30 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-text-secondary font-mono">{dateText}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-text-primary">{purchase.creatorName}</td>
                      <td className="px-5 py-3.5 text-sm text-text-secondary truncate max-w-xs" title={purchase.contentTitle}>
                        {purchase.contentTitle}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-text-secondary font-mono">{purchase.buyerEmail}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-accent-corail">{purchase.amountPaid.toLocaleString()} FCFA</td>
                      <td className="px-5 py-3.5 text-sm text-emerald-600 font-medium">+{purchase.commissionAmount.toLocaleString()} FCFA</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

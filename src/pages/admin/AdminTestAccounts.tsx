import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Loader2,
  FlaskConical,
  Plus,
  Trash2,
  Link2,
  ShoppingBag,
  Heart,
  Sparkles,
  Wallet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/admin/Toast';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';

interface Creator {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  created_at: string;
  email: string;
  contentCount: number;
  revenueGenerated: number;
  is_test_account?: boolean;
}

interface Content {
  id: string;
  title: string;
  price_fcfa: number;
}

interface FakeTransaction {
  id: string;
  type: 'purchase' | 'donation' | 'withdrawal';
  label: string;
  amount: number;
  createdAt: string;
}

export default function AdminTestAccounts() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [collapsedUsers, setCollapsedUsers] = useState<Record<string, boolean>>({});

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [manageCreatorId, setManageCreatorId] = useState<string | null>(null);

  const getHeaders = async () => {
    const { supabase } = await import('../../lib/supabase');
    let token = '';
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      token = session?.access_token || '';
    }
    if (!token && user) token = user.email || '';
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Admin-Email': user?.email || ''
    };
  };

  const fetchCreators = async () => {
    try {
      setIsLoading(true);
      const headers = await getHeaders();
      const res = await fetch('/api/admin/creators?testOnly=true', { headers });
      if (!res.ok) throw new Error();
      setCreators(await res.json());
    } catch (err) {
      console.error(err);
      showToast('Impossible de charger les comptes de test.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCreators(); }, [user]);

  const groupedCreators = React.useMemo(() => {
    const groups: Record<string, { userId: string; email: string; shops: Creator[] }> = {};
    creators.forEach(c => {
      const key = c.user_id || c.email;
      if (!groups[key]) groups[key] = { userId: key, email: c.email, shops: [] };
      groups[key].shops.push(c);
    });
    return Object.values(groups);
  }, [creators]);

  const toggleUserCollapsed = (userId: string) => {
    setCollapsedUsers(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const manageCreator = creators.find(c => c.id === manageCreatorId) || null;

  return (
    <div className="space-y-6" id="admin-test-accounts-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary flex items-center gap-2.5">
            <FlaskConical className="text-amber-500" size={26} />
            Comptes Test
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Gère les comptes de démonstration : leurs ventes/dons fictifs n'apparaissent jamais dans les revenus réels de la plateforme.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="px-4 py-2.5 rounded-lg border border-border-custom text-text-primary text-xs font-semibold hover:bg-bg-primary transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Link2 size={14} />
            Lier un compte existant
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-accent-corail hover:bg-accent-corail-hover text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={14} />
            Nouveau compte test
          </button>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-custom rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-accent-corail animate-spin" />
            <p className="text-text-secondary text-xs">Chargement...</p>
          </div>
        ) : creators.length === 0 ? (
          <div className="py-16 text-center">
            <FlaskConical className="mx-auto text-text-secondary/40 mb-3" size={32} />
            <p className="text-text-secondary text-sm">Aucun compte de test pour le moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-border-custom">
            {groupedCreators.map(group => {
              const isCollapsed = !!collapsedUsers[group.userId];
              return (
                <div key={group.userId}>
                  <button
                    onClick={() => toggleUserCollapsed(group.userId)}
                    className="w-full flex items-center justify-between px-5 py-3 bg-bg-primary/40 hover:bg-bg-primary/60 transition-colors text-left"
                  >
                    <span className="text-sm font-semibold text-text-primary">{group.email}</span>
                    <span className="text-[10px] text-text-secondary">{group.shops.length} boutique{group.shops.length > 1 ? 's' : ''}</span>
                  </button>
                  {!isCollapsed && group.shops.map(shop => (
                    <div key={shop.id} className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-border-custom/60">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-xs shrink-0 overflow-hidden">
                          {shop.avatar_url ? (
                            <img src={shop.avatar_url} alt={shop.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            shop.display_name?.[0]?.toUpperCase() || shop.username[0].toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-text-primary truncate">{shop.display_name || 'Sans nom'}</p>
                          <p className="text-xs text-text-secondary truncate">@{shop.username} · {shop.contentCount} contenu{shop.contentCount > 1 ? 's' : ''} · {shop.revenueGenerated.toLocaleString()} FCFA (fictif)</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setManageCreatorId(shop.id)}
                        className="shrink-0 px-3.5 py-2 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/25 text-xs font-bold hover:bg-amber-500/20 transition-all cursor-pointer"
                      >
                        Gérer
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <CreateTestAccountModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={() => { setIsCreateModalOpen(false); fetchCreators(); }}
          getHeaders={getHeaders}
          showToast={showToast}
        />
      )}

      {isLinkModalOpen && (
        <LinkExistingAccountModal
          onClose={() => setIsLinkModalOpen(false)}
          onLinked={() => { setIsLinkModalOpen(false); fetchCreators(); }}
          getHeaders={getHeaders}
          showToast={showToast}
        />
      )}

      {manageCreator && (
        <ManageTestAccountModal
          creator={manageCreator}
          onClose={() => setManageCreatorId(null)}
          onChanged={fetchCreators}
          getHeaders={getHeaders}
          showToast={showToast}
        />
      )}
    </div>
  );
}

// ==========================================
// Create brand new test account
// ==========================================
function CreateTestAccountModal({ onClose, onCreated, getHeaders, showToast }: {
  onClose: () => void;
  onCreated: () => void;
  getHeaders: () => Promise<Record<string, string>>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const headers = await getHeaders();
      const res = await fetch('/api/admin/test-accounts', {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password, username, display_name: displayName })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erreur lors de la création.');
      showToast('Compte de test créé avec succès !');
      onCreated();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
      <div className="w-full max-w-sm bg-bg-surface border border-border-custom rounded-2xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full border border-border-custom hover:bg-bg-primary text-text-secondary cursor-pointer">
          <X size={14} />
        </button>
        <h3 className="font-display text-lg font-semibold text-text-primary">Nouveau compte de test</h3>
        <p className="text-xs text-text-secondary mt-1 mb-4">Crée un compte complet (connexion email/mot de passe + boutique), déjà marqué compte de test.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            className="px-3.5 py-2.5 rounded-lg border border-border-custom bg-bg-primary text-sm text-text-primary focus:outline-none focus:border-accent-corail" />
          <input type="text" required minLength={6} placeholder="Mot de passe (min. 6 caractères)" value={password} onChange={e => setPassword(e.target.value)}
            className="px-3.5 py-2.5 rounded-lg border border-border-custom bg-bg-primary text-sm text-text-primary focus:outline-none focus:border-accent-corail" />
          <input type="text" required placeholder="Nom d'utilisateur (username)" value={username} onChange={e => setUsername(e.target.value.toLowerCase())}
            className="px-3.5 py-2.5 rounded-lg border border-border-custom bg-bg-primary text-sm text-text-primary focus:outline-none focus:border-accent-corail" />
          <input type="text" required placeholder="Nom affiché" value={displayName} onChange={e => setDisplayName(e.target.value)}
            className="px-3.5 py-2.5 rounded-lg border border-border-custom bg-bg-primary text-sm text-text-primary focus:outline-none focus:border-accent-corail" />

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button type="submit" disabled={isSubmitting}
            className="mt-1 py-2.5 rounded-lg bg-accent-corail hover:bg-accent-corail-hover text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
            {isSubmitting && <Loader2 size={12} className="animate-spin" />}
            Créer le compte
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// Link an existing (real) creator account as test
// ==========================================
function LinkExistingAccountModal({ onClose, onLinked, getHeaders, showToast }: {
  onClose: () => void;
  onLinked: () => void;
  getHeaders: () => Promise<Record<string, string>>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Creator[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [linkingId, setLinkingId] = useState<string | null>(null);

  useEffect(() => {
    if (!search.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      try {
        setIsSearching(true);
        const headers = await getHeaders();
        const res = await fetch(`/api/admin/creators?search=${encodeURIComponent(search)}`, { headers });
        const data = await res.json();
        setResults((data || []).filter((c: Creator) => !c.is_test_account));
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const handleLink = async (id: string) => {
    try {
      setLinkingId(id);
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/creators/${id}/toggle-test-account`, { method: 'POST', headers });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erreur.');
      showToast('Boutique marquée comme compte de test !');
      onLinked();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du marquage.', 'error');
    } finally {
      setLinkingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
      <div className="w-full max-w-md bg-bg-surface border border-border-custom rounded-2xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full border border-border-custom hover:bg-bg-primary text-text-secondary cursor-pointer">
          <X size={14} />
        </button>
        <h3 className="font-display text-lg font-semibold text-text-primary">Lier un compte existant</h3>
        <p className="text-xs text-text-secondary mt-1 mb-4">Marque une boutique déjà existante comme compte de test.</p>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            autoFocus
            placeholder="Rechercher par nom, username, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border-custom bg-bg-primary text-sm text-text-primary focus:outline-none focus:border-accent-corail"
          />
        </div>

        <div className="max-h-64 overflow-y-auto flex flex-col gap-1.5">
          {isSearching && <p className="text-xs text-text-secondary text-center py-3">Recherche...</p>}
          {!isSearching && search.trim() && results.length === 0 && (
            <p className="text-xs text-text-secondary text-center py-3">Aucun résultat.</p>
          )}
          {results.map(c => (
            <div key={c.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border-custom">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">{c.display_name} <span className="text-text-secondary font-normal">@{c.username}</span></p>
                <p className="text-[10px] text-text-secondary truncate">{c.email}</p>
              </div>
              <button
                onClick={() => handleLink(c.id)}
                disabled={linkingId === c.id}
                className="shrink-0 px-2.5 py-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold cursor-pointer disabled:opacity-60"
              >
                {linkingId === c.id ? '...' : 'Marquer test'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Manage a test account's fake data
// ==========================================
function ManageTestAccountModal({ creator, onClose, onChanged, getHeaders, showToast }: {
  creator: Creator;
  onClose: () => void;
  onChanged: () => void;
  getHeaders: () => Promise<Record<string, string>>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [contents, setContents] = useState<Content[]>([]);
  const [transactions, setTransactions] = useState<FakeTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FakeTransaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk random generator settings
  const [seedPurchasesCount, setSeedPurchasesCount] = useState('15');
  const [seedDonationsCount, setSeedDonationsCount] = useState('8');
  const [seedDaysRange, setSeedDaysRange] = useState('30');

  // Fake purchase form
  const [purchaseContentId, setPurchaseContentId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [isAddingPurchase, setIsAddingPurchase] = useState(false);

  // Fake donation form
  const [donationAmount, setDonationAmount] = useState('1000');
  const [donorName, setDonorName] = useState('');
  const [donationDate, setDonationDate] = useState('');
  const [isAddingDonation, setIsAddingDonation] = useState(false);

  // Fake withdrawal form
  const [withdrawalAmount, setWithdrawalAmount] = useState('5000');
  const [withdrawalDate, setWithdrawalDate] = useState('');
  const [isAddingWithdrawal, setIsAddingWithdrawal] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const headers = await getHeaders();
      const [contentsRes, txRes] = await Promise.all([
        fetch(`/api/admin/contents?search=`, { headers }),
        fetch(`/api/admin/creators/${creator.id}/fake-transactions`, { headers })
      ]);
      const allContents = await contentsRes.json();
      setContents((allContents || []).filter((c: any) => c.creator_id === creator.id && c.status === 'published'));
      setTransactions(await txRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [creator.id]);

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/creators/${creator.id}/seed-test-data`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          purchasesCount: Number(seedPurchasesCount) || 0,
          donationsCount: Number(seedDonationsCount) || 0,
          daysRange: Number(seedDaysRange) || 30
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erreur.');
      showToast(`${result.purchasesCreated} ventes et ${result.donationsCreated} dons fictifs générés !`);
      loadData();
      onChanged();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la génération.', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleAddPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseContentId || !purchaseDate) return;
    try {
      setIsAddingPurchase(true);
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/creators/${creator.id}/fake-purchase`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ contentId: purchaseContentId, createdAt: new Date(purchaseDate).toISOString() })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erreur.');
      showToast('Vente fictive ajoutée !');
      setPurchaseContentId('');
      setPurchaseDate('');
      loadData();
      onChanged();
    } catch (err: any) {
      showToast(err.message || "Erreur lors de l'ajout.", 'error');
    } finally {
      setIsAddingPurchase(false);
    }
  };

  const handleAddDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donationAmount || !donorName.trim() || !donationDate) return;
    try {
      setIsAddingDonation(true);
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/creators/${creator.id}/fake-donation`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ amount: Number(donationAmount), donorName: donorName.trim(), createdAt: new Date(donationDate).toISOString() })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erreur.');
      showToast('Don fictif ajouté !');
      setDonorName('');
      setDonationDate('');
      loadData();
      onChanged();
    } catch (err: any) {
      showToast(err.message || "Erreur lors de l'ajout.", 'error');
    } finally {
      setIsAddingDonation(false);
    }
  };

  const handleAddWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawalAmount || !withdrawalDate) return;
    try {
      setIsAddingWithdrawal(true);
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/creators/${creator.id}/fake-withdrawal`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ amount: Number(withdrawalAmount), createdAt: new Date(withdrawalDate).toISOString() })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erreur.');
      showToast('Retrait fictif ajouté !');
      setWithdrawalDate('');
      loadData();
      onChanged();
    } catch (err: any) {
      showToast(err.message || "Erreur lors de l'ajout.", 'error');
    } finally {
      setIsAddingWithdrawal(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/fake-transactions/${deleteTarget.type}/${deleteTarget.id}`, { method: 'DELETE', headers });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erreur.');
      showToast('Transaction fictive supprimée.');
      setDeleteTarget(null);
      loadData();
      onChanged();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la suppression.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
        <div className="w-full max-w-lg bg-bg-surface border border-border-custom rounded-2xl p-6 shadow-2xl relative max-h-[88vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full border border-border-custom hover:bg-bg-primary text-text-secondary cursor-pointer">
            <X size={14} />
          </button>
          <h3 className="font-display text-lg font-semibold text-text-primary">{creator.display_name}</h3>
          <p className="text-xs text-text-secondary mb-4">@{creator.username} · compte de test</p>

          {isLoading ? (
            <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-accent-corail" size={24} /></div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Bulk generator */}
              <div className="p-3.5 rounded-xl border border-amber-500/25 bg-amber-500/5 flex flex-col gap-2.5">
                <span className="text-[11px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-500" /> Génération aléatoire en masse
                </span>
                <p className="text-[10px] text-text-secondary -mt-1">
                  Réparties avec une courbe de croissance (peu au début, plus vers aujourd'hui) plutôt qu'uniformément.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-text-secondary uppercase font-semibold">Ventes</label>
                    <input type="number" min={0} max={200} value={seedPurchasesCount} onChange={e => setSeedPurchasesCount(e.target.value)}
                      className="px-2.5 py-1.5 rounded-md border border-border-custom bg-bg-primary text-xs text-text-primary focus:outline-none focus:border-accent-corail" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-text-secondary uppercase font-semibold">Dons</label>
                    <input type="number" min={0} max={200} value={seedDonationsCount} onChange={e => setSeedDonationsCount(e.target.value)}
                      className="px-2.5 py-1.5 rounded-md border border-border-custom bg-bg-primary text-xs text-text-primary focus:outline-none focus:border-accent-corail" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-text-secondary uppercase font-semibold">Jours</label>
                    <input type="number" min={1} max={365} value={seedDaysRange} onChange={e => setSeedDaysRange(e.target.value)}
                      className="px-2.5 py-1.5 rounded-md border border-border-custom bg-bg-primary text-xs text-text-primary focus:outline-none focus:border-accent-corail" />
                  </div>
                </div>
                <button
                  onClick={handleSeed}
                  disabled={isSeeding}
                  className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSeeding && <Loader2 size={12} className="animate-spin" />}
                  Générer
                </button>
              </div>

              {/* Fake purchase form */}
              <form onSubmit={handleAddPurchase} className="p-3.5 rounded-xl border border-border-custom flex flex-col gap-2.5">
                <span className="text-[11px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag size={12} /> Ajouter une vente précise
                </span>
                {contents.length === 0 ? (
                  <p className="text-[11px] text-text-secondary">Aucun contenu publié pour cette boutique.</p>
                ) : (
                  <>
                    <select
                      required
                      value={purchaseContentId}
                      onChange={e => setPurchaseContentId(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-border-custom bg-bg-primary text-xs text-text-primary focus:outline-none focus:border-accent-corail"
                    >
                      <option value="">Choisir un contenu...</option>
                      {contents.map(c => (
                        <option key={c.id} value={c.id}>{c.title} — {c.price_fcfa.toLocaleString()} FCFA</option>
                      ))}
                    </select>
                    <input
                      type="datetime-local"
                      required
                      value={purchaseDate}
                      onChange={e => setPurchaseDate(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-border-custom bg-bg-primary text-xs text-text-primary focus:outline-none focus:border-accent-corail"
                    />
                    <button type="submit" disabled={isAddingPurchase} className="py-2 rounded-lg bg-accent-corail hover:bg-accent-corail-hover text-white text-xs font-bold cursor-pointer disabled:opacity-60">
                      {isAddingPurchase ? 'Ajout...' : 'Ajouter la vente'}
                    </button>
                  </>
                )}
              </form>

              {/* Fake donation form */}
              <form onSubmit={handleAddDonation} className="p-3.5 rounded-xl border border-border-custom flex flex-col gap-2.5">
                <span className="text-[11px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Heart size={12} /> Ajouter un don précis
                </span>
                <input
                  type="number"
                  required
                  min={1000}
                  placeholder="Montant (FCFA)"
                  value={donationAmount}
                  onChange={e => setDonationAmount(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-border-custom bg-bg-primary text-xs text-text-primary focus:outline-none focus:border-accent-corail"
                />
                <input
                  type="text"
                  required
                  placeholder="Nom du donateur"
                  value={donorName}
                  onChange={e => setDonorName(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-border-custom bg-bg-primary text-xs text-text-primary focus:outline-none focus:border-accent-corail"
                />
                <input
                  type="datetime-local"
                  required
                  value={donationDate}
                  onChange={e => setDonationDate(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-border-custom bg-bg-primary text-xs text-text-primary focus:outline-none focus:border-accent-corail"
                />
                <button type="submit" disabled={isAddingDonation} className="py-2 rounded-lg bg-accent-corail hover:bg-accent-corail-hover text-white text-xs font-bold cursor-pointer disabled:opacity-60">
                  {isAddingDonation ? 'Ajout...' : 'Ajouter le don'}
                </button>
              </form>

              {/* Fake withdrawal form */}
              <form onSubmit={handleAddWithdrawal} className="p-3.5 rounded-xl border border-border-custom flex flex-col gap-2.5">
                <span className="text-[11px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet size={12} /> Ajouter un retrait déjà payé
                </span>
                <p className="text-[10px] text-text-secondary -mt-1">
                  Toujours créé au statut "payé" — n'active jamais un vrai virement. Utile pour que l'historique des retraits ne reste pas vide.
                </p>
                <input
                  type="number"
                  required
                  min={5000}
                  placeholder="Montant (FCFA)"
                  value={withdrawalAmount}
                  onChange={e => setWithdrawalAmount(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-border-custom bg-bg-primary text-xs text-text-primary focus:outline-none focus:border-accent-corail"
                />
                <input
                  type="datetime-local"
                  required
                  value={withdrawalDate}
                  onChange={e => setWithdrawalDate(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-border-custom bg-bg-primary text-xs text-text-primary focus:outline-none focus:border-accent-corail"
                />
                <button type="submit" disabled={isAddingWithdrawal} className="py-2 rounded-lg bg-accent-corail hover:bg-accent-corail-hover text-white text-xs font-bold cursor-pointer disabled:opacity-60">
                  {isAddingWithdrawal ? 'Ajout...' : 'Ajouter le retrait'}
                </button>
              </form>

              {/* Existing fake transactions */}
              <div>
                <span className="text-[11px] font-bold text-text-primary uppercase tracking-wider">Transactions fictives ({transactions.length})</span>
                <div className="mt-2 flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                  {transactions.length === 0 && <p className="text-[11px] text-text-secondary">Aucune pour le moment.</p>}
                  {transactions.map(t => (
                    <div key={`${t.type}-${t.id}`} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-bg-primary/40 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        {t.type === 'purchase' ? <ShoppingBag size={12} className="text-accent-corail shrink-0" /> : t.type === 'donation' ? <Heart size={12} className="text-pink-500 shrink-0" /> : <Wallet size={12} className="text-emerald-500 shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-text-primary truncate">{t.label}</p>
                          <p className="text-[10px] text-text-secondary">{new Date(t.createdAt).toLocaleString('fr-FR')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-text-primary">{t.amount.toLocaleString()} F</span>
                        <button onClick={() => setDeleteTarget(t)} className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 cursor-pointer">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer cette transaction fictive ?"
        message="Cette action est irréversible. La transaction sera retirée du dashboard du créateur."
        confirmLabel="Supprimer"
        danger
        isSubmitting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

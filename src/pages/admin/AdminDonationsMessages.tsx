import React, { useState, useEffect } from 'react';
import {
  Heart,
  Mail,
  Briefcase,
  Loader2,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface AdminCreatorRef {
  display_name: string;
  username: string;
  avatar_url: string;
}

interface AdminDonation {
  id: string;
  donor_name: string;
  donor_email?: string | null;
  donor_message?: string | null;
  amount_fcfa: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  creator_profiles: AdminCreatorRef;
}

interface AdminProfileMessage {
  id: string;
  type: 'message' | 'partnership';
  sender_name: string;
  sender_email: string;
  body: string;
  created_at: string;
  creator_profiles: AdminCreatorRef;
}

export default function AdminDonationsMessages() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'donations' | 'messages'>('donations');
  const [donations, setDonations] = useState<AdminDonation[]>([]);
  const [messages, setMessages] = useState<AdminProfileMessage[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const headers = await getHeaders();
      const endpoint = activeTab === 'donations' ? '/api/admin/donations' : '/api/admin/messages';
      const res = await fetch(`${endpoint}?search=${encodeURIComponent(search)}`, { headers });
      if (!res.ok) throw new Error('Erreur de récupération.');
      const data = await res.json();
      if (activeTab === 'donations') setDonations(data);
      else setMessages(data);
    } catch (err) {
      console.error(err);
      setError(activeTab === 'donations' ? 'Impossible de charger les dons.' : 'Impossible de charger les messages.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, activeTab]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const CreatorCell = ({ creator }: { creator: AdminCreatorRef }) => (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full bg-accent-corail/15 flex items-center justify-center font-bold text-[10px] text-accent-corail overflow-hidden shrink-0">
        {creator?.avatar_url ? (
          <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          (creator?.display_name || '?')[0].toUpperCase()
        )}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-sm text-text-primary truncate">{creator?.display_name || 'Créateur'}</p>
        <p className="text-xs text-text-secondary truncate">@{creator?.username || 'inconnu'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6" id="admin-donations-messages-container">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">Dons & Messages</h1>
        <p className="text-text-secondary text-sm mt-1">Dons reçus et messages / propositions de partenariat envoyés depuis les profils publics de tous les créateurs.</p>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('donations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
              activeTab === 'donations'
                ? 'bg-accent-corail/15 border-accent-corail text-accent-corail shadow-sm'
                : 'bg-bg-surface border-border-custom text-text-secondary hover:text-text-primary hover:border-gray-400'
            }`}
          >
            <Heart size={14} /> Dons
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
              activeTab === 'messages'
                ? 'bg-accent-corail/15 border-accent-corail text-accent-corail shadow-sm'
                : 'bg-bg-surface border-border-custom text-text-secondary hover:text-text-primary hover:border-gray-400'
            }`}
          >
            <Mail size={14} /> Messages
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-text-secondary" />
          <input
            type="text"
            placeholder="Rechercher par créateur, expéditeur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-surface border border-border-custom rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-corail transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-surface border border-border-custom rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-accent-corail animate-spin" />
            <p className="text-text-secondary text-xs font-medium">Chargement...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500 text-sm">{error}</div>
        ) : activeTab === 'donations' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-primary border-b border-border-custom">
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Créateur</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Donateur</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Message</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Statut</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider text-right">Montant</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {donations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-text-secondary text-sm">Aucun don pour le moment.</td>
                  </tr>
                ) : (
                  donations.map((d) => (
                    <tr key={d.id} className="hover:bg-bg-surface-hover/30 transition-colors">
                      <td className="px-5 py-4"><CreatorCell creator={d.creator_profiles} /></td>
                      <td className="px-5 py-4 text-sm text-text-primary">
                        {d.donor_name}
                        {d.donor_email && <span className="block text-xs text-text-secondary">{d.donor_email}</span>}
                      </td>
                      <td className="px-5 py-4 text-xs text-text-secondary max-w-[220px] truncate" title={d.donor_message || ''}>
                        {d.donor_message || '-'}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        {d.status === 'completed' ? (
                          <span className="bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-semibold px-2 py-0.5 rounded-full">Complété</span>
                        ) : d.status === 'pending' ? (
                          <span className="bg-[#FFF3E0] text-[#E65100] text-[10px] font-semibold px-2 py-0.5 rounded-full">En attente</span>
                        ) : (
                          <span className="bg-[#FFEBEE] text-[#C62828] text-[10px] font-semibold px-2 py-0.5 rounded-full">Échoué</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-sm font-mono text-pink-500">
                        {d.amount_fcfa.toLocaleString()} FCFA
                      </td>
                      <td className="px-5 py-4 text-xs font-mono text-text-secondary">
                        {new Date(d.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-primary border-b border-border-custom">
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Créateur</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Expéditeur</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Message</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-text-secondary text-sm">Aucun message pour le moment.</td>
                  </tr>
                ) : (
                  messages.map((m) => (
                    <tr key={m.id} className="hover:bg-bg-surface-hover/30 transition-colors">
                      <td className="px-5 py-4"><CreatorCell creator={m.creator_profiles} /></td>
                      <td className="px-5 py-4 text-sm text-text-primary">
                        {m.sender_name}
                        <span className="block text-xs text-text-secondary">{m.sender_email}</span>
                      </td>
                      <td className="px-5 py-4 text-xs">
                        {m.type === 'partnership' ? (
                          <span className="text-purple-600 font-semibold flex items-center gap-1"><Briefcase size={12} /> Partenariat</span>
                        ) : (
                          <span className="text-accent-corail font-semibold flex items-center gap-1"><Mail size={12} /> Message</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-text-secondary max-w-[260px] truncate" title={m.body}>
                        {m.body}
                      </td>
                      <td className="px-5 py-4 text-xs font-mono text-text-secondary">
                        {new Date(m.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

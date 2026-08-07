import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Loader2, 
  Trash2, 
  Eye, 
  Lock, 
  Unlock, 
  AlertTriangle,
  FileText,
  Video,
  Image as ImageIcon,
  Music,
  Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface ContentItem {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  price_fcfa: number;
  content_type: 'video' | 'image' | 'pdf' | 'audio';
  status: 'published' | 'draft' | 'archived' | 'removed';
  is_published: boolean;
  created_at: string;
  creator?: {
    display_name: string;
    username: string;
    avatar_url: string | null;
  };
}

export default function AdminContents() {
  const { user } = useAuth();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchContents();
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

  const fetchContents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/contents?type=${type}&status=${status}&search=${encodeURIComponent(search)}`, { headers });
      if (!res.ok) throw new Error('Erreur lors du chargement des contenus.');
      const data = await res.json();
      setContents(data);
    } catch (err: any) {
      console.error(err);
      setError('Impossible de charger la liste des contenus.');
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchContents();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'archived' : 'published';
    const actionLabel = currentStatus === 'published' ? 'archiver' : 'publier';
    
    if (!window.confirm(`Voulez-vous ${actionLabel} ce contenu ?`)) return;

    try {
      setActionLoading(id);
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/contents/${id}/toggle-status`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Impossible de modifier le statut.');
      const result = await res.json();

      setContents(prev => prev.map(c => c.id === id ? { ...c, status: result.status, is_published: result.is_published } : c));
    } catch (err) {
      console.error(err);
      alert('Une erreur est survenue lors de la modification du statut.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!window.confirm('Êtes-vous SÛR de vouloir supprimer ce contenu définitivement ? Cette action est irréversible.')) return;

    try {
      setActionLoading(id);
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/contents/${id}`, {
        method: 'DELETE',
        headers
      });

      if (!res.ok) throw new Error('Erreur lors de la suppression.');
      setContents(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      alert('Une erreur est survenue lors de la suppression.');
    } finally {
      setActionLoading(null);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video size={16} className="text-accent-corail" />;
      case 'image':
        return <ImageIcon size={16} className="text-accent-corail" />;
      case 'audio':
        return <Music size={16} className="text-accent-corail" />;
      default:
        return <FileText size={16} className="text-accent-corail" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] text-xs font-semibold px-2.5 py-0.5 rounded-full">Publié</span>;
      case 'draft':
        return <span className="bg-gray-100 text-gray-600 border border-gray-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">Brouillon</span>;
      case 'archived':
        return <span className="bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2] text-xs font-semibold px-2.5 py-0.5 rounded-full">Archivé (Masqué)</span>;
      case 'removed':
        return <span className="bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] text-xs font-semibold px-2.5 py-0.5 rounded-full">Retiré</span>;
      default:
        return <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-6" id="admin-contents-container">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">Modération des Contenus</h1>
        <p className="text-text-secondary text-sm mt-1">Superviser l'intégralité des fichiers, ebooks, vidéos et formations mis en vente par les créateurs.</p>
      </div>

      {/* Search & Filter bar */}
      <div className="bg-bg-surface border border-border-custom rounded-xl p-5 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-text-secondary" />
            <input
              type="text"
              placeholder="Rechercher par titre, description, créateur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full bg-bg-primary border border-border-custom rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-accent-corail transition-colors text-text-primary"
              id="search-contents"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-bg-primary border border-border-custom rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-accent-corail transition-colors text-text-primary appearance-none cursor-pointer"
              id="filter-type"
            >
              <option value="all">Tous les types</option>
              <option value="pdf">Document PDF</option>
              <option value="video">Vidéo</option>
              <option value="image">Image / Photo</option>
              <option value="audio">Audio / Musique</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-bg-primary border border-border-custom rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-accent-corail transition-colors text-text-primary appearance-none cursor-pointer"
              id="filter-status"
            >
              <option value="all">Tous les statuts</option>
              <option value="published">Publiés</option>
              <option value="archived">Archivés</option>
              <option value="draft">Brouillons</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-accent-corail animate-spin" />
          <p className="text-text-secondary text-xs">Chargement des contenus...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl p-6 text-center">
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : contents.length === 0 ? (
        <div className="bg-bg-surface border border-border-custom rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <AlertTriangle className="text-text-secondary opacity-30 h-10 w-10" />
          <span className="text-sm font-semibold text-text-primary">Aucun contenu trouvé</span>
          <span className="text-xs text-text-secondary">Aucun fichier ne correspond à vos critères de recherche.</span>
        </div>
      ) : (
        <div className="bg-bg-surface border border-border-custom rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-custom">
              <thead className="bg-bg-primary/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Contenu</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Créateur</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Prix (FCFA)</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Date d'upload</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {contents.map((item) => (
                  <tr key={item.id} className="hover:bg-bg-primary/25 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent-corail/10 flex items-center justify-center shrink-0">
                          {getContentTypeIcon(item.content_type)}
                        </div>
                        <div className="min-w-0 max-w-[240px]">
                          <p className="text-sm font-semibold text-text-primary truncate" title={item.title}>{item.title}</p>
                          <p className="text-[10px] text-text-secondary truncate mt-0.5">{item.description || 'Aucune description'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-accent-corail/10 flex items-center justify-center text-[10px] font-bold text-accent-corail shrink-0">
                          {item.creator?.display_name.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-medium text-text-primary truncate">{item.creator?.display_name || 'Inconnu'}</p>
                          <p className="text-[10px] text-text-secondary truncate">@{item.creator?.username || 'inconnu'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold font-mono text-text-primary">
                      {item.price_fcfa.toLocaleString()} F
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-text-secondary font-medium">
                      {new Date(item.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle Status Button */}
                        <button
                          onClick={() => handleToggleStatus(item.id, item.status)}
                          disabled={actionLoading === item.id}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            item.status === 'published' 
                              ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20' 
                              : 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                          }`}
                          title={item.status === 'published' ? 'Masquer / Archiver' : 'Publier'}
                        >
                          {item.status === 'published' ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteContent(item.id)}
                          disabled={actionLoading === item.id}
                          className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer définitivement"
                          id={`btn-delete-${item.id}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

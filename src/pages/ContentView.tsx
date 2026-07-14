/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Download, 
  ExternalLink, 
  ChevronLeft, 
  Lock, 
  AlertCircle,
  FileText,
  Video,
  Image,
  Music,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface ContentDetails {
  id: string;
  title: string;
  description: string;
  content_type: 'video' | 'image' | 'pdf' | 'audio';
  price_fcfa: number;
}

export default function ContentView() {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();

  const [emailInput, setEmailInput] = useState(() => localStorage.getItem('momo_buyer_email') || '');
  const [hasChecked, setHasChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hardcoded or fetched metadata
  const [content, setContent] = useState<ContentDetails | null>(null);

  // Seed metadata helper
  useEffect(() => {
    // Attempt fetching metadata if we want, or use seeds
    const seeds: Record<string, ContentDetails> = {
      '1': {
        id: '1',
        title: 'Pack PDF : Booster son audience TikTok en 30 jours',
        description: "Ma méthode exacte, mes scripts prêts à l'emploi et mon calendrier éditorial pour passer de 0 à 10 000 abonnés rapidement.",
        content_type: 'pdf',
        price_fcfa: 2500
      },
      '2': {
        id: '2',
        title: 'Template Notion : Organiser ses tournages Reels & TikTok',
        description: "Le template complet que j'utilise au quotidien pour planifier mes tournages, rédiger mes accroches et suivre mes métriques.",
        content_type: 'pdf',
        price_fcfa: 1500
      },
      '3': {
        id: '3',
        title: 'Masterclass : Décryptage de l\'Algorithme 2026 (Vidéo 20m)',
        description: "Une vidéo exclusive de 20 minutes où je vous montre les coulisses de l'algorithme actuel, et comment maximiser le taux de rétention.",
        content_type: 'video',
        price_fcfa: 5000
      }
    };

    if (contentId && seeds[contentId]) {
      setContent(seeds[contentId]);
    } else {
      // Dynamic default
      setContent({
        id: contentId || '',
        title: 'Contenu exclusif débloqué',
        description: 'Félicitations pour votre achat ! Vous pouvez accéder à vos fichiers ci-dessous.',
        content_type: 'pdf',
        price_fcfa: 0
      });
    }
  }, [contentId]);

  const verifyAccess = async (emailToVerify: string) => {
    if (!contentId || !emailToVerify.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/payment/access?contentId=${contentId}&email=${encodeURIComponent(emailToVerify.trim())}`);
      if (!res.ok) {
        throw new Error('Erreur lors de la vérification de vos accès.');
      }

      const data = await res.json();
      setHasChecked(true);

      if (data.hasAccess) {
        setHasAccess(true);
        setSignedUrl(data.signedUrl || null);
        localStorage.setItem('momo_buyer_email', emailToVerify.trim());
      } else {
        setHasAccess(false);
        setError('Aucun achat valide trouvé pour cette adresse email et ce contenu.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la communication.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-verify if email already stored
    const storedEmail = localStorage.getItem('momo_buyer_email');
    if (storedEmail && contentId) {
      verifyAccess(storedEmail);
    }
  }, [contentId]);

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    verifyAccess(emailInput);
  };

  const handleBackToCreator = () => {
    navigate(-1);
  };

  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video size={36} className="text-accent-corail" />;
      case 'image': return <Image size={36} className="text-accent-corail" />;
      case 'audio': return <Music size={36} className="text-accent-corail" />;
      default: return <FileText size={36} className="text-accent-corail" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1815] pb-16">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40 px-4 py-3.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBackToCreator}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>Retour</span>
          </button>
          
          <span className="font-display font-bold text-xs tracking-tight text-neutral-900">
            Portail de Téléchargement <span className="text-accent-corail text-[10px]">Sécurisé</span>
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-12 flex flex-col gap-8">
        
        {/* Content Info Card */}
        {content && (
          <div className="bg-white border border-gray-200 rounded-[24px] p-6 flex flex-col md:flex-row gap-5 items-start md:items-center shadow-sm">
            <div className="p-4 bg-accent-corail/10 rounded-2xl shrink-0">
              {renderTypeIcon(content.content_type)}
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-400">
                Fichier Exclusif • {content.content_type}
              </span>
              <h1 className="font-display text-lg font-bold text-neutral-900 leading-tight">
                {content.title}
              </h1>
              <p className="text-xs text-gray-500 leading-relaxed mt-1">
                {content.description}
              </p>
            </div>
          </div>
        )}

        {/* ACCESS VERIFIED STATUS */}
        {hasChecked && hasAccess ? (
          <div className="bg-white border border-green-200 rounded-[28px] p-8 flex flex-col items-center text-center gap-6 shadow-sm">
            <div className="p-3 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
              <CheckCircle size={32} />
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 className="font-display text-lg font-bold text-neutral-900">Accès vérifié avec succès !</h2>
              <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                Votre transaction a été validée. Cliquez sur le bouton ci-dessous pour télécharger ou visionner votre contenu.
              </p>
            </div>

            {signedUrl && (
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mt-2">
                <a
                  href={signedUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3.5 rounded-xl text-xs font-bold text-white bg-accent-corail hover:bg-accent-corail-hover transition-colors flex items-center justify-center gap-2 shadow"
                >
                  <Download size={15} />
                  <span>Télécharger le fichier</span>
                </a>
                
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Ouvrir</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            )}

            <p className="text-[10px] text-gray-400 leading-normal max-w-xs mt-1">
              Ce lien d'accès sécurisé est temporaire et expirera dans une heure. Vous pouvez revenir sur cette page et ré-entrer votre adresse email d'achat à tout moment pour régénérer un lien.
            </p>
          </div>
        ) : (
          /* EMAIL INPUT FORM / GATEKEEPER */
          <div className="bg-white border border-gray-200 rounded-[28px] p-8 flex flex-col items-center text-center gap-6 shadow-sm">
            <div className="p-3.5 bg-neutral-100 text-neutral-400 rounded-full border border-gray-200">
              <Lock size={24} />
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 className="font-display text-base font-bold text-neutral-900">Ce contenu est verrouillé</h2>
              <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                Veuillez entrer l'adresse email utilisée lors du paiement pour débloquer votre accès instantanément.
              </p>
            </div>

            <form onSubmit={handleSubmitEmail} className="w-full max-w-sm flex flex-col gap-3.5 mt-2">
              <div className="flex flex-col text-left gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 pl-1">Adresse email d'achat</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Ex: buyer@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:border-accent-corail focus:ring-1 focus:ring-accent-corail transition-all text-neutral-900"
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-left flex items-start gap-2 text-xs">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !emailInput.trim()}
                className="w-full py-3.5 rounded-xl text-xs font-semibold text-white bg-accent-corail hover:bg-accent-corail-hover transition-colors flex items-center justify-center gap-2 shadow disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Vérification...</span>
                  </>
                ) : (
                  <span>Débloquer mon accès</span>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

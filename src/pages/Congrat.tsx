import React, { useState } from 'react';
import { Check, Download, AlertTriangle, Copy } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function Congrat() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const pdfUrl = "https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/4e8f1e8e-647f-4f41-b154-b6f1046e50dd.pdf";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pdfUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#14120F] text-[#FAFAF8] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative premium glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-success-gold/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[480px] bg-[#1E1B17]/40 backdrop-blur-xl border border-neutral-800/60 rounded-[32px] p-10 flex flex-col items-center text-center shadow-2xl relative z-10"
      >
        {/* Animated Check badge matching success color */}
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 bg-success-gold/10 text-success-gold rounded-full border border-success-gold/20 flex items-center justify-center mb-8 shadow-inner"
        >
          <Check size={40} strokeWidth={2.5} />
        </motion.div>

        {/* Header / Text */}
        <div className="flex flex-col gap-3 mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-success-gold">
            Merci pour votre achat !
          </h1>
          <p className="text-sm text-neutral-400 max-w-[320px] mx-auto leading-relaxed">
            Votre paiement a été validé avec succès. Votre guide est prêt à être téléchargé.
          </p>
        </div>

        {/* Main download button */}
        <div className="w-full mb-6">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="w-full py-4 px-6 rounded-2xl text-sm font-bold text-white bg-accent-corail hover:bg-accent-corail-hover transition-colors shadow-lg hover:shadow-accent-corail/25 cursor-pointer flex items-center justify-center gap-2 group font-display tracking-wider uppercase"
          >
            <Download size={18} className="animate-bounce" style={{ animationDuration: '2s' }} />
            <span>TÉLÉCHARGER LE PDF</span>
          </a>
        </div>

        {/* TikTok warning / Copy link box */}
        <div className="w-full bg-[#1E1B17]/60 border border-neutral-800/50 rounded-2xl p-5 mb-8 text-left flex flex-col gap-3.5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg shrink-0 mt-0.5">
              <AlertTriangle size={15} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-200">Vous utilisez TikTok ?</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed mt-1">
                Le navigateur intégré de TikTok bloque parfois les téléchargements directs. Si le bouton ci-dessus ne fonctionne pas, copiez le lien ci-dessous et ouvrez-le dans un navigateur externe (Chrome, Safari, etc.).
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-black/40 border border-neutral-800 rounded-xl px-3 py-2 text-[10px] font-mono text-neutral-400 truncate select-all">
              {pdfUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
                copied 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-white/5 hover:bg-white/10 text-neutral-200 border border-neutral-800'
              }`}
            >
              {copied ? (
                <>
                  <Check size={13} strokeWidth={3} className="text-emerald-400" />
                  <span>Copié</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Minimal action button */}
        <div className="w-full">
          <button
            onClick={() => navigate('/pay')}
            className="w-full py-3.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-[#FAFAF8] bg-transparent hover:bg-white/5 transition-all cursor-pointer border border-neutral-800"
          >
            Retour à l'accueil
          </button>
        </div>
      </motion.div>
    </div>
  );
}

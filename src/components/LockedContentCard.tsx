/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Content } from '../types';

interface LockedContentCardProps {
  key?: string;
  content: Content;
  onUnlock: () => void;
  isUnlocked?: boolean;
}

/**
 * Composant Signature de contenu verrouillé conforme aux règles de design d'AGENTS.md
 */
export default function LockedContentCard({ content, onUnlock, isUnlocked = false }: LockedContentCardProps) {
  return (
    <div
      id={`locked-content-card-${content.id}`}
      className="rounded-[16px] bg-bg-surface border border-border-custom p-5 flex flex-col gap-4 transition-all duration-300"
    >
      {/* Vignette sur fond neutre (bg-surface-hover) avec une icône cadenas centrée */}
      <div className="relative aspect-video w-full rounded-xl bg-bg-surface-hover border border-border-custom flex items-center justify-center overflow-hidden group">
        {isUnlocked ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-bg-surface-hover p-4 text-center"
          >
            <span className="p-3 bg-success-gold/10 text-success-gold rounded-full mb-2">
              <Sparkles size={24} />
            </span>
            <h4 className="font-display text-base font-medium text-text-primary">Accès Débloqué !</h4>
            <p className="text-xs text-text-secondary mt-1 max-w-[240px]">
              Le fichier réel est désormais accessible de manière sécurisée.
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="p-4 bg-bg-primary border border-border-custom rounded-full text-text-secondary group-hover:text-accent-corail transition-colors duration-200">
              <Lock size={20} />
            </span>
            <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">
              Contenu Verrouillé
            </span>
          </div>
        )}
      </div>

      {/* Meta Informations */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] uppercase font-bold tracking-widest text-accent-corail">
          {content.creator?.display_name || '@createur'}
        </span>
        <h3 className="font-display text-lg font-medium text-text-primary leading-snug">
          {content.title}
        </h3>
        <p className="text-xs text-text-secondary line-clamp-2">
          {content.description}
        </p>
      </div>

      {/* Rangée inférieure : Prix en accent à côté du bouton "Débloquer" */}
      <div className="pt-3 border-t border-border-custom flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-text-secondary">Tarif Unique</span>
          <span className="font-display text-xl font-medium text-accent-corail">
            {content.price_fcfa.toLocaleString('fr-FR')} FCFA
          </span>
        </div>

        {isUnlocked ? (
          <span className="px-4 py-2 rounded-full text-xs font-semibold bg-success-gold/10 text-success-gold border border-success-gold/30">
            Acheté
          </span>
        ) : (
          <button
            id={`unlock-btn-${content.id}`}
            onClick={onUnlock}
            className="px-6 py-2.5 rounded-full text-xs font-semibold bg-accent-corail text-white hover:bg-accent-corail-hover transition-all duration-200 shadow-sm cursor-pointer"
          >
            Débloquer
          </button>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  danger = false,
  isSubmitting = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
      <div className="w-full max-w-sm bg-bg-surface border border-border-custom rounded-2xl p-6 shadow-2xl relative animate-fade-in">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full border border-border-custom hover:bg-bg-primary text-text-secondary hover:text-text-primary transition-all cursor-pointer"
        >
          <X size={14} />
        </button>

        <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-4 ${danger ? 'bg-red-500/10 text-red-500' : 'bg-accent-corail/10 text-accent-corail'}`}>
          <AlertTriangle size={20} />
        </div>

        <h3 className="font-display text-lg font-semibold text-text-primary">{title}</h3>
        <p className="text-sm text-text-secondary mt-2 leading-relaxed">{message}</p>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-lg text-xs font-semibold border border-border-custom text-text-secondary hover:text-text-primary hover:bg-bg-primary transition-all cursor-pointer disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 ${
              danger ? 'bg-red-500 hover:bg-red-600' : 'bg-accent-corail hover:bg-accent-corail-hover'
            }`}
          >
            {isSubmitting && <Loader2 size={12} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

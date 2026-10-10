/**
 * Onglets « Dons » (src/pages/Dashboard.tsx l. 3006) et « Retraits » (l. 3607, fenetre de
 * demande l. 3846).
 */
import type { ReactNode } from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import { Check, Clock, Heart, Wallet, X } from 'lucide-react';
import { CREATOR, DONATIONS, NEW_DONATION } from './data';
import { fcfa, useDark } from './kit';
import { progress } from '../motion';

/* ------------------------------------------------------------------ */
/* Dons                                                                */
/* ------------------------------------------------------------------ */

export function DonationsView({ enterAt, showNew }: { enterAt: number; showNew: boolean }) {
  const frame = useCurrentFrame();
  const rows = [...(showNew ? [{ ...NEW_DONATION, ago: "à l'instant" }] : []), ...DONATIONS.map((d) => ({ ...d, email: '' }))];
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight text-text-primary">Dons reçus</h1>
        <p className="text-xs text-text-secondary mt-1">Liste des personnes qui vous ont fait un don depuis votre profil public.</p>
      </div>
      <div className="flex flex-col gap-3">
        {rows.map((d, idx) => {
          const t = progress(frame, enterAt + idx * 2, enterAt + idx * 2 + 8);
          return (
            <div
              key={d.name}
              className="bg-bg-surface border-border-custom border rounded-[16px] p-4 flex items-start gap-3.5"
              style={{ opacity: t, transform: `translateY(${(1 - t) * 8}px)` }}
            >
              <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-500 shrink-0">
                <Heart size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-text-primary">
                    {d.name} — <span className="text-pink-500">{fcfa(d.amount)} FCFA</span>
                  </h4>
                  <span className="text-[10px] text-text-secondary shrink-0">{d.ago}</span>
                </div>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">{d.message}</p>
                {d.email && <span className="text-[10px] text-text-secondary opacity-70 mt-1 block">{d.email}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Retraits                                                            */
/* ------------------------------------------------------------------ */

export interface WithdrawalRow {
  amount: number;
  date: string;
  status: 'paid' | 'approved' | 'pending';
  /** 0 → 1 pour une demande qui vient d'etre creee. */
  enter?: number;
}

function StatusBadge({ status }: { status: WithdrawalRow['status'] }) {
  const dark = useDark();
  const look = {
    paid: { label: 'Payé', cls: dark ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/25' : 'bg-emerald-100 text-emerald-800' },
    approved: { label: 'Approuvé', cls: dark ? 'bg-blue-500/20 text-blue-400 border border-blue-500/25' : 'bg-blue-100 text-blue-800' },
    pending: { label: 'En attente', cls: dark ? 'bg-amber-500/20 text-amber-400 border border-amber-500/25' : 'bg-amber-100 text-amber-800' },
  }[status];
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${look.cls} text-[9px] font-extrabold uppercase tracking-wide`}>{look.label}</span>;
}

export function WithdrawalsView({
  balance,
  rows,
  success,
  pressed = false,
}: {
  balance: number;
  rows: WithdrawalRow[];
  /** 0 → 1 : bandeau de confirmation apres la demande. */
  success: number;
  /** Bouton « Demander un retrait » enfonce (active:scale-95). */
  pressed?: boolean;
}) {
  const dark = useDark();
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-row items-center justify-between gap-1">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary">Mes retraits</h2>
          <p className="text-xs text-text-secondary mt-0.5">Les demandes sont traitées sous 24-48h ouvrées</p>
        </div>
      </div>

      {success > 0 && (
        <div style={{ height: 50 * Math.min(1, success * 1.5), marginBottom: -32 * (1 - Math.min(1, success * 1.5)), overflow: 'hidden' }}>
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-[16px] text-xs flex items-center gap-2" style={{ opacity: Math.max(0, (success - 0.3) / 0.7) }}>
            <Check className="shrink-0" size={14} />
            <span>Votre demande de retrait a été enregistrée avec succès. Vous recevrez vos fonds sous 24-48h.</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-5 flex flex-col gap-6">
          <div className="bg-bg-surface border-border-custom border rounded-[24px] p-6 shadow-md flex flex-col gap-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-accent-corail" />
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Disponible pour retrait</span>
              <span className="font-display text-[32px] font-black text-accent-corail leading-tight">{fcfa(balance)} FCFA</span>
            </div>

            <div className="pt-4 border-t border-border-custom flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-text-secondary">Compte de versement</span>
                <span className="text-[11px] font-bold text-accent-corail">Modifier</span>
              </div>
              <div className={`p-3 rounded-[16px] ${dark ? 'bg-[#120C19]' : 'bg-gray-50'} flex items-center justify-between border border-border-custom`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <Img src={staticFile('payment-icons/wave.png')} className="w-7 h-7 rounded-full object-cover border border-white shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-text-primary">{CREATOR.payoutLabel}</span>
                    <span className="text-[11px] text-text-secondary font-mono truncate">{CREATOR.payoutPhone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 w-full mt-2">
              <div
                className={`w-full py-3 rounded-[16px] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 ${
                  balance >= 5000 ? 'bg-accent-corail' : 'bg-neutral-300 dark:bg-bg-surface-hover opacity-50'
                }`}
                style={{ transform: pressed ? 'scale(0.95)' : undefined }}
              >
                <Wallet size={14} />
                Demander un retrait
              </div>
            </div>
            {balance < 5000 && <p className="text-[10px] text-text-secondary text-center">Minimum de retrait de 5 000 FCFA requis.</p>}
          </div>

          <div className={`p-4 rounded-[20px] ${dark ? 'bg-[#120C19]' : 'bg-gray-50'} border border-border-custom flex flex-col gap-2`}>
            <h4 className="text-xs font-bold text-text-primary">Comment ça marche ?</h4>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Chaque vente de votre profil génère des revenus nets crédités sur votre compte. Vous pouvez demander un transfert vers votre Mobile Money (Wave, Orange, MTN, Moov) dès que votre solde atteint 5 000 FCFA. Les demandes sont traitées sous 24-48h ouvrées de manière sécurisée.
            </p>
          </div>
        </div>

        <div className="col-span-7 flex flex-col gap-4">
          <h3 className="font-display text-lg font-bold tracking-tight text-text-primary">Historique des demandes</h3>
          <div className="bg-bg-surface border-border-custom border rounded-[24px] overflow-hidden shadow-md">
            <div className="divide-y divide-border-custom">
              {rows.map((w, idx) => {
                const enter = w.enter ?? 1;
                return (
                  <div key={`${w.date}-${idx}`} style={{ height: enter < 1 ? 85 * Math.min(1, enter * 1.6) : undefined, overflow: 'hidden' }}>
                    <div className="p-5 flex items-center justify-between gap-3" style={{ opacity: Math.max(0, (enter - 0.35) / 0.65) }}>
                      <div className="flex items-center gap-3 min-w-0">
                        <Img src={staticFile('payment-icons/wave.png')} className="w-9 h-9 rounded-full object-cover border border-white shrink-0 shadow-sm" />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-text-primary">Retrait {CREATOR.payoutLabel}</span>
                            <span className="text-[10px] text-text-secondary font-mono">({CREATOR.payoutPhone})</span>
                          </div>
                          <span className="text-[10px] text-text-secondary flex items-center gap-1 mt-0.5">
                            <Clock size={10} />
                            Demande le {w.date}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-sm font-bold text-text-primary font-mono">{fcfa(w.amount)} FCFA</span>
                        <StatusBadge status={w.status} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Fenetre « Demande de retrait financier », avec son voile (fixed inset-0 dans l'application). */
export function WithdrawModal({
  open,
  balance,
  amount,
  focused,
  confirmPressed,
  submitting,
}: {
  /** 0 → 1 : ouverture (scale 0.95 → 1, y 10 → 0, fondu), comme le motion.div d'origine. */
  open: number;
  balance: number;
  amount: string;
  focused: boolean;
  confirmPressed: boolean;
  submitting: boolean;
}): ReactNode {
  const dark = useDark();
  if (open <= 0) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" style={{ opacity: Math.min(1, open * 1.4) }}>
      <div
        className="w-full max-w-md bg-bg-surface border-border-custom border rounded-[28px] p-6 shadow-2xl flex flex-col gap-6 relative"
        style={{ opacity: open, transform: `translateY(${(1 - open) * 10}px) scale(${0.95 + 0.05 * open})` }}
      >
        <div className="absolute top-5 right-5 p-1.5 rounded-full text-text-secondary">
          <X size={16} />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-lg font-bold text-text-primary">Demande de retrait financier</h3>
          <p className="text-xs text-text-secondary leading-relaxed">Spécifiez le montant que vous souhaitez transférer vers votre compte Mobile Money.</p>
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-primary">Montant à retirer (FCFA)</label>
              <span className="text-[10px] text-text-secondary">Disponible : {fcfa(balance)} FCFA</span>
            </div>
            <div className="relative">
              <input
                readOnly
                value={amount}
                placeholder="Min: 5000"
                className={`w-full px-4 py-3 rounded-[16px] ${dark ? 'bg-bg-primary' : 'bg-light-bg-primary'} border ${focused ? 'border-accent-corail' : 'border-border-custom'} outline-none font-mono text-sm text-text-primary`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-accent-corail">FCFA</span>
            </div>
          </div>

          <div className={`p-4 rounded-[20px] ${dark ? 'bg-[#120C19]' : 'bg-gray-50'} border border-border-custom flex flex-col gap-2`}>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary">Mode de versement</span>
              <span className="font-bold text-text-primary">{CREATOR.payoutLabel}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary">Numéro Mobile Money</span>
              <span className="font-bold font-mono text-text-primary">{CREATOR.payoutPhone}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-dashed pt-2 mt-1 border-gray-200">
              <span className="text-text-secondary">Frais de transfert</span>
              <span className="font-semibold text-emerald-500 font-mono">0 FCFA (Offerts)</span>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <div className="px-4 py-2.5 rounded-[12px] text-xs font-semibold text-text-secondary">Annuler</div>
            <div
              className="px-5 py-2.5 rounded-[12px] text-xs font-bold bg-accent-corail text-white shadow-md flex items-center gap-1"
              style={{ transform: confirmPressed ? 'scale(0.96)' : undefined, opacity: submitting ? 0.5 : 1 }}
            >
              {submitting ? 'Traitement...' : 'Confirmer la demande'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

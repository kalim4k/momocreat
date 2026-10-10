/**
 * Onglet « Mes ventes » — src/pages/Dashboard.tsx l. 2639 a 2900 (mise en page xl : toutes
 * les colonnes du tableau sont affichees).
 */
import { Img, staticFile, useCurrentFrame } from 'remotion';
import { ArrowUpDown, Check, Eye, Filter, Search, ShoppingBag } from 'lucide-react';
import type { DemoSale } from './data';
import { fcfa, useDark } from './kit';
import { progress } from '../motion';

const METHOD_LOGO: Record<DemoSale['method'], string> = {
  Wave: 'payment-icons/wave.png',
  'Orange Money': 'payment-icons/orange-money.png',
  'MTN MoMo': 'payment-icons/mtn-money.jpg',
};

function SalesCard({ label, value, sub, accent = false }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={`bg-bg-surface border-border-custom border p-5 rounded-[20px] shadow-sm flex flex-col justify-between min-h-[110px] ${accent ? 'border-accent-corail/25' : ''}`}>
      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{label}</span>
      <div className="mt-2">
        <span className={`font-display text-xl font-semibold ${accent ? 'text-accent-corail' : 'text-text-primary'}`}>{value}</span>
        <p className="text-[9px] text-text-secondary mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

export function SalesView({
  sales,
  brut,
  net,
  count,
  enterAt,
  glow = 0,
}: {
  sales: DemoSale[];
  brut: number;
  net: number;
  count: number;
  /** Image d'ouverture de l'onglet : les lignes entrent comme dans l'application (fondu + 10 px). */
  enterAt: number;
  /** Surlignage de la premiere ligne (la vente qui vient d'arriver). */
  glow?: number;
}) {
  const frame = useCurrentFrame();
  const dark = useDark();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight text-text-primary">Mes ventes</h1>
          <p className="text-xs text-text-secondary mt-1">Consultez et gérez l'ensemble des revenus générés par vos créations.</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <SalesCard label="Total Brut" value={`${fcfa(brut)} FCFA`} sub="Volume d'affaires brut" />
        <SalesCard label="Revenu Net" value={`${fcfa(net)} FCFA`} sub="Revenu dans votre poche" accent />
        <SalesCard label="Volume Ventes" value={`${count} ventes`} sub="Nombre total d'achats" />
        <SalesCard label="Panier Moyen" value={`${fcfa(Math.round(net / count))} FCFA`} sub="Valeur nette par commande" />
      </div>

      <div className="bg-bg-surface border-border-custom border p-4 rounded-[20px] shadow-sm flex flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input readOnly placeholder="Rechercher par article, client..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-border-custom text-xs outline-none bg-black/5 text-text-primary" />
        </div>
        {[
          { icon: Filter, label: 'Tous les statuts', w: 'w-48' },
          { icon: ShoppingBag, label: 'Tous les produits', w: 'w-56' },
          { icon: ArrowUpDown, label: "Plus récent d'abord", w: 'w-44' },
        ].map(({ icon: Icon, label, w }) => (
          <div key={label} className={`${w} relative`}>
            <Icon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <div className="w-full pl-9 pr-8 py-2 rounded-xl border border-border-custom text-xs bg-transparent text-text-primary whitespace-nowrap overflow-hidden">{label}</div>
          </div>
        ))}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold shrink-0 border-border-custom text-text-secondary">
          <Eye size={14} />
          <span className="whitespace-nowrap">Masquer</span>
        </div>
      </div>

      <div className="bg-bg-surface border-border-custom border rounded-[20px] overflow-hidden shadow-sm">
        <table className="w-full table-fixed divide-y divide-border-custom">
          <thead className="bg-black/5">
            <tr>
              <th className="px-4 py-4 text-left text-[10px] font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">Produit</th>
              <th className="w-44 px-4 py-4 text-left text-[10px] font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">Client</th>
              <th className="w-48 px-4 py-4 text-left text-[10px] font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">Référence</th>
              <th className="w-28 px-4 py-4 text-right text-[10px] font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">Revenu net</th>
              <th className="w-32 px-4 py-4 text-right text-[10px] font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-custom">
            {sales.map((p, idx) => {
              // motion.tr de l'application : opacity 0 → 1 et y 10 → 0, 0,2 s, decale de 0,03 s par ligne
              const t = progress(frame, enterAt + idx, enterAt + idx + 6);
              return (
                <tr
                  key={p.reference}
                  style={{
                    opacity: t,
                    transform: `translateY(${(1 - t) * 10}px)`,
                    background: idx === 0 && glow ? `color-mix(in srgb, var(--color-accent-corail) ${Math.round(glow * 7)}%, transparent)` : undefined,
                  }}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-[10px] overflow-hidden shrink-0 border border-border-custom bg-accent-corail/10 flex items-center justify-center">
                        <ShoppingBag size={16} className="text-accent-corail" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-text-primary truncate">{p.title}</span>
                        <span className="text-[11px] mt-0.5 text-text-secondary truncate">{p.date}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-xs font-mono font-medium text-text-primary truncate">{p.phone}</span>
                      <span className="flex items-center gap-1.5 min-w-0">
                        <Img src={staticFile(METHOD_LOGO[p.method])} className="h-4 w-4 object-contain rounded-sm bg-white p-0.5 shrink-0" />
                        <span className="text-[11px] font-medium text-text-secondary truncate">{p.method}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-mono text-text-secondary">
                    <span className="block truncate">{p.reference}</span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-right">
                    <span className={`text-xs font-bold ${dark ? 'text-success-gold' : 'text-neutral-950'} font-mono`}>+{fcfa(p.net)} F</span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-right">
                    <span className={`inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-full border text-[11px] font-bold bg-emerald-500/15 border-emerald-500/30 ${dark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                      <Check size={12} strokeWidth={3} className="shrink-0" />
                      Payé
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

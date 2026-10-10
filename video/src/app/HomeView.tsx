/**
 * Onglet « Tableau de bord » — src/pages/Dashboard.tsx l. 2324 a 2628.
 */
import type { ReactNode } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Briefcase, Clock, CreditCard, Grid, Heart, Mail, Plus, ShoppingBag, TrendingUp, Wallet } from 'lucide-react';
import { CREATOR, chartData } from './data';
import { fcfa, useDark, usePulse } from './kit';

export type ActivityType = 'sale' | 'donation' | 'message' | 'partnership' | 'withdrawal';

export interface ActivityRow {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  ago: string;
  amount?: number;
  /** 0 → 1 : la ligne s'ouvre (hauteur) puis apparait, pour une ligne qui arrive. */
  enter?: number;
  /** 0 → 1 : surlignage d'une ligne qui vient d'arriver. */
  glow?: number;
}

const VISUALS = {
  sale: { icon: ShoppingBag, bg: 'bg-accent-corail/10', color: 'text-accent-corail' },
  donation: { icon: Heart, bg: 'bg-pink-500/10', color: 'text-pink-500' },
  message: { icon: Mail, bg: 'bg-accent-corail/10', color: 'text-accent-corail' },
  partnership: { icon: Briefcase, bg: 'bg-purple-500/10', color: 'text-purple-500' },
  withdrawal: { icon: Wallet, bg: 'bg-blue-500/10', color: 'text-blue-500' },
};

function StatCard({ label, iconBox, children, sub }: { label: string; iconBox: ReactNode; children: ReactNode; sub: ReactNode }) {
  return (
    <div className="bg-bg-surface border-border-custom border p-5 rounded-[20px] flex flex-col justify-between min-h-[120px] shadow-sm">
      <div className="flex justify-between items-start">
        <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">{label}</span>
        {iconBox}
      </div>
      <div className="mt-4">
        {children}
        {sub}
      </div>
    </div>
  );
}

export function HomeView({
  revenue,
  donations,
  earnings,
  published,
  chartExtra,
  activity,
}: {
  revenue: number;
  donations: number;
  earnings: number;
  published: number;
  /** Revenu ajoute au dernier point de la courbe (la vente du jour). */
  chartExtra: number;
  activity: ActivityRow[];
}) {
  const dark = useDark();
  const pulse = usePulse();
  const axis = dark ? '#AFA2C3' : '#645878';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight text-text-primary">Bonjour, {CREATOR.displayName}</h1>
          <p className="text-sm text-text-secondary mt-1">Voici un résumé de votre activité</p>
        </div>
        <div className="flex items-center gap-2 px-5 py-3 rounded-[12px] bg-accent-corail text-white text-xs font-semibold shadow-lg shadow-accent-corail/15">
          <Plus size={16} />
          Ajouter un contenu
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {['7 jours', '30 jours', '90 jours', '12 mois'].map((label) => (
          <span
            key={label}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${label === '30 jours' ? 'bg-accent-corail text-white' : 'border border-border-custom text-text-secondary'}`}
          >
            {label}
          </span>
        ))}
        <span className="px-3 py-1.5 rounded-full text-[11px] font-bold border border-border-custom text-text-secondary">Période personnalisée</span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Revenus"
          iconBox={
            <div className="p-2 rounded-[8px] bg-accent-corail/10 text-accent-corail">
              <TrendingUp size={14} />
            </div>
          }
          sub={
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-[10px] text-text-secondary">Sur 30 jours</p>
              <span className="text-[10px] font-bold text-emerald-500">↑18%</span>
            </div>
          }
        >
          <span className="font-display text-2xl font-semibold text-accent-corail">{fcfa(revenue)} FCFA</span>
        </StatCard>

        <StatCard
          label="Dons reçus"
          iconBox={
            <div className="p-2 rounded-[8px] bg-pink-500/10 text-pink-500">
              <Heart size={14} />
            </div>
          }
          sub={
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-[10px] text-text-secondary">Sur 30 jours</p>
              {donations > 0 && <span className="text-[10px] font-bold text-emerald-500">Nouveau</span>}
            </div>
          }
        >
          <span className="font-display text-2xl font-semibold text-text-primary">{fcfa(donations)} FCFA</span>
        </StatCard>

        <StatCard
          label="Revenus totaux"
          iconBox={
            <div className="p-2 rounded-[8px] bg-green-500/10 text-green-400">
              <CreditCard size={14} />
            </div>
          }
          sub={<p className="text-[10px] text-text-secondary mt-0.5">Cumul historique (ventes + dons)</p>}
        >
          <span className="font-display text-2xl font-semibold text-text-primary">{fcfa(earnings)} FCFA</span>
        </StatCard>

        <StatCard
          label="Contenus publiés"
          iconBox={
            <div className="p-2 rounded-[8px] bg-purple-500/10 text-purple-400">
              <Grid size={14} />
            </div>
          }
          sub={<p className="text-[10px] text-text-secondary mt-0.5">+2 sur la période</p>}
        >
          <span className="font-display text-2xl font-semibold text-text-primary">{published} guides</span>
        </StatCard>
      </div>

      <div className="bg-bg-surface border-border-custom border p-6 rounded-[20px] shadow-sm">
        <div className="flex flex-row items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-text-primary tracking-tight">Évolution des revenus</h3>
            <p className="text-xs text-text-secondary">Revenus nets créateur (ventes + dons) sur 30 jours</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-accent-corail/10 text-accent-corail w-fit">
            <span className="w-2 h-2 rounded-full bg-accent-corail" style={{ opacity: pulse }} />
            Données en temps réel
          </div>
        </div>

        <div className="h-[220px] w-full mt-2 font-sans text-[10px]">
          <AreaChart width={896} height={220} data={chartData(chartExtra)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark ? '#322746' : '#E8E2F0'} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} stroke={axis} interval={1} />
            <YAxis tickLine={false} axisLine={false} stroke={axis} domain={[0, 8000]} ticks={[0, 2000, 4000, 6000, 8000]} tickFormatter={(v: number) => v.toLocaleString('fr-FR')} />
            <Area type="monotone" dataKey="revenu" stroke="#7C3AED" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenu)" isAnimationActive={false} />
          </AreaChart>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="font-display text-xl font-medium text-text-primary tracking-tight">Activité récente</h3>
        <div className="bg-bg-surface border-border-custom border rounded-[20px] overflow-hidden shadow-md">
          <div className="divide-y divide-border-custom">
            {activity.map((event) => {
              const visuals = VISUALS[event.type];
              const Icon = visuals.icon;
              const enter = event.enter ?? 1;
              return (
                <div key={event.id} style={{ height: enter < 1 ? 81 * Math.min(1, enter * 1.6) : undefined, overflow: 'hidden' }}>
                  <div
                    className="p-5 flex items-center justify-between gap-3"
                    style={{
                      opacity: Math.max(0, (enter - 0.35) / 0.65),
                      background: event.glow ? `color-mix(in srgb, var(--color-accent-corail) ${Math.round(event.glow * 7)}%, transparent)` : undefined,
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-[10px] ${visuals.bg} flex items-center justify-center ${visuals.color} shrink-0`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-text-primary truncate block">{event.title}</span>
                        <span className="text-[10px] text-text-secondary flex items-center gap-1 mt-0.5 truncate">
                          <Clock size={10} className="shrink-0" />
                          {event.ago} • {event.subtitle}
                        </span>
                      </div>
                    </div>
                    {typeof event.amount === 'number' && (
                      <span className={`text-sm font-bold ${dark ? 'text-success-gold' : 'text-neutral-950'} font-mono shrink-0`}>
                        {event.type === 'withdrawal' ? '-' : '+'}
                        {fcfa(event.amount)} FCFA
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

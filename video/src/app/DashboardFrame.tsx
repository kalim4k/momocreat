/**
 * Le cadre du tableau de bord, version ordinateur : barre laterale, en-tete, zone principale.
 * Classes recopiees de src/pages/Dashboard.tsx (sidebar l. 1793, en-tete l. 1918, main
 * l. 2321), sans les variantes responsive : la scene est toujours en mise en page bureau,
 * alors que les media queries verraient ici la largeur de la video et non celle du decor.
 */
import type { ReactNode } from 'react';
import { Img, staticFile } from 'remotion';
import {
  Bell,
  CheckCircle2,
  ChevronsUpDown,
  Copy,
  Crown,
  Grid,
  Heart,
  Home,
  LogOut,
  PanelLeftClose,
  Search,
  ShoppingBag,
  Store,
  User,
  Wallet,
} from 'lucide-react';
import { CREATOR } from './data';
import { useDark } from './kit';

export type TabId = 'home' | 'messages' | 'sales' | 'donations' | 'withdrawals' | 'content' | 'profile' | 'subscription';

const NAV: { id: TabId; label: string; icon: typeof Home; section: string | null }[] = [
  { id: 'home', label: 'Tableau de bord', icon: Home, section: null },
  { id: 'messages', label: 'Messages', icon: Bell, section: null },
  { id: 'sales', label: 'Mes ventes', icon: ShoppingBag, section: 'Revenus' },
  { id: 'donations', label: 'Dons', icon: Heart, section: 'Revenus' },
  { id: 'withdrawals', label: 'Retraits', icon: Wallet, section: 'Revenus' },
  { id: 'content', label: 'Mon contenu', icon: Grid, section: 'Contenu' },
  { id: 'profile', label: 'Mon profil', icon: User, section: 'Compte' },
  { id: 'subscription', label: 'Abonnement', icon: Crown, section: 'Compte' },
];

/** Hauteur et largeur du decor bureau (px) : la video est rendue a 1,25 fois cette taille. */
export const DESK_W = 1280;
export const DESK_H = 840;

/** Positions utiles pour diriger le curseur (centre de chaque lien de la barre laterale). */
export const NAV_Y: Record<TabId, number> = {
  home: 110,
  messages: 162,
  sales: 250,
  donations: 302,
  withdrawals: 354,
  content: 442,
  profile: 531,
  subscription: 582,
};
export const NAV_X = 130;

function Sidebar({ active, badges }: { active: TabId; badges: Partial<Record<TabId, { count: number; scale: number }>> }) {
  return (
    <aside className="flex flex-col w-64 p-6 bg-bg-surface border-border-custom h-full justify-between shrink-0 z-50">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <Img src={staticFile('logo.png')} className="w-8 h-8 object-contain rounded-lg shadow-sm" />
          </div>
          <span className="font-display font-bold text-lg text-text-primary tracking-tight whitespace-nowrap overflow-hidden">
            MomoLink <span className="text-accent-corail text-xs font-semibold">Pro</span>
          </span>
        </div>

        <nav className="flex flex-col gap-1.5">
          {NAV.map((item, idx) => {
            const Icon = item.icon;
            const isActive = item.id === active;
            const prevSection = idx > 0 ? NAV[idx - 1].section : null;
            const showSectionHeader = !!item.section && item.section !== prevSection;
            const badge = badges[item.id];
            return (
              <div key={item.id} className="contents">
                {showSectionHeader && (
                  <span className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-text-secondary opacity-50">{item.section}</span>
                )}
                <div
                  className={`flex items-center justify-between px-4 py-3 rounded-[12px] text-sm font-medium ${
                    isActive ? 'bg-accent-corail/10 text-accent-corail border border-accent-corail/15 font-semibold' : 'text-text-secondary border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 relative">
                    <Icon size={18} className="shrink-0" />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </div>
                  {badge && badge.count > 0 && (
                    <span
                      className="px-1.5 py-0.5 rounded-full bg-accent-corail text-white text-[10px] font-bold shrink-0 min-w-[18px] text-center"
                      style={{ transform: `scale(${badge.scale})` }}
                    >
                      {badge.count}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-4 border-t border-border-custom pt-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-accent-corail/15 flex items-center justify-center border border-accent-corail/25 shrink-0 overflow-hidden">
            <span className="font-display text-sm font-semibold text-accent-corail uppercase">{CREATOR.displayName.substring(0, 2)}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-text-primary truncate">{CREATOR.displayName}</span>
            <span className="text-[10px] text-text-secondary truncate">@{CREATOR.username}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 rounded-[12px] text-xs font-semibold text-red-400">
          <LogOut size={16} className="shrink-0" />
          <span>Déconnexion</span>
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 rounded-[12px] text-xs font-semibold text-text-secondary border-t border-border-custom mt-1 pt-4">
          <PanelLeftClose size={16} className="shrink-0" />
          <span>Réduire le menu</span>
        </div>
      </div>
    </aside>
  );
}

function Header({ copied }: { copied: boolean }) {
  const dark = useDark();
  return (
    <header className="flex items-center justify-between gap-2 bg-bg-surface border-border-custom border-b px-8 py-3.5 z-40 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-between gap-2 px-4 py-2 rounded-xl border border-border-custom bg-bg-surface text-left shadow-sm w-[220px]">
          <div className="flex items-center gap-2 overflow-hidden w-full justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <Store size={14} className="text-accent-corail shrink-0" />
              <span className="font-bold text-text-primary truncate text-xs">{CREATOR.displayName}</span>
            </div>
            <ChevronsUpDown size={12} className="text-gray-400 shrink-0" />
          </div>
        </div>
      </div>

      <div className="flex items-center relative w-full max-w-sm mx-4">
        <Search size={14} className="absolute left-3.5 text-gray-400" />
        <input
          readOnly
          placeholder="Trouvez n'importe quoi : Appuyez sur ⌘K"
          className="w-full pl-9 pr-12 py-2 rounded-xl text-xs border border-border-custom bg-neutral-50/50 dark:bg-bg-primary outline-none"
        />
        <div className="absolute right-2 px-1.5 py-0.5 rounded border border-border-custom bg-neutral-100 dark:bg-bg-surface-hover text-[9px] font-mono text-neutral-400">⌘K</div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className={`flex items-center rounded-xl overflow-hidden border border-border-custom ${dark ? 'bg-bg-primary' : 'bg-gray-50/50'} p-0.5 shadow-sm shrink-0`}>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-text-primary whitespace-nowrap">
            <Store size={14} className="shrink-0" />
            <span className="whitespace-nowrap">Visiter ma boutique</span>
          </div>
          <div className={`w-px h-5 ${dark ? 'bg-bg-surface-hover' : 'bg-gray-200'} shrink-0`} />
          <div className="p-1.5 rounded-lg text-text-secondary flex items-center justify-center shrink-0">
            {copied ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> : <Copy size={14} className="shrink-0" />}
          </div>
        </div>

        <div className="w-9 h-9 rounded-xl border border-border-custom text-text-secondary flex items-center justify-center overflow-hidden">
          <User size={15} />
        </div>
      </div>
    </header>
  );
}

/** Position du bouton « copier le lien » de l'en-tete, pour le curseur. */
export const COPY_BUTTON = { x: 1186, y: 32 };

export function DashboardFrame({
  active,
  badges = {},
  copied = false,
  scroll = 0,
  overlay,
  children,
}: {
  active: TabId;
  badges?: Partial<Record<TabId, { count: number; scale: number }>>;
  copied?: boolean;
  /** Defilement vertical de la zone principale, en px. */
  scroll?: number;
  /** Fenetre modale, posee au-dessus de tout comme dans l'application (fixed inset-0). */
  overlay?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative flex flex-row h-full w-full overflow-hidden bg-bg-primary text-text-primary font-sans" style={{ width: DESK_W, height: DESK_H }}>
      <Sidebar active={active} badges={badges} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header copied={copied} />
        <div className="flex-1 overflow-hidden">
          <main className="p-10 max-w-6xl mx-auto w-full" style={{ transform: `translateY(${-scroll}px)` }}>
            {children}
          </main>
        </div>
      </div>
      {overlay}
    </div>
  );
}

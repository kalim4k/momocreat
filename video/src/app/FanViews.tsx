/**
 * Ce que voit le fan sur son telephone : la boutique publique (src/pages/CreatorPublicProfile.tsx
 * l. 663), la feuille de paiement (l. 1008), la feuille de don (l. 1254) et l'ecran de
 * confirmation au retour de l'operateur (src/pages/PaymentConfirm.tsx l. 120).
 *
 * Mise en page mobile uniquement (les classes de base, sans les variantes md:). La boutique
 * n'a pas de theme sombre dans l'application, ces ecrans non plus.
 */
import type { CSSProperties, ReactNode } from 'react';
import { Img, staticFile } from 'remotion';
import { ArrowRight, Check, Heart, Loader2, Lock, Mail, Share2, Smartphone, Sparkles, X } from 'lucide-react';
import { CONTENTS, CREATOR, type DemoContent } from './data';
import { fcfa, usePing, usePulse, useSpin } from './kit';

export const PHONE_W = 390;
export const PHONE_H = 845;
/** Barre d'etat + barre d'adresse du navigateur, au-dessus de la page. */
export const CHROME_H = 47 + 44;

/* ------------------------------------------------------------------ */
/* Habillage du telephone                                              */
/* ------------------------------------------------------------------ */

function StatusBar({ dark }: { dark: boolean }) {
  const ink = dark ? '#FFFFFF' : '#111111';
  return (
    <div className="flex items-center justify-between px-8 pt-[15px]" style={{ height: 47, color: ink }}>
      <span className="text-[15px] font-semibold tracking-tight" style={{ fontFamily: '-apple-system, "SF Pro Text", "Plus Jakarta Sans", sans-serif' }}>
        9:41
      </span>
      <div className="flex items-center gap-1.5">
        {/* reseau */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill={ink}>
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        {/* wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill={ink}>
          <path d="M8 2.4c2.3 0 4.4.9 6 2.4l1.3-1.3A10.3 10.3 0 0 0 8 .5 10.3 10.3 0 0 0 .7 3.5L2 4.8a8.5 8.5 0 0 1 6-2.4Zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.3-1.3A6.6 6.6 0 0 0 8 4.1 6.6 6.6 0 0 0 3.3 6l1.3 1.3C5.5 6.5 6.7 6 8 6Zm0 3.5c-.6 0-1.1.2-1.5.6L8 11.6l1.5-1.5c-.4-.4-.9-.6-1.5-.6Z" />
        </svg>
        {/* batterie */}
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke={ink} opacity="0.4" />
          <rect x="2" y="2" width="18" height="9" rx="2" fill={ink} />
          <path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill={ink} opacity="0.4" />
        </svg>
      </div>
    </div>
  );
}

/** Barre d'adresse du navigateur integre (lien ouvert depuis une bio TikTok ou Instagram). */
function AddressBar({ dark }: { dark: boolean }) {
  return (
    <div className="flex items-center justify-center px-4" style={{ height: 44 }}>
      <div
        className="flex items-center justify-center gap-1.5 rounded-full px-4 h-[34px] w-full text-[13px] font-medium"
        style={{ background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(17,17,17,0.06)', color: dark ? '#D9D3E3' : '#3A3346' }}
      >
        <Lock size={11} strokeWidth={2.5} />
        <span>@{CREATOR.username}</span>
      </div>
    </div>
  );
}

/** Haut d'ecran seul : barre d'etat et barre d'adresse (lien de la boutique). */
export function BrowserTop({ dark = false }: { dark?: boolean }) {
  return (
    <div style={{ background: dark ? '#120C19' : '#FFFFFF' }}>
      <StatusBar dark={dark} />
      <AddressBar dark={dark} />
    </div>
  );
}

/**
 * Ecran de telephone : barre d'etat, barre d'adresse, page, barre d'accueil. `dark` suit la
 * couleur de la page affichee (l'ecran de confirmation est sombre).
 */
export function PhoneScreen({ dark = false, page, overlay }: { dark?: boolean; page: ReactNode; overlay?: ReactNode }) {
  return (
    <div className="relative overflow-hidden font-sans" style={{ width: PHONE_W, height: PHONE_H, background: dark ? '#120C19' : '#FFFFFF' }}>
      <div className="relative z-[60]" style={{ background: dark ? '#120C19' : '#FFFFFF' }}>
        <StatusBar dark={dark} />
        <AddressBar dark={dark} />
      </div>
      <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ top: CHROME_H }}>
        {page}
        {overlay}
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 h-[5px] w-[134px] rounded-full z-[400]" style={{ background: dark ? '#FFFFFF' : '#111111' }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Boutique publique                                                   */
/* ------------------------------------------------------------------ */

function ContentTypeIcon({ type }: { type: DemoContent['type'] }) {
  if (type === 'video') {
    return (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

const SOCIALS = [
  <svg key="tiktok" viewBox="0 0 24 24" className="w-5 h-5 fill-current" stroke="none">
    <path d="M12 2a1 1 0 0 0-1 1v11.69A3.33 3.33 0 0 1 8.33 18 3.34 3.34 0 0 1 5 14.67a3.34 3.34 0 0 1 3.33-3.34c.43 0 .84.09 1.22.25a1 1 0 1 0 .76-1.85 5.3 5.3 0 0 0-1.98-.4A5.34 5.34 0 0 0 3 14.67a5.34 5.34 0 0 0 5.33 5.33A5.34 5.34 0 0 0 13.67 15V9.45A7.01 7.01 0 0 0 18 11.5a1 1 0 1 0 0-2 5 5 0 0 1-5-5V3a1 1 0 0 0-1-1z" />
  </svg>,
  <svg key="instagram" viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>,
  <svg key="whatsapp" viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>,
];

export function PublicProfile({
  scroll = 0,
  purchased = [],
  pressed,
  totalSales = 128,
}: {
  scroll?: number;
  /** Contenus deja achetes : leur bouton devient « Voir le contenu ». */
  purchased?: string[];
  /** Bouton enfonce : 'donate' ou l'id d'un contenu. */
  pressed?: string | null;
  totalSales?: number;
}) {
  const press = (id: string): CSSProperties | undefined => (pressed === id ? { transform: 'scale(0.95)' } : undefined);
  return (
    <div className="min-h-full bg-[#FAF8FC] text-[#1D1327] flex flex-col pb-16 relative" style={{ transform: `translateY(${-scroll}px)` }}>
      <div className="border-b border-gray-200 bg-white/70 px-4 py-3 relative z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 opacity-90">
            <Img src={staticFile('logo.png')} className="h-6 w-6 object-contain rounded-md" />
            <span className="font-display font-bold text-sm tracking-tight text-neutral-900">
              MomoLink <span className="text-accent-corail text-xs font-semibold">Pro</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-500">Retrouvez vos contenus</span>
            <span className="text-[10px] border border-gray-200 px-2.5 py-1 rounded-full font-bold text-gray-500">Vérifier</span>
          </div>
        </div>
      </div>

      <div className="relative w-full h-40 bg-gray-100 overflow-hidden border-b border-gray-200">
        <div className="w-full h-full bg-gradient-to-r from-accent-corail/15 via-accent-corail/5 to-yellow-500/15" />
      </div>

      <div className="max-w-3xl mx-auto px-4 w-full -mt-16 flex flex-col gap-8 relative z-10">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-accent-corail flex items-center justify-center border-2 border-accent-corail text-white shadow-lg">
              <span className="font-display text-2xl font-bold tracking-tight">{CREATOR.initials}</span>
            </div>
            <span className="absolute bottom-0 right-0 bg-[#FFB020] text-black rounded-full p-1 border-2 border-[#FAF8FC] shadow">
              <Sparkles size={12} />
            </span>
          </div>

          <div className="flex flex-col gap-2 max-w-md">
            <h1 className="font-display text-[22px] font-bold text-neutral-900 leading-tight">{CREATOR.displayName}</h1>
            <span className="text-xs text-accent-corail font-mono font-semibold">@{CREATOR.username}</span>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{CREATOR.bio}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-700 shadow-sm">
              <Share2 size={14} />
              <span>Partager le profil</span>
            </div>
            <div
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border text-xs font-semibold shadow-sm ${pressed === 'donate' ? 'border-pink-400 text-pink-500' : 'border-gray-200 text-gray-700'}`}
              style={press('donate')}
            >
              <Heart size={14} />
              <span>Faire un don</span>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-700 shadow-sm">
              <Mail size={14} />
              <span>Contacter</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3.5 mt-1.5">
            {SOCIALS.map((icon, i) => (
              <span key={i} className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-500">
                {icon}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <div className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-[11px] font-medium text-gray-500">
              <strong className="text-accent-corail font-semibold">{CONTENTS.length}</strong> contenus exclusifs
            </div>
            <div className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-[11px] font-medium text-gray-500">
              <strong className="text-accent-corail font-semibold">{totalSales}</strong> ventes réalisées
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200" />

        <div className="flex flex-col gap-6">
          <h2 className="font-display text-lg font-bold text-neutral-900 tracking-tight">Contenus exclusifs</h2>
          <div className="grid grid-cols-2 gap-4">
            {CONTENTS.map((content) => {
              const bought = purchased.includes(content.id);
              return (
                <div key={content.id} className="bg-white border border-gray-200 rounded-[20px] p-4 flex flex-col justify-between gap-3 relative overflow-hidden shadow-md">
                  <div className="relative aspect-video w-full rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                    <div className="text-gray-400">
                      <ContentTypeIcon type={content.type} />
                    </div>
                    {!bought && (
                      <div className="absolute inset-0 bg-[#120C19]/60 flex items-center justify-center z-10">
                        <div className="p-2.5 bg-[#120C19]/80 rounded-full border border-gray-700 text-gray-400">
                          <Lock size={15} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-gray-400">{content.type}</span>
                    <h4 className="text-xs font-bold text-neutral-900 line-clamp-2 leading-snug">{content.title}</h4>
                    <p className="text-[10px] text-gray-500 line-clamp-2 leading-snug">{content.description}</p>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase text-gray-400 font-semibold">Tarif</span>
                      <span className="text-xs font-bold text-accent-corail font-mono">{fcfa(content.price)} FCFA</span>
                    </div>
                    {bought ? (
                      <div className="w-full py-2.5 rounded-xl text-[11px] font-bold text-white bg-[#FFB020] flex items-center justify-center gap-1 shadow-md shadow-[#FFB020]/10">
                        <span>▶ Voir le contenu</span>
                      </div>
                    ) : (
                      <div
                        className={`w-full py-2.5 rounded-xl text-[11px] font-bold text-white flex items-center justify-center gap-1 ${pressed === content.id ? 'bg-accent-corail-hover' : 'bg-accent-corail'}`}
                        style={press(content.id)}
                      >
                        <span>Débloquer</span>
                      </div>
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

/* ------------------------------------------------------------------ */
/* Feuilles du bas (paiement, don)                                     */
/* ------------------------------------------------------------------ */

/** Voile + feuille qui monte du bas, comme le motion.div d'origine (ressort 25 / 250). */
function BottomSheet({ open, gap, children }: { open: number; gap: string; children: ReactNode }) {
  if (open <= 0) return null;
  return (
    <div className="absolute inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" style={{ opacity: Math.min(1, open) }} />
      <div
        className={`absolute inset-x-0 bottom-0 w-full p-6 bg-white border-t border-gray-200 rounded-t-[20px] shadow-2xl flex flex-col ${gap} z-50 text-left`}
        style={{ transform: `translateY(${(1 - open) * 100}%)` }}
      >
        <div className="absolute top-4 right-4 p-1.5 rounded-full border border-gray-200 text-gray-500">
          <X size={16} />
        </div>
        {children}
      </div>
    </div>
  );
}

const FIELD = 'w-full px-3.5 py-2.5 rounded-xl border bg-gray-50 text-xs text-neutral-900 outline-none';
const focusRing = (on: boolean) => (on ? 'border-accent-corail ring-1 ring-accent-corail' : 'border-gray-200');

export interface PaymentFields {
  first: string;
  last: string;
  email: string;
  phone: string;
  focus?: 'first' | 'last' | 'email' | 'phone' | null;
}

export function PaymentSheet({
  open,
  step,
  fields,
  status,
  payPressed,
}: {
  open: number;
  step: 'details' | 'loading';
  fields: PaymentFields;
  status: string;
  payPressed?: boolean;
}) {
  const content = CONTENTS[0];
  const spin = useSpin();
  const ping = usePing();
  const pulse = usePulse();
  const complete = fields.first && fields.last && fields.email && fields.phone;
  return (
    <BottomSheet open={open} gap="gap-5">
      <div className="flex flex-col gap-4">
        {step === 'details' ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-accent-corail uppercase tracking-widest">Achat Sécurisé par Mobile Money</span>
              <h3 className="font-display text-lg font-medium text-neutral-900">Débloquer le contenu</h3>
              <div className="p-3 rounded-xl border border-gray-200 mt-2 bg-gray-50 flex items-start gap-3">
                <div className="p-2 bg-accent-corail/10 text-accent-corail rounded-lg shrink-0">
                  <Lock size={16} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-xs text-neutral-900 line-clamp-1">{content.title}</h4>
                  <span className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{content.description}</span>
                </div>
              </div>
            </div>

            <div className="text-center py-2">
              <span className="text-[10px] uppercase text-gray-500 tracking-widest font-bold">Montant à régler</span>
              <div className="font-display text-3xl font-bold text-accent-corail mt-1">{fcfa(content.price)} FCFA</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 pl-0.5">Prénom</label>
                <input readOnly value={fields.first} placeholder="John" className={`${FIELD} ${focusRing(fields.focus === 'first')}`} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 pl-0.5">Nom d'usage</label>
                <input readOnly value={fields.last} placeholder="Doe" className={`${FIELD} ${focusRing(fields.focus === 'last')}`} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 pl-0.5">Adresse email</label>
              <input readOnly value={fields.email} placeholder="buyer@email.com" className={`${FIELD} ${focusRing(fields.focus === 'email')}`} />
              <span className="text-[9px] text-gray-500 pl-0.5 leading-none">Obligatoire — servira d'identifiant pour accéder au contenu ultérieurement.</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 pl-0.5">Téléphone Mobile Money</label>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input readOnly value={fields.phone} placeholder="+221 77 123 45 67" className={`${FIELD} pl-9 pr-4 font-mono ${focusRing(fields.focus === 'phone')}`} />
              </div>
              <span className="text-[9px] text-gray-500 pl-0.5 leading-none">Le numéro utilisé pour payer via Mobile Money.</span>
            </div>

            <div
              className={`w-full py-3.5 rounded-xl text-xs font-semibold text-white shadow-md flex items-center justify-center gap-2 ${payPressed ? 'bg-accent-corail-hover' : 'bg-accent-corail'}`}
              style={{ opacity: complete ? 1 : 0.5, transform: payPressed ? 'scale(0.98)' : undefined }}
            >
              <span>Payer {fcfa(content.price)} FCFA</span>
              <ArrowRight size={14} />
            </div>
          </div>
        ) : (
          <div className="py-10 flex flex-col items-center justify-center gap-5 text-center">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full border-4 border-accent-corail/20" style={ping} />
              <Loader2 className="text-accent-corail h-10 w-10" style={{ transform: `rotate(${spin}deg)` }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <h4 className="font-semibold text-sm text-neutral-900">Traitement en cours...</h4>
              <div className="mt-1 px-4 py-2 rounded-lg bg-accent-corail/10 text-accent-corail border border-accent-corail/20 text-xs font-medium inline-block" style={{ opacity: pulse }}>
                {status}
              </div>
              <p className="text-xs text-gray-500 mt-1 max-w-[260px] mx-auto leading-relaxed">
                Connexion sécurisée à votre opérateur <strong className="uppercase">wave</strong>...
              </p>
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}

export interface DonationFields {
  amount: number;
  name: string;
  message: string;
  focus?: 'amount' | 'name' | 'message' | null;
  /** Montant sous le doigt. */
  pressedAmount?: number | null;
}

export function DonationSheet({ open, fields, donating, sendPressed }: { open: number; fields: DonationFields; donating: boolean; sendPressed?: boolean }) {
  const spin = useSpin();
  const input = (on: boolean) => `w-full px-3 py-2.5 rounded-lg border text-sm outline-none bg-white text-neutral-900 ${on ? 'border-pink-400' : 'border-gray-200'}`;
  return (
    <BottomSheet open={open} gap="gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">Soutenir {CREATOR.displayName}</span>
        <h3 className="font-display text-lg font-medium text-neutral-900">Faire un don</h3>
      </div>
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600">Montant (FCFA)</label>
          <div className="flex gap-2">
            {[1000, 2500, 5000, 10000].map((amt) => (
              <div
                key={amt}
                className={`flex-1 py-2 rounded-lg text-xs font-bold border text-center ${fields.amount === amt ? 'bg-pink-500 border-pink-500 text-white' : 'bg-white border-gray-200 text-gray-600'}`}
                style={fields.pressedAmount === amt ? { transform: 'scale(0.95)' } : undefined}
              >
                {amt.toLocaleString('fr-FR')}
              </div>
            ))}
          </div>
          <input readOnly value={fields.amount} className={input(false)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600">Votre nom</label>
          <input readOnly value={fields.name} placeholder="Votre nom ou pseudo" className={input(fields.focus === 'name')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600">Email (optionnel)</label>
          <input readOnly value="" placeholder="votre@email.com" className={input(false)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600">Un petit mot (optionnel)</label>
          <textarea readOnly value={fields.message} placeholder="Continue comme ça !" rows={2} className={`${input(fields.focus === 'message')} resize-none`} />
        </div>
        <div
          className="w-full py-3 rounded-xl text-xs font-bold text-white bg-pink-500 flex items-center justify-center gap-2"
          style={{ opacity: donating || !fields.name ? 0.6 : 1, transform: sendPressed ? 'scale(0.98)' : undefined }}
        >
          {donating ? <Loader2 size={14} style={{ transform: `rotate(${spin}deg)` }} /> : <Heart size={14} />}
          <span>{donating ? 'Redirection...' : `Envoyer ${fields.amount.toLocaleString('fr-FR')} FCFA`}</span>
        </div>
      </div>
    </BottomSheet>
  );
}

/* ------------------------------------------------------------------ */
/* Confirmation au retour de l'operateur                               */
/* ------------------------------------------------------------------ */

export function PaymentConfirm({
  status,
  donation = false,
  pop = 1,
  pressed,
}: {
  status: 'loading' | 'success';
  donation?: boolean;
  /** 0 → 1 : apparition du resultat (le check se pose avec un rebond). */
  pop?: number;
  pressed?: 'view' | 'back' | null;
}) {
  const spin = useSpin();
  const ping = usePing();
  return (
    <div className="h-full bg-[#120C19] text-[#FAF8FC] flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-[#1B1325] border border-neutral-800 rounded-[28px] p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-accent-corail/10 rounded-full blur-[60px]" />

        {status === 'loading' ? (
          <div className="py-6 flex flex-col items-center gap-6">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full border-4 border-accent-corail/10" style={ping} />
              <Loader2 className="text-accent-corail h-12 w-12" style={{ transform: `rotate(${spin}deg)` }} />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-xl font-bold tracking-tight">Vérification du paiement...</h1>
              <p className="text-sm text-neutral-400 max-w-[320px] leading-relaxed">Nous interrogeons l'opérateur pour confirmer votre transaction. Veuillez patienter.</p>
            </div>
            <div className="px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-500">Tentative 1 / 5</div>
          </div>
        ) : (
          <div className="py-4 flex flex-col items-center gap-6">
            <div className="p-4 bg-[#FFB020]/10 text-[#FFB020] rounded-full border border-[#FFB020]/20" style={{ transform: `scale(${0.6 + 0.4 * pop})`, opacity: Math.min(1, 0.4 + pop) }}>
              <Check size={40} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col gap-2" style={{ opacity: Math.min(1, 0.15 + pop * 1.4) }}>
              <h1 className="font-display text-2xl font-bold tracking-tight text-[#FFB020]">{donation ? 'Don envoyé !' : 'Paiement réussi !'}</h1>
              <p className="text-sm text-neutral-400 max-w-[340px] leading-relaxed">
                {donation ? (
                  <>Merci pour votre soutien, le créateur a bien reçu votre don.</>
                ) : (
                  <>
                    Votre contenu <strong className="text-[#FAF8FC]">{CONTENTS[0].title}</strong> est maintenant disponible.
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full mt-6" style={{ opacity: Math.min(1, 0.15 + pop * 1.4) }}>
              {donation ? (
                <div className="w-full py-3.5 rounded-xl text-xs font-bold text-black bg-[#FFB020] flex items-center justify-center gap-1.5 shadow" style={pressed === 'back' ? { transform: 'scale(0.97)' } : undefined}>
                  <span>Retour au profil</span>
                  <ArrowRight size={14} />
                </div>
              ) : (
                <>
                  <div className="w-full py-3.5 rounded-xl text-xs font-bold text-black bg-[#FFB020] flex items-center justify-center gap-1.5 shadow" style={pressed === 'view' ? { transform: 'scale(0.97)' } : undefined}>
                    <span>Voir le contenu</span>
                    <ArrowRight size={14} />
                  </div>
                  <div className="w-full py-3.5 rounded-xl text-xs font-semibold text-neutral-400 bg-transparent border border-neutral-800" style={pressed === 'back' ? { transform: 'scale(0.97)', background: 'rgba(255,255,255,0.05)' } : undefined}>
                    Retour au profil
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


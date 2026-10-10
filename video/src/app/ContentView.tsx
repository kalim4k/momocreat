/**
 * Onglet « Mon contenu » — src/pages/Dashboard.tsx l. 3064 (en-tete), l. 3115 (formulaire de
 * creation, ouvert sous l'en-tete), l. 3441 (cartes).
 */
import type { ReactNode } from 'react';
import { Check, CheckCircle2, Clock, FileText, ImageIcon, MoreVertical, Plus, UploadCloud, Video, X } from 'lucide-react';
import type { DemoContent } from './data';
import { fcfa, useDark, useSpin } from './kit';

function TypeIcon({ type }: { type: DemoContent['type'] }) {
  return type === 'video' ? <Video size={24} className="text-accent-corail" /> : <FileText size={24} className="text-emerald-400" />;
}

export function ContentCard({ content, style }: { content: DemoContent; style?: React.CSSProperties }) {
  const dark = useDark();
  return (
    <div className="bg-bg-surface border-border-custom border rounded-[20px] p-4 flex flex-col justify-between gap-4 relative shadow-md" style={style}>
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-12 h-12 rounded-[12px] ${dark ? 'bg-[#120C19]' : 'bg-gray-50'} flex items-center justify-center shrink-0 border border-border-custom overflow-hidden`}>
            <TypeIcon type={content.type} />
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="text-xs font-bold text-text-primary line-clamp-1">{content.title}</h4>
            <span className="text-[10px] text-text-secondary mt-0.5 font-mono flex items-center gap-1">
              <Clock size={10} />
              {content.date}
            </span>
          </div>
        </div>
        <div className="relative shrink-0">
          <div className="p-1.5 rounded-lg text-text-secondary">
            <MoreVertical size={16} />
          </div>
        </div>
      </div>

      <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2">{content.description}</p>

      <div className="flex items-center justify-between border-t border-border-custom pt-3 mt-1">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-text-secondary font-semibold">Prix</span>
          <span className="text-sm font-extrabold text-accent-corail font-mono">{fcfa(content.price)} FCFA</span>
        </div>
        <div className="flex items-center gap-2">
          {content.status === 'published' ? (
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFB020] text-[#120C19] text-[9px] font-extrabold uppercase tracking-widest shadow-sm">Publié</span>
          ) : (
            <span className={`px-2.5 py-0.5 rounded-full ${dark ? 'bg-[#2A1F38] text-[#AFA2C3]' : 'bg-gray-100 text-gray-600'} text-[9px] font-bold uppercase tracking-widest`}>Brouillon</span>
          )}
          <span className={`text-[10px] text-text-secondary uppercase font-bold px-2 py-0.5 ${dark ? 'bg-[#120C19]' : 'bg-gray-100'} rounded-md border border-border-custom font-mono shrink-0`}>
            {content.type}
          </span>
        </div>
      </div>
    </div>
  );
}

export interface FormState {
  title: string;
  description: string;
  price: string;
  /** Champ qui a le focus (bordure prune). */
  focus?: 'title' | 'description' | 'price' | null;
  /** Fichier depose dans la zone. */
  file?: { name: string; size: string } | null;
  /** Fichier en cours de glisser au-dessus de la zone. */
  dragActive?: boolean;
  publishing?: boolean;
  publishPressed?: boolean;
}

function Field({ label, counter, children }: { label: string; counter?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-text-primary flex justify-between">
        <span>{label}</span>
        {counter && <span className="text-text-secondary">{counter}</span>}
      </label>
      {children}
    </div>
  );
}

export function ContentForm({ form }: { form: FormState }) {
  const dark = useDark();
  const spin = useSpin();
  const input = (focused: boolean) =>
    `w-full px-3.5 py-2.5 rounded-[12px] ${dark ? 'bg-bg-primary' : 'bg-light-bg-primary'} border ${focused ? 'border-accent-corail' : 'border-border-custom'} text-xs text-text-primary ${dark ? 'placeholder:text-text-secondary/60' : 'placeholder:text-gray-400'} outline-none`;

  return (
    <div className="bg-bg-surface border-border-custom border p-6 rounded-[20px] flex flex-col gap-5 shadow-inner">
      <div className="flex justify-between items-center pb-2 border-b border-border-custom">
        <h2 className="font-display text-lg font-semibold text-text-primary flex items-center gap-2">
          <Plus className="text-accent-corail" size={18} />
          Créer un nouveau contenu exclusif
        </h2>
        <div className="p-1.5 rounded-lg text-text-secondary">
          <X size={16} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="flex flex-col gap-4">
          <Field label="Titre du contenu *" counter={`${form.title.length}/80`}>
            <input readOnly value={form.title} placeholder="ex: Guide ultime pour doubler ses ventes TikTok" className={input(form.focus === 'title')} />
          </Field>
          <Field label="Description (Optionnelle)" counter={`${form.description.length}/300`}>
            <textarea readOnly value={form.description} rows={3} placeholder="Décrivez brièvement la valeur de votre guide..." className={`${input(form.focus === 'description')} resize-none`} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-primary">Type de contenu</label>
              <div className={`w-full px-3 py-2.5 rounded-[12px] ${dark ? 'bg-bg-primary' : 'bg-light-bg-primary'} border border-border-custom text-xs text-text-primary`}>📄 Fichier PDF</div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-primary">Prix d'achat (FCFA) *</label>
              <input readOnly value={form.price} placeholder="ex: 2000" className={`${input(form.focus === 'price')} font-mono`} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs font-semibold text-text-primary">Fichier principal obligatoire *</label>
            <div
              className={`flex-1 border-2 border-dashed rounded-[16px] p-5 flex flex-col items-center justify-center text-center ${
                form.dragActive ? 'border-accent-corail bg-accent-corail/5' : dark ? 'border-border-custom' : 'border-gray-300'
              }`}
            >
              <UploadCloud size={28} className="text-text-secondary mb-2" />
              {form.file ? (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-accent-corail truncate max-w-[200px]">{form.file.name}</span>
                  <span className="text-[10px] text-text-secondary">{form.file.size}</span>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-text-primary">Glissez-déposez votre fichier ici</span>
                  <span className="text-[10px] text-text-secondary">ou cliquez pour parcourir</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-primary">Image de prévisualisation (Optionnelle)</label>
            <div className={`border-2 border-dashed rounded-[16px] p-3 flex items-center justify-center text-center ${dark ? 'border-border-custom' : 'border-gray-300'}`}>
              <div className="flex items-center gap-3">
                <ImageIcon size={18} className="text-text-secondary shrink-0" />
                <span className="text-[11px] text-text-secondary block">PNG, JPG ou WEBP de couverture</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3 mt-2 border-t border-border-custom pt-4">
        <div className="px-4 py-2.5 rounded-[12px] text-xs font-semibold text-text-secondary">Annuler</div>
        <div className={`px-4 py-2.5 rounded-[12px] text-xs font-semibold ${dark ? 'bg-[#2A1F38] text-text-primary' : 'bg-gray-100 text-light-text-primary'}`}>Enregistrer en brouillon</div>
        <div
          className="px-5 py-2.5 rounded-[12px] text-xs font-bold bg-accent-corail text-white shadow-md flex items-center gap-1.5"
          style={{ transform: form.publishPressed ? 'scale(0.96)' : undefined, opacity: form.publishing ? 0.5 : 1 }}
        >
          {form.publishing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" style={{ transform: `rotate(${spin}deg)` }} />
              Publication...
            </>
          ) : (
            <>
              <CheckCircle2 size={14} />
              Publier maintenant
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** En-tete de l'onglet. `count` = nombre de contenus geres. */
export function ContentHeader({ count, formOpen }: { count: number; formOpen: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight text-text-primary">Mon contenu</h1>
        <p className="text-xs text-text-secondary mt-0.5">
          {count} contenu{count > 1 ? 's' : ''} géré{count > 1 ? 's' : ''}
        </p>
      </div>
      {!formOpen && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-white text-xs font-semibold shadow-md bg-accent-corail">
          <Plus size={16} />
          Ajouter un contenu
        </div>
      )}
    </div>
  );
}

/** Bandeau vert affiche dans le formulaire apres la publication (successMsg). */
export function PublishedNotice({ text }: { text: string }) {
  return (
    <div className="p-3.5 rounded-[12px] bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-start gap-2">
      <Check size={16} className="shrink-0 mt-0.5" />
      <span>{text}</span>
    </div>
  );
}

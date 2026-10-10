/**
 * Donnees de demonstration des scenes : la meme creatrice et les memes contenus que le mode
 * demo de l'application (Ama Coaching), pour que la video et l'application racontent la meme
 * histoire. Les montants nets sont ceux que l'application affiche : 90 % du prix, apres la
 * commission de 10 %.
 */

export const CREATOR = {
  displayName: 'Ama Coaching',
  username: 'ama_coaching',
  initials: 'AC',
  bio: "Coach business. J'aide les créateurs à vivre de leur audience.",
  payoutLabel: 'Wave',
  payoutPhone: '+228 90 00 00 01',
};

export type ContentType = 'pdf' | 'video' | 'image' | 'audio';

export interface DemoContent {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  price: number;
  date: string;
  status: 'published' | 'draft';
}

export const CONTENTS: DemoContent[] = [
  {
    id: 'pack',
    title: 'Pack PDF : Booster son audience TikTok en 30 jours',
    description: "Ma méthode exacte, mes scripts prêts à l'emploi et mon calendrier éditorial pour passer de 0 à 10 000 abonnés rapidement.",
    type: 'pdf',
    price: 2500,
    date: '9 oct. 2026',
    status: 'published',
  },
  {
    id: 'notion',
    title: 'Template Notion : Organiser ses tournages Reels & TikTok',
    description: "Le template complet que j'utilise au quotidien pour planifier mes tournages, rédiger mes accroches et suivre mes métriques.",
    type: 'pdf',
    price: 1500,
    date: '8 oct. 2026',
    status: 'published',
  },
  {
    id: 'masterclass',
    title: "Masterclass : Décryptage de l'Algorithme 2026 (Vidéo 20m)",
    description: "Une vidéo exclusive de 20 minutes où je vous montre les coulisses de l'algorithme actuel, et comment maximiser le taux de rétention.",
    type: 'video',
    price: 5000,
    date: '7 oct. 2026',
    status: 'published',
  },
];

export const PACK = CONTENTS[0];

export interface DemoSale {
  title: string;
  date: string;
  phone: string;
  method: 'Wave' | 'Orange Money' | 'MTN MoMo';
  reference: string;
  net: number;
}

/** Ventes deja enregistrees (onglet « Mes ventes »), de la plus recente a la plus ancienne. */
export const SALES: DemoSale[] = [
  { title: CONTENTS[0].title, date: '10 oct. 2026', phone: '+221 77 123 45 67', method: 'Wave', reference: 'WAVE-892374-MOMO', net: 2250 },
  { title: CONTENTS[1].title, date: '10 oct. 2026', phone: '+225 07 456 78 90', method: 'Orange Money', reference: 'OM-472918-MOMO', net: 1350 },
  { title: CONTENTS[0].title, date: '9 oct. 2026', phone: '+221 70 987 65 43', method: 'Wave', reference: 'WAVE-110293-MOMO', net: 2250 },
  { title: CONTENTS[2].title, date: '8 oct. 2026', phone: '+229 95 333 44 55', method: 'MTN MoMo', reference: 'MTN-998811-MOMO', net: 4500 },
  { title: CONTENTS[2].title, date: '7 oct. 2026', phone: '+221 76 888 99 11', method: 'Wave', reference: 'WAVE-443322-MOMO', net: 4500 },
  { title: 'Coaching Individuel 1h', date: '6 oct. 2026', phone: '+221 77 654 32 10', method: 'Wave', reference: 'WAVE-123456-MOMO', net: 9000 },
];

/** La vente qui arrive pendant la visite : c'est l'achat filme dans la video du telephone. */
export const NEW_SALE: DemoSale = {
  title: PACK.title,
  date: '10 oct. 2026',
  phone: '+221 78 245 19 03',
  method: 'Wave',
  reference: 'WAVE-905117-MOMO',
  net: 2250,
};

/** Le don qui arrive pendant la visite : c'est celui de la video du telephone. */
export const NEW_DONATION = {
  name: 'Fatou',
  amount: 2500,
  net: 2250,
  message: "Merci pour tes conseils, ton pack m'a vraiment aidée !",
  email: 'fatou.sow@gmail.com',
};

export const DONATIONS = [
  { name: 'Kofi', amount: 1000, message: 'Tes vidéos sur les accroches ont tout changé pour moi.', ago: 'il y a 3 j' },
  { name: 'Aïcha', amount: 5000, message: 'Pour le prochain live, continue comme ça !', ago: 'il y a 6 j' },
];

/** Totaux avant les evenements de la visite (memes valeurs que le mode demo). */
export const TOTALS = {
  revenue30d: 32850,
  donations30d: 0,
  earnings: 32850,
  published: 3,
  brut: 36500,
  salesCount: 7,
  balance: 17850,
};

export const WITHDRAWALS = [
  { amount: 5000, date: '8 oct. 2026, 15:33', status: 'approved' as const },
  { amount: 10000, date: '30 sept. 2026, 15:33', status: 'paid' as const },
];

/**
 * Revenus nets par jour sur 30 jours (11 sept. → 10 oct.) pour la courbe « Evolution des
 * revenus ». La somme fait les 32 850 FCFA de la carte « Revenus » ; le dernier jour recoit
 * la vente et le don de la visite.
 */
const DAILY = [0, 0, 1350, 0, 0, 2250, 0, 0, 0, 1350, 0, 0, 2250, 0, 1350, 0, 0, 2250, 0, 1350, 2250, 0, 4500, 0, 2250, 1350, 4500, 2250, 1350, 2250];
const DAYS = ['11 sept.', '12 sept.', '13 sept.', '14 sept.', '15 sept.', '16 sept.', '17 sept.', '18 sept.', '19 sept.', '20 sept.', '21 sept.', '22 sept.', '23 sept.', '24 sept.', '25 sept.', '26 sept.', '27 sept.', '28 sept.', '29 sept.', '30 sept.', '1 oct.', '2 oct.', '3 oct.', '4 oct.', '5 oct.', '6 oct.', '7 oct.', '8 oct.', '9 oct.', '10 oct.'];

export function chartData(extraToday: number) {
  return DAILY.map((revenu, i) => ({ date: DAYS[i], revenu: i === DAILY.length - 1 ? revenu + extraToday : revenu }));
}

/**
 * Hero de la landing : le tableau de bord, version ordinateur, pendant qu'il vit.
 *
 * Une vente tombe (le compteur « Revenus » et la courbe montent), puis un don (badge sur
 * « Dons »). Le curseur passe par « Mes ventes » ou la vente est en tete du tableau, par
 * « Dons » ou s'affiche le mot de Fatou, puis demande un retrait sur Wave avant de revenir a
 * l'accueil. La derniere image est la premiere : la video boucle sans saut.
 *
 * La vente et le don sont ceux des deux videos du telephone (achat du Pack PDF, don de 2 500).
 */
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { DashboardFrame, DESK_H, DESK_W, NAV_X, NAV_Y, type TabId } from '../app/DashboardFrame';
import { HomeView, type ActivityRow } from '../app/HomeView';
import { SalesView } from '../app/SalesView';
import { DonationsView, WithdrawModal, WithdrawalsView, type WithdrawalRow } from '../app/MoneyViews';
import { NEW_DONATION, NEW_SALE, SALES, TOTALS, WITHDRAWALS } from '../app/data';
import { AppTheme, Cursor, type CursorKey } from '../app/kit';
import { Stage, progress, typed } from '../motion';
import type { ThemeName } from '../theme';

export const TOUR_DURATION = 480;

/** Images cles (30 i/s). */
const T = {
  sale: 18,
  donation: 60,
  toSales: 118,
  toDonations: 190,
  toWithdrawals: 255,
  askWithdrawal: 285,
  focusAmount: 310,
  confirm: 350,
  closed: 372,
  toHome: 425,
};

const REST = { x: 980, y: 600 };
const WITHDRAW_BUTTON = { x: 483, y: 443 };
const AMOUNT_INPUT = { x: 660, y: 386 };
const CONFIRM_BUTTON = { x: 756, y: 582 };

const CURSOR: CursorKey[] = [
  { at: 0, ...REST },
  { at: 95, ...REST },
  { at: T.toSales, x: NAV_X, y: NAV_Y.sales, click: true },
  { at: 150, x: 760, y: 497 },
  { at: T.toDonations, x: NAV_X, y: NAV_Y.donations, click: true },
  { at: 215, x: 640, y: 238 },
  { at: T.toWithdrawals, x: NAV_X, y: NAV_Y.withdrawals, click: true },
  { at: T.askWithdrawal, ...WITHDRAW_BUTTON, click: true },
  { at: T.focusAmount, ...AMOUNT_INPUT, click: true },
  { at: T.confirm, ...CONFIRM_BUTTON, click: true },
  { at: 395, x: 900, y: 520 },
  { at: T.toHome, x: NAV_X, y: NAV_Y.home, click: true },
  { at: 470, ...REST },
];

const BASE_ACTIVITY: ActivityRow[] = [
  { id: 'a1', type: 'sale', title: SALES[0].title, subtitle: SALES[0].phone, ago: 'il y a 2 h', amount: 2500 },
  { id: 'a2', type: 'sale', title: SALES[1].title, subtitle: SALES[1].phone, ago: 'il y a 5 h', amount: 1500 },
  { id: 'a3', type: 'withdrawal', title: 'Retrait approuvé', subtitle: 'Wave', ago: 'il y a 2 j', amount: 5000 },
  { id: 'a4', type: 'sale', title: SALES[3].title, subtitle: SALES[3].phone, ago: 'il y a 2 j', amount: 5000 },
];

function activeTab(frame: number): TabId {
  if (frame >= T.toHome + 2) return 'home';
  if (frame >= T.toWithdrawals + 2) return 'withdrawals';
  if (frame >= T.toDonations + 2) return 'donations';
  if (frame >= T.toSales + 2) return 'sales';
  return 'home';
}

export function DashboardTour({ theme }: { theme: ThemeName }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tab = activeTab(frame);

  // Evenements de l'accueil (le retour final a l'accueil reprend l'etat de depart : boucle)
  const live = frame < T.toHome;
  const saleIn = live ? progress(frame, T.sale, T.sale + 30) : 0;
  const donationIn = live ? progress(frame, T.donation, T.donation + 30) : 0;
  const revenue = TOTALS.revenue30d + NEW_SALE.net * saleIn;
  const donations = NEW_DONATION.amount * donationIn;
  const earnings = TOTALS.earnings + NEW_SALE.net * saleIn + NEW_DONATION.net * donationIn;

  const activity: ActivityRow[] = [
    ...(live && frame >= T.donation
      ? [{ id: 'don', type: 'donation' as const, title: `Don de ${NEW_DONATION.name}`, subtitle: NEW_DONATION.message, ago: "à l'instant", amount: NEW_DONATION.amount, enter: progress(frame, T.donation, T.donation + 14) }]
      : []),
    ...(live && frame >= T.sale
      ? [{ id: 'sale', type: 'sale' as const, title: NEW_SALE.title, subtitle: NEW_SALE.phone, ago: "à l'instant", amount: 2500, enter: progress(frame, T.sale, T.sale + 14) }]
      : []),
    ...BASE_ACTIVITY,
  ];

  // Badge « Dons » : apparait avec le don, disparait quand on ouvre l'onglet
  const badgePop = spring({ frame: frame - T.donation, fps, config: { damping: 11, stiffness: 180, mass: 0.6 } });
  const badges = frame >= T.donation && frame < T.toDonations + 2 ? { donations: { count: 1, scale: badgePop } } : {};

  // Retrait
  const modalOpen =
    frame < T.askWithdrawal + 4
      ? 0
      : frame < T.confirm + 12
        ? spring({ frame: frame - (T.askWithdrawal + 4), fps, config: { damping: 200 }, durationInFrames: 12 })
        : 1 - progress(frame, T.confirm + 12, T.closed);
  const balanceBefore = TOTALS.balance + NEW_SALE.net + NEW_DONATION.net;
  const requested = 15000;
  const balance = frame < T.closed ? balanceBefore : interpolate(progress(frame, T.closed, T.closed + 28), [0, 1], [balanceBefore, balanceBefore - requested]);
  const withdrawalRows: WithdrawalRow[] = [
    ...(frame >= T.closed + 2 ? [{ amount: requested, date: '10 oct. 2026, 18:42', status: 'pending' as const, enter: progress(frame, T.closed + 2, T.closed + 18) }] : []),
    ...WITHDRAWALS,
  ];

  let view;
  if (tab === 'sales') {
    view = (
      <SalesView
        sales={[NEW_SALE, ...SALES]}
        brut={TOTALS.brut + 2500}
        net={TOTALS.revenue30d + NEW_SALE.net}
        count={TOTALS.salesCount + 1}
        enterAt={T.toSales + 2}
        glow={1 - progress(frame, T.toSales + 30, T.toSales + 70)}
      />
    );
  } else if (tab === 'donations') {
    view = <DonationsView enterAt={T.toDonations + 2} showNew />;
  } else if (tab === 'withdrawals') {
    view = <WithdrawalsView balance={balance} rows={withdrawalRows} success={progress(frame, T.closed, T.closed + 14)} pressed={frame >= T.askWithdrawal && frame < T.askWithdrawal + 6} />;
  } else {
    view = (
      <HomeView
        revenue={revenue}
        donations={donations}
        earnings={earnings}
        published={TOTALS.published}
        chartExtra={NEW_SALE.net * saleIn + NEW_DONATION.net * donationIn}
        activity={activity}
      />
    );
  }

  // L'accueil defile pour montrer l'activite qui arrive, puis remonte avant de changer d'onglet
  const homeScroll = live ? 300 * progress(frame, T.sale + 6, T.sale + 30) * (1 - progress(frame, 92, 112)) : 0;

  const overlay = (
    <WithdrawModal
      open={tab === 'withdrawals' ? modalOpen : 0}
      balance={balanceBefore}
      amount={typed(String(requested), frame, T.focusAmount + 4, T.focusAmount + 22)}
      focused={frame >= T.focusAmount}
      confirmPressed={frame >= T.confirm && frame < T.confirm + 6}
      submitting={frame >= T.confirm + 2}
    />
  );

  return (
    <AbsoluteFill>
      <AppTheme theme={theme}>
        <Stage width={DESK_W} height={DESK_H}>
          <DashboardFrame active={tab} badges={badges} scroll={tab === 'home' ? homeScroll : 0} overlay={overlay}>
            {view}
          </DashboardFrame>
          <Cursor keys={CURSOR} />
        </Stage>
      </AppTheme>
    </AbsoluteFill>
  );
}


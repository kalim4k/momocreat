/**
 * Telephone : une fan ouvre la boutique depuis une bio, debloque le Pack PDF, remplit la
 * feuille de paiement et revient de l'operateur avec son contenu. C'est la vente qui tombe
 * dans le tableau de bord du hero (meme numero, meme montant).
 *
 * Boucle : la page revient en haut et l'etat « achete » se fond dans l'etat de depart.
 */
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { PaymentConfirm, PaymentSheet, PhoneScreen, PublicProfile, PHONE_H, PHONE_W, type PaymentFields } from '../app/FanViews';
import { NEW_SALE } from '../app/data';
import { AppTheme, Swipe, Touch } from '../app/kit';
import { EASE_IN_OUT, Stage, progress, typed } from '../motion';

export const PURCHASE_DURATION = 420;

/** Defilement qui amene la carte du Pack PDF a l'ecran. */
const CARD_SCROLL = 260;

const T = {
  scroll: 18,
  unlock: 62,
  first: 88,
  last: 112,
  email: 132,
  phone: 166,
  pay: 202,
  redirect: 228,
  confirm: 252,
  success: 284,
  back: 330,
  scrollUp: 372,
  fadeBack: 398,
};

/** Points de toucher, en coordonnees d'ecran (390 × 845). */
const TAP = {
  unlock: { x: 101, y: 756 },
  first: { x: 106, y: 552 },
  last: { x: 285, y: 552 },
  email: { x: 195, y: 630 },
  phone: { x: 195, y: 723 },
  pay: { x: 195, y: 799 },
  back: { x: 195, y: 622 },
};

const FIRST = 'Aminata';
const LAST = 'Diallo';
const EMAIL = 'aminata.diallo@gmail.com';

export function FanPurchase() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const onProfile = frame < T.confirm || frame >= T.back + 4;
  const purchasedPhase = frame >= T.back + 4;

  const scroll = purchasedPhase
    ? CARD_SCROLL * (1 - progress(frame, T.scrollUp, T.scrollUp + 24, EASE_IN_OUT))
    : CARD_SCROLL * progress(frame, T.scroll, T.scroll + 30, EASE_IN_OUT);

  const sheetOpen = frame < T.unlock + 4 ? 0 : spring({ frame: frame - (T.unlock + 4), fps, config: { damping: 25, stiffness: 250 } });

  const focus: PaymentFields['focus'] =
    frame >= T.phone ? 'phone' : frame >= T.email ? 'email' : frame >= T.last ? 'last' : frame >= T.first ? 'first' : null;
  const fields: PaymentFields = {
    first: typed(FIRST, frame, T.first + 4, T.first + 18),
    last: typed(LAST, frame, T.last + 3, T.last + 14),
    email: typed(EMAIL, frame, T.email + 3, T.email + 28),
    phone: typed(NEW_SALE.phone, frame, T.phone + 3, T.phone + 24),
    focus: frame >= T.pay ? null : focus,
  };

  const pop = spring({ frame: frame - T.success, fps, config: { damping: 11, stiffness: 160, mass: 0.7 } });

  // Retour a l'etat de depart : la carte « achetee » se fond dans la carte verrouillee
  const fadeToStart = progress(frame, T.fadeBack, T.fadeBack + 14);

  const page = onProfile ? (
    <>
      <PublicProfile scroll={scroll} purchased={purchasedPhase ? ['pack'] : []} pressed={frame >= T.unlock && frame < T.unlock + 6 ? 'pack' : null} />
      {purchasedPhase && fadeToStart > 0 && (
        <div className="absolute inset-0" style={{ opacity: fadeToStart }}>
          <PublicProfile scroll={0} />
        </div>
      )}
    </>
  ) : (
    <PaymentConfirm status={frame < T.success ? 'loading' : 'success'} pop={pop} pressed={frame >= T.back && frame < T.back + 6 ? 'back' : null} />
  );

  const overlay =
    frame < T.confirm ? (
      <PaymentSheet
        open={sheetOpen}
        step={frame < T.pay + 4 ? 'details' : 'loading'}
        fields={fields}
        status={frame < T.redirect ? 'Initialisation du paiement...' : 'Redirection vers le paiement...'}
        payPressed={frame >= T.pay && frame < T.pay + 6}
      />
    ) : null;

  return (
    <AbsoluteFill className="bg-white">
      <AppTheme theme="light">
        <Stage width={PHONE_W} height={PHONE_H}>
          <PhoneScreen dark={!onProfile} page={page} overlay={overlay} />
          <Swipe start={T.scroll} end={T.scroll + 30} from={{ x: 230, y: 700 }} to={{ x: 230, y: 440 }} />
          <Touch at={T.unlock} {...TAP.unlock} />
          <Touch at={T.first} {...TAP.first} />
          <Touch at={T.last} {...TAP.last} />
          <Touch at={T.email} {...TAP.email} />
          <Touch at={T.phone} {...TAP.phone} />
          <Touch at={T.pay} {...TAP.pay} />
          <Touch at={T.back} {...TAP.back} />
          <Swipe start={T.scrollUp} end={T.scrollUp + 24} from={{ x: 230, y: 420 }} to={{ x: 230, y: 680 }} />
        </Stage>
      </AppTheme>
    </AbsoluteFill>
  );
}

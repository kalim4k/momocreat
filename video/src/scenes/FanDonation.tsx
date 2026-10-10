/**
 * Telephone : un fan envoie un don de 2 500 FCFA avec un petit mot, depuis la meme boutique.
 * C'est le don qui s'affiche dans l'onglet « Dons » du hero.
 *
 * Boucle : on revient a la boutique, en haut de page, comme a la premiere image.
 */
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { DonationSheet, PaymentConfirm, PhoneScreen, PublicProfile, PHONE_H, PHONE_W, type DonationFields } from '../app/FanViews';
import { NEW_DONATION } from '../app/data';
import { AppTheme, Touch } from '../app/kit';
import { Stage, progress, typed } from '../motion';

export const DONATION_DURATION = 340;

const T = {
  open: 22,
  amount: 52,
  name: 70,
  message: 96,
  send: 166,
  confirm: 196,
  success: 228,
  back: 278,
};

const TAP = {
  donate: { x: 273, y: 474 },
  amount: { x: 151, y: 450 },
  name: { x: 195, y: 571 },
  message: { x: 195, y: 736 },
  send: { x: 195, y: 801 },
  back: { x: 195, y: 583 },
};

export function FanDonation() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const onProfile = frame < T.confirm || frame >= T.back + 4;
  const sheetOpen = frame < T.open + 4 ? 0 : spring({ frame: frame - (T.open + 4), fps, config: { damping: 25, stiffness: 250 } });

  const fields: DonationFields = {
    amount: frame >= T.amount ? NEW_DONATION.amount : 1000,
    name: typed(NEW_DONATION.name, frame, T.name + 4, T.name + 14),
    message: typed(NEW_DONATION.message, frame, T.message + 4, T.message + 58),
    focus: frame >= T.send ? null : frame >= T.message ? 'message' : frame >= T.name ? 'name' : null,
    pressedAmount: frame >= T.amount && frame < T.amount + 6 ? NEW_DONATION.amount : null,
  };

  const pop = spring({ frame: frame - T.success, fps, config: { damping: 11, stiffness: 160, mass: 0.7 } });
  // Le retour a la boutique se fait en fondu court, comme un changement de page
  const backFade = progress(frame, T.back + 4, T.back + 12);

  const page = onProfile ? (
    <div className="h-full" style={{ opacity: frame >= T.back + 4 ? backFade : 1 }}>
      <PublicProfile pressed={frame >= T.open && frame < T.open + 6 ? 'donate' : null} />
    </div>
  ) : (
    <PaymentConfirm status={frame < T.success ? 'loading' : 'success'} donation pop={pop} pressed={frame >= T.back && frame < T.back + 6 ? 'back' : null} />
  );

  const overlay = frame < T.confirm ? <DonationSheet open={sheetOpen} fields={fields} donating={frame >= T.send + 3} sendPressed={frame >= T.send && frame < T.send + 6} /> : null;

  return (
    <AbsoluteFill className="bg-white">
      <AppTheme theme="light">
        <Stage width={PHONE_W} height={PHONE_H}>
          <PhoneScreen dark={!onProfile} page={page} overlay={overlay} />
          <Touch at={T.open} {...TAP.donate} />
          <Touch at={T.amount} {...TAP.amount} />
          <Touch at={T.name} {...TAP.name} />
          <Touch at={T.message} {...TAP.message} />
          <Touch at={T.send} {...TAP.send} />
          <Touch at={T.back} {...TAP.back} />
        </Stage>
      </AppTheme>
    </AbsoluteFill>
  );
}

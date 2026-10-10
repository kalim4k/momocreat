import './styles.css';
import { Composition } from 'remotion';
import { DashboardTour, TOUR_DURATION } from './scenes/DashboardTour';
import { FanPurchase, PURCHASE_DURATION } from './scenes/FanPurchase';
import { FanDonation, DONATION_DURATION } from './scenes/FanDonation';
import { PUBLISH_DURATION, StepPublish, STEP_DURATION } from './scenes/StepPublish';
import { StepShare } from './scenes/StepShare';
import { StepWithdraw } from './scenes/StepWithdraw';
import type { ThemeName } from './theme';

const FPS = 30;
const light: { theme: ThemeName } = { theme: 'light' };

export function RemotionRoot() {
  return (
    <>
      {/* Hero : le tableau de bord en mise en page bureau (decor 1280 × 840, rendu × 1,25) */}
      <Composition id="DashboardTour" component={DashboardTour} durationInFrames={TOUR_DURATION} fps={FPS} width={1600} height={1050} defaultProps={light} />
      {/* Telephone : ecran 390 × 845 rendu en 540 × 1170 (le cadre est dessine en CSS sur la landing) */}
      <Composition id="FanPurchase" component={FanPurchase} durationInFrames={PURCHASE_DURATION} fps={FPS} width={540} height={1170} />
      <Composition id="FanDonation" component={FanDonation} durationInFrames={DONATION_DURATION} fps={FPS} width={540} height={1170} />
      {/* Les trois etapes, en gros plan, au format des cartes « Comment ca marche » */}
      <Composition id="StepPublish" component={StepPublish} durationInFrames={PUBLISH_DURATION} fps={FPS} width={720} height={450} defaultProps={light} />
      <Composition id="StepShare" component={StepShare} durationInFrames={STEP_DURATION} fps={FPS} width={720} height={450} defaultProps={light} />
      <Composition id="StepWithdraw" component={StepWithdraw} durationInFrames={STEP_DURATION} fps={FPS} width={720} height={450} defaultProps={light} />
    </>
  );
}

import { Composition } from 'remotion';
import { HERO_DURATION, HeroPayment } from './scenes/HeroPayment';
import { STEP_DURATION, StepUpload } from './scenes/StepUpload';
import { StepShare } from './scenes/StepShare';
import { StepEarn } from './scenes/StepEarn';
import type { ThemeName } from './theme';

const FPS = 30;
const stepProps: { theme: ThemeName } = { theme: 'light' };

export function RemotionRoot() {
  return (
    <>
      {/* Ecran de telephone (le cadre est dessine en CSS sur la landing) */}
      <Composition id="HeroPayment" component={HeroPayment} durationInFrames={HERO_DURATION} fps={FPS} width={540} height={1170} />
      {/* Les trois etapes, au format des cartes de la section "Comment ca marche" */}
      <Composition id="StepUpload" component={StepUpload} durationInFrames={STEP_DURATION} fps={FPS} width={720} height={450} defaultProps={stepProps} />
      <Composition id="StepShare" component={StepShare} durationInFrames={STEP_DURATION} fps={FPS} width={720} height={450} defaultProps={stepProps} />
      <Composition id="StepEarn" component={StepEarn} durationInFrames={STEP_DURATION} fps={FPS} width={720} height={450} defaultProps={stepProps} />
    </>
  );
}

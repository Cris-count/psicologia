import { GuideCharacterPresentation } from '../components/guide-character/guide-character.types';

const base = '/assets/guide';

export const GARY_PREMIUM_ASSETS: Record<GuideCharacterPresentation, string> = {
  stage: `${base}/nexa-hero-premium-cutout.png`,
  assistant: `${base}/nexa-bust-premium-cutout.png`,
  companion: `${base}/nexa-bust-premium-cutout.png`,
  chip: `${base}/nexa-bust-premium-cutout.png`,
};

/** @deprecated Use GARY_PREMIUM_ASSETS */
export const NEXA_PREMIUM_ASSETS = GARY_PREMIUM_ASSETS;

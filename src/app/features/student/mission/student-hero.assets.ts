const base = '/assets/mission';

/** Cutouts con alpha — SOLO el personaje, sin concept sheet. */
export const STUDENT_HERO_CUTOUTS = {
  idle: `${base}/student-pose_idle-cutout.png`,
  walk: `${base}/student-pose_walk-cutout.png`,
  run: `${base}/student-pose_run-cutout.png`,
  interact: `${base}/student-pose_interact-cutout.png`,
  celebrate: `${base}/student-pose_celebrate-cutout.png`,
  think: `${base}/student-pose_think-cutout.png`,
  hero: `${base}/student-hero_front-cutout.png`,
} as const;

export const GARY_COMPANION_CUTOUT = '/assets/guide/nexa-bust-premium-cutout.png';

export type StudentHeroPose = keyof typeof STUDENT_HERO_CUTOUTS;

export type PlayerAnimState = 'idle' | 'walk' | 'run' | 'interact' | 'think' | 'celebrate';

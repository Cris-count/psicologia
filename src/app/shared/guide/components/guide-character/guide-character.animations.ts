import gsap from 'gsap';
import { GuideCharacterMood } from './guide-character.types';

export function setupGaryAnimations(root: HTMLElement): () => void {
  const rig = root.querySelector('.nexa-rig');
  const body = root.querySelector('.nexa-rig-body');
  const hair = root.querySelector('.nexa-rig-hair');
  const shadow = root.querySelector('.nexa-contact-shadow');
  const holoOrb = root.querySelector('.nexa-holo-orb');
  const holoCore = root.querySelector('.nexa-holo-core');
  const rings = root.querySelectorAll('.nexa-neural-ring');
  const lids = root.querySelectorAll('.nexa-blink-lid');
  const particles = root.querySelectorAll('.nexa-particle');
  const fog = root.querySelectorAll('.nexa-fog');
  const tweens: gsap.core.Tween[] = [];
  const timelines: gsap.core.Timeline[] = [];

  const floatTl = gsap.timeline({ repeat: -1 });
  floatTl.to(rig, { y: -7, duration: 3.2, ease: 'sine.inOut' });
  floatTl.to(rig, { y: 0, duration: 3.2, ease: 'sine.inOut' });
  timelines.push(floatTl);

  if (body) {
    tweens.push(
      gsap.to(body, {
        scaleY: 1.014,
        scaleX: 1.005,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        transformOrigin: '50% 88%',
      }),
    );
  }

  if (hair) {
    tweens.push(
      gsap.to(hair, {
        y: -2,
        rotation: 1.5,
        duration: 3.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        transformOrigin: '50% 20%',
      }),
    );
  }

  if (shadow) {
    tweens.push(
      gsap.to(shadow, {
        scaleX: 1.1,
        opacity: 0.55,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      }),
    );
  }

  if (holoOrb) {
    tweens.push(
      gsap.to(holoOrb, {
        y: -10,
        rotation: 5,
        duration: 3.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      }),
    );
  }

  if (holoCore) {
    tweens.push(
      gsap.to(holoCore, {
        scale: 1.2,
        opacity: 0.75,
        duration: 1.9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        transformOrigin: 'center',
      }),
    );
  }

  rings.forEach((ring, i) => {
    tweens.push(
      gsap.to(ring, {
        rotation: i % 2 === 0 ? 360 : -360,
        duration: 18 + i * 4,
        repeat: -1,
        ease: 'none',
        transformOrigin: 'center',
      }),
    );
  });

  particles.forEach((p, i) => {
    tweens.push(
      gsap.to(p, {
        y: `-=${10 + i * 3}`,
        x: `+=${i % 2 === 0 ? 6 : -6}`,
        opacity: 0.15,
        duration: 2.5 + i * 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      }),
    );
  });

  fog.forEach((f, i) => {
    tweens.push(
      gsap.to(f, {
        x: i % 2 === 0 ? 12 : -12,
        opacity: 0.35,
        duration: 5 + i,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      }),
    );
  });

  const blink = () => {
    gsap.to(lids, {
      scaleY: 1,
      duration: 0.07,
      ease: 'power2.in',
      transformOrigin: 'center center',
      onComplete: () => gsap.to(lids, { scaleY: 0, duration: 0.12, ease: 'power2.out' }),
    });
  };

  const blinkTl = gsap.timeline({ repeat: -1, repeatDelay: gsap.utils.random(2.8, 5.5) });
  blinkTl.call(blink);
  timelines.push(blinkTl);
  gsap.delayedCall(2, blink);

  gsap.from(rig, { opacity: 0, y: 40, duration: 1.2, ease: 'power3.out', delay: 0.2 });

  return () => {
    timelines.forEach((t) => t.kill());
    tweens.forEach((t) => t.kill());
    gsap.killTweensOf(root.querySelectorAll('*'));
  };
}

export function applyGaryMood(root: HTMLElement, mood: GuideCharacterMood): void {
  const rig = root.querySelector('.nexa-rig');
  const holoOrb = root.querySelector('.nexa-holo-orb');
  if (!rig) return;

  const presets: Record<GuideCharacterMood, gsap.TweenVars> = {
    idle: { rotation: 0, x: 0, scale: 1 },
    happy: { rotation: 0.6, x: 4, scale: 1.015 },
    thinking: { rotation: -0.8, x: -3, scale: 0.995 },
    encourage: { rotation: 0.4, x: 5, scale: 1.02 },
  };

  gsap.to(rig, {
    ...presets[mood],
    duration: 0.75,
    ease: 'power2.out',
    transformOrigin: '50% 90%',
  });

  if (holoOrb) {
    gsap.to(holoOrb, {
      scale: mood === 'thinking' ? 1.1 : mood === 'encourage' ? 1.06 : 1,
      duration: 0.5,
      ease: 'back.out(1.4)',
    });
  }
}

/** @deprecated Use setupGaryAnimations */
export const setupNexaAnimations = setupGaryAnimations;

/** @deprecated Use applyGaryMood */
export const applyNexaMood = applyGaryMood;

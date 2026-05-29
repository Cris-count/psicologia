import gsap from 'gsap';
import { STUDENT_HERO_CUTOUTS, StudentHeroPose } from './student-hero.assets';

export function setupMissionPlayerAnimations(root: HTMLElement): () => void {
  const rig = root.querySelector('.mp-rig');
  const body = root.querySelector('.mp-rig-body');
  const shadow = root.querySelector('.mp-contact-shadow');
  const glow = root.querySelector('.mp-rim-glow');
  const tweens: gsap.core.Tween[] = [];
  const timelines: gsap.core.Timeline[] = [];

  const floatTl = gsap.timeline({ repeat: -1 });
  floatTl.to(rig, { y: -5, duration: 2.8, ease: 'sine.inOut' });
  floatTl.to(rig, { y: 0, duration: 2.8, ease: 'sine.inOut' });
  timelines.push(floatTl);

  if (body) {
    tweens.push(
      gsap.to(body, {
        scaleY: 1.012,
        scaleX: 1.004,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        transformOrigin: '50% 92%',
      }),
    );
  }

  if (shadow) {
    tweens.push(
      gsap.to(shadow, {
        scaleX: 1.08,
        opacity: 0.5,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      }),
    );
  }

  if (glow) {
    tweens.push(
      gsap.to(glow, {
        opacity: 0.55,
        scale: 1.05,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      }),
    );
  }

  gsap.from(rig, { opacity: 0, y: 28, duration: 0.9, ease: 'power3.out' });

  return () => {
    timelines.forEach((t) => t.kill());
    tweens.forEach((t) => t.kill());
    gsap.killTweensOf(root.querySelectorAll('*'));
  };
}

export function applyMissionPlayerPose(root: HTMLElement, pose: StudentHeroPose): void {
  const rig = root.querySelector('.mp-rig');
  if (!rig) return;

  const presets: Record<StudentHeroPose, gsap.TweenVars> = {
    hero: { rotation: 0, x: 0, scale: 1 },
    idle: { rotation: 0, x: 0, scale: 1 },
    walk: { rotation: 1.2, x: 6, scale: 1.01 },
    run: { rotation: 2.5, x: 10, scale: 1.03 },
    interact: { rotation: -0.5, x: -2, scale: 1.015 },
    celebrate: { rotation: -1.5, x: 0, scale: 1.04 },
    think: { rotation: -1, x: -4, scale: 0.99 },
  };

  gsap.to(rig, {
    ...presets[pose],
    duration: 0.55,
    ease: 'power2.out',
    transformOrigin: '50% 92%',
  });
}

export function pulseMissionPlayer(root: HTMLElement): void {
  const rig = root.querySelector('.mp-rig');
  if (!rig) return;
  gsap.fromTo(rig, { scale: 1 }, { scale: 1.06, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out' });
}

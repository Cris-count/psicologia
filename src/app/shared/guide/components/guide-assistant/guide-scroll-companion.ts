import gsap from 'gsap';

export interface GuideScrollCompanionOptions {
  maxLift?: number;
  parallaxRatio?: number;
  smoothness?: number;
  maxDriftX?: number;
  maxLean?: number;
  /** DOM subtree to scan for nested scroll containers. */
  scrollRoot?: HTMLElement | null;
}

interface MotionState {
  y: number;
  x: number;
  lean: number;
  scale: number;
}

interface ScrollCompanionApi {
  setSpeaking: (active: boolean) => void;
  nudge: () => void;
}

const DEFAULTS: Required<Omit<GuideScrollCompanionOptions, 'scrollRoot'>> = {
  maxLift: 168,
  parallaxRatio: 0.22,
  smoothness: 0.085,
  maxDriftX: 14,
  maxLean: 2.4,
};

function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isScrollable(el: HTMLElement): boolean {
  const style = getComputedStyle(el);
  const overflowY = style.overflowY;
  if (overflowY !== 'auto' && overflowY !== 'scroll' && overflowY !== 'overlay') return false;
  return el.scrollHeight > el.clientHeight + 2;
}

function collectScrollables(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];

  const found: HTMLElement[] = [];
  const walk = (node: HTMLElement): void => {
    if (isScrollable(node)) found.push(node);
    for (const child of node.children) {
      if (child instanceof HTMLElement) walk(child);
    }
  };

  walk(root);
  return found;
}

function readWindowScroll(): number {
  return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
}

function readTotalScroll(windowScroll: number, scrollables: HTMLElement[]): number {
  return windowScroll + scrollables.reduce((sum, el) => sum + el.scrollTop, 0);
}

function readMaxScroll(viewportH: number, scrollables: HTMLElement[]): number {
  const docMax = Math.max(1, document.documentElement.scrollHeight - viewportH);
  const nestedMax = scrollables.reduce((max, el) => Math.max(max, el.scrollHeight - el.clientHeight), 0);
  return Math.max(docMax, nestedMax, 1);
}

export function attachGuideScrollCompanion(
  element: HTMLElement,
  options: GuideScrollCompanionOptions = {},
): () => void {
  const config = { ...DEFAULTS, ...options };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    element.classList.add('guide-scroll-active', 'guide-scroll-reduced');
    return () => element.classList.remove('guide-scroll-active', 'guide-scroll-reduced');
  }

  const setTransform = gsap.quickSetter(element, 'transform', 'px');
  element.classList.add('guide-scroll-active');

  const state: MotionState = { y: 0, x: 0, lean: 0, scale: 1 };
  let scrollables: HTMLElement[] = collectScrollables(config.scrollRoot ?? document.body);
  let lastTotalScroll = readTotalScroll(readWindowScroll(), scrollables);
  let scrollVelocity = 0;
  let idlePhase = Math.random() * Math.PI * 2;
  let speakingBoost = 0;
  let nudgeBoost = 0;
  let rafId = 0;
  let running = true;
  let rescanTimer: ReturnType<typeof setTimeout> | null = null;

  const rescanScrollables = (): void => {
    scrollables = collectScrollables(config.scrollRoot ?? document.body);
    lastTotalScroll = readTotalScroll(readWindowScroll(), scrollables);
  };

  const onScroll = (): void => {
    const current = readTotalScroll(readWindowScroll(), scrollables);
    scrollVelocity = current - lastTotalScroll;
    lastTotalScroll = current;
  };

  const scheduleRescan = (): void => {
    if (rescanTimer) clearTimeout(rescanTimer);
    rescanTimer = setTimeout(() => {
      rescanScrollables();
      rescanTimer = null;
    }, 320);
  };

  const tick = (): void => {
    if (!running) return;

    const viewportH = window.innerHeight;
    const windowScroll = readWindowScroll();
    const scrollY = readTotalScroll(windowScroll, scrollables);
    const maxScroll = readMaxScroll(viewportH, scrollables);
    const scrollProgress = clamp(scrollY / maxScroll, 0, 1);

    const easedProgress = scrollProgress * scrollProgress * (3 - 2 * scrollProgress);
    const scrollLift = Math.min(scrollY * config.parallaxRatio, config.maxLift * (0.35 + easedProgress * 0.65));

    idlePhase += 0.014;
    const idleFloat = Math.sin(idlePhase) * 5.5;
    const idleDrift = Math.sin(idlePhase * 0.68) * 3.8;

    const velocityLean = clamp(scrollVelocity * 0.04, -config.maxLean, config.maxLean);
    const velocityDrift = clamp(scrollVelocity * 0.14, -config.maxDriftX, config.maxDriftX);

    const targetY = -(scrollLift + idleFloat + nudgeBoost * 10);
    const targetX = velocityDrift + idleDrift + Math.sin(scrollY * 0.004 + idlePhase * 0.2) * 5;
    const targetLean = velocityLean + Math.sin(idlePhase * 0.55) * 0.55 + nudgeBoost * 1.2;
    const targetScale = 1 + speakingBoost * 0.022 + nudgeBoost * 0.012 + Math.sin(idlePhase * 0.4) * 0.006;

    state.y = lerp(state.y, targetY, config.smoothness);
    state.x = lerp(state.x, targetX, config.smoothness * 1.15);
    state.lean = lerp(state.lean, targetLean, config.smoothness * 1.4);
    state.scale = lerp(state.scale, targetScale, config.smoothness * 1.2);

    scrollVelocity = lerp(scrollVelocity, 0, 0.12);
    nudgeBoost = lerp(nudgeBoost, 0, 0.08);

    setTransform(
      `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0) rotate(${state.lean.toFixed(3)}deg) scale(${state.scale.toFixed(4)})`,
    );

    rafId = requestAnimationFrame(tick);
  };

  const setSpeaking = (active: boolean): void => {
    speakingBoost = active ? 1 : 0;
  };

  const nudge = (): void => {
    nudgeBoost = 1;
    scheduleRescan();
  };

  const api: ScrollCompanionApi = { setSpeaking, nudge };
  (element as HTMLElement & { __guideScrollApi?: ScrollCompanionApi }).__guideScrollApi = api;

  // Capture phase catches scroll from nested containers, not only the window.
  document.addEventListener('scroll', onScroll, { passive: true, capture: true });
  window.addEventListener('resize', scheduleRescan, { passive: true });
  window.addEventListener('load', scheduleRescan, { passive: true });

  const observer =
    typeof ResizeObserver !== 'undefined' && config.scrollRoot
      ? new ResizeObserver(() => scheduleRescan())
      : null;
  observer?.observe(config.scrollRoot!);

  rescanScrollables();
  rafId = requestAnimationFrame(tick);

  return () => {
    running = false;
    cancelAnimationFrame(rafId);
    if (rescanTimer) clearTimeout(rescanTimer);
    document.removeEventListener('scroll', onScroll, true);
    window.removeEventListener('resize', scheduleRescan);
    window.removeEventListener('load', scheduleRescan);
    observer?.disconnect();
    element.classList.remove('guide-scroll-active', 'guide-scroll-reduced');
    gsap.set(element, { clearProps: 'transform' });
    delete (element as HTMLElement & { __guideScrollApi?: ScrollCompanionApi }).__guideScrollApi;
  };
}

export function setGuideScrollSpeaking(element: HTMLElement | undefined, active: boolean): void {
  (element as HTMLElement & { __guideScrollApi?: ScrollCompanionApi }).__guideScrollApi?.setSpeaking(active);
}

export function nudgeGuideScrollCompanion(element: HTMLElement | undefined): void {
  (element as HTMLElement & { __guideScrollApi?: ScrollCompanionApi }).__guideScrollApi?.nudge();
}

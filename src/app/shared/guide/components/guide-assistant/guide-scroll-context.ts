import { InjectionToken } from '@angular/core';

/** Resolves the DOM subtree where student scroll should be tracked. */
export const GUIDE_SCROLL_ROOT = new InjectionToken<() => HTMLElement | null>('GUIDE_SCROLL_ROOT');

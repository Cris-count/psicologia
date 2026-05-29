import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GameSfxService {
  private readonly platformId = inject(PLATFORM_ID);
  private audioContext: AudioContext | null = null;
  readonly enabled = signal(this.readPreference());

  toggle(): void {
    const next = !this.enabled();
    this.enabled.set(next);
    if (this.isBrowser()) {
      localStorage.setItem('psych-sim-sfx', next ? '1' : '0');
    }
  }

  playHover(): void {
    this.playTone(520, 0.04, 'sine', 0.015);
  }

  playClick(): void {
    this.playTone(680, 0.06, 'triangle', 0.025);
  }

  playSuccess(): void {
    this.playSequence([
      { freq: 440, dur: 0.08 },
      { freq: 660, dur: 0.1 },
      { freq: 880, dur: 0.14 },
    ]);
  }

  playError(): void {
    this.playSequence([
      { freq: 220, dur: 0.12 },
      { freq: 180, dur: 0.16 },
    ]);
  }

  playTransition(): void {
    this.playTone(330, 0.2, 'sawtooth', 0.012);
  }

  private playTone(freq: number, duration: number, type: OscillatorType, volume: number): void {
    if (!this.enabled() || !this.isBrowser()) {
      return;
    }

    const ctx = this.getContext();
    if (!ctx) {
      return;
    }

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  }

  private playSequence(notes: Array<{ freq: number; dur: number }>): void {
    if (!this.enabled() || !this.isBrowser()) {
      return;
    }

    const ctx = this.getContext();
    if (!ctx) {
      return;
    }

    let offset = ctx.currentTime;
    for (const note of notes) {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = note.freq;
      gain.gain.value = 0.02;
      gain.gain.exponentialRampToValueAtTime(0.001, offset + note.dur);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(offset);
      oscillator.stop(offset + note.dur);
      offset += note.dur * 0.85;
    }
  }

  private getContext(): AudioContext | null {
    if (!this.isBrowser()) {
      return null;
    }
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    if (this.audioContext.state === 'suspended') {
      void this.audioContext.resume();
    }
    return this.audioContext;
  }

  private readPreference(): boolean {
    if (!this.isBrowser()) {
      return false;
    }
    return localStorage.getItem('psych-sim-sfx') !== '0';
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}

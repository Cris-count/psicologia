import { Directive, ElementRef, inject, input, OnInit } from '@angular/core';
import gsap from 'gsap';

@Directive({
  selector: '[appGameAnimate]',
})
export class GameAnimateDirective implements OnInit {
  private readonly el = inject(ElementRef<HTMLElement>);

  readonly appGameAnimate = input<'fade-up' | 'scale-in' | 'slide-left'>('fade-up');
  readonly animateDelay = input(0);

  ngOnInit(): void {
    const element = this.el.nativeElement;
    const delay = this.animateDelay();

    switch (this.appGameAnimate()) {
      case 'scale-in':
        gsap.from(element, {
          opacity: 0,
          scale: 0.92,
          duration: 0.5,
          delay,
          ease: 'back.out(1.4)',
        });
        break;
      case 'slide-left':
        gsap.from(element, {
          opacity: 0,
          x: 30,
          duration: 0.45,
          delay,
          ease: 'power2.out',
        });
        break;
      default:
        gsap.from(element, {
          opacity: 0,
          y: 24,
          duration: 0.55,
          delay,
          ease: 'power3.out',
        });
    }
  }
}

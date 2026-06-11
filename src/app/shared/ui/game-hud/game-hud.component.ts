import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AvatarId } from '../../../models/academy.models';
import { AvatarComposerComponent } from '../../guide/components/avatar-composer/avatar-composer.component';
import { TeacherAvatarComposerComponent } from '../../guide/components/teacher-avatar-composer/teacher-avatar-composer.component';

@Component({
  selector: 'app-game-hud',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComposerComponent, TeacherAvatarComposerComponent],
  template: `
    <div class="game-hud-bar" role="banner">
      <div class="hud-left">
        @if (avatar()) {
          <div class="hud-avatar-portrait">
            @if (teacherMode()) {
              <app-teacher-avatar-composer size="sm" />
            } @else {
              <app-avatar-composer [avatarId]="avatarId()" size="sm" />
            }
          </div>
        }
        <div class="hud-identity">
          @if (eyebrow()) {
            <span class="hud-eyebrow">{{ eyebrow() }}</span>
          }
          <strong>{{ title() }}</strong>
          @if (subtitle()) {
            <small>{{ subtitle() }}</small>
          }
        </div>
      </div>

      <div class="hud-center">
        @if (level() !== null) {
          <div class="hud-level">
            <span>Lv. {{ level() }}</span>
            <div class="hud-xp-track">
              <span [style.width.%]="xpPercent()"></span>
            </div>
          </div>
        }
      </div>

      <div class="hud-right">
        <ng-content select="[hudActions]" />
      </div>
    </div>
  `,
  styles: [
    `
      .game-hud-bar {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 1rem;
        padding: 0.85rem 1.25rem;
        border: 2px solid var(--psy-border-gold);
        border-radius: var(--psy-radius);
        background: linear-gradient(180deg, rgba(30, 42, 78, 0.95), rgba(18, 24, 48, 0.92));
        box-shadow: 0 8px 0 rgba(0, 0, 0, 0.3), 0 0 32px rgba(79, 140, 255, 0.12);
        backdrop-filter: blur(16px);
        margin-bottom: 1.25rem;
      }
      .hud-left, .hud-right { display: flex; align-items: center; gap: 0.75rem; }
      .hud-right { justify-content: flex-end; }
      .hud-avatar-portrait {
        width: 52px;
        flex-shrink: 0;
        border: 2px solid var(--psy-gold);
        border-radius: var(--psy-radius-sm);
        overflow: hidden;
      }
      .hud-avatar-portrait:has(.teacher-composer) {
        width: 84px;
      }
      .hud-identity { display: grid; gap: 0.1rem; }
      .hud-eyebrow { font-family: var(--psy-font-hud); font-size: 0.58rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--psy-accent); }
      .hud-identity strong { font-family: var(--psy-font-display); font-size: 1.05rem; color: var(--psy-gold); }
      .hud-identity small { color: var(--psy-muted); font-size: 0.82rem; }
      .hud-level { display: grid; gap: 0.3rem; min-width: 140px; text-align: center; }
      .hud-level > span { font-family: var(--psy-font-hud); font-size: 0.62rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--psy-gold); }
      .hud-xp-track { height: 8px; border-radius: var(--psy-radius-pill); background: rgba(0,0,0,0.4); border: 1px solid var(--psy-line); overflow: hidden; }
      .hud-xp-track span { display: block; height: 100%; background: linear-gradient(90deg, var(--psy-primary), var(--psy-accent)); transition: width 0.6s ease; }
      @media (max-width: 768px) { .game-hud-bar { grid-template-columns: 1fr; } .hud-center { order: 3; } }
    `,
  ],
})
export class GameHudComponent {
  readonly eyebrow = input('');
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly level = input<number | null>(null);
  readonly xpPercent = input(65);
  readonly avatar = input(true);
  readonly avatarId = input<AvatarId>('psych-alejandro');
  readonly teacherMode = input(false);
}

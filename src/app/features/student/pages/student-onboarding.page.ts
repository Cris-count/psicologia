import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AvatarId } from '../../../models/academy.models';
import { AuthService } from '../../../services/auth.service';
import { GameAnimateDirective } from '../../../shared/directives/game-animate.directive';
import { AvatarPickerComponent } from '../../../shared/guide/components/avatar-picker/avatar-picker.component';
import { GameAvatarPortraitComponent } from '../../../shared/guide/components/game-avatar-portrait/game-avatar-portrait.component';
import { avatarById } from '../../../shared/guide/data/avatar.catalog';
import { GuideService } from '../../../shared/guide/services/guide.service';
import { StudentProfileService } from '../../../shared/guide/services/student-profile.service';
import { GameLoaderService } from '../../../shared/services/game-loader.service';
import { ThreeBackgroundComponent } from '../../../shared/ui/three-background/three-background.component';

type OnboardingStep = 'welcome' | 'avatar' | 'nickname';

@Component({
  selector: 'app-student-onboarding-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './student-onboarding.css',
  host: { class: 'onboarding-page-host' },
  imports: [
    FormsModule,
    ThreeBackgroundComponent,
    AvatarPickerComponent,
    GameAvatarPortraitComponent,
    GameAnimateDirective,
  ],
  template: `
    <app-three-background intensity="login" />

    <div class="onboarding-cinema" appGameAnimate="fade-up">
      <header class="onboarding-hud">
        <p class="eyebrow">Creación de personaje</p>
        <h1>Tu identidad en MIND-SPHERE</h1>
      </header>

      <div class="onboarding-main">
        <nav class="onboarding-progress" aria-label="Progreso de creación">
          @for (s of steps; track s.id) {
            <span class="step-pill" [class.active]="step() === s.id" [class.done]="stepIndex() > s.index">
              {{ s.label }}
            </span>
          }
        </nav>

        <article class="onboarding-stage-panel">
          @if (step() === 'welcome') {
            <h2>Bienvenido, explorador mental</h2>
            <p>
              Acceso confirmado. Antes de entrar a las misiones clínicas, elige tu héroe y define tu nickname.
              GARY te acompañará con pistas psicológicas — nunca con la respuesta directa.
            </p>
            <button class="primary-button" type="button" (click)="goStep('avatar')">Elegir personaje</button>
          }

          @if (step() === 'avatar') {
            <h2>Selecciona tu héroe</h2>
            <div class="hero-preview-row">
              <app-game-avatar-portrait [avatarId]="selectedAvatar" size="lg" />
              <div class="hero-preview-meta">
                <span>{{ selectedHero().className }}</span>
                <strong>{{ selectedHero().label }}</strong>
                <small>{{ selectedHero().theme }}</small>
              </div>
            </div>
            <app-avatar-picker [(selectedId)]="selectedAvatar" />
            <div class="button-row">
              <button class="ghost-button" type="button" (click)="goStep('welcome')">Atrás</button>
              <button class="primary-button" type="button" (click)="goStep('nickname')">Confirmar héroe</button>
            </div>
          }

          @if (step() === 'nickname') {
            <h2>Define tu nickname</h2>
            <p>Este será tu nombre visible en MIND-SPHERE y en el ranking de misiones.</p>
            <form class="stack-form" (ngSubmit)="finish()">
              <label>
                Nickname (mín. 3 caracteres)
                <input
                  [(ngModel)]="nickname"
                  name="nickname"
                  required
                  minlength="3"
                  maxlength="20"
                  placeholder="Ej: NeuralExplorer"
                />
              </label>
              @if (nickname.length >= 3) {
                <p class="nickname-status" [class.ok]="nicknameAvailable()" [class.bad]="!nicknameAvailable()">
                  {{ nicknameAvailable() ? 'Nickname disponible' : 'Nickname no disponible' }}
                </p>
              }
              <div class="player-card-preview">
                <app-game-avatar-portrait [avatarId]="selectedAvatar" size="sm" />
                <div>
                  <span class="card-label">Tarjeta de jugador</span>
                  <span class="card-nickname">{{ nickname.trim() || 'TuNickname' }}</span>
                </div>
              </div>
              @if (error()) {
                <p class="form-error">{{ error() }}</p>
              }
              <div class="button-row">
                <button class="ghost-button" type="button" (click)="goStep('avatar')">Atrás</button>
                <button class="primary-button" type="submit" [disabled]="!canFinish()">Entrar a MIND-SPHERE</button>
              </div>
            </form>
          }
        </article>
      </div>
    </div>
  `,
})
export class StudentOnboardingPage implements OnInit {
  protected readonly guide = inject(GuideService);
  private readonly profile = inject(StudentProfileService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly loader = inject(GameLoaderService);

  readonly step = signal<OnboardingStep>('welcome');
  readonly error = signal('');
  selectedAvatar: AvatarId = 'neural-01';
  nickname = '';

  readonly selectedHero = computed(() => avatarById(this.selectedAvatar));

  readonly steps = [
    { id: 'welcome' as const, label: 'Briefing', index: 0 },
    { id: 'avatar' as const, label: 'Héroe', index: 1 },
    { id: 'nickname' as const, label: 'Nickname', index: 2 },
  ];

  ngOnInit(): void {
    this.auth.ensureAuthenticatedOrRedirect();
    this.guide.setVisible(true);
    this.guide.setContext('onboarding_welcome');
  }

  stepIndex(): number {
    return this.steps.findIndex((s) => s.id === this.step());
  }

  goStep(next: OnboardingStep): void {
    this.step.set(next);
    this.guide.setContext(`onboarding_${next}` as 'onboarding_welcome' | 'onboarding_avatar' | 'onboarding_nickname');
  }

  nicknameAvailable(): boolean {
    return this.profile.isNicknameAvailable(this.nickname);
  }

  canFinish(): boolean {
    return this.nickname.trim().length >= 3 && this.nicknameAvailable();
  }

  async finish(): Promise<void> {
    this.error.set('');
    if (!this.canFinish()) {
      this.error.set('El nickname debe tener al menos 3 caracteres y estar disponible.');
      return;
    }

    await this.loader.runSequence([
      { progress: 30, message: 'Sincronizando héroe...', delayMs: 350 },
      { progress: 65, message: 'Registrando nickname...', delayMs: 400 },
      { progress: 100, message: '¡Personaje listo!', delayMs: 350 },
    ]);

    const ok = this.profile.saveProfile(this.nickname, this.selectedAvatar);
    this.loader.hide();
    if (!ok) {
      this.error.set('No se pudo guardar el perfil. Intenta otro nickname.');
      return;
    }

    this.guide.setContext('onboarding_complete');
    await this.router.navigateByUrl('/student');
  }
}

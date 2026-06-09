import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AvatarId } from '../../../models/academy.models';
import { AuthService } from '../../../services/auth.service';
import { GameAnimateDirective } from '../../../shared/directives/game-animate.directive';
import { AvatarComposerComponent } from '../../../shared/guide/components/avatar-composer/avatar-composer.component';
import { AvatarStudioComponent } from '../../../shared/guide/components/avatar-studio/avatar-studio.component';
import { GuideService } from '../../../shared/guide/services/guide.service';
import { StudentProfileService } from '../../../shared/guide/services/student-profile.service';
import { GameLoaderService } from '../../../shared/services/game-loader.service';
import { ThreeBackgroundComponent } from '../../../shared/ui/three-background/three-background.component';

type OnboardingStep = 'welcome' | 'studio' | 'identity';

@Component({
  selector: 'app-student-onboarding-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './student-onboarding.css',
  host: { class: 'onboarding-page-host' },
  imports: [
    FormsModule,
    ThreeBackgroundComponent,
    AvatarStudioComponent,
    AvatarComposerComponent,
    GameAnimateDirective,
  ],
  template: `
    <app-three-background intensity="login" />

    <div class="onboarding-cinema" appGameAnimate="fade-up">
      <header class="onboarding-hud">
        <p class="eyebrow">Creación de personaje</p>
        <h1>Tu avatar en MIND-SPHERE</h1>
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
              Elige uno de los personajes disponibles y ponle nombre. Así aparecerás en el mundo
              de MIND-SPHERE.
            </p>
            <button class="primary-button" type="button" (click)="goStep('studio')">Elegir mi personaje</button>
          }

          @if (step() === 'studio') {
            <app-avatar-studio
              [(draftAvatarId)]="draftAvatarId"
              [(characterName)]="characterName"
              confirmLabel="Confirmar personaje y continuar"
              (confirmed)="onAvatarConfirmed($event)"
            />
            <div class="button-row">
              <button class="ghost-button" type="button" (click)="goStep('welcome')">Atrás</button>
            </div>
          }

          @if (step() === 'identity') {
            <h2>Tu identidad en el juego</h2>
            <p>
              Tu personaje se llama <strong>{{ characterName }}</strong>. Ahora elige tu nickname único.
            </p>
            <div class="identity-layout">
              <app-avatar-composer [avatarId]="confirmedAvatarId()" size="lg" />
              <form class="stack-form" (ngSubmit)="finish()">
                <label>
                  Nickname (mín. 3 caracteres, único)
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
                @if (error()) {
                  <p class="form-error">{{ error() }}</p>
                }
                <div class="button-row">
                  <button class="ghost-button" type="button" (click)="goStep('studio')">Cambiar personaje</button>
                  <button class="primary-button" type="submit" [disabled]="!canFinish()">Entrar a MIND-SPHERE</button>
                </div>
              </form>
            </div>
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
  readonly confirmedAvatarId = signal<AvatarId>('psych-alejandro');
  draftAvatarId: AvatarId = 'psych-alejandro';
  characterName = '';
  nickname = '';
  avatarConfirmed = false;

  readonly steps = [
    { id: 'welcome' as const, label: 'Briefing', index: 0 },
    { id: 'studio' as const, label: 'Avatar', index: 1 },
    { id: 'identity' as const, label: 'Identidad', index: 2 },
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
    const ctx = next === 'studio' ? 'onboarding_appearance' : `onboarding_${next === 'identity' ? 'nickname' : next}`;
    this.guide.setContext(ctx as 'onboarding_welcome');
  }

  onAvatarConfirmed(selection: { avatarId: AvatarId; characterName: string }): void {
    this.confirmedAvatarId.set(selection.avatarId);
    this.draftAvatarId = selection.avatarId;
    this.characterName = selection.characterName;
    this.avatarConfirmed = true;
    this.goStep('identity');
  }

  nicknameAvailable(): boolean {
    return this.profile.isNicknameAvailable(this.nickname);
  }

  canFinish(): boolean {
    return (
      this.avatarConfirmed &&
      this.characterName.trim().length >= 2 &&
      this.nickname.trim().length >= 3 &&
      this.nicknameAvailable()
    );
  }

  async finish(): Promise<void> {
    this.error.set('');
    if (!this.canFinish()) {
      this.error.set('Confirma tu personaje, nombre (2+) y nickname disponible (3+).');
      return;
    }

    await this.loader.runSequence([
      { progress: 40, message: 'Guardando personaje...', delayMs: 350 },
      { progress: 75, message: 'Registrando identidad...', delayMs: 350 },
      { progress: 100, message: '¡Listo!', delayMs: 300 },
    ]);

    const ok = this.profile.saveProfile(this.nickname, this.confirmedAvatarId(), this.characterName);
    this.loader.hide();
    if (!ok) {
      this.error.set('No se pudo guardar. Intenta otro nickname.');
      return;
    }

    this.guide.setContext('onboarding_complete');
    await this.router.navigateByUrl('/student');
  }
}

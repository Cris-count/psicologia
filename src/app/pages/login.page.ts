import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserRole } from '../models/academy.models';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="psych-login-shell">
      <header class="login-topbar" aria-label="Barra superior">
        <a class="brand-mark" href="/" aria-label="PSYCH-SIMULATOR">
          <img class="brand-logo" src="/psych-simulator-logo.svg" alt="" aria-hidden="true" />
          <span>PSYCH-SIMULATOR</span>
        </a>

        <nav class="top-actions" aria-label="Acciones rapidas">
          <button type="button" aria-label="Idioma espanol">
            <span class="material-symbols-outlined" aria-hidden="true">language</span>
            <span>ES</span>
          </button>
          <button type="button" aria-label="Configuracion">
            <span class="material-symbols-outlined" aria-hidden="true">settings</span>
          </button>
          <button type="button" aria-label="Ayuda">
            <span class="material-symbols-outlined" aria-hidden="true">help</span>
          </button>
        </nav>
      </header>

      <section class="login-stage" aria-label="Ingreso academico">
        <div class="login-glass-card">
          <aside class="login-showcase" aria-label="Ventajas del simulador">
            <div class="avatar-frame">
              <img
                alt="Avatar academico del simulador psicologico"
                src="/psysim-login-avatar.png"
              />
            </div>

            <div>
              <p class="eyebrow">Prototipo academico</p>
              <h2>Ventajas del Simulador</h2>
            </div>

            <ul class="benefit-list">
              <li>
                <span class="benefit-icon material-symbols-outlined" aria-hidden="true">psychology</span>
                <span>Mapeo narrativo en tiempo real</span>
              </li>
              <li>
                <span class="benefit-icon material-symbols-outlined" aria-hidden="true">clinical_notes</span>
                <span>Casos clinicos academicos avanzados</span>
              </li>
              <li>
                <span class="benefit-icon material-symbols-outlined" aria-hidden="true">smart_toy</span>
                <span>Retroalimentacion guiada por reglas</span>
              </li>
            </ul>

            <p class="engine-note">NEURAL ENGINE v4.0.2 POWERED</p>
          </aside>

          <section class="login-form-panel">
            <div class="form-heading">
              <p class="mobile-brand">PSYCH-SIMULATOR</p>
              <h1>Acceso Academico</h1>
              <p>Inicie sesion para continuar con su simulacion.</p>
            </div>

            <form class="login-form" (ngSubmit)="login()">
              <fieldset class="role-fieldset">
                <legend>Tipo de Perfil</legend>
                <div class="role-selector">
                  @for (role of roleOptions; track role.value) {
                    <button
                      type="button"
                      [class.active]="selectedRole === role.value"
                      [attr.aria-pressed]="selectedRole === role.value"
                      (click)="selectRole(role.value)"
                    >
                      {{ role.label }}
                    </button>
                  }
                </div>
              </fieldset>

              <label class="form-field" for="academic-id">
                ID Academico / Email
                <span class="input-wrap">
                  <input
                    id="academic-id"
                    name="email"
                    type="email"
                    [(ngModel)]="email"
                    autocomplete="email"
                    placeholder="nombre@institucion.edu"
                    required
                  />
                  <span class="material-symbols-outlined" aria-hidden="true">badge</span>
                </span>
              </label>

              <label class="form-field" for="password">
                <span class="password-row">
                  Contrasena
                  <a href="#" (click)="$event.preventDefault()">Olvido su clave?</a>
                </span>
                <span class="input-wrap">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    [(ngModel)]="password"
                    autocomplete="current-password"
                    placeholder="........"
                    required
                  />
                  <span class="material-symbols-outlined" aria-hidden="true">lock</span>
                </span>
              </label>

              @if (error) {
                <p class="form-error" role="alert">{{ error }}</p>
              }

              <button class="login-submit" type="submit">Entrar al sistema</button>

              <div class="login-links">
                <span>Nuevo en el sistema?</span>
                <a href="#" (click)="$event.preventDefault()">Crear nueva cuenta academica</a>
              </div>

              <div class="demo-box" aria-label="Credenciales demo">
                <strong>Credenciales demo</strong>
                <span>Superadmin: superadmin&#64;demo.edu / demo123</span>
                <span>Maestro: maestro&#64;demo.edu / demo123</span>
                <span>Estudiante: estudiante&#64;demo.edu / demo123</span>
              </div>
            </form>
          </section>
        </div>
      </section>

      <footer class="status-bar" aria-label="Estado del sistema">
        <div class="status-left">
          <span class="status-pill">
            <span class="status-dot" aria-hidden="true"></span>
            System Status: Optimal
          </span>
          <span class="active-users">
            <span class="material-symbols-outlined" aria-hidden="true">group</span>
            Active Users: 1,284
          </span>
        </div>
        <div class="status-right">
          <span>SIMULATION VER 4.0.2</span>
          <span class="divider" aria-hidden="true"></span>
          <strong>2024 NEURAL LABS INC.</strong>
        </div>
      </footer>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        --login-primary: #0050cb;
        --login-primary-bright: #0066ff;
        --login-surface-raised: rgba(255, 255, 255, 0.72);
        --login-text: #191c1e;
        --login-muted: #424656;
        --login-card-shadow: 0 24px 70px rgba(0, 80, 203, 0.13);
      }

      .psych-login-shell {
        position: relative;
        min-height: 100vh;
        display: grid;
        grid-template-rows: auto 1fr auto;
        overflow-x: hidden;
        overflow-y: auto;
        color: var(--login-text);
        background:
          linear-gradient(90deg, rgba(247, 249, 251, 0.88), rgba(247, 249, 251, 0.66)),
          url("/psysim-login-background.png") center / cover no-repeat;
      }

      .login-topbar,
      .status-bar {
        width: min(1280px, calc(100% - 32px));
        margin-inline: auto;
        z-index: 2;
      }

      .login-topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 1rem 0;
      }

      .brand-mark,
      .top-actions,
      .top-actions button,
      .status-left,
      .status-right,
      .status-pill,
      .active-users {
        display: flex;
        align-items: center;
      }

      .brand-mark {
        gap: 0.6rem;
        color: var(--login-primary);
        text-decoration: none;
        font-family: "Hanken Grotesk", Inter, sans-serif;
        font-size: clamp(1.15rem, 2.4vw, 2rem);
        font-weight: 800;
        letter-spacing: 0.08em;
      }

      .brand-logo {
        width: 44px;
        height: 44px;
        flex: 0 0 auto;
        display: block;
        filter: drop-shadow(0 8px 16px rgba(0, 80, 203, 0.18));
      }

      .top-actions {
        gap: 0.65rem;
      }

      .top-actions button {
        min-width: 44px;
        height: 44px;
        justify-content: center;
        gap: 0.25rem;
        border: 0;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.52);
        color: var(--login-muted);
        font-family: "Hanken Grotesk", Inter, sans-serif;
        font-size: 0.83rem;
        font-weight: 700;
        transition: 180ms ease;
      }

      .top-actions button:hover {
        color: var(--login-primary);
        background: rgba(255, 255, 255, 0.82);
        transform: translateY(-1px);
      }

      .login-stage {
        width: min(1100px, calc(100% - 32px));
        margin: auto;
        padding: 1.25rem 0 1.75rem;
        animation: fade-in 650ms ease-out both;
      }

      .login-glass-card {
        display: grid;
        grid-template-columns: minmax(0, 0.94fr) minmax(360px, 1.06fr);
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.44);
        border-radius: 12px;
        background: var(--login-surface-raised);
        box-shadow: var(--login-card-shadow);
        backdrop-filter: blur(24px);
      }

      .login-showcase {
        display: flex;
        flex-direction: column;
        gap: 1.4rem;
        min-height: clamp(520px, calc(100vh - 150px), 620px);
        padding: 2.6rem;
        border-right: 1px solid rgba(255, 255, 255, 0.5);
        background: rgba(0, 80, 203, 0.055);
      }

      .avatar-frame {
        width: clamp(220px, 28vw, 320px);
        aspect-ratio: 1;
        align-self: center;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.72);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.34);
        padding: 0.55rem;
      }

      .avatar-frame img {
        width: 100%;
        height: 100%;
        border-radius: inherit;
        object-fit: cover;
        display: block;
      }

      .eyebrow {
        margin: 0 0 0.55rem;
        color: var(--login-primary);
        font-family: "Hanken Grotesk", Inter, sans-serif;
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .login-showcase h2,
      .form-heading h1 {
        margin: 0;
        font-family: "Hanken Grotesk", Inter, sans-serif;
        color: var(--login-text);
      }

      .login-showcase h2 {
        color: var(--login-primary);
        font-size: 1.6rem;
        line-height: 1.25;
      }

      .benefit-list {
        display: grid;
        gap: 1rem;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .benefit-list li {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        color: var(--login-muted);
        font-size: 0.98rem;
        line-height: 1.45;
      }

      .benefit-icon {
        width: 34px;
        height: 34px;
        display: grid;
        flex: 0 0 auto;
        place-items: center;
        border-radius: 999px;
        background: rgba(0, 80, 203, 0.1);
        color: var(--login-primary);
        transition: 180ms ease;
      }

      .benefit-list li:hover .benefit-icon {
        background: var(--login-primary);
        color: #fff;
      }

      .engine-note {
        margin: auto 0 0;
        border-top: 1px solid rgba(0, 80, 203, 0.13);
        padding-top: 1.4rem;
        color: #727687;
        font-family: "Hanken Grotesk", Inter, sans-serif;
        font-size: 0.76rem;
        font-weight: 700;
      }

      .login-form-panel {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: clamp(1.5rem, 4vw, 3rem);
      }

      .form-heading {
        margin-bottom: 2rem;
      }

      .mobile-brand {
        display: none;
      }

      .form-heading h1 {
        font-size: clamp(2rem, 5vw, 2.65rem);
        line-height: 1.12;
      }

      .form-heading p {
        margin: 0.5rem 0 0;
        color: var(--login-muted);
        line-height: 1.6;
      }

      .login-form {
        display: grid;
        gap: 1.15rem;
      }

      .role-fieldset {
        display: grid;
        gap: 0.55rem;
        margin: 0;
        padding: 0;
        border: 0;
      }

      .role-fieldset legend,
      .form-field,
      .password-row {
        color: var(--login-text);
        font-family: "Hanken Grotesk", Inter, sans-serif;
        font-size: 0.9rem;
        font-weight: 700;
      }

      .role-selector {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.35rem;
        border-radius: 8px;
        background: #eceef0;
        padding: 0.3rem;
      }

      .role-selector button {
        min-height: 38px;
        border: 1px solid transparent;
        border-radius: 6px;
        background: transparent;
        color: var(--login-muted);
        font-family: "Hanken Grotesk", Inter, sans-serif;
        font-size: 0.78rem;
        font-weight: 700;
        transition: 180ms ease;
      }

      .role-selector button.active {
        border-color: rgba(0, 80, 203, 0.12);
        background: #fff;
        color: var(--login-primary);
        box-shadow: 0 8px 24px rgba(25, 28, 30, 0.08);
      }

      .form-field {
        display: grid;
        gap: 0.55rem;
      }

      .password-row {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
      }

      .password-row a,
      .login-links a {
        color: var(--login-primary);
        text-decoration: none;
      }

      .password-row a:hover,
      .login-links a:hover {
        text-decoration: underline;
      }

      .input-wrap {
        position: relative;
        display: block;
      }

      .input-wrap input {
        width: 100%;
        height: 48px;
        border: 1px solid transparent;
        border-radius: 8px;
        background: #f7f9fb;
        color: var(--login-text);
        padding: 0 3rem 0 1rem;
        outline: none;
        transition: 180ms ease;
      }

      .input-wrap input:focus {
        border-color: rgba(0, 80, 203, 0.55);
        background: #fff;
        box-shadow: 0 0 0 3px rgba(0, 80, 203, 0.15);
      }

      .input-wrap .material-symbols-outlined {
        position: absolute;
        top: 50%;
        right: 1rem;
        color: #727687;
        transform: translateY(-50%);
      }

      .form-error {
        margin: 0;
        border-radius: 8px;
        background: #ffdad6;
        color: #93000a;
        padding: 0.8rem 0.95rem;
        font-weight: 700;
      }

      .login-submit {
        width: 100%;
        min-height: 54px;
        border: 0;
        border-radius: 8px;
        background: var(--login-primary);
        color: #fff;
        box-shadow: 0 16px 32px rgba(0, 80, 203, 0.22);
        font-family: "Hanken Grotesk", Inter, sans-serif;
        font-size: 0.86rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        transition: 180ms ease;
      }

      .login-submit:hover {
        background: var(--login-primary-bright);
        box-shadow: 0 18px 36px rgba(0, 102, 255, 0.26);
      }

      .login-submit:active {
        transform: scale(0.98);
      }

      .login-links {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.35rem;
        color: #727687;
        font-size: 0.9rem;
      }

      .demo-box {
        display: grid;
        gap: 0.25rem;
        border-left: 4px solid var(--login-primary);
        border-radius: 8px;
        background: rgba(219, 226, 250, 0.62);
        color: #3f4759;
        padding: 0.9rem;
        font-size: 0.88rem;
      }

      .status-bar {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
        border-top: 1px solid rgba(255, 255, 255, 0.18);
        background: rgba(247, 249, 251, 0.28);
        padding: 0.9rem 0;
        backdrop-filter: blur(14px);
        color: var(--login-muted);
        font-family: "Hanken Grotesk", Inter, sans-serif;
        font-size: 0.78rem;
        font-weight: 700;
      }

      .status-left,
      .status-right {
        gap: 1.35rem;
      }

      .status-pill,
      .active-users {
        gap: 0.45rem;
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: #28d9f3;
        box-shadow: 0 0 0 rgba(40, 217, 243, 0.7);
        animation: pulse-dot 1.6s ease-out infinite;
      }

      .active-users .material-symbols-outlined {
        font-size: 1rem;
      }

      .divider {
        width: 1px;
        height: 14px;
        background: rgba(66, 70, 86, 0.24);
      }

      .status-right strong {
        color: var(--login-primary);
      }

      @keyframes fade-in {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes pulse-dot {
        0% {
          box-shadow: 0 0 0 0 rgba(40, 217, 243, 0.6);
        }
        70% {
          box-shadow: 0 0 0 8px rgba(40, 217, 243, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(40, 217, 243, 0);
        }
      }

      @media (max-width: 900px) {
        .login-topbar,
        .status-bar,
        .login-stage {
          width: min(100% - 24px, 620px);
        }

        .login-glass-card {
          grid-template-columns: 1fr;
        }

        .login-showcase {
          display: none;
        }

        .mobile-brand {
          display: block;
          margin: 0 0 0.5rem;
          color: var(--login-primary);
          font-family: "Hanken Grotesk", Inter, sans-serif;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .brand-mark span:last-child {
          display: none;
        }

        .status-bar,
        .status-left,
        .status-right {
          align-items: flex-start;
        }

        .status-bar {
          flex-direction: column;
        }
      }

      @media (max-width: 560px) {
        .top-actions {
          gap: 0.35rem;
        }

        .top-actions button {
          min-width: 40px;
          height: 40px;
        }

        .login-form-panel {
          padding: 1.25rem;
        }

        .role-selector {
          grid-template-columns: 1fr;
        }

        .password-row,
        .status-right {
          flex-direction: column;
          gap: 0.35rem;
        }

        .active-users,
        .divider {
          display: none;
        }
      }

      @media (min-width: 901px) and (max-height: 780px) {
        .login-topbar {
          padding: 0.65rem 0;
        }

        .login-stage {
          padding: 0.75rem 0 1rem;
        }

        .login-showcase,
        .login-form-panel {
          padding: 1.75rem;
        }

        .avatar-frame {
          width: clamp(190px, 22vw, 250px);
        }

        .form-heading {
          margin-bottom: 1.25rem;
        }

        .login-form {
          gap: 0.85rem;
        }

        .status-bar {
          padding: 0.65rem 0;
        }
      }
    `,
  ],
})
export class LoginPage {
  email = 'maestro@demo.edu';
  password = 'demo123';
  error = '';
  selectedRole: UserRole = 'TEACHER';
  readonly roleOptions: Array<{ label: string; value: UserRole; email: string }> = [
    { label: 'Estudiante', value: 'STUDENT', email: 'estudiante@demo.edu' },
    { label: 'Profesional', value: 'TEACHER', email: 'maestro@demo.edu' },
    { label: 'Admin', value: 'SUPERADMIN', email: 'superadmin@demo.edu' },
  ];

  constructor(private readonly auth: AuthService) {}

  selectRole(role: UserRole): void {
    this.selectedRole = role;
    const selected = this.roleOptions.find((option) => option.value === role);
    if (selected) {
      this.email = selected.email;
      this.password = 'demo123';
    }
  }

  login(): void {
    this.error = '';
    if (!this.auth.login(this.email, this.password)) {
      this.error = 'Credenciales invalidas o usuario inactivo.';
    }
  }
}

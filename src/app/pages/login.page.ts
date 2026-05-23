import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="login-shell">
      <section class="login-panel">
        <div>
          <p class="eyebrow">Prototipo academico</p>
          <h1>Simulador de casos y aula de aprendizaje</h1>
          <p class="intro">
            Plataforma educativa para gestionar grupos, situaciones narrativas y preguntas de decision multiple.
            No reemplaza herramientas clinicas, juridicas ni institucionales reales.
          </p>
        </div>

        <form class="login-card" (ngSubmit)="login()">
          <h2>Ingreso</h2>
          <label>
            Correo
            <input name="email" type="email" [(ngModel)]="email" autocomplete="email" required />
          </label>
          <label>
            Contrasena
            <input name="password" type="password" [(ngModel)]="password" autocomplete="current-password" required />
          </label>
          @if (error) {
            <p class="form-error">{{ error }}</p>
          }
          <button class="primary-button" type="submit">Ingresar</button>

          <div class="demo-box">
            <strong>Credenciales demo</strong>
            <span>Superadmin: superadmin&#64;demo.edu / demo123</span>
            <span>Maestro: maestro&#64;demo.edu / demo123</span>
            <span>Estudiante: estudiante&#64;demo.edu / demo123</span>
          </div>
        </form>
      </section>
    </main>
  `,
})
export class LoginPage {
  email = 'maestro@demo.edu';
  password = 'demo123';
  error = '';

  constructor(private readonly auth: AuthService) {}

  login(): void {
    this.error = '';
    if (!this.auth.login(this.email, this.password)) {
      this.error = 'Credenciales invalidas o usuario inactivo.';
    }
  }
}

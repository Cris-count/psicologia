import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiAssistantService } from '../../../services/ai-assistant.service';
import { AuthService } from '../../../services/auth.service';

interface AiMessage {
  role: 'user' | 'assistant';
  text: string;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (canUseAssistant()) {
      <button class="ai-fab" type="button" (click)="togglePanel()" [class.active]="open()" aria-label="Abrir asistente IA">
        <span class="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
      </button>

      @if (open()) {
        <section class="ai-panel" aria-label="Asistente IA para psicologia">
          <header class="ai-header">
            <div>
              <p>GEMINI ASSIST</p>
              <h2>Casos psicologicos</h2>
            </div>
            <button type="button" class="ai-icon" (click)="togglePanel()" aria-label="Cerrar asistente">
              <span class="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </header>

          <div class="ai-quick-actions" aria-label="Prompts rapidos">
            @for (prompt of quickPrompts; track prompt.label) {
              <button type="button" (click)="usePrompt(prompt.text)">
                {{ prompt.label }}
              </button>
            }
          </div>

          <div class="ai-messages" aria-live="polite">
            @if (!messages().length) {
              <div class="ai-empty">
                <span class="material-symbols-outlined" aria-hidden="true">psychology</span>
                <p>Pregunta por casos, escenarios, preguntas, rubricas o feedback para clases de psicologia.</p>
              </div>
            }

            @for (message of messages(); track $index) {
              <article class="ai-message" [class.user]="message.role === 'user'">
                <span>{{ message.role === 'user' ? 'Tu' : 'IA' }}</span>
                <p>{{ message.text }}</p>
              </article>
            }
          </div>

          @if (error()) {
            <p class="ai-error">{{ error() }}</p>
          }

          <form class="ai-form" (ngSubmit)="sendMessage()">
            <textarea
              name="aiPrompt"
              [(ngModel)]="draft"
              rows="3"
              [disabled]="loading()"
              placeholder="Crear un caso de ansiedad escolar con preguntas..."
            ></textarea>
            <button type="submit" [disabled]="loading() || !draft.trim()">
              @if (loading()) {
                <span class="ai-spinner" aria-hidden="true"></span>
              } @else {
                <span class="material-symbols-outlined" aria-hidden="true">send</span>
              }
              Enviar
            </button>
          </form>
        </section>
      }
    }
  `,
  styles: [
    `
      :host {
        position: fixed;
        inset: auto 0 0 auto;
        z-index: 2147483000;
        pointer-events: none;
      }

      .ai-fab {
        position: fixed;
        right: 24px;
        bottom: 24px;
        z-index: 2147483002;
        display: grid;
        width: 58px;
        height: 58px;
        place-items: center;
        border: 1px solid rgba(255, 214, 49, 0.75);
        border-radius: 18px;
        background: linear-gradient(135deg, #ffd631, #ff8f1f);
        color: #13092e;
        box-shadow: 0 18px 42px rgba(255, 177, 31, 0.28);
        cursor: pointer;
        pointer-events: auto;
      }

      .ai-fab.active {
        border-color: rgba(255, 255, 255, 0.8);
        box-shadow: 0 0 0 3px rgba(255, 214, 49, 0.18), 0 18px 42px rgba(255, 177, 31, 0.28);
      }

      .ai-panel {
        position: fixed;
        right: 24px;
        bottom: 96px;
        z-index: 2147483001;
        display: grid;
        grid-template-rows: auto auto minmax(160px, 1fr) auto auto;
        width: min(390px, calc(100vw - 32px));
        max-height: min(720px, calc(100vh - 128px));
        overflow: hidden;
        border: 1px solid rgba(132, 106, 255, 0.42);
        border-radius: 8px;
        background:
          radial-gradient(circle at top left, rgba(255, 55, 207, 0.16), transparent 34%),
          linear-gradient(180deg, rgba(20, 17, 58, 0.98), rgba(10, 17, 42, 0.98));
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.42);
        color: #f8f4ff;
        pointer-events: auto;
      }

      .ai-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 18px 18px 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .ai-header p {
        margin: 0 0 5px;
        color: #ff4fd8;
        font-size: 0.68rem;
        font-weight: 800;
        letter-spacing: 0.12em;
      }

      .ai-header h2 {
        margin: 0;
        color: #ffd631;
        font-size: 1.08rem;
        line-height: 1.2;
      }

      .ai-icon {
        display: grid;
        width: 34px;
        height: 34px;
        place-items: center;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.06);
        color: #f8f4ff;
        cursor: pointer;
      }

      .ai-quick-actions {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
        padding: 14px 18px;
      }

      .ai-quick-actions button {
        min-height: 36px;
        border: 1px solid rgba(132, 106, 255, 0.32);
        border-radius: 8px;
        background: rgba(43, 32, 106, 0.78);
        color: #e9ddff;
        font: inherit;
        font-size: 0.78rem;
        cursor: pointer;
      }

      .ai-messages {
        display: grid;
        gap: 10px;
        align-content: start;
        min-height: 160px;
        overflow: auto;
        padding: 0 18px 14px;
      }

      .ai-empty {
        display: grid;
        gap: 10px;
        justify-items: center;
        padding: 28px 16px;
        border: 1px dashed rgba(132, 106, 255, 0.32);
        border-radius: 8px;
        color: #b9a8f2;
        text-align: center;
      }

      .ai-empty p {
        margin: 0;
        font-size: 0.84rem;
        line-height: 1.45;
      }

      .ai-empty .material-symbols-outlined {
        color: #ffd631;
        font-size: 2rem;
      }

      .ai-message {
        max-width: 92%;
        padding: 10px 12px;
        border: 1px solid rgba(132, 106, 255, 0.28);
        border-radius: 8px;
        background: rgba(18, 26, 62, 0.88);
        white-space: pre-wrap;
      }

      .ai-message.user {
        justify-self: end;
        border-color: rgba(255, 214, 49, 0.35);
        background: rgba(62, 45, 18, 0.68);
      }

      .ai-message span {
        display: block;
        margin-bottom: 5px;
        color: #ff4fd8;
        font-size: 0.68rem;
        font-weight: 800;
        text-transform: uppercase;
      }

      .ai-message p {
        margin: 0;
        color: #f8f4ff;
        font-size: 0.84rem;
        line-height: 1.48;
      }

      .ai-error {
        margin: 0 18px 12px;
        padding: 10px 12px;
        border: 1px solid rgba(255, 97, 97, 0.35);
        border-radius: 8px;
        background: rgba(255, 97, 97, 0.1);
        color: #ffb8c0;
        font-size: 0.8rem;
      }

      .ai-form {
        display: grid;
        gap: 10px;
        padding: 14px 18px 18px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .ai-form textarea {
        width: 100%;
        resize: vertical;
        border: 1px solid rgba(132, 106, 255, 0.36);
        border-radius: 8px;
        background: rgba(7, 10, 30, 0.86);
        color: #fff;
        font: inherit;
        font-size: 0.88rem;
        line-height: 1.45;
        outline: none;
        padding: 11px 12px;
      }

      .ai-form textarea:focus {
        border-color: rgba(255, 214, 49, 0.72);
        box-shadow: 0 0 0 3px rgba(255, 214, 49, 0.12);
      }

      .ai-form button {
        display: inline-flex;
        min-height: 42px;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border: 0;
        border-radius: 8px;
        background: linear-gradient(135deg, #ffd631, #ff9f2d);
        color: #13092e;
        font: inherit;
        font-weight: 900;
        cursor: pointer;
      }

      .ai-form button:disabled {
        cursor: not-allowed;
        filter: grayscale(0.55);
        opacity: 0.68;
      }

      .ai-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(19, 9, 46, 0.28);
        border-top-color: #13092e;
        border-radius: 50%;
        animation: ai-spin 0.7s linear infinite;
      }

      @keyframes ai-spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 640px) {
        .ai-fab {
          right: 16px;
          bottom: 16px;
        }

        .ai-panel {
          right: 16px;
          bottom: 86px;
          max-height: calc(100vh - 108px);
        }
      }
    `,
  ],
})
export class AiAssistantComponent {
  readonly context = input('teacher');
  protected readonly quickPrompts = [
    {
      label: 'Crear caso',
      text: 'Crea un caso psicologico educativo con objetivo, contexto, escenario, 4 preguntas y feedback.',
    },
    {
      label: 'Crear escenario',
      text: 'Crea un escenario de psicologia para estudiantes con instrucciones claras y dilema etico.',
    },
    {
      label: 'Preguntas',
      text: 'Genera preguntas de analisis psicologico con opciones, respuesta correcta y retroalimentacion.',
    },
    {
      label: 'Feedback',
      text: 'Mejora este feedback para una respuesta de estudiante en un caso de psicologia: ',
    },
  ];

  protected draft = '';
  protected readonly open = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly messages = signal<AiMessage[]>([]);

  private readonly auth = inject(AuthService);
  private readonly assistant = inject(AiAssistantService);

  protected readonly canUseAssistant = computed(() => {
    const role = this.auth.currentUser()?.role;
    return role === 'SUPERADMIN' || role === 'TEACHER';
  });

  protected togglePanel(): void {
    this.open.update((value) => !value);
  }

  protected usePrompt(prompt: string): void {
    this.draft = prompt;
  }

  protected async sendMessage(): Promise<void> {
    const message = this.draft.trim();

    if (!message || this.loading()) {
      return;
    }

    this.draft = '';
    this.error.set('');
    this.loading.set(true);
    this.messages.update((messages) => [...messages, { role: 'user', text: message }]);

    try {
      const response = await this.assistant.ask(message, this.context());
      const answer = response.text || response.message;

      if (answer) {
        this.messages.update((messages) => [...messages, { role: 'assistant', text: answer }]);
      } else {
        this.error.set(response.error ?? 'El asistente no devolvio contenido.');
      }
    } catch {
      this.error.set('No se pudo contactar el asistente.');
    } finally {
      this.loading.set(false);
    }
  }
}

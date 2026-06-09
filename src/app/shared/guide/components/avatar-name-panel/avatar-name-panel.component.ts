import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-avatar-name-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <section class="name-panel">
      <header class="name-panel-header">
        <h3>{{ title() }}</h3>
        <p>{{ subtitle() }}</p>
      </header>

      <div class="name-panel-body">
        <div class="portrait-wrap">
          <img class="portrait" [src]="portraitUrl()" [alt]="'Avatar seleccionado'" width="220" height="280" />
        </div>

        <form class="name-form" (ngSubmit)="onConfirm()">
          <label>
            {{ fieldLabel() }}
            <input
              [(ngModel)]="characterName"
              name="avatarCharacterName"
              required
              minlength="2"
              [maxlength]="maxLength()"
              [placeholder]="placeholder()"
              autocomplete="off"
            />
          </label>
          <p class="hint">{{ hint() }}</p>

          <div class="actions">
            <button class="ghost-button" type="button" (click)="back.emit()">{{ backLabel() }}</button>
            <button class="primary-button" type="submit" [disabled]="!canConfirm()">{{ confirmLabel() }}</button>
          </div>
        </form>
      </div>
    </section>
  `,
  styles: [
    `
      .name-panel {
        display: grid;
        gap: 1rem;
        padding: 1rem;
        border-radius: var(--psy-radius);
        background: rgba(0, 0, 0, 0.28);
        border: 1px solid var(--psy-line);
      }

      .name-panel-header {
        text-align: center;
      }

      .name-panel-header h3 {
        margin: 0;
        font-family: var(--psy-font-display);
        font-size: 1.15rem;
        color: #fff;
      }

      .name-panel-header p {
        margin: 0.35rem 0 0;
        color: var(--psy-muted);
        font-size: 0.88rem;
      }

      .name-panel-body {
        display: grid;
        gap: 1.25rem;
        align-items: start;
      }

      @media (min-width: 640px) {
        .name-panel-body {
          grid-template-columns: minmax(140px, 200px) 1fr;
        }
      }

      .portrait-wrap {
        justify-self: center;
      }

      .portrait {
        width: 100%;
        max-width: 200px;
        height: auto;
        border-radius: 14px;
        object-fit: cover;
        object-position: center top;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
      }

      .name-form {
        display: grid;
        gap: 0.75rem;
        align-content: center;
      }

      .name-form label {
        display: grid;
        gap: 0.35rem;
        font-size: 0.82rem;
        color: var(--psy-muted);
      }

      .name-form input {
        padding: 0.7rem 0.85rem;
        border-radius: var(--psy-radius-sm);
        border: 1px solid var(--psy-line);
        background: rgba(0, 0, 0, 0.35);
        color: var(--psy-ink);
        font-family: var(--psy-font-display);
        font-size: 1rem;
      }

      .hint {
        margin: 0;
        font-size: 0.78rem;
        color: var(--psy-muted);
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
        margin-top: 0.25rem;
      }

      .actions .primary-button {
        flex: 1;
        min-width: 160px;
      }
    `,
  ],
})
export class AvatarNamePanelComponent {
  readonly portraitUrl = input.required<string>();
  readonly title = input('Ponle nombre a tu personaje');
  readonly subtitle = input('Este será el nombre que verás en el juego.');
  readonly fieldLabel = input('Nombre o alias');
  readonly placeholder = input('Ej: Luna Vega');
  readonly hint = input('Mínimo 2 caracteres.');
  readonly confirmLabel = input('Confirmar');
  readonly backLabel = input('Elegir otro personaje');
  readonly maxLength = input(32);

  readonly characterName = model('');

  readonly confirmed = output<string>();
  readonly back = output<void>();

  canConfirm(): boolean {
    return this.characterName().trim().length >= 2;
  }

  onConfirm(): void {
    if (!this.canConfirm()) return;
    this.confirmed.emit(this.characterName().trim());
  }
}

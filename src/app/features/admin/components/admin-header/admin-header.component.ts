import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { AuthService } from '../../../../services/auth.service';

import { GameLogoutButtonComponent } from '../../../../shared/ui/game-logout-button/game-logout-button.component';



@Component({

  selector: 'app-admin-header',

  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [GameLogoutButtonComponent],

  template: `

    <header class="admin-header" aria-label="Cabecera administrativa">

      <label class="admin-search">

        <span class="material-symbols-outlined" aria-hidden="true">search</span>

        <input type="search" placeholder="Search parameters..." aria-label="Buscar" />

      </label>



      <div class="admin-header-actions">

        <button class="admin-icon-btn" type="button" aria-label="Notificaciones">

          <span class="material-symbols-outlined" aria-hidden="true">notifications</span>

        </button>

        <button class="admin-icon-btn" type="button" aria-label="Configuracion">

          <span class="material-symbols-outlined" aria-hidden="true">settings</span>

        </button>

        <div class="admin-profile">

          <div class="admin-avatar" aria-hidden="true"></div>

          <div>

            <strong>{{ auth.currentUser()?.name ?? 'Administrador' }}</strong>

            <small>Chief Game Master</small>

          </div>

        </div>

        <app-game-logout-button label="Salir" [compact]="true" />

      </div>

    </header>

  `,

})

export class AdminHeaderComponent {

  protected readonly auth = inject(AuthService);

}



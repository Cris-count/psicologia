import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';

import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../../../services/auth.service';

import { GameLogoutButtonComponent } from '../../../../shared/ui/game-logout-button/game-logout-button.component';

import { AcademyDataService } from '../../../../services/academy-data.service';

import { AdminPlatformService } from '../../services/admin-platform.service';



@Component({

  selector: 'app-admin-sidebar',

  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [RouterLink, RouterLinkActive, GameLogoutButtonComponent],

  template: `

    <aside class="admin-sidebar" aria-label="Navegacion administrador">

      <div class="admin-brand">

        <h1>MIND-SPHERE</h1>

        <p>Command Center v4.0</p>

      </div>



      <nav class="admin-nav" aria-label="Secciones">

        <a routerLink="/admin/resumen" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">

          <span class="material-symbols-outlined" aria-hidden="true">hub</span>

          Neural Sync

        </a>

        <a routerLink="/admin/usuarios" routerLinkActive="active">

          <span class="material-symbols-outlined" aria-hidden="true">group</span>

          Usuarios y permisos

        </a>

        <a routerLink="/admin/licencias" routerLinkActive="active">

          <span class="material-symbols-outlined" aria-hidden="true">verified</span>

          Licencias

        </a>

        <a routerLink="/admin/reportes" routerLinkActive="active">

          <span class="material-symbols-outlined" aria-hidden="true">analytics</span>

          Reportes

        </a>

        <a routerLink="/admin/logs" routerLinkActive="active">

          <span class="material-symbols-outlined" aria-hidden="true">terminal</span>

          System Logs

        </a>

      </nav>



      <nav class="admin-nav" aria-label="Soporte">

        <a routerLink="/admin/ayuda" routerLinkActive="active">

          <span class="material-symbols-outlined" aria-hidden="true">help</span>

          Help Center

        </a>

      </nav>



      <div class="admin-sidebar-actions">

        <button

          class="admin-emergency"

          [class.is-active]="data.isEmergencyLockoutActive()"

          type="button"

          (click)="platform.triggerEmergencyLockout()"

        >

          {{ data.isEmergencyLockoutActive() ? 'DESBLOQUEAR SISTEMA' : 'EMERGENCY LOCKOUT' }}

        </button>

        <app-game-logout-button label="Cerrar sesión" [block]="true" />

      </div>

    </aside>

  `,

})

export class AdminSidebarComponent implements OnInit {

  protected readonly platform = inject(AdminPlatformService);

  protected readonly data = inject(AcademyDataService);

  private readonly auth = inject(AuthService);



  ngOnInit(): void {

    if (!this.auth.isAuthenticated()) {

      this.auth.ensureAuthenticatedOrRedirect();

    }

  }

}



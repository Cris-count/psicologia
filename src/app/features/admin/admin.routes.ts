import { Routes } from '@angular/router';
import { roleGuard } from '../../guards/role.guard';
import { AdminShellComponent } from './layout/admin-shell.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    canActivate: [roleGuard(['SUPERADMIN'])],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'resumen' },
      {
        path: 'resumen',
        loadComponent: () => import('./pages/admin-dashboard.page').then((m) => m.AdminDashboardPage),
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/admin-users.page').then((m) => m.AdminUsersPage),
      },
      {
        path: 'reportes',
        loadComponent: () => import('./pages/admin-reports.page').then((m) => m.AdminReportsPage),
      },
      { path: 'licencias', redirectTo: 'resumen', pathMatch: 'full' },
      { path: 'logs', redirectTo: 'resumen', pathMatch: 'full' },
      { path: 'ayuda', redirectTo: 'resumen', pathMatch: 'full' },
      // Catálogo académico (situaciones) pasa al módulo Profesor según REQ-02
      { path: 'situaciones', redirectTo: 'usuarios', pathMatch: 'full' },
      { path: 'escenarios', redirectTo: 'resumen', pathMatch: 'full' },
      { path: 'preguntas', redirectTo: 'resumen', pathMatch: 'full' },
    ],
  },
];

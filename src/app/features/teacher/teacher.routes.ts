import { Routes } from '@angular/router';
import { TeacherShellComponent } from './layout/teacher-shell.component';

export const TEACHER_ROUTES: Routes = [
  {
    path: '',
    component: TeacherShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'resumen' },
      {
        path: 'resumen',
        loadComponent: () => import('./pages/teacher-overview.page').then((m) => m.TeacherOverviewPage),
      },
      {
        path: 'casos',
        loadComponent: () => import('./pages/teacher-cases.page').then((m) => m.TeacherCasesPage),
      },
      {
        path: 'casos/nuevo',
        loadComponent: () => import('./pages/teacher-case-editor.page').then((m) => m.TeacherCaseEditorPage),
      },
      {
        path: 'casos/:id',
        loadComponent: () => import('./pages/teacher-case-editor.page').then((m) => m.TeacherCaseEditorPage),
      },
      {
        path: 'grupos',
        loadComponent: () => import('./pages/teacher-groups.page').then((m) => m.TeacherGroupsPage),
      },
      {
        path: 'estudiantes',
        loadComponent: () => import('./pages/teacher-students.page').then((m) => m.TeacherStudentsPage),
      },
      {
        path: 'tareas',
        loadComponent: () => import('./pages/teacher-tasks.page').then((m) => m.TeacherTasksPage),
      },
      {
        path: 'resultados',
        loadComponent: () => import('./pages/teacher-results.page').then((m) => m.TeacherResultsPage),
      },
    ],
  },
];

import { Routes } from '@angular/router';

import { roleGuard } from '../../guards/role.guard';

import { studentOnboardingGuard, studentProfileGuard } from './guards/student-profile.guard';



export const STUDENT_ROUTES: Routes = [

  {

    path: '',

    loadComponent: () => import('./layout/student-shell.component').then((m) => m.StudentShellComponent),

    canActivate: [roleGuard(['STUDENT'])],

    children: [

      {

        path: 'onboarding',

        loadComponent: () => import('./pages/student-onboarding.page').then((m) => m.StudentOnboardingPage),

        canActivate: [studentOnboardingGuard],

      },

      {

        path: '',

        loadComponent: () => import('./pages/student-home.page').then((m) => m.StudentHomePage),

        canActivate: [studentProfileGuard],

      },

    ],

  },

];


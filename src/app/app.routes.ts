import { Routes } from '@angular/router';
import { guestGuard } from './guards/guest.guard';
import { roleGuard } from './guards/role.guard';
import { LoginPage } from './pages/login.page';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage, canActivate: [guestGuard] },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  { path: 'superadmin', redirectTo: 'admin', pathMatch: 'full' },
  {
    path: 'teacher',
    loadChildren: () => import('./features/teacher/teacher.routes').then((m) => m.TEACHER_ROUTES),
    canActivate: [roleGuard(['TEACHER'])],
  },
  {
    path: 'student',
    loadChildren: () => import('./features/student/student.routes').then((m) => m.STUDENT_ROUTES),
  },
  { path: '**', redirectTo: 'login' },
];

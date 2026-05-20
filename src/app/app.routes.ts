import { Routes } from '@angular/router';
import { roleGuard } from './guards/role.guard';
import { LoginPage } from './pages/login.page';
import { StudentHomePage } from './pages/student-home.page';
import { TeacherDashboardPage } from './pages/teacher-dashboard.page';

export const routes: Routes = [
  { path: '', component: LoginPage },
  { path: 'login', component: LoginPage },
  { path: 'teacher', component: TeacherDashboardPage, canActivate: [roleGuard(['TEACHER'])] },
  { path: 'student', component: StudentHomePage, canActivate: [roleGuard(['STUDENT'])] },
  { path: '**', redirectTo: 'login' },
];

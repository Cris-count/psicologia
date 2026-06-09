import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TeacherProfileService } from '../../../shared/guide/services/teacher-profile.service';

/** Redirige a perfil si el docente aún no configuró su avatar. */
export const teacherProfileGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const profile = inject(TeacherProfileService);
  const router = inject(Router);

  if (!auth.currentUser() || auth.currentUser()?.role !== 'TEACHER') {
    return router.createUrlTree(['/login']);
  }
  if (profile.needsProfileSetup()) {
    return router.createUrlTree(['/teacher/perfil']);
  }
  return true;
};

/** Permite la página de perfil siempre; si ya configuró, puede editar. */
export const teacherCustomizeGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.currentUser() || auth.currentUser()?.role !== 'TEACHER') {
    return router.createUrlTree(['/login']);
  }
  return true;
};

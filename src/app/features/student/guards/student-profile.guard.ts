import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { StudentProfileService } from '../../../shared/guide/services/student-profile.service';

/** Redirige a onboarding si el estudiante no completó su perfil. */
export const studentProfileGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const profile = inject(StudentProfileService);
  const router = inject(Router);

  if (!auth.currentUser() || auth.currentUser()?.role !== 'STUDENT') {
    return router.createUrlTree(['/login']);
  }
  if (profile.needsOnboarding()) {
    return router.createUrlTree(['/student/onboarding']);
  }
  return true;
};

/** Solo permite onboarding si aún no está completado. */
export const studentOnboardingGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const profile = inject(StudentProfileService);
  const router = inject(Router);

  if (!auth.currentUser() || auth.currentUser()?.role !== 'STUDENT') {
    return router.createUrlTree(['/login']);
  }
  if (!profile.needsOnboarding()) {
    return router.createUrlTree(['/student']);
  }
  return true;
};

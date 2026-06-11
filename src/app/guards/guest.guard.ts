import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.ready;
  const user = auth.currentUser();

  if (user) {
    return router.createUrlTree([auth.homeRouteFor(user.role)]);
  }

  return true;
};

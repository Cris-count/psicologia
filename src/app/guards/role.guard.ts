import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../models/academy.models';
import { AuthService } from '../services/auth.service';

export const roleGuard = (roles: UserRole[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.currentUser();

    if (!user) {
      return router.createUrlTree(['/login']);
    }

    if (!roles.includes(user.role)) {
      return router.createUrlTree([auth.homeRouteFor(user.role)]);
    }

    return true;
  };
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  const user = auth.getUser();

  if (user && user.role === 'admin') {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
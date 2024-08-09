import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthenticationService);
    const router = inject(Router);
    if (!authService.isLoggedIn) {
        router.navigate(['/login']);
        return false;
    }
    if (!authService.isLoggedIn) {
        authService.signOut();
        router.navigateByUrl('/login');
        return false;
    }
    return true;
};


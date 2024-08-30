import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import { Router } from '@angular/router';
import { catchError, from, Observable, switchMap, throwError } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private authService: AuthenticationService,
        private router: Router
    ) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.authService.isLoggedIn) {
            req = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${this.authService.getToken()}`
                }
            });
            return next.handle(req);
        }
        if (this.authService.rememberMe) {
            return from(this.authService.refreshToken()).pipe(
                switchMap(() => {
                    console.log('Refreshing token');
                    const clonedRequest = req.clone({
                        setHeaders: {
                            Authorization: `Bearer ${this.authService.getToken()}`
                        }
                    });
                    return next.handle(clonedRequest);
                }),
                catchError(err => {
                    this.authService.signOut()?.subscribe();
                    return throwError(() => err);
                })
            );
        }

        if (!this.router.url.includes('login') && !this.router.url.includes('register')) {
            this.router.navigateByUrl('/login');
        }
        return next.handle(req);
    }
}
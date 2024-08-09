import { HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private authService: AuthenticationService,
        private router: Router
    ) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        console.log("In AuthInterceptor");
        if (this.authService.isLoggedIn) {
            req = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${this.authService.token}`
                }
            });
            return next.handle(req);
        }

        if (!this.router.url.includes('login')) {
            this.router.navigateByUrl('/login');
        }
        return next.handle(req);
    }
}
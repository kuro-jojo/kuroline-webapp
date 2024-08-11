import { Component } from '@angular/core';
import { AuthenticationService, Provider } from '../services/authentication.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { UserService } from '../services/user.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    loadingGoogle = false;

    constructor(
        private authService: AuthenticationService,
        private router: Router,
        private messageService: MessageService,
        private userService: UserService,
    ) {
        if (this.authService.isLoggedIn) {
            this.router.navigate(['']);
        }
    }

    ngOnInit() {
        if (this.authService.isLoggedIn) {
            this.router.navigate(['']);
        }
    }

    async signInWithGoogle() {
        this.loadingGoogle = true;
        await this.authService.signIn(Provider.Google).then(() => {
            this.userService.registerUserWithOauth().subscribe({
                next: (response) => {
                    console.log(response);
                    this.loadingGoogle = false;
                    this.router.navigateByUrl('');
                },
                error: (error) => {
                    this.loadingGoogle = false;

                    console.error(error);
                    this.authService.signOut();
                    this.messageService.add({ severity: 'error', summary: 'Failed to sign in', detail: error.message });
                }
            });
           
        }).catch((error) => {
            this.messageService.add({ severity: 'error', summary: 'Failed to sign in', detail: error.message });
            this.loadingGoogle = false;
            console.error("Sign in with Google failed", error);
        });
    }
}

import { Component } from '@angular/core';
import { AuthenticationService, Provider } from '../services/authentication.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

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
        private messageService: MessageService
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
            this.loadingGoogle = false;
            // this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Message Content' });
            // timer(5000).subscribe(() => {
            //     this.router.navigateByUrl( '');
            // });
            this.router.navigateByUrl('');
        }).catch((error) => {
            this.messageService.add({ severity: 'error', summary: 'Failed to sign in', detail: error.message });
            this.loadingGoogle = false;
            console.error("Sign in with Google failed", error);
        });
    }
}

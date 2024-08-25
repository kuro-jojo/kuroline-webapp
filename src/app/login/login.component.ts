import { Component } from '@angular/core';
import { AuthenticationService, Provider } from '../services/authentication.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { UserService } from '../services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { timer } from 'rxjs';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})

export class LoginComponent {

    loadingGoogle = false;
    loading = false; // for basic login
    loginForm: FormGroup;

    constructor(
        private authService: AuthenticationService,
        private router: Router,
        private messageService: MessageService,
        private userService: UserService,
        private formBuilder: FormBuilder,
    ) {
        this.loginForm = this.formBuilder.group({
            email: ['', Validators.required],
            password: ['', Validators.required],
            rememberMe: [false]
        });
    }

    get formControls() { return this.loginForm.controls; }

    ngOnInit() {
        if (this.authService.isLoggedIn) {
            this.router.navigate(['']);
        }
    }

    login() {

        if (this.loginForm.invalid) {
            return;
        }
        let email = this.formControls['email'].value;
        let password = this.formControls['password'].value;
        let rememberMe = this.formControls['rememberMe'].value;
        this.authService.remember = rememberMe;
        this.loading = true;

        this.authService.signInWithEmail(email, password).then(() => {
            this.loading = false;
            this.messageService.add({ severity: 'success', summary: 'Sign in successful', detail: 'You have been signed in successfully' });
            timer(1500).subscribe(() => {
                this.router.navigateByUrl('');
            });
            // this.router.navigateByUrl('');

        }).catch((error) => {
            this.loading = false;

            if (error.code === 'auth/invalid-credential') {
                this.messageService.add({ severity: 'error', summary: 'Failed to sign in', detail: 'Invalid credentials' });
            } else {
                this.messageService.add({ severity: 'error', summary: 'Failed to sign in', detail: error.message });
            }
            console.error("Sign in failed", error);
        });
    }

    async signInWithGoogle() {
        this.loadingGoogle = true;
        await this.authService.signInWithProvider(Provider.Google).then(() => {
            this.loadingGoogle = false;
            this.router.navigateByUrl('');
            this.userService.registerUserWithOauth().subscribe({
                next: (response) => {
                    console.log(response);
                    this.loadingGoogle = false;
                    this.messageService.add({ severity: 'success', summary: 'Sign in successful', detail: 'You have been signed in successfully' });
                    timer(1500).subscribe(() => {
                        this.router.navigateByUrl('');
                    });
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

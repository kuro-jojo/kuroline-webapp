import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, switchMap, timer } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuthenticationService, Provider } from '../../services/authentication.service';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

    loadingGoogle = false;
    loading = false; // for basic login
    loginForm: FormGroup;

    loginSubscriptions: Subscription[] = [];

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

    /**
     * Getter for form controls
     */
    get formControls() { return this.loginForm.controls; }

    /**
     * OnInit lifecycle hook
     */
    ngOnInit() {
        if (this.authService.isLoggedIn) {
            this.router.navigate(['']);
        }
    }

    /**
     * Handles user login
     */
    login() {
        if (this.loginForm.invalid) {
            return;
        }

        const { email, password, rememberMe } = this.loginForm.value;
        this.authService.rememberMe = rememberMe;
        this.loading = true;

        this.authService.signInWithEmail(email, password).subscribe({
            next: () => {
                this.loading = false;
                this.messageService.add({ severity: 'success', summary: 'Sign in successful', detail: 'You have been signed in successfully' });
                timer(1500).subscribe(() => this.router.navigateByUrl(''));
            },
            error: (error) => {
                this.loading = false;
                const errorMessage = error.code === 'auth/invalid-credential' ? 'Invalid credentials' : error.message;
                this.messageService.add({ severity: 'error', summary: 'Failed to sign in', detail: errorMessage });
                console.error("Sign in failed", error);
            }
        });
    }

    /**
     * Handles Google sign-in
     */
    signInWithGoogle() {
        this.loadingGoogle = true;
        this.authService.signInWithProvider(Provider.Google).pipe(
            switchMap(() => this.userService.registerUserWithOauth())
        ).subscribe({
            next: (response) => {
                console.log(response);
                this.loadingGoogle = false;
                this.messageService.add({ severity: 'success', summary: 'Sign in successful', detail: 'You have been signed in successfully' });
                timer(1500).subscribe(() => this.router.navigateByUrl(''));
            },
            error: (error) => {
                this.loadingGoogle = false;
                console.error("Sign in with Google failed", error);
                this.messageService.add({ severity: 'error', summary: 'Failed to sign in', detail: error.message });
            }
        });
    }

    /**
     * OnDestroy lifecycle hook
     */
    ngOnDestroy() {
        this.loginSubscriptions.forEach(sub => sub.unsubscribe());
    }
}

// this.authService.signInWithEmail(email, password).then(() => {
//     this.loading = false;
//     this.messageService.add({ severity: 'success', summary: 'Sign in successful', detail: 'You have been signed in successfully' });
//     timer(1500).subscribe(() => {
//         this.router.navigateByUrl('');
//     });
//     // this.router.navigateByUrl('');

// }).catch((error) => {
//     this.loading = false;

//     if (error.code === 'auth/invalid-credential') {
//         this.messageService.add({ severity: 'error', summary: 'Failed to sign in', detail: 'Invalid credentials' });
//     } else {
//         this.messageService.add({ severity: 'error', summary: 'Failed to sign in', detail: error.message });
//     }
//     console.error("Sign in failed", error);
// });
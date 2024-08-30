import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, switchMap, timer } from 'rxjs';
import { MessageService } from 'primeng/api';
import { SelectButtonChangeEvent } from 'primeng/selectbutton';
import { FileRemoveEvent, FileSelectEvent } from 'primeng/fileupload';
import { AuthenticationService, Provider } from '../../services/authentication.service';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrl: './signup.component.css'
})
export class SignupComponent implements OnInit, OnDestroy {

    loadingGoogle = false;
    loading = false; // for basic login
    registerForm: FormGroup;
    signupChoice: any[] = [{ label: 'Email', value: 'email' }, { label: 'Phone number', value: 'phoneNumber' }];
    showEmail: boolean = false;
    showPhoneNumber: boolean = false;
    submitted: boolean = false;
    firebaseEmailErrorCodes: any = {
        alreadyInUse: 'auth/email-already-in-use',
        invalidEmail: 'auth/invalid-email',
        operationNotAllowed: 'auth/operation',
        weakPassword: 'auth/weak-password',
    }

    registrationSubscriptions: Subscription[] = [];

    constructor(
        private authService: AuthenticationService,
        private router: Router,
        private messageService: MessageService,
        private userService: UserService,
        private formBuilder: FormBuilder,
    ) {
        this.registerForm = this.formBuilder.group({
            name: ['', Validators.required],
            password: ['',],
            email: ['',],
            phoneNumber: [''],
            signupChoice: ['', Validators.required],
            profilePicture: [null]
        });
    }

    ngOnInit() {
        if (this.authService.isLoggedIn) {
            this.router.navigate(['']);
        }
    }

    get formControls() { return this.registerForm.controls; }

    onSelectProfilePicture($event: FileSelectEvent) {
        this.formControls['profilePicture'].setValue($event.files[0]);
    }

    onClearProfilePicture($event: Event) {
        this.formControls['profilePicture'].setValue('');
    }

    onRemoveProfilePicture($event: FileRemoveEvent) {
        this.formControls['profilePicture'].setValue('');
    }

    /**
  * Performs the signup process.
  * Registers a user with email or phone number based on the user's choice.
  * @returns void
  */
    signup() {
        if (this.registerForm.invalid) {
            return;
        }
        const user = this.createUserObject();
        console.log("photo", user.profilePicture);
        this.loading = true;

        this.registrationSubscriptions.push(
            this.userService.registerUserWithEmailOrPhoneNumber(user).subscribe({
                next: (response) => this.onSignupSuccess(response),
                error: (error) => this.onSignupError(error)
            })
        )
    }

    /**
     * Creates a user object from the form controls.
     * @returns User object
     */
    private createUserObject(): any {
        return {
            name: this.formControls['name'].value,
            password: this.formControls['password'].value,
            email: this.formControls['email'].value,
            phoneNumber: this.formControls['phoneNumber'].value,
            profilePicture: this.formControls['profilePicture'].value
        };
    }

    /**
     * Handles successful signup.
     * @param response - The response from the signup API.
     */
    private onSignupSuccess(response: any): void {
        console.log(response);
        this.messageService.add({ severity: 'success', summary: 'Sign up successful', detail: 'You have successfully signed up' });
        timer(1500).subscribe(() => {
            this.router.navigateByUrl('/login');
        });
    }

    /**
     * Handles errors during signup.
     * @param error - The error object from the signup API.
     */
    private onSignupError(error: any): void {
        this.loading = false;
        console.error(error);
        this.messageService.add({ severity: 'error', summary: 'Failed to sign up', detail: error.error.message });
        this.authService.signOut()?.subscribe();
    }

    /**
     * Initiates sign-in with Google.
     */
    signInWithGoogle(): void {
        this.loadingGoogle = true;
        this.registrationSubscriptions.push(
            this.authService.signInWithProvider(Provider.Google)
                .pipe(
                    switchMap((result: any) => this.userService.registerUserWithOauth())
                )
                .subscribe({
                    next: (response) => this.onGoogleSignInSuccess(response),
                    error: (error) => this.onGoogleSignInError(error)
                })
        )
    }

    /**
     * Handles successful Google sign-in.
     * @param response - The response from the Google sign-in API.
     */
    private onGoogleSignInSuccess(response: any): void {
        console.log(response);
        this.loadingGoogle = false;
        this.messageService.add({ severity: 'success', summary: 'Sign in successful', detail: 'You have been signed in successfully' });
        timer(1500).subscribe(() => {
            this.router.navigateByUrl('');
        });
    }

    /**
     * Handles errors during Google sign-in.
     * @param error - The error object from the Google sign-in API.
     */
    private onGoogleSignInError(error: any): void {
        this.loadingGoogle = false;
        console.error("Sign in with Google failed", error);
        this.messageService.add({ severity: 'error', summary: 'Failed to sign in', detail: error.message });
        this.authService.signOut()?.subscribe();
    }

    /**
     * Handles changes in signup choice (email or phone number).
     * @param event - The event object from the select button change.
     */
    signupChoiceChange(event: SelectButtonChangeEvent): void {
        if (event.value === 'phoneNumber') {
            this.showEmail = false;
            this.showPhoneNumber = true;
            this.setValidators('phoneNumber', [Validators.pattern("^\\+[^\\s][0-9\\s]+$"), Validators.maxLength(18)]);
            this.clearValidators('email');
            this.clearValidators('password');
        } else if (event.value === 'email') {
            this.showEmail = true;
            this.showPhoneNumber = false;
            this.setValidators('email', [Validators.pattern("^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}$")]);
            this.setValidators('password');
            this.clearValidators('phoneNumber');
        } else {
            this.showEmail = false;
            this.showPhoneNumber = false;
            this.clearValidators('email');
            this.clearValidators('password');
            this.clearValidators('phoneNumber');
        }
    }

    /**
     * Sets validators for a form control.
     * @param controlName - The name of the form control.
     * @param validators - The array of validators to set.
     */
    setValidators(controlName: string, validators: any[] = []): void {
        this.formControls[controlName].setValidators([Validators.required, ...validators]);
        this.formControls[controlName].updateValueAndValidity();
    }

    /**
     * Clears validators for a form control.
     * @param controlName - The name of the form control.
     */
    clearValidators(controlName: string): void {
        this.formControls[controlName].clearValidators();
        this.formControls[controlName].updateValueAndValidity();
    }

    ngOnDestroy(): void {
        this.registrationSubscriptions.forEach(subscription => subscription.unsubscribe());
    }
}

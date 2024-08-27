import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { timer } from 'rxjs';
import { MessageService } from 'primeng/api';
import { SelectButtonChangeEvent } from 'primeng/selectbutton';
import { FileRemoveEvent, FileSelectEvent } from 'primeng/fileupload';
import { User } from '../../_interfaces/user';
import { AuthenticationService, Provider } from '../../services/authentication.service';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrl: './signup.component.css'
})
export class SignupComponent {

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
     * 
     * registers a user with email or phone number based on the user's choice.
     * 
     * @returns void
     */
    signup() {
        if (this.registerForm.invalid) {
            return;
        }
        let user: User = {
            name: this.formControls['name'].value,
            password: this.formControls['password'].value,
            email: this.formControls['email'].value,
            phoneNumber: this.formControls['phoneNumber'].value,
            profilePicture: this.formControls['profilePicture'].value
        }
        console.log("photo", user.profilePicture);
        this.loading = true;

        this.userService.registerUserWithEmailOrPhoneNumber(user).subscribe({
            next: (response) => {
                console.log(response);
                this.messageService.add({ severity: 'success', summary: 'Sign up successful', detail: 'You have successfully signed up' });
                timer(1500).subscribe(() => {
                    this.router.navigateByUrl('/login');
                });
            },
            error: (error) => {
                this.loading = false;
                console.error(error);
                this.messageService.add({ severity: 'error', summary: 'Failed to sign up', detail: error.error.message });
            }
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

    signupChoiceChange(event: SelectButtonChangeEvent) {

        if (event.value === 'phoneNumber') {
            this.showEmail = false;
            this.showPhoneNumber = true;
            this.setValidators('phoneNumber', [Validators.pattern("^\\+[^\\s][0-9\\s]+$"), Validators.maxLength(18)]);
            this.clearValidators('email');
            this.clearValidators('password');
        } else if (event.value === 'email') {
            this.showEmail = true;
            this.showPhoneNumber = false;
            this.setValidators('email', [Validators.pattern("^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$")]);
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

    setValidators(controlName: string, validators: any[] = []) {
        this.formControls[controlName].setValidators([Validators.required, ...validators]);
        this.formControls[controlName].updateValueAndValidity();
    }

    clearValidators(controlName: string) {
        this.formControls[controlName].removeValidators([Validators.required]);
        this.formControls[controlName].updateValueAndValidity();
    }
}

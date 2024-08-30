import { Injectable } from '@angular/core';
import { Auth, AuthProvider, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, User, UserCredential } from '@angular/fire/auth';
import { BehaviorSubject, catchError, from, map, Observable, switchMap } from 'rxjs';
import { UserService } from './user.service';
import { userStatuses } from '../_interfaces/user';

/**
 * Service responsible for handling authentication operations.
 * 
 */
@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    private firebaseAuthProvider !: AuthProvider;
    private idToken?: string | null;
    private rememberMe = false;
    private readonly tokenKey = 'api.token';
    private refreshToken$: Observable<string> | undefined;

    constructor(
        private auth: Auth,
        private userService: UserService,
    ) {
        this.refreshToken$ = this.refreshToken();
        this.idToken = this.getToken();
    }

    get isLoggedIn() {
        return this.getToken() !== null;
    }

    public getToken(): string | null {
        this.idToken = localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
        if (this.idToken === null || this.idToken === undefined) {
            return null;
        }

        // TODO : remove the negation
        if (isTokenExpired(this.idToken)) {
            if (this.rememberMe) {
                this.refreshToken$?.subscribe({
                    next: (token) => {
                        alert("Token refreshed");
                        this.setToken(token);
                    },
                    error: (error) => {
                        console.error("Error refreshing token", error);
                        this.signOut()?.subscribe();
                    }
                })
            } else {
                this.signOut()?.subscribe();
                return null;
            }
        }
        return this.idToken;
    }

    public set remember(value: boolean) {
        this.rememberMe = value;
    }

    public setToken(token: string) {
        if (this.rememberMe) {
            localStorage.setItem(this.tokenKey, token);
        } else {
            sessionStorage.setItem(this.tokenKey, token);
        }
    }

    signInWithProvider(provider: Provider): Observable<any> {
        if (provider === Provider.Google) {
            this.firebaseAuthProvider = new GoogleAuthProvider();
        } else if (provider === Provider.Microsoft) {
            // this.firebaseAuthProvider = new MicrosoftAuthPrzovider();
        } else {
            throw new Error("Unsupported provider");
        }

        return from(signInWithPopup(this.auth, this.firebaseAuthProvider)).pipe(
            switchMap((result: any) => {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                if (credential === null) {
                    console.error("Credential is null");
                    return [];
                }

                return this.refreshToken$?.pipe(
                    map((token) => {
                        alert("Token refreshed");
                        this.setToken(token);
                    }),
                    catchError((error) => {
                        console.error("Error refreshing token", error);
                        this.signOut()?.subscribe();
                        throw error;
                    })
                ) || [];
            }),
            catchError((error) => {
                console.error("Error signing in with provider", error);
                throw error;
            })
        );
    }

    signInWithEmail(email: string, password: string): Observable<any> {
        return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
            switchMap((result: UserCredential) => {
                return this.refreshToken$?.pipe(
                    map((token) => {
                        alert("Token refreshed");
                        this.setToken(token);
                    }),
                    catchError((error) => {
                        console.error("Error refreshing token", error);
                        this.signOut()?.subscribe();
                        throw error;
                    })
                ) || [];
            }),
            catchError((error) => {
                console.error("Error signing in with email", error);
                throw error;
            })
        );
    }


    // TODO: Implement registration on client side

    // async registerWithEmail(user: User): Promise<any> {
    //     try {
    //         const result = await createUserWithEmailAndPassword(this.auth, user.email!, user.password!);

    //         await this.refreshToken();
    //         return result;
    //     }
    //     catch (error: any) {
    //         console.error("Register failed", error);
    //         throw error;
    //     }
    // }

    // async registerWithPhoneNumber(user: User): Promise<any> {
    //         try {
    //             const appVerifier = new RecaptchaVerifier(this.auth, 'register-btn', {
    //                 'size': 'invisible',
    //                 'callback': (response) => {
    //                   // reCAPTCHA solved, allow signInWithPhoneNumber.
    //                   onSignInSubmit();
    //                 }
    //               });
    //             const result = await createUserWithEmailAndPassword(this.auth, user.phoneNumber!, user.password!);

    //             await this.refreshToken();
    //             return result;
    //         }
    //         catch (error: any) {
    //             console.error("Register failed", error);
    //             throw error;
    //         }
    //     }

    refreshToken(): Observable<string> {
        return new Observable<string>((observer) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    try {
                        const token = await user.getIdToken();
                        this.setToken(token);
                        observer.next(token);
                        observer.complete();
                    } catch (error) {
                        console.error("Error getting token", error);
                        observer.error(error);
                    }
                } else {
                    observer.complete();
                }
            });
        });
    }

    signOut(): Observable<any> | null {
        if (this.idToken != null) {
            // set the user status to offline
            return this.userService.updateUserStatus(userStatuses.offline)
                .pipe(
                    map(() => {
                        this.idToken = null;
                        localStorage.clear();
                        sessionStorage.clear();

                        this.auth.signOut();
                    })
                )
        }

        return null; // Add this line to return null if the condition is not met
    }

}

function isTokenExpired(token: string) {
    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    return (Math.floor((new Date).getTime() / 1000)) >= expiry;
}

export enum Provider {
    Google = "google",
    Microsoft = "microsoft"
}
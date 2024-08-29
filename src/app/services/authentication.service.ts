import { Injectable } from '@angular/core';
import { Auth, AuthProvider, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from '@angular/fire/auth';

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

    constructor(
        private auth: Auth,
    ) {
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

        if (isTokenExpired(this.idToken)) {
            if (this.rememberMe) {
                this.refreshToken().then((token) => {
                    console.log("Token refreshed", token);
                    alert("Token refreshed in get token");
                    return this.idToken;
                }).catch(() => {
                    this.signOut();
                    return null;
                });
            } else {
                this.signOut();
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

    async signInWithProvider(provider: Provider): Promise<any> {
        try {
            if (provider === Provider.Google) {
                this.firebaseAuthProvider = new GoogleAuthProvider();
            } else if (provider === Provider.Microsoft) {
                // this.firebaseAuthProvider = new MicrosoftAuthPrzovider();
            } else {
                throw new Error("Unsupported provider");
            }

            const result = await signInWithPopup(this.auth, this.firebaseAuthProvider);

            const credential = GoogleAuthProvider.credentialFromResult(result);
            if (credential === null) {
                console.error("Credential is null");
                return;
            }

            await this.refreshToken();
            return result;
        } catch (error: any) {
            console.error("Sign in failed", error);
            throw error;
        }
    }

    async signInWithEmail(email: string, password: string): Promise<any> {
        try {
            const result = await signInWithEmailAndPassword(this.auth, email, password);

            await this.refreshToken();
            return result;
        } catch (error: any) {
            console.error("Sign in failed", error);
            throw error;
        }
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

    async refreshToken(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    try {
                        const token = await user.getIdToken();
                        this.setToken(token);
                        // alert("Token refreshed");
                        resolve();
                    } catch (error) {
                        console.error("Error getting token", error);
                        reject(error);
                    }
                } else {
                    resolve();
                }
            });
        });
    }

    signOut() {
        if (this.idToken != null) {
            this.idToken = null;
            localStorage.clear();
            sessionStorage.clear();
        }
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
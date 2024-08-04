import { Injectable } from '@angular/core';
import { Auth, AuthProvider, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    private firebaseAuthProvider !: AuthProvider;

    constructor(
        private auth: Auth,
    ) { }

    get isLoggedIn() {
        // console.log(this.auth);
        return localStorage.getItem('session') !== undefined && localStorage.getItem('session') !== null;
    }

    async signIn(provider: Provider): Promise<any> {
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
            
            const token = credential.accessToken;
            if (token) {
                localStorage.setItem('session', token);
            }
            return result;
        } catch (error: any) {
            console.error("Sign in failed", error);
            const errorMessage = error.message;

            throw error;
        }
    }

    async signOut() {
    }
}

export enum Provider {
    Google = "google",
    Microsoft = "microsoft"
}
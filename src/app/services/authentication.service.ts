import { Injectable } from '@angular/core';
import { Auth, AuthProvider, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    private firebaseAuthProvider !: AuthProvider;
    private idToken: string | null ;
    private readonly tokenKey = 'api.token';

    constructor(
        private auth: Auth,
    ) {
        this.idToken = this.token
    }

    get isLoggedIn() {
        return this.token !== null && this.token !== undefined;
    }

    public get token(): string | null  {
        this.idToken = localStorage.getItem(this.tokenKey);
        if(this.idToken === null || this.idToken === undefined) {
            return null;
        }
        if(isTokenExpired(this.idToken)) {
            this.signOut();
            return null;
        }
        return this.idToken;
    }

    public set token(token: string) {
        localStorage.setItem(this.tokenKey, token);
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

            await this.refreshToken();
            return result;
        } catch (error: any) {
            console.error("Sign in failed", error);
            throw error;
        }
    }

    async refreshToken(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    try {
                        const token = await user.getIdToken();
                        this.token = token;
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
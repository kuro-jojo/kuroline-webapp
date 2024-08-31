import { Injectable } from '@angular/core';
import { Auth, AuthProvider, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from '@angular/fire/auth';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { UserService } from './user.service';
import { userStatuses } from '../_interfaces/user';
import { WebSocketService } from './web-socket.service';

/**
 * Service responsible for handling authentication operations.
 */
@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    private firebaseAuthProvider!: AuthProvider;
    private idToken?: string | null;
    private readonly tokenKey = 'api.token';
    private refreshToken$: Observable<string> | undefined;

    constructor(
        private auth: Auth,
        private userService: UserService,
        private websocketService: WebSocketService,
    ) {
        this.refreshToken$ = this.refreshToken();
        this.idToken = this.getToken();
    }

    /**
     * Checks if the user is logged in.
     */
    get isLoggedIn(): boolean {
        return this.getToken() !== null;
    }

    /**
     * Retrieves the stored token from localStorage or sessionStorage.
     */
    public getToken(): string | null {
        this.idToken = localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
        if (!this.idToken || isTokenExpired(this.idToken)) {
            this.handleExpiredToken();
            return null;
        }
        return this.idToken;
    }

    /**
     * Sets the rememberMe flag in localStorage.
     */
    public set rememberMe(value: boolean) {
        localStorage.setItem('rememberMe', value ? 'true' : 'false');
    }

    /**
     * Gets the rememberMe flag from localStorage.
     */
    public get rememberMe(): boolean {
        return localStorage.getItem('rememberMe') === 'true';
    }

    /**
     * Stores the token in localStorage or sessionStorage based on rememberMe flag.
     */
    public setToken(token: string): void {
        if (this.rememberMe) {
            localStorage.setItem(this.tokenKey, token);
        } else {
            sessionStorage.setItem(this.tokenKey, token);
        }
    }

    /**
     * Signs in using a specified provider.
     */
    signInWithProvider(provider: Provider): Observable<any> {
        this.firebaseAuthProvider = this.getAuthProvider(provider);

        return from(signInWithPopup(this.auth, this.firebaseAuthProvider)).pipe(
            switchMap(result => this.handleSignInResult(result)),
            catchError(error => this.handleError("Error signing in with provider", error))
        );
    }

    /**
     * Signs in using email and password.
     */
    signInWithEmail(email: string, password: string): Observable<any> {
        return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
            switchMap(result => this.handleSignInResult(result)),
            catchError(error => this.handleError("Error signing in with email", error))
        );
    }

    /**
     * Refreshes the authentication token.
     */
    refreshToken(): Observable<string> {
        return new Observable<string>((observer) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    try {
                        const token = await user.getIdToken(false);
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

    /**
     * Signs out the user and clears stored tokens.
     */
    signOut(inFailure:boolean = false): Observable<any> | null {
        if (this.idToken) {
            if(inFailure){
                this.clearTokens();
                this.websocketService.disconnect();
                this.auth.signOut();
                return null;
            }
            return this.userService.updateUserStatus(userStatuses.offline).pipe(
                map(() => {
                    this.clearTokens();
                    this.websocketService.disconnect();
                    this.auth.signOut();
                })
            );
        }
        return null;
    }

    /**
     * Clears tokens from localStorage and sessionStorage.
     */
    private clearTokens(): void {
        this.idToken = null;
        localStorage.clear();
        sessionStorage.clear();
    }

    /**
     * Handles the result of a sign-in operation.
     */
    private handleSignInResult(result: any, hasProvider: boolean = false): Observable<any> {
        if (hasProvider) {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            if (!credential) {
                console.error("Credential is null");
                return of()
            }
        }

        return this.refreshToken$?.pipe(
            map(token => this.setToken(token)),
            catchError(error => this.handleError("Error refreshing token", error))
        ) || of()
    }

    /**
     * Handles errors during authentication operations.
     */
    private handleError(message: string, error: any): Observable<never> {
        console.error(message, error);
        this.signOut()?.subscribe();
        throw error;
    }

    /**
     * Handles expired tokens by attempting to refresh or signing out.
     */
    private handleExpiredToken(): void {
        if (this.rememberMe) {
            this.refreshToken$?.subscribe({
                next: token => this.setToken(token),
                error: error => this.handleError("Error refreshing token", error)
            });
        } else {
            this.signOut()?.subscribe();
        }
    }

    /**
     * Returns the appropriate AuthProvider based on the specified provider.
     */
    private getAuthProvider(provider: Provider): AuthProvider {
        switch (provider) {
            case Provider.Google:
                return new GoogleAuthProvider();
            case Provider.Microsoft:
            // return new MicrosoftAuthProvider();
            default:
                throw new Error("Unsupported provider");
        }
    }
}

/**
 * Checks if the token is expired.
 */
function isTokenExpired(token: string): boolean {
    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    return (Math.floor((new Date).getTime() / 1000)) >= expiry;
}

export enum Provider {
    Google = "google",
    Microsoft = "microsoft"
}
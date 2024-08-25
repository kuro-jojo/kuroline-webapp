import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../_interfaces/user';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiBaseUrl = environment.apiBaseUrl;
    // https://chatgpt.com/share/bd3218e3-7c9e-4175-87ba-8dd66c5e4f28
    // Used to hold the latest user information
    private userInfoSubject: BehaviorSubject<User> = new BehaviorSubject<User>({});
    // Observable to be used by other components to get the latest user information
    public userInfo$: Observable<User> = this.userInfoSubject.asObservable();

    constructor(
        private http: HttpClient,
    ) { }

    setCurrentUser(user: User) {
        this.userInfoSubject.next(user);
    }

    getCurrentUser(): Observable<User> {
        return this.userInfo$;
    }

    getUserDetails(): Observable<User> {
        return this.http.get<User>(`${this.apiBaseUrl}/users/details`);
    }

    registerUser(user: User): Observable<User> {
        return this.http.post<User>(`${this.apiBaseUrl}/users`, user);
    }

    registerUserWithEmailOrPhoneNumber(user: User): Observable<User> {

        const formData = new FormData();
        if (user.profilePicture) {
            formData.append('picture', user.profilePicture);
        }
        user.profilePicture = "";
        formData.append('user', new Blob([JSON.stringify(user)], { type: 'application/json' }));
        return this.http.post<User>(`${this.apiBaseUrl}/users/register/basic`, formData);
    }

    registerUserWithOauth(): Observable<any> {
        return this.http.post<any>(`${this.apiBaseUrl}/users/oauth`, {});
    }

    updateUser(user: User): Observable<User> {
        return this.http.put<User>(`${this.apiBaseUrl}/users`, user);
    }

    updateUserProfilePicture(picture: File): Observable<User> {
        const formData = new FormData();
        formData.append('picture', picture);
        return this.http.put<User>(`${this.apiBaseUrl}/users/picture`, formData);
    }

    updateUserName(name: string): Observable<any> {
        return this.http.put<User>(`${this.apiBaseUrl}/users/name`, { name });
    }
}

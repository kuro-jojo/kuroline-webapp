import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../_interfaces/user';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private apiBaseUrl = environment.apiBaseUrl;
    constructor(
        private http: HttpClient,
    ) { }

    getUserDetails(): Observable<User> {
        return this.http.get<User>(`${this.apiBaseUrl}/users/details`);
    }

    registerUser(user: User): Observable<User> {
        return this.http.post<User>(`${this.apiBaseUrl}/users`, user);
    }

    registerUserWithOauth(): Observable<any> {
        return this.http.post<any>(`${this.apiBaseUrl}/users/oauth`, {});
    }
}

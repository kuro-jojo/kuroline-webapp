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

    getUserDetails(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiBaseUrl}/users`);
    }
}

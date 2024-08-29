import { Injectable } from '@angular/core';
import { Discussion } from '../_interfaces/discussion';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DiscussionService {
    private apiBaseUrl = environment.discussionsApiBaseUrl;
    private currentDiscussionSubject$ = new BehaviorSubject<Discussion | undefined>(undefined);
    private currentDiscussion$: Observable<Discussion | undefined> = this.currentDiscussionSubject$.asObservable();

    constructor(
        private http: HttpClient
    ) { }

    setCurrentDiscussion(discussion: Discussion) {
        this.currentDiscussionSubject$.next(discussion);
    }

    getCurrentDiscussion(): Observable<Discussion | undefined> {
        return this.currentDiscussion$;
    }

    getDiscussionByContact(contactId: string): Observable<Discussion> {
        return this.http.get<Discussion>(`${this.apiBaseUrl}/contacts/${contactId}`);
    }

    getDiscussionHistory() {
        // Retrieve the discussion between the current user and the receiver
    }

    startDiscussion(discussion: Discussion): Observable<Discussion> {
        return this.http.post<Discussion>(`${this.apiBaseUrl}`, discussion);
    }

    getDiscussionsByOwner(): Observable<Discussion[]> {
        return this.http.get<Discussion[]>(`${this.apiBaseUrl}/owner`);
    }

    getContactsFromDiscussions(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiBaseUrl}/owner/contacts`);
    }

}

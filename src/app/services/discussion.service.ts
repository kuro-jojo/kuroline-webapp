import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Discussion } from '../_interfaces/discussion';
import { Message } from '../_interfaces/message';

/**
 * Service to manage discussions.
 */
@Injectable({
    providedIn: 'root'
})
export class DiscussionService {
    private apiBaseUrl = environment.discussionsApiBaseUrl;
    private currentDiscussionSubject$ = new BehaviorSubject<Discussion | undefined>(undefined);
    private currentDiscussion$: Observable<Discussion | undefined> = this.currentDiscussionSubject$.asObservable();

    constructor(private http: HttpClient) { }

    /**
     * Sets the current discussion.
     * @param discussion The discussion to set as current.
     */
    setCurrentDiscussion(discussion: Discussion): void {
        this.currentDiscussionSubject$.next(discussion);
    }

    /**
     * Gets the current discussion as an observable.
     * @returns An observable of the current discussion.
     */
    getCurrentDiscussion(): Observable<Discussion | undefined> {
        return this.currentDiscussion$;
    }

    /**
     * Retrieves a discussion by contact ID.
     * @param contactId The ID of the contact.
     * @returns An observable of the discussion.
     */
    getDiscussionByContact(contactId: string): Observable<Discussion> {
        return this.http.get<Discussion>(`${this.apiBaseUrl}/contacts/${contactId}`);
    }

    /**
     * Starts a new discussion.
     * @param discussion The discussion to start.
     * @returns An observable of the created discussion.
     */
    startDiscussion(discussion: Discussion): Observable<Discussion> {
        return this.http.post<Discussion>(`${this.apiBaseUrl}`, discussion);
    }

    /**
     * Updates the status of a message in a discussion.
     * @param discussionId The ID of the discussion.
     * @param message The message to update.
     * @returns An observable of the updated message.
     */
    updateMessageStatus(discussionId: string, message: Message): Observable<Message> {
        return this.http.patch<Message>(`${this.apiBaseUrl}/${discussionId}/messages`, message);
    }

    /**
     * Retrieves the discussion history.
     * @todo Implement this method to retrieve the discussion history.
     */
    getDiscussionHistory(): void {
        // Retrieve the discussion between the current user and the receiver
    }
}
import { Component, OnDestroy, OnInit } from '@angular/core';
import { User, userStatuses } from '../../_interfaces/user';
import { DiscussionService } from '../../services/discussion.service';
import { UserService } from '../../services/user.service';
import { Discussion } from '../../_interfaces/discussion';
import { catchError, concatMap, from, map, Observable, of, Subscription, switchMap } from 'rxjs';

@Component({
    selector: 'app-contacts',
    templateUrl: './contacts.component.html',
    styleUrl: './contacts.component.css',
})
export class ContactsComponent implements OnInit, OnDestroy {
    contacts: User[] = [];
    currentUser!: User;
    subscriptions: Subscription[] = [];
    userStatuses = userStatuses;
    activeContact: string | undefined;

    constructor(
        private discussionService: DiscussionService,
        private userService: UserService,
    ) { }

    ngOnInit() {
        this.initializeCurrentUser();
    }


    /**
     * Initializes the current user by subscribing to the user service.
    */
    private initializeCurrentUser(): void {
        this.subscriptions.push(
            this.userService.getCurrentUser()
                .pipe(
                    map((user: User) => user),
                    switchMap((user: User) => {
                        this.currentUser = user;
                        return this.getListOfContacts(user)
                    })
                ).
                subscribe({
                    next: (user: User) => {
                        this.contacts.push(user);
                    },
                    error: (error) => {
                        console.error(error);
                    }
                })
        )
    }

    /**
     * Returns an observable that emits User objects based on contact IDs from discussions.
     * @returns {Observable<User>}
     */
    private getListOfContacts(user: User): Observable<User> {
        if (!user.contacts) return of();
        return from(user.contacts).pipe(
            concatMap((contactId: string) => this.userService.getUserDetails(contactId)),
            catchError(error => of(error)
            )
        )
    }

    /**
     * Loads the discussion for the given contact and sets it as the current discussion.
     * @param {User} contact - The contact for whom to load the discussion.
     */
    loadDiscussion(contact: User): void {
        this.subscriptions.push(
            this.discussionService.getDiscussionByContact(contact.id!).subscribe({
                next: (discussion: Discussion) => {
                    this.activeContact = contact.id;
                    this.discussionService.setCurrentDiscussion(discussion);
                },
                error: (error) => {
                    console.error(error);
                }
            })
        )
    }

    ngOnDestroy(): void {
        // Clean up subscriptions
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
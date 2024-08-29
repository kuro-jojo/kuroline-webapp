import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '../../_interfaces/user';
import { DiscussionService } from '../../services/discussion.service';
import { UserService } from '../../services/user.service';
import { Discussion } from '../../_interfaces/discussion';
import { catchError, concatMap, from, mergeMap, Observable, of, Subscription } from 'rxjs';

@Component({
    selector: 'app-contacts',
    templateUrl: './contacts.component.html',
    styleUrl: './contacts.component.css',
})
export class ContactsComponent implements OnInit, OnDestroy {
    contacts: User[] = [];
    currentUser!: User;
    contactsSubscription!: Subscription
    contactSubscription!: Subscription;

    constructor(
        private discussionService: DiscussionService,
        private userService: UserService,
    ) { }

    ngOnInit() {
        const observable = this.getListOfContactsObservable();
        this.contactsSubscription = this.subscribeToContactsObservable(observable);
    }

    /**
     * Subscribes to the contacts observable and updates the contacts array.
     */
    private subscribeToContactsObservable(observable: Observable<User>): Subscription {
        return observable.subscribe({
            next: (contact: User) => {
                this.contacts.push(contact);
            },
            error: (error) => {
                console.error(error);
            }
        });
    }

    /**
     * Returns an observable that emits User objects based on contact IDs from discussions.
     * @returns {Observable<User>}
     */
    private getListOfContactsObservable(): Observable<User> {
        return this.discussionService.getContactsFromDiscussions().pipe(
            mergeMap((contactIds: string[]) =>
                from(contactIds).pipe(
                    concatMap((contactId: string) => this.userService.getUserDetails(contactId)),
                    catchError(error => of(error))
                )
            )
        );
    }

    /**
     * Loads the discussion for the given contact and sets it as the current discussion.
     * @param {User} contact - The contact for whom to load the discussion.
     */
    loadDiscussion(contact: User): void {
        this.contactSubscription = this.discussionService.getDiscussionByContact(contact.id!).subscribe({
            next: (discussion: Discussion) => {
                this.discussionService.setCurrentDiscussion(discussion);
            },
            error: (error) => {
                console.error(error);
            }
        });
    }


    ngOnDestroy(): void {
        // Clean up subscriptions
        this.contactsSubscription?.unsubscribe();
        this.contactSubscription?.unsubscribe();
    }
}
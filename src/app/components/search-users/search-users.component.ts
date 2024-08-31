import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '../../_interfaces/user';
import { UserService } from '../../services/user.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Discussion } from '../../_interfaces/discussion';
import { DiscussionService } from '../../services/discussion.service';
import { map, Subscription, switchMap } from 'rxjs';

@Component({
    selector: 'app-contacts',
    templateUrl: './search-users.component.html',
    styleUrl: './search-users.component.css',
})
export class SearchUsersComponent implements OnInit, OnDestroy {
    contacts!: User[];
    searchQuery: string = '';
    isSearching: boolean = false;
    currentUser: User | undefined;

    subscriptions: Subscription[] = [];

    constructor(
        private userService: UserService,
        private confirmationService: ConfirmationService,
        private discussionService: DiscussionService,
        private messageService: MessageService,
    ) {
        this.userService.findByName(this.searchQuery).subscribe({
            next: (users: User[]) => {
                this.contacts = users;
                this.isSearching = false;
            },
            error: (error) => {
                this.isSearching = false;
                console.error(error);
            }
        });
    }

    ngOnInit() {
        this.userService.getCurrentUser().subscribe({
            next: (user: User) => {
                this.currentUser = user;
                // console.log("Get current user from search", user);
            },
            error: (error) => {
                console.error(error);
            }
        });
    }

    searchUsers() {
        if (!this.searchQuery) {
            this.contacts = [];
            return;
        }
        this.isSearching = true;
        this.subscriptions.push(
            this.userService.findByName(this.searchQuery).subscribe({
                next: (users: User[]) => {
                    this.contacts = users;
                    console.log(users);
                    this.isSearching = false;
                },
                error: (error) => {
                    this.isSearching = false;
                    console.error(error);
                }
            })
        )
    }

    addNewContact(event: Event, contact: User) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: `Do you want to start a new discussion with ${contact.name}?`,
            header: 'Add new contact',
            icon: 'pi pi-address-book',
            acceptIcon: "none",
            rejectIcon: "none",
            rejectButtonStyleClass: "p-button-text",
            accept: () => {
                // Create a new discussion with the selected user
                let discussion: Discussion = {
                    ownerId: this.currentUser?.id!,
                    contactId: contact.id!,
                }

                this.subscriptions.push(
                    this.discussionService.startDiscussion(discussion).pipe(
                        switchMap((discussion: Discussion) =>
                            this.userService.addContact(contact.id!).pipe(
                                map(() => discussion)
                            )
                        )
                    ).subscribe({
                        next: (discussion: Discussion) => {
                            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'New discussion started and contact added' });
                            this.discussionService.setCurrentDiscussion(discussion);
                            this.updateCurrentUser();
                        },
                        error: (error) => {
                            if (error && error.status === 409) {
                                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'A discussion already exists with this contact' });
                            }else{
                                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while starting a new discussion or adding contact' });
                            }
                            console.error(error);
                        }
                    })
                )
            }
        });
    }

    private updateCurrentUser(): void {
        this.subscriptions.push(
            this.userService.getCurrentUserDetails().subscribe({
                next: (user: User) => {
                    this.userService.setCurrentUser(user);
                    console.log("New user", user);
                },
                error: (error) => {
                    console.error(error);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while loading user details' });
                }
            })
        )
    }
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
}


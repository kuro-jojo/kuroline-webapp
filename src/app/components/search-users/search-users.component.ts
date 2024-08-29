import { Component } from '@angular/core';
import { User } from '../../_interfaces/user';
import { UserService } from '../../services/user.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Discussion } from '../../_interfaces/discussion';
import { AuthenticationService } from '../../services/authentication.service';
import { DiscussionService } from '../../services/discussion.service';

@Component({
    selector: 'app-contacts',
    templateUrl: './search-users.component.html',
    styleUrl: './search-users.component.css',
})
export class SearchUsersComponent {
    contacts!: User[];
    searchQuery: string = '';
    isSearching: boolean = false;
    currentUser: User | undefined;

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
        });
    }

    onEnterPressed() {
        this.searchUsers();
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
                this.discussionService.startDiscussion(discussion).subscribe({
                    next: (discussion: Discussion) => {
                        console.log(discussion);
                    },
                    error: (error) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while starting a new discussion' });
                        console.error(error);
                    }
                });
            }
        });
    }
}


import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { UserService } from '../../services/user.service';
import { ContactsComponent } from '../contacts/contacts.component';
import { ProfileComponent } from '../profile/profile.component';
import { User, userStatuses } from '../../_interfaces/user';
import { SearchUsersComponent } from '../search-users/search-users.component';
import { Subscription, switchMap } from 'rxjs';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
})
export class HomeComponent {
    panels = {
        contacts: "contacts",
        settings: "settings",
        profile: "profile",
        search: "search"
    }
    panel: string = this.panels.contacts

    subscriptions: Subscription[] = [];

    constructor(
        private userService: UserService,
        private messageService: MessageService,
    ) {
    }

    ngOnInit() {
        this.initializeCurrentUser();
    }


    /**
     * Initializes the current user by subscribing to the user service.
     */
    private initializeCurrentUser(): void {
        this.subscriptions.push(
            this.userService.updateUserStatus(userStatuses.online)
            .pipe(
                switchMap(() => this.userService.getCurrentUserDetails())
            )
            .subscribe({
                next: (user: User) => {
                    this.userService.setCurrentUser(user);
                },
                error: (error) => {
                    console.error(error);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while loading user details' });
                }
            })
        )
    }

    changePanel(panel: string) {
        this.panel = panel;
    }

    loadPanel() {
        switch (this.panel) {
            case this.panels.contacts:
                return ContactsComponent;
            case this.panels.profile:
                return ProfileComponent;
            case this.panels.search:
                return SearchUsersComponent;
            default:
                return ContactsComponent;
        }
    }
}

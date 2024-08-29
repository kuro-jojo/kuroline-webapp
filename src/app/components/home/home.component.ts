import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { UserService } from '../../services/user.service';
import { ContactsComponent } from '../contacts/contacts.component';
import { ProfileComponent } from '../profile/profile.component';
import { User } from '../../_interfaces/user';
import { SearchUsersComponent } from '../search-users/search-users.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
    panels = {
        contacts: "contacts",
        settings: "settings",
        profile: "profile",
        search: "search"
    }
    panel: string = this.panels.contacts

    constructor(
        private userService: UserService,
        private messageService: MessageService,
    ) {
        this.userService.getCurrentUserDetails().subscribe({
            next: (user: User) => {
                this.userService.setCurrentUser(user);
            },
            error: (error) => {
                console.error(error);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while loading user details' });
            }
        })
    }

    ngOnInit() {

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

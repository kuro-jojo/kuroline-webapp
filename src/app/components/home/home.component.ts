import { Component } from '@angular/core'; 
import { MessageService } from 'primeng/api';
import { UserService } from '../../services/user.service';
import { ContactsComponent } from '../contacts/contacts.component';
import { ProfileComponent } from '../profile/profile.component';
import { User } from '../../_interfaces/user';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent {
    panels = {
        contacts: "contacts",
        settings: "settings",
        profile: "profile",
    }
    panel: string = this.panels.profile
 
    constructor(
        private userService: UserService,
        private messageService: MessageService,
    ) {
        this.userService.getUserDetails().subscribe({
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
        console.log("Initializing home component");

    }

    changePanel(panel: string) {
        this.panel = panel;
        console.log("Panel changed to: " + panel);
    }

    loadPanel() {
        if (this.panel == this.panels.profile) {
            return ProfileComponent;
        }
        return ContactsComponent;
    }
}

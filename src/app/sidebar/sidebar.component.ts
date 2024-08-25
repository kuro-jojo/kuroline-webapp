import { Component, EventEmitter, Output } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { ReloadComponent } from '../utils';
import { Router } from '@angular/router';
import { User } from '../_interfaces/user';
import { UserService } from '../services/user.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
    @Output() panelEvent = new EventEmitter<string>();
    currentUser: User | undefined;

    panels = {
        contacts: "contacts",
        groups: "groups",
        profile: "profile",
        search: "search",
        settings: "settings",
    }

    currentPanel: string = this.panels.contacts

    constructor(
        private authService: AuthenticationService,
        private router: Router,
        private userService: UserService,
    ) {
    }

    ngOnInit() {
        this.userService.getCurrentUser().subscribe({
            next: (user: User) => {
                this.currentUser = user;
            },
            error: (error) => {
                console.error(error);
            }
        });
    }

    logout() {
        this.authService.signOut();
        ReloadComponent(false, this.router, "/login");
    }

    changePanel(panel: string) {
        this.currentPanel = panel;
        this.panelEvent.emit(panel);
    }
}

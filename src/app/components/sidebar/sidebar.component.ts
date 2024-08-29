import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../_interfaces/user';
import { AuthenticationService } from '../../services/authentication.service';
import { UserService } from '../../services/user.service';
import { ReloadComponent } from '../../utils';
import { Subscription } from 'rxjs';


@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
    @Output() panelEvent = new EventEmitter<string>();
    currentUser: User | undefined;
    currentUserSubscription!: Subscription;

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
        this.currentUserSubscription = this.userService.getCurrentUser().subscribe({
            next: (user: User) => {
                this.currentUser = user;
                // console.log("Get current user from sidebar", user);
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

    ngOnDestroy() {
        this.currentUserSubscription.unsubscribe();
    }
}

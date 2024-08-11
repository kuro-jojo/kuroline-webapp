import { Component } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { ReloadComponent } from '../utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

    constructor(
        private authService: AuthenticationService,
        private router: Router
    ) {
    }
    logout(){
        this.authService.signOut();
        ReloadComponent(false, this.router, "/login");
    }
}

import { Component } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { UserService } from '../services/user.service';
import { User } from '../_interfaces/user';

@Component({
  selector: 'app-discussion',
  templateUrl: './discussion.component.html',
  styleUrl: './discussion.component.css'
})
export class DiscussionComponent {

    constructor (
        private userService: UserService,
    ){}

    ngOnInit() {
       
        this.userService.getUserDetails().subscribe({
            next: (response : User[]) => {
                console.log(response[0].id);
            },
            error: (error) => {
                console.error(error);
            }
        })
    }
}

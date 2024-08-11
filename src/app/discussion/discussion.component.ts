import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../_interfaces/user';

@Component({
  selector: 'app-discussion',
  templateUrl: './discussion.component.html',
  styleUrl: './discussion.component.css'
})
export class DiscussionComponent {
    currentUser : User | undefined;

    constructor (
        private userService: UserService,
    ){}

    ngOnInit() {
       
        this.userService.getUserDetails().subscribe({
            next: (response : User) => {
                console.log(response);
                this.currentUser = response;
            },
            error: (error) => {
                console.error(error);
            }
        })
    }
}

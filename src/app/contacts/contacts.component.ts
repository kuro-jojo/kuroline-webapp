import { Component } from '@angular/core';
import { User } from '../_interfaces/user';

@Component({
    selector: 'app-contacts',
    templateUrl: './contacts.component.html',
    styleUrl: './contacts.component.css',
})
export class ContactsComponent {
    contacts!: User[];

    constructor() {
        let im = 'https://static.vecteezy.com/system/resources/previews/005/005/788/non_2x/user-icon-in-trendy-flat-style-isolated-on-grey-background-user-symbol-for-your-web-site-design-logo-app-ui-illustration-eps10-free-vector.jpg';
        this.contacts = [
            {
                uid: '1',
                name: 'John Doe',
                phoneNumber: '1234567890',
                status: 'online',
                profilePhoto: im,
            },
            {
                uid: '2',
                name: 'Jane Doe',
                phoneNumber: '1234567890',
                status: 'offline',
                profilePhoto: im,
            },
            {
                uid: '3',
                name: 'John Smith',
                phoneNumber: '1234567890',
                status: 'busy',
                profilePhoto: im,
            },
            {
                uid: '3',
                name: 'John Smith',
                phoneNumber: '1234567890',
                status: 'busy',
                profilePhoto: im,
            },
            {
                uid: '3',
                name: 'John Smith',
                phoneNumber: '1234567890',
                status: 'busy',
                profilePhoto: im,
            },
            {
                uid: '3',
                name: 'John Smith',
                phoneNumber: '1234567890',
                status: 'busy',
                profilePhoto: im,
            },
            {
                uid: '3',
                name: 'John Smith',
                phoneNumber: '1234567890',
                status: 'busy',
                profilePhoto: im,
            },
            {
                uid: '3',
                name: 'John Smith',
                phoneNumber: '1234567890',
                status: 'busy',
                profilePhoto: im,
            },
            {
                uid: '3',
                name: 'John Smith',
                phoneNumber: '1234567890',
                status: 'busy',
                profilePhoto: im,
            },
        ];
    }
}


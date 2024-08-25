import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { UserService } from '../services/user.service';
import { User } from '../_interfaces/user';
import { timer } from 'rxjs';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css'
})
export class ProfileComponent {
    currentUser: User | undefined;
    items: MenuItem[] | undefined;
    tempProfile: string = '';
    editLoading: boolean = false;
    isEditingName = false;
    isEditingProfile = false;
    isSavingProfile: any;

    @ViewChild('fileUploader') fileUpload: ElementRef | undefined;

    constructor(
        private userService: UserService,
        private messageService: MessageService,
    ) {
    }

    ngOnInit() {
        this.items = [
            {
                label: 'Options',
                items: [
                    {
                        label: 'Refresh',
                        icon: 'pi pi-refresh'
                    },
                    {
                        label: 'Export',
                        icon: 'pi pi-upload'
                    }
                ]
            }
        ];
        this.userService.getCurrentUser().subscribe({
            next: (user: User) => {
                this.currentUser = user;
            },
            error: (error) => {
                console.error(error);
            }
        });
    }

    editName() {
        if (this.isEditingName) {
            this.editLoading = true;
            timer(1000).subscribe(() => {
                console.log('Saving name');
                this.userService.updateUserName(this.currentUser!.name!).subscribe({
                    next: () => {
                        this.editLoading = false;
                        this.isEditingName = false;
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Name updated successfully' });
                    },
                    error: (error) => {
                        console.error(error);
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update name' });
                    }
                });
            })
        } else {
            this.isEditingName = true;
        }
    }

    editProfile() {
        let files = this.fileUpload!.nativeElement.files;
        console.log('temp', this.tempProfile);

        if (files && files.length > 0) {
            var reader = new FileReader();

            reader.readAsDataURL(files[0]); // read file as data url

            reader.onload = (event) => { // called once readAsDataURL is completed
                if (event.target) {
                    this.tempProfile = event.target.result as string;
                    // console.log('Profile picture updated', this.tempProfile);
                    this.isEditingProfile = true;

                }
            }

        }
        else {
            console.log("No file selected");
            this.fileUpload!.nativeElement.click();
        }
    }

    cancelProfileEdit() {
        this.tempProfile = '';
        this.isSavingProfile = false;
        this.isEditingProfile = false;
        this.fileUpload!.nativeElement.value = '';
    }

    saveProfile() {
        this.isSavingProfile = true;
        if (!this.tempProfile) {
            this.isSavingProfile = false;
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No profile picture selected' });
            return;
        }

        timer(1000).subscribe(() => {
            console.log('Saving profile');
            this.userService.updateUserProfilePicture(this.fileUpload!.nativeElement.files[0]).subscribe({
                next: () => {
                    this.currentUser!.profilePicture = this.tempProfile;
                    this.cancelProfileEdit();
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Profile picture updated successfully' });
                },
                error: (error) => {
                    console.error(error);
                    this.cancelProfileEdit();
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update profile picture' });
                }
            });
        });
    }
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DataViewModule } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { PasswordModule } from 'primeng/password';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FileUploadModule } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { HomeComponent } from './components/home/home.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ContactsComponent } from './components/contacts/contacts.component';
import { environment } from '../environments/environment';
import { DiscussionComponent } from './components/discussion/discussion.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SignupComponent } from './components/signup/signup.component';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routes';
import { AuthInterceptor } from './auth.interceptor';
import { SearchUsersComponent } from './components/search-users/search-users.component';
import { IsAnotherDay } from './pipes/is-another-day.pipe';
import { GetDatePipe } from './pipes/get-date.pipe';

import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        SidebarComponent,
        ContactsComponent,
        DiscussionComponent,
        LoginComponent,
        SignupComponent,
        ProfileComponent,
        SearchUsersComponent,
        IsAnotherDay,
        GetDatePipe
    ],
    imports: [
        CommonModule,
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        BadgeModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        ScrollPanelModule,
        DataViewModule,
        TagModule,
        ToastModule,
        RippleModule,
        PasswordModule,
        InputSwitchModule,
        SelectButtonModule,
        FileUploadModule,
        ImageModule,
        ConfirmDialogModule,
        PickerComponent,
    ],
    bootstrap: [AppComponent],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
        provideAuth(() => getAuth()),
        MessageService,
        ConfirmationService
    ]
})
export class AppModule { }

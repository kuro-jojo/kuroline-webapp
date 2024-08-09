import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ContactsComponent } from './contacts/contacts.component';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routes';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DataViewModule } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';

import { DiscussionComponent } from './discussion/discussion.component';
import { LoginComponent } from './login/login.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { MessageService } from 'primeng/api';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        SidebarComponent,
        ContactsComponent,
        DiscussionComponent,
        LoginComponent,
    ],
    imports: [
        CommonModule,
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        FormsModule,
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
    ]
    ,

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
    ]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ContactsComponent } from './contacts/contacts.component';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
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

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        SidebarComponent,
        ContactsComponent,
    ],
    imports: [
        CommonModule,
        BrowserModule,
        AppRoutingModule,
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
    ]
    ,
    bootstrap: [AppComponent]
})
export class AppModule { }

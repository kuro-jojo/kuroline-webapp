import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NgModule } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { authGuard } from './auth.guard';
import { SignupComponent } from './signup/signup.component';

export const routes: Routes = [
    {
        path: '',
        title: 'Kuroline - Discussion',
        component: HomeComponent,
        canActivate: [authGuard]
    },
    {
        path: 'login',
        title: 'Login',
        component: LoginComponent,
    },
    {
        path:"register",
        title:"Sign Up",
        component: SignupComponent,
    }
];
@NgModule({
    imports: [RouterModule.forRoot(routes, {})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
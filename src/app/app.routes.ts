import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';


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
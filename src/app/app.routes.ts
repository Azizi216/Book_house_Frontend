import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { Home } from './home/home';
import { Discover } from './discover/discover';
import { AdminBooks } from './admin-books/admin-books';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'sign-up', component: Signup },
    { path: 'home', component: Home },
    { path: 'discover', component: Discover },
    {path:'admin-books', component:AdminBooks},
    { path: '', redirectTo: '/home', pathMatch: 'full' }
];
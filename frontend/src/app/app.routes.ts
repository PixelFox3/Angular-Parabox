import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./shared/components/home.component').then((m) => m.HomeComponent),
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/components/login.component').then((m) => m.LoginComponent),
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/components/register.component').then((m) => m.RegisterComponent),
    },
    {
        path: 'cliente',
        canActivate: [authGuard],
        loadComponent: () => import('./features/client/components/client-area.component').then((m) => m.ClientAreaComponent),
    },
    {
        path: 'cart',
        loadComponent: () => import('./features/cart/components/cart.component').then((m) => m.CartComponent),
    },
    {
        path: '**',
        redirectTo: '',
    },
];

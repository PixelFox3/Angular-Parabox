import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./shared/components/home.component').then((m) => m.HomeComponent),
    },
    {
        path: 'cliente',
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

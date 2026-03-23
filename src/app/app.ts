import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartSidebarComponent } from './features/cart/components/cart-sidebar.component';
import { QuickCartFabComponent } from './features/cart/components/quick-cart-fab.component';
import { NavbarComponent } from './shared/components/navbar.component';
import { ToastComponent } from './shared/components/toast.component';

@Component({
  selector: 'app-root',
  imports: [CartSidebarComponent, NavbarComponent, QuickCartFabComponent, RouterOutlet, ToastComponent],
  template: `
    <app-navbar />
    <app-cart-sidebar />
    <app-quick-cart-fab />
    <app-toast />
    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
      background-color: var(--background-color);
      color: var(--text-color);
      transition: background-color 0.3s ease, color 0.3s ease;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App { }

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-quick-cart-fab',
  templateUrl: './quick-cart-fab.component.html',
  styleUrl: './quick-cart-fab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickCartFabComponent {
  readonly cartService = inject(CartService);

  toggle(): void {
    this.cartService.toggleDrawer();
  }
}

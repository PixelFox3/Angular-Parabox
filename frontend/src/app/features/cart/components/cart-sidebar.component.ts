import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CartService } from '../services/cart.service';
import { StoreConfigService } from '../../../shared/services/store-config.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-cart-sidebar',
  imports: [DecimalPipe, NgOptimizedImage, RouterLink],
  templateUrl: './cart-sidebar.component.html',
  styleUrl: './cart-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartSidebarComponent {
  readonly cartService = inject(CartService);
  private readonly storeConfig = inject(StoreConfigService);
  private readonly toastService = inject(ToastService);

  get currencySymbol(): string {
    return this.storeConfig.currencySymbol;
  }

  get taxRate(): number {
    return this.storeConfig.taxRate;
  }

  get taxLabel(): string {
    return this.storeConfig.taxLabel;
  }

  get showPricesWithTax() {
    return this.storeConfig.showPricesWithTax;
  }

  close(): void {
    this.cartService.closeDrawer();
  }

  increment(productId: string): void {
    this.cartService.incrementQuantity(productId);
  }

  decrement(productId: string): void {
    this.cartService.decrementQuantity(productId);
  }

  remove(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  checkout(): void {
    this.toastService.show('Funcionalidad de pago en desarrollo', 'info');
  }
}

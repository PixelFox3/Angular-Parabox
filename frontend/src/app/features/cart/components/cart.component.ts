import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CartService } from '../services/cart.service';
import { StoreConfigService } from '../../../shared/services/store-config.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-cart',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent {
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

  incrementQuantity(productId: number): void {
    this.cartService.incrementQuantity(productId);
  }

  decrementQuantity(productId: number): void {
    this.cartService.decrementQuantity(productId);
  }

  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  async clearCart(): Promise<void> {
    const confirmed = await this.toastService.confirm(
      '¿Estás seguro de que deseas vaciar el carrito?',
      'Vaciar',
      'Cancelar',
    );
    if (confirmed) {
      this.cartService.clearCart();
      this.toastService.show('Carrito vaciado', 'success');
    }
  }

  checkout(): void {
    this.toastService.show('Funcionalidad de pago en desarrollo', 'info');
  }
}

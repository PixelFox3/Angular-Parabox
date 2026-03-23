import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';

import { CartService } from '../../cart/services/cart.service';
import { Product } from '../services/product.service';
import { StoreConfigService } from '../../../shared/services/store-config.service';

@Component({
  selector: 'app-product',
  imports: [DecimalPipe, NgOptimizedImage],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductComponent {
  readonly product = input.required<Product>();
  private readonly cartService = inject(CartService);
  private readonly storeConfig = inject(StoreConfigService);

  readonly showPricesWithTax = computed(() => this.storeConfig.showPricesWithTax());
  readonly taxLabel = computed(() => this.storeConfig.taxLabel);
  readonly basePriceVisible = computed(
    () => this.storeConfig.showPricesWithTax() && this.storeConfig.showBasePriceWhenTaxShown()
  );
  readonly currencySymbol = computed(() => this.storeConfig.currencySymbol);
  readonly displayPrice = computed(() => {
    const price = this.product().price;
    return this.storeConfig.showPricesWithTax()
      ? price * (1 + this.storeConfig.taxRate)
      : price;
  });

  addToCart(): void {
    this.cartService.addToCart(this.product(), 1);
  }
}

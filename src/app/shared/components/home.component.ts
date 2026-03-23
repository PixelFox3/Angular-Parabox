import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ProductComponent } from '../../features/products/components/product.component';
import { ProductService } from '../../features/products/services/product.service';

@Component({
  selector: 'app-home',
  imports: [ProductComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly productService = inject(ProductService);
  protected readonly products = computed(() => this.productService.getProducts());
}

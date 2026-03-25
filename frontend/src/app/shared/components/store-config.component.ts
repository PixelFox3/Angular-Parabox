import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { StoreConfigService, type CountryCode } from '../services/store-config.service';

@Component({
  selector: 'app-store-config',
  imports: [DecimalPipe, FormsModule],
  templateUrl: './store-config.component.html',
  styleUrl: './store-config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreConfigComponent {
  readonly storeConfig = inject(StoreConfigService);
  readonly selectedCountry = signal<CountryCode>(this.storeConfig.country() as CountryCode);
  readonly availableCountries = this.storeConfig.getAvailableCountries();

  get currentConfig() {
    return this.storeConfig.currentConfig;
  }

  onCountryChange(value: CountryCode): void {
    this.selectedCountry.set(value);
    this.storeConfig.setCountry(value);
  }

  onShowPricesWithTaxChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.storeConfig.setShowPricesWithTax(checkbox.checked);
  }

  onShowBasePriceWhenTaxShownChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.storeConfig.setShowBasePriceWhenTaxShown(checkbox.checked);
  }
}

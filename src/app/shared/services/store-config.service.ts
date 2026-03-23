import { Injectable, signal } from '@angular/core';

export type CountryCode = 'ES' | 'US' | 'FR' | 'DE' | 'IT' | 'GB';

export interface CountryConfig {
    code: CountryCode;
    name: string;
    currency: string;
    currencySymbol: string;
    taxRate: number;
    taxLabel: string;
    showPricesWithTax: boolean;
}

const COUNTRY_CONFIGS: Record<CountryCode, CountryConfig> = {
    ES: {
        code: 'ES',
        name: 'España',
        currency: 'EUR',
        currencySymbol: '€',
        taxRate: 0.21,
        taxLabel: 'IVA',
        showPricesWithTax: true,
    },
    FR: {
        code: 'FR',
        name: 'Francia',
        currency: 'EUR',
        currencySymbol: '€',
        taxRate: 0.20,
        taxLabel: 'TVA',
        showPricesWithTax: true,
    },
    DE: {
        code: 'DE',
        name: 'Alemania',
        currency: 'EUR',
        currencySymbol: '€',
        taxRate: 0.19,
        taxLabel: 'MwSt.',
        showPricesWithTax: true,
    },
    IT: {
        code: 'IT',
        name: 'Italia',
        currency: 'EUR',
        currencySymbol: '€',
        taxRate: 0.22,
        taxLabel: 'IVA',
        showPricesWithTax: true,
    },
    GB: {
        code: 'GB',
        name: 'Reino Unido',
        currency: 'GBP',
        currencySymbol: '£',
        taxRate: 0.20,
        taxLabel: 'VAT',
        showPricesWithTax: true,
    },
    US: {
        code: 'US',
        name: 'Estados Unidos',
        currency: 'USD',
        currencySymbol: '$',
        taxRate: 0.08,
        taxLabel: 'Tax',
        showPricesWithTax: false,
    },
};

@Injectable({
    providedIn: 'root',
})
export class StoreConfigService {
    private countrySignal = signal<CountryCode>('ES');
    private showPricesWithTaxSignal = signal(true);
    private showBasePriceWhenTaxShownSignal = signal(false);

    // Expose as readonly signals
    country = this.countrySignal.asReadonly();
    showPricesWithTax = this.showPricesWithTaxSignal.asReadonly();
    showBasePriceWhenTaxShown = this.showBasePriceWhenTaxShownSignal.asReadonly();

    get currentConfig(): CountryConfig {
        return COUNTRY_CONFIGS[this.countrySignal()];
    }

    get currencySymbol(): string {
        return this.currentConfig.currencySymbol;
    }

    get taxRate(): number {
        return this.currentConfig.taxRate;
    }

    get taxLabel(): string {
        return this.currentConfig.taxLabel;
    }

    get currency(): string {
        return this.currentConfig.currency;
    }

    setCountry(countryCode: CountryCode): void {
        this.countrySignal.set(countryCode);
        // Actualizar showPricesWithTax según el país
        this.showPricesWithTaxSignal.set(COUNTRY_CONFIGS[countryCode].showPricesWithTax);
    }

    setShowPricesWithTax(show: boolean): void {
        this.showPricesWithTaxSignal.set(show);
        if (!show) {
            this.showBasePriceWhenTaxShownSignal.set(false);
        }
    }

    setShowBasePriceWhenTaxShown(show: boolean): void {
        this.showBasePriceWhenTaxShownSignal.set(show);
    }

    getAvailableCountries(): CountryConfig[] {
        return Object.values(COUNTRY_CONFIGS);
    }
}

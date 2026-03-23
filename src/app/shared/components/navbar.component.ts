import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartService } from '../../features/cart/services/cart.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  readonly cartService = inject(CartService);
  readonly themeService = inject(ThemeService);

  readonly isDark = computed(() => this.themeService.currentTheme$() === 'dark');

  readonly logoPath = computed(() => this.isDark() ? '/Brand/Dark.png' : '/Brand/light.png');

  toggleTheme(): void {
    this.themeService.setTheme(this.isDark() ? 'light' : 'dark');
  }
}

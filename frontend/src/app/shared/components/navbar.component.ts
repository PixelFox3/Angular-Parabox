import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartService } from '../../features/cart/services/cart.service';
import { ThemeService } from '../services/theme.service';
import { AuthService } from '../../core/services/auth.service';

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
  private readonly authService = inject(AuthService);

  readonly isDark = computed(() => this.themeService.currentTheme$() === 'dark');
  readonly logoPath = computed(() => this.isDark() ? '/Brand/Dark.png' : '/Brand/light.png');
  readonly currentUser = this.authService.currentUser;

  readonly initials = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    if (user.name) {
      return user.name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();
    }
    return user.email[0].toUpperCase();
  });

  readonly displayName = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return user.name ?? user.email.split('@')[0];
  });

  toggleTheme(): void {
    this.themeService.setTheme(this.isDark() ? 'light' : 'dark');
  }
}

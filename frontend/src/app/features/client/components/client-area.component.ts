import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ClientComponent } from './client.component';
import { StoreConfigComponent } from '../../../shared/components/store-config.component';
import { ThemeService, ThemeType } from '../../../shared/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';

const NOTIFICATIONS_KEY = 'parabox_notifications';

@Component({
  selector: 'app-client-area',
  imports: [ClientComponent, ReactiveFormsModule, StoreConfigComponent],
  templateUrl: './client-area.component.html',
  styleUrl: './client-area.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientAreaComponent {
  readonly themeService = inject(ThemeService);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  private readonly savedMessage = signal(false);
  readonly isSaving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly currentUser = this.authService.currentUser;
  readonly savedMessageVisible = computed(() => this.savedMessage());

  readonly settingsForm = this.fb.nonNullable.group({
    name: ['', [Validators.maxLength(60)]],
    notificationsEnabled: [this.readNotifications()],
    theme: [this.themeService.currentTheme$() as ThemeType],
  });

  constructor() {
    const user = this.currentUser();
    if (user) {
      this.settingsForm.patchValue({ name: user.name ?? '' });
    }
  }

  save(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    const { name, theme, notificationsEnabled } = this.settingsForm.getRawValue();
    this.themeService.setTheme(theme);

    try {
      localStorage.setItem(NOTIFICATIONS_KEY, String(notificationsEnabled));
    } catch { /* ignore */ }

    this.isSaving.set(true);
    this.saveError.set(null);

    this.authService.updateProfile(name || null).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.savedMessage.set(true);
        window.setTimeout(() => this.savedMessage.set(false), 1800);
      },
      error: () => {
        this.isSaving.set(false);
        this.saveError.set('Error al guardar los cambios. Intenta de nuevo.');
      },
    });
  }

  private readNotifications(): boolean {
    try {
      return localStorage.getItem(NOTIFICATIONS_KEY) !== 'false';
    } catch {
      return true;
    }
  }
}

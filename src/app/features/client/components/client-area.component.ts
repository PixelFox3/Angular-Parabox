import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ClientComponent } from './client.component';
import { StoreConfigComponent } from '../../../shared/components/store-config.component';
import { ThemeService, ThemeType } from '../../../shared/services/theme.service';

interface ClientSettings {
  name: string;
  email: string;
  notificationsEnabled: boolean;
  theme: ThemeType;
}

const CLIENT_SETTINGS_KEY = 'client-settings';

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
  private readonly savedMessage = signal(false);

  readonly settingsForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
    email: ['', [Validators.required, Validators.email]],
    notificationsEnabled: [true],
    theme: [this.themeService.currentTheme$() as ThemeType],
  });

  readonly profileName = computed(() => this.settingsForm.controls.name.value || 'Cliente');
  readonly profileEmail = computed(() => this.settingsForm.controls.email.value || 'sin-correo@demo.com');
  readonly notificationsEnabled = computed(() => this.settingsForm.controls.notificationsEnabled.value);
  readonly savedMessageVisible = computed(() => this.savedMessage());

  constructor() {
    const saved = this.readSettings();
    if (saved) {
      this.settingsForm.patchValue(saved);
      this.themeService.setTheme(saved.theme);
    }
  }

  save(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    const value = this.settingsForm.getRawValue();
    const settings: ClientSettings = {
      name: value.name,
      email: value.email,
      notificationsEnabled: value.notificationsEnabled,
      theme: value.theme,
    };

    localStorage.setItem(CLIENT_SETTINGS_KEY, JSON.stringify(settings));
    this.themeService.setTheme(settings.theme);

    this.savedMessage.set(true);
    window.setTimeout(() => this.savedMessage.set(false), 1800);
  }

  private readSettings(): ClientSettings | null {
    const raw = localStorage.getItem(CLIENT_SETTINGS_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<ClientSettings>;
      if (!parsed.name || !parsed.email || !parsed.theme) {
        return null;
      }

      if (!this.themeService.themes.includes(parsed.theme)) {
        return null;
      }

      return {
        name: parsed.name,
        email: parsed.email,
        notificationsEnabled: parsed.notificationsEnabled ?? true,
        theme: parsed.theme,
      };
    } catch {
      return null;
    }
  }
}

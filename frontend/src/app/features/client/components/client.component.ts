import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrl: './client.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientComponent {
  readonly user = input.required<User | null>();

  private readonly auth = inject(AuthService);
  readonly isLoggingOut = signal(false);

  readonly initials = computed(() => {
    const u = this.user();
    if (!u) return '?';
    if (u.name) return u.name.trim().slice(0, 2).toUpperCase();
    return u.email.slice(0, 2).toUpperCase();
  });

  readonly displayName = computed(() => this.user()?.name ?? this.user()?.email ?? '—');

  logout(): void {
    this.isLoggingOut.set(true);
    this.auth.logout().subscribe({
      error: () => this.isLoggingOut.set(false),
    });
  }
}
